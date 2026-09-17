import { APICore } from '../../helpers/api/apiCore';

const api = new APICore();

export const clientAPI = {
    getClients: (params) => api.get('api/v1/admin/client', params),
    createClient: (data) => api.create('api/v1/admin/client', data),
    updateClient: (id, data) => api.update(`api/v1/admin/client/${id}`, data),
    deleteClient: (id) => api.delete(`api/v1/admin/client/${id}`),
     sendInvitation: (data) =>
    api.create("api/v1/admin/client/send-invitation", data),
};