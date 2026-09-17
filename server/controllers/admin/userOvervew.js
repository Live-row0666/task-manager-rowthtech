const mongoose = require('mongoose');
const TimeTracking = require('../../models/timeTracking');

const getUserOverview = async (req, res) => {
    try {
        const { dateFrom, dateTo, employeeId, projectId, taskId, projectType } = req.query;
        console.log(dateFrom, dateTo, employeeId, projectId, taskId);
        if (!employeeId) {
            return res.status(400).json({
                status: 400,
                message: 'Employee ID is required'
            });
        }
        const matchQuery = {};

        if (dateFrom && dateTo) {
            matchQuery.startTime = { $gte: new Date(dateFrom), $lte: new Date(dateTo) };
        }

        if (employeeId) matchQuery.user = new mongoose.Types.ObjectId(employeeId);
        if (projectId) matchQuery.project = new mongoose.Types.ObjectId(projectId);
        if (taskId) matchQuery.task = new mongoose.Types.ObjectId(taskId);
        if (projectType && projectType.trim() !== '') matchQuery.projectType = projectType;

        const logs = await TimeTracking.aggregate([
            { $match: matchQuery },
            { $sort: { startTime: -1 } }, // Sort by startTime in descending order
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $lookup: {
                    from: 'tasks',
                    localField: 'task',
                    foreignField: '_id',
                    as: 'taskDetails'
                }
            },
            { $unwind: '$taskDetails' },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project',
                    foreignField: '_id',
                    as: 'projectDetails'
                }
            },
            { $unwind: '$projectDetails' },
            {
                $addFields: {
                    currentEndTime: {
                        $cond: {
                            if: { $eq: ["$isActive", true] },
                            then: "$$NOW",
                            else: "$endTime"
                        }
                    },
                    activePauseDuration: {
                        $cond: {
                            if: { $eq: ["$isPaused", true] },
                            then: {
                                $subtract: ["$$NOW", { $last: "$pausePeriods.startTime" }]
                            },
                            else: 0
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalPauseTime: {
                        $add: ["$totalPausedTime", "$activePauseDuration"]
                    }
                }
            },
            {
                $project: {
                    taskTitle: '$taskDetails.summary',
                    taskId:'$taskDetails._id',
                    estimatedHours: '$taskDetails.estimatedTime',
                    projectId: '$projectDetails._id',
                    startTime: { $toDate: '$startTime' },
                    endTime: { $toDate: '$currentEndTime' },
                    totalLoggedTime: {
                        $subtract: [
                            { $toDate: '$currentEndTime' },
                            { $add: [{ $toDate: '$startTime' }, '$totalPauseTime'] }
                        ]
                    },
                    breakTime: '$totalPauseTime',
                    taskStatus: '$taskDetails.status',
                    description: 1,
                    billable: 1,
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } }
                }
            },
            {
                $project: {
                    taskTitle: 1,
                    taskId:1,
                    estimatedHours: 1,
                    projectId: 1,
                    startTime: 1,
                    endTime: 1,
                    totalLoggedTimeHours: {
                        $round: [{ $divide: ['$totalLoggedTime', 3600000] }, 2]
                    },
                    breakTimeHours: {
                        $round: [{ $divide: ['$breakTime', 3600000] }, 2]
                    },
                    taskStatus: 1,
                    description: 1,
                    billable: 1,
                    date: 1
                }
            },
            {
                $group: {
                    _id: '$projectId',
                    tasks: { $push: '$$ROOT' },
                    lastTaskDate: { $max: '$startTime' },
                    totalProjectHours: { $sum: '$totalLoggedTimeHours' }
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'projectInfo'
                }
            },
            {
                $project: {
                    projectName: { $arrayElemAt: ['$projectInfo.name', 0] },
                    tasks: 1,
                    lastTaskDate: 1,
                    totalProjectHours: { $round: ['$totalProjectHours', 2] }
                }
            },
            { $sort: { lastTaskDate: -1 } } // Sort projects by most recent task
        ]);

        console.dir(logs, "logs");

        res.status(200).json({
            status: 200,
            message: 'Employee daily logs retrieved successfully',
            projects: logs
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: 500,
            message: 'Error retrieving employee daily logs',
            error: error.message
        });
    }
};

module.exports = {
    getUserOverview
};
