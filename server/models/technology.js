const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const techCatrgotySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        // required: true
    }

}, { timestamps: true });

// indexing for faster search
techCatrgotySchema.index({ name: 'text' });
const TechnologyCategory = mongoose.model('TechnologyCategory', techCatrgotySchema);

const technologySchema = new Schema({
    name: {
        type: String,
        // required: true,
        unique: true
    },
    description: {
        type: String,
        // required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'TechnologyCategory',
        required: true
    }

}, { timestamps: true });

// indexing for faster search
technologySchema.index({ name: 'text' });

const Technology = mongoose.model('Technology', technologySchema);

module.exports = {
    Technology,
    TechnologyCategory
};
