const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }],
    dueDate: { type: Date, required: true },
    comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Tasks', taskSchema, 'Tasks');