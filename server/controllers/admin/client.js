
// Client Controller
const Client = require('../../models/client');
const User = require('../../models/user');
const Role = require('../../models/role');
const EncryptionService = require('../../utils/encryption');
const nodemailer = require("nodemailer");
class ClientController {
    // Add new client
    async createClient(req, res) {
        try {
            let data = req.body;
            data.createdBy = req.user._id;
            if (!data.name) {
                return res.status(400).json({ error: 'Name Is required' });
            }
            console.log(data, "xcvncxvxcvxcvcx")

            const existingClient = await Client.findOne({ name: data.name });
            if (existingClient) {
                return res.status(400).json({ error: 'Client with this name already exists' });
            }

            const client = new Client(data);

            console.log(client, "CXvxcnbvncxbnvxcnb")
            const checkRole = await Role.findOne({ name: "Client" });

            const plainPassword = data.loginPassword;

            const encryptedPassword = EncryptionService.encrypt(plainPassword);

            if (!checkRole) {
                return res.status(400).json({ message: "Role not found" });
            }
            client.loginEmail = data.loginEmail,
                client.password = encryptedPassword,
                client.role = checkRole._id

            await client.save();
            res.status(201).json({ status: 201, message: 'Client created successfully', client });
        } catch (error) {
            res.status(500).json({ status: 500, error: error.message });
        }
    }

    // Update client
    // async updateClient(req, res) {
    //     try {
    //         const client = await Client.findByIdAndUpdate(
    //             req.params.id,
    //             req.body,
    //             { new: true, runValidators: true }
    //         );
    //         if (!client) {
    //             return res.status(404).json({ status: 404, error: 'Client not found' });
    //         }
    //         res.json(client);
    //     } catch (error) {
    //         res.status(500).json({ status: 500, error: error.message });
    //     }
    // }

    async updateClient(req, res) {
    try {
        const { status } = req.body;

        const client = await Client.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!client) {
            return res.status(404).json({
                status: 404,
                error: "Client not found"
            });
        }

        return res.json({
            status: 200,
            message: "Client status updated successfully",
            data: client
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
