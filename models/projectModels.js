// I'm importing Mongoose to create my MongoDB schema and model for projects
const mongoose = require('mongoose');

// I'm defining the project schema to structure project data with member management
const projectSchema = new mongoose.Schema(
    {
        // I'm defining the name field as required, trimmed, and unique for project identification
        name: { type: String, required: true, trim: true, unique: true },
        // I'm defining the description field as optional and trimmed for project details
        description: { type: String, trim: true, },
        // I'm defining createdBy as a reference to the User collection to track project creator
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        // I'm defining members as an embedded array to manage project membership and invitations
        members: [
            {
                // I'm referencing the user who is a member or invited to the project
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                // I'm defining role with enum values to distinguish between owners and members
                role: { type: String, enum: ["owner", "member"], default: "member" },
                // I'm tracking when the invitation was sent
                invitedAt: { type: Date, default: Date.now },
                // I'm tracking whether the user has accepted the invitation
                joined: { type: Boolean, default: false },
            },
        ],
    },
    { 
        // I'm enabling timestamps to automatically track creation and update times
        timestamps: true 
    }
);

// I'm exporting the Project model with the defined schema for use throughout the application
module.exports = mongoose.model('Projects', projectSchema, 'Projects');