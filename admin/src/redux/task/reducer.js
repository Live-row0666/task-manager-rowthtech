
import TASK_TYPES from "./constant";
const INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}

const GET_SINGLE_SPRINTTASK_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const GET_All_TASK_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const UPDATE_TASK_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const UPDATE_STATUS_TASK_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const DELETE_TASK_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const STATUS_TASK_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const ADD_COMMENT__INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const GET_COMMENT__INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const GET_BUGS_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
};
const GET_SUBTASK = {
    data: [],
    loading: false,
    message: ""
};
const DELETE_COMMENT__INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const UPDATE_COMMENT__INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}
const ASSIGN_USER_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}

const REPORTER_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}

const GET_HISTORY = {
    data: [],
    loading: false,
    message: ""
}

const GET_PROJECT_FOR_TASKS_INITIAL_STATE = {
    data: [],
    loading: false,
    message: ""
}


export const createTaskReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.CREATE_TASK_LOADING:
            return {
                data: INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.CREATE_TASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.CREATE_TASK_RESET:
            return {
                data: INITIAL_STATE.data,
                loading: false,
            };
        case TASK_TYPES.CREATE_TASK_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const UpdateTaskReducer = (state = UPDATE_TASK_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.UPDATE_TASK_LOADING:
            return {
                data: UPDATE_TASK_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.UPDATE_TASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.UPDATE_TASK_RESET:
            return {
                data: UPDATE_TASK_INITIAL_STATE.data,
                loading: false,
            }

        case TASK_TYPES.UPDATE_TASK_ERROR:
            return {
                data: action.payload,
                loading: false,
            };
        default:
            return { ...state };

    }
};



export const AddCommentReducer = (state = ADD_COMMENT__INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.ADD_COMMENT_LOADING:
            return {
                data: ADD_COMMENT__INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.ADD_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.ADD_COMMENT_RESET:
            return {
                data: ADD_COMMENT__INITIAL_STATE.data,
                loading: false,
            };
        case TASK_TYPES.ADD_COMMENT_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};



export const createSubTaskReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.CREATE_SUBTASK_LOADING:
            return {
                data: INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.CREATE_SUBTASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.CREATE_SUBTASK_RESET:
            return {
                data: INITIAL_STATE.data,
                loading: false,
            };
        case TASK_TYPES.CREATE_SUBTASK_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getSigleSprintTask = (state = GET_SINGLE_SPRINTTASK_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_SINGLE_SPRINT_TASK_LOADING:
            return {
                data: GET_SINGLE_SPRINTTASK_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.GET_SINGLE_SPRINT_TASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case TASK_TYPES.GET_SINGLE_SPRINT_TASK_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getAllTaskReducer = (state = GET_All_TASK_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_ALL_TASK_LOADING:
            return {
                data: GET_All_TASK_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.GET_ALL_TASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case TASK_TYPES.GET_ALL_TASK_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const deleteTask = (state = DELETE_TASK_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.DELETE_TASK_LOADING:
            return {
                data: DELETE_TASK_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.DELETE_TASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.DELETE_TASK_RESET:
            return {
                data: DELETE_TASK_INITIAL_STATE.data,
                loading: false
            }

        case TASK_TYPES.DELETE_TASK_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const updateTaskStatus = (state = UPDATE_STATUS_TASK_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.UPDATE_TASK_STATU_LOADING:
            return {
                data: UPDATE_STATUS_TASK_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.UPDATE_TASK_STATU_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.UPDATE_TASK_STATU_RESET:
            return {
                data: UPDATE_STATUS_TASK_INITIAL_STATE.data,
                loading: false
            }

        case TASK_TYPES.UPDATE_TASK_STATU_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const TaskStatusReducer = (state = STATUS_TASK_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.TASK_STATUS_LOADING:
            return {
                data: STATUS_TASK_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.TASK_STATUS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.TASK_STATUS_RESET:
            return {
                data: STATUS_TASK_INITIAL_STATE.data,
                loading: false
            }

        case TASK_TYPES.TASK_STATUS_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getComment = (state = GET_COMMENT__INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_COMMENT_LOADING:
            return {
                data: GET_COMMENT__INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.GET_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.GET_COMMENT_RESET:
            return {
                data: GET_COMMENT__INITIAL_STATE.data,
                loading: false
            }

        case TASK_TYPES.GET_COMMENT_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getBugsReducer = (state = GET_BUGS_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_BUGS_LOADING:
            return {
                data: GET_BUGS_INITIAL_STATE.data,
                loading: true
            };
        case TASK_TYPES.GET_BUGS_SUCCESS:
            return {
                data: action?.payload,
                loading: false
            };
        case TASK_TYPES.GET_BUGS_RESET:
            return {
                data: GET_BUGS_INITIAL_STATE,
                loading: false
            };
        case TASK_TYPES.GET_BUGS_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };;
        default:
            return { ...state };
    }
};
export const getSubTaskReducer = (state = GET_SUBTASK, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_SUBTASK_LOADING:
            return {
                data: GET_SUBTASK.data,
                loading: true
            };
        case TASK_TYPES.GET_SUBTASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false
            };
        case TASK_TYPES.GET_SUBTASK_RESET:
            return {
                data: GET_SUBTASK,
                loading: false
            };
        case TASK_TYPES.GET_SUBTASK_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const deleteCommentReducer = (state = DELETE_COMMENT__INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.DELETE_COMMENT_LOADING:
            return {
                data: DELETE_COMMENT__INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.DELETE_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.DELETE_COMMENT_RESET:
            return {
                data: DELETE_COMMENT__INITIAL_STATE.data,
                loading: false
            }

        case TASK_TYPES.DELETE_COMMENT_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const updateCommentReducer = (state = UPDATE_COMMENT__INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.UPDATE_COMMENT_LOADING:
            return {
                data: UPDATE_COMMENT__INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.UPDATE_COMMENT_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.UPDATE_COMMENT_RESET:
            return {
                data: UPDATE_COMMENT__INITIAL_STATE.data,
                loading: false
            }

        case TASK_TYPES.UPDATE_COMMENT_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};
export const getTaskId = (state = { data: "" }, action) => {
    switch (action.type) {
        case "taskid":
            return {
                data: action.payload,

            };

        default:
            return { ...state };

    }
};
export const getAssignUserReducer = (state = ASSIGN_USER_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_ASSIGN_USER_LOADING:
            return {
                data: ASSIGN_USER_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.GET_ASSIGN_USER_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };

        // case TASK_TYPES.GET_ASSIGN_USER_RESET:
        //     return {
        //         data: ASSIGN_USER_INITIAL_STATE.data,
        //         loading: false
        //     }
        case TASK_TYPES.GET_ASSIGN_USER_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getReporterReducer = (state = REPORTER_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_ALL_REPORTER_LOADING:
            return {
                data: REPORTER_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.GET_ALL_REPORTER_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };

        // case TASK_TYPES.GET_ASSIGN_USER_RESET:
        //     return {
        //         data: REPORTER_INITIAL_STATE.data,
        //         loading: false
        //     }
        case TASK_TYPES.GET_ALL_REPORTER_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };

    }
};

export const getHistoryReducer = (state = GET_HISTORY, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_HISTORY_LOADING:
            return {
                data: GET_HISTORY.data,
                loading: true
            };
        case TASK_TYPES.GET_HISTORY_SUCCESS:
            return {
                data: action?.payload,
                loading: false
            };
        case TASK_TYPES.GET_HISTORY_RESET:
            return {
                data: GET_HISTORY,
                loading: false
            };
        case TASK_TYPES.GET_HISTORY_ERROR:
            return {
                data: [],
                status: !200,
                loading: false,
                message: action?.payload,
            };;
        default:
            return { ...state };
    }
};

export const getprojectForTasks = (state = GET_PROJECT_FOR_TASKS_INITIAL_STATE, action) => {
    switch (action.type) {
        case TASK_TYPES.GET_PROJECT_FOR_TASKS_LOADING:
            return {
                data: GET_PROJECT_FOR_TASKS_INITIAL_STATE.data,
                loading: true,
            };
        case TASK_TYPES.GET_PROJECT_FOR_TASKS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case TASK_TYPES.GET_PROJECT_FOR_TASKS_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};