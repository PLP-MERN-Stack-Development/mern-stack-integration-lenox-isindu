import express from 'express';
import Blog from '../models/Blog.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get authenticated user's blog 
router.get('/me', auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ owner: req.user.id })
      .populate('owner', 'username email');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch blog',
      details: error.message
    });
  }
});

// Get blog by subdomain 
router.get('/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;
    
    const blog = await Blog.findOne({ subdomain })
      .populate('owner', 'username');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch blog',
      details: error.message
    });
  }
});

// Update blog 
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subdomain } = req.body;

    // Verify user owns this blog
    const blog = await Blog.findOne({ _id: id, owner: req.user.id });
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or access denied' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { name, description, subdomain },
      { new: true, runValidators: true }
    ).populate('owner', 'username');

    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to update blog',
      details: error.message
    });
  }
});

export default router;