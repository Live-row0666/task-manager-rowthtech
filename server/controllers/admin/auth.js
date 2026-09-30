const Role = require('../../models/role');
const User = require('../../models/user');
const { generateToken } = require('../../config/jwt');
const EncryptionService = require('../../utils/encryption');
const Attendance = require('../../models/attendance');
const { sendEmail } = require('../../config/nodemailer');
const { forgotPasswordTemplate, passwordResetSuccessTemplate } = require('../../templates/emailTemplates');
const crypto = require('crypto');


class AuthController {
    // User login
    /** @ Post : api/v1/auth/login */
    async login(req, res) {
        try {
            const { email, password, rememberMe } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    status: 400,
                    message: 'Email and password are required'
                });
            }


            const normalizedEmail = email ? email.trim().toLowerCase() : '';
            const user = await User.findOne({ email: new RegExp('^' + normalizedEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '$', 'i') }).select('password name designation profilePicture email contact role isActive').populate('role', 'name');
            if (!user || !EncryptionService.compare(password, user.password)) {
                return res.status(401).json({
                    status: 401,
                    message: 'Invalid email or password'
                });
            }
            if (user.isActive === false) {
                return res.status(403).json({
                    status: 403,
                    message: 'Your Account Is Deactivated.'
                });
            }

            if (user.role?.name === 'user') {
                return res.status(403).json({
                    status: 403,
                    message: 'Access denied. Only admin , sub-admin and QA can login here'
                });
            }

            const payload = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role.name,
                rememberMe: rememberMe
            }
            let loginTime = null;

            if (user.role.name === "sub-admin") {
                loginTime = new Date();
                const today = loginTime.toISOString().split("T")[0];

                user.lastLogin = loginTime;
                await user.save();

                const previousAttendance = await Attendance.findOne({
                    userId: user._id,
                    date: { $lt: today },
                    "sessions.logoutTime": null,
                }).sort({ date: -1 });

                if (previousAttendance) {

                    let totalSeconds = 0;

                    previousAttendance.sessions.forEach(session => {

                        if (!session.logoutTime) {
                            session.logoutTime = new Date(
                                `${previousAttendance.date}T23:59:59.999Z`
                            );
                        }

                        totalSeconds += Math.floor(
                            (new Date(session.logoutTime) - new Date(session.loginTime)) / 1000
                        );

                    });

                    previousAttendance.totalWorkingSeconds = totalSeconds;

                    const hrs = Math.floor(totalSeconds / 3600);
                    const mins = Math.floor((totalSeconds % 3600) / 60);
                    const secs = totalSeconds % 60;

                    previousAttendance.totalWorkingHours =
                        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

                    await previousAttendance.save();
                }

                let attendance = await Attendance.findOne({
                    userId: user._id,
                    date: today,
                });

                if (!attendance) {
                    attendance = new Attendance({
                        userId: user._id,
                        date: today,
                        sessions: [],
                        totalWorkingSeconds: 0,
                        totalWorkingHours: "00:00:00",
                    });
                }

                let activeSession = attendance.sessions.find(
                    session => session.logoutTime === null
                );

                if (activeSession) {

                    const oldLoginTime = new Date(activeSession.loginTime);
                    const autoLogoutTime = new Date(
                        oldLoginTime.getTime() + (9 * 60 * 60 * 1000)
                    );

                    const now = new Date();

                    if (now >= autoLogoutTime) {

                        activeSession.logoutTime = autoLogoutTime;

                        let totalSeconds = 0;

                        attendance.sessions.forEach(session => {
                            if (session.logoutTime) {
                                totalSeconds += Math.floor(
                                    (new Date(session.logoutTime) - new Date(session.loginTime)) / 1000
                                );
                            }
                        });

                        attendance.totalWorkingSeconds = totalSeconds;

                        const hrs = Math.floor(totalSeconds / 3600);
                        const mins = Math.floor((totalSeconds % 3600) / 60);
                        const secs = totalSeconds % 60;

                        attendance.totalWorkingHours =
                            `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

                        attendance.sessions.push({
                            loginTime: now,
                            logoutTime: null,
                        });

                        await attendance.save();
                    }

                } else {

                    attendance.sessions.push({
                        loginTime: loginTime,
                        logoutTime: null,
                    });

                    await attendance.save();
                }
            }
            const token = generateToken(payload);
            return res.status(200).json({
                status: 200,
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role.name,
                    profilePicture: user.profilePicture,
                    ...(user.role.name === "sub-admin" && { loginTime }),
                    designation: user.designation
                },
                token: token
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }



    async logout(req, res) {
        console.log("bcnvcxvcnbxvcxbn")
        try {
            const logoutTime = new Date();

            const user = await User.findById(req?.user?.id).populate("role");

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }

            user.lastLogout = logoutTime;
            await user.save();

            // Attendance calculation only for sub-admin
            if (user.role?.name === "sub-admin") {

                const today = logoutTime.toISOString().split("T")[0];

                const attendance = await Attendance.findOne({
                    userId: user._id,
                    date: today
                });

                if (attendance) {
                    const session = attendance.sessions[attendance.sessions.length - 1];

                    if (session && !session.logoutTime) {

                        session.logoutTime = logoutTime;

                        const loginTime = new Date(session.loginTime);

                        const workingSeconds = Math.floor(
                            (logoutTime.getTime() - loginTime.getTime()) / 1000
                        );

                        session.workingSeconds = workingSeconds;

                        const sh = Math.floor(workingSeconds / 3600);
                        const sm = Math.floor((workingSeconds % 3600) / 60);
                        const ss = workingSeconds % 60;

                        session.workingHours =
                            `${String(sh).padStart(2, "0")}:` +
                            `${String(sm).padStart(2, "0")}:` +
                            `${String(ss).padStart(2, "0")}`;

                        let totalSeconds = 0;

                        attendance.sessions.forEach((item) => {
                            totalSeconds += item.workingSeconds || 0;
                        });

                        attendance.totalWorkingSeconds = totalSeconds;

                        const hrs = Math.floor(totalSeconds / 3600);
                        const mins = Math.floor((totalSeconds % 3600) / 60);
                        const secs = totalSeconds % 60;

                        attendance.totalWorkingHours =
                            `${String(hrs).padStart(2, "0")}:` +
                            `${String(mins).padStart(2, "0")}:` +
                            `${String(secs).padStart(2, "0")}`;

                        await attendance.save();
                    }
                }
            }

            return res.status(200).json({
                status: 200,
                message: "Logged out successfully"
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                status: 500,
                message: "Internal server error",
                error: error.message
            });
        }
    }
    async getUserRole(req, res) {
        try {
            const roles = await Role.find({ name: { $nin: 'admin' } })
                .select('name description')
                .sort({ _id: -1 })
                .lean();
            if (!roles || roles.length === 0) {
                return res.status(404).json({
                    status: 404,
                    message: 'No roles found'
                });
            }
            return res.status(200).json({
                status: 200,
                message: 'Roles fetched successfully',
                roles: roles
            });


        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });

        }
    }

    // Forgot Password
    /** @ Post : api/v1/admin/auth/forgot-password */
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    status: 400,
                    message: 'Email is required'
                });
            }

            const user = await User.findOne({ email, isActive: true })
                .select('name email role')
                .populate('role', 'name');

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found or account is inactive'
                });
            }

            if (user.role.name === 'user') {
                return res.status(403).json({
                    status: 403,
                    message: 'Please use the user portal for password reset'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Encrypt the token before saving to database
            const encryptedToken = EncryptionService.encrypt(resetToken);

            // Set token and expiry (30 minutes)
            user.resetPasswordToken = encryptedToken;
            user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
            await user.save();

            // Create reset URL
            const resetUrl = `https://taskmanageradmin.rowthtech.com/account/reset-password/${resetToken}`;


            // Send email
            const emailTemplate = forgotPasswordTemplate(user, resetUrl);
            await sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });

            return res.status(200).json({
                status: 200,
                message: 'Password reset link sent to your email'
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Reset Password
    /** @ Post : api/v1/admin/auth/reset-password/:token */
    async resetPassword(req, res) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            if (!token || !password) {
                return res.status(400).json({
                    status: 400,
                    message: 'Token and new password are required'
                });
            }

            // Find user with valid reset token and not expired
            const user = await User.findOne({
                resetPasswordExpire: { $gt: Date.now() }
            }).populate('role', 'name');

            if (!user) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid or expired reset token'
                });
            }

            if (user.role.name === 'user') {
                return res.status(403).json({
                    status: 403,
                    message: 'Please use the user portal for password reset'
                });
            }

            // Verify token
            try {
                const decryptedToken = EncryptionService.decrypt(user.resetPasswordToken);
                if (token !== decryptedToken) {
                    return res.status(400).json({
                        status: 400,
                        message: 'Invalid reset token'
                    });
                }
            } catch (error) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid reset token'
                });
            }

            // Encrypt new password
            const encryptedPassword = EncryptionService.encrypt(password);

            // Update user password and clear reset token fields
            user.password = encryptedPassword;
            user.resetPasswordToken = null;
            user.resetPasswordExpire = null;
            await user.save();

            // Send success email
            const emailTemplate = passwordResetSuccessTemplate(user);
            await sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });

            return res.status(200).json({
                status: 200,
                message: 'Password reset successful'
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



module.exports = new AuthController();
