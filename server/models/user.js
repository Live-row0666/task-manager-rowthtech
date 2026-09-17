const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usersSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true
    },
    contact: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    techCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TechnologyCategory'
    }],
    designation: {
        type: String,
    },
    technology: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technology'
    }],
    joinedDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    lastLogout: {
        type: Date,
        default: null
    },
    profilePicture: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userType: {
        type: String,
        enum: ['Tech', 'Marketing', 'Sales', 'Freelance']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
});



const Users = mongoose.model('Users', usersSchema);
module.exports = Users;

