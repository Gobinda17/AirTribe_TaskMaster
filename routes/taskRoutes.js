const express = require('express');
const router = express.Router();

// Multer for handling file uploads
const upload = require('../utils/multerConfig');

// Validation rules for task
const { taskCreationValidation, taskUpdationValidation, addCommentValidation, addAttachmentValidation } = require('../middlewares/validations');

// Importing the necessary middleware
const TaskMiddleware = require('../middlewares/taskMiddleware');
// Importing the necessary controller
const TaskController = require('../controllers/taskController');

// Route to create a new task
router.post('/task', [taskCreationValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.createTask.bind(TaskController));

// Route to view tasks assigned to the authenticated user
router.get('/task', [TaskMiddleware.validateViewTasks.bind(TaskMiddleware)], TaskController.viewTasks.bind(TaskController));

// Route to update a task by ID
router.patch('/task/:id', [taskUpdationValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.updateTask.bind(TaskController));

// Route to search tasks by title or description
router.get('/task/search', [TaskMiddleware.validateViewTasks.bind(TaskMiddleware)], TaskController.searchTasks.bind(TaskController));

// Routes to filter tasks by status
router.get('/task/filter', [TaskMiddleware.validateViewTasks.bind(TaskMiddleware)], TaskController.filterTasksByStatus.bind(TaskController));

// Routes to add comments to a task
router.post('/task/:id/comment', [addCommentValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.addComment.bind(TaskController));

// Routes to add attachments to a task
router.post('/task/:id/attachment', upload.single('attachment'), [addAttachmentValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.addAttachment.bind(TaskController));

module.exports = router;