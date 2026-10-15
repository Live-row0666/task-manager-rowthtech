const Projects = require('../../models/project');
const TimeTracking = require('../../models/timeTracking');
const Milestones = require('../../models/milestones');

class AmcReportsController {
    async getAmcProjects(req, res) {
        try {
            // Get pagination params from query
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const user = req.query.user;

            // Get project type from query
            const projectType = req.query.projectType;

            // Build query object
            let query = {
                $or: [
                    { projectStatus: 'Support' },
                    { hasAmc: true }
                ]
            };

            if (user && user.trim() !== '') {
                if (req.user.role?.name === 'Project Manager') {
                    query.createdBy = user;
                } else {
                    query.team = user;
                }
            }

            if (projectType) {
                query.projectType = projectType;
            }

            // Get paginated projects
            const projects = await Projects.find(query).populate('client', 'name email contact')
                .populate('technology', 'name description')
                .populate('team', 'name email designation role')
                .populate('documents.uploadedBy', 'name email')
                .skip(skip)
                .limit(limit);

            // Get project IDs for time tracking aggregation
            const projectIds = projects.map(project => project._id);

            // Aggregate worked hours from time tracking
            const timeTrackingData = await TimeTracking.aggregate([
                {
                    $match: {
                        project: { $in: projectIds },
                        isComplete: true
                    }
                },
                {
                    $group: {
                        _id: '$project',
                        totalDuration: { $sum: '$duration' }
                    }
                }
            ]);

            // Create a map for quick lookup
            const timeTrackingMap = {};
            timeTrackingData.forEach(item => {
                timeTrackingMap[item._id.toString()] = item.totalDuration;
            });


            // Calculate hours for each project
            const projectsWithHours = await Promise.all(projects.map(async (project) => {
                const milstonesWorkedHours = await Milestones.aggregate([
                    {
                        $match: {
                            project: project._id
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalWorkedHours: { $sum: '$workedHours' }
                        }
                    }
                ]);
                const totalDurationMinutes = timeTrackingMap[project._id.toString()] || 0;
                const teamHours = Math.round((totalDurationMinutes / 60) * 100) / 100;
                const amcHours = project.amcHours || 0;
                const remainingHours = milstonesWorkedHours[0]?.totalWorkedHours > 0 ? Math.round((amcHours - milstonesWorkedHours[0]?.totalWorkedHours) * 100) / 100
                    : Math.round((amcHours - project.workedHours) * 100) / 100;
                return {
                    ...project.toObject(),
                    teamHours,
                    remainingHours,
                    workedHours: milstonesWorkedHours[0]?.totalWorkedHours > 0 ? milstonesWorkedHours[0]?.totalWorkedHours : project.workedHours || 0
                };
            }));
            // Get total count for pagination
            const total = await Projects.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: projectsWithHours,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: 'Error fetching AMC projects',
                error: error.message
            });
        }

    }
}

module.exports = new AmcReportsController();