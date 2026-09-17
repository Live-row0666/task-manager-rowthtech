const TimeTracking = require('../../models/timeTracking');
const { default: mongoose } = require('mongoose');

class AdminTimeTrackingController {

    async getUserTimeSummary(req, res) {
        try {
            const { userId, startDate, endDate, projectType } = req.query;
            const matchQuery = {};
            if (userId) matchQuery.user = new mongoose.Types.ObjectId(userId);
            if (startDate && endDate) {
                matchQuery.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }
            if (projectType && projectType.trim() !== '') matchQuery.projectType = projectType;

            const userSummary = await TimeTracking.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: {
                            user: '$user',
                            project: '$project',
                            task: '$task'
                        },
                        hoursPerTask: { $sum: { $divide: ['$duration', 60] } },
                        minutesPerTask: { $sum: { $mod: ['$duration', 60] } },
                        secondsPerTask: { $sum: { $mod: ['$duration', 60] } },
                        entries: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: {
                            user: '$_id.user',
                            project: '$_id.project'
                        },
                        hoursPerProject: { $sum: '$hoursPerTask' },
                        minutesPerProject: { $sum: '$minutesPerTask' },
                        secondsPerProject: { $sum: '$secondsPerTask' },
                        tasks: {
                            $push: {
                                task: '$_id.task',
                                hours: { $round: ['$hoursPerTask', 2] },
                                minutes: '$minutesPerTask',
                                seconds: '$secondsPerTask',
                                entries: '$entries'
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: '$_id.user',
                        totalHours: { $sum: '$hoursPerProject' },
                        totalMinutes: { $sum: '$minutesPerProject' },
                        totalSeconds: { $sum: '$secondsPerProject' },
                        projects: {
                            $push: {
                                project: '$_id.project',
                                hours: { $round: ['$hoursPerProject', 2] },
                                minutes: '$minutesPerProject',
                                seconds: '$secondsPerProject',
                                tasks: '$tasks'
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: '$userDetails' },
                {
                    $lookup: {
                        from: 'projects',
                        localField: 'projects.project',
                        foreignField: '_id',
                        as: 'projectDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'tasks',
                        localField: 'projects.tasks.task',
                        foreignField: '_id',
                        as: 'taskDetails'
                    }
                },
                {
                    $project: {
                        userName: '$userDetails.name',
                        designation: '$userDetails.designation',
                        totalHours: { $round: ['$totalHours', 2] },
                        totalMinutes: '$totalMinutes',
                        totalSeconds: '$totalSeconds',
                        projects: {
                            $map: {
                                input: '$projects',
                                as: 'proj',
                                in: {
                                    projectName: {
                                        $let: {
                                            vars: {
                                                project: {
                                                    $arrayElemAt: [
                                                        {
                                                            $filter: {
                                                                input: '$projectDetails',
                                                                cond: { $eq: ['$$this._id', '$$proj.project'] }
                                                            }
                                                        },
                                                        0
                                                    ]
                                                }
                                            },
                                            in: '$$project.name'
                                        }
                                    },
                                    hours: '$$proj.hours',
                                    minutes: '$$proj.minutes',
                                    seconds: '$$proj.seconds',
                                    tasks: {
                                        $map: {
                                            input: '$$proj.tasks',
                                            as: 'task',
                                            in: {
                                                taskSummary: {
                                                    $let: {
                                                        vars: {
                                                            task: {
                                                                $arrayElemAt: [
                                                                    {
                                                                        $filter: {
                                                                            input: '$taskDetails',
                                                                            cond: { $eq: ['$$this._id', '$$task.task'] }
                                                                        }
                                                                    },
                                                                    0
                                                                ]
                                                            }
                                                        },
                                                        in: '$$task.summary'
                                                    }
                                                },
                                                hours: '$$task.hours',
                                                minutes: '$$task.minutes',
                                                seconds: '$$task.seconds',
                                                entries: '$$task.entries'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]);

            res.status(200).json({
                status: 200,
                message: 'User time summary retrieved',
                data: userSummary
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving user time summary',
                error: error.message
            });
        }
    }

    async getallActivetask(req, res) {
        try {
            const { tasksIds } = req.body;
            const activetasks = await TimeTracking.find({ task: { $in: tasksIds }, isActive: true, isComplete: false })
                .populate('user', 'name email');
            res.status(200).json({
                status: 200,
                message: 'Active tasks retrieved',
                data: activetasks
            });

        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving active tasks',
                error: error.message
            })
        }
    }

}

module.exports = new AdminTimeTrackingController();