import { CLIENT_CONSTANTS } from './constant';

const initialState = {
    clients: [],
    loading: false,
    error: null
};

export const clientReducer = (state = initialState, action) => {
    switch (action.type) {
        case CLIENT_CONSTANTS.GET_CLIENTS_REQUEST:
        case CLIENT_CONSTANTS.CREATE_CLIENT_REQUEST:
        case CLIENT_CONSTANTS.UPDATE_CLIENT_REQUEST:
        case CLIENT_CONSTANTS.DELETE_CLIENT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null
            };

        case CLIENT_CONSTANTS.GET_CLIENTS_SUCCESS:
            return {
                ...state,
                loading: false,
                clients: action.payload.clients || action.payload,
                totalPages: action.payload.totalPages || 1,
                error: null
            };

        case CLIENT_CONSTANTS.CREATE_CLIENT_SUCCESS:
            return {
                ...state,
                loading: false,
                error: null
            };

        case CLIENT_CONSTANTS.UPDATE_CLIENT_SUCCESS:
            return {
                ...state,
                loading: false,
                clients: {
                    ...state.clients,
                    data: state.clients.data?.map(client => 
                        client._id === action.payload._id ? action.payload : client
                    )
                },
                error: null
            };

        case CLIENT_CONSTANTS.DELETE_CLIENT_SUCCESS:
            return {
                ...state,
                loading: false,
                clients: {
                    ...state.clients,
                    data: state.clients.data?.filter(client => client._id !== action.payload)
                },
                error: null
            };

        case CLIENT_CONSTANTS.GET_CLIENTS_FAILURE:
        case CLIENT_CONSTANTS.CREATE_CLIENT_FAILURE:
        case CLIENT_CONSTANTS.UPDATE_CLIENT_FAILURE:
        case CLIENT_CONSTANTS.DELETE_CLIENT_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        default:
            return state;
    }
};