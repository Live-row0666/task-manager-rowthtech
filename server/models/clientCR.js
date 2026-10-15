const mongoose = require('mongoose');

const clientCRSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['submitted', 'in_review', 'approved', 'rejected', 'in_progress', 'completed'],
        default: 'submitted'
    },
    estimatedHours: {
        type: Number,
        default: 0
    },
    cost: {
        type: Number,
        default: 0
    },
    targetDate: {
        type: Date
    },
    adminNotes: {
        type: String,
        default: ''
    },
    clientNotes: {
        type: String,
        default: ''
    },
    attachments: [{
        originalName: String,
        fileName: String,
        url: String,
        size: Number,
        type: { type: String },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    reviewedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    unreadByAdmin: {
        type: Number,
        default: 1
    },
    unreadByClient: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

clientCRSchema.index({ client: 1, project: 1 });
clientCRSchema.index({ status: 1 });

module.exports = mongoose.model('ClientCR', clientCRSchema);
