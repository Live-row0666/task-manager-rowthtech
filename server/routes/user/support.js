const express = require('express');
const router = express.Router();
const supportController = require('../../controllers/user/support');
const { verifyUser } = require('../../middleware/auth');

// Apply authentication middleware
router.use(verifyUser);

// Routes
router.post('/', supportController.createTicket);
router.get('/', supportController.getMyTickets);
router.put('/:id', supportController.updateTicket);
router.get('/:id', supportController.getTicket);
router.post('/:id/response', supportController.addResponse);

module.exports = router;