const router = require('express').Router();
const DesignationController = require('../../controllers/admin/designation');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

router.post('/', DesignationController.createNewDesignation);
router.get('/', DesignationController.getAllDesignations);
router.put('/:id', DesignationController.updateDesignation)

module.exports = router;