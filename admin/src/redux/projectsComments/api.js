import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function addProjectCommentApi(data): any {
    return api.create(URL.ProjectComments, data.payload)
}

export function getProjectCommentApi(data): any {
    return api.get(`${URL.ProjectComments}/${data.payload.projectId}?page=${data.payload.page}&limit=${data?.payload?.limit || 50}`)
}

export function deleteProjectCommentApi(data): any {
    return api.delete(`${URL.ProjectComments}/${data?.payload}`)
}

export function updateProjectCommentApi(data): any {
    return api.update(`${URL.ProjectComments}/${data?.payload?.id}`, data?.payload?.body)
}

export function getCommentCountApi(data): any {
    return api.get(`${URL.ProjectCommentCounts}/${data.payload.projectId}`)
}