import { useSelector } from "react-redux"
import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function addProjectApi(data): any {
    return api.create(URL.AddProject, data.payload)
}
export function getProjectApi(data): any {
    return api.get(`${URL.AddProject}?${data.payload.projectStatus !== '' && `status=${data.payload.projectStatus}`}&isActive=${data.payload.status}&page=${data.payload.skip}&search=${data.payload.search || ''}&limit=${data?.payload?.limit || 50}${data?.payload?.userId ? `&user=${data?.payload?.userId}` : ''}&projectType=${data?.payload?.projectType}`)
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