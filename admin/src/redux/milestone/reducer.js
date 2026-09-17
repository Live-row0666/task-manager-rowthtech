import MileStoneType from "./constant";

const GET_ALL_MILESTONE_INTIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const ADD_ALL_MILESTONE_INTIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_MILESTONE_INTIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const DELETE_MILESTONE_INTIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const UPDATE_MILESTONE_INTIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_SINGLE_MILESTONE_INTIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
const GET_MILESTIONE_FOR_TASK_INITIAL = {
    data: [],
    message: "",
    loading: false
}



const GET_PROJECT_TASKS_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}
export const getAllMileStones = (state = GET_ALL_MILESTONE_INTIAL_STATE, action) => {
    switch (action.type) {
        case MileStoneType.GET_ALL_MILESTONES_LOADING:
            return {
                data: GET_ALL_MILESTONE_INTIAL_STATE.data,
                loading: true,
            };
        case MileStoneType.GET_ALL_MILESTONES_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case MileStoneType.GET_ALL_MILESTONES_ERROR:
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

export const getProjectTasks = (state = GET_PROJECT_TASKS_INITIAL_STATE, action) => {
    switch (action.type) {
        case MileStoneType.GET_PROJECT_TASKS_LOADING:
            return {
                data: GET_PROJECT_TASKS_INITIAL_STATE.data,
                loading: true,
            };
        case MileStoneType.GET_PROJECT_TASKS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case MileStoneType.GET_PROJECT_TASKS_ERROR:
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

export const addAllmilstones = (state = ADD_ALL_MILESTONE_INTIAL_STATE, action) => {
    switch (action.type) {
        case MileStoneType.ADD_ALL_MILESTONES_LOADING:
            return {
                data: [],
                loading: true,
            };
        case MileStoneType.ADD_ALL_MILESTONES_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case MileStoneType.ADD_ALL_MILESTONES_RESET:
            return {
                data: [],
                loading: false,
            };
        case MileStoneType.ADD_ALL_MILESTONES_ERROR:
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
export const deleteMileStone = (state = DELETE_MILESTONE_INTIAL_STATE, action) => {
    switch (action.type) {
        case MileStoneType.DELETE_MILE_STONE_LOADING:
            return {
                data: DELETE_MILESTONE_INTIAL_STATE.data,
                loading: true,
            };
        case MileStoneType.DELETE_MILE_STONE_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case MileStoneType.DELETE_MILE_STONE_RESET:
            return {
                data: DELETE_MILESTONE_INTIAL_STATE.data,
                loading: false
            }

        case MileStoneType.DELETE_MILE_STONE_ERROR:
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
export const getMileStone = (state = GET_MILESTONE_INTIAL_STATE, action) => {
    switch (action.type) {
        case MileStoneType.GET_ALL_MILESTONE_BY_ID_LOADING:
            return {
                data: GET_MILESTONE_INTIAL_STATE.data,
                loading: true,
            };
        case MileStoneType.GET_ALL_MILESTONE_BY_ID_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case MileStoneType.GET_ALL_MILESTONE_BY_ID_ERROR:
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
export const updateMilestone = (state = UPDATE_MILESTONE_INTIAL_STATE, action) => {
    switch (action.type) {
        case MileStoneType.UPDATE_MILESTONE_LOADING:
            return {
                data: UPDATE_MILESTONE_INTIAL_STATE.data,
                loading: true,
            };
        case MileStoneType.UPDATE_MILESTONE_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case MileStoneType.UPDATE_MILESTONE_RESET:
            return {
                data: UPDATE_MILESTONE_INTIAL_STATE.data,
                loading: false
            }

        case MileStoneType.UPDATE_MILESTONE_ERROR:
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
export const getSigleMileStone = (state = GET_SINGLE_MILESTONE_INTIAL_STATE, action) => {
    switch (action.type) {
        case MileStoneType.GET_SINGLE_MILESTONE_LOADING:
            return {
                data: GET_SINGLE_MILESTONE_INTIAL_STATE.data,
                loading: true,
            };
        case MileStoneType.GET_SINGLE_MILESTONE_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case MileStoneType.GET_SINGLE_MILESTONE_ERROR:
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

export const getMilestoneForTaskReducer = (state = GET_MILESTIONE_FOR_TASK_INITIAL, action) => {
    switch (action.type) {
        case MileStoneType.GET_MILESTONE_FOR_TASK_LOADING:
            return {
                data: GET_MILESTIONE_FOR_TASK_INITIAL.data,
                loading: true,
            };
        case MileStoneType.GET_MILESTONE_FOR_TASK_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };


        case MileStoneType.GET_MILESTONE_FOR_TASK_ERROR:
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


export const getMilestoneId = (state = { data: "" }, action) => {
    switch (action.type) {
        case "milestoneId":
            return {
                data: action.payload,

            };

        default:
            return { ...state };

    }
};