const mongoose = require('mongoose');
const { Schema } = mongoose;

const milestoneModel = new Schema({
    project: {
        type: mongoose.Types.ObjectId,
        // required: true,
        ref: 'Project',
    },
    title: {
        type: String,
        // required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    completionDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'Delayed'],
        default: 'Not Started'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    assignedTo: [{
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    }],
    dependencies: [{
        type: mongoose.Types.ObjectId,
        ref: 'Milestone'
    }],
    attachments: [{
        name: String,
        url: String,
        uploadedAt: Date
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    amcHours: {
        type: Number,
        default: 0
    },
    isDelivered:{
        type: Boolean,
        default: false
    },
    workedHours: { type: Number, default: 0 },
},
    {
        timestamps: true
    }
)

// Adding indexes for better query performance
milestoneModel.index({ project: 1, title: 1 });

const Milestone = mongoose.model('Milestone', milestoneModel);
module.exports = Milestone;