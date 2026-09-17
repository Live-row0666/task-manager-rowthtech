import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function addProjectApi(data): any {
    return api.create(URL.AddProject, data.payload)
}
export function getProjectApi(data): any {
    return api.get(`${URL.AddProject}?status=${data.payload.projectStatus}&isActive=${data.payload.status}&skip=${data.payload.skip}&search=${data.payload.search || ''}`)
}
export function updateProjectApi(data): any {
    return api.update(`${URL.AddProject}/${data?.payload?.projectId}`, data?.payload?.body)
}
export function deleteProjectApi(data): any {
    return api.update(URL.DeleteProject, data?.payload?.id)

    // return api.update(`${URL.DeleteProject}${data?.payload?.id}`)
}
export function getProjectByIdApi(data): any {
    return api.get(`${URL.GetProjectById}/${data?.payload?.id}`)
}

export function getProjectsCountApi(data): any {
    return api.get(URL.getProjectsCount)
}

export function getprojectUsersApi(data): any {
    return api.get(`${URL.projectUsers}?projectId=${data?.payload?.projectId}&page=${data.payload.page}`)
}

export function getprojectTimeSpentApi(data): any {
    return api.get(`${URL.projectTimeSpent}?projectId=${data?.payload?.projectId}`)
}

// User-specific API functions
export function getUserProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/v1/user/project${queryString ? '?' + queryString : ''}`);
}

export function getUserProject(projectId) {
    return api.get(`/api/v1/user/project/${projectId}`);
}

export function getUserTasksByProject(projectId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/v1/user/task/project/${projectId}${queryString ? '?' + queryString : ''}`);
}