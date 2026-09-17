const Task = require('../../models/task');
const Project = require('../../models/project');
const User = require('../../models/user');

class SearchController {
    async globalSearch(req, res) {
        try {
            const { query, type, limit = 10 } = req.query;
            
            if (!query) {
                return res.status(400).json({
                    status: 400,
                    message: 'Search query is required'
                });
            }

            const searchRegex = new RegExp(query, 'i');
            const results = {};

            if (!type || type === 'tasks') {
                results.tasks = await Task.find({
                    $or: [
                        { summary: searchRegex },
                        { description: searchRegex }
                    ]
                })
                .populate('assignee', 'name email')
                .populate('project', 'name')
                .populate('milestone')
                .populate('sprint')
                .limit(parseInt(limit));
                // .select('summary status priority dueDate assignee project');
            }

            if (!type || type === 'projects') {
                results.projects = await Project.find({
                    $or: [
                        { name: searchRegex },
                        { description: searchRegex }
                    ]
                })
                .populate('client', 'name')
                .limit(parseInt(limit))
                .select('name description projectStatus start end client');
            }

            if (!type || type === 'users') {
                results.users = await User.find({
                    $or: [
                        { name: searchRegex },
                        { email: searchRegex },
                        { designation: searchRegex }
                    ]
                })
                .populate('role', 'name')
                .limit(parseInt(limit))
                .select('name email designation role isActive');
            }

            res.status(200).json({
                status: 200,
                message: 'Search results retrieved',
                data: results,
                query
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Error performing search',
                error: error.message
            });
        }
    }

    async searchTasks(req, res) {
        try {
            const { 
                query, 
                status, 
                priority, 
                assignee, 
                project,
                page = 1, 
                limit = 10 
            } = req.query;

            const searchFilter = {};

            if (query) {
                const searchRegex = new RegExp(query, 'i');
                searchFilter.$or = [
                    { summary: searchRegex },
                    { description: searchRegex }
                ];
            }

            if (status) searchFilter.status = status;
            if (priority) searchFilter.priority = priority;
            if (assignee) searchFilter.assignee = assignee;
            if (project) searchFilter.project = project;

            const tasks = await Task.find(searchFilter)
                .populate('assignee', 'name email')
                .populate('project', 'name')
                .populate('reporter', 'name email')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Task.countDocuments(searchFilter);

            res.status(200).json({
                status: 200,
                message: 'Tasks retrieved',
                data: tasks,
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
                message: 'Error searching tasks',
                error: error.message
            });
        }
    }
}

module.exports = new SearchController();