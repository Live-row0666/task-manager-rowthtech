const Project = require('../../models/project');
const Task = require('../../models/task');

class UserProjectController {
    // Get user's assigned projects
    /** @ Get : api/v1/user/project */
    async getUserProjects(req, res) {
        try {
            const { page = 1, limit = 30, search = '' } = req.query;
            const userId = req.user._id;
            
 
            let searchQuery = {
                team: userId,
                isActive: true
            };

            if (search && search.trim() !== '') {
                searchQuery.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const projects = await Project.find(searchQuery)
                .populate('client', 'name email')
                .populate('technology', 'name')
                .populate('team', 'name email designation')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 })
                .lean();

            // Get task counts for each project
            const projectsWithTaskCounts = await Promise.all(
                projects.map(async (project) => {
                    const totalTasks = await Task.countDocuments({ 
                        project: project._id,
                        assignee: userId 
                    });
                    const completedTasks = await Task.countDocuments({ 
                        project: project._id,
                        assignee: userId,
                        status: 'Done'
                    });
                    const inProgressTasks = await Task.countDocuments({ 
                        project: project._id,
                        assignee: userId,
                        status: 'In Progress'
                    });

                    return {
                        ...project,
                        taskStats: {
                            total: totalTasks,
                            completed: completedTasks,
                            inProgress: inProgressTasks,
                            pending: totalTasks - completedTasks - inProgressTasks
                        }
                    };
                })
            );

            const count = await Project.countDocuments(searchQuery);

            return res.status(200).json({
                status: 200,
                message: 'Projects retrieved successfully',
                data: projectsWithTaskCounts,
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

    // Get single project details
    /** @ Get : api/v1/user/project/:id */
    async getSingleProject(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const project = await Project.findOne({
                _id: id,
                team: userId,
                isActive: true
            })
                .populate('client', 'name email contact')
                .populate('technology', 'name description')
                .populate('team', 'name email designation')
                .lean();

            if (!project) {
                return res.status(404).json({
                    status: 404,
                    message: 'Project not found or access denied'
                });
            }

            // Get user's tasks in this project
            const userTasks = await Task.find({
                project: id,
                assignee: userId
            })
                .populate('milestone', 'title')
                .populate('sprint', 'sprintName')
                .sort({ createdAt: -1 })
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Project retrieved successfully',
                data: {
                    ...project,
                    userTasks
                }
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

module.exports = new UserProjectController();
