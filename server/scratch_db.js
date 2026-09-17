const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const TimeTracking = require('./models/timeTracking');
const User = require('./models/user');

async function test() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB successfully.");
        
        const dateStr = "2026-07-16";
        const startOfDay = new Date(dateStr);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(dateStr);
        endOfDay.setHours(23, 59, 59, 999);

        console.log("Query range in local timezone:", startOfDay, "to", endOfDay);
        console.log("Query range in UTC:", startOfDay.toISOString(), "to", endOfDay.toISOString());

        const users = await User.find({ isActive: true }).select('name email').lean();
        console.log(`Fetched ${users.length} active users.`);

        const userIds = users.map(u => u._id);
        const timeTrackings = await TimeTracking.find({
            user: { $in: userIds },
            startTime: { $gte: startOfDay, $lte: endOfDay }
        }).lean();

        console.log(`Found ${timeTrackings.length} time tracking entries in query range.`);
        
        // Let's also print ALL time trackings created today (regardless of local timezone math)
        const allTodayTT = await TimeTracking.find({
            createdAt: { $gte: new Date("2026-07-16T00:00:00Z") }
        }).populate('user', 'name').lean();
        
        console.log(`\nAll TimeTracking entries in DB starting/created from 2026-07-16T00:00:00Z (UTC):`);
        allTodayTT.forEach(tt => {
            console.log({
                user: tt.user ? tt.user.name : 'Unknown',
                startTime: tt.startTime,
                endTime: tt.endTime,
                duration: tt.duration,
                isActive: tt.isActive,
                isPaused: tt.isPaused,
                isComplete: tt.isComplete
            });
        });

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
