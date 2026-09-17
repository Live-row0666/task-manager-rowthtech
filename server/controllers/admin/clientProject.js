const ClientProject = require('../../models/clientProject');

class ClientProjectController {

    // POST /api/v1/admin/client-project
    async createClientProject(req, res) {
        try {
            const data = req.body;
            data.createdBy = req.user._id;

            if (!data.name) {
                return res.status(400).json({ status: 400, message: 'Project name is required' });
            }

            const existing = await ClientProject.findOne({
                name: { $regex: new RegExp('^' + data.name.trim() + '$', 'i') },
            });
            if (existing) {
                return res.status(400).json({ status: 400, message: 'Client project with this name already exists' });
            }

            // Auto-calculate AMC end date
            if (data.projectStatus === 'Support') {
                if (!data.amcType || !data.amcStartDate || !data.amcHours) {
                    return res.status(400).json({ status: 400, message: 'AMC Type, Start Date and Hours are required for Support projects' });
                }
                const endDate = new Date(data.amcStartDate);
                if (!Number.isInteger(data.amcType.value) || data.amcType.value <= 0) {
                    return res.status(400).json({ status: 400, message: 'AMC duration must be a positive integer' });
                }
                if (data.amcType.type === 'Monthly') {
                    for (let i = 0; i < data.amcType.value; i++) endDate.setMonth(endDate.getMonth() + 1);
                    endDate.setDate(endDate.getDate() - 1);
                } else if (data.amcType.type === 'Yearly') {
                    endDate.setFullYear(endDate.getFullYear() + data.amcType.value);
                    endDate.setDate(endDate.getDate() - 1);
                }
                data.amcEndDate = endDate;
            }

            const project = await ClientProject.create(data);

            return res.status(201).json({
                status: 201,
                message: 'Client project created successfully',
                data: project,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // PUT /api/v1/admin/client-project/:id
    async updateClientProject(req, res) {
        try {
            const { id } = req.params;
            const project = await ClientProject.findByIdAndUpdate(id, req.body, { new: true });
            if (!project) return res.status(404).json({ status: 404, message: 'Client project not found' });
            return res.status(200).json({ status: 200, message: 'Client project updated successfully', data: project });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-project
    async getAllClientProjects(req, res) {
        try {
            const { page = 1, limit = 50, search = '', projectType = '', projectStatus = '' } = req.query;
            const query = { isActive: true };

            if (search.trim()) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }
            if (projectType.trim()) query.projectType = projectType;
            if (projectStatus.trim()) query.projectStatus = projectStatus;

            const projects = await ClientProject.find(query)
                .populate('client', 'name email')
                .populate('technology', 'name')
                .populate('team', 'name email')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 })
                .lean();

            const count = await ClientProject.countDocuments(query);

            return res.status(200).json({
                status: 200,
                message: 'Client projects retrieved successfully',
                data: projects,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
                total: count,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-project/:id
    async getSingleClientProject(req, res) {
        try {
            const project = await ClientProject.findById(req.params.id)
                .populate('client', 'name email contact')
                .populate('technology', 'name')
                .populate('team', 'name email')
                .lean();
            if (!project) return res.status(404).json({ status: 404, message: 'Client project not found' });
            return res.status(200).json({ status: 200, message: 'Client project retrieved successfully', data: project });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // DELETE /api/v1/admin/client-project/:id
    async deleteClientProject(req, res) {
        try {
            const project = await ClientProject.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
            if (!project) return res.status(404).json({ status: 404, message: 'Client project not found' });
            return res.status(200).json({ status: 200, message: 'Client project deleted successfully' });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = new ClientProjectController();
