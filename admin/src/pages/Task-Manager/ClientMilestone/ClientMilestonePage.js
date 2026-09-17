import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Form, Modal, Row, Col, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { handleUpload } from '../../../constants/handleUpload';
import { FiCalendar, FiUser, FiUsers, FiCode, FiClock, FiEdit, FiLayers, FiSettings } from 'react-icons/fi';
import {
    getClientMilestones,
    addClientMilestone,
    updateClientMilestone,
    getClientProjects,
} from '../../../redux/actions';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed', 'Delayed'];

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT PROJECT PREVIEW  — same as ProjectPreview.js but for ClientProject
// ══════════════════════════════════════════════════════════════════════════════
const ClientProjectPreview = ({ projectId }) => {
    const store      = useSelector((s) => s);
    const allProjects = store?.getClientProjectsReducer?.data?.data || [];
    const projectData = allProjects.find(p => p._id === projectId) || null;

    const formatDate = (d) => { try { return d ? format(new Date(d), 'PP') : 'N/A'; } catch { return 'N/A'; } };

    const renderArrayWithMore = (array, key, maxVisible = 1) => {
        if (!array || array.length === 0) return <span className="small text-muted">None</span>;
        const visible   = array.slice(0, maxVisible);
        const remaining = array.slice(maxVisible);
        return (
            <div className="d-inline">
                {visible.map((item, i) => (
                    <span key={i}>{item.name || item.email || item}{i < visible.length - 1 ? ', ' : ''}</span>
                ))}
                {remaining.length > 0 && (
                    <OverlayTrigger placement="top" overlay={<Tooltip>{remaining.map((item, i) => <div key={i}>{item.name || item.email || item}</div>)}</Tooltip>}>
                        <span className="text-primary ms-1 cp">+{remaining.length} more</span>
                    </OverlayTrigger>
                )}
            </div>
        );
    };

    return (
        <div className="project-preview">
            <Accordion defaultActiveKey="0" flush>
                <Accordion.Item eventKey="0" className="border border-light mb-3">
                    <Accordion.Header className="bg-white border-0">
                        <div className="d-flex align-items-center w-100">
                            <div style={{ background: 'rgba(13,110,253,0.08)', padding: '7px', borderRadius: '8px', display: 'flex' }}>
                                <FiLayers className="text-primary" size={22} />
                            </div>
                            <div className="flex-grow-1 text-black ms-3">
                                <span className="fw-semibold">{projectData?.name || 'Loading...'}</span>
                                <small className="text-muted d-flex align-items-center mt-1">
                                    <FiCalendar size={12} className="me-1" />
                                    {projectData?.start ? formatDate(projectData.start) : 'N/A'}&nbsp;–&nbsp;
                                    {projectData?.end   ? formatDate(projectData.end)   : 'Present'}
                                </small>
                            </div>
                            <span className="py-1 fw-semibold rounded-1 me-2 text-primary" style={{ fontSize: '11px', background: 'rgba(13,110,253,0.08)', padding: '4px 12px' }}>
                                {projectData?.type || 'N/A'}
                            </span>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body className="bg-light pb-0 pt-2 px-2">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="p-3 bg-white rounded-3 shadow-sm h-100 d-flex align-items-center">
                                    <FiUser size={18} className="me-2 text-primary" />
                                    <div>
                                        <p className="fw-semibold text-dark mb-0" style={{ fontSize: '0.8375rem' }}>Client</p>
                                        {projectData?.client?.length > 0
                                            ? <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{renderArrayWithMore(projectData.client, 'clients')}</div>
                                            : <div className="text-muted" style={{ fontSize: '0.75rem' }}>No clients assigned</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-white rounded-3 shadow-sm h-100 d-flex align-items-center">
                                    <FiUsers size={22} className="me-2 text-primary" />
                                    <div>
                                        {projectData?.team?.length > 0
                                            ? <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{renderArrayWithMore(projectData.team, 'team', 10)}</div>
                                            : <div className="text-muted" style={{ fontSize: '0.75rem' }}>No team members assigned</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="p-3 bg-white rounded-3 shadow-sm h-100 d-flex align-items-center">
                                    <FiSettings size={18} className="me-2 text-primary" />
                                    <div>
                                        {projectData?.technology?.length > 0
                                            ? <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{renderArrayWithMore(projectData.technology, 'tech', 10)}</div>
                                            : <span className="text-muted" style={{ fontSize: '0.75rem' }}>No technologies specified</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 mt-2">
                                <div className="d-flex justify-content-between text-muted py-2 border-top" style={{ fontSize: '0.78rem' }}>
                                    <span className="d-flex align-items-center"><FiClock size={14} className="me-2" />Created: {formatDate(projectData?.createdAt)}</span>
                                    <span className="d-flex align-items-center"><FiEdit size={14} className="me-2" />Updated: {formatDate(projectData?.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ADD MILESTONE MODAL
// ══════════════════════════════════════════════════════════════════════════════
const AddMilestoneModal = ({ show, onHide, projectId, onSuccess }) => {
    const dispatch  = useDispatch();
    const store     = useSelector((s) => s);
    const loading   = store?.addClientMilestoneReducer?.loading;
    const addStatus = store?.addClientMilestoneReducer?.data?.status;

    const [startDate,   setStartDate]   = useState(null);
    const [endDate,     setEndDate]     = useState('');
    const [attachments, setAttachments] = useState([]);
    const [filesUploading, setFilesUploading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const resetAll = () => { reset(); setStartDate(null); setEndDate(''); setAttachments([]); };

    useEffect(() => { if (addStatus === 201) { resetAll(); onSuccess(); onHide(); } }, [addStatus]);
    useEffect(() => { if (!show) resetAll(); }, [show]);

    const handleFileChange = async (e) => {
        for (const file of Array.from(e.target.files)) {
            if (file.size > 25 * 1024 * 1024) { toast.error('File must be < 25MB'); continue; }
            const res = await handleUpload(file, setFilesUploading);
            if (res) setAttachments(p => [...p, { name: file.name, url: res?.url?.split('?')[0] }]);
        }
    };

    const onSubmit = (data) => {
        if (!startDate) { toast.error('Start date required'); return; }
        if (!endDate)   { toast.error('End date required');   return; }
        dispatch(addClientMilestone({
            project: projectId,
            title: data.Title,
            description: data.description,
            startDate, completionDate: endDate,
            status: data.status,
            attachments,
        }));
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header className="py-2">
                <Modal.Title className="fw-bold text-dark" style={{ fontSize: '14px' }}>Add Client Milestone</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="bg-white p-2 rounded-3 shadow-sm">
                        <div className="mb-2">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-info-circle me-2"></i>Basic Information</h6>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">Milestone Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="form" type="text" placeholder="Enter milestone name"
                                            {...register('Title', { required: true, pattern: /^[^\s].*$/ })} />
                                        {errors.Title?.type === 'required' && <span className="text-danger small">Required</span>}
                                        {errors.Title?.type === 'pattern'  && <span className="text-danger small">Cannot start with space</span>}
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">Status <span className="text-danger">*</span></Form.Label>
                                        <Form.Select className="formSelect" {...register('status', { required: true })} defaultValue="Not Started">
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                        <div className="mb-2">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-calendar-alt me-2"></i>Timeline</h6>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small d-block">Start Date <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="date" className="form"
                                            value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setStartDate(new Date(e.target.value))} required />
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small d-block">End Date <span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="date" className="form" value={endDate || ''}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).toISOString().split('T')[0] : undefined}
                                            disabled={!startDate} required />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                        <div className="mb-2">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-file-alt me-2"></i>Details</h6>
                            <Row>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">
                                            Attachments&nbsp;
                                            <i onClick={() => document.getElementById('add-ms-file').click()} className="bi bi-plus-circle cp text-danger" style={{ cursor: 'pointer' }} />
                                        </Form.Label>
                                        <input type="file" id="add-ms-file" style={{ display: 'none' }} multiple onChange={handleFileChange} />
                                        {filesUploading ? (
                                            <div className="d-flex flex-wrap gap-2 mt-1">{[...Array(2)].map((_, i) => <div key={i} className="placeholder placeholder-wave rounded-2" style={{ width: '100px', height: '28px' }} />)}</div>
                                        ) : attachments.length > 0 && (
                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                {attachments.map((f, i) => (
                                                    <div key={i} className="d-flex border shadow-sm p-1 px-2 align-items-center rounded" style={{ fontSize: '11px' }}>
                                                        <span className="me-2">{f.name.length > 20 ? f.name.slice(0, 19) + '…' : f.name}</span>
                                                        <i onClick={() => setAttachments(attachments.filter((_, x) => x !== i))} className="bi bi-x-circle text-danger cp" style={{ cursor: 'pointer' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">Description</Form.Label>
                                        <Form.Control as="textarea" rows={3} placeholder="Enter description" {...register('description')} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-outline-secondary fw-semibold" style={{ fontSize: '11px', padding: '4px 16px' }} onClick={onHide}>Cancel</button>
                    <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ fontSize: '11px', padding: '4px 16px' }} disabled={loading}>
                        {loading ? 'Adding...' : 'Add Milestone'}
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// EDIT MILESTONE MODAL
// ══════════════════════════════════════════════════════════════════════════════
const EditMilestoneModal = ({ show, onHide, editData, onSuccess }) => {
    const dispatch = useDispatch();
    const store    = useSelector((s) => s);
    const loading  = store?.updateClientMilestoneReducer?.loading;

    const [startDate,   setStartDate]   = useState(null);
    const [endDate,     setEndDate]     = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [filesUploading, setFilesUploading] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    useEffect(() => {
        if (show && editData) {
            setValue('title',       editData.title       || '');
            setValue('status',      editData.status      || 'Not Started');
            setValue('description', editData.description || '');
            setStartDate(editData.startDate      ? new Date(editData.startDate)      : null);
            setEndDate(editData.completionDate   ? new Date(editData.completionDate) : null);
            setAttachments(editData.attachments  || []);
        } else if (!show) {
            reset(); setStartDate(null); setEndDate(null); setAttachments([]);
        }
    }, [show, editData]);

    const handleFileChange = async (e) => {
        for (const file of Array.from(e.target.files)) {
            if (file.size > 25 * 1024 * 1024) { toast.error('File must be < 25MB'); continue; }
            const res = await handleUpload(file, setFilesUploading);
            if (res) setAttachments(p => [...p, { name: file.name, url: res?.url?.split('?')[0] }]);
        }
    };

    const onSubmit = (data) => {
        dispatch(updateClientMilestone({
            milestoneId: editData._id,
            body: {
                title:          data.title,
                description:    data.description,
                status:         data.status,
                startDate,
                completionDate: endDate,
                attachments,
            }
        }));
        onSuccess();
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header className="py-2">
                <Modal.Title className="fw-bold text-dark" style={{ fontSize: '14px' }}>Update Client Milestone</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="bg-white p-2 rounded-3 shadow-sm">
                        <div className="mb-2">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-info-circle me-2"></i>Basic Information</h6>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">Milestone Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="form" type="text" placeholder="Enter milestone name"
                                            {...register('title', { required: true, validate: v => v.trim() !== '' })} />
                                        {errors.title && <span className="text-danger small">Required</span>}
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">Status <span className="text-danger">*</span></Form.Label>
                                        <Form.Select className="formSelect" {...register('status', { required: true })}>
                                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                        <div className="mb-2">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-calendar-alt me-2"></i>Timeline</h6>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small d-block">Start Date <span className="text-danger">*</span></Form.Label>
                                        <DatePicker selected={startDate} onChange={setStartDate}
                                            placeholderText="dd/MM/yyyy" dateFormat="dd/MM/yyyy" className="form-control form" />
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small d-block">End Date <span className="text-danger">*</span></Form.Label>
                                        <DatePicker selected={endDate} onChange={setEndDate}
                                            minDate={startDate ? new Date(startDate.getTime() + 86400000) : null}
                                            disabled={!startDate} placeholderText="dd/MM/yyyy" dateFormat="dd/MM/yyyy" className="form-control form" />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                        <div className="mb-2">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-file-alt me-2"></i>Details</h6>
                            <Row>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">
                                            Attachments&nbsp;
                                            <i onClick={() => document.getElementById('edit-ms-file').click()} className="bi bi-plus-circle cp text-danger" style={{ cursor: 'pointer' }} />
                                        </Form.Label>
                                        <input type="file" id="edit-ms-file" style={{ display: 'none' }} multiple onChange={handleFileChange} />
                                        {filesUploading ? (
                                            <div className="d-flex flex-wrap gap-2 mt-1">{[...Array(2)].map((_, i) => <div key={i} className="placeholder placeholder-wave rounded-2" style={{ width: '100px', height: '28px' }} />)}</div>
                                        ) : attachments.length > 0 && (
                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                {attachments.map((f, i) => (
                                                    <div key={i} className="d-flex border shadow-sm p-1 px-2 align-items-center rounded" style={{ fontSize: '11px' }}>
                                                        <span className="me-2">{f.name?.length > 20 ? f.name.slice(0, 19) + '…' : f.name}</span>
                                                        <i onClick={() => setAttachments(attachments.filter((_, x) => x !== i))} className="bi bi-x-circle text-danger cp" style={{ cursor: 'pointer' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 small">Description</Form.Label>
                                        <Form.Control as="textarea" rows={3} placeholder="Enter description" {...register('description')} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-outline-secondary fw-semibold" style={{ fontSize: '11px', padding: '4px 16px' }} onClick={onHide}>Cancel</button>
                    <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ fontSize: '11px', padding: '4px 16px' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Milestone'}
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const ClientMilestonePage = () => {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const store     = useSelector((s) => s);

    const milestones = store?.getClientMilestonesReducer?.data?.data || [];
    const loading    = store?.getClientMilestonesReducer?.loading;

    const [showAdd,   setShowAdd]   = useState(false);
    const [showEdit,  setShowEdit]  = useState(false);
    const [editData,  setEditData]  = useState(null);
    const [activeTab, setActiveTab] = useState('active');

    const fetchMilestones = () => {
        dispatch(getClientMilestones({
            projectId: id,
            page: 1,
            limit: 100,
            isActive: activeTab === 'active',
        }));
    };

    useEffect(() => {
        dispatch(getClientProjects({ page: 1, limit: 100 }));
    }, [dispatch]);

    useEffect(() => { fetchMilestones(); }, [id, activeTab]);

    const handleEdit = (item) => { setEditData(item); setShowEdit(true); };

    const calculateDaysLeft = (endDate) => {
        if (!endDate) return null;
        return moment(endDate).diff(moment(), 'days');
    };

    const statusBadge = (s) => {
        const map = { 'Not Started': 'secondary', 'In Progress': 'primary', 'Completed': 'success', 'Delayed': 'danger' };
        return <span className={`badge bg-${map[s] || 'secondary'}`} style={{ fontSize: '10px' }}>{s}</span>;
    };

    const priorityBadge = (p) => {
        const map = { High: '#dc3545', Medium: '#ffc107', Low: '#28a745' };
        return <span className="badge py-1 text-white" style={{ fontSize: '10px', backgroundColor: map[p] || '#6c757d' }}>{p || 'Medium'}</span>;
    };

    return (
        <div>
            <Card style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className="p-2" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    {/* Project Preview — same as milestone.js */}
                    <div className="row mb-0">
                        <div className="col-12">
                            <ClientProjectPreview projectId={id} />
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <button className="btn btn-outline-secondary fw-semibold d-flex align-items-center gap-1"
                                    style={{ padding: '4px 12px', fontSize: '11px' }} onClick={() => navigate(-1)}>
                                    <i className="mdi mdi-arrow-left"></i> Back
                                </button>
                                <button
                                    className={`btn fw-semibold px-3 rounded-0 ${activeTab === 'active' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                    onClick={() => setActiveTab('active')}>
                                    Active
                                </button>
                                <button
                                    className={`btn fw-semibold px-3 rounded-0 ${activeTab === 'inactive' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                    onClick={() => setActiveTab('inactive')}>
                                    Inactive
                                </button>
                            </div>
                            <button className="btn bg-dark text-white fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                onClick={() => setShowAdd(true)}>
                                Add Milestone
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <div className="spinner-border text-dark" style={{ width: '1.5rem', height: '1.5rem' }} />
                            </div>
                        ) : milestones.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <h5 className="text-muted">No Milestones Found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ height: '90%' }}>
                                <Table className="mb-0 table-hover table-sm" style={{ fontSize: '11px' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ width: '5%' }}>#</th>
                                            <th style={{ width: '20%' }}>Milestone Name</th>
                                            <th style={{ width: '20%' }}>Description</th>
                                            <th style={{ width: '12%' }}>Start Date</th>
                                            <th style={{ width: '12%' }}>End Date</th>
                                            <th style={{ width: '8%' }}>Days Left</th>
                                            <th style={{ width: '8%' }}>Priority</th>
                                            <th style={{ width: '10%' }}>Status</th>
                                            <th style={{ width: '5%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {milestones.map((item, index) => {
                                            const days    = calculateDaysLeft(item.completionDate);
                                            const descTxt = item.description?.replace(/<[^>]+>/g, '') || '';
                                            return (
                                                <tr key={item._id} className="align-middle">
                                                    <td className="fw-bold">{index + 1}</td>
                                                    <td className="fw-semibold text-capitalize" style={{ color: '#0d6efd' }}>
                                                        {item.title}
                                                    </td>
                                                    <td className="text-muted">
                                                        {descTxt.length > 30 ? descTxt.slice(0, 30) + '…' : descTxt || 'N/A'}
                                                    </td>
                                                    <td className="text-muted">{moment.utc(item.startDate).format('DD/MM/YYYY')}</td>
                                                    <td className="text-muted">{moment.utc(item.completionDate).format('DD/MM/YYYY')}</td>
                                                    <td>
                                                        {days !== null ? (
                                                            <span className="badge py-1 text-white"
                                                                style={{ fontSize: '10px', backgroundColor: days < 0 ? '#dc3545' : '#8FD1A3' }}>
                                                                {days}
                                                            </span>
                                                        ) : 'N/A'}
                                                    </td>
                                                    <td>{priorityBadge(item.priority)}</td>
                                                    <td>{statusBadge(item.status)}</td>
                                                    <td>
                                                        <button className="btn btn-outline-secondary"
                                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                                            onClick={() => handleEdit(item)}>
                                                            <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <AddMilestoneModal show={showAdd} onHide={() => setShowAdd(false)} projectId={id} onSuccess={fetchMilestones} />
            <EditMilestoneModal show={showEdit} onHide={() => setShowEdit(false)} editData={editData} onSuccess={fetchMilestones} />
        </div>
    );
};

export default ClientMilestonePage;
