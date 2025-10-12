// I'm importing Express to create my router for project-related endpoints
const express = require('express');

// I'm creating a router instance to define project routes
const router = express.Router();

// I'm importing validation rules for project operations
const { projectCreationValidation, sendInvitationsValidation } = require('../middlewares/validations');

// I'm importing my project middleware for authentication and validation
const ProjectMiddleware = require('../middlewares/projectMiddleware');

// I'm importing my project controller to handle business logic
const ProjectController = require('../controllers/projectController');

// I'm defining the project creation route for authenticated users
// This route handles POST requests to /project with validation and authentication
router.post('/project', [projectCreationValidation, ProjectMiddleware.validateProjectCreationOrSendingInvites.bind(ProjectMiddleware)], ProjectController.createProject.bind(ProjectController));

// I'm defining the route to send project invitations to new members
// This route handles POST requests to /project/:id/invite for inviting users to projects
router.post('/project/:id/invite', [sendInvitationsValidation, ProjectMiddleware.validateProjectCreationOrSendingInvites.bind(ProjectMiddleware)], ProjectController.sendingInvites.bind(ProjectController));

// I'm defining the route to accept or reject project invitations
// This route handles PATCH requests to /project/:id/:accept for responding to invitations
router.patch('/project/:id/:accept', ProjectMiddleware.validateAcceptingInvites.bind(ProjectMiddleware), ProjectController.acceptingInvites.bind(ProjectController));

// I'm exporting the router so it can be mounted in the main app
module.exports = router;