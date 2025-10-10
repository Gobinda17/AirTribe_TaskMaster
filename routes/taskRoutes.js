const express = require('express');
const router = express.Router();

// Validation rules for task
const { taskCreationValidation } = require('../middlewares/validations');
// Importing the necessary middleware
const TaskMiddleware = require('../middlewares/taskMiddleware');
// Importing the necessary controller
const TaskController = require('../controllers/taskController');

// Route to create a new task
router.post('/task', [taskCreationValidation, TaskMiddleware.validateTaskCreation.bind(TaskMiddleware)], TaskController.createTask.bind(TaskController));

// Route to view tasks assigned to the authenticated user
router.get('/task', [TaskMiddleware.validateViewTasks.bind(TaskMiddleware)], TaskController.viewTasks.bind(TaskController));

module.exports = router;