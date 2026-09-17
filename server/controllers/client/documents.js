const ClientDocument = require("../../models/clientDocuments");
const Client = require("../../models/client");
const ClientProject = require("../../models/clientProject");
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

class ClientDocumentsController {

    
    // Get Documents
   async getDocuments(req, res) {
    try {

        const clientId = req.client._id; // or req.client._id

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
  

}

module.exports = new ClientDocumentsController();