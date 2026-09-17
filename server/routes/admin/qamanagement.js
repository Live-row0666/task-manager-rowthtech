const router = require('express').Router();
const qamController = require('../../controllers/admin/qamanagement');
const { verifyAdminUser } = require('../../middleware/auth');
// router.use(verifyAdminUser);

// get all tasks for a project
router.get('/', qamController.getAllTasks);


module.exports = router;