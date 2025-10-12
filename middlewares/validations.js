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
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be either "pending", "in-progress", or "completed".'),
    body('assignedTo').isArray({ min: 1 }).withMessage('At least one user must be assigned to the task.'),
    body('assignedTo.*').isMongoId().withMessage('Each assigned user ID must be a valid User ID.')
];

// Validation rule for task updation
const taskUpdationValidation = [
    body('title').optional().notEmpty().withMessage('Title cannot be empty if provided.'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty if provided.'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date if provided.'),
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be either "pending", "in-progress", or "completed".'),
    body('addAssignedTo').optional().isArray().withMessage(' AssignedTo must be an array if provided.'),
    body('addAssignedTo.*').optional().isMongoId().withMessage('Each added assigned user ID must be a valid User ID.'),
    body('removeAssignedTo').optional().isArray().withMessage(' removeAssignedTo must be an array if provided.'),
    body('removeAssignedTo.*').optional().isMongoId().withMessage('Each removed assigned user ID must be a valid User ID.'),
];

// Validation rule for adding comments to a task
const addCommentValidation = [
    body('text').notEmpty().withMessage('Comment text is required.'),
];

// Validation rule for adding attachments to a task
const addAttachmentValidation = [
    body('fileName').optional().isString().trim(),
];

// Validation rules for project creation
const projectCreationValidation = [
    body('name').notEmpty().withMessage('Project name is required.'),
    body('description').optional().isString().withMessage('Description must be a string if provided.'),
    body('members').optional().isArray({ min: 1 }).withMessage('At least one member must be added to the project.'),
    body('members.*').optional().isMongoId().withMessage('Each member ID must be a valid User ID.'),
];

// Validation rules for sending invitations
const sendInvitationsValidation = [
    body('members').isArray({ min: 1 }).withMessage('At least one member must be invited.'),
    body('members.*').isMongoId().withMessage('Each member ID must be a valid User ID.'),
]

module.exports = { registrationValidation, loginValidation, updateUserProfileValidation, taskCreationValidation, taskUpdationValidation, addCommentValidation, addAttachmentValidation, projectCreationValidation, sendInvitationsValidation };