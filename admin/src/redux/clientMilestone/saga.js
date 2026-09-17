import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import ClientMilestoneTypes from './constant';
import {
    addClientMilestoneApi,
    getClientMilestonesApi,
    addClientTaskApi,
    getClientTasksApi,
    updateClientTaskApi,
    updateClientMilestoneApi,
} from './api';

function* addClientMilestoneFunction({ payload }) {
    try {
        yield put({ type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE_LOADING, payload: {} });
        const response = yield call(addClientMilestoneApi, { payload });
        if (response.data.status === 201) {
            toast.success(response.data.message || 'Client Milestone created successfully!');
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE_SUCCESS, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE_RESET, payload: {} });
        } else {
            toast.error(response.data.message || 'Something went wrong');
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE_ERROR, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE_RESET, payload: {} });
        }
    } catch (error) {
        toast.error(error?.message || 'Something went wrong');
        yield put({ type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE_ERROR, payload: { message: error?.message } });
        yield put({ type: ClientMilestoneTypes.ADD_CLIENT_MILESTONE_RESET, payload: {} });
    }
}

function* getClientMilestonesFunction({ payload }) {
    try {
        yield put({ type: ClientMilestoneTypes.GET_CLIENT_MILESTONES_LOADING, payload: {} });
        const response = yield call(getClientMilestonesApi, { payload });
        if (response.data.status) {
            yield put({ type: ClientMilestoneTypes.GET_CLIENT_MILESTONES_SUCCESS, payload: { ...response.data } });
        } else {
            yield put({ type: ClientMilestoneTypes.GET_CLIENT_MILESTONES_ERROR, payload: { ...response.data } });
        }
    } catch (error) {
        yield put({ type: ClientMilestoneTypes.GET_CLIENT_MILESTONES_ERROR, payload: { message: error?.message } });
    }
}

function* addClientTaskFunction({ payload }) {
    try {
        yield put({ type: ClientMilestoneTypes.ADD_CLIENT_TASK_LOADING, payload: {} });
        const response = yield call(addClientTaskApi, { payload });
        if (response.data.status === 201) {
            toast.success(response.data.message || 'Client Task created successfully!');
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_TASK_SUCCESS, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_TASK_RESET, payload: {} });
        } else {
            toast.error(response.data.message || 'Something went wrong');
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_TASK_ERROR, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.ADD_CLIENT_TASK_RESET, payload: {} });
        }
    } catch (error) {
        toast.error(error?.message || 'Something went wrong');
        yield put({ type: ClientMilestoneTypes.ADD_CLIENT_TASK_ERROR, payload: { message: error?.message } });
        yield put({ type: ClientMilestoneTypes.ADD_CLIENT_TASK_RESET, payload: {} });
    }
}

function* getClientTasksFunction({ payload }) {
    try {
        yield put({ type: ClientMilestoneTypes.GET_CLIENT_TASKS_LOADING, payload: {} });
        const response = yield call(getClientTasksApi, { payload });
        if (response.data.status) {
            yield put({ type: ClientMilestoneTypes.GET_CLIENT_TASKS_SUCCESS, payload: { ...response.data } });
        } else {
            yield put({ type: ClientMilestoneTypes.GET_CLIENT_TASKS_ERROR, payload: { ...response.data } });
        }
    } catch (error) {
        yield put({ type: ClientMilestoneTypes.GET_CLIENT_TASKS_ERROR, payload: { message: error?.message } });
    }
}

function* updateClientTaskFunction({ payload }) {
    try {
        yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_TASK_LOADING, payload: {} });
        const response = yield call(updateClientTaskApi, { payload });
        if (response.data.status === 200) {
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_TASK_SUCCESS, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_TASK_RESET, payload: {} });
        } else {
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_TASK_ERROR, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_TASK_RESET, payload: {} });
        }
    } catch (error) {
        yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_TASK_ERROR, payload: { message: error?.message } });
        yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_TASK_RESET, payload: {} });
    }
}

function* updateClientMilestoneFunction({ payload }) {
    try {
        yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_LOADING, payload: {} });
        const response = yield call(updateClientMilestoneApi, { payload });
        if (response.data.status === 200) {
            toast.success('Milestone updated successfully!');
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_SUCCESS, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_RESET,   payload: {} });
        } else {
            toast.error(response.data.message || 'Something went wrong');
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_ERROR, payload: { ...response.data } });
            yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_RESET, payload: {} });
        }
    } catch (error) {
        toast.error(error?.message || 'Something went wrong');
        yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_ERROR, payload: { message: error?.message } });
        yield put({ type: ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE_RESET, payload: {} });
    }
}

function* addClientMilestoneSaga()    { yield takeEvery(ClientMilestoneTypes.ADD_CLIENT_MILESTONE,    addClientMilestoneFunction); }
function* getClientMilestonesSaga()   { yield takeEvery(ClientMilestoneTypes.GET_CLIENT_MILESTONES,   getClientMilestonesFunction); }
function* addClientTaskSaga()         { yield takeEvery(ClientMilestoneTypes.ADD_CLIENT_TASK,         addClientTaskFunction); }
function* getClientTasksSaga()        { yield takeEvery(ClientMilestoneTypes.GET_CLIENT_TASKS,        getClientTasksFunction); }
function* updateClientTaskSaga()      { yield takeEvery(ClientMilestoneTypes.UPDATE_CLIENT_TASK,      updateClientTaskFunction); }
function* updateClientMilestoneSaga() { yield takeEvery(ClientMilestoneTypes.UPDATE_CLIENT_MILESTONE, updateClientMilestoneFunction); }

function* AllClientMilestoneSaga() {
    yield all([
        fork(addClientMilestoneSaga),
        fork(getClientMilestonesSaga),
        fork(addClientTaskSaga),
        fork(getClientTasksSaga),
        fork(updateClientTaskSaga),
        fork(updateClientMilestoneSaga),
    ]);
}

export default AllClientMilestoneSaga;
