import { combineReducers } from 'redux';
import Auth from './auth/reducers';
import {
    getClientsReducer,
    getProjectsReducer,
    uploadDocumentReducer,
    getDocumentsReducer,
    deleteDocumentReducer,
} from "./clientDocuments/reducers";
export default combineReducers({
    Auth,
    getClientsReducer,
    getProjectsReducer,
    uploadDocumentReducer,
    getDocumentsReducer,
    deleteDocumentReducer,
});
