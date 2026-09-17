const mongoose = require('mongoose');

const taskCommentSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        name: String,
        url: String,
        fileType: String
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    date:{
        type: Date,
        default: Date.now
    },
    editedAt: Date
}, {
    timestamps: true
});

taskCommentSchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model('TaskComment', taskCommentSchema);