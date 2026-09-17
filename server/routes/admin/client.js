
const express = require('express');
const router = express.Router();
const clientController = require('../../controllers/admin/client');
const { verifyAdminUser } = require('../../middleware/auth');

// Create new client
router.post('/', verifyAdminUser, clientController.createClient);

// Update client
router.put('/:id', verifyAdminUser, clientController.updateClient);

// Get all clients with filters and pagination
router.get('/', verifyAdminUser, clientController.getClients);

// Delete client
router.delete('/:id', verifyAdminUser, clientController.deleteClient);

router.post(
    "/send-invitation",
    verifyAdminUser,
    clientController.sendInvitation
);
module.exports = router;