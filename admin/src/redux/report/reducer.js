import ReportTypes from '../report/constant'

const INITIAL_STATE = {
    data: [],
    message: "",
    loading: false
}

// Employee Daily Logs Reducer
export const employeeDailyLogs = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ReportTypes.GET_EMPLOYEE_DAILY_LOGS:
            return { ...state, loading: true };
        case ReportTypes.GET_EMPLOYEE_DAILY_LOGS_SUCCESS:
            return { ...state, data: action?.payload, loading: false };
        case ReportTypes.GET_EMPLOYEE_DAILY_LOGS_ERROR:
            return { ...state, data: [], loading: false, message: action?.payload };
        default:
            return { ...state };
    }
};

// Monthly Summary Reducer
export const monthlySummary = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ReportTypes.GET_MONTHLY_SUMMARY:
            return { ...state, loading: true };
        case ReportTypes.GET_MONTHLY_SUMMARY_SUCCESS:
            return { ...state, data: action?.payload, loading: false };
        case ReportTypes.GET_MONTHLY_SUMMARY_ERROR:
            return { ...state, data: [], loading: false, message: action?.payload };
        default:
            return { ...state };
    }
};

// Project Daily Summary Reducer
export const projectDailySummary = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ReportTypes.GET_PROJECT_DAILY_SUMMARY:
            return { ...state, loading: true };
        case ReportTypes.GET_PROJECT_DAILY_SUMMARY_SUCCESS:
            return { ...state, data: action?.payload, loading: false };
        case ReportTypes.GET_PROJECT_DAILY_SUMMARY_ERROR:
            return { ...state, data: [], loading: false, message: action?.payload };
        default:
            return { ...state };
    }
};

// Project Team View Reducer
export const projectTeamView = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ReportTypes.GET_PROJECT_TEAM_VIEW:
            return { ...state, loading: true };
        case ReportTypes.GET_PROJECT_TEAM_VIEW_SUCCESS:
            return { ...state, data: action?.payload, loading: false };
        case ReportTypes.GET_PROJECT_TEAM_VIEW_ERROR:
            return { ...state, data: [], loading: false, message: action?.payload };
        default:
            return { ...state };
    }
};