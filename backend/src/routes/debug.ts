import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Debug endpoint to examine users (ONLY FOR DEVELOPMENT)
router.get('/users', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Debug endpoints not available in production'
      });
    }

    const users = await User.find({}).select('+password');
    
    const userInfo = users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.password,
      passwordLength: user.password ? user.password.length : 0,
      hashStartsWith: user.password ? user.password.substring(0, 10) : 'none',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({
      success: true,
      count: users.length,
      users: userInfo
    });
  } catch (error) {
    console.error('Debug users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Debug endpoint to test password comparison
router.post('/test-password', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Debug endpoints not available in production'
      });
    }

    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(password);
    
    res.json({
      success: true,
      email,
      passwordProvided: password,
      passwordHashInDB: user.password,
      isMatch,
      hashLength: user.password.length,
      hashStartsWith: user.password.substring(0, 10)
    });
  } catch (error) {
    console.error('Debug password test error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
