const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-totp', authController.verifyTOTP);
router.post('/setup-2fa', authenticateToken, authController.setup2FA);
router.post('/confirm-2fa', authenticateToken, authController.confirm2FA);
router.post('/disable-2fa', authenticateToken, authController.disable2FA);

module.exports = router;
