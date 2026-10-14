const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/clientChat');
const { verifyAdmin } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.get('/conversations', verifyAdmin, controller.getConversations);
router.get('/messages/:clientId', verifyAdmin, controller.getMessages);
router.post('/send/:clientId', verifyAdmin, upload.array('attachments', 5), controller.sendMessage);
router.put('/read/:clientId', verifyAdmin, controller.markAsRead);

module.exports = router;
