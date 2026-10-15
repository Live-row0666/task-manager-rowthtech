import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()


export function getAllMileStonesApi(data): any {
    const { status } = data?.payload
    return api.get(`${URL.GetAllMileStones}status=${status}`)
}

export function addAllMilstoneApi(data): any {
    return api.create(URL.MileStoneAdd, data.payload)
}

export function deleteMileStoneApi(data): any {
    return api.update(URL.MileStoneDelete, data.payload)
    // return api.update(`${URL.MileStoneDelete}${data?.payload}`)
}

export function getMileStoneApi(data): any {

    return api.get(URL.ParticularMilestoneDetail + data?.payload)
}

export function UpdateMileStonesApi(data): any {
    return api.update(`${URL.UPDATE_MILESTONE}/${data?.milestoneId}`, data)

}

export function getSinleMileStoneApi(data): any {
    // return api.get(URL.SingleMilestone + data?.payload)
    return api.get(`${URL.SingleMilestone}${data?.payload?.id}&isActive=${data?.payload?.isActive === undefined ? true : data?.payload?.isActive}&page=${data.payload.skip}&limit=100&milestoneId=${data.payload.mileStoneId || ''}&search=${data?.payload?.search || ''}${data?.payload?.isDelivered === true ? `&isDelivered=true` : `&isDelivered=false`}${data?.payload?.type ? `&type=${data?.payload?.type}` : ''}`)
}

export function getProjectTasksApi(data): any {
    return api.get(`${URL.projectTasks}?projectId=${data.payload.projectId}`)
}