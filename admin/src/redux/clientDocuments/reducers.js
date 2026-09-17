import ClientDocumentTypes from "./constant";

const INIT = {
    data: [],
    loading: false,
    message: "",
};

/* ===========================
   GET CLIENTS
=========================== */

export const getClientsReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientDocumentTypes.GET_CLIENTS_LOADING:
            return { data: [], loading: true };

        case ClientDocumentTypes.GET_CLIENTS_SUCCESS:
            return { data: action.payload, loading: false };

        case ClientDocumentTypes.GET_CLIENTS_ERROR:
            return {
                data: [],
                loading: false,
                message: action.payload,
            };

        default:
            return { ...state };
    }
};

/* ===========================
   GET PROJECTS
=========================== */

export const getProjectsReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientDocumentTypes.GET_PROJECTS_LOADING:
            return { data: [], loading: true };

        case ClientDocumentTypes.GET_PROJECTS_SUCCESS:
            return { data: action.payload, loading: false };

        case ClientDocumentTypes.GET_PROJECTS_ERROR:
            return {
                data: [],
                loading: false,
                message: action.payload,
            };

        default:
            return { ...state };
    }
};

/* ===========================
   UPLOAD DOCUMENT
=========================== */

export const uploadDocumentReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientDocumentTypes.UPLOAD_DOCUMENT_LOADING:
            return { data: [], loading: true };

        case ClientDocumentTypes.UPLOAD_DOCUMENT_SUCCESS:
            return {
                data: action.payload,
                loading: false,
            };

        case ClientDocumentTypes.UPLOAD_DOCUMENT_RESET:
            return {
                data: [],
                loading: false,
            };

        case ClientDocumentTypes.UPLOAD_DOCUMENT_ERROR:
            return {
                data: [],
                loading: false,
                message: action.payload,
            };

        default:
            return { ...state };
    }
};

/* ===========================
   GET DOCUMENTS
=========================== */

export const getDocumentsReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientDocumentTypes.GET_DOCUMENTS_LOADING:
            return { data: [], loading: true };

        case ClientDocumentTypes.GET_DOCUMENTS_SUCCESS:
            return {
                data: action.payload,
                loading: false,
            };

        case ClientDocumentTypes.GET_DOCUMENTS_ERROR:
            return {
                data: [],
                loading: false,
                message: action.payload,
            };

        default:
            return { ...state };
    }
};

/* ===========================
   DELETE DOCUMENT
=========================== */

export const deleteDocumentReducer = (state = INIT, action) => {
    switch (action.type) {
        case ClientDocumentTypes.DELETE_DOCUMENT_LOADING:
            return { data: [], loading: true };

        case ClientDocumentTypes.DELETE_DOCUMENT_SUCCESS:
            return {
                data: action.payload,
                loading: false,
            };

        case ClientDocumentTypes.DELETE_DOCUMENT_RESET:
            return {
                data: [],
                loading: false,
            };

        case ClientDocumentTypes.DELETE_DOCUMENT_ERROR:
            return {
                data: [],
                loading: false,
                message: action.payload,
            };

        default:
            return { ...state };
    }
};