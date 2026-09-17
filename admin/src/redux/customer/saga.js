import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import PreSaleType from './constant';
import { getPreSaleApiEndPoint, addPreSaleApiEndPoint, updatePreSaleApiEndPoint, deletePreSaleApiEndPoint } from './api';

function* getPreSale({ payload }) {
    try {
        yield put({
            type: PreSaleType.GET_PRE_SALE_LOADING,
            payload: {}
        })
        const response = yield call(getPreSaleApiEndPoint, { payload });

        if (response.data.status) {
            yield put({
                type: PreSaleType.GET_PRE_SALE_SUCCESS,
                payload: { ...response.data },
            });
        }
        else {
            yield put({
                type: PreSaleType.GET_PRE_SALE_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: PreSaleType.GET_PRE_SALE_ERROR,
            payload: { message: error?.message }
        });

    }
}

function* addPreSale(data) {
    try {
        yield put({
            type: PreSaleType.ADD_PRE_SALE_LOADING,
            payload: {}
        })
        const response = yield call(addPreSaleApiEndPoint, data);
        if (response.data.status) {
            yield put({
                type: PreSaleType.ADD_PRE_SALE_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: PreSaleType.ADD_PRE_SALE_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: PreSaleType.ADD_PRE_SALE_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: PreSaleType.ADD_PRE_SALE_ERROR,
            payload: { message: error?.message }
        });

    }
}

function* updatePreSale(data) {

    try {
        yield put({
            type: PreSaleType.UPDATE_PRE_SALE_LOADING,
            payload: {}
        })
        const response = yield call(updatePreSaleApiEndPoint, data);
        if (response.data.status) {
            yield put({
                type: PreSaleType.UPDATE_PRE_SALE_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: PreSaleType.UPDATE_PRE_SALE_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: PreSaleType.UPDATE_PRE_SALE_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: PreSaleType.UPDATE_PRE_SALE_ERROR,
            payload: { message: error?.message }
        });

    }
}

function* deletePreSale(id) {
    try {
        yield put({
            type: PreSaleType.DELETE_PRE_SALE_LOADING,
            payload: {}
        })
        const response = yield call(deletePreSaleApiEndPoint, id);
        if (response.data.status) {
            yield put({
                type: PreSaleType.DELETE_PRE_SALE_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: PreSaleType.DELETE_PRE_SALE_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: PreSaleType.DELETE_PRE_SALE_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: PreSaleType.DELETE_PRE_SALE_ERROR,
            payload: { message: error?.message }
        });
    }
}

export function* getPreSaleSaga(): any {
    yield takeEvery(PreSaleType.GET_PRE_SALE_FIRST, getPreSale);
}

export function* addPreSaleSaga(): any {
    yield takeEvery(PreSaleType.ADD_PRE_SALE_FIRST, addPreSale);
}
export function* updatePreSaleSaga(): any {
    yield takeEvery(PreSaleType.UPDATE_PRE_SALE_FIRST, updatePreSale);
}
export function* deletePreSaleSaga(): any {
    yield takeEvery(PreSaleType.DELETE_PRE_SALE_FIRST, deletePreSale);
}

function* AllPreSaleSaga(): any {
    yield all([
        fork(getPreSaleSaga),
        fork(addPreSaleSaga),
        fork(updatePreSaleSaga),
        fork(deletePreSaleSaga),
    ])
}

export default AllPreSaleSaga;