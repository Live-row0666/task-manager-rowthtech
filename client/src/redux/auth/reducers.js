import { AuthActionTypes } from './constants';
import { APICore } from '../../helpers/api/apiCore';

const api = new APICore();

const INIT_STATE = {
    user: api.getLoggedInUser() || null,
    loading: false,
    error: null,
    userLoggedIn: false,
    dashboard: null,
    clientMilestones: [],
    clientMilestonesLoading: false,
    clientTasks: [],
    clientTasksLoading: false,
      resetPasswordSuccess: null,
};

const Auth = (state = INIT_STATE, action) => {
    switch (action.type) {

        case AuthActionTypes.API_RESPONSE_SUCCESS:
            switch (action.payload.actionType) {

                case AuthActionTypes.LOGIN_USER:
                    return {
                        ...state,
                        user: action.payload.data,
                        userLoggedIn: true,
                        loading: false,
                        error: null,
                    };

                case AuthActionTypes.SIGNUP_USER:
                    return {
                        ...state,
                        loading: false,
                        userSignUp: true,
                        error: null,
                    };

                case AuthActionTypes.LOGOUT_USER:
                    return {
                        ...state,
                        user: null,
                        loading: false,
                        userLogout: true,
                        userLoggedIn: false,
                        error: null,
                    };

                case AuthActionTypes.FORGOT_PASSWORD:
                    return {
                        ...state,
                        resetPasswordSuccess: action.payload.data,
                        loading: false,
                        passwordReset: true,
                        error: null,
                    };

                case AuthActionTypes.FORGOT_PASSWORD_CHANGE:
                    return {
                        ...state,
                        loading: false,
                        passwordChange: true,
                        error: null,
                    };
case AuthActionTypes.RESET_PASSWORD:
    return {
        ...state,
          loading: true,
        resetPasswordSuccess: action.payload.data,
        error: null,
    };
                case AuthActionTypes.GET_DASHBOARD:
                    return {
                        ...state,
                        loading: false,
                        dashboard: action.payload.data,
                        error: null,
                    };

                case AuthActionTypes.GET_CLIENT_MILESTONES:
                    return {
                        ...state,
                        clientMilestonesLoading: false,
                        clientMilestones: action.payload.data?.data || [],
                        error: null,
                    };

                case AuthActionTypes.GET_CLIENT_TASKS:
                    return {
                        ...state,
                        clientTasksLoading: false,
                        clientTasks: action.payload.data?.data || [],
                        error: null,
                    };

                default:
                    return state;
            }

        case AuthActionTypes.API_RESPONSE_ERROR:
            switch (action.payload.actionType) {

                case AuthActionTypes.LOGIN_USER:
                    return {
                        ...state,
                        error: action.payload.error,
                        userLoggedIn: false,
                        loading: false,
                    };

                case AuthActionTypes.SIGNUP_USER:
                    return {
                        ...state,
                        registerError: action.payload.error,
                        userSignUp: false,
                        loading: false,
                    };

                case AuthActionTypes.FORGOT_PASSWORD:
                    return {
                        ...state,
                        error: action.payload.error,
                        loading: false,
                        passwordReset: false,
                    };

                case AuthActionTypes.FORGOT_PASSWORD_CHANGE:
                    return {
                        ...state,
                        error: action.payload.error,
                        loading: false,
                        passwordChange: false,
                    };

                    case AuthActionTypes.RESET_PASSWORD:
    return {
        ...state,
        loading: false,
        error: action.payload.error,
        resetPasswordSuccess: null,
    };

                case AuthActionTypes.GET_DASHBOARD:
                    return {
                        ...state,
                        error: action.payload.error,
                        loading: false,
                    };

                case AuthActionTypes.GET_CLIENT_MILESTONES:
                    return { ...state, clientMilestonesLoading: false, error: action.payload.error };

                case AuthActionTypes.GET_CLIENT_TASKS:
                    return { ...state, clientTasksLoading: false, error: action.payload.error };

                default:
                    return state;
            }

        case AuthActionTypes.LOGIN_USER:
            return {
                ...state,
                loading: true,
                userLoggedIn: false,
                error: null,
            };

        case AuthActionTypes.LOGOUT_USER:
            return {
                ...state,
                loading: true,
                userLogout: false,
                error: null,
            };

        case AuthActionTypes.SIGNUP_USER:
            return {
                ...state,
                loading: true,
                userSignUp: false,
                error: null,
            };

        case AuthActionTypes.FORGOT_PASSWORD:
            return {
                ...state,
                loading: true,
                passwordReset: false,
                error: null,
            };

        case AuthActionTypes.FORGOT_PASSWORD_CHANGE:
            return {
                ...state,
                loading: true,
                passwordChange: false,
                error: null,
            };

        case AuthActionTypes.GET_DASHBOARD:
            return { ...state, loading: true, error: null };

        case AuthActionTypes.GET_CLIENT_MILESTONES:
            return { ...state, clientMilestonesLoading: true, error: null };

        case AuthActionTypes.GET_CLIENT_TASKS:
            return { ...state, clientTasksLoading: true, error: null };

        case AuthActionTypes.RESET:
            return {
                ...state,
                loading: false,
                error: null,
                userSignUp: false,
                userLoggedIn: false,
                passwordReset: false,
                passwordChange: false,
                resetPasswordSuccess: null,
                dashboard: null,
            };

        default:
            return state;
    }
};

export default Auth;