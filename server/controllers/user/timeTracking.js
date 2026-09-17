const TimeTracking = require('../../models/timeTracking');
const TimeTrackingMonitor = require('../../utils/timeTrackingMonitor');
const Task = require('../../models/task');

class TimeTrackingController {
    async startTimer(req, res) {
        try {
            const { taskId, projectId, description } = req.body;

            // Stop any active timer for this user
            await TimeTracking.updateMany(
                { user: req.user._id, isActive: true },
                { isActive: false }
            );

            const timeEntry = await TimeTracking.create({
                user: req.user._id,
                task: taskId,
                project: projectId,
                startTime: new Date(),
                description,
                isActive: true,
                isPaused: false,
                pausePeriods: [],
                totalPausedTime: 0,
                projectType: "Tech"
            });

            res.status(201).json({
                status: 201,
                message: 'Timer started',
                data: timeEntry
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error starting timer',
                error: error.message
            });
        }
    }

    async stopTimer(req, res) {
        try {
            const activeTimer = await TimeTracking.findOne({
                task: req.body.taskId,
            });

            if (!activeTimer) {
                return res.status(404).json({
                    status: 404,
                    message: 'No active timer found'
                });
            }

            const endTime = new Date();

            // Calculate total duration accounting for paused time in minutes
            const totalDurationMinutes = Math.round(
                (endTime - activeTimer.startTime - activeTimer.totalPausedTime) / (1000 * 60)
            );

            // Convert minutes to milliseconds for task timeSpent
            const timeSpentMilliseconds = totalDurationMinutes * 60 * 1000;

            activeTimer.endTime = endTime;
            activeTimer.duration = totalDurationMinutes;
            activeTimer.isActive = false;
            activeTimer.isPaused = false;
            activeTimer.isComplete = true;
            await activeTimer.save();

            // const test = await Task.findByIdAndUpdate(
            //     activeTimer.task,
            //     {
            //         status: 'Testing',
            //         qastatus: 'To Do',
            //         timeSpent: timeSpentMilliseconds
            //     },
            //     { new: true }
            // );

            // console.log("yes its hitting here 2",test)

            // Clean up notification tracking
            await TimeTrackingMonitor.cleanupNotifiedSession(
                activeTimer.user,
                activeTimer.task,
                activeTimer.startTime
            );

            res.status(200).json({
                status: 200,
                message: 'Timer stopped successfully',
                data: activeTimer
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error stopping timer',
                error: error.message
            });
        }
    }
    async pauseTimer(req, res) {
        try {
            const activeTimer = await TimeTracking.findOne({ task: req.query.task });
            console.log(req.query.task, "task")

            if (!activeTimer) {
                return res.status(404).json({
                    status: 404,
                    message: 'No active timer found or timer already paused'
                });
            }

            activeTimer.isPaused = true;
            activeTimer.pausePeriods.push({
                startTime: new Date()
            });
            await activeTimer.save();

            res.status(200).json({
                status: 200,
                message: 'Timer paused',
                data: activeTimer
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error pausing timer',
                error: error.message
            });
        }
    }

    async resumeTimer(req, res) {
        try {
            const activeTimer = await TimeTracking.findOne({ task: req.query.task });

            if (!activeTimer || !activeTimer.isPaused || !activeTimer.pausePeriods.length) {
                return res.status(404).json({
                    status: 404,
                    message: 'No paused timer found'
                });
            }

            const lastPausePeriod = activeTimer.pausePeriods[activeTimer.pausePeriods.length - 1];
            if (!lastPausePeriod) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid pause period'
                });
            }

            lastPausePeriod.endTime = new Date();

            // Calculate and add pause duration to total
            const pauseDuration = lastPausePeriod.endTime - lastPausePeriod.startTime;
            activeTimer.totalPausedTime += pauseDuration;

            activeTimer.isPaused = false;
            activeTimer.isActive = true;
            await activeTimer.save();

            res.status(200).json({
                status: 200,
                message: 'Timer resumed',
                data: activeTimer
            });
        } catch (error) {
            console.log(error)
            res.status(500).json({
                status: 500,
                message: 'Error resuming timer',
                error: error.message
            });
        }
    }

    async getTimeEntries(req, res) {
        try {
            const { page = 1, limit = 10, startDate, endDate } = req.query;
            const query = { user: req.user._id };

            if (startDate && endDate) {
                query.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const timeEntries = await TimeTracking.find(query)
                .populate({
                    path: 'task',
                    model: 'Task',
                    select: 'summary'
                })
                .populate('project', 'name')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await TimeTracking.countDocuments(query);

            res.status(200).json({
                status: 200,
                message: 'Time entries retrieved',
                data: timeEntries,
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
                message: 'Error retrieving time entries',
                error: error.message
            });
        }
    }

    async getTimeEntry(req, res) {
        try {
            const { id } = req.params;
            const timeEntry = await TimeTracking.find({
                user: id,
                isComplete: false
            })
                .populate({
                    path: 'task',
                    model: 'Task',
                    select: 'summary'
                })
                .populate('project', 'name');
            if (!timeEntry) {
                return res.status(404).json({
                    status: 404,
                    message: 'Time entry not found'
                });
            }

            res.status(200).json({
                status: 200,
                message: 'Time entry retrieved',
                data: timeEntry
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving time entry',
                error: error.message
            });
        }
    }

    async getTimeSummary(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const matchQuery = { user: req.user._id, endTime: { $exists: true } };

            if (startDate && endDate) {
                matchQuery.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const summary = await TimeTracking.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalHours: { $sum: { $divide: ['$duration', 60] } },
                        totalEntries: { $sum: 1 },
                        billableHours: {
                            $sum: {
                                $cond: [{ $eq: ['$billable', true] }, { $divide: ['$duration', 60] }, 0]
                            }
                        },
                        nonBillableHours: {
                            $sum: {
                                $cond: [{ $eq: ['$billable', false] }, { $divide: ['$duration', 60] }, 0]
                            }
                        }
                    }
                }
            ]);

            const projectSummary = await TimeTracking.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$project',
                        totalHours: { $sum: { $divide: ['$duration', 60] } },
                        entries: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'project'
                    }
                },
                { $unwind: '$project' },
                {
                    $project: {
                        projectName: '$project.name',
                        totalHours: { $round: ['$totalHours', 2] },
                        entries: 1
                    }
                }
            ]);

            res.status(200).json({
                status: 200,
                message: 'Time summary retrieved',
                data: {
                    overall: summary[0] || { totalHours: 0, totalEntries: 0, billableHours: 0, nonBillableHours: 0 },
                    projectBreakdown: projectSummary
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving time summary',
                error: error.message
            });
        }
    }

    async getProjectTimeReport(req, res) {
        try {
            const { projectId } = req.params;
            const { startDate, endDate } = req.query;
            const matchQuery = { user: req.user._id, project: projectId, endTime: { $exists: true } };

            if (startDate && endDate) {
                matchQuery.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const projectReport = await TimeTracking.aggregate([
                { $match: matchQuery },
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
                    $group: {
                        _id: '$task',
                        taskSummary: { $first: '$taskDetails.summary' },
                        totalHours: { $sum: { $divide: ['$duration', 60] } },
                        entries: { $sum: 1 },
                        lastWorked: { $max: '$endTime' }
                    }
                },
                {
                    $project: {
                        taskSummary: 1,
                        totalHours: { $round: ['$totalHours', 2] },
                        entries: 1,
                        lastWorked: 1
                    }
                },
                { $sort: { totalHours: -1 } }
            ]);

            const totalProjectHours = await TimeTracking.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalHours: { $sum: { $divide: ['$duration', 60] } }
                    }
                }
            ]);

            res.status(200).json({
                status: 200,
                message: 'Project time report retrieved',
                data: {
                    totalProjectHours: totalProjectHours[0]?.totalHours || 0,
                    taskBreakdown: projectReport
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving project time report',
                error: error.message
            });
        }
    }

    async getDailyTimeReport(req, res) {
        try {
            const { date = new Date().toISOString().split('T')[0] } = req.query;
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const dailyReport = await TimeTracking.find({
                user: req.user._id,
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                endTime: { $exists: true }
            })
                .populate('task', 'summary')
                .populate('project', 'name')
                .sort({ startTime: 1 });

            const totalHours = dailyReport.reduce((sum, entry) => sum + (entry.duration / 60), 0);

            res.status(200).json({
                status: 200,
                message: 'Daily time report retrieved',
                data: {
                    date,
                    totalHours: Math.round(totalHours * 100) / 100,
                    entries: dailyReport
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving daily time report',
                error: error.message
            });
        }
    }

    async getWeeklyTimeReport(req, res) {
        try {
            const { weekStart } = req.query;
            const startDate = weekStart ? new Date(weekStart) : new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay());
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);

            const weeklyReport = await TimeTracking.aggregate([
                {
                    $match: {
                        user: req.user._id,
                        createdAt: { $gte: startDate, $lte: endDate },
                        endTime: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: {
                            day: { $dayOfWeek: '$createdAt' },
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        totalHours: { $sum: { $divide: ['$duration', 60] } },
                        entries: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        date: '$_id.date',
                        totalHours: { $round: ['$totalHours', 2] },
                        entries: 1
                    }
                },
                { $sort: { '_id.day': 1 } }
            ]);

            const totalWeekHours = weeklyReport.reduce((sum, day) => sum + day.totalHours, 0);

            res.status(200).json({
                status: 200,
                message: 'Weekly time report retrieved',
                data: {
                    weekStart: startDate.toISOString().split('T')[0],
                    weekEnd: endDate.toISOString().split('T')[0],
                    totalWeekHours: Math.round(totalWeekHours * 100) / 100,
                    dailyBreakdown: weeklyReport
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving weekly time report',
                error: error.message
            });
        }
    }

    async getMonthlyTimeReport(req, res) {
        try {
            const { month, year } = req.query;
            const currentDate = new Date();
            const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
            const targetYear = year ? parseInt(year) : currentDate.getFullYear();

            const startDate = new Date(targetYear, targetMonth, 1);
            const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

            const monthlyReport = await TimeTracking.aggregate([
                {
                    $match: {
                        user: req.user._id,
                        createdAt: { $gte: startDate, $lte: endDate },
                        endTime: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: {
                            week: { $week: '$createdAt' },
                            project: '$project'
                        },
                        totalHours: { $sum: { $divide: ['$duration', 60] } },
                        entries: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id.project',
                        foreignField: '_id',
                        as: 'project'
                    }
                },
                { $unwind: '$project' },
                {
                    $group: {
                        _id: '$_id.project',
                        projectName: { $first: '$project.name' },
                        totalHours: { $sum: '$totalHours' },
                        entries: { $sum: '$entries' }
                    }
                },
                {
                    $project: {
                        projectName: 1,
                        totalHours: { $round: ['$totalHours', 2] },
                        entries: 1
                    }
                },
                { $sort: { totalHours: -1 } }
            ]);

            const totalMonthHours = monthlyReport.reduce((sum, project) => sum + project.totalHours, 0);

            res.status(200).json({
                status: 200,
                message: 'Monthly time report retrieved',
                data: {
                    month: targetMonth + 1,
                    year: targetYear,
                    totalMonthHours: Math.round(totalMonthHours * 100) / 100,
                    projectBreakdown: monthlyReport
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving monthly time report',
                error: error.message
            });
        }
    }

    async getProjectWiseSummary(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const matchQuery = { user: req.user._id, endTime: { $exists: true } };

            if (startDate && endDate) {
                matchQuery.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            const projectSummary = await TimeTracking.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$project',
                        totalHours: { $sum: { $divide: ['$duration', 60] } },
                        totalEntries: { $sum: 1 },
                        billableHours: {
                            $sum: {
                                $cond: [{ $eq: ['$billable', true] }, { $divide: ['$duration', 60] }, 0]
                            }
                        },
                        lastWorked: { $max: '$endTime' },
                        avgSessionDuration: { $avg: { $divide: ['$duration', 60] } }
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'project'
                    }
                },
                { $unwind: '$project' },
                {
                    $project: {
                        projectName: '$project.name',
                        projectStatus: '$project.projectStatus',
                        totalHours: { $round: ['$totalHours', 2] },
                        billableHours: { $round: ['$billableHours', 2] },
                        totalEntries: 1,
                        lastWorked: 1,
                        avgSessionDuration: { $round: ['$avgSessionDuration', 2] },
                        progressPercentage: {
                            $round: [
                                {
                                    $multiply: [
                                        { $divide: ['$totalHours', { $add: ['$totalHours', 1] }] },
                                        100
                                    ]
                                },
                                1
                            ]
                        }
                    }
                },
                { $sort: { totalHours: -1 } }
            ]);

            res.status(200).json({
                status: 200,
                message: 'Project-wise summary retrieved',
                data: projectSummary
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error retrieving project-wise summary',
                error: error.message
            });
        }
    }

    async getUserTimeSummary(req, res) {
        try {
            const { userId, startDate, endDate } = req.query;
            const matchQuery = {};
            if (userId) matchQuery.user = new mongoose.Types.ObjectId(userId);
            if (startDate && endDate) {
                matchQuery.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

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
}



module.exports = new TimeTrackingController();
