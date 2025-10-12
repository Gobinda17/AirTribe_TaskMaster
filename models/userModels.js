// I'm importing Mongoose to create my MongoDB schema and model
const mongoose = require('mongoose');

// I'm defining the user schema to structure user data in the database
const userSchema = new mongoose.Schema({
    // I'm defining the name field as a required string for user identification
    name: { type: String, required: true },
    // I'm defining the email field as required and unique to prevent duplicate accounts
    email: { type: String, requiured: true, unique: true },
    // I'm defining the password field as required string (will store hashed passwords)
    password: { type: String, required: true },
    // I'm defining the role field with enum values to control user permissions
    role: { type: String, enum: ['admin', 'user'], required: true },
}, { 
    // I'm enabling timestamps to automatically track creation and update times
    timestamps: true 
});

// I'm exporting the User model with the defined schema for use throughout the application
module.exports = mongoose.model('Users', userSchema, 'Users');