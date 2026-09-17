import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import DashboardTypes from './constant';
import { getGlobalSearchApi } from './api';

function* getGlobalSearchFunction({ payload }) {
    try {
        yield put({
            type: DashboardTypes.GET_GLOBAL_SEARCH_LOADING,
            payload: {}
        })
        const response = yield call(getGlobalSearchApi, { payload });
        if (response.data.status) {
            yield put({
                type: DashboardTypes.GET_GLOBAL_SEARCH_SUCCESS,
                payload: { ...response.data },
            });
        }
        else {
            yield put({
                type: DashboardTypes.GET_GLOBAL_SEARCH_ERROR,
                payload: { ...response.data }
            });
        }
    } catch (error) {
        yield put({
            type: DashboardTypes.GET_GLOBAL_SEARCH_ERROR,
            payload: { message: error?.message }
        });
    }
}

export function* getGlobalSearchSaga(): any {
    yield takeEvery(DashboardTypes.GET_GLOBAL_SEARCH, getGlobalSearchFunction);
}

function* AllDashboardSaga(): any {
    yield all([
        fork(getGlobalSearchSaga),
    ])
}

export default AllDashboardSaga;