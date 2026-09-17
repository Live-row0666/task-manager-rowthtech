import * as types from './constant';

const initialState = {
    meetings: [],
    projectMeetings: [],
    pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
    },
    create: {
        loading: false,
        success: false,
        error: null
    },
    update: {
        loading: false,
        success: false,
        error: null
    },
    get: {
        loading: false,
        success: false,
        error: null
    },
    delete: {
        loading: false,
        success: false,
        error: null
    }
};

const meetingReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.CREATE_MEETING_REQUEST:
            return { 
                ...state, 
                create: { loading: true, success: false, error: null }
            };

        case types.CREATE_MEETING_SUCCESS:
            return { 
                ...state, 
                meetings: [action.payload.data, ...state.meetings],
                create: { loading: false, success: true, error: null }
            };

        case types.CREATE_MEETING_FAILURE:
            return { 
                ...state, 
                create: { loading: false, success: false, error: action.payload }
            };

        case types.UPDATE_MEETING_REQUEST:
            return { 
                ...state, 
                update: { loading: true, success: false, error: null }
            };

        case types.UPDATE_MEETING_SUCCESS:
            return { 
                ...state, 
                meetings: state.meetings.map(meeting => 
                    meeting._id === action.payload.data._id ? action.payload.data : meeting
                ),
                update: { loading: false, success: true, error: null }
            };

        case types.UPDATE_MEETING_FAILURE:
            return { 
                ...state, 
                update: { loading: false, success: false, error: action.payload }
            };

        case types.GET_MEETINGS_REQUEST:
        case types.GET_MEETINGS_BY_PROJECT_REQUEST:
            return { 
                ...state, 
                get: { loading: true, success: false, error: null }
            };

        case types.GET_MEETINGS_SUCCESS:
            return { 
                ...state, 
                meetings: action.payload.data || [],
                pagination: action.payload.pagination || state.pagination,
                get: { loading: false, success: true, error: null }
            };

        case types.GET_MEETINGS_BY_PROJECT_SUCCESS:
            return { 
                ...state, 
                projectMeetings: action.payload.data || [],
                get: { loading: false, success: true, error: null }
            };

        case types.GET_MEETINGS_FAILURE:
        case types.GET_MEETINGS_BY_PROJECT_FAILURE:
            return { 
                ...state, 
                get: { loading: false, success: false, error: action.payload }
            };

        case types.DELETE_MEETING_REQUEST:
            return { 
                ...state, 
                delete: { loading: true, success: false, error: null }
            };

        case types.DELETE_MEETING_SUCCESS:
            return { 
                ...state, 
                meetings: state.meetings.filter(meeting => meeting._id !== action.payload),
                delete: { loading: false, success: true, error: null }
            };

        case types.DELETE_MEETING_FAILURE:
            return { 
                ...state, 
                delete: { loading: false, success: false, error: action.payload }
            };

        default:
            return state;
    }
};

export default meetingReducer;