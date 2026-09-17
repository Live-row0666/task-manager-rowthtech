import MileStoneType from "./constant";
type AuthAction = { type: string, payload: {} | string };


export const addAllmilstones = (data): AuthAction => ({
    type: MileStoneType.ADD_ALL_MILESTONES,
    payload: data
})

export const getallMileStones = (data): AuthAction => ({
    type: MileStoneType.GET_ALL_MILESTONES,
    payload: data
})

export const getMileStoneById = (data): AuthAction => ({
    type: MileStoneType.GET_ALL_MILESTONE_BY_ID,
    payload: data
})
export const deleteMileStone = (data): AuthAction => ({
    type: MileStoneType.DELETE_MILE_STONE,
    payload: data
})
export const updateMileStone = (data): AuthAction => ({
    type: MileStoneType.UPDATE_MILESTONE,
    payload: data
})
export const getsingleMileStone = (data): AuthAction => ({
    type: MileStoneType.GET_SINGLE_MILESTONE,
    payload: data
})
export const getMilestoneForTaskAction = (data): AuthAction => ({
    type: MileStoneType.GET_MILESTONE_FOR_TASK,
    payload: data
})


export const getMilestonetId = (data): AuthAction => ({
    type: "milestoneId",
    payload: data
})

export const getProjectTasksAction = (data): AuthAction => ({
    type: MileStoneType.GET_PROJECT_TASKS,
    payload: data
})