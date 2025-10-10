const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }],
    dueDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Tasks', taskSchema, 'Tasks');