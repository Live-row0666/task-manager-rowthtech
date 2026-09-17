import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import ProjectCommentTypes from './constant';
import { addProjectCommentApi, deleteProjectCommentApi, getCommentCountApi, getProjectCommentApi, updateProjectCommentApi } from './api';
import { toast } from 'react-toastify';

function* addProjectCommentFunction({ payload }) {
    try {
        yield put({
            type: ProjectCommentTypes.ADD_PROJECT_COMMENT_LOADING,
            payload: {}
        })
        const response = yield call(addProjectCommentApi, { payload });
        if (response.data.status === 201) {
            toast.success(response.data.message);
            yield put({
                type: ProjectCommentTypes.ADD_PROJECT_COMMENT_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: ProjectCommentTypes.ADD_PROJECT_COMMENT_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: ProjectCommentTypes.ADD_PROJECT_COMMENT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        toast.error(error);
        yield put({
            type: ProjectCommentTypes.ADD_PROJECT_COMMENT_ERROR,
            payload: { message: error?.message }
        });
        yield put({
            type: ProjectCommentTypes.ADD_PROJECT_COMMENT_RESET,
            payload: {},
        });

    }
}
function* getProjectCommentFunction({ payload }) {
    try {
        yield put({
            type: ProjectCommentTypes.GET_PROJECT_COMMENT_LOADING,
            payload: {}
        })
        const response = yield call(getProjectCommentApi, { payload });

        if (response.data.status) {
            yield put({
                type: ProjectCommentTypes.GET_PROJECT_COMMENT_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: ProjectCommentTypes.GET_PROJECT_COMMENT_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: ProjectCommentTypes.GET_PROJECT_COMMENT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: ProjectCommentTypes.GET_PROJECT_COMMENT_ERROR,
            payload: { message: error?.message }
        });

    }
}

function* deleteProjectCommentFunction({ payload }) {
    try {
        yield put({
            type: ProjectCommentTypes.DELETE_PROJECT_COMMENT_LOADING,
            payload: {}
        })
        const response = yield call(deleteProjectCommentApi, { payload });
        if (response.data.status) {
            yield put({
                type: ProjectCommentTypes.DELETE_PROJECT_COMMENT_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: ProjectCommentTypes.DELETE_PROJECT_COMMENT_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: ProjectCommentTypes.DELETE_PROJECT_COMMENT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: ProjectCommentTypes.DELETE_PROJECT_COMMENT_ERROR,
            payload: { message: error?.message }
        });
        yield put({
            type: ProjectCommentTypes.DELETE_PROJECT_COMMENT_RESET,
            payload: {},
        });

    }
}

function* updateProjectCommentFunction({ payload }) {
    try {
        yield put({
            type: ProjectCommentTypes.UPDATE_PROJECT_COMMENT_LOADING,
            payload: {}
        })
        const response = yield call(updateProjectCommentApi, { payload });
        if (response.data.status) {
            yield put({
                type: ProjectCommentTypes.UPDATE_PROJECT_COMMENT_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: ProjectCommentTypes.UPDATE_PROJECT_COMMENT_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: ProjectCommentTypes.UPDATE_PROJECT_COMMENT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: ProjectCommentTypes.UPDATE_PROJECT_COMMENT_ERROR,
            payload: { message: error?.message }
        });
        yield put({
            type: ProjectCommentTypes.UPDATE_PROJECT_COMMENT_RESET,
            payload: {},
        });

    }
}

function* getCommentCountFunction({ payload }) {
    try {
        yield put({
            type: ProjectCommentTypes.GET_COMMENT_COUNT_LOADING,
            payload: {}
        })
        const response = yield call(getCommentCountApi, { payload });
        if (response.data.status) {
            yield put({
                type: ProjectCommentTypes.GET_COMMENT_COUNT_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: ProjectCommentTypes.GET_COMMENT_COUNT_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: ProjectCommentTypes.GET_COMMENT_COUNT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: ProjectCommentTypes.GET_COMMENT_COUNT_ERROR,
            payload: { message: error?.message }
        });

    }
}

export function* addProjectCommentSaga(): any {
    yield takeEvery(ProjectCommentTypes.ADD_PROJECT_COMMENT, addProjectCommentFunction);
}
export function* getProjectCommentSaga(): any {
    yield takeEvery(ProjectCommentTypes.GET_PROJECT_COMMENT, getProjectCommentFunction);
}
export function* deleteProjectCommentSaga(): any {
    yield takeEvery(ProjectCommentTypes.DELETE_PROJECT_COMMENT, deleteProjectCommentFunction);
}
export function* updateProjectCommentSaga(): any {
    yield takeEvery(ProjectCommentTypes.UPDATE_PROJECT_COMMENT, updateProjectCommentFunction);
}
export function* getCommentCountSaga(): any {
    yield takeEvery(ProjectCommentTypes.GET_COMMENT_COUNT, getCommentCountFunction);
}

function* AllProjectCommentSaga(): any {
    yield all([
        fork(addProjectCommentSaga),
        fork(getProjectCommentSaga),
        fork(deleteProjectCommentSaga),
        fork(updateProjectCommentSaga),
        fork(getCommentCountSaga),
    ])
}

export default AllProjectCommentSaga;