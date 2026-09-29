import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import { Modal, Button, Form } from 'react-bootstrap';
import './Dashboard.css';

const Support = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general_inquiry');
    const [priority, setPriority] = useState('medium');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
            const res = await axios.get('/api/v1/client/support', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.data) {
                setTickets(res.data.data);
            }
        } catch (err) {
            console.error('Fetch support tickets error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
            await axios.post(
                '/api/v1/client/support',
                { title, category, priority, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShowModal(false);
            setTitle('');
            setDescription('');
            fetchTickets();
        } catch (err) {
            console.error('Create support ticket error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="support" />

            <main className="dash-main">
                <CommonHeader title="Client Support" />

                <div className="overview-heading-row mb-4">
                    <div className="overview-title-section">
                        <h3>Support & Help Center</h3>
                        <p>Need assistance or have a technical query? Create a support request below.</p>
                    </div>

                    <button className="btn btn-primary px-3 py-2 fw-semibold" onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-lg me-1"></i> Create Support Ticket
                    </button>
                </div>

                {/* Tickets Table */}
                <div className="card border-0 shadow-sm p-4 rounded-4">
                    <h5 className="fw-bold mb-3">Your Support Requests</h5>

                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Subject / Title</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tickets.length > 0 ? (
                                    tickets.map((t, idx) => (
                                        <tr key={t._id || idx}>
                                            <td>{idx + 1}</td>
                                            <td className="fw-semibold">{t.title}</td>
                                            <td>
                                                <span className="badge bg-light text-dark text-capitalize">
                                                    {t.category ? t.category.replace('_', ' ') : 'General'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    t.priority === 'high' || t.priority === 'urgent'
                                                        ? 'bg-danger'
                                                        : t.priority === 'medium'
                                                            ? 'bg-warning text-dark'
                                                            : 'bg-info text-dark'
                                                }`}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    t.status === 'resolved' || t.status === 'closed'
                                                        ? 'bg-success'
                                                        : t.status === 'in_progress'
                                                            ? 'bg-warning text-dark'
                                                            : 'bg-primary'
                                                }`}>
                                                    {t.status ? t.status.replace('_', ' ') : 'Open'}
                                                </span>
                                            </td>
                                            <td>{new Date(t.createdAt).toLocaleDateString('en-GB')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">
                                            No support tickets found. Click "Create Support Ticket" to submit a request.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Ticket Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="h5 fw-bold">New Support Request</Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmitTicket}>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Subject / Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Brief summary of your query"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Category</Form.Label>
                                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                                    <option value="general_inquiry">General Inquiry</option>
                                    <option value="technical_issue">Technical Issue</option>
                                    <option value="bug">Bug Report</option>
                                    <option value="feature_request">Feature Request</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Priority</Form.Label>
                                <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Provide detailed information..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </main>
        </div>
    );
};

export default Support;
