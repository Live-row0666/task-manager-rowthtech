const express = require('express');
const router = express.Router();
const authController = require('../../controllers/user/auth');
const { verifyUser } = require('../../middleware/auth');

// User login
router.post('/login', authController.login);
router.post('/logout', verifyUser, authController.logout);

// Get user profile (protected route)
router.get('/profile', verifyUser, authController.getProfile);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;