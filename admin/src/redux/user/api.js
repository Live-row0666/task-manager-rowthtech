import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function getallUsersApi(data): any {
    return api.get(URL.ALL_USERS, data.payload)
}
export function getallCategoryApi(data): any {
    return api.get(`${URL.ALL_CATEGORY}${data.payload.status}`)
}
export function deleteUserApi(data): any {
    return api.delete(`${URL.ALL_USERS}/${data.payload}`)
}
export function InviteUserApi(data): any {
    return api.create(URL.InviteUser, data.payload)
}
export function UpdateUserApi(data): any {
    return api.update(`${URL.InviteUser}/${data.payload?.id}`, data.payload.body)
}
export function getallRolesApi(data): any {
    return api.get(URL.Roles, data.payload)
}
export function getCsvDataApi(data): any {
    return api.get(URL.GetCsvData + data.payload)
}

export function getuserTasksApi(data): any {
    return api.get(`${URL.userTasks}?userId=${data.payload.userId}&projectId=${data.payload.projectId}`)
}

export function getUserByIdApi(data): any {
    return api.get(`${URL.GetUserById}/${data.payload.id}`)

}