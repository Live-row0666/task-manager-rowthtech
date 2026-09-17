const UserActivityLog = require('../../models/userActivityLog');

class UserActivityLogController {
    createlog = async (data) => {
        try {
            const logEntry = new UserActivityLog(data);
            await logEntry.save();

            // return res.status(201).json({
            //     status: 201,
            //     message: 'User activity log created successfully',
            //     data: logEntry
            // });
            console.log('User activity log created successfully:', logEntry);
        } catch (error) {
            console.error('Error creating user activity log:', error);
            // return res.status(500).json({
            //     status: 500,
            //     message: 'Internal server error'
            // });
        }
    }
};

module.exports = new UserActivityLogController();