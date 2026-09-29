import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import { getDashboard, getClientMilestonesAction, getClientTasksAction } from '../redux/actions';
import { Modal, Button } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommonHeader from "../components/commonHeader";
import CommonSidebar from '../components/commonSidebar';
import './Projects.css';

const COLUMN_CONFIG = [
    { id: 'To Do', title: 'To Do', color: '#f59e0b', bgLight: '#fffbeb', badgeBg: '#fef3c7', badgeColor: '#b45309' },
    { id: 'In Progress', title: 'In Progress', color: '#3b82f6', bgLight: '#eff6ff', badgeBg: '#dbeafe', badgeColor: '#1d4ed8' },
    { id: 'Testing', title: 'Testing', color: '#8b5cf6', bgLight: '#f5f3ff', badgeBg: '#ede9fe', badgeColor: '#6d28d9' },
    { id: 'Done', title: 'Done', color: '#10b981', bgLight: '#ecfdf5', badgeBg: '#d1fae5', badgeColor: '#047857' },
    { id: 'Hold', title: 'Hold', color: '#ef4444', bgLight: '#fef2f2', badgeBg: '#fee2e2', badgeColor: '#b91c1c' },
];

const Projects = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const { dashboard, loading, clientMilestones, clientTasks, clientTasksLoading } = useSelector((state) => ({
        dashboard: state.Auth.dashboard,
        loading: state.Auth.loading,
        clientMilestones: state.Auth.clientMilestones || [],
        clientTasks: state.Auth.clientTasks || [],
        clientTasksLoading: state.Auth.clientTasksLoading,
    }));

    // View state
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
    const [searchQuery, setSearchQuery] = useState('');

    // Filter states
    const [selectedProjectFilter, setSelectedProjectFilter] = useState(null);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
    const [startDate, endDate] = selectedDateRange;

    // Modal states
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showCopiedIndex, setShowCopiedIndex] = useState(null);

    // Initial load: Fetch dashboard data
    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    const projectsList = useMemo(() => {
        return dashboard?.projects || [];
    }, [dashboard]);

    // Active project object
    const currentProject = useMemo(() => {
        if (!selectedProjectFilter) {
            return dashboard?.project || projectsList[0] || null;
        }
        return projectsList.find(p => p._id === selectedProjectFilter.value) || dashboard?.project || null;
    }, [selectedProjectFilter, dashboard, projectsList]);

    // Set initial project selection and handle query params
    useEffect(() => {
        if (projectsList.length > 0 && !selectedProjectFilter) {
            const paramProjectId = searchParams.get('projectId');
            const target = paramProjectId
                ? projectsList.find(p => p._id === paramProjectId) || projectsList[0]
                : projectsList[0];

            setSelectedProjectFilter({
                value: target._id,
                label: target.name,
            });
        }
    }, [projectsList, searchParams, selectedProjectFilter]);

    // When active project changes, fetch its milestones & tasks
    useEffect(() => {
        if (selectedProjectFilter?.value) {
            dispatch(getClientMilestonesAction(selectedProjectFilter.value, true));
            dispatch(getClientTasksAction({
                projectId: selectedProjectFilter.value,
                milestoneId: selectedMilestone?.value || undefined
            }));
        }
    }, [selectedProjectFilter, selectedMilestone, dispatch]);

    // Set milestone filter if specified in URL query
    useEffect(() => {
        const paramMilestone = searchParams.get('milestone') || searchParams.get('milestoneId');
        if (paramMilestone && clientMilestones.length > 0 && !selectedMilestone) {
            const found = clientMilestones.find(m => m._id === paramMilestone || m.title?.toLowerCase() === paramMilestone.toLowerCase());
            if (found) {
                setSelectedMilestone({
                    value: found._id,
                    label: found.title
                });
            }
        }
    }, [searchParams, clientMilestones, selectedMilestone]);

    // Options for dropdown filters
    const projectOptions = useMemo(() => {
        return projectsList.map(project => ({
            value: project._id,
            label: project.name
        }));
    }, [projectsList]);

    const milestoneList = useMemo(() => {
        if (clientMilestones && clientMilestones.length > 0) return clientMilestones;
        return dashboard?.milestones || [];
    }, [clientMilestones, dashboard?.milestones]);

    const milestoneOptions = useMemo(() => {
        return milestoneList.map(item => ({
            value: item._id,
            label: item.title
        }));
    }, [milestoneList]);

    // Team members from current project and tasks
    const memberOptions = useMemo(() => {
        const membersMap = new Map();
        if (currentProject?.team && Array.isArray(currentProject.team)) {
            currentProject.team.forEach(m => {
                if (m && m._id && m.name) {
                    membersMap.set(m._id, m.name);
                }
            });
        }
        (clientTasks || []).forEach(t => {
            if (t?.assignee && t.assignee._id && t.assignee.name) {
                membersMap.set(t.assignee._id, t.assignee.name);
            }
        });
        return Array.from(membersMap.entries()).map(([id, name]) => ({
            value: id,
            label: name
        }));
    }, [currentProject, clientTasks]);

    const priorityOptions = [
        { value: 'Critical', label: 'Critical' },
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' },
    ];

    const handleProjectChange = (selected) => {
        setSelectedProjectFilter(selected);
        setSelectedMilestone(null);
        setSelectedMember(null);
        if (selected) {
            dispatch(getDashboard(selected.value));
        } else {
            dispatch(getDashboard());
        }
    };

    const handleMilestoneChange = (selected) => {
        setSelectedMilestone(selected);
    };

    const handleClearAllFilters = () => {
        setSelectedMilestone(null);
        setSelectedMember(null);
        setSelectedPriority(null);
        setSelectedDateRange([null, null]);
        setSearchQuery('');
    };

    const isAnyFilterActive = Boolean(
        selectedMilestone || selectedMember || selectedPriority || startDate || endDate || searchQuery
    );

    // Normalize task status to Kanban column ID
    const normalizeStatus = useCallback((rawStatus) => {
        const s = (rawStatus || '').trim().toLowerCase();
        if (s.includes('progress') || s.includes('ongoing') || s.includes('doing') || s.includes('active') || s.includes('development')) {
            return 'In Progress';
        }
        if (s.includes('test') || s.includes('qa') || s.includes('review')) {
            return 'Testing';
        }
        if (s.includes('done') || s.includes('completed') || s.includes('delivered') || s.includes('closed') || s.includes('resolved')) {
            return 'Done';
        }
        if (s.includes('hold') || s.includes('paused') || s.includes('blocked')) {
            return 'Hold';
        }
        return 'To Do';
    }, []);

    // Filter tasks based on all active filters
    const filteredTasks = useMemo(() => {
        return (clientTasks || []).filter(task => {
            // Milestone filter
            if (selectedMilestone) {
                const taskMilestoneId = task.milestone?._id || task.milestone;
                if (String(taskMilestoneId) !== String(selectedMilestone.value)) {
                    return false;
                }
            }

            // Assignee filter
            if (selectedMember) {
                const taskAssigneeId = task.assignee?._id || task.assignee;
                if (String(taskAssigneeId) !== String(selectedMember.value)) {
                    return false;
                }
            }

            // Priority filter
            if (selectedPriority) {
                if ((task.priority || '').toLowerCase() !== selectedPriority.value.toLowerCase()) {
                    return false;
                }
            }

            // Date Range filter
            if (startDate && endDate) {
                const from = new Date(startDate);
                from.setHours(0, 0, 0, 0);
                const to = new Date(endDate);
                to.setHours(23, 59, 59, 999);

                const taskDate = task.dueDate ? new Date(task.dueDate) : (task.startDate ? new Date(task.startDate) : (task.createdAt ? new Date(task.createdAt) : null));
                if (!taskDate || taskDate < from || taskDate > to) {
                    return false;
                }
            }

            // Search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const summary = (task.summary || '').toLowerCase();
                const desc = (task.description || '').toLowerCase();
                const workType = (task.workType || '').toLowerCase();
                const assigneeName = (task.assignee?.name || '').toLowerCase();
                if (!summary.includes(query) && !desc.includes(query) && !workType.includes(query) && !assigneeName.includes(query)) {
                    return false;
                }
            }

            return true;
        });
    }, [clientTasks, selectedMilestone, selectedMember, selectedPriority, startDate, endDate, searchQuery]);

    // Group filtered tasks into Kanban columns
    const boardData = useMemo(() => {
        const groups = {};
        COLUMN_CONFIG.forEach(col => {
            groups[col.id] = {
                ...col,
                items: []
            };
        });

        filteredTasks.forEach(task => {
            const colId = normalizeStatus(task.status);
            if (groups[colId]) {
                groups[colId].items.push(task);
            } else {
                groups['To Do'].items.push(task);
            }
        });

        return groups;
    }, [filteredTasks, normalizeStatus]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDaysLeft = (endStr, status) => {
        if (status === 'Done' || status === 'Completed' || status === 'Delivered') {
            return {
                text: 'Done',
                bg: 'rgba(16, 185, 129, 0.12)',
                textColor: '#059669'
            };
        }
        if (!endStr) {
            return {
                text: 'No Deadline',
                bg: 'rgba(100, 116, 139, 0.1)',
                textColor: '#64748b'
            };
        }
        const endDate = new Date(endStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = endDate - today;
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (days < 0) {
            return {
                text: `${Math.abs(days)}d Overdue`,
                bg: 'rgba(239, 68, 68, 0.12)',
                textColor: '#dc2626'
            };
        } else if (days === 0) {
            return {
                text: 'Due Today',
                bg: 'rgba(245, 158, 11, 0.15)',
                textColor: '#d97706'
            };
        } else if (days <= 3) {
            return {
                text: `${days}d Left`,
                bg: 'rgba(245, 158, 11, 0.15)',
                textColor: '#d97706'
            };
        }
        return {
            text: `${days}d Left`,
            bg: 'rgba(16, 185, 129, 0.12)',
            textColor: '#059669'
        };
    };

    const getPriorityBadgeStyle = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'critical') {
            return { bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.25)' };
        }
        if (p === 'high') {
            return { bg: 'rgba(249, 115, 22, 0.12)', color: '#ea580c', border: '1px solid rgba(249, 115, 22, 0.25)' };
        }
        if (p === 'medium') {
            return { bg: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.25)' };
        }
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' };
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskModal(true);
    };

    const handleOpenProjectModal = (proj) => {
        setSelectedProject(proj || currentProject);
        setShowProjectModal(true);
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setShowCopiedIndex(idx);
        setTimeout(() => setShowCopiedIndex(null), 2000);
    };

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12.5px',
            borderRadius: '8px',
            borderColor: state.isFocused ? '#727cf5' : '#e2e8f0',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(114, 124, 245, 0.18)' : 'none',
            '&:hover': {
                borderColor: '#727cf5'
            },
            backgroundColor: '#ffffff'
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 10px'
        }),
        input: (base) => ({
            ...base,
            margin: '0px',
            fontSize: '12.5px'
        }),
        singleValue: (base) => ({
            ...base,
            fontSize: '12.5px',
            color: '#1e293b',
            fontWeight: '600'
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '12px',
            color: '#94a3b8'
        }),
        option: (base, state) => ({
            ...base,
            fontSize: '12.5px',
            backgroundColor: state.isSelected ? '#727cf5' : state.isFocused ? '#f1f5f9' : 'transparent',
            color: state.isSelected ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            fontWeight: state.isSelected ? '600' : '400',
            padding: '8px 12px',
            '&:active': {
                backgroundColor: '#727cf5'
            }
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: '34px'
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: '#e2e8f0'
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
        })
    };

    return (
        <div className="dashboard-wrapper">
            {/* Sidebar */}
            <CommonSidebar active="myprojects" />

            {/* Main Area */}
            <main className="dash-main">
                <CommonHeader title="My Projects" />

                <div className="projects-main-card">
                    {/* Top Filters Bar */}
                    <div className="projects-toolbar-wrapper">
                        <div className="d-flex flex-column flex-xl-row justify-content-between gap-2.5">
                            {/* Left Controls: View Toggle & Search */}
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <div className="btn-group view-mode-toggle" role="group">
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${viewMode === 'board' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                        onClick={() => setViewMode('board')}
                                        title="Kanban Board View"
                                    >
                                        <i className="bi bi-kanban me-1"></i> Board
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary active' : 'btn-outline-secondary'}`}
                                        onClick={() => setViewMode('list')}
                                        title="Table List View"
                                    >
                                        <i className="bi bi-list-ul me-1"></i> List
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="projects-search-box">
                                    <i className="bi bi-search search-icon"></i>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm projects-search-input"
                                        placeholder="Search tasks, assignees..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            className="btn-clear-search"
                                            onClick={() => setSearchQuery('')}
                                            title="Clear search"
                                        >
                                            <i className="bi bi-x"></i>
                                        </button>
                                    )}
                                </div>

                                {currentProject && (
                                    <button
                                        className="btn btn-sm btn-outline-info d-flex align-items-center gap-1.5 project-info-quick-btn"
                                        onClick={() => handleOpenProjectModal(currentProject)}
                                        title="View Project Specifications & Credentials"
                                    >
                                        <i className="bi bi-info-circle"></i>
                                        <span>Project Info</span>
                                    </button>
                                )}
                            </div>

                            {/* Right Controls: Filters */}
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                {/* Project Selector */}
                                <div style={{ minWidth: 190, maxWidth: 240 }}>
                                    <Select
                                        value={selectedProjectFilter}
                                        onChange={handleProjectChange}
                                        options={projectOptions}
                                        placeholder="Select Project"
                                        isClearable={false}
                                        isSearchable
                                        styles={customSelectStyles}
                                    />
                                </div>

                                {/* Milestone Selector */}
                                <div style={{ minWidth: 170, maxWidth: 210 }}>
                                    <Select
                                        value={selectedMilestone}
                                        onChange={handleMilestoneChange}
                                        options={milestoneOptions}
                                        placeholder="All Milestones"
                                        isClearable
                                        isSearchable
                                        styles={customSelectStyles}
                                    />
                                </div>

                                {/* Team Member Selector */}
                                <div style={{ minWidth: 160, maxWidth: 190 }}>
                                    <Select
                                        value={selectedMember}
                                        onChange={setSelectedMember}
                                        options={memberOptions}
                                        placeholder="All Assignees"
                                        isClearable
                                        isSearchable
                                        styles={customSelectStyles}
                                    />
                                </div>

                                {/* Priority Selector */}
                                <div style={{ minWidth: 140, maxWidth: 160 }}>
                                    <Select
                                        value={selectedPriority}
                                        onChange={setSelectedPriority}
                                        options={priorityOptions}
                                        placeholder="All Priority"
                                        isClearable
                                        styles={customSelectStyles}
                                    />
                                </div>

                                {/* Date Range Picker */}
                                <div className="date-picker-container" style={{ width: 180 }}>
                                    <DatePicker
                                        selectsRange
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={(update) => setSelectedDateRange(update)}
                                        isClearable
                                        placeholderText="Select Date Range"
                                        dateFormat="dd MMM yyyy"
                                        className="form-control form-control-sm projects-date-input"
                                    />
                                </div>

                                {/* Reset All Filters Button */}
                                {isAnyFilterActive && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-light border text-danger d-flex align-items-center gap-1 clear-filters-btn"
                                        onClick={handleClearAllFilters}
                                        title="Clear all active filters"
                                    >
                                        <i className="bi bi-arrow-counterclockwise"></i>
                                        <span>Reset</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Active Filter Badges Bar */}
                        {isAnyFilterActive && (
                            <div className="active-filters-bar mt-2 pt-2 border-top d-flex flex-wrap align-items-center gap-1.5">
                                <span className="active-filters-label text-muted small">
                                    <i className="bi bi-funnel-fill me-1 text-primary"></i> Active Filters ({filteredTasks.length} tasks matched):
                                </span>
                                {selectedMilestone && (
                                    <span className="filter-chip">
                                        Milestone: <strong>{selectedMilestone.label}</strong>
                                        <i className="bi bi-x ms-1" onClick={() => setSelectedMilestone(null)}></i>
                                    </span>
                                )}
                                {selectedMember && (
                                    <span className="filter-chip">
                                        Assignee: <strong>{selectedMember.label}</strong>
                                        <i className="bi bi-x ms-1" onClick={() => setSelectedMember(null)}></i>
                                    </span>
                                )}
                                {selectedPriority && (
                                    <span className="filter-chip">
                                        Priority: <strong>{selectedPriority.label}</strong>
                                        <i className="bi bi-x ms-1" onClick={() => setSelectedPriority(null)}></i>
                                    </span>
                                )}
                                {startDate && endDate && (
                                    <span className="filter-chip">
                                        Date: <strong>{formatDate(startDate)} - {formatDate(endDate)}</strong>
                                        <i className="bi bi-x ms-1" onClick={() => setSelectedDateRange([null, null])}></i>
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="filter-chip">
                                        Search: <strong>"{searchQuery}"</strong>
                                        <i className="bi bi-x ms-1" onClick={() => setSearchQuery('')}></i>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="projects-content-viewport">
                        {loading || clientTasksLoading ? (
                            <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
                                <div className="spinner-border text-primary mb-3" role="status">
                                    <span className="visually-hidden">Loading tasks...</span>
                                </div>
                                <p className="text-muted fw-500">Loading project workspace...</p>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="d-flex flex-column justify-content-center align-items-center py-5 empty-workspace-state" style={{ minHeight: '50vh' }}>
                                <div className="empty-icon-circle mb-3">
                                    <i className="bi bi-inbox fs-1 text-muted"></i>
                                </div>
                                <h5 className="fw-bold text-dark mb-1">No Tasks Found</h5>
                                <p className="text-muted small mb-3 text-center" style={{ maxWidth: 400 }}>
                                    {isAnyFilterActive
                                        ? "No tasks match your active filter criteria. Try adjusting or resetting the filters."
                                        : "There are currently no tasks recorded for this milestone or project."}
                                </p>
                                {isAnyFilterActive && (
                                    <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={handleClearAllFilters}>
                                        <i className="bi bi-arrow-counterclockwise me-1"></i> Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'board' ? (
                            /* Kanban Board View */
                            <div className="kanban-board-scroll">
                                <div className="kanban-columns-grid">
                                    {COLUMN_CONFIG.map((col) => {
                                        const column = boardData[col.id] || { ...col, items: [] };
                                        return (
                                            <div key={col.id} className="kanban-col-wrapper">
                                                <div className="kanban-column-card">
                                                    {/* Column Header */}
                                                    <div className="kanban-column-header" style={{ borderTop: `3px solid ${col.color}` }}>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="status-dot" style={{ backgroundColor: col.color }}></span>
                                                            <span className="column-title-text">{col.title}</span>
                                                        </div>
                                                        <span
                                                            className="column-count-badge"
                                                            style={{ backgroundColor: col.badgeBg, color: col.badgeColor }}
                                                        >
                                                            {column.items.length}
                                                        </span>
                                                    </div>

                                                    {/* Column Task Cards */}
                                                    <div className="kanban-cards-container">
                                                        {column.items.length > 0 ? (
                                                            column.items.map((task) => {
                                                                const daysInfo = getDaysLeft(task.dueDate || task.completionDate, task.status);
                                                                const prioStyle = getPriorityBadgeStyle(task.priority);
                                                                const assigneeInitials = task.assignee?.name
                                                                    ? task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                                                    : null;

                                                                return (
                                                                    <div
                                                                        key={task._id}
                                                                        className="task-kanban-card cp"
                                                                        onClick={() => handleTaskClick(task)}
                                                                    >
                                                                        {/* Card Top Badges */}
                                                                        <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                                                                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                                                                {task.priority && (
                                                                                    <span
                                                                                        className="task-badge-pill priority-pill"
                                                                                        style={{ backgroundColor: prioStyle.bg, color: prioStyle.color, border: prioStyle.border }}
                                                                                    >
                                                                                        {task.priority}
                                                                                    </span>
                                                                                )}
                                                                                {task.workType && (
                                                                                    <span className="task-badge-pill worktype-pill">
                                                                                        {task.workType}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {/* Deadline badge */}
                                                                            <span
                                                                                className="task-deadline-badge"
                                                                                style={{ backgroundColor: daysInfo.bg, color: daysInfo.textColor }}
                                                                            >
                                                                                {daysInfo.text}
                                                                            </span>
                                                                        </div>

                                                                        {/* Task Title */}
                                                                        <div className="task-card-title">
                                                                            {task.summary || task.title || 'Untitled Task'}
                                                                        </div>

                                                                        {/* Task Description Preview */}
                                                                        {task.description && (
                                                                            <div className="task-card-desc">
                                                                                {task.description.replace(/<[^>]*>/g, '').slice(0, 110)}
                                                                            </div>
                                                                        )}

                                                                        {/* Milestone Tag */}
                                                                        {task.milestone && (
                                                                            <div className="task-milestone-tag">
                                                                                <i className="bi bi-flag-fill me-1 text-primary opacity-75"></i>
                                                                                <span>{task.milestone.title || 'Milestone'}</span>
                                                                            </div>
                                                                        )}

                                                                        {/* Progress Bar if any */}
                                                                        {typeof task.progress === 'number' && task.progress > 0 && (
                                                                            <div className="task-progress-mini mt-2">
                                                                                <div className="d-flex justify-content-between small text-muted mb-1" style={{ fontSize: '10px' }}>
                                                                                    <span>Progress</span>
                                                                                    <span className="fw-bold">{task.progress}%</span>
                                                                                </div>
                                                                                <div className="progress" style={{ height: '4px' }}>
                                                                                    <div
                                                                                        className="progress-bar bg-success"
                                                                                        role="progressbar"
                                                                                        style={{ width: `${task.progress}%` }}
                                                                                    ></div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Card Footer: Assignee & Date */}
                                                                        <div className="task-card-footer mt-2.5 pt-2 border-top d-flex align-items-center justify-content-between">
                                                                            <div className="d-flex align-items-center gap-1.5">
                                                                                {assigneeInitials ? (
                                                                                    <div
                                                                                        className="assignee-avatar-circle"
                                                                                        title={`Assigned to: ${task.assignee?.name || ''}`}
                                                                                    >
                                                                                        {assigneeInitials}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="assignee-avatar-circle unassigned" title="Unassigned">
                                                                                        <i className="bi bi-person"></i>
                                                                                    </div>
                                                                                )}
                                                                                <span className="assignee-name-text">
                                                                                    {task.assignee?.name || 'Unassigned'}
                                                                                </span>
                                                                            </div>

                                                                            <div className="task-meta-right d-flex align-items-center gap-2">
                                                                                {task.dueDate && (
                                                                                    <span className="task-due-date" title={`Due: ${formatDate(task.dueDate)}`}>
                                                                                        <i className="bi bi-calendar3 me-1"></i>
                                                                                        {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                                                    </span>
                                                                                )}
                                                                                {task.attachments && task.attachments.length > 0 && (
                                                                                    <span className="task-attachments-count" title={`${task.attachments.length} attachments`}>
                                                                                        <i className="bi bi-paperclip"></i>
                                                                                        {task.attachments.length}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="kanban-empty-col">
                                                                <i className="bi bi-check2-circle mb-1 opacity-40 fs-3"></i>
                                                                <span>No tasks in {col.title}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* List / Table View */
                            <div className="projects-table-container">
                                <div className="table-responsive">
                                    <table className="table projects-custom-table align-middle">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '35%' }}>Task / Summary</th>
                                                <th style={{ width: '15%' }}>Milestone</th>
                                                <th style={{ width: '10%' }}>Priority</th>
                                                <th style={{ width: '15%' }}>Assignee</th>
                                                <th style={{ width: '10%' }}>Status</th>
                                                <th style={{ width: '10%' }}>Due Date</th>
                                                <th style={{ width: '5%' }} className="text-end">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTasks.map((task) => {
                                                const daysInfo = getDaysLeft(task.dueDate || task.completionDate, task.status);
                                                const prioStyle = getPriorityBadgeStyle(task.priority);
                                                const colId = normalizeStatus(task.status);
                                                const colConfig = COLUMN_CONFIG.find(c => c.id === colId) || COLUMN_CONFIG[0];

                                                return (
                                                    <tr key={task._id} className="task-table-row cp" onClick={() => handleTaskClick(task)}>
                                                        <td>
                                                            <div className="d-flex flex-column">
                                                                <div className="d-flex align-items-center gap-1.5 mb-1">
                                                                    {task.workType && (
                                                                        <span className="task-badge-pill worktype-pill" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                                                            {task.workType}
                                                                        </span>
                                                                    )}
                                                                    <span className="fw-semibold text-dark task-table-title">
                                                                        {task.summary || task.title || 'Untitled Task'}
                                                                    </span>
                                                                </div>
                                                                {task.description && (
                                                                    <small className="text-muted text-truncate" style={{ maxWidth: 450 }}>
                                                                        {task.description.replace(/<[^>]*>/g, '').slice(0, 90)}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span className="badge bg-light text-dark border px-2 py-1 fw-500">
                                                                <i className="bi bi-flag me-1 text-primary"></i>
                                                                {task.milestone?.title || 'General'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className="task-badge-pill priority-pill"
                                                                style={{ backgroundColor: prioStyle.bg, color: prioStyle.color, border: prioStyle.border }}
                                                            >
                                                                {task.priority || 'Medium'}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <div className="assignee-avatar-circle mini">
                                                                    {task.assignee?.name
                                                                        ? task.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                                                        : <i className="bi bi-person"></i>}
                                                                </div>
                                                                <span className="small fw-500 text-dark">
                                                                    {task.assignee?.name || 'Unassigned'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className="badge rounded-pill px-2.5 py-1 text-capitalize fw-600"
                                                                style={{ backgroundColor: colConfig.badgeBg, color: colConfig.badgeColor }}
                                                            >
                                                                {task.status || colConfig.title}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="d-flex flex-column">
                                                                <span className="small fw-semibold text-dark">
                                                                    {formatDate(task.dueDate || task.completionDate)}
                                                                </span>
                                                                <small style={{ color: daysInfo.textColor, fontSize: '10px', fontWeight: 'bold' }}>
                                                                    {daysInfo.text}
                                                                </small>
                                                            </div>
                                                        </td>

                                                        <td className="text-end">
                                                            <button
                                                                className="btn btn-sm btn-light border p-1 px-2 text-primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleTaskClick(task);
                                                                }}
                                                                title="View Details"
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Task Detail Modal */}
            <Modal
                show={showTaskModal}
                onHide={() => setShowTaskModal(false)}
                size="lg"
                centered
                className="task-detail-modal"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="task-modal-header-custom w-100 pe-3">
                        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            {selectedTask?.priority && (
                                <span
                                    className="task-badge-pill priority-pill"
                                    style={getPriorityBadgeStyle(selectedTask.priority)}
                                >
                                    {selectedTask.priority} Priority
                                </span>
                            )}
                            {selectedTask?.workType && (
                                <span className="task-badge-pill worktype-pill">
                                    {selectedTask.workType}
                                </span>
                            )}
                            <span
                                className="badge rounded-pill px-2.5 py-1 text-capitalize fw-bold ms-auto"
                                style={{
                                    backgroundColor: COLUMN_CONFIG.find(c => c.id === normalizeStatus(selectedTask?.status))?.badgeBg || '#e2e8f0',
                                    color: COLUMN_CONFIG.find(c => c.id === normalizeStatus(selectedTask?.status))?.badgeColor || '#334155'
                                }}
                            >
                                {selectedTask?.status || 'To Do'}
                            </span>
                        </div>
                        <h4 className="task-modal-title mb-0">{selectedTask?.summary || selectedTask?.title}</h4>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="pt-3">
                    {selectedTask && (
                        <div className="task-modal-body-layout">
                            {/* Description Section */}
                            <div className="modal-card-block mb-3">
                                <h6 className="block-subtitle"><i className="bi bi-card-text me-1 text-primary"></i> Description</h6>
                                <div className="task-modal-desc">
                                    {selectedTask.description
                                        ? selectedTask.description.replace(/<[^>]*>/g, '')
                                        : 'No additional description provided for this task.'}
                                </div>
                            </div>

                            {/* Meta Grid */}
                            <div className="modal-meta-grid mb-3">
                                <div className="meta-grid-card">
                                    <span className="meta-label">Milestone</span>
                                    <span className="meta-value fw-bold text-primary">
                                        <i className="bi bi-flag-fill me-1"></i>
                                        {selectedTask.milestone?.title || 'General Milestone'}
                                    </span>
                                </div>

                                <div className="meta-grid-card">
                                    <span className="meta-label">Project</span>
                                    <span className="meta-value fw-bold text-dark">
                                        {selectedTask.project?.name || currentProject?.name || 'Project'}
                                    </span>
                                </div>

                                <div className="meta-grid-card">
                                    <span className="meta-label">Assignee</span>
                                    <div className="d-flex align-items-center gap-1.5 mt-1">
                                        <div className="assignee-avatar-circle mini">
                                            {selectedTask.assignee?.name
                                                ? selectedTask.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                                : <i className="bi bi-person"></i>}
                                        </div>
                                        <div>
                                            <span className="meta-value d-block fw-semibold">{selectedTask.assignee?.name || 'Unassigned'}</span>
                                            {selectedTask.assignee?.email && (
                                                <small className="text-muted" style={{ fontSize: '11px' }}>{selectedTask.assignee.email}</small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="meta-grid-card">
                                    <span className="meta-label">Due Date</span>
                                    <span className="meta-value fw-semibold">
                                        <i className="bi bi-calendar-event me-1 text-muted"></i>
                                        {formatDate(selectedTask.dueDate || selectedTask.completionDate)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress & Estimates */}
                            {(typeof selectedTask.progress === 'number' || selectedTask.estimatedTime || selectedTask.timeSpent) && (
                                <div className="modal-card-block mb-3">
                                    <h6 className="block-subtitle"><i className="bi bi-speedometer2 me-1 text-info"></i> Progress & Hours</h6>
                                    <div className="row g-2 align-items-center">
                                        {typeof selectedTask.progress === 'number' && (
                                            <div className="col-12 col-md-6">
                                                <div className="d-flex justify-content-between small mb-1">
                                                    <span>Completion</span>
                                                    <span className="fw-bold">{selectedTask.progress}%</span>
                                                </div>
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div className="progress-bar bg-primary" style={{ width: `${selectedTask.progress}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedTask.estimatedTime > 0 && (
                                            <div className="col-6 col-md-3">
                                                <span className="meta-label">Est. Time</span>
                                                <span className="fw-bold text-dark">{selectedTask.estimatedTime} hrs</span>
                                            </div>
                                        )}
                                        {selectedTask.timeSpent > 0 && (
                                            <div className="col-6 col-md-3">
                                                <span className="meta-label">Time Spent</span>
                                                <span className="fw-bold text-success">{selectedTask.timeSpent} hrs</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {Array.isArray(selectedTask.attachments) && selectedTask.attachments.length > 0 && (
                                <div className="modal-card-block">
                                    <h6 className="block-subtitle"><i className="bi bi-paperclip me-1 text-secondary"></i> Attachments ({selectedTask.attachments.length})</h6>
                                    <div className="attachments-list-grid">
                                        {selectedTask.attachments.map((att, idx) => (
                                            <a
                                                key={idx}
                                                href={att.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="attachment-item-card"
                                            >
                                                <i className="bi bi-file-earmark-arrow-down text-primary fs-5"></i>
                                                <div className="text-truncate">
                                                    <span className="att-name text-truncate">{att.name || `Attachment ${idx + 1}`}</span>
                                                    <small className="text-muted d-block">{formatDate(att.uploadedAt)}</small>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="border-0 pt-0">
                    <Button variant="secondary" className="btn-modal-close px-3" onClick={() => setShowTaskModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Project Details Modal */}
            <Modal
                show={showProjectModal}
                onHide={() => setShowProjectModal(false)}
                size="lg"
                centered
                className="project-detail-modal"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="modal-title-custom">
                        <span className="modal-project-tag">{selectedProject?.projectType || 'Tech'}</span>
                        <h2>{selectedProject?.name}</h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {selectedProject && (
                        <div className="modal-body-layout">
                            <div className="modal-section description-sec">
                                <h5 className="section-title"><i className="bi bi-file-earmark-text"></i> Description</h5>
                                <p className="modal-desc-content">
                                    {selectedProject.description || 'No description available for this project.'}
                                </p>
                            </div>

                            <div className="modal-section grid-section">
                                <div className="modal-grid-item">
                                    <span className="grid-item-label">Status</span>
                                    <span className={`status-badge-pill ${selectedProject.projectStatus?.toLowerCase() || 'ongoing'}`}>
                                        {selectedProject.projectStatus || 'Ongoing'}
                                    </span>
                                </div>
                                <div className="modal-grid-item">
                                    <span className="grid-item-label">Start Date</span>
                                    <span className="grid-item-val">{formatDate(selectedProject.start || selectedProject.startDate)}</span>
                                </div>
                                <div className="modal-grid-item">
                                    <span className="grid-item-label">End Date</span>
                                    <span className="grid-item-val">{formatDate(selectedProject.end || selectedProject.estimatedCompletion)}</span>
                                </div>
                            </div>

                            {/* Links & Websites */}
                            {((selectedProject.figmaLinks && selectedProject.figmaLinks.length > 0) ||
                                (selectedProject.documentLinks && selectedProject.documentLinks.length > 0) ||
                                (selectedProject.websites && selectedProject.websites.length > 0)) && (
                                <div className="modal-section links-sec">
                                    <h5 className="section-title"><i className="bi bi-link-45deg"></i> Resources & Links</h5>

                                    {/* Figma Links */}
                                    {selectedProject.figmaLinks && selectedProject.figmaLinks.length > 0 && (
                                        <div className="link-sub-section">
                                            <div className="sub-section-title"><i className="bi bi-pencil-ruler text-info"></i> Figma Designs</div>
                                            <div className="resource-links-grid">
                                                {selectedProject.figmaLinks.map((link, idx) => (
                                                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="resource-link-card">
                                                        <span className="link-title">{link.title || 'Design Link'}</span>
                                                        <i className="bi bi-box-arrow-up-right link-go-icon"></i>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Document Links */}
                                    {selectedProject.documentLinks && selectedProject.documentLinks.length > 0 && (
                                        <div className="link-sub-section">
                                            <div className="sub-section-title"><i className="bi bi-file-earmark-text text-primary"></i> Document Links</div>
                                            <div className="resource-links-grid">
                                                {selectedProject.documentLinks.map((link, idx) => (
                                                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="resource-link-card">
                                                        <span className="link-title">{link.title || 'Document Link'}</span>
                                                        <i className="bi bi-box-arrow-up-right link-go-icon"></i>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Websites & Credentials */}
                                    {selectedProject.websites && selectedProject.websites.length > 0 && (
                                        <div className="link-sub-section">
                                            <div className="sub-section-title"><i className="bi bi-globe text-success"></i> Websites & Credentials</div>
                                            <div className="websites-credentials-wrapper">
                                                {selectedProject.websites.map((web, idx) => (
                                                    <div key={idx} className="website-cred-card">
                                                        <div className="web-header">
                                                            <span className="web-title">{web.title}</span>
                                                            <a href={web.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-success py-1 px-2" style={{ fontSize: '10px' }}>
                                                                Visit <i className="bi bi-box-arrow-up-right ms-1"></i>
                                                            </a>
                                                        </div>
                                                        {web.creds && web.creds.map((cred, cIdx) => (
                                                            <div key={cIdx} className="cred-row mt-2">
                                                                <span className="cred-role">{cred.role || 'Access'}:</span>
                                                                <div className="cred-details">
                                                                    <div className="cred-field">
                                                                        <span className="field-label">User:</span>
                                                                        <span className="field-val">{cred.username}</span>
                                                                        <button className="btn btn-xs btn-link p-0 text-muted ms-1" onClick={() => handleCopy(cred.username, `user-${idx}-${cIdx}`)}>
                                                                            <i className={`bi ${showCopiedIndex === `user-${idx}-${cIdx}` ? 'bi-check2 text-success' : 'bi-clipboard'}`}></i>
                                                                        </button>
                                                                    </div>
                                                                    <div className="cred-field ms-3">
                                                                        <span className="field-label">Pass:</span>
                                                                        <span className="field-val">••••••••</span>
                                                                        <button className="btn btn-xs btn-link p-0 text-muted ms-1" onClick={() => handleCopy(cred.password, `pass-${idx}-${cIdx}`)}>
                                                                            <i className={`bi ${showCopiedIndex === `pass-${idx}-${cIdx}` ? 'bi-check2 text-success' : 'bi-clipboard'}`}></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tech Stack List */}
                            {Array.isArray(selectedProject.technology) && selectedProject.technology.length > 0 && (
                                <div className="modal-section tech-sec">
                                    <h5 className="section-title"><i className="bi bi-cpu"></i> Technologies</h5>
                                    <div className="tech-badge-container">
                                        {selectedProject.technology.map(t => (
                                            <span key={t._id} className="tech-badge large">{t.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Team */}
                            {Array.isArray(selectedProject.team) && selectedProject.team.length > 0 && (
                                <div className="modal-section team-sec">
                                    <h5 className="section-title"><i className="bi bi-people"></i> Assigned Resources</h5>
                                    <div className="modal-team-list-grid">
                                        {selectedProject.team.map((member) => (
                                            <div key={member._id} className="team-member-item">
                                                <div className="team-member-avatar">
                                                    {member.name ? member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
                                                </div>
                                                <div className="team-member-details">
                                                    <span className="team-member-name">{member.name}</span>
                                                    {member.designation && <span className="small text-muted">{typeof member.designation === 'object' ? member.designation.name : member.designation}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" className="btn-modal-close" onClick={() => setShowProjectModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Projects;
