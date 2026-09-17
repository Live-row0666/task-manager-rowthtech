const router = require('express').Router();
const clientMilestoneController = require('../../controllers/admin/clientMilestone');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

router.post('/',    clientMilestoneController.createClientMilestone);
router.get('/',     clientMilestoneController.getAllClientMilestones);
router.get('/:id',  clientMilestoneController.getSingleClientMilestone);
router.put('/:id',  clientMilestoneController.updateClientMilestone);
router.delete('/:id', clientMilestoneController.deleteClientMilestone);

module.exports = router;
