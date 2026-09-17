const User = require('../../models/user');
const Role = require('../../models/role');
const NotificationService = require('../../utils/notificationService');
const EncryptionService = require('../../utils/encryption');
const Attendance = require("../../models/attendance");
const TimeTracking = require('../../models/timeTracking');
const moment = require("moment-timezone");
const Task = require("../../models/task");
// Helper to calculate exact time tracking duration (in seconds)
function calculateTimeTrackingSeconds(entry) {
    if (!entry.startTime) return 0;

    const startTime = new Date(entry.startTime).getTime();
    const totalPausedTime = entry.totalPausedTime || 0;

    if (entry.isComplete || entry.endTime) {
        const endTime = new Date(entry.endTime).getTime();
        return Math.max(0, Math.floor((endTime - startTime - totalPausedTime) / 1000));
    }

    // It's still active/running/paused
    const now = new Date().getTime();
    if (entry.isPaused && entry.pausePeriods && entry.pausePeriods.length > 0) {
        const lastPause = entry.pausePeriods[entry.pausePeriods.length - 1];
        if (lastPause.startTime && !lastPause.endTime) {
            const lastPauseStart = new Date(lastPause.startTime).getTime();
            return Math.max(0, Math.floor((lastPauseStart - startTime - totalPausedTime) / 1000));
        }
    }

    return Math.max(0, Math.floor((now - startTime - totalPausedTime) / 1000));
}

// Helper to calculate exact attendance duration (in seconds)
function calculateAttendanceSeconds(attendance, attendanceDate) {
    if (!attendance) return 0;

    let totalSeconds = 0;
    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = (attendanceDate === todayStr);

    if (attendance.sessions && attendance.sessions.length > 0) {
        attendance.sessions.forEach(session => {
            if (session.logoutTime) {
                if (session.workingSeconds) {
                    totalSeconds += session.workingSeconds;
                } else {
                    const loginTime = new Date(session.loginTime).getTime();
                    const logoutTime = new Date(session.logoutTime).getTime();
                    totalSeconds += Math.max(0, Math.floor((logoutTime - loginTime) / 1000));
                }
            } else if (isToday) {
                const loginTime = new Date(session.loginTime).getTime();
                const now = new Date().getTime();
                totalSeconds += Math.max(0, Math.floor((now - loginTime) / 1000));
            }
        });
    }

    return totalSeconds;
}

// Helper to format seconds to HH:MM:SS
function formatSecondsToHMS(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

class UserController {
    // create a new user
    /** @ Post : api/v1/admin/user/ */
    async createUser(req, res) {
        try {
            const data = req.body;
            if (!data.email && !data.name && !data.password) {
                return res.status(400).json({
                    status: 400,
                    message: 'Email, name and password are required'
                });
            }
            const checkRole = await Role.findById(data.role).select('name');
            if (checkRole.name !== 'user') {
                data.userType = 'Marketing'
            } else {
                data.userType = 'Tech'
            }
            const existingUser = await User.findOne({
                $or: [
                    { email: data.email },
                    { contact: data.contact }
                ]
            });
            if (existingUser) {
                return res.status(400).json({
                    status: 400,
                    message: 'User already exists with this email or contact'
                });
            }
            const plainPassword = data.password;
            data.password = EncryptionService.encrypt(data.password);
            const newUser = await User.create(data);
            const populatedUser = await User.findById(newUser._id)
                .populate('role', 'name')
                .populate('technology', 'name');

            // Send welcome email to user
            await NotificationService.sendWelcomeEmail({
                name: populatedUser.name,
                email: populatedUser.email,
                designation: populatedUser.designation,
                role: populatedUser.role.name
            }, plainPassword);

            // Send notification to admins
            // await NotificationService.sendUserCreatedAdminEmail({
            //     name: populatedUser.name,
            //     email: populatedUser.email,
            //     contact: populatedUser.contact,
            //     designation: populatedUser.designation,
            //     role: populatedUser.role.name,
            //     technologies: populatedUser.technology?.map(t => t.name).join(', ')
            // }, req.user.name);

            return res.status(201).json({
                status: 201,
                message: 'User created successfully',
            });

        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // update user
    /** @ Put : api/v1/admin/user/:id */
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    status: 400,
                    message: 'User ID is required'
                });
            }
            const data = req.body;

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found'
                });
            }

            // Encrypt password if provided
            if (data.password) {
                data.password = EncryptionService.encrypt(data.password);
            }

            const oldUser = await User.findById(id).populate('role', 'name');
            await User.findByIdAndUpdate(id, data);

            // Check if user was deactivated
            if (oldUser.isActive && data.isActive === false) {
                await NotificationService.sendUserDeactivatedEmail({
                    name: oldUser.name,
                    email: oldUser.email,
                    designation: oldUser.designation
                }, req.user.name);
            }

            return res.status(200).json({
                status: 200,
                message: 'User updated successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // get all users


    async getAllUsers(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                userType,
                isActive,
                date
            } = req.query;

            // const admin = await Role.findOne({ name: 'admin' });

            let searchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ],
                // role: { $ne: admin._id }
            };

            // if (userType && userType !== 'All' && userType.trim() !== '') {
            //     if (userType === 'Marketing') {
            //         searchQuery.userType = { $in: ['Marketing', 'Sales'] };
            //     } else {
            //         searchQuery.userType = userType;
            //     }
            // }

            if (isActive && isActive !== 'All' && isActive.trim() !== '') {
                searchQuery.isActive = isActive === 'true';
            }

            const users = await User.find(searchQuery)
                .select("-__v")
                .populate("role", "name")
                .populate("technology", "name")
                .populate("techCategories", "name")
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ name: 1 })
                .lean();
            // ==========================
            // Attendance (Date Wise)
            // ==========================
            const attendanceDate = date || new Date().toISOString().split("T")[0];


            const attendances = await Attendance.find({
                date: attendanceDate,
                userId: {
                    $in: users.map(user => user._id)
                }
            }).lean();

            const attendanceMap = {};

            attendances.forEach(attendance => {
                attendanceMap[attendance.userId.toString()] = attendance;
            });

            // ==========================
            // Time Tracking (Date Wise)
            // ==========================
            const startOfDay = new Date(attendanceDate);

            startOfDay.setHours(0, 0, 0, 0);

            console.log(attendanceDate, attendances, startOfDay, "attendanceDate")

            const endOfDay = new Date(attendanceDate);
            endOfDay.setHours(23, 59, 59, 999);

            const timeTrackings = await TimeTracking.find({
                user: { $in: users.map(user => user._id) },
                startTime: { $gte: startOfDay, $lte: endOfDay }
            }).lean();

            console.log(timeTrackings, "timeTrackings")
            // Write debug logs to a local file for diagnosis
            try {
                const fs = require('fs');
                const debugInfo = {
                    timestamp: new Date().toISOString(),
                    attendanceDate,
                    startOfDay: startOfDay.toISOString(),
                    endOfDay: endOfDay.toISOString(),
                    userIds: users.map(user => user._id.toString()),
                    timeTrackingsCount: timeTrackings.length,
                    timeTrackings: timeTrackings.map(tt => ({
                        id: tt._id,
                        user: tt.user,
                        startTime: tt.startTime,
                        createdAt: tt.createdAt,
                        duration: tt.duration,
                        isActive: tt.isActive,
                        isComplete: tt.isComplete
                    })),
                    allTimeTrackingsForUsers: (await TimeTracking.find({ user: { $in: users.map(u => u._id) } }).lean()).map(tt => ({
                        id: tt._id,
                        user: tt.user,
                        startTime: tt.startTime,
                        createdAt: tt.createdAt,
                        duration: tt.duration,
                        isActive: tt.isActive,
                        isComplete: tt.isComplete
                    }))
                };
                fs.writeFileSync('/home/rowth/Desktop/TASK_MANAGER/server/debug.log', JSON.stringify(debugInfo, null, 4));
            } catch (e) {
                console.error("Debug write failed", e);
            }

            const userTimeTrackingsMap = {};
            timeTrackings.forEach(tt => {
                const userId = tt.user.toString();
                if (!userTimeTrackingsMap[userId]) {
                    userTimeTrackingsMap[userId] = [];
                }
                userTimeTrackingsMap[userId].push(tt);
            });

            users.forEach(user => {
                if (user.password) {
                    user.password = EncryptionService.decrypt(user.password);
                }

                const attendance = attendanceMap[user._id.toString()];
                const userTTs = userTimeTrackingsMap[user._id.toString()] || [];

                let workingSeconds = 0;
                if (attendance) {
                    workingSeconds = calculateAttendanceSeconds(attendance, attendanceDate);
                    // Total Login Count
                    user.loginCount = attendance.sessions?.length || 0;
                    // Login Times
                    user.loginTimes = attendance.sessions?.map(session => ({
                        loginTime: session.loginTime,
                        logoutTime: session.logoutTime
                    })) || [];
                } else {
                    user.loginCount = 0;
                    user.loginTimes = [];
                }

                let productiveSeconds = 0;
                userTTs.forEach(tt => {
                    productiveSeconds += calculateTimeTrackingSeconds(tt);
                });

                const idleSeconds = Math.max(0, workingSeconds - productiveSeconds);

                user.totalWorkingHours = formatSecondsToHMS(workingSeconds);
                user.totalProductiveHours = formatSecondsToHMS(productiveSeconds);
                user.totalIdleHours = formatSecondsToHMS(idleSeconds);
            });

            const count = await User.countDocuments(searchQuery);

            console.log(users, "uuuuuuuuuuuuu")
            return res.status(200).json({
                status: 200,
                message: "Users retrieved successfully",
                data: users,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page),
                totalUsers: count
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: "Internal server error",
                error: error.message
            });
        }
    }

    /** @ Get : api/v1/admin/user */
    // async getAllUsers(req, res) {
    //     try {
    //         const { page = 1, limit = 10, search = '', userType, isActive } = req.query;
    //         // const admin = await Role.findOne({ name: 'admin' });
    //         let searchQuery = {
    //             $or: [
    //                 { name: { $regex: search, $options: 'i' } },
    //                 { email: { $regex: search, $options: 'i' } }
    //             ],
    //             // role: { $ne: admin._id }
    //         };
    //         // if (userType && userType !== 'All' && userType.trim() !== '') {
    //         //     if(userType === 'Marketing') {
    //         //         searchQuery.userType = { $in: ['Marketing', 'Sales'] };
    //         //     } else {
    //         //         searchQuery.userType = userType;
    //         //     }
    //         // }
    //         if (isActive && isActive !== 'All' && isActive.trim() !== '') {
    //             searchQuery.isActive = isActive === 'true';
    //         }

    //         const users = await User.find(searchQuery)
    //             .select("-__v")
    //             .populate('role', 'name')
    //             .populate('technology', 'name')
    //             .populate('techCategories', 'name')
    //             .limit(limit * 1)
    //             .skip((page - 1) * limit)
    //             .sort({ name: 1 })
    //             .lean();

    //         // Decrypt passwords
    //         users.forEach(user => {
    //             if (user.password) {
    //                 user.password = EncryptionService.decrypt(user.password);
    //             }
    //         });

    //         const count = await User.countDocuments(searchQuery);

    //         return res.status(200).json({
    //             status: 200,
    //             message: 'Users retrieved successfully',
    //             data: users,
    //             totalPages: Math.ceil(count / limit),
    //             currentPage: page,
    //             totalUsers: count
    //         });
    //     } catch (error) {
    //         return res.status(500).json({
    //             status: 500,
    //             message: 'Internal server error',
    //             error: error.message
    //         });
    //     }
    // }

    // get single user
    /** @ Get : api/v1/admin/user/:id */
    async getSingleUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id)
                .populate('role', 'name')
                .populate('technology', 'name')
                .populate('techCategories', 'name')
                .lean();

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found'
                });
            }

            // Decrypt password for response
            if (user.password) {
                user.password = EncryptionService.decrypt(user.password);
            }

            // Remove sensitive fields
            delete user.__v;

            return res.status(200).json({
                status: 200,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // get user stats by ID and date
    //   async getUserStats(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const { month } = req.query; // YYYY-MM

    //         const user = await User.findById(id)
    //             .populate("role", "name")
    //             .lean();

    //         if (!user) {
    //             return res.status(404).json({
    //                 status: 404,
    //                 message: "User not found"
    //             });
    //         }

    //         const [year, mon] = month.split("-");

    //         const startDate = `${year}-${mon}-01`;

    //         const lastDay = new Date(year, mon, 0).getDate();

    //         const endDate = `${year}-${mon}-${String(lastDay).padStart(2, "0")}`;

    //         const attendances = await Attendance.find({
    //             userId: id,
    //             date: {
    //                 $gte: startDate,
    //                 $lte: endDate
    //             }
    //         }).sort({ date: 1 }).lean();

    //         const attendanceList = [];

    //         for (const attendance of attendances) {

    //             const startOfDay = new Date(attendance.date);
    //             startOfDay.setHours(0,0,0,0);

    //             const endOfDay = new Date(attendance.date);
    //             endOfDay.setHours(23,59,59,999);

    //             const timeTrackings = await TimeTracking.find({
    //                 user: id,
    //                 startTime:{
    //                     $gte:startOfDay,
    //                     $lte:endOfDay
    //                 }
    //             }).lean();

    //             const workingSeconds = calculateAttendanceSeconds(
    //                 attendance,
    //                 attendance.date
    //             );

    //             let productiveSeconds = 0;

    //             timeTrackings.forEach(tt=>{
    //                 productiveSeconds += calculateTimeTrackingSeconds(tt);
    //             });

    //             attendanceList.push({
    //                 date: attendance.date,
    //                 totalWorkingHours: formatSecondsToHMS(workingSeconds),
    //                 totalProductiveHours: formatSecondsToHMS(productiveSeconds),
    //                 totalIdleHours: formatSecondsToHMS(
    //                     Math.max(0, workingSeconds - productiveSeconds)
    //                 ),
    //                 sessions: attendance.sessions
    //             });
    //         }

    //         return res.status(200).json({
    //             status:200,
    //             data:{
    //                 user,
    //                 attendanceList
    //             }
    //         });

    //     } catch(err){
    //         return res.status(500).json({
    //             status:500,
    //             error:err.message
    //         });
    //     }
    // }

    async getUserStats(req, res) {
        try {
            const { id } = req.params;
            const { month } = req.query;

            const user = await User.findById(id)
                .populate("role", "name")
                .lean();

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found",
                });
            }

            const [year, mon] = month.split("-");

            const startDate = `${year}-${mon}-01`;
            const lastDay = new Date(year, mon, 0).getDate();
            const endDate = `${year}-${mon}-${String(lastDay).padStart(2, "0")}`;

            const attendances = await Attendance.find({
                userId: id,
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
                .sort({ date: 1 })
                .lean();

            const attendanceList = [];

            for (const attendance of attendances) {

                // attendance.date => YYYY-MM-DD (IST)
                const startOfDay = moment
                    .tz(attendance.date, "YYYY-MM-DD", "Asia/Kolkata")
                    .startOf("day")
                    .utc()
                    .toDate();

                const endOfDay = moment
                    .tz(attendance.date, "YYYY-MM-DD", "Asia/Kolkata")
                    .endOf("day")
                    .utc()
                    .toDate();

                const workingSeconds = calculateAttendanceSeconds(
                    attendance,
                    attendance.date
                );

                const timeTrackings = await TimeTracking.find({
                    user: id,
                    startTime: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                }).lean();

                let productiveSeconds = 0;

                timeTrackings.forEach((tt) => {
                    productiveSeconds += calculateTimeTrackingSeconds(tt);
                });

                const tasks = await Task.find({
                    assignee: id,
                    startDate: {
                        $gte: startOfDay,
                        $lte: endOfDay,
                    },
                    isActive: true,
                })
                    .populate("project", "name")
                    .populate("milestone", "title")
                    .populate("sprint", "name")
                    .lean();

                  
                const taskDetails = tasks.map((task) => ({
                    _id: task._id,
                    taskName: task.summary,
                    startDate: task.startDate,   // <-- add this
                    dueDate: task.dueDate,
                    project: task.project?.name || "-",
                    milestone: task.milestone?.title || "-",
                    sprint: task.sprint?.name || "-",
                    priority: task.priority,
                    status: task.status,
                    estimatedTime: task.estimatedTime,
                    completionTime: task.completionTime,
                    productiveTime: formatSecondsToHMS(
                        Math.floor((task.timeSpent || 0) / 1000)
                    ),
                    timeSpent: task.timeSpent,
                }));
                attendanceList.push({
                    date: attendance.date,
                    totalWorkingHours: formatSecondsToHMS(workingSeconds),
                    totalProductiveHours: formatSecondsToHMS(productiveSeconds),
                    totalIdleHours: formatSecondsToHMS(
                        Math.max(0, workingSeconds - productiveSeconds)
                    ),
                    sessions: attendance.sessions || [],
                    tasks: taskDetails,
                });
            }

            return res.status(200).json({
                status: 200,
                message: "User statistics fetched successfully",
                data: {
                    user,
                    attendanceList,
                },
            });

        } catch (err) {
            console.log(err);

            return res.status(500).json({
                status: 500,
                error: err.message,
            });
        }
    }

    // async getUserStats(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const { month } = req.query;

    //         const user = await User.findById(id)
    //             .populate("role", "name")
    //             .lean();

    //         if (!user) {
    //             return res.status(404).json({
    //                 status: 404,
    //                 message: "User not found",
    //             });
    //         }

    //         const [year, mon] = month.split("-");

    //         const startDate = `${year}-${mon}-01`;
    //         const lastDay = new Date(year, mon, 0).getDate();
    //         const endDate = `${year}-${mon}-${String(lastDay).padStart(2, "0")}`;

    //         const attendances = await Attendance.find({
    //             userId: id,
    //             date: {
    //                 $gte: startDate,
    //                 $lte: endDate,
    //             },
    //         })
    //             .sort({ date: 1 })
    //             .lean();

    //         const attendanceList = [];

    //         for (const attendance of attendances) {

    //             const startOfDay = new Date(attendance.date);
    //             startOfDay.setHours(0, 0, 0, 0);

    //             const endOfDay = new Date(attendance.date);
    //             endOfDay.setHours(23, 59, 59, 999);

    //             // Working hours
    //             const workingSeconds = calculateAttendanceSeconds(
    //                 attendance,
    //                 attendance.date
    //             );

    //             // Time Tracking
    //             const timeTrackings = await TimeTracking.find({
    //                 user: id,
    //                 startTime: {
    //                     $gte: startOfDay,
    //                     $lte: endOfDay,
    //                 },
    //             }).lean();

    //             let productiveSeconds = 0;

    //             timeTrackings.forEach((tt) => {
    //                 productiveSeconds += calculateTimeTrackingSeconds(tt);
    //             });

    //             // Tasks
    //             const tasks = await Task.find({
    //                 assignee: id,
    //                 startDate: {
    //                     $gte: startOfDay,
    //                     $lte: endOfDay,
    //                 },
    //                 isActive: true,
    //             })
    //                 .populate("project", "name")
    //                 .populate("milestone", "title")
    //                 .populate("sprint", "name")
    //                 .lean();

    //             const taskDetails = tasks.map((task) => ({
    //                 _id: task._id,
    //                 taskName: task.summary,
    //                 project: task.project?.name || "-",
    //                 milestone: task.milestone?.title || "-",
    //                 sprint: task.sprint?.name || "-",
    //                 priority: task.priority,
    //                 status: task.status,
    //                 estimatedTime: task.estimatedTime,
    //                 completionTime: task.completionTime,
    //                 productiveTime: formatSecondsToHMS(
    //                     Math.floor((task.timeSpent || 0) / 1000)
    //                 ),
    //                 timeSpent: task.timeSpent,
    //                 dueDate: task.dueDate,
    //             }));

    //             attendanceList.push({
    //                 date: attendance.date,
    //                 totalWorkingHours: formatSecondsToHMS(workingSeconds),
    //                 totalProductiveHours: formatSecondsToHMS(productiveSeconds),
    //                 totalIdleHours: formatSecondsToHMS(
    //                     Math.max(0, workingSeconds - productiveSeconds)
    //                 ),
    //                 sessions: attendance.sessions || [],
    //                 tasks: taskDetails,
    //             });
    //         }

    //         return res.status(200).json({
    //             status: 200,
    //             message: "User statistics fetched successfully",
    //             data: {
    //                 user,
    //                 attendanceList,
    //             },
    //         });

    //     } catch (err) {
    //         console.log(err);

    //         return res.status(500).json({
    //             status: 500,
    //             error: err.message,
    //         });
    //     }
    // }
    // delete user
    /** @ Delete : api/v1/admin/user/:id */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found'
                });
            }

            await User.findByIdAndDelete(id);
            return res.status(200).json({
                status: 200,
                message: 'User deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = new UserController();
