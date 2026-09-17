import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { updateMeeting, getAllProjects, getAllUsers, getAmcProjects, getClients } from '../../../../redux/actions';

const UpdateMeetingModal = ({ show, onHide, meeting }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const selectedDepartment = localStorage?.getItem('selectedDepartment');
    const projects = store?.getProject?.data?.data;
    const teamView = store?.Auth?.user?.role === 'admin' ? (selectedDepartment || 'Tech') : store?.Auth?.user?.role === 'Marketing' ? 'Marketing' : 'Tech';
    const [teamType, setTeamType] = useState(teamView);
    const [status, setStatus] = useState(true);
    const [clients, setClients] = useState([]);
    const [projectStatus, setprojectStatus] = useState(() => {
        return localStorage.getItem('activeProjectTab') || 'Ongoing';
    });
    const [skip, setSkip] = useState(1);
    const [projectSearch, setProjectSearch] = useState('');
    const { update: updateMeetingState } = useSelector(state => state.meetingReducer || {});

    const fetchProjects = (params = {}) => {
        if (projectStatus === 'Support') {
            dispatch(getAmcProjects({ projectType: teamType, page: 1, limit: 100, search: projectSearch, ...(store?.Auth?.user?.role === 'QA' || store?.Auth?.user?.role === 'Sales' ? { userId: store?.Auth?.user?.id } : store?.Auth?.user?.role === 'Marketing' ? { userId: store?.Auth?.user?.id } : {}), ...params }));
        } else {
            dispatch(getAllProjects({ status, projectType: teamType, skip, projectStatus, limit: 100, search: projectSearch, ...(store?.Auth?.user?.role === 'QA' ? { userId: store?.Auth?.user?.id } : store?.Auth?.user?.role === 'Marketing' ? { userId: store?.Auth?.user?.id } : {}), ...params }));
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        client: '',
        startDateTime: '',
        endDateTime: '',
        meetingType: 'one-time',
        recurrence: {
            frequency: 'weekly',
            interval: 1,
            endDate: ''
        },
        attendees: [],
        location: '',
        meetingLink: '',
        status: 'scheduled',
        notes: '',
        projectType: selectedDepartment
    });

    useEffect(() => {
        if (store?.Meeting?.update?.success === true) {
            onHide();
            setFormData({
                title: '',
                description: '',
                project: '',
                client: '',
                startDateTime: '',
                endDateTime: '',
                meetingType: 'one-time',
                recurrence: { frequency: 'weekly', interval: 1, endDate: '' },
                attendees: [],
                location: '',
                meetingLink: '',
                status: 'scheduled',
                notes: ''
            });
        }
    }, [store?.Meeting?.update?.success])

    useEffect(() => {
        if (show) {
            fetchProjects();
            dispatch(getClients({ page: 1, projectType: selectedDepartment }));
        }
    }, [show, dispatch]);

    useEffect(() => {
        if (updateMeetingState?.success) {
            onHide();
            setFormData({
                title: '',
                description: '',
                project: '',
                client: '',
                startDateTime: '',
                endDateTime: '',
                meetingType: 'one-time',
                recurrence: { frequency: 'weekly', interval: 1, endDate: '' },
                attendees: [],
                location: '',
                meetingLink: '',
                status: 'scheduled',
                notes: ''
            });
        }
    }, [updateMeetingState?.success, onHide]);

    useEffect(() => {
        if (show && meeting) {
            setFormData({
                title: meeting.title || '',
                description: meeting.description || '',
                project: meeting.project?._id || '',
                client: meeting.client?._id || '',
                startDateTime: meeting.startDateTime ? new Date(new Date(meeting.startDateTime).getTime() - new Date(meeting.startDateTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
                endDateTime: meeting.endDateTime ? new Date(new Date(meeting.endDateTime).getTime() - new Date(meeting.endDateTime).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
                meetingType: meeting.meetingType || 'one-time',
                recurrence: meeting.recurrence || { frequency: 'weekly', interval: 1, endDate: '' },
                attendees: meeting.attendees || [],
                location: meeting.location || '',
                meetingLink: meeting.meetingLink || '',
                status: meeting.status || 'scheduled',
                notes: meeting.notes || ''
            });
            if (meeting.project?.client) {
                setClients(meeting.project.client);
            } else {
                const selectedProject = projects?.find(p => p._id === meeting.project?._id);
                if (selectedProject?.client) {
                    setClients(selectedProject.client);
                }
            }
        }
    }, [show, meeting]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('recurrence.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                recurrence: { ...prev.recurrence, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAttendeeChange = (userId, checked) => {
        setFormData(prev => ({
            ...prev,
            attendees: checked
                ? [...prev.attendees, { user: userId }]
                : prev.attendees.filter(a => a.user !== userId)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const submitData = { ...formData };
        if (formData.meetingType !== 'recurring') {
            delete submitData.recurrence;
        }
        dispatch(updateMeeting(meeting._id, submitData));
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header className='py-2'>
                <Modal.Title className="text-black fw-bold" style={{ fontSize: '14px' }}>Update Meeting</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Title <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    style={{ height: '30px', paddingTop: '5px' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Meeting Type</Form.Label>
                                <Form.Select
                                    name="meetingType"
                                    value={formData.meetingType}
                                    onChange={handleChange}
                                    style={{ height: '30px', paddingTop: '5px' }}
                                >
                                    <option value="one-time">One-time</option>
                                    <option value="recurring">Recurring</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Project <span className='text-danger'>*</span></Form.Label>
                                <Form.Select
                                    name="project"
                                    value={formData.project}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setClients(projects?.find((data) => data?._id === e.target.value)?.client)
                                    }}
                                    required
                                    style={{ height: '30px', paddingTop: '5px' }}
                                >
                                    <option value="">Select Project</option>
                                    {projects?.map(project => (
                                        <option key={project?._id} value={project?._id}>
                                            {project?.name}
                                        </option>
                                    )) || []}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Client <span className='text-danger'>*</span></Form.Label>
                                <Form.Select
                                    name="client"
                                    disabled={clients?.length === 0}
                                    value={formData.client}
                                    onChange={handleChange}
                                    required
                                    style={{ height: '30px', paddingTop: '5px' }}
                                >
                                    <option value="">Select Client</option>
                                    {clients?.map(client => (
                                        <option key={client._id} value={client._id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Start Date & Time <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={formData.startDateTime}
                                    onChange={handleChange}
                                    min={new Date().toISOString().slice(0, 16)}
                                    required
                                    style={{ height: '30px', paddingTop: '5px' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>End Date & Time <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="datetime-local"
                                    name="endDateTime"
                                    value={formData.endDateTime}
                                    onChange={handleChange}
                                    min={formData.startDateTime || new Date().toISOString().slice(0, 16)}
                                    required
                                    style={{ height: '30px', paddingTop: '5px' }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {formData.meetingType === 'recurring' && (
                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small'>Frequency</Form.Label>
                                    <Form.Select
                                        name="recurrence.frequency"
                                        value={formData.recurrence.frequency}
                                        onChange={handleChange}
                                        style={{ height: '30px', paddingTop: '5px' }}
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small'>Interval</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="recurrence.interval"
                                        value={formData.recurrence.interval}
                                        onChange={handleChange}
                                        min="1"
                                        style={{ height: '30px', paddingTop: '5px' }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small'>End Date <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        name="recurrence.endDate"
                                        value={formData.recurrence.endDate}
                                        onChange={handleChange}
                                        style={{ height: '30px', paddingTop: '5px' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    style={{ height: '30px', paddingTop: '5px' }}
                                >
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="rescheduled">Rescheduled</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    style={{ height: '30px', paddingTop: '5px' }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>Meeting Link <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="url"
                                    name="meetingLink"
                                    required
                                    value={formData.meetingLink}
                                    onChange={handleChange}
                                    style={{ height: '30px', paddingTop: '5px' }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-2">
                        <Form.Label className='mb-0 small'>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label className='mb-0 small'>Notes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button"
                        className="btn btn-outline-secondary fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }} onClick={onHide}>
                        Cancel
                    </button>
                    <button className="btn text-nowrap bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }}
                        disabled={store?.Meeting?.update?.loading}
                        type="submit">
                        Update Meeting
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UpdateMeetingModal;