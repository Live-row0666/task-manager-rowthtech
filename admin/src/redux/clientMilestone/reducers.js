import ClientMilestoneTypes from './constant';

const INIT = { data: [], loading: false, message: '' };

export const addClientMilestoneReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientMilestoneTypes.ADD_CLIENT_MILESTONE_LOADING: return { data: [], loading: true };
        case ClientMilestoneTypes.ADD_CLIENT_MILESTONE_SUCCESS: return { data: action.payload, loading: false };
        case ClientMilestoneTypes.ADD_CLIENT_MILESTONE_RESET:   return { data: [], loading: false };
        case ClientMilestoneTypes.ADD_CLIENT_MILESTONE_ERROR:   return { data: [], loading: false, message: action.payload };
        default: return { ...state };
    }
};

export const getClientMilestonesReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientMilestoneTypes.GET_CLIENT_MILESTONES_LOADING: return { data: [], loading: true };
        case ClientMilestoneTypes.GET_CLIENT_MILESTONES_SUCCESS: return { data: action.payload, loading: false };
        case ClientMilestoneTypes.GET_CLIENT_MILESTONES_ERROR:   return { data: [], loading: false, message: action.payload };
        default: return { ...state };
    }
};

export const addClientTaskReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientMilestoneTypes.ADD_CLIENT_TASK_LOADING: return { data: [], loading: true };
        case ClientMilestoneTypes.ADD_CLIENT_TASK_SUCCESS: return { data: action.payload, loading: false };
        case ClientMilestoneTypes.ADD_CLIENT_TASK_RESET:   return { data: [], loading: false };
        case ClientMilestoneTypes.ADD_CLIENT_TASK_ERROR:   return { data: [], loading: false, message: action.payload };
        default: return { ...state };
    }
};

export const getClientTasksReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientMilestoneTypes.GET_CLIENT_TASKS_LOADING: return { data: [], loading: true };
        case ClientMilestoneTypes.GET_CLIENT_TASKS_SUCCESS: return { data: action.payload, loading: false };
        case ClientMilestoneTypes.GET_CLIENT_TASKS_ERROR:   return { data: [], loading: false, message: action.payload };
        default: return { ...state };
    }
};

export const updateClientTaskReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientMilestoneTypes.UPDATE_CLIENT_TASK_LOADING: return { data: [], loading: true };
        case ClientMilestoneTypes.UPDATE_CLIENT_TASK_SUCCESS: return { data: action.payload, loading: false };
        case ClientMilestoneTypes.UPDATE_CLIENT_TASK_RESET:   return { data: [], loading: false };
        case ClientMilestoneTypes.UPDATE_CLIENT_TASK_ERROR:   return { data: [], loading: false, message: action.payload };
        default: return { ...state };
    }
};

export const updateClientMilestoneReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_LOADING: return { data: [], loading: true };
        case ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_SUCCESS: return { data: action.payload, loading: false };
        case ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_RESET:   return { data: [], loading: false };
        case ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_ERROR:   return { data: [], loading: false, message: action.payload };
        default: return { ...state };
    }
};
