const express = require('express');
const router = express.Router();
const clientAuthController = require('../../controllers/client/auth');
const { verifyClient } = require('../../middleware/auth');

// User login
router.post('/login', clientAuthController.login);
router.post('/logout', verifyClient, clientAuthController.logout);

// Get user profile (protected route)
router.get('/profile', verifyClient, clientAuthController.getProfile);

router.post('/forgot-password', clientAuthController.forgotPassword);
router.post('/reset-password/:token', clientAuthController.resetPassword);

module.exports = router;