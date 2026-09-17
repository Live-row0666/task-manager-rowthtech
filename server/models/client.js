const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Adding additional fields that are commonly needed for client management
const clientSchema = new Schema({
    name: {
        type: String,
        trim: true,
        unique: true
    },
    companyName: {
        type: String,
        trim: true
    },
    email: [{
        type: String,
        lowercase: true,
    }],
     loginEmail: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        index: true
    },
       password: {
        type: String,
        required: true
    },
        role: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Role',
               required: true
           },
    contact: [{
        type: String,
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    address: {
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: String,
        },
        country: {
            type: String,
        }
    },
    // Added fields
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    projectType: {
        type: String,
        enum: ['Tech', 'Marketing', 'Sales', 'Freelance'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    },
    contactPerson: {
        name: String,
        position: String,
        phone: String,
        email: String
    },
    paymentTerms: {
        type: String
    },
    billingInfo: {
        billingAddress: String,
        taxId: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
     resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
});

// indexinf for client name , email , phone
clientSchema.index({ name: 1 }, { unique: true });

// clientSchema.index({ name: 1, email: 1, phone: 1 }, { unique: true });

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
