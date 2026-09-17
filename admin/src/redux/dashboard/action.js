import DashboardTypes from "./constant";
type AuthAction = { type: string, payload: {} | string };

export const getGlobalSearch = (data): AuthAction => ({
    type: DashboardTypes.GET_GLOBAL_SEARCH,
    payload: data
})