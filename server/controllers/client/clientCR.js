const ClientCR = require('../../models/clientCR');
const Client = require('../../models/client');
const Project = require('../../models/project');
const ClientProject = require('../../models/clientProject');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class ClientCRController {
    // GET /api/v1/client/cr/stats
    async getStats(req, res) {
        try {
            const clientId = req.client._id;
            const { projectId } = req.query;

            const filter = { client: clientId };
            if (projectId) filter.project = projectId;

            const [total, submitted, inReview, approved, rejected, inProgress, completed] = await Promise.all([
                ClientCR.countDocuments(filter),
                ClientCR.countDocuments({ ...filter, status: 'submitted' }),
                ClientCR.countDocuments({ ...filter, status: 'in_review' }),
                ClientCR.countDocuments({ ...filter, status: 'approved' }),
                ClientCR.countDocuments({ ...filter, status: 'rejected' }),
                ClientCR.countDocuments({ ...filter, status: 'in_progress' }),
                ClientCR.countDocuments({ ...filter, status: 'completed' })
            ]);

            return res.status(200).json({
                status: 200,
                data: {
                    total,
                    submitted,
                    inReview,
                    approved,
                    rejected,
                    inProgress,
                    completed
                }
            });
        } catch (error) {
            console.error('Error fetching client CR stats:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // GET /api/v1/client/cr
    async getCRs(req, res) {
        try {
            const clientId = req.client._id;
            const { projectId, status, priority, search } = req.query;

            const filter = { client: clientId };
            if (projectId) filter.project = projectId;
            if (status && status !== 'all') filter.status = status;
            if (priority && priority !== 'all') filter.priority = priority;
            if (search && search.trim()) {
                filter.$or = [
                    { title: { $regex: search.trim(), $options: 'i' } },
                    { description: { $regex: search.trim(), $options: 'i' } }
                ];
            }

            const crs = await ClientCR.find(filter)
                .populate('project', 'name projectStatus')
                .populate('reviewedBy', 'name email designation')
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                status: 200,
                data: crs
            });
        } catch (error) {
            console.error('Error fetching client CRs:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // GET /api/v1/client/cr/:id
    async getCRById(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;

            const cr = await ClientCR.findOne({ _id: id, client: clientId })
                .populate('project', 'name projectStatus')
                .populate('reviewedBy', 'name email designation');

            if (!cr) {
                return res.status(404).json({ status: 404, message: 'Change Request not found.' });
            }

            // Mark as read by client if unread
            if (cr.unreadByClient > 0) {
                cr.unreadByClient = 0;
                await cr.save();
            }

            return res.status(200).json({ status: 200, data: cr });
        } catch (error) {
            console.error('Error fetching single client CR:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // POST /api/v1/client/cr
    async createCR(req, res) {
        try {
            const clientId = req.client._id;
            const { project, title, description, priority, targetDate, clientNotes } = req.body;

            if (!project || !title) {
                return res.status(400).json({ status: 400, message: 'Project and Title are required.' });
            }

            // Upload attachments if present
            const uploadedAttachments = [];
            const bucket = process.env.AWS_S3_BUCKET || process.env.AWS_BUCKET_NAME || 'rowthltd';
            const region = process.env.AWS_REGION || 'ap-south-1';

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    try {
                        const fileExt = file.originalname.split('.').pop();
                        const uniqueFileName = `cr-${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
                        const key = `client-cr/${clientId}/${uniqueFileName}`;

                        const uploadParams = {
                            Bucket: bucket,
                            Key: key,
                            Body: file.buffer,
                            ContentType: file.mimetype
                        };
                        await s3Client.send(new PutObjectCommand(uploadParams));
                        const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

                        uploadedAttachments.push({
                            originalName: file.originalname,
                            fileName: uniqueFileName,
                            url: fileUrl,
                            size: file.size,
                            type: file.mimetype
                        });
                        console.log('Successfully uploaded attachment to S3:', fileUrl);
                    } catch (uploadErr) {
                        console.error('CR attachment upload error:', uploadErr);
                        throw new Error(`Failed to upload attachment to S3: ${uploadErr.message}`);
                    }
                }
            }

            const newCR = await ClientCR.create({
                client: clientId,
                project,
                title: title.trim(),
                description: description || '',
                priority: priority || 'medium',
                status: 'submitted',
                targetDate: targetDate ? new Date(targetDate) : undefined,
                clientNotes: clientNotes || '',
                attachments: uploadedAttachments,
                unreadByAdmin: 1,
                unreadByClient: 0
            });

            const populated = await ClientCR.findById(newCR._id)
                .populate('project', 'name projectStatus')
                .lean();

            return res.status(201).json({
                status: 201,
                message: 'Change Request created successfully.',
                data: populated
            });
        } catch (error) {
            console.error('Error creating client CR:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // PUT /api/v1/client/cr/:id
    async updateCR(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;
            const { title, description, priority, targetDate, clientNotes } = req.body;

            const cr = await ClientCR.findOne({ _id: id, client: clientId });
            if (!cr) {
                return res.status(404).json({ status: 404, message: 'Change Request not found.' });
            }

            if (cr.status === 'completed' || cr.status === 'rejected') {
                return res.status(400).json({ status: 400, message: 'Cannot edit an already finalized Change Request.' });
            }

            if (title) cr.title = title.trim();
            if (description !== undefined) cr.description = description;
            if (priority) cr.priority = priority;
            if (targetDate) cr.targetDate = new Date(targetDate);
            if (clientNotes !== undefined) cr.clientNotes = clientNotes;

            cr.unreadByAdmin = (cr.unreadByAdmin || 0) + 1;
            await cr.save();

            const updated = await ClientCR.findById(cr._id)
                .populate('project', 'name projectStatus')
                .populate('reviewedBy', 'name email designation')
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Change Request updated successfully.',
                data: updated
            });
        } catch (error) {
            console.error('Error updating client CR:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // DELETE /api/v1/client/cr/:id
    async deleteCR(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;

            const cr = await ClientCR.findOne({ _id: id, client: clientId });
            if (!cr) {
                return res.status(404).json({ status: 404, message: 'Change Request not found.' });
            }

            if (cr.status !== 'submitted') {
                return res.status(400).json({ status: 400, message: 'Only submitted CRs awaiting review can be canceled.' });
            }

            await ClientCR.findByIdAndDelete(id);
            return res.status(200).json({ status: 200, message: 'Change Request canceled successfully.' });
        } catch (error) {
            console.error('Error deleting client CR:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }
}

module.exports = new ClientCRController();
