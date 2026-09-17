import { call, put, takeEvery } from 'redux-saga/effects';
import * as types from './constant';
import * as api from './api';
import ToastHandle from '../../constants/toaster/toaster';

function* getMeetingsSaga(action) {
    try {
        const { filters, page, limit } = action.payload;
        const response = yield call(api.getMeetings, filters, page, limit);
        yield put({ type: types.GET_MEETINGS_SUCCESS, payload: response.data });
    } catch (error) {
        yield put({ type: types.GET_MEETINGS_FAILURE, payload: error.message });
    }
}

function* createMeetingSaga(action) {
    try {
        const response = yield call(api.createMeeting, action.payload);
        yield put({ type: types.CREATE_MEETING_SUCCESS, payload: response.data });
        ToastHandle('success', 'Meeting created successfully');
    } catch (error) {
        ToastHandle('error', error);
        yield put({ type: types.CREATE_MEETING_FAILURE, payload: error.message });
    }
}

function* updateMeetingSaga(action) {
    try {
        const { meetingId, meetingData } = action.payload;
        const response = yield call(api.updateMeeting, meetingId, meetingData);
        yield put({ type: types.UPDATE_MEETING_SUCCESS, payload: response.data });
    } catch (error) {
        yield put({ type: types.UPDATE_MEETING_FAILURE, payload: error.message });
    }
}

function* deleteMeetingSaga(action) {
    try {
        const { meetingId, deleteData } = action.payload;
        yield call(api.deleteMeeting, meetingId, deleteData);
        yield put({ type: types.DELETE_MEETING_SUCCESS, payload: meetingId });
    } catch (error) {
        yield put({ type: types.DELETE_MEETING_FAILURE, payload: error.message });
    }
}

function* getMeetingsByProjectSaga(action) {
    try {
        const response = yield call(api.getMeetingsByProject, action.payload);
        yield put({ type: types.GET_MEETINGS_BY_PROJECT_SUCCESS, payload: response.data });
    } catch (error) {
        yield put({ type: types.GET_MEETINGS_BY_PROJECT_FAILURE, payload: error.message });
    }
}

export default function* meetingSaga() {
    yield takeEvery(types.GET_MEETINGS_REQUEST, getMeetingsSaga);
    yield takeEvery(types.CREATE_MEETING_REQUEST, createMeetingSaga);
    yield takeEvery(types.UPDATE_MEETING_REQUEST, updateMeetingSaga);
    yield takeEvery(types.DELETE_MEETING_REQUEST, deleteMeetingSaga);
    yield takeEvery(types.GET_MEETINGS_BY_PROJECT_REQUEST, getMeetingsByProjectSaga);
}