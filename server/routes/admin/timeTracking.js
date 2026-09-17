const express = require('express');
const router = express.Router();
const timeTrackingController = require('../../controllers/admin/timeTracking');
const { verifyAdmin } = require('../../middleware/auth');

// Admin time tracking management routes
router.get('/reports/user-summary', verifyAdmin, timeTrackingController.getUserTimeSummary);
router.post('/get-active-tasks',  timeTrackingController.getallActivetask);

module.exports = router;
