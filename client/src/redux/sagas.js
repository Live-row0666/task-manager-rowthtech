import { all } from 'redux-saga/effects';
import authSaga from './auth/saga';
import documentSaga from "./clientDocuments/saga"

export default function* rootSaga(): any {
    yield all([
        authSaga(),
        documentSaga()
    ]);
}
