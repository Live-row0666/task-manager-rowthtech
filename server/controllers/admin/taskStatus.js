const TaskStatus = require('../../models/taskStatus');

class TaskStatusController {
    async createTaskStatus(req, res) {
        try {
            const { name, order, project } = req.body;

            if (!name) {
                return res.status(400).json({
                    status: 400,
                    message: 'Task status name is required'
                });
            }

            const existingStatus = await TaskStatus.findOne({ name });
            if (existingStatus) {
                return res.status(400).json({
                    status: 400,
                    message: 'Task status already exists'
                });
            }

            let newOrder = order;
            // If order not provided, get last order and increment
            if (!order) {
                const lastStatus = await TaskStatus.findOne({ project })
                    .sort({ order: -1 });
                newOrder = lastStatus ? lastStatus.order + 1 : 1;
            } else {
                // Check if order exists for the project
                const existingStatuses = await TaskStatus.find({ 
                    project,
                    order: { $gte: order }
                });

                // Update order of existing statuses
                if (existingStatuses.length > 0) {
                    await TaskStatus.updateMany(
                        { project, order: { $gte: order } },
                        { $inc: { order: 1 } }
                    );
                }
            }

            const taskStatus = await TaskStatus.create({
                ...req.body,
                order: newOrder
            });

            res.statusc(201).json({
                status: 201,
                message: 'Task status created successfully',
                data: taskStatus
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async getAllTaskStatuses(req, res) {
        try {
            const { page = 1, limit = 10, search = '', project, isActive } = req.query;

            if (!project) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project ID is required'
                });
            };

            let searchQuery = search ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            } : {};
            searchQuery.project = project;
            if (isActive !== undefined) {
                searchQuery.isActive = isActive === 'true';
            }

            const taskStatuses = await TaskStatus.find(searchQuery)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ order: 1 });

            const total = await TaskStatus.countDocuments(searchQuery);

            res.status(200).json({
                status: 200,
                message: 'Task statuses retrieved successfully',
                data: taskStatuses,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async getTaskStatusById(req, res) {
        try {
            const { id } = req.params;
            const taskStatus = await TaskStatus.findById(id);

            if (!taskStatus) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task status not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Task status retrieved successfully',
                data: taskStatus
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async updateTaskStatus(req, res) {
        try {
            const { id } = req.params;

            // Get the existing task status first
            const existingStatus = await TaskStatus.findById(id);
            if (!existingStatus) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task status not found'
                });
            }

            const { order } = req.body;
            
            if (order) {
                // Get the last order in the project
                const lastStatus = await TaskStatus.findOne({ project: existingStatus.project })
                    .sort({ order: -1 });
                const lastOrder = lastStatus ? lastStatus.order : 0;

                // If requested order is greater than last order, set it to next available order
                if (order > lastOrder) {
                    req.body.order = lastOrder + 1;
                } else {
                    // Update orders of existing statuses
                    await TaskStatus.updateMany(
                        { 
                            project: existingStatus.project,
                            order: { $gte: order },
                            _id: { $ne: id }
                        },
                        { $inc: { order: 1 } }
                    );
                }
            }

            const taskStatus = await TaskStatus.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );

            res.status(200).json({
                status: 200,
                message: 'Task status updated successfully',
                data: taskStatus
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async deleteTaskStatus(req, res) {
        try {
            const { id } = req.params;
            const taskStatus = await TaskStatus.findByIdAndDelete(id);

            if (!taskStatus) {
                return res.status(404).json({
                    status: 404,
                    message: 'Task status not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Task status deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new TaskStatusController();