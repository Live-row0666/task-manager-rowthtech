const express = require('express');
const router = express.Router();
const clientSupportController = require('../../controllers/admin/clientSupport');
const { verifyAdminUser } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Direct download proxy (available before auth for standard anchor downloads)
router.get('/download', clientSupportController.downloadFile);

// Apply admin authentication
router.use(verifyAdminUser);

// Routes
router.get('/', clientSupportController.getAllTickets);
router.get('/unread-count', clientSupportController.getUnreadCount);
router.get('/:id', clientSupportController.getTicketById);
router.put('/:id', clientSupportController.updateTicket);
router.put('/:id/read', clientSupportController.markAsRead);
router.post('/:id/response', upload.array('attachments'), clientSupportController.addResponse);

module.exports = router;
