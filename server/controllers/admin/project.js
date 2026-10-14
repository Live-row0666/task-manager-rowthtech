const Project = require('../../models/project');
const CommentMention = require('../../models/commentMention');
const NotificationService = require('../../utils/notificationService');
const TaskStatus = require('../../models/taskStatus');
const Milestone = require('../../models/milestones');
const TimeTracking = require('../../models/timeTracking');
const mongoose = require('mongoose');
class ProjectController {
    // Create project
    /** @ Post : api/v1/admin/project/ */
    async createProject(req, res) {
        try {
            let data = req.body;
            data.createdBy = req.user._id;

            if (req.user.role?.name === 'Project Manager') {
                data.team = data.team || [];
                const managerId = req.user._id.toString();
                if (!data.team.some((memberId) => memberId.toString() === managerId)) {
                    data.team.push(req.user._id);
                }
                if (!data.projectType) {
                    data.projectType = 'Tech';
                }
            }

            if (!data.name) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project name is required'
                });
            }

            // Check if project with same name exists
            const existingProject = await Project.findOne({ name: { $regex: new RegExp('^' + data.name.trim() + '$', 'i') } });

            if (existingProject) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project with this name already exists'
                });
            }

            if (data.projectStatus === 'Support') {
                if (!data.amcType || !data.amcStartDate || !data.amcHours) {
                    return res.status(400).json({
                        status: 400,
                        message: 'AMC Type, Start Date and Hours are required for Support projects'
                    });
                }
                let endDate = new Date(data.amcStartDate);

                // Validate amcType.value is a positive number
                if (!Number.isInteger(data.amcType.value) || data.amcType.value <= 0) {
                    return res.status(400).json({
                        status: 400,
                        message: `Invalid AMC duration value: ${data.amcType.value}. Duration must be a positive integer.`
                    });
                }

                if (data.amcType.type === 'Monthly') {
                    // Add months while handling year rollovers correctly
                    for (let i = 0; i < data.amcType.value; i++) {
                        endDate.setMonth(endDate.getMonth() + 1);
                    }
                    endDate.setDate(endDate.getDate() - 1); // Set to last day of final month
                    data.amcEndDate = endDate;
                } else if (data.amcType.type === 'Yearly') {
                    endDate.setFullYear(endDate.getFullYear() + data.amcType.value);
                    endDate.setDate(endDate.getDate() - 1); // Set to last day of final month
                    data.amcEndDate = endDate;
                }
            }

            const project = await Project.create(data);

            // Create AMC milestones if Support project
            if (data.projectStatus === 'Support') {
                const startDate = new Date(data.amcStartDate);
                const months = data.amcType.type === 'Monthly' ? data.amcType.value : data.amcType.value * 12;
                // const hoursPerMonth = data.amcHours / months;

                for (let i = 0; i < months; i++) {
                    const milestoneStartDate = new Date(startDate);
                    milestoneStartDate.setMonth(startDate.getMonth() + i);

                    const milestoneEndDate = new Date(milestoneStartDate);
                    milestoneEndDate.setMonth(milestoneStartDate.getMonth() + 1);
                    milestoneEndDate.setDate(milestoneEndDate.getDate() - 1);

                    await Milestone.create({
                        project: project._id,
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
            }
            const populatedProject = await Project.findById(project._id)
                .populate('team', 'name email');

            // Send notifications to team members
            if (populatedProject.team && populatedProject.team.length > 0) {
                for (const member of populatedProject.team) {
                    await NotificationService.createNotification({
                        recipient: member._id,
                        type: 'project_update',
                        title: 'Added to New Project',
                        message: `You have been added to project: ${populatedProject.name}`,
                        relatedId: project._id,
                        relatedModel: 'Project'
                    });

                    // Send email notification
                    await NotificationService.sendProjectAssignmentEmail(
                        member,
                        populatedProject
                    );
                }
            }

            await TaskStatus.insertMany([
                { name: 'To Do', project: project._id, color: '#9CA3AF', order: 1 },
                { name: 'In Progress', project: project._id, color: '#3B82F6', order: 2 },
                { name: 'Testing', project: project._id, color: '#8B5CF6', order: 3 },
                { name: 'On Hold', project: project._id, color: '#F59E0B', order: 5 },
                { name: 'Done', project: project._id, color: '#10B981', order: 4 }
            ]);

            res.status(201).json({
                status: 201,
                message: 'Project created successfully',
                data: project
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update project
    /** @ Put : api/v1/admin/project/:id */
    async updateProject(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            const oldProject = await Project.findById(id).populate('team', 'name email');
            if (data.projectStatus === 'Support') {
                if (!data.amcType || !data.amcStartDate || !data.amcHours) {
                    return res.status(400).json({
                        status: 400,
                        message: 'AMC Type, Start Date and Hours are required for Support projects'
                    });
                }
                let endDate;
                if (data.amcType.type === 'Monthly') {
                    endDate = new Date(data.amcStartDate);
                    endDate.setMonth(endDate.getMonth() + data.amcType.value);
                    data.amcEndDate = endDate;
                } else if (data.amcType.type === 'Yearly') {
                    endDate = new Date(data.amcStartDate);
                    endDate.setFullYear(endDate.getFullYear() + data.amcType.value);
                    data.amcEndDate = endDate;
                }
            }
            const project = await Project.findByIdAndUpdate(id, data, { new: true })
                .populate('team', 'name email');

            if (!project) {
                return res.status(404).json({
                    status: 404,
                    message: 'Project not found'
                });
            }

            if (data.projectStatus === 'Support') {
                const startDate = new Date(data.amcStartDate);
                const months = data.amcType.type === 'Monthly' ? data.amcType.value : data.amcType.value * 12;
                // const hoursPerMonth = data.amcHours / months;

                for (let i = 0; i < months; i++) {
                    const milestoneStartDate = new Date(startDate);
                    milestoneStartDate.setMonth(startDate.getMonth() + i);

                    const milestoneEndDate = new Date(milestoneStartDate);
                    milestoneEndDate.setMonth(milestoneStartDate.getMonth() + 1);
                    milestoneEndDate.setDate(milestoneEndDate.getDate() - 1);

                    // Check if milestone already exists
                    const existingMilestone = await Milestone.findOne({
                        project: project._id,
                        title: milestoneStartDate.toLocaleString('default', { month: 'long' }) + ' AMC',
                        startDate: milestoneStartDate
                    });

                    if (!existingMilestone) {
                        await Milestone.create({
                            project: project._id,
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
                }
            }

            // Check for new team members
            if (data.team) {
                const oldTeamIds = oldProject.team.map(member => member._id.toString());
                const newTeamIds = project.team.map(member => member._id.toString());
                const addedMembers = project.team.filter(member =>
                    !oldTeamIds.includes(member._id.toString())
                );

                // Send notifications to newly added members
                for (const member of addedMembers) {
                    await NotificationService.createNotification({
                        recipient: member._id,
                        type: 'project_update',
                        title: 'Added to Project',
                        message: `You have been added to project: ${project.name}`,
                        relatedId: project._id,
                        relatedModel: 'Project'
                    });

                    // Send email notification
                    await NotificationService.sendProjectAssignmentEmail(
                        member,
                        project
                    );
                }
            }

            return res.status(200).json({
                status: 200,
                message: 'Project updated successfully',
                data: project
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update project status
    /** @ Put : api/v1/admin/project/status/:id */
    async updateProjectstatus(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const project = await Project.findByIdAndUpdate(id, data, { new: true });

            if (!project) {
                return res.status(404).json({
                    status: 404,
                    message: 'Project not found'
                });
            }
            console.dir(project)

            return res.status(200).json({
                status: 200,
                message: 'Project status updated successfully',
            });
        }
        catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });

        }
    }

    // Get all projects
    /** @ Get : api/v1/admin/project */
    async getAllProjects(req, res) {
        try {
            const { page = 1, limit = 10, search = '', status, isActive, user, projectType } = req.query;
            let searchQuery = {};

            if (user && user.trim() !== '') {
                if (req.user.role?.name === 'Project Manager') {
                    searchQuery.createdBy = user;
                } else {
                    searchQuery.team = user;
                }
            }

            if (projectType && projectType.trim() !== '') {

                searchQuery.projectType = projectType;
            }

            if (search && search.trim() !== '') {
                searchQuery.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { type: { $regex: search, $options: 'i' } }
                ];
            }

            if (status && status.trim() !== '') {
                searchQuery.projectStatus = status
            } else {
                searchQuery.projectStatus = { $nin: ['Hold', 'Delivered'] }
            }

            if (isActive) searchQuery.isActive = isActive === 'true';
            // console.log('Search Query:', searchQuery);

            const projects = await Project.find(searchQuery)
                .populate({
                    path: 'client',
                    select: 'name email'
                })
                .populate('technology', 'name')
                .populate('team', 'name email designation')
                .populate('documents.uploadedBy', 'name')
                .populate({
                    path: 'meetings',
                    match: { isActive: true }
                })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ name: 1 })
                .lean();

            const userId = req.user._id;
            const projectIds = projects.map(p => p._id);

            // Get mention counts
            const mentions = await CommentMention.find({
                user: userId,
                project: { $in: projectIds }
            }).select('project mentionCount').lean();

            const mentionCounts = mentions.reduce((acc, mention) => {
                acc[mention.project] = mention.mentionCount;
                return acc;
            }, {});

            // Get monthly hours
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const monthlyHours = await TimeTracking.aggregate([
                {
                    $match: {
                        project: { $in: projectIds },
                        startTime: { $gte: startOfMonth, $lte: endOfMonth }
                    }
                },
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
                        project: 1,
                        totalLoggedTime: {
                            $subtract: [
                                { $toDate: '$currentEndTime' },
                                { $add: [{ $toDate: '$startTime' }, '$totalPauseTime'] }
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: '$project',
                        totalHours: {
                            $sum: { $divide: ['$totalLoggedTime', 3600000] }
                        }
                    }
                }
            ]);

            const hoursCounts = monthlyHours.reduce((acc, item) => {
                acc[item._id] = parseFloat(item.totalHours.toFixed(2));
                return acc;
            }, {});

            // Get last milestone dates
            const lastMilestones = await Milestone.find({
                project: { $in: projectIds }
            })
                .sort({ completionDate: -1 })
                .select('project completionDate')
                .lean();

            const milestoneDates = lastMilestones.reduce((acc, milestone) => {
                if (!acc[milestone.project]) {
                    acc[milestone.project] = milestone.completionDate;
                }
                return acc;
            }, {});

            // Combine all data
            const enhancedProjects = projects.map(project => ({
                ...project,
                mentionCount: mentionCounts[project._id] || 0,
                monthlyHours: hoursCounts[project._id] || 0,
                end: milestoneDates[project._id] || null
            }));

            const count = await Project.countDocuments(searchQuery);

            return res.status(200).json({
                status: 200,
                message: 'Projects retrieved successfully',
                data: enhancedProjects,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalProjects: count
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get single project
    /** @ Get : api/v1/admin/project/:id */
    async getSingleProject(req, res) {
        try {
            const { id } = req.params;
            const project = await Project.findById(id)
                .populate('client', 'name email contact')
                .populate('technology', 'name description')
                .populate('team', 'name email designation role')
                .populate('documents.uploadedBy', 'name email')
                .lean();

            if (!project) {
                return res.status(404).json({
                    status: 404,
                    message: 'Project not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Project retrieved successfully',
                data: project
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete project
    /** @ Delete : api/v1/admin/project/:id */
    async deleteProject(req, res) {
        try {
            const { id } = req.params;
            const project = await Project.findByIdAndDelete(id);

            if (!project) {
                return res.status(404).json({
                    status: 404,
                    message: 'Project not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Project deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get project status counts
    /** @ Get : api/v1/admin/project/status-counts */
    async getProjectStatusCounts(req, res) {
        try {
            const { projectType, isActive, user } = req.query;
            let matchQuery = {};
            if (projectType) matchQuery.projectType = projectType;
            if (isActive !== undefined) matchQuery.isActive = isActive === 'true';
            if (user) matchQuery.team = { $in: [new mongoose.Types.ObjectId(user)] };
            const counts = await Project.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: "$projectStatus",
                        count: { $sum: 1 }
                    }
                }
            ]);

            const statusCounts = counts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, { Ongoing: 0, Support: 0, Delivered: 0, Hold: 0 });

            return res.status(200).json({
                status: 200,
                message: "Project status counts retrieved successfully",
                data: statusCounts
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                status: 500,
                message: "Internal server error",
                error: error.message
            });

        }
    }
}

module.exports = new ProjectController();