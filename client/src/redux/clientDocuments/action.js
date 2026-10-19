import ClientDocumentTypes from "./constant";

export const getDocumentClients = () => ({
    type: ClientDocumentTypes.GET_CLIENTS,
});

export const getDocumentProjects = (payload) => ({
    type: ClientDocumentTypes.GET_PROJECTS,
    payload,
});

export const uploadClientDocument = (payload) => ({
    type: ClientDocumentTypes.UPLOAD_DOCUMENT,
    payload,
});

export const resetUploadDocument = () => ({
    type: ClientDocumentTypes.UPLOAD_DOCUMENT_RESET,
});

export const getClientDocuments = (payload) => ({
    type: ClientDocumentTypes.GET_DOCUMENTS,
    payload,
});

export const deleteClientDocument = (payload) => ({
    type: ClientDocumentTypes.DELETE_DOCUMENT,
    payload,
});