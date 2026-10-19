import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { OverlayTrigger, Tooltip, Modal, Row, Col, Form, Table } from 'react-bootstrap';
import Select from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { toast } from 'react-toastify';
import moment from 'moment';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { emojiRegex } from '../../../helpers/emojiRegex';
import useQuillWordLimit from '../../../helpers/quillWordLimit';
import { handleUpload } from '../../../constants/handleUpload';
import DescriptionOffCanvas from '../../../components/DescriptionOffCanvas';
import './ClientTaskDashboard.css';
import {
    getAllProjects, getClientMilestones, getClientTasks,
    addClientTask, updateClientTask, getAllUsers,
} from '../../../redux/actions';

const Container = styled.div`display: flex; flex: 1;`;

const KanbanColumn = styled.div`
    height: 100%; overflow: auto; display: flex; flex-direction: column;
    background: #f8f9fa; width: 100%; border-radius: 8px; padding: 8px;
    margin-right: 8px; border: 1px solid #e9ecef; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background-color: #dee2e6; border-radius: 4px; }
`;

const TaskColumnStyles = styled.div`
    margin: 4px; display: flex; width: 100%; overflow: auto; gap: 4px;
    scrollbar-width: none; -ms-overflow-style: none;
    &::-webkit-scrollbar { display: none; }
    .task-list-col { flex: 1; min-width: 18vw; padding: 0 4px; }
`;

const ColTitle = styled.div`
    color: #495057; background: #ffffff; padding: 8px 12px; border-radius: 6px;
    font-weight: 600; font-size: 14px; border-bottom: 2px solid #e9ecef; margin-bottom: 8px;
    display: flex; justify-content: space-between; align-items: center;
    position: sticky; top: 0; z-index: 10;
`;

const CardWrap = styled.div`perspective: 1000px; margin-bottom: 0.7rem;`;

const CardBody = styled.div`
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 0.4rem 0.8rem; min-height: 100px; border-radius: 12px;
    background: white; border: 1px solid white;
    box-shadow: 0 6px 25px rgba(0,0,0,0.08);
    &:hover { border: 0.1px solid #727CF5; }
`;

const PBadge = styled.span`
    display: inline-block; padding: 0.25rem 0.5rem; border-radius: 20px;
    font-size: 0.5rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
    background: ${p => p.priority === 'Critical' ? 'rgba(243,4,24,0.19)' : p.priority === 'High' ? 'rgba(255,165,2,0.1)' : p.priority === 'Medium' ? 'rgba(30,144,255,0.1)' : 'rgba(46,213,115,0.1)'};
    color: ${p => p.priority === 'Critical' ? '#fa172a' : p.priority === 'High' ? '#ffa502' : p.priority === 'Medium' ? '#1e90ff' : '#2ed573'};
`;

// ─── Constants ────────────────────────────────────────────────────────────────
const COLS = ['To Do', 'In Progress', 'Testing', 'On Hold', 'Done'];
const COLCLR = { 'To Do': '#6c757d', 'In Progress': '#0d6efd', 'Testing': '#6f42c1', 'On Hold': '#fd7e14', 'Done': '#198754' };

const SS = {
    control: b => ({ ...b, minHeight: '30px', height: '30px', fontSize: '12px' }),
    valueContainer: b => ({ ...b, padding: '0 8px' }),
    input: b => ({ ...b, margin: 0, fontSize: '12px' }),
    singleValue: b => ({ ...b, fontSize: '12px' }),
    placeholder: b => ({ ...b, fontSize: '12px' }),
    option: b => ({ ...b, fontSize: '12px' }),
    indicatorsContainer: b => ({ ...b, height: '30px' }),
    menu: b => ({ ...b, zIndex: 9999 }),
};

// ══════════════════════════════════════════════════════════════════════════════
// LIST VIEW
// ══════════════════════════════════════════════════════════════════════════════
const ClientTaskListView = ({ tasks, loading }) => {
    const [selDesc, setSelDesc] = useState('');
    const [selTitle, setSelTitle] = useState('');
    const [showOC, setShowOC] = useState(false);

    if (loading) return (
        <div className="ctd-loading">
            <div className="spinner-border text-dark" />
        </div>
    );
    if (!tasks || tasks.length === 0) return (
        <div className="ctd-empty">
            <h5 className="text-muted">No Tasks Found</h5>
        </div>
    );

    const statusClass = s =>
        s === 'Done' || s === 'Completed' ? 'bg-success-subtle text-success' :
            s === 'In Progress' ? 'bg-warning-subtle text-warning' :
                s === 'To Do' ? 'bg-info-subtle text-info' :
                    'bg-secondary-subtle text-secondary';

    const priorityClass = p =>
        p === 'Critical' || p === 'High' ? 'bg-danger-subtle text-danger' :
            p === 'Medium' ? 'bg-warning-subtle text-warning' :
                'bg-success-subtle text-success';

    return (
        <div className="ctd-list-wrap">
            <Table className="mb-0 table-hover table-sm ctd-list-fs" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead className="table-dark">
                    <tr>
                        <th style={{ width: '16%' }}>Summary</th>
                        <th style={{ width: '13%' }}>Milestone</th>
                        <th style={{ width: '11%' }}>Assignee</th>
                        <th style={{ width: '9%' }}>Start Date</th>
                        <th style={{ width: '9%' }}>End Date</th>
                        <th style={{ width: '9%', textAlign: 'center' }}>Priority</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Task Status</th>
                        <th style={{ width: '9%' }}>Estimated Time</th>
                    </tr>
                </thead>
            </Table>
            <div className="ctd-list-scroll">
                <Table className="mb-0 table-hover table-sm ctd-list-fs" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead style={{ visibility: 'collapse' }}>
                        <tr>
                            <th style={{ width: '16%' }} /><th style={{ width: '13%' }} /><th style={{ width: '11%' }} />
                            <th style={{ width: '9%' }} /><th style={{ width: '9%' }} /><th style={{ width: '9%' }} />
                            <th style={{ width: '10%' }} /><th style={{ width: '9%' }} />
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(item => (
                            <tr className="align-middle" key={item._id}>
                                <td className="ctd-list-fs">
                                    {item?.summary ? (
                                        <>
                                            {item.summary.split(' ').slice(0, 3).join(' ')}
                                            {item.summary.split(' ').length > 3 && '...'}
                                            {item.summary.length > 20 && (
                                                <i className="mdi mdi-information-outline text-primary ms-1 cp"
                                                    onClick={() => { setSelDesc(item.summary); setSelTitle('Task Summary'); setShowOC(true); }} />
                                            )}
                                        </>
                                    ) : 'N/A'}
                                </td>
                                <td className="ctd-list-fs" title={item?.milestone?.title}>
                                    {item?.milestone?.title
                                        ? (item.milestone.title.length > 25 ? item.milestone.title.slice(0, 24) + '...' : item.milestone.title)
                                        : 'N/A'}
                                </td>
                                <td className="ctd-list-fs">{item?.assignee?.name || 'N/A'}</td>
                                <td className="ctd-list-fs">{item?.startDate ? moment.utc(item.startDate).format('DD/MM/YYYY') : 'N/A'}</td>
                                <td className="ctd-list-fs">{item?.dueDate ? moment.utc(item.dueDate).format('DD/MM/YYYY') : 'N/A'}</td>
                                <td className="text-center">
                                    <span className={`badge py-1 ctd-badge-full ${priorityClass(item?.priority)}`}>
                                        {item?.priority || 'N/A'}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <span className={`badge py-1 ctd-badge-full ${statusClass(item?.status)}`}>
                                        {item?.status || 'N/A'}
                                    </span>
                                </td>
                                <td className="ctd-list-fs">{item?.estimatedTime ? item.estimatedTime + ' hrs' : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <DescriptionOffCanvas show={showOC} onHide={() => setShowOC(false)} description={selDesc} title={selTitle} />
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// TASK CARD
// ══════════════════════════════════════════════════════════════════════════════
const TaskCard = ({ item, onStatusChange }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const isOverdue = item.dueDate && moment(item.dueDate).isBefore(moment()) && item.status !== 'Done';

    return (
        <CardWrap draggable onDragStart={e => e.dataTransfer.setData('taskId', item._id)}>
            <CardBody>
                <div className="row">
                    <div className="col-12 ctd-card-row1">
                        <div className="ctd-card-badges">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Priority</Tooltip>}>
                                <PBadge priority={item.priority}>{item.priority || 'No Priority'}</PBadge>
                            </OverlayTrigger>
                            <span className={isOverdue ? 'ctd-overdue' : 'ctd-ontime'}>
                                {isOverdue ? 'Overdue' : 'On Time'}
                            </span>
                        </div>
                        <div className="ctd-card-right">
                            {item.dueDate && <small className="ctd-card-due">{moment(item.dueDate).format('DD MMM')}</small>}
                            <div className="ctd-card-menu-wrap">
                                <i className="bi bi-three-dots-vertical ctd-card-menu-icon" onClick={() => setMenuOpen(s => !s)} />
                                {menuOpen && (
                                    <div className="ctd-card-menu">
                                        <div className="ctd-card-menu-title">Move to</div>
                                        {COLS.filter(s => s !== item.status).map(col => (
                                            <div key={col} className="ctd-card-menu-item"
                                                style={{ color: COLCLR[col] }}
                                                onClick={() => { onStatusChange(item._id, col); setMenuOpen(false); }}>
                                                {col}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 ctd-card-summary">
                        {item.summary?.length > 100 ? item.summary.slice(0, 99) + '…' : item.summary}
                    </div>
                    <div className="col-12 ctd-card-timeline">
                        Timeline: {item.estimatedTime || 0} hrs
                    </div>
                </div>
                <div className="ctd-card-footer">
                    <OverlayTrigger placement="bottom" overlay={<Tooltip>{item.assignee?.name || 'Unassigned'}</Tooltip>}>
                        <span className="ctd-card-avatar">
                            {item.assignee?.name ? item.assignee.name.split(' ').map(w => w[0]).join('') : 'UA'}
                        </span>
                    </OverlayTrigger>
                    {item.milestone?.title && (
                        <span className="ctd-card-milestone">
                            {item.milestone.title.length > 15 ? item.milestone.title.slice(0, 14) + '…' : item.milestone.title}
                        </span>
                    )}
                </div>
            </CardBody>
        </CardWrap>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// ADD TASK MODAL
const isOngoingOrAmc = (p) => {
    if (!p) return false;
    const status = p.projectStatus || '';
    const isOngoing = status === 'Ongoing';
    const isAmc = status === 'Support' || p.hasAmc === true || p.type === 'AMC';
    return isOngoing || isAmc;
};

// ══════════════════════════════════════════════════════════════════════════════
const AddTaskModal = ({ show, onHide, defaultStatus = 'To Do' }) => {
    const dispatch = useDispatch();
    const store = useSelector(s => s);
    const quillRef = useRef(null);
    const MAX_WORDS = 1000;
    const MAX_WORD_LENGTH = 45;
    const dept = localStorage.getItem('selectedDepartment') || 'Tech';
    const authUser = store?.Auth?.user;

    const projectsList = store?.getProject?.data?.data || store?.getProject?.data?.response?.projects || store?.getProject?.data || store?.getClientProjectsReducer?.data?.data || [];
    const clientMilestones = store?.getClientMilestonesReducer?.data?.data || [];
    const users = store?.getAllUsers?.data?.data || [];
    const loading = store?.addClientTaskReducer?.loading;
    const addStatus = store?.addClientTaskReducer?.data?.status;

    const [projectSelected, setProjectSelected] = useState(null);
    const [milestoneSelected, setMilestoneSelected] = useState(null);
    const [priority, setPriority] = useState('Medium');
    const [files, setFiles] = useState([]);
    const [filesUploading, setFilesUploading] = useState(false);
    const [exit, setExit] = useState(true);
    const [projectAssignee, setProjectAssignee] = useState([]);

    const hyper = JSON.parse(localStorage.getItem('hyper_user') || '{}');
    const defaultOption = {
        value: String(authUser?.id || authUser?._id || ''),
        label: String(`You (${authUser?.name || hyper?.username || 'Admin'})`)
    };

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm({
        defaultValues: { priority: 'Medium', reporter: defaultOption, assignee: null, project: null, milestone: null }
    });

    const handleFileChange = async e => {
        for (const file of Array.from(e.target.files)) {
            const url = await handleUpload(file, setFilesUploading);
            if (url) setFiles(p => [...p, { name: file.name, url: url?.url?.split('?')[0] }]);
        }
    };

    const closeModal = () => {
        reset({ priority: 'Medium', reporter: defaultOption, assignee: null, project: null, milestone: null });
        setProjectSelected(null); setMilestoneSelected(null);
        setPriority('Medium'); setFiles([]); setProjectAssignee([]);
        onHide();
    };

    useEffect(() => {
        if (addStatus === 201) {
            reset({ priority: 'Medium', reporter: defaultOption, assignee: null, project: null, milestone: null });
            setProjectSelected(null); setMilestoneSelected(null);
            setPriority('Medium'); setFiles([]); setProjectAssignee([]);
            if (exit) { onHide(); setExit(true); } else { setExit(true); }
        }
    }, [addStatus]);

    useEffect(() => {
        if (show) {
            dispatch(getAllUsers({ userType: dept }));
            dispatch(getAllProjects({ status: true, projectStatus: 'ongoing_amc', limit: 500, skip: 1 }));
        }
    }, [show]);

    const handleLimitExceed = ({ message }) => toast.error(message);
    useQuillWordLimit({ quillRef, maxWords: MAX_WORDS, maxWordLength: MAX_WORD_LENGTH, onLimitExceed: handleLimitExceed, setValue, fieldName: 'note' });

    const onSubmit = data => {
        if (!data.project?.value) { toast.error('Project is required'); return; }
        if (!data.milestone?.value) { toast.error('Milestone is required'); return; }
        const body = {
            summary: data.summary, description: data.description,
            project: data.project.value, milestone: data.milestone.value,
            assignee: data.assignee?.value || undefined,
            reporter: data.reporter?.value || undefined,
            priority: data.priority, estimatedTime: data.estimatedTime,
            workType: data.workType, status: defaultStatus,
            startDate: data.startDate, dueDate: data.dueDate,
            attachments: files, projectType: dept,
        };
        dispatch(addClientTask(Object.fromEntries(
            Object.entries(body).filter(([_, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
        )));
    };

    const toOpt = (arr, idKey, lblKey) =>
        (arr || []).filter(i => i && i[idKey] && i[lblKey]).map(i => ({ value: String(i[idKey]), label: String(i[lblKey]) }));

    const pOpts = (Array.isArray(projectsList) ? projectsList : [])
        .filter((p) => p?._id && p?.name && isOngoingOrAmc(p))
        .map((p) => ({
            value: String(p._id),
            label: String(p.name),
            data: p,
        }));

    const mOpts = (clientMilestones || [])
        .filter((m) => m?._id && m?.title)
        .map((m) => ({
            value: String(m._id),
            label: String(m.title),
        }));

    const uOpts = toOpt(users, "_id", "name");

    const aOpts =
        projectAssignee.length > 0
            ? toOpt(projectAssignee, "_id", "name")
            : uOpts;

    const safeValue = v => v?.value ? { value: String(v.value), label: String(v.label || '') } : null;

    const priorityColor = {
        Critical: '#dc3545', High: '#fd7e14', Medium: '#198754', Low: '#0d6efd'
    };

    return (
        <Modal show={show} onHide={closeModal} backdrop="static" className="taskModal" centered size="xl">
            <Modal.Header className="py-2">
                <Modal.Title className="text-black fw-bold" style={{ fontSize: '14px' }}>Add Task</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-1 bg-light">
                    <div className="bg-white p-1 rounded-3 shadow-sm ctd-modal-body-inner">

                        {/* Basic Info */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1">
                                <i className="fas fa-info-circle me-1" />Basic Information
                            </h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Summary <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="form" type="text" placeholder="Enter Task Summary"
                                            {...register('summary', { required: true, pattern: /^[^\s].*$/ })} />
                                        {errors.summary?.type === 'required' && <span className="text-danger small">This field is required</span>}
                                        {errors.summary?.type === 'pattern' && <span className="text-danger small">Cannot start with empty space</span>}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Project Details */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1">
                                <i className="fas fa-project-diagram me-1" />Project Details
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Project <span className="text-danger">*</span></Form.Label>
                                        <Controller
                                            name="project"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={safeValue(field.value)}
                                                    options={pOpts}
                                                    placeholder="Select Project"
                                                    isClearable
                                                    isSearchable
                                                    styles={SS}
                                                    onChange={(opt) => {
                                                        field.onChange(opt);

                                                        setProjectSelected(opt?.value || null);

                                                        setProjectAssignee(
                                                            (opt?.data?.team || []).filter(
                                                                (u) => u?._id && u?.name
                                                            )
                                                        );

                                                        if (opt?.value) {
                                                            dispatch(getClientMilestones({ projectId: opt.value, page: 1, limit: 100 }));
                                                        }

                                                        setValue("milestone", null);
                                                    }}
                                                    onInputChange={(value, actionMeta) => {
                                                        if (actionMeta.action === "input-change") {
                                                            dispatch(
                                                                getAllProjects({
                                                                    skip: 1,
                                                                    limit: 100,
                                                                    search: value,
                                                                    status: true,
                                                                    projectStatus: 'ongoing_amc',
                                                                })
                                                            );
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        {errors.project && <span className="text-danger small">{errors.project.message}</span>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Milestone <span className="text-danger">*</span></Form.Label>
                                        <Controller name="milestone" control={control} defaultValue={null} rules={{ required: 'Milestone is required' }}
                                            render={({ field }) => (
                                                <Select
                                                    value={safeValue(field.value)}
                                                    onChange={opt => { field.onChange(opt); setMilestoneSelected(opt?.value || null); }}
                                                    options={mOpts} placeholder="Select Milestone"
                                                    isClearable isSearchable isDisabled={!projectSelected} styles={SS} />
                                            )} />
                                        {errors.milestone && <span className="text-danger small">{errors.milestone.message}</span>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Work Type <span className="text-danger">*</span></Form.Label>
                                        <Form.Select className="formSelect" {...register('workType', { required: true })}>
                                            <option value="" hidden>Select Work Type</option>
                                            <option value="Bug">Bug</option>
                                            <option value="Sprint">Sprint</option>
                                        </Form.Select>
                                        {errors.workType?.type === 'required' && <span className="text-danger small">Required</span>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Assignee</Form.Label>
                                        <Controller name="assignee" control={control} defaultValue={null}
                                            render={({ field }) => (
                                                <Select
                                                    value={safeValue(field.value)}
                                                    options={aOpts}
                                                    placeholder="Select Assignee"
                                                    isClearable
                                                    isSearchable
                                                    styles={SS}
                                                    noOptionsMessage={() => "No team members found."}
                                                    onChange={(opt) => field.onChange(opt || null)}
                                                    onInputChange={(value, actionMeta) => {
                                                        if (actionMeta.action === "input-change") {
                                                            dispatch(
                                                                getAllUsers({
                                                                    search: value,
                                                                    userType: dept,
                                                                })
                                                            );
                                                        }
                                                    }}
                                                />
                                            )} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Reporter <span className="text-danger">*</span></Form.Label>
                                        <Controller
                                            name="reporter"
                                            control={control}
                                            defaultValue={defaultOption}
                                            rules={{ required: "Reporter is required" }}
                                            render={({ field }) => (
                                                <Select
                                                    value={safeValue(field.value)}
                                                    options={[defaultOption, ...uOpts]}
                                                    placeholder="Select Reporter"
                                                    isClearable
                                                    isSearchable
                                                    styles={SS}
                                                    onChange={(opt) => field.onChange(opt || null)}
                                                    onInputChange={(value, actionMeta) => {
                                                        if (actionMeta.action === "input-change") {
                                                            dispatch(
                                                                getAllUsers({
                                                                    search: value,
                                                                    userType: dept,
                                                                })
                                                            );
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        {errors.reporter && <span className="text-danger small">{errors.reporter.message}</span>}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Task Config */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1">
                                <i className="fas fa-cogs me-1" />Task Configuration
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Priority</Form.Label>
                                        <Form.Select className="form" value={priority}
                                            {...register('priority', { required: true })}
                                            onChange={e => setPriority(e.target.value)}
                                            style={{ color: priorityColor[priority] || 'inherit' }}>
                                            {['Critical', 'High', 'Medium', 'Low'].map(p => (
                                                <option key={p} value={p} style={{ color: priorityColor[p] }}>{p}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Estimated Time (4 hrs max) <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="form" type="number" step="0.5" min="0" placeholder="Enter estimated hours"
                                            {...register('estimatedTime', {
                                                required: 'Required',
                                                min: { value: 0, message: 'Cannot be negative' },
                                                max: { value: 4, message: 'Max 4 hours' },
                                                pattern: { value: /^[0-9]*\.?[0-9]*$/, message: 'Invalid number' }
                                            })} />
                                        {errors.estimatedTime && <span className="text-danger small">{errors.estimatedTime.message}</span>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Start Date <span className="text-danger">*</span></Form.Label>
                                        <Controller name="startDate" control={control} rules={{ required: 'Start date is required' }}
                                            render={({ field }) => (
                                                <DatePicker selected={field.value} onChange={d => field.onChange(d)}
                                                    placeholderText="Select start date" className="form-control form" dateFormat="dd/MM/yyyy" />
                                            )} />
                                        {errors.startDate && <span className="text-danger small">{errors.startDate.message}</span>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className="mb-0 small">Due Date <span className="text-danger">*</span></Form.Label>
                                        <Controller name="dueDate" control={control} rules={{ required: 'Due date is required' }}
                                            render={({ field }) => (
                                                <DatePicker selected={field.value} onChange={d => field.onChange(d)}
                                                    minDate={watch('startDate')} placeholderText="Select due date"
                                                    className="form-control form" dateFormat="dd/MM/yyyy" />
                                            )} />
                                        {errors.dueDate && <span className="text-danger small">{errors.dueDate.message}</span>}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Additional Info */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1">
                                <i className="fas fa-paperclip me-1" />Additional Information
                            </h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className="mb-0 small">
                                            Attachments&nbsp;
                                            <i onClick={() => document.getElementById('ctd-file-input').click()}
                                                className="bi bi-plus-circle cp text-danger" />
                                        </Form.Label>
                                        <input type="file" id="ctd-file-input" className="d-none" multiple
                                            onChange={e => {
                                                const fs = Array.from(e.target.files);
                                                if (fs.some(f => f.size > 25 * 1024 * 1024)) { toast.error('Files must be < 25MB'); e.target.value = ''; return; }
                                                handleFileChange(e);
                                            }} />
                                        {filesUploading ? (
                                            <div className="ctd-file-list">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="placeholder placeholder-wave rounded-2" style={{ width: '100px', height: '28px' }} />
                                                ))}
                                            </div>
                                        ) : files.length > 0 && (
                                            <div className="ctd-file-list">
                                                {files.map((f, i) => (
                                                    <div key={i} className="ctd-file-item shadow-sm border">
                                                        <span className="me-2">{f.name?.length > 25 ? f.name.slice(0, 24) + '...' : f.name}</span>
                                                        <i onClick={() => setFiles(files.filter((_, x) => x !== i))}
                                                            className="bi bi-x-circle cp text-danger" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="mb-0 d-flex justify-content-between small align-items-center">
                                            Description
                                            <small className="text-muted">{(() => {
                                                const t = quillRef?.current?.getEditor()?.getText()?.trim();
                                                return `(${t?.split(/\s+/)?.filter(Boolean)?.length || 0} / ${MAX_WORDS} words)`;
                                            })()}</small>
                                        </Form.Label>
                                        <Controller name="description" control={control}
                                            render={({ field: { onChange, value } }) => (
                                                <ReactQuill ref={quillRef} value={value}
                                                    onChange={(c, _, s) => {
                                                        if (s === 'user') {
                                                            const t = quillRef.current.getEditor().getText().trim();
                                                            if (emojiRegex.test(t)) { quillRef.current.getEditor().history.undo(); return; }
                                                            if (t.split(/\s+/).filter(Boolean).length > MAX_WORDS) { quillRef.current.getEditor().history.undo(); toast.error(`Max ${MAX_WORDS} words`); return; }
                                                            onChange(c);
                                                        }
                                                    }}
                                                    theme="snow" placeholder="Enter detailed description here..."
                                                    className="ctd-quill-wrap"
                                                    modules={{ toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']] }} />
                                            )} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-outline-secondary fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={closeModal} type="button">Cancel</button>
                    <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} disabled={loading} onClick={() => setExit(false)}>
                        {loading ? 'Submitting...' : 'Create and Add Another'}
                    </button>
                    <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} disabled={loading} onClick={() => setExit(true)}>
                        {loading ? 'Submitting...' : 'Create and Exit'}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};


const ClientTaskDashboard = () => {
    const dispatch = useDispatch();
    const store = useSelector(s => s);
    const { control } = useForm();

    const projectsList = store?.getProject?.data?.data || store?.getProject?.data?.response?.projects || store?.getProject?.data || store?.getClientProjectsReducer?.data?.data || [];
    const clientMilestones = store?.getClientMilestonesReducer?.data?.data || [];
    const allTasks = store?.getClientTasksReducer?.data?.data || [];
    const tasksLoading = store?.getClientTasksReducer?.loading;
    const addStatus = store?.addClientTaskReducer?.data?.status;

    const [projectSelected, setProjectSelected] = useState(null);
    const [milestoneSelected, setMilestoneSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState('To Do');
    const [columns, setColumns] = useState({});
    const [localTasks, setLocalTasks] = useState([]);
    const [taskView, setTaskView] = useState('Board');

    useEffect(() => { dispatch(getAllProjects({ status: true, projectStatus: 'ongoing_amc', limit: 500, skip: 1 })); }, [dispatch]);

    useEffect(() => {
        const cols = {};
        COLS.forEach(s => { cols[s] = { title: s, color: COLCLR[s], items: [] }; });
        localTasks.forEach(t => {
            const s = t.status || 'To Do';
            if (cols[s]) cols[s].items.push(t);
        });
        setColumns(cols);
    }, [localTasks]);

    useEffect(() => { setLocalTasks(allTasks); }, [allTasks]);
    useEffect(() => { if (addStatus === 201) fetchTasks(); }, [addStatus]);

    const fetchTasks = (pId, mId) => {
        const pid = pId !== undefined ? pId : projectSelected;
        const mid = mId !== undefined ? mId : milestoneSelected;
        if (pid) dispatch(getClientTasks({ page: 1, limit: 200, projectId: pid || '', milestoneId: mid || '' }));
    };

    const handleProjectChange = opt => {
        setProjectSelected(opt?.value || null);
        setMilestoneSelected(null);
        if (opt?.value) {
            dispatch(getClientMilestones({ projectId: opt.value, page: 1, limit: 100 }));
            fetchTasks(opt.value, '');
        } else {
            setLocalTasks([]);
        }
    };

    const handleMilestoneChange = opt => {
        setMilestoneSelected(opt?.value || null);
        fetchTasks(projectSelected, opt?.value || '');
    };

    const handleDragOver = e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const task = localTasks.find(t => t._id === taskId);
        if (!task || task.status === newStatus) return;
        handleStatusChange(taskId, newStatus);
    };
    const handleStatusChange = (taskId, newStatus) => {
        setLocalTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        dispatch(updateClientTask({ taskId, body: { status: newStatus } }));
    };

    const filtered = {};
    COLS.forEach(s => {
        filtered[s] = {
            ...columns[s],
            items: (columns[s]?.items || []).filter(t =>
                !search.trim() ||
                t.summary?.toLowerCase().includes(search.toLowerCase()) ||
                t.assignee?.name?.toLowerCase().includes(search.toLowerCase())
            )
        };
    });

    const allFilteredTasks = COLS.flatMap(s => filtered[s]?.items || []);

    const pOpts = (Array.isArray(projectsList) ? projectsList : [])
        .filter((p) => p?._id && p?.name && isOngoingOrAmc(p))
        .map((p) => ({ value: String(p._id), label: String(p.name), data: p }));
    const mOpts = (clientMilestones || []).filter(m => m?._id && m?.title).map(m => ({ value: String(m._id), label: String(m.title) }));


    useEffect(() => {
        const validProjects = (Array.isArray(projectsList) ? projectsList : []).filter(isOngoingOrAmc);
        if (!projectSelected && validProjects.length > 0) {
            const firstProject = validProjects[0];

            setProjectSelected(firstProject._id);

            dispatch(
                getClientMilestones({
                    projectId: firstProject._id,
                    page: 1,
                    limit: 100,
                })
            );

            fetchTasks(firstProject._id, "");
        }
    }, [projectsList]);

    return (
        <div className="card ctd-page">
            <div className="card-body ctd-body">

                {/* Top bar */}
                <div className="ctd-topbar">
                    <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                        <div className="ctd-topbar-left">
                            <button
                                className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1 py-0 ctd-btn-add"
                                onClick={() => { setDefaultStatus('To Do'); setShowModal(true); }}>
                                <i className="bi bi-plus-circle" /> Add Task
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary ctd-btn-toggle"
                                onClick={() => setTaskView(v => v === 'List' ? 'Board' : 'List')}
                                title={taskView === 'List' ? 'Switch to Board view' : 'Switch to List view'}>
                                <i className={`bi ${taskView === 'List' ? 'bi-kanban' : 'bi-list-ul'}`} />
                            </button>
                        </div>
                        <div className="ctd-topbar-right">
                            <div className="ctd-select-wrap">

                                <Controller
                                    name="project"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            value={
                                                field.value ||
                                                (projectSelected
                                                    ? {
                                                        value: String(projectSelected),
                                                        label:
                                                            (Array.isArray(projectsList) ? projectsList : []).find(
                                                                p => String(p._id) === String(projectSelected)
                                                            )?.name || "",
                                                    }
                                                    : null)
                                            }
                                            options={pOpts}
                                            onChange={(opt) => {
                                                field.onChange(opt);
                                                handleProjectChange(opt);
                                            }}
                                            onInputChange={(v) =>
                                                v &&
                                                dispatch(
                                                    getAllProjects({
                                                        skip: 1,
                                                        limit: 100,
                                                        search: v,
                                                        status: true,
                                                        projectStatus: 'ongoing_amc',
                                                    })
                                                )
                                            }
                                            placeholder="Select Project"
                                            isSearchable
                                            isClearable
                                            styles={SS}
                                        />
                                    )}
                                />
                            </div>
                            <div className="ctd-select-wrap">
                                <Controller name="milestone" control={control} render={({ field }) => (
                                    <Select
                                        value={milestoneSelected
                                            ? { value: String(milestoneSelected), label: String(clientMilestones.find(m => m._id === milestoneSelected)?.title || '') }
                                            : null}
                                        options={mOpts}
                                        onChange={opt => { field.onChange(opt); handleMilestoneChange(opt); }}
                                        placeholder="Select Milestone" isSearchable isClearable
                                        isDisabled={!projectSelected} styles={SS} />
                                )} />
                            </div>
                            <div className="ctd-search-wrap">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search tasks..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)} />
                                {search && (
                                    <span className="ctd-search-clear" onClick={() => setSearch('')}>
                                        <i className="uil uil-times text-danger" />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {!projectSelected ? (
                    <div className="ctd-empty">
                        <div className="ctd-empty-inner">
                            <i className="bi bi-kanban fs-1 d-block mb-2" />
                            <p className="fs-5">Select a project to view the task board</p>
                        </div>
                    </div>
                ) : taskView === 'List' ? (
                    <ClientTaskListView tasks={allFilteredTasks} loading={tasksLoading} />
                ) : tasksLoading ? (
                    <div className="ctd-loading">
                        <div className="spinner-border text-dark" />
                    </div>
                ) : (
                    <Container>
                        <TaskColumnStyles className="task-page-columns-dash">
                            {COLS.map(status => {
                                const col = filtered[status] || { title: status, color: COLCLR[status], items: [] };
                                return (
                                    <div key={status} className="task-list-col">
                                        <KanbanColumn onDrop={e => handleDrop(e, status)} onDragOver={handleDragOver}>
                                            <ColTitle style={{ color: col.color }}>
                                                <span>{status}</span>
                                                <div className="d-flex align-items-center gap-1">
                                                    <span className="badge bg-primary text-white ctd-list-fs">{col.items.length}</span>

                                                </div>
                                            </ColTitle>
                                            <div className="ctd-col-body">
                                                {col.items.length === 0 ? (
                                                    <div className="ctd-col-no-tasks">
                                                        <div>
                                                            <i className="bi bi-inbox fs-2 d-block mb-2" />
                                                            <p className="small mb-0">No tasks</p>
                                                        </div>
                                                    </div>
                                                ) : col.items.map(task => (
                                                    <TaskCard key={task._id} item={task} onStatusChange={handleStatusChange} />
                                                ))}
                                            </div>
                                        </KanbanColumn>
                                    </div>
                                );
                            })}
                        </TaskColumnStyles>
                    </Container>
                )}

                <AddTaskModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    defaultStatus={defaultStatus} />
            </div>
        </div>
    );
};

export default ClientTaskDashboard;
