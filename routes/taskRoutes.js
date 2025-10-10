const express = require('express');
const router = express.Router();

// Validation rules for task
const { taskCreationValidation } = require('../middlewares/validations');

router.post('/task', [taskCreationValidation], (req, res) => {
    res.send('Task created');
});

module.exports = router;