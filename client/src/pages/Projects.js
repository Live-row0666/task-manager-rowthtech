import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Select from 'react-select';
import { getDashboard, getClientMilestonesAction, getClientTasksAction } from '../redux/actions';
import { Modal } from 'react-bootstrap';
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

    const currentProjId = selectedProjectFilter?.value || currentProject?._id;

    const milestoneList = useMemo(() => {
        const list = (clientMilestones && clientMilestones.length > 0) ? clientMilestones : (dashboard?.milestones || []);
        if (currentProjId) {
            return list.filter(m => {
                const mProjId = m.project?._id || m.project;
                return !mProjId || String(mProjId) === String(currentProjId);
            });
        }
        return list;
    }, [clientMilestones, dashboard?.milestones, currentProjId]);

    const milestoneOptions = useMemo(() => {
        return milestoneList.map(item => ({
            value: item._id,
            label: item.title
        }));
    }, [milestoneList]);

    // Team members strictly belonging to the currently selected project
    const memberOptions = useMemo(() => {
        const membersMap = new Map();

        // 1. Members defined in current project team
        if (currentProject?.team && Array.isArray(currentProject.team)) {
            currentProject.team.forEach(m => {
                if (m && m._id && m.name) {
                    membersMap.set(String(m._id), m.name);
                }
            });
        }

        // 2. Assignees of tasks belonging strictly to this project
        (clientTasks || []).forEach(t => {
            const taskProjectId = t.project?._id || t.project;
            if (currentProjId && taskProjectId && String(taskProjectId) !== String(currentProjId)) {
                return; // Skip tasks from other projects
            }
            if (t?.assignee && t.assignee._id && t.assignee.name) {
                membersMap.set(String(t.assignee._id), t.assignee.name);
            }
        });

        return Array.from(membersMap.entries()).map(([id, name]) => ({
            value: id,
            label: name
        }));
    }, [currentProject, clientTasks, currentProjId]);

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

    // Filter tasks based on all active filters with strict project scoping
    const filteredTasks = useMemo(() => {
        return (clientTasks || []).filter(task => {
            // Strict project filter: ensure task belongs to the selected project
            if (currentProjId) {
                const taskProjectId = task.project?._id || task.project;
                if (taskProjectId && String(taskProjectId) !== String(currentProjId)) {
                    return false;
                }
            }

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
    }, [clientTasks, currentProjId, selectedMilestone, selectedMember, selectedPriority, startDate, endDate, searchQuery]);

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
                bg: '#fef2f2',
                textColor: '#dc2626',
                border: '#fecaca',
                icon: 'bi-clock-history'
            };
        } else if (days === 0) {
            return {
                text: 'Due Today',
                bg: '#fffbeb',
                textColor: '#d97706',
                border: '#fde68a',
                icon: 'bi-alarm'
            };
        } else if (days <= 3) {
            return {
                text: `${days}d Left`,
                bg: '#fffbeb',
                textColor: '#d97706',
                border: '#fde68a',
                icon: 'bi-hourglass-split'
            };
        }
        return {
            text: `${days}d Left`,
            bg: '#f0fdf4',
            textColor: '#16a34a',
            border: '#bbf7d0',
            icon: 'bi-calendar-check'
        };
    };

    const getPriorityBadgeStyle = (priority) => {
        const p = (priority || '').toLowerCase();
        if (p === 'critical') {
            return { bg: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' };
        }
        if (p === 'high') {
            return { bg: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' };
        }
        if (p === 'medium') {
            return { bg: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' };
        }
        return { bg: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };
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
            minHeight: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12.5px',
            borderRadius: '9px',
            borderColor: state.isFocused ? '#727cf5' : '#e2e8f0',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(114, 124, 245, 0.15)' : 'none',
            '&:hover': {
                borderColor: '#cbd5e1'
            },
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 10px',
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
            color: '#94a3b8',
            fontWeight: '500'
        }),
        option: (base, state) => ({
            ...base,
            fontSize: '12.5px',
            backgroundColor: state.isSelected ? '#727cf5' : state.isFocused ? '#f1f5f9' : 'transparent',
            color: state.isSelected ? '#ffffff' : '#1e293b',
            cursor: 'pointer',
            fontWeight: state.isSelected ? '600' : '500',
            padding: '8px 12px',
            '&:active': {
                backgroundColor: '#727cf5'
            }
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: '36px'
        }),
        indicatorSeparator: () => ({
            display: 'none'
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            padding: '4px 8px',
            color: state.isFocused ? '#727cf5' : '#94a3b8',
            '&:hover': {
                color: '#64748b'
            }
        }),
        clearIndicator: (base) => ({
            ...base,
            padding: '4px 6px',
            color: '#94a3b8',
            '&:hover': {
                color: '#ef4444'
            }
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
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
                        <div className="projects-toolbar-row">
                            {/* Left Controls: View Toggle & Search & Project Info */}
                            <div className="toolbar-left-group">
                                <div className="segmented-view-toggle">
                                    <button
                                        type="button"
                                        className={`segment-btn ${viewMode === 'board' ? 'active' : ''}`}
                                        onClick={() => setViewMode('board')}
                                        title="Kanban Board View"
                                    >
                                        <i className="bi bi-kanban"></i>
                                        <span>Board</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`segment-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                        title="Table List View"
                                    >
                                        <i className="bi bi-list-task"></i>
                                        <span>List</span>
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="projects-search-box">
                                    <i className="bi bi-search search-icon"></i>
                                    <input
                                        type="text"
                                        className="form-control projects-search-input"
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
                                            <i className="bi bi-x-circle-fill"></i>
                                        </button>
                                    )}
                                </div>

                                {currentProject && (
                                    <button
                                        className="project-info-pill-btn"
                                        onClick={() => handleOpenProjectModal(currentProject)}
                                        title="View Project Specifications & Credentials"
                                    >
                                        <i className="bi bi-info-circle-fill"></i>
                                        <span>Project Info</span>
                                    </button>
                                )}
                            </div>

                            {/* Right Controls: Filter Dropdowns */}
                            <div className="toolbar-right-group">
                                {/* Project Selector */}
                                <div className="filter-select-wrapper project-select-box">
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
                                <div className="filter-select-wrapper milestone-select-box">
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
                                <div className="filter-select-wrapper member-select-box">
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
                                <div className="filter-select-wrapper priority-select-box">
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
                                <div className="date-picker-container filter-select-wrapper date-range-select-box">
                                    <div className="date-input-with-icon">
                                        <i className="bi bi-calendar-range date-picker-prefix-icon"></i>
                                        <DatePicker
                                            selectsRange
                                            startDate={startDate}
                                            endDate={endDate}
                                            onChange={(update) => setSelectedDateRange(update)}
                                            isClearable
                                            placeholderText="Select Date Range"
                                            dateFormat="dd MMM yyyy"
                                            className="form-control projects-date-input"
                                        />
                                    </div>
                                </div>

                                {/* Reset All Filters Button */}
                                {isAnyFilterActive && (
                                    <button
                                        type="button"
                                        className="btn clear-filters-btn"
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
                            <div className="active-filters-bar">
                                <span className="active-filters-label">
                                    <i className="bi bi-funnel-fill text-primary"></i> Filtered ({filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}):
                                </span>
                                {selectedMilestone && (
                                    <span className="filter-chip">
                                        <span className="chip-key">Milestone:</span> {selectedMilestone.label}
                                        <i className="bi bi-x-circle-fill chip-remove" onClick={() => setSelectedMilestone(null)}></i>
                                    </span>
                                )}
                                {selectedMember && (
                                    <span className="filter-chip">
                                        <span className="chip-key">Assignee:</span> {selectedMember.label}
                                        <i className="bi bi-x-circle-fill chip-remove" onClick={() => setSelectedMember(null)}></i>
                                    </span>
                                )}
                                {selectedPriority && (
                                    <span className="filter-chip">
                                        <span className="chip-key">Priority:</span> {selectedPriority.label}
                                        <i className="bi bi-x-circle-fill chip-remove" onClick={() => setSelectedPriority(null)}></i>
                                    </span>
                                )}
                                {startDate && endDate && (
                                    <span className="filter-chip">
                                        <span className="chip-key">Date:</span> {formatDate(startDate)} - {formatDate(endDate)}
                                        <i className="bi bi-x-circle-fill chip-remove" onClick={() => setSelectedDateRange([null, null])}></i>
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="filter-chip">
                                        <span className="chip-key">Search:</span> "{searchQuery}"
                                        <i className="bi bi-x-circle-fill chip-remove" onClick={() => setSearchQuery('')}></i>
                                    </span>
                                )}
                                <button className="clear-all-inline-btn" onClick={handleClearAllFilters}>
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="projects-content-viewport">
                        {loading || clientTasksLoading ? (
                            <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
                                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <span className="visually-hidden">Loading tasks...</span>
                                </div>
                                <p className="text-muted fw-semibold">Loading project workspace...</p>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="d-flex flex-column justify-content-center align-items-center py-5 empty-workspace-state" style={{ minHeight: '50vh' }}>
                                <div className="empty-icon-circle mb-3">
                                    <i className="bi bi-kanban fs-2 text-primary opacity-50"></i>
                                </div>
                                <h5 className="fw-bold text-dark mb-1">No Tasks Found</h5>
                                <p className="text-muted small mb-3 text-center" style={{ maxWidth: 420 }}>
                                    {isAnyFilterActive
                                        ? "No tasks match your active filter criteria. Try clearing or adjusting your search parameters."
                                        : "There are currently no tasks recorded for this project milestone."}
                                </p>
                                {isAnyFilterActive && (
                                    <button className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" onClick={handleClearAllFilters}>
                                        <i className="bi bi-arrow-counterclockwise me-1"></i> Clear All Filters
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
                                                    <div className="kanban-column-header">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="status-dot" style={{ backgroundColor: col.color, boxShadow: `0 0 0 3px ${col.color}25` }}></span>
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
                                                                            <div className="d-flex align-items-center gap-2 flex-wrap">
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

                                                                            {/* Deadline / Overdue badge */}
                                                                            <span
                                                                                className="task-deadline-badge"
                                                                                style={{
                                                                                    backgroundColor: daysInfo.bg,
                                                                                    color: daysInfo.textColor,
                                                                                    borderColor: daysInfo.border || 'transparent'
                                                                                }}
                                                                            >
                                                                                <i className={`bi ${daysInfo.icon || 'bi-calendar3'} me-1`}></i>
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
                                                                                <i className="bi bi-bookmark-fill me-1"></i>
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
                                                                                <div className="progress" style={{ height: '4px', borderRadius: '4px' }}>
                                                                                    <div
                                                                                        className="progress-bar bg-success"
                                                                                        role="progressbar"
                                                                                        style={{ width: `${task.progress}%` }}
                                                                                    ></div>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Card Footer: Assignee & Date */}
                                                                        <div className="task-card-footer">
                                                                            <div className="d-flex align-items-center gap-2 assignee-group">
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

                                                                            <div className="task-meta-right">
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
                                                                <div className="empty-col-icon-wrap">
                                                                    <i className="bi bi-check2-circle"></i>
                                                                </div>
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
                                                                <div className="d-flex align-items-center gap-2 mb-1">
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
                <Modal.Header className="custom-modal-header border-0 pb-0">
                    <div className="d-flex flex-column w-100">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
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
                                    className="task-status-pill-header"
                                    style={{
                                        backgroundColor: COLUMN_CONFIG.find(c => c.id === normalizeStatus(selectedTask?.status))?.badgeBg || '#e2e8f0',
                                        color: COLUMN_CONFIG.find(c => c.id === normalizeStatus(selectedTask?.status))?.badgeColor || '#334155'
                                    }}
                                >
                                    <span
                                        className="status-dot-mini"
                                        style={{ backgroundColor: COLUMN_CONFIG.find(c => c.id === normalizeStatus(selectedTask?.status))?.color || '#64748b' }}
                                    ></span>
                                    {selectedTask?.status || 'To Do'}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="btn-modal-close-icon"
                                onClick={() => setShowTaskModal(false)}
                                title="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <h4 className="task-modal-main-title">{selectedTask?.summary || selectedTask?.title}</h4>
                    </div>
                </Modal.Header>

                <Modal.Body className="custom-modal-body">
                    {selectedTask && (
                        <div className="task-modal-body-layout">
                            {/* Description Section */}
                            <div className="modal-content-card">
                                <div className="card-section-label">
                                    <i className="bi bi-text-left text-primary me-1.5"></i> Description
                                </div>
                                <div className="task-modal-desc-text">
                                    {selectedTask.description
                                        ? selectedTask.description.replace(/<[^>]*>/g, '')
                                        : 'No description provided for this task.'}
                                </div>
                            </div>

                            {/* Meta Grid */}
                            <div className="modal-meta-grid-modern">
                                <div className="meta-card-modern">
                                    <div className="meta-card-header">
                                        <i className="bi bi-bookmark-fill text-indigo"></i>
                                        <span>Milestone</span>
                                    </div>
                                    <span className="meta-card-val text-primary fw-bold">
                                        {selectedTask.milestone?.title || 'General Milestone'}
                                    </span>
                                </div>

                                <div className="meta-card-modern">
                                    <div className="meta-card-header">
                                        <i className="bi bi-folder2-open text-info"></i>
                                        <span>Project</span>
                                    </div>
                                    <span className="meta-card-val text-dark fw-bold text-truncate" title={selectedTask.project?.name || currentProject?.name || 'Project'}>
                                        {selectedTask.project?.name || currentProject?.name || 'Project'}
                                    </span>
                                </div>

                                <div className="meta-card-modern">
                                    <div className="meta-card-header">
                                        <i className="bi bi-person-fill text-purple"></i>
                                        <span>Assignee</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <div className="assignee-avatar-circle mini">
                                            {selectedTask.assignee?.name
                                                ? selectedTask.assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                                : <i className="bi bi-person"></i>}
                                        </div>
                                        <div className="text-truncate">
                                            <span className="meta-card-val fw-semibold d-block text-truncate">{selectedTask.assignee?.name || 'Unassigned'}</span>
                                            {selectedTask.assignee?.email && (
                                                <small className="text-muted d-block text-truncate" style={{ fontSize: '11px' }}>{selectedTask.assignee.email}</small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="meta-card-modern">
                                    <div className="meta-card-header">
                                        <i className="bi bi-calendar-event text-success"></i>
                                        <span>Due Date</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 mt-1">
                                        <span className="meta-card-val fw-bold text-dark">
                                            {formatDate(selectedTask.dueDate || selectedTask.completionDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress & Estimates */}
                            {(typeof selectedTask.progress === 'number' || selectedTask.estimatedTime || selectedTask.timeSpent) && (
                                <div className="modal-content-card">
                                    <div className="card-section-label">
                                        <i className="bi bi-speedometer2 text-info me-1.5"></i> Progress & Time
                                    </div>
                                    <div className="row g-3 align-items-center">
                                        {typeof selectedTask.progress === 'number' && (
                                            <div className="col-12 col-md-6">
                                                <div className="d-flex justify-content-between small mb-1.5">
                                                    <span className="text-muted fw-semibold">Completion</span>
                                                    <span className="fw-bold text-dark">{selectedTask.progress}%</span>
                                                </div>
                                                <div className="progress" style={{ height: '7px', borderRadius: '6px' }}>
                                                    <div className="progress-bar bg-primary" style={{ width: `${selectedTask.progress}%`, borderRadius: '6px' }}></div>
                                                </div>
                                            </div>
                                        )}
                                        {selectedTask.estimatedTime > 0 && (
                                            <div className="col-6 col-md-3">
                                                <span className="d-block text-muted small fw-semibold">Est. Time</span>
                                                <span className="fw-bold text-dark fs-6">{selectedTask.estimatedTime} hrs</span>
                                            </div>
                                        )}
                                        {selectedTask.timeSpent > 0 && (
                                            <div className="col-6 col-md-3">
                                                <span className="d-block text-muted small fw-semibold">Time Spent</span>
                                                <span className="fw-bold text-success fs-6">{selectedTask.timeSpent} hrs</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Attachments */}
                            {Array.isArray(selectedTask.attachments) && selectedTask.attachments.length > 0 && (
                                <div className="modal-content-card">
                                    <div className="card-section-label">
                                        <i className="bi bi-paperclip text-secondary me-1.5"></i> Attachments ({selectedTask.attachments.length})
                                    </div>
                                    <div className="attachments-list-grid">
                                        {selectedTask.attachments.map((att, idx) => (
                                            <a
                                                key={idx}
                                                href={att.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="attachment-item-card"
                                            >
                                                <div className="att-icon-wrap">
                                                    <i className="bi bi-file-earmark-arrow-down text-primary fs-5"></i>
                                                </div>
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
            </Modal>

            {/* Project Details Modal */}
            <Modal
                show={showProjectModal}
                onHide={() => setShowProjectModal(false)}
                size="lg"
                centered
                className="project-detail-modal"
            >
                <Modal.Header className="custom-modal-header border-0 pb-0">
                    <div className="d-flex flex-column w-100">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="modal-project-tag">{selectedProject?.projectType || 'Tech'}</span>
                            <button
                                type="button"
                                className="btn-modal-close-icon"
                                onClick={() => setShowProjectModal(false)}
                                title="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <h3 className="project-modal-main-title">{selectedProject?.name}</h3>
                    </div>
                </Modal.Header>
                <Modal.Body className="custom-modal-body">
                    {selectedProject && (
                        <div className="modal-body-layout">
                            <div className="modal-content-card">
                                <div className="card-section-label">
                                    <i className="bi bi-file-earmark-text text-primary me-1.5"></i> Description
                                </div>
                                <p className="modal-desc-content">
                                    {selectedProject.description || 'No description available for this project.'}
                                </p>
                            </div>

                            <div className="modal-meta-grid-modern">
                                <div className="meta-card-modern">
                                    <div className="meta-card-header">
                                        <i className="bi bi-activity text-primary"></i>
                                        <span>Status</span>
                                    </div>
                                    <span className={`status-badge-pill mt-1 ${selectedProject.projectStatus?.toLowerCase() || 'ongoing'}`}>
                                        {selectedProject.projectStatus || 'Ongoing'}
                                    </span>
                                </div>
                                <div className="meta-card-modern">
                                    <div className="meta-card-header">
                                        <i className="bi bi-calendar-check text-success"></i>
                                        <span>Start Date</span>
                                    </div>
                                    <span className="meta-card-val fw-bold text-dark mt-1">{formatDate(selectedProject.start || selectedProject.startDate)}</span>
                                </div>
                                <div className="meta-card-modern">
                                    <div className="meta-card-header">
                                        <i className="bi bi-calendar-x text-warning"></i>
                                        <span>End Date</span>
                                    </div>
                                    <span className="meta-card-val fw-bold text-dark mt-1">{formatDate(selectedProject.end || selectedProject.estimatedCompletion)}</span>
                                </div>
                            </div>

                            {/* Links & Websites */}
                            {((selectedProject.figmaLinks && selectedProject.figmaLinks.length > 0) ||
                                (selectedProject.documentLinks && selectedProject.documentLinks.length > 0) ||
                                (selectedProject.websites && selectedProject.websites.length > 0)) && (
                                    <div className="modal-content-card">
                                        <div className="card-section-label">
                                            <i className="bi bi-link-45deg text-primary me-1.5"></i> Resources & Links
                                        </div>

                                        {/* Figma Links */}
                                        {selectedProject.figmaLinks && selectedProject.figmaLinks.length > 0 && (
                                            <div className="link-sub-section mb-3">
                                                <div className="sub-section-title"><i className="bi bi-pencil-ruler text-info me-1"></i> Figma Designs</div>
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
                                            <div className="link-sub-section mb-3">
                                                <div className="sub-section-title"><i className="bi bi-file-earmark-text text-primary me-1"></i> Document Links</div>
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
                                                <div className="sub-section-title"><i className="bi bi-globe text-success me-1"></i> Websites & Credentials</div>
                                                <div className="websites-credentials-wrapper">
                                                    {selectedProject.websites.map((web, idx) => (
                                                        <div key={idx} className="website-cred-card">
                                                            <div className="web-header">
                                                                <span className="web-title">{web.title}</span>
                                                                <a href={web.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-success py-1 px-2.5" style={{ fontSize: '11px', borderRadius: '6px' }}>
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
                                <div className="modal-content-card">
                                    <div className="card-section-label">
                                        <i className="bi bi-cpu text-primary me-1.5"></i> Technologies
                                    </div>
                                    <div className="tech-badge-container">
                                        {selectedProject.technology.map(t => (
                                            <span key={t._id} className="tech-badge large">{t.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Team */}
                            {Array.isArray(selectedProject.team) && selectedProject.team.length > 0 && (
                                <div className="modal-content-card">
                                    <div className="card-section-label">
                                        <i className="bi bi-people text-primary me-1.5"></i> Assigned Resources
                                    </div>
                                    <div className="modal-team-list-grid">
                                        {selectedProject.team.map((member) => (
                                            <div key={member._id} className="team-member-item">
                                                <div className="team-member-avatar">
                                                    {member.name ? member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
                                                </div>
                                                <div className="team-member-details text-truncate">
                                                    <span className="team-member-name text-truncate">{member.name}</span>
                                                    {member.designation && <span className="small text-muted d-block text-truncate">{typeof member.designation === 'object' ? member.designation.name : member.designation}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Projects;
