const mongoose = require('mongoose');
const { Schema } = mongoose;

const meetingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
    },
    meetingType: {
        type: String,
        enum: ['one-time', 'recurring'],
        default: 'one-time'
    },
    recurrence: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: function () { return this.meetingType === 'recurring'; }
        },
        interval: {
            type: Number,
            default: 1
        },
        endDate: {
            type: Date,
            required: function () { return this.meetingType === 'recurring'; }
        }
    },
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending'
        }
    }],
    location: {
        type: String,
        trim: true
    },
    meetingLink: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    parentMeeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    projectType: {
        type: String,
        enum: ['Tech', 'Marketing', 'Sales', 'Freelance'],
        required: true
    }
}, {
    timestamps: true
});

meetingSchema.index({ project: 1, startDateTime: 1 });
meetingSchema.index({ client: 1, startDateTime: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);