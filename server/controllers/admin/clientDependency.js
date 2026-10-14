const ClientDependency = require('../../models/clientDependency');
const ClientProject = require('../../models/clientProject');
const Client = require('../../models/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

class ClientDependencyAdminController {
    // GET /api/v1/admin/client-dependency
    async getDependencies(req, res) {
        try {
            const { clientId, projectId, status, priority, search } = req.query;

            const query = {};
            if (clientId && clientId !== 'all') {
                query.client = clientId;
            }
            if (projectId && projectId !== 'all') {
                query.project = projectId;
            }
            if (status && status !== 'all') {
                query.status = status;
            }
            if (priority && priority !== 'all') {
                query.priority = priority;
            }
            if (search && search.trim()) {
                query.$or = [
                    { title: { $regex: search.trim(), $options: 'i' } },
                    { description: { $regex: search.trim(), $options: 'i' } }
                ];
            }

            const dependencies = await ClientDependency.find(query)
                .populate('client', 'name email contact companyName')
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                status: 200,
                success: true,
                data: dependencies
            });
        } catch (error) {
            console.error('Admin getDependencies error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/admin/client-dependency/stats
    async getStats(req, res) {
        try {
            const { clientId, projectId } = req.query;
            const query = {};
            if (clientId && clientId !== 'all') query.client = clientId;
            if (projectId && projectId !== 'all') query.project = projectId;

            const [total, pending, submitted, inReview, completed, rejected, unreadByAdminCount] = await Promise.all([
                ClientDependency.countDocuments(query),
                ClientDependency.countDocuments({ ...query, status: 'pending' }),
                ClientDependency.countDocuments({ ...query, status: 'submitted' }),
                ClientDependency.countDocuments({ ...query, status: 'in_review' }),
                ClientDependency.countDocuments({ ...query, status: 'completed' }),
                ClientDependency.countDocuments({ ...query, status: 'rejected' }),
                ClientDependency.countDocuments({ ...query, unreadByAdmin: { $gt: 0 } })
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
                    rejected,
                    unreadCount: unreadByAdminCount,
                    hasUpdates: submitted > 0 || unreadByAdminCount > 0
                }
            });
        } catch (error) {
            console.error('Admin getStats error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // GET /api/v1/admin/client-dependency/:id
    async getDependencyById(req, res) {
        try {
            const { id } = req.params;
            const dependency = await ClientDependency.findById(id)
                .populate('client', 'name email contact companyName')
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

            // Clear unread count for admin
            await ClientDependency.findByIdAndUpdate(id, { unreadByAdmin: 0 });

            return res.status(200).json({
                status: 200,
                success: true,
                data: dependency
            });
        } catch (error) {
            console.error('Admin getDependencyById error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // POST /api/v1/admin/client-dependency
    async createDependency(req, res) {
        try {
            const {
                clientId,
                projectId,
                title,
                description,
                priority = 'medium',
                expectedDays = 3,
                dueDate,
                dynamicFields = []
            } = req.body;

            if (!clientId || !projectId || !title) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'Client, Project, and Requirement Title are required.'
                });
            }

            // Calculate due date if not provided
            let finalDueDate = dueDate;
            if (!finalDueDate && expectedDays) {
                const daysNum = parseInt(expectedDays) || 3;
                finalDueDate = new Date(Date.now() + daysNum * 24 * 60 * 60 * 1000);
            }

            // Ensure field IDs
            const sanitizedFields = (Array.isArray(dynamicFields) ? dynamicFields : []).map((f, idx) => ({
                id: f.id || `field_${Date.now()}_${idx}`,
                label: f.label || `Requirement ${idx + 1}`,
                fieldType: f.fieldType || 'text',
                placeholder: f.placeholder || '',
                helpText: f.helpText || '',
                isRequired: f.isRequired !== undefined ? f.isRequired : true,
                value: '',
                isFilled: false
            }));

            const newDependency = new ClientDependency({
                client: clientId,
                project: projectId,
                title: title.trim(),
                description: (description || '').trim(),
                priority,
                status: 'pending',
                expectedDays: parseInt(expectedDays) || 3,
                dueDate: finalDueDate,
                dynamicFields: sanitizedFields,
                createdBy: req.user?._id,
                unreadByClient: 1,
                unreadByAdmin: 0
            });

            await newDependency.save();

            const populated = await ClientDependency.findById(newDependency._id)
                .populate('client', 'name email contact companyName')
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .lean();

            // Emit socket event to client and admin channel
            const io = req.app.get('io');
            if (io) {
                io.to(`client_${clientId}`).emit('new_dependency_assigned', {
                    dependencyId: newDependency._id.toString(),
                    dependency: populated
                });
                io.to('admin_support_channel').emit('dependency_created', {
                    dependencyId: newDependency._id.toString(),
                    dependency: populated
                });
            }

            return res.status(201).json({
                status: 201,
                success: true,
                message: 'Dependency requirement created and assigned to client',
                data: populated
            });
        } catch (error) {
            console.error('Admin createDependency error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/admin/client-dependency/:id
    async updateDependency(req, res) {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                priority,
                expectedDays,
                dueDate,
                dynamicFields,
                adminNotes
            } = req.body;

            const dependency = await ClientDependency.findById(id);
            if (!dependency) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Dependency requirement not found'
                });
            }

            if (title) dependency.title = title.trim();
            if (description !== undefined) dependency.description = (description || '').trim();
            if (priority) dependency.priority = priority;
            if (expectedDays) dependency.expectedDays = parseInt(expectedDays);
            if (dueDate) dependency.dueDate = dueDate;
            if (adminNotes !== undefined) dependency.adminNotes = adminNotes;

            if (Array.isArray(dynamicFields)) {
                // Merge existing values where field id matches
                const existingMap = new Map((dependency.dynamicFields || []).map(f => [f.id, f]));
                dependency.dynamicFields = dynamicFields.map((f, idx) => {
                    const existing = existingMap.get(f.id);
                    return {
                        id: f.id || `field_${Date.now()}_${idx}`,
                        label: f.label || `Requirement ${idx + 1}`,
                        fieldType: f.fieldType || 'text',
                        placeholder: f.placeholder || '',
                        helpText: f.helpText || '',
                        isRequired: f.isRequired !== undefined ? f.isRequired : true,
                        value: existing ? existing.value : (f.value || ''),
                        fileValue: existing ? existing.fileValue : f.fileValue,
                        isFilled: existing ? existing.isFilled : false,
                        filledAt: existing ? existing.filledAt : null
                    };
                });
            }

            await dependency.save();

            const populated = await ClientDependency.findById(dependency._id)
                .populate('client', 'name email contact companyName')
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .lean();

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${dependency.client}`).emit('dependency_updated', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
                io.to('admin_support_channel').emit('dependency_updated', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Dependency requirement updated',
                data: populated
            });
        } catch (error) {
            console.error('Admin updateDependency error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/admin/client-dependency/:id/status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, adminNotes } = req.body;

            const validStatuses = ['pending', 'submitted', 'in_review', 'completed', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'Invalid status value'
                });
            }

            const dependency = await ClientDependency.findById(id);
            if (!dependency) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Dependency requirement not found'
                });
            }

            dependency.status = status;
            if (adminNotes !== undefined) {
                dependency.adminNotes = adminNotes;
            }

            if (status === 'completed') {
                dependency.completedAt = new Date();
            } else if (status === 'rejected') {
                // If rejected, prompt client to revise
                dependency.unreadByClient = (dependency.unreadByClient || 0) + 1;
            }

            await dependency.save();

            const populated = await ClientDependency.findById(dependency._id)
                .populate('client', 'name email contact companyName')
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .lean();

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${dependency.client}`).emit('dependency_status_changed', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
                io.to('admin_support_channel').emit('dependency_status_changed', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: `Dependency status updated to ${status}`,
                data: populated
            });
        } catch (error) {
            console.error('Admin updateStatus error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // PUT /api/v1/admin/client-dependency/:id/submit
    async submitDependency(req, res) {
        try {
            const { id } = req.params;
            const dependency = await ClientDependency.findById(id);
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
                        if (process.env.AWS_BUCKET_NAME) {
                            const uploadParams = {
                                Bucket: process.env.AWS_BUCKET_NAME,
                                Key: `dependencies/${fileName}`,
                                Body: file.buffer,
                                ContentType: file.mimetype
                            };
                            await s3Client.send(new PutObjectCommand(uploadParams));
                            fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/dependencies/${fileName}`;
                        } else {
                            fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                        }
                    } catch (s3Err) {
                        console.error('S3 dependency upload fallback to base64:', s3Err);
                        fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                    }

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

                return updated;
            });

            if (req.body.adminNotes !== undefined) {
                dependency.adminNotes = req.body.adminNotes;
            }
            if (req.body.clientNotes !== undefined) {
                dependency.clientNotes = req.body.clientNotes;
            }

            const targetStatus = req.body.status || 'completed';
            dependency.status = targetStatus;
            if (targetStatus === 'completed') {
                dependency.completedAt = new Date();
            }
            dependency.unreadByAdmin = 0;
            dependency.unreadByClient = (dependency.unreadByClient || 0) + 1;

            await dependency.save();

            const populated = await ClientDependency.findById(dependency._id)
                .populate('client', 'name email contact companyName')
                .populate('project', 'name projectStatus projectType')
                .populate('createdBy', 'name email designation')
                .lean();

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${dependency.client}`).emit('dependency_updated', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
                io.to(`client_${dependency.client}`).emit('dependency_status_changed', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
                io.to('admin_support_channel').emit('dependency_updated', {
                    dependencyId: dependency._id.toString(),
                    dependency: populated
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Dependency requirements successfully filled and saved',
                data: populated
            });
        } catch (error) {
            console.error('Admin submitDependency error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /api/v1/admin/client-dependency/:id
    async deleteDependency(req, res) {
        try {
            const { id } = req.params;
            const dependency = await ClientDependency.findByIdAndDelete(id);

            if (!dependency) {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: 'Dependency requirement not found'
                });
            }

            const io = req.app.get('io');
            if (io) {
                io.to(`client_${dependency.client}`).emit('dependency_deleted', {
                    dependencyId: id
                });
                io.to('admin_support_channel').emit('dependency_deleted', {
                    dependencyId: id
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Dependency requirement deleted successfully'
            });
        } catch (error) {
            console.error('Admin deleteDependency error:', error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new ClientDependencyAdminController();
