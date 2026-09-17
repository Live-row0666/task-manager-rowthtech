const mongoose = require('mongoose');
const { Schema } = mongoose;

const logSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:{ type: String },
    timestamp: { type: Date, default: Date.now },
    apiendpoint: { type: String },
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;