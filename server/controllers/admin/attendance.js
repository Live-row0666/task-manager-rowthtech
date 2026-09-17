const UserActivityLog = require('../../models/userActivityLog');

class AttendanceController {
    async getAttendance(req, res) {
        try {
            const {
                type, 
                userId, 
                startDate,
                endDate
            } = req.query;

            let dateFilter = {};
            const now = new Date();

            switch (type) {
                case 'day':
                    dateFilter = {
                        loginTime: {
                            $gte: new Date(now.setHours(0, 0, 0, 0)),
                            $lt: new Date(now.setHours(23, 59, 59, 999))
                        }
                    };
                    break;

                case 'week':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    dateFilter = {
                        loginTime: {
                            $gte: new Date(weekStart.setHours(0, 0, 0, 0)),
                            $lt: new Date(now.setHours(23, 59, 59, 999))
                        }
                    };
                    break;

                case 'month':
                    dateFilter = {
                        loginTime: {
                            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
                        }
                    };
                    break;

                case 'custom':
                    if (!startDate || !endDate) {
                        return res.status(400).json({
                            success: false,
                            message: 'Start date and end date are required for custom range'
                        });
                    }
                    dateFilter = {
                        loginTime: {
                            $gte: new Date(startDate),
                            $lt: new Date(endDate)
                        }
                    };
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid type parameter'
                    });
            }

            // Add userId filter if provided
            if (userId) {
                dateFilter.userId = userId;
            }

            // Get all login/logout records for the period
            const attendance = await UserActivityLog.find(dateFilter)
                .populate('userId', 'name email')
                .select('userId loginTime logoutTime status')
                .sort({ loginTime: -1 });

            // Group records by user and date
            const groupedAttendance = attendance.reduce((acc, record) => {
                const userId = record.userId._id.toString();
                const date = record.loginTime.toISOString().split('T')[0];
                const key = `${userId}-${date}`;
                
                if (!acc[key]) {
                    acc[key] = {
                        userId: record.userId,
                        date: date,
                        sessions: []
                    };
                }
                
                acc[key].sessions.push({
                    loginTime: record.loginTime,
                    logoutTime: record.logoutTime,
                    status: record.status
                });
                
                return acc;
            }, {});

            return res.status(200).json({
                success: true,
                data: Object.values(groupedAttendance)
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AttendanceController();
