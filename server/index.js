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
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const uploadMiddleware = multer({ dest: 'uploads/' });

// User Registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const userDoc = await User.create({ username, password: hashedPassword });
        res.json(userDoc);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) return res.status(400).json('Wrong credentials');

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).json({ id: userDoc._id, username });
        });
    } else {
        res.status(400).json('Wrong credentials');
    }
});

// Get User Profile
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err;
        res.json(info);
    });
});

// User Logout
app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
});

// Create a Post
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) return res.status(403).json({ error: 'Invalid or expired token' });

            const { originalname, path } = req.file;
            const ext = originalname.split('.').pop();
            const newPath = `${path}.${ext}`;
            fs.renameSync(path, newPath);

            const { title, summary, content, tags } = req.body;
            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id,
                tags: tags ? tags.split(',') : [],
            });

            res.json(postDoc);
        });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a Post
app.put('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
    try {
        let newPath = null;
        if (req.file) {
            const { originalname, path } = req.file;
            const ext = originalname.split('.').pop();
            newPath = `${path}.${ext}`;
            fs.renameSync(path, newPath);
        }

        const { token } = req.cookies;
        if (!token) return res.status(401).json({ error: 'Not authenticated' });

        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) return res.status(403).json({ error: 'Invalid token' });

            const { title, summary, content, tags } = req.body;
            const postDoc = await Post.findById(req.params.id);
            if (!postDoc) return res.status(404).json({ error: 'Post not found' });
            if (String(postDoc.author) !== String(info.id)) return res.status(403).json({ error: 'Unauthorized' });

            postDoc.title = title;
            postDoc.summary = summary;
            postDoc.content = content;
            postDoc.tags = tags ? tags.split(',') : [];
            if (newPath) postDoc.cover = newPath;

            await postDoc.save();
            res.json(postDoc);
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get All Posts
app.get('/post', async (req, res) => {
    res.json(
        await Post.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20)
    );
});

// Get Single Post
app.get('/post/:id', async (req, res) => {
    const { id } = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
});

// Search Posts
app.get('/search', async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query required' });

    try {
        const posts = await Post.find({
            $or: [
                { title: new RegExp(query, 'i') },
                { summary: new RegExp(query, 'i') },
                { content: new RegExp(query, 'i') },
                { tags: new RegExp(query, 'i') },
            ],
        }).populate('author', ['username']);

        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete Posts
app.delete('/post/:id', async (req, res) => {
  try {
      const { token } = req.cookies;
      if (!token) {
          return res.status(401).json({ error: 'Not authenticated' });
      }

      jwt.verify(token, secret, {}, async (err, info) => {
          if (err) return res.status(403).json({ error: 'Invalid token' });

          const postDoc = await Post.findById(req.params.id);
          if (!postDoc) {
              return res.status(404).json({ error: 'Post not found' });
          }

          if (JSON.stringify(postDoc.author) !== JSON.stringify(info.id)) {
              return res.status(403).json({ error: 'You are not the author' });
          }

          await Post.findByIdAndDelete(req.params.id);
          res.status(200).json({ message: 'Post deleted successfully' });
      });
  } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Server error' });
  }
});


app.listen(4000, () => console.log('Server running on port 4000'));

