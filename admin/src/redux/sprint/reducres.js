import SprintTypes from "./constant";

const ADD_SPRINT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_ALL_SPRINT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const DELETE_SPRINT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
//single sprint =--------
const GET_SINGLE_SPRINT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

const GET_SPRINT_FOR_TASK = {
    data: [],
    message: "",
    loading: false
}
// end single sprint ----
const UPDATE_SPRINT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
export const addSprint = (state = ADD_SPRINT_INITIAL_STATE, action) => {
    switch (action.type) {
        case SprintTypes.ADD_SPRINT_LOADING:
            return {
                data: ADD_SPRINT_INITIAL_STATE.data,
                loading: true,
            };
        case SprintTypes.ADD_SPRINT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SprintTypes.ADD_SPRINT_RESET:
            return {
                data: ADD_SPRINT_INITIAL_STATE.data,
                loading: false,
            };
        case SprintTypes.ADD_SPRINT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
// get single sprint--------------------------------
export const getAllSingleSprints = (state = GET_SINGLE_SPRINT_INITIAL_STATE, action) => {

    switch (action.type) {
        case SprintTypes.GET_ALL_SINGLE_SPRINT_LOADING:
            return {
                data: GET_SINGLE_SPRINT_INITIAL_STATE.data,
                loading: true,
            };
        case SprintTypes.GET_ALL_SINGLE_SPRINT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case SprintTypes.GET_ALL_SINGLE_SPRINT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getSprintForTaskReducer = (state = GET_SPRINT_FOR_TASK, action) => {

    switch (action.type) {
        case SprintTypes.GET_SPRINT_FOR_TASK_LOADING:
            return {
                data: GET_SPRINT_FOR_TASK.data,
                loading: true,
            };
        case SprintTypes.GET_SPRINT_FOR_TASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case SprintTypes.GET_SPRINT_FOR_TASK_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
// end single sprint-------------------------------
export const getAllSprints = (state = GET_ALL_SPRINT_INITIAL_STATE, action) => {
    switch (action.type) {
        case SprintTypes.GET_ALL_SPRINT_LOADING:
            return {
                data: GET_ALL_SPRINT_INITIAL_STATE.data,
                loading: true,
            };
        case SprintTypes.GET_ALL_SPRINT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case SprintTypes.GET_ALL_SPRINT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const deleteSprint = (state = DELETE_SPRINT_INITIAL_STATE, action) => {
    switch (action.type) {
        case SprintTypes.DELETE_SPRINT_LOADING:
            return {
                data: DELETE_SPRINT_INITIAL_STATE.data,
                loading: true,
            };
        case SprintTypes.DELETE_SPRINT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SprintTypes.DELETE_SPRINT_RESET:
            return {
                data: DELETE_SPRINT_INITIAL_STATE.data,
                loading: false
            }

        case SprintTypes.DELETE_SPRINT_ERROR:
            return {
                data: [],
                status: 403,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const updateSprint = (state = UPDATE_SPRINT_INITIAL_STATE, action) => {
    switch (action.type) {
        case SprintTypes.UPDATE_SPRINT_LOADING:
            return {
                data: UPDATE_SPRINT_INITIAL_STATE.data,
                loading: true,
            };
        case SprintTypes.UPDATE_SPRINT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case SprintTypes.UPDATE_SPRINT_RESET:
            return {
                data: UPDATE_SPRINT_INITIAL_STATE.data,
                loading: false
            }

        case SprintTypes.UPDATE_SPRINT_ERROR:
            return {
                data: [],
                status: 403,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getSprintId = (state = { data: "" }, action) => {
    switch (action.type) {
        case "sprintId":
            return {
                data: action.payload,

            };

        default:
            return { ...state };

    }
};