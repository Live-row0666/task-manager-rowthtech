const Notification = require('../../models/notification');

class NotificationController {
    async getNotifications(req, res) {
        try {
            const { page = 1, limit = 10, isRead , recipient } = req.query;
            const query = { recipient: req.user._id };
            
            if (isRead !== undefined) {
                query.isRead = isRead === 'true';
            }

            if (recipient) {
                query.recipient = recipient;
            }

            const notifications = await Notification.find(query)
                .populate('sender', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Notification.countDocuments(query);
            const unreadCount = await Notification.countDocuments({
                recipient: req.user._id,
                isRead: false
            });

            res.status(200).json({
                status: 200,
                message: 'Notifications retrieved', 
                data: notifications,
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving notifications',
                error: error.message
            });
        }
    }

    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;

            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, recipient: req.user._id },
                { isRead: true, readAt: new Date() },
                { new: true }
            );

            if (!notification) {
                return res.status(404).json({
                    status: 404,
                    message: 'Notification not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Notification marked as read',
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error marking notification as read',
                error: error.message
            });
        }
    }

    async markAllAsRead(req, res) {
        try {
            await Notification.updateMany(
                { recipient: req.user._id, isRead: false },
                { isRead: true, readAt: new Date() }
            );

            res.status(200).json({
                status: 200,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error marking all notifications as read',
                error: error.message
            });
        }
    }

    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;

            const notification = await Notification.findOneAndDelete({
                _id: notificationId,
                recipient: req.user._id
            });

            if (!notification) {
                return res.status(404).json({
                    status: 404,
                    message: 'Notification not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Notification deleted'
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error deleting notification',
                error: error.message
            });
        }
    }
}

module.exports = new NotificationController();