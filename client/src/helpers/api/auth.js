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

function getClientTasks(milestoneId = ""): any {
    return api.get(`${dashboardBaseUrl}/client-task?milestoneId=${milestoneId}&limit=200`);
}

export { login, logout, signup, forgotPassword, forgotPasswordConfirm, getDashboard, getClientMilestones, getClientTasks };
