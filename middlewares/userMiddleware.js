// I'm importing express-validator to handle validation results from request validation
const { validationResult } = require('express-validator');

// I'm importing jsonwebtoken for JWT token verification
const jwt = require('jsonwebtoken');
// I'm getting my JWT secret from environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;

// I'm importing my User model to check user existence in database
const userModel = require('../models/userModels');

// I'm importing my BlacklistedToken model to check for invalidated tokens
const BlacklistedToken = require('../models/blackListTokenModels');

class UserMiddleware {
    // I'm creating a private method to check if an email already exists in the database
    // This prevents duplicate user registrations with the same email
    #checkExistingEmail = async (req, res) => {
        try {
            // I'm extracting the email from the request body
            const { email } = req.body;
            // I'm searching for any existing user with this email address
            const userExist = await userModel.findOne({ email: email });
            // I'm returning the user object if found, or null if not found
            return userExist;
        } catch (error) {
            // I'm handling any database errors during the email check
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm creating a private method to handle validation errors from express-validator
    // This centralizes error handling for all validation failures
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

    // I'm creating a private method to verify JWT tokens with blacklist checking
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

            // I'm checking if the token has been blacklisted (logged out)
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



    // I'm handling user registration validation including email uniqueness check
    validateRegistration = async (req, res, next) => {
        try {
            // I'm checking for any validation errors from the validation rules
            this.#handleValidationErrors(req, res);

            // I'm checking if the provided email already exists in the database
            const userExist = await this.#checkExistingEmail(req, res);
            // I'm preventing duplicate registrations by returning conflict error
            if (userExist) {
                return res.status(409).json({
                    status: 'fail',
                    message: 'Email already exist'
                });
            }
            // I'm proceeding to the registration controller if validation passes
            next();
        } catch (error) {
            // I'm handling any errors during the registration validation process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling user login validation to ensure email exists before authentication
    validateLogin = async (req, res, next) => {
        try {
            // I'm checking for any validation errors from the validation rules
            this.#handleValidationErrors(req, res);

            // I'm checking if the provided email exists in the database
            const userExist = await this.#checkExistingEmail(req, res);

            // I'm preventing login attempts with non-existent emails
            if (!userExist) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Email does not exist'
                });
            }
            // I'm proceeding to the login controller if the email exists
            next();
        } catch (error) {
            // I'm handling any errors during the login validation process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling user profile update validation
    validateProfileUpdate = async (req, res, next) => {
        try {
            // I'm checking for any validation errors from the validation rules
            this.#handleValidationErrors(req, res);
            // I'm proceeding to the profile update controller if validation passes
            next();
        } catch (error) {
            // I'm handling any errors during the profile update validation
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling user logout validation by verifying their JWT token
    validateLogout = async (req, res, next) => {
        try {
            // I'm verifying the JWT token to ensure it's valid before allowing logout
            const decoded = await this.#verifyToken(req, res);
            // I'm attaching user information to the request for the logout process
            req.userId = decoded.userId;
            req.token = decoded;
            // I'm proceeding to the logout controller
            next();
        } catch (error) {
            // I'm handling any errors during the logout validation process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    }
}

module.exports = new UserMiddleware();