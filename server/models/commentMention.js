const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentMentionSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        mentionCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient queries
commentMentionSchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('CommentMention', commentMentionSchema);