// I'm importing Node.js file system module for file operations like deleting attachments
const fs = require('fs');
// I'm importing Node.js path module for handling file paths
const path = require('path');

// I'm importing my Task model to interact with task data in MongoDB
const taskModel = require("../models/taskModels");

class TaskController {
    // I'm creating a private method to check for duplicate task titles for the same user
    // This prevents users from creating multiple tasks with the same title
    #checkDuplicateTaskTitle = async (title, userId, res) => {
        try {
            // I'm searching for an existing task with the same title created by the same user
            const taskExist = await taskModel.findOne({ title: title, createdBy: userId });
            if (taskExist) {
                // I'm returning a conflict error if a duplicate task title is found
                return res.status(409).json({
                    status: 'fail',
                    message: 'Task title already exists for this user'
                });
            }

            // I'm returning nothing if no duplicate is found (validation passed)
            return;
        } catch (error) {
            // I'm handling any errors during the duplicate check process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling the creation of new tasks with real-time notifications
    createTask = async (req, res) => {
        try {
            // I'm extracting task details from the request body
            const { title, description, status, dueDate, assignedTo } = req.body;

            // I'm checking for duplicate task titles before creating the new task
            await this.#checkDuplicateTaskTitle(title, req.userId, res);

            // I'm creating a new task instance with the provided data
            const newTask = new taskModel({
                title: title,
                description: description,
                createdBy: req.userId, // I'm assigning the task creator as the authenticated user
                status: status,
                assignedTo: assignedTo,
                dueDate: dueDate
            });

            // I'm saving the new task to the database
            const saveTask = await newTask.save();

            // I'm sending real-time notifications to assigned users using Socket.io
            const io = req.app.get('io');
            if (newTask.assignedTo) {
                // I'm emitting a task assignment notification to the assigned user's room
                io.to(newTask.assignedTo.toString()).emit('task-assigned', {
                    message: `You have been assigned a new task: ${newTask.title}`,
                });

                console.log(`Notification emitted to user: ${newTask.assignedTo}`);
            }

            // I'm sending a successful response with the created task data
            return res.status(201).json({
                status: 'success',
                message: 'Task created successfully',
                task: saveTask
            });
        } catch (error) {
            // I'm handling any errors during the task creation process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling the retrieval of tasks assigned to the authenticated user
    viewTasks = async (req, res) => {
        try {
            // I'm finding all tasks assigned to the current user and populating user details
            // I'm using populate to get full user information for both creator and assignee
            const tasks = new Array(await taskModel.find({ assignedTo: req.userId }).populate('createdBy', 'name email role').populate('assignedTo', 'name email role'));

            // I'm checking if any tasks were found for this user
            if (tasks.length === 0) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No tasks found assigned to this user'
                });
            }

            // I'm returning the found tasks with populated user information
            return res.status(200).json({
                status: 'success',
                tasks: tasks
            });
        } catch (error) {
            // I'm handling any errors during the task retrieval process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling task updates with dynamic field modifications and user assignment management
    updateTask = async (req, res) => {
        try {
            // I'm getting the task ID from URL parameters
            const taskId = req.params.id;
            // I'm extracting the fields to be updated from the request body
            const { title, description, status, dueDate, addAssignedTo, removeAssignedTo } = req.body;

            // I'm building an object with only the basic fields that need to be updated
            const taskUpdates = {}

            if (title) taskUpdates.title = title;
            if (description) taskUpdates.description = description;
            if (status) taskUpdates.status = status;
            if (dueDate) taskUpdates.dueDate = dueDate;

            // I'm building a dynamic MongoDB update query starting with basic field updates
            const updateQuery = { $set: taskUpdates };

            // I'm handling adding new users to the assignedTo array without duplicates
            if (addAssignedTo && addAssignedTo.length > 0) {
                updateQuery.$addToSet = { assignedTo: { $each: addAssignedTo } };
            }

            // I'm handling removing users from the assignedTo array
            if (removeAssignedTo && removeAssignedTo.length > 0) {
                updateQuery.$pull = { assignedTo: { $in: removeAssignedTo } };
            }

            // I'm updating the task only if it was created by the authenticated user (authorization)
            const task = await taskModel.findOneAndUpdate({ _id: taskId, createdBy: req.userId }, updateQuery, { new: true });

            // I'm checking if the task was found and updated
            if (!task) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Task not found'
                });
            }

            // I'm returning the updated task data
            return res.status(200).json({
                status: 'success',
                message: 'Task updated successfully',
                task: task
            });

        } catch (error) {
            // I'm handling any errors during the task update process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling task search functionality across title and description fields
    searchTasks = async (req, res) => {
        try {
            // I'm getting the search query from URL parameters (e.g. /tasks/search?query=meeting)
            const { query } = req.query;

            // I'm validating that a search query was provided
            if (!query || query.trim() === "") {
                return res.status(400).json({
                    status: "fail",
                    message: "Please provide a search query.",
                });
            }

            // I'm performing a case-insensitive regex search on both title and description fields
            // I'm limiting the search to tasks created by the authenticated user only
            const tasks = await taskModel.find({
                createdBy: req.userId,
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            });

            // I'm checking if any matching tasks were found
            if (tasks.length === 0) {
                return res.status(404).json({
                    status: "fail",
                    message: "No matching tasks found.",
                });
            }

            // I'm returning the search results with count and task data
            return res.status(200).json({
                status: "success",
                count: tasks.length,
                tasks,
            });
        } catch (error) {
            // I'm handling any errors during the search process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling task filtering by status with validation
    filterTasksByStatus = async (req, res) => {
        try {
            // I'm getting the status filter from URL query parameters (e.g. /tasks/filter?status=open)
            const { status } = req.query;

            // I'm validating that a status filter was provided
            if (!status) {
                return res.status(400).json({
                    status: "fail",
                    message: "Please provide a task status to filter by.",
                });
            }

            // I'm defining the allowed status values to prevent invalid filters
            const allowedStatuses = ["open", "in-progress", "completed", "pending"];

            // I'm validating that the provided status is one of the allowed values
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    status: "fail",
                    message: `Invalid status value. Allowed: ${allowedStatuses.join(", ")}.`,
                });
            }

            // I'm finding all tasks created by the authenticated user with the specified status
            const tasks = await taskModel.find({
                createdBy: req.userId,
                status: status,
            });

            // I'm returning the filtered tasks with count information
            return res.status(200).json({
                status: "success",
                count: tasks.length,
                tasks,
            });
        } catch (error) {
            // I'm handling any errors during the filtering process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling adding comments to tasks for collaboration
    addComment = async (req, res) => {
        try {
            // I'm getting the task ID from URL parameters
            const { id } = req.params;
            // I'm extracting the comment text from the request body
            const { text } = req.body;

            // I'm validating that comment text is provided
            if (!text) {
                return res.status(400).json({ status: "fail", message: "Comment text is required" });
            }

            // I'm creating a comment object with user information and timestamp
            const comment = {
                user: req.userId,
                text,
                createdAt: new Date(),
            };

            // I'm adding the comment to the task's comments array using MongoDB's $push operator
            const task = await taskModel.findByIdAndUpdate(
                id,
                { $push: { comments: comment } },
                { new: true }
            );

            // I'm checking if the task was found
            if (!task) {
                return res.status(404).json({ status: "fail", message: "Task not found" });
            }

            // I'm returning the updated task with the new comment
            res.status(200).json({
                status: "success",
                message: "Comment added successfully",
                task,
            });
        } catch (error) {
            // I'm handling any errors during the comment addition process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling file attachments to tasks with proper cleanup on errors
    addAttachment = async (req, res) => {
        try {
            // I'm validating that a file was uploaded with the request
            if (!req.file) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Please upload a file.',
                });
            }

            // I'm getting the task ID from URL parameters and file information from multer
            const { id } = req.params;
            const file = req.file;

            // I'm creating an attachment object with file metadata and user information
            const attachment = {
                fileName: file.originalname,
                fileUrl: `/uploads/${file.filename}`,
                uploadedBy: req.userId,
                uploadedAt: new Date(),
            };

            // I'm adding the attachment to the task's attachments array
            const task = await taskModel.findByIdAndUpdate(
                id,
                { $push: { attachments: attachment } },
                { new: true }
            );

            // I'm returning success response with the updated task
            return res.status(200).json({
                status: 'success',
                message: 'Attachment added successfully.',
                task,
            });
        } catch (error) {
            // I'm cleaning up the uploaded file if an error occurs during processing
            // This prevents orphaned files from accumulating on the server
            if (req.file) {
                fs.unlink(path.join(__dirname, '..', 'uploads', req.file.filename), () => { });
            }
            // I'm handling any errors during the attachment process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling task deletion with proper file cleanup and authorization
    deleteTask = async (req, res) => {
        try {
            // I'm getting the task ID from URL parameters
            const taskId = req.params.id;

            // I'm deleting the task only if it was created by the authenticated user (authorization)
            const task = await taskModel.findOneAndDelete({ _id: taskId, createdBy: req.userId });

            // I'm cleaning up any associated attachment files from the server
            // This prevents orphaned files from taking up storage space
            if (task && task.attachments && task.attachments.length > 0) {
                task.attachments.forEach(attachment => {
                    fs.unlink(path.join(__dirname, '..', 'uploads', attachment.fileName), () => { });
                });
            }

            // I'm checking if the task was found and deleted
            if (!task) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Task not found or user not authorized to delete this task.'
                });
            }

            // I'm returning success response with the deleted task data
            return res.status(200).json({
                status: 'success',
                message: 'Task deleted successfully.',
                task
            });
        } catch (error) {
            // I'm handling any errors during the task deletion process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

}
module.exports = new TaskController();