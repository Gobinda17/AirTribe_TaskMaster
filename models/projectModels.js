const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        description: { type: String, trim: true, },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                role: { type: String, enum: ["owner", "member"], default: "member" },
                invitedAt: { type: Date, default: Date.now },
                joined: { type: Boolean, default: false },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Projects', projectSchema, 'Projects');