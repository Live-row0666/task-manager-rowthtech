// end points
const baseurl = '/api/v1/user/'

export const AddProject = `${baseurl}project`;
// export const GetAllProject = "/project/getProjects?activeStatus=";
export const GetAllProject = "/project/getProjects";

export const UpdateProjectDetails = "/project/update";
export const DeleteProject = "/project/updateStatus";
export const GetProjectName = "/project/getProjectName";
export const UploadProjectDetail = "/project/upload";
export const getUploadProjectDetail = "/project/files?skip="
// // 
export const GetProjectById = `${baseurl}project`;

export const GetAllMileStones = `${baseurl}milestone`;
// // 
export const MileStoneDelete = "/milestone/updateStatus"
export const MileStoneAdd = `${baseurl}milestone`;
export const AddSprint = `${baseurl}sprint`;
// // 
export const ParticularMilestoneDetail = "/milestone/getmilestonebyid/";
export const GetAllSprints = "/sprint?";
// // 
export const DeleteSprint = "/sprint/updateStatus";
export const getAllSingleSprint = `${baseurl}sprint`;
// create task 
export const CREATE_TASK = "/api/v1/admin/task";
export const UPDATE_MILESTONE = `${baseurl}milestone`;
export const ALL_CATEGORY = "/technology/getTechCategory?status=";
export const deleteUsers = "/users/deleteUser";
export const UpdateSprint = `${baseurl}sprint`;
export const SingleMilestone = `${baseurl}milestone?project=`;
export const SingleSprintTask = `${baseurl}task`;
export const GetAllTask = "/task/getTasksAccToStatus"
export const UpdateTask = "/task/updateTask"
export const DeleteTask = "/task/deletetask?taskId="
export const UpdateTaskStatus = "/task/updateTaskStatus"
export const TaskStatus = "/task/updateTaskActiveStatus"

// users
export const InviteUser = `${baseurl}user`
export const ALL_USERS = `${baseurl}user`;

// Support
export const SUPPORT_TICKETS = `${baseurl}support`;
export const VIEW_SUPPORT_TICKETS = `${baseurl}support`;

// export const InviteUser = "/users/register"
export const AddTechnology = "/technology/addTechnology"
export const GetTechnology = "/technology/getTechnology?status="
export const UpdateTechnology = "/technology/updateTechnology"
export const DeleteTechnology = "/technology/updateTechnologyStatus"


// Tech categories : 
export const techCategory = `${baseurl}technology/category`;

// tecg

export const technology = `${baseurl}technology`;

export const GetCategoryTechnology = "/technology/getTechCategory?status="
export const UpdateCategoryTechnology = "/technology/updateTechCategory"
export const DeleteCategoryTechnologyy = "/technology/updateTechCategoryStatus"

// All Roles
export const Roles = `${baseurl}auth/roles`;


export const GetAllRoles = "/roles/getAllRoles"
export const TaskSummaryDetail = "/task/getTasksStatusCount"
export const PriorityGraph = "/task/getPriorityTasks"
export const TaskWeekCount = "/task/getTasksWeekCount"
export const ADDCOMMENT = "/comments/addComment"
export const GetComment = "/comments/getTaskComment?taskId="
export const deleteComment = "/comments/deleteComment?commentId="
export const updateComment = "/comments/updateComment"
export const GetAssignUser = "/assignUser/getuserListprojectAssigned?projectId="
export const GET_REPORTER = "/users/getReporterList"
export const GetCsvData = "/userLogin/getLoginTimeFile?userId="

export const GetPreSale = "/preSale/getPreSalesData?skip="
export const AddPreSale = "/preSale/addPreSalesData"
export const UpdatePreSale = "preSale/updatePreSales"
export const DeletePreSale = "/preSale/deletePreSales?preSalesId="

export const getTimeTracker = "/users/trackTime"
export const getHistory = "/history/getHistory"
export const getBugs = "/subTask/getSubTask?"
export const getSubTask = "/subTask/getSubTask?"
export const Create_subtask = "/subTask/addSubTask"

export const getAllTaskCount = '/task/getTasksCount'
export const getUserRecord = '/task/userWorkingHours?'

export const getReport = '/project/usersProjects'
export const getProjectsCount = '/project/projectsCount'

export const userTasks = '/users/specificUserTask'
export const projectUsers = '/task/projectUserList'
export const projectTasks = '/project/projectTasks'

export const projectTimeSpent = '/project/projectTime'

// User endpoints
export const USER_PROJECTS = '/api/v1/user/project';
export const USER_TASKS = '/api/v1/user/task';
export const USER_NOTIFICATIONS = '/api/v1/user/notification';