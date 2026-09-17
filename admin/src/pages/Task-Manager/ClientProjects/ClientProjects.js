import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table, Form, Modal, Row, Col } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import moment from 'moment';
import Multiselect from 'multiselect-react-dropdown';

import { addClientProject, getClientProjects, getAllUsers } from '../../../redux/actions';
import { getAllTechnology } from '../../../redux/technology/action';
import { getClients } from '../../../redux/client/action';

// ─── shared select styles ─────────────────────────────────────────────────────
const SS = {
    control: (b) => ({ ...b, minHeight: '32px', fontSize: '12px' }),
    valueContainer: (b) => ({ ...b, padding: '2px 8px' }),
    multiValue: (b) => ({ ...b, fontSize: '11px' }),
    input: (b) => ({ ...b, margin: 0, fontSize: '12px' }),
    singleValue: (b) => ({ ...b, fontSize: '12px' }),
    placeholder: (b) => ({ ...b, fontSize: '12px' }),
    option: (b) => ({ ...b, fontSize: '12px' }),
    indicatorsContainer: (b) => ({ ...b, height: '32px' }),
    menu: (b) => ({ ...b, zIndex: 9999 }),
};

// ══════════════════════════════════════════════════════════════════════════════
// ADD / EDIT MODAL
// ══════════════════════════════════════════════════════════════════════════════
const ClientProjectModal = ({ show, onHide, editData = null }) => {
    const dispatch = useDispatch();
    const store = useSelector((s) => s);
    const dept = localStorage.getItem('selectedDepartment') || 'Tech';

    const users = store?.getAllUsers?.data?.data || [];
    const techData = store?.getAllTechnologyReducer?.data?.data || [];
    const clientsData = store?.clientReducer?.clients;
    const clients = Array.isArray(clientsData) ? clientsData : [];
    const loading = store?.addClientProjectReducer?.loading;
    const addStatus = store?.addClientProjectReducer?.data?.status;

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [amcStart, setAmcStart] = useState(null);
    const [amcEnd, setAmcEnd] = useState(null);
    const [amcType, setAmcType] = useState('');
    const [projStatus, setProjStatus] = useState('Ongoing');
    const [projType, setProjType] = useState('');
    const [selTech, setSelTech] = useState([]);
    const [selTeam, setSelTeam] = useState([]);
    const [selClients, setSelClients] = useState([]);
    const [dependencies, setDependencies] = useState([]);

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
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

    // populate edit data
    useEffect(() => {
        if (show && editData) {
            setValue('projectName', editData.name || '');
            setValue('project_type', editData.type || '');
            setValue('projectFor', editData.projectType || '');
            setValue('lastStatus', editData.lastStatus || '');
            setValue('description', editData.description || '');
            setValue('figmaLinks', editData.figmaLinks || []);
            setValue('documentLinks', editData.documentLinks || []);
            setValue('websites', editData.websites || []);
            setProjStatus(editData.projectStatus || 'Ongoing');
            setProjType(editData.projectType || '');
            setStartDate(editData.start ? new Date(editData.start) : null);
            setEndDate(editData.end ? new Date(editData.end) : null);
            setAmcStart(editData.amcStartDate ? new Date(editData.amcStartDate) : null);
            setAmcEnd(editData.amcEndDate ? new Date(editData.amcEndDate) : null);
            setAmcType(editData.amcType?.type || '');
            setValue('amcType', editData.amcType?.type || '');
            setValue('amcValue', editData.amcType?.value || '');
            setValue('amcHours', editData.amcHours || '');
            setSelTech(
                (editData?.technology || []).map((t) => ({
                    value: t?._id || t,
                    label: typeof t?.name === "string" ? t.name : "",
                }))
            );
            setSelTeam(editData.team?.map(u => ({ value: u._id || u, label: u.name || u })) || []);
            setSelClients(editData.client?.map(c => ({ value: c._id || c, label: c.name || c })) || []);
            setDependencies(editData.dependencies || []);
        } else if (show && !editData) {
            resetAll();
            setValue('figmaLinks', []);
            setValue('documentLinks', []);
            setValue('websites', []);
        }
    }, [show, editData]);

    const resetAll = () => {
        reset(); setStartDate(null); setEndDate(null); setAmcStart(null); setAmcEnd(null);
        setAmcType(''); setProjStatus('Ongoing'); setProjType('');
        setSelTech([]); setSelTeam([]); setSelClients([]); setDependencies([]);
    };

    useEffect(() => {
        if (addStatus === 201) {
            onHide();
            dispatch(getClientProjects({ page: 1, limit: 100 }));
        }
    }, [addStatus]);

    const onSubmit = (data) => {
        const badDeps = dependencies.filter((d) => d.name.trim() && !d.rtl && !d.client);
        if (badDeps.length) { toast.error('Each dependency needs RTL or Client checked'); return; }
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
            dependencies: dependencies.filter((d) => d.name.trim()),
            figmaLinks: (data.figmaLinks || []).filter(l => l.title || l.url),
            documentLinks: (data.documentLinks || []).filter(l => l.title || l.url),
            websites: (data.websites || []).filter(w => w.title || w.url),
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

    console.log(techData, "techData")
    const techOpts = (techData || []).map((item) => ({
        value: item?._id,
        label: String(item?.name || ""),
    }));
    const teamOpts = (users || []).map((u) => ({
        value: u._id,
        label:
            typeof u.name === "string"
                ? u.name
                : typeof u.username === "string"
                    ? u.username
                    : typeof u.fullName === "string"
                        ? u.fullName
                        : JSON.stringify(u.name || ""),
    }));
    const clientOpts = (clients || []).map((c) => ({
        value: c._id,
        label: String(c?.name ?? ""),
    }));
    const updDep = (i, k, v) => { const a = [...dependencies]; a[i][k] = v; setDependencies(a); };

    return (
        <Modal show={show} onHide={onHide} size="xl" backdrop="static" className="taskModal">
            <Modal.Header className="py-2">
                <Modal.Title className="text-black fw-bold" style={{ fontSize: '14px' }}>
                    {editData ? 'Update Client Project' : 'Create Client Project'}
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-1" style={{ backgroundColor: '#f8f9fa' }}>
                    <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', overflowX: 'hidden' }}>
                        <div className="bg-white p-3 rounded-3 shadow-sm">

                            {/* Basic Info */}
                            <div className="mb-3">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small">
                                    <i className="fas fa-project-diagram me-2"></i>Basic Information
                                </h6>
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
                                            <Select
                                                isMulti
                                                options={clientOpts}
                                                value={selClients}
                                                onChange={(sel) => setSelClients(sel || [])}
                                                placeholder="Select clients..."
                                                styles={SS}
                                                getOptionLabel={(option) => option.label}
                                                getOptionValue={(option) => option.value}
                                                onInputChange={(value) => {
                                                    dispatch(getClients({ search: value }));
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className="mb-0 small">Contract Type</Form.Label>
                                            <Form.Select style={{ height: '32px', paddingTop: '5px', fontSize: '12px' }} {...register('project_type')}>
                                                <option value="">Select Type</option>
                                                <option value="T&M">T&M</option><option value="FC">FC</option>
                                                <option value="HR">HR</option><option value="AMC">AMC</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className="mb-0 small">Project For (Department)</Form.Label>
                                            <Form.Select style={{ height: '32px', paddingTop: '5px', fontSize: '12px' }}
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
                                            <Form.Select style={{ height: '32px', paddingTop: '5px', fontSize: '12px' }}
                                                value={projStatus} onChange={(e) => setProjStatus(e.target.value)}>
                                                <option value="Ongoing">Ongoing</option>
                                                <option value="Support">AMC (Support)</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Hold">Hold</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className="mb-0 small">Last Status</Form.Label>
                                            <Form.Control className="form" type="text" placeholder="e.g. In review" {...register('lastStatus')} />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className="mb-0 small">Technologies</Form.Label>

                                            <Select
                                                isMulti
                                                options={techOpts}
                                                value={selTech}
                                                onChange={(sel) => setSelTech(sel || [])}
                                                placeholder="Select technologies..."
                                                styles={SS}
                                                getOptionLabel={(option) => String(option.label)}
                                                getOptionValue={(option) => String(option.value)}
                                                onInputChange={(inputValue, actionMeta) => {
                                                    if (actionMeta.action === "input-change") {
                                                        dispatch(
                                                            getAllTechnology({
                                                                status: true,
                                                                search: inputValue,
                                                            })
                                                        );
                                                    }

                                                    return inputValue;
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className="mb-0 small">Team Members</Form.Label>
                                            <Select
                                                isMulti
                                                options={teamOpts}
                                                value={selTeam}
                                                onChange={(sel) => setSelTeam(sel || [])}
                                                placeholder="Select team..."
                                                styles={SS}
                                                getOptionLabel={(option) => option.label}
                                                getOptionValue={(option) => option.value}
                                                onInputChange={(value) => {
                                                    dispatch(
                                                        getAllUsers({
                                                            search: value,
                                                            limit: 20,
                                                            userType: dept,
                                                        })
                                                    );
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className="mb-0 small">Description</Form.Label>
                                            <Form.Control as="textarea" rows={2} placeholder="Enter description" {...register('description')} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* Timeline / AMC */}
                            <div className="mb-3">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small">
                                    <i className="fas fa-calendar-alt me-2"></i>Timeline
                                </h6>
                                {projStatus !== 'Support' ? (
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="mb-0 small d-block">Start Date</Form.Label>
                                                <DatePicker selected={startDate} onChange={setStartDate}
                                                    dateFormat="MM/yyyy" showMonthYearPicker placeholderText="MM/YYYY" className="form-control form" />
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="mb-0 small d-block">End Date</Form.Label>
                                                <DatePicker selected={endDate} onChange={setEndDate} minDate={startDate}
                                                    disabled={!startDate} dateFormat="MM/yyyy" showMonthYearPicker placeholderText="MM/YYYY" className="form-control form" />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                ) : (
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="mb-0 small">AMC Type <span className="text-danger">*</span></Form.Label>
                                                <Form.Select style={{ height: '32px', fontSize: '12px' }}
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
                                                <Form.Control className="form" type="number" placeholder="e.g. 12" style={{ height: '32px' }}
                                                    {...register('amcValue', { required: projStatus === 'Support', min: 1 })} />
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="mb-0 small d-block">AMC Start Date <span className="text-danger">*</span></Form.Label>
                                                <DatePicker selected={amcStart} onChange={setAmcStart}
                                                    placeholderText="Select date" className="form-control form" dateFormat="dd/MM/yyyy" />
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="mb-0 small d-block">AMC End Date (auto)</Form.Label>
                                                <DatePicker selected={amcEnd} readOnly disabled
                                                    placeholderText="Auto-calculated" className="form-control form" dateFormat="dd/MM/yyyy" />
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className="mb-0 small">AMC Hours <span className="text-danger">*</span></Form.Label>
                                                <Form.Control className="form" type="number" step="0.01" placeholder="Enter hours" style={{ height: '32px' }}
                                                    {...register('amcHours', { required: projStatus === 'Support', min: 0.01 })} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                            </div>

                            {/* External Links */}
                            <div className="mb-3">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1 small">
                                    <i className="fas fa-link me-2"></i>External Links
                                </h6>

                                {/* Figma Links */}
                                <div className="mb-2">
                                    <div className="small fw-semibold mb-1">Figma Links
                                        <i onClick={() => { const c = watch('figmaLinks') || []; setValue('figmaLinks', [...c, { title: '', url: '' }]); }}
                                            className="bi bi-plus-circle cp text-info ms-2" style={{ cursor: 'pointer' }} />
                                    </div>
                                    {(watch('figmaLinks') || []).map((_, i) => (
                                        <Row key={i} className="mb-1 align-items-center">
                                            <Col lg={5}><Form.Control size="sm" type="text" placeholder="Title" {...register(`figmaLinks.${i}.title`)} /></Col>
                                            <Col lg={6}><Form.Control size="sm" type="url" placeholder="URL" {...register(`figmaLinks.${i}.url`)} /></Col>
                                            <Col lg={1}><i onClick={() => { const c = [...(watch('figmaLinks') || [])]; c.splice(i, 1); setValue('figmaLinks', c); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} /></Col>
                                        </Row>
                                    ))}
                                </div>

                                {/* Document Links */}
                                <div className="mb-2">
                                    <div className="small fw-semibold mb-1">Document Links
                                        <i onClick={() => { const c = watch('documentLinks') || []; setValue('documentLinks', [...c, { title: '', url: '' }]); }}
                                            className="bi bi-plus-circle cp text-info ms-2" style={{ cursor: 'pointer' }} />
                                    </div>
                                    {(watch('documentLinks') || []).map((_, i) => (
                                        <Row key={i} className="mb-1 align-items-center">
                                            <Col lg={5}><Form.Control size="sm" type="text" placeholder="Title" {...register(`documentLinks.${i}.title`)} /></Col>
                                            <Col lg={6}><Form.Control size="sm" type="url" placeholder="URL" {...register(`documentLinks.${i}.url`)} /></Col>
                                            <Col lg={1}><i onClick={() => { const c = [...(watch('documentLinks') || [])]; c.splice(i, 1); setValue('documentLinks', c); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} /></Col>
                                        </Row>
                                    ))}
                                </div>

                                {/* Website Links */}
                                <div className="mb-2">
                                    <div className="small fw-semibold mb-1">Website Links
                                        <i onClick={() => { const c = watch('websites') || []; setValue('websites', [...c, { title: '', url: '', creds: [] }]); }}
                                            className="bi bi-plus-circle cp text-info ms-2" style={{ cursor: 'pointer' }} />
                                    </div>
                                    {(watch('websites') || []).map((w, wi) => (
                                        <div key={wi} className="border rounded p-2 mb-2">
                                            <Row className="mb-1 align-items-center">
                                                <Col lg={5}><Form.Control size="sm" type="text" placeholder="Website Title" {...register(`websites.${wi}.title`)} /></Col>
                                                <Col lg={5}><Form.Control size="sm" type="url" placeholder="Website URL" {...register(`websites.${wi}.url`)} /></Col>
                                                <Col lg={2} className="d-flex gap-2">
                                                    <i title="Add Creds" onClick={() => { const a = watch('websites') || []; const u = [...a]; if (!u[wi].creds) u[wi].creds = []; u[wi].creds.push({ role: '', username: '', password: '' }); setValue('websites', u); }} className="bi bi-plus-circle text-info cp" style={{ cursor: 'pointer' }} />
                                                    <i onClick={() => { const c = [...(watch('websites') || [])]; c.splice(wi, 1); setValue('websites', c); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} />
                                                </Col>
                                            </Row>
                                            {(watch(`websites.${wi}.creds`) || []).map((_, ci) => (
                                                <Row key={ci} className="mb-1 align-items-center ms-1">
                                                    <Col lg={3}><Form.Control size="sm" type="text" placeholder="Role" {...register(`websites.${wi}.creds.${ci}.role`)} /></Col>
                                                    <Col lg={4}><Form.Control size="sm" type="text" placeholder="Username" {...register(`websites.${wi}.creds.${ci}.username`)} /></Col>
                                                    <Col lg={4}><Form.Control size="sm" type="password" placeholder="Password" {...register(`websites.${wi}.creds.${ci}.password`)} /></Col>
                                                    <Col lg={1}><i onClick={() => { const a = watch('websites') || []; const u = [...a]; u[wi].creds.splice(ci, 1); setValue('websites', u); }} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} /></Col>
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
                                                    <th>Name</th><th>Provider</th><th>Status</th>
                                                    <th>RTL</th><th>Client</th><th>Cost?</th><th>Cost</th><th>Notes</th><th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dependencies.map((d, i) => (
                                                    <tr key={i} style={{ fontSize: '11px' }}>
                                                        <td><Form.Control size="sm" value={d.name} onChange={(e) => updDep(i, 'name', e.target.value)} /></td>
                                                        <td><Form.Control size="sm" value={d.provider} onChange={(e) => updDep(i, 'provider', e.target.value)} /></td>
                                                        <td><Form.Select size="sm" value={d.status} onChange={(e) => updDep(i, 'status', e.target.value)}>
                                                            <option value="Pending">Pending</option><option value="Done">Done</option>
                                                        </Form.Select></td>
                                                        <td className="text-center"><Form.Check checked={d.rtl} onChange={(e) => updDep(i, 'rtl', e.target.checked)} /></td>
                                                        <td className="text-center"><Form.Check checked={d.client} onChange={(e) => updDep(i, 'client', e.target.checked)} /></td>
                                                        <td className="text-center"><Form.Check checked={d.costInvolved} onChange={(e) => updDep(i, 'costInvolved', e.target.checked)} /></td>
                                                        <td><Form.Control size="sm" disabled={!d.costInvolved} value={d.cost} onChange={(e) => updDep(i, 'cost', e.target.value)} /></td>
                                                        <td><Form.Control size="sm" value={d.notes} onChange={(e) => updDep(i, 'notes', e.target.value)} /></td>
                                                        <td><i onClick={() => setDependencies(dependencies.filter((_, x) => x !== i))} className="bi bi-trash text-danger cp" style={{ cursor: 'pointer' }} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-outline-secondary fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={onHide}>Cancel</button>
                    <button type="submit" className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} disabled={loading}>
                        {loading ? 'Saving...' : editData ? 'Update' : 'Create'}
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE — Client Projects list
// ══════════════════════════════════════════════════════════════════════════════
const ClientProjects = () => {
    const dispatch = useDispatch();
    const store = useSelector((s) => s);
    const dept = localStorage.getItem('selectedDepartment') || 'Tech';

    const projects = store?.getClientProjectsReducer?.data?.data || [];
    const loading = store?.getClientProjectsReducer?.loading;

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(getClientProjects({ page: 1, limit: 100 }));
    }, [dispatch]);

    const handleSearch = (val) => {
        setSearch(val);
        dispatch(getClientProjects({ page: 1, limit: 100, search: val }));
    };

    const openAdd = () => { setEditData(null); setShowModal(true); };
    const openEdit = (row) => { setEditData(row); setShowModal(true); };

    const statusColor = (s) => {
        if (s === 'Ongoing') return 'badge bg-success';
        if (s === 'Support') return 'badge bg-info text-dark';
        if (s === 'Delivered') return 'badge bg-primary';
        if (s === 'Hold') return 'badge bg-warning text-dark';
        return 'badge bg-secondary';
    };

    return (
        <div className="container-fluid pt-3">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="fw-bold text-dark mb-0">Client Projects</h4>
                    <p className="text-muted small mb-0">Manage all client projects separately</p>
                </div>
                <button className="btn bg-dark text-white fw-semibold" style={{ padding: '5px 16px', fontSize: '12px' }} onClick={openAdd}>
                    <i className="bi bi-plus-circle me-1"></i> Add Client Project
                </button>
            </div>

            {/* Search + Filter bar */}
            <Card className="shadow-sm border-0 mb-3">
                <Card.Body className="py-2 px-3">
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                            <i className="bi bi-search" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '12px' }} />
                            <input type="text" className="form-control form-control-sm"
                                placeholder="Search projects..."
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                style={{ paddingLeft: '30px', fontSize: '12px' }} />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Table */}
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-dark" style={{ width: '1.5rem', height: '1.5rem' }} /></div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="uil-folder-open" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}></i>
                            No client projects found. Click <strong>Add Client Project</strong> to create one.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0" style={{ fontSize: '12px' }}>
                                <thead className="table-light">
                                    <tr>
                                        <th style={{ padding: '10px 12px' }}>#</th>
                                        <th style={{ padding: '10px 12px' }}>Project Name</th>
                                        <th style={{ padding: '10px 12px' }}>Client</th>
                                        <th style={{ padding: '10px 12px' }}>Type</th>
                                        <th style={{ padding: '10px 12px' }}>Department</th>
                                        <th style={{ padding: '10px 12px' }}>Status</th>
                                        <th style={{ padding: '10px 12px' }}>Team</th>
                                        <th style={{ padding: '10px 12px' }}>Start</th>
                                        <th style={{ padding: '10px 12px' }}>End</th>
                                        <th style={{ padding: '10px 12px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((p, idx) => (
                                        <tr key={p._id}>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{idx + 1}</td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle', fontWeight: 600 }}>
                                                <Link to={`/dashboard/client-milestone/${p._id}`} className="text-decoration-none text-dark namelink text-primary fw-semibold">
                                                    {p.name}
                                                </Link>
                                            </td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                                                {p.client?.length > 0 ? p.client.map(c => c.name || c).join(', ') : '—'}
                                            </td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{p.type || '—'}</td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{p.projectType || '—'}</td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                                                <span className={statusColor(p.projectStatus)} style={{ fontSize: '10px' }}>{p.projectStatus}</span>
                                            </td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                                                {p.team?.length > 0 ? (
                                                    <div className="d-flex gap-1 flex-wrap">
                                                        {p.team.slice(0, 3).map((t, i) => (
                                                            <span key={i} className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>
                                                                {t.name || t}
                                                            </span>
                                                        ))}
                                                        {p.team.length > 3 && <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>+{p.team.length - 3}</span>}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                                                {p.start ? moment(p.start).format('MMM YYYY') : p.amcStartDate ? moment(p.amcStartDate).format('DD MMM YY') : '—'}
                                            </td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                                                {p.end ? moment(p.end).format('MMM YYYY') : p.amcEndDate ? moment(p.amcEndDate).format('DD MMM YY') : '—'}
                                            </td>
                                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                                                <button className="btn btn-sm btn-outline-secondary" style={{ fontSize: '11px', padding: '2px 8px' }}
                                                    onClick={() => openEdit(p)}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Add / Edit Modal */}
            <ClientProjectModal
                show={showModal}
                onHide={() => setShowModal(false)}
                editData={editData}
            />
        </div>
    );
};

export default ClientProjects;
