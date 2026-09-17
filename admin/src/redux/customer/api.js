import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()


export function getPreSaleApiEndPoint(data): any {
    return api.get(URL.GetPreSale + data?.payload?.skip)
}
export function addPreSaleApiEndPoint(payload): any {
    const { data } = payload
    return api.create(URL.AddPreSale, data)
}

export function updatePreSaleApiEndPoint(payload): any {
    const { data } = payload

    return api.update(URL.UpdatePreSale, data)
}
export function deletePreSaleApiEndPoint(payload): any {
    const { id } = payload
    return api.delete(`${URL.DeletePreSale}${id}`)
}
