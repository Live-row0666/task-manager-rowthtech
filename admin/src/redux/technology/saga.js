import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import TECHNOLOGY_TYPES from './constant';
import { UpdateTechnologyApi, UpdateTechnologyCategoryApi, createTechnologyApi, createTechnologyCategoryApi, deleteTechnologyApi, deleteTechnologyCategoryApi, getAllTechnologyApi, getAllTechnologyCategoryApi } from './api';
import { toast } from 'react-toastify';



function* createTechnologyCategoryFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_CATEGORY_LOADING,
            payload: {}
        })
        const response = yield call(createTechnologyCategoryApi, { payload });

        if (response.data.status) {
            yield put({
                type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_CATEGORY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_CATEGORY_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_CATEGORY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_CATEGORY_ERROR,
            payload: { message: error?.message }
        });

    }
}
function* getAllTechnologyCategoryFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_CATEGORY_LOADING,
            payload: {}
        })
        const response = yield call(getAllTechnologyCategoryApi, { payload });
        if (response.data.status) {
            yield put({
                type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_CATEGORY_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_CATEGORY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_CATEGORY_ERROR,
            payload: { message: error?.message }
        });

    }
}
function* updateTechnologyCategoryFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_CATEGORY_LOADING,
            payload: {}
        })
        const response = yield call(UpdateTechnologyCategoryApi, { payload });
        if (response.data.status) {
            yield put({
                type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_CATEGORY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_CATEGORY_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_CATEGORY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_CATEGORY_ERROR,
            payload: { message: error?.message }
        });

    }
}
function* deleteTechnologyCategoryFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY_LOADING,
            payload: {}
        })
        const response = yield call(deleteTechnologyCategoryApi, { payload });
        if (response.data.status) {
            yield put({
                type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY_ERROR,
            payload: { message: error?.message }
        });
        yield put({
            type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY_RESET,
            payload: {},
        });

    }
}


function* createTechnologyFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_LOADING,
            payload: {}
        })
        const response = yield call(createTechnologyApi, { payload });

        if (response.data.status) {
            yield put({
                type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_ERROR,
            payload: { message: error?.message }
        });

    }
}
function* getAllTechnologyFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_LOADING,
            payload: {}
        })
        const response = yield call(getAllTechnologyApi, { payload });
        if (response.data.status) {
            yield put({
                type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
         toast.error(error)
        yield put({
            type: TECHNOLOGY_TYPES.GET_TECHNOLOGY_ERROR,
            payload: { message: error?.message }
        });

    }
}
function* updateTechnologyFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_LOADING,
            payload: {}
        })
        const response = yield call(UpdateTechnologyApi, { payload });
        if (response.data.status) {
            toast.success(response?.data?.message)
            yield put({
                type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        toast.error(error)
        yield put({
            type: TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_ERROR,
            payload: { message: error?.message }
        });

    }
}
function* deleteTechnologyFunction({ payload }) {
    try {
        yield put({
            type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_LOADING,
            payload: {}
        })
        const response = yield call(deleteTechnologyApi, { payload });
        if (response.data.status) {
            yield put({
                type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_ERROR,
            payload: { message: error?.message }
        });
        yield put({
            type: TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_RESET,
            payload: {},
        });

    }
}

export function* createTechnologyCategorySaga(): any {
    yield takeEvery(TECHNOLOGY_TYPES.CREATE_TECHNOLOGY_CATEGORY, createTechnologyCategoryFunction);
}
export function* getAllTechnologyCategory(): any {
    yield takeEvery(TECHNOLOGY_TYPES.GET_TECHNOLOGY_CATEGORY, getAllTechnologyCategoryFunction);
}
export function* updateTechnologyCategory(): any {
    yield takeEvery(TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY_CATEGORY, updateTechnologyCategoryFunction);
}
export function* deleteTechnologyCategorySaga(): any {
    yield takeEvery(TECHNOLOGY_TYPES.DELTE_TECHNOLOGY_CATEGORY, deleteTechnologyCategoryFunction);
}



export function* createTechnologySaga(): any {
    yield takeEvery(TECHNOLOGY_TYPES.CREATE_TECHNOLOGY, createTechnologyFunction);
}
export function* getAllTechnology(): any {
    yield takeEvery(TECHNOLOGY_TYPES.GET_TECHNOLOGY, getAllTechnologyFunction);
}
export function* updateTechnology(): any {
    yield takeEvery(TECHNOLOGY_TYPES.UPDATE_TECHNOLOGY, updateTechnologyFunction);
}
export function* deleteTechnologySaga(): any {
    yield takeEvery(TECHNOLOGY_TYPES.DELTE_TECHNOLOGY, deleteTechnologyFunction);
}

function* AllTechnologySaga(): any {
    yield all([

        fork(createTechnologyCategorySaga),
        fork(getAllTechnologyCategory),
        fork(updateTechnologyCategory),
        fork(deleteTechnologyCategorySaga),

        fork(createTechnologySaga),
        fork(getAllTechnology),
        fork(updateTechnology),
        fork(deleteTechnologySaga),
    ])
}
export default AllTechnologySaga;