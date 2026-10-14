const mongoose = require('mongoose');

const dynamicFieldSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    fieldType: {
        type: String,
        enum: ['text', 'password', 'textarea', 'url', 'number', 'file'],
        default: 'text'
    },
    placeholder: {
        type: String,
        default: ''
    },
    helpText: {
        type: String,
        default: ''
    },
    isRequired: {
        type: Boolean,
        default: true
    },
    value: {
        type: String,
        default: ''
    },
    fileValue: {
        originalName: String,
        fileName: String,
        url: String,
        size: Number,
        type: { type: String }
    },
    isFilled: {
        type: Boolean,
        default: false
    },
    filledAt: {
        type: Date
    }
}, { _id: false });

const clientDependencySchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClientProject',
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
        enum: ['pending', 'submitted', 'in_review', 'completed', 'rejected'],
        default: 'pending'
    },
    expectedDays: {
        type: Number,
        default: 3
    },
    dueDate: {
        type: Date
    },
    dynamicFields: [dynamicFieldSchema],
    adminNotes: {
        type: String,
        default: ''
    },
    clientNotes: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    submittedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    unreadByClient: {
        type: Number,
        default: 1
    },
    unreadByAdmin: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ClientDependency', clientDependencySchema);
