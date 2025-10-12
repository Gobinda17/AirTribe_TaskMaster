const express = require('express');

const router = express.Router();

// Validation rules for project creation
const { projectCreationValidation, sendInvitationsValidation } = require('../middlewares/validations');

// Project Middleware
const ProjectMiddleware = require('../middlewares/projectMiddleware');

// Project Controller
const ProjectController = require('../controllers/projectController');

// Route to create a new project
router.post('/project', [projectCreationValidation, ProjectMiddleware.validateProjectCreationOrSendingInvites.bind(ProjectMiddleware)], ProjectController.createProject.bind(ProjectController));

// Routes to send project invitations
router.post('/project/:id/invite', [sendInvitationsValidation, ProjectMiddleware.validateProjectCreationOrSendingInvites.bind(ProjectMiddleware)], ProjectController.sendingInvites.bind(ProjectController));

// Routes accept the invitation
router.patch('/project/:id/:accept', ProjectMiddleware.validateAcceptingInvites.bind(ProjectMiddleware), ProjectController.acceptingInvites.bind(ProjectController));

module.exports = router;