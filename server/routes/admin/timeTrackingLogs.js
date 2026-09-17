const express = require('express');
const router = express.Router();
const timeTrackingController = require('../../controllers/admin/timeTrackingLogs');
const { verifyAdmin } = require('../../middleware/auth');

router.post('/start', verifyAdmin, timeTrackingController.startTimer);
router.post('/stop', verifyAdmin, timeTrackingController.stopTimer);
router.post('/pause', verifyAdmin, timeTrackingController.pauseTimer);
router.post('/resume', verifyAdmin, timeTrackingController.resumeTimer);
router.get('/:id', verifyAdmin, timeTrackingController.getTimeEntry);
router.get('/', verifyAdmin, timeTrackingController.getTimeEntries);

module.exports = router;
