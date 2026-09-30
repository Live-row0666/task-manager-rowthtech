import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'react-bootstrap';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import { getDashboard } from '../redux/actions';
import { APICore } from '../helpers/api/apiCore';
import './Dashboard.css';
import './Support.css';

const api = new APICore();

const Support = () => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);
    const projectDropdownRef = useRef(null);

    const { dashboard } = useSelector((s) => ({
        dashboard: s.Auth.dashboard
    }));

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [editingTicket, setEditingTicket] = useState(null);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Search and Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activePreset, setActivePreset] = useState('');

    // Dropdown toggles & refs
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);

    const priorityDropdownRef = useRef(null);
    const statusDropdownRef = useRef(null);
    const dateDropdownRef = useRef(null);

    // Priority and Status dropdown options
    const priorityOptions = [
        { value: '', label: 'All Priorities', color: '#64748b' },
        { value: 'urgent', label: 'Urgent', color: '#dc2626' },
        { value: 'high', label: 'High', color: '#ea580c' },
        { value: 'medium', label: 'Medium', color: '#d97706' },
        { value: 'low', label: 'Low', color: '#16a34a' }
    ];

    const statusOptions = [
        { value: '', label: 'All Statuses', color: '#64748b' },
        { value: 'open', label: 'Open', color: '#4f46e5' },
        { value: 'in_progress', label: 'In Progress', color: '#d97706' },
        { value: 'resolved', label: 'Resolved', color: '#059669' },
        { value: 'closed', label: 'Closed', color: '#64748b' }
    ];

    // Create Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general_inquiry');
    const [priority, setPriority] = useState('medium');
    const [description, setDescription] = useState('');
    const [screenshots, setScreenshots] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Edit Form state
    const [editTitle, setEditTitle] = useState('');
    const [editCategory, setEditCategory] = useState('general_inquiry');
    const [editPriority, setEditPriority] = useState('medium');
    const [editDescription, setEditDescription] = useState('');
    const [existingScreenshots, setExistingScreenshots] = useState([]);
    const [newScreenshots, setNewScreenshots] = useState([]);
    const [newPreviewUrls, setNewPreviewUrls] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load client dashboard to populate projects list
    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    // Handle outside click for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
            if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
                setIsPriorityOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
                setIsStatusOpen(false);
            }
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
                setIsDateOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const projects = useMemo(() => dashboard?.projects || [], [dashboard]);

    // Auto-select the first project by default when projects load
    useEffect(() => {
        if (projects.length > 0 && !filterProject) {
            setFilterProject(projects[0]._id);
        }
    }, [projects, filterProject]);

    const currentFilterProjectName = useMemo(() => {
        if (!filterProject) {
            return projects.length > 0 ? projects[0].name : 'Project Workspace';
        }
        const proj = projects.find((p) => p._id === filterProject);
        return proj ? proj.name : (projects[0]?.name || 'Project Workspace');
    }, [projects, filterProject]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const queryParams = filterProject ? { projectId: filterProject } : {};
            const res = await api.get('/api/v1/client/support', queryParams);
            if (res.data?.data) {
                setTickets(res.data.data);
            }
        } catch (err) {
            console.error('Fetch support tickets error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (filterProject) {
            fetchTickets();
        }
    }, [filterProject]);

    // Quick Date Range Presets
    const handlePresetClick = (preset) => {
        setActivePreset(preset);
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];

        if (preset === 'today') {
            const todayStr = formatDate(today);
            setStartDate(todayStr);
            setEndDate(todayStr);
        } else if (preset === '7days') {
            const past = new Date();
            past.setDate(past.getDate() - 7);
            setStartDate(formatDate(past));
            setEndDate(formatDate(today));
        } else if (preset === '30days') {
            const past = new Date();
            past.setDate(past.getDate() - 30);
            setStartDate(formatDate(past));
            setEndDate(formatDate(today));
        } else if (preset === 'thisMonth') {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            setStartDate(formatDate(firstDay));
            setEndDate(formatDate(today));
        } else if (preset === 'all') {
            setStartDate('');
            setEndDate('');
            setActivePreset('');
        }
    };

    // Date range display text
    const dateFilterLabel = useMemo(() => {
        if (startDate && endDate) {
            if (startDate === endDate) {
                return new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            }
            return `${new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
        }
        if (startDate) {
            return `From ${new Date(startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
        }
        if (endDate) {
            return `Until ${new Date(endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
        }
        return 'Date Range';
    }, [startDate, endDate]);

    // Live filter tickets based on search, priority, status, and calendar date range
    const filteredTickets = useMemo(() => {
        return tickets.filter((t) => {
            // Search term
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchesSearch =
                    t.title?.toLowerCase().includes(q) ||
                    t.description?.toLowerCase().includes(q) ||
                    t.project?.name?.toLowerCase().includes(q) ||
                    t.category?.toLowerCase().includes(q);
                if (!matchesSearch) return false;
            }

            // Priority filter
            if (filterPriority && t.priority !== filterPriority) {
                return false;
            }

            // Status filter
            if (filterStatus) {
                if (filterStatus === 'open' && t.status !== 'open') return false;
                if (filterStatus === 'in_progress' && t.status !== 'in_progress') return false;
                if (filterStatus === 'resolved' && t.status !== 'resolved' && t.status !== 'closed') return false;
                if (filterStatus === 'closed' && t.status !== 'closed') return false;
            }

            // Date range filter (from startDate to endDate)
            if (startDate || endDate) {
                if (!t.createdAt) return false;
                const ticketTime = new Date(t.createdAt).getTime();

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (ticketTime < start.getTime()) return false;
                }

                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (ticketTime > end.getTime()) return false;
                }
            }

            return true;
        });
    }, [tickets, searchTerm, filterPriority, filterStatus, startDate, endDate]);

    // Handle create screenshot selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const updatedFiles = [...screenshots, ...files];
        setScreenshots(updatedFiles);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...newPreviews]);
    };

    const handleRemoveScreenshot = (index) => {
        setScreenshots((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    // Handle edit screenshot selection
    const handleEditFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const updatedFiles = [...newScreenshots, ...files];
        setNewScreenshots(updatedFiles);

        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setNewPreviewUrls((prev) => [...prev, ...newPreviews]);
    };

    const handleRemoveNewScreenshot = (index) => {
        setNewScreenshots((prev) => prev.filter((_, i) => i !== index));
        setNewPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingScreenshot = (index) => {
        setExistingScreenshots((prev) => prev.filter((_, i) => i !== index));
    };

    // Open Edit Modal
    const handleOpenEdit = (ticket) => {
        setEditingTicket(ticket);
        setEditTitle(ticket.title || '');
        setEditCategory(ticket.category || 'general_inquiry');
        setEditPriority(ticket.priority || 'medium');
        setEditDescription(ticket.description || '');
        setExistingScreenshots(ticket.screenshots || []);
        setNewScreenshots([]);
        setNewPreviewUrls([]);
        setShowEditModal(true);
    };

    // Open Delete Confirmation Modal
    const handleOpenDelete = (ticket) => {
        setTicketToDelete(ticket);
        setShowDeleteModal(true);
    };

    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(
        (t) => t.status === 'open' || t.status === 'in_progress' || !t.status
    ).length;
    const resolvedTickets = tickets.filter(
        (t) => t.status === 'resolved' || t.status === 'closed'
    ).length;

    const hasActiveFilters = Boolean(searchTerm || filterPriority || filterStatus || startDate || endDate);

    // Create ticket submission
    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const resolvedProjectId = filterProject || (projects.length > 0 ? projects[0]._id : '');

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('projectId', resolvedProjectId);
            formData.append('category', category);
            formData.append('priority', priority);
            formData.append('description', description);

            screenshots.forEach((file) => {
                formData.append('screenshots', file);
            });

            await api.createWithFormData('/api/v1/client/support', formData);

            setShowCreateModal(false);
            setTitle('');
            setDescription('');
            setScreenshots([]);
            setPreviewUrls([]);
            fetchTickets();
        } catch (err) {
            console.error('Create support ticket error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Update ticket submission
    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        if (!editingTicket || !editTitle.trim()) return;

        const resolvedProjectId =
            editingTicket?.project?._id ||
            editingTicket?.project ||
            filterProject ||
            (projects.length > 0 ? projects[0]._id : '');

        try {
            setUpdating(true);
            const formData = new FormData();
            formData.append('title', editTitle);
            formData.append('projectId', resolvedProjectId);
            formData.append('category', editCategory);
            formData.append('priority', editPriority);
            formData.append('description', editDescription);
            formData.append('existingScreenshots', JSON.stringify(existingScreenshots));

            newScreenshots.forEach((file) => {
                formData.append('screenshots', file);
            });

            await api.updateWithFormData(`/api/v1/client/support/${editingTicket._id}`, formData);

            setShowEditModal(false);
            setEditingTicket(null);
            fetchTickets();
        } catch (err) {
            console.error('Update support ticket error:', err);
        } finally {
            setUpdating(false);
        }
    };

    // Delete ticket submission
    const handleDeleteTicket = async () => {
        if (!ticketToDelete) return;

        try {
            setDeleting(true);
            await api.delete(`/api/v1/client/support/${ticketToDelete._id}`);
            setShowDeleteModal(false);
            setTicketToDelete(null);
            fetchTickets();
        } catch (err) {
            console.error('Delete support ticket error:', err);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="support" />

            <main className="dash-main">
                <CommonHeader title="Client Support" />

                {/* Dashboard Hero Bar with Project Switcher and Create Button */}
                <div className="dashboard-hero-bar">
                    <div className="hero-welcome-info">
                        <div className="hero-title-row">
                            <h2 className="hero-title">Support & Help Center</h2>
                            <div className="hero-badge">
                                <span className="pulse-dot"></span>
                                Dedicated 24/7 Support
                            </div>
                        </div>
                        <p className="hero-subtitle">
                            Need technical assistance, have questions, or want to submit changes? Create, track, and manage requests below.
                        </p>
                    </div>

                    <div className="hero-controls">
                        {/* Custom Animated Project Dropdown */}
                        <div className="project-dropdown-wrapper" ref={projectDropdownRef}>
                            <button
                                type="button"
                                className={`project-dropdown-trigger ${isProjectDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                title="Active project workspace"
                            >
                                <div className="project-trigger-left">
                                    <i className="bi bi-briefcase-fill project-trigger-icon"></i>
                                    <span className="project-trigger-name">
                                        {currentFilterProjectName}
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
                                        {projects.map((project) => {
                                            const isSelected = project._id === filterProject;
                                            return (
                                                <div
                                                    key={project._id}
                                                    className={`project-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => {
                                                        setFilterProject(project._id);
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
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Create Support Ticket Action Button */}
                        <button
                            type="button"
                            className="btn-create-ticket-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                            <span>Create Support Ticket</span>
                        </button>
                    </div>
                </div>

                {/* Support KPI Metrics Cards */}
                <div className="support-kpi-grid">
                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-purple-soft">
                            <i className="bi bi-ticket-detailed-fill"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Total Requests</span>
                            <span className="support-kpi-val">{totalTickets}</span>
                            <span className="support-kpi-sub">Your project tickets</span>
                        </div>
                    </div>

                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-amber-soft">
                            <i className="bi bi-hourglass-split"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Active / In Progress</span>
                            <span className="support-kpi-val">{activeTickets}</span>
                            <span className="support-kpi-sub">Currently under engineering</span>
                        </div>
                    </div>

                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-emerald-soft">
                            <i className="bi bi-patch-check-fill"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Resolved Tickets</span>
                            <span className="support-kpi-val">{resolvedTickets}</span>
                            <span className="support-kpi-sub">Completed & verified</span>
                        </div>
                    </div>

                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-sky-soft">
                            <i className="bi bi-headset"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Dedicated Lead</span>
                            <span className="support-kpi-val" style={{ fontSize: '15px' }}>Support Team</span>
                            <span className="support-kpi-sub">Avg response &lt; 2 hrs</span>
                        </div>
                    </div>
                </div>

                {/* Tickets Table Card */}
                <div className="support-tickets-card">
                    <div className="pro-card-header">
                        <div className="card-title-group">
                            <div className="card-title-icon indigo-soft">
                                <i className="bi bi-collection"></i>
                            </div>
                            <div>
                                <h4 className="pro-card-title">Your Support Requests</h4>
                                <span className="pro-card-subtitle">
                                    Project workspace: <strong style={{ color: '#4f46e5' }}>{currentFilterProjectName}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Search, Priority, Status, and Calendar Filter Controls */}
                        <div className="card-header-actions">
                            {/* Live Search Input */}
                            <div className="support-search-wrap">
                                <i className="bi bi-search support-search-icon"></i>
                                <input
                                    type="text"
                                    className="support-search-input"
                                    placeholder="Search tickets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Custom Priority Dropdown */}
                            <div className="custom-popover-dropdown" ref={priorityDropdownRef}>
                                <button
                                    type="button"
                                    className={`custom-dropdown-btn ${isPriorityOpen ? 'active' : ''} ${filterPriority ? 'has-value' : ''}`}
                                    onClick={() => {
                                        setIsPriorityOpen(!isPriorityOpen);
                                        setIsStatusOpen(false);
                                        setIsDateOpen(false);
                                    }}
                                >
                                    <span className="item-left-content">
                                        {filterPriority && (
                                            <span
                                                className="item-dot"
                                                style={{
                                                    background:
                                                        filterPriority === 'urgent' ? '#dc2626' :
                                                        filterPriority === 'high' ? '#ea580c' :
                                                        filterPriority === 'medium' ? '#d97706' : '#16a34a'
                                                }}
                                            />
                                        )}
                                        <span>
                                            {filterPriority
                                                ? filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)
                                                : 'All Priorities'}
                                        </span>
                                    </span>
                                    <i className="bi bi-chevron-down chevron"></i>
                                </button>

                                {isPriorityOpen && (
                                    <div className="custom-dropdown-popover">
                                        {priorityOptions.map((opt) => (
                                            <div
                                                key={opt.value}
                                                className={`custom-popover-item ${filterPriority === opt.value ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setFilterPriority(opt.value);
                                                    setIsPriorityOpen(false);
                                                }}
                                            >
                                                <span className="item-left-content">
                                                    {opt.value && (
                                                        <span className="item-dot" style={{ background: opt.color }} />
                                                    )}
                                                    <span>{opt.label}</span>
                                                </span>
                                                {filterPriority === opt.value && <i className="bi bi-check2 text-primary"></i>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom Status Dropdown */}
                            <div className="custom-popover-dropdown" ref={statusDropdownRef}>
                                <button
                                    type="button"
                                    className={`custom-dropdown-btn ${isStatusOpen ? 'active' : ''} ${filterStatus ? 'has-value' : ''}`}
                                    onClick={() => {
                                        setIsStatusOpen(!isStatusOpen);
                                        setIsPriorityOpen(false);
                                        setIsDateOpen(false);
                                    }}
                                >
                                    <span className="item-left-content">
                                        {filterStatus && (
                                            <span
                                                className="item-dot"
                                                style={{
                                                    background:
                                                        filterStatus === 'open' ? '#4f46e5' :
                                                        filterStatus === 'in_progress' ? '#d97706' :
                                                        filterStatus === 'resolved' ? '#059669' : '#64748b'
                                                }}
                                            />
                                        )}
                                        <span>
                                            {filterStatus
                                                ? filterStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                                                : 'All Statuses'}
                                        </span>
                                    </span>
                                    <i className="bi bi-chevron-down chevron"></i>
                                </button>

                                {isStatusOpen && (
                                    <div className="custom-dropdown-popover">
                                        {statusOptions.map((opt) => (
                                            <div
                                                key={opt.value}
                                                className={`custom-popover-item ${filterStatus === opt.value ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setFilterStatus(opt.value);
                                                    setIsStatusOpen(false);
                                                }}
                                            >
                                                <span className="item-left-content">
                                                    {opt.value && (
                                                        <span className="item-dot" style={{ background: opt.color }} />
                                                    )}
                                                    <span>{opt.label}</span>
                                                </span>
                                                {filterStatus === opt.value && <i className="bi bi-check2 text-primary"></i>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom Calendar Date Range Popover */}
                            <div className="custom-popover-dropdown" ref={dateDropdownRef}>
                                <button
                                    type="button"
                                    className={`custom-dropdown-btn ${isDateOpen ? 'active' : ''} ${(startDate || endDate) ? 'has-value' : ''}`}
                                    onClick={() => {
                                        setIsDateOpen(!isDateOpen);
                                        setIsPriorityOpen(false);
                                        setIsStatusOpen(false);
                                    }}
                                >
                                    <span className="item-left-content">
                                        <i className="bi bi-calendar3" style={{ color: (startDate || endDate) ? '#4f46e5' : '#94a3b8' }}></i>
                                        <span>{dateFilterLabel}</span>
                                    </span>
                                    <i className="bi bi-chevron-down chevron"></i>
                                </button>

                                {isDateOpen && (
                                    <div className="custom-dropdown-popover date-range-popover">
                                        <div className="date-preset-pills">
                                            <button
                                                type="button"
                                                className={`btn-preset-pill ${activePreset === 'today' ? 'active' : ''}`}
                                                onClick={() => handlePresetClick('today')}
                                            >
                                                Today
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-preset-pill ${activePreset === '7days' ? 'active' : ''}`}
                                                onClick={() => handlePresetClick('7days')}
                                            >
                                                Last 7 Days
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-preset-pill ${activePreset === '30days' ? 'active' : ''}`}
                                                onClick={() => handlePresetClick('30days')}
                                            >
                                                Last 30 Days
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-preset-pill ${activePreset === 'thisMonth' ? 'active' : ''}`}
                                                onClick={() => handlePresetClick('thisMonth')}
                                            >
                                                This Month
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-preset-pill ${activePreset === 'all' ? 'active' : ''}`}
                                                onClick={() => handlePresetClick('all')}
                                            >
                                                All Time
                                            </button>
                                        </div>

                                        <div className="date-inputs-row">
                                            <div className="date-input-group">
                                                <label>From Date</label>
                                                <input
                                                    type="date"
                                                    className="date-input-field"
                                                    value={startDate}
                                                    onChange={(e) => {
                                                        setStartDate(e.target.value);
                                                        setActivePreset('');
                                                    }}
                                                />
                                            </div>
                                            <div className="date-input-group">
                                                <label>To Date</label>
                                                <input
                                                    type="date"
                                                    className="date-input-field"
                                                    value={endDate}
                                                    onChange={(e) => {
                                                        setEndDate(e.target.value);
                                                        setActivePreset('');
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="date-popover-footer">
                                            <button
                                                type="button"
                                                className="btn-date-clear"
                                                onClick={() => {
                                                    setStartDate('');
                                                    setEndDate('');
                                                    setActivePreset('');
                                                }}
                                            >
                                                Clear
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-date-apply"
                                                onClick={() => setIsDateOpen(false)}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Clear/Reset Active Filters Button */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    className="btn-clear-filters"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterPriority('');
                                        setFilterStatus('');
                                        setStartDate('');
                                        setEndDate('');
                                        setActivePreset('');
                                    }}
                                    title="Reset all filters"
                                >
                                    <i className="bi bi-x-circle"></i>
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : filteredTickets.length > 0 ? (
                            <table className="support-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th style={{ width: '25%' }}>Subject & Details</th>
                                        <th style={{ width: '14%' }}>Project</th>
                                        <th style={{ width: '11%' }}>Category</th>
                                        <th style={{ width: '9%' }}>Priority</th>
                                        <th style={{ width: '11%' }}>Screenshots</th>
                                        <th style={{ width: '9%' }}>Status</th>
                                        <th style={{ width: '10%' }}>Created At</th>
                                        <th style={{ width: '11%', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTickets.map((t, idx) => {
                                        const isResolved = t.status === 'resolved' || t.status === 'closed';
                                        const isInProgress = t.status === 'in_progress';
                                        const statusCls = isResolved
                                            ? 'status-resolved'
                                            : isInProgress
                                            ? 'status-in_progress'
                                            : 'status-open';

                                        const isUrgent = t.priority === 'urgent' || t.priority === 'high';
                                        const isMedium = t.priority === 'medium';
                                        const prioCls = isUrgent
                                            ? 'priority-high'
                                            : isMedium
                                            ? 'priority-medium'
                                            : 'priority-low';

                                        const hasScreenshots = t.screenshots && t.screenshots.length > 0;

                                        return (
                                            <tr key={t._id || idx} onClick={() => setSelectedTicket(t)}>
                                                <td>
                                                    <span className="cell-index-badge">
                                                        {String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="ticket-title-link">
                                                        {t.title}
                                                    </div>
                                                    {t.description && (
                                                        <div className="ticket-desc-snippet" title={t.description}>
                                                            {t.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="project-tag-pill">
                                                        <i className="bi bi-folder-fill" style={{ fontSize: '10px' }}></i>
                                                        {t.project?.name || currentFilterProjectName}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="category-tag-pill">
                                                        <i className="bi bi-tag-fill text-muted" style={{ fontSize: '9px' }}></i>
                                                        {t.category ? t.category.replace(/_/g, ' ') : 'General'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`priority-badge-pill ${prioCls}`}>
                                                        {t.priority || 'Normal'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {hasScreenshots ? (
                                                        <span
                                                            className="ticket-screenshots-badge"
                                                            title="Click to view screenshots"
                                                        >
                                                            <i className="bi bi-paperclip text-primary"></i>
                                                            {t.screenshots.length} Attachment{t.screenshots.length > 1 ? 's' : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '11px' }}>-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`ticket-status-pill ${statusCls}`}>
                                                        <span className="status-dot-sm"></span>
                                                        {t.status ? t.status.replace(/_/g, ' ') : 'Open'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                                                        {new Date(t.createdAt).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                                    <div className="action-btn-group">
                                                        <button
                                                            type="button"
                                                            className="btn-action-icon btn-edit"
                                                            title="Edit Ticket"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenEdit(t);
                                                            }}
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action-icon btn-delete"
                                                            title="Delete Ticket"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenDelete(t);
                                                            }}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="support-empty-state">
                                <div className="support-empty-icon-wrap">
                                    <i className="bi bi-inbox-fill"></i>
                                </div>
                                <h4 className="support-empty-title">No Support Requests Found</h4>
                                <p className="support-empty-desc">
                                    {hasActiveFilters
                                        ? 'No support requests match the active filter criteria. Click "Reset" to clear filters.'
                                        : `No support requests found for "${currentFilterProjectName}". Click below to create a new ticket.`}
                                </p>
                                <button
                                    type="button"
                                    className="btn-create-ticket-primary"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    <span>Create Support Ticket</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Support Request Modal (Project auto-selected) */}
                <Modal
                    show={showCreateModal}
                    onHide={() => setShowCreateModal(false)}
                    centered
                    size="lg"
                    className="custom-support-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className="bi bi-pencil-square text-primary me-2"></i>
                            New Support Request
                        </Modal.Title>
                    </Modal.Header>

                    <form onSubmit={handleSubmitTicket}>
                        <Modal.Body>
                            {/* Project Badge Indicator */}
                            <div className="mb-3 d-flex align-items-center gap-2">
                                <span className="text-muted" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                                    Active Project:
                                </span>
                                <span className="project-tag-pill">
                                    <i className="bi bi-folder-fill me-1" style={{ fontSize: '10px' }}></i>
                                    {currentFilterProjectName}
                                </span>
                            </div>

                            <div className="mb-3">
                                <label className="modal-form-label">
                                    Subject / Title <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="modal-form-control"
                                    placeholder="Brief summary of your query or issue"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="modal-form-label">Category</label>
                                    <select
                                        className="modal-form-select"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="general_inquiry">General Inquiry</option>
                                        <option value="technical_issue">Technical Issue</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature_request">Feature Request / Scope</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="modal-form-label">Priority Level</label>
                                    <select
                                        className="modal-form-select"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="modal-form-label">Detailed Description</label>
                                <textarea
                                    className="modal-form-control"
                                    rows={4}
                                    placeholder="Provide detailed information, steps to reproduce, or notes so our engineering team can assist promptly..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Screenshot Upload Section */}
                            <div className="mb-2">
                                <label className="modal-form-label">
                                    Screenshots / Attachments (Optional)
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*,.pdf,.doc,.docx"
                                    multiple
                                    onChange={handleFileChange}
                                />
                                <div
                                    className="screenshot-upload-dropzone"
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                >
                                    <div className="upload-icon-circle">
                                        <i className="bi bi-cloud-arrow-up-fill"></i>
                                    </div>
                                    <div className="upload-hint-main">
                                        Click to upload screenshots or error logs
                                    </div>
                                    <div className="upload-hint-sub">
                                        PNG, JPG, JPEG, WEBP or PDF (Max 10MB per file)
                                    </div>
                                </div>

                                {previewUrls.length > 0 && (
                                    <div className="screenshot-preview-grid">
                                        {previewUrls.map((url, i) => (
                                            <div key={i} className="screenshot-thumb-wrap">
                                                <img
                                                    src={url}
                                                    alt={`preview-${i}`}
                                                    className="screenshot-thumb-img"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn-remove-thumb"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveScreenshot(i);
                                                    }}
                                                    title="Remove"
                                                >
                                                    <i className="bi bi-x"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-modal-submit"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-send-fill me-1"></i> Submit Request
                                    </>
                                )}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>

                {/* Edit Support Request Modal */}
                {editingTicket && (
                    <Modal
                        show={showEditModal}
                        onHide={() => setShowEditModal(false)}
                        centered
                        size="lg"
                        className="custom-support-modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <i className="bi bi-pencil-square text-warning me-2"></i>
                                Edit Support Request
                            </Modal.Title>
                        </Modal.Header>

                        <form onSubmit={handleUpdateTicket}>
                            <Modal.Body>
                                {/* Project Badge Indicator */}
                                <div className="mb-3 d-flex align-items-center gap-2">
                                    <span className="text-muted" style={{ fontSize: '11.5px', fontWeight: 600 }}>
                                        Project:
                                    </span>
                                    <span className="project-tag-pill">
                                        <i className="bi bi-folder-fill me-1" style={{ fontSize: '10px' }}></i>
                                        {editingTicket.project?.name || currentFilterProjectName}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <label className="modal-form-label">
                                        Subject / Title <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="modal-form-control"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="modal-form-label">Category</label>
                                        <select
                                            className="modal-form-select"
                                            value={editCategory}
                                            onChange={(e) => setEditCategory(e.target.value)}
                                        >
                                            <option value="general_inquiry">General Inquiry</option>
                                            <option value="technical_issue">Technical Issue</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="feature_request">Feature Request / Scope</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="modal-form-label">Priority Level</label>
                                        <select
                                            className="modal-form-select"
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(e.target.value)}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="modal-form-label">Detailed Description</label>
                                    <textarea
                                        className="modal-form-control"
                                        rows={4}
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                </div>

                                {/* Existing Screenshots */}
                                {existingScreenshots.length > 0 && (
                                    <div className="mb-3">
                                        <label className="modal-form-label">
                                            Current Screenshots ({existingScreenshots.length})
                                        </label>
                                        <div className="screenshot-preview-grid">
                                            {existingScreenshots.map((s, idx) => (
                                                <div key={idx} className="screenshot-thumb-wrap">
                                                    <img
                                                        src={s.url}
                                                        alt={`existing-${idx}`}
                                                        className="screenshot-thumb-img"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-remove-thumb"
                                                        onClick={() => handleRemoveExistingScreenshot(idx)}
                                                        title="Remove Screenshot"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Additional Screenshots */}
                                <div className="mb-2">
                                    <label className="modal-form-label">
                                        Add More Screenshots (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        ref={editFileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*,.pdf,.doc,.docx"
                                        multiple
                                        onChange={handleEditFileChange}
                                    />
                                    <div
                                        className="screenshot-upload-dropzone"
                                        onClick={() => editFileInputRef.current && editFileInputRef.current.click()}
                                    >
                                        <div className="upload-icon-circle">
                                            <i className="bi bi-cloud-arrow-up-fill"></i>
                                        </div>
                                        <div className="upload-hint-main">
                                            Click to attach more screenshots or documents
                                        </div>
                                        <div className="upload-hint-sub">
                                            PNG, JPG, JPEG, WEBP or PDF
                                        </div>
                                    </div>

                                    {newPreviewUrls.length > 0 && (
                                        <div className="screenshot-preview-grid">
                                            {newPreviewUrls.map((url, i) => (
                                                <div key={i} className="screenshot-thumb-wrap">
                                                    <img
                                                        src={url}
                                                        alt={`new-preview-${i}`}
                                                        className="screenshot-thumb-img"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-remove-thumb"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveNewScreenshot(i);
                                                        }}
                                                        title="Remove"
                                                    >
                                                        <i className="bi bi-x"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Modal.Body>

                            <Modal.Footer>
                                <button
                                    type="button"
                                    className="btn-modal-cancel"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-submit"
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle-fill me-1"></i> Save Changes
                                        </>
                                    )}
                                </button>
                            </Modal.Footer>
                        </form>
                    </Modal>
                )}

                {/* Delete Confirmation Modal */}
                {ticketToDelete && (
                    <Modal
                        show={showDeleteModal}
                        onHide={() => setShowDeleteModal(false)}
                        centered
                        className="custom-support-modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className="text-danger">
                                <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                                Confirm Deletion
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p style={{ fontSize: '13px', color: '#334155', marginBottom: '8px' }}>
                                Are you sure you want to delete the support request:
                            </p>
                            <div style={{
                                padding: '10px 12px',
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                borderRadius: '6px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: '#991b1b'
                            }}>
                                {ticketToDelete.title}
                            </div>
                            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '10px', marginBottom: 0 }}>
                                This action is permanent and cannot be undone.
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-modal-delete"
                                onClick={handleDeleteTicket}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-trash-fill me-1"></i> Delete Ticket
                                    </>
                                )}
                            </button>
                        </Modal.Footer>
                    </Modal>
                )}

                {/* View Ticket Details Modal */}
                {selectedTicket && (
                    <Modal
                        show={!!selectedTicket}
                        onHide={() => setSelectedTicket(null)}
                        centered
                        size="lg"
                        className="custom-support-modal"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                {selectedTicket.title}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="ticket-detail-header-meta">
                                <span className="project-tag-pill">
                                    <i className="bi bi-folder-fill me-1"></i>
                                    {selectedTicket.project?.name || currentFilterProjectName}
                                </span>
                                <span className="category-tag-pill">
                                    {selectedTicket.category?.replace(/_/g, ' ')}
                                </span>
                                <span className="priority-badge-pill priority-high">
                                    Priority: {selectedTicket.priority}
                                </span>
                                <span className="ticket-status-pill status-open">
                                    Status: {selectedTicket.status}
                                </span>
                            </div>

                            <label className="modal-form-label">Description / Request Details</label>
                            <div className="ticket-detail-desc">
                                {selectedTicket.description || 'No description provided.'}
                            </div>

                            {selectedTicket.screenshots && selectedTicket.screenshots.length > 0 && (
                                <div className="mt-3">
                                    <label className="modal-form-label">
                                        Uploaded Screenshots ({selectedTicket.screenshots.length})
                                    </label>
                                    <div className="ticket-detail-screenshots">
                                        {selectedTicket.screenshots.map((s, idx) => (
                                            <a
                                                key={idx}
                                                href={s.url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => {
                                                    if (s.url) {
                                                        e.preventDefault();
                                                        setPreviewImage(s.url);
                                                    }
                                                }}
                                            >
                                                <img
                                                    src={s.url}
                                                    alt={s.originalName || `screenshot-${idx}`}
                                                    className="ticket-detail-img-thumb"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setSelectedTicket(null)}
                            >
                                Close
                            </button>
                        </Modal.Footer>
                    </Modal>
                )}

                {/* Lightbox / Full Size Image Preview Modal */}
                {previewImage && (
                    <Modal
                        show={!!previewImage}
                        onHide={() => setPreviewImage(null)}
                        centered
                        size="xl"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Screenshot Preview</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center p-2" style={{ background: '#0f172a' }}>
                            <img
                                src={previewImage}
                                alt="Full preview"
                                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '6px' }}
                            />
                        </Modal.Body>
                    </Modal>
                )}
            </main>
        </div>
    );
};

export default Support;
