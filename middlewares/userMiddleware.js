const { validationResult } = require('express-validator');

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// User Model
const userModel = require('../models/userModels');

// Blaclist Token Model
const BlacklistedToken = require('../models/blackListTokenModels');

class UserMiddleware {
    // Private method to check if email already exists
    #checkExistingEmail = async (req, res) => {
        try {
            // Logic to check if email already exists in the database
            const { email } = req.body;
            const userExist = await userModel.findOne({ email: email });
            return userExist;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Private method to handle validation errors
    #handleValidationErrors = (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'fail',
                message: 'Validation errors',
                errors: errors.array()[0].msg
            });
        }
    };

    // Check jwt token
    #verifyToken = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No token provided'
                });
            }

            const token = authHeader.split(' ')[1];

            // Checking for Blaslisted Token
            const blacklisted = await BlacklistedToken.findOne({ token });
            if (blacklisted) {
                return res.status(401).json({ message: 'Token blacklisted' });
            }

            const decoded = await jwt.verify(token, JWT_SECRET);
            if (!decoded) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: Invalid token'
                });
            }
            return decoded;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };



    // Validate user registration
    validateRegistration = async (req, res, next) => {
        try {
            // Check for validation errors
            // If there are validation errors, the response will be sent from the handler
            this.#handleValidationErrors(req, res);

            // Check if the email already exists
            const userExist = await this.#checkExistingEmail(req, res);
            // If email exists, return a 409 Conflict response
            if (userExist) {
                return res.status(409).json({
                    status: 'fail',
                    message: 'Email already exist'
                });
            }
            // If email does not exist, proceed to the next middleware or route handler
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Validate user login
    validateLogin = async (req, res, next) => {
        try {
            // Check for validation errors
            // If there are validation errors, the response will be sent from the handler
            this.#handleValidationErrors(req, res);

            // Check if the email exists
            const userExist = await this.#checkExistingEmail(req, res);

            // If email does not exist, return a 404 Not Found response
            if (!userExist) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Email does not exist'
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Validate user profile update
    validateProfileUpdate = async (req, res, next) => {
        try {
            // Check for validation errors
            // If there are validation errors, the response will be sent from the handler
            this.#handleValidationErrors(req, res);
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Validate user logout
    validateLogout = async (req, res, next) => {
        try {
            // Verify JWT token
            const decoded = await this.#verifyToken(req, res);
            req.userId = decoded.userId;
            req.token = decoded;
            next();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    }
}

module.exports = new UserMiddleware();