const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/admin/search');
const { verifyAdminUser } = require('../../middleware/auth');

router.get('/global', verifyAdminUser, searchController.globalSearch);
router.get('/tasks', verifyAdminUser, searchController.searchTasks);

module.exports = router;