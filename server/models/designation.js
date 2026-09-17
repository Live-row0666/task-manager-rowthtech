const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const designationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
})
const Designation = mongoose.model('Designation', designationSchema);
module.exports = Designation;