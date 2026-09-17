import USERS_TYPES from './constant';

const GET_ALL_USER_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};
const GET_ALL_CATEGORY_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};
const DELETE_USER_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};
const CREATE_USER_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const UPDATE_USER_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const GET_ALL_ROLES_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const GET_CSV_FILE_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const GET_USER_TASKS_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

const GET_USER_BY_ID_INITIAL_STATE = {
    data: [],
    message: '',
    loading: false,
};

export const getAllUsers = (state = GET_ALL_USER_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.GET_ALL_USERS_LOADING:
            return {
                data: GET_ALL_USER_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.GET_ALL_USERS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };

        case USERS_TYPES.GET_ALL_USERS_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};
export const getAllCategory = (state = GET_ALL_CATEGORY_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.GET_ALL_CATEGORY_LOADING:
            return {
                data: GET_ALL_CATEGORY_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.GET_ALL_CATEGORY_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };

        case USERS_TYPES.GET_ALL_CATEGORY_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const deleteUser = (state = DELETE_USER_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.GET_DELETE_USER_LOADING:
            return {
                data: DELETE_USER_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.GET_DELETE_USER_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case USERS_TYPES.GET_DELETE_USER_RESET:
            return {
                data: DELETE_USER_INITIAL_STATE.data,
                loading: false,
            };

        case USERS_TYPES.GET_DELETE_USER_ERROR:
            return {
                data: [],
                status: 403,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};
export const createUser = (state = CREATE_USER_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.CREATE_USER_LOADING:
            return {
                data: CREATE_USER_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.CREATE_USER_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case USERS_TYPES.CREATE_USER_RESET:
            return {
                data: CREATE_USER_INITIAL_STATE.data,
                loading: false,
            };

        case USERS_TYPES.CREATE_USER_ERROR:
            return {
                data: [],
                status: 403,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const updateUser = (state = UPDATE_USER_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.UPDATE_USER_LOADING:
            return {
                data: UPDATE_USER_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.UPDATE_USER_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case USERS_TYPES.UPDATE_USER_RESET:
            return {
                data: UPDATE_USER_INITIAL_STATE.data,
                loading: false,
            };

        case USERS_TYPES.UPDATE_USER_ERROR:
            return {
                data: [],
                status: 403,
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const getAllRoles = (state = GET_ALL_ROLES_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.GET_ALL_ROLES_LOADING:
            return {
                data: GET_ALL_ROLES_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.GET_ALL_ROLES_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };

        case USERS_TYPES.GET_ALL_ROLES_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};
export const getCsvDataReducer = (state = GET_CSV_FILE_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.GET_CSV_DATA_LOADING:
            return {
                data: GET_CSV_FILE_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.GET_CSV_DATA_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case USERS_TYPES.GET_CSV_DATA_RESET:
            return {
                data: GET_CSV_FILE_INITIAL_STATE.data,
                loading: false,
            };

        case USERS_TYPES.GET_CSV_DATA_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

// export const getuserTasks = (state = GET_USER_TASKS_INITIAL_STATE, action) => {
//     switch (action.type) {
//         case USERS_TYPES.GET_ALL_USERS_LOADING:
//             return {
//                 data: GET_USER_TASKS_INITIAL_STATE.data,
//                 loading: true,
//             };
//         case USERS_TYPES.GET_ALL_CATEGORY_SUCCESS:
//             return {
//                 data: action?.payload,
//                 loading: false,
//             };

//         case USERS_TYPES.GET_USER_TASKS_ERROR:
//             return {
//                 data: [],
//                 loading: false,
//                 message: action?.payload,
//             };
//         default:
//             return { ...state };
//     }
// };
export const getuserTasks = (state = GET_USER_TASKS_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.GET_USER_TASKS_LOADING:
            return {
                data: GET_USER_TASKS_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.GET_USER_TASKS_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case USERS_TYPES.GET_USER_TASKS_RESET:
            return {
                data: GET_USER_TASKS_INITIAL_STATE.data,
                loading: false,
            };

        case USERS_TYPES.GET_USER_TASKS_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};

export const getUserByIdReducer = (state = GET_USER_BY_ID_INITIAL_STATE, action) => {
    switch (action.type) {
        case USERS_TYPES.GET_USER_BY_ID_LOADING:
            return {
                data: GET_USER_BY_ID_INITIAL_STATE.data,
                loading: true,
            };
        case USERS_TYPES.GET_USER_BY_ID_SUCCESS:
            return {
                data: action?.payload,
                loading: false,
            };
        case USERS_TYPES.GET_USER_BY_ID_RESET:
            return {
                data: GET_USER_BY_ID_INITIAL_STATE.data,
                loading: false,
            };

        case USERS_TYPES.GET_USER_BY_ID_ERROR:
            return {
                data: [],
                loading: false,
                message: action?.payload,
            };
        default:
            return { ...state };
    }
};