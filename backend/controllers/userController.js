// User controller - Handles user profile and settings
const User = require('../models/User');

/**
 * Get current user profile
 * GET /api/user/profile
 * Requires: JWT token
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
};

/**
 * Get 2FA status
 * GET /api/user/2fa-status
 * Requires: JWT token
 */
const get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if TOTP is enabled
    const isTOTPEnabled = await User.isTOTPEnabled(userId);

    return res.status(200).json({
      success: true,
      totp_enabled: isTOTPEnabled,
    });
  } catch (error) {
    console.error('Get 2FA status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get 2FA status',
    });
  }
};

module.exports = {
  getProfile,
  get2FAStatus,
};
