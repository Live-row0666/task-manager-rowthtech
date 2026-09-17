
const express = require('express');
const router = express.Router();
const AttendanceController = require('../../controllers/admin/attendance');


// Get all clients with filters and pagination
router.get('/', AttendanceController.getAttendance);

module.exports = router;