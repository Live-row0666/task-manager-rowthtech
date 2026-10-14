const mongoose = require('mongoose');

const clientChatSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true
    },
    senderType: {
        type: String,
        enum: ['client', 'admin'],
        required: true
    },
    senderUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    senderClient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    senderName: {
        type: String,
        default: ''
    },
    message: {
        type: String,
        trim: true,
        default: ''
    },
    attachments: [{
        originalName: String,
        fileName: String,
        url: String,
        size: Number,
        type: { type: String }
    }],
    readByAdmin: {
        type: Boolean,
        default: false,
        index: true
    },
    readByClient: {
        type: Boolean,
        default: false,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('ClientChat', clientChatSchema);
