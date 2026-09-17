import ProjectTypes from "./constant";
type AuthAction = { type: string, payload: {} | string };


export const addProject = (data): AuthAction => ({
    type: ProjectTypes.ADD_PROJECT,
    payload: data
})
export const getAllProjects = (data): AuthAction => ({
    type: ProjectTypes.GET_PROJECT,
    payload: data
})
export const getProjectsCount = (data): AuthAction => ({
    type: ProjectTypes.GET_PROJECTS_COUNT,
    payload: data
})
export const getProjectId = (data): AuthAction => ({
    type: "projectId",
    payload: data
})
export const updateProject = (data): AuthAction => ({
    type: ProjectTypes.UPDATE_PROJECT_DETAILS,
    payload: data
})
export const deleteProject = (data): AuthAction => ({
    type: ProjectTypes.DELETE_PROJECT_DETAILS,
    payload: data
})

export const getProjectsById = (data): AuthAction => ({
    type: ProjectTypes.GET_PROJECT_BY_ID,
    payload: data
})
export const getprojectUsers = (data): AuthAction => ({
    type: ProjectTypes.GET_PROJECT_USERS,
    payload: data
})
export const getProjectTimeSpentAction = (data): AuthAction => ({
    type: ProjectTypes.GET_PROJECT_TIME_SPENT,
    payload: data
})