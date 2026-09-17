const Project = require('../../models/project');
const User = require('../../models/user');
const Role = require('../../models/role');
const Task = require('../../models/task');

class TeamProjectTrackerController {
    // Get team project tracker data
    /** @ Get : api/v1/admin/team-project-tracker */
    async getTeamProjectTracker(req, res) {
        try {
            const { projectId } = req.query;

            // Get only user and qa roles
            const allowedRoles = await Role.find({
                name: { $in: ['Marketing', 'sub-admin', 'admin', 'Support', 'Sales'] }
            }).select('_id');
            const allowedRoleIds = allowedRoles.map(role => role._id);

            // Get team members (only user and qa roles)
            const teamMembers = await User.find({
                role: { $nin: allowedRoleIds },
                isActive: true,
            }).populate('technology', 'name')
                .select('name designation technology')
                .sort({ name: 1 })
                .lean();

            // Categorize team members by designation and technology
            const categorizeTeamMember = (member) => {
                const designation = member.designation?.toLowerCase() || '';
                const techNames = (member.technology || []).map(tech => tech.name.toLowerCase());

                const uiTechs = ['figma', 'photoshop', 'sketch', 'adobe xd'];
                const mobileTechs = ['flutter', 'react native', 'android', 'ios', 'kotlin', 'swift', 'dart'];
                const backendTechs = ['node', 'nodejs', 'express', 'mongodb', 'mysql', 'postgresql', 'python', 'django', 'flask', 'php', 'laravel'];
                const webTechs = ['react', 'reactjs', 'next', 'nextjs', 'vue', 'angular', 'javascript'];
                const basicHtmlCss = ['html', 'css', 'bootstrap'];

                const hasOnlyHtmlCss = techNames.length > 0 && techNames.every(t => basicHtmlCss.includes(t));

                if (
                    designation.includes('ui') ||
                    designation.includes('ux') ||
                    designation.includes('designer') ||
                    techNames.some(tech => uiTechs.includes(tech)) ||
                    hasOnlyHtmlCss
                ) {
                    return 'uiDesigner';
                }

                if (
                    designation.includes('flutter') ||
                    designation.includes('mobile') ||
                    designation.includes('android') ||
                    designation.includes('ios') ||
                    techNames.some(tech => mobileTechs.includes(tech))
                ) {
                    return 'mobileTeam';
                }

                if (
                    designation.includes('backend') ||
                    designation.includes('node') ||
                    techNames.some(tech => backendTechs.includes(tech))
                ) {
                    return 'backendTeam';
                }

                if (
                    designation.includes('frontend') ||
                    designation.includes('react') ||
                    designation.includes('web') ||
                    techNames.some(tech => webTechs.includes(tech))
                ) {
                    return 'webTeam';
                }

                return 'general';
            };


            // Process team members with minimal required data
            const processedTeamMembers = teamMembers.map(member => ({
                _id: member._id,
                name: member.name,
                teamCategory: categorizeTeamMember(member)
            }));

            // Get tasks to determine which members work on which projects
            const tasks = await Task.find({ isActive: true })
                .populate('assignee', '_id')
                .populate('project', '_id name')
                .select('assignee project')
                .lean();

            // Create member-project mapping
            const memberProjectMapping = {};
            tasks.forEach(task => {
                if (task.assignee && task.project) {
                    const memberId = task.assignee._id.toString();
                    const projectId = task.project._id.toString();

                    if (!memberProjectMapping[memberId]) {
                        memberProjectMapping[memberId] = new Set();
                    }
                    memberProjectMapping[memberId].add(projectId);
                }
            });

            // Get projects with team member assignments
            let projectQuery = { isActive: true };
            projectQuery.projectStatus = { $nin: ['Hold', 'Delivered'] };
             if (projectId) {
                projectQuery._id = projectId;
            }

            const projects = await Project.find(projectQuery)
                .select('name team')
                .lean();

            // Calculate team categories summary
            const teamCategories = {
                uiDesigner: processedTeamMembers.filter(m => m.teamCategory === 'uiDesigner').length,
                mobileTeam: processedTeamMembers.filter(m => m.teamCategory === 'mobileTeam').length,
                backendTeam: processedTeamMembers.filter(m => m.teamCategory === 'backendTeam').length,
                webTeam: processedTeamMembers.filter(m => m.teamCategory === 'webTeam').length,
                general: processedTeamMembers.filter(m => m.teamCategory === 'general').length
            };

            return res.status(200).json({
                status: 200,
                message: 'Team project tracker data retrieved successfully',
                data: {
                    projects: projects,
                    teamMembers: processedTeamMembers,
                    summary: {
                        teamCategories
                    }
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

module.exports = new TeamProjectTrackerController();
