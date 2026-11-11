const User = require('../../models/user');
const Client = require('../../models/client');
const { generateToken } = require('../../config/jwt');
const { createlog } = require('../../controllers/user/userActivityLog');
const EncryptionService = require('../../utils/encryption');
const { sendEmail } = require('../../config/nodemailer');
const Attendance = require('../../models/attendance');
const { forgotPasswordTemplate, passwordResetSuccessTemplate } = require('../../templates/emailTemplates');
const crypto = require('crypto');
const { recordClientLogin } = require('../../utils/clientLoginAudit');

class ClinetAuthController {

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: 400,
                    message: "Email and password are required",
                });
            }

            const user = await Client.findOne({
                loginEmail: email,
                status: "active",
            })
                .select("password name email loginEmail role projects")
                .populate("role", "name");

            if (!user || !EncryptionService.compare(password, user.password)) {
                return res.status(401).json({
                    status: 401,
                    message: "Invalid email or password",
                });
            }

            if (!user.role) {
                return res.status(400).json({
                    status: 400,
                    message: "Role not assigned to client",
                });
            }

            if (user.role.name !== "Client") {
                return res.status(403).json({
                    status: 403,
                    message: "Access denied. Only client can login here",
                });
            }

            // Login Time
            const loginTime = new Date();
            // Update Last Login
            user.lastLogin = loginTime;
            await user.save();


            // Today's Date
            const today = loginTime.toISOString().split("T")[0];

            // Find today's attendance


            // JWT
            const token = generateToken({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role.name,

            });

            // Audit failures must not turn valid credentials into a failed login.
            try { await recordClientLogin(req, user); }
            catch (error) { console.error('Client login audit failed:', error.message); }

            return res.status(200).json({
                status: 200,
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    contact: user.contact,
                    role: user.role.name,
                    designation: user.designation,

                },
            });

        } catch (error) {
            console.error("LOGIN ERROR:", error);

            return res.status(500).json({
                status: 500,
                message: "Internal server error",
                error: error.message,
            });
        }
    }
    // User login
    /** @ Post : api/v1/user/auth/login */
    // async login(req, res) {
    //     try {
    //         const { email, password } = req.body;
    //         if (!email || !password) {
    //             return res.status(400).json({
    //                 status: 400,
    //                 message: 'Email and password are required'
    //             });
    //         }

    //         const user = await User.findOne({ email, isActive: true })
    //             .select('password name email contact role designation profilePicture')
    //             .populate('role', 'name');

    //         if (!user || !EncryptionService.compare(password, user.password)) {
    //             return res.status(401).json({
    //                 status: 401,
    //                 message: 'Invalid email or password'
    //             });
    //         }

    //         if (user.role.name !== 'user') {
    //             return res.status(403).json({
    //                 status: 403,
    //                 message: 'Access denied. Only users can login here'
    //             });
    //         }

    //         // Update last login
    //         user.lastLogin = new Date();
    //         await user.save();

    //         const payload = {
    //             id: user._id,
    //             name: user.name,
    //             email: user.email,
    //             role: user.role.name
    //         };

    //         const token = generateToken(payload);

    //         res.status(200).json({
    //             status: 200,
    //             message: 'Login successful',
    //             user: {
    //                 id: user._id,
    //                 name: user.name,
    //                 email: user.email,
    //                 contact: user.contact,
    //                 role: user.role.name,
    //                 designation: user.designation,
    //                 profilePicture: user.profilePicture
    //             },
    //             token: token
    //         });
    //         let data = {
    //             userId: user._id,
    //             loginTime: new Date(),
    //             ipAddress: req.ip,
    //             userAgent: req.headers['user-agent'],
    //             status: 'logged_in'
    //         }
    //         await createlog(data);
    //     } catch (error) {
    //         return res.status(500).json({
    //             status: 500,
    //             message: 'Internal server error',
    //             error: error.message
    //         });
    //     }
    // }

    // Get user profile
    /** @ Get : api/v1/user/auth/profile */
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id)
                .select('-password')
                .populate('role', 'name')
                .populate('technology', 'name')
                .populate('techCategories', 'name');

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                status: 200,
                message: 'Profile fetched successfully',
                user: user
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: error.message
            });

        }
    }

    // User logout
    /** @ Post : api/v1/user/auth/logout */
    // async logout(req, res) {
    //     try {
    //         // Update last logout time
    //         const user = await User.findById(req.user.id);
    //         user.lastLogout = new Date();
    //         await user.save();

    //         res.status(200).json({
    //             status: 200,
    //             message: 'Logged out successfully'
    //         });
    //         let data = {
    //             userId: user._id,
    //             logoutTime: new Date(),
    //             ipAddress: req.ip,
    //             userAgent: req.headers['user-agent'],
    //             status: 'logged_out'
    //         }
    //         await createlog(data);
    //     } catch (error) {
    //         return res.status(500).json({
    //             status: 500,
    //             message: 'Internal server error',
    //             error: error.message
    //         });
    //     }
    // }


    async logout(req, res) {
        try {
            const logoutTime = new Date();

            const user = await User.findById(req?.user?.id);

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: "User not found"
                });
            }

            user.lastLogout = logoutTime;
            await user.save();

            const today = logoutTime.toISOString().split("T")[0];

            const attendance = await Attendance.findOne({
                userId: user._id,
                date: today
            });

            if (!attendance) {
                return res.status(404).json({
                    status: 404,
                    message: "Attendance not found"
                });
            }

            // Get current active session
            const session = attendance.sessions[attendance.sessions.length - 1];

            if (!session || session.logoutTime) {
                return res.status(400).json({
                    status: 400,
                    message: "No active login session found"
                });
            }

            // Save logout time
            session.logoutTime = logoutTime;

            // Calculate current session working seconds
            const loginTime = new Date(session.loginTime);

            const workingSeconds = Math.floor(
                (logoutTime.getTime() - loginTime.getTime()) / 1000
            );

            session.workingSeconds = workingSeconds;

            // HH:MM:SS for this session
            const sh = Math.floor(workingSeconds / 3600);
            const sm = Math.floor((workingSeconds % 3600) / 60);
            const ss = workingSeconds % 60;

            session.workingHours =
                `${String(sh).padStart(2, "0")}:` +
                `${String(sm).padStart(2, "0")}:` +
                `${String(ss).padStart(2, "0")}`;

            // Calculate today's total working seconds
            let totalSeconds = 0;

            attendance.sessions.forEach((item) => {
                totalSeconds += item.workingSeconds || 0;
            });

            attendance.totalWorkingSeconds = totalSeconds;

            // Convert total to HH:MM:SS
            const hrs = Math.floor(totalSeconds / 3600);
            const mins = Math.floor((totalSeconds % 3600) / 60);
            const secs = totalSeconds % 60;

            attendance.totalWorkingHours =
                `${String(hrs).padStart(2, "0")}:` +
                `${String(mins).padStart(2, "0")}:` +
                `${String(secs).padStart(2, "0")}`;

            await attendance.save();

            return res.status(200).json({
                status: 200,
                message: "Logged out successfully",
                sessionWorkingHours: session.workingHours,
                totalWorkingHours: attendance.totalWorkingHours,
                totalWorkingSeconds: attendance.totalWorkingSeconds
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
    // Forgot Password
    /** @ Post : api/v1/user/auth/forgot-password */
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    status: 400,
                    message: 'Email is required'
                });
            }


            const user = await Client.findOne({ loginEmail: email })
                .select('name loginEmail role')
                .populate('role', 'name');

            if (!user) {
                return res.status(404).json({
                    status: 404,
                    message: 'User not found or account is inactive'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');

            // Encrypt the token before saving to database
            const encryptedToken = EncryptionService.encrypt(resetToken);

            // Set token and expiry (30 minutes)
            user.resetPasswordToken = encryptedToken;
            user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; 
            await user.save();

            const resetUrl = `https://taskmanagerclient.rowthtech.com/account/reset-password/${resetToken}`;

          
            const emailTemplate = forgotPasswordTemplate(user, resetUrl);
            await sendEmail({
                to: user.loginEmail,
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
    /** @ Post : api/v1/user/auth/reset-password/:token */
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
            const user = await Client.findOne({
                resetPasswordExpire: { $gt: Date.now() }
            }).populate('role', 'name');

            if (!user) {
                return res.status(400).json({
                    status: 400,
                    message: 'Invalid or expired reset token'
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
                to: user.loginEmail,
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

module.exports = new ClinetAuthController();
