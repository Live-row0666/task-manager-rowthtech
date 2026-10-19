const router = require('express').Router();
const clientTaskController = require('../../controllers/admin/clientTask');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

router.post('/', clientTaskController.createClientTask);
router.get('/', clientTaskController.getAllClientTasks);
router.get('/:id', clientTaskController.getSingleClientTask);
router.put('/:id', clientTaskController.updateClientTask);
router.delete('/:id', clientTaskController.deleteClientTask);

module.exports = router;
