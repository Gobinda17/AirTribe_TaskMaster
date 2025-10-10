const express = require('express');
const app = express();

const userRouter = require('./routes/userRoutes');
const taskRouter = require('./routes/taskRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/airtribe/taskmaster/app/api/v1', userRouter);
app.use('/airtribe/taskmaster/app/api/v1', taskRouter);

module.exports = app;