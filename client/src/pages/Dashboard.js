import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDashboard } from "../redux/actions";
import './Dashboard.css';
import CommonHeader from "../components/commonHeader";
import CommonSidebar from "../components/commonSidebar";

// Smooth animated counter component for animated number counting (0 -> 1 -> 2 ... -> target)
const CountUp = ({ end = 0, duration = 1000, decimals = 0 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const target = Number(end) || 0;
        if (target === 0) {
            setCount(0);
            return;
        }

        let animationFrameId;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic for smooth deceleration
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeOutProgress * target;
            
            setCount(currentVal);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [end, duration]);

    return <>{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}</>;
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const { dashboard } = useSelector((state) => ({
        user: state.Auth.user,
        dashboard: state.Auth.dashboard,
        loading: state.Auth.loading,
    }));
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const projectDropdownRef = useRef(null);

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    useEffect(() => {
        if (selectedProjectId) {
            dispatch(getDashboard(selectedProjectId));
        }
    }, [selectedProjectId, dispatch]);

    useEffect(() => {
        if (dashboard?.projects?.length > 0 && !selectedProjectId) {
            setSelectedProjectId(dashboard.projects[0]._id);
        }
    }, [dashboard?.projects, selectedProjectId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const totalMilestones = dashboard?.summary?.totalMilestones || 0;
    const completedMilestones = dashboard?.summary?.completedMilestones || 0;
    const inProgressMilestones = dashboard?.summary?.inProgressMilestones || 0;
    const pendingMilestones = dashboard?.summary?.pendingMilestones || 0;

    const totalTasks = dashboard?.summary?.totalTasks || 0;
    const completedTasks = dashboard?.summary?.completedTasks || 0;
    const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const completedPercent = totalMilestones ? (completedMilestones / totalMilestones) * 100 : 0;
    const inProgressPercent = totalMilestones ? (inProgressMilestones / totalMilestones) * 100 : 0;
    const pendingPercent = totalMilestones ? (pendingMilestones / totalMilestones) * 100 : 0;

    // SVG Donut chart math (Exact dash & gap calculation)
    const radius = 34;
    const circumference = Number((2 * Math.PI * radius).toFixed(2)); // ~213.63

    const completedStroke = Number(((completedPercent / 100) * circumference).toFixed(2));
    const inProgressStroke = Number(((inProgressPercent / 100) * circumference).toFixed(2));
    const pendingStroke = Number(((pendingPercent / 100) * circumference).toFixed(2));

    const completedOffset = 0;
    const inProgressOffset = -completedStroke;
    const pendingOffset = -(completedStroke + inProgressStroke);

    const currentProject = dashboard?.projects?.find(p => p._id === selectedProjectId) || dashboard?.project;

    return (
        <div className="dashboard-wrapper">
            {/* Left Sidebar */}
            <CommonSidebar active="dashboard" />

            {/* Main Content */}
            <main className="dash-main">
                {/* Top Header */}
                <CommonHeader title="Client Portal" />

                {/* Dashboard Hero Bar */}
                <div className="dashboard-hero-bar">
                    <div className="hero-welcome-info">
                        <div className="hero-title-row">
                            <h2 className="hero-title">Project Overview</h2>
                            <div className="hero-badge">
                                <span className="pulse-dot"></span>
                                Live Project Tracker
                            </div>
                        </div>
                        <p className="hero-subtitle">
                            Welcome back! Live status and roadmap summary for your project.
                        </p>
                    </div>

                    <div className="hero-controls">
                        <div className="project-dropdown-wrapper" ref={projectDropdownRef}>
                            <button
                                type="button"
                                className={`project-dropdown-trigger ${isProjectDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                title="Switch active project workspace"
                            >
                                <div className="project-trigger-left">
                                    <i className="bi bi-briefcase-fill project-trigger-icon"></i>
                                    <span className="project-trigger-name">
                                        {currentProject?.name || "Select Project"}
                                    </span>
                                </div>
                                <i className={`bi bi-chevron-down project-trigger-chevron ${isProjectDropdownOpen ? 'open' : ''}`}></i>
                            </button>

                            {isProjectDropdownOpen && (
                                <div className="project-dropdown-menu">
                                    <div className="project-dropdown-header">
                                        <span>Active Projects</span>
                                    </div>
                                    <div className="project-dropdown-list">
                                        {dashboard?.projects?.length > 0 ? (
                                            dashboard.projects.map((project) => {
                                                const isSelected = project._id === selectedProjectId;
                                                return (
                                                    <div
                                                        key={project._id}
                                                        className={`project-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedProjectId(project._id);
                                                            setIsProjectDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="item-icon-wrap">
                                                            <i className="bi bi-folder2-open"></i>
                                                        </div>
                                                        <span className="item-name">{project.name}</span>
                                                        {isSelected && (
                                                            <i className="bi bi-check2 item-check"></i>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="project-dropdown-empty">
                                                <span>No other projects found</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPI Metrics Row (5 Cards) */}
                <div className="stats-kpi-grid">
                    {/* Card 1: Total Milestones */}
                    <div className="kpi-card kpi-card-purple">
                        <div className="kpi-card-header-line">
                            <span className="kpi-title-text">Total Milestones</span>
                            <div className="kpi-icon-pill icon-purple">
                                <i className="bi bi-layers-fill"></i>
                            </div>
                        </div>
                        <div className="kpi-value-container">
                            <span className="kpi-big-number">
                                <CountUp end={totalMilestones} />
                            </span>
                            <span className="kpi-tag-chip tag-purple">
                                Total Phases
                            </span>
                        </div>
                        <div className="kpi-mini-track">
                            <div className="kpi-mini-fill bg-purple" style={{ width: '100%' }}></div>
                        </div>
                        <span className="kpi-caption">Full scope of active project</span>
                    </div>

                    {/* Card 2: Completed */}
                    <div className="kpi-card kpi-card-green">
                        <div className="kpi-card-header-line">
                            <span className="kpi-title-text">Completed</span>
                            <div className="kpi-icon-pill icon-green">
                                <i className="bi bi-check2-circle"></i>
                            </div>
                        </div>
                        <div className="kpi-value-container">
                            <span className="kpi-big-number">
                                <CountUp end={completedMilestones} />
                            </span>
                            <span className="kpi-tag-chip tag-green">
                                <CountUp end={completedPercent} decimals={1} />% Done
                            </span>
                        </div>
                        <div className="kpi-mini-track">
                            <div className="kpi-mini-fill bg-green" style={{ width: `${completedPercent}%` }}></div>
                        </div>
                        <span className="kpi-caption">
                            <CountUp end={completedMilestones} /> of <CountUp end={totalMilestones} /> milestones delivered
                        </span>
                    </div>

                    {/* Card 3: In Progress */}
                    <div className="kpi-card kpi-card-amber">
                        <div className="kpi-card-header-line">
                            <span className="kpi-title-text">In Progress</span>
                            <div className="kpi-icon-pill icon-amber">
                                <i className="bi bi-arrow-repeat"></i>
                            </div>
                        </div>
                        <div className="kpi-value-container">
                            <span className="kpi-big-number">
                                <CountUp end={inProgressMilestones} />
                            </span>
                            <span className="kpi-tag-chip tag-amber">
                                <CountUp end={inProgressPercent} decimals={1} />% Active
                            </span>
                        </div>
                        <div className="kpi-mini-track">
                            <div className="kpi-mini-fill bg-amber" style={{ width: `${inProgressPercent}%` }}></div>
                        </div>
                        <span className="kpi-caption">Currently under active development</span>
                    </div>

                    {/* Card 4: Upcoming / Pending */}
                    <div className="kpi-card kpi-card-sky">
                        <div className="kpi-card-header-line">
                            <span className="kpi-title-text">Upcoming / Pending</span>
                            <div className="kpi-icon-pill icon-sky">
                                <i className="bi bi-hourglass-split"></i>
                            </div>
                        </div>
                        <div className="kpi-value-container">
                            <span className="kpi-big-number">
                                <CountUp end={pendingMilestones} />
                            </span>
                            <span className="kpi-tag-chip tag-sky">
                                <CountUp end={pendingPercent} decimals={1} />% Queue
                            </span>
                        </div>
                        <div className="kpi-mini-track">
                            <div className="kpi-mini-fill bg-sky" style={{ width: `${pendingPercent}%` }}></div>
                        </div>
                        <span className="kpi-caption">Scheduled for next phases</span>
                    </div>

                    {/* Card 5: Task Deliverables */}
                    <div className="kpi-card kpi-card-indigo">
                        <div className="kpi-card-header-line">
                            <span className="kpi-title-text">Task Deliverables</span>
                            <div className="kpi-icon-pill icon-indigo">
                                <i className="bi bi-kanban"></i>
                            </div>
                        </div>
                        <div className="kpi-value-container">
                            <span className="kpi-big-number">
                                <CountUp end={totalTasks} />
                            </span>
                            <span className="kpi-tag-chip tag-indigo">
                                <CountUp end={completedTasks} />/<CountUp end={totalTasks} />
                            </span>
                        </div>
                        <div className="kpi-mini-track">
                            <div className="kpi-mini-fill bg-indigo" style={{ width: `${taskCompletionPercent}%` }}></div>
                        </div>
                        <span className="kpi-caption">
                            <CountUp end={taskCompletionPercent} />% of tasks completed
                        </span>
                    </div>
                </div>

                {/* Middle Row: Progress + Milestone Distribution + Current Milestone */}
                <div className="analytics-spotlight-grid">
                    {/* Widget 1: Project Progress */}
                    <div className="pro-card project-progress-card">
                        <div className="pro-card-header">
                            <div className="card-title-group">
                                <div className="card-title-icon indigo-soft">
                                    <i className="bi bi-speedometer2"></i>
                                </div>
                                <div>
                                    <h4 className="pro-card-title">Project Progress</h4>
                                    <span className="pro-card-subtitle">Overall completion trajectory</span>
                                </div>
                            </div>
                            <span className="live-status-pill">
                                <span className="status-indicator-dot"></span>
                                {dashboard?.project?.projectStatus || "Ongoing"}
                            </span>
                        </div>

                        <div className="overall-progress-body">
                            <div className="progress-metric-display">
                                <div className="metric-number-wrapper">
                                    <span className="big-metric-percent">
                                        <CountUp end={dashboard?.summary?.overallProgress || 0} />
                                        <span className="percent-symbol">%</span>
                                    </span>
                                </div>
                                <span className="metric-status-text">
                                    {dashboard?.summary?.overallProgress >= 100 
                                        ? "Project fully completed" 
                                        : dashboard?.summary?.overallProgress >= 50 
                                            ? "Milestones on steady pace" 
                                            : "Initial development phase"}
                                </span>
                            </div>

                            <div className="pro-progress-bar-container">
                                <div 
                                    className="pro-progress-bar-fill gradient-primary"
                                    style={{ width: `${Math.min(100, Math.max(0, dashboard?.summary?.overallProgress || 0))}%` }}
                                ></div>
                            </div>

                            <div className="project-meta-grid">
                                <div className="meta-box">
                                    <div className="meta-box-icon">
                                        <i className="bi bi-calendar-event"></i>
                                    </div>
                                    <div className="meta-box-content">
                                        <span className="meta-box-label">Kickoff Date</span>
                                        <span className="meta-box-value">
                                            {dashboard?.project?.startDate || dashboard?.project?.start
                                                ? new Date(dashboard.project.startDate || dashboard.project.start).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="meta-box">
                                    <div className="meta-box-icon">
                                        <i className="bi bi-flag"></i>
                                    </div>
                                    <div className="meta-box-content">
                                        <span className="meta-box-label">Target Completion</span>
                                        <span className="meta-box-value">
                                            {dashboard?.project?.estimatedCompletion || dashboard?.project?.end
                                                ? new Date(dashboard.project.estimatedCompletion || dashboard.project.end).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="meta-box">
                                    <div className="meta-box-icon">
                                        <i className="bi bi-briefcase"></i>
                                    </div>
                                    <div className="meta-box-content">
                                        <span className="meta-box-label">Active Project</span>
                                        <span className="meta-box-value text-truncate" title={currentProject?.name}>
                                            {currentProject?.name || "Main Workspace"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Widget 2: Milestone Health Distribution */}
                    <div className="pro-card milestone-distribution-card">
                        <div className="pro-card-header">
                            <div className="card-title-group">
                                <div className="card-title-icon green-soft">
                                    <i className="bi bi-pie-chart"></i>
                                </div>
                                <div>
                                    <h4 className="pro-card-title">Milestone Distribution</h4>
                                    <span className="pro-card-subtitle">Status breakdown & health</span>
                                </div>
                            </div>
                        </div>

                        <div className="donut-chart-layout">
                            <div className="donut-visual-container">
                                <svg width="96" height="96" viewBox="0 0 96 96" className="donut-svg-modern">
                                    {/* Base background track */}
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r={radius}
                                        fill="transparent"
                                        stroke="#f1f5f9"
                                        strokeWidth="9"
                                    />
                                    {/* Completed Arc (Green) */}
                                    {completedStroke > 0 && (
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#10b981"
                                            strokeWidth="9"
                                            strokeDasharray={`${completedStroke} ${circumference - completedStroke}`}
                                            strokeDashoffset={completedOffset}
                                            className="donut-segment"
                                        />
                                    )}
                                    {/* In Progress Arc (Amber) */}
                                    {inProgressStroke > 0 && (
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#f59e0b"
                                            strokeWidth="9"
                                            strokeDasharray={`${inProgressStroke} ${circumference - inProgressStroke}`}
                                            strokeDashoffset={inProgressOffset}
                                            className="donut-segment"
                                        />
                                    )}
                                    {/* Pending Arc (Purple) */}
                                    {pendingStroke > 0 && (
                                        <circle
                                            cx="48"
                                            cy="48"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#8b5cf6"
                                            strokeWidth="9"
                                            strokeDasharray={`${pendingStroke} ${circumference - pendingStroke}`}
                                            strokeDashoffset={pendingOffset}
                                            className="donut-segment"
                                        />
                                    )}
                                </svg>
                                <div className="donut-center-badge">
                                    <span className="donut-center-count">
                                        <CountUp end={totalMilestones} />
                                    </span>
                                    <span className="donut-center-tag">Total</span>
                                </div>
                            </div>

                            <div className="donut-legend-modern">
                                <div className="legend-row">
                                    <div className="legend-title-wrap">
                                        <span className="legend-indicator dot-green"></span>
                                        <span className="legend-name">Completed</span>
                                    </div>
                                    <div className="legend-stats-wrap">
                                        <span className="legend-count">
                                            <CountUp end={completedMilestones} />
                                        </span>
                                        <span className="legend-percent-pill pill-green">
                                            <CountUp end={completedPercent} decimals={0} />%
                                        </span>
                                    </div>
                                </div>

                                <div className="legend-row">
                                    <div className="legend-title-wrap">
                                        <span className="legend-indicator dot-amber"></span>
                                        <span className="legend-name">In Progress</span>
                                    </div>
                                    <div className="legend-stats-wrap">
                                        <span className="legend-count">
                                            <CountUp end={inProgressMilestones} />
                                        </span>
                                        <span className="legend-percent-pill pill-amber">
                                            <CountUp end={inProgressPercent} decimals={0} />%
                                        </span>
                                    </div>
                                </div>

                                <div className="legend-row">
                                    <div className="legend-title-wrap">
                                        <span className="legend-indicator dot-purple"></span>
                                        <span className="legend-name">Pending</span>
                                    </div>
                                    <div className="legend-stats-wrap">
                                        <span className="legend-count">
                                            <CountUp end={pendingMilestones} />
                                        </span>
                                        <span className="legend-percent-pill pill-purple">
                                            <CountUp end={pendingPercent} decimals={0} />%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Widget 3: Current Milestone Spotlight */}
                    <div className="pro-card current-milestone-card">
                        <div className="pro-card-header">
                            <div className="card-title-group">
                                <div className="card-title-icon amber-soft">
                                    <i className="bi bi-lightning-charge"></i>
                                </div>
                                <div>
                                    <h4 className="pro-card-title">Current Milestone</h4>
                                    <span className="pro-card-subtitle">Active delivery target</span>
                                </div>
                            </div>
                            <span className="current-status-badge">
                                {dashboard?.currentMilestone?.status || "In Progress"}
                            </span>
                        </div>

                        <div className="current-milestone-body">
                            <h3 className="spotlight-milestone-name">
                                {dashboard?.currentMilestone?.title || "No Active Milestone"}
                            </h3>

                            <div className="spotlight-dates-row">
                                <div className="date-chip">
                                    <i className="bi bi-calendar-check"></i>
                                    <span>
                                        Start: {dashboard?.currentMilestone?.startDate
                                            ? new Date(dashboard.currentMilestone.startDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "—"}
                                    </span>
                                </div>
                                <div className="date-chip">
                                    <i className="bi bi-clock-history"></i>
                                    <span>
                                        Due: {dashboard?.currentMilestone?.completionDate
                                            ? new Date(dashboard.currentMilestone.completionDate).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })
                                            : "—"}
                                    </span>
                                </div>
                            </div>

                            <div className="spotlight-progress-section">
                                <div className="progress-label-row">
                                    <span className="progress-title">Milestone Progress</span>
                                    <span className="progress-val-badge">
                                        <CountUp end={dashboard?.currentMilestone?.progress || 0} />%
                                    </span>
                                </div>
                                <div className="spotlight-progress-track">
                                    <div 
                                        className="spotlight-progress-fill gradient-amber"
                                        style={{ width: `${Math.min(100, Math.max(0, dashboard?.currentMilestone?.progress || 0))}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="spotlight-task-stats">
                                <div className="task-stat-item">
                                    <div className="stat-icon-pill green-soft">
                                        <i className="bi bi-check-lg"></i>
                                    </div>
                                    <div>
                                        <div className="stat-item-num">
                                            <CountUp end={dashboard?.currentMilestone?.completedTasks ?? 0} />
                                        </div>
                                        <div className="stat-item-label">Tasks Finished</div>
                                    </div>
                                </div>

                                <div className="task-stat-item">
                                    <div className="stat-icon-pill amber-soft">
                                        <i className="bi bi-hourglass-split"></i>
                                    </div>
                                    <div>
                                        <div className="stat-item-num">
                                            <CountUp end={dashboard?.currentMilestone?.remainingTasks ?? 0} />
                                        </div>
                                        <div className="stat-item-label">Tasks Remaining</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Table + Deliverables & Activity Stack */}
                <div className="bottom-dashboard-grid">
                    {/* Left/Main Column: Milestones Table */}
                    <div className="pro-card milestones-table-card">
                        <div className="pro-card-header">
                            <div className="card-title-group">
                                <div className="card-title-icon purple-soft">
                                    <i className="bi bi-table"></i>
                                </div>
                                <div>
                                    <h4 className="pro-card-title">Milestone Roadmap</h4>
                                    <span className="pro-card-subtitle">Comprehensive delivery schedule</span>
                                </div>
                            </div>
                            <Link to="/dashboard/milestones" className="pro-view-all-btn">
                                View Full Roadmap <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>

                        <div className="table-responsive-wrapper">
                            <table className="pro-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '45px' }}>#</th>
                                        <th>Milestone Name</th>
                                        <th>Timeline</th>
                                        <th style={{ minWidth: '120px' }}>Progress</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Tasks & Scope</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard?.milestones?.length > 0 ? (
                                        dashboard.milestones.map((item, index) => {
                                            const progress = item.status === "Completed" ? 100 : item.progress || 0;
                                            const statusClass = 
                                                item.status === "Completed" ? "status-pill-completed" :
                                                item.status === "In Progress" ? "status-pill-progress" : 
                                                "status-pill-pending";

                                            return (
                                                <tr key={item._id} className="pro-table-row">
                                                    <td className="cell-index">{String(index + 1).padStart(2, '0')}</td>
                                                    
                                                    <td className="cell-title">
                                                        <Link 
                                                            to={`/dashboard/milestone-tasks/${item._id}`}
                                                            className="milestone-name-link"
                                                        >
                                                            <span className="milestone-bullet"></span>
                                                            {item.title || item.name}
                                                        </Link>
                                                    </td>

                                                    <td className="cell-timeline">
                                                        <div className="timeline-date-stack">
                                                            <span className="date-start">
                                                                {item.startDate ? new Date(item.startDate).toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short"
                                                                }) : "—"}
                                                            </span>
                                                            <span className="date-arrow">→</span>
                                                            <span className="date-end">
                                                                {item.completionDate ? new Date(item.completionDate).toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric"
                                                                }) : "—"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="cell-progress">
                                                        <div className="table-progress-bar-wrap">
                                                            <div className="table-bar-track">
                                                                <div 
                                                                    className={`table-bar-fill ${
                                                                        item.status === "Completed" ? "bg-emerald" :
                                                                        item.status === "In Progress" ? "bg-amber" : "bg-slate"
                                                                    }`}
                                                                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="table-bar-pct">{progress}%</span>
                                                        </div>
                                                    </td>

                                                    <td className="cell-status">
                                                        <span className={`status-pill ${statusClass}`}>
                                                            <span className="status-dot"></span>
                                                            {item.status || "Pending"}
                                                        </span>
                                                    </td>

                                                    <td className="cell-action" style={{ textAlign: 'right' }}>
                                                        <Link
                                                            to={`/dashboard/milestone-tasks/${item._id}`}
                                                            className="task-action-chip"
                                                        >
                                                            <i className="bi bi-check2-square"></i>
                                                            <span>{item.completedTasks || 0}/{item.totalTasks || 0} Tasks</span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="table-empty-state">
                                                <div className="empty-content">
                                                    <i className="bi bi-inbox empty-icon"></i>
                                                    <p>No milestone records found for this project</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Column: Deliverables + Activity Feed */}
                    <div className="side-widgets-column">
                        {/* Widget 2: Upcoming Deliverables */}
                        <div className="pro-card deliverables-card">
                            <div className="pro-card-header">
                                <div className="card-title-group">
                                    <div className="card-title-icon sky-soft">
                                        <i className="bi bi-calendar4-week"></i>
                                    </div>
                                    <div>
                                        <h4 className="pro-card-title">Key Deliverables</h4>
                                        <span className="pro-card-subtitle">Upcoming releases</span>
                                    </div>
                                </div>
                                <Link to="/dashboard/milestones" className="pro-view-all-btn">
                                    View <i className="bi bi-arrow-right"></i>
                                </Link>
                            </div>

                            <div className="deliverables-stack-list">
                                {dashboard?.upcomingDeliverables?.length > 0 ? (
                                    dashboard.upcomingDeliverables.map((item) => {
                                        const date = new Date(item.completionDate || item.startDate || Date.now());
                                        const isCompleted = item.status === 'Completed';
                                        const isInProgress = item.status === 'In Progress';

                                        return (
                                            <div className="deliverable-item-card" key={item._id}>
                                                <div className={`date-calendar-box ${isCompleted ? 'box-green' : isInProgress ? 'box-amber' : 'box-purple'}`}>
                                                    <span className="cal-day">
                                                        {date.toLocaleDateString("en-GB", { day: "2-digit" })}
                                                    </span>
                                                    <span className="cal-month">
                                                        {date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="deliverable-content">
                                                    <h5 className="deliverable-name" title={item.title}>
                                                        {item.title}
                                                    </h5>
                                                    <div className="deliverable-badges">
                                                        <span className={`status-micro-pill ${isCompleted ? 'micro-green' : isInProgress ? 'micro-amber' : 'micro-purple'}`}>
                                                            {item.status || "Pending"}
                                                        </span>
                                                        <span className="deliverable-due-text">
                                                            {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-deliverables-box">
                                        <i className="bi bi-calendar-x"></i>
                                        <p>No upcoming deliverables due</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Widget 3: Live Activity Feed */}
                        <div className="pro-card activity-feed-card">
                            <div className="pro-card-header">
                                <div className="card-title-group">
                                    <div className="card-title-icon indigo-soft">
                                        <i className="bi bi-activity"></i>
                                    </div>
                                    <div>
                                        <h4 className="pro-card-title">Live Activity</h4>
                                        <span className="pro-card-subtitle">Real-time team updates</span>
                                    </div>
                                </div>
                            </div>

                            <div className="activity-timeline-feed">
                                {dashboard?.recentActivities?.length > 0 ? (
                                    dashboard.recentActivities.map((item, index) => {
                                        const actDate = item.updatedAt ? new Date(item.updatedAt) : new Date();
                                        const formattedTime = actDate.toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        });

                                        const isDone = item.status === 'Completed' || item.status === 'Done';
                                        const isTesting = item.status === 'Testing' || item.status === 'QA';
                                        const inProg = item.status === 'In Progress' || item.status === 'In-Progress';

                                        return (
                                            <div className="activity-timeline-node" key={item.id || index}>
                                                <div className={`timeline-indicator-icon ${isDone ? 'node-green' : isTesting ? 'node-purple' : inProg ? 'node-amber' : 'node-sky'}`}>
                                                    <i className={`bi ${isDone ? 'bi-check2' : isTesting ? 'bi-bug' : inProg ? 'bi-gear-wide-connected' : 'bi-clock'}`}></i>
                                                </div>

                                                <div className="timeline-node-body">
                                                    <div className="activity-task-title">
                                                        {item.title}
                                                    </div>
                                                    <div className="activity-meta-line">
                                                        <span className={`activity-status-tag ${isDone ? 'tag-green' : isTesting ? 'tag-purple' : inProg ? 'tag-amber' : 'tag-sky'}`}>
                                                            {item.status}
                                                        </span>
                                                        <span className="activity-assignee">
                                                            by <strong>{item.assigneeName || 'Team'}</strong>
                                                        </span>
                                                        <span className="activity-timestamp">• {formattedTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="empty-activity-box">
                                        <i className="bi bi-clock-history"></i>
                                        <p>No recent activity recorded yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
