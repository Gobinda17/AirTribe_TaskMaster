const userModel = require('../models/userModels');

class UserMiddleware {
    #checkExistingEmail = async (req, res) => {
        // Logic to check if email already exists in the database
        const { email } = req.body;
        try {
            const userExist = await userModel.findOne({email : email});
            return userExist;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    }

    validateRegistration = async (req, res, next) => {
        try {
            const userExist = this.#checkExistingEmail(req, res);
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
    }
}

module.exports = new UserMiddleware();