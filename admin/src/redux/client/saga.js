import { call, put, takeEvery } from 'redux-saga/effects';
import { CLIENT_CONSTANTS } from './constant';
import { clientAPI } from './api';
import ToastHandle from '../../constants/toaster/toaster';

function* getClientsSaga(action) {
    try {
        const response = yield call(clientAPI.getClients, action.payload);
        yield put({ type: CLIENT_CONSTANTS.GET_CLIENTS_SUCCESS, payload: response.data });
    } catch (error) {
        yield put({ type: CLIENT_CONSTANTS.GET_CLIENTS_FAILURE, payload: error.message });
        ToastHandle('error', error.message);
    }
}

function* createClientSaga(action) {
    try {
        const response = yield call(clientAPI.createClient, action.payload);
        yield put({ type: CLIENT_CONSTANTS.CREATE_CLIENT_SUCCESS, payload: response.data });
        yield call(getClientsSaga, { payload: { page: 1, projectType: action.payload.projectType } });
        ToastHandle('success', 'Client created successfully');
    } catch (error) {
        yield put({ type: CLIENT_CONSTANTS.CREATE_CLIENT_FAILURE, payload: error.message });
        ToastHandle('error', error.message);
    }
}

function* updateClientSaga(action) {
    try {
        const { id, data } = action.payload;
        const response = yield call(clientAPI.updateClient, id, data);
        yield put({ type: CLIENT_CONSTANTS.UPDATE_CLIENT_SUCCESS, payload: response.data });
        yield call(getClientsSaga, { payload: { page: 1, projectType: localStorage.getItem('selectedDepartment') } });
        ToastHandle('success', 'Client updated successfully');
    } catch (error) {
        yield put({ type: CLIENT_CONSTANTS.UPDATE_CLIENT_FAILURE, payload: error.message });
        ToastHandle('error', error.message);
    }
}

function* deleteClientSaga(action) {
    try {
        yield call(clientAPI.deleteClient, action.payload);
        yield put({ type: CLIENT_CONSTANTS.DELETE_CLIENT_SUCCESS, payload: action.payload });
        yield call(getClientsSaga, { payload: { page: 1, projectType: localStorage.getItem('selectedDepartment') } });
        ToastHandle('success', 'Client deleted successfully');
    } catch (error) {
        yield put({ type: CLIENT_CONSTANTS.DELETE_CLIENT_FAILURE, payload: error.message });
        ToastHandle('error', error.message);
    }
}

function* sendInvitationSaga(action) {
    try {
        const response = yield call(
            clientAPI.sendInvitation,
            action.payload
        );

        ToastHandle("success", response.data.message);

        yield put({
            type: CLIENT_CONSTANTS.SEND_INVITATION_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        console.log(error, "xcvcbnvxcbnv")
        ToastHandle(
            "error",
            error?.response?.data?.message || error.message
        );

        yield put({
            type: CLIENT_CONSTANTS.SEND_INVITATION_FAILURE,
            payload: error.message,
        });
    }
}
export function* clientSaga() {
    yield takeEvery(CLIENT_CONSTANTS.GET_CLIENTS_REQUEST, getClientsSaga);
    yield takeEvery(CLIENT_CONSTANTS.CREATE_CLIENT_REQUEST, createClientSaga);
    yield takeEvery(CLIENT_CONSTANTS.UPDATE_CLIENT_REQUEST, updateClientSaga);
    yield takeEvery(CLIENT_CONSTANTS.DELETE_CLIENT_REQUEST, deleteClientSaga);
     yield takeEvery(
        CLIENT_CONSTANTS.SEND_INVITATION_REQUEST,
        sendInvitationSaga
    );
}