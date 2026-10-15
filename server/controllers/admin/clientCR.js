const ClientCR = require('../../models/clientCR');
require('../../models/client');
require('../../models/project');
require('../../models/user');

class AdminClientCRController {
    // GET /api/v1/admin/client-cr
    async getCRs(req, res) {
        try {
            const { clientId, projectId, status, priority, search, page = 1, limit = 15 } = req.query;

            const filter = {};
            if (clientId) filter.client = clientId;
            if (projectId) filter.project = projectId;
            if (status && status !== 'all') filter.status = status;
            if (priority && priority !== 'all') filter.priority = priority;
            if (search && search.trim()) {
                filter.$or = [
                    { title: { $regex: search.trim(), $options: 'i' } },
                    { description: { $regex: search.trim(), $options: 'i' } }
                ];
            }

            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 15;
            const skip = (pageNum - 1) * limitNum;

            const [total, crs] = await Promise.all([
                ClientCR.countDocuments(filter),
                ClientCR.find(filter)
                    .populate('client', 'name email companyName')
                    .populate('project', 'name projectStatus hasAmc')
                    .populate('reviewedBy', 'name email designation')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limitNum)
                    .lean()
            ]);

            return res.status(200).json({
                status: 200,
                data: crs,
                totalPages: Math.ceil(total / limitNum),
                currentPage: pageNum,
                totalCRs: total
            });
        } catch (error) {
            console.error('Error fetching admin CRs:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // GET /api/v1/admin/client-cr/:id
    async getCRById(req, res) {
        try {
            const { id } = req.params;

            const cr = await ClientCR.findById(id)
                .populate('client', 'name email companyName contact')
                .populate('project', 'name projectStatus hasAmc')
                .populate('reviewedBy', 'name email designation');

            if (!cr) {
                return res.status(404).json({ status: 404, message: 'Change Request not found.' });
            }

            // Mark unreadByAdmin to 0
            if (cr.unreadByAdmin > 0) {
                cr.unreadByAdmin = 0;
                await cr.save();
            }

            return res.status(200).json({ status: 200, data: cr });
        } catch (error) {
            console.error('Error fetching admin CR by id:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // PUT /api/v1/admin/client-cr/:id
    async updateCR(req, res) {
        try {
            const { id } = req.params;
            const { status, estimatedHours, cost, adminNotes, priority, targetDate } = req.body;

            const cr = await ClientCR.findById(id);
            if (!cr) {
                return res.status(404).json({ status: 404, message: 'Change Request not found.' });
            }

            if (status) cr.status = status;
            if (estimatedHours !== undefined) cr.estimatedHours = Number(estimatedHours) || 0;
            if (cost !== undefined) cr.cost = Number(cost) || 0;
            if (adminNotes !== undefined) cr.adminNotes = adminNotes;
            if (priority) cr.priority = priority;
            if (targetDate) cr.targetDate = new Date(targetDate);

            // Audit metadata
            cr.reviewedBy = req.user?._id;
            cr.reviewedAt = new Date();

            if (status === 'completed') {
                cr.completedAt = new Date();
            }

            cr.unreadByClient = (cr.unreadByClient || 0) + 1;
            cr.unreadByAdmin = 0;
            await cr.save();

            const populated = await ClientCR.findById(cr._id)
                .populate('client', 'name email companyName')
                .populate('project', 'name projectStatus hasAmc')
                .populate('reviewedBy', 'name email designation')
                .lean();

            return res.status(200).json({
                status: 200,
                message: 'Change Request updated successfully.',
                data: populated
            });
        } catch (error) {
            console.error('Error updating admin CR:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    // DELETE /api/v1/admin/client-cr/:id
    async deleteCR(req, res) {
        try {
            const { id } = req.params;

            const cr = await ClientCR.findByIdAndDelete(id);
            if (!cr) {
                return res.status(404).json({ status: 404, message: 'Change Request not found.' });
            }

            return res.status(200).json({ status: 200, message: 'Change Request deleted successfully.' });
        } catch (error) {
            console.error('Error deleting admin CR:', error);
            return res.status(500).json({ status: 500, message: error.message });
        }
    }
}

module.exports = new AdminClientCRController();
