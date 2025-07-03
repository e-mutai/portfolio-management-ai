import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          investmentExperience: user.investmentExperience,
          riskTolerance: user.riskTolerance,
          investmentGoals: user.investmentGoals,
          monthlyIncome: user.monthlyIncome,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req: any, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      investmentExperience,
      riskTolerance,
      investmentGoals,
      monthlyIncome,
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (investmentExperience) user.investmentExperience = investmentExperience;
    if (riskTolerance) user.riskTolerance = riskTolerance;
    if (investmentGoals) user.investmentGoals = investmentGoals;
    if (monthlyIncome !== undefined) user.monthlyIncome = monthlyIncome;

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          profilePicture: user.profilePicture,
          phoneNumber: user.phoneNumber,
          dateOfBirth: user.dateOfBirth,
          investmentExperience: user.investmentExperience,
          riskTolerance: user.riskTolerance,
          investmentGoals: user.investmentGoals,
          monthlyIncome: user.monthlyIncome,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router;
