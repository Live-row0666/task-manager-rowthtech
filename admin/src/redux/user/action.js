import ALL_USERS from "./constant";
type AuthAction = { type: string, payload: {} | string };

export const getAllUsers = (data): AuthAction => ({
    type: ALL_USERS.GET_ALL_USERS,
    payload: data
})
export const getAllCategory = (data): AuthAction => ({
    type: ALL_USERS.GET_ALL_CATEGORY,
    payload: data
})
export const deleteUser = (data): AuthAction => ({
    type: ALL_USERS.DELETE_USER,
    payload: data
})
export const inviteUser = (data): AuthAction => ({
    type: ALL_USERS.CREATE_USER,
    payload: data
})
export const updateUser = (data): AuthAction => ({
    type: ALL_USERS.UPDATE_USER,
    payload: data
})
export const getAllRoles = (data): AuthAction => ({
    type: ALL_USERS.GET_ALL_ROLES,
    payload: data
})
export const getCSVdata = (data): AuthAction => ({
    type: ALL_USERS.GET_CSV_DATA,
    payload: data
})

export const getuserTasks = (data): AuthAction => ({
    type: ALL_USERS.GET_USER_TASKS,
    payload: data
})

export const getUserByIdAction = (data): AuthAction => ({
    type: ALL_USERS.GET_USER_BY_ID,
    payload: data
})