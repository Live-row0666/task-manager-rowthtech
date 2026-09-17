import TECHNOLOGY_TYPES from "./constant";

type AuthAction = { type: string, payload: {} | string };



export const createTechnologyCategory = (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_CATEGORY,
    payload: data
})

export const getAllTechnologyCategory= (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_CATEGORY,
    payload: data
})
export const updateTechnologyCategory= (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_CATEGORY,
    payload: data
})
export const deleteTechnologyCategory= (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY,
    payload: data
})

export const createTechnology = (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY,
    payload: data
})

export const getAllTechnology= (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.GET_TECHNOLOGY,
    payload: data
})
export const updateTechnology= (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY,
    payload: data
})
export const deleteTechnology = (data): AuthAction => ({
    type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY,
    payload: data
})

