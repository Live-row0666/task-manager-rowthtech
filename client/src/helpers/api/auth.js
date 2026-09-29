import { APICore } from './apiCore';

const api = new APICore();

const baseurl = 'api/v1/client/auth';
const dashboardBaseUrl = 'api/v1/client';
function login(params: any): any {
    return api.create(`${baseurl}/login`, params);
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

function getClientMilestones(projectId = "", isActive = true): any {
    return api.get(`${dashboardBaseUrl}/client-milestone?projectId=${projectId}&isActive=${isActive}`);
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

export { login, logout, signup, forgotPassword, forgotPasswordConfirm, getDashboard, getClientMilestones, getClientTasks };

