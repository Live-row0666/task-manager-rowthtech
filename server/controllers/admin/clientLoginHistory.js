const ClientLoginEvent = require('../../models/clientLoginEvent');
const Project = require('../../models/project');

async function getClientLoginHistory(req, res) {
    try {
        const role = req.user.role?.name;
        if (req.user.isActive === false || !['Project Manager', 'admin', 'sub-admin'].includes(role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const page = Math.max(1, Math.min(10000, parseInt(req.query.page, 10) || 1));
        const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 20));
        const query = { expiresAt: { $gt: new Date() } };
        let projectIds;
        if (role === 'Project Manager') {
            const projects = await Project.find({ isActive: true, $or: [{ createdBy: req.user._id }, { team: req.user._id }] })
                .select('_id').lean().maxTimeMS(3000);
            projectIds = projects.map(project => project._id);
            query.recipients = req.user._id;
            query.projects = { $in: projectIds };
        }
        const [items, total, recentCount] = await Promise.all([
            ClientLoginEvent.find(query).select('-recipients -expiresAt')
                .populate({ path: 'projects', select: 'name', ...(projectIds ? { match: { _id: { $in: projectIds } } } : {}) })
                .sort({ loggedInAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean().maxTimeMS(3000),
            ClientLoginEvent.countDocuments(query).maxTimeMS(3000),
            ClientLoginEvent.countDocuments({ ...query, loggedInAt: { $gte: new Date(Date.now() - 86400000) } }).maxTimeMS(3000)
        ]);
        res.json({ success: true, data: items, total, page, limit, recentCount });
    } catch (error) {
        console.error('Client login history failed:', error.message);
        res.status(500).json({ message: 'Unable to load client login history' });
    }
}
module.exports = { getClientLoginHistory };
