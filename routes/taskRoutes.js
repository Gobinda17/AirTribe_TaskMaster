const express = require('express');
const router = express.Router();

// Validation rules for task
const { taskCreationValidation, taskUpdationValidation } = require('../middlewares/validations');
// Importing the necessary middleware
const TaskMiddleware = require('../middlewares/taskMiddleware');
// Importing the necessary controller
const TaskController = require('../controllers/taskController');

// Route to create a new task
router.post('/task', [taskCreationValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.createTask.bind(TaskController));

// Route to view tasks assigned to the authenticated user
router.get('/task', [TaskMiddleware.validateViewTasks.bind(TaskMiddleware)], TaskController.viewTasks.bind(TaskController));

// Route to update a task by ID
router.put('/task/:id', [taskUpdationValidation, TaskMiddleware.validateTaskCreationOrUpdation.bind(TaskMiddleware)], TaskController.updateTask.bind(TaskController));

module.exports = router;