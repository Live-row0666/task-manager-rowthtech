import ClientRepository from "./constant";
type AuthAction = { type: string, payload: {} | string };
export const getAllProjectsName= (data): AuthAction => ({
    type: ClientRepository.GET_PROJECT_NAME,
    payload: data
})
export const uploadProjectDetail= (data): AuthAction => ({
    type: ClientRepository.UPLOAD_PROJECT_DETAIL,
    payload: data
})
export const getuploadProjectDetailAction= (data): AuthAction => ({
    type: ClientRepository.GET_UPLOAD_PROJECT_DETAIL,
    payload: data
})