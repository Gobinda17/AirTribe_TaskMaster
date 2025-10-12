// I'm importing my Project model to interact with project data in MongoDB
const projectModel = require("../models/projectModels");

class ProjectController {
    // I'm creating a private method to check for duplicate project names globally
    // This ensures project names are unique across the entire system
    #checkDuplicateProjectName = async (name, res) => {
        try {
            // I'm searching for any existing project with the same name
            const projectExist = await projectModel.findOne({ name: name });

            // I'm returning a conflict error if a duplicate project name is found
            if (projectExist) {
                return res.status(409).json({
                    status: 'fail',
                    message: 'Project name already exists'
                });
            }
            // I'm returning nothing if no duplicate is found (validation passed)
            return;
        } catch (error) {
            // I'm handling any errors during the duplicate check process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling the creation of new projects with member invitation system
    createProject = async (req, res) => {
        try {
            // I'm extracting project details from the request body
            const { name, description, members } = req.body;

            // I'm checking for duplicate project names before creating the new project
            await this.#checkDuplicateProjectName(name, res);

            // I'm creating a new project instance with the authenticated user as owner
            const newProject = new projectModel({
                name: name,
                description: description,
                createdBy: req.userId, // I'm assigning the project creator as the authenticated user
                members: [{ user: req.userId, role: "owner", joined: true }] // I'm automatically adding creator as owner
            });

            // I'm adding any initially invited members with pending join status
            if (members?.length) {
                members.forEach(member => {
                    newProject.members.push({ user: member, joined: false });
                });
            }

            // I'm saving the new project to the database
            const saveProject = await newProject.save();

            // I'm returning success response with the created project data
            return res.status(201).json({
                status: 'success',
                message: 'Project created successfully',
                project: saveProject
            });
        } catch (error) {
            // I'm handling any errors during the project creation process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling sending project invitations to new members
    sendingInvites = async (req, res) => {
        try {
            // I'm getting the project ID from URL parameters
            const { id } = req.params;
            // I'm extracting the array of user IDs to invite from the request body
            const { members } = req.body;

            // I'm finding the project by ID
            const project = await projectModel.findById({ _id: id });

            // I'm checking if the project exists
            if (!project) {
                return res.status(404).json({ status: "fail", message: "Project not found" });
            }

            // I'm ensuring only the project creator can send invitations (authorization)
            if (project.createdBy.toString() !== req.userId) {
                return res.status(403).json({ status: "fail", message: "Not authorized" });
            }

            // I'm adding each member to the project if they're not already a member
            // This prevents duplicate memberships
            members.forEach(member => {
                if (!project.members.find(m => m.user.toString() === member)) {
                    project.members.push({ user: member, joined: false });
                }
            });

            // I'm saving the updated project with new pending members
            await project.save();

            // I'm returning success response with the updated project
            res.status(200).json({
                status: "success",
                message: "Members invited successfully",
                project,
            });
        } catch (error) {
            // I'm handling any errors during the invitation process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // I'm handling the acceptance or rejection of project invitations
    acceptingInvites = async (req, res) => {
        try {
            // I'm getting the project ID and acceptance decision from URL parameters
            const { id, accept } = req.params; // project ID and accept (true/false)

            // I'm finding the project by ID
            const project = await projectModel.findById({ _id: id });
            if (!project) {
                return res.status(404).json({ status: "fail", message: "Project not found" });
            }

            // I'm finding the member record for the authenticated user
            const member = project.members.find(m => m.user.toString() === req.userId);

            // I'm checking if the user has a pending invitation
            if (!member) {
                return res.status(403).json({ status: "fail", message: "No invite found for this user" });
            }

            // I'm checking if the invitation has already been accepted
            if (member.joined) {
                return res.status(400).json({ status: "fail", message: "Invite already accepted" });
            }

            // I'm handling the acceptance or rejection based on the accept parameter
            if (accept === 'true') {
                // I'm accepting the invitation by setting joined to true
                member.joined = true;
                await project.save();
                return res.status(200).json({ status: "success", message: "Invite accepted", project });
            } else {
                // I'm rejecting the invitation by removing the user from members array
                project.members = project.members.filter(m => m.user.toString() !== req.userId);
                await project.save();
                return res.status(200).json({ status: "success", message: "Invite declined", project });
            }
        } catch (error) {
            // I'm handling any errors during the invitation response process
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };
}

module.exports = new ProjectController();