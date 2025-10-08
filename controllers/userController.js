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
    };

    // User Login
    userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            const role = req.params.role;

            const user = await userModel.findOne({ email: email, role: role });

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({
                    status: 'fail',
                    message: 'Invalid credentials'
                });
            }

            const jsonToken = await jwt.sign({ userId: user._id, userEmail: user.email, userRole: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });

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
    };

    // Update User Profile
    updateUserProfile = async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const userId = req.params.id;

            if (!authHeader) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No token provided'
                });
            }

            const token = authHeader.split(' ')[1];

            const decoded = await jwt.verify(token, JWT_SECRET);

            if (decoded.userId !== userId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Forbidden: You are not allowed to update this profile'
                });
            }

            const { name, email } = req.body;

            const updatedData = {};
            if (name) updatedData.name = name;
            if (email) updatedData.email = email;

            await userModel.findByIdAndUpdate(userId, updatedData, { new: true });

            return res.status(200).json({
                status: 'success',
                message: 'User profile updated successfully'
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };
}

module.exports = new UserController();