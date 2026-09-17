const mongoose = require('mongoose');
const { Schema } = mongoose;

const sprintSchema = new Schema({
    project: {
        type: mongoose.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    milestone: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Milestone'
    },
    sprintName: {
        type: String,
        required: true,
        trim: true
    },
    sprintDesc: {
        type: String,
        required: false,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    projectType: {
        type: String,
        enum: ['Tech', 'Marketing', 'Sales', 'Freelance'],
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
        ref: 'Sprint'
    }],
    attachments: [{
        name: String,
        url: String,
        uploadedAt: Date
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
},
    {
        timestamps: true,
        versionKey: false
    })

const sprintModel = mongoose.model('Sprint', sprintSchema);
module.exports = sprintModel;
