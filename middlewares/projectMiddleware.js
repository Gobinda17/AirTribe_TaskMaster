const { validationResult } = require("express-validator");

// User Model
const userModel = require("../models/userModels");

// Blaclist Token Model
const BlacklistedToken = require('../models/blackListTokenModels');

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

class ProjectMiddleware {
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

    // Check user existence 
    #checkUserExistence = async (decoded, res) => {
        try {
            const userExist = await userModel.findById(decoded.userId);
            if (!userExist) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found.'
                });
            }
            return decoded.userId;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Middleware to validate project creation or sending invites
    validateProjectCreationOrSendingInvites = async (req, res, next) => {
        try {
            // Check for validation errors
            this.#handleValidationErrors(req, res);

            // Verify JWT token
            const decoded = await this.#verifyToken(req, res);

            // Check if user exists
            const userExist = await this.#checkUserExistence(decoded, res);
            if (userExist) {
                req.userId = userExist; // Attach userId to request object
                next();
            }
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Middleware to validate accpted invites
    validateAcceptingInvites = async (req, res, next) => {
        try {
            // Verify JWT token
            const decoded = await this.#verifyToken(req, res);

            // Check if user exists
            const userExist = await this.#checkUserExistence(decoded, res);
            if (userExist) {
                req.userId = userExist; // Attach userId to request object
                next();
            }
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    }
}

module.exports = new ProjectMiddleware();