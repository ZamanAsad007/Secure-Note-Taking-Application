const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Create a new post.
 * Author is forced to req.user._id.
 */
const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.create({
    author: req.user._id,
    title,
    content
  });

  res.status(201).json(post);
});

module.exports = {
  createPost
};
