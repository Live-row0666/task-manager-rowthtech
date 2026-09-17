
const express = require('express');
const router = express.Router();
const clientDashboardController = require("../../controllers/client/dashboard");
// Import route modules
const { verifyClient } = require('../../middleware/auth');

router.get(
    "/dashboard",
    verifyClient,
    clientDashboardController.getDashboard
);

module.exports = router;