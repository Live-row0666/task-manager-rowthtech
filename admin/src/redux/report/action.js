import ReportTypes from "./constant";
type AuthAction = { type: string, payload: {} | string };

// Employee Daily Logs
export const getEmployeeDailyLogs = (data): AuthAction => ({
    type: ReportTypes.GET_EMPLOYEE_DAILY_LOGS,
    payload: data
});

// Monthly Summary
export const getMonthlySummary = (data): AuthAction => ({
    type: ReportTypes.GET_MONTHLY_SUMMARY,
    payload: data
});

// Project Daily Summary
export const getProjectDailySummary = (data): AuthAction => ({
    type: ReportTypes.GET_PROJECT_DAILY_SUMMARY,
    payload: data
});

// Project Team View
export const getProjectTeamView = (data): AuthAction => ({
    type: ReportTypes.GET_PROJECT_TEAM_VIEW,
    payload: data
})