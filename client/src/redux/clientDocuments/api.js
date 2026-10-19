import { APICore } from '../../helpers/api/apiCore';
const api = new APICore();

const DOCUMENT_BASE = '/api/v1/admin/documents';

/* ===========================
   Get Clients
=========================== */

export function getClientsApi() {
    return api.get(`${DOCUMENT_BASE}/clients`);
}

/* ===========================
   Get Projects By Client
=========================== */

export function getProjectsApi(data) {
    const { clientId } = data || {};

    return api.get(`${DOCUMENT_BASE}/projects/${clientId}`);
}

/* ===========================
   Upload Documents
=========================== */

export function uploadDocumentsApi(formData) {
  return api.createWithFileDocument(
    '/api/v1/client/client-documents/upload',
    formData
  );
}
/* ===========================
   Get Documents
=========================== */

export function getDocumentsApi(data) {

    const {
        page = 1,
        limit = 10,
        search = "",
        clientId = "",
        projectId = "",
    } = data?.payload || {};

    let q = `page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

    if (clientId) {
        q += `&clientId=${clientId}`;
    }

    if (projectId) {
        q += `&projectId=${projectId}`;
    }

    return api.get(`${'/api/v1/client/client-documents'}?${q}`);
}

/* ===========================
   Delete Document
=========================== */

export function deleteDocumentApi(data) {
    const documentId = data?.payload?.documentId || data?.payload || data;
    return api.delete(`/api/v1/client/client-documents/${documentId}`);
}