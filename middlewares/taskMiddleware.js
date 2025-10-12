// I'm importing express-validator to handle validation results from request validation
const { validationResult } = require("express-validator");

// I'm importing my User model to verify user existence during task operations
const userModel = require("../models/userModels");

// I'm importing my BlacklistedToken model to check for invalidated tokens
const BlacklistedToken = require('../models/blackListTokenModels');

// I'm importing jsonwebtoken for JWT token verification
const jwt = require('jsonwebtoken');

// I'm getting my JWT secret from environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;

class TaskMiddleware {
    // I'm creating a private method to handle validation errors from express-validator
    // This centralizes error handling for all task-related validation failures
    #handleValidationErrors = (req, res) => {
        // I'm extracting validation results from the request
        const errors = validationResult(req);
        // I'm checking if there are any validation errors
        if (!errors.isEmpty()) {
            // I'm returning the first validation error message to the client
            return res.status(400).json({
                status: 'fail',
                message: 'Validation errors',
                errors: errors.array()[0].msg
            });
        }
    };

    // I'm creating a private method to verify JWT tokens for task operations
    #verifyToken = async (req, res) => {
        try {
            // I'm extracting the authorization header from the request
            const authHeader = req.headers.authorization;

            // I'm checking if authorization header is provided
            if (!authHeader) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No token provided'
                });
            }

            // I'm extracting the JWT token from the Bearer authorization header
            const token = authHeader.split(' ')[1];

            // I'm checking if the token has been blacklisted (user logged out)
            const blacklisted = await BlacklistedToken.findOne({ token });
            if (blacklisted) {
                return res.status(401).json({ message: 'Token blacklisted' });
            }

            // I'm verifying and decoding the JWT token
            const decoded = await jwt.verify(token, JWT_SECRET);
            if (!decoded) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: Invalid token'
                });
            }
            // I'm returning the decoded token information for further use
            return decoded;
        } catch (error) {
            // I'm handling any errors during token verification
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm creating a private method to verify that the authenticated user still exists in the database
    // This prevents operations by users who may have been deleted after token issuance
    #checkUserExistence = async (decoded, res) => {
        try {
            // I'm searching for the user by their ID from the JWT token
            const userExist = await userModel.findById(decoded.userId);
            if (!userExist) {
                // I'm returning an error if the user no longer exists
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found || User not authorized to create task or view tasks.'
                });
            }
            // I'm returning the user ID if the user exists
            return decoded.userId;
        } catch (error) {
            // I'm handling any errors during user existence check
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling validation for task creation and update operations
    validateTaskCreationOrUpdation = async (req, res, next) => {
        try {
            // I'm checking for any validation errors from the validation rules
            this.#handleValidationErrors(req, res);

            // I'm verifying the JWT token to authenticate the user
            const decoded = await this.#verifyToken(req, res);

            // I'm checking if the authenticated user still exists in the database
            const userExist = await this.#checkUserExistence(decoded, res);
            if (userExist) {
                // I'm attaching the user ID to the request for use in controllers
                req.userId = userExist;
                // I'm proceeding to the task creation/update controller
                next();
            }
        } catch (error) {
            // I'm handling any errors during task creation/update validation
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling validation for task viewing and deletion operations
    validateViewTasksOrDeleteTask = async (req, res, next) => {
        try {
            // I'm verifying the JWT token to authenticate the user
            const decoded = await this.#verifyToken(req, res);

            // I'm checking if the authenticated user still exists in the database
            const userExist = await this.#checkUserExistence(decoded, res);
            if (userExist) {
                // I'm attaching the user ID to the request for use in controllers
                req.userId = userExist;
                // I'm proceeding to the task viewing/deletion controller
                next();
            }
        } catch (error) {
            // I'm handling any errors during task viewing/deletion validation
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };
}

module.exports = new TaskMiddleware();