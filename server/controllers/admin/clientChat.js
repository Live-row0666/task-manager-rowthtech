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

class AdminClientChatController {
    // GET /api/v1/admin/client-chat/conversations
    async getConversations(req, res) {
        try {
            // Find all active clients
            const clients = await Client.find({}).select('name email loginEmail contact companyName profilePicture').lean();

            // Fetch latest message and unread count for each client
            const conversations = await Promise.all(
                clients.map(async (client) => {
                    const primaryEmail = Array.isArray(client.email)
                        ? (client.email[0] || client.loginEmail || '')
                        : (client.email || client.loginEmail || '');

                    const normalizedClient = {
                        ...client,
                        email: primaryEmail,
                        rawEmail: client.email
                    };

                    const lastMessage = await ClientChat.findOne({ client: client._id })
                        .sort({ createdAt: -1 })
                        .lean();

                    const unreadCount = await ClientChat.countDocuments({
                        client: client._id,
                        senderType: 'client',
                        readByAdmin: false
                    });

                    return {
                        client: normalizedClient,
                        lastMessage: lastMessage
                            ? {
                                message: lastMessage.message,
                                senderType: lastMessage.senderType,
                                hasAttachments: lastMessage.attachments?.length > 0,
                                createdAt: lastMessage.createdAt
                            }
                            : null,
                        unreadCount,
                        lastActivity: lastMessage ? lastMessage.createdAt : new Date(0)
                    };
                })
            );

            // Sort conversations: those with messages first, ordered by lastActivity DESC, then by client name
            conversations.sort((a, b) => {
                if (a.lastMessage && !b.lastMessage) return -1;
                if (!a.lastMessage && b.lastMessage) return 1;
                return new Date(b.lastActivity) - new Date(a.lastActivity);
            });

            // Total unread messages across all clients for admin badge
            const totalUnread = await ClientChat.countDocuments({
                senderType: 'client',
                readByAdmin: false
            });

            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    conversations,
                    totalUnread
                }
            });
        } catch (error) {
            console.error('AdminClientChat getConversations error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/admin/client-chat/messages/:clientId
    async getMessages(req, res) {
        try {
            const { clientId } = req.params;

            const client = await Client.findById(clientId).select('name email contact companyName profilePicture').lean();
            if (!client) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Client not found'
                });
            }

            const messages = await ClientChat.find({ client: clientId })
                .populate('senderUser', 'name email designation profilePicture')
                .populate('senderClient', 'name email companyName profilePicture')
                .sort({ createdAt: 1 })
                .lean();

            // Mark unread messages from this client as read
            await ClientChat.updateMany(
                { client: clientId, senderType: 'client', readByAdmin: false },
                { $set: { readByAdmin: true } }
            );

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${clientId}`).emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'admin'
                });
                io.to('admin_support_channel').emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'admin'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    client,
                    messages
                }
            });
        } catch (error) {
            console.error('AdminClientChat getMessages error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/admin/client-chat/send/:clientId
    async sendMessage(req, res) {
        try {
            const { clientId } = req.params;
            const { message } = req.body;

            const client = await Client.findById(clientId);
            if (!client) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Client not found'
                });
            }

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
                        console.error('S3 admin chat attachment upload error:', uploadErr);
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
                senderType: 'admin',
                senderUser: req.user?._id,
                senderName: req.user?.name || 'Project Manager',
                message: (message || '').trim(),
                attachments,
                readByAdmin: true,
                readByClient: false
            });

            await newChat.save();

            const populated = await ClientChat.findById(newChat._id)
                .populate('senderUser', 'name email designation profilePicture')
                .lean();

            // Emit via socket.io
            const io = req.app.get('io');
            if (io) {
                // To client
                io.to(`client_${clientId}`).emit('new_client_chat_message', {
                    clientId: clientId.toString(),
                    message: populated
                });
                // To admin support channel
                io.to('admin_support_channel').emit('new_client_chat_message', {
                    clientId: clientId.toString(),
                    message: populated
                });
            }

            return res.status(201).json({
                status: 201,
                success: true,
                message: 'Message sent to client successfully',
                data: populated
            });
        } catch (error) {
            console.error('AdminClientChat sendMessage error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/admin/client-chat/read/:clientId
    async markAsRead(req, res) {
        try {
            const { clientId } = req.params;

            await ClientChat.updateMany(
                { client: clientId, senderType: 'client', readByAdmin: false },
                { $set: { readByAdmin: true } }
            );

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${clientId}`).emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'admin'
                });
                io.to('admin_support_channel').emit('client_chat_read', {
                    clientId: clientId.toString(),
                    readBy: 'admin'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Messages marked as read'
            });
        } catch (error) {
            console.error('AdminClientChat markAsRead error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AdminClientChatController();
