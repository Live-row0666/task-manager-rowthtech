import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import { Modal } from 'react-bootstrap';
import './Dashboard.css';
import './Support.css';

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

    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress' || !t.status).length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

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

                {/* Dashboard Hero Bar */}
                <div className="dashboard-hero-bar">
                    <div className="hero-welcome-info">
                        <div className="hero-title-row">
                            <h2 className="hero-title">Support & Help Center</h2>
                            <div className="hero-badge">
                                <span className="pulse-dot"></span>
                                Dedicated 24/7 Support
                            </div>
                        </div>
                        <p className="hero-subtitle">
                            Need technical assistance, have questions, or want to submit changes? Create and track requests below.
                        </p>
                    </div>

                    <div className="hero-controls">
                        <button 
                            type="button" 
                            className="btn-create-ticket-primary" 
                            onClick={() => setShowModal(true)}
                        >
                            <i className="bi bi-plus-circle-fill"></i>
                            <span>Create Support Ticket</span>
                        </button>
                    </div>
                </div>

                {/* Support KPI Metrics Cards */}
                <div className="support-kpi-grid">
                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-purple-soft">
                            <i className="bi bi-ticket-detailed-fill"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Total Requests</span>
                            <span className="support-kpi-val">{totalTickets}</span>
                            <span className="support-kpi-sub">Lifetime tickets submitted</span>
                        </div>
                    </div>

                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-amber-soft">
                            <i className="bi bi-hourglass-split"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Active / In Progress</span>
                            <span className="support-kpi-val">{activeTickets}</span>
                            <span className="support-kpi-sub">Currently under engineering</span>
                        </div>
                    </div>

                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-emerald-soft">
                            <i className="bi bi-patch-check-fill"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Resolved Tickets</span>
                            <span className="support-kpi-val">{resolvedTickets}</span>
                            <span className="support-kpi-sub">Completed & verified</span>
                        </div>
                    </div>

                    <div className="support-kpi-card">
                        <div className="support-kpi-icon icon-sky-soft">
                            <i className="bi bi-headset"></i>
                        </div>
                        <div className="support-kpi-content">
                            <span className="support-kpi-label">Dedicated Lead</span>
                            <span className="support-kpi-val" style={{ fontSize: '15px' }}>Support Team</span>
                            <span className="support-kpi-sub">Avg response &lt; 2 hrs</span>
                        </div>
                    </div>
                </div>

                {/* Tickets Table Card */}
                <div className="pro-card support-tickets-card">
                    <div className="pro-card-header">
                        <div className="card-title-group">
                            <div className="card-title-icon indigo-soft">
                                <i className="bi bi-collection"></i>
                            </div>
                            <div>
                                <h4 className="pro-card-title">Your Support Requests</h4>
                                <span className="pro-card-subtitle">Live status, priority, and resolution tracking</span>
                            </div>
                        </div>
                        {tickets.length > 0 && (
                            <span className="badge bg-light text-dark fw-bold px-3 py-2 rounded-pill border">
                                {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
                            </span>
                        )}
                    </div>

                    <div className="table-responsive-wrapper">
                        {tickets.length > 0 ? (
                            <table className="pro-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '45px' }}>#</th>
                                        <th>Subject & Details</th>
                                        <th>Category</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((t, idx) => {
                                        const isResolved = t.status === 'resolved' || t.status === 'closed';
                                        const isInProgress = t.status === 'in_progress';
                                        const statusCls = isResolved ? 'status-resolved' : isInProgress ? 'status-in_progress' : 'status-open';
                                        
                                        const isUrgent = t.priority === 'urgent' || t.priority === 'high';
                                        const isMedium = t.priority === 'medium';
                                        const prioCls = isUrgent ? 'priority-high' : isMedium ? 'priority-medium' : 'priority-low';

                                        return (
                                            <tr key={t._id || idx} className="pro-table-row">
                                                <td className="cell-index">{String(idx + 1).padStart(2, '0')}</td>
                                                <td>
                                                    <div className="ticket-title-link">
                                                        {t.title}
                                                    </div>
                                                    {t.description && (
                                                        <div className="ticket-desc-snippet" title={t.description}>
                                                            {t.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className="category-tag-pill">
                                                        <i className="bi bi-tag-fill text-muted" style={{ fontSize: '9px' }}></i>
                                                        {t.category ? t.category.replace(/_/g, ' ') : 'General'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`priority-badge-pill ${prioCls}`}>
                                                        {t.priority || 'Normal'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`ticket-status-pill ${statusCls}`}>
                                                        <span className="status-dot-sm"></span>
                                                        {t.status ? t.status.replace(/_/g, ' ') : 'Open'}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                                                    {new Date(t.createdAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="support-empty-state">
                                <div className="support-empty-icon-wrap">
                                    <i className="bi bi-inbox-fill"></i>
                                </div>
                                <h4 className="support-empty-title">No Support Requests Found</h4>
                                <p className="support-empty-desc">
                                    You haven't submitted any support requests yet. Click below to create a ticket whenever you need assistance.
                                </p>
                                <button 
                                    type="button" 
                                    className="btn-create-ticket-primary"
                                    onClick={() => setShowModal(true)}
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    <span>Create Support Ticket</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modern Support Request Modal */}
                <Modal 
                    show={showModal} 
                    onHide={() => setShowModal(false)} 
                    centered
                    className="custom-support-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className="bi bi-pencil-square text-primary me-2"></i>
                            New Support Request
                        </Modal.Title>
                    </Modal.Header>
                    
                    <form onSubmit={handleSubmitTicket}>
                        <Modal.Body>
                            <div className="mb-3">
                                <label className="modal-form-label">
                                    Subject / Title <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="modal-form-control"
                                    placeholder="Brief summary of your query or issue"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="modal-form-label">Category</label>
                                    <select 
                                        className="modal-form-select" 
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="general_inquiry">General Inquiry</option>
                                        <option value="technical_issue">Technical Issue</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature_request">Feature Request / Scope</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="modal-form-label">Priority Level</label>
                                    <select 
                                        className="modal-form-select" 
                                        value={priority} 
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="modal-form-label">Detailed Description</label>
                                <textarea
                                    className="modal-form-control"
                                    rows={4}
                                    placeholder="Provide detailed information or steps so our engineering team can assist promptly..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <button 
                                type="button" 
                                className="btn-modal-cancel" 
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn-modal-submit" 
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-send-fill me-1"></i> Submit Request
                                    </>
                                )}
                            </button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </main>
        </div>
    );
};

export default Support;
