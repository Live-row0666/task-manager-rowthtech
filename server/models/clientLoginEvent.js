const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    clientName: String,
    clientEmail: String,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    portalOrigin: { type: String, required: true },
    ip: String,
    browser: String,
    os: String,
    device: String,
    reportedTimezone: String,
    location: { city: String, region: String, country: String, source: String },
    loggedInAt: { type: Date, default: Date.now, required: true },
    expiresAt: { type: Date, required: true }
}, { versionKey: false });
schema.index({ recipients: 1, loggedInAt: -1 });
schema.index({ loggedInAt: -1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('ClientLoginEvent', schema);
