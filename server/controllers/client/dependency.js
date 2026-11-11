const ClientDependency = require('../../models/clientDependency');
const Project = require('../../models/project');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class ClientDependencyController {
    // GET /api/v1/client/dependency
    async getDependencies(req, res) {
        try {
            const clientId = req.client._id;
            const { projectId, status, priority } = req.query;

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

            const dependencies = await ClientDependency.find(query)
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .sort({ createdAt: -1 })
                .lean();

            const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            // Keep newest first within each priority, as returned by the query.
            dependencies.sort((a, b) =>
                (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

            return res.status(200).json({
                status: 200,
                success: true,
                data: dependencies
            });
        } catch (error) {
            console.error('Client getDependencies error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/client/dependency/stats
    async getStats(req, res) {
        try {
            const clientId = req.client._id;
            const { projectId } = req.query;

            const query = { client: clientId };
            if (projectId && projectId !== 'all') {
                query.project = projectId;
            }

            const [total, pending, submitted, inReview, completed, unreadByClientCount] = await Promise.all([
                ClientDependency.countDocuments(query),
                ClientDependency.countDocuments({ ...query, status: 'pending' }),
                ClientDependency.countDocuments({ ...query, status: 'submitted' }),
                ClientDependency.countDocuments({ ...query, status: 'in_review' }),
                ClientDependency.countDocuments({ ...query, status: 'completed' }),
                ClientDependency.countDocuments({ ...query, unreadByClient: { $gt: 0 } })
            ]);

            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    total,
                    pending,
                    submitted,
                    inReview,
                    completed,
                    unreadCount: unreadByClientCount,
                    hasUpdates: pending > 0 || unreadByClientCount > 0
                }
            });
        } catch (error) {
            console.error('Client getStats error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/client/dependency/:id
    async getDependencyById(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;

            const dependency = await ClientDependency.findOne({ _id: id, client: clientId })
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .lean();

            if (!dependency) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Dependency requirement not found'
                });
            }

            // Clear unread flag for client
            await ClientDependency.findByIdAndUpdate(id, { unreadByClient: 0 });

            return res.status(200).json({
                status: 200,
                success: true,
                data: dependency
            });
        } catch (error) {
            console.error('Client getDependencyById error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/client/dependency/:id/submit
    async submitDependency(req, res) {
        try {
            const clientId = req.client._id;
            const { id } = req.params;

            const dependency = await ClientDependency.findOne({ _id: id, client: clientId });
            if (!dependency) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Dependency requirement not found'
                });
            }

            // Parse submitted fields payload
            let submittedFields = {};
            if (req.body.fields) {
                try {
                    submittedFields = typeof req.body.fields === 'string'
                        ? JSON.parse(req.body.fields)
                        : req.body.fields;
                } catch (e) {
                    submittedFields = req.body.fields;
                }
            }

            // Process uploaded files if any
            const uploadedFilesMap = new Map();
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
                    let fileUrl = '';

                    try {
                        const bucket = process.env.AWS_S3_BUCKET || bucket || 'rowthltd';
                    if (bucket) {
                            const uploadParams = {
                                Bucket: bucket,
                                Key: `dependencies/${fileName}`,
                                Body: file.buffer,
                                ContentType: file.mimetype
                            };
                            await s3Client.send(new PutObjectCommand(uploadParams));
                            fileUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/dependencies/${fileName}`;
                        } else {
                            fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                        }
                    } catch (s3Err) {
                        console.error('S3 dependency upload fallback to base64:', s3Err);
                        fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    }

                    // Field name in multer matches field id (e.g. "field_123")
                    uploadedFilesMap.set(file.fieldname, {
                        originalName: file.originalname,
                        fileName: fileName,
                        url: fileUrl,
                        size: file.size,
                        type: file.mimetype
                    });
                }
            }

            // Update dynamic fields
            let allRequiredFilled = true;
            dependency.dynamicFields = dependency.dynamicFields.map(field => {
                const updated = { ...field.toObject() };

                if (field.fieldType === 'file') {
                    const uploaded = uploadedFilesMap.get(field.id);
                    if (uploaded) {
                        updated.fileValue = uploaded;
                        updated.isFilled = true;
                        updated.filledAt = new Date();
                    }
                } else if (submittedFields[field.id] !== undefined) {
                    const val = submittedFields[field.id];
                    updated.value = (val !== null && val !== undefined) ? String(val).trim() : '';
                    updated.isFilled = updated.value.length > 0;
                    if (updated.isFilled) {
                        updated.filledAt = new Date();
                    }
                }

                if (field.isRequired) {
                    if (field.fieldType === 'file') {
                        if (!updated.fileValue || !updated.fileValue.url) {
                            allRequiredFilled = false;
                        }
                    } else if (!updated.value || updated.value.trim() === '') {
                        allRequiredFilled = false;
                    }
                }

                return updated;
            });

            if (req.body.clientNotes !== undefined) {
                dependency.clientNotes = req.body.clientNotes;
            }

            dependency.status = 'submitted';
            dependency.submittedAt = new Date();
            dependency.unreadByAdmin = (dependency.unreadByAdmin || 0) + 1;
            dependency.unreadByClient = 0;

            await dependency.save();

            const populated = await ClientDependency.findById(dependency._id)
                .populate('client', 'name email contact companyName')
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .lean();

            // Real-time notification to admin and client
            const io = req.app.get('io');
            if (io) {
                io.to('admin_support_channel').emit('dependency_submitted', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
                io.to(`client_${clientId}`).emit('dependency_status_changed', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Dependency requirements successfully submitted to Admin / PM',
                data: populated
            });
        } catch (error) {
            console.error('Client submitDependency error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ClientDependencyController();
