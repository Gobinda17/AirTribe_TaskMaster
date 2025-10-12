// I'm importing Express to create my router for task-related endpoints
const express = require('express');
// I'm creating a router instance to define task routes
const router = express.Router();

// I'm importing multer configuration for handling file uploads (attachments)
const upload = require('../utils/multerConfig');

// I'm importing validation rules for different task operations
const { taskCreationValidation, taskUpdationValidation, addCommentValidation, addAttachmentValidation } = require('../middlewares/validations');

// I'm importing my task middleware for authentication and validation
const TaskMiddleware = require('../middlewares/taskMiddleware');
// I'm importing my task controller to handle business logic
const TaskController = require('../controllers/taskController');

// I'm defining the task creation route for authenticated users
// This route handles POST requests to /task with validation and authentication
router.post('/task', [taskCreationValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.createTask.bind(TaskController));

// I'm defining the route to view tasks assigned to the authenticated user
// This route handles GET requests to /task to retrieve user's assigned tasks
router.get('/task', [TaskMiddleware.validateViewTasksOrDeleteTask.bind(TaskMiddleware)], TaskController.viewTasks.bind(TaskController));

// I'm defining the task update route for modifying existing tasks
// This route handles PATCH requests to /task/:id for updating task details
router.patch('/task/:id', [taskUpdationValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.updateTask.bind(TaskController));

// I'm defining the task search route for finding tasks by title or description
// This route handles GET requests to /task/search with query parameters
router.get('/task/search', [TaskMiddleware.validateViewTasksOrDeleteTask.bind(TaskMiddleware)], TaskController.searchTasks.bind(TaskController));

// I'm defining the task filtering route for filtering tasks by status
// This route handles GET requests to /task/filter with status query parameters
router.get('/task/filter', [TaskMiddleware.validateViewTasksOrDeleteTask.bind(TaskMiddleware)], TaskController.filterTasksByStatus.bind(TaskController));

// I'm defining the route to add comments to tasks for collaboration
// This route handles PATCH requests to /task/:id/comment for adding discussion comments
router.patch('/task/:id/comment', [addCommentValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.addComment.bind(TaskController));

// I'm defining the route to add file attachments to tasks
// This route handles PATCH requests to /task/:id/attachment with file upload functionality
router.patch('/task/:id/attachment', [addAttachmentValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware), upload.single('attachment')], TaskController.addAttachment.bind(TaskController));

// I'm defining the task deletion route for removing tasks
// This route handles DELETE requests to /task/:id for deleting specific tasks
router.delete('/task/:id', [TaskMiddleware.validateViewTasksOrDeleteTask.bind(TaskMiddleware)], TaskController.deleteTask.bind(TaskController));

// I'm exporting the router so it can be mounted in the main app
module.exports = router;