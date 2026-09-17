import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Badge } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
// import Pagination from '@mui/material/Pagination';
import CreateTicketModal from './modal/CreateTicketModal';
import UpdateTicketModal from './modal/UpdateTicketModal';
import ViewTicketModal from './modal/ViewTicketModal';
import { getAllTickets } from '../../redux/support/action';
import MainLoader from '../../constants/Loader/loader';

const Support = () => {
    const dispatch = useDispatch();
    const getAllTicketsState = useSelector(state => state?.getAllTickets);
    const createTicketState = useSelector(state => state?.createTicket);
    const updateTicketState = useSelector(state => state?.updateTicket);

    const tickets = getAllTicketsState?.data?.data || [];
    const loading = getAllTicketsState?.loading;
    const totalPages = getAllTicketsState?.data?.totalPages || 1;

    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openViewModal, setOpenViewModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const sessionData = sessionStorage.getItem('hyper_user');
    const userData = JSON.parse(sessionData);
    const userRole = userData?.role;
    const userId = userData?.id;

    useEffect(() => {
        fetchTickets();
    }, [currentPage, statusFilter, priorityFilter, categoryFilter]);

    useEffect(() => {
        if (createTicketState?.data?.status === 201 || updateTicketState?.data?.status === 200) {
            fetchTickets();
        }
    }, [createTicketState?.data?.status, updateTicketState?.data?.status]);

    const fetchTickets = () => {
        dispatch(getAllTickets({
            user: userId,
            page: currentPage,
            limit: 10,
            status: statusFilter,
            priority: priorityFilter,
            category: categoryFilter
        }));
    };

    const handleCreateTicket = () => {
        setOpenCreateModal(true);
    };

    const handleUpdateTicket = (ticket) => {
        setSelectedTicket(ticket);
        setOpenUpdateModal(true);
    };

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setOpenViewModal(true);
    };

    const handlePaginationChange = (event, value) => {
        setCurrentPage(value);
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'success',
            medium: 'warning',
            high: 'danger',
            urgent: 'dark'
        };
        return colors[priority] || 'secondary';
    };

    const getStatusBadge = (status) => {
        const colors = {
            open: 'primary',
            in_progress: 'warning',
            resolved: 'success',
            closed: 'secondary'
        };
        return colors[status] || 'secondary';
    };

    const getCategoryDisplay = (category) => {
        const categories = {
            bug: 'Bug Report',
            feature_request: 'Feature Request',
            technical_issue: 'Technical Issue',
            general_inquiry: 'General Inquiry'
        };
        return categories[category] || category;
    };

    const truncateText = (text, maxLength = 30) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    function truncateHTML(html, limit) {
        const div = document.createElement("div");
        div.innerHTML = html;
        const text = div.textContent || div.innerText || "";
        return text.length > limit ? text.substring(0, limit) + "..." : text;
    }


    return (
        <>
            <div>
                <Card style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
                    <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex gap-2 mb-2">
                                    <div className="d-flex align-items-center">
                                        <button className={`btn fw-semibold px-2 rounded-0 ${statusFilter === 'all' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => setStatusFilter('all')}>All</button>
                                        <button className={`btn fw-semibold px-2 rounded-0 ${statusFilter === 'open' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => setStatusFilter('open')}>Open</button>
                                        <button className={`btn fw-semibold px-2 rounded-0 ${statusFilter === 'in_progress' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => setStatusFilter('in_progress')}>In Progress</button>
                                        <button className={`btn fw-semibold px-2 rounded-0 ${statusFilter === 'resolved' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => setStatusFilter('resolved')}>Resolved</button>
                                    </div>
                                </div>
                                <div className='d-flex gap-2'>
                                    <div className="d-flex gap-2">
                                        <select
                                            className="form-select form-select-sm"
                                            style={{ width: 'auto', fontSize: '11px' }}
                                            value={priorityFilter}
                                            onChange={(e) => setPriorityFilter(e.target.value)}
                                        >
                                            <option value="all">All Priorities</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                        <select
                                            className="form-select form-select-sm"
                                            style={{ width: 'auto', fontSize: '11px' }}
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="feature_request">Feature Request</option>
                                            <option value="technical_issue">Technical Issue</option>
                                            <option value="general_inquiry">General Inquiry</option>
                                        </select>
                                    </div>

                                    <button
                                        className="btn bg-dark text-white fw-semibold"
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                        onClick={handleCreateTicket}
                                    >
                                        Create Ticket
                                    </button>
                                </div>
                            </div>




                        </div>

                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {loading ? (
                                <MainLoader />
                            ) : tickets?.length === 0 ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <h5 className="text-muted">No Tickets Found</h5>
                                </div>
                            ) : (
                                <div className="table-responsive h-100">
                                    <Table className="mb-0 table-hover table-sm" style={{ fontSize: '11px' }}>
                                        <thead className="table-dark">
                                            <tr>
                                                <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Title</th>
                                                <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Category</th>
                                                <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Priority</th>
                                                <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Status</th>
                                                {/* <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Created By</th> */}
                                                {/* <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Assigned To</th> */}
                                                <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Created</th>
                                                <th className='fw-bold fs-6 text-center' style={{ width: '15%' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets?.map((ticket) => (
                                                <tr key={ticket._id} className="align-middle">
                                                    <td className="text-start" style={{ fontSize: '12px' }}>
                                                        <div
                                                            className="fw-semibold text-primary text-capitalize"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => handleViewTicket(ticket)}
                                                        >
                                                            {truncateText(ticket.title, 25)}
                                                        </div>

                                                        <div
                                                            className="text-muted"
                                                            style={{ fontSize: '10px' }}
                                                            dangerouslySetInnerHTML={{
                                                                __html: truncateHTML(ticket.description, 40),
                                                            }}
                                                        />
                                                    </td>

                                                    <td className="text-start" style={{ fontSize: '12px' }}>
                                                        {getCategoryDisplay(ticket.category)}
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={getPriorityBadge(ticket.priority)} className="text-capitalize" style={{ width: '3vw', padding: '6px' }}>
                                                            {ticket.priority}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge bg={getStatusBadge(ticket.status)} className="text-capitalize" style={{ width: '3vw', padding: '6px' }}>
                                                            {ticket.status.replace('_', ' ')}
                                                        </Badge>
                                                    </td>
                                                    {/* <td className="text-start" style={{ fontSize: '12px' }}>
                                                        <div>{ticket.user?.name || 'N/A'}</div>
                                                        <div className="text-muted" style={{ fontSize: '10px' }}>
                                                            {ticket.user?.email}
                                                        </div>
                                                    </td> */}
                                                    {/* <td className="text-start" style={{ fontSize: '12px' }}>
                                                        {ticket.assignedTo?.name || 'Unassigned'}
                                                    </td> */}
                                                    <td className="text-center" style={{ fontSize: '12px' }}>
                                                        {moment(ticket.createdAt).format('DD/MM/YYYY')}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-1">
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                onClick={() => handleViewTicket(ticket)}
                                                            >
                                                                <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                            </button>
                                                            {userRole !== "Testing" && (
                                                                <button
                                                                    className="btn btn-outline-secondary"
                                                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                    onClick={() => handleUpdateTicket(ticket)}
                                                                >
                                                                    <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </div>

                        {/* {totalPages > 1 && (
                            <div className="d-flex justify-content-end mt-3 pt-2 border-top">
                                <Pagination
                                    page={currentPage}
                                    count={totalPages}
                                    color="primary"
                                    variant="outlined"
                                    onChange={handlePaginationChange}
                                />
                            </div>
                        )} */}
                    </Card.Body>
                </Card>

                {/* Modals */}
                <CreateTicketModal
                    show={openCreateModal}
                    onHide={() => setOpenCreateModal(false)}
                    onSuccess={fetchTickets}
                />
                <UpdateTicketModal
                    show={openUpdateModal}
                    onHide={() => setOpenUpdateModal(false)}
                    ticket={selectedTicket}
                    onSuccess={fetchTickets}
                />
                <ViewTicketModal
                    show={openViewModal}
                    onHide={() => setOpenViewModal(false)}
                    ticket={selectedTicket}
                />
            </div>
        </>
    );
};

export default Support;