
import SUMMARY_TYPES from "./constant";

const GET_TASK_SUMMARY_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}

const GET_PRIORITY_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const GET_TASK_WEEK_COUNT_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const GET_ALL_TASK_COUNT_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}

export const getTaskSummaryReducer = (state = GET_TASK_SUMMARY_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUMMARY_TYPES.GET_TASK_SUMMARY_LOADING:
            return {
                data: state?.data,
                loading: true,
            };
        case SUMMARY_TYPES.GET_TASK_SUMMARY_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SUMMARY_TYPES.GET_TASK_SUMMARY_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getPriorityGraphReducer = (state = GET_PRIORITY_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUMMARY_TYPES.GET_PRIORITY_GRAPH_LOADING:
            return {
                data: GET_PRIORITY_INITIAL_STATE.data,
                loading: true,
            };
        case SUMMARY_TYPES.GET_PRIORITY_GRAPH_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case SUMMARY_TYPES.GET_PRIORITY_GRAPH_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getTaskWeekCountReducer = (state = GET_TASK_WEEK_COUNT_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUMMARY_TYPES.GET_TASK_WEEK_COUNT_LOADING:
            return {
                data: GET_TASK_WEEK_COUNT_INITIAL_STATE.data,
                loading: true,
            };
        case SUMMARY_TYPES.GET_TASK_WEEK_COUNT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case SUMMARY_TYPES.GET_TASK_WEEK_COUNT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getAllTaskCountReducer = (state = GET_ALL_TASK_COUNT_INITIAL_STATE, action) => {
    switch (action.type) {
        case SUMMARY_TYPES.GET_ALL_TASK_COUNT_LOADING:
            return {
                data: GET_ALL_TASK_COUNT_INITIAL_STATE.data,
                loading: true,
            };
        case SUMMARY_TYPES.GET_ALL_TASK_COUNT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case SUMMARY_TYPES.GET_ALL_TASK_COUNT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }

};
