import * as types from './constant';

export const getMeetings = (filters = {}, page = 1, limit = 20) => ({
    type: types.GET_MEETINGS_REQUEST,
    payload: { filters, page, limit }
});

export const createMeeting = (meetingData) => ({
    type: types.CREATE_MEETING_REQUEST,
    payload: meetingData
});

export const updateMeeting = (meetingId, meetingData) => ({
    type: types.UPDATE_MEETING_REQUEST,
    payload: { meetingId, meetingData }
});

export const deleteMeeting = (meetingId, deleteData = {}) => ({
    type: types.DELETE_MEETING_REQUEST,
    payload: { meetingId, deleteData }
});

export const getMeetingsByProject = (projectId) => ({
    type: types.GET_MEETINGS_BY_PROJECT_REQUEST,
    payload: projectId
});