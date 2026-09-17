const router = require('express').Router();
const clientProjectController = require('../../controllers/admin/clientProject');
const { verifyAdminUser } = require('../../middleware/auth');

router.use(verifyAdminUser);

router.post('/',    clientProjectController.createClientProject);
router.get('/',     clientProjectController.getAllClientProjects);
router.get('/:id',  clientProjectController.getSingleClientProject);
router.put('/:id',  clientProjectController.updateClientProject);
router.delete('/:id', clientProjectController.deleteClientProject);

module.exports = router;
