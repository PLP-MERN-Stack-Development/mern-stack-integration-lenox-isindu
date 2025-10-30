import express from 'express';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Post from '../models/Post.js';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or username'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // AUTO-CREATE BLOG for the user with better error handling
    let blog;
    try {
      // Generate a unique subdomain
      let baseSubdomain = username.toLowerCase().replace(/[^a-z0-9]/g, '-');
      let subdomain = baseSubdomain;
      let counter = 1;
      
      // Ensure subdomain is unique
      while (await Blog.findOne({ subdomain })) {
        subdomain = `${baseSubdomain}-${counter}`;
        counter++;
      }

      blog = await Blog.create({
        name: `${username}'s Blog`,
        subdomain: subdomain,
        owner: user._id,
        description: `Welcome to ${username}'s personal blog!`
      });
    } catch (blogError) {
      // If blog creation fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        error: 'Failed to create blog',
        details: blogError.message
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      blog: {
        id: blog._id,
        name: blog.name,
        subdomain: blog.subdomain
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Login route remains the same
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Get user's blog
    const blog = await Blog.findOne({ owner: user._id });

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      blog: blog ? {
        id: blog._id,
        name: blog.name,
        subdomain: blog.subdomain
      } : null,
      token
    });

  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
});
// Change password 
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to change password',
      details: error.message
    });
  }
});

// Delete account 
router.delete('/account', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user's posts
    await Post.deleteMany({ author: userId });
    
    // Delete user's blog 
    await Blog.deleteOne({ owner: userId });
    
    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      details: error.message
    });
  }
});
export default router;