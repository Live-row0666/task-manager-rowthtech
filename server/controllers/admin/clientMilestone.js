const ClientMilestone = require('../../models/clientMilestone');
const Milestone = require('../../models/milestones');

class ClientMilestoneController {

    // POST /api/v1/admin/client-milestone
    async createClientMilestone(req, res) {
        try {
            const data = req.body;
            data.createdBy = req.user._id;

            if (!data.project) return res.status(400).json({ status: 400, message: 'Project is required' });
            if (!data.title)   return res.status(400).json({ status: 400, message: 'Title is required' });
            if (!data.startDate)      return res.status(400).json({ status: 400, message: 'Start date is required' });
            if (!data.completionDate) return res.status(400).json({ status: 400, message: 'Completion date is required' });

            const milestone = await ClientMilestone.create(data);

            return res.status(201).json({
                status: 201,
                message: 'Client milestone created successfully',
                data: milestone,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // PUT /api/v1/admin/client-milestone/:id
    async updateClientMilestone(req, res) {
        try {
            const milestone = await ClientMilestone.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!milestone) return res.status(404).json({ status: 404, message: 'Client milestone not found' });
            return res.status(200).json({ status: 200, message: 'Client milestone updated successfully', data: milestone });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-milestone
    async getAllClientMilestones(req, res) {
        try {
            const { projectId = '', page = 1, limit = 100, search = '', isActive } = req.query;
            const query = {};

            if (projectId.trim()) query.project = projectId;

            // isActive filter: 'false' = inactive, 'true' or missing = active
            if (isActive === 'false') {
                query.isActive = false;
            } else {
                query.isActive = true;
            }

            if (search.trim()) query.title = { $regex: search, $options: 'i' };

            let milestones = await Milestone.find(query)
                .populate('project', 'name')
                .populate('assignedTo', 'name email')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 })
                .lean();

            let count = await Milestone.countDocuments(query);

            if (!milestones.length) {
                milestones = await ClientMilestone.find(query)
                    .populate('project', 'name')
                    .populate('assignedTo', 'name email')
                    .limit(Number(limit))
                    .skip((Number(page) - 1) * Number(limit))
                    .sort({ createdAt: -1 })
                    .lean();
                count = await ClientMilestone.countDocuments(query);
            }

            return res.status(200).json({
                status: 200,
                message: 'Client milestones retrieved successfully',
                data: milestones,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-milestone/:id
    async getSingleClientMilestone(req, res) {
        try {
            const milestone = await ClientMilestone.findById(req.params.id)
                .populate('project', 'name')
                .lean();
            if (!milestone) return res.status(404).json({ status: 404, message: 'Client milestone not found' });
            return res.status(200).json({ status: 200, message: 'Client milestone retrieved successfully', data: milestone });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // DELETE /api/v1/admin/client-milestone/:id
    async deleteClientMilestone(req, res) {
        try {
            const milestone = await ClientMilestone.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
            if (!milestone) return res.status(404).json({ status: 404, message: 'Client milestone not found' });
            return res.status(200).json({ status: 200, message: 'Client milestone deleted successfully' });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }
}

module.exports = new ClientMilestoneController();
