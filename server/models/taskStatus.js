const mongoose = require('mongoose');

const taskStatusSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    color: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
    }
}, {
    timestamps: true
});

taskStatusSchema.index({ project: 1 });

module.exports = mongoose.model('TaskStatus', taskStatusSchema);