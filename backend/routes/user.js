const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, userController.getProfile);
router.get('/2fa-status', authenticateToken, userController.get2FAStatus);

module.exports = router;
