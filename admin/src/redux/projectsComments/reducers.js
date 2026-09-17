import ProjectCommentTypes from "./constant";

const ADD_PROJECT_COMMENT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_PROJECT_COMMENT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const DELETE_PROJECT_COMMENT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const UPDATE_PROJECT_COMMENT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_COMMENT_COUNT_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

export const addProjectCommentReducer = (state = ADD_PROJECT_COMMENT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectCommentTypes.ADD_PROJECT_COMMENT_LOADING:
            return {
                data: ADD_PROJECT_COMMENT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectCommentTypes.ADD_PROJECT_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ProjectCommentTypes.ADD_PROJECT_COMMENT_RESET:
            return {
                data: ADD_PROJECT_COMMENT_INITIAL_STATE.data,
                loading: false,
            };
        case ProjectCommentTypes.ADD_PROJECT_COMMENT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getProjectCommentReducer = (state = GET_PROJECT_COMMENT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectCommentTypes.GET_PROJECT_COMMENT_LOADING:
            return {
                data: GET_PROJECT_COMMENT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectCommentTypes.GET_PROJECT_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case ProjectCommentTypes.GET_PROJECT_COMMENT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const deleteProjectCommentReducer = (state = DELETE_PROJECT_COMMENT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectCommentTypes.DELETE_PROJECT_COMMENT_LOADING:
            return {
                data: DELETE_PROJECT_COMMENT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectCommentTypes.DELETE_PROJECT_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ProjectCommentTypes.DELETE_PROJECT_COMMENT_RESET:
            return {
                data: DELETE_PROJECT_COMMENT_INITIAL_STATE.data,
                loading: false
            }

        case ProjectCommentTypes.DELETE_PROJECT_COMMENT_ERROR:
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

export const updateProjectCommentReducer = (state = UPDATE_PROJECT_COMMENT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectCommentTypes.UPDATE_PROJECT_COMMENT_LOADING:
            return {
                data: UPDATE_PROJECT_COMMENT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectCommentTypes.UPDATE_PROJECT_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ProjectCommentTypes.UPDATE_PROJECT_COMMENT_RESET:
            return {
                data: UPDATE_PROJECT_COMMENT_INITIAL_STATE.data,
                loading: false
            }
        case ProjectCommentTypes.UPDATE_PROJECT_COMMENT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getCommentCountReducer = (state = GET_COMMENT_COUNT_INITIAL_STATE, action) => {
    switch (action.type) {
        case ProjectCommentTypes.GET_COMMENT_COUNT_LOADING:
            return {
                data: GET_COMMENT_COUNT_INITIAL_STATE.data,
                loading: true,
            };
        case ProjectCommentTypes.GET_COMMENT_COUNT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case ProjectCommentTypes.GET_COMMENT_COUNT_RESET:
            return {
                data: GET_COMMENT_COUNT_INITIAL_STATE.data,
                loading: false
            }
        case ProjectCommentTypes.GET_COMMENT_COUNT_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};