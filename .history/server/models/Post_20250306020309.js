const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PostSchema = new Schema({
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    tags: [String], // Array of strings for tags
    createdAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

const PostModel = model('Post', PostSchema);
module.exports = PostModel;
