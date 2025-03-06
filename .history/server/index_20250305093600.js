
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Post = require('./models/Post');

dotenv.config(); 

const app = express();
const secret = process.env.JWT_SECRET;

const corsOptions = {
    credentials: true, 
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads')); 

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// File Upload Configuration
const uploadMiddleware = multer({ dest: 'uploads/' });

// **User Registration**
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userDoc = await User.create({
            username,
            password: hashedPassword
        });
        res.json(userDoc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// **User Login**
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    
    if (!userDoc) {
        return res.status(400).json({ error: "User not found" });
    }

    const passOK = bcrypt.compareSync(password, userDoc.password);
    if (passOK) {
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) return res.status(500).json({ error: 'Token generation failed' });

            res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' }).json({
                id: userDoc._id,
                username,
            });
        });
    } else {
        res.status(400).json({ error: "Wrong credentials" });
    }
});

// **Get Profile**
app.get('/profile', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        res.json(user);
    });
});


// **User Logout**
app.post('/logout', (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'lax' });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'An error occurred during logout' });
    }
});

// **Create a Post (with Image Upload)**
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { originalname, path } = req.file;
        const ext = originalname.split('.').pop();
        const newPath = `${path}.${ext}`;
        fs.renameSync(path, newPath);

        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) return res.status(403).json({ error: 'Invalid token' });

            const { title, summary, content, tags } = req.body;
            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: newPath.replace('uploads/', ''),
                author: info.id,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [] // Convert tags to an array
            });

            res.json(postDoc);
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// **Get All Posts**
app.get('/post', async (req, res) => {
    const posts = await Post.find().populate('author', ['username'])
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(posts);
});

app.get('/post/:id', async(req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username', '_id']);
    res.json(postDoc);
});

app.put('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
    try {
        let newPath = null;
        if (req.file) {
            const { originalname, path } = req.file;
            const ext = originalname.split('.').pop();
            newPath = `${path}.${ext}`;

            fs.rename(path, newPath, (err) => {
                if (err) {
                    console.error('File rename error:', err);
                    return res.status(500).json({ error: "File processing error" });
                }
            });
        }

        // Authentication check
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) return res.status(403).json({ error: 'Invalid token' });

            const { title, summary, content } = req.body;
            const postDoc = await Post.findById(req.params.id);
            if (!postDoc) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
            if (!isAuthor) {
                return res.status(403).json({ error: 'You are not the author' });
            }

            postDoc.title = title;
            postDoc.summary = summary;
            postDoc.content = content;
            if (newPath) {
                postDoc.cover = newPath;
            }

            await postDoc.save();
            res.json(postDoc);
        });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: "Search query required" });

        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "users", // Collection name for users
                    localField: "author",
                    foreignField: "_id",
                    as: "authorData"
                }
            },
            {
                $match: {
                    $or: [
                        { title: { $regex: query, $options: 'i' } }, 
                        { summary: { $regex: query, $options: 'i' } }, 
                        { tags: { $regex: query, $options: 'i' } }, 
                        { "authorData.username": { $regex: query, $options: 'i' } } // Match username properly
                    ]
                }
            },
            {
                $unwind: "$authorData" // Convert authorData array to object
            },
            {
                $project: {
                    title: 1,
                    summary: 1,
                    tags: 1,
                    createdAt: 1,
                    cover: 1, // Include the cover field
                    author: {
                        _id: "$authorData._id",
                        username: "$authorData.username"
                    }
                }
            }
        ]);

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete('/post/:id', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) return res.status(403).json({ error: 'Invalid token' });

            const postDoc = await Post.findById(req.params.id);
            if (!postDoc) return res.status(404).json({ error: "Post not found" });

            if (postDoc.author.toString() !== info.id) {
                return res.status(403).json({ error: "You can only delete your own posts" });
            }

            await Post.findByIdAndDelete(req.params.id);
            res.json({ message: "Post deleted successfully" });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


// **Global Error Handler**
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// **Start Server**
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

Please look at it 
and look to the front end again 
and edit all the things needed to edited