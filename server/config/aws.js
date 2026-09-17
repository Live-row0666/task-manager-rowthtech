/**
 * AWS S3 Integration Module
 * @module utils/aws.s3
 * @requires dotenv
 * @requires @aws-sdk/client-s3
 * @requires @aws-sdk/s3-request-presigner
 * @description Provides utilities for interacting with AWS S3 storage
 */
require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

/**
 * S3 client instance configured with credentials from environment variables
 * @type {S3Client}
 * @private
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a pre-signed URL for direct file uploads to S3
 * @async
 * @function getPresignedUrl
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with signed URL or error
 */
const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.query;

    if (!fileName || !fileType) {
      return res
        .status(400)
        .json({ error: "File name and file type are required" });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `taskManager/${fileName}`,
      ContentType: fileType,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 }); 
    console.log('Generated presigned URL:', signedUrl);  
    return res.json({ url: signedUrl });
  } catch (error) {
    console.log('Error generating presigned URL:', error); 
    return res.json({ error: error.message });
  }
};

module.exports = {
  getPresignedUrl
};
