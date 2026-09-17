import * as URL from '../../constants/endpoint';
import { APICore } from '../../helpers/api/apiCore';
const api = new APICore();

export function createTaskApi(data): any {
    return api.create(URL.CREATE_TASK, data?.payload);
}
export function UpdateTaskApi(data): any {
    return api.update(`${URL.UpdateTask}/${data?.payload?.taskId}`, data.payload.body);
}

export function createSubtaskApi(data): any {
    return api.create(URL.Create_subtask, data?.payload);
}

export function getSingleSprintTaskApi(data): any {
    return api.get(`${URL.SingleSprintTask}?${data.payload.projectId ? `project=${data.payload.projectId}` : ''}${data.payload.assignee ? `&assignee=${data.payload.assignee}` : ''}${data.payload.milestone ? `&milestone=${data.payload.milestone}` : ''}${data.payload.sprint ? `&sprint=${data.payload.sprint}` : ''}${data.payload.startDate ? `&startDate=${data.payload.startDate}` : ''}${data.payload.endDate ? `&endDate=${data.payload.endDate}` : ''}&limit=100`);
}

export function getAllTaskApi(data): any {
    return api.get(`${URL.GetAllTask}?sprintId=${data.payload.sprintId}&searchString=${data.payload.searchString}${data.payload.assigneeId ? `&assigneeId=${data.payload.assigneeId}` : ''}`);
}

export function deleteTaskApi(data): any {
    return api.delete(URL.DeleteTask + data?.payload?.taskId);
}

export function updateTaskStatusApi(data): any {
    return api.update(URL.UpdateTaskStatus, data.payload);
}
export function TaskStatusApi(data): any {
    return api.update(URL.TaskStatus, data.payload);
}
export function AddCommentApi(data): any {
    return api.create(`${URL.ADDCOMMENT}/${data?.payload?.taskId}/comment`, data?.payload?.body);
}
export function getCommentApi(data): any {
    return api.get(URL.GetComment + data?.payload?.taskId);
}
export function deleteCommentApi(data): any {
    return api.delete(`${URL.DELETECOMMENT}/comment/${data?.payload?.id}`);
}
export function UpdateCommentApi(data): any {
    return api.update(`${URL.UPDATECOMMENT}/comment/${data?.payload?.id}`, data?.payload?.body);
}
export function GetAssignUserApi(data): any {
    return api.get(`${URL.GetAssignUser}${data.payload.projectId}&milestoneId=${data.payload.milestoneId}&sprintId=${data.payload.sprintId}`);
}
export function getReporterListApi(data): any {
    return api.get(`${URL.GET_REPORTER}`);
}

export function getHistoryApi(data): any {
    return api.get(URL.getHistory, data?.payload);
}
export function getBugsApi(data): any {
    const { taskId, type } = data?.payload;
    return api.get(`${URL.getBugs}&type=${type}&taskId=${taskId}`);
}
export function getSubTaskApi(data): any {
    const { taskId } = data?.payload;
    return api.get(`${URL.getSubTask}&type=${'SubTask'}&taskId=${taskId}`);
}

export function getUserTasksTimer(params = {}) {
    return api.get(`/api/v1/admin/time-tracking-logs/${params}`)
}

export function getprojectForTasksApi(data): any {
    return api.get(`${URL.getprojectForTasks}?${data.payload.projectStatus !== '' && `status=${data.payload.projectStatus}`}&isActive=${data.payload.status}&page=${data.payload.skip}&search=${data.payload.search || ''}&limit=${data?.payload?.limit || 50}${data?.payload?.userId ? `&user=${data?.payload?.userId}` : ''}&projectType=${data?.payload?.projectType}`)
}