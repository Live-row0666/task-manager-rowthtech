const mongoose = require('mongoose');

const systemLogsSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['error', 'warn', 'info', 'debug'],
        required: true,
        default: 'error'
    },
    message: {
        type: String,
        required: true
    },
    stack: {
        type: String
    },
    source: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

systemLogsSchema.index({ timestamp: -1 });
systemLogsSchema.index({ level: 1 });

module.exports = mongoose.model('SystemLogs', systemLogsSchema);