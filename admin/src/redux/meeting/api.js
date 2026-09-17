import { APICore } from '../../helpers/api/apiCore';

const api = new APICore();

const getMeetings = (filters, page = 1, limit = 20) => {
    const params = new URLSearchParams({ ...filters, page, limit }).toString();
    return api.get(`api/v1/admin/meeting?${params}`);
};

const createMeeting = (meetingData) => {
    return api.create('api/v1/admin/meeting', meetingData);
};

const updateMeeting = (meetingId, meetingData) => {
    return api.update(`api/v1/admin/meeting/${meetingId}`, meetingData);
};

// const deleteMeeting = (meetingId, deleteData = {}) => {
//     return api.deleteWithData(`api/v1/admin/meeting/${meetingId}`, deleteData);
// };

const getMeetingsByProject = (projectId) => {
    return api.get(`api/v1/admin/meeting/project/${projectId}`, {});
};

const deleteMeeting = (meetingId, deleteData = {}) => {
    return api.create(`api/v1/admin/meeting/${meetingId}/delete`, deleteData);
};

export { getMeetings, createMeeting, updateMeeting, deleteMeeting, getMeetingsByProject };