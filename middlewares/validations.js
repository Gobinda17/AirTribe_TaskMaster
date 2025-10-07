const { body, param, validationResult } = require("express-validator");

const registrationValidation = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').notEmpty().withMessage('Email is required.').isEmail().withMessage('Email is invalid.'),
    body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password length must be at least 6 characters long.'),
    param('role').isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"')
];

const loginValidation = [
    body('email').isEmail().withMessage('Email is invalid.').notEmpty().withMessage('Email is required.'),
    body('password').notEmpty().withMessage('Password is required.').isLength({ min: 6 }).withMessage('Password length must be at least 6 characters long.'),
    param('role').isIn(['user', 'admin']).withMessage('Role must be either "user" or "admin"')
];

const updateUserProfileValidation = [
    body('name').optional(),
    body('email').optional().isEmail().withMessage('Email is invalid.'),
]

module.exports = { registrationValidation, loginValidation, updateUserProfileValidation };