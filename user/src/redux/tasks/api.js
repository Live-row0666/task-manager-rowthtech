import { APICore } from "../../helpers/api/apiCore";

const api = new APICore();

// Get user's assigned tasks
export function getUserTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/v1/user/task${queryString ? '?' + queryString : ''}`);
}

export function getUserTasksTimer(params = {}) {
    return api.get(`/api/v1/user/time-tracking/${params}`)
}

// Get single task details
export function getUserTask(taskId) {
    return api.get(`/api/v1/user/task/${taskId}`);
}

// Update task status/progress
export function updateUserTask(taskId, data) {
    return api.update(`/api/v1/user/task/${taskId}`, data);
}

// Get task statuses for a project
export function getTaskStatusesByProject(projectId) {
    return api.get(`/api/v1/user/task-status/project/${projectId}`);
}

// Add comment to task
export function addTaskComment(taskId, comment) {
    return api.create(`/api/v1/user/task/${taskId}/comment`, { comment });
}

// Get tasks by project for user
export function getUserTasksByProject(projectId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/v1/user/task/project/${projectId}${queryString ? '?' + queryString : ''}`);
}