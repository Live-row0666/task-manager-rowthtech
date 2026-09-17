const Meeting = require('../../models/meeting');
const Project = require('../../models/project');
const Client = require('../../models/client');

// Create meeting
const createMeeting = async (req, res) => {
    try {
        const meetingData = {
            ...req.body,
            createdBy: req.user._id
        };

        // Convert dates to proper format
        meetingData.startDateTime = new Date(meetingData.startDateTime);
        meetingData.endDateTime = new Date(meetingData.endDateTime);

        // Check for time conflicts
        const conflictingMeeting = await Meeting.findOne({
            isActive: true,
            status: { $ne: 'cancelled' },
            $or: [
                {
                    startDateTime: { $lt: meetingData.endDateTime },
                    endDateTime: { $gt: meetingData.startDateTime }
                }
            ]
        }).populate('project', 'name').populate('client', 'name');

        if (conflictingMeeting) {
            const conflictTime = new Date(conflictingMeeting.startDateTime).toLocaleString();
            return res.status(400).json({
                success: false,
                message: `There is already a meeting scheduled at ${conflictTime} with ${conflictingMeeting.client.name} regarding ${conflictingMeeting.project.name}`
            });
        }

        // Handle recurring meetings
        if (meetingData.meetingType === 'recurring' && meetingData.recurrence) {
            const meetings = [];
            const { frequency, interval, endDate } = meetingData.recurrence;
            const startDate = new Date(meetingData.startDateTime);
            const meetingEndDate = new Date(meetingData.endDateTime);
            const recurrenceEndDate = new Date(endDate);
            const duration = meetingEndDate.getTime() - startDate.getTime();

            let currentDate = new Date(startDate);
            let instanceCount = 0;
            const maxInstances = 100; // Prevent infinite loops

            while (currentDate <= recurrenceEndDate && instanceCount < maxInstances) {
                const meetingInstance = {
                    ...meetingData,
                    startDateTime: new Date(currentDate),
                    endDateTime: new Date(currentDate.getTime() + duration),
                    parentMeeting: instanceCount === 0 ? null : meetings[0]._id
                };

                const meeting = new Meeting(meetingInstance);
                await meeting.save();
                meetings.push(meeting);

                // Calculate next occurrence
                if (frequency === 'daily') {
                    currentDate.setDate(currentDate.getDate() + interval);
                } else if (frequency === 'weekly') {
                    currentDate.setDate(currentDate.getDate() + (7 * interval));
                } else if (frequency === 'monthly') {
                    currentDate.setMonth(currentDate.getMonth() + interval);
                }

                instanceCount++;
            }

            // Update project's meetings array with all instances
            await Project.findByIdAndUpdate(
                meetingData.project,
                { $push: { meetings: { $each: meetings.map(m => m._id) } } }
            );

            await meetings[0].populate(['project', 'client', 'attendees.user', 'createdBy']);

            res.status(201).json({
                success: true,
                message: `${meetings.length} recurring meetings created successfully`,
                data: meetings[0],
                totalInstances: meetings.length
            });
        } else {
            // Handle single meeting
            const meeting = new Meeting(meetingData);
            await meeting.save();

            // Update project's meetings array
            await Project.findByIdAndUpdate(
                meetingData.project,
                { $push: { meetings: meeting._id } }
            );

            await meeting.populate(['project', 'client', 'attendees.user', 'createdBy']);

            res.status(201).json({
                success: true,
                message: 'Meeting created successfully',
                data: meeting
            });
        }
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all meetings
const getMeetings = async (req, res) => {
    try {
        const { page = 1, limit = 20, project, client, status, startDate, endDate, projectType } = req.query;
        const filter = { isActive: true };
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (project) filter.project = project;
        if (client) filter.client = client;
        if (status) filter.status = status;
        if (projectType) filter.projectType = projectType;

        // Handle date filtering
        if (startDate || endDate) {
            filter.startDateTime = {};
            if (startDate) {
                filter.startDateTime.$gte = new Date(startDate);
            }
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.startDateTime.$lte = endOfDay;
            }
        }

        const meetings = await Meeting.find(filter)
            .populate('project', 'name')
            .populate('client', 'name companyName')
            .populate('attendees.user', 'name email')
            .populate('createdBy', 'name')
            .sort({ startDateTime: 1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);
        const total = await Meeting.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: meetings,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalItems: total,
                itemsPerPage: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get meeting by ID
const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('project')
            .populate('client')
            .populate('attendees.user')
            .populate('createdBy');

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.json({
            success: true,
            data: meeting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update meeting
const updateMeeting = async (req, res) => {
    try {
        // Check for time conflicts (excluding current meeting)
        if (req.body.startDateTime || req.body.endDateTime) {
            const currentMeeting = await Meeting.findById(req.params.id);
            const startDateTime = req.body.startDateTime || currentMeeting.startDateTime;
            const endDateTime = req.body.endDateTime || currentMeeting.endDateTime;

            const conflictingMeeting = await Meeting.findOne({
                _id: { $ne: req.params.id },
                isActive: true,
                status: { $ne: 'cancelled' },
                $or: [
                    {
                        startDateTime: { $lt: new Date(endDateTime) },
                        endDateTime: { $gt: new Date(startDateTime) }
                    }
                ]
            }).populate('project', 'name').populate('client', 'name');

            // Convert dates if they are being updated
            if (req.body.startDateTime) req.body.startDateTime = new Date(req.body.startDateTime);
            if (req.body.endDateTime) req.body.endDateTime = new Date(req.body.endDateTime);

            if (conflictingMeeting) {
                const conflictTime = new Date(conflictingMeeting.startDateTime).toLocaleString();
                return res.status(400).json({
                    success: false,
                    message: `There is already a meeting scheduled at ${conflictTime} with ${conflictingMeeting.client.name} regarding ${conflictingMeeting.project.name}`
                });
            }
        }

        const meeting = await Meeting.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate(['project', 'client', 'attendees.user', 'createdBy']);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.json({
            success: true,
            message: 'Meeting updated successfully',
            data: meeting
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete meeting
const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // If it's a recurring meeting, ask user what to delete
        if (meeting.meetingType === 'recurring') {
            const { deleteType = 'single' } = req.body; // 'single', 'future', 'all'

            if (deleteType === 'all') {
                // Delete all instances of this recurring meeting
                const parentId = meeting.parentMeeting || meeting._id;
                await Meeting.updateMany(
                    { $or: [{ _id: parentId }, { parentMeeting: parentId }] },
                    { isActive: false }
                );
            } else if (deleteType === 'future') {
                // Delete this and all future instances
                await Meeting.updateMany(
                    {
                        $or: [{ _id: meeting._id }, { parentMeeting: meeting.parentMeeting || meeting._id }],
                        startDateTime: { $gte: meeting.startDateTime }
                    },
                    { isActive: false }
                );
            } else {
                // Delete only this instance
                await Meeting.findByIdAndUpdate(req.params.id, { isActive: false });
            }
        } else {
            // Delete single meeting
            await Meeting.findByIdAndUpdate(req.params.id, { isActive: false });
        }

        res.json({
            success: true,
            message: 'Meeting deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get meetings by project
const getMeetingsByProject = async (req, res) => {
    try {
        const meetings = await Meeting.find({
            project: req.params.projectId,
            isActive: true
        })
            .populate('client', 'name companyName')
            .populate('attendees.user', 'name')
            .sort({ startDateTime: 1 });

        res.json({
            success: true,
            data: meetings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createMeeting,
    getMeetings,
    getMeetingById,
    updateMeeting,
    deleteMeeting,
    getMeetingsByProject
};