const welcomeUserTemplate = (userData, password) => {
    return {
        subject: '🎉 Welcome to RowthTech Task Manager!',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .header p { margin: 10px 0 0; opacity: 0.9; }
                .content { padding: 40px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .credentials { background: #f8f9ff; padding: 25px; border-radius: 10px; border-left: 5px solid #667eea; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .credentials h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; margin: 20px 0; font-weight: 500; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3); transition: all 0.3s ease; }
                .button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4); }
                ul { padding-left: 20px; }
                li { margin-bottom: 8px; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .security-note { background: #fff8e1; padding: 15px; border-radius: 8px; border-left: 5px solid #ffc107; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 Welcome to RowthTech</h1>
                    <p>Task Manager Platform</p>
                </div>
                <div class="content">
                    <h2><span class="emoji">👋</span>Hello ${userData.name}!</h2>
                    <p>Welcome to the RowthTech Task Manager! We're excited to have you join our team as a <strong>${userData.designation}</strong>.</p>
                    
                    <div class="credentials">
                        <h3><span class="emoji">🔐</span> Your Login Credentials</h3>
                        <p><strong>Email:</strong> ${userData.email}</p>
                        <p><strong>Password:</strong> ${password}</p>
                        <p><strong>Role:</strong> ${userData.role}</p>
                    </div>
                    
                    <p><span class="emoji">🎯</span> <strong>What you can do:</strong></p>
                    <ul>
                        <li>Track your work time efficiently</li>
                        <li>Collaborate on projects and tasks</li>
                        <li>Receive real-time notifications</li>
                        <li>Comment and communicate with team members</li>
                        <li>Monitor your productivity and progress</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="${userData.role === 'user' ? 'https://taskmanagerteam.rowthtech.com/account' : 'https://taskmanageradmin.rowthtech.com/account'}/login" class="button">🚀 Login to Dashboard</a>
                    </div>
                    
                    <div class="security-note">
                        <p><strong>⚠️ Security Note:</strong> Please change your password after first login for security.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>Best regards,<br><strong>RowthTech Team</strong></p>
                    <p>Need help? Contact us at support@rowthtech.com</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const taskAssignmentTemplate = (userData, taskData, projectData) => {
    return {
        subject: `📝 New Task Assigned: ${taskData.summary}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .task-info { background: #fff8f0; padding: 25px; border-radius: 10px; border-left: 5px solid #FF9800; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .task-info h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .priority-high { color: #e74c3c; font-weight: 600; background: #ffebee; padding: 3px 8px; border-radius: 4px; }
                .priority-medium { color: #f39c12; font-weight: 600; background: #fff3e0; padding: 3px 8px; border-radius: 4px; }
                .priority-low { color: #27ae60; font-weight: 600; background: #e8f5e9; padding: 3px 8px; border-radius: 4px; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .due-date { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 3px 8px; border-radius: 4px; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">📝</span> New Task Assignment</h1>
                </div>
                <div class="content">
                    <h2><span class="emoji">👋</span> Hi ${userData.name}!</h2>
                    <p>A new task has been assigned to you:</p>
                    
                    <div class="task-info">
                        <h3><span class="emoji">🎯</span> ${taskData.summary}</h3>
                        <p><strong>Description:</strong> ${taskData.description || 'No description provided'}</p>
                        <p><strong>Project:</strong> ${projectData.name}</p>
                        <p><strong>Priority:</strong> <span class="priority-${taskData.priority.toLowerCase()}">${taskData.priority}</span></p>
                        <p><strong>Due Date:</strong> <span class="due-date">${taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString() : 'Not set'}</span></p>
                        <p><strong>Story Points:</strong> ${taskData.storyPoints || 'Not estimated'}</p>
                    </div>
                    
                    <p><span class="emoji">💡</span> <strong>Next Steps:</strong></p>
                    <ul>
                        <li>Review the task details in your dashboard</li>
                        <li>Start time tracking when you begin work</li>
                        <li>Add comments for any questions or updates</li>
                        <li>Update task status as you progress</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>Need help with this task? Contact your project manager.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const longWorkingHoursTemplate = (userData, taskData, hoursWorked) => {
    return {
        subject: `⏰ Long Working Hours Alert - ${taskData.summary}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .alert-box { background: #ffebee; padding: 25px; border-radius: 10px; border-left: 5px solid #e74c3c; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .alert-box h3 { margin-top: 0; color: #c0392b; font-size: 18px; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .hours-badge { display: inline-block; background: #e74c3c; color: white; padding: 3px 10px; border-radius: 50px; font-weight: 600; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">⏰</span> Working Hours Alert</h1>
                </div>
                <div class="content">
                    <h2><span class="emoji">👋</span> Hi ${userData.name},</h2>
                    
                    <div class="alert-box">
                        <h3><span class="emoji">🚨</span> Extended Work Session Detected</h3>
                        <p>You've been working on the task "<strong>${taskData.summary}</strong>" for <span class="hours-badge">${hoursWorked} hours</span> continuously.</p>
                    </div>
                    
                    <p><span class="emoji">📋</span> <strong>Please consider:</strong></p>
                    <ul>
                        <li>Taking a break to maintain productivity</li>
                        <li>Updating your project manager about the task complexity</li>
                        <li>Adding comments about any blockers or challenges</li>
                        <li>Reassessing the task requirements if needed</li>
                    </ul>
                    
                    <p><span class="emoji">💬</span> <strong>Action Required:</strong> Please update your project manager about why this task is taking longer than expected.</p>
                    
                    <p>Remember, quality work is more important than long hours. Take care of yourself! <span class="emoji">💪</span></p>
                </div>
                <div class="footer">
                    <p>This is an automated notification. If you believe this is incorrect, please contact support.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const longWorkingHoursManagerTemplate = (userData, taskData, hoursWorked) => {
    return {
        subject: `⚠️ Overtime Alert: ${userData.name} - ${taskData.summary}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #d35400 0%, #e67e22 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .alert-box { background: #fef5e7; padding: 25px; border-radius: 10px; border-left: 5px solid #e67e22; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .alert-box h3 { margin-top: 0; color: #d35400; font-size: 18px; }
                .stats-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 15px 0; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .hours-badge { display: inline-block; background: #e67e22; color: white; padding: 3px 10px; border-radius: 50px; font-weight: 600; font-size: 18px; }
                .action-needed { background: #fdeae9; padding: 15px; border-radius: 8px; border-left: 5px solid #dc3545; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">⚠️</span> Overtime Work Alert</h1>
                </div>
                <div class="content">
                    <div class="alert-box">
                        <h3><span class="emoji">👤</span> Employee Overtime Detection</h3>
                        <p><strong>${userData.name}</strong> has been working extended hours.</p>
                    </div>
                    
                    <div class="stats-box">
                        <h3>Work Details:</h3>
                        <p><strong>Task:</strong> ${taskData.summary}</p>
                        <p><strong>Hours Worked:</strong> <span class="hours-badge">${hoursWorked} hours</span></p>
                        <p><strong>Employee Role:</strong> ${userData.designation}</p>
                        <p><strong>Department:</strong> ${userData.department || 'Not specified'}</p>
                    </div>
                    
                    <p><strong>Note:</strong> Extended working hours may impact employee wellbeing and project quality.
                     Immediate attention is recommended.</p>
                </div>
                <div class="footer">
                    <p>This is an automated management notification.</p>
                    <p>For immediate action, please contact the employee at ${userData.email}</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const userCreatedAdminTemplate = (userData, createdBy) => {
    return {
        subject: `👤 New User Created: ${userData.name}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .user-info { background: #f0f7ff; padding: 25px; border-radius: 10px; border-left: 5px solid #3498db; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .user-info h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .badge { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 3px 8px; border-radius: 4px; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">👤</span> New User Created</h1>
                </div>
                <div class="content">
                    <p>A new user has been created in the Task Manager system:</p>
                    
                    <div class="user-info">
                        <h3><span class="emoji">📋</span> User Details</h3>
                        <p><strong>Name:</strong> ${userData.name}</p>
                        <p><strong>Email:</strong> ${userData.email}</p>
                        <p><strong>Contact:</strong> ${userData.contact}</p>
                        <p><strong>Designation:</strong> <span class="badge">${userData.designation}</span></p>
                        <p><strong>Role:</strong> <span class="badge">${userData.role}</span></p>
                        <p><strong>Technologies:</strong> ${userData.technologies || 'Not specified'}</p>
                        <p><strong>Created By:</strong> ${createdBy}</p>
                        <p><strong>Created At:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <p>The user has been sent welcome credentials and can now access the system.</p>
                </div>
                <div class="footer">
                    <p>This is an automated notification sent to administrators.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const projectAssignmentTemplate = (userData, projectData) => {
    return {
        subject: `🎯 You've been added to project: ${projectData.name}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .project-info { background: #e8f5e9; padding: 25px; border-radius: 10px; border-left: 5px solid #2ecc71; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .project-info h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .status-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-weight: 500; }
                .status-active { background: #d4edda; color: #155724; }
                .status-planned { background: #fff3cd; color: #856404; }
                .status-completed { background: #d1ecf1; color: #0c5460; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">🎯</span> New Project Assignment</h1>
                </div>
                <div class="content">
                    <h2><span class="emoji">👋</span> Hi ${userData.name}!</h2>
                    <p>You've been added to a new project. Here are the details:</p>
                    
                    <div class="project-info">
                        <h3><span class="emoji">📋</span> Project: ${projectData.name}</h3>
                        <p><strong>Description:</strong> ${projectData.description || 'No description provided'}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${projectData.projectStatus.toLowerCase()}">${projectData.projectStatus}</span></p>
                        <p><strong>Start Date:</strong> ${new Date(projectData.start).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> ${new Date(projectData.end).toLocaleDateString()}</p>
                    </div>
                    
                    <p><span class="emoji">🚀</span> Get started by logging into your dashboard and exploring the project tasks!</p>
                </div>
                <div class="footer">
                    <p>Project Manager: ${projectData.manager || 'Not assigned'}</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const userDeactivatedTemplate = (userData, deactivatedBy) => {
    return {
        subject: `🚫 User Deactivated: ${userData.name}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .user-info { background: #f5f5f5; padding: 25px; border-radius: 10px; border-left: 5px solid #95a5a6; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .user-info h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .warning-note { background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 5px solid #ffa726; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">🚫</span> User Deactivated</h1>
                </div>
                <div class="content">
                    <p>A user has been deactivated in the Task Manager system:</p>
                    
                    <div class="user-info">
                        <h3><span class="emoji">📋</span> User Details</h3>
                        <p><strong>Name:</strong> ${userData.name}</p>
                        <p><strong>Email:</strong> ${userData.email}</p>
                        <p><strong>Designation:</strong> ${userData.designation}</p>
                        <p><strong>Deactivated By:</strong> ${deactivatedBy}</p>
                        <p><strong>Deactivated At:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    
                    <div class="warning-note">
                        <p><strong>Note:</strong> The user no longer has access to the system and all active sessions have been terminated.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated notification sent to administrators.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const forgotPasswordTemplate = (userData, resetUrl) => {
    return {
        subject: '🔐 Password Reset Request - RowthTech Task Manager',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .reset-box { background: #f0f7ff; padding: 25px; border-radius: 10px; border-left: 5px solid #3498db; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .reset-box h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .button { display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; margin: 20px 0; font-weight: 500; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3); transition: all 0.3s ease; }
                .button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4); }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .warning-note { background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 5px solid #ffa726; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">🔐</span> Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2><span class="emoji">👋</span> Hello ${userData.name},</h2>
                    <p>We received a request to reset your password for your RowthTech Task Manager account. If you didn't make this request, you can safely ignore this email.</p>
                    
                    <div class="reset-box">
                        <h3><span class="emoji">🔄</span> Reset Your Password</h3>
                        <p>To reset your password, click the button below. This link will expire in 30 minutes for security reasons.</p>
                        <div style="text-align: center;">
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </div>
                    </div>
                    
                    <div class="warning-note">
                        <p><strong>Security Note:</strong> If you didn't request a password reset, please contact our support team immediately as your account may be at risk.</p>
                    </div>
                    
                    <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
                    <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br><strong>RowthTech Team</strong></p>
                    <p>Need help? Contact us at support@rowthtech.com</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const passwordResetSuccessTemplate = (userData) => {
    return {
        subject: '✅ Password Reset Successful - RowthTech Task Manager',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .success-box { background: #e8f5e9; padding: 25px; border-radius: 10px; border-left: 5px solid #2ecc71; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .success-box h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .button { display: inline-block; background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; margin: 20px 0; font-weight: 500; box-shadow: 0 4px 15px rgba(46, 204, 113, 0.3); transition: all 0.3s ease; }
                .button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(46, 204, 113, 0.4); }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .security-note { background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 5px solid #2196f3; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">✅</span> Password Reset Successful</h1>
                </div>
                <div class="content">
                    <h2><span class="emoji">👋</span> Hello ${userData.name},</h2>
                    <p>Your password for RowthTech Task Manager has been successfully reset.</p>
                    
                    <div class="success-box">
                        <h3><span class="emoji">🔒</span> Account Secured</h3>
                        <p>You can now log in to your account using your new password.</p>
                        <div style="text-align: center;">
                            <a href="${userData.role === 'user' ? 'https://taskmanagerteam.rowthtech.com/account' : 'https://taskmanageradmin.rowthtech.com/account'}/login" class="button">Login to Dashboard</a>
                        </div>
                    </div>
                    
                    <div class="security-note">
                        <p><strong>Security Tip:</strong> For your security, please make sure to:</p>
                        <ul>
                            <li>Use a strong, unique password</li>
                            <li>Never share your password with others</li>
                            <li>Log out when using shared devices</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>Best regards,<br><strong>RowthTech Team</strong></p>
                    <p>Need help? Contact us at support@rowthtech.com</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

const projectCommentMentionTemplate = (mentionedUser, author, project, comment) => {
    return {
        subject: `💬 You were mentioned in ${project.name} - New Comment`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
                body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #4a4a4a; margin: 0; padding: 0; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%); color: white; padding: 30px 20px; text-align: center; position: relative; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 35px; }
                h2 { color: #2c3e50; margin-top: 0; font-weight: 600; }
                .mention-box { background: #f3e5f5; padding: 25px; border-radius: 10px; border-left: 5px solid #9c27b0; margin: 25px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                .mention-box h3 { margin-top: 0; color: #2c3e50; font-size: 18px; }
                .comment-text { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 3px solid #dee2e6; margin: 15px 0; font-style: italic; }
                .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 14px; padding-top: 20px; border-top: 1px solid #ecf0f1; }
                .emoji { font-size: 24px; margin-right: 8px; vertical-align: middle; }
                .author-badge { display: inline-block; background: #e1f5fe; color: #0277bd; padding: 3px 8px; border-radius: 4px; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1><span class="emoji">💬</span> You Were Mentioned</h1>
                </div>
                <div class="content">
                    <h2><span class="emoji">👋</span> Hi ${mentionedUser.name}!</h2>
                    <p>You were mentioned in a comment on project <strong>${project.name}</strong>.</p>
                    
                    <div class="mention-box">
                        <h3><span class="emoji">📝</span> New Comment</h3>
                        <p><strong>From:</strong> <span class="author-badge">${author.name}</span></p>
                        <p><strong>Project:</strong> ${project.name}</p>
                        <div class="comment-text">
                            "${comment}"
                        </div>
                    </div>
                    
                    <p><span class="emoji">🔔</span> Log in to your dashboard to view the full conversation and respond.</p>
                </div>
                <div class="footer">
                    <p>This notification was sent because your email was mentioned in the comment.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };
};

module.exports = {
    welcomeUserTemplate,
    projectAssignmentTemplate,
    taskAssignmentTemplate,
    longWorkingHoursTemplate,
    userCreatedAdminTemplate,
    userDeactivatedTemplate,
    longWorkingHoursManagerTemplate,
    forgotPasswordTemplate,
    passwordResetSuccessTemplate,
    projectCommentMentionTemplate
};