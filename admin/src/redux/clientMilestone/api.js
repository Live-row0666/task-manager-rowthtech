import { APICore } from '../../helpers/api/apiCore';

const api = new APICore();
const MILESTONE_BASE = '/api/v1/admin/client-milestone';
const TASK_BASE = '/api/v1/admin/client-task';

export function addClientMilestoneApi(data) {
    return api.create(MILESTONE_BASE, data.payload);
}

export function getClientMilestonesApi(data) {
    const { projectId = '', page = 1, limit = 100, search = '', isActive } = data?.payload || {};
    let q = `projectId=${projectId}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (isActive !== undefined) q += `&isActive=${isActive}`;
    return api.get(`${MILESTONE_BASE}?${q}`);
}

export function addClientTaskApi(data) {
    return api.create(TASK_BASE, data.payload);
}

export function getClientTasksApi(data) {
    const { page = 1, limit = 200, search = '', projectId = '', milestoneId = '', status = '' } = data?.payload || {};
    let q = `page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (projectId)   q += `&projectId=${projectId}`;
    if (milestoneId) q += `&milestoneId=${milestoneId}`;
    if (status)      q += `&status=${encodeURIComponent(status)}`;
    return api.get(`${TASK_BASE}?${q}`);
}

export function updateClientTaskApi(data) {
    const { taskId, body } = data.payload;
    return api.update(`${TASK_BASE}/${taskId}`, body);
}

export function updateClientMilestoneApi(data) {
    const { milestoneId, body } = data.payload;
    return api.update(`${MILESTONE_BASE}/${milestoneId}`, body);
}

export function importClientTasksApi(formData) {
    return api.createWithFileDocument(`${TASK_BASE}/import`, formData);
}

export function previewImportClientTasksApi(formData) {
    return api.createWithFileDocument(`${TASK_BASE}/import-preview`, formData);
}

export function downloadSampleTemplateApi() {
    return api.getFile(`${TASK_BASE}/sample-template`);
}

