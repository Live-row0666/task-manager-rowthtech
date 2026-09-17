import ClientProjectTypes from './constant';

const INIT = { data: [], loading: false, message: '' };

export const addClientProjectReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientProjectTypes.ADD_CLIENT_PROJECT_LOADING:
            return { data: [], loading: true };
        case ClientProjectTypes.ADD_CLIENT_PROJECT_SUCCESS:
            return { data: action.payload, loading: false };
        case ClientProjectTypes.ADD_CLIENT_PROJECT_RESET:
            return { data: [], loading: false };
        case ClientProjectTypes.ADD_CLIENT_PROJECT_ERROR:
            return { data: [], loading: false, message: action.payload };
        default:
            return { ...state };
    }
};

export const getClientProjectsReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientProjectTypes.GET_CLIENT_PROJECTS_LOADING:
            return { data: [], loading: true };
        case ClientProjectTypes.GET_CLIENT_PROJECTS_SUCCESS:
            return { data: action.payload, loading: false };
        case ClientProjectTypes.GET_CLIENT_PROJECTS_ERROR:
            return { data: [], loading: false, message: action.payload };
        default:
            return { ...state };
    }
};
