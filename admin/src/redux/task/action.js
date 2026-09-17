import TASK_TYPES from "./constant";

type AuthAction = { type: string, payload: {} | string };

export const createTask = (data): AuthAction => ({
    type: TASK_TYPES.CREATE_TASK,
    payload: data
});

export const updateTask = (data): AuthAction => ({
    type: TASK_TYPES.UPDATE_TASK,
    payload: data
});

export const getsingleSprintTask = (data): AuthAction => ({
    type: TASK_TYPES.GET_SINGLE_SPRINT_TASK,
    payload: data
});

export const AddComment = (data): AuthAction => ({
    type: TASK_TYPES.ADD_COMMENT,
    payload: data
})

export const getBugs = (data): AuthAction => ({
    type: TASK_TYPES.GET_BUGS,
    payload: data
});
export const getSubTask = (data): AuthAction => ({
    type: TASK_TYPES.GET_SUBTASK,
    payload: data
});
export const createSubTask = (data): AuthAction => ({
    type: TASK_TYPES.CREATE_SUBTASK,
    payload: data
})


export const getAllTask = (data): AuthAction => ({
    type: TASK_TYPES.GET_ALL_TASK,
    payload: data
})

export const deleteTask = (data): AuthAction => ({
    type: TASK_TYPES.DELETE_TASK,
    payload: data
})

export const updateTaskStatus = (data): AuthAction => ({
    type: TASK_TYPES.UPDATE_TASK_STATUS,
    payload: data
})
export const TaskStatusAction = (data): AuthAction => ({
    type: TASK_TYPES.TASK_STATUS,
    payload: data
})


export const getComment = (data): AuthAction => ({
    type: TASK_TYPES.GET_COMMENT,
    payload: data
})
export const deleteComment = (data): AuthAction => ({
    type: TASK_TYPES.DELETE_COMMENT,
    payload: data
})
export const UpdateCommentAction = (data): AuthAction => ({
    type: TASK_TYPES.UPDATE_COMMENT,
    payload: data
})
export const gettaskId = (data): AuthAction => ({
    type: "taskid",
    payload: data
})
export const getAssignUserAction = (data): AuthAction => ({
    type: TASK_TYPES.GET_ASSIGN_USER,
    payload: data
})

export const getReporterAction = (): AuthAction => ({
    type: TASK_TYPES.GET_ALL_REPORTER,
})

export const getHistoryAction = (data): AuthAction => ({
    type: TASK_TYPES.GET_HISTORY,
    payload: data
})

export const getprojectForTasks = (data): AuthAction => ({
    type: TASK_TYPES.GET_PROJECT_FOR_TASKS,
    payload: data
})
