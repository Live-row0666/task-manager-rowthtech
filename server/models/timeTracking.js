const mongoose = require('mongoose');

const timeTrackingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number,

        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    billable: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    projectType: {
        type: String,
        enum: ['Tech', 'Marketing', 'Sales', 'Freelance'],
    },

    // Track paused status
    isPaused: {
        type: Boolean,
        default: false
    },
    isComplete: {
        type: Boolean,
        default: false
    },
    // Array to store pause periods
    pausePeriods: [{
        startTime: {
            type: Date
        },
        endTime: {
            type: Date
        }
    }],
    // Total paused duration in milliseconds
    totalPausedTime: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

timeTrackingSchema.index({ user: 1, createdAt: -1 });
timeTrackingSchema.index({ task: 1 });
timeTrackingSchema.index({ project: 1 });

module.exports = mongoose.model('TimeTracking', timeTrackingSchema);
