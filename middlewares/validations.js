const { body, param } = require("express-validator");

// Validation rules for user registration
const registrationValidation = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Email is invalid.'),
    body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password length must be at least 6 characters long.'),
    param('role').isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"')
];

// Validation rules for user login
const loginValidation = [
    body('email').isEmail().withMessage('Email is invalid.').notEmpty().withMessage('Email is required.'),
    body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password length must be at least 6 characters long.'),
    param('role').isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"')
];

// Validation rules for updating user profile
const updateUserProfileValidation = [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Email is invalid.'),
];

// Validation rules for task creation
const taskCreationValidation = [
    body('title').notEmpty().withMessage('Title is required.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('dueDate').notEmpty().isISO8601().withMessage('Due date must be a valid date.'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be either "pending", "in-progress", or "completed".')
];

// Validation rule for task updation
const taskUpdationValidation = [
    body('title').optional().notEmpty().withMessage('Title cannot be empty if provided.'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty if provided.'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date if provided.'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be either "pending", "in-progress", or "completed".')
];

module.exports = { registrationValidation, loginValidation, updateUserProfileValidation, taskCreationValidation, taskUpdationValidation };