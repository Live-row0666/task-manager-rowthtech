const express = require('express');
const router = express.Router();
const taskStatusController = require('../../controllers/admin/taskStatus');
const { verifyAdminUser } = require('../../middleware/auth');

router.post('/', verifyAdminUser, taskStatusController.createTaskStatus);
router.get('/', verifyAdminUser, taskStatusController.getAllTaskStatuses);
router.get('/:id', verifyAdminUser, taskStatusController.getTaskStatusById);
router.put('/:id', verifyAdminUser, taskStatusController.updateTaskStatus);
router.delete('/:id', verifyAdminUser, taskStatusController.deleteTaskStatus);

module.exports = router;