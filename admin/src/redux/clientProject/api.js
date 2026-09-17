import { APICore } from '../../helpers/api/apiCore';

const api = new APICore();
const BASE = '/api/v1/admin/client-project';

export function addClientProjectApi(data) {
    return api.create(BASE, data.payload);
}

export function getClientProjectsApi(data) {
    const { page = 1, limit = 50, search = '', projectType = '' } = data?.payload || {};
    // projectType filter optional - agar empty hai toh sab projects aayenge
    const query = `page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${projectType ? `&projectType=${projectType}` : ''}`;
    return api.get(`${BASE}?${query}`);
}
