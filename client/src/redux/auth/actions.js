import { AuthActionTypes } from './constants';

export const authApiResponseSuccess = (actionType: string, data: any): any => ({
    type: AuthActionTypes.API_RESPONSE_SUCCESS,
    payload: { actionType, data },
});

export const authApiResponseError = (actionType: string, error: string): any => ({
    type: AuthActionTypes.API_RESPONSE_ERROR,
    payload: { actionType, error },
});

export const loginUser = (username: string, password: string, rememberMe: Boolean): any => ({
    type: AuthActionTypes.LOGIN_USER,
    payload: { username, password, rememberMe },
});

export const logoutUser = (): any => ({
    type: AuthActionTypes.LOGOUT_USER,
    payload: {},
});

export const signupUser = (fullname: string, email: string, password: string): any => ({
    type: AuthActionTypes.SIGNUP_USER,
    payload: { fullname, email, password },
});

export const forgotPassword = (email: string): any => ({
    type: AuthActionTypes.FORGOT_PASSWORD,
    payload: { email },
});

export const forgotPasswordChange = (email: string): any => ({
    type: AuthActionTypes.FORGOT_PASSWORD_CHANGE,
    payload: { email },
});

export const resetAuth = (): any => ({
    type: AuthActionTypes.RESET,
    payload: {},
});
export const resetPassword = (token, password) => ({
    type: AuthActionTypes.RESET_PASSWORD,
    payload: {
        token,
        password,
    },
});
export const getDashboard = (projectId = ""): any => ({
    type: AuthActionTypes.GET_DASHBOARD,
    payload: { projectId },
});

export const getClientMilestonesAction = (projectId = "", isActive = true): any => ({
    type: AuthActionTypes.GET_CLIENT_MILESTONES,
    payload: { projectId, isActive },
});

export const getClientTasksAction = (params: any = ""): any => ({
    type: AuthActionTypes.GET_CLIENT_TASKS,
    payload: typeof params === 'string' ? { milestoneId: params } : (params || {}),
});