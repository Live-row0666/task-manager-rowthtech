const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        // required: true
    },
    category: {
        type: String,
        enum: ['bug', 'feature_request', 'technical_issue', 'general_inquiry'],
        // required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        // required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    attachments: [{
        filename: String,
        originalName: String,
        url: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    responses: [{
        message: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        respondedAt: {
            type: Date,
            default: Date.now
        },
        isAdminResponse: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Support', supportSchema);