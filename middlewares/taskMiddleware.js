const { validationResult } = require("express-validator");

const taskModel = require("../models");
const userModel = require("../models/userModels");

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
const saltrounds = 10;

class TaskMiddleware {

}

module.exports = new TaskMiddleware();