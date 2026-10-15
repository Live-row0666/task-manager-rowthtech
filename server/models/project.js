const mongoose = require('mongoose'), { Schema } = mongoose,
    projectSchema = new Schema(
        {
            name: {
                type: String,
            },
            description: {
                type: String,
            },
            client: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Client'
            }],
            technology: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'Technology'
            },
            start: {
                type: Date
            },
            end: {
                type: Date
            },
            projectStatus: {
                type: String,
                enum: ['Ongoing', 'Support', 'Delivered', 'Hold'],
                default: 'Ongoing'
            },
            dependencies: [{
                name: String,
                provider: String,
                status: {
                    type: String,
                    enum: ['Pending', 'Done']
                },
                costInvolved: Boolean,
                cost: String,
                links: [{ type: String }],
                notes: { type: String, trim: true },
                documents: [{
                    name: String,
                    url: String,
                }],
                rtl: Boolean,
                client: Boolean
            }],
            type: {
                type: String
            },
            projectType: {
                type: String,
                enum: ['Tech', 'Marketing', 'Sales', 'Freelance'],
            },
            team: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            }],
            documents: [{
                name: String,
                documentType: String,
                description: String,
                uploadedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Users'
                },
                url: String,
            }],
            documentLinks: [{
                title: String,
                url: String
            }],
            isActive: {
                type: Boolean,
                default: true
            },
            figmaLinks: [{
                title: String,
                url: String
            }],
            websites: [{
                title: String,
                url: String,
                creds: [{
                    role: String,
                    username: String,
                    password: String
                }]
            }],
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            },

            // AMC specific fields to be used if project created under the amc or switched to amc
            hasAmc: { type: Boolean, default: false },
            amcType: {
                type: { type: String, enum: ['Monthly', 'Yearly'] },
                value: Number
            },
            amcStartDate: { type: Date },
            amcEndDate: { type: Date },
            amcHours: { type: Number, default: 0 },
            workedHours: { type: Number, default: 0 },

            // Meeting references
            meetings: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Meeting'
            }],
            lastStatus: { type: String, trim: true },
        },
        {
            timestamps: true,
        }
    )

module.exports = mongoose.model("Project", projectSchema);