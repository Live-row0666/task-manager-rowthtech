import * as URL from "../../constants/endpoint"
import { APICore } from "../../helpers/api/apiCore"
const api = new APICore()

export function getAllTicketsApi(data): any {
    const params = new URLSearchParams();
    if (data.payload.status && data.payload.status !== 'all') params.append('status', data.payload.status);
    if (data.payload.priority && data.payload.priority !== 'all') params.append('priority', data.payload.priority);
    if (data.payload.category && data.payload.category !== 'all') params.append('category', data.payload.category);
    if (data.payload.page) params.append('page', data.payload.page);
    if (data.payload.limit) params.append('limit', data.payload.limit);
    if (data.payload.user) params.append('user', data.payload.user);

    return api.get(`${URL.SUPPORT_TICKETS}?${params.toString()}`);
}

export function createTicketApi(data): any {
    return api.create(URL.SUPPORT_TICKETS, data.payload)
}

export function updateTicketApi(data): any {
    return api.update(`${URL.SUPPORT_TICKETS}/${data.payload.id}`, data.payload.body)
}

export function updateTicketResponseApi(data): any {
    return api.create(`${URL.VIEW_SUPPORT_TICKETS}/${data.payload.id}/response`, data.payload.body)
}

export function getTicketByIdApi(data): any {
    return api.get(`${URL.SUPPORT_TICKETS}/${data.payload.id}`);
}