const cron = require("node-cron");
const Attendance = require("../models/attendance");

const startAutoLogoutCron = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const attendances = await Attendance.find({
                "sessions.logoutTime": null,
            });

            const now = new Date();

            for (const attendance of attendances) {
                let updated = false;
                let totalSeconds = 0;

                attendance.sessions.forEach((session) => {
                    if (!session.logoutTime) {
                        const autoLogout = new Date(
                            new Date(session.loginTime).getTime() +
                            9 * 60 * 60 * 1000
                        );

                        if (now >= autoLogout) {
                            session.logoutTime = autoLogout;
                            updated = true;
                        }
                    }

                    if (session.logoutTime) {
                        totalSeconds += Math.floor(
                            (new Date(session.logoutTime) -
                                new Date(session.loginTime)) / 1000
                        );
                    }
                });

                if (updated) {
                    attendance.totalWorkingSeconds = totalSeconds;

                    const hrs = Math.floor(totalSeconds / 3600);
                    const mins = Math.floor((totalSeconds % 3600) / 60);
                    const secs = totalSeconds % 60;

                    attendance.totalWorkingHours =
                        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

                    await attendance.save();
                }
            }
        } catch (err) {
            console.log(err);
        }
    });

    console.log("✅ Auto Logout Cron Started");
};

module.exports = startAutoLogoutCron;