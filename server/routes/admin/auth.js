const router = require('express').Router();
const AuthController = require('../../controllers/admin/auth');
const { verifyAdminUser } = require('../../middleware/auth');
// Admin Login Route
router.post('/login', AuthController.login);
router.get('/roles', AuthController.getUserRole);
router.post('/logout',verifyAdminUser, AuthController.logout);
// Password reset routes
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password/:token', AuthController.resetPassword);

module.exports = router;