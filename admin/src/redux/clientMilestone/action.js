import ClientMilestoneTypes from './constant';

export const addClientMilestone = (data) => ({
    type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE,
    payload: data,
});

export const getClientMilestones = (data) => ({
    type: ClientMilestoneTypes.GET_CLIENT_MILESTONES,
    payload: data,
});

export const addClientTask = (data) => ({
    type: ClientMilestoneTypes.ADD_CLIENT_TASK,
    payload: data,
});

export const getClientTasks = (data) => ({
    type: ClientMilestoneTypes.GET_CLIENT_TASKS,
    payload: data,
});

export const updateClientTask = (data) => ({
    type: ClientMilestoneTypes.UPDATE_CLIENT_TASK,
    payload: data,
});

export const updateClientMilestone = (data) => ({
    type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE,
    payload: data,
});
