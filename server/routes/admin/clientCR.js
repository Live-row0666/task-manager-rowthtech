const express = require('express');
const router = express.Router();
const AdminClientCRController = require('../../controllers/admin/clientCR');

router.get('/', AdminClientCRController.getCRs);
router.get('/:id', AdminClientCRController.getCRById);
router.put('/:id', AdminClientCRController.updateCR);
router.delete('/:id', AdminClientCRController.deleteCR);

module.exports = router;
