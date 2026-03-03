// Authentication controller - Handles registration, login, and 2FA logic
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateSecret, generateQRCode, verifyToken: verifyTOTPToken } = require('../utils/totp');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validate input
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // Create user in database
    const user = await User.create(username, email, password);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

/**
 * Step 1 of Login: Verify username and password
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      });
    }

    // Verify password
    const user = await User.verifyPassword(username, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }

    // Check if TOTP is enabled
    if (user.totp_enabled) {
      // TOTP is enabled, ask for 2FA code
      return res.status(200).json({
        success: true,
        message: 'Password verified. Please enter your 2FA code',
        requiresTOTP: true,
        userId: user.id,
        username: user.username,
      });
    }

    // TOTP is not enabled, generate JWT token directly
    const token = generateToken(user.id, user.username);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * Step 2 of Login: Verify TOTP code
 * POST /api/auth/verify-totp
 */
const verifyTOTP = async (req, res) => {
  try {
    const { userId, totpCode } = req.body;

    // Validate input
    if (!userId || !totpCode) {
      return res.status(400).json({
        success: false,
        message: 'User ID and TOTP code are required',
      });
    }

    // Validate TOTP code format (should be 6 digits)
    if (!/^\d{6}$/.test(totpCode)) {
      return res.status(400).json({
        success: false,
        message: 'TOTP code must be 6 digits',
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if TOTP is enabled
    if (!user.totp_enabled) {
      return res.status(400).json({
        success: false,
        message: 'TOTP is not enabled for this user',
      });
    }

    // Get TOTP secret
    const secret = await User.getTOTPSecret(userId);
    if (!secret) {
      return res.status(400).json({
        success: false,
        message: 'TOTP secret not found',
      });
    }

    // Verify TOTP code
    const isValid = verifyTOTPToken(secret, totpCode);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid TOTP code',
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    return res.status(200).json({
      success: true,
      message: '2FA verification successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'TOTP verification failed',
    });
  }
};

/**
 * Setup 2FA: Generate TOTP secret and QR code
 * POST /api/auth/setup-2fa
 * Requires: JWT token
 */
const setup2FA = async (req, res) => {
  try {
    const userId = req.user.userId;
    const username = req.user.username;

    // Generate TOTP secret
    const { secret, qrCode } = generateSecret(username);

    // Generate QR code as data URL
    const qrCodeDataUrl = await generateQRCode(qrCode);

    return res.status(200).json({
      success: true,
      message: '2FA setup initiated',
      secret: secret, // Manual entry option
      qrCode: qrCodeDataUrl, // QR code for scanning
      instructions: 'Scan the QR code with Google Authenticator or enter the secret manually',
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA',
    });
  }
};

/**
 * Confirm 2FA: Save secret and enable TOTP
 * POST /api/auth/confirm-2fa
 * Requires: JWT token
 */
const confirm2FA = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { secret, totpCode } = req.body;

    // Validate input
    if (!secret || !totpCode) {
      return res.status(400).json({
        success: false,
        message: 'Secret and TOTP code are required',
      });
    }

    // Validate TOTP code format
    if (!/^\d{6}$/.test(totpCode)) {
      return res.status(400).json({
        success: false,
        message: 'TOTP code must be 6 digits',
      });
    }

    // Verify TOTP code with the provided secret
    const isValid = verifyTOTPToken(secret, totpCode);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid TOTP code. Please try again',
      });
    }

    // Save secret to database
    await User.saveTOTPSecret(userId, secret);

    // Enable TOTP
    const updatedUser = await User.enableTOTP(userId);

    return res.status(200).json({
      success: true,
      message: '2FA enabled successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('2FA confirmation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm 2FA',
    });
  }
};

/**
 * Disable 2FA
 * POST /api/auth/disable-2fa
 * Requires: JWT token
 */
const disable2FA = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Disable TOTP
    const updatedUser = await User.disableTOTP(userId);

    return res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
    });
  }
};

module.exports = {
  register,
  login,
  verifyTOTP,
  setup2FA,
  confirm2FA,
  disable2FA,
};
