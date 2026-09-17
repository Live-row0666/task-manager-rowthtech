import SUPPORT_TYPES from "./constant";
type AuthAction = { type: string, payload: {} | string };

export const getAllTickets = (data): AuthAction => ({
    type: SUPPORT_TYPES.GET_ALL_TICKETS,
    payload: data
})

export const createTicket = (data): AuthAction => ({
    type: SUPPORT_TYPES.CREATE_TICKET,
    payload: data
})

export const updateTicket = (data): AuthAction => ({
    type: SUPPORT_TYPES.UPDATE_TICKET,
    payload: data
})

export const updateTicketResponse = (data): AuthAction => ({
    type: SUPPORT_TYPES.UPDATE_TICKET_RESPONSE,
    payload: data
})

export const getTicketById = (data): AuthAction => ({
    type: SUPPORT_TYPES.GET_TICKET_BY_ID,
    payload: data
})