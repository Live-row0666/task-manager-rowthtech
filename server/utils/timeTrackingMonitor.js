const TimeTracking = require('../models/timeTracking');
const User = require('../models/user');
const Task = require('../models/task');
const NotificationService = require('./notificationService');
class TimeTrackingMonitor {
    constructor() {
        this.checkInterval = 60 * 1000; // Check every minute       
        this.longWorkingHoursThreshold = 8 * 60; // 5 hours
        this.notifiedSessions = new Set(); // Track already notified sessions
        // this.checkInterval = 10 * 1000; // Check  every 10 seconds      
        // this.longWorkingHoursThreshold = 1; // 2 minutes
        // this.notifiedSessions = new Set(); // Track already notified sessions
    }
    start() {
        console.log('Time tracking monitor started');
        setInterval(() => {
            this.checkLongWorkingSessions();
        }, this.checkInterval);
    }
    async checkLongWorkingSessions() {
        try {
            const currentDate = new Date();
            const today = new Date();
            const startTime = new Date(today.setUTCHours(4, 0, 0, 0));
            const endTime = new Date(today.setUTCHours(13, 30, 0, 0));
            // Check if outside office hours 
            if (currentDate < startTime || currentDate > endTime) {
                let allRunningSessions = await TimeTracking.find({ isComplete: false, isPaused: false });
                for (let session of allRunningSessions) {
                    session.isPaused = true;
                    session.pausePeriods.push({
                        startTime: new Date()
                    });
                    await session.save();
                    console.log(`Paused session ${session._id} due to non-office hours`);
                }

            } else {
                console.log(new Date(), "Office Hours - Checking for long working sessions...");

            }
            let curreptData = await TimeTracking.find({
                duration: 0,
                $or: [
                    { isComplete: true },
                    { endDate: { $exists: true } }
                ]
            });
            if (curreptData.length === 0) {
                console.log("No incomplete sessions found");
            }
            for (const session of curreptData) {
                await TimeTracking.deleteOne({ _id: session._id });
                console.log(`Deleted incomplete session: ${session._id}`);
            }
        } catch (error) {
            console.error('Error checking long working sessions:', error);
        }
    }
    // Clean up notified sessions when timer stops
    async cleanupNotifiedSession(userId, taskId, startTime) {
        const sessionKey = `${userId}-${taskId}-${startTime}`;
        this.notifiedSessions.delete(sessionKey);
    }
}

module.exports = new TimeTrackingMonitor();

// 🕘 Morning 9:30 AM (IST)
// IST: 2025-08-04 09:30:00
// UTC: 2025-08-04 04:00:00

// 🌆 Evening 7:00 PM (IST)
// IST: 2025-08-04 19:00:00
// UTC: 2025-08-04 13:30:00 

