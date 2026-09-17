const SystemLogs = require('../../models/systemLogs');

class SystemLogsController {
    getLogs = async (req, res) => {
        try {
            const { page = 1, limit = 50, level, source } = req.query;
            const filter = {};
            
            if (level) filter.level = level;
            if (source) filter.source = { $regex: source, $options: 'i' };

            const logs = await SystemLogs.find(filter)
                .sort({ timestamp: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await SystemLogs.countDocuments(filter);

            res.status(200).json({
                status: 200,
                data: logs,
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
                message: 'Failed to fetch system logs'
            });
        }
    };

    clearLogs = async (req, res) => {
        try {
            const { olderThan } = req.body;
            const filter = olderThan ? { timestamp: { $lt: new Date(olderThan) } } : {};
            
            const result = await SystemLogs.deleteMany(filter);
            
            res.status(200).json({
                status: 200,
                message: `Deleted ${result.deletedCount} log entries`
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: 'Failed to clear logs'
            });
        }
    };
}

module.exports = new SystemLogsController();