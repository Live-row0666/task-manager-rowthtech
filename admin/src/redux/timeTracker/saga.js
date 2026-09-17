import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import { getTimeTrackerApi, getUserRecordApi } from './api';
import TIME_TRACKER_TYPES from './constant'
function* getTimeTrackerFunction() {
    try {
        yield put({
            type: TIME_TRACKER_TYPES.GET_TIME_TRACKER_LOADING,
            payload: {}
        })
        const response = yield call(getTimeTrackerApi);
        if (response.data.status) {
            yield put({
                type: TIME_TRACKER_TYPES.GET_TIME_TRACKER_SUCCESS,
                payload: response,
            });
        }
        else {
            yield put({
                type: TIME_TRACKER_TYPES.GET_TIME_TRACKER_ERROR,
                payload: response
            });
        }
    } catch (error) {
        yield put({
            type: TIME_TRACKER_TYPES.GET_TIME_TRACKER_ERROR,
            payload: { message: error?.message }
        });
    }
}

function* getUserRecordFunction({ payload }) {
    try {
        yield put({
            type: TIME_TRACKER_TYPES.GET_USER_RECORD_LOADING,
            payload: {}
        })
        const response = yield call(getUserRecordApi, { payload });
        if (response.data.status) {
            yield put({
                type: TIME_TRACKER_TYPES.GET_USER_RECORD_SUCCESS,
                payload: { ...response.data },
            });
        }
        else {
            yield put({
                type: TIME_TRACKER_TYPES.GET_USER_RECORD_ERROR,
                payload: { ...response.data },
            });
        }
    }
    catch (error) {
        yield put({
            type: TIME_TRACKER_TYPES.GET_USER_RECORD_ERROR,
            payload: { message: error?.message }
        });
    }
}

export function* getTimeTrackersaga(): any {
    yield takeEvery(TIME_TRACKER_TYPES.GET_TIME_TRACKER_FIRST, getTimeTrackerFunction);
}

export function* getUserRecordsaga(): any {
    yield takeEvery(TIME_TRACKER_TYPES.GET_USER_RECORD, getUserRecordFunction)
}

function* AllTimeTrackerSaga(): any {
    yield all([
        fork(getTimeTrackersaga),
        fork(getUserRecordsaga)
    ])
}

export default AllTimeTrackerSaga;
