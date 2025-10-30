import express from 'express';
import Post from '../models/Post.js';
import Blog from '../models/Blog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all posts for authenticated user's blog 
router.get('/', auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ owner: req.user.id });
    
    if (!blog) {
      return res.status(404).json({ error: 'No blog found' });
    }

    const posts = await Post.find({ blog: blog._id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      blog: {
        id: blog._id,
        name: blog.name,
        subdomain: blog.subdomain
      },
      posts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch posts',
      details: error.message
    });
  }
});

// Create new post 
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, featuredImage } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const blog = await Blog.findOne({ owner: req.user.id });
    
    if (!blog) {
      return res.status(404).json({ error: 'No blog found. Please create a blog first.' });
    }

    const post = await Post.create({
      title,
      content,
      featuredImage: featuredImage || '',
      author: req.user.id,
      blog: blog._id,
      status: 'published'
    });

    await post.populate('author', 'username');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to create post',
      details: error.message
    });
  }
});

// Update post 
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, featuredImage } = req.body;

    // Verify user owns this post
    const post = await Post.findOne({ _id: id })
      .populate('author', 'username');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, featuredImage },
      { new: true, runValidators: true }
    ).populate('author', 'username');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update post',
      details: error.message
    });
  }
});

// Delete post 
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user owns this post
    const post = await Post.findOne({ _id: id });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Post.findByIdAndDelete(id);

    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete post',
      details: error.message
    });
  }
});

export default router;