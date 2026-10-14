const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/clientDependency');
const { verifyAdmin } = require('../../middleware/auth');

const upload = require('../../middleware/upload');

router.get('/stats', verifyAdmin, controller.getStats);
router.get('/', verifyAdmin, controller.getDependencies);
router.post('/', verifyAdmin, controller.createDependency);
router.get('/:id', verifyAdmin, controller.getDependencyById);
router.put('/:id/submit', verifyAdmin, upload.any(), controller.submitDependency);
router.put('/:id', verifyAdmin, controller.updateDependency);
router.put('/:id/status', verifyAdmin, controller.updateStatus);
router.delete('/:id', verifyAdmin, controller.deleteDependency);

module.exports = router;
