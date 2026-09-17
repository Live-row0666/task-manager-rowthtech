import { CLIENT_CONSTANTS } from './constant';

export const getClients = (params) => ({
    type: CLIENT_CONSTANTS.GET_CLIENTS_REQUEST,
    payload: params
});

export const createClient = (data) => ({
    type: CLIENT_CONSTANTS.CREATE_CLIENT_REQUEST,
    payload: data
});

export const updateClient = (id, data) => ({
    type: CLIENT_CONSTANTS.UPDATE_CLIENT_REQUEST,
    payload: { id, data }
});

export const deleteClient = (id) => ({
    type: CLIENT_CONSTANTS.DELETE_CLIENT_REQUEST,
    payload: id
});
export const sendInvitation = (data) => ({
    type: CLIENT_CONSTANTS.SEND_INVITATION_REQUEST,
    payload: data,
});