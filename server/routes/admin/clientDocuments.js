const router = require("express").Router();
const ClientDocumentsController = require("../../controllers/admin/clientDocuments");
const { verifyAdminUser } = require("../../middleware/auth");
const upload = require("../../middleware/upload");



// dropdown
router.get("/clients", ClientDocumentsController.getClients);
router.get("/projects/:clientId", ClientDocumentsController.getProjects);

// documents
router.post(
    "/upload",
    (req, res, next) => {
        console.log(req.headers["content-type"]);
        next();
    },
     verifyAdminUser,
    upload.array("documents"),
    ClientDocumentsController.uploadDocuments
);

router.get("/", ClientDocumentsController.getDocuments);

router.delete("/:id", ClientDocumentsController.deleteDocument);

module.exports = router;