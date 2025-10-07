const express = require('express');
const router = express.Router();

const UserMiddleware = require('../middlewares/userMiddleware');
const UserController = require('../controllers/userController');

router.post('/register/:role', UserMiddleware.validateRegistration.bind(UserMiddleware), UserController.userRegistration.bind(UserController));

module.exports = router;