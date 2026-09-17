const Task = require('../../models/task');
const Project = require('../../models/project');
const User = require('../../models/user');
const TimeTracking = require('../../models/timeTracking');
const project = require('../../models/project');

class DashboardController {
    async getOverview(req, res) {
        try {
            const { projectType, userType } = req.query;
            const [
                totalProjects,
                activeProjects,
                totalTasks,
                completedTasks,
                totalUsers,
                activeUsers
            ] = await Promise.all([
                Project.countDocuments(projectType ? { projectType } : {}),
                Project.countDocuments({ projectStatus: { $nin: ['Delivered', 'Hold'] }, isActive: true, projectType: projectType }),
                Task.countDocuments({ projectType: projectType }),
                Task.countDocuments({ status: 'Done', projectType: projectType ? projectType : {} }),
                User.countDocuments(userType ? { userType } : {}),
                User.countDocuments(userType ? { userType, isActive: true } : { isActive: true })
            ]);

            const tasksByStatus = await Task.aggregate([
                { $match: projectType ? { projectType } : {} }, // Added projectType filter
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]);

            const projectsByStatus = await Project.aggregate([
                { $match: projectType ? { projectType } : {} }, // Added projectType filter
                { $group: { _id: '$projectStatus', count: { $sum: 1 } } }
            ]);

            res.status(200).json({
                status: 200,
                message: 'Dashboard overview retrieved',
                data: {
                    overview: {
                        totalProjects,
                        activeProjects,
                        totalTasks,
                        completedTasks,
                        totalUsers: totalUsers,
                        activeUsers: activeUsers // Exclude admin and system users
                    },
                    tasksByStatus,
                    projectsByStatus
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving dashboard data',
                error: error.message
            });
        }
    }

    async getProductivityReport(req, res) {
        try {
            const { startDate, endDate, userId, projectType } = req.query;
            const dateFilter = {};

            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const matchFilter = { ...dateFilter };
            if (userId) matchFilter.user = userId;
            if (projectType) matchFilter.projectType = projectType;

            const timeReport = await TimeTracking.aggregate([
                { $match: matchFilter },
                {
                    $group: {
                        _id: '$user',
                        totalHours: { $sum: { $divide: ['$duration', 60] } },
                        totalEntries: { $sum: 1 },
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },  
                {
                    $project: {
                        userId: '$user._id',
                        userName: '$user.name',
                        userEmail: '$user.email',
                        totalHours: { $round: ['$totalHours', 2] },
                        totalEntries: 1
                    }
                },
                { $sort: { totalHours: -1 } }
            ]);

            res.status(200).json({
                status: 200,
                message: 'Productivity report retrieved',
                data: timeReport
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving productivity report',
                error: error.message
            });
        }
    }

    async getProjectProgress(req, res) {
        try {
            const { projectType } = req.query;
            let matchFilter = {};
            if (projectType) matchFilter.projectType = projectType;
            const projectProgress = await Project.aggregate([
                {
                    $match: matchFilter
                },
                {
                    $lookup: {
                        from: 'tasks',
                        localField: '_id',
                        foreignField: 'project',
                        as: 'tasks'
                    }
                },
                {
                    $project: {
                        name: 1,
                        projectStatus: 1,
                        projectType: 1,
                        totalTasks: { $size: '$tasks' },
                        completedTasks: {
                            $size: {
                                $filter: {
                                    input: '$tasks',
                                    cond: { $eq: ['$$this.status', 'Done'] }
                                }
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        progress: {
                            $cond: [
                                { $eq: ['$totalTasks', 0] },
                                0,
                                { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }
                            ]
                        }
                    }
                }
            ]);

            res.status(200).json({
                status: 200,
                message: 'Project progress retrieved',
                data: projectProgress
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving project progress',
                error: error.message
            });
        }
    }
}

module.exports = new DashboardController();