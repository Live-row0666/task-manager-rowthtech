import React, { useEffect, useState } from 'react';
import { Modal, Badge, Form } from 'react-bootstrap';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { getTicketById, updateTicketResponse } from '../../../../redux/support/action';

const ViewTicketModal = ({ show, onHide, ticket }) => {
    const dispatch = useDispatch();
    const [newResponse, setNewResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const getTicketByIdState = useSelector(state => state?.getTicketById);

    const ticketData = getTicketByIdState?.data?.data || getTicketByIdState?.data;

    const store = useSelector(state => state);
    const UpdateResponse = store?.updateTicketResponse?.data?.status;

    useEffect(() => {
        if (UpdateResponse === 200) {
            fetchTicketById(ticket._id);
        }
    }, [UpdateResponse]);

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
    useEffect(() => {
        if (ticket?._id) {
            fetchTicketById();
        }
    }, [ticket?._id]);

    const fetchTicketById = () => {
        if (ticket?._id) {
            dispatch(getTicketById({
                id: ticket._id,
            }));
        } else {
            console.error('No ticket ID available for fetching');
        }
    };

    const handleAddResponse = async () => {
        if (!newResponse.trim()) return;

        setIsSubmitting(true);
        try {
            dispatch(updateTicketResponse({
                id: ticket._id,
                body: { message: newResponse }
            }))
            setNewResponse('');
        } catch (error) {
            console.error('Error adding response:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!ticketData && !ticket) return null;

    const displayTicket = ticketData || ticket;

    return (
        <Modal show={show} onHide={onHide} className='taskModal' size="xl">
            <Modal.Header className='py-2'>
                <Modal.Title className="text-black fs-5 fw-bold">
                    Ticket Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="" style={{
                    maxHeight: 'calc(100vh - 180px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}>
                    <div className="bg-white p-2 rounded-3 shadow-sm">
                        {/* Ticket Header Section */}
                        <div className="mb-2">
                            <div className="d-flex align-items-center mb-2 gap-2">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                                    <i className="fas fa-ticket-alt text-white" style={{ fontSize: '14px' }}></i>
                                </div>
                                <div className="flex-grow-1 overflow-hidden">
                                    <h6 className="mb-0 fw-semibold text-dark text-uppercase" style={{ fontSize: '0.95rem' }}>{displayTicket?.title}</h6>
                                </div>
                                <div className="d-flex gap-1 flex-wrap mt-1">
                                    <Badge
                                        bg={getPriorityBadge(displayTicket.priority)}
                                        className="text-capitalize px-2 py-1"
                                        style={{ fontSize: '0.6875rem', lineHeight: 1 }}
                                    >
                                        <i className="fas fa-flag me-1" style={{ fontSize: '0.625rem' }}></i>
                                        {displayTicket.priority}
                                    </Badge>
                                    <Badge
                                        bg={getStatusBadge(displayTicket.status)}
                                        className="text-capitalize px-2 py-1"
                                        style={{ fontSize: '0.6875rem', lineHeight: 1 }}
                                    >
                                        <i className="fas fa-circle me-1" style={{ fontSize: '6px' }}></i>
                                        {displayTicket.status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="border rounded-3 py-2 px-3 h-100 bg-light">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-tag text-primary me-2"></i>
                                            <small className="text-muted fw-semibold">CATEGORY</small>
                                        </div>
                                        <div className="fw-bold text-dark">{getCategoryDisplay(displayTicket.category)}</div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="border rounded-3 py-2 px-3 h-100 bg-light">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-calendar-alt text-success me-2"></i>
                                            <small className="text-muted fw-semibold">CREATED</small>
                                        </div>
                                        <div className="fw-bold text-dark">{moment(displayTicket.createdAt).format('DD/MM/YYYY')}</div>
                                        <small className="text-muted">{moment(displayTicket.createdAt).format('HH:mm')}</small>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="border rounded-3 py-2 px-3 h-100 bg-light">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-user text-info me-2"></i>
                                            <small className="text-muted fw-semibold">CREATED BY</small>
                                        </div>
                                        <div className="fw-bold text-dark">{displayTicket.user?.name || 'N/A'}</div>
                                        <small className="text-muted">{displayTicket.user?.email}</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        {displayTicket.description && (
                            <div className="mb-1">
                                <h6 className="text-success fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-align-left me-2"></i>Description
                                </h6>
                                <div className="border rounded p-2 bg-light">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: displayTicket.description,
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Attachments Section */}
                        {displayTicket.attachments && displayTicket.attachments.length > 0 && (
                            <div className="mb-1">
                                <h6 className="text-warning fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-paperclip me-2"></i>Attachments
                                </h6>
                                <div className="border rounded p-2">
                                    {displayTicket.attachments.map((attachment, index) => (
                                        <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                                            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="small text-decoration-none">
                                                <i className="mdi mdi-file-outline me-1"></i>
                                                {attachment.url}
                                            </a>
                                            <small className="text-muted">
                                                {moment(attachment.uploadedAt).format('DD/MM HH:mm')}
                                            </small>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Responses Section */}
                        <div className="mb-2">
                            <h6 className="text-info fw-bold mb-2 border-bottom pb-1">
                                <i className="fas fa-comments me-2"></i>Responses ({displayTicket.responses?.length || 0})
                            </h6>

                            {displayTicket.responses && displayTicket.responses.length > 0 ? (
                                <div className="mb-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    {displayTicket.responses.map((response, index) => (
                                        <div key={index} className="border rounded mb-2 p-2 bg-light">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div className="d-flex align-items-center">
                                                    <span className="fw-semibold small">{response.respondedBy?.name || 'System'}</span>
                                                    {response.isAdminResponse && (
                                                        <Badge bg="info" className="ms-1" style={{ fontSize: '0.65rem' }}>
                                                            {JSON.parse(localStorage.getItem('hyper_user'))?.role === 'Support' ? 'Support' : 'Admin'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                    {moment(response.respondedAt).format('DD/MM HH:mm')}
                                                </small>
                                            </div>
                                            <div className="small text-dark">{response.message}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-2 border rounded bg-light">
                                    <i className="fas fa-comment-slash mb-1"></i>
                                    <div className="small">No responses yet</div>
                                </div>
                            )}

                            {/* Add Response */}
                            <div className="border-top pt-2">
                                <Form.Group className="mb-2">
                                    <Form.Label className="mb-1 fw-semibold small">Add Response</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Type your response here..."
                                        value={newResponse}
                                        onChange={(e) => setNewResponse(e.target.value)}
                                        style={{ fontSize: '0.9rem' }}
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end">
                                    <button
                                        className="btn bg-dark text-white fw-semibold"
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                        onClick={handleAddResponse}
                                        disabled={!newResponse.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add Response'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type="button"
                    className="btn bg-dark text-white fw-semibold"
                    style={{ padding: '4px 16px', fontSize: '11px' }}
                    onClick={onHide}
                >
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewTicketModal;