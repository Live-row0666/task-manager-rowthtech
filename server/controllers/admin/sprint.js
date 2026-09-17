const Sprint = require('../../models/sprint');
const Task = require('../../models/task');
const Milestone = require('../../models/milestones');
const Project = require('../../models/project');

// Helper function to update milestone completion date if sprint end date is later
const updateMilestoneCompletionDate = async (milestoneId, sprintEndDate) => {
    try {
        const milestone = await Milestone.findById(milestoneId);
        if (milestone && (!milestone.completionDate || new Date(sprintEndDate) > new Date(milestone.completionDate))) {
            await Milestone.findByIdAndUpdate(milestoneId, { completionDate: sprintEndDate });

            // Also update project end date if needed
            if (milestone.project) {
                const project = await Project.findById(milestone.project);
                if (project && (!project.end || new Date(sprintEndDate) > new Date(project.end))) {
                    await Project.findByIdAndUpdate(milestone.project, { end: sprintEndDate });
                }
            }
        }
    } catch (error) {
        console.log('Error updating milestone completion date:', error);
    }
};

class SprintController {
    // Create sprint
    /** @ Post : api/v1/admin/sprint/ */
    async createSprint(req, res) {
        try {
            let data = req.body;
            data.createdBy = req.user._id;
            if (!data.project || !data.milestone || !data.sprintName || !data.startDate || !data.endDate) {
                return res.status(400).json({
                    status: 400,
                    message: 'Project, milestone, sprint name, start date and end date are required'
                });
            }

            const sprint = await Sprint.create(data);

            // Update milestone completion date if sprint end date is later
            if (data.milestone && data.endDate) {
                await updateMilestoneCompletionDate(data.milestone, data.endDate);
            }

            res.status(201).json({
                status: 201,
                message: 'Sprint created successfully',
                data: sprint
            });
            if (Array.isArray(data.task) && data.task.length > 0) {
                let tasks = [];
                for (const task of data.task) {
                    task.sprint = sprint._id;
                    tasks.push(task);
                }
                await Task.insertMany(tasks);
            }

        } catch (error) {
            console.error('Error creating sprint:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update sprint
    /** @ Put : api/v1/admin/sprint/:id */
    async updateSprint(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            if (data.isActive === false || data.isActive === 'false') {
                await Task.updateMany({ sprint: id }, { $set: { isActive: false } });
            } else {
                await Task.updateMany({ sprint: id }, { $set: { isActive: true } });
            }

            const sprint = await Sprint.findByIdAndUpdate(id, data, { new: true });
            if (!sprint) {
                return res.status(404).json({
                    status: 404,
                    message: 'Sprint not found'
                });
            }

            // Update milestone completion date if sprint end date is later
            if (sprint.milestone && (data.endDate || sprint.endDate)) {
                const endDate = data.endDate || sprint.endDate;
                await updateMilestoneCompletionDate(sprint.milestone, endDate);
            }

            res.status(200).json({
                status: 200,
                message: 'Sprint updated successfully',
                data: sprint
            });
             if (Array.isArray(data.task) && data.task.length > 0) {
                let tasks = [];
                for (const task of data.task) {
                    task.sprint = sprint._id;
                    task.project = sprint.project;
                    task.milestone = sprint.milestone;
                    tasks.push(task);
                }
                await Task.insertMany(tasks);
            }
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get all sprints
    /** @ Get : api/v1/admin/sprint */
    async getAllSprints(req, res) {
        try {
            const {
                page = 1,
                limit = 100,
                search = '',
                priority,
                project,
                milestone,
                assignedTo,
                isActive
            } = req.query;

            let searchQuery = {};

            if (search && search.trim() !== '') {
                searchQuery.$or = [
                    { sprintName: { $regex: search, $options: 'i' } },
                    { sprintDesc: { $regex: search, $options: 'i' } }
                ];
            }

            if (priority && priority.trim() !== '' && !isNaN(priority)) searchQuery.priority = priority;
            if (project && project.trim() !== '') searchQuery.project = project;
            if (milestone && milestone.trim() !== '') searchQuery.milestone = milestone;
            if (assignedTo && assignedTo.trim() !== '') searchQuery.assignedTo = { $in: [assignedTo] };
            if (isActive !== undefined) searchQuery.isActive = isActive === 'true';

            const sprints = await Sprint.find(searchQuery)
                .populate('project', 'name client end')
                .populate('milestone', 'title status completionDate')
                .populate('assignedTo', 'name email designation')
                .populate('dependencies', 'sprintName progress')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .lean();

            const count = await Sprint.countDocuments(searchQuery);

            for (let sprint of sprints) {
                const taskCount = await Task.countDocuments({ sprint: sprint._id, status: { $nin: ['Done', 'On Hold'] } });
                sprint.pendingTaskCount = taskCount;
            }


            return res.status(200).json({
                status: 200,
                message: 'Sprints retrieved successfully',
                data: sprints,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                totalSprints: count
            });
        } catch (error) {
            console.error('Error retrieving sprints:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get single sprint
    /** @ Get : api/v1/admin/sprint/:id */
    async getSingleSprint(req, res) {
        try {
            const { id } = req.params;
            const sprint = await Sprint.findById(id)
                .populate('project', 'name description client')
                .populate('milestone', 'title description status')
                .populate('assignedTo', 'name email designation role')
                .populate('dependencies', 'sprintName progress priority')
                .lean();

            if (!sprint) {
                return res.status(404).json({
                    status: 404,
                    message: 'Sprint not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Sprint retrieved successfully',
                data: sprint
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete sprint
    /** @ Delete : api/v1/admin/sprint/:id */
    async deleteSprint(req, res) {
        try {
            const { id } = req.params;
            const sprint = await Sprint.findByIdAndDelete(id);

            if (!sprint) {
                return res.status(404).json({
                    status: 404,
                    message: 'Sprint not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Sprint deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get sprints by project
    /** @ Get : api/v1/admin/sprint/project/:projectId */
    async getSprintsByProject(req, res) {
        try {
            const { projectId } = req.params;
            const { milestone, priority, activeStatus } = req.query;

            let query = { project: projectId };
            if (milestone) query.milestone = milestone;
            if (priority) query.priority = priority;
            if (activeStatus !== undefined) query.activeStatus = activeStatus === 'true';

            const sprints = await Sprint.find(query)
                .populate('milestone', 'title status')
                .populate('assignedTo', 'name email')
                .populate('dependencies', 'sprintName progress')
                .sort({ startDate: 1 })
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Project sprints retrieved successfully',
                data: sprints,
                count: sprints.length
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get sprints by milestone
    /** @ Get : api/v1/admin/sprint/milestone/:milestoneId */
    async getSprintsByMilestone(req, res) {
        try {
            const { milestoneId } = req.params;
            const { priority, activeStatus } = req.query;

            let query = { milestone: milestoneId };
            if (priority) query.priority = priority;
            if (activeStatus !== undefined) query.activeStatus = activeStatus === 'true';

            const sprints = await Sprint.find(query)
                .populate('project', 'name')
                .populate('assignedTo', 'name email')
                .populate('dependencies', 'sprintName progress')
                .sort({ startDate: 1 })
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Milestone sprints retrieved successfully',
                data: sprints,
                count: sprints.length
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new SprintController();
