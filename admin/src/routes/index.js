import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PrivateRoute from './PrivateRoute';
import Root from './Root';
import * as layoutConstants from '../constants/layout';

// All layouts/containers
import DefaultLayout from '../layouts/Default';
import VerticalLayout from '../layouts/Vertical';
import DetachedLayout from '../layouts/Detached';
import HorizontalLayout from '../layouts/Horizontal';
import FullLayout from '../layouts/Full';

// lazy load all the views

// auth
const Login = React.lazy(() => import('../pages/account/Login'));
const Logout = React.lazy(() => import('../pages/account/Logout'));
const Register = React.lazy(() => import('../pages/account/Register'));
const Confirm = React.lazy(() => import('../pages/account/Confirm'));
const ForgetPassword = React.lazy(() => import('../pages/account/ForgetPassword'));
const LockScreen = React.lazy(() => import('../pages/account/LockScreen'));
const UserNotFound = React.lazy(() => import('../components/UserNotFound'));
// dashboard
const AdminDashboard = React.lazy(() => import('../pages/Task-Manager/Summary/analytics'));
const Projects = React.lazy(() => import('../pages/Task-Manager/projects/projects'));
const PageNotFound = React.lazy(() => import('../pages/error/PageNotFound'));


// Boards
const Boards = React.lazy(() => import('../pages/Task-Manager/board/board'));

const MileStone = React.lazy(() => import('../pages/Task-Manager/projects/milestone/milestone'));
const Sprint = React.lazy(() => import('../pages/Task-Manager/projects/milestone/sprint/sprint'));
const Task = React.lazy(() => import('../pages/Task-Manager/projects/milestone/sprint/task/task'));
const TaskBoard = React.lazy(() => import('../pages/Task-Manager/TaskBoard/taskBoard'));
const Technology = React.lazy(() => import('../pages/Task-Manager/Technology/technology'));
const TechnologyCategory = React.lazy(() => import('../pages/Task-Manager/TechnologyCategory/category'));
const AllTaskList = React.lazy(() => import('../pages/Task-Manager/TaskList/list'));
const Summary = React.lazy(() => import('../pages/Task-Manager/Summary/summary'));
const clientRepository = React.lazy(() => import('../pages/Task-Manager/ClientReprojeteries/clientRepository'));
const GetUploadData = React.lazy(() => import('../pages/Task-Manager/ClientReprojeteries/upload'));

// AllUsers
const AllUsers = React.lazy(() => import('../pages/Task-Manager/AllUsers'));

// Support
const Support = React.lazy(() => import('../pages/Task-Manager/support/Support'));

// Reports
const Reports = React.lazy(() => import('../pages/Task-Manager/reports/Reports'));

// Tickets
const Tickets = React.lazy(() => import('../pages/Task-Manager/tickets/Tickets'));

// Chat
// const Chat = React.lazy(() => import('../pages/Task-Manager/chat/Chat'));

// InviteUsers
const InviteUsers = React.lazy(() => import('../pages/Task-Manager/inviteUser'));
// clients
const ClientsIndex = React.lazy(() => import('../pages/Task-Manager/clients/ClientsIndex'));
// time tracker
const TimeTrackerIndex = React.lazy(() => import('../pages/Task-Manager/timeTracker/TimeTrackerIndex'))
const TaskDashboard = React.lazy(() => import('../pages/Task-Manager/taskDashboard/TaskDashboard'));

const ErrorPageNotFound = React.lazy(() => import('../pages/error/PageNotFound'));
const Maintenance = React.lazy(() => import('../pages/other/Maintenance'));
const NoInternet = React.lazy(() => import('../components/NoInternetPage'));

// Designation
const Designation = React.lazy(() => import('../pages/Task-Manager/Designation/Designation'));

// Meetings
const Meetings = React.lazy(() => import('../pages/Task-Manager/meetings/Meetings'));

// Quick Add
const QuickAdd = React.lazy(() => import('../pages/Task-Manager/QuickAdd/QuickAdd'));

// Client Projects
const ClientProjectsPage = React.lazy(() => import('../pages/Task-Manager/ClientProjects/ClientProjects'));

// Client Task Dashboard
const ClientTaskDashboardPage = React.lazy(() => import('../pages/Task-Manager/ClientTaskDashboard/ClientTaskDashboard'));

// Client Milestone Page
const ClientMilestonePage = React.lazy(() => import('../pages/Task-Manager/ClientMilestone/ClientMilestonePage'));

// Client Milestones (project-wise list)
const ClientMilestonesPage = React.lazy(() => import('../pages/Task-Manager/ClientMilestonesPage/ClientMilestonesPage'));

const Documents = React.lazy(() =>
    import("../pages/Task-Manager/ClientDocuments/ClientDocuments")
);

const ClientSupports = React.lazy(() =>
    import("../pages/Task-Manager/ClientSupport/ClientSupport")
);

const ClientDependencies = React.lazy(() =>
    import("../pages/Task-Manager/ClientDependency/ClientDependency")
);

const loading = () => <div className=""></div>;

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>,
};

const LoadComponent = ({ component: Component }: LoadComponentProps) => (
    <Suspense fallback={loading()}>
        <Component />
    </Suspense>
);

const AllRoutes = () => {
    const { layout } = useSelector((state) => ({
        layout: state.Layout,
    }));

    // const layout = useSelector((state) => state.Layout); // ✅ Simple and effective


    const getLayout = () => {
        let layoutCls = VerticalLayout;

        switch (layout.layoutType) {
            case layoutConstants.LAYOUT_HORIZONTAL:
                layoutCls = HorizontalLayout;
                break;
            case layoutConstants.LAYOUT_DETACHED:
                layoutCls = DetachedLayout;
                break;
            case layoutConstants.LAYOUT_FULL:
                layoutCls = FullLayout;
                break;
            default:
                layoutCls = VerticalLayout;
                break;
        }
        return layoutCls;
    };
    let Layout = getLayout();

    return useRoutes([
        { path: '/', element: <Root /> },
        {
            // public routes
            path: '/',
            element: <DefaultLayout />,
            children: [
                {
                    path: 'account',
                    children: [
                        { path: 'login', element: <LoadComponent component={Login} /> },
                        { path: 'register', element: <LoadComponent component={Register} /> },
                        { path: 'confirm', element: <LoadComponent component={Confirm} /> },
                        { path: 'forget-password', element: <LoadComponent component={ForgetPassword} /> },
                        { path: 'lock-screen', element: <LoadComponent component={LockScreen} /> },
                        { path: 'logout', element: <LoadComponent component={Logout} /> },
                    ],
                },
                {
                    path: 'error-404',
                    element: <LoadComponent component={ErrorPageNotFound} />,
                },
                {
                    path: 'maintenance',
                    element: <LoadComponent component={Maintenance} />,
                },
                {
                    path: 'no-internet',
                    element: <LoadComponent component={NoInternet} />,
                },
            ],
        },
        {
            // auth protected routes
            path: '/',
            element: <PrivateRoute component={Layout} />,
            children: [
                {
                    path: 'dashboard',
                    children: [
                        {
                            path: 'projects',
                            element: <LoadComponent component={Projects} />,
                        },
                        {
                            path: 'analytics',
                            element: <LoadComponent component={AdminDashboard} />,
                        },
                        {
                            path: 'taskDashboard',
                            element: <LoadComponent component={TaskDashboard} />,
                        },

                        {
                            path: '*',
                            element: <LoadComponent component={PageNotFound} />,
                        },
                        {
                            path: 'milestone/:id',
                            element: <LoadComponent component={MileStone} />,
                        },
                        {
                            path: 'boards',
                            element: <LoadComponent component={Boards} />,
                        },
                        {
                            path: 'users',
                            element: <LoadComponent component={AllUsers} />,
                        },
                        {
                            path: 'inviteuser',
                            element: <LoadComponent component={InviteUsers} />,
                        },
                        {
                            path: 'sprint/:milestoneId',
                            element: <LoadComponent component={Sprint} />,
                        },
                        {
                            path: 'singleSprintTask/projectId=/:projectId&milestoneId=/:milestoneId&spriteId=/:spriteId',
                            element: <LoadComponent component={Task} />,
                        },
                        {
                            path: 'taskBord/:projectId/:milestoneId/:spriteId/:projectName/:milestoneName/:sprintName',
                            element: <LoadComponent component={TaskBoard} />,
                        },
                        {
                            path: 'technology',
                            element: <LoadComponent component={Technology} />,
                        },
                        {
                            path: 'technologyCategory',
                            element: <LoadComponent component={TechnologyCategory} />,
                        },
                        {
                            path: 'clients',
                            element: <LoadComponent component={ClientsIndex} />,
                        },
                        {
                            path: 'clientRepository',
                            element: <LoadComponent component={clientRepository} />,
                        },
                        {
                            path: 'support',
                            element: <LoadComponent component={Support} />,
                        },
                        {
                            path: 'reports',
                            element: <LoadComponent component={Reports} />,
                        },
                        {
                            path: 'designation',
                            element: <LoadComponent component={Designation} />,
                        },
                        {
                            path: 'tickets',
                            element: <LoadComponent component={Tickets} />,
                        },
                        {
                            path: 'clientRepository/uploadData/projectId=/:projectId',
                            element: <LoadComponent component={GetUploadData} />,
                        },
                        {
                            path: "timeTracker",
                            element: <LoadComponent component={TimeTrackerIndex} />
                        },
                        {
                            path: "meetings",
                            element: <LoadComponent component={Meetings} />
                        },
                        {
                            path: "quick-add",
                            element: <LoadComponent component={QuickAdd} />
                        },
                        {
                            path: "client-projects",
                            element: <LoadComponent component={ClientProjectsPage} />
                        },
                        {
                            path: "client-task-board",
                            element: <LoadComponent component={ClientTaskDashboardPage} />
                        },
                        {
                            path: "client-milestone/:id",
                            element: <LoadComponent component={ClientMilestonePage} />
                        },
                        {
                            path: "client-milestones",
                            element: <LoadComponent component={ClientMilestonesPage} />
                        },

                        {
                            path: "documents",
                            element: <LoadComponent component={Documents} />,
                        },
                        {
                            path: "client-supports",
                            element: <LoadComponent component={ClientSupports} />,
                        },
                        {
                            path: "client-dependencies",
                            element: <LoadComponent component={ClientDependencies} />,
                        },
                        // {
                        //     path: "chat",
                        //     element: <LoadComponent component={Chat} />
                        // },
                    ],
                },
                {
                    path: '/',
                    children: [
                        {
                            path: 'pageNotFound',
                            element: <LoadComponent component={UserNotFound} />,
                        },
                    ],
                },
                {
                    path: '/taskList',
                    element: <LoadComponent component={AllTaskList} />,
                },
                {
                    path: '/summary',
                    element: <LoadComponent component={Summary} />,
                },
            ],
        },
    ]);
};

export { AllRoutes };