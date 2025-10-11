const multer = require('multer');
const upload = multer({ dest: "uploads/" });

const taskModel = require("../models/taskModels");

class TaskController {
    // Check for dupliocate task titles for the same user
    #checkDuplicateTaskTitle = async (title, userId, res) => {
        try {
            const taskExist = await taskModel.findOne({ title: title, createdBy: userId });
            if (taskExist) {
                return res.status(409).json({
                    status: 'fail',
                    message: 'Task title already exists for this user'
                });
            }

            return;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Create a new task
    createTask = async (req, res) => {
        try {
            const { title, description, status, dueDate, assignedTo } = req.body;

            // check for duplicate task title for the same user
            await this.#checkDuplicateTaskTitle(title, req.userId, res);

            const newTask = new taskModel({
                title: title,
                description: description,
                createdBy: req.userId, // Assigning the task to the authenticated user
                status: status,
                assignedTo: assignedTo,
                dueDate: dueDate
            });

            const saveTask = await newTask.save();

            return res.status(201).json({
                status: 'success',
                message: 'Task created successfully',
                task: saveTask
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // View tasks assigned to the authenticated user
    viewTasks = async (req, res) => {
        try {
            const tasks = new Array(await taskModel.find({ assignedTo: req.userId }).populate('createdBy', 'name email role').populate('assignedTo', 'name email role'));

            if (tasks.length === 0) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No tasks found assigned to this user'
                });
            }

            return res.status(200).json({
                status: 'success',
                tasks: tasks
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Update a task
    updateTask = async (req, res) => {
        try {
            const taskId = req.params.id;
            const { title, description, status, dueDate, addAssignedTo, removeAssignedTo } = req.body;

            const taskUpdates = {}

            if (title) taskUpdates.title = title;
            if (description) taskUpdates.description = description;
            if (status) taskUpdates.status = status;
            if (dueDate) taskUpdates.dueDate = dueDate;

            // Build update query dynamically
            const updateQuery = { $set: taskUpdates };

            // 👉 Add users to assignedTo (unique)
            if (addAssignedTo && addAssignedTo.length > 0) {
                updateQuery.$addToSet = { assignedTo: { $each: addAssignedTo } };
            }

            // 👉 Remove users from assignedTo
            if (removeAssignedTo && removeAssignedTo.length > 0) {
                updateQuery.$pull = { assignedTo: { $in: removeAssignedTo } };
            }

            const task = await taskModel.findOneAndUpdate({ _id: taskId, createdBy: req.userId }, updateQuery, { new: true });

            if (!task) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Task not found'
                });
            }

            return res.status(200).json({
                status: 'success',
                message: 'Task updated successfully',
                task: task
            });

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Search tasks by title or description
    searchTasks = async (req, res) => {
        try {
            const { query } = req.query; // e.g. /tasks/search?query=meeting

            if (!query || query.trim() === "") {
                return res.status(400).json({
                    status: "fail",
                    message: "Please provide a search query.",
                });
            }

            // Case-insensitive regex search and search only within tasks created by the authenticated user
            const tasks = await taskModel.find({
                createdBy: req.userId,
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            });

            if (tasks.length === 0) {
                return res.status(404).json({
                    status: "fail",
                    message: "No matching tasks found.",
                });
            }

            return res.status(200).json({
                status: "success",
                count: tasks.length,
                tasks,
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Filter tasks by status
    filterTasksByStatus = async (req, res) => {
        try {
            const { status } = req.query; // e.g. /tasks/filter?status=open

            if (!status) {
                return res.status(400).json({
                    status: "fail",
                    message: "Please provide a task status to filter by.",
                });
            }

            const allowedStatuses = ["open", "in-progress", "completed", "pending"]; // adjust as per your schema

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    status: "fail",
                    message: `Invalid status value. Allowed: ${allowedStatuses.join(", ")}.`,
                });
            }

            const tasks = await taskModel.find({
                createdBy: req.userId,
                status: status,
            });

            return res.status(200).json({
                status: "success",
                count: tasks.length,
                tasks,
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Add comments to a task
    addComment = async (req, res) => {
        try {
            const { id } = req.params; // task ID
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ status: "fail", message: "Comment text is required" });
            }

            const comment = {
                user: req.userId,
                text,
                createdAt: new Date(),
            };

            const task = await taskModel.findByIdAndUpdate(
                id,
                { $push: { comments: comment } },
                { new: true }
            ).populate('comments.user', 'name email'); // optional populate

            if (!task) {
                return res.status(404).json({ status: "fail", message: "Task not found" });
            }

            res.status(200).json({
                status: "success",
                message: "Comment added successfully",
                task,
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Add attachments to a task
    addAttachment = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Please upload a file.',
                });
            }

            // proceed with your upload logic
            const { id } = req.params;
            const file = req.file;

            const attachment = {
                fileName: file.originalname,
                fileUrl: `/uploads/${file.filename}`,
                uploadedBy: req.userId,
                uploadedAt: new Date(),
            };

            const task = await taskModel.findByIdAndUpdate(
                id,
                { $push: { attachments: attachment } },
                { new: true }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Attachment added successfully.',
                task,
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

}
module.exports = new TaskController();