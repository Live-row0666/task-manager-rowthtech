import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

// Category
export function createTechnologyCategoryApi(data): any {
    return api.create(URL.techCategory, data.payload)
}
export function getAllTechnologyCategoryApi(data): any {
    return api.get(`${URL.techCategory}?status=${data.payload.status}`)
}

export function UpdateTechnologyCategoryApi(data): any {
    return api.update(`${URL.techCategory}/${data?.payload?.id}`, data.payload.body)
}
export function deleteTechnologyCategoryApi(data): any {
    return api.update(URL.DeleteCategoryTechnologyy, data.payload)
}

// Technology
export function createTechnologyApi(data): any {
    return api.create(URL.technology, data.payload)
}
export function getAllTechnologyApi(data): any {
    return api.get(`${URL.technology}?status=${data.payload.status}&searchQuery=${data?.payload?.search || ''}&page=${data?.payload?.page || 1}${data.payload.limit ? `&limit=${data.payload.limit}` : ''}`)
}
// return api.get(URL.GetTechnology + data.payload)

export function UpdateTechnologyApi(data): any {
    return api.update(`${URL.technology}/${data.payload.id}`, data.payload.body)
}
export function deleteTechnologyApi(data): any {
    return api.update(URL.DeleteTechnology, data.payload)
}