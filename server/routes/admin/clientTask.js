const router = require('express').Router();
const clientTaskController = require('../../controllers/admin/clientTask');
const { verifyAdminUser } = require('../../middleware/auth');

const multer = require('multer');
const importUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

router.use(verifyAdminUser);

router.get('/sample-template', clientTaskController.downloadSampleTemplate);
router.post('/import-preview', importUpload.single('file'), clientTaskController.previewImportClientTasks);
router.post('/import', importUpload.single('file'), clientTaskController.importClientTasks);

router.post('/', clientTaskController.createClientTask);
router.get('/', clientTaskController.getAllClientTasks);
router.get('/:id', clientTaskController.getSingleClientTask);
router.put('/:id', clientTaskController.updateClientTask);
router.put('/:id/report', clientTaskController.saveTaskReport);
router.put('/:id/report/approve', clientTaskController.approveTaskReport);
router.delete('/:id', clientTaskController.deleteClientTask);

module.exports = router;


