const projectModel = require("../models/projectModels");

class ProjectController {
    // Check for duplicate project names
    #checkDuplicateProjectName = async (name, res) => {
        try {
            const projectExist = await projectModel.findOne({ name: name });

            if (projectExist) {
                return res.status(409).json({
                    status: 'fail',
                    message: 'Project name already exists'
                });
            }
            return;
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Create a new project
    createProject = async (req, res) => {
        try {
            const { name, description, members } = req.body;

            // Check for duplicate project names
            await this.#checkDuplicateProjectName(name, res);

            const newProject = new projectModel({
                name: name,
                description: description,
                createdBy: req.userId, // Assigning the project to the authenticated user
                members: [{ user: req.userId, role: "owner", joined: true }]
            });

            // Initial invited members
            if (members?.length) {
                members.forEach(member => {
                    newProject.members.push({ user: member, joined: false });
                });
            }

            const saveProject = await newProject.save();

            return res.status(201).json({
                status: 'success',
                message: 'Project created successfully',
                project: saveProject
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Sending project invites to users
    sendingInvites = async (req, res) => {
        try {
            const { id } = req.params;
            const { members } = req.body; // array of userIds

            const project = await projectModel.findById({ _id: id });

            if (!project) {
                return res.status(404).json({ status: "fail", message: "Project not found" });
            }

            // Only creator can invite
            if (project.createdBy.toString() !== req.userId) {
                return res.status(403).json({ status: "fail", message: "Not authorized" });
            }

            members.forEach(member => {
                if (!project.members.find(m => m.user.toString() === member)) {
                    project.members.push({ user: member, joined: false });
                }
            });

            await project.save();

            res.status(200).json({
                status: "success",
                message: "Members invited successfully",
                project,
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };

    // Accepting project invites
    acceptingInvites = async (req, res) => {
        try {
            const { id, accept } = req.params; // project ID and accept (true/false)

            const project = await projectModel.findById({ _id: id });
            if (!project) {
                return res.status(404).json({ status: "fail", message: "Project not found" });
            }

            const member = project.members.find(m => m.user.toString() === req.userId);

            if (!member) {
                return res.status(403).json({ status: "fail", message: "No invite found for this user" });
            }

            if (member.joined) {
                return res.status(400).json({ status: "fail", message: "Invite already accepted" });
            }

            if (accept === 'true') {
                member.joined = true;
                await project.save();
                return res.status(200).json({ status: "success", message: "Invite accepted", project });
            } else {
                project.members = project.members.filter(m => m.user.toString() !== req.userId);
                await project.save();
                return res.status(200).json({ status: "success", message: "Invite declined", project });
            }
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: `Message: ${error}`
            });
        }
    };
}

module.exports = new ProjectController();