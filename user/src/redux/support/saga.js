import { all, fork, put, takeEvery, call } from 'redux-saga/effects';

import SUPPORT_TYPES from './constant';
import { getAllTicketsApi, createTicketApi, updateTicketApi, updateTicketResponseApi, getTicketByIdApi } from './api';

function* getAllTicketsFunction({ payload }) {
    try {
        yield put({
            type: SUPPORT_TYPES.GET_ALL_TICKETS_LOADING,
            payload: {},
        });
        const response = yield call(getAllTicketsApi, { payload });

        if (response.data.status) {
            yield put({
                type: SUPPORT_TYPES.GET_ALL_TICKETS_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: SUPPORT_TYPES.GET_ALL_TICKETS_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: SUPPORT_TYPES.GET_ALL_TICKETS_ERROR,
            payload: { message: error?.message },
        });
    }
}

function* createTicketFunction({ payload }) {
    try {
        yield put({
            type: SUPPORT_TYPES.CREATE_TICKET_LOADING,
            payload: {},
        });
        const response = yield call(createTicketApi, { payload });
        if (response.data.status) {
            yield put({
                type: SUPPORT_TYPES.CREATE_TICKET_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: SUPPORT_TYPES.CREATE_TICKET_RESET,
                payload: {},
            });
        } else {
            yield put({
                type: SUPPORT_TYPES.CREATE_TICKET_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: SUPPORT_TYPES.CREATE_TICKET_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: SUPPORT_TYPES.CREATE_TICKET_RESET,
            payload: {},
        });
    }
}

function* updateTicketFunction({ payload }) {
    try {
        yield put({
            type: SUPPORT_TYPES.UPDATE_TICKET_LOADING,
            payload: {},
        });
        const response = yield call(updateTicketApi, { payload });
        if (response.data.status) {
            yield put({
                type: SUPPORT_TYPES.UPDATE_TICKET_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: SUPPORT_TYPES.UPDATE_TICKET_RESET,
                payload: {},
            });
        } else {
            yield put({
                type: SUPPORT_TYPES.UPDATE_TICKET_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: SUPPORT_TYPES.UPDATE_TICKET_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: SUPPORT_TYPES.UPDATE_TICKET_RESET,
            payload: {},
        });
    }
}

function* updateTicketResponseFunction({ payload }) {
    try {
        yield put({
            type: SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_LOADING,
            payload: {},
        });
        const response = yield call(updateTicketResponseApi, { payload });
        console.log(response,'123456789')
        if (response.data.status) {
            yield put({
                type: SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_RESET,
                payload: {},
            });
        } else {
            yield put({
                type: SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_ERROR,
            payload: { message: error?.message },
        });
        yield put({
            type: SUPPORT_TYPES.UPDATE_TICKET_RESPONSE_RESET,
            payload: {},
        });
    }
}

function* getTicketByIdFunction({ payload }) {
    try {
        console.log('getTicketByIdFunction called with payload:', payload);
        yield put({
            type: SUPPORT_TYPES.GET_TICKET_BY_ID_LOADING,
            payload: {},
        });
        const response = yield call(getTicketByIdApi, { payload });
        console.log('API response for getTicketById:', response);
        console.log('Response data:', response.data);

        if (response.data.status) {
            console.log('Success response, dispatching success action');
            yield put({
                type: SUPPORT_TYPES.GET_TICKET_BY_ID_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            console.log('Error response from API:', response.data);
            yield put({
                type: SUPPORT_TYPES.GET_TICKET_BY_ID_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        console.error('Exception in getTicketByIdFunction:', error);
        yield put({
            type: SUPPORT_TYPES.GET_TICKET_BY_ID_ERROR,
            payload: { message: error?.message },
        });
    }
}

export function* getAllTicketsSaga(): any {
    yield takeEvery(SUPPORT_TYPES.GET_ALL_TICKETS, getAllTicketsFunction);
}

export function* createTicketSaga(): any {
    yield takeEvery(SUPPORT_TYPES.CREATE_TICKET, createTicketFunction);
}

export function* updateTicketSaga(): any {
    yield takeEvery(SUPPORT_TYPES.UPDATE_TICKET, updateTicketFunction);
}

export function* updateTicketResponseSaga(): any {
    yield takeEvery(SUPPORT_TYPES.UPDATE_TICKET_RESPONSE, updateTicketResponseFunction);
}

export function* getTicketByIdSaga(): any {
    yield takeEvery(SUPPORT_TYPES.GET_TICKET_BY_ID, getTicketByIdFunction);
}

function* SupportSaga(): any {
    yield all([
        fork(getAllTicketsSaga),
        fork(createTicketSaga),
        fork(updateTicketSaga),
        fork(updateTicketResponseSaga),
        fork(getTicketByIdSaga),
    ]);
}

export default SupportSaga;
