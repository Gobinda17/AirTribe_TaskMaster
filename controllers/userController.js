// I'm importing my User model to interact with user data in MongoDB
const userModel = require('../models/userModels');

// I'm importing my BlacklistedToken model to manage logged-out tokens
const BlacklistedToken = require('../models/blackListTokenModels');

// I'm importing bcrypt for secure password hashing and comparison
const bcrypt = require('bcrypt');
// I'm importing jsonwebtoken for creating and verifying JWT tokens
const jwt = require('jsonwebtoken');

// I'm getting my JWT configuration from environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
// I'm setting the number of salt rounds for bcrypt hashing
const saltrounds = 10;

class UserController {
    // I'm handling user registration with role-based authentication
    userRegistration = async (req, res) => {
        try {
            // I'm extracting user details from the request body
            const { name, email, password } = req.body;
            // I'm getting the role from URL parameters to create role-specific users
            const role = req.params.role;

            // I'm hashing the password using bcrypt for security before storing
            const hashPassword = await bcrypt.hash(password, saltrounds);

            // I'm creating a new user instance with the provided data and hashed password
            const newUser = new userModel({
                name, email, password: hashPassword, role
            });

            // I'm saving the new user to the database
            await newUser.save();

            // I'm sending a success response confirming registration
            return res.status(201).send(`User registered with role: ${role}`);
        } catch (error) {
            // I'm handling any errors during registration process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling user login with email, password and role verification
    userLogin = async (req, res) => {
        try {
            // I'm extracting login credentials from the request body
            const { email, password } = req.body;
            // I'm getting the role from URL parameters for role-specific login
            const role = req.params.role;

            // I'm finding the user with matching email and role in the database
            const user = await userModel.findOne({ email: email, role: role });

            // I'm comparing the provided password with the stored hashed password
            const passwordMatch = await bcrypt.compare(password, user.password);

            // I'm checking if the password matches, if not, I return an error
            if (!passwordMatch) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Invalid credentials'
                });
            }

            // I'm creating a JWT token with user information for authentication
            const jsonToken = await jwt.sign({ userId: user._id, userEmail: user.email, userRole: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

            // I'm sending a successful login response with user details and token
            return res.status(200).json({
                status: 'success',
                message: 'Login successful',
                user: `User Name: ${user.name}, User Email: ${user.email}`,
                token: jsonToken
            });

        } catch (error) {
            // I'm handling any errors during the login process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling user profile updates with proper authorization checks
    updateUserProfile = async (req, res) => {
        try {
            // I'm extracting the authorization header to verify the user's identity
            const authHeader = req.headers.authorization;
            // I'm getting the user ID from the URL parameters
            const userId = req.params.id;

            // I'm checking if authorization header is provided
            if (!authHeader) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No token provided'
                });
            }

            // I'm extracting the JWT token from the Bearer authorization header
            const token = authHeader.split(' ')[1];

            // I'm verifying and decoding the JWT token to get user information
            const decoded = await jwt.verify(token, JWT_SECRET);

            // I'm ensuring users can only update their own profile (authorization)
            if (decoded.userId !== userId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Forbidden: You are not allowed to update this profile'
                });
            }

            // I'm extracting the fields to be updated from the request body
            const { name, email } = req.body;

            // I'm building an object with only the fields that need to be updated
            const updatedData = {};
            if (name) updatedData.name = name;
            if (email) updatedData.email = email;

            // I'm updating the user profile in the database with the new data
            await userModel.findByIdAndUpdate(userId, updatedData, { new: true });

            // I'm sending a success response confirming the profile update
            return res.status(200).json({
                status: 'success',
                message: 'User profile updated successfully'
            });
        } catch (error) {
            // I'm handling any errors during the profile update process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling user logout by blacklisting their JWT token
    userLogout = async (req, res) => {
        try {
            // I'm getting the decoded token information from middleware
            const token = req.token;
            // I'm converting the token expiry timestamp to a Date object
            const expiry = new Date(token.exp * 1000);

            // I'm extracting the actual token string from the authorization header
            const authHeader = req.headers.authorization;
            const tokenToBeBlacklisted = authHeader.split(' ')[1];

            // I'm adding the token to my blacklist database to prevent reuse
            // This ensures the token becomes invalid immediately even before its natural expiry
            const blacklistedToken = new BlacklistedToken({ token: tokenToBeBlacklisted, expiresAt: expiry });
            await blacklistedToken.save();

            // I'm sending a success response confirming the logout
            return res.status(200).json({
                status: 'success',
                message: 'Logged out successfully. Token invalidated.'
            });
        } catch (error) {
            // I'm handling any errors during the logout process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };
}

module.exports = new UserController();