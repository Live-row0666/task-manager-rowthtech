import TaskStatusTypes from './constant'

const GET_ALL_TASK_STATUSES_INTITIAL = {
    data: [],
    message: "",
    loading: false
}

const CREATE_TASK_STATUS_INITIAL = {
    data: [],
    message: "",
    loading: false
}

const EDIT_TASK_STATUS_INITIAL = {
    data: [],
    message: "",
    loading: false
}

export const getAllTaskStatusesReducer = (state = GET_ALL_TASK_STATUSES_INTITIAL, action) => {
    switch (action.type) {
        case TaskStatusTypes.GET_ALL_TASK_STATUS_LOADING:
            return {
                data: state.data,
                loading: true,
            };
        case TaskStatusTypes.GET_ALL_TASK_STATUS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case TaskStatusTypes.GET_ALL_TASK_STATUS_ERROR:
            return {
                data: action.payload,
                loading: false,
            };
        default:
            return { ...state };

    }
};

export const createTaskStatusReducer = (state = CREATE_TASK_STATUS_INITIAL, action) => {
    switch (action.type) {
        case TaskStatusTypes.CREATE_TASK_STATUS_LOADING:
            return {
                data: state.data,
                loading: true,
            };
        case TaskStatusTypes.CREATE_TASK_STATUS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TaskStatusTypes.CREATE_TASK_STATUS_RESET:
            return {
                data: [],
                loading: false,
            };
        case TaskStatusTypes.CREATE_TASK_STATUS_ERROR:
            return {
                data: action.payload,
                loading: false,
            };
        default:
            return { ...state };

    }
};

export const editTaskStatusReducer = (state = EDIT_TASK_STATUS_INITIAL, action) => {
    switch (action.type) {
        case TaskStatusTypes.EDIT_TASK_STATUS_LOADING:
            return {
                data: state.data,
                loading: true,
            };
        case TaskStatusTypes.EDIT_TASK_STATUS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TaskStatusTypes.EDIT_TASK_STATUS_RESET:
            return {
                data: [],
                loading: false,
            };
        case TaskStatusTypes.EDIT_TASK_STATUS_ERROR:
            return {
                data: action.payload,
                loading: false,
            };
        default:
            return { ...state };

    }
};