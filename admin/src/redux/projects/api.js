import { useSelector } from "react-redux"
import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function addProjectApi(data): any {
    return api.create(URL.AddProject, data.payload)
}
export function getProjectApi(data): any {
    const p = data?.payload || {};
    const queryParts = [];
    if (p.projectStatus && p.projectStatus !== 'undefined' && p.projectStatus !== 'null') {
        queryParts.push(`status=${encodeURIComponent(p.projectStatus)}`);
    }
    if (p.status !== undefined && p.status !== null && p.status !== 'undefined') {
        queryParts.push(`isActive=${p.status}`);
    }
    if (p.skip !== undefined && p.skip !== null) {
        queryParts.push(`page=${p.skip}`);
    }
    if (p.search) {
        queryParts.push(`search=${encodeURIComponent(p.search)}`);
    }
    queryParts.push(`limit=${p.limit || 200}`);
    if (p.userId) {
        queryParts.push(`user=${encodeURIComponent(p.userId)}`);
    }
    if (p.projectType && p.projectType !== 'undefined' && p.projectType !== 'null') {
        queryParts.push(`projectType=${encodeURIComponent(p.projectType)}`);
    }
    const queryStr = queryParts.length ? `?${queryParts.join('&')}` : '';
    return api.get(`${URL.AddProject}${queryStr}`);
}
export function updateProjectApi(data): any {
    return api.update(`${URL.AddProject}/${data?.payload?.projectId}`, data?.payload?.body)
}
export function updateProjectStatusApi(data): any {
    return api.update(`${URL.UpdateProjectStatus}${data?.payload?.projectId}`, data?.payload?.body)
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

export function getAmcProjectsApi(data): any {
    return api.get(`/api/v1/admin/amc-project?projectType=${data?.payload?.projectType || ''}&page=${data?.payload?.page || 1}&limit=${data?.payload?.limit || 10}${data?.payload?.userId ? `&user=${data?.payload?.userId}` : ''}`)
}