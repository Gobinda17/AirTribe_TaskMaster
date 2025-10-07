const userModel = require('../models/userModels');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
const saltrounds = 10;

class UserController {
    // User Registration
    userRegistration = async (req, res) => {
        try {
            // Registration logic here
            const { name, email, password } = req.body;
            const role = req.params.role;

            const hashPassword = await bcrypt.hash(password, saltrounds);

            const newUser = new userModel({
                name, email, password: hashPassword, role
            });

            await newUser.save();

            return res.status(201).send(`User registered with role: ${role}`);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    }

    // User Login
    userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            const role = req.params.role;

            const user = await userModel.findOne({ email: email, role: role });

            const passwordMatch = await bcrypt.compare(password, user.password);

            if(!passwordMatch) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Invalid credentials'
                });
            }

            const jsonToken = await jwt.sign({userId: user._id, userEmail: user.email, userRole: user.role}, JWT_SECRET, {expiresIn: JWT_EXPIRATION});
        
            return res.status(200).json({
                status: 'success',
                message: 'Login successful',
                user: `User Name: ${user.name}, User Email: ${user.email}`,
                token: jsonToken
            });

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    }
}

module.exports = new UserController();