import DashboardTypes from "./constant";

const GET_GLOBAL_SEARCH_INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

export const getGlobalSearchReducer = (state = GET_GLOBAL_SEARCH_INITIAL_STATE, action) => {
    switch (action.type) {
        case DashboardTypes.GET_GLOBAL_SEARCH_LOADING:
            return {
                data: GET_GLOBAL_SEARCH_INITIAL_STATE.data,
                loading: true,
            };
        case DashboardTypes.GET_GLOBAL_SEARCH_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case DashboardTypes.GET_GLOBAL_SEARCH_RESET:
            return {
                data: GET_GLOBAL_SEARCH_INITIAL_STATE.data,
                loading: false,
            };
        case DashboardTypes.GET_GLOBAL_SEARCH_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};