const express = require('express');
const app = express();
const router = require('./routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/airtribe/taskmaster/app/api/v1', router);

module.exports = app;