const ClientTask = require('../../models/clientTask');
const Task = require('../../models/task');
const ClientProject = require('../../models/clientProject');
const ClientMilestone = require('../../models/clientMilestone');
const Project = require('../../models/project');
const Milestone = require('../../models/milestones');
const Users = require('../../models/user');
const xlsx = require('xlsx');

class ClientTaskController {

    // POST /api/v1/admin/client-task
    async createClientTask(req, res) {
        try {
            const data = req.body;
            data.createdBy = req.user._id;

            if (!data.project) return res.status(400).json({ status: 400, message: 'Project is required' });
            if (!data.summary) return res.status(400).json({ status: 400, message: 'Summary is required' });

            const task = await ClientTask.create(data);

            let populated = await ClientTask.findById(task._id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .lean();

            if (!populated.project && data.project) {
                const p = await Project.findById(data.project).select('name').lean() || await ClientProject.findById(data.project).select('name').lean();
                if (p) populated.project = p;
            }
            if (!populated.milestone && data.milestone) {
                const m = await Milestone.findById(data.milestone).select('title').lean() || await ClientMilestone.findById(data.milestone).select('title').lean();
                if (m) populated.milestone = m;
            }

            return res.status(201).json({
                status: 201,
                message: 'Client task created successfully',
                data: populated,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // PUT /api/v1/admin/client-task/:id
    async updateClientTask(req, res) {
        try {
            const task = await ClientTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
            let normalTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

            if (task) {
                await Task.updateMany(
                    { $or: [{ _id: req.params.id }, { project: task.project, summary: task.summary }] },
                    { $set: req.body }
                );
            }
            if (normalTask) {
                await ClientTask.updateMany(
                    { $or: [{ _id: req.params.id }, { project: normalTask.project, summary: normalTask.summary }] },
                    { $set: req.body }
                );
            }

            if (!task && !normalTask) return res.status(404).json({ status: 404, message: 'Client task not found' });
            return res.status(200).json({ status: 200, message: 'Client task updated successfully', data: task || normalTask });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-task
    async getAllClientTasks(req, res) {
        try {
            const { page = 1, limit = 50, search = '', projectId = '', milestoneId = '', assigneeId = '', priority = '', status = '' } = req.query;
            const query = { isActive: true };

            if (projectId.trim())   query.project   = projectId;
            if (milestoneId.trim()) query.milestone  = milestoneId;
            if (assigneeId.trim())  query.assignee   = assigneeId;
            if (priority.trim())    query.priority   = priority;
            if (status.trim())      query.status     = status;
            if (search.trim())      query.summary    = { $regex: search, $options: 'i' };

            let tasks = await ClientTask.find(query)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 })
                .lean();

            for (let t of tasks) {
                if (!t.project && t.project !== undefined) {
                    const raw = await ClientTask.findById(t._id).select('project').lean();
                    if (raw?.project) {
                        const p = await Project.findById(raw.project).select('name').lean() || await ClientProject.findById(raw.project).select('name').lean();
                        if (p) t.project = p;
                    }
                }
                if (!t.milestone && t.milestone !== undefined) {
                    const raw = await ClientTask.findById(t._id).select('milestone').lean();
                    if (raw?.milestone) {
                        const m = await Milestone.findById(raw.milestone).select('title').lean() || await ClientMilestone.findById(raw.milestone).select('title').lean();
                        if (m) t.milestone = m;
                    }
                }
            }

            const count = await ClientTask.countDocuments(query);

            return res.status(200).json({
                status: 200,
                message: 'Client tasks retrieved successfully',
                data: tasks,
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: Number(page),
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // GET /api/v1/admin/client-task/:id
    async getSingleClientTask(req, res) {
        try {
            let task = await ClientTask.findById(req.params.id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .lean();
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });

            if (!task.project) {
                const raw = await ClientTask.findById(task._id).select('project').lean();
                if (raw?.project) {
                    const p = await Project.findById(raw.project).select('name').lean() || await ClientProject.findById(raw.project).select('name').lean();
                    if (p) task.project = p;
                }
            }
            if (!task.milestone) {
                const raw = await ClientTask.findById(task._id).select('milestone').lean();
                if (raw?.milestone) {
                    const m = await Milestone.findById(raw.milestone).select('title').lean() || await ClientMilestone.findById(raw.milestone).select('title').lean();
                    if (m) task.milestone = m;
                }
            }

            return res.status(200).json({ status: 200, message: 'Client task retrieved successfully', data: task });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // DELETE /api/v1/admin/client-task/:id
    async deleteClientTask(req, res) {
        try {
            const task = await ClientTask.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });
            return res.status(200).json({ status: 200, message: 'Client task deleted successfully' });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // PUT /api/v1/admin/client-task/:id/report
    async saveTaskReport(req, res) {
        try {
            const { id } = req.params;
            const existingTask = await ClientTask.findById(id);
            if (!existingTask) return res.status(404).json({ status: 404, message: 'Client task not found' });

            const reportData = {
                ...(existingTask.report || {}),
                ...req.body,
            };

            if (!reportData.createdBy) {
                reportData.createdBy = req.user._id;
            }

            if (req.body.status === 'Approved') {
                reportData.status = 'Approved';
                reportData.approvedBy = req.user._id;
                reportData.approvedAt = new Date();
            } else if (!reportData.status) {
                reportData.status = 'Draft';
            }

            const updatedTask = await ClientTask.findByIdAndUpdate(
                id,
                { $set: { report: reportData } },
                { new: true }
            )
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .populate('report.approvedBy', 'name email')
                .populate('report.createdBy', 'name email');

            return res.status(200).json({
                status: 200,
                message: reportData.status === 'Approved' ? 'Report approved and published successfully' : 'Report saved as draft',
                data: updatedTask,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // PUT /api/v1/admin/client-task/:id/report/approve
    async approveTaskReport(req, res) {
        try {
            const { id } = req.params;
            const task = await ClientTask.findById(id);
            if (!task) return res.status(404).json({ status: 404, message: 'Client task not found' });

            if (!task.report || !task.report.summaryOfWork) {
                return res.status(400).json({ status: 400, message: 'Cannot approve task without report summary' });
            }

            task.report.status = 'Approved';
            task.report.approvedBy = req.user._id;
            task.report.approvedAt = new Date();
            await task.save();

            const populated = await ClientTask.findById(id)
                .populate('project', 'name')
                .populate('milestone', 'title')
                .populate('assignee', 'name email')
                .populate('reporter', 'name email')
                .populate('report.approvedBy', 'name email')
                .populate('report.createdBy', 'name email');

            return res.status(200).json({
                status: 200,
                message: 'Report approved and published to client',
                data: populated,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
        }
    }

    // POST /api/v1/admin/client-task/import-preview
    async previewImportClientTasks(req, res) {
        try {
            const projectId = req.body.project || req.body.projectId;
            const defaultMilestoneId = req.body.defaultMilestone || req.body.milestoneId || '';

            if (!projectId) {
                return res.status(400).json({ status: 400, message: 'Project is required to preview tasks' });
            }

            let rawRows = [];
            if (req.file && req.file.buffer) {
                const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    return res.status(400).json({ status: 400, message: 'Uploaded file does not contain any sheets' });
                }
                const sheet = workbook.Sheets[firstSheetName];
                rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
            } else if (req.body.tasks) {
                rawRows = typeof req.body.tasks === 'string' ? JSON.parse(req.body.tasks) : req.body.tasks;
            }

            if (!Array.isArray(rawRows) || rawRows.length === 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'No data rows found in the uploaded file. Please make sure the file contains column headers and at least one task row.'
                });
            }

            const { validTasks, previewRows, failedRows } = await processTaskRows(
                rawRows,
                projectId,
                defaultMilestoneId,
                req.user?._id
            );

            return res.status(200).json({
                status: 200,
                message: 'Preview generated successfully',
                data: {
                    totalRows: rawRows.length,
                    validCount: validTasks.length,
                    invalidCount: failedRows.length,
                    previewRows,
                    errors: failedRows,
                },
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error while previewing tasks', error: error.message });
        }
    }

    // POST /api/v1/admin/client-task/import
    async importClientTasks(req, res) {
        try {
            const projectId = req.body.project || req.body.projectId;
            const defaultMilestoneId = req.body.defaultMilestone || req.body.milestoneId || '';

            if (!projectId) {
                return res.status(400).json({ status: 400, message: 'Project is required for task import' });
            }

            let rawRows = [];
            if (req.file && req.file.buffer) {
                const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    return res.status(400).json({ status: 400, message: 'Uploaded file does not contain any sheets' });
                }
                const sheet = workbook.Sheets[firstSheetName];
                rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '' });
            } else if (req.body.tasks) {
                rawRows = typeof req.body.tasks === 'string' ? JSON.parse(req.body.tasks) : req.body.tasks;
            }

            if (!Array.isArray(rawRows) || rawRows.length === 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'No data rows found in the uploaded file. Please verify your file contents.'
                });
            }

            const { validTasks, previewRows, failedRows } = await processTaskRows(
                rawRows,
                projectId,
                defaultMilestoneId,
                req.user?._id
            );

            if (validTasks.length === 0) {
                return res.status(400).json({
                    status: 400,
                    message: 'No valid tasks found to import. Please check that each row has a valid Task Summary.',
                    errors: failedRows,
                });
            }

            const inserted = await ClientTask.insertMany(validTasks);

            return res.status(200).json({
                status: 200,
                message: `Successfully imported ${inserted.length} task${inserted.length === 1 ? '' : 's'}!`,
                data: {
                    totalRows: rawRows.length,
                    importedCount: inserted.length,
                    failedCount: failedRows.length,
                    errors: failedRows,
                    tasks: inserted,
                },
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error while importing tasks', error: error.message });
        }
    }

    // GET /api/v1/admin/client-task/sample-template
    async downloadSampleTemplate(req, res) {
        try {
            const sampleData = [
                {
                    'Task Summary': 'Design Database Schema for Client Portal',
                    'Description': 'Create MongoDB models for client projects, milestones, tasks, and role permissions.',
                    'Milestone': 'Phase 1 - Foundation & Architecture',
                    'Priority': 'High',
                    'Work Type': 'Task',
                    'Status': 'To Do',
                    'Estimated Hours': 8,
                    'Assignee Email': 'john.doe@rowthtech.com',
                    'Start Date': '2026-10-25',
                    'Due Date': '2026-10-28',
                    'Project Type': 'Tech'
                },
                {
                    'Task Summary': 'Fix Payment Webhook Idempotency Bug',
                    'Description': 'Ensure duplicate webhook events from Stripe do not credit accounts twice.',
                    'Milestone': 'Phase 1 - Foundation & Architecture',
                    'Priority': 'Critical',
                    'Work Type': 'Bug',
                    'Status': 'In Progress',
                    'Estimated Hours': 4,
                    'Assignee Email': 'sarah.smith@rowthtech.com',
                    'Start Date': '2026-10-26',
                    'Due Date': '2026-10-27',
                    'Project Type': 'Tech'
                },
                {
                    'Task Summary': 'Build Responsive Taskboard Kanban Board',
                    'Description': 'Implement drag & drop columns for To Do, In Progress, Testing, On Hold, and Done.',
                    'Milestone': 'Phase 2 - Frontend Development',
                    'Priority': 'Medium',
                    'Work Type': 'Task',
                    'Status': 'To Do',
                    'Estimated Hours': 12,
                    'Assignee Email': 'alex.dev@rowthtech.com',
                    'Start Date': '2026-10-29',
                    'Due Date': '2026-11-04',
                    'Project Type': 'Tech'
                },
                {
                    'Task Summary': 'Client Acceptance Testing & Performance Optimization',
                    'Description': 'Run automated Lighthouse audits and load tests up to 1000 concurrent users.',
                    'Milestone': 'Phase 3 - Testing & Release',
                    'Priority': 'Low',
                    'Work Type': 'Task',
                    'Status': 'To Do',
                    'Estimated Hours': 6,
                    'Assignee Email': '',
                    'Start Date': '2026-11-05',
                    'Due Date': '2026-11-08',
                    'Project Type': 'Tech'
                }
            ];

            const worksheet = xlsx.utils.json_to_sheet(sampleData);
            const csvContent = xlsx.utils.sheet_to_csv(worksheet);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="client_tasks_import_template.csv"');
            return res.status(200).send(csvContent);
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Internal server error while generating sample template', error: error.message });
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// Helpers for parsing & normalization
// ══════════════════════════════════════════════════════════════════════════════

function parseDateValue(val) {
    if (!val) return null;
    if (val instanceof Date) {
        return isNaN(val.getTime()) ? null : val;
    }
    if (typeof val === 'number') {
        const d = new Date(Math.round((val - 25569) * 86400 * 1000));
        return isNaN(d.getTime()) ? null : d;
    }
    const str = String(val).trim();
    if (!str) return null;

    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1;
        const year = parseInt(dmyMatch[3], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
    }

    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

function normalizeRowKeys(rawRow) {
    const row = {};
    for (const key of Object.keys(rawRow || {})) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        row[cleanKey] = rawRow[key];
    }
    return row;
}

function getRowField(row, aliases) {
    for (const alias of aliases) {
        const clean = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (row[clean] !== undefined && row[clean] !== null && String(row[clean]).trim() !== '') {
            return String(row[clean]).trim();
        }
    }
    return '';
}

async function processTaskRows(rawRows, projectId, defaultMilestoneId, userId) {
    const [cMilestones, pMilestones] = await Promise.all([
        ClientMilestone.find({ project: projectId, isActive: true }).select('_id title').lean(),
        Milestone.find({ project: projectId }).select('_id title').lean(),
    ]);

    const allMilestones = [...(cMilestones || []), ...(pMilestones || [])];
    const milestoneMap = new Map();
    for (const m of allMilestones) {
        if (m._id) {
            milestoneMap.set(String(m._id), m);
        }
        if (m.title) {
            milestoneMap.set(m.title.toLowerCase().trim(), m);
        }
    }

    let defaultMObj = null;
    if (defaultMilestoneId && milestoneMap.has(String(defaultMilestoneId))) {
        defaultMObj = milestoneMap.get(String(defaultMilestoneId));
    } else if (allMilestones.length > 0) {
        defaultMObj = allMilestones[0];
    }

    const allUsers = await Users.find({}).select('_id name email').lean();
    const userEmailMap = new Map();
    const userNameMap = new Map();
    for (const u of allUsers) {
        if (u.email) userEmailMap.set(u.email.toLowerCase().trim(), u);
        if (u.name) userNameMap.set(u.name.toLowerCase().trim(), u);
    }

    const validTasks = [];
    const previewRows = [];
    const failedRows = [];

    for (let i = 0; i < rawRows.length; i++) {
        const row = normalizeRowKeys(rawRows[i]);
        const rowNum = i + 1;

        const summary = getRowField(row, ['summary', 'tasksummary', 'task', 'title', 'tasktitle', 'name', 'taskname']);
        const description = getRowField(row, ['description', 'desc', 'details', 'note', 'taskdescription']);
        const priorityRaw = getRowField(row, ['priority', 'taskpriority', 'severity', 'prio']).toLowerCase();
        const workTypeRaw = getRowField(row, ['worktype', 'type', 'kind', 'tasktype']).toLowerCase();
        const statusRaw = getRowField(row, ['status', 'state', 'taskstatus']).toLowerCase();
        const estRaw = getRowField(row, ['estimatedtime', 'estimatedhours', 'estimate', 'estimated', 'hours', 'time', 'esthours']);
        const milestoneRaw = getRowField(row, ['milestone', 'milestonename', 'milestonetitle', 'milestoneid', 'phase', 'sprintmilestone']);
        const assigneeRaw = getRowField(row, ['assignee', 'assigneeemail', 'assignedto', 'developer', 'member', 'owner', 'email']);
        const startRaw = getRowField(row, ['startdate', 'start', 'begindate']);
        const dueRaw = getRowField(row, ['duedate', 'due', 'deadline', 'enddate', 'targetdate']);
        const projectTypeRaw = getRowField(row, ['projecttype', 'dept', 'department']).toLowerCase();

        if (!summary) {
            failedRows.push({ rowNumber: rowNum, error: 'Task Summary is missing or empty' });
            previewRows.push({
                rowNumber: rowNum,
                summary: '(Missing Summary)',
                description: description || '',
                priority: 'Medium',
                workType: 'Task',
                status: 'To Do',
                estimatedTime: 0,
                milestoneTitle: defaultMObj?.title || 'None',
                assigneeName: 'Unassigned',
                startDate: '',
                dueDate: '',
                isValid: false,
                validationError: 'Task Summary is required',
            });
            continue;
        }

        let priority = 'Medium';
        if (priorityRaw.includes('crit')) priority = 'Critical';
        else if (priorityRaw.includes('high')) priority = 'High';
        else if (priorityRaw.includes('low')) priority = 'Low';
        else if (priorityRaw.includes('med')) priority = 'Medium';

        let workType = 'Task';
        if (workTypeRaw.includes('bug')) workType = 'Bug';
        else if (workTypeRaw.includes('sprint')) workType = 'Sprint';

        let status = 'To Do';
        if (statusRaw.includes('done') || statusRaw.includes('complete') || statusRaw.includes('finish') || statusRaw.includes('closed')) {
            status = 'Done';
        } else if (statusRaw.includes('prog') || statusRaw.includes('doing') || statusRaw.includes('working')) {
            status = 'In Progress';
        } else if (statusRaw.includes('test') || statusRaw.includes('qa') || statusRaw.includes('review')) {
            status = 'Testing';
        } else if (statusRaw.includes('hold') || statusRaw.includes('block') || statusRaw.includes('pause')) {
            status = 'On Hold';
        }

        const estimatedTime = estRaw ? (parseFloat(estRaw) || 0) : 0;

        let milestoneObj = defaultMObj;
        if (milestoneRaw) {
            const mClean = milestoneRaw.toLowerCase().trim();
            if (milestoneMap.has(mClean)) {
                milestoneObj = milestoneMap.get(mClean);
            } else if (milestoneMap.has(milestoneRaw)) {
                milestoneObj = milestoneMap.get(milestoneRaw);
            }
        }

        let matchedUser = null;
        if (assigneeRaw) {
            const aClean = assigneeRaw.toLowerCase().trim();
            if (userEmailMap.has(aClean)) {
                matchedUser = userEmailMap.get(aClean);
            } else if (userNameMap.has(aClean)) {
                matchedUser = userNameMap.get(aClean);
            }
        }

        const startDate = parseDateValue(startRaw);
        const dueDate = parseDateValue(dueRaw);

        let projectType = 'Tech';
        if (projectTypeRaw.includes('market')) projectType = 'Marketing';
        else if (projectTypeRaw.includes('sale')) projectType = 'Sales';
        else if (projectTypeRaw.includes('free')) projectType = 'Freelance';

        const taskData = {
            project: projectId,
            milestone: milestoneObj?._id || undefined,
            summary,
            description: description || '',
            priority,
            workType,
            status,
            estimatedTime,
            assignee: matchedUser?._id || undefined,
            reporter: userId || undefined,
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
            projectType,
            isActive: true,
            createdBy: userId,
        };

        validTasks.push(taskData);

        previewRows.push({
            rowNumber: rowNum,
            summary,
            description: description ? (description.length > 80 ? description.substring(0, 80) + '...' : description) : '',
            priority,
            workType,
            status,
            estimatedTime,
            milestoneTitle: milestoneObj?.title || 'None',
            milestoneId: milestoneObj?._id || '',
            assigneeName: matchedUser ? `${matchedUser.name} (${matchedUser.email})` : (assigneeRaw || 'Unassigned'),
            assigneeId: matchedUser?._id || '',
            startDate: startDate ? startDate.toISOString().split('T')[0] : '',
            dueDate: dueDate ? dueDate.toISOString().split('T')[0] : '',
            isValid: true,
            validationError: '',
        });
    }

    return { validTasks, previewRows, failedRows };
}

module.exports = new ClientTaskController();


