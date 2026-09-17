import SprintTypes from "./constant";
type AuthAction = { type: string, payload: {} | string };


export const addSprint = (data): AuthAction => ({
    type: SprintTypes.ADD_SPRINT,
    payload: data,
})
export const getAllSprint = (data): AuthAction => ({
    type: SprintTypes.GET_ALL_SPRINT,
    payload: data
})
//start single springt------------------
export const getSingleSprint = (data): AuthAction => ({
    type: SprintTypes.GET_ALL_SINGLE_SPRINT,
    payload: data
})

export const getSprintForTaskAction = (data): AuthAction => ({
    type: SprintTypes.GET_SPRINT_FOR_TASK,
    payload: data
})
//end single springt------------------
export const deleteSprint = (data): AuthAction => ({
    type: SprintTypes.DELETE_SPRINT,
    payload: data
})

export const updateSprint = (data): AuthAction => ({
    type: SprintTypes.UPDATE_SPRINT,
    payload: data
})
export const getSprintId = (data): AuthAction => ({
    type: "sprintId",
    payload: data
})