const router = require('express').Router();
const userController = require('../../controllers/admin/user');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

// Create a new user
router.post('/', userController.createUser);
// Update user
router.put('/:id', userController.updateUser);
// Get all users
router.get('/', userController.getAllUsers);
// Get user stats by ID and date
router.get('/:id/stats', userController.getUserStats);
// Get user by ID
router.get('/:id', userController.getSingleUser);
// Delete user
router.delete('/:id', userController.deleteUser);


module.exports = router;