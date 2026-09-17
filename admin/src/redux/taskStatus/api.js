import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function getAllTaskStatusesApi(data): any {
    return api.get(`${URL.taskStatuses}?page=${data?.payload?.skip || 1}&project=${data?.payload?.projectId || ''}&search=${data?.payload?.search || ''}`)
}

export function createTaskStatusApi(data): any {
    return api.create(URL.taskStatuses, data?.payload)
}

export function editTaskStatusApi(data): any {
    return api.update(`${URL.taskStatuses}/${data?.payload?.id}`, data?.payload?.body)
}