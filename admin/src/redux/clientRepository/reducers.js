import ClientRepository from "./constant";
const GET_PROJECT_NAME_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const UPLOAD_PROJECT_DETAIL_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const  GET_UPLOAD_PROJECT_DETAIL_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

export const getProjectNameReducer = (state = GET_PROJECT_NAME_INITIAL_STATE, action) => {
    switch (action.type) {
        case ClientRepository.GET_PROJECT_NAME_LOADING:
            return {
                data: GET_PROJECT_NAME_INITIAL_STATE.data,
                loading: true,
            };
        case ClientRepository.GET_PROJECT_NAME_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ClientRepository.GET_PROJECT_NAME_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const uploadProjectDetail = (state = UPLOAD_PROJECT_DETAIL_INITIAL_STATE, action) => {
    switch (action.type) {
        case ClientRepository.UPLOAD_PROJECT_DETAIL_LOADING:
            return {
                data: UPLOAD_PROJECT_DETAIL_INITIAL_STATE.data,
                loading: true,
            };
        case ClientRepository.UPLOAD_PROJECT_DETAIL_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ClientRepository.UPLOAD_PROJECT_DETAIL_RESET:
            return {
                data: UPLOAD_PROJECT_DETAIL_INITIAL_STATE.data,
                loading: false,
            };
        case ClientRepository.UPLOAD_PROJECT_DETAIL_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getuploadProjectDetailReducer = (state = GET_UPLOAD_PROJECT_DETAIL_INITIAL_STATE, action) => {
    switch (action.type) {
        case ClientRepository.GET_UPLOAD_PROJECT_DETAIL_LOADING:
            return {
                data: GET_UPLOAD_PROJECT_DETAIL_INITIAL_STATE.data,
                loading: true,
            };
        case ClientRepository.GET_UPLOAD_PROJECT_DETAIL_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ClientRepository.GET_UPLOAD_PROJECT_DETAIL_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

