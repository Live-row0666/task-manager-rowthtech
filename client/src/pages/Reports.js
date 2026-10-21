import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard } from '../redux/actions';
import { toast } from 'react-toastify';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import moment from 'moment';
import { Modal, Button, Badge } from 'react-bootstrap';
import './Dashboard.css';
import './Reports.css';

// Modal for viewing tasks and hours of a milestone
const MilestoneTasksModal = ({ show, onHide, milestone }) => {
    if (!milestone) return null;
    const tasks = Array.isArray(milestone.tasks) ? milestone.tasks : [];
    const totalHours = milestone.totalHours !== undefined
        ? milestone.totalHours
        : tasks.reduce((sum, t) => sum + (Number(t.estimatedTime) || 0), 0);
    const completedTasksCount = milestone.completedTasks !== undefined
        ? milestone.completedTasks
        : tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length;
    const pendingTasksCount = milestone.pendingTasks !== undefined
        ? milestone.pendingTasks
        : Math.max(0, tasks.length - completedTasksCount);

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" className="milestone-details-modal">
            <Modal.Header className="py-2 px-3 border-bottom bg-light">
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3" style={{ width: 34, height: 34 }}>
                        <i className="bi bi-flag-fill" style={{ fontSize: 16 }} />
                    </div>
                    <div>
                        <Modal.Title className="h6 mb-0 fw-bold text-dark">
                            {milestone.title || milestone.name}
                        </Modal.Title>
                        <small className="text-muted" style={{ fontSize: '11px' }}>
                            {milestone.startDate ? moment(milestone.startDate).format('DD MMM YYYY') : 'N/A'} &bull; Target: {milestone.completionDate ? moment(milestone.completionDate).format('DD MMM YYYY') : 'N/A'}
                        </small>
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="p-3">
                {/* Stats summary bar */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                    <div className="px-3 py-2 bg-light border rounded-3 d-flex align-items-center gap-2 flex-grow-1">
                        <i className="bi bi-clock-history text-primary fs-5" />
                        <div>
                            <div className="small text-muted" style={{ fontSize: '11px' }}>Total Hours</div>
                            <div className="fw-bold fs-6 text-dark">{totalHours} hrs</div>
                        </div>
                    </div>
                    <div className="px-3 py-2 bg-light border rounded-3 d-flex align-items-center gap-2 flex-grow-1">
                        <i className="bi bi-check2-circle text-success fs-5" />
                        <div>
                            <div className="small text-muted" style={{ fontSize: '11px' }}>Completed Tasks</div>
                            <div className="fw-bold fs-6 text-success">{completedTasksCount} tasks</div>
                        </div>
                    </div>
                    <div className="px-3 py-2 bg-light border rounded-3 d-flex align-items-center gap-2 flex-grow-1">
                        <i className="bi bi-hourglass-split text-warning fs-5" />
                        <div>
                            <div className="small text-muted" style={{ fontSize: '11px' }}>Pending Tasks</div>
                            <div className="fw-bold fs-6 text-warning">{pendingTasksCount} tasks</div>
                        </div>
                    </div>
                    <div className="px-3 py-2 bg-light border rounded-3 d-flex align-items-center gap-2 flex-grow-1">
                        <i className="bi bi-pie-chart text-info fs-5" />
                        <div>
                            <div className="small text-muted" style={{ fontSize: '11px' }}>Progress</div>
                            <div className="fw-bold fs-6 text-info">{milestone.progress || (milestone.status === 'Completed' ? 100 : 0)}%</div>
                        </div>
                    </div>
                </div>

                {/* Tasks Table */}
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '13px' }}>
                    <i className="bi bi-list-check me-1 text-primary" /> Milestone Tasks ({tasks.length})
                </h6>
                {tasks.length === 0 ? (
                    <div className="text-center py-4 bg-light rounded-3 text-muted">
                        <i className="bi bi-inbox fs-2 d-block mb-1 text-secondary" />
                        <p className="mb-0 small">No tasks logged under this milestone yet.</p>
                    </div>
                ) : (
                    <div className="table-responsive border rounded-3" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table className="table table-hover table-sm mb-0 align-middle" style={{ fontSize: '12px' }}>
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th style={{ width: '5%' }}>#</th>
                                    <th style={{ width: '45%' }}>Task Summary</th>
                                    <th style={{ width: '15%' }}>Status</th>
                                    <th style={{ width: '15%' }}>Hours</th>
                                    <th style={{ width: '20%' }}>Assignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task, idx) => (
                                    <tr key={task._id || idx}>
                                        <td className="text-muted">{idx + 1}</td>
                                        <td className="fw-semibold text-dark">{task.summary}</td>
                                        <td>
                                            <span className={`badge py-1 px-2 ${task.status === 'Done' || task.status === 'Completed' ? 'bg-success' : task.status === 'In Progress' ? 'bg-primary' : task.status === 'Testing' ? 'bg-info' : 'bg-secondary'}`} style={{ fontSize: '10px' }}>
                                                {task.status || 'To Do'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border py-1 px-2" style={{ fontSize: '11px' }}>
                                                <i className="bi bi-clock me-1 text-primary" />
                                                {task.estimatedTime || 0} hrs
                                            </span>
                                        </td>
                                        <td className="text-muted">{task.assignee?.name || 'Unassigned'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="py-2 px-3 bg-light border-top">
                <Button variant="secondary" size="sm" onClick={onHide} style={{ fontSize: '12px', padding: '4px 16px' }}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// Smooth animated counter component for numbers
const CountUp = ({ end = 0, duration = 900, decimals = 0 }) => {
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

const Reports = () => {
    const dispatch = useDispatch();
    const { dashboard } = useSelector((state) => ({
        dashboard: state.Auth.dashboard,
    }));

    const [selectedProjectId, setSelectedProjectId] = useState(() => {
        try {
            return localStorage.getItem('client_selected_project_id') || "";
        } catch (e) {
            return "";
        }
    });
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedMilestoneModal, setSelectedMilestoneModal] = useState(null);
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
        if (dashboard?.projects?.length > 0) {
            const savedProject = localStorage.getItem('client_selected_project_id');
            const projectExists = dashboard.projects.some(p => p._id === savedProject);
            if (projectExists && savedProject) {
                if (selectedProjectId !== savedProject) {
                    setSelectedProjectId(savedProject);
                }
            } else if (!selectedProjectId) {
                const firstId = dashboard.projects[0]._id;
                setSelectedProjectId(firstId);
                try {
                    localStorage.setItem('client_selected_project_id', firstId);
                } catch (e) { }
            }
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

    const summary = dashboard?.summary || {};
    const project = dashboard?.project || {};
    const milestones = useMemo(() => dashboard?.milestones || [], [dashboard?.milestones]);
    const currentProject = dashboard?.projects?.find(p => p._id === selectedProjectId) || dashboard?.project;

    // Computed Statistics
    const totalMilestones = summary.totalMilestones || milestones.length || 0;
    const completedMilestones = summary.completedMilestones || milestones.filter(m => m.status === "Completed").length || 0;
    const inProgressMilestones = summary.inProgressMilestones || milestones.filter(m => m.status === "In Progress").length || 0;
    const pendingMilestones = summary.pendingMilestones || milestones.filter(m => m.status === "Not Started" || !m.status).length || 0;

    const totalTasks = summary.totalTasks || 0;
    const completedTasks = summary.completedTasks || 0;
    const remainingTasks = summary.remainingTasks || (totalTasks - completedTasks);
    const overallProgress = summary.overallProgress || (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

    const totalProjectHours = summary.totalHours !== undefined
        ? Number(summary.totalHours)
        : milestones.reduce((sum, m) => sum + (Number(m.totalHours) || 0), 0);
    const completedProjectHours = summary.completedHours !== undefined
        ? Number(summary.completedHours)
        : milestones.reduce((sum, m) => sum + (Number(m.completedHours) || 0), 0);
    const pendingProjectHours = summary.pendingHours !== undefined
        ? Number(summary.pendingHours)
        : Math.max(0, totalProjectHours - completedProjectHours);

    const completedPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const inProgressPercent = totalMilestones > 0 ? (inProgressMilestones / totalMilestones) * 100 : 0;
    const pendingPercent = totalMilestones > 0 ? (pendingMilestones / totalMilestones) * 100 : 0;

    // Filter milestones based on status tabs & search query
    const filteredMilestones = useMemo(() => {
        return milestones.filter((m) => {
            const matchesSearch = !searchQuery.trim() ||
                (m.title || m.name || "").toLowerCase().includes(searchQuery.toLowerCase());

            let matchesStatus = true;
            if (statusFilter === "Completed") matchesStatus = m.status === "Completed";
            else if (statusFilter === "In Progress") matchesStatus = m.status === "In Progress";
            else if (statusFilter === "Not Started") matchesStatus = m.status === "Not Started" || !m.status;

            return matchesSearch && matchesStatus;
        });
    }, [milestones, searchQuery, statusFilter]);

    // Active deliverable / focus phase
    const activeDeliverable = dashboard?.currentMilestone ||
        milestones.find(m => m.status === "In Progress") ||
        milestones[0];

    // Export to CSV Function
    const handleExportCSV = () => {
        try {
            const dataToExport = (searchQuery.trim() || statusFilter !== "all") ? filteredMilestones : milestones;

            if (!milestones || milestones.length === 0) {
                toast.info("No milestone data available to export for this project.");
                return;
            }

            if (dataToExport.length === 0) {
                toast.info("No milestones match the current filter criteria to export.");
                return;
            }

            const escapeCSVCell = (val) => {
                if (val === null || val === undefined) return '""';
                const str = String(val).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ');
                return `"${str.replace(/"/g, '""')}"`;
            };

            const headers = [
                "#",
                "Milestone Title",
                "Start Date",
                "Target Delivery",
                "Completed Tasks",
                "Pending Tasks",
                "Total Tasks",
                "Total Hours (hrs)",
                "Progress (%)",
                "Status"
            ];

            const rows = dataToExport.map((m, idx) => {
                const total = Number(m.totalTasks) || 0;
                const completed = Number(m.completedTasks) || 0;
                const pending = m.pendingTasks !== undefined ? Number(m.pendingTasks) : Math.max(0, total - completed);
                const hours = Number(m.totalHours) || 0;
                const progress = m.progress !== undefined
                    ? m.progress
                    : (m.status === 'Completed' || m.status === 'Done' ? 100 : 0);
                const startDate = m.startDate ? moment(m.startDate).format("DD/MM/YYYY") : "-";
                const targetDate = m.completionDate
                    ? moment(m.completionDate).format("DD/MM/YYYY")
                    : (m.estimatedCompletion ? moment(m.estimatedCompletion).format("DD/MM/YYYY") : "-");

                return [
                    idx + 1,
                    m.title || m.name || `Milestone ${idx + 1}`,
                    startDate,
                    targetDate,
                    completed,
                    pending,
                    total,
                    hours,
                    `${progress}%`,
                    m.status || 'Not Started'
                ];
            });

            const csvString = [
                headers.map(escapeCSVCell).join(","),
                ...rows.map(row => row.map(escapeCSVCell).join(","))
            ].join("\r\n");

            // Prepend UTF-8 BOM so Excel and spreadsheet viewers properly decode UTF-8 characters
            const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const projectNameClean = (currentProject?.name || "Project")
                .trim()
                .replace(/[^a-zA-Z0-9_-]/g, "_")
                .replace(/_+/g, "_");
            const fileName = `${projectNameClean}_Performance_Report_${moment().format("YYYY-MM-DD")}.csv`;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 500);

            toast.success("CSV report downloaded successfully!");
        } catch (error) {
            console.error("Failed to export CSV:", error);
            toast.error("Failed to export CSV. Please try again.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getStatusBadgeClass = (status) => {
        if (status === "Completed") return "rep-badge-pill badge-status-completed";
        if (status === "In Progress") return "rep-badge-pill badge-status-inprogress";
        return "rep-badge-pill badge-status-notstarted";
    };

    const getProgressBarClass = (status) => {
        if (status === "Completed") return "bg-bar-emerald";
        if (status === "In Progress") return "bg-bar-amber";
        return "bg-bar-indigo";
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="reports" />

            <main className="dash-main">
                <CommonHeader title="Project Reports" />

                {/* Hero Header Section */}
                <div className="reports-hero-bar">
                    <div className="reports-hero-left">
                        <div className="reports-badge-tag">
                            <i className="bi bi-graph-up-arrow"></i>
                            Executive Analytics
                        </div>
                        <h2 className="reports-hero-title">Project Performance & Analytics Report</h2>
                        <p className="reports-hero-subtitle">
                            Detailed breakdown of project deliverables, milestone progress velocity, and task execution statistics.
                        </p>

                        <div className="reports-meta-chips">
                            <div className="report-chip">
                                <i className="bi bi-folder2-open"></i>
                                <span>{currentProject?.name || "Active Workspace"}</span>
                            </div>
                            <div className="report-chip report-chip-status">
                                <span className="pulse-dot-green"></span>
                                <span>{project.projectStatus || "Ongoing"}</span>
                            </div>
                            <div className="report-chip">
                                <i className="bi bi-clock-history"></i>
                                <span>Generated: {moment().format("DD MMM YYYY, HH:mm")}</span>
                            </div>
                            <div className="report-chip">
                                <i className="bi bi-stopwatch text-primary"></i>
                                <span>Total Hours: {totalProjectHours} hrs</span>
                            </div>
                        </div>
                    </div>

                    <div className="reports-hero-actions">
                        {/* Project Switcher Dropdown */}
                        {dashboard?.projects?.length > 1 && (
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
                                            <span>Switch Project Report</span>
                                        </div>
                                        <div className="project-dropdown-list">
                                            {dashboard.projects.map((p) => {
                                                const isSelected = p._id === selectedProjectId;
                                                return (
                                                    <div
                                                        key={p._id}
                                                        className={`project-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedProjectId(p._id);
                                                            try {
                                                                localStorage.setItem('client_selected_project_id', p._id);
                                                            } catch (e) { }
                                                            setIsProjectDropdownOpen(false);
                                                        }}
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
                            className="btn-report-action"
                            onClick={handleExportCSV}
                            title="Export milestone data to CSV spreadsheet"
                        >
                            <i className="bi bi-file-earmark-spreadsheet text-success"></i>
                            <span>Export CSV</span>
                        </button>

                        <button
                            type="button"
                            className="btn-report-action btn-primary-gradient"
                            onClick={handlePrint}
                            title="Print or save PDF report"
                        >
                            <i className="bi bi-printer-fill"></i>
                            <span>Print / Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* 5 Executive KPI Summary Cards */}
                <div className="reports-kpi-grid">
                    {/* Card 1: Project Status */}
                    <div className="rep-kpi-card">
                        <div className="rep-kpi-top">
                            <span className="rep-kpi-label">Project Status</span>
                            <div className="rep-kpi-icon rep-icon-indigo">
                                <i className="bi bi-briefcase-fill"></i>
                            </div>
                        </div>
                        <div className="rep-kpi-main">
                            <span className="rep-kpi-val" style={{ fontSize: '20px' }}>
                                {project.projectStatus || 'Ongoing'}
                            </span>
                            <span className="rep-kpi-tag tag-indigo">Active</span>
                        </div>
                        <div className="rep-kpi-progress">
                            <div className="rep-kpi-progress-bar bg-bar-indigo" style={{ width: '100%' }}></div>
                        </div>
                        <span className="rep-kpi-sub">
                            {project.startDate ? moment(project.startDate).format("MMM YYYY") : "Kickoff"} - {project.estimatedCompletion ? moment(project.estimatedCompletion).format("MMM YYYY") : "Delivery"}
                        </span>
                    </div>

                    {/* Card 2: Overall Completion */}
                    <div className="rep-kpi-card">
                        <div className="rep-kpi-top">
                            <span className="rep-kpi-label">Overall Completion</span>
                            <div className="rep-kpi-icon rep-icon-emerald">
                                <i className="bi bi-pie-chart-fill"></i>
                            </div>
                        </div>
                        <div className="rep-kpi-main">
                            <span className="rep-kpi-val text-success">
                                <CountUp end={overallProgress} />%
                            </span>
                            <span className="rep-kpi-tag tag-emerald">
                                {overallProgress >= 50 ? 'On Track' : 'In Progress'}
                            </span>
                        </div>
                        <div className="rep-kpi-progress">
                            <div className="rep-kpi-progress-bar bg-bar-emerald" style={{ width: `${overallProgress}%` }}></div>
                        </div>
                        <span className="rep-kpi-sub">
                            Aggregated deliverables completion
                        </span>
                    </div>

                    {/* Card 3: Milestones Delivered */}
                    <div className="rep-kpi-card">
                        <div className="rep-kpi-top">
                            <span className="rep-kpi-label">Milestones Delivered</span>
                            <div className="rep-kpi-icon rep-icon-purple">
                                <i className="bi bi-layers-fill"></i>
                            </div>
                        </div>
                        <div className="rep-kpi-main">
                            <span className="rep-kpi-val text-primary">
                                <CountUp end={completedMilestones} /> / <CountUp end={totalMilestones} />
                            </span>
                            <span className="rep-kpi-tag tag-purple">
                                <CountUp end={completedPercent} decimals={0} />%
                            </span>
                        </div>
                        <div className="rep-kpi-progress">
                            <div className="rep-kpi-progress-bar bg-bar-purple" style={{ width: `${completedPercent}%` }}></div>
                        </div>
                        <span className="rep-kpi-sub">
                            {inProgressMilestones} active &bull; {pendingMilestones} scheduled
                        </span>
                    </div>


                    {/* Card 5: Total Project Hours */}
                    <div className="rep-kpi-card">
                        <div className="rep-kpi-top">
                            <span className="rep-kpi-label">Project Hours</span>
                            <div className="rep-kpi-icon rep-icon-amber">
                                <i className="bi bi-clock-history"></i>
                            </div>
                        </div>
                        <div className="rep-kpi-main">
                            <span className="rep-kpi-val text-warning">
                                <CountUp end={totalProjectHours} /> <small style={{ fontSize: '13px', fontWeight: 600 }}>hrs</small>
                            </span>
                            <span className="rep-kpi-tag tag-amber">
                                {completedProjectHours} hrs done
                            </span>
                        </div>
                        <div className="rep-kpi-progress">
                            <div className="rep-kpi-progress-bar bg-bar-amber" style={{ width: `${totalProjectHours > 0 ? (completedProjectHours / totalProjectHours) * 100 : 0}%` }}></div>
                        </div>
                        <span className="rep-kpi-sub">
                            {pendingProjectHours} hrs pending across all milestones
                        </span>
                    </div>

                    {/* Card 5: Current Focus Milestone */}
                    <div className="rep-kpi-card">
                        <div className="rep-kpi-top">
                            <span className="rep-kpi-label">Current Focus</span>
                            <div className="rep-kpi-icon rep-icon-amber">
                                <i className="bi bi-flag-fill"></i>
                            </div>
                        </div>
                        <div className="rep-kpi-main">
                            <span className="rep-kpi-val text-dark" style={{ fontSize: '18px' }} title={activeDeliverable?.title || activeDeliverable?.name}>
                                {activeDeliverable?.title || activeDeliverable?.name || "None in flight"}
                            </span>
                            <span className="rep-kpi-tag tag-amber">Target</span>
                        </div>
                        <div className="rep-kpi-progress">
                            <div className="rep-kpi-progress-bar bg-bar-amber" style={{ width: `${activeDeliverable?.progress || 0}%` }}></div>
                        </div>
                        <span className="rep-kpi-sub">
                            Due: {activeDeliverable?.completionDate ? moment(activeDeliverable.completionDate).format("DD MMM YYYY") : "Pending"}
                        </span>
                    </div>
                </div>

                {/* Analytics Insights Row */}
                <div className="reports-analytics-row">
                    {/* Panel 1: Milestone Delivery Health */}
                    <div className="analytics-panel">
                        <div className="panel-header">
                            <h4 className="panel-title">
                                <i className="bi bi-pie-chart"></i>
                                Milestone Status Distribution
                            </h4>
                            <span className="panel-badge">{totalMilestones} Total Phases</span>
                        </div>

                        {/* Segmented Distribution Bar */}
                        <div className="multi-segment-track">
                            <div
                                className="segment-item segment-completed"
                                style={{ width: `${completedPercent}%` }}
                                title={`Completed: ${completedMilestones} (${Math.round(completedPercent)}%)`}
                            />
                            <div
                                className="segment-item segment-in-progress"
                                style={{ width: `${inProgressPercent}%` }}
                                title={`In Progress: ${inProgressMilestones} (${Math.round(inProgressPercent)}%)`}
                            />
                            <div
                                className="segment-item segment-not-started"
                                style={{ width: `${pendingPercent}%` }}
                                title={`Not Started: ${pendingMilestones} (${Math.round(pendingPercent)}%)`}
                            />
                        </div>

                        {/* Legend */}
                        <div className="legend-grid">
                            <div className="legend-item">
                                <div className="legend-dot-label">
                                    <span className="legend-dot dot-green"></span>
                                    <span>Completed</span>
                                </div>
                                <span className="legend-val">{completedMilestones}</span>
                                <span className="legend-sub">{completedPercent.toFixed(0)}% of project</span>
                            </div>

                            <div className="legend-item">
                                <div className="legend-dot-label">
                                    <span className="legend-dot dot-amber"></span>
                                    <span>In Progress</span>
                                </div>
                                <span className="legend-val">{inProgressMilestones}</span>
                                <span className="legend-sub">{inProgressPercent.toFixed(0)}% active</span>
                            </div>

                            <div className="legend-item">
                                <div className="legend-dot-label">
                                    <span className="legend-dot dot-gray"></span>
                                    <span>Not Started</span>
                                </div>
                                <span className="legend-val">{pendingMilestones}</span>
                                <span className="legend-sub">{pendingPercent.toFixed(0)}% queued</span>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Task Execution & Delivery Velocity */}
                    <div className="analytics-panel">
                        <div className="panel-header">
                            <h4 className="panel-title">
                                <i className="bi bi-speedometer2"></i>
                                Task Velocity & Timeline
                            </h4>
                            <span className="panel-badge">{totalTasks} Total Tasks</span>
                        </div>

                        <div className="task-velocity-grid">
                            <div className="velocity-box">
                                <div className="velocity-box-title">Completed Work</div>
                                <div className="velocity-box-value text-success">
                                    {completedTasks} <small className="text-muted" style={{ fontSize: '12px' }}>tasks</small>
                                    <span className="d-block text-muted mt-1" style={{ fontSize: '11px', fontWeight: 500 }}>
                                        {completedProjectHours} hrs delivered
                                    </span>
                                </div>
                            </div>
                            <div className="velocity-box">
                                <div className="velocity-box-title">Pending Delivery</div>
                                <div className="velocity-box-value text-amber">
                                    {remainingTasks} <small className="text-muted" style={{ fontSize: '12px' }}>tasks</small>
                                    <span className="d-block text-muted mt-1" style={{ fontSize: '11px', fontWeight: 500 }}>
                                        {pendingProjectHours} hrs queued
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-info-strip">
                            <div className="timeline-info-item">
                                <i className="bi bi-calendar2-check"></i>
                                <span>Kickoff: {project.startDate ? moment(project.startDate).format("DD MMM YYYY") : "N/A"}</span>
                            </div>
                            <div className="timeline-info-item">
                                <i className="bi bi-flag"></i>
                                <span>Target Delivery: {project.estimatedCompletion ? moment(project.estimatedCompletion).format("DD MMM YYYY") : "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Milestones Detailed Status Table Card */}
                <div className="reports-table-card">
                    <div className="reports-table-header">
                        <div className="table-header-left">
                            <h3 className="table-header-title">Milestones Detailed Status</h3>
                            <span className="table-count-badge">
                                {filteredMilestones.length} of {milestones.length} Milestones
                            </span>
                        </div>

                        <div className="table-controls">
                            {/* Filter Tabs */}
                            <div className="status-filter-pills">
                                <button
                                    type="button"
                                    className={`filter-tab-pill ${statusFilter === "all" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("all")}
                                >
                                    <span>All</span>
                                    <span className="tab-pill-count">{milestones.length}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`filter-tab-pill ${statusFilter === "In Progress" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("In Progress")}
                                >
                                    <span>In Progress</span>
                                    <span className="tab-pill-count">{inProgressMilestones}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`filter-tab-pill ${statusFilter === "Completed" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("Completed")}
                                >
                                    <span>Completed</span>
                                    <span className="tab-pill-count">{completedMilestones}</span>
                                </button>
                                <button
                                    type="button"
                                    className={`filter-tab-pill ${statusFilter === "Not Started" ? "active" : ""}`}
                                    onClick={() => setStatusFilter("Not Started")}
                                >
                                    <span>Not Started</span>
                                    <span className="tab-pill-count">{pendingMilestones}</span>
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="report-search-box">
                                <i className="bi bi-search report-search-icon"></i>
                                <input
                                    type="text"
                                    className="report-search-input"
                                    placeholder="Search milestone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="report-search-clear"
                                        onClick={() => setSearchQuery("")}
                                        title="Clear search"
                                    >
                                        <i className="bi bi-x-circle-fill"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-reports-custom">
                            <thead>
                                <tr>
                                    <th className="col-idx">#</th>
                                    <th>Milestone Title</th>
                                    <th>Start Date</th>
                                    <th>Estimated Delivery</th>
                                    <th>Completed Tasks</th>
                                    <th>Pending Tasks</th>
                                    <th>Hours</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMilestones.length > 0 ? (
                                    filteredMilestones.map((m, idx) => {
                                        const progressVal = m.progress || (m.status === 'Completed' ? 100 : 0);
                                        const statusName = m.status || 'Not Started';

                                        return (
                                            <tr key={m._id || idx} onClick={() => setSelectedMilestoneModal(m)} style={{ cursor: 'pointer' }} className="milestone-table-row" title="Click to view milestone tasks & hours">
                                                <td className="col-idx">{idx + 1}</td>
                                                <td>
                                                    <div className="milestone-title-wrap">
                                                        <div className="milestone-icon-avatar">
                                                            <i className="bi bi-flag-fill"></i>
                                                        </div>
                                                        <div>
                                                            <div className="milestone-title-text text-primary fw-bold">{m.title || m.name}</div>
                                                            <small className="text-muted" style={{ fontSize: '10px' }}>
                                                                <i className="bi bi-eye me-1" />View tasks &amp; hours
                                                            </small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="date-pill">
                                                        <i className="bi bi-calendar3"></i>
                                                        {m.startDate ? moment(m.startDate).format('DD/MM/YYYY') : '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="date-pill">
                                                        <i className="bi bi-calendar-check"></i>
                                                        {m.completionDate ? moment(m.completionDate).format('DD/MM/YYYY') : '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2" style={{ fontSize: '11px', fontWeight: 600 }}>
                                                        <i className="bi bi-check2-circle me-1"></i> {m.completedTasks || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle py-1 px-2" style={{ fontSize: '11px', fontWeight: 600 }}>
                                                        <i className="bi bi-hourglass-split me-1"></i> {m.pendingTasks !== undefined ? m.pendingTasks : Math.max(0, (m.totalTasks || 0) - (m.completedTasks || 0))}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border py-1 px-2" style={{ fontSize: '11px', fontWeight: 600 }}>
                                                        <i className="bi bi-clock me-1 text-primary"></i> {m.totalHours || 0} hrs
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="progress-cell-wrap">
                                                        <div className="progress-track-custom">
                                                            <div
                                                                className={`progress-fill-custom ${getProgressBarClass(statusName)}`}
                                                                style={{ width: `${progressVal}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="progress-pct-text">{progressVal}%</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={getStatusBadgeClass(statusName)}>
                                                        {statusName === "Completed" && <i className="bi bi-check-circle-fill me-1"></i>}
                                                        {statusName === "In Progress" && <i className="bi bi-hourglass-split me-1"></i>}
                                                        {statusName === "Not Started" && <i className="bi bi-dash-circle me-1"></i>}
                                                        {statusName}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9}>
                                            <div className="table-empty-wrap">
                                                <i className="bi bi-search table-empty-icon"></i>
                                                <div className="table-empty-title">No Milestones Found</div>
                                                <div className="table-empty-sub">
                                                    {searchQuery || statusFilter !== "all"
                                                        ? "No milestones match your current filter or search criteria."
                                                        : "No milestone records are currently available for this project."}
                                                </div>
                                                {(searchQuery || statusFilter !== "all") && (
                                                    <button
                                                        type="button"
                                                        className="btn-report-action"
                                                        onClick={() => {
                                                            setSearchQuery("");
                                                            setStatusFilter("all");
                                                        }}
                                                    >
                                                        <i className="bi bi-arrow-counterclockwise"></i>
                                                        Reset Filters
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Milestone Tasks & Hours Popup Modal */}
                <MilestoneTasksModal
                    show={!!selectedMilestoneModal}
                    onHide={() => setSelectedMilestoneModal(null)}
                    milestone={selectedMilestoneModal}
                />
            </main>
        </div>
    );
};

export default Reports;
