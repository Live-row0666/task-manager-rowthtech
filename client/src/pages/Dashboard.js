import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDashboard, logoutUser } from "../redux/actions";
import Logo from '../assets/images/logo/rowthtech.svg';
import './Dashboard.css';
import CommonHeader from "../components/commonHeader";
import CommonSidebar from "../components/commonSidebar";
const Dashboard = () => {
    const dispatch = useDispatch();
    const { user, dashboard, loading } = useSelector((state) => ({
        user: state.Auth.user,
        dashboard: state.Auth.dashboard,
        loading: state.Auth.loading,
    }));
    const [selectedProjectId, setSelectedProjectId] = useState("");

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    // Calculate avatar initials
    const name = user?.username || 'John Smith';
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);
    useEffect(() => {
        if (selectedProjectId) {
            dispatch(getDashboard(selectedProjectId));
        }
    }, [selectedProjectId, dispatch]);
    const total = dashboard?.summary?.totalMilestones || 0;
    const completed = dashboard?.summary?.completedMilestones || 0;
    const inProgress = dashboard?.summary?.inProgressMilestones || 0;
    const pending = dashboard?.summary?.pendingMilestones || 0;

    const completedPercent = total ? (completed / total) * 100 : 0;
    const inProgressPercent = total ? (inProgress / total) * 100 : 0;
    const pendingPercent = total ? (pending / total) * 100 : 0;

    const circumference = 220;

    const completedLength = (completedPercent / 100) * circumference;
    const inProgressLength = (inProgressPercent / 100) * circumference;
    const pendingLength = (pendingPercent / 100) * circumference;


    // if (loading) {
    //     return (
    //         <div
    //             className="d-flex justify-content-center align-items-center"
    //             style={{ height: "100vh" }}
    //         >
    //             <div className="spinner-border text-primary" />
    //         </div>
    //     );
    // }

    useEffect(() => {
        if (
            dashboard?.projects?.length > 0 &&
            !selectedProjectId
        ) {
            setSelectedProjectId(dashboard.projects[0]._id);
        }
    }, [dashboard?.projects, selectedProjectId]);
    return (
        <div className="dashboard-wrapper">
            {/* Left Sidebar */}
            <CommonSidebar active="dashboard" />

            {/* Main Content */}
            <main className="dash-main">
                {/* Header */}
                <CommonHeader title="Dashboard" />

                <div className="overview-heading-row">
                    <div className="overview-title-section">
                        <h3>Dashboard Overview</h3>
                        <p>Welcome back! Here's the summary of your project.</p>
                    </div>

                    <div className="project-dropdown">
                        <select
                            className="form-select"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >

                            {dashboard?.projects?.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                {/* Stats Cards Row */}
                <div className="stats-cards-row">
                    {/* Card 1 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <h4 className="stat-card-title">Total Milestones</h4>
                            <div className="stat-card-icon-container purple">
                                <i className="bi bi-layers"></i>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <h3 className="stat-card-number">
                                {dashboard?.summary?.totalMilestones || 0}
                            </h3>

                            <span className="stat-card-subtext">
                                <span className="stat-card-subtext-val green">
                                    {dashboard?.summary?.totalMilestones > 0
                                        ? `${(
                                            (dashboard.summary.completedMilestones /
                                                dashboard.summary.totalMilestones) *
                                            100
                                        ).toFixed(1)}%`
                                        : "0%"}
                                </span>{" "}
                                of total
                            </span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <h4 className="stat-card-title">Completed</h4>
                            <div className="stat-card-icon-container green">
                                <i className="bi bi-check-circle"></i>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <h3 className="stat-card-number">{dashboard?.summary?.completedMilestones || 0}</h3>
                            <span className="stat-card-subtext">
                                <span className="stat-card-subtext-val green"> {dashboard?.summary?.totalMilestones
                                    ? (
                                        (dashboard.summary.completedMilestones /
                                            dashboard.summary.totalMilestones) *
                                        100
                                    ).toFixed(1)
                                    : 0}
                                    %
                                </span>{" "}
                                of total
                            </span>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <h4 className="stat-card-title">In Progress</h4>
                            <div className="stat-card-icon-container orange">
                                <i className="bi bi-hourglass-split"></i>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <h3 className="stat-card-number">{dashboard?.summary?.inProgressMilestones || 0}</h3>
                            <span className="stat-card-subtext">
                                <span className="stat-card-subtext-val orange">  {dashboard?.summary?.totalMilestones
                                    ? (
                                        (dashboard.summary.inProgressMilestones /
                                            dashboard.summary.totalMilestones) *
                                        100
                                    ).toFixed(1)
                                    : 0}
                                    %
                                </span>{" "}
                                of total
                            </span>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <h4 className="stat-card-title">Pending</h4>
                            <div className="stat-card-icon-container blue">
                                <i className="bi bi-clock"></i>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <h3 className="stat-card-number">{dashboard?.summary?.pendingMilestones || 0}</h3>
                            <span className="stat-card-subtext">
                                <span className="stat-card-subtext-val blue">  {dashboard?.summary?.totalMilestones
                                    ? (
                                        (dashboard.summary.pendingMilestones /
                                            dashboard.summary.totalMilestones) *
                                        100
                                    ).toFixed(1)
                                    : 0}
                                    %
                                </span>{" "}
                                of total
                            </span>
                        </div>
                    </div>

                    {/* Card 5 */}
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <h4 className="stat-card-title">Total Tasks</h4>
                            <div className="stat-card-icon-container blue">
                                <i className="bi bi-clipboard-check"></i>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <h3 className="stat-card-number">
                                {dashboard?.summary?.totalTasks || 0}
                            </h3>

                            <div className="text-end">
                                <span className="stat-card-subtext">
                                    {dashboard?.summary?.completedTasks || 0}/
                                    {dashboard?.summary?.totalTasks || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="middle-progress-row">
                    {/* Project Progress */}
                    <div className="progress-widget-card">
                        <h4 className="progress-widget-title">Project Progress</h4>
                        <div>
                            <span className="overall-completion-title">Overall Completion</span>
                            <div className="overall-completion-percentage">{dashboard?.summary?.overallProgress || 0}%</div>
                            <div className="overall-progress-bar-container">
                                <div
                                    className="overall-progress-bar-fill"
                                    style={{
                                        width: `${dashboard?.summary?.overallProgress || 0}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="project-date-grid">
                            <div>
                                <div className="project-date-label">Start Date</div>
                                <div className="project-date-val"> {dashboard?.project?.start
                                    ? new Date(dashboard.project.start).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )
                                    : "-"}</div>
                            </div>
                            <div>
                                <div className="project-date-label">End Date</div>
                                <div className="project-date-val">  {dashboard?.project?.end
                                    ? new Date(dashboard.project.end).toLocaleDateString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )
                                    : "-"}</div>
                            </div>
                            <div>
                                <div className="project-date-label">Project Status</div>
                                <div className="project-date-val">
                                    <span className="project-status-dot"></span> {dashboard?.project?.projectStatus || "-"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Milestone Progress (Donut Chart) */}
                    <div className="progress-widget-card">
                        <h4 className="progress-widget-title">
                            Milestone Progress
                        </h4>

                        <div className="donut-widget-body">
                            <div className="donut-chart-container">

                                <svg width="90" height="90" className="donut-svg">

                                    <circle
                                        cx="45"
                                        cy="45"
                                        r="35"
                                        fill="transparent"
                                        stroke="#f1f5f9"
                                        strokeWidth="10"
                                    />

                                    <circle
                                        cx="45"
                                        cy="45"
                                        r="35"
                                        fill="transparent"
                                        stroke="#2ec4b6"
                                        strokeWidth="10"
                                        strokeDasharray={`${completedLength} ${circumference}`}
                                        strokeDashoffset="0"
                                    />

                                    <circle
                                        cx="45"
                                        cy="45"
                                        r="35"
                                        fill="transparent"
                                        stroke="#ff9f1c"
                                        strokeWidth="10"
                                        strokeDasharray={`${inProgressLength} ${circumference}`}
                                        strokeDashoffset={-completedLength}
                                    />

                                    <circle
                                        cx="45"
                                        cy="45"
                                        r="35"
                                        fill="transparent"
                                        stroke="#6f42c1"
                                        strokeWidth="10"
                                        strokeDasharray={`${pendingLength} ${circumference}`}
                                        strokeDashoffset={
                                            -(completedLength + inProgressLength)
                                        }
                                    />

                                </svg>

                                <div className="donut-chart-center-text">
                                    <span className="donut-center-num">
                                        {total}
                                    </span>

                                    <span className="donut-center-label">
                                        Total
                                    </span>
                                </div>

                            </div>

                            <div className="donut-legend">

                                <div className="legend-item">
                                    <span className="legend-dot green"></span>

                                    <span className="legend-label">
                                        Completed
                                    </span>

                                    <span className="legend-value">
                                        {completed} ({completedPercent.toFixed(1)}%)
                                    </span>
                                </div>

                                <div className="legend-item">
                                    <span className="legend-dot orange"></span>

                                    <span className="legend-label">
                                        In Progress
                                    </span>

                                    <span className="legend-value">
                                        {inProgress} ({inProgressPercent.toFixed(1)}%)
                                    </span>
                                </div>

                                <div className="legend-item">
                                    <span className="legend-dot purple"></span>

                                    <span className="legend-label">
                                        Pending
                                    </span>

                                    <span className="legend-value">
                                        {pending} ({pendingPercent.toFixed(1)}%)
                                    </span>
                                </div>

                            </div>
                        </div>


                    </div>

                    {/* Current Milestone */}
                    <div className="progress-widget-card">

                        <div className="current-milestone-header">
                            <span className="current-milestone-label">
                                Current Milestone
                            </span>

                            <span className="current-milestone-status-badge">
                                {dashboard?.currentMilestone?.status || "-"}
                            </span>
                        </div>

                        <h4 className="current-milestone-title">
                            {dashboard?.currentMilestone?.title || "No Active Milestone"}
                        </h4>

                        <div className="current-milestone-dates">

                            <div className="milestone-date-row">
                                <span className="milestone-date-label">
                                    Start Date
                                </span>

                                <span className="milestone-date-val">
                                    {dashboard?.currentMilestone?.startDate
                                        ? new Date(
                                            dashboard.currentMilestone.startDate
                                        ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "-"}
                                </span>
                            </div>

                            <div className="milestone-date-row">
                                <span className="milestone-date-label">
                                    End Date
                                </span>

                                <span className="milestone-date-val">
                                    {dashboard?.currentMilestone?.completionDate
                                        ? new Date(
                                            dashboard.currentMilestone.completionDate
                                        ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })
                                        : "-"}
                                </span>
                            </div>

                        </div>

                        <div className="milestone-progress-section">

                            <div className="milestone-progress-bar-info">
                                <span>Completion</span>

                                <span>
                                    {dashboard?.currentMilestone?.progress || 0}%
                                </span>
                            </div>

                            <div className="milestone-progress-bar-container">

                                <div
                                    className="milestone-progress-bar-fill"
                                    style={{
                                        width: `${dashboard?.currentMilestone?.progress || 0}%`,
                                    }}
                                ></div>

                            </div>

                        </div>

                        <div className="milestone-tasks-info">

                            <div>
                                <div className="milestone-tasks-label">
                                    Completed Tasks
                                </div>

                                <div className="milestone-tasks-val">
                                    {dashboard?.currentMilestone?.completedTasks ?? "-"}
                                </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <div className="milestone-tasks-label">
                                    Remaining Tasks
                                </div>

                                <div className="milestone-tasks-val">
                                    {dashboard?.currentMilestone?.remainingTasks ?? "-"}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bottom-grid-row">
                    {/* Milestones Table */}
                    <div className="bottom-widget-card">
                        <div className="bottom-widget-header">
                            <h4 className="bottom-widget-title">Milestones</h4>
                            <a href="#viewall" className="view-all-link">
                                View all →
                            </a>
                        </div>

                        <table className="milestones-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Milestone</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    dashboard?.milestones?.length > 0 ? (
                                        dashboard.milestones.map((item, index) => {
                                            const progress =
                                                item.status === "Completed"
                                                    ? 100
                                                    : item.progress || 0;

                                            return (
                                                <tr key={item._id}>
                                                    <td>{index + 1}</td>

                                                    <td className="td-milestone-name">
                                                        {item.title || item.name}
                                                    </td>

                                                    <td>
                                                        {new Date(item.startDate).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </td>

                                                    <td>
                                                        {new Date(item.completionDate).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {item.completedTasks}/{item.totalTasks}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <div className="table-progress-wrapper">
                                                            <div className="table-progress-bar-container">
                                                                <div
                                                                    className="table-progress-bar-fill"
                                                                    style={{
                                                                        width: `${progress}%`,
                                                                        backgroundColor:
                                                                            item.status === "Completed"
                                                                                ? "var(--dash-success)"
                                                                                : item.status === "In Progress"
                                                                                    ? "var(--dash-warning)"
                                                                                    : "#6c757d",
                                                                    }}
                                                                />
                                                            </div>

                                                            <span className="table-progress-percent">
                                                                {progress}%
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`status-badge ${item.status === "Completed"
                                                                ? "completed"
                                                                : item.status === "In Progress"
                                                                    ? "in-progress"
                                                                    : "pending"
                                                                }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                No milestones found
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>

                    {/* Upcoming Deliverables */}
                    <div className="bottom-widget-card">
                        <div className="bottom-widget-header">
                            <h4 className="bottom-widget-title">
                                Upcoming Deliverables
                            </h4>

                            <a href="#viewall" className="view-all-link">
                                View all →
                            </a>
                        </div>

                        <div className="deliverables-list">

                            {dashboard?.upcomingDeliverables?.length > 0 ? (
                                dashboard.upcomingDeliverables.map((item) => {

                                    const date = new Date(item.completionDate);

                                    return (
                                        <div
                                            className="deliverable-item"
                                            key={item._id}
                                        >
                                            <div className="deliverable-date-block">
                                                <span className="date-block-day">
                                                    {date.toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                    })}
                                                </span>

                                                <span className="date-block-month">
                                                    {date.toLocaleDateString("en-GB", {
                                                        month: "short",
                                                    })}
                                                </span>
                                            </div>

                                            <div className="deliverable-info">
                                                <span className="deliverable-title">
                                                    {item.title}
                                                </span>

                                                <span className="deliverable-phase">
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-3">
                                    No upcoming deliverables
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bottom-widget-card">
                        <div className="bottom-widget-header">
                            <h4 className="bottom-widget-title">
                                Recent Activity
                            </h4>

                            <a href="#viewall" className="view-all-link">
                                View all →
                            </a>
                        </div>

                        <div className="activity-timeline">

                            {dashboard?.recentActivities?.length > 0 ? (
                                dashboard.recentActivities.map((item, index) => (
                                    <div
                                        className="activity-item"
                                        key={index}
                                    >
                                        <div className="activity-marker">
                                            <i className="bi bi-check-circle-fill"></i>
                                        </div>

                                        <div className="activity-content">
                                            <span className="activity-title">
                                                {item.title}
                                            </span>

                                            <span className="activity-time">
                                                {item.time}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-3">
                                    No recent activity
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
