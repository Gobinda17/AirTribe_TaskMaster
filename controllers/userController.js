const userModel = require('../models/userModels');

class UserController {
    userRegistration = async (req, res) => {
        try {
            console.log(`Registering user with role: ${req.params.role}`);
            return res.status(201).send(`User registered with role: ${req.params.role}`);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    }
}

module.exports = new UserController();