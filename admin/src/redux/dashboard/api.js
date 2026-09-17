import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function getGlobalSearchApi(data): any {
    return api.get(`${URL.GlobalSearch}?query=${data.payload.query || ''}&limit=${data.payload.limit || ''}`)
}