// I'm importing express-validator functions to create validation rules for request data
const { body, param } = require("express-validator");

// I'm defining validation rules for user registration to ensure data integrity
const registrationValidation = [
    // I'm validating that the name field is not empty
    body('name').notEmpty().withMessage('Name is required.'),
    // I'm validating that email is provided and has a valid email format
    body('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Email is invalid.'),
    // I'm validating that password is provided and meets minimum length requirements
    body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password length must be at least 6 characters long.'),
    // I'm validating that the role parameter is either 'user' or 'admin'
    param('role').isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"')
];

// I'm defining validation rules for user login to ensure proper authentication data
const loginValidation = [
    // I'm validating that email is provided and has a valid email format
    body('email').isEmail().withMessage('Email is invalid.').notEmpty().withMessage('Email is required.'),
    // I'm validating that password is provided and meets minimum length requirements
    body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password length must be at least 6 characters long.'),
    // I'm validating that the role parameter is either 'user' or 'admin'
    param('role').isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"')
];

// I'm defining validation rules for user profile updates with optional fields
const updateUserProfileValidation = [
    // I'm making name optional since users might only want to update email
    body('name').optional(),
    // I'm making email optional but validating format if provided
    body('email').optional().isEmail().withMessage('Email is invalid.'),
];

// I'm defining validation rules for task creation to ensure complete task data
const taskCreationValidation = [
    // I'm validating that the task title is provided
    body('title').notEmpty().withMessage('Title is required.'),
    // I'm validating that the task description is provided
    body('description').notEmpty().withMessage('Description is required.'),
    // I'm validating that due date is provided and in valid ISO8601 format
    body('dueDate').notEmpty().isISO8601().withMessage('Due date must be a valid date.'),
    // I'm making status optional but validating allowed values if provided
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be either "pending", "in-progress", or "completed".'),
    // I'm validating that at least one user is assigned to the task
    body('assignedTo').isArray({ min: 1 }).withMessage('At least one user must be assigned to the task.'),
    // I'm validating that each assigned user ID is a valid MongoDB ObjectId
    body('assignedTo.*').isMongoId().withMessage('Each assigned user ID must be a valid User ID.')
];

// I'm defining validation rules for task updates with flexible field modifications
const taskUpdationValidation = [
    // I'm making title optional but ensuring it's not empty if provided
    body('title').optional().notEmpty().withMessage('Title cannot be empty if provided.'),
    // I'm making description optional but ensuring it's not empty if provided
    body('description').optional().notEmpty().withMessage('Description cannot be empty if provided.'),
    // I'm validating due date format if provided during update
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date if provided.'),
    // I'm validating status values if provided during update
    body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Status must be either "pending", "in-progress", or "completed".'),
    // I'm validating the array for adding new assigned users
    body('addAssignedTo').optional().isArray().withMessage(' AssignedTo must be an array if provided.'),
    // I'm validating that each user ID being added is a valid MongoDB ObjectId
    body('addAssignedTo.*').optional().isMongoId().withMessage('Each added assigned user ID must be a valid User ID.'),
    // I'm validating the array for removing assigned users
    body('removeAssignedTo').optional().isArray().withMessage(' removeAssignedTo must be an array if provided.'),
    // I'm validating that each user ID being removed is a valid MongoDB ObjectId
    body('removeAssignedTo.*').optional().isMongoId().withMessage('Each removed assigned user ID must be a valid User ID.'),
];

// I'm defining validation rules for adding comments to tasks
const addCommentValidation = [
    // I'm validating that comment text is provided and not empty
    body('text').notEmpty().withMessage('Comment text is required.'),
];

// I'm defining validation rules for adding file attachments to tasks
const addAttachmentValidation = [
    // I'm making filename optional but ensuring it's a string if provided
    body('fileName').optional().isString().trim(),
];

// I'm defining validation rules for project creation to ensure complete project data
const projectCreationValidation = [
    // I'm validating that the project name is provided
    body('name').notEmpty().withMessage('Project name is required.'),
    // I'm making description optional but ensuring it's a string if provided
    body('description').optional().isString().withMessage('Description must be a string if provided.'),
    // I'm making initial members optional but validating array format if provided
    body('members').optional().isArray({ min: 1 }).withMessage('At least one member must be added to the project.'),
    // I'm validating that each member ID is a valid MongoDB ObjectId
    body('members.*').optional().isMongoId().withMessage('Each member ID must be a valid User ID.'),
];

// I'm defining validation rules for sending project invitations
const sendInvitationsValidation = [
    // I'm validating that at least one member is being invited
    body('members').isArray({ min: 1 }).withMessage('At least one member must be invited.'),
    // I'm validating that each member ID is a valid MongoDB ObjectId
    body('members.*').isMongoId().withMessage('Each member ID must be a valid User ID.'),
]

module.exports = { registrationValidation, loginValidation, updateUserProfileValidation, taskCreationValidation, taskUpdationValidation, addCommentValidation, addAttachmentValidation, projectCreationValidation, sendInvitationsValidation };