import { all, fork, put, takeEvery, call } from "redux-saga/effects";
import { toast } from "react-toastify";
import ClientDocumentTypes from "./constant";

import {
    getClientsApi,
    getProjectsApi,
    uploadDocumentsApi,
    getDocumentsApi,
    deleteDocumentApi,
} from "./api";

/* ===========================
   Get Clients
=========================== */

function* getClientsFunction() {
    try {
        yield put({
            type: ClientDocumentTypes.GET_CLIENTS_LOADING,
            payload: {},
        });

        const response = yield call(getClientsApi);

        console.log(response.data.data, "xcvcxvcxnvcxvx")
        if (response.data.success) {
            yield put({
                type: ClientDocumentTypes.GET_CLIENTS_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: ClientDocumentTypes.GET_CLIENTS_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: ClientDocumentTypes.GET_CLIENTS_ERROR,
            payload: { message: error.message },
        });
    }
}

/* ===========================
   Get Projects
=========================== */

function* getProjectsFunction({ payload }) {
    try {
        yield put({
            type: ClientDocumentTypes.GET_PROJECTS_LOADING,
            payload: {},
        });

        const response = yield call(getProjectsApi, payload);

        if (response.data.success) {
            yield put({
                type: ClientDocumentTypes.GET_PROJECTS_SUCCESS,
                payload: { ...response.data },
            });
        } else {
            yield put({
                type: ClientDocumentTypes.GET_PROJECTS_ERROR,
                payload: { ...response.data },
            });
        }
    } catch (error) {
        yield put({
            type: ClientDocumentTypes.GET_PROJECTS_ERROR,
            payload: { message: error.message },
        });
    }
}

/* ===========================
   Upload Documents
=========================== */

function* uploadDocumentsFunction({ payload }) {
    try {
        yield put({
            type: ClientDocumentTypes.UPLOAD_DOCUMENT_LOADING,
        });

        const response = yield call(uploadDocumentsApi, payload);

        if (response.data.success) {
            toast.success(response.data.message);

            yield put({
                type: ClientDocumentTypes.UPLOAD_DOCUMENT_SUCCESS,
                payload: response.data,
            });
        } else {
            yield put({
                type: ClientDocumentTypes.UPLOAD_DOCUMENT_ERROR,
                payload: response.data,
            });
        }
    } catch (error) {
        yield put({
            type: ClientDocumentTypes.UPLOAD_DOCUMENT_ERROR,
            payload: error.response?.data || error.message,
        });
    }
}
/* ===========================
   Get Documents
=========================== */

function* getDocumentsFunction({ payload }) {
    try {

        yield put({
            type: ClientDocumentTypes.GET_DOCUMENTS_LOADING,
            payload: {},
        });

        const response = yield call(getDocumentsApi, payload);

        console.log(response.data, "vbvcbvcbvcbvcbncv")
        if (response.success) {

            yield put({
                type: ClientDocumentTypes.GET_DOCUMENTS_SUCCESS,
                payload: { ...response.data },
            });

        } else {

            yield put({
                type: ClientDocumentTypes.GET_DOCUMENTS_ERROR,
                payload: { ...response.data },
            });

        }

    } catch (error) {

        yield put({
            type: ClientDocumentTypes.GET_DOCUMENTS_ERROR,
            payload: { message: error.message },
        });

    }
}

/* ===========================
   Delete Document
=========================== */

function* deleteDocumentFunction({ payload }) {
    try {

        yield put({
            type: ClientDocumentTypes.DELETE_DOCUMENT_LOADING,
            payload: {},
        });

        const response = yield call(deleteDocumentApi, payload);

        if (response.data.status === 200) {

            toast.success(response.data.message);

            yield put({
                type: ClientDocumentTypes.DELETE_DOCUMENT_SUCCESS,
                payload: { ...response.data },
            });

            yield put({
                type: ClientDocumentTypes.DELETE_DOCUMENT_RESET,
                payload: {},
            });

        } else {

            toast.error(response.data.message);

            yield put({
                type: ClientDocumentTypes.DELETE_DOCUMENT_ERROR,
                payload: { ...response.data },
            });

            yield put({
                type: ClientDocumentTypes.DELETE_DOCUMENT_RESET,
                payload: {},
            });

        }

    } catch (error) {

        toast.error(error.message);

        yield put({
            type: ClientDocumentTypes.DELETE_DOCUMENT_ERROR,
            payload: { message: error.message },
        });

        yield put({
            type: ClientDocumentTypes.DELETE_DOCUMENT_RESET,
            payload: {},
        });

    }
}

/* ===========================
   Watchers
=========================== */

function* getClientsSaga() {
    yield takeEvery(
        ClientDocumentTypes.GET_CLIENTS,
        getClientsFunction
    );
}

function* getProjectsSaga() {
    yield takeEvery(
        ClientDocumentTypes.GET_PROJECTS,
        getProjectsFunction
    );
}

function* uploadDocumentsSaga() {
    yield takeEvery(
        ClientDocumentTypes.UPLOAD_DOCUMENT,
        uploadDocumentsFunction
    );
}

function* getDocumentsSaga() {
    yield takeEvery(
        ClientDocumentTypes.GET_DOCUMENTS,
        getDocumentsFunction
    );
}

function* deleteDocumentSaga() {
    yield takeEvery(
        ClientDocumentTypes.DELETE_DOCUMENT,
        deleteDocumentFunction
    );
}

/* ===========================
   Root Saga
=========================== */

function* AllClientDocumentSaga() {
    yield all([
        fork(getClientsSaga),
        fork(getProjectsSaga),
        fork(uploadDocumentsSaga),
        fork(getDocumentsSaga),
        fork(deleteDocumentSaga),
    ]);
}

export default AllClientDocumentSaga;