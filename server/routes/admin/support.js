const express = require('express');
const router = express.Router();
const supportController = require('../../controllers/admin/support');
const { verifyAdmin } = require('../../middleware/auth');

// Apply authentication middleware
router.use(verifyAdmin);

// Routes
router.post('/', supportController.createTicket);
router.get('/', supportController.getAllTickets);
router.get('/:id', supportController.getTicket);
router.put('/:id', supportController.updateTicket);
router.post('/:id/response', supportController.addResponse);

module.exports = router;