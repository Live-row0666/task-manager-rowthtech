import ProjectCommentTypes from "./constant";
type AuthAction = { type: string, payload: {} | string };


export const addProjectCommentAction = (data): AuthAction => ({
    type: ProjectCommentTypes.ADD_PROJECT_COMMENT,
    payload: data
})
export const getProjectCommentAction = (data): AuthAction => ({
    type: ProjectCommentTypes.GET_PROJECT_COMMENT,
    payload: data
})
export const deleteProjectCommentAction = (data): AuthAction => ({
    type: ProjectCommentTypes.DELETE_PROJECT_COMMENT,
    payload: data
})
export const updateProjectCommentAction = (data): AuthAction => ({
    type: ProjectCommentTypes.UPDATE_PROJECT_COMMENT,
    payload: data
})

export const getCommentCountAction = (data): AuthAction => ({
    type: ProjectCommentTypes.GET_COMMENT_COUNT,
    payload: data
})
