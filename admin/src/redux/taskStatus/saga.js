import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import TaskStatusTypes from './constant';
import { createTaskStatusApi, editTaskStatusApi, getAllTaskStatusesApi } from './api';

function* getAllTaskStatusesFunction({ payload }) {
    try {
        yield put({
            type: TaskStatusTypes.GET_ALL_TASK_STATUS_LOADING,
            payload: {}
        })
        const response = yield call(getAllTaskStatusesApi, { payload });
        if (response.status === 200) {
            yield put({
                type: TaskStatusTypes.GET_ALL_TASK_STATUS_SUCCESS,
                payload: { ...response.data },
            });
        }
        else {
            yield put({
                type: TaskStatusTypes.GET_ALL_TASK_STATUS_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TaskStatusTypes.GET_ALL_TASK_STATUS_ERROR,
            payload: error
        });

    }
}

function* createTaskStatusFunction({ payload }) {
    try {
        yield put({
            type: TaskStatusTypes.CREATE_TASK_STATUS_LOADING,
            payload: {}
        })
        const response = yield call(createTaskStatusApi, { payload });
        if (response.status === 201) {
            yield put({
                type: TaskStatusTypes.CREATE_TASK_STATUS_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TaskStatusTypes.CREATE_TASK_STATUS_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TaskStatusTypes.CREATE_TASK_STATUS_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TaskStatusTypes.CREATE_TASK_STATUS_ERROR,
            payload: error
        });

    }
}

function* editTaskStatusFunction({ payload }) {
    try {
        yield put({
            type: TaskStatusTypes.EDIT_TASK_STATUS_LOADING,
            payload: {}
        })
        const response = yield call(editTaskStatusApi, { payload });
        if (response.status === 200) {
            yield put({
                type: TaskStatusTypes.EDIT_TASK_STATUS_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TaskStatusTypes.EDIT_TASK_STATUS_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TaskStatusTypes.EDIT_TASK_STATUS_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TaskStatusTypes.EDIT_TASK_STATUS_ERROR,
            payload: error
        });

    }
}

export function* getAllTaskStatuses(): any {
    yield takeEvery(TaskStatusTypes.GET_ALL_TASK_STATUS, getAllTaskStatusesFunction);
}

export function* createTaskStatuses(): any {
    yield takeEvery(TaskStatusTypes.CREATE_TASK_STATUS, createTaskStatusFunction);
}

export function* editTaskStatuses(): any {
    yield takeEvery(TaskStatusTypes.EDIT_TASK_STATUS, editTaskStatusFunction);
}

function* TaskStatusesSaga(): any {
    yield all([
        fork(getAllTaskStatuses),
        fork(createTaskStatuses),
        fork(editTaskStatuses),
    ])
}

export default TaskStatusesSaga;