import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Table, Modal, Button, Form, Badge, Row, Col } from 'react-bootstrap';
import moment from 'moment';
import { APICore } from '../../../helpers/api/apiCore';
import ToastHandle from '../../../constants/toaster/toaster';
import Pagination from '@mui/material/Pagination';
import './ClientCR.css';

const api = new APICore();

const ClientCR = () => {
    const [crs, setCrs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Filters
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Review Modal State
    const [activeCR, setActiveCR] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState('submitted');
    const [estimatedHours, setEstimatedHours] = useState(0);
    const [cost, setCost] = useState(0);
    const [adminNotes, setAdminNotes] = useState('');
    const [priorityToUpdate, setPriorityToUpdate] = useState('medium');
    const [targetDateToUpdate, setTargetDateToUpdate] = useState('');

    // Fetch CRs
    const fetchCRs = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 15
            };
            if (selectedProject !== 'all') params.projectId = selectedProject;
            if (selectedStatus !== 'all') params.status = selectedStatus;
            if (selectedPriority !== 'all') params.priority = selectedPriority;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const res = await api.get('/api/v1/admin/client-cr', params);
            if (res?.data?.status === 200) {
                setCrs(res.data.data || []);
                setTotalPages(res.data.totalPages || 1);
                setTotalCount(res.data.totalCRs || 0);
            }
        } catch (err) {
            console.error('Error fetching admin CRs:', err);
            ToastHandle('error', err?.response?.data?.message || 'Failed to load Change Requests');
        } finally {
            setLoading(false);
        }
    }, [page, selectedProject, selectedStatus, selectedPriority, searchTerm]);

    useEffect(() => {
        fetchCRs();
    }, [fetchCRs]);

    // Unique projects list for filter dropdown
    const projectOptions = useMemo(() => {
        const map = new Map();
        crs.forEach((c) => {
            if (c.project?._id) {
                map.set(c.project._id, c.project.name);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [crs]);

    // Open Review Modal
    const handleOpenReview = (item) => {
        setActiveCR(item);
        setStatusToUpdate(item.status || 'submitted');
        setEstimatedHours(item.estimatedHours || 0);
        setCost(item.cost || 0);
        setAdminNotes(item.adminNotes || '');
        setPriorityToUpdate(item.priority || 'medium');
        setTargetDateToUpdate(item.targetDate ? moment.utc(item.targetDate).format('YYYY-MM-DD') : '');
        setShowModal(true);
    };

    // Save Review
    const handleSaveReview = async (e) => {
        e.preventDefault();
        if (!activeCR) return;

        setSaving(true);
        try {
            const payload = {
                status: statusToUpdate,
                estimatedHours: Number(estimatedHours) || 0,
                cost: Number(cost) || 0,
                adminNotes: adminNotes.trim(),
                priority: priorityToUpdate,
                targetDate: targetDateToUpdate || undefined
            };

            const res = await api.update(`/api/v1/admin/client-cr/${activeCR._id}`, payload);
            if (res?.data?.status === 200) {
                ToastHandle('success', 'Change Request reviewed and updated successfully.');
                setShowModal(false);
                fetchCRs();
            } else {
                ToastHandle('error', res?.data?.message || 'Failed to update Change Request');
            }
        } catch (err) {
            console.error('Update CR error:', err);
            ToastHandle('error', err?.response?.data?.message || 'Error updating Change Request');
        } finally {
            setSaving(false);
        }
    };

    // Delete CR
    const handleDeleteCR = async (id) => {
        if (!window.confirm('Are you sure you want to delete this Change Request permanently?')) return;
        try {
            const res = await api.delete(`/api/v1/admin/client-cr/${id}`);
            if (res?.data?.status === 200) {
                ToastHandle('success', 'Change Request deleted.');
                fetchCRs();
                if (activeCR?._id === id) setShowModal(false);
            }
        } catch (err) {
            ToastHandle('error', err?.response?.data?.message || 'Failed to delete');
        }
    };

    // Status Badge
    const renderStatusBadge = (status) => {
        const s = (status || 'submitted').toLowerCase();
        switch (s) {
            case 'approved':
                return <Badge bg="success" className="cr-header-badge">Approved</Badge>;
            case 'in_progress':
                return <Badge bg="primary" className="cr-header-badge">In Progress</Badge>;
            case 'completed':
                return <Badge bg="dark" className="cr-header-badge">Completed</Badge>;
            case 'rejected':
                return <Badge bg="danger" className="cr-header-badge">Rejected</Badge>;
            case 'in_review':
                return <Badge bg="warning" text="dark" className="cr-header-badge">In Review</Badge>;
            default:
                return <Badge bg="info" className="cr-header-badge">Submitted</Badge>;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIconClass = (file) => {
        const name = file.originalName || file.fileName || '';
        const ext = name.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return 'uil-image text-primary';
        if (['pdf'].includes(ext)) return 'uil-file-alt text-danger';
        if (['doc', 'docx'].includes(ext)) return 'uil-file-info-alt text-info';
        if (['zip', 'rar', '7z', 'tar'].includes(ext)) return 'uil-archive text-warning';
        return 'uil-file text-secondary';
    };

    // Priority Badge
    const renderPriorityBadge = (priority) => {
        const p = (priority || 'medium').toLowerCase();
        switch (p) {
            case 'urgent':
                return <Badge bg="danger" className="cr-header-badge">Urgent</Badge>;
            case 'high':
                return <Badge bg="warning" text="dark" className="cr-header-badge">High</Badge>;
            case 'low':
                return <Badge bg="secondary" className="cr-header-badge">Low</Badge>;
            default:
                return <Badge bg="info" className="cr-header-badge">Medium</Badge>;
        }
    };

    // KPI Counts
    const counts = useMemo(() => {
        const pending = crs.filter(c => c.status === 'submitted' || c.status === 'in_review').length;
        const active = crs.filter(c => c.status === 'approved' || c.status === 'in_progress').length;
        const done = crs.filter(c => c.status === 'completed').length;
        return { pending, active, done };
    }, [crs]);

    return (
        <div className="client-cr-container">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="page-title mb-1 text-dark fw-bold">Client Change Requests (CR)</h4>
                    <p className="text-muted small mb-0">
                        Review, estimate effort, approve, and track scope modifications requested by clients.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={fetchCRs}>
                        <i className="uil-sync me-1"></i> Refresh
                    </Button>
                </div>
            </div>

            {/* 4 Summary Stats */}
            <Row className="g-3 mb-3">
                <Col md={3}>
                    <Card className="border-0 shadow-sm cr-stat-card border-start border-primary border-4">
                        <Card.Body className="p-3">
                            <span className="text-muted small fw-bold text-uppercase">Total Requests</span>
                            <h3 className="fw-bold text-primary mb-0 mt-1">{totalCount}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm cr-stat-card border-start border-warning border-4">
                        <Card.Body className="p-3">
                            <span className="text-muted small fw-bold text-uppercase">Awaiting Review</span>
                            <h3 className="fw-bold text-warning mb-0 mt-1">{counts.pending}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm cr-stat-card border-start border-info border-4">
                        <Card.Body className="p-3">
                            <span className="text-muted small fw-bold text-uppercase">Approved / In Dev</span>
                            <h3 className="fw-bold text-info mb-0 mt-1">{counts.active}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm cr-stat-card border-start border-success border-4">
                        <Card.Body className="p-3">
                            <span className="text-muted small fw-bold text-uppercase">Completed</span>
                            <h3 className="fw-bold text-success mb-0 mt-1">{counts.done}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filter Bar & Directory */}
            <Card className="border-0 shadow-sm" style={{ height: 'calc(100vh - 290px)', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className="p-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {/* Status Filter */}
                            <Form.Select
                                size="sm"
                                style={{ width: '150px' }}
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="in_review">In Review</option>
                                <option value="approved">Approved</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </Form.Select>

                            {/* Priority Filter */}
                            <Form.Select
                                size="sm"
                                style={{ width: '140px' }}
                                value={selectedPriority}
                                onChange={(e) => {
                                    setSelectedPriority(e.target.value);
                                    setPage(1);
                                }}
                            >
                                <option value="all">All Priorities</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </Form.Select>

                            {/* Project Filter */}
                            {projectOptions.length > 0 && (
                                <Form.Select
                                    size="sm"
                                    style={{ width: '180px' }}
                                    value={selectedProject}
                                    onChange={(e) => {
                                        setSelectedProject(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="all">All Projects</option>
                                    {projectOptions.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </Form.Select>
                            )}
                        </div>

                        {/* Search Input */}
                        <div style={{ width: '240px' }}>
                            <Form.Control
                                size="sm"
                                placeholder="Search by title or scope..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Table View */}
                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                        {loading ? (
                            <div className="text-center py-5 text-muted">
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Loading Change Requests...
                            </div>
                        ) : crs.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <i className="uil-file-slash fs-1 d-block mb-2"></i>
                                <h6>No Change Requests Found</h6>
                                <p className="small mb-0">No client requests matched your search or filters.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table hover responsive size="sm" className="align-middle mb-0 cr-admin-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Client</th>
                                            <th>Project</th>
                                            <th>Change Request Title</th>
                                            <th className="text-center">Priority</th>
                                            <th className="text-center">Status</th>
                                            <th className="text-center">Est. Hours</th>
                                            <th className="text-center">Cost</th>
                                            <th>Submitted</th>
                                            <th>Target Date</th>
                                            <th className="text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {crs.map((item, idx) => (
                                            <tr key={item._id} className="cursor-pointer" onClick={() => handleOpenReview(item)}>
                                                <td className="fw-bold text-muted">{(page - 1) * 15 + idx + 1}</td>
                                                <td>
                                                    <div className="fw-semibold text-dark">{item.client?.name || "Client"}</div>
                                                    <small className="text-muted">{item.client?.companyName || item.client?.email?.[0]}</small>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark border">
                                                        {item.project?.name || "Project"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="fw-bold text-primary">{item.title}</div>
                                                    <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '240px' }}>
                                                        {item.description ? item.description.substring(0, 45) + '...' : 'No description'}
                                                    </small>
                                                </td>
                                                <td className="text-center">{renderPriorityBadge(item.priority)}</td>
                                                <td className="text-center">{renderStatusBadge(item.status)}</td>
                                                <td className="text-center fw-semibold">
                                                    {item.estimatedHours > 0 ? `${item.estimatedHours} hrs` : <span className="text-muted">-</span>}
                                                </td>
                                                <td className="text-center fw-semibold">
                                                    {item.cost > 0 ? `$${item.cost}` : <span className="text-muted">-</span>}
                                                </td>
                                                <td className="small text-muted">
                                                    {moment(item.createdAt).format('DD/MM/YYYY')}
                                                </td>
                                                <td className="small text-muted">
                                                    {item.targetDate ? moment.utc(item.targetDate).format('DD/MM/YYYY') : '-'}
                                                </td>
                                                <td className="text-end" onClick={(e) => e.stopPropagation()}>
                                                    <div className="d-flex justify-content-end gap-1">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            style={{ padding: '2px 8px', fontSize: '11px' }}
                                                            onClick={() => handleOpenReview(item)}
                                                        >
                                                            <i className="uil-edit-alt me-1"></i> Review
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            style={{ padding: '2px 8px', fontSize: '11px' }}
                                                            onClick={() => handleDeleteCR(item._id)}
                                                        >
                                                            <i className="uil-trash"></i>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {/* Pinned Pagination Bar */}
                    {totalPages > 0 && (
                        <div className="d-flex justify-content-end mt-auto pt-2 border-top">
                            <Pagination
                                page={page}
                                count={totalPages}
                                color="primary"
                                variant="outlined"
                                onChange={(e, val) => setPage(val)}
                            />
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Review & Update Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static" className="taskModal" centered>
                <Modal.Header className="py-2 px-3 border-bottom">
                    <Modal.Title className="text-black fs-5 fw-bold">
                        Review Change Request
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveReview}>
                    <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                        <div style={{
                            maxHeight: 'calc(100vh - 200px)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                        }}>
                            {activeCR && (
                                <div className="bg-white p-3 rounded-3 shadow-sm">
                                    {/* Header Info */}
                                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '38px', height: '38px', flexShrink: 0 }}>
                                                <i className="fas fa-file-alt" style={{ fontSize: '16px' }}></i>
                                            </div>
                                            <div>
                                                <h5 className="mb-0 fw-bold text-dark">{activeCR.title}</h5>
                                                <small className="text-muted">
                                                    Client: <strong className="text-dark">{activeCR.client?.name}</strong> • Project: <strong className="text-dark">{activeCR.project?.name}</strong>
                                                </small>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            {renderStatusBadge(activeCR.status)}
                                            {renderPriorityBadge(activeCR.priority)}
                                        </div>
                                    </div>

                                    {/* Quick Metadata Info */}
                                    <div className="row g-2 mb-3">
                                        <div className="col-md-4">
                                            <div className="border rounded-2 py-2 px-3 bg-light">
                                                <small className="text-muted fw-semibold d-block" style={{ fontSize: '10px' }}>SUBMITTED</small>
                                                <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{moment(activeCR.createdAt).format('DD/MM/YYYY, hh:mm A')}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="border rounded-2 py-2 px-3 bg-light">
                                                <small className="text-muted fw-semibold d-block" style={{ fontSize: '10px' }}>TARGET DATE</small>
                                                <span className="fw-bold text-dark" style={{ fontSize: '12px' }}>{activeCR.targetDate ? moment(activeCR.targetDate).format('DD/MM/YYYY') : 'Not specified'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="border rounded-2 py-2 px-3 bg-light">
                                                <small className="text-muted fw-semibold d-block" style={{ fontSize: '10px' }}>CURRENT STATUS</small>
                                                <span className="fw-bold text-dark text-capitalize" style={{ fontSize: '12px' }}>{activeCR.status?.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3">
                                        <h6 className="text-dark fw-bold mb-1 border-bottom pb-1" style={{ fontSize: '12px' }}>
                                            <i className="fas fa-align-left text-primary me-2"></i>DESCRIPTION / SCOPE
                                        </h6>
                                        <div className="border rounded p-2 bg-light text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '13px', minHeight: '50px' }}>
                                            {activeCR.description || "No description provided."}
                                        </div>
                                    </div>

                                    {/* Client Notes if any */}
                                    {activeCR.clientNotes && (
                                        <div className="mb-3">
                                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1" style={{ fontSize: '12px' }}>
                                                <i className="fas fa-comment-dots text-info me-2"></i>CLIENT NOTES
                                            </h6>
                                            <div className="border rounded p-2 bg-light text-dark" style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                                                {activeCR.clientNotes}
                                            </div>
                                        </div>
                                    )}

                                    {/* Attachments */}
                                    {activeCR.attachments && activeCR.attachments.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1" style={{ fontSize: '12px' }}>
                                                <i className="fas fa-paperclip text-secondary me-2"></i>ATTACHMENTS ({activeCR.attachments.length})
                                            </h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {activeCR.attachments.map((file, fIdx) => (
                                                    <a
                                                        key={fIdx}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 py-1 px-2 border bg-white"
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        <i className="fas fa-file-download text-primary"></i>
                                                        <span className="text-truncate" style={{ maxWidth: '240px' }}>{file.originalName || file.fileName}</span>
                                                        {file.size && <span className="text-muted" style={{ fontSize: '10px' }}>({formatFileSize(file.size)})</span>}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Engineering Assessment Form Controls */}
                                    <div className="mt-3 pt-2">
                                        <h6 className="text-primary fw-bold mb-2 border-bottom pb-1" style={{ fontSize: '12px' }}>
                                            <i className="fas fa-sliders-h me-2"></i>ENGINEERING REVIEW & COMMERCIAL ASSESSMENT
                                        </h6>
                                        <Row className="g-2">
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small fw-bold">Update Status <span className="text-danger">*</span></Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={statusToUpdate}
                                                        onChange={(e) => setStatusToUpdate(e.target.value)}
                                                        style={{ height: '36px', fontSize: '13px' }}
                                                    >
                                                        <option value="submitted">Submitted (Under Review)</option>
                                                        <option value="in_review">In Review (Evaluating Scope)</option>
                                                        <option value="approved">Approved (Accepted into Scope)</option>
                                                        <option value="in_progress">In Progress (Actively Developing)</option>
                                                        <option value="completed">Completed (Delivered & Verified)</option>
                                                        <option value="rejected">Rejected (Out of Scope / Declined)</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small fw-bold">Estimated Hours</Form.Label>
                                                    <div className="input-group input-group-sm">
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            step="0.5"
                                                            placeholder="e.g. 16"
                                                            value={estimatedHours}
                                                            onChange={(e) => setEstimatedHours(e.target.value)}
                                                            style={{ height: '36px', fontSize: '13px' }}
                                                        />
                                                        <span className="input-group-text bg-light">hrs</span>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small fw-bold">Commercials / Cost ($)</Form.Label>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text bg-light">$</span>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            placeholder="e.g. 450"
                                                            value={cost}
                                                            onChange={(e) => setCost(e.target.value)}
                                                            style={{ height: '36px', fontSize: '13px' }}
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small fw-bold">Priority</Form.Label>
                                                    <Form.Select
                                                        size="sm"
                                                        value={priorityToUpdate}
                                                        onChange={(e) => setPriorityToUpdate(e.target.value)}
                                                        style={{ height: '36px', fontSize: '13px' }}
                                                    >
                                                        <option value="low">Low</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="high">High</option>
                                                        <option value="urgent">Urgent</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small fw-bold">Target Completion Date</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        value={targetDateToUpdate}
                                                        onChange={(e) => setTargetDateToUpdate(e.target.value)}
                                                        style={{ height: '36px', fontSize: '13px' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small fw-bold">Admin Feedback / Notes (Visible to Client)</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        placeholder="Explain estimated delivery timeframe, technical requirements, or quote breakdown..."
                                                        value={adminNotes}
                                                        onChange={(e) => setAdminNotes(e.target.value)}
                                                        style={{ fontSize: '13px' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="py-2 px-3 bg-white border-top">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => setShowModal(false)}
                            disabled={saving}
                            style={{ padding: '6px 20px', fontSize: '12px' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-dark text-white fw-semibold"
                            disabled={saving}
                            style={{ padding: '6px 20px', fontSize: '12px' }}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check me-1"></i> Save & Notify Client
                                </>
                            )}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientCR;
