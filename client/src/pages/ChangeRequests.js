import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import { getDashboard } from '../redux/actions';
import { getCRStats, getCRs, createCRApi, deleteCRApi, updateCRApi } from '../helpers/api/auth';
import './Dashboard.css';
import './ChangeRequests.css';

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

const ChangeRequests = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const projectDropdownRef = useRef(null);

    const { dashboard } = useSelector((s) => ({
        dashboard: s.Auth.dashboard
    }));

    const [crs, setCrs] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        submitted: 0,
        inReview: 0,
        approved: 0,
        rejected: 0,
        inProgress: 0,
        completed: 0
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Selected project & filters
    const [selProject, setSelProject] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedCR, setSelectedCR] = useState(null);

    // Create form state
    const [newTitle, setNewTitle] = useState('');
    const [newProject, setNewProject] = useState('');
    const [newPriority, setNewPriority] = useState('medium');
    const [newTargetDate, setNewTargetDate] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newClientNotes, setNewClientNotes] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [formError, setFormError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    const projects = useMemo(() => dashboard?.projects || [], [dashboard?.projects]);

    useEffect(() => {
        if (projects.length > 0 && !selProject) {
            setSelProject(projects[0]._id);
        }
    }, [projects, selProject]);

    // Fetch CRs and Stats
    const fetchCRData = async () => {
        setLoading(true);
        try {
            const [crRes, statsRes] = await Promise.all([
                getCRs({ projectId: selProject, status: statusFilter, priority: priorityFilter, search: searchTerm }),
                getCRStats(selProject)
            ]);
            if (crRes?.data?.status === 200) {
                setCrs(crRes.data.data || []);
            }
            if (statsRes?.data?.status === 200) {
                setStats(statsRes.data.data || {});
            }
        } catch (err) {
            console.error('Error loading CR data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCRData();
    }, [selProject, statusFilter, priorityFilter, searchTerm]);

    // Close project dropdown on outside click
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

    // Reset create modal
    const handleOpenCreateModal = () => {
        setNewTitle('');
        setNewProject(selProject || (projects[0]?._id || ''));
        setNewPriority('medium');
        setNewTargetDate('');
        setNewDescription('');
        setNewClientNotes('');
        setSelectedFiles([]);
        setFormError('');
        setIsDragging(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowCreateModal(true);
    };

    const handleFilesAdd = (newFiles) => {
        if (!newFiles || !newFiles.length) return;
        setSelectedFiles((prev) => {
            const combined = [...prev];
            for (const file of newFiles) {
                const exists = combined.some(
                    (f) => f.name === file.name && f.size === file.size
                );
                if (!exists) {
                    combined.push(file);
                }
            }
            return combined;
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            handleFilesAdd(Array.from(e.target.files));
            e.target.value = '';
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (file) => {
        const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
            return 'bi-file-earmark-image text-primary';
        }
        if (['pdf'].includes(ext)) {
            return 'bi-file-earmark-pdf text-danger';
        }
        if (['doc', 'docx'].includes(ext)) {
            return 'bi-file-earmark-word text-info';
        }
        if (['xls', 'xlsx', 'csv'].includes(ext)) {
            return 'bi-file-earmark-excel text-success';
        }
        if (['zip', 'rar', '7z', 'tar'].includes(ext)) {
            return 'bi-file-earmark-zip text-warning';
        }
        return 'bi-file-earmark-text text-secondary';
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            setFormError('Please enter a descriptive Change Request title.');
            return;
        }
        if (!newProject) {
            setFormError('Please select a project.');
            return;
        }

        setSubmitting(true);
        setFormError('');

        try {
            const formData = new FormData();
            formData.append('title', newTitle.trim());
            formData.append('project', newProject);
            formData.append('priority', newPriority);
            if (newTargetDate) formData.append('targetDate', newTargetDate);
            formData.append('description', newDescription.trim());
            formData.append('clientNotes', newClientNotes.trim());

            if (selectedFiles.length > 0) {
                selectedFiles.forEach((file) => {
                    formData.append('attachments', file);
                });
            }

            const res = await createCRApi(formData);
            if (res?.data?.status === 201 || res?.status === 201 || res?.data?.data?._id) {
                setShowCreateModal(false);
                fetchCRData();
            } else {
                setFormError(res?.data?.message || 'Failed to create Change Request.');
            }
        } catch (err) {
            console.error('Submit CR error:', err);
            setFormError(err?.response?.data?.message || err?.message || 'Error creating Change Request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCR = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this Change Request?')) return;
        try {
            await deleteCRApi(id);
            fetchCRData();
            if (selectedCR?._id === id) setShowViewModal(false);
        } catch (err) {
            alert(err?.response?.data?.message || 'Failed to cancel request');
        }
    };

    // Priority badge helper
    const getPriorityBadge = (priority) => {
        const p = (priority || 'medium').toLowerCase();
        if (p === 'urgent') return <span className="cr-prio-pill prio-urgent"><i className="bi bi-fire"></i> Urgent</span>;
        if (p === 'high') return <span className="cr-prio-pill prio-high"><i className="bi bi-arrow-up-circle-fill"></i> High</span>;
        if (p === 'low') return <span className="cr-prio-pill prio-low"><i className="bi bi-arrow-down-circle-fill"></i> Low</span>;
        return <span className="cr-prio-pill prio-medium"><i className="bi bi-dash-circle-fill"></i> Medium</span>;
    };

    // Status badge helper
    const getStatusBadge = (status) => {
        const s = (status || 'submitted').toLowerCase();
        if (s === 'approved') return <span className="cr-status-pill status-approved"><i className="bi bi-check-circle-fill"></i> Approved</span>;
        if (s === 'in_progress') return <span className="cr-status-pill status-inprogress"><i className="bi bi-gear-fill spin-icon"></i> In Progress</span>;
        if (s === 'completed') return <span className="cr-status-pill status-completed"><i className="bi bi-patch-check-fill"></i> Completed</span>;
        if (s === 'rejected') return <span className="cr-status-pill status-rejected"><i className="bi bi-x-circle-fill"></i> Rejected</span>;
        if (s === 'in_review') return <span className="cr-status-pill status-inreview"><i className="bi bi-eyeglasses"></i> In Review</span>;
        return <span className="cr-status-pill status-submitted"><i className="bi bi-send-fill"></i> Submitted</span>;
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="change-requests" />

            <main className="dash-main">
                <CommonHeader title="Change Requests" />

                {/* Hero Header Section */}
                <div className="cr-hero-bar">
                    <div className="cr-hero-left">
                        <div className="cr-badge-tag">
                            <i className="bi bi-file-earmark-diff-fill"></i>
                            Scope Enhancements & Change Requests
                        </div>
                        <h2 className="cr-hero-title">Project Change Requests (CR)</h2>
                        <p className="cr-hero-subtitle">
                            Request out-of-scope enhancements, structural changes, or new feature requests with our delivery team.
                        </p>

                        <div className="cr-meta-chips">
                            <div className="cr-meta-chip">
                                <i className="bi bi-folder2-open"></i>
                                <span>{currentProject?.name || "Active Workspace"}</span>
                            </div>
                            <div className="cr-meta-chip chip-live">
                                <span className="pulse-dot-green"></span>
                                <span>Live CR Pipeline</span>
                            </div>
                            <div className="cr-meta-chip">
                                <i className="bi bi-card-checklist"></i>
                                <span>{stats.total || 0} Total Requests</span>
                            </div>
                        </div>
                    </div>

                    <div className="cr-hero-actions">
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
                                                        onClick={() => {
                                                            setSelProject(p._id);
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
                            className="btn-cr-primary"
                            onClick={handleOpenCreateModal}
                        >
                            <i className="bi bi-plus-lg"></i>
                            <span>Create Change Request</span>
                        </button>
                    </div>
                </div>

                {/* 4 KPI Stat Cards */}
                <div className="cr-kpi-grid">
                    {/* Card 1: Total Requests */}
                    <div className="cr-kpi-card">
                        <div className="cr-kpi-top">
                            <span className="cr-kpi-label">Total Requests</span>
                            <div className="cr-kpi-icon icon-purple">
                                <i className="bi bi-file-earmark-diff"></i>
                            </div>
                        </div>
                        <div className="cr-kpi-main">
                            <span className="cr-kpi-val text-primary">
                                <CountUp end={stats.total || 0} />
                            </span>
                            <span className="cr-kpi-tag tag-purple">Logged</span>
                        </div>
                        <div className="cr-kpi-progress">
                            <div className="cr-kpi-progress-bar bg-purple" style={{ width: '100%' }}></div>
                        </div>
                        <span className="cr-kpi-sub">Total change requests submitted</span>
                    </div>

                    {/* Card 2: Pending Review */}
                    <div className="cr-kpi-card">
                        <div className="cr-kpi-top">
                            <span className="cr-kpi-label">Awaiting Review</span>
                            <div className="cr-kpi-icon icon-amber">
                                <i className="bi bi-hourglass-split"></i>
                            </div>
                        </div>
                        <div className="cr-kpi-main">
                            <span className="cr-kpi-val text-amber">
                                <CountUp end={(stats.submitted || 0) + (stats.inReview || 0)} />
                            </span>
                            <span className="cr-kpi-tag tag-amber">Reviewing</span>
                        </div>
                        <div className="cr-kpi-progress">
                            <div className="cr-kpi-progress-bar bg-amber" style={{ width: `${stats.total > 0 ? (((stats.submitted || 0) + (stats.inReview || 0)) / stats.total) * 100 : 0}%` }}></div>
                        </div>
                        <span className="cr-kpi-sub">Evaluating effort and estimation</span>
                    </div>

                    {/* Card 3: Approved / In Dev */}
                    <div className="cr-kpi-card">
                        <div className="cr-kpi-top">
                            <span className="cr-kpi-label">Approved & In Dev</span>
                            <div className="cr-kpi-icon icon-sky">
                                <i className="bi bi-gear-fill"></i>
                            </div>
                        </div>
                        <div className="cr-kpi-main">
                            <span className="cr-kpi-val text-sky">
                                <CountUp end={(stats.approved || 0) + (stats.inProgress || 0)} />
                            </span>
                            <span className="cr-kpi-tag tag-sky">Accepted</span>
                        </div>
                        <div className="cr-kpi-progress">
                            <div className="cr-kpi-progress-bar bg-sky" style={{ width: `${stats.total > 0 ? (((stats.approved || 0) + (stats.inProgress || 0)) / stats.total) * 100 : 0}%` }}></div>
                        </div>
                        <span className="cr-kpi-sub">Queued or actively being coded</span>
                    </div>

                    {/* Card 4: Completed */}
                    <div className="cr-kpi-card">
                        <div className="cr-kpi-top">
                            <span className="cr-kpi-label">Completed</span>
                            <div className="cr-kpi-icon icon-emerald">
                                <i className="bi bi-patch-check"></i>
                            </div>
                        </div>
                        <div className="cr-kpi-main">
                            <span className="cr-kpi-val text-emerald">
                                <CountUp end={stats.completed || 0} />
                            </span>
                            <span className="cr-kpi-tag tag-emerald">Delivered</span>
                        </div>
                        <div className="cr-kpi-progress">
                            <div className="cr-kpi-progress-bar bg-emerald" style={{ width: `${stats.total > 0 ? ((stats.completed || 0) / stats.total) * 100 : 0}%` }}></div>
                        </div>
                        <span className="cr-kpi-sub">Successfully deployed and delivered</span>
                    </div>
                </div>

                {/* Main Directory Table Card */}
                <div className="cr-main-card">
                    <div className="cr-toolbar">
                        <div className="cr-toolbar-left">
                            <h3 className="cr-toolbar-title">Change Requests Directory</h3>
                            <span className="cr-count-badge">
                                {crs.length} Total
                            </span>
                        </div>

                        <div className="cr-toolbar-controls">
                            {/* Filter Tabs */}
                            <div className="cr-filter-tabs">
                                {[
                                    { key: 'all', label: 'All', count: stats.total || 0 },
                                    { key: 'submitted', label: 'Submitted', count: stats.submitted || 0 },
                                    { key: 'in_review', label: 'In Review', count: stats.inReview || 0 },
                                    { key: 'approved', label: 'Approved', count: stats.approved || 0 },
                                    { key: 'in_progress', label: 'In Progress', count: stats.inProgress || 0 },
                                    { key: 'completed', label: 'Completed', count: stats.completed || 0 },
                                    { key: 'rejected', label: 'Rejected', count: stats.rejected || 0 }
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        className={`cr-filter-btn ${statusFilter === tab.key ? 'active' : ''}`}
                                        onClick={() => setStatusFilter(tab.key)}
                                    >
                                        <span>{tab.label}</span>
                                        <span className="cr-filter-count">{tab.count}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Search Box */}
                            <div className="cr-search-box">
                                <i className="bi bi-search cr-search-icon"></i>
                                <input
                                    type="text"
                                    className="cr-search-input"
                                    placeholder="Search Change Requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        className="cr-search-clear"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <i className="bi bi-x-circle-fill"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="cr-loading-wrap">
                            <div className="cr-spinner"></div>
                            <div>Loading Change Requests...</div>
                        </div>
                    ) : crs.length === 0 ? (
                        <div className="cr-empty-state">
                            <div className="cr-empty-icon-wrap">
                                <i className="bi bi-file-earmark-diff"></i>
                            </div>
                            <h4 className="cr-empty-title">No Change Requests Found</h4>
                            <p className="cr-empty-desc">
                                {searchTerm || statusFilter !== 'all'
                                    ? "No change requests matched your active filter or search."
                                    : "You haven't submitted any Change Requests for this project yet."}
                            </p>
                            <button
                                type="button"
                                className="btn-cr-primary"
                                onClick={handleOpenCreateModal}
                            >
                                <i className="bi bi-plus-lg"></i>
                                <span>Submit Your First Change Request</span>
                            </button>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table-cr-custom">
                                <thead>
                                    <tr>
                                        <th className="cr-col-idx">#</th>
                                        <th>Change Request</th>
                                        <th>Project</th>
                                        <th className="text-center">Priority</th>
                                        <th className="text-center">Est. Hours</th>
                                        <th className="text-center">Status</th>
                                        <th>Target Date</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {crs.map((item, idx) => (
                                        <tr
                                            key={item._id || idx}
                                            onClick={() => {
                                                setSelectedCR(item);
                                                setShowViewModal(true);
                                            }}
                                            title="Click to view details"
                                        >
                                            <td className="cr-col-idx">{idx + 1}</td>
                                            <td>
                                                <div className="cr-title-cell">
                                                    <div className="cr-icon-avatar">
                                                        <i className="bi bi-file-earmark-diff-fill"></i>
                                                    </div>
                                                    <div>
                                                        <div className="cr-title-text">
                                                            {item.title}
                                                        </div>
                                                        <div className="cr-sub-text">
                                                            Created {moment(item.createdAt).format('DD MMM YYYY')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="cr-project-pill">
                                                    <i className="bi bi-folder2"></i>
                                                    {item.project?.name || "Project"}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {getPriorityBadge(item.priority)}
                                            </td>
                                            <td className="text-center">
                                                <span className="cr-hours-badge">
                                                    <i className="bi bi-clock me-1"></i>
                                                    {item.estimatedHours > 0 ? `${item.estimatedHours} hrs` : "Under Est."}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td>
                                                <span className="cr-date-pill">
                                                    <i className="bi bi-calendar3"></i>
                                                    {item.targetDate ? moment.utc(item.targetDate).format("DD MMM YYYY") : "Flexible"}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="d-flex justify-content-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        className="btn-cr-view"
                                                        onClick={() => {
                                                            setSelectedCR(item);
                                                            setShowViewModal(true);
                                                        }}
                                                    >
                                                        <span>View</span>
                                                        <i className="bi bi-arrow-right-short"></i>
                                                    </button>
                                                    {item.status === 'submitted' && (
                                                        <button
                                                            type="button"
                                                            className="btn-cr-delete"
                                                            title="Cancel this request"
                                                            onClick={() => handleDeleteCR(item._id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal: Create Change Request */}
                <Modal
                    show={showCreateModal}
                    onHide={() => setShowCreateModal(false)}
                    centered
                    size="lg"
                    className="cr-modal-custom"
                >
                    <Modal.Header closeButton>
                        <div className="d-flex align-items-center gap-2">
                            <div className="cr-modal-icon">
                                <i className="bi bi-file-earmark-plus-fill"></i>
                            </div>
                            <div>
                                <Modal.Title className="cr-modal-title">Create Change Request</Modal.Title>
                                <span className="cr-modal-subtitle">Submit a scope enhancement or new requirement to the team</span>
                            </div>
                        </div>
                    </Modal.Header>
                    <form onSubmit={handleCreateSubmit}>
                        <Modal.Body className="p-4">
                            {formError && (
                                <div className="alert alert-danger py-2 px-3 mb-3 small d-flex align-items-center gap-2">
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                    <span>{formError}</span>
                                </div>
                            )}

                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label fw-bold small text-dark">
                                        Change Request Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm cr-input"
                                        placeholder="e.g. Export Reports to PDF and Excel"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold small text-dark">
                                        Project <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-select form-select-sm cr-input"
                                        value={newProject}
                                        onChange={(e) => setNewProject(e.target.value)}
                                        required
                                    >
                                        {projects.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-dark">Priority</label>
                                    <select
                                        className="form-select form-select-sm cr-input"
                                        value={newPriority}
                                        onChange={(e) => setNewPriority(e.target.value)}
                                    >
                                        <option value="low">Low - Routine Scope</option>
                                        <option value="medium">Medium - Important</option>
                                        <option value="high">High - Business Priority</option>
                                        <option value="urgent">Urgent - Blocking Workflow</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-dark">Requested Target Date</label>
                                    <input
                                        type="date"
                                        className="form-control form-control-sm cr-input"
                                        value={newTargetDate}
                                        onChange={(e) => setNewTargetDate(e.target.value)}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-bold small text-dark">
                                        Scope Description & Requirements
                                    </label>
                                    <textarea
                                        className="form-control cr-input"
                                        rows={4}
                                        placeholder="Describe the desired changes, user experience, and business justification in detail..."
                                        value={newDescription}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-bold small text-dark">
                                        Client Notes / Commercial Preferences
                                    </label>
                                    <textarea
                                        className="form-control cr-input"
                                        rows={2}
                                        placeholder="Add any specific delivery deadlines, budget notes, or staging deployment preferences..."
                                        value={newClientNotes}
                                        onChange={(e) => setNewClientNotes(e.target.value)}
                                    />
                                </div>

                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label fw-bold small text-dark mb-0">
                                            Attach Supporting Documents or Screenshots
                                        </label>
                                        {selectedFiles.length > 0 && (
                                            <span className="badge bg-light text-primary border px-2 py-1" style={{ fontSize: '11px', fontWeight: 600 }}>
                                                {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} attached
                                            </span>
                                        )}
                                    </div>

                                    {/* Hidden native input */}
                                    <input
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />

                                    {/* Modern Clickable Drag & Drop Zone */}
                                    <div
                                        className={`cr-dropzone ${isDragging ? 'dragging' : ''}`}
                                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            if (e.dataTransfer?.files) {
                                                handleFilesAdd(Array.from(e.dataTransfer.files));
                                            }
                                        }}
                                    >
                                        <div className="cr-dropzone-icon">
                                            <i className="bi bi-cloud-arrow-up"></i>
                                        </div>
                                        <div className="cr-dropzone-title">
                                            <span className="cr-browse-link">Click to browse</span> or drag and drop files here
                                        </div>
                                        <div className="cr-dropzone-subtitle">
                                            Supports multiple files: Images (PNG, JPG), Documents (PDF, DOCX), Wireframes, or Archives (up to 10MB each)
                                        </div>
                                    </div>

                                    {/* Selected Files List / Chips */}
                                    {selectedFiles.length > 0 && (
                                        <div className="cr-selected-files-list mt-2">
                                            {selectedFiles.map((file, idx) => (
                                                <div key={idx} className="cr-file-chip">
                                                    <div className="cr-file-chip-left">
                                                        <i className={`bi ${getFileIcon(file)} cr-chip-icon`}></i>
                                                        <div className="cr-chip-text">
                                                            <span className="cr-chip-name" title={file.name}>
                                                                {file.name}
                                                            </span>
                                                            <span className="cr-chip-size">
                                                                {formatFileSize(file.size)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="cr-chip-remove-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile(idx);
                                                        }}
                                                        title="Remove file"
                                                    >
                                                        <i className="bi bi-x"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="bg-light p-3">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary px-3"
                                onClick={() => setShowCreateModal(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-sm btn-cr-primary px-4"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1"></span>
                                        <span>Submitting CR...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg me-1"></i>
                                        <span>Submit Change Request</span>
                                    </>
                                )}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>

                {/* Modal: View Details & Admin Review */}
                <Modal
                    show={showViewModal}
                    onHide={() => setShowViewModal(false)}
                    centered
                    size="lg"
                    className="cr-modal-custom"
                >
                    <Modal.Header closeButton>
                        <div className="d-flex align-items-center gap-2">
                            <div className="cr-modal-icon">
                                <i className="bi bi-file-earmark-text-fill"></i>
                            </div>
                            <div>
                                <Modal.Title className="cr-modal-title">{selectedCR?.title}</Modal.Title>
                                <span className="cr-modal-subtitle">
                                    Project: {selectedCR?.project?.name} • Submitted {moment(selectedCR?.createdAt).format('DD MMM YYYY')}
                                </span>
                            </div>
                        </div>
                    </Modal.Header>
                    <Modal.Body className="p-4">
                        {selectedCR && (
                            <div className="cr-detail-wrap">
                                {/* Status Banner */}
                                <div className="cr-status-banner">
                                    <div className="banner-left">
                                        <span className="banner-label">Current Status:</span>
                                        {getStatusBadge(selectedCR.status)}
                                        {getPriorityBadge(selectedCR.priority)}
                                    </div>
                                    <div className="banner-right">
                                        <span className="banner-hours">
                                            <strong>Estimated Effort:</strong> {selectedCR.estimatedHours > 0 ? `${selectedCR.estimatedHours} Hours` : "Under Assessment"}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="cr-detail-section">
                                    <h6 className="section-title">
                                        <i className="bi bi-card-text me-1"></i>
                                        Scope Description
                                    </h6>
                                    <p className="section-content">
                                        {selectedCR.description || "No detailed scope description provided."}
                                    </p>
                                </div>

                                {/* Admin Notes / Evaluation */}
                                <div className="cr-detail-section admin-notes-box">
                                    <h6 className="section-title text-indigo">
                                        <i className="bi bi-shield-check me-1"></i>
                                        Engineering & Admin Review Feedback
                                    </h6>
                                    <p className="section-content text-dark mb-0">
                                        {selectedCR.adminNotes || "Engineering team is currently reviewing your change request and will post estimated hours, technical roadmap, and quote here."}
                                    </p>
                                    {selectedCR.reviewedBy && (
                                        <div className="reviewed-by-tag">
                                            Reviewed by: <strong>{selectedCR.reviewedBy?.name}</strong> on {moment(selectedCR.reviewedAt).format('DD MMM YYYY, hh:mm A')}
                                        </div>
                                    )}
                                </div>

                                {/* Client Notes */}
                                {selectedCR.clientNotes && (
                                    <div className="cr-detail-section">
                                        <h6 className="section-title">
                                            <i className="bi bi-chat-left-quote me-1"></i>
                                            Client Notes
                                        </h6>
                                        <p className="section-content">
                                            {selectedCR.clientNotes}
                                        </p>
                                    </div>
                                )}

                                {/* Attachments */}
                                {selectedCR.attachments && selectedCR.attachments.length > 0 && (
                                    <div className="cr-detail-section">
                                        <h6 className="section-title">
                                            <i className="bi bi-paperclip me-1"></i>
                                            Attached Files & Specifications ({selectedCR.attachments.length})
                                        </h6>
                                        <div className="cr-attachments-grid">
                                            {selectedCR.attachments.map((file, fIdx) => (
                                                <a
                                                    key={fIdx}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="cr-attachment-card"
                                                >
                                                    <i className="bi bi-file-earmark-arrow-down-fill attachment-icon"></i>
                                                    <div className="attachment-info">
                                                        <span className="file-name">{file.originalName || file.fileName}</span>
                                                        <span className="file-meta">Click to view/download</span>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="bg-light p-3">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-3"
                            onClick={() => setShowViewModal(false)}
                        >
                            Close
                        </button>
                    </Modal.Footer>
                </Modal>
            </main>
        </div>
    );
};

export default ChangeRequests;
