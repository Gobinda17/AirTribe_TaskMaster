// I'm importing Mongoose to create my MongoDB schema and model for tasks
const mongoose = require('mongoose');

// I'm defining the task schema to structure task data with all necessary fields
const taskSchema = new mongoose.Schema({
    // I'm defining the title field as a required string for task identification
    title: { type: String, required: true },
    // I'm defining the description field as a required string for task details
    description: { type: String, required: true },
    // I'm defining createdBy as a reference to the Users collection to track task creator
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    // I'm defining status with enum values and default to track task progress
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    // I'm defining assignedTo as an array of user references for multiple assignees
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }],
    // I'm defining dueDate as a required Date field for task deadlines
    dueDate: { type: Date, required: true },
    // I'm defining comments as an embedded array to store task-related discussions
    comments: [
    {
      // I'm referencing the user who made the comment
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      // I'm storing the comment text content
      text: { type: String, },
      // I'm automatically tracking when the comment was created
      createdAt: { type: Date, default: Date.now },
    },
  ],
  // I'm defining attachments as an embedded array to store file uploads
  attachments: [
    {
      // I'm storing the original filename of the uploaded file
      fileName: String,
      // I'm storing the URL/path where the file is saved
      fileUrl: String,
      // I'm referencing the user who uploaded the file
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      // I'm automatically tracking when the file was uploaded
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, { 
    // I'm enabling timestamps to automatically track creation and update times  
    timestamps: true 
});

// I'm exporting the Task model with the defined schema for use throughout the application
module.exports = mongoose.model('Tasks', taskSchema, 'Tasks');