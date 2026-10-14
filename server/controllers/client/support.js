const ClientSupport = require('../../models/clientSupport');
const ClientProject = require('../../models/clientProject');
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

class ClientSupportController {
    // GET /api/v1/client/support/download?url=...&filename=...
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
                console.error('Client download stream error:', err);
                res.redirect(url);
            });
        } catch (err) {
            console.error('Client download file error:', err);
            res.status(500).send('Failed to download');
        }
    }

    // PUT /api/v1/client/support/:id/read
    async markAsRead(req, res) {
        try {
            const clientId = req.client._id;
            // console.log(clientId, 'clientid===')
            const { id } = req.params;
            const ticket = await ClientSupport.findOne({ _id: id, client: clientId });
            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Ticket not found'
                });
            }

            ticket.unreadByClient = 0;
            ticket.lastReadByClientAt = new Date();
            if (Array.isArray(ticket.responses)) {
                ticket.responses.forEach(r => {
                    if (r.isAdminResponse) {
                        r.isReadByClient = true;
                    }
                });
            }
            await ticket.save();

            const populatedTicket = await ClientSupport.findById(id)
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
                io.to(`client_${clientId}`).emit('ticket_updated', {
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
            console.error('Client markAsRead error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
    // GET /api/v1/client/support
    async getTickets(req, res) {
        try {
            const clientId = req.client._id;
            const { projectId, status, priority, category } = req.query;

            const query = { client: clientId };
            if (projectId && projectId !== 'all') {
                query.project = projectId;
            }
            if (status && status !== 'all') {
                query.status = status;
            }
            if (priority && priority !== 'all') {
                query.priority = priority;
            }
            if (category && category !== 'all') {
                query.category = category;
            }

            const tickets = await ClientSupport.find(query)
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email designation')
                .populate('responses.respondedBy', 'name email')
                .sort({ createdAt: -1 })
                .lean();

            const formattedTickets = tickets.map(t => {
                let unreadCount = t.unreadByClient;
                if (unreadCount === undefined || unreadCount === null) {
                    unreadCount = (t.responses || []).filter(r => r.isAdminResponse && !r.isReadByClient).length;
                }
                return {
                    ...t,
                    unreadByClient: unreadCount
                };
            });

            return res.status(200).json({
                status: 200,
                success: true,
                data: formattedTickets,
                totalTickets: formattedTickets.length
            });
        } catch (error) {
            console.error('ClientSupport getTickets error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/client/support
    async createTicket(req, res) {
        try {
            const clientId = req.client._id;
            const { title, description, category = 'general_inquiry', priority = 'medium', projectId } = req.body;

            if (!title) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'Title is required'
                });
            }

            // Resolve project: use provided projectId or fallback to client's first active project
            let targetProjectId = projectId;
            if (!targetProjectId) {
                const clientProj = await ClientProject.findOne({ client: clientId, isActive: true });
                if (clientProj) {
                    targetProjectId = clientProj._id;
                }
            }

            if (!targetProjectId) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'Please select a project for this ticket'
                });
            }

            // Handle uploaded screenshots
            const uploadedScreenshots = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `support-screenshots/${Date.now()}-${sanitizedName}`;

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
                            uploadedScreenshots.push({
                                originalName: file.originalname,
                                fileName: fileName,
                                url: fileUrl,
                                size: file.size,
                                type: file.mimetype
                            });
                        }
                    } catch (uploadErr) {
                        console.error('S3 screenshot upload error:', uploadErr);
                    }
                }
            }

            const newTicket = await ClientSupport.create({
                client: clientId,
                project: targetProjectId,
                title,
                description,
                category,
                priority,
                status: 'open',
                screenshots: uploadedScreenshots
            });

            const populatedTicket = await ClientSupport.findById(newTicket._id)
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email');

            const io = req.app.get('io');
            if (io) {
                io.to('admin_support_channel').emit('ticket_created', { ticket: populatedTicket });
                io.to('admin_support_channel').emit('support_updated', { type: 'created', ticket: populatedTicket });
                io.to(`client_${clientId}`).emit('ticket_created', { ticket: populatedTicket });
            }

            return res.status(201).json({
                status: 201,
                success: true,
                message: 'Support ticket created successfully',
                data: populatedTicket
            });
        } catch (error) {
            console.error('ClientSupport createTicket error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/client/support/unread-count
    async getUnreadCount(req, res) {
        try {
            const clientId = req.client._id;
            const count = await ClientSupport.countDocuments({
                client: clientId,
                unreadByClient: { $gt: 0 }
            });
            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    unreadCount: count,
                    hasUpdates: count > 0
                }
            });
        } catch (error) {
            console.error('ClientSupport getUnreadCount error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/client/support/:id
    async getTicketById(req, res) {
        try {
            const clientId = req.client._id;
            const ticket = await ClientSupport.findOne({ _id: req.params.id, client: clientId })
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email')
                .populate('responses.respondedBy', 'name email');

            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Support ticket not found'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                data: ticket
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/client/support/:id
    async updateTicket(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;
            const { title, description, category, priority, projectId, existingScreenshots } = req.body;

            const ticket = await ClientSupport.findOne({ _id: id, client: clientId });
            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Support ticket not found or unauthorized'
                });
            }

            if (title) ticket.title = title;
            if (description !== undefined) ticket.description = description;
            if (category) ticket.category = category;
            if (priority) ticket.priority = priority;
            if (projectId) ticket.project = projectId;

            // Retain existing screenshots specified by client
            let currentScreenshots = [];
            if (existingScreenshots) {
                try {
                    currentScreenshots = typeof existingScreenshots === 'string'
                        ? JSON.parse(existingScreenshots)
                        : existingScreenshots;
                } catch (e) {
                    currentScreenshots = ticket.screenshots || [];
                }
            } else if (existingScreenshots === undefined) {
                currentScreenshots = ticket.screenshots || [];
            }

            // Upload any newly added screenshots
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `support-screenshots/${Date.now()}-${sanitizedName}`;

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
                            currentScreenshots.push({
                                originalName: file.originalname,
                                fileName: fileName,
                                url: fileUrl,
                                size: file.size,
                                type: file.mimetype
                            });
                        }
                    } catch (uploadErr) {
                        console.error('S3 screenshot upload error:', uploadErr);
                    }
                }
            }

            ticket.screenshots = currentScreenshots;
            await ticket.save();

            const updatedTicket = await ClientSupport.findById(ticket._id)
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email');

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Support ticket updated successfully',
                data: updatedTicket
            });
        } catch (error) {
            console.error('ClientSupport updateTicket error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/v1/client/support/:id
    async deleteTicket(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;

            const ticket = await ClientSupport.findOneAndDelete({ _id: id, client: clientId });
            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Support ticket not found or unauthorized'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Support ticket deleted successfully'
            });
        } catch (error) {
            console.error('ClientSupport deleteTicket error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/client/support/:id/response
    async addResponse(req, res) {
        try {
            const clientId = req.client._id;
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

            const ticket = await ClientSupport.findOne({ _id: id, client: clientId });
            if (!ticket) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Ticket not found'
                });
            }

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
                        console.error('S3 client response upload error:', uploadErr);
                    }
                }
            }

            const newResponse = {
                message: message.trim(),
                respondedAt: new Date(),
                isAdminResponse: false,
                isReadByAdmin: false,
                isReadByClient: true,
                attachments: uploadedAttachments
            };

            ticket.responses.push(newResponse);
            ticket.unreadByAdmin = (ticket.unreadByAdmin || 0) + 1;
            await ticket.save();

            const updatedTicket = await ClientSupport.findById(ticket._id)
                .populate('client', 'name email')
                .populate('project', 'name projectStatus projectType')
                .populate('assignedTo', 'name email designation')
                .populate('responses.respondedBy', 'name email')
                .lean();

            // Real-time broadcast to socket room and admin channel
            const io = req.app.get('io');
            if (io) {
                io.to(`ticket_${ticket._id}`).emit('new_client_support_response', {
                    ticketId: ticket._id.toString(),
                    response: newResponse,
                    ticket: updatedTicket
                });
                io.to('admin_support_channel').emit('new_client_support_response', {
                    ticketId: ticket._id.toString(),
                    response: newResponse,
                    ticket: updatedTicket
                });
                io.to('admin_support_channel').emit('ticket_updated', {
                    ticketId: ticket._id.toString(),
                    ticket: updatedTicket
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Response added successfully',
                data: updatedTicket
            });
        } catch (error) {
            console.error('ClientSupport addResponse error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ClientSupportController();
