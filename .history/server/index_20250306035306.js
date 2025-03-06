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

app.post('/register', async (req,res) => {
  const {username,password} = req.body;
  try{
    const userDoc = await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } catch(e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req,res) => {
  const {username,password} = req.body;
  const userDoc = await User.findOne({username});
  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.get('/profile', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
});

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path + '.' + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) throw err;

    // Extract fields from the request body
    const { title, summary, content, tags } = req.body;

    // Create the post with tags
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
      tags: tags ? tags.split(',') : [], // Convert tags string to array
    });

    res.json(postDoc);
  });
});

app.put('/post/:id', uploadMiddleware.single('file'), async (req, res) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const ext = originalname.split('.').pop();
      newPath = `${path}.${ext}`;

      // Rename the file
      fs.rename(path, newPath, (err) => {
        if (err) {
          console.error('File rename error:', err);
          return res.status(500).json({ error: "File processing error" });
        }
      });
    }

    // Authentication check
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    jwt.verify(token, secret, {}, async (err, info) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });

      // Extract fields from the request body
      const { title, summary, content, tags } = req.body;

      // Find the post by ID
      const postDoc = await Post.findById(req.params.id);
      if (!postDoc) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if the user is the author
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(403).json({ error: 'You are not the author' });
      }

      // Update the post fields
      postDoc.title = title;
      postDoc.summary = summary;
      postDoc.content = content;
      postDoc.tags = tags ? tags.split(',') : []; // Convert tags string to array
      if (newPath) {
        postDoc.cover = newPath;
      }

      // Save the updated post
      await postDoc.save();
      res.json(postDoc);
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Search query required" });
  }

  try {
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
            { title: { $regex: query, $options: 'i' } }, // Search by title
            { summary: { $regex: query, $options: 'i' } }, // Search by summary
            { content: { $regex: query, $options: 'i' } }, // Search by content
            { tags: { $regex: query, $options: 'i' } }, // Search by tags
            { "authorData.username": { $regex: query, $options: 'i' } } // Search by author name
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
          cover: 1,
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

      // Check if the user is the author
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



app.listen(4000);
//