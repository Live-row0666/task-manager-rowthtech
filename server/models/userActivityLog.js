const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivityLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    loginTime: {
        type: Date,
        default: Date.now
    },
    logoutTime: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    status: {
        type: String,
        enum: ['logged_in', 'logged_out'],
        default: 'logged_in'
    }
}, { timestamps: true });

// indexing for faster queries
userActivityLogSchema.index({ userId: 1 });
const UserActivityLog = mongoose.model('UserActivityLog', userActivityLogSchema);
module.exports = UserActivityLog;

