// @flow
import { combineReducers } from 'redux';

import Auth from './auth/reducers';
import Layout from './layout/reducers';
import {
    addProject,
    getProject,
    getProjectsCount,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectId,
    getProjectUsers,
    getProjectTimeSpent,
    getAmcProjectsReducer,
    updateProjectStatusReducer
} from './projects/reducers';
import {
    getAllMileStones,
    deleteMileStone,
    getMileStone,
    updateMilestone,
    addAllmilstones,
    getSigleMileStone,
    getMilestoneId,
    getProjectTasks,
    getMilestoneForTaskReducer,
} from './milestone/reducer';
import {
    addSprint,
    getAllSprints,
    deleteSprint,
    updateSprint,
    getAllSingleSprints,
    getSprintId,
    getSprintForTaskReducer,
} from './sprint/reducres';
import {
    getClientsReducer,
    getProjectsReducer,
    uploadDocumentReducer,
    getDocumentsReducer,
    deleteDocumentReducer,
} from "./clientDocuments/reducers";
import {
    createTaskReducer,
    getSigleSprintTask,
    getAllTaskReducer,
    UpdateTaskReducer,
    deleteTask,
    updateTaskStatus,
    TaskStatusReducer,
    AddCommentReducer,
    getComment,
    deleteCommentReducer,
    getTaskId,
    updateCommentReducer, getAssignUserReducer, getHistoryReducer, getReporterReducer, getBugsReducer, getSubTaskReducer,
    getprojectForTasks,
} from './task/reducer';
import { getAllUsers, getAllCategory, deleteUser, createUser, getAllRoles, getCsvDataReducer, getuserTasks, updateUser, getUserByIdReducer } from './user/reducer';
import { getAllTickets, createTicket, updateTicket, updateTicketResponse, getTicketById } from './support/reducer';
import { getTaskSummaryReducer, getPriorityGraphReducer, getTaskWeekCountReducer } from './Summary/reducer';
import {
    createTechnologyReducer,
    getAllTechnologyReducer,
    UpdateTechnologyReducer,
    deleteTechnology,
    createTechnologyCategoryReducer,
    getAllTechnologyCategoryReducer,
    UpdateTechnologyCategoryReducer,
    deleteTechnologyCategory,
} from './technology/reducer';
import { getPreSaleReducer, addPreSaleReducer, updatePreSaleReducer, deletePreSaleReducer } from './customer/reducer';
import { clientReducer } from './client/reducer';
import { getProjectNameReducer, uploadProjectDetail, getuploadProjectDetailReducer } from "./clientRepository/reducers"
import { getTimeTrackerReducer, getUserRecordReducer } from './timeTracker/reducer';
import { employeeDailyLogs, monthlySummary, projectDailySummary, projectTeamView } from './report/reducer'
import { getGlobalSearchReducer } from './dashboard/reducers';
import { createTaskStatusReducer, editTaskStatusReducer, getAllTaskStatusesReducer } from './taskStatus/reducer';
import { addProjectCommentReducer, deleteProjectCommentReducer, getCommentCountReducer, getProjectCommentReducer, updateProjectCommentReducer } from './projectsComments/reducers';
import meetingReducer from './meeting/reducer';
import { addClientProjectReducer, getClientProjectsReducer } from './clientProject/reducers';
import { addClientMilestoneReducer, getClientMilestonesReducer, addClientTaskReducer, getClientTasksReducer, updateClientTaskReducer, updateClientMilestoneReducer } from './clientMilestone/reducers';
export default (combineReducers({
    Auth,
    Layout,
    addProject,
    getProject, getAmcProjectsReducer,
    getProjectsCount,
    updateProject, updateProjectStatusReducer,
    deleteProject,
    getProjectById,
    getAllMileStones,
    addAllmilstones,
    deleteMileStone,
    getMileStone,
    addSprint,
    getAllSprints,
    deleteSprint,
    createTaskReducer,
    updateMilestone,
    getAllUsers,
    getAllCategory,
    deleteUser,
    updateSprint,
    getSigleMileStone, getMilestoneForTaskReducer,
    getSigleSprintTask,
    getAllSingleSprints, getSprintForTaskReducer,
    getAllTaskReducer,
    UpdateTaskReducer,
    createUser,
    createTechnologyReducer,
    getAllTechnologyReducer,
    UpdateTechnologyReducer,
    deleteTechnology,
    createTechnologyCategoryReducer,
    getAllTechnologyCategoryReducer,
    UpdateTechnologyCategoryReducer,
    deleteTechnologyCategory,
    getAllRoles,
    deleteTask,
    getProjectId,
    updateTaskStatus,
    getMilestoneId,
    getSprintId,
    TaskStatusReducer,
    getTaskSummaryReducer,
    getPriorityGraphReducer,
    getTaskWeekCountReducer,
    AddCommentReducer,
    getComment,
    deleteCommentReducer,
    getTaskId,
    getprojectForTasks,
    updateCommentReducer,
    getAssignUserReducer,
    getReporterReducer,
    getCsvDataReducer,
    getPreSaleReducer,
    addPreSaleReducer,
    updatePreSaleReducer,
    deletePreSaleReducer,
    getProjectNameReducer, uploadProjectDetail, getuploadProjectDetailReducer, updateUser,
    getTimeTrackerReducer, getHistoryReducer, getBugsReducer, getSubTaskReducer, getUserRecordReducer, employeeDailyLogs, monthlySummary, projectDailySummary, projectTeamView, getuserTasks, getUserByIdReducer,
    getProjectUsers, getProjectTasks, getProjectTimeSpent, clientReducer,
    getGlobalSearchReducer,
    // TASK STATUSES
    getAllTaskStatusesReducer, createTaskStatusReducer, editTaskStatusReducer,
    // SUPPORT
    getAllTickets, createTicket, updateTicket, updateTicketResponse, getTicketById,
    // PROJECT COMMENTS
    getProjectCommentReducer, deleteProjectCommentReducer, addProjectCommentReducer, updateProjectCommentReducer, getCommentCountReducer,
    // MEETINGS
    Meeting: meetingReducer,
    // CLIENT PROJECT / MILESTONE / TASK
    addClientProjectReducer,
    getClientProjectsReducer,
    addClientMilestoneReducer,
    getClientMilestonesReducer,
    addClientTaskReducer,
    getClientTasksReducer,
    updateClientTaskReducer,
    updateClientMilestoneReducer,
    getClientsReducer,
getProjectsReducer,
uploadDocumentReducer,
getDocumentsReducer,
deleteDocumentReducer,
    
}): any);
