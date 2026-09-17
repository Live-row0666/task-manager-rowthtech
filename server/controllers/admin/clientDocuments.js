const ClientDocument = require("../../models/clientDocuments");
const Client = require("../../models/client");
const ClientProject = require("../../models/clientProject");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
class ClientDocumentsController {

    // Get Clients
    async getClients(req, res) {
        try {

            const clients = await Client.find()
                .select("_id name")
                .sort({ name: 1 });

            return res.status(200).json({
                success: true,
                data: clients,
            });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    // Get Projects by Client
    async getProjects(req, res) {
        try {

            const { clientId } = req.params;

            const projects = await ClientProject.find({
                client: clientId,
            })
                .select("_id name")
                .sort({ name: 1 });

            return res.status(200).json({
                success: true,
                data: projects,
            });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    // Upload Documents
    // async uploadDocuments(req, res) {
    //     console.log(req.files , "req.files")
    //     try {
            

    //         const { clientId, projectId, title } = req.body;

    //         const documents = (req.files || []).map(file => ({
    //             originalName: file.originalname,
    //             fileName: file.filename,
    //             path: file.path,
    //             size: file.size,
    //         }));

    //         const data = await ClientDocument.create({
    //             clientId,
    //             projectId,
    //             title,
    //             documents,
    //             uploadedBy: req.user._id,
    //         });

    //         return res.status(201).json({
    //             success: true,
    //             message: "Documents uploaded successfully.",
    //             data,
    //         });

    //     } catch (err) {
    //         return res.status(500).json({
    //             success: false,
    //             message: err.message,
    //         });
    //     }
    // }
async uploadDocuments(req, res) {

    try {

        const { clientId, projectId, title } = req.body;

        const uploadedDocuments = [];

      for (const file of req.files || []) {

     const fileName = `${Date.now()}-${file.originalname}`;

    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };


        console.log(req.files,fileName, "xcnvcxbnvnxcbnv")

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    uploadedDocuments.push({
        originalName: file.originalname,
        fileName: fileName,
        url: fileUrl,
        size: file.size,
        type: file.mimetype,
    });
}
    const data = await ClientDocument.create({
    clientId,
    projectId,
    title,
    documents: uploadedDocuments,
    uploadedBy: req.user._id,
});

console.log(data);

        return res.status(201).json({
            success: true,
            message: "Documents uploaded successfully.",
            data,
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message,
        });

    }
}
    // Get Documents
    async getDocuments(req, res) {
        try {

            const documents = await ClientDocument.find()
                .populate("clientId", "name")
                .populate("projectId", "name")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                data: documents,
            });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

    async deleteDocument(req, res) {
        try {

            await ClientDocument.findByIdAndDelete(req.params.id);

            return res.status(200).json({
                success: true,
                message: "Document deleted successfully.",
            });

        } catch (err) {
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    }

}

module.exports = new ClientDocumentsController();