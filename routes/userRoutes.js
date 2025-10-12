const express = require('express');
const router = express.Router();

// Importing the necessary middleware and controller
const UserMiddleware = require('../middlewares/userMiddleware');
const UserController = require('../controllers/userController');

// Importing the necessary middleware and controller
const { registrationValidation, loginValidation, updateUserProfileValidation } = require('../middlewares/validations');

// Registration route
router.post('/register/:role', [registrationValidation, UserMiddleware.validateRegistration.bind(UserMiddleware)], UserController.userRegistration.bind(UserController));

// Login route
router.post('/login/:role', [loginValidation, UserMiddleware.validateLogin.bind(UserMiddleware)], UserController.userLogin.bind(UserController));

// Update User Profile
router.patch('/profile/user/:id', [updateUserProfileValidation, UserMiddleware.validateProfileUpdate.bind(UserMiddleware)], UserController.updateUserProfile.bind(UserController));

// Logout User
router.post('/logout', UserMiddleware.validateLogout.bind(UserMiddleware), UserController.userLogout.bind(UserController));

module.exports = router;