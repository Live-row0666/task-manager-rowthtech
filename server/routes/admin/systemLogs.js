const express = require('express');
const router = express.Router();
const systemLogsController = require('../../controllers/admin/systemLogs');
const { verifyAdminUser } = require('../../middleware/auth');

router.get('/logs', verifyAdminUser, systemLogsController.getLogs);
router.delete('/logs', verifyAdminUser, systemLogsController.clearLogs);

module.exports = router;