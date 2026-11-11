import { APICore } from './apiCore';

const api = new APICore();

const baseurl = 'api/v1/client/auth';
const dashboardBaseUrl = 'api/v1/client';
function login(params: any): any {
    let timezone = '';
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { }
    return api.create(`${baseurl}/login`, { ...params, loginContext: { timezone } });
}

function logout(): any {
    return api.create(`${baseurl}/logout`, {});
}

function signup(params: any): any {
    const baseUrl = '/register/';
    return api.create(`${baseUrl}`, params);
}

function forgotPassword(params: any): any {
    return api.create(`${baseurl}/forgot-password`, params);
}

function forgotPasswordConfirm(params: any): any {
    return api.create(`${baseurl}/reset-password/${params.token}`, params);
}

function getDashboard(projectId = ""): any {
    const url = projectId
        ? `${dashboardBaseUrl}/dashboard?projectId=${projectId}`
        : `${dashboardBaseUrl}/dashboard`;

    return api.get(url);
}

function getClientMilestones(projectId = "", isActive = true, type = ""): any {
    let url = `${dashboardBaseUrl}/client-milestone?projectId=${projectId}&isActive=${isActive}`;
    if (type) url += `&type=${type}`;
    return api.get(url);
}

function getClientTasks(params: any = {}): any {
    if (typeof params === 'string') {
        const url = params ? `${dashboardBaseUrl}/client-task?milestoneId=${params}&limit=500` : `${dashboardBaseUrl}/client-task?limit=500`;
        return api.get(url);
    }
    const query = new URLSearchParams();
    if (params.projectId) query.append('projectId', params.projectId);
    if (params.milestoneId) query.append('milestoneId', params.milestoneId);
    query.append('limit', params.limit || '500');
    return api.get(`${dashboardBaseUrl}/client-task?${query.toString()}`);
}


function getCRStats(projectId = ""): any {
    return api.get(`${dashboardBaseUrl}/cr/stats${projectId ? `?projectId=${projectId}` : ""}`);
}

function getCRs(params: any = {}): any {
    const query = new URLSearchParams();
    if (params.projectId) query.append("projectId", params.projectId);
    if (params.status) query.append("status", params.status);
    if (params.priority) query.append("priority", params.priority);
    if (params.search) query.append("search", params.search);
    return api.get(`${dashboardBaseUrl}/cr?${query.toString()}`);
}

function getCRById(id: string): any {
    return api.get(`${dashboardBaseUrl}/cr/${id}`);
}

function createCRApi(formData: any): any {
    return api.createWithFormData(`${dashboardBaseUrl}/cr`, formData);
}

function updateCRApi(id: string, data: any): any {
    return api.update(`${dashboardBaseUrl}/cr/${id}`, data);
}

function deleteCRApi(id: string): any {
    return api.delete(`${dashboardBaseUrl}/cr/${id}`);
}

export { login, logout, signup, forgotPassword, forgotPasswordConfirm, getDashboard, getClientMilestones, getClientTasks, getCRStats, getCRs, getCRById, createCRApi, updateCRApi, deleteCRApi };


