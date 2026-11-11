const router = require('express').Router();
const { verifyAdmin } = require('../../middleware/auth');
const { getClientLoginHistory } = require('../../controllers/admin/clientLoginHistory');
router.get('/', verifyAdmin, getClientLoginHistory);
module.exports = router;
