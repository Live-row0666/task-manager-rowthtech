import ProjectTypes from "./constant";

const ADD_PROJECT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_PROJECT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_PROJECTS_COUNT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const UPDATE_PROJECT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const DELETE_PROJECT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_PROJECT_BY_ID_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

const GET_PROJECT_USERS_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

const GET_PROJECT_TIME_SPENT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

export const addProject = (state = ADD_PROJECT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.ADD_PROJECT_LOADING:
            return {
                data: ADD_PROJECT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.ADD_PROJECT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ProjectTypes.ADD_PROJECT_RESET:
            return {
                data: ADD_PROJECT_INITIAL_STATE.data,
                loading: false,
            };
        case ProjectTypes.ADD_PROJECT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getProject = (state = GET_PROJECT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.GET_PROJECT_LOADING:
            return {
                data: GET_PROJECT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.GET_PROJECT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ProjectTypes.GET_PROJECT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getProjectsCount = (state = GET_PROJECTS_COUNT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.GET_PROJECTS_COUNT_LOADING:
            return {
                data: GET_PROJECTS_COUNT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.GET_PROJECTS_COUNT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ProjectTypes.GET_PROJECTS_COUNT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const updateProject = (state = UPDATE_PROJECT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.UPDATE_PROJECT_DETAILS_LOADING:
            return {
                data: UPDATE_PROJECT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.UPDATE_PROJECT_DETAILS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ProjectTypes.UPDATE_PROJECT_DETAILS_RESET:
            return {
                data: UPDATE_PROJECT_INITIAL_STATE.data,
                loading: false
            }

        case ProjectTypes.UPDATE_PROJECT_DETAILS_ERROR:
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
export const deleteProject = (state = DELETE_PROJECT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.DELETE_PROJECT_DETAILS_LOADING:
            return {
                data: DELETE_PROJECT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.DELETE_PROJECT_DETAILS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ProjectTypes.DELETE_PROJECT_DETAILS_RESET:
            return {
                data: DELETE_PROJECT_INITIAL_STATE.data,
                loading: false
            }

        case ProjectTypes.DELETE_PROJECT_DETAILS_ERROR:
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
export const getProjectById = (state = GET_PROJECT_BY_ID_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.GET_PROJECT_BY_ID_LOADING:
            return {
                data: GET_PROJECT_BY_ID_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.GET_PROJECT_BY_ID_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ProjectTypes.GET_PROJECT_BY_ID_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};


export const getProjectId = (state = { data: "" }, action) => {
    switch (action.type) {
        case "projectId":
            return {
                data: action.payload,

            };

        default:
            return { ...state };

    }
};

export const getProjectUsers = (state = GET_PROJECT_USERS_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.GET_PROJECT_USERS_LOADING:
            return {
                data: GET_PROJECT_USERS_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.GET_PROJECT_USERS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ProjectTypes.GET_PROJECT_USERS_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getProjectTimeSpent = (state = GET_PROJECT_TIME_SPENT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectTypes.GET_PROJECT_TIME_SPENT_LOADING:
            return {
                data: GET_PROJECT_TIME_SPENT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectTypes.GET_PROJECT_TIME_SPENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ProjectTypes.GET_PROJECT_TIME_SPENT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};