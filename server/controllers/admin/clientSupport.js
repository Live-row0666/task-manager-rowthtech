const ClientSupport = require('../../models/clientSupport');
require('../../models/client');
require('../../models/project');
require('../../models/user');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const https = require('https');
const http = require('http');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class AdminClientSupportController {
    // GET /api/v1/admin/client-support/download?url=...&filename=...
    async downloadFile(req, res) {
        try {
            const { url, filename } = req.query;
            if (!url) {
                return res.status(400).send('URL is required');
            }
            const safeName = (filename || 'download').replace(/[^a-zA-Z0-9._-]/g, '_');
            res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);

            if (url.startsWith('data:')) {
                const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const contentType = matches[1];
                    const buffer = Buffer.from(matches[2], 'base64');
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Content-Length', buffer.length);
                    return res.end(buffer);
                }
            }

            const client = url.startsWith('https') ? https : http;
            client.get(url, (stream) => {
                if (stream.statusCode !== 200) {
                    return res.redirect(url);
                }
                res.setHeader('Content-Type', stream.headers['content-type'] || 'application/octet-stream');
                stream.pipe(res);
            }).on('error', (err) => {
                console.error('Download stream error:', err);
                res.redirect(url);
            });
        } catch (err) {
            console.error('Admin download file error:', err);
            res.status(500).send('Failed to download');
        }
    }

    // GET /api/v1/admin/client-support/unread-count
    async getUnreadCount(req, res) {
        try {
            const count = await ClientSupport.countDocuments({ unreadByAdmin: { $gt: 0 } });
            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    unreadCount: count,
                    hasUpdates: count > 0
                }
            });
        } catch (error) {
            console.error('AdminClientSupport getUnreadCount error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/admin/client-support/:id/read
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const ticket = await ClientSupport.findById(id);
            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Ticket not found'
                });
            }

            ticket.unreadByAdmin = 0;
            ticket.lastReadByAdminAt = new Date();
            if (Array.isArray(ticket.responses)) {
                ticket.responses.forEach(r => {
                    if (!r.isAdminResponse) {
                        r.isReadByAdmin = true;
                    }
                });
            }
            await ticket.save();

            const populatedTicket = await ClientSupport.findById(id)
                .populate('client', 'name email')
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email designation')
                .populate('responses.respondedBy', 'name email')
                .lean();

            const io = req.app.get('io');
            if (io) {
                io.to(`ticket_${id}`).emit('ticket_updated', {
                    ticketId: id,
                    ticket: populatedTicket
                });
                io.to('admin_support_channel').emit('ticket_updated', {
                    ticketId: id,
                    ticket: populatedTicket
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                data: populatedTicket
            });
        } catch (error) {
            console.error('Admin markAsRead error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
    // GET /api/v1/admin/client-support
    async getAllTickets(req, res) {
        try {
            const { clientId, projectId, status, priority, category, search } = req.query;

            const query = {};

            if (clientId && clientId !== 'all') {
                query.client = clientId;
            }

            if (projectId && projectId !== 'all') {
                query.project = projectId;
            }

            if (status && status !== 'all') {
                query.status = status.toLowerCase().replace(/\s+/g, '_');
            }

            if (priority && priority !== 'all') {
                query.priority = priority.toLowerCase();
            }

            if (category && category !== 'all') {
                query.category = category.toLowerCase().replace(/\s+/g, '_');
            }

            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                query.$or = [
                    { title: searchRegex },
                    { description: searchRegex }
                ];
            }
            const tickets = await ClientSupport.find(query)
                .populate('client', 'name email')
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email designation')
                .populate('responses.respondedBy', 'name email')
                .sort({ createdAt: -1 })
                .lean();

            const formattedTickets = tickets.map(t => {
                let unreadCount = t.unreadByAdmin;
                if (unreadCount === undefined || unreadCount === null) {
                    unreadCount = (t.responses || []).filter(r => !r.isAdminResponse && !r.isReadByAdmin).length;
                }
                return {
                    ...t,
                    unreadByAdmin: unreadCount
                };
            });

            return res.status(200).json({
                status: 200,
                success: true,
                data: formattedTickets,
                totalTickets: formattedTickets.length
            });
        } catch (error) {
            console.error('AdminClientSupport getAllTickets error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/admin/client-support/:id
    async getTicketById(req, res) {
        try {
            const { id } = req.params;
            const ticket = await ClientSupport.findById(id)
                .populate('client', 'name email')
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email designation')
                .populate('responses.respondedBy', 'name email')
                .lean();

            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Ticket not found'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                data: ticket
            });
        } catch (error) {
            console.error('AdminClientSupport getTicketById error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/admin/client-support/:id
    async updateTicket(req, res) {
        try {
            const { id } = req.params;
            const { status, priority, category, assignedTo } = req.body;

            const ticket = await ClientSupport.findById(id);
            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Ticket not found'
                });
            }

            if (status) {
                ticket.status = status.toLowerCase().replace(/\s+/g, '_');
            }
            if (priority) {
                ticket.priority = priority.toLowerCase();
            }
            if (category) {
                ticket.category = category.toLowerCase().replace(/\s+/g, '_');
            }
            if (assignedTo !== undefined) {
                ticket.assignedTo = assignedTo || null;
            }

            await ticket.save();

            const updatedTicket = await ClientSupport.findById(ticket._id)
                .populate('client', 'name email')
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email designation')
                .populate('responses.respondedBy', 'name email')
                .lean();

            // Notify socket room about ticket status/assignment update
            const io = req.app.get('io');
            if (io) {
                const clientIdStr = (updatedTicket.client?._id || updatedTicket.client || ticket.client?._id || ticket.client || '').toString();
                io.to(`ticket_${ticket._id}`).emit('ticket_updated', {
                    ticketId: ticket._id.toString(),
                    ticket: updatedTicket
                });
                if (clientIdStr) {
                    io.to(`client_${clientIdStr}`).emit('ticket_updated', {
                        ticketId: ticket._id.toString(),
                        ticket: updatedTicket
                    });
                }
                io.to('admin_support_channel').emit('ticket_updated', {
                    ticketId: ticket._id.toString(),
                    ticket: updatedTicket
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Ticket updated successfully',
                data: updatedTicket
            });
        } catch (error) {
            console.error('AdminClientSupport updateTicket error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/admin/client-support/:id/response
    async addResponse(req, res) {
        try {
            const { id } = req.params;
            const message = (req.body?.message || '').toString();

            const hasFiles = req.files && req.files.length > 0;
            if (!message.trim() && !hasFiles) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'Message or attachment is required'
                });
            }

            const ticket = await ClientSupport.findById(id);
            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Ticket not found'
                });
            }

            // Upload any attachments sent by PM
            const uploadedAttachments = [];
            if (hasFiles) {
                for (const file of req.files) {
                    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `support-chat/${Date.now()}-${sanitizedName}`;

                    try {
                        if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID) {
                            const uploadParams = {
                                Bucket: process.env.AWS_S3_BUCKET,
                                Key: fileName,
                                Body: file.buffer,
                                ContentType: file.mimetype,
                            };
                            const command = new PutObjectCommand(uploadParams);
                            await s3Client.send(command);

                            const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
                            uploadedAttachments.push({
                                originalName: file.originalname,
                                fileName: fileName,
                                url: fileUrl,
                                size: file.size,
                                type: file.mimetype
                            });
                        } else {
                            uploadedAttachments.push({
                                originalName: file.originalname,
                                fileName: fileName,
                                url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                                size: file.size,
                                type: file.mimetype
                            });
                        }
                    } catch (uploadErr) {
                        console.error('S3 chat attachment upload error:', uploadErr);
                    }
                }
            }

            const newResponse = {
                message: message.trim(),
                respondedBy: req.user?._id,
                respondedAt: new Date(),
                isAdminResponse: true,
                isReadByAdmin: true,
                isReadByClient: false,
                attachments: uploadedAttachments
            };

            ticket.responses.push(newResponse);
            ticket.unreadByClient = (ticket.unreadByClient || 0) + 1;
            ticket.unreadByAdmin = 0;
            ticket.lastReadByAdminAt = new Date();
            if (Array.isArray(ticket.responses)) {
                ticket.responses.forEach(r => {
                    if (!r.isAdminResponse) r.isReadByAdmin = true;
                });
            }
            await ticket.save();

            const updatedTicket = await ClientSupport.findById(ticket._id)
                .populate('client', 'name email')
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email designation')
                .populate('responses.respondedBy', 'name email')
                .lean();

            // Real-time broadcast to socket room
            const io = req.app.get('io');
            if (io) {
                const clientIdStr = (updatedTicket.client?._id || updatedTicket.client || ticket.client?._id || ticket.client || '').toString();
                io.to(`ticket_${ticket._id}`).emit('new_client_support_response', {
                    ticketId: ticket._id.toString(),
                    response: newResponse,
                    ticket: updatedTicket
                });
                if (clientIdStr) {
                    io.to(`client_${clientIdStr}`).emit('new_client_support_response', {
                        ticketId: ticket._id.toString(),
                        response: newResponse,
                        ticket: updatedTicket
                    });
                    io.to(`client_${clientIdStr}`).emit('ticket_updated', {
                        ticketId: ticket._id.toString(),
                        ticket: updatedTicket
                    });
                }
                io.to('admin_support_channel').emit('ticket_updated', {
                    ticketId: ticket._id.toString(),
                    ticket: updatedTicket
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Response sent successfully',
                data: updatedTicket
            });
        } catch (error) {
            console.error('AdminClientSupport addResponse error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AdminClientSupportController();
