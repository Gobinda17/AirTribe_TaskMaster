const express = require('express');
const app = express();

const userRouter = require('./routes/userRoutes');
const taskRouter = require('./routes/taskRoutes');
const projectRouter = require('./routes/projectRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/airtribe/taskmaster/app/api/v1', [userRouter, taskRouter, projectRouter]);
module.exports = app;