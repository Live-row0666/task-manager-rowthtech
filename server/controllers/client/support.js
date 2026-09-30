const ClientSupport = require('../../models/clientSupport');
const ClientProject = require('../../models/clientProject');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class ClientSupportController {
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

            return res.status(200).json({
                status: 200,
                success: true,
                data: tickets,
                totalTickets: tickets.length
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
}

module.exports = new ClientSupportController();
