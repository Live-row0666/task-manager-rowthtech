// @flow
import { all, fork, put, takeEvery, call } from 'redux-saga/effects';

import {
    login as loginApi,
    logout as logoutApi,
    signup as signupApi,
    forgotPassword as forgotPasswordApi,
    forgotPasswordConfirm,
} from '../../helpers/';
import axios from 'axios';
import { APICore, setAuthorization } from '../../helpers/api/apiCore';
import { authApiResponseSuccess, authApiResponseError } from './actions';
import { AuthActionTypes } from './constants';
import { toast } from 'react-toastify';

const api = new APICore();

/**
 * Login the user
 * @param {*} payload - username and password
 */

function* login({ payload: { username, password, rememberMe } }) {
    try {
        const response = yield call(loginApi, { email: username, password: password, flag: 'admin', rememberMe: rememberMe, roleId: '' });
        if (response?.data?.status === 200) {
            const userData = {
                id: response?.data?.user?.id,
                username: response?.data?.user?.name,
                email: response?.data?.user?.email,
                role: response?.data?.user?.role,
                token: response?.data?.token,
                profilePic: response?.data?.user?.profilePicture,
            };

            // Set user data in both storage and authorization header
            api.setLoggedInUser(userData);
            setAuthorization(response?.data?.token);

            yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, userData));
        } else {
            const errorMessage = response?.data?.message || 'Login failed';
            yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMessage));
            api.setLoggedInUser(null);
            setAuthorization(null);
        }
    } catch (error) {
        toast.error(error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Network error occurred';
        yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMessage));
        api.setLoggedInUser(null);
        setAuthorization(null);
    }
}
function* getUserStats({ payload: { userId, month } }) {
    try {

        const response = yield call(
            axios.get,
            `/api/v1/admin/user/${userId}/stats?month=${month}`
        );

        yield put(
            authApiResponseSuccess(
                AuthActionTypes.GET_USER_STATS,
                response.data
            )
        );

    } catch (error) {

        yield put(
            authApiResponseError(
                AuthActionTypes.GET_USER_STATS,
                error?.response?.data?.message || error.message
            )
        );

    }
}
/**
 * Logout the user
 */

function* logout() {
    try {
        // Call logout API if available
        try {
            yield call(logoutApi);
        } catch (apiError) {
            // Continue with logout even if API call fails
            console.warn('Logout API call failed:', apiError);
        }
        // Clear all auth data
        api.setLoggedInUser(null);
        setAuthorization(null);

        // Clear specific auth keys instead of all storage
        localStorage.removeItem('hyper_user');
        localStorage.clear();
        localStorage.clear();
        localStorage.removeItem('hyper_user');
        localStorage.removeItem('roleId');

        yield put(authApiResponseSuccess(AuthActionTypes.LOGOUT_USER, {}));
    } catch (error) {
        api.setLoggedInUser(null);
        setAuthorization(null);
        localStorage.removeItem('hyper_user');
        localStorage.removeItem('hyper_user');

        yield put(authApiResponseError(AuthActionTypes.LOGOUT_USER, error?.message || 'Logout failed'));
    }
}

function* signup({ payload: { fullname, email, password } }) {
    try {
        const response = yield call(signupApi, { fullname, email, password });
        const user = response.data;
        // api.setLoggedInUser(user);
        // setAuthorization(user['token']);
        yield put(authApiResponseSuccess(AuthActionTypes.SIGNUP_USER, user));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.SIGNUP_USER, error));
        api.setLoggedInUser(null);
        setAuthorization(null);
    }
}

function* forgotPassword({ payload: { username } }) {
    try {
        const response = yield call(forgotPasswordApi, { username });
        yield put(authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD, response.data));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD, error));
    }
}

function* forgotPasswordChange({ payload: { data } }) {
    try {
        const response = yield call(forgotPasswordConfirm, data);
        yield put(authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD_CHANGE, response.data));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD_CHANGE, error));
    }
}

export function* watchLoginUser(): any {
    yield takeEvery(AuthActionTypes.LOGIN_USER, login);
}

export function* watchLogout(): any {
    yield takeEvery(AuthActionTypes.LOGOUT_USER, logout);
}

export function* watchSignup(): any {
    yield takeEvery(AuthActionTypes.SIGNUP_USER, signup);
}

export function* watchForgotPassword(): any {
    yield takeEvery(AuthActionTypes.FORGOT_PASSWORD, forgotPassword);
}

export function* watchForgotPasswordChange(): any {
    yield takeEvery(AuthActionTypes.FORGOT_PASSWORD_CHANGE, forgotPasswordChange);
}
export function* watchGetUserStats(): any {
    yield takeEvery(
        AuthActionTypes.GET_USER_STATS,
        getUserStats
    );
}
function* authSaga(): any {
    yield all([
        fork(watchLoginUser),
        fork(watchLogout),
        fork(watchSignup),
        fork(watchForgotPassword),
        fork(watchForgotPasswordChange),
        fork(watchGetUserStats),
    ]);
}

export default authSaga;
