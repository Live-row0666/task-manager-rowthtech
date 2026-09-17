// @flow
import { all, fork, put, takeEvery, call } from 'redux-saga/effects';

import {
    login as loginApi,
    logout as logoutApi,
    signup as signupApi,
    forgotPassword as forgotPasswordApi,
    forgotPasswordConfirm,
} from '../../helpers/';

import { APICore, setAuthorization } from '../../helpers/api/apiCore';
import { authApiResponseSuccess, authApiResponseError } from './actions';
import { AuthActionTypes } from './constants';
import { toast } from 'react-toastify';

const api = new APICore();

/**
 * Login the user
 * @param {*} payload - username and password
 */

function* login({ payload: { username, password } }) {
    try {
        const response = yield call(loginApi, { email: username, password: password, flag: 'admin', roleId: '' });
        if (response?.data?.status === 200) {
            const userData = {
                id: response?.data?.user?.id,
                username: response?.data?.user?.name,
                email: response?.data?.user?.email,
                role: response?.data?.user?.role,
                loginTime:response?.data?.user?.loginTime,
                token: response?.data?.token,
                profilePic: response?.data?.user?.profilePicture,
            };
            api.setLoggedInUser(userData);
            setAuthorization(response?.data?.token);
            yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, userData));
        } else {
            yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, response?.data?.message));
            api.setLoggedInUser(null);
            setAuthorization(null);
        }
    } catch (error) {
        toast.error(error)
        yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, error?.message));
        api.setLoggedInUser(null);
        setAuthorization(null);
    }
}

/**
 * Logout the user
 */
function* logout() {
    try {
        console.log("jkkjjkkjjkjkkjkjjkkj")
        yield call(logoutApi);
        api.setLoggedInUser(null);
        setAuthorization(null);
        yield put(authApiResponseSuccess(AuthActionTypes.LOGOUT_USER, {}));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.LOGOUT_USER, error));
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

function* authSaga(): any {
    yield all([
        fork(watchLoginUser),
        fork(watchLogout),
        fork(watchSignup),
        fork(watchForgotPassword),
        fork(watchForgotPasswordChange),
    ]);
}

export default authSaga;
