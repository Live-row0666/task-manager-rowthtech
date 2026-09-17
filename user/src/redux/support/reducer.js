import SUPPORT_TYPES from './constant';

const GET_ALL_TICKETS_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const CREATE_TICKET_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const UPDATE_TICKET_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const UPDATE_TICKET_RESPONSE_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const GET_TICKET_BY_ID_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

export const getAllTickets = (state = GET_ALL_TICKETS_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUPPORT_TYPES.GET_ALL_TICKETS_LOADING:
            return {
                data: GET_ALL_TICKETS_INITIAL_STATE.data,
                loading: true,
            };
        case SUPPORT_TYPES.GET_ALL_TICKETS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SUPPORT_TYPES.GET_ALL_TICKETS_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const createTicket = (state = CREATE_TICKET_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUPPORT_TYPES.CREATE_TICKET_LOADING:
            return {
                data: CREATE_TICKET_INITIAL_STATE.data,
                loading: true,
            };
        case SUPPORT_TYPES.CREATE_TICKET_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SUPPORT_TYPES.CREATE_TICKET_RESET:
            return {
                data: CREATE_TICKET_INITIAL_STATE.data,
                loading: false,
            };
        case SUPPORT_TYPES.CREATE_TICKET_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const updateTicket = (state = UPDATE_TICKET_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUPPORT_TYPES.UPDATE_TICKET_LOADING:
            return {
                data: UPDATE_TICKET_INITIAL_STATE.data,
                loading: true,
            };
        case SUPPORT_TYPES.UPDATE_TICKET_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SUPPORT_TYPES.UPDATE_TICKET_RESET:
            return {
                data: UPDATE_TICKET_INITIAL_STATE.data,
                loading: false,
            };
        case SUPPORT_TYPES.UPDATE_TICKET_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const updateTicketResponse = (state = UPDATE_TICKET_RESPONSE_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_LOADING:
            return {
                data: UPDATE_TICKET_RESPONSE_INITIAL_STATE.data,
                loading: true,
            };
        case SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_RESET:
            return {
                data: UPDATE_TICKET_RESPONSE_INITIAL_STATE.data,
                loading: false,
            };
        case SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const getTicketById = (state = GET_TICKET_BY_ID_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUPPORT_TYPES.GET_TICKET_BY_ID_LOADING:
            return {
                data: GET_TICKET_BY_ID_INITIAL_STATE.data,
                loading: true,
            };
        case SUPPORT_TYPES.GET_TICKET_BY_ID_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SUPPORT_TYPES.GET_TICKET_BY_ID_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};