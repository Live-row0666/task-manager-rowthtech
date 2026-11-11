import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from '../config';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import { getDashboard } from '../redux/actions';
import { APICore } from '../helpers/api/apiCore';
import './Dashboard.css';
import './Dependencies.css';

const api = new APICore();

const Dependencies = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const { dashboard, user } = useSelector((s) => ({
        dashboard: s.Auth?.dashboard,
        user: s.Auth?.user
    }));

    const [dependencies, setDependencies] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        submitted: 0,
        in_review: 0,
        completed: 0,
        urgent: 0
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Fulfill Modal State
    const [showModal, setShowModal] = useState(false);
    const [activeDep, setActiveDep] = useState(null);
    const [isViewOnly, setIsViewOnly] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fieldValues, setFieldValues] = useState({});
    const [fieldFiles, setFieldFiles] = useState({});
    const [clientNotes, setClientNotes] = useState('');
    const [revealedSecrets, setRevealedSecrets] = useState({});
    const [toastMessage, setToastMessage] = useState(null);

    const fileInputRefs = useRef({});
    const socketRef = useRef(null);

    // Toast Notification
    const showToast = (msg, type = 'success') => {
        setToastMessage({ msg, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Load Dashboard for projects if not loaded
    useEffect(() => {
        if (!dashboard) {
            dispatch(getDashboard());
        }
    }, [dispatch, dashboard]);

    // Client Projects list
    const projectsList = useMemo(() => {
        return dashboard?.projects || dashboard?.allProjects || [];
    }, [dashboard]);

    // Fetch Stats
    const fetchStats = async () => {
        try {
            const res = await api.get('/api/v1/client/dependency/stats');
            if (res && res.data) {
                const statsData = res.data.data || res.data;
                setStats(statsData);
            }
        } catch (err) {
            console.error('Error fetching client dependency stats:', err);
        }
    };

    // Fetch Dependencies
    const fetchDependencies = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedProjectFilter && selectedProjectFilter !== 'all') {
                params.projectId = selectedProjectFilter;
            }
            if (selectedStatusFilter && selectedStatusFilter !== 'all') {
                params.status = selectedStatusFilter;
            }
            if (selectedPriorityFilter !== 'all') {
                params.priority = selectedPriorityFilter;
            }
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            const res = await api.get('/api/v1/client/dependency', params);
            if (res && res.data) {
                const list = Array.isArray(res.data.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];
                setDependencies(list);
            } else {
                setDependencies([]);
            }
        } catch (err) {
            console.error('Error fetching client dependencies:', err);
            setDependencies([]);
        } finally {
            setLoading(false);
        }
    }, [selectedProjectFilter, selectedStatusFilter, selectedPriorityFilter, searchTerm]);

    useEffect(() => {
        fetchDependencies();
        fetchStats();
    }, [fetchDependencies]);

    // Socket.IO real-time client listener
    useEffect(() => {
        const socketServerUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const socket = io(socketServerUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });
        socketRef.current = socket;

        const joinClientRoom = () => {
            if (user?._id) {
                socket.emit('join_client', user._id);
            }
        };

        joinClientRoom();
        socket.on('connect', joinClientRoom);

        socket.on('dependency_created', (data) => {
            showToast(`New requirement requested: "${data.title || 'Dependency'}"`, 'info');
            fetchDependencies();
            fetchStats();
        });

        socket.on('dependency_status_changed', (data) => {
            showToast(`Requirement "${data.title || 'Dependency'}" status: ${data.status?.replace('_', ' ')}`, 'info');
            fetchDependencies();
            fetchStats();
        });

        socket.on('dependency_updated', () => {
            fetchDependencies();
            fetchStats();
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [user?._id, fetchDependencies]);

    // Open Fulfill / View Modal
    const handleOpenFulfillModal = useCallback(async (dependency, viewOnly = false) => {
        try {
            const res = await api.get(`/api/v1/client/dependency/${dependency._id}`);
            const dep = res?.data?.data || res?.data;
            if (!dep?._id) throw new Error('Dependency not found');
            setActiveDep(dep);
            setIsViewOnly(viewOnly || ['submitted', 'in_review', 'approved', 'completed'].includes(dep.status));

            // Populate existing values
            const initialVals = {};
            const initialFiles = {};
            if (dep.dynamicFields) {
                dep.dynamicFields.forEach((field) => {
                    initialVals[field.id] = field.value || '';
                    if (field.fileValue) {
                        initialFiles[field.id] = field.fileValue;
                    }
                });
            }
            setFieldValues(initialVals);
            setFieldFiles(initialFiles);
            setClientNotes(dep.clientNotes || '');
            setRevealedSecrets({});
            setShowModal(true);

        } catch (err) {
            console.error('Error opening dependency modal:', err);
            setToastMessage({ msg: 'Unable to open this dependency. Please try again.', type: 'error' });
        }
    }, []);

    // Alert links open the selected requirement even when table filters hide it.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const dependencyId = params.get('dependency');
        if (!dependencyId) return;
        params.delete('dependency');
        navigate({ pathname: location.pathname, search: params.toString(), hash: location.hash }, { replace: true });
        handleOpenFulfillModal({ _id: dependencyId });
    }, [location.search, location.pathname, location.hash, navigate, handleOpenFulfillModal]);

    // Handle field text change
    const handleFieldChange = (fieldId, val) => {
        setFieldValues((prev) => ({
            ...prev,
            [fieldId]: val
        }));
    };

    // Handle file selection
    const handleFileSelect = (fieldId, file) => {
        if (!file) return;
        setFieldFiles((prev) => ({
            ...prev,
            [fieldId]: file
        }));
    };

    // Remove selected file
    const handleRemoveFile = (fieldId) => {
        setFieldFiles((prev) => {
            const copy = { ...prev };
            delete copy[fieldId];
            return copy;
        });
    };

    // Toggle reveal password / token
    const toggleSecretReveal = (fieldId) => {
        setRevealedSecrets((prev) => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    // Submit Fulfillment to Backend
    const handleSubmitFulfillment = async (e) => {
        e.preventDefault();
        if (!activeDep?._id) return;

        // Allow partial fulfillment: client can fill 1 or more fields without requiring all fields at once
        const hasAnyField = activeDep.dynamicFields?.some((field) => {
            if (field.fieldType === 'file') {
                return fieldFiles[field.id] || field.fileValue?.url;
            }
            const val = fieldValues[field.id];
            return val !== undefined && String(val).trim().length > 0;
        });

        if (!hasAnyField && !clientNotes.trim()) {
            showToast('Please fill in at least one requirement field or add a note before submitting.', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('fields', JSON.stringify(fieldValues));
            formData.append('clientNotes', clientNotes.trim());

            // Append files with field ID as key
            Object.keys(fieldFiles).forEach((fieldId) => {
                const f = fieldFiles[fieldId];
                if (f instanceof File) {
                    formData.append(fieldId, f);
                }
            });

            const res = await api.updateWithFormData(
                `/api/v1/client/dependency/${activeDep._id}/submit`,
                formData
            );

            if (res && res.status) {
                showToast('Fulfillment submitted to PM successfully!');
                setShowModal(false);
                fetchDependencies();
                fetchStats();
            } else {
                showToast(res?.message || 'Failed to submit dependency fulfillment', 'error');
            }
        } catch (err) {
            console.error('Error submitting dependency fulfillment:', err);
            showToast(err?.message || 'Server error submitting fulfillment', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Turnaround Days / Due status helper
    const getDueMeta = (dueDate) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                text: `Overdue by ${Math.abs(diffDays)}d`,
                className: 'overdue'
            };
        } else if (diffDays === 0) {
            return {
                text: 'Due Today',
                className: 'urgent'
            };
        } else {
            return {
                text: `${diffDays} days left`,
                className: 'normal'
            };
        }
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="dependencies" />

            <main className="dash-main">
                <CommonHeader title="Project Dependencies" />

                {/* Toast Banner */}
                {toastMessage && (
                    <div className={`client-dep-toast ${toastMessage.type}`}>
                        <i className={toastMessage.type === 'error' ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill'}></i>
                        <span>{toastMessage.msg}</span>
                    </div>
                )}

                {/* Hero Header Bar */}
                <div className="dep-hero-bar">
                    <div className="dep-hero-left">
                        <div className="dep-hero-badge">
                            <span className="pulse-dot"></span>
                            Client Requirements Vault
                        </div>
                        <h2 className="dep-hero-title">Project Dependencies & Credentials</h2>
                        <p className="dep-hero-subtitle">
                            Provide API keys, tokens, login credentials, and documents requested by your project management team
                        </p>
                    </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="dep-kpi-grid">
                    <div
                        className={`dep-kpi-card ${selectedStatusFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'pending' ? 'all' : 'pending')}
                    >
                        <div className="dep-kpi-icon pending">
                            <i className="bi bi-hourglass-split"></i>
                        </div>
                        <div className="dep-kpi-details">
                            <span className="dep-kpi-val">{stats.pending || 0}</span>
                            <span className="dep-kpi-label">Pending My Action</span>
                        </div>
                    </div>

                    <div
                        className={`dep-kpi-card ${selectedStatusFilter === 'submitted' ? 'active' : ''}`}
                        onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'submitted' ? 'all' : 'submitted')}
                    >
                        <div className="dep-kpi-icon review">
                            <i className="bi bi-send-check"></i>
                        </div>
                        <div className="dep-kpi-details">
                            <span className="dep-kpi-val">{(stats.submitted || 0) + (stats.in_review || 0)}</span>
                            <span className="dep-kpi-label">Under PM Review</span>
                        </div>
                    </div>

                    <div
                        className={`dep-kpi-card ${selectedStatusFilter === 'completed' ? 'active' : ''}`}
                        onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'completed' ? 'all' : 'completed')}
                    >
                        <div className="dep-kpi-icon completed">
                            <i className="bi bi-check2-circle"></i>
                        </div>
                        <div className="dep-kpi-details">
                            <span className="dep-kpi-val">{stats.completed || 0}</span>
                            <span className="dep-kpi-label">Completed & Verified</span>
                        </div>
                    </div>

                    <div
                        className="dep-kpi-card"
                        onClick={() => setSelectedStatusFilter('all')}
                    >
                        <div className="dep-kpi-icon urgent">
                            <i className="bi bi-lightning-charge"></i>
                        </div>
                        <div className="dep-kpi-details">
                            <span className="dep-kpi-val">{stats.urgent || 0}</span>
                            <span className="dep-kpi-label">Urgent Priority</span>
                        </div>
                    </div>
                </div>

                {/* Main Card with Header & Table */}
                <div className="dep-main-card">
                    <div className="dep-card-header">
                        <h5 className="dep-header-title">
                            <i className="bi bi-stack text-primary"></i>
                            Required Credentials & Assets
                            <span className="dep-count-chip">{dependencies.length}</span>
                        </h5>

                        <div className="dep-header-actions">
                            <div className="dep-search-wrap">
                                <i className="bi bi-search dep-search-icon"></i>
                                <input
                                    type="text"
                                    className="dep-search-input"
                                    placeholder="Search requirements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <select
                                className="dep-filter-select"
                                value={selectedProjectFilter}
                                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                            >
                                <option value="all">All Projects</option>
                                {projectsList.map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.name || p.projectName}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="dep-filter-select"
                                value={selectedStatusFilter}
                                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Needs Action</option>
                                <option value="submitted">Submitted</option>
                                <option value="in_review">In Review</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Revision Requested</option>
                            </select>

                            <select
                                className="dep-filter-select"
                                aria-label="Filter by priority"
                                value={selectedPriorityFilter}
                                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                            >
                                <option value="all">All Priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>

                            {(searchTerm || selectedProjectFilter !== 'all' || selectedStatusFilter !== 'all' || selectedPriorityFilter !== 'all') && (
                                <button
                                    type="button"
                                    className="btn-dep-reset"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedProjectFilter('all');
                                        setSelectedStatusFilter('all');
                                        setSelectedPriorityFilter('all');
                                    }}
                                >
                                    <i className="bi bi-x-circle"></i> Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Content or Compact Empty State */}
                    {loading ? (
                        <div className="dep-client-empty">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2 mb-0">Loading project requirements...</p>
                        </div>
                    ) : (!Array.isArray(dependencies) || dependencies.length === 0) ? (
                        <div className="dep-client-empty">
                            <div className="dep-empty-icon-circle">
                                <i className="bi bi-clipboard2-check"></i>
                            </div>
                            <h5>No Pending Requirements</h5>
                            <p>You have fulfilled all dependency requests or none have been assigned to your projects at this time.</p>
                        </div>
                    ) : (
                        <div className="dep-table-wrap">
                            <table className="dep-client-table">
                                <thead>
                                    <tr>
                                        <th>Requirement & Context</th>
                                        <th>Project</th>
                                        <th>Priority</th>
                                        <th>Timeline</th>
                                        <th>Required Fields</th>
                                        <th>Status</th>
                                        <th className="text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(dependencies) ? dependencies : []).map((dep) => {
                                        const dueMeta = getDueMeta(dep.dueDate);
                                        const filledCount = dep.dynamicFields?.filter((f) => f.isFilled || f.value || f.fileValue?.url)?.length || 0;
                                        const totalCount = dep.dynamicFields?.length || 0;
                                        const needsAction = dep.status === 'pending' || dep.status === 'rejected';

                                        return (
                                            <tr key={dep._id} className={dep.priority === 'urgent' ? 'row-urgent' : ''}>
                                                <td>
                                                    <div className="cell-dep-title">
                                                        <span className="client-dep-code">REQ-{dep._id.substr(-5).toUpperCase()}</span>
                                                        <span className="client-dep-title-text">{dep.title}</span>
                                                        {dep.description && (
                                                            <span className="client-dep-desc-text">{dep.description}</span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="client-project-pill">
                                                        <i className="bi bi-folder2"></i>
                                                        {dep.project?.name || dep.project?.projectName || 'Project'}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className={`client-badge-priority ${dep.priority}`}>
                                                        {dep.priority}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div>
                                                        <div className="text-muted small">
                                                            <i className="bi bi-hourglass me-1"></i>
                                                            {dep.expectedDays}d turnaround
                                                        </div>
                                                        {dueMeta && (
                                                            <span className={`client-due-pill ${dueMeta.className} mt-1`}>
                                                                <i className="bi bi-calendar-event"></i>
                                                                {dueMeta.text}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div>
                                                        <div className="small fw-semibold mb-1 text-muted">
                                                            {filledCount} of {totalCount} provided
                                                        </div>
                                                        <div className="client-fields-tags">
                                                            {dep.dynamicFields?.map((f, i) => {
                                                                const isFilled = f.isFilled || f.value || f.fileValue?.url;
                                                                return (
                                                                    <span
                                                                        key={i}
                                                                        className={`client-field-chip ${isFilled ? 'is-filled' : ''}`}
                                                                        title={f.label}
                                                                    >
                                                                        {f.fieldType === 'password' && <i className="bi bi-key"></i>}
                                                                        {f.fieldType === 'file' && <i className="bi bi-paperclip"></i>}
                                                                        {f.fieldType === 'url' && <i className="bi bi-link-45deg"></i>}
                                                                        {f.fieldType === 'text' && <i className="bi bi-fonts"></i>}
                                                                        {f.fieldType === 'textarea' && <i className="bi bi-text-paragraph"></i>}
                                                                        {f.label}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className={`client-badge-status ${dep.status}`}>
                                                        {dep.status === 'pending' && <><i className="bi bi-clock"></i> Action Needed</>}
                                                        {dep.status === 'submitted' && <><i className="bi bi-check2"></i> Submitted</>}
                                                        {dep.status === 'in_review' && <><i className="bi bi-eye"></i> In Review</>}
                                                        {dep.status === 'completed' && <><i className="bi bi-check-circle-fill"></i> Completed</>}
                                                        {dep.status === 'rejected' && <><i className="bi bi-arrow-repeat"></i> Revision Needed</>}
                                                    </span>
                                                </td>

                                                <td className="text-end">
                                                    {needsAction ? (
                                                        <button
                                                            className="btn-client-fulfill"
                                                            onClick={() => handleOpenFulfillModal(dep, false)}
                                                        >
                                                            <i className="bi bi-pencil-square"></i>
                                                            {dep.status === 'rejected' ? 'Re-Submit' : 'Fulfill'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn-client-view"
                                                            onClick={() => handleOpenFulfillModal(dep, true)}
                                                        >
                                                            <i className="bi bi-eye"></i> View
                                                        </button>
                                                    )}
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

            {/* FULFILL / VIEW MODAL */}
            {activeDep && (
                <Modal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    centered
                    dialogClassName="fulfill-modal"
                >
                    <form onSubmit={handleSubmitFulfillment}>
                        <div className="fulfill-modal-header">
                            <div className="fulfill-header-wrapper">
                                <div className="fulfill-header-left">
                                    <div className="fulfill-header-icon">
                                        <i className="bi bi-file-earmark-text"></i>
                                    </div>
                                    <div className="fulfill-header-info">
                                        <div className="fulfill-header-code-row">
                                            <span className="dep-ref-code">REQ-{activeDep._id.substr(-5).toUpperCase()}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <h4 className="fulfill-modal-title mb-0">{activeDep.title}</h4>
                                            <span className={`client-badge-priority ${activeDep.priority}`}>
                                                <span className="priority-dot-mini"></span>
                                                {activeDep.priority?.toUpperCase()}
                                            </span>
                                            <span className={`client-badge-status ${activeDep.status}`}>
                                                {activeDep.status === 'pending' && <><i className="bi bi-clock me-1"></i>Action Needed</>}
                                                {activeDep.status === 'submitted' && <><i className="bi bi-send-check me-1"></i>Submitted</>}
                                                {activeDep.status === 'in_review' && <><i className="bi bi-eye me-1"></i>Under Review</>}
                                                {activeDep.status === 'completed' && <><i className="bi bi-check-circle me-1"></i>Completed</>}
                                                {activeDep.status === 'rejected' && <><i className="bi bi-exclamation-circle me-1"></i>Revision Requested</>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Modal.Body className="fulfill-modal-body">
                            {/* Meta Timeline Banner */}
                            <div className="fulfill-meta-banner">
                                <div className="fulfill-meta-item">
                                    <div className="meta-icon-box">
                                        <i className="bi bi-calendar-event"></i>
                                    </div>
                                    <div className="meta-content">
                                        <div className="meta-label">Turnaround Timeline</div>
                                        <div className="meta-val">
                                            <strong>{activeDep.expectedDays} {activeDep.expectedDays === 1 ? 'Day' : 'Days'}</strong> required
                                            {activeDep.dueDate && (
                                                <span className="meta-due-date"> (Target: {new Date(activeDep.dueDate).toLocaleDateString()})</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="fulfill-meta-item">
                                    <div className="meta-icon-box security">
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                    <div className="meta-content">
                                        <div className="meta-label">Data Privacy</div>
                                        <div className="meta-val text-success">Encrypted & Restricted Access</div>
                                    </div>
                                </div>
                            </div>

                            {/* Requirement instructions */}
                            {activeDep.description && (
                                <div className="modal-instructions-box">
                                    <div className="instructions-header">
                                        <i className="bi bi-chat-left-quote-fill me-1"></i> PM Instructions
                                    </div>
                                    <div className="instructions-text">{activeDep.description}</div>
                                </div>
                            )}

                            {/* Admin revision notes if rejected */}
                            {activeDep.status === 'rejected' && activeDep.adminNotes && (
                                <div className="modal-revision-box">
                                    <div className="revision-header">
                                        <i className="bi bi-exclamation-triangle-fill me-1"></i> Revision Requested by PM
                                    </div>
                                    <div className="revision-text">{activeDep.adminNotes}</div>
                                </div>
                            )}

                            {/* Dynamic Input Fields */}
                            <div className="dynamic-form-fields">
                                <div className="fields-section-title">
                                    <i className="bi bi-input-cursor-text me-1"></i>
                                    Required Details ({activeDep.dynamicFields?.length || 0})
                                </div>
                                {activeDep.dynamicFields?.map((field, idx) => {
                                    const isSecret = field.fieldType === 'password';
                                    const isRevealed = revealedSecrets[field.id];
                                    const currentVal = fieldValues[field.id] || '';
                                    const currentFile = fieldFiles[field.id];

                                    return (
                                        <div key={field.id || idx} className="form-field-card">
                                            <div className="form-field-header">
                                                <label className="form-field-label">
                                                    {field.label}
                                                    {field.isRequired && <span className="req">*</span>}
                                                </label>
                                                <span className={`field-type-pill ${field.fieldType}`}>
                                                    {field.fieldType === 'password' && <><i className="bi bi-key-fill me-1"></i>Secret Token</>}
                                                    {field.fieldType === 'file' && <><i className="bi bi-paperclip me-1"></i>File / Document</>}
                                                    {field.fieldType === 'url' && <><i className="bi bi-link-45deg me-1"></i>URL / Link</>}
                                                    {field.fieldType === 'textarea' && <><i className="bi bi-textarea-t me-1"></i>Long Text</>}
                                                    {field.fieldType === 'text' && <><i className="bi bi-fonts me-1"></i>Text</>}
                                                </span>
                                            </div>

                                            {/* Render Input based on type */}
                                            {field.fieldType === 'password' ? (
                                                <div className="password-input-wrap">
                                                    <input
                                                        type={isRevealed ? 'text' : 'password'}
                                                        className="dep-text-input"
                                                        placeholder={field.placeholder || 'Enter secret key / token / password'}
                                                        value={currentVal}
                                                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                        disabled={isViewOnly}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-toggle-pass"
                                                        onClick={() => toggleSecretReveal(field.id)}
                                                        title={isRevealed ? 'Hide secret' : 'Show secret'}
                                                    >
                                                        <i className={isRevealed ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                                                    </button>
                                                </div>
                                            ) : field.fieldType === 'textarea' ? (
                                                <textarea
                                                    className="dep-textarea"
                                                    rows="3"
                                                    placeholder={field.placeholder || 'Enter details / config...'}
                                                    value={currentVal}
                                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                    disabled={isViewOnly}
                                                />
                                            ) : field.fieldType === 'url' ? (
                                                <input
                                                    type="url"
                                                    className="dep-text-input"
                                                    placeholder={field.placeholder || 'https://...'}
                                                    value={currentVal}
                                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                    disabled={isViewOnly}
                                                />
                                            ) : field.fieldType === 'file' ? (
                                                <div>
                                                    <input
                                                        type="file"
                                                        style={{ display: 'none' }}
                                                        ref={(el) => (fileInputRefs.current[field.id] = el)}
                                                        onChange={(e) => handleFileSelect(field.id, e.target.files?.[0])}
                                                        disabled={isViewOnly}
                                                    />

                                                    {currentFile ? (
                                                        <div className="selected-file-pill">
                                                            <span>
                                                                <i className="bi bi-file-earmark-check"></i>
                                                                {currentFile.name || currentFile.originalName || 'Selected File'}
                                                            </span>
                                                            {!isViewOnly && (
                                                                <button
                                                                    type="button"
                                                                    className="btn-remove-selected-file"
                                                                    onClick={() => handleRemoveFile(field.id)}
                                                                >
                                                                    <i className="bi bi-x-circle"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : field.fileValue?.url ? (
                                                        <div className="selected-file-pill">
                                                            <span>
                                                                <i className="bi bi-file-earmark-check"></i>
                                                                {field.fileValue.name || 'Uploaded Document'}
                                                            </span>
                                                            <a
                                                                href={field.fileValue.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-sm btn-outline-primary ms-2"
                                                            >
                                                                <i className="bi bi-download"></i> View
                                                            </a>
                                                        </div>
                                                    ) : !isViewOnly ? (
                                                        <div
                                                            className="field-file-dropzone"
                                                            onClick={() => fileInputRefs.current[field.id]?.click()}
                                                        >
                                                            <div className="file-dropzone-icon">
                                                                <i className="bi bi-cloud-arrow-up"></i>
                                                            </div>
                                                            <p className="file-dropzone-text">Click to browse or upload file</p>
                                                            <span className="file-dropzone-sub">PDF, PNG, JPG, ZIP, or Docs</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-muted">No file uploaded.</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="dep-text-input"
                                                    placeholder={field.placeholder || 'Enter value...'}
                                                    value={currentVal}
                                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                                    disabled={isViewOnly}
                                                />
                                            )}

                                            {field.helpText && (
                                                <div className="field-help-text">
                                                    <i className="bi bi-info-circle"></i>
                                                    {field.helpText}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Client Notes / Comments */}
                            <div className="client-note-card">
                                <label className="client-note-label">
                                    <i className="bi bi-pencil-square me-1"></i>
                                    Client Notes for PM <span className="optional-tag">(Optional)</span>
                                </label>
                                <textarea
                                    className="dep-textarea"
                                    rows="2"
                                    placeholder="Add any context, expiration dates, or notes for the PM team..."
                                    value={clientNotes}
                                    onChange={(e) => setClientNotes(e.target.value)}
                                    disabled={isViewOnly}
                                />
                            </div>
                        </Modal.Body>

                        <Modal.Footer className="fulfill-modal-footer">
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setShowModal(false)}
                            >
                                {isViewOnly ? 'Close' : 'Cancel'}
                            </button>

                            {!isViewOnly && (
                                <button
                                    type="submit"
                                    className="btn-modal-submit"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-send-fill me-1"></i>
                                            Submit Requirement
                                        </>
                                    )}
                                </button>
                            )}
                        </Modal.Footer>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Dependencies;
