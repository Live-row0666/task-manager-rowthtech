import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import ClientProjectTypes from './constant';
import { addClientProjectApi, getClientProjectsApi } from './api';

function* addClientProjectFunction({ payload }) {
    try {
        yield put({ type: ClientProjectTypes.ADD_CLIENT_PROJECT_LOADING, payload: {} });
        const response = yield call(addClientProjectApi, { payload });
        if (response.data.status === 201) {
            toast.success(response.data.message || 'Client Project created successfully!');
            yield put({ type: ClientProjectTypes.ADD_CLIENT_PROJECT_SUCCESS, payload: { ...response.data } });
            yield put({ type: ClientProjectTypes.ADD_CLIENT_PROJECT_RESET, payload: {} });
            // Auto-refresh client projects list after adding
            yield put({ type: ClientProjectTypes.GET_CLIENT_PROJECTS, payload: { page: 1, limit: 100 } });
        } else {
            toast.error(response.data.message || 'Something went wrong');
            yield put({ type: ClientProjectTypes.ADD_CLIENT_PROJECT_ERROR, payload: { ...response.data } });
            yield put({ type: ClientProjectTypes.ADD_CLIENT_PROJECT_RESET, payload: {} });
        }
    } catch (error) {
        toast.error(error?.message || 'Something went wrong');
        yield put({ type: ClientProjectTypes.ADD_CLIENT_PROJECT_ERROR, payload: { message: error?.message } });
        yield put({ type: ClientProjectTypes.ADD_CLIENT_PROJECT_RESET, payload: {} });
    }
}

function* getClientProjectsFunction({ payload }) {
    try {
        yield put({ type: ClientProjectTypes.GET_CLIENT_PROJECTS_LOADING, payload: {} });
        const response = yield call(getClientProjectsApi, { payload });
        if (response.data.status) {
            yield put({ type: ClientProjectTypes.GET_CLIENT_PROJECTS_SUCCESS, payload: { ...response.data } });
        } else {
            yield put({ type: ClientProjectTypes.GET_CLIENT_PROJECTS_ERROR, payload: { ...response.data } });
        }
    } catch (error) {
        yield put({ type: ClientProjectTypes.GET_CLIENT_PROJECTS_ERROR, payload: { message: error?.message } });
    }
}

function* addClientProjectSaga() {
    yield takeEvery(ClientProjectTypes.ADD_CLIENT_PROJECT, addClientProjectFunction);
}
function* getClientProjectsSaga() {
    yield takeEvery(ClientProjectTypes.GET_CLIENT_PROJECTS, getClientProjectsFunction);
}

function* AllClientProjectSaga() {
    yield all([fork(addClientProjectSaga), fork(getClientProjectsSaga)]);
}

export default AllClientProjectSaga;
