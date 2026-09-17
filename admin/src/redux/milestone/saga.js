import { all, fork, put, takeEvery, call } from 'redux-saga/effects';
import MileStoneType from './constant';
import { UpdateMileStonesApi, deleteMileStoneApi, getAllMileStonesApi, getMileStoneApi, addAllMilstoneApi, getSinleMileStoneApi, getProjectTasksApi } from './api';
import { toast } from 'react-toastify';

function* getAllMileStonesFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.GET_ALL_MILESTONES_LOADING,
            payload: {}
        })
        const response = yield call(getAllMileStonesApi, { payload });
        if (response.data.status) {
            yield put({
                type: MileStoneType.GET_ALL_MILESTONES_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: MileStoneType.GET_ALL_MILESTONES_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: MileStoneType.GET_ALL_MILESTONES_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.GET_ALL_MILESTONES_ERROR,
            payload: { error }
        });
        yield put({
            type: MileStoneType.GET_ALL_MILESTONES_RESET,
            payload: {},
        });
    }
}

function* getProjectTasksFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.GET_PROJECT_TASKS_LOADING,
            payload: {}
        })
        const response = yield call(getProjectTasksApi, { payload });
        if (response.data.status) {
            yield put({
                type: MileStoneType.GET_PROJECT_TASKS_SUCCESS,
                payload: { ...response.data },
            });
        }
        else {
            yield put({
                type: MileStoneType.GET_PROJECT_TASKS_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.GET_PROJECT_TASKS_ERROR,
            payload: { error }
        });
        yield put({
            type: MileStoneType.GET_PROJECT_TASKS_RESET,
            payload: {},
        });
    }
}
function* addAllMileStonesFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.ADD_ALL_MILESTONES_LOADING,
            payload: {}
        })
        const response = yield call(addAllMilstoneApi, { payload });

        if (response.data.status === 201) {
            toast.success(response.data.message);
            yield put({
                type: MileStoneType.ADD_ALL_MILESTONES_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: MileStoneType.ADD_ALL_MILESTONES_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: MileStoneType.ADD_ALL_MILESTONES_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.ADD_ALL_MILESTONES_ERROR,
            payload: { error }
        });
    }
}
function* MileStonedeleteFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.DELETE_MILE_STONE_LOADING,
            payload: {}
        })
        const response = yield call(deleteMileStoneApi, { payload });
        if (response.data.status) {
            yield put({
                type: MileStoneType.DELETE_MILE_STONE_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: MileStoneType.DELETE_MILE_STONE_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: MileStoneType.DELETE_MILE_STONE_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.DELETE_MILE_STONE_ERROR,
            payload: { error }
        });
        yield put({
            type: MileStoneType.DELETE_MILE_STONE_RESET,
            payload: {},
        });

    }
}
function* getMileStoneFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.GET_ALL_MILESTONE_BY_ID_LOADING,
            payload: {}
        })
        const response = yield call(getMileStoneApi, { payload });
        if (response.data.status) {
            yield put({
                type: MileStoneType.GET_ALL_MILESTONE_BY_ID_SUCCESS,
                payload: { ...response.data },
            });
            // yield put({
            //     type: MileStoneType.GET_ALL_MILESTONE_BY_ID_RESET,
            //     payload: {},
            // });
        }
        else {
            yield put({
                type: MileStoneType.GET_ALL_MILESTONE_BY_ID_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.GET_ALL_MILESTONE_BY_ID_ERROR,
            payload: { error }
        });
        yield put({
            type: MileStoneType.GET_ALL_MILESTONE_BY_ID_RESET,
            payload: {},
        });
    }
}
function* updateMileStoneFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.UPDATE_MILESTONE_LOADING,
            payload: {}
        })
        const response = yield call(UpdateMileStonesApi, payload);
        if (response.data.status) {
            yield put({
                type: MileStoneType.UPDATE_MILESTONE_SUCCESS,
                payload: { ...response.data },
            });
            yield put({
                type: MileStoneType.UPDATE_MILESTONE_RESET,
                payload: {},
            });
        }
        else {
            yield put({
                type: MileStoneType.UPDATE_MILESTONE_ERROR,
                payload: { ...response.data }
            });
            yield put({
                type: MileStoneType.UPDATE_MILESTONE_RESET,
                payload: {},
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.UPDATE_MILESTONE_ERROR,
            payload: { message: error }
        });
        yield put({
            type: MileStoneType.UPDATE_MILESTONE_RESET,
            payload: {},
        });
    }
}
function* getSingleMileStoneFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.GET_SINGLE_MILESTONE_LOADING,
            payload: {}
        })
        const response = yield call(getSinleMileStoneApi, { payload });
        if (response.data.status) {
            yield put({
                type: MileStoneType.GET_SINGLE_MILESTONE_SUCCESS,
                payload: { ...response.data },
            });
        }
        else {
            yield put({
                type: MileStoneType.GET_SINGLE_MILESTONE_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.GET_SINGLE_MILESTONE_ERROR,
            payload: { error }
        });
        yield put({
            type: MileStoneType.GET_SINGLE_MILESTONE_RESET,
            payload: {},
        });
    }
}
function* getMilestoneForTaskFunction({ payload }) {
    try {
        yield put({
            type: MileStoneType.GET_MILESTONE_FOR_TASK_LOADING,
            payload: {}
        })
        const response = yield call(getSinleMileStoneApi, { payload });
        if (response.data.status) {
            yield put({
                type: MileStoneType.GET_MILESTONE_FOR_TASK_SUCCESS,
                payload: { ...response.data },
            });
        }
        else {
            yield put({
                type: MileStoneType.GET_MILESTONE_FOR_TASK_ERROR,
                payload: { ...response.data }
            });
        }

    } catch (error) {
        yield put({
            type: MileStoneType.GET_MILESTONE_FOR_TASK_ERROR,
            payload: { error }
        });
        yield put({
            type: MileStoneType.GET_MILESTONE_FOR_TASK_RESET,
            payload: {},
        });
    }
}



export function* addAllMileStonesSaga(): any {
    yield takeEvery(MileStoneType.ADD_ALL_MILESTONES, addAllMileStonesFunction);
}
export function* getAllMileStonesSaga(): any {
    yield takeEvery(MileStoneType.GET_ALL_MILESTONES, getAllMileStonesFunction);
}
export function* mileStoneDeleteSaga(): any {
    yield takeEvery(MileStoneType.DELETE_MILE_STONE, MileStonedeleteFunction);
}
export function* getMileStoneSaga(): any {
    yield takeEvery(MileStoneType.GET_ALL_MILESTONE_BY_ID, getMileStoneFunction);
}
export function* updateMileStoneSaga(): any {
    yield takeEvery(MileStoneType.UPDATE_MILESTONE, updateMileStoneFunction);
}
export function* getSingleMileStoneSaga(): any {
    yield takeEvery(MileStoneType.GET_SINGLE_MILESTONE, getSingleMileStoneFunction);
}
export function* getMilestoneForTaskSaga(): any {
    yield takeEvery(MileStoneType.GET_MILESTONE_FOR_TASK, getMilestoneForTaskFunction);
}
export function* getProjectTasksSaga(): any {
    yield takeEvery(MileStoneType.GET_PROJECT_TASKS, getProjectTasksFunction);
}
function* AllMileStonesSaga(): any {
    yield all([

        fork(getAllMileStonesSaga),
        fork(mileStoneDeleteSaga),
        fork(getMileStoneSaga),
        fork(updateMileStoneSaga),
        fork(addAllMileStonesSaga),
        fork(getSingleMileStoneSaga),
        fork(getProjectTasksSaga),
        fork(getMilestoneForTaskSaga),

    ])
}

export default AllMileStonesSaga;