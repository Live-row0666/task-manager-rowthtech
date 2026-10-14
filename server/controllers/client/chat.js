const ClientChat = require('../../models/clientChat');
const Client = require('../../models/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class ClientChatController {
    // GET /api/v1/client/chat/messages
    async getMessages(req, res) {
        try {
            const clientId = req.client._id;

            // Fetch chat history for this client
            const messages = await ClientChat.find({ client: clientId })
                .populate('senderUser', 'name email designation profilePicture')
                .populate('senderClient', 'name email companyName profilePicture')
                .sort({ createdAt: 1 })
                .lean();

            // Mark unread admin messages as read by client
            await ClientChat.updateMany(
                { client: clientId, senderType: 'admin', readByClient: false },
                { $set: { readByClient: true } }
            );

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${clientId}`).emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'client'
                });
                io.to('admin_support_channel').emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'client'
                });
            }

            // Calculate unread count for client
            const unreadCount = 0; // Just marked read

            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    messages,
                    unreadCount
                }
            });
        } catch (error) {
            console.error('ClientChat getMessages error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/client/chat/send
    async sendMessage(req, res) {
        try {
            const clientId = req.client._id;
            const { message } = req.body;

            // Process uploaded files if any
            const attachments = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `chat/${Date.now()}-${sanitizedName}`;
                    let fileUrl = '';

                    try {
                        if (process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET) {
                            const bucket = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET;
                            const uploadParams = {
                                Bucket: bucket,
                                Key: fileName,
                                Body: file.buffer,
                                ContentType: file.mimetype
                            };
                            await s3Client.send(new PutObjectCommand(uploadParams));
                            fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
                        } else {
                            fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                        }
                    } catch (uploadErr) {
                        console.error('S3 chat attachment upload fallback to base64:', uploadErr);
                        fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    }

                    attachments.push({
                        originalName: file.originalname,
                        fileName: fileName,
                        url: fileUrl,
                        size: file.size,
                        type: file.mimetype
                    });
                }
            }

            if (!message && attachments.length === 0) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'Message text or attachment is required.'
                });
            }

            const newChat = new ClientChat({
                client: clientId,
                senderType: 'client',
                senderClient: clientId,
                senderName: req.client.name || req.client.clientName || 'Client',
                message: (message || '').trim(),
                attachments,
                readByClient: true,
                readByAdmin: false
            });

            await newChat.save();

            const populated = await ClientChat.findById(newChat._id)
                .populate('senderClient', 'name email companyName profilePicture')
                .lean();

            // Emit real-time socket events
            const io = req.app.get('io');
            if (io) {
                // To Admin support channel
                io.to('admin_support_channel').emit('new_client_chat_message', {
                    clientId: clientId.toString(),
                    message: populated
                });
                // To Client channel
                io.to(`client_${clientId}`).emit('new_client_chat_message', {
                    clientId: clientId.toString(),
                    message: populated
                });
            }

            return res.status(201).json({
                status: 201,
                success: true,
                message: 'Message sent successfully',
                data: populated
            });
        } catch (error) {
            console.error('ClientChat sendMessage error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/client/chat/read
    async markAsRead(req, res) {
        try {
            const clientId = req.client._id;
            await ClientChat.updateMany(
                { client: clientId, senderType: 'admin', readByClient: false },
                { $set: { readByClient: true } }
            );

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${clientId}`).emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'client'
                });
                io.to('admin_support_channel').emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'client'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Messages marked as read'
            });
        } catch (error) {
            console.error('ClientChat markAsRead error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ClientChatController();
