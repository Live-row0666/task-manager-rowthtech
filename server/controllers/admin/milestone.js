const Milestone = require('../../models/milestones');
const Task = require('../../models/task');
const Project = require('../../models/project');
const TimeTracking = require('../../models/timeTracking');

// Helper function to update project end date if milestone completion date is later
const updateProjectEndDate = async (projectId, milestoneCompletionDate) => {
    try {
        const project = await Project.findById(projectId);
        if (project && (!project.end || new Date(milestoneCompletionDate) > new Date(project.end))) {
            await Project.findByIdAndUpdate(projectId, { end: milestoneCompletionDate });
        }
    } catch (error) {
        console.log('Error updating project end date:', error);
    }
};

class MilestoneController {
    // Create milestone
    /** @ Post : api/v1/admin/milestone/ */
    async createMilestone(req, res) {
        try {
            let data = req.body;
            data.createdBy = req.user._id;
            if (!data.title || !data.startDate) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project, title, start date and completion date are required'
                });
            }

            const milestone = await Milestone.create(data);

            // Update project end date if milestone completion date is later
            if (data.project && data.completionDate) {
                await updateProjectEndDate(data.project, data.completionDate);
            }

            return res.status(201).json({
                status: 201,
                message: 'Milestone created successfully',
                data: milestone
            });
        } catch (error) {
            console.log('Error creating milestone:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update milestone
    /** @ Put : api/v1/admin/milestone/:id */
    async updateMilestone(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            if (data.isActive === false || data.isActive === 'false') {
                await Task.updateMany({ milestone: id }, { $set: { isActive: false } });
            } else {
                await Task.updateMany({ milestone: id }, { $set: { isActive: true } });
            }
            const milestone = await Milestone.findByIdAndUpdate(id, data, { new: true });
            if (!milestone) {
                return res.status(404).json({
                    status: 404,
                    message: 'Milestone not found'
                });
            }

            // Update project end date if milestone completion date is later
            if (milestone.project && (data.completionDate || milestone.completionDate)) {
                const completionDate = data.completionDate || milestone.completionDate;
                await updateProjectEndDate(milestone.project, completionDate);
            }

            return res.status(200).json({
                status: 200,
                message: 'Milestone updated successfully',
                data: milestone
            });
        } catch (error) {
            console.log('Error updating milestone:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all milestones
    /** @ Get : api/v1/admin/milestone */
    async getAllMilestones(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                isActive,
                priority,
                project,
                assignedTo,
                isDelivered
            } = req.query;

            if (!project) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project ID is required to fetch milestones'
                });
            }

            // Get project details
            const projectDetails = await Project.findById(project).lean();
            // Build search query
            const searchQuery = {
                project,
                ...(search && {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }),
                ...(priority && { priority }),
                ...(assignedTo && { assignedTo: { $in: [assignedTo] } }),
                ...(isActive !== undefined && isActive !== '' && { isActive: isActive === 'true' }),
            };

            if (projectDetails.projectStatus.trim() === 'Support') {
                // Get milestones with pagination
                const milestones = await Milestone.find(searchQuery)
                    .populate('project', 'name amcHours')
                    .populate('assignedTo', 'name')
                    .populate('dependencies', 'title status')
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .sort({ startDate: 1 })
                    .lean();

                let milestonesWithHours;
                // Get tasks for these milestones
                const milestoneIds = milestones.map(milestone => milestone._id);
                const tasks = await Task.find({ milestone: { $in: milestoneIds } })
                    .select('_id milestone')
                    .lean();

                // Create task-milestone mapping
                const taskMilestoneMap = tasks.reduce((map, task) => {
                    map[task._id.toString()] = task.milestone.toString();
                    return map;
                }, {});

                let remainingAmcHours = projectDetails.amcHours || 0;

                // Calculate hours for each milestone
                let amcHoursAre = projectDetails.amcHours || 0;
                milestonesWithHours = [];
                for (const milestone of milestones) {
                    const timeTrackingData = await TimeTracking.aggregate([
                        {
                            $match: {
                                task: {
                                    $in: tasks
                                        .filter(task => taskMilestoneMap[task._id.toString()] === milestone._id.toString())
                                        .map(task => task._id)
                                },
                                isComplete: true
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalDuration: { $sum: '$duration' }
                            }
                        }
                    ]);

                    const totalDurationMinutes = timeTrackingData[0]?.totalDuration || 0;
                    const workedHoursByTeam = ((totalDurationMinutes / 60) * 100 / 100).toFixed(2);

                    const remainingAmcHours = (amcHoursAre - milestone.workedHours).toFixed(2);
                    amcHoursAre = remainingAmcHours;

                    milestonesWithHours.push({
                        ...milestone,
                        workedHoursByTeam: Number(workedHoursByTeam),
                        amcHours: Number((Number(amcHoursAre) + milestone.workedHours).toFixed(2)),
                        remainingHours: Number(remainingAmcHours),
                    });
                }
                // Separate delivered and non-delivered milestones
                const deliveredMilestones = milestonesWithHours.filter(m => m.isDelivered);
                const nonDeliveredMilestones = milestonesWithHours.filter(m => !m.isDelivered);

                // milestonesWithHours = [...nonDeliveredMilestones, ...deliveredMilestones];
                if (isDelivered === 'true') {
                    milestonesWithHours = deliveredMilestones;
                } else {
                    milestonesWithHours = nonDeliveredMilestones;
                }
                const count = await Milestone.countDocuments(searchQuery);

                return res.status(200).json({
                    status: 200,
                    message: 'Milestones retrieved successfully',
                    data: milestonesWithHours,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    totalMilestones: count
                });

            } else {
                searchQuery.isDelivered = isDelivered === 'true' ? true : false;
                const milestones = await Milestone.find(searchQuery)
                    .populate('project', 'name amcHours')
                    .populate('assignedTo', 'name')
                    .populate('dependencies', 'title status')
                    .limit(limit * 1)
                    .skip((page - 1) * limit)
                    .sort({ startDate: 1 })
                    .lean();
                const count = await Milestone.countDocuments(searchQuery);
                return res.status(200).json({
                    status: 200,
                    message: 'Milestones retrieved successfully',
                    data: milestones,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    totalMilestones: count
                });
            }

        } catch (error) {
            console.log('Error fetching milestones:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get single milestone
    /** @ Get : api/v1/admin/milestone/:id */
    async getSingleMilestone(req, res) {
        try {
            const { id } = req.params;
            const milestone = await Milestone.findById(id)
                .populate('project', 'name description client')
                .populate('assignedTo', 'name email designation role')
                .populate('dependencies', 'title status progress')
                .lean();

            if (!milestone) {
                return res.status(404).json({
                    status: 404,
                    message: 'Milestone not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Milestone retrieved successfully',
                data: milestone
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete milestone
    /** @ Delete : api/v1/admin/milestone/:id */
    async deleteMilestone(req, res) {
        try {
            const { id } = req.params;
            const milestone = await Milestone.findByIdAndDelete(id);

            if (!milestone) {
                return res.status(404).json({
                    status: 404,
                    message: 'Milestone not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Milestone deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get milestones by project
    /** @ Get : api/v1/admin/milestone/project/:projectId */
    async getMilestonesByProject(req, res) {
        try {
            const { projectId } = req.params;
            const { status, priority } = req.query;

            let query = { project: projectId, isActive: true };
            if (status) query.status = status;
            if (priority) query.priority = priority;

            const milestones = await Milestone.find(query)
                .populate('assignedTo', 'name email')
                .populate('dependencies', 'title status')
                .sort({ startDate: 1 })
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Project milestones retrieved successfully',
                data: milestones,
                count: milestones.length
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    async renewAmcMilestones(req, res) {
        try {
            const data = req.body;
            if (!data.project || !data.amcStartDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Project and AMC start date are required'
                });
            }

            const projectHoursData = await Project.findById(data.project).lean();

            // Validate date format
            const startDate = new Date(data.amcStartDate);
            if (isNaN(startDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid AMC start date format. Please provide date in YYYY-MM-DD format'
                });
            }

            // Get existing AMC milestones for this project
            const existingMilestones = await Milestone.find({
                project: data.project,
                title: { $regex: /AMC$/ }
            });

            const months = data.amcType.type === 'Monthly' ? data.amcType.value : data.amcType.value * 12;
            // const hoursPerMonth = data.amcHours / months;

            let lastEndDate;
            // let totalHours = existingMilestones.reduce((sum, milestone) => sum + parseFloat(milestone.amcHours || 0), 0);
            const totalMonths = existingMilestones.length + months;

            for (let i = 0; i < months; i++) {
                const milestoneStartDate = new Date(startDate);
                milestoneStartDate.setMonth(startDate.getMonth() + i);

                const milestoneEndDate = new Date(milestoneStartDate);
                milestoneEndDate.setMonth(milestoneStartDate.getMonth() + 1);
                milestoneEndDate.setDate(milestoneEndDate.getDate() - 1);

                // Validate milestone dates
                if (isNaN(milestoneStartDate.getTime()) || isNaN(milestoneEndDate.getTime())) {
                    throw new Error('Invalid milestone date calculation');
                }

                lastEndDate = milestoneEndDate;
                // totalHours += parseFloat(hoursPerMonth);

                await Milestone.create({
                    project: data.project,
                    title: milestoneStartDate.toLocaleString('default', { month: 'long' }) + ' AMC',
                    description: 'This is the default AMC milestone created for this month using automation process. Change the details as per your requirement once the AMC starts.',
                    startDate: milestoneStartDate,
                    completionDate: milestoneEndDate,
                    status: 'In Progress',
                    priority: 'Medium',
                    isActive: true,
                    createdBy: req.user._id,
                    // amcHours: hoursPerMonth.toFixed(2)
                });
            }

            // Update project with combined existing + new AMC details
            await Project.findByIdAndUpdate(data.project, {
                end: lastEndDate,
                amcEndDate: lastEndDate,
                amcHours: Number(projectHoursData.amcHours) + Number(data.amcHours), 
                amcType: {
                    type: 'Monthly',
                    value: totalMonths
                }
            });

            const milestonesData = await Milestone.find({ project: data.project }).sort({ startDate: -1 });

            return res.status(200).json({
                success: true,
                message: 'AMC milestones renewed successfully',
                data: milestonesData
            });

        } catch (error) {
            console.log('Error renewing AMC milestones:', error);
            return res.status(500).json({
                success: false,
                message: 'Error renewing AMC milestones',
                error: error.message
            });
        }
    }
}

module.exports = new MilestoneController();