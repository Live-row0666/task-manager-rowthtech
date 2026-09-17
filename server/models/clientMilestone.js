const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientMilestoneSchema = new Schema(
    {
        project: { type: mongoose.Types.ObjectId, ref: 'ClientProject' },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        startDate: { type: Date, required: true },
        completionDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Completed', 'Delayed'],
            default: 'Not Started',
        },
        progress: { type: Number, min: 0, max: 100, default: 0 },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        assignedTo: [{ type: mongoose.Types.ObjectId, ref: 'Users' }],
        attachments: [{ name: String, url: String, uploadedAt: Date }],
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
        amcHours: { type: Number, default: 0 },
        workedHours: { type: Number, default: 0 },
        isDelivered: { type: Boolean, default: false },
    },
    { timestamps: true }
);

clientMilestoneSchema.index({ project: 1, title: 1 });

module.exports = mongoose.model('ClientMilestone', clientMilestoneSchema);
