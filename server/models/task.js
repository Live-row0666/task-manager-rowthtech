
// Task model schema for project management system
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    milestone: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Milestone'
    },
    sprint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint'
    },
    workType: {
        type: String,
        // required: true,
        default: 'Task'
    },
    status: {
        type: String,
        default: 'To Do'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    summary: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    dueDate: {
        type: Date
    },
    labels: [{
        type: String
    }],
    team: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }],
    startDate: {
        type: Date
    },
    storyPoints: {
        type: Number
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        // required: true
    },
    attachments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        description: String,
        fileType: String
    }],
    linkedItems: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        relationship: {
            type: String
        }
    }],
    projectType: {
        type: String,
        enum: ['Tech', 'Marketing', 'Sales', 'Freelance'],
    },
    isImpediment: {
        type: Boolean,
        default: false
    },
    estimatedTime: {
        type: Number,
        default: 0
    },
    completionTime: {
        type: Number,
        default: 0
    },
    isSeoTask: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number,
        default: 0
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        date: {
            type: Date,
            default: Date.now
        },
        content: {
            type: String,
            // required: true
        }
    }],
    previousAssignees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        assignedCount: {
            type: Number
        },
    }],
    reassignedCount: {
        type: Number
    },
    qastatus: {
        type: String,
        default: 'Not Started',
        enum: ['Not Started', 'To Do', 'In Progress', 'Completed', 'Hold', 'Not Applicable', 'Deferred','Re Assigned'],
        validate: {
            validator: function(v) {
                return ['Not Started', 'To Do', 'In Progress', 'Completed', 'Hold', 'Not Applicable', 'Deferred','Re Assigned'].includes(v);
            },
            message: 'Invalid QA status value'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    qaComments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        date: {
            type: Date,
            default: Date.now
        },
        content: {
            type: String,
        }
    }]
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
