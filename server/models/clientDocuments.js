const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClientProject",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        documents: [
            {
                originalName: {
                    type: String,
                },
                fileName: {
                    type: String,
                },
                url: {
                    type: String,
                },
                size: {
                    type: Number,
                },
                type: {
                    type: String,
                },
            },
        ],
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ClientDocument", documentSchema);