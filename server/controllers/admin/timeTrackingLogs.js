const TimeTracking = require('../../models/timeTracking');
const TimeTrackingMonitor = require('../../utils/timeTrackingMonitor');
const Task = require('../../models/task');
class TimeTrackingController {
    async startTimer(req, res) {
        try {
            const { taskId, projectId, description, projectType } = req.body;

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
                projectType
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
                _id: req.body.id
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
            // const timeSpentMilliseconds = totalDurationMinutes * 60 * 1000;

            activeTimer.endTime = endTime;
            activeTimer.duration = totalDurationMinutes;
            activeTimer.isActive = false;
            activeTimer.isPaused = false;
            activeTimer.isComplete = true;
            await activeTimer.save();

            // await Task.findByIdAndUpdate(
            //     activeTimer.task,
            //     {
            //         status: 'Testing',
            //         qastatus: 'To Do',
            //         timeSpent: timeSpentMilliseconds
            //     },
            //     { new: true }
            // );

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
            const activeTimer = await TimeTracking.findOne({ _id: req.query.id });

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
            const activeTimer = await TimeTracking.findOne({ _id: req.query.id });

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
}



module.exports = new TimeTrackingController();
