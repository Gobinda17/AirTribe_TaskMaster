// I'm importing Express to create my router for user-related endpoints
const express = require('express');
// I'm creating a router instance to define user routes
const router = express.Router();

// I'm importing my user middleware for authentication and validation
const UserMiddleware = require('../middlewares/userMiddleware');
// I'm importing my user controller to handle business logic
const UserController = require('../controllers/userController');

// I'm importing validation rules for different user operations
const { registrationValidation, loginValidation, updateUserProfileValidation } = require('../middlewares/validations');

// I'm defining the user registration route with role-based registration
// This route handles POST requests to /register/:role (where role is 'user' or 'admin')
router.post('/register/:role', [registrationValidation, UserMiddleware.validateRegistration.bind(UserMiddleware)], UserController.userRegistration.bind(UserController));

// I'm defining the user login route with role-based authentication
// This route handles POST requests to /login/:role for user authentication
router.post('/login/:role', [loginValidation, UserMiddleware.validateLogin.bind(UserMiddleware)], UserController.userLogin.bind(UserController));

// I'm defining the user profile update route for authenticated users
// This route handles PATCH requests to /profile/user/:id for updating user information
router.patch('/profile/user/:id', [updateUserProfileValidation, UserMiddleware.validateProfileUpdate.bind(UserMiddleware)], UserController.updateUserProfile.bind(UserController));

// I'm defining the user logout route to invalidate JWT tokens
// This route handles POST requests to /logout for secure token invalidation
router.post('/logout', UserMiddleware.validateLogout.bind(UserMiddleware), UserController.userLogout.bind(UserController));

// I'm exporting the router so it can be mounted in the main app
module.exports = router;