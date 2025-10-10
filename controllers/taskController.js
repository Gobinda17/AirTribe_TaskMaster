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
    updateTask = async ( req, res ) => {
        try {
            const taskId = req.params.id;
            const { title, description, status, dueDate, assignedTo } = req.body;

            const taskUpdates = {}

            if(title) taskUpdates.title = title;
            if(description) taskUpdates.description = description;
            if(status) taskUpdates.status = status;
            if(dueDate) taskUpdates.dueDate = dueDate;
            if(assignedTo) taskUpdates.assignedTo = assignedTo;

            const task = await taskModel.findOneAndUpdate({_id: taskId, createdBy: req.userId }, taskUpdates , { new: true });

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

}
module.exports = new TaskController();