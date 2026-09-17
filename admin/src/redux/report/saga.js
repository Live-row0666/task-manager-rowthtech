import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import ReportTypes from './constant';
import { 
    getEmployeeDailyLogsApi, 
    getMonthlySummaryApi, 
    getProjectDailySummaryApi, 
    getProjectTeamViewApi 
} from './api';

// Employee Daily Logs Saga
function* getEmployeeDailyLogsFunction({ payload }) {
    try {
        const response = yield call(getEmployeeDailyLogsApi, { payload });

        if (response?.data?.status === 200) {
            yield put({
                type: ReportTypes.GET_EMPLOYEE_DAILY_LOGS_SUCCESS,
                payload: response?.data,
            });
        } else {
            yield put({
                type: ReportTypes.GET_EMPLOYEE_DAILY_LOGS_ERROR,
                payload: response?.data?.message || 'Error fetching employee daily logs'
            });
        }
    } catch (error) {
        yield put({
            type: ReportTypes.GET_EMPLOYEE_DAILY_LOGS_ERROR,
            payload: error?.message || 'Network error'
        });
    }
}

// Monthly Summary Saga
function* getMonthlySummaryFunction({ payload }) {
    try {
        const response = yield call(getMonthlySummaryApi, { payload });

        if (response?.data?.status === 200) {
            yield put({
                type: ReportTypes.GET_MONTHLY_SUMMARY_SUCCESS,
                payload: response?.data,
            });
        } else {
            yield put({
                type: ReportTypes.GET_MONTHLY_SUMMARY_ERROR,
                payload: response?.data?.message || 'Error fetching monthly summary'
            });
        }
    } catch (error) {
        yield put({
            type: ReportTypes.GET_MONTHLY_SUMMARY_ERROR,
            payload: error?.message || 'Network error'
        });
    }
}

// Project Daily Summary Saga
function* getProjectDailySummaryFunction({ payload }) {
    try {
        const response = yield call(getProjectDailySummaryApi, { payload });

        if (response?.data?.status === 200) {
            yield put({
                type: ReportTypes.GET_PROJECT_DAILY_SUMMARY_SUCCESS,
                payload: response?.data,
            });
        } else {
            yield put({
                type: ReportTypes.GET_PROJECT_DAILY_SUMMARY_ERROR,
                payload: response?.data?.message || 'Error fetching project daily summary'
            });
        }
    } catch (error) {
        yield put({
            type: ReportTypes.GET_PROJECT_DAILY_SUMMARY_ERROR,
            payload: error?.message || 'Network error'
        });
    }
}

// Project Team View Saga
function* getProjectTeamViewFunction({ payload }) {
    try {
        const response = yield call(getProjectTeamViewApi, { payload });

        if (response?.data?.status === 200) {
            yield put({
                type: ReportTypes.GET_PROJECT_TEAM_VIEW_SUCCESS,
                payload: response?.data,
            });
        } else {
            yield put({
                type: ReportTypes.GET_PROJECT_TEAM_VIEW_ERROR,
                payload: response?.data?.message || 'Error fetching project team view'
            });
        }
    } catch (error) {
        yield put({
            type: ReportTypes.GET_PROJECT_TEAM_VIEW_ERROR,
            payload: error?.message || 'Network error'
        });
    }
}

// Watchers
export function* getEmployeeDailyLogsSaga() {
    yield takeEvery(ReportTypes.GET_EMPLOYEE_DAILY_LOGS, getEmployeeDailyLogsFunction);
}

export function* getMonthlySummarySaga() {
    yield takeEvery(ReportTypes.GET_MONTHLY_SUMMARY, getMonthlySummaryFunction);
}

export function* getProjectDailySummarySaga() {
    yield takeEvery(ReportTypes.GET_PROJECT_DAILY_SUMMARY, getProjectDailySummaryFunction);
}

export function* getProjectTeamViewSaga() {
    yield takeEvery(ReportTypes.GET_PROJECT_TEAM_VIEW, getProjectTeamViewFunction);
}

function* AllReportSaga() {
    yield all([
        fork(getEmployeeDailyLogsSaga),
        fork(getMonthlySummarySaga),
        fork(getProjectDailySummarySaga),
        fork(getProjectTeamViewSaga),
    ])
}

export default AllReportSaga;