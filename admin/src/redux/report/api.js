import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

// Employee Daily Logs API
export function getEmployeeDailyLogsApi(data): any {
    const { dateFrom, dateTo, employeeId, projectId, taskId } = data.payload;
    let queryParams = `dateFrom=${dateFrom}&dateTo=${dateTo}`;

    if (employeeId) queryParams += `&employeeId=${employeeId}`;
    if (projectId) queryParams += `&projectId=${projectId}`;
    if (taskId) queryParams += `&taskId=${taskId}`;

    return api.get(`/api/v1/admin/reports/employee-daily?${queryParams}`);
}

// Monthly Summary API
export function getMonthlySummaryApi(data): any {
    const { month, employeeId } = data.payload;
    let queryParams = `month=${month}`;

    if (employeeId) queryParams += `&employeeId=${employeeId}`;

    return api.get(`/api/v1/admin/reports/monthly-summary?${queryParams}`);
}

// Project Daily Summary API
export function getProjectDailySummaryApi(data): any {
    const { month, dateFrom, dateTo } = data.payload;
    let queryParams = '';

    if (month) {
        queryParams = `month=${month}`;
    } else if (dateFrom && dateTo) {
        queryParams = `dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }

    return api.get(`/api/v1/admin/reports/project-daily?${queryParams}`);
}

// Project Team View API
export function getProjectTeamViewApi(data): any {
    const { projectId, dateFrom, dateTo } = data.payload;
    let queryParams = `projectId=${projectId}`;

    if (dateFrom) queryParams += `&dateFrom=${dateFrom}`;
    if (dateTo) queryParams += `&dateTo=${dateTo}`;

    return api.get(`/api/v1/admin/reports/project-team?${queryParams}`);
}