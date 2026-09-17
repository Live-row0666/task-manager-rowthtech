const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/user/notification');
const { verifyUser } = require('../../middleware/auth');

router.get('/', verifyUser, notificationController.getNotifications);
router.put('/:notificationId/read', verifyUser, notificationController.markAsRead);
router.put('/read-all', verifyUser, notificationController.markAllAsRead);
router.delete('/:notificationId', verifyUser, notificationController.deleteNotification);

module.exports = router;