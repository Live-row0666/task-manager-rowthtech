
// Client Controller
const Client = require('../../models/client');
const User = require('../../models/user');
const Role = require('../../models/role');
const Project = require('../../models/project');
const EncryptionService = require('../../utils/encryption');
const nodemailer = require("nodemailer");
class ClientController {
    // Add new client
    async createClient(req, res) {
        try {
            let data = req.body;
            data.createdBy = req.user ? req.user._id : null;
            if (!data.name || !data.name.trim()) {
                return res.status(400).json({ status: 400, error: 'Client Name is required' });
            }

            const existingClient = await Client.findOne({ name: data.name.trim() });
            if (existingClient) {
                return res.status(400).json({ status: 400, error: 'Client with this name already exists' });
            }

            const rawEmail = data.loginEmail || (Array.isArray(data.email) ? data.email[0] : data.email);
            if (!rawEmail || !rawEmail.trim()) {
                return res.status(400).json({ status: 400, error: 'Email is required' });
            }
            const loginEmail = rawEmail.trim().toLowerCase();

            const existingEmail = await Client.findOne({ loginEmail });
            if (existingEmail) {
                return res.status(400).json({ status: 400, error: 'Client with this email already exists' });
            }

            const plainPassword = data.loginPassword || data.password;
            if (!plainPassword || !plainPassword.trim()) {
                return res.status(400).json({ status: 400, error: 'Password is required' });
            }

            let checkRole = await Role.findOne({ name: "Client" });
            if (!checkRole) {
                checkRole = await Role.findOne({ name: { $regex: /^client$/i } });
            }
            if (!checkRole) {
                checkRole = await Role.create({ name: 'Client', description: 'Client', permissions: [] });
            }
            const encryptedPassword = EncryptionService.encrypt(plainPassword);
            const emailArray = Array.isArray(data.email) && data.email.length > 0 && data.email[0]
                ? data.email
                : [loginEmail];
            const clientProjects = Array.isArray(data.projects) ? data.projects : [];
            const client = new Client({
                ...data,
                name: data.name.trim(),
                loginEmail,
                email: emailArray,
                password: encryptedPassword,
                role: checkRole._id,
                projects: clientProjects,
                createdBy: req.user ? req.user._id : null
            });
            await client.save();
            if (clientProjects.length > 0) {
                await Project.updateMany(
                    { _id: { $in: clientProjects } },
                    { $addToSet: { client: client._id } }
                );
            }
            const populatedClient = await Client.findById(client._id).populate('projects', 'name');
            res.status(201).json({ status: 201, message: 'Client created successfully', client: populatedClient || client });
        } catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern || {})[0] || 'Field';
                return res.status(400).json({ status: 400, error: `${field} already exists` });
            }
            res.status(500).json({ status: 500, error: error.message });
        }
    }
    // Update client
    async updateClient(req, res) {
        try {
            const data = req.body;
            const existingClient = await Client.findById(req.params.id);
            if (!existingClient) {
                return res.status(404).json({
                    status: 404,
                    error: "Client not found"
                });
            }
            // Quick toggle for status only
            if (Object.keys(data).length === 1 && data.status !== undefined) {
                existingClient.status = data.status;
                await existingClient.save();
                return res.json({
                    status: 200,
                    message: "Client status updated successfully",
                    data: existingClient
                });
            }
            if (data.name && data.name.trim()) {
                const dup = await Client.findOne({ _id: { $ne: existingClient._id }, name: data.name.trim() });
                if (dup) {
                    return res.status(400).json({ status: 400, error: 'Client with this name already exists' });
                }
                existingClient.name = data.name.trim();
            }

            if (data.companyName !== undefined) existingClient.companyName = data.companyName;
            if (data.email) existingClient.email = Array.isArray(data.email) ? data.email : [data.email];
            if (data.contact) existingClient.contact = Array.isArray(data.contact) ? data.contact : [data.contact];
            if (data.notes !== undefined) existingClient.notes = data.notes;
            if (data.status) existingClient.status = data.status;

            if (data.loginEmail && data.loginEmail.trim()) {
                const loginEmail = data.loginEmail.trim().toLowerCase();
                const dupEmail = await Client.findOne({ _id: { $ne: existingClient._id }, loginEmail });
                if (dupEmail) {
                    return res.status(400).json({ status: 400, error: 'Client with this email already exists' });
                }
                existingClient.loginEmail = loginEmail;
            }

            if (data.loginPassword || data.password) {
                const plainPassword = data.loginPassword || data.password;
                if (plainPassword && plainPassword.trim()) {
                    existingClient.password = EncryptionService.encrypt(plainPassword.trim());
                }
            }

            if (data.projects !== undefined) {
                const prevProjects = (existingClient.projects || []).map(p => p.toString());
                const newProjects = Array.isArray(data.projects) ? data.projects.map(p => p.toString()) : [];

                const removed = prevProjects.filter(p => !newProjects.includes(p));
                if (removed.length > 0) {
                    await Project.updateMany({ _id: { $in: removed } }, { $pull: { client: existingClient._id } });
                }
                if (newProjects.length > 0) {
                    await Project.updateMany({ _id: { $in: newProjects } }, { $addToSet: { client: existingClient._id } });
                }
                existingClient.projects = newProjects;
            }

            await existingClient.save();

            const updatedClient = await Client.findById(existingClient._id).populate('projects', 'name');

            return res.json({
                status: 200,
                message: "Client updated successfully",
                data: updatedClient || existingClient
            });
        } catch (error) {
            return res.status(500).json({
                status: 500,
                error: error.message
            });
        }
    }

    // Get all clients with filters and pagination
    async getClients(req, res) {
        try {
            const filters = {};
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 100;
            const projectType = req.query.projectType || null;
            if (projectType) {
                filters.projectType = projectType;
            }
            const skip = (page - 1) * limit;

            // Status filter
            if (req.query.status) {
                filters.status = req.query.status;
            }

            // Search by name, email or contact
            if (req.query.search) {
                filters.$or = [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } },
                    { contact: { $regex: req.query.search, $options: 'i' } }
                ];
            }

            const total = await Client.countDocuments(filters);
            const clients = (await Client.find(filters)
                .populate('projects', 'name')
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
            ).map(client => ({
                ...client,
                password: client.password
                    ? EncryptionService.decrypt(client.password)
                    : ""
            }));
            res.json({
                status: 200,
                clients,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalClients: total
            });
        } catch (error) {
            res.status(500).json({ status: 500, error: error.message });
        }
    }

    // Delete client
    async deleteClient(req, res) {
        try {
            const client = await Client.findByIdAndDelete(req.params.id);
            if (!client) {
                return res.status(404).json({ status: 404, error: 'Client not found' });
            }
            res.status(200).json({ status: 200, message: 'Client deleted successfully' });
        } catch (error) {
            res.status(500).json({ status: 500, error: error.message });
        }
    }


    async sendInvitation(req, res) {
        try {
            const { name, loginEmail, loginPassword } = req.body;

            if (!loginEmail || !loginPassword) {
                return res.status(400).json({
                    status: 400,
                    message: "Login email and password are required.",
                });
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const loginUrl = `${process.env.CLIENT_URL}/account/login`;

            await transporter.sendMail({
                from: `"Task Manager" <${process.env.EMAIL_USER}>`,
                to: loginEmail,
                subject: "Your Login Credentials",
                html: `
                <div style="font-family:Arial,sans-serif;padding:20px">
                    <h2>Welcome ${name || "User"}</h2>

                    <p>Your account credentials are below.</p>

                    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse">
                        <tr>
                            <td><b>Login URL</b></td>
                            <td>
                                <a href="${loginUrl}">
                                    ${loginUrl}
                                </a>
                            </td>
                        </tr>

                        <tr>
                            <td><b>Email</b></td>
                            <td>${loginEmail}</td>
                        </tr>

                        <tr>
                            <td><b>Password</b></td>
                            <td>${loginPassword}</td>
                        </tr>
                    </table>

                    <br/>

                    <p>Please login using the above credentials.</p>

                    <p>Regards,<br/>Task Manager Team</p>
                </div>
            `,
            });

            return res.status(200).json({
                status: 200,
                message: "Invitation sent successfully.",
            });

        } catch (error) {
            return res.status(500).json({
                status: 500,
                error: error.message,
            });
        }
    }
}

module.exports = new ClientController();
