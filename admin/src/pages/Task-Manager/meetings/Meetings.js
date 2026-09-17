import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Dropdown, Form, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CreateMeetingModal from './modal/CreateMeetingModal';
import UpdateMeetingModal from './modal/UpdateMeetingModal';
import { getMeetings, deleteMeeting } from '../../../redux/actions';
import Pagination from '@mui/material/Pagination';

const Meetings = () => {
    const dispatch = useDispatch();
    const { meetings, pagination, loading } = useSelector(state => state.Meeting || { meetings: [], pagination: {}, loading: false });
    const store = useSelector((state) => state);
    const projects = store?.getProject?.data?.data;
    const selectedDepartment = localStorage?.getItem('selectedDepartment');
    const teamType = store?.Auth?.user?.role === 'admin' ? (selectedDepartment || 'Tech') : (store?.Auth?.user?.role === 'Marketing' ? 'Marketing' : store?.Auth?.user?.role === 'Freelancers' ? 'Freelance' : 'Tech');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [meetingToDelete, setMeetingToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState('single');
    const [filters, setFilters] = useState({
        project: '',
        startDate: '',
        endDate: '',
        projectType: selectedDepartment
    });
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(getMeetings(filters, currentPage, 20));
    }, [dispatch, filters, currentPage, teamType]);

    useEffect(() => {
        if (store?.Meeting?.delete?.success) {
            dispatch(getMeetings(filters, currentPage, 20));
            setShowDeleteModal(false);
            setMeetingToDelete(null);
        }
    }, [store?.Meeting?.delete?.success, dispatch, filters, currentPage]);

    useEffect(() => {
        if (store?.Meeting?.create?.success === true) {
            dispatch(getMeetings(filters, currentPage, 20));
        }
    }, [store?.Meeting?.create?.success])

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleEdit = (meeting) => {
        setSelectedMeeting(meeting);
        setShowUpdateModal(true);
    };

    const handleDelete = (meeting) => {
        setMeetingToDelete(meeting);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (meetingToDelete) {
            const deleteData = meetingToDelete.meetingType === 'recurring'
                ? { deleteType }
                : {};
            dispatch(deleteMeeting(meetingToDelete._id, deleteData));
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            scheduled: 'primary',
            completed: 'success',
            cancelled: 'danger',
            rescheduled: 'warning'
        };
        return <Badge style={{ fontSize: '9px' }} className='text-capitalize px-1' bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('en-GB', { hour12: false });
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleDateRangeChange = (update) => {
        setDateRange(update);
        const [start, end] = update;
        setFilters(prev => ({
            ...prev,
            startDate: start ? start.toISOString().split('T')[0] : '',
            endDate: end ? end.toISOString().split('T')[0] : ''
        }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            project: '',
            startDate: '',
            endDate: ''
        });
        setDateRange([null, null]);
        setCurrentPage(1);
    };

    return (
        <>
            <Card style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Row className="mb-3">
                        <Col sm={12} className='d-flex align-items-center justify-content-end gap-2'>
                            <Form.Group>
                                <Form.Select
                                    size="sm"
                                    name="project"
                                    value={filters.project}
                                    onChange={handleFilterChange}
                                    style={{ height: '30px', paddingTop: '5px' }}
                                >
                                    <option value="">All Projects</option>
                                    {projects?.map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group>
                                <DatePicker
                                    selectsRange={true}
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={handleDateRangeChange}
                                    isClearable={true}
                                    className="form-control"
                                    placeholderText="Select date range"
                                    popperProps={{ strategy: "fixed" }}
                                    popperPlacement="bottom"
                                    popperClassName="date-picker-popper"
                                    wrapperClassName="date-picker-wrapper"
                                    wrapperStyle={{
                                        width: '100%',
                                        height: '30px'
                                    }}
                                    calendarClassName="border-0 shadow"
                                    customInput={
                                        <input
                                            style={{
                                                height: '30px',
                                                padding: '0.375rem 0.75rem',
                                                paddingRight: '15px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        />
                                    }
                                />
                            </Form.Group>

                            <button className="btn text-nowrap bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Schedule Meeting
                            </button>
                        </Col>
                    </Row>

                    <div style={{ height: 'calc(83vh - 120px)', overflowY: 'auto', border: '1px solid #dee2e6' }}>
                        <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%' }}>
                            <thead className="table-dark sticky-top">
                                <tr>
                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '20%' }}>Title</th>
                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '15%' }}>Project</th>
                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '15%' }}>Client</th>
                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '15%' }}>Date & Time</th>
                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>Type</th>
                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>Status</th>
                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {store?.Meeting?.get?.loading ?
                                    <tr>
                                        <td colSpan="7" className="text-center py-5">
                                            <div className='p-5 m-5'>
                                                <Spinner />
                                            </div>
                                        </td>
                                    </tr>
                                    :
                                    meetings?.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                <div className="text-muted">
                                                    <i className="mdi mdi-calendar-remove" style={{ fontSize: '24px' }}></i>
                                                    <p className="mb-0 mt-2">No meetings found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        meetings?.map((meeting, index) => (
                                            <tr key={meeting?._id}>
                                                {/* <td className='text-center fw-bold' style={{ fontSize: '12px' }}>
                                                {(currentPage - 1) * 20 + index + 1}
                                            </td> */}
                                                <td style={{ fontSize: '12px' }}>{meeting?.title}</td>
                                                <td className='text-capitalize' style={{ fontSize: '12px' }}>{meeting?.project?.name}</td>
                                                <td className='text-capitalize' style={{ fontSize: '12px' }}>{meeting?.client?.name}</td>
                                                <td style={{ fontSize: '12px' }}>{formatDateTime(meeting?.startDateTime)}</td>
                                                <td>
                                                    <Badge
                                                        className='text-capitalize px-1'
                                                        bg={meeting?.meetingType === 'recurring' ? 'info' : 'secondary'}
                                                        style={{ fontSize: '9px' }}>
                                                        {meeting?.meetingType}
                                                    </Badge>
                                                </td>
                                                <td >{getStatusBadge(meeting?.status)}</td>
                                                <td className='text-center'>
                                                    <div className='d-flex justify-content-center gap-1'>
                                                        <button
                                                            title='Edit Meeting'
                                                            className="btn btn-outline-secondary"
                                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                                            onClick={() => handleEdit(meeting)}>
                                                            <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                                            onClick={() => handleDelete(meeting)}>
                                                            <i className="bi bi-trash" style={{ fontSize: '12px' }}></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                            </tbody>
                        </Table>
                    </div>

                    {pagination?.totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-2 pt-2 ">
                            <Pagination
                                page={currentPage}
                                count={pagination.totalPages}
                                color="primary"
                                variant="outlined"
                                onChange={handlePageChange}
                            />
                        </div>
                    )}
                </Card.Body>
            </Card>

            <CreateMeetingModal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
            />

            <UpdateMeetingModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                meeting={selectedMeeting}
            />

            {/* Delete Confirmation Modal */}
            <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} style={{ backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
                <div className="modal-dialog modal-sm">
                    <div className="modal-content">
                        <div className="modal-header py-2">
                            <h6 className="modal-title fw-bold">Confirm Delete</h6>
                        </div>
                        <div className="modal-body py-2">
                            <p className="mb-2" style={{ fontSize: '12px' }}>Are you sure you want to delete this meeting?</p>
                            <p className="fw-semibold mb-2" style={{ fontSize: '11px' }}>{meetingToDelete?.title}</p>

                            {meetingToDelete?.meetingType === 'recurring' && (
                                <div className="mt-3">
                                    <p className="mb-2" style={{ fontSize: '11px' }}>This is a recurring meeting. What would you like to delete?</p>
                                    <div className="form-check mb-1">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="deleteType"
                                            id="single"
                                            value="single"
                                            checked={deleteType === 'single'}
                                            onChange={(e) => setDeleteType(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="single" style={{ fontSize: '10px' }}>
                                            Only this meeting
                                        </label>
                                    </div>
                                    <div className="form-check mb-1">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="deleteType"
                                            id="future"
                                            value="future"
                                            checked={deleteType === 'future'}
                                            onChange={(e) => setDeleteType(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="future" style={{ fontSize: '10px' }}>
                                            This and all future meetings
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="deleteType"
                                            id="all"
                                            value="all"
                                            checked={deleteType === 'all'}
                                            onChange={(e) => setDeleteType(e.target.value)}
                                        />
                                        <label className="form-check-label" htmlFor="all" style={{ fontSize: '10px' }}>
                                            All meetings in this series
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer py-2">
                            <button type="button"
                                className="btn btn-outline-secondary fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteType('single');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn text-nowrap bg-dark text-white fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                disabled={store?.Meeting?.delete?.loading}
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Meetings;