import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import SprintTypes from './constant';
import { addSprintApi, deleteSprintApi, getAllSingleSprintApi, getallSprintApi, updateSprintApi } from './api';
import { toast } from 'react-toastify';


function* addSprintFunction({ payload }) {
    try {
        yield put({
            type: SprintTypes.ADD_SPRINT_LOADING,
            payload: {}
        })
        const response = yield call(addSprintApi, { payload });
        if (response.data.status === 201) {
            toast.success(response.data.message);
            yield put({
                type: SprintTypes.ADD_SPRINT_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: SprintTypes.ADD_SPRINT_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: SprintTypes.ADD_SPRINT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: SprintTypes.ADD_SPRINT_ERROR,
            payload: { message: error?.message }
        });
        yield put({
            type: SprintTypes.ADD_SPRINT_RESET,
            payload: {},
        });

    }
}
function* getAllSprintFunction({ payload }) {
    try {
        yield put({
            type: SprintTypes.GET_ALL_SPRINT_LOADING,
            payload: {}
        })
        const response = yield call(getallSprintApi, { payload });

        if (response.data.status) {
            yield put({
                type: SprintTypes.GET_ALL_SPRINT_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: SprintTypes.GET_ALL_SPRINT_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: SprintTypes.GET_ALL_SPRINT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: SprintTypes.GET_ALL_SPRINT_ERROR,
            payload: { message: error?.message }
        });

    }
}
function* deleteSprintFunction({ payload }) {
    try {
        yield put({
            type: SprintTypes.DELETE_SPRINT_LOADING,
            payload: {}
        })
        const response = yield call(deleteSprintApi, { payload });
        if (response.data.status) {
            yield put({
                type: SprintTypes.DELETE_SPRINT_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: SprintTypes.DELETE_SPRINT_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: SprintTypes.DELETE_SPRINT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: SprintTypes.DELETE_SPRINT_ERROR,
            payload: { message: error?.message }
        });
        yield put({
            type: SprintTypes.DELETE_SPRINT_RESET,
            payload: {},
        });

    }
}

function* getAllSingleSprintFunction({ payload }) {
    try {
        yield put({
            type: SprintTypes.GET_ALL_SINGLE_SPRINT_LOADING,
            payload: {}
        })
        const response = yield call(getAllSingleSprintApi, { payload });
        if (response.data.status) {
            yield put({
                type: SprintTypes.GET_ALL_SINGLE_SPRINT_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: SprintTypes.GET_SPRINT_BY_ID_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: SprintTypes.GET_ALL_SINGLE_SPRINT_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: SprintTypes.GET_ALL_SINGLE_SPRINT_ERROR,
            payload: { message: error?.message }
        });

    }
}

function* getSprintForTaskFunction({ payload }) {
    try {
        yield put({
            type: SprintTypes.GET_SPRINT_FOR_TASK_LOADING,
            payload: {}
        })
        const response = yield call(getAllSingleSprintApi, { payload });
        if (response.data.status) {
            yield put({
                type: SprintTypes.GET_SPRINT_FOR_TASK_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: SprintTypes.GET_SPRINT_BY_ID_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: SprintTypes.GET_SPRINT_FOR_TASK_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: SprintTypes.GET_SPRINT_FOR_TASK_ERROR,
            payload: { message: error?.message }
        });

    }
}

function* updateSprintFunction({ payload }) {
    try {
        yield put({
            type: SprintTypes.UPDATE_SPRINT_LOADING,
            payload: {}
        })
        const response = yield call(updateSprintApi, { payload });
        if (response.data.status) {
            yield put({
                type: SprintTypes.UPDATE_SPRINT_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: SprintTypes.UPDATE_SPRINT_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: SprintTypes.UPDATE_SPRINT_ERROR,
                payload: { ...response.data }
            });
            yield put({
                type: SprintTypes.UPDATE_SPRINT_RESET,
                payload: {},
            });
        }

    } catch (error) {
        yield put({
            type: SprintTypes.UPDATE_SPRINT_ERROR,
            payload: { message: error }
        });
        yield put({
            type: SprintTypes.UPDATE_SPRINT_RESET,
            payload: {},
        });
    }
}
export function* addSprintSaga(): any {
    yield takeEvery(SprintTypes.ADD_SPRINT, addSprintFunction);
}
export function* getAllSprintSaga(): any {
    yield takeEvery(SprintTypes.GET_ALL_SPRINT, getAllSprintFunction);
}

export function* getAllSingleSprintSaga(): any {
    yield takeEvery(SprintTypes.GET_ALL_SINGLE_SPRINT, getAllSingleSprintFunction);
}

export function* getSprintForTaskSaga(): any {
    yield takeEvery(SprintTypes.GET_SPRINT_FOR_TASK, getSprintForTaskFunction);
}

export function* deleteSprintSaga(): any {
    yield takeEvery(SprintTypes.DELETE_SPRINT, deleteSprintFunction);
}

export function* updateSprintSaga(): any {
    yield takeEvery(SprintTypes.UPDATE_SPRINT, updateSprintFunction);
}
function* AllSprintSaga(): any {
    yield all([
        fork(addSprintSaga),
        fork(getAllSprintSaga),
        fork(deleteSprintSaga),
        fork(updateSprintSaga),
        fork(getAllSingleSprintSaga),
        fork(getSprintForTaskSaga)
    ])
}
export default AllSprintSaga;