import TaskStatusTypes from "./constant";
type AuthAction = { type: string, payload: {} | string };

export const getAllTaskStatusesAction = (data): AuthAction => ({
    type: TaskStatusTypes.GET_ALL_TASK_STATUS,
    payload: data
})

export const createTaskStatusAction = (data): AuthAction => ({
    type: TaskStatusTypes.CREATE_TASK_STATUS,
    payload: data
})

export const editTaskStatusAction = (data): AuthAction => ({
    type: TaskStatusTypes.EDIT_TASK_STATUS,
    payload: data
})