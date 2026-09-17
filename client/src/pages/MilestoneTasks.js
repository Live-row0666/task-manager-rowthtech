import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getClientTasksAction, getClientMilestonesAction, logoutUser } from '../redux/actions';
import moment from 'moment';
import Logo from '../assets/images/logo/rowthtech.svg';
import './MilestoneTasks.css';
import Select from "react-select";
import CommonSidebar from '../components/commonSidebar';
const COLS = ['To Do', 'In Progress', 'Testing', 'On Hold', 'Done'];
const COLCLR = { 'To Do': '#6c757d', 'In Progress': '#0d6efd', 'Testing': '#6f42c1', 'On Hold': '#fd7e14', 'Done': '#198754' };
const PRBG = { Critical: 'rgba(243,4,24,0.1)', High: 'rgba(255,165,2,0.1)', Medium: 'rgba(30,144,255,0.1)', Low: 'rgba(46,213,115,0.1)' };
const PRCLR = { Critical: '#fa172a', High: '#ffa502', Medium: '#1e90ff', Low: '#2ed573' };

const MilestoneTasks = () => {
    const { milestoneId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const mName = searchParams.get('mName') || 'Milestone';
    const pName = searchParams.get('pName') || '';

    const { user, clientTasks, clientTasksLoading, clientMilestones, dashboard } = useSelector(s => ({
        user: s.Auth.user,
        clientTasks: s.Auth.clientTasks || [],
        clientTasksLoading: s.Auth.clientTasksLoading,
        clientMilestones: s.Auth.clientMilestones || [],
        dashboard: s.Auth.dashboard,
    }));

    const name = user?.username || 'Client';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const [localTasks, setLocalTasks] = useState([]);
    const [taskView, setTaskView] = useState('Board');
    const [search, setSearch] = useState('');
    const [activeMsId, setActiveMsId] = useState(milestoneId);
    const [activeMsName, setActiveMsName] = useState(mName);
    const projectId = searchParams.get("projectId") || "";

    useEffect(() => {
        if (activeMsId) dispatch(getClientTasksAction(activeMsId));
    }, [activeMsId, dispatch]);


    useEffect(() => {
        if (projectId) {
            dispatch(getClientMilestonesAction(projectId, true));
        }
    }, [projectId, dispatch]);


    const filtered = useMemo(() => {
        const result = {};

        COLS.forEach(status => {
            result[status] = localTasks.filter(task =>
                task.status === status &&
                (
                    !search.trim() ||
                    task.summary?.toLowerCase().includes(search.toLowerCase()) ||
                    task.assignee?.name?.toLowerCase().includes(search.toLowerCase())
                )
            );
        });

        return result;
    }, [localTasks, search]);
    useEffect(() => {
        if (!clientMilestones.length) return;

        const selected =
            clientMilestones.find(m => m._id === milestoneId) ||
            clientMilestones[0];

        setActiveMsId(selected._id);
        setActiveMsName(selected.title);
    }, [clientMilestones, milestoneId]);

    useEffect(() => { setLocalTasks(clientTasks); }, [clientTasks]);
    COLS.forEach(s => {
        filtered[s] = localTasks.filter(t =>
            t.status === s &&
            (!search.trim() || t.summary?.toLowerCase().includes(search.toLowerCase()) || t.assignee?.name?.toLowerCase().includes(search.toLowerCase()))
        );
    });

    const milestoneOptions = useMemo(() => {
        return (clientMilestones || []).map((m) => ({
            value: m._id,
            label: m.title,
        }));
    }, [clientMilestones]);


    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 30,
            height: 30,
            borderRadius: 4,
            borderColor: state.isFocused ? "#4f46e5" : "#dee2e6",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#4f46e5",
            },
        }),

        valueContainer: (base) => ({
            ...base,
            height: 32,
            padding: "0 8px",
            fontSize: "12px",
        }),

        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
            fontSize: "12px",
        }),

        placeholder: (base) => ({
            ...base,
            fontSize: "12px",
        }),

        singleValue: (base) => ({
            ...base,
            fontSize: "12px",
        }),

        indicatorsContainer: (base) => ({
            ...base,
            height: 32,
        }),

        menu: (base) => ({
            ...base,
            zIndex: 9999,
            fontSize: "12px",
        }),
    };
    useEffect(() => {
        if (
            clientMilestones.length > 0 &&
            !activeMsId
        ) {
            setActiveMsId(clientMilestones[0]._id);
            setActiveMsName(clientMilestones[0].title);
        }
    }, [clientMilestones]);
    const allTasks = COLS.flatMap(s => filtered[s]);

    const statusCls = s =>
        s === 'Done' || s === 'Completed' ? 'bg-success-subtle text-success' :
            s === 'In Progress' ? 'bg-warning-subtle text-warning' :
                s === 'To Do' ? 'bg-info-subtle text-info' :
                    'bg-secondary-subtle text-secondary';
    const prCls = p =>
        p === 'Critical' || p === 'High' ? 'bg-danger-subtle text-danger' :
            p === 'Medium' ? 'bg-warning-subtle text-warning' :
                'bg-success-subtle text-success';

    return (
        <div className="dashboard-wrapper">
            {/* Sidebar */}
            <CommonSidebar active="milestone-task" />

            {/* Main */}
            <main className="dash-main">
                <header className="dash-header">
                    <div className="header-page-title">
                        <div className="mst-breadcrumb">
                            {pName && <><span className="mst-bc-project">{pName}</span><i className="bi bi-chevron-right mst-bc-sep" /></>}
                            <span className="mst-bc-ms">{activeMsName}</span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="notification-btn"><i className="bi bi-bell" /><span className="notification-badge" /></button>
                        <div className="user-profile-widget">
                            <div className="user-avatar-circle">{initials}</div>
                            <div className="user-profile-details">
                                <span className="user-profile-name">{name}</span>
                                <span className="user-profile-role">{user?.role || 'Client'}</span>
                            </div>
                        </div>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => dispatch(logoutUser())}
                            style={{ fontSize: '11px', padding: '4px 10px', fontWeight: 600 }}>
                            <i className="bi bi-box-arrow-right me-1" />Logout
                        </button>
                    </div>
                </header>

                {/* Task area */}
                <div style={{ padding: '8px 12px' }}>

                    {/* Topbar */}
                    <div className="milestone-toolbar">

                        <div className="milestone-toolbar-left">

                            <button
                                className="milestone-back-btn"
                                onClick={() => navigate(-1)}
                            >
                                <i className="bi bi-arrow-left"></i>
                                <span>Back</span>
                            </button>

                            <div className="milestone-filter">

                                <Select
                                    value={
                                        milestoneOptions.find(
                                            item => item.value === activeMsId
                                        ) || null
                                    }
                                    options={milestoneOptions}
                                    onChange={(option) => {
                                        if (!option) return;

                                        setActiveMsId(option.value);
                                        setActiveMsName(option.label);
                                    }}
                                    placeholder="Select Milestone"
                                    isSearchable
                                    isClearable={true}
                                    styles={customSelectStyles}
                                />

                            </div>

                        </div>

                        <div className="milestone-search-box">

                            <i className="bi bi-search milestone-search-icon"></i>

                            <input
                                className="milestone-search-input"
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>

                    </div>

                    {/* Content */}
                    {clientTasksLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                            <div className="spinner-border text-primary" />
                        </div>
                    ) : (
                        <div className="mst-board">
                            <div className="mst-columns">
                                {COLS.map(status => {
                                    const tasks = filtered[status] || [];
                                    return (
                                        <div key={status} className="mst-col">
                                            <div className="mst-col-header">
                                                <span style={{fontSize:'14px'}}>{status}</span>
                                                <span className="badge bg-primary" style={{ fontSize: '10px' }}>{tasks.length}</span>
                                            </div>
                                            {tasks.length === 0 ? (
                                                <div className="mst-empty-col">
                                                    <i className="bi bi-inbox" style={{ fontSize: '28px', marginBottom: '8px' }} />
                                                    No tasks
                                                </div>
                                            ) : tasks.map(task => {
                                                const isOverdue = task.dueDate && moment(task.dueDate).isBefore(moment()) && task.status !== 'Done';
                                                return (
                                                    <div
                                                        key={task._id}
                                                        className="mst-card"
                                                       
                                                    >

                                                        {/* Top */}

                                                        <div className="mst-card-top">

                                                            <div className="mst-card-badges">

                                                                <span
                                                                    className="mst-badge"
                                                                    style={{
                                                                        background: PRBG[task.priority],
                                                                        color: PRCLR[task.priority]
                                                                    }}
                                                                >
                                                                    {task.priority}
                                                                </span>

                                                                <span
                                                                    className="mst-badge badge-overdue"
                                                                >
                                                                    {isOverdue ? "OVERDUE" : "ON TIME"}
                                                                </span>

                                                            </div>

                                                            <span className="mst-card-date">
                                                                {task.dueDate
                                                                    ? moment(task.dueDate).format("DD MMM")
                                                                    : "--"}
                                                            </span>

                                                        </div>

                                                        {/* Summary */}

                                                        <div className="mst-summary">
                                                            {task.summary}
                                                        </div>

                                                        {/* Timeline */}

                                                        <div className="mst-time-row">

                                                            <span>
                                                                <strong>Timeline:</strong> {task.estimatedTime || 0} hrs
                                                            </span>

                                                            <span className="mst-spent">

                                                                Time spent:
                                                                <strong>
                                                                    {task.timeSpent || task.taskSpent || "0s"}
                                                                </strong>

                                                            </span>

                                                        </div>

                                                        {/* Footer */}

                                                        <div className="mst-card-footer">

                                                            <div className="mst-avatar">

                                                                {task.assignee?.name
                                                                    ? task.assignee.name
                                                                        .split(" ")
                                                                        .map(i => i[0])
                                                                        .join("")
                                                                    : "UA"}

                                                            </div>

                                                          

                                                        </div>

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MilestoneTasks;
