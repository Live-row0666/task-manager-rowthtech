const Notification = require('../models/notification');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const emailTemplates = require('../templates/emailTemplates');
class NotificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async createNotification(data) {
        try {
            const notification = await Notification.create(data);
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async sendTaskAssignedNotification(taskId, assigneeId, assignerId, taskSummary) {
        try {
            await this.createNotification({
                recipient: assigneeId,
                sender: assignerId,
                type: 'task_assigned',
                title: 'New Task Assigned',
                message: `You have been assigned a new task: ${taskSummary}`,
                relatedId: taskId,
                relatedModel: 'Task'
            });
        } catch (error) {
            console.error('Error sending task assigned notification:', error);
        }
    }

    async sendTaskUpdatedNotification(taskId, recipientId, updaterId, taskSummary) {
        try {
            await this.createNotification({
                recipient: recipientId,
                sender: updaterId,
                type: 'task_updated',
                title: 'Task Updated',
                message: `Task "${taskSummary}" has been updated`,
                relatedId: taskId,
                relatedModel: 'Task'
            });
        } catch (error) {
            console.error('Error sending task updated notification:', error);
        }
    }

    async sendCommentNotification(taskId, recipientId, commenterId, taskSummary) {
        try {
            await this.createNotification({
                recipient: recipientId,
                sender: commenterId,
                type: 'comment_added',
                title: 'New Comment',
                message: `New comment added to task: ${taskSummary}`,
                relatedId: taskId,
                relatedModel: 'Task'
            });
        } catch (error) {
            console.error('Error sending comment notification:', error);
        }
    }

    async sendDeadlineReminder(taskId, assigneeId, taskSummary, dueDate) {
        try {
            await this.createNotification({
                recipient: assigneeId,
                type: 'deadline_reminder',
                title: 'Task Deadline Reminder',
                message: `Task "${taskSummary}" is due on ${dueDate.toDateString()}`,
                relatedId: taskId,
                relatedModel: 'Task'
            });
        } catch (error) {
            console.error('Error sending deadline reminder:', error);
        }
    }

    async sendReassignNotification(taskId, assigneeId, taskSummary) {
        try {
            await this.createNotification({
                recipient: assigneeId,
                type: 'task_reassigned',
                title: 'Task Reassigned',
                message: `Task "${taskSummary}" has been reassigned to you`,
                relatedId: taskId,
                relatedModel: 'Task'
            });
        } catch (error) {
            console.error('Error sending reassign notification:', error);
        }
    }

    async sendWelcomeEmail(userData, password) {
        try {
            const template = emailTemplates.welcomeUserTemplate(userData, password);
            await this.sendEmailNotification(userData.email, template.subject, '', template.html);
        } catch (error) {
            console.error('Error sending welcome email:', error);
        }
    }

    async sendTaskAssignmentEmail(userData, taskData, projectData) {
        try {
            const template = emailTemplates.taskAssignmentTemplate(userData, taskData, projectData);
            await this.sendEmailNotification(userData.email, template.subject, '', template.html);
        } catch (error) {
            console.error('Error sending task assignment email:', error);
        }
    }

    async sendLongWorkingHoursEmail(userData, taskData, hoursWorked) {
        try {
            const template = emailTemplates.longWorkingHoursTemplate(userData, taskData, hoursWorked);
            await this.sendEmailNotification(userData.email, template.subject, '', template.html);
        } catch (error) {
            console.error('Error sending long working hours email:', error);
        }
    }
    async sendLongWorkingHoursEmailToCM(userData, taskData, hoursWorked, emails) {
        try {
            const template = emailTemplates.longWorkingHoursManagerTemplate(userData, taskData, hoursWorked);
            await this.sendEmailNotification(emails.cto, template.subject, '', template.html, emails.pm);
        } catch (error) {
            console.error('Error sending long working hours email:', error);
        }
    }

    async sendProjectAssignmentEmail(userData, projectData) {
        try {
            const template = emailTemplates.projectAssignmentTemplate(userData, projectData);
            await this.sendEmailNotification(userData.email, template.subject, '', template.html);
        } catch (error) {
            console.error('Error sending project assignment email:', error);
        }
    }

    async sendUserCreatedAdminEmail(userData, createdBy) {
        try {
            const admins = await User.find({
                role: { $in: await this.getAdminRoleIds() },
                isActive: true
            }).select('email name');

            const template = emailTemplates.userCreatedAdminTemplate(userData, createdBy);
            const adminEmails = admins.map(admin => admin.email);

            if (adminEmails.length > 0) {
                await this.sendEmailNotification(
                    adminEmails[0],
                    template.subject,
                    '',
                    template.html,
                    adminEmails.slice(1)
                );
            }
        } catch (error) {
            console.error('Error sending user created admin email:', error);
        }
    }

    async sendUserDeactivatedEmail(userData, deactivatedBy) {
        try {
            const admins = await User.find({
                role: { $in: await this.getAdminRoleIds() },
                isActive: true
            }).select('email name');

            const template = emailTemplates.userDeactivatedTemplate(userData, deactivatedBy);
            const adminEmails = admins.map(admin => admin.email);

            if (adminEmails.length > 0) {
                await this.sendEmailNotification(
                    adminEmails[0],
                    template.subject,
                    '',
                    template.html,
                    adminEmails.slice(1)
                );
            }
        } catch (error) {
            console.error('Error sending user deactivated email:', error);
        }
    }

    async sendProjectCommentMentionEmail(mentionedUser, author, project, comment) {
        try {
            const template = emailTemplates.projectCommentMentionTemplate(
                mentionedUser,
                author,
                project,
                comment
            );
            await this.sendEmailNotification(
                mentionedUser.email,
                template.subject,
                '',
                template.html
            );
        } catch (error) {
            console.error('Error sending project comment mention email:', error);
        }
    }

    async getAdminRoleIds() {
        const Role = require('../models/role');
        const adminRoles = await Role.find({ name: { $in: ['admin', 'sub-admin'] } }).select('_id');
        return adminRoles.map(role => role._id);
    }

    async sendEmailNotification(to, subject, text, html, cc = []) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                cc,
                subject,
                text,
                html
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}

module.exports = new NotificationService();
