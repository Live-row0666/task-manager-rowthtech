import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import { login as loginApi, logout as logoutApi, forgotPassword as forgotPasswordApi, forgotPasswordConfirm, getDashboard as getDashboardApi, getClientMilestones as getClientMilestonesApi, getClientTasks as getClientTasksApi } from '../../helpers';
import { APICore, setAuthorization } from '../../helpers/api/apiCore';
import { authApiResponseSuccess, authApiResponseError } from './actions';
import { AuthActionTypes } from './constants';
import { toast } from 'react-toastify';

const api = new APICore();

function* login({ payload: { username, password, rememberMe } }) {
    try {
        const response = yield call(loginApi, { email: username, password: password, rememberMe: rememberMe });
        if (response?.data?.status === 200) {
            const userData = {
                id: response?.data?.user?.id || response?.data?.user?._id,
                username: response?.data?.user?.name,
                email: response?.data?.user?.email,
                role: response?.data?.user?.role,
                token: response?.data?.token,
                profilePic: response?.data?.user?.profilePicture || null,
            };

            // Set user data in both storage and authorization header
            api.setLoggedInUser(userData);
            setAuthorization(response?.data?.token);

            yield put(authApiResponseSuccess(AuthActionTypes.LOGIN_USER, userData));
            toast.success('Login successful!');
        } else {
            const errorMessage = response?.data?.message || 'Login failed';
            yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMessage));
            api.setLoggedInUser(null);
            setAuthorization(null);
            toast.error(errorMessage);
        }
    } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || error || 'Network error occurred';
        yield put(authApiResponseError(AuthActionTypes.LOGIN_USER, errorMessage));
        api.setLoggedInUser(null);
        setAuthorization(null);
        toast.error(errorMessage);
    }
}

function* logout() {
    try {
        try {
            yield call(logoutApi);
        } catch (apiError) {
            console.warn('Logout API call failed:', apiError);
        }

        api.setLoggedInUser(null);
        setAuthorization(null);

        localStorage.removeItem('hyper_user');
        localStorage.clear();
        localStorage.removeItem('roleId');

        yield put(authApiResponseSuccess(AuthActionTypes.LOGOUT_USER, {}));
    } catch (error) {
        api.setLoggedInUser(null);
        setAuthorization(null);
        localStorage.removeItem('hyper_user');
        localStorage.removeItem('roleId');

        yield put(authApiResponseError(AuthActionTypes.LOGOUT_USER, error?.message || 'Logout failed'));
    }
}

function* forgotPassword({ payload: { email } }) {
    try {
        const response = yield call(forgotPasswordApi, { email: email });
        
        if (response?.data?.status === 200) {
            yield put(authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD, response.data));
            toast.success(response.data?.message || 'Password reset link sent to your email!');
        } else {
            const errorMessage = response?.data?.message || 'Failed to send reset link';
            yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD, errorMessage));
            toast.error(errorMessage);
        }
    } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || error || 'Error occurred while sending reset link';
        yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD, errorMessage));
        toast.error(errorMessage);
    }
}

function* resetPasswordSaga({ payload: { token, password } }) {
    try {
        const response = yield call(forgotPasswordConfirm, {
            token,
            password,
        });
        if (response?.data?.status === 200) {
            yield put(
                authApiResponseSuccess(
                    AuthActionTypes.RESET_PASSWORD,
                    response.data
                )
            );

            toast.success(response.data.message);
        } else {
            yield put(
                authApiResponseError(
                    AuthActionTypes.RESET_PASSWORD,
                    response.data.message
                )
            );

            toast.error(response.data.message);
        }
    } catch (error) {
        yield put(
            authApiResponseError(
                AuthActionTypes.RESET_PASSWORD,
                error
            )
        );

        toast.error(error);
    }
}

function* forgotPasswordChange({ payload: { data } }) {
    try {
        const response = yield call(forgotPasswordConfirm, data);
        if (response?.data?.status === 200) {
            yield put(authApiResponseSuccess(AuthActionTypes.FORGOT_PASSWORD_CHANGE, response.data));
            toast.success(response.data?.message || 'Password reset confirmed!');
        } else {
            const errorMessage = response?.data?.message || 'Failed to reset password';
            yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD_CHANGE, errorMessage));
            toast.error(errorMessage);
        }
    } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || error || 'Error resetting password';
        yield put(authApiResponseError(AuthActionTypes.FORGOT_PASSWORD_CHANGE, errorMessage));
        toast.error(errorMessage);
    }
}
function* getDashboardSaga({ payload }) {
    try {
        const response = yield call(
            getDashboardApi,
            payload?.projectId || ""
        );

        yield put(
            authApiResponseSuccess(
                AuthActionTypes.GET_DASHBOARD,
                response.data
            )
        );
    } catch (error) {
        yield put(
            authApiResponseError(
                AuthActionTypes.GET_DASHBOARD,
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            )
        );
    }
}

export function* watchLoginUser() {
    yield takeEvery(AuthActionTypes.LOGIN_USER, login);
}

export function* watchLogout() {
    yield takeEvery(AuthActionTypes.LOGOUT_USER, logout);
}

export function* watchForgotPassword() {
    yield takeEvery(AuthActionTypes.FORGOT_PASSWORD, forgotPassword);
}

export function* watchForgotPasswordChange() {
    yield takeEvery(AuthActionTypes.FORGOT_PASSWORD_CHANGE, forgotPasswordChange);
}
export function* watchResetPassword() {
    yield takeEvery(
        AuthActionTypes.RESET_PASSWORD,
        resetPasswordSaga
    );
}
export function* watchDashboard() {
    yield takeEvery(AuthActionTypes.GET_DASHBOARD, getDashboardSaga);
}

function* getClientMilestonesSaga({ payload }) {
    try {
        const response = yield call(getClientMilestonesApi, payload?.projectId || '', payload?.isActive ?? true);
        yield put(authApiResponseSuccess(AuthActionTypes.GET_CLIENT_MILESTONES, response.data));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.GET_CLIENT_MILESTONES, error?.response?.data?.message || error?.message || 'Something went wrong'));
    }
}

function* getClientTasksSaga({ payload }) {
    try {
        const response = yield call(getClientTasksApi, payload?.milestoneId || '');
        yield put(authApiResponseSuccess(AuthActionTypes.GET_CLIENT_TASKS, response.data));
    } catch (error) {
        yield put(authApiResponseError(AuthActionTypes.GET_CLIENT_TASKS, error?.response?.data?.message || error?.message || 'Something went wrong'));
    }
}

export function* watchClientMilestones() {
    yield takeEvery(AuthActionTypes.GET_CLIENT_MILESTONES, getClientMilestonesSaga);
}

export function* watchClientTasks() {
    yield takeEvery(AuthActionTypes.GET_CLIENT_TASKS, getClientTasksSaga);
}

function* authSaga() {
    yield all([
        fork(watchLoginUser),
        fork(watchLogout),
        fork(watchForgotPassword),
        fork(watchForgotPasswordChange),
        fork(watchResetPassword),
        fork(watchDashboard),           
        fork(watchClientMilestones),
        fork(watchClientTasks),
    ]);
}

export default authSaga;
