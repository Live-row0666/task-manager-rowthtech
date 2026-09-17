const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class UploadController {
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 400,
                    message: 'No file provided'
                });
            }

            const fileName = `${Date.now()}-${req.file.originalname}`;
            const uploadParams = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype
            };

            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);

            const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

            res.status(200).json({
                status: 200,
                message: 'File uploaded successfully',
                data: {
                    fileName: req.file.originalname,
                    fileUrl,
                    fileKey: fileName,
                    fileSize: req.file.size,
                    fileType: req.file.mimetype
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error uploading file',
                error: error.message
            });
        }
    }

    async deleteFile(req, res) {
        try {
            const { fileKey } = req.params;

            const deleteParams = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: fileKey
            };

            const command = new DeleteObjectCommand(deleteParams);
            await s3Client.send(command);

            res.status(200).json({
                status: 200,
                message: 'File deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error deleting file',
                error: error.message
            });
        }
    }

    async getPresignedUrl(req, res) {
        try {
            const { fileName, fileType } = req.body;
            const key = `${Date.now()}-${fileName}`;

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key,
                ContentType: fileType
            });

            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

            res.status(200).json({
                status: 200,
                message: 'Presigned URL generated',
                data: {
                    uploadUrl: signedUrl,
                    fileKey: key,
                    fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error generating presigned URL',
                error: error.message
            });
        }
    }
}

module.exports = new UploadController();