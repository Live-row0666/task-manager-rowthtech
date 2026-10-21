import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Form, Card, Nav, Modal } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import {
    getAllUsers,
    getprojectForTasks,
    getMilestoneForTaskAction,
    getSprintForTaskAction,
    addClientProject,
    addClientMilestone,
    addClientTask,
    getClientProjects,
    getClientMilestones,
} from '../../../redux/actions';
import { getAllTechnology } from '../../../redux/technology/action';
import { getClients } from '../../../redux/client/action';
import { handleUpload } from '../../../constants/handleUpload';
import { emojiRegex } from '../../../helpers/emojiRegex';
import useQuillWordLimit from '../../../helpers/quillWordLimit';

// ─── shared select styles (same as ProjectModal) ─────────────────────────────
const SS = {
    control: (b) => ({ ...b, minHeight: '30px', fontSize: '12px' }),
    valueContainer: (b) => ({ ...b, padding: '2px 8px', flexWrap: 'wrap' }),
    multiValue: (b) => ({ ...b, fontSize: '11px', margin: '1px' }),
    multiValueLabel: (b) => ({ ...b, fontSize: '11px', padding: '2px 6px' }),
    input: (b) => ({ ...b, margin: 0, fontSize: '12px' }),
    singleValue: (b) => ({ ...b, fontSize: '12px' }),
    placeholder: (b) => ({ ...b, fontSize: '12px' }),
    option: (b) => ({ ...b, fontSize: '12px' }),
    indicatorsContainer: (b) => ({ ...b, height: '30px' }),
    menu: (b) => ({ ...b, zIndex: 9999 }),
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — CLIENT PROJECT  (exact copy of ProjectModal form)
// ══════════════════════════════════════════════════════════════════════════════
const ClientProjectTab = () => {
    const dispatch   = useDispatch();
    const store      = useSelector((s) => s);
    const quillRef   = useRef(null);
    const MAX_WORDS  = 1000;
    const MAX_WORD_LENGTH = 45;
    const dept       = localStorage.getItem('selectedDepartment') || 'Tech';

    const users        = useSelector((s) => s?.getAllUsers?.data?.data) || [];
    const techData     = useSelector((s) => s?.getAllTechnologyReducer?.data?.data) || [];
    const clientsData  = useSelector((s) => s?.clientReducer?.clients);
    const clients      = useMemo(() => Array.isArray(clientsData) ? clientsData : [], [clientsData]);
    const technologies = useMemo(() => techData || [], [techData]);

    const loading   = store?.addClientProjectReducer?.loading;
    const addStatus = store?.addClientProjectReducer?.data?.status;

    const [startDate,   setStartDate]   = useState(null);
    const [endDate,     setEndDate]     = useState(null);
    const [amcStart,    setAmcStart]    = useState(null);
    const [amcEnd,      setAmcEnd]      = useState(null);
    const [amcType,     setAmcType]     = useState('');
    const [projStatus,  setProjStatus]  = useState('Ongoing');
    const [projType,    setProjType]    = useState('');
    const [selTech,     setSelTech]     = useState([]);
    const [selTeam,     setSelTeam]     = useState([]);
    const [selClients,  setSelClients]  = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [filesUploading, setFilesUploading] = useState(false);
    const [dependencies, setDependencies] = useState([]);

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm();
    const amcValue = watch('amcValue');

    useEffect(() => {
        dispatch(getAllUsers({ search: '', limit: 20, userType: dept }));
        dispatch(getAllTechnology({ status: true }));
        dispatch(getClients({ projectType: dept }));
    }, [dispatch, dept]);

    // auto-calc AMC end date
    useEffect(() => {
        if (amcStart && amcValue && amcType) {
            const d = new Date(amcStart);
            const v = parseInt(amcValue);
            if (amcType === 'Monthly') d.setMonth(d.getMonth() + v);
            else d.setFullYear(d.getFullYear() + v);
            setAmcEnd(d);
        }
    }, [amcStart, amcValue, amcType]);

    const resetAll = () => {
        reset(); setStartDate(null); setEndDate(null); setAmcStart(null); setAmcEnd(null);
        setAmcType(''); setProjStatus('Ongoing'); setProjType('');
        setSelTech([]); setSelTeam([]); setSelClients([]); setAttachments([]); setDependencies([]);
    };

    useEffect(() => { if (addStatus === 201) { resetAll(); } }, [addStatus]);

    const handleFileChange = async (e) => {
        for (const file of Array.from(e.target.files)) {
            if (file.size > 25 * 1024 * 1024) { toast.error('File must be < 25MB'); continue; }
            const res = await handleUpload(file, setFilesUploading);
            if (res) setAttachments(p => [...p, { name: file.name, url: res?.url?.split('?')[0] }]);
        }
    };

    const onSubmit = (data) => {
        const badDeps = dependencies.filter((d) => d.name.trim() && !d.rtl && !d.client);
        if (badDeps.length) { toast.error('Each dependency must have RTL or Client checked'); return; }
        const body = {
            name: data.projectName,
            description: data.description,
            client: selClients.map((c) => c.value),
            technology: selTech.map((t) => t.value),
            team: selTeam.map((u) => u.value),
            type: data.project_type,
            projectStatus: projStatus || 'Ongoing',
            projectType: projType || dept,
            lastStatus: data.lastStatus || '',
            documents: attachments,
            figmaLinks: (watch('figmaLinks') || []).filter((l) => l.title || l.url),
            documentLinks: (watch('documentLinks') || []).filter((l) => l.title || l.url),
            websites: (watch('websites') || []).filter((w) => w.title || w.url),
            dependencies: dependencies.filter((d) => d.name.trim()),
        };
        if (projStatus === 'Support') {
            body.amcType = { type: data.amcType, value: parseInt(data.amcValue) };
            body.amcStartDate = amcStart; body.amcEndDate = amcEnd;
            body.amcHours = parseFloat(data.amcHours) || 0;
        } else {
            body.start = startDate; body.end = endDate;
        }
        dispatch(addClientProject(body));
    };

    const techOpts   = technologies.map((t) => ({ label: t.name, value: t._id }));
    const teamOpts   = (users || []).map((u) => ({ label: u.name, value: u._id }));
    const clientOpts = clients.map((c) => ({ label: c.name, value: c._id }));

    const handleLimitExceed = ({ message }) => toast.error(message);
    useQuillWordLimit({ quillRef, maxWords: MAX_WORDS, maxWordLength: MAX_WORD_LENGTH, onLimitExceed: handleLimitExceed, setValue, fieldName: 'note' });

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white p-2 rounded-3 shadow-sm" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', overflowX: 'hidden' }}>

                {/* Basic Info */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-project-diagram me-2"></i>Basic Information</h6>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Project Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control className="form" type="text" placeholder="Enter project name"
                                    {...register('projectName', { required: true, validate: v => v.trim() !== '' || 'Required' })} />
                                {errors.projectName && <span className="text-danger small">{errors.projectName.message || 'Required'}</span>}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Client</Form.Label>
                                <Select isMulti options={clientOpts}
                                    value={clientOpts.filter(c => selClients.map(x=>x.value).includes(c.value))}
                                    onChange={(sel) => setSelClients(sel || [])}
                                    placeholder="Select clients..." styles={SS}
                                    onInputChange={(v, actionMeta) => {
                                        if (actionMeta?.action === "input-change") {
                                            dispatch(getClients({ search: v, projectType: dept }));
                                        }
                                    }} />
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Contract Type</Form.Label>
                                <Form.Select style={{ height: '30px', paddingTop: '5px', fontSize: '12px' }}
                                    {...register('project_type')} onChange={(e) => { if (e.target.value === 'AMC') { setProjStatus('Support'); setValue('projectStatus','Support'); } }}>
                                    <option value="">Select Type</option>
                                    <option value="T&M">T&M</option><option value="FC">FC</option>
                                    <option value="HR">HR</option><option value="AMC">AMC</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Project For</Form.Label>
                                <Form.Select style={{ height: '30px', paddingTop: '5px', fontSize: '12px' }}
                                    value={projType} onChange={(e) => setProjType(e.target.value)}>
                                    <option value="">Select Department</option>
                                    <option value="Tech">Tech</option><option value="Marketing">Marketing</option>
                                    <option value="Sales">Sales</option><option value="Freelance">Freelance</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Project Status</Form.Label>
                                <Form.Select style={{ height: '30px', paddingTop: '5px', fontSize: '12px' }}
                                    value={projStatus} {...register('projectStatus')} onChange={(e) => { setProjStatus(e.target.value); setValue('projectStatus', e.target.value); }}>
                                    <option value="Ongoing">Ongoing</option><option value="Support">AMC</option>
                                    <option value="Delivered">Delivered</option><option value="Hold">Hold</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Technologies</Form.Label>
                                <Select isMulti options={techOpts} value={selTech}
                                    onChange={(sel) => setSelTech(sel || [])} placeholder="Select technologies..." styles={SS}
                                    onInputChange={(v, actionMeta) => {
                                        if (actionMeta?.action === "input-change") {
                                            dispatch(getAllTechnology({ status: true, search: v }));
                                        }
                                    }} />
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Team Members</Form.Label>
                                <Select isMulti options={teamOpts} value={selTeam}
                                    onChange={(sel) => setSelTeam(sel || [])} placeholder="Select team members..." styles={SS}
                                    onInputChange={(v, actionMeta) => {
                                        if (actionMeta?.action === "input-change") {
                                            dispatch(getAllUsers({ search: v, limit: 20, userType: dept }));
                                        }
                                    }} />
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Last Status</Form.Label>
                                <Form.Control className="form" type="text" placeholder="e.g. In review" {...register('lastStatus')} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Timeline / AMC */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-calendar-alt me-2"></i>Timeline</h6>
                    {projStatus !== 'Support' ? (
                        <Row>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-0 small d-block">Start Date</Form.Label>
                                    <DatePicker selected={startDate} onChange={setStartDate} dateFormat="MM/yyyy" showMonthYearPicker placeholderText="MM/YYYY" className="form-control form" />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-0 small d-block">End Date</Form.Label>
                                    <DatePicker selected={endDate} onChange={setEndDate} minDate={startDate} disabled={!startDate} dateFormat="MM/yyyy" showMonthYearPicker placeholderText="MM/YYYY" className="form-control form" />
                                </Form.Group>
                            </Col>
                        </Row>
                    ) : (
                        <Row>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-0 small">AMC Type <span className="text-danger">*</span></Form.Label>
                                    <Form.Select style={{ height: '30px', paddingTop: '5px', fontSize: '12px' }}
                                        {...register('amcType', { required: projStatus === 'Support' })}
                                        onChange={(e) => { setAmcType(e.target.value); setValue('amcType', e.target.value); }}>
                                        <option value="">Select AMC Type</option>
                                        <option value="Monthly">Monthly</option><option value="Yearly">Yearly</option>
                                    </Form.Select>
                                    {errors.amcType && <span className="text-danger small">Required</span>}
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-0 small">AMC Tenure {amcType ? `(${amcType})` : ''} <span className="text-danger">*</span></Form.Label>
                                    <Form.Control className="form" type="number" placeholder="e.g. 12"
                                        {...register('amcValue', { required: projStatus === 'Support', min: 1 })} style={{ height: '30px' }} />
                                    {errors.amcValue && <span className="text-danger small">Required</span>}
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-0 small d-block">AMC Start Date <span className="text-danger">*</span></Form.Label>
                                    <DatePicker selected={amcStart} onChange={setAmcStart} placeholderText="Select start date" className="form-control form" dateFormat="dd/MM/yyyy" />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-0 small d-block">AMC End Date (auto)</Form.Label>
                                    <DatePicker selected={amcEnd} readOnly disabled placeholderText="Auto-calculated" className="form-control form" dateFormat="dd/MM/yyyy" />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-0 small">AMC Hours <span className="text-danger">*</span></Form.Label>
                                    <Form.Control className="form" type="number" step="0.01" placeholder="Enter AMC hours" style={{ height: '30px' }}
                                        {...register('amcHours', { required: projStatus === 'Support', min: 0.01 })} />
                                    {errors.amcHours && <span className="text-danger small">Required</span>}
                                </Form.Group>
                            </Col>
                        </Row>
                    )}
                </div>

                {/* External Links */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-link me-2"></i>External Links</h6>

                    {/* Figma Links */}
                    <div className="mb-3">
                        <div className="small fw-semibold mb-1">
                            Figma Links
                            <i onClick={() => { const c = watch('figmaLinks') || []; setValue('figmaLinks', [...c, { title: '', url: '' }]); }}
                                className="bi bi-plus-circle cp text-info ms-2" style={{ cursor: 'pointer' }} />
                        </div>
                        {(watch('figmaLinks') || []).map((_, i) => (
                            <Row key={i} className="mb-2 align-items-center">
                                <Col lg={5}><Form.Control className="form" type="text" placeholder="Title" {...register(`figmaLinks.${i}.title`)} /></Col>
                                <Col lg={6}><Form.Control className="form" type="url" placeholder="URL" {...register(`figmaLinks.${i}.url`)} /></Col>
                                <Col lg={1}><i onClick={() => { const c = [...(watch('figmaLinks') || [])]; c.splice(i, 1); setValue('figmaLinks', c); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} /></Col>
                            </Row>
                        ))}
                    </div>

                    {/* Document Links */}
                    <div className="mb-3">
                        <div className="small fw-semibold mb-1">
                            Document Links
                            <i onClick={() => { const c = watch('documentLinks') || []; setValue('documentLinks', [...c, { title: '', url: '' }]); }}
                                className="bi bi-plus-circle cp text-info ms-2" style={{ cursor: 'pointer' }} />
                        </div>
                        {(watch('documentLinks') || []).map((_, i) => (
                            <Row key={i} className="mb-2 align-items-center">
                                <Col lg={5}><Form.Control className="form" type="text" placeholder="Title" {...register(`documentLinks.${i}.title`)} /></Col>
                                <Col lg={6}><Form.Control className="form" type="url" placeholder="URL" {...register(`documentLinks.${i}.url`)} /></Col>
                                <Col lg={1}><i onClick={() => { const c = [...(watch('documentLinks') || [])]; c.splice(i, 1); setValue('documentLinks', c); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} /></Col>
                            </Row>
                        ))}
                    </div>

                    {/* Website Links */}
                    <div className="mb-2">
                        <div className="small fw-semibold mb-1">
                            Website Links
                            <i onClick={() => { const c = watch('websites') || []; setValue('websites', [...c, { title: '', url: '', creds: [] }]); }}
                                className="bi bi-plus-circle cp text-info ms-2" style={{ cursor: 'pointer' }} />
                        </div>
                        {(watch('websites') || []).map((w, wi) => (
                            <div key={wi} className="mb-3 p-2 border rounded">
                                <Row className="mb-2 align-items-center">
                                    <Col lg={5}><Form.Control className="form" type="text" placeholder="Website Title" {...register(`websites.${wi}.title`)} /></Col>
                                    <Col lg={5}><Form.Control className="form" type="url" placeholder="Website URL" {...register(`websites.${wi}.url`)} /></Col>
                                    <Col lg={2} className="d-flex gap-2">
                                        <i title="Add Credentials" onClick={() => { const c = watch('websites') || []; const u = [...c]; if (!u[wi].creds) u[wi].creds = []; u[wi].creds.push({ role: '', username: '', password: '' }); setValue('websites', u); }} className="bi bi-plus-circle cp text-info" style={{ cursor: 'pointer' }} />
                                        <i onClick={() => { const c = [...(watch('websites') || [])]; c.splice(wi, 1); setValue('websites', c); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} />
                                    </Col>
                                </Row>
                                {(watch(`websites.${wi}.creds`) || []).map((_, ci) => (
                                    <Row key={ci} className="mb-1 align-items-center ms-2">
                                        <Col lg={3}><Form.Control className="form" type="text" placeholder="Role" {...register(`websites.${wi}.creds.${ci}.role`)} /></Col>
                                        <Col lg={4}><Form.Control className="form" type="text" placeholder="Username" {...register(`websites.${wi}.creds.${ci}.username`)} /></Col>
                                        <Col lg={4}><Form.Control className="form" type="password" placeholder="Password" {...register(`websites.${wi}.creds.${ci}.password`)} /></Col>
                                        <Col lg={1}><i onClick={() => { const c = watch('websites') || []; const u = [...c]; u[wi].creds.splice(ci, 1); setValue('websites', u); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} /></Col>
                                    </Row>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dependencies */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small">
                        Dependencies
                        <i onClick={() => setDependencies([...dependencies, { name: '', provider: '', status: 'Pending', rtl: false, client: false, costInvolved: false, cost: '', notes: '' }])}
                            className="bi bi-plus-circle cp text-info ms-2" style={{ cursor: 'pointer' }} />
                    </h6>
                    {dependencies.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-bordered table-sm mb-0">
                                <thead className="table-light">
                                    <tr style={{ fontSize: '10px' }}>
                                        <th>Name</th><th>Provider</th><th>Status</th><th>RTL</th><th>Client</th><th>Cost?</th><th>Cost</th><th>Notes</th><th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dependencies.map((d, i) => (
                                        <tr key={i} style={{ fontSize: '11px' }}>
                                            <td><Form.Control size="sm" type="text" placeholder="Name" value={d.name} onChange={(e) => { const a = [...dependencies]; a[i].name = e.target.value; setDependencies(a); }} /></td>
                                            <td><Form.Control size="sm" type="text" placeholder="Provider" value={d.provider} onChange={(e) => { const a = [...dependencies]; a[i].provider = e.target.value; setDependencies(a); }} /></td>
                                            <td><Form.Select size="sm" value={d.status} onChange={(e) => { const a = [...dependencies]; a[i].status = e.target.value; setDependencies(a); }}><option value="Pending">Pending</option><option value="Done">Done</option></Form.Select></td>
                                            <td className="text-center"><Form.Check checked={d.rtl} onChange={(e) => { const a = [...dependencies]; a[i].rtl = e.target.checked; setDependencies(a); }} /></td>
                                            <td className="text-center"><Form.Check checked={d.client} onChange={(e) => { const a = [...dependencies]; a[i].client = e.target.checked; setDependencies(a); }} /></td>
                                            <td className="text-center"><Form.Check checked={d.costInvolved} onChange={(e) => { const a = [...dependencies]; a[i].costInvolved = e.target.checked; setDependencies(a); }} /></td>
                                            <td><Form.Control size="sm" type="text" placeholder="Cost" disabled={!d.costInvolved} value={d.cost} onChange={(e) => { const a = [...dependencies]; a[i].cost = e.target.value; setDependencies(a); }} /></td>
                                            <td><Form.Control size="sm" type="text" placeholder="Notes" value={d.notes} onChange={(e) => { const a = [...dependencies]; a[i].notes = e.target.value; setDependencies(a); }} /></td>
                                            <td><i onClick={() => setDependencies(dependencies.filter((_, x) => x !== i))} className="bi bi-trash cp text-danger" style={{ cursor: 'pointer' }} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Attachments + Notes */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-paperclip me-2"></i>Additional Information</h6>
                    <Row>
                        <Col lg={12}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">
                                    Attachments&nbsp;
                                    <i onClick={() => document.getElementById('cp-file-input').click()} className="bi bi-plus-circle cp text-info" style={{ cursor: 'pointer' }} />
                                </Form.Label>
                                <input type="file" id="cp-file-input" style={{ display: 'none' }} multiple onChange={handleFileChange} />
                                {filesUploading ? (
                                    <div className="d-flex flex-wrap gap-2 mt-1">{[...Array(3)].map((_, idx) => <div key={idx} className="placeholder placeholder-wave rounded-2" style={{ width: '100px', height: '28px' }} />)}</div>
                                ) : attachments.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                        {attachments.map((f, idx) => (
                                            <div key={idx} className="d-flex border shadow-sm p-1 px-2 align-items-center rounded" style={{ fontSize: '11px' }}>
                                                <span className="me-2">{f.name.length > 20 ? f.name.slice(0, 19) + '…' : f.name}</span>
                                                <i onClick={() => setAttachments(attachments.filter((_, x) => x !== idx))} className="bi bi-x-circle text-danger cp" style={{ cursor: 'pointer' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={12}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small d-flex justify-content-between">
                                    Notes
                                    <small className="text-muted">{(() => { const t = quillRef?.current?.getEditor()?.getText()?.trim(); const w = t?.split(/\s+/)?.filter(Boolean)?.length || 0; return `${w} / ${MAX_WORDS} words`; })()}</small>
                                </Form.Label>
                                <Controller name="description" control={control} render={({ field: { onChange, value } }) => (
                                    <ReactQuill ref={quillRef} value={value} onChange={(content, _, source) => {
                                        if (source === 'user') {
                                            const plain = quillRef.current.getEditor().getText().trim();
                                            if (emojiRegex.test(plain)) { quillRef.current.getEditor().history.undo(); return; }
                                            if (plain.split(/\s+/).filter(Boolean).length > MAX_WORDS) { quillRef.current.getEditor().history.undo(); toast.error(`Max ${MAX_WORDS} words`); return; }
                                            onChange(content);
                                        }
                                    }} theme="snow" placeholder="Enter notes..." style={{ height: '130px', marginBottom: '50px' }}
                                        modules={{ toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']] }} />
                                )} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={resetAll}>Reset</button>
                <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Client Project'}
                </button>
            </div>
        </Form>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — CLIENT MILESTONE  (exact copy of milestone create modal)
// ══════════════════════════════════════════════════════════════════════════════
const ClientMilestoneTab = () => {
    const dispatch   = useDispatch();
    const store      = useSelector((s) => s);
    const quillRef   = useRef(null);
    const MAX_WORDS  = 1000;
    const MAX_WORD_LENGTH = 45;
    const dept       = localStorage.getItem('selectedDepartment') || 'Tech';

    const clientProjects = store?.getClientProjectsReducer?.data?.data || [];
    const loading        = store?.addClientMilestoneReducer?.loading;
    const addStatus      = store?.addClientMilestoneReducer?.data?.status;

    const [selectedProject, setSelectedProject] = useState(null);
    const [startDate,   setStartDate]   = useState(null);
    const [endDate,     setEndDate]     = useState('');
    const [attachments, setAttachments] = useState([]);
    const [filesUploading, setFilesUploading] = useState(false);

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm();

    useEffect(() => {
        // Har baar tab open hone par fresh data fetch karo
        dispatch(getClientProjects({ page: 1, limit: 100 }));
    }, [dispatch]);

    const resetAll = () => { reset(); setSelectedProject(null); setStartDate(null); setEndDate(''); setAttachments([]); };

    useEffect(() => { if (addStatus === 201) { resetAll(); } }, [addStatus]);

    const handleFileChange = async (e) => {
        for (const file of Array.from(e.target.files)) {
            if (file.size > 25 * 1024 * 1024) { toast.error('File must be < 25MB'); continue; }
            const res = await handleUpload(file, setFilesUploading);
            if (res) setAttachments(p => [...p, { name: file.name, url: res?.url?.split('?')[0] }]);
        }
    };

    const onSubmit = (data) => {
        if (!selectedProject) { toast.error('Please select a project'); return; }
        if (!startDate)        { toast.error('Please select a start date'); return; }
        if (!endDate)          { toast.error('Please select an end date'); return; }
        const body = {
            project:        selectedProject.value,
            title:          data.Title,
            description:    data.description,
            startDate:      startDate,
            completionDate: endDate,
            status:         data.status,
            attachments:    attachments,
        };
        dispatch(addClientMilestone(body));
    };

    const projectOpts = clientProjects.map((p) => ({ value: p._id, label: p.name }));

    const handleLimitExceed = ({ message }) => toast.error(message);
    useQuillWordLimit({ quillRef, maxWords: MAX_WORDS, maxWordLength: MAX_WORD_LENGTH, onLimitExceed: handleLimitExceed, setValue, fieldName: 'note' });

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white p-2 rounded-3 shadow-sm" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', overflowX: 'hidden' }}>

                {/* Basic Info */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-info-circle me-2"></i>Basic Information</h6>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Client Project <span className="text-danger">*</span></Form.Label>
                                <Select options={projectOpts} value={selectedProject} onChange={setSelectedProject}
                                    placeholder="Select Client Project" isClearable isSearchable styles={SS}
                                    onInputChange={(v, actionMeta) => {
                                        if (actionMeta?.action === "input-change") {
                                            dispatch(getClientProjects({ page: 1, limit: 100, search: v, projectType: dept }));
                                        }
                                    }} />
                                {!selectedProject && <span className="text-muted" style={{ fontSize: '10px' }}>Select a client project first</span>}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Milestone Name <span className="text-danger">*</span></Form.Label>
                                <Form.Control className="form" type="text" placeholder="Enter milestone name"
                                    {...register('Title', { required: true, pattern: /^[^\s].*$/ })} />
                                {errors.Title?.type === 'required' && <span className="text-danger small">This field is required</span>}
                                {errors.Title?.type === 'pattern' && <span className="text-danger small">Cannot start with space</span>}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Status <span className="text-danger">*</span></Form.Label>
                                <Form.Select className="formSelect" {...register('status', { required: true })} defaultValue="Not Started">
                                    {['Not Started', 'In Progress', 'Completed', 'Delayed'].map((s) => <option key={s} value={s}>{s}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Timeline */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-calendar-alt me-2"></i>Timeline</h6>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small d-block">Start Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" className="form"
                                    value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setStartDate(new Date(e.target.value))} required style={{ cursor: 'pointer' }} />
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small d-block">End Date <span className="text-danger">*</span></Form.Label>
                                <Form.Control type="date" className="form" value={endDate || ''}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).toISOString().split('T')[0] : undefined}
                                    disabled={!startDate} required style={{ cursor: 'pointer' }} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Details */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small"><i className="fas fa-file-alt me-2"></i>Details</h6>
                    <Row>
                        <Col lg={12}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">
                                    Attachments&nbsp;
                                    <i onClick={() => document.getElementById('cm-file-input').click()} className="bi bi-plus-circle cp text-danger" style={{ cursor: 'pointer' }} />
                                </Form.Label>
                                <input type="file" id="cm-file-input" style={{ display: 'none' }} multiple onChange={handleFileChange} />
                                {filesUploading ? (
                                    <div className="d-flex flex-wrap gap-2 mt-1">{[...Array(3)].map((_, idx) => <div key={idx} className="placeholder placeholder-wave rounded-2" style={{ width: '100px', height: '28px' }} />)}</div>
                                ) : attachments.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                        {attachments.map((f, idx) => (
                                            <div key={idx} className="d-flex border shadow-sm p-1 px-2 align-items-center rounded" style={{ fontSize: '11px' }}>
                                                <span className="me-2">{f.name.length > 20 ? f.name.slice(0, 19) + '…' : f.name}</span>
                                                <i onClick={() => setAttachments(attachments.filter((_, x) => x !== idx))} className="bi bi-x-circle text-danger cp" style={{ cursor: 'pointer' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={12}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small d-flex justify-content-between">
                                    Description
                                    <small className="text-muted">{(() => { const t = quillRef?.current?.getEditor()?.getText()?.trim(); const w = t?.split(/\s+/)?.filter(Boolean)?.length || 0; return `${w} / ${MAX_WORDS} words`; })()}</small>
                                </Form.Label>
                                <Controller name="description" control={control} render={({ field: { onChange, value } }) => (
                                    <ReactQuill ref={quillRef} value={value} onChange={(content, _, source) => {
                                        if (source === 'user') {
                                            const plain = quillRef.current.getEditor().getText().trim();
                                            if (emojiRegex.test(plain)) { quillRef.current.getEditor().history.undo(); return; }
                                            if (plain.split(/\s+/).filter(Boolean).length > MAX_WORDS) { quillRef.current.getEditor().history.undo(); toast.error(`Max ${MAX_WORDS} words`); return; }
                                            onChange(content);
                                        }
                                    }} theme="snow" placeholder="Enter description..." style={{ height: '130px', marginBottom: '50px' }}
                                        modules={{ toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['link'], ['clean']] }} />
                                )} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={resetAll}>Reset</button>
                <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Client Milestone'}
                </button>
            </div>
        </Form>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — CLIENT TASK  (exact copy of AllPagesRightbar task form)
// ══════════════════════════════════════════════════════════════════════════════
const ClientTaskTab = () => {
    const dispatch  = useDispatch();
    const store     = useSelector((s) => s);
    const dept      = localStorage.getItem('selectedDepartment') || 'Tech';
    const authUser  = store?.Auth?.user;

    const clientProjects    = store?.getClientProjectsReducer?.data?.data || [];
    const clientMilestones  = store?.getClientMilestonesReducer?.data?.data || [];
    const users            = store?.getAllUsers?.data?.data || [];
    const loading          = store?.addClientTaskReducer?.loading;
    const addStatus        = store?.addClientTaskReducer?.data?.status;

    const [selProject,      setSelProject]      = useState(null);
    const [selMilestone,    setSelMilestone]    = useState(null);
    const [projectAssignee, setProjectAssignee] = useState([]);
    const [startDate,       setStartDate]       = useState(null);
    const [dueDate,         setDueDate]         = useState(null);
    const [files,           setFiles]           = useState([]);
    const [filesUploading,  setFilesUploading]  = useState(false);
    const [priority,        setPriority]        = useState('Medium');

    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
    const workTypes       = ['Bug', 'Sprint'];

    const defaultOption = { value: authUser?.id, label: `You (${authUser?.name || JSON.parse(localStorage.getItem('hyper_user') || '{}')?.username || ''})` };

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors } } = useForm({ defaultValues: { priority: 'Medium', reporter: defaultOption } });

    useEffect(() => {
        dispatch(getClientProjects({ page: 1, limit: 100 }));
        dispatch(getAllUsers({ userType: dept }));
    }, [dispatch, dept]);

    const resetAll = () => {
        reset({ priority: 'Medium', reporter: defaultOption });
        setSelProject(null); setSelMilestone(null); setProjectAssignee([]);
        setStartDate(null); setDueDate(null); setFiles([]); setPriority('Medium');
    };

    useEffect(() => { if (addStatus === 201) { resetAll(); } }, [addStatus]);

    const handleFileChange = async (e) => {
        for (const file of Array.from(e.target.files)) {
            if (file.size > 25 * 1024 * 1024) { toast.error('File must be < 25MB'); e.target.value = ''; return; }
            const res = await handleUpload(file, setFilesUploading);
            if (res) setFiles(p => [...p, { name: file.name, url: res?.url?.split('?')[0] }]);
        }
    };

    const onSubmit = (data) => {
        if (!selProject)   { toast.error('Please select a project');   return; }
        if (!selMilestone) { toast.error('Please select a milestone'); return; }
        const body = {
            summary:       data.summary,
            description:   data.description,
            project:       selProject.value,
            milestone:     selMilestone.value,
            assignee:      data.assignee?.value || undefined,
            reporter:      data.reporter?.value || undefined,
            priority:      data.priority,
            estimatedTime: data.estimatedTime,
            workType:      data.workType,
            startDate:     startDate,
            dueDate:       dueDate,
            attachments:   files,
            projectType:   dept,
        };
        dispatch(addClientTask(body));
    };

    const projectOpts   = clientProjects.map((p) => ({ value: p._id, label: p.name, data: p }));
    const milestoneOpts = clientMilestones.map((m) => ({ value: m._id, label: m.title }));
    const userOpts      = (users || []).map((u) => ({ value: u._id, label: u.name }));
    const assigneeOpts  = projectAssignee.length > 0 ? projectAssignee.map((u) => ({ value: u._id, label: u.name })) : userOpts;

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white p-2 rounded-3 shadow-sm" style={{ maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', overflowX: 'hidden' }}>

                {/* Basic Info */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-1 border-bottom pb-1 small"><i className="fas fa-info-circle me-1"></i>Basic Information</h6>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Summary <span className="text-danger">*</span></Form.Label>
                                <Form.Control className="form" type="text" placeholder="Enter Task Summary"
                                    {...register('summary', { required: true, pattern: /^[^\s].*$/ })} />
                                {errors.summary?.type === 'required' && <span className="text-danger small">This field is required</span>}
                                {errors.summary?.type === 'pattern' && <span className="text-danger small">Cannot start with space</span>}
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Project Details */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-1 border-bottom pb-1 small"><i className="fas fa-project-diagram me-1"></i>Project Details</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Client Project <span className="text-danger">*</span></Form.Label>
                                <Select options={projectOpts} value={selProject}
                                    onChange={(opt) => {
                                        setSelProject(opt);
                                        setSelMilestone(null);
                                        setProjectAssignee(opt?.data?.team || []);
                                        if (opt?.value) dispatch(getClientMilestones({ projectId: opt.value, page: 1, limit: 100 }));
                                    }}
                                    onInputChange={(v, actionMeta) => {
                                        if (actionMeta?.action === "input-change") {
                                            dispatch(getClientProjects({ page: 1, limit: 100, search: v, projectType: dept }));
                                        }
                                    }}
                                    placeholder="Select Client Project" isClearable isSearchable styles={SS} />                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Client Milestone <span className="text-danger">*</span></Form.Label>
                                <Select options={milestoneOpts} value={selMilestone}
                                    onChange={setSelMilestone}
                                    placeholder="Select Milestone" isClearable isSearchable
                                    isDisabled={!selProject} styles={SS} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Work Type <span className="text-danger">*</span></Form.Label>
                                <Form.Select className="formSelect" {...register('workType', { required: true })}>
                                    <option value="" hidden>Select Work Type</option>
                                    {workTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                </Form.Select>
                                {errors.workType && <span className="text-danger small">This field is required</span>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Assignee</Form.Label>
                                <Controller name="assignee" control={control} defaultValue={null} render={({ field }) => (
                                    <Select {...field} options={assigneeOpts} placeholder="Select Assignee" isClearable isSearchable
                                        noOptionsMessage={() => 'No team members found. Add team to project first.'} styles={SS} />
                                )} />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Reporter <span className="text-danger">*</span></Form.Label>
                                <Controller name="reporter" control={control} defaultValue={defaultOption}
                                    rules={{ required: 'Reporter is required' }}
                                    render={({ field }) => (
                                        <Select {...field} options={[defaultOption, ...userOpts]}
                                            onInputChange={(v, actionMeta) => {
                                                if (actionMeta?.action === "input-change") {
                                                    dispatch(getAllUsers({ search: v, userType: dept }));
                                                }
                                            }}
                                            placeholder="Select Reporter" isClearable isSearchable styles={SS} />
                                    )} />
                                {errors.reporter && <span className="text-danger small">{errors.reporter.message}</span>}
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Task Config */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-1 border-bottom pb-1 small"><i className="fas fa-cogs me-1"></i>Task Configuration</h6>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Priority</Form.Label>
                                <Form.Select className="form" value={priority} {...register('priority', { required: true })}
                                    onChange={(e) => setPriority(e.target.value)}
                                    style={{ color: priority === 'Critical' ? '#dc3545' : priority === 'High' ? '#fd7e14' : priority === 'Medium' ? '#198754' : '#0d6efd' }}>
                                    {priorityOptions.map((p) => <option key={p} value={p} style={{ color: p === 'Critical' ? '#dc3545' : p === 'High' ? '#fd7e14' : p === 'Medium' ? '#198754' : '#0d6efd' }}>{p}</option>)}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">Estimated Time (4 hrs max) <span className="text-danger">*</span></Form.Label>
                                <Form.Control className="form" type="number" step="0.5" min="0" placeholder="Enter estimated hours"
                                    {...register('estimatedTime', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' }, max: { value: 4, message: 'Max 4 hours' }, pattern: { value: /^[0-9]*\.?[0-9]*$/, message: 'Invalid number' } })} />
                                {errors.estimatedTime && <span className="text-danger small">{errors.estimatedTime.message}</span>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small d-block">Start Date <span className="text-danger">*</span></Form.Label>
                                <Controller name="startDate" control={control} rules={{ required: 'Start date is required' }}
                                    render={({ field }) => (
                                        <DatePicker selected={field.value} onChange={(d) => { field.onChange(d); setStartDate(d); }}
                                            placeholderText="Select start date" className="form-control form" dateFormat="dd/MM/yyyy" />
                                    )} />
                                {errors.startDate && <span className="text-danger small">{errors.startDate.message}</span>}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small d-block">Due Date <span className="text-danger">*</span></Form.Label>
                                <Controller name="dueDate" control={control} rules={{ required: 'Due date is required' }}
                                    render={({ field }) => (
                                        <DatePicker selected={field.value} onChange={(d) => { field.onChange(d); setDueDate(d); }}
                                            minDate={startDate} placeholderText="Select due date" className="form-control form" dateFormat="dd/MM/yyyy" />
                                    )} />
                                {errors.dueDate && <span className="text-danger small">{errors.dueDate.message}</span>}
                            </Form.Group>
                        </Col>
                    </Row>
                </div>

                {/* Attachments + Description */}
                <div className="mb-2">
                    <h6 className="text-dark fw-bold mb-1 border-bottom pb-1 small"><i className="fas fa-paperclip me-1"></i>Additional Information</h6>
                    <Row>
                        <Col md={12}>
                            <Form.Group className="mb-1">
                                <Form.Label className="mb-0 small">
                                    Attachments&nbsp;
                                    <i onClick={() => document.getElementById('ct-file-input').click()} className="bi bi-plus-circle cp text-danger" style={{ cursor: 'pointer' }} />
                                </Form.Label>
                                <input type="file" id="ct-file-input" style={{ display: 'none' }} multiple
                                    onChange={(e) => { const f = Array.from(e.target.files); if (f.some(x => x.size > 25 * 1024 * 1024)) { toast.error('Files must be < 25MB'); e.target.value = ''; return; } handleFileChange(e); }} />
                                {filesUploading ? (
                                    <div className="d-flex flex-wrap gap-2 mt-1">{[...Array(3)].map((_, idx) => <div key={idx} className="placeholder placeholder-wave rounded-2" style={{ width: '100px', height: '28px' }} />)}</div>
                                ) : files.length > 0 && (
                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                        {files.map((f, idx) => (
                                            <div key={idx} className="d-flex border shadow-sm p-1 px-2 align-items-center rounded" style={{ fontSize: '11px' }}>
                                                <span className="me-2">{f.name.length > 20 ? f.name.slice(0, 19) + '…' : f.name}</span>
                                                <i onClick={() => setFiles(files.filter((_, x) => x !== idx))} className="bi bi-x-circle text-danger cp" style={{ cursor: 'pointer' }} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={12}>
                            <Form.Group className="mb-2">
                                <Form.Label className="mb-0 small">Description</Form.Label>
                                <Form.Control className="form" as="textarea" rows={3} placeholder="Enter task description" {...register('description')} />
                            </Form.Group>
                        </Col>
                    </Row>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-outline-secondary fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={resetAll}>Reset</button>
                <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Client Task'}
                </button>
            </div>
        </Form>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
const QuickAdd = () => {
    const [activeTab, setActiveTab] = useState('project');

    const tabs = [
        { key: 'project',   label: 'Client Project',   icon: 'uil-home' },
        { key: 'milestone', label: 'Client Milestone',  icon: 'uil-layers-alt' },
        { key: 'task',      label: 'Client Task',       icon: 'uil-clipboard-notes' },
    ];

    return (
        <div className="container-fluid pt-3">
            <div className="mb-3">
                <h4 className="fw-bold text-dark mb-0">Client Panel</h4>
                <p className="text-muted small mb-0">Create a client project, milestone or task — saved to separate collections</p>
            </div>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    {/* Tabs header */}
                    <div style={{ borderBottom: '1px solid #dee2e6', backgroundColor: '#fff', borderRadius: '0.375rem 0.375rem 0 0' }}>
                        <div className="d-flex" style={{ gap: 0 }}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        padding: '10px 24px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        border: 'none',
                                        borderBottom: activeTab === tab.key ? '2px solid #212529' : '2px solid transparent',
                                        backgroundColor: 'transparent',
                                        color: activeTab === tab.key ? '#212529' : '#6c757d',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'color 0.15s, border-color 0.15s',
                                        marginBottom: '-1px',
                                    }}
                                >
                                    <i className={`${tab.icon} me-2`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="p-3">
                        {activeTab === 'project'   && <ClientProjectTab />}
                        {activeTab === 'milestone' && <ClientMilestoneTab />}
                        {activeTab === 'task'      && <ClientTaskTab />}
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default QuickAdd;
