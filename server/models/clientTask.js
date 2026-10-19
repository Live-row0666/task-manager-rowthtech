const mongoose = require('mongoose');

const clientTaskSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
        workType: { type: String, default: 'Task' },
        status: { type: String, default: 'To Do' },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        summary: { type: String, required: true },
        description: { type: String },
        assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
        dueDate: { type: Date },
        startDate: { type: Date },
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        attachments: [{
            name: String,
            url: String,
            uploadedAt: { type: Date, default: Date.now },
        }],
        projectType: {
            type: String,
            enum: ['Tech', 'Marketing', 'Sales', 'Freelance'],
        },
        estimatedTime: { type: Number, default: 0 },
        completionTime: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ClientTask', clientTaskSchema);
