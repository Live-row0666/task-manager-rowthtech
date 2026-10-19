const ClientDocument = require("../../models/clientDocuments");
const Client = require("../../models/client");
const Project = require("../../models/project");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class ClientDocumentsController {

    // Get Documents for logged-in client
    async getDocuments(req, res) {
        try {
            const clientId = req.client._id;

            const documents = await ClientDocument.find({
                clientId: clientId,
            })
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

    // Upload Documents by logged-in client
    async uploadDocuments(req, res) {
        try {
            const clientId = req.client._id;
            let { projectId, title } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Document title is required.",
                });
            }

            // Fallback to client's assigned project if not provided
            if (!projectId) {
                const clientDoc = await Client.findById(clientId).select('projects').lean();
                const clientProjectIds = Array.isArray(clientDoc?.projects) ? clientDoc.projects : [];
                const proj = await Project.findOne({
                    $or: [
                        { client: clientId },
                        { _id: { $in: clientProjectIds } }
                    ],
                    isActive: true
                });
                if (proj) {
                    projectId = proj._id;
                }
            }

            if (!projectId) {
                return res.status(400).json({
                    success: false,
                    message: "Please select a project for this document.",
                });
            }

            const uploadedDocuments = [];

            for (const file of req.files || []) {
                const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                const fileName = `client-docs/${Date.now()}-${sanitizedName}`;

                const bucketName = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME;

                const uploadParams = {
                    Bucket: bucketName,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);

                const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

                uploadedDocuments.push({
                    originalName: file.originalname,
                    fileName: fileName,
                    url: fileUrl,
                    size: file.size,
                    type: file.mimetype,
                });
            }

            const newDoc = await ClientDocument.create({
                clientId,
                projectId,
                title: title.trim(),
                documents: uploadedDocuments,
                uploadedBy: clientId,
            });

            const populated = await ClientDocument.findById(newDoc._id)
                .populate("clientId", "name")
                .populate("projectId", "name");

            return res.status(201).json({
                success: true,
                status: 200,
                message: "Document uploaded successfully.",
                data: populated,
            });
        } catch (err) {
            console.error("Client document upload error:", err);
            return res.status(500).json({
                success: false,
                status: 500,
                message: err.message,
            });
        }
    }

    // Delete Document by logged-in client
    async deleteDocument(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;

            const doc = await ClientDocument.findOne({
                _id: id,
                clientId: clientId,
            });

            if (!doc) {
                return res.status(404).json({
                    success: false,
                    status: 404,
                    message: "Document not found or you are not authorized to delete it.",
                });
            }

            await ClientDocument.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                status: 200,
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