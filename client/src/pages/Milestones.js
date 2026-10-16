import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDashboard, getClientMilestonesAction } from '../redux/actions';
import moment from 'moment';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import './Dashboard.css';
import './Milestones.css';

// Smooth animated counter component
const CountUp = ({ end = 0, duration = 800, decimals = 0 }) => {
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
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [end, duration]);

    return <>{decimals > 0 ? count.toFixed(decimals) : Math.round(count)}</>;
};

const Milestones = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { dashboard, clientMilestones, clientMilestonesLoading } = useSelector(s => ({
        dashboard: s.Auth.dashboard,
        clientMilestones: s.Auth.clientMilestones || [],
        clientMilestonesLoading: s.Auth.clientMilestonesLoading,
    }));

    // Initialize selected project from query params or localStorage
    const [selProject, setSelProject] = useState(() => {
        try {
            const fromQuery = new URLSearchParams(window.location.search).get('projectId');
            if (fromQuery) return fromQuery;
            return localStorage.getItem('client_selected_project_id') || '';
        } catch (e) {
            return '';
        }
    });

    // Initialize milestone type (Ongoing vs AMC) from query params or localStorage
    const [milestoneType, setMilestoneType] = useState(() => {
        try {
            const fromQuery = new URLSearchParams(window.location.search).get('type');
            if (fromQuery) return fromQuery;
            return localStorage.getItem('client_selected_milestone_type') || 'Ongoing';
        } catch (e) {
            return 'Ongoing';
        }
    });

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const projectDropdownRef = useRef(null);

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    const projects = useMemo(() => dashboard?.projects || [], [dashboard?.projects]);

    // Sync state if URL search parameters change
    useEffect(() => {
        const queryProj = searchParams.get('projectId');
        if (queryProj && queryProj !== selProject) {
            setSelProject(queryProj);
            try {
                localStorage.setItem('client_selected_project_id', queryProj);
            } catch (e) { }
        }
        const queryType = searchParams.get('type');
        if (queryType && queryType !== milestoneType) {
            setMilestoneType(queryType);
            try {
                localStorage.setItem('client_selected_milestone_type', queryType);
            } catch (e) { }
        }
    }, [searchParams]);

    // Restore selected project when projects list is loaded
    useEffect(() => {
        if (projects.length > 0) {
            const savedProject = localStorage.getItem('client_selected_project_id');
            const target = selProject || savedProject;
            const projectExists = projects.some(p => p._id === target);

            if (projectExists) {
                if (selProject !== target) {
                    setSelProject(target);
                }
                try {
                    localStorage.setItem('client_selected_project_id', target);
                } catch (e) { }
            } else {
                setSelProject(projects[0]._id);
                try {
                    localStorage.setItem('client_selected_project_id', projects[0]._id);
                } catch (e) { }
            }
        }
    }, [projects]);

    const handleSelectProject = (projectId) => {
        setSelProject(projectId);
        try {
            localStorage.setItem('client_selected_project_id', projectId);
        } catch (e) { }
        setIsProjectDropdownOpen(false);
    };

    const handleSelectMilestoneType = (type) => {
        setMilestoneType(type);
        setStatusFilter('all');
        try {
            localStorage.setItem('client_selected_milestone_type', type);
        } catch (e) { }
    };

    useEffect(() => {
        if (selProject) {
            dispatch(getClientMilestonesAction(selProject, true, milestoneType));
        }
    }, [selProject, milestoneType, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentProject = projects.find(p => p._id === selProject) || dashboard?.project;
    const rawMilestones = useMemo(() => Array.isArray(clientMilestones) ? clientMilestones : [], [clientMilestones]);

    // Filter milestones
    const filtered = useMemo(() => {
        return rawMilestones.filter((m) => {
            const matchesSearch = !search.trim() || 
                (m.title || m.name || '').toLowerCase().includes(search.toLowerCase());

            let matchesStatus = true;
            if (milestoneType === 'AMC') {
                if (statusFilter === 'Completed') matchesStatus = m.isDelivered === true;
                else if (statusFilter === 'In Progress') matchesStatus = m.isDelivered !== true;
            } else {
                if (statusFilter === 'Completed') matchesStatus = m.status === 'Completed';
                else if (statusFilter === 'In Progress') matchesStatus = m.status === 'In Progress';
                else if (statusFilter === 'Not Started') matchesStatus = m.status === 'Not Started' || !m.status;
            }

            return matchesSearch && matchesStatus;
        });
    }, [rawMilestones, search, statusFilter, milestoneType]);

    // Computed Stats
    const totalCount = rawMilestones.length;
    const completedCount = milestoneType === 'AMC'
        ? rawMilestones.filter(m => m.isDelivered === true).length
        : rawMilestones.filter(m => m.status === 'Completed').length;
    const inProgressCount = milestoneType === 'AMC'
        ? rawMilestones.filter(m => m.isDelivered !== true).length
        : rawMilestones.filter(m => m.status === 'In Progress').length;
    const notStartedCount = milestoneType === 'AMC'
        ? 0
        : rawMilestones.filter(m => m.status === 'Not Started' || !m.status).length;
    const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    // AMC Specific Stats
    const totalAllocatedAmcHours = currentProject?.amcHours || (rawMilestones[0]?.amcHours) || 0;
    const totalWorkedHours = rawMilestones.reduce((acc, m) => acc + (Number(m.workedHours) || 0), 0);
    const latestRemainingHours = rawMilestones.length > 0 
        ? (rawMilestones[rawMilestones.length - 1]?.remainingHours ?? (totalAllocatedAmcHours - totalWorkedHours))
        : 0;

    const nextTarget = rawMilestones.find(m => m.status === 'In Progress') || rawMilestones[0];

    const daysLeft = (end) => (end ? moment(end).diff(moment(), 'days') : null);

    const getDaysBadge = (days, status) => {
        if (status === 'Completed') {
            return <span className="ms-days-badge days-normal"><i className="bi bi-check2"></i> Delivered</span>;
        }
        if (days === null) return <span className="text-muted small">-</span>;
        if (days < 0) {
            return <span className="ms-days-badge days-overdue"><i className="bi bi-clock-history"></i> {Math.abs(days)}d overdue</span>;
        }
        if (days <= 3) {
            return <span className="ms-days-badge days-warning"><i className="bi bi-hourglass-bottom"></i> {days}d left</span>;
        }
        return <span className="ms-days-badge days-normal"><i className="bi bi-calendar2-check"></i> {days}d left</span>;
    };

    const getPriorityBadge = (priority) => {
        const p = (priority || 'Medium').toLowerCase();
        if (p === 'high') return <span className="ms-prio-badge prio-high">High</span>;
        if (p === 'low') return <span className="ms-prio-badge prio-low">Low</span>;
        return <span className="ms-prio-badge prio-medium">Medium</span>;
    };

    const getStatusBadge = (status) => {
        const s = status || 'Not Started';
        if (s === 'Completed') return <span className="ms-status-pill status-completed"><i className="bi bi-check-circle-fill"></i> Completed</span>;
        if (s === 'In Progress') return <span className="ms-status-pill status-inprogress"><i className="bi bi-hourglass-split"></i> In Progress</span>;
        return <span className="ms-status-pill status-notstarted"><i className="bi bi-dash-circle"></i> Not Started</span>;
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="milestones" />

            <main className="dash-main">
                <CommonHeader title={milestoneType === 'AMC' ? "AMC Milestones" : "Milestones"} />

                {/* Hero Header Section */}
                <div className="milestones-hero-bar">
                    <div className="milestones-hero-left">
                        <div className="milestones-badge-tag">
                            <i className={milestoneType === 'AMC' ? "bi bi-shield-check" : "bi bi-flag-fill"}></i>
                            {milestoneType === 'AMC' ? "Annual Maintenance Contract" : "Roadmap & Delivery Phases"}
                        </div>
                        <h2 className="milestones-hero-title">
                            {milestoneType === 'AMC' ? "Project AMC Milestones" : "Project Milestones & Roadmap"}
                        </h2>
                        <p className="milestones-hero-subtitle">
                            {milestoneType === 'AMC' 
                                ? "Track monthly AMC maintenance cycles, allocated support quota, consumed team hours, and remaining balance."
                                : "Track development deliverables, milestone timelines, delivery velocity, and subtask execution."}
                        </p>

                        <div className="milestones-meta-chips">
                            <div className="ms-meta-chip">
                                <i className="bi bi-folder2-open"></i>
                                <span>{currentProject?.name || "Active Workspace"}</span>
                            </div>
                            <div className="ms-meta-chip ms-chip-live">
                                <span className="pulse-dot-green"></span>
                                <span>{milestoneType === 'AMC' ? "AMC Active" : "Live Delivery Tracker"}</span>
                            </div>
                            <div className="ms-meta-chip">
                                <i className="bi bi-layers"></i>
                                <span>{totalCount} {milestoneType === 'AMC' ? "Cycles" : "Total Phases"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="milestones-hero-actions">
                        {/* Dual Type Switcher Pill */}
                        <div className="ms-type-pill-group">
                            <button
                                type="button"
                                className={`ms-type-btn ${milestoneType === 'Ongoing' ? 'active' : ''}`}
                                onClick={() => handleSelectMilestoneType('Ongoing')}
                            >
                                <i className="bi bi-layers-fill"></i>
                                <span>Ongoing</span>
                            </button>
                            <button
                                type="button"
                                className={`ms-type-btn ${milestoneType === 'AMC' ? 'active' : ''}`}
                                onClick={() => handleSelectMilestoneType('AMC')}
                            >
                                <i className="bi bi-shield-check"></i>
                                <span>AMC</span>
                            </button>
                        </div>

                        {/* Project Switcher Dropdown */}
                        {projects.length > 0 && (
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
                                            {projects.map((p) => {
                                                const isSelected = p._id === selProject;
                                                return (
                                                    <div
                                                        key={p._id}
                                                        className={`project-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleSelectProject(p._id)}
                                                    >
                                                        <div className="item-icon-wrap">
                                                            <i className="bi bi-folder2-open"></i>
                                                        </div>
                                                        <span className="item-name">{p.name}</span>
                                                        {isSelected && <i className="bi bi-check2 item-check"></i>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button 
                            type="button" 
                            className="btn-ms-action" 
                            onClick={() => {
                                if (selProject) dispatch(getClientMilestonesAction(selProject, true, milestoneType));
                            }}
                            title="Refresh milestones"
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* 4 Executive KPI Stat Cards */}
                <div className="ms-kpi-grid">
                    {milestoneType === 'AMC' ? (
                        <>
                            {/* Card 1: Total AMC Months */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">Total AMC Cycles</span>
                                    <div className="ms-kpi-icon ms-icon-purple">
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className="ms-kpi-val text-primary">
                                        <CountUp end={totalCount} />
                                    </span>
                                    <span className="ms-kpi-tag tag-purple">Months</span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className="ms-kpi-progress-bar bg-bar-purple" style={{ width: '100%' }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    Total planned AMC support duration
                                </span>
                            </div>

                            {/* Card 2: Allocated AMC Hours */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">Allocated Hours</span>
                                    <div className="ms-kpi-icon ms-icon-sky">
                                        <i className="bi bi-clock-history"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className="ms-kpi-val text-dark">
                                        <CountUp end={totalAllocatedAmcHours} />
                                    </span>
                                    <span className="ms-kpi-tag tag-sky">Hours</span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className="ms-kpi-progress-bar bg-bar-sky" style={{ width: '100%' }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    Total contracted AMC support capacity
                                </span>
                            </div>

                            {/* Card 3: Worked Hours */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">Consumed Hours</span>
                                    <div className="ms-kpi-icon ms-icon-amber">
                                        <i className="bi bi-stopwatch-fill"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className="ms-kpi-val text-amber">
                                        <CountUp end={totalWorkedHours} decimals={1} />
                                    </span>
                                    <span className="ms-kpi-tag tag-amber">Hours</span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className="ms-kpi-progress-bar bg-bar-amber" style={{ width: `${totalAllocatedAmcHours > 0 ? Math.min(100, (totalWorkedHours / totalAllocatedAmcHours) * 100) : 0}%` }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    Hours delivered by engineering team
                                </span>
                            </div>

                            {/* Card 4: Remaining Hours */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">Remaining Balance</span>
                                    <div className="ms-kpi-icon ms-icon-emerald">
                                        <i className="bi bi-hourglass"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className={`ms-kpi-val ${Number(latestRemainingHours) < 0 ? 'text-danger' : 'text-success'}`}>
                                        <CountUp end={latestRemainingHours} decimals={1} />
                                    </span>
                                    <span className={`ms-kpi-tag ${Number(latestRemainingHours) < 0 ? 'tag-amber' : 'tag-emerald'}`}>
                                        Hours Left
                                    </span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className={`ms-kpi-progress-bar ${Number(latestRemainingHours) < 0 ? 'bg-bar-amber' : 'bg-bar-emerald'}`} style={{ width: `${totalAllocatedAmcHours > 0 ? Math.max(0, Math.min(100, (latestRemainingHours / totalAllocatedAmcHours) * 100)) : 100}%` }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    Current available AMC balance
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Card 1: Total Milestones */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">Total Milestones</span>
                                    <div className="ms-kpi-icon ms-icon-purple">
                                        <i className="bi bi-layers-fill"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className="ms-kpi-val text-primary">
                                        <CountUp end={totalCount} />
                                    </span>
                                    <span className="ms-kpi-tag tag-purple">Phases</span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className="ms-kpi-progress-bar bg-bar-purple" style={{ width: '100%' }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    Full scope of active project
                                </span>
                            </div>

                            {/* Card 2: Completed Milestones */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">Delivered</span>
                                    <div className="ms-kpi-icon ms-icon-emerald">
                                        <i className="bi bi-check2-circle"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className="ms-kpi-val text-success">
                                        <CountUp end={completedCount} />
                                    </span>
                                    <span className="ms-kpi-tag tag-emerald">
                                        <CountUp end={completionRate} decimals={0} />% Done
                                    </span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className="ms-kpi-progress-bar bg-bar-emerald" style={{ width: `${completionRate}%` }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    {completedCount} of {totalCount} phases delivered
                                </span>
                            </div>

                            {/* Card 3: In Progress */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">In Progress</span>
                                    <div className="ms-kpi-icon ms-icon-amber">
                                        <i className="bi bi-hourglass-split"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className="ms-kpi-val text-amber">
                                        <CountUp end={inProgressCount} />
                                    </span>
                                    <span className="ms-kpi-tag tag-amber">Active</span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className="ms-kpi-progress-bar bg-bar-amber" style={{ width: `${totalCount > 0 ? (inProgressCount / totalCount) * 100 : 0}%` }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    Currently undergoing development
                                </span>
                            </div>

                            {/* Card 4: Current Target */}
                            <div className="ms-kpi-card">
                                <div className="ms-kpi-top">
                                    <span className="ms-kpi-label">Current Target</span>
                                    <div className="ms-kpi-icon ms-icon-sky">
                                        <i className="bi bi-flag-fill"></i>
                                    </div>
                                </div>
                                <div className="ms-kpi-main">
                                    <span className="ms-kpi-val text-dark" style={{ fontSize: '18px' }} title={nextTarget?.title || nextTarget?.name}>
                                        {nextTarget?.title || nextTarget?.name || "None queued"}
                                    </span>
                                    <span className="ms-kpi-tag tag-sky">Active</span>
                                </div>
                                <div className="ms-kpi-progress">
                                    <div className="ms-kpi-progress-bar bg-bar-sky" style={{ width: `${nextTarget?.progress || 30}%` }}></div>
                                </div>
                                <span className="ms-kpi-sub">
                                    Due: {nextTarget?.completionDate ? moment.utc(nextTarget.completionDate).format('DD MMM YYYY') : 'Pending'}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Milestones Directory Card */}
                <div className="ms-main-card">
                    <div className="ms-toolbar">
                        <div className="ms-toolbar-left">
                            <h3 className="ms-toolbar-title">
                                {milestoneType === 'AMC' ? "AMC Milestones Status" : "Milestones Detailed Status"}
                            </h3>
                            <span className="ms-count-badge">
                                {filtered.length} of {totalCount} {milestoneType === 'AMC' ? "Cycles" : "Phases"}
                            </span>
                        </div>

                        <div className="ms-toolbar-controls">
                            {/* Filter Tabs */}
                            <div className="ms-filter-tabs">
                                <button
                                    type="button"
                                    className={`ms-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    <span>All</span>
                                    <span className="ms-filter-count">{totalCount}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`ms-filter-btn ${statusFilter === 'In Progress' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('In Progress')}
                                >
                                    <span>In Progress</span>
                                    <span className="ms-filter-count">{inProgressCount}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`ms-filter-btn ${statusFilter === 'Completed' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('Completed')}
                                >
                                    <span>{milestoneType === 'AMC' ? "Delivered" : "Completed"}</span>
                                    <span className="ms-filter-count">{completedCount}</span>
                                </button>
                                {milestoneType !== 'AMC' && (
                                    <button
                                        type="button"
                                        className={`ms-filter-btn ${statusFilter === 'Not Started' ? 'active' : ''}`}
                                        onClick={() => setStatusFilter('Not Started')}
                                    >
                                        <span>Not Started</span>
                                        <span className="ms-filter-count">{notStartedCount}</span>
                                    </button>
                                )}
                            </div>

                            {/* Search Box */}
                            <div className="ms-search-box">
                                <i className="bi bi-search ms-search-icon"></i>
                                <input
                                    type="text"
                                    className="ms-search-input"
                                    placeholder={milestoneType === 'AMC' ? "Search AMC cycles..." : "Search milestones..."}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button
                                        type="button"
                                        className="ms-search-clear"
                                        onClick={() => setSearch('')}
                                        title="Clear search"
                                    >
                                        <i className="bi bi-x-circle-fill"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {clientMilestonesLoading ? (
                        <div className="ms-loading-wrap">
                            <div className="ms-spinner"></div>
                            <div>Loading {milestoneType === 'AMC' ? "AMC cycles" : "project milestones"}...</div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="ms-empty-state">
                            <div className="ms-empty-icon-wrap">
                                <i className={milestoneType === 'AMC' ? "bi bi-shield-check" : "bi bi-flag"}></i>
                            </div>
                            <h4 className="ms-empty-title">
                                {milestoneType === 'AMC' ? "No AMC Milestones Found" : "No Milestones Found"}
                            </h4>
                            <p className="ms-empty-desc">
                                {search || statusFilter !== 'all'
                                    ? "No milestones matched your active search query or filter."
                                    : milestoneType === 'AMC'
                                        ? "No AMC cycles have been set up for this project."
                                        : "No milestones have been configured for this project yet."}
                            </p>
                            {(search || statusFilter !== 'all') && (
                                <button
                                    type="button"
                                    className="btn-ms-action"
                                    onClick={() => {
                                        setSearch('');
                                        setStatusFilter('all');
                                    }}
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    ) : milestoneType === 'AMC' ? (
                        /* AMC Table View */
                        <div className="table-responsive">
                            <table className="table-ms-custom table-ms-amc">
                                <thead>
                                    <tr>
                                        <th className="ms-col-idx">#</th>
                                        <th>AMC Cycle</th>
                                        <th>Description</th>
                                        <th className="text-center">Allocated Hours</th>
                                        <th className="text-center">Worked Hours</th>
                                        <th className="text-center">Remaining Hours</th>
                                        <th className="text-center">Status</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((m, idx) => {
                                        const taskUrl = `/dashboard/milestone-tasks/${m._id}?projectId=${selProject}&mName=${encodeURIComponent(
                                            m.title || 'AMC'
                                        )}&pName=${encodeURIComponent(
                                            projects.find(p => p._id === selProject)?.name || ""
                                        )}&type=${milestoneType}`;

                                        return (
                                            <tr
                                                key={m._id || idx}
                                                onClick={() => navigate(taskUrl)}
                                                title="Click to view tasks"
                                            >
                                                <td className="ms-col-idx">{idx + 1}</td>
                                                <td>
                                                    <div className="ms-title-cell">
                                                        <div className="ms-icon-avatar amc-icon-avatar">
                                                            <i className="bi bi-shield-check"></i>
                                                        </div>
                                                        <div className="ms-title-text fw-bold text-dark">
                                                            {m.title || m.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-muted small">
                                                        {m.description ? m.description.replace(/<[^>]+>/g, '').substring(0, 35) + '...' : 'Default AMC Cycle'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="ms-hours-pill hours-allocated">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {m.amcHours ?? 0} hrs
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className="ms-hours-pill hours-worked">
                                                        <i className="bi bi-stopwatch me-1"></i>
                                                        {m.workedHours ?? 0} hrs
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`ms-hours-pill ${Number(m.remainingHours) < 0 ? 'hours-negative' : 'hours-remaining'}`}>
                                                        <i className="bi bi-hourglass me-1"></i>
                                                        {m.remainingHours ?? 0} hrs
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {m.isDelivered ? (
                                                        <span className="ms-status-pill status-completed">
                                                            <i className="bi bi-check-circle-fill"></i> Delivered
                                                        </span>
                                                    ) : (
                                                        <span className="ms-status-pill status-inprogress">
                                                            <i className="bi bi-hourglass-split"></i> In Progress
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        type="button"
                                                        className="btn-view-tasks"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(taskUrl);
                                                        }}
                                                    >
                                                        <span>Tasks</span>
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Ongoing Milestones Table View */
                        <div className="table-responsive">
                            <table className="table-ms-custom">
                                <thead>
                                    <tr>
                                        <th className="ms-col-idx">#</th>
                                        <th>Milestone Name</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th className="text-center">Delivery / Days</th>
                                        <th className="text-center">Priority</th>
                                        <th className="text-center">Status</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((m, idx) => {
                                        const days = daysLeft(m.completionDate);
                                        const taskUrl = `/dashboard/milestone-tasks/${m._id}?projectId=${selProject}&mName=${encodeURIComponent(
                                            m.title || 'Milestone'
                                        )}&pName=${encodeURIComponent(
                                            projects.find(p => p._id === selProject)?.name || ""
                                        )}&type=${milestoneType}`;

                                        return (
                                            <tr
                                                key={m._id || idx}
                                                onClick={() => navigate(taskUrl)}
                                                title="Click to view tasks"
                                            >
                                                <td className="ms-col-idx">{idx + 1}</td>
                                                <td>
                                                    <div className="ms-title-cell">
                                                        <div className="ms-icon-avatar">
                                                            <i className="bi bi-flag-fill"></i>
                                                        </div>
                                                        <div className="ms-title-text">
                                                            {m.title || m.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="ms-date-pill">
                                                        <i className="bi bi-calendar3"></i>
                                                        {m.startDate ? moment.utc(m.startDate).format("DD MMM YYYY") : "N/A"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="ms-date-pill">
                                                        <i className="bi bi-calendar-check"></i>
                                                        {m.completionDate ? moment.utc(m.completionDate).format("DD MMM YYYY") : "N/A"}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    {getDaysBadge(days, m.status)}
                                                </td>
                                                <td className="text-center">
                                                    {getPriorityBadge(m.priority)}
                                                </td>
                                                <td className="text-center">
                                                    {getStatusBadge(m.status)}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        type="button"
                                                        className="btn-view-tasks"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(taskUrl);
                                                        }}
                                                    >
                                                        <span>Tasks</span>
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Milestones;
