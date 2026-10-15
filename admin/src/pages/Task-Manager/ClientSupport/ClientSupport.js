import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { io } from 'socket.io-client';
import config from '../../../config';
import { APICore } from '../../../helpers/api/apiCore';
import './ClientSupport.css';

const api = new APICore();

const QUICK_PM_RESPONSES = [
    'We are investigating this issue right now.',
    'A hotfix has been pushed to staging for verification.',
    'Could you provide steps or error logs to reproduce?',
    'This has been resolved and verified on production.',
    'Our dev team is actively working on the patch.'
];

const ClientSupport = () => {
    // Tickets state - dynamically loaded from backend
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    // Filter states
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Active ticket modal & lightbox preview state
    const [activeTicket, setActiveTicket] = useState(null);
    const [ticketStatusToUpdate, setTicketStatusToUpdate] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [chatInput, setChatInput] = useState('');
    const [pendingFiles, setPendingFiles] = useState([]);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const socketRef = useRef(null);
    const activeTicketRef = useRef(null);

    useEffect(() => {
        activeTicketRef.current = activeTicket;
        if (activeTicket) {
            setTicketStatusToUpdate(activeTicket.status?.toLowerCase() || 'open');
        }
    }, [activeTicket]);

    // Socket.IO real-time client support listener
    useEffect(() => {
        const socketServerUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const socket = io(socketServerUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });
        socketRef.current = socket;

        const joinAdminRooms = () => {
            socket.emit('join_admin_support');
            if (activeTicketRef.current?._id) {
                socket.emit('join_ticket', activeTicketRef.current._id);
            }
        };

        // Join admin support channel to receive real-time unread messages & updates
        joinAdminRooms();

        socket.on('connect', () => {
            joinAdminRooms();
        });

        socket.on('reconnect', () => {
            joinAdminRooms();
        });

        socket.on('ticket_created', (data) => {
            if (data && data.ticket) {
                setTickets(prev => [data.ticket, ...prev.filter(t => t._id !== data.ticket._id)]);
                const p = data.ticket.project;
                if (p && p._id && isOngoingOrAmc(p.projectStatus)) {
                    const statusLabel = (p.projectStatus === 'Support' || p.projectStatus?.toLowerCase() === 'amc') ? 'AMC' : 'Ongoing';
                    const pName = p.name || 'Project';
                    setTicketProjects(prev => {
                        if (prev.some(item => item.id === String(p._id))) return prev;
                        return [...prev, { id: String(p._id), name: `${pName} (${statusLabel})` }].sort((a, b) => a.name.localeCompare(b.name));
                    });
                }
            }
        });

        socket.on('new_client_support_response', (data) => {
            if (data && data.ticketId && data.ticket) {
                setTickets(prev => prev.map(t => (t._id === data.ticketId ? data.ticket : t)));
                if (activeTicketRef.current && activeTicketRef.current._id === data.ticketId) {
                    setActiveTicket(data.ticket);
                    api.update(`/api/v1/admin/client-support/${data.ticketId}/read`).catch(() => { });
                }
            }
        });

        socket.on('ticket_updated', (data) => {
            if (data && data.ticketId && data.ticket) {
                setTickets(prev => prev.map(t => (t._id === data.ticketId ? data.ticket : t)));
                if (activeTicketRef.current && activeTicketRef.current._id === data.ticketId) {
                    setActiveTicket(data.ticket);
                }
            }
        });

        return () => {
            socket.emit('leave_admin_support');
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // Also join ticket room when a ticket modal is open
    useEffect(() => {
        if (!socketRef.current || !activeTicket?._id) return;
        socketRef.current.emit('join_ticket', activeTicket._id);
        return () => {
            if (socketRef.current && activeTicket?._id) {
                socketRef.current.emit('leave_ticket', activeTicket._id);
            }
        };
    }, [activeTicket?._id]);

    const isOngoingOrAmc = (status) => {
        if (!status) return true;
        const st = String(status).trim().toLowerCase();
        return st === 'ongoing' || st === 'support' || st === 'amc';
    };

    const [ticketProjects, setTicketProjects] = useState([]);

    // Load ticketed Ongoing / AMC projects on mount
    useEffect(() => {
        api.get('/api/v1/admin/client-support')
            .then(res => {
                if (res && res.data && Array.isArray(res.data.data)) {
                    const pMap = new Map();
                    res.data.data.forEach((t) => {
                        const p = t.project;
                        if (p && p._id && isOngoingOrAmc(p.projectStatus)) {
                            const statusLabel = (p.projectStatus === 'Support' || p.projectStatus?.toLowerCase() === 'amc') ? 'AMC' : 'Ongoing';
                            const pName = p.name || 'Project';
                            pMap.set(String(p._id), {
                                id: String(p._id),
                                name: `${pName} (${statusLabel})`
                            });
                        }
                    });
                    setTicketProjects(Array.from(pMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
                }
            })
            .catch(() => { });
    }, []);

    // Fetch real tickets from backend API
    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedProject && selectedProject !== 'all') {
                params.projectId = selectedProject;
            }
            if (selectedStatus && selectedStatus !== 'all') {
                params.status = selectedStatus;
            }
            if (selectedPriority && selectedPriority !== 'all') {
                params.priority = selectedPriority;
            }
            if (searchTerm && searchTerm.trim()) {
                params.search = searchTerm.trim();
            }

            const res = await api.get('/api/v1/admin/client-support', params);
            if (res && res.data && Array.isArray(res.data.data)) {
                setTickets(res.data.data);
                if (!selectedProject || selectedProject === 'all') {
                    const pMap = new Map();
                    res.data.data.forEach((t) => {
                        const p = t.project;
                        if (p && p._id && isOngoingOrAmc(p.projectStatus)) {
                            const statusLabel = (p.projectStatus === 'Support' || p.projectStatus?.toLowerCase() === 'amc') ? 'AMC' : 'Ongoing';
                            const pName = p.name || 'Project';
                            pMap.set(String(p._id), {
                                id: String(p._id),
                                name: `${pName} (${statusLabel})`
                            });
                        }
                    });
                    setTicketProjects(Array.from(pMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
                }
            } else {
                setTickets([]);
            }
        } catch (err) {
            console.error('Failed to fetch real client support tickets:', err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [selectedProject, selectedStatus, selectedPriority, searchTerm]);

    // Initial load and whenever filters change
    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Only ticketed Ongoing & AMC projects are shown in the dropdown
    const projectsList = ticketProjects;

    // Reset all filters
    const handleResetFilters = () => {
        setSelectedProject('all');
        setSelectedStatus('all');
        setSelectedPriority('all');
        setSearchTerm('');
    };

    // Helper functions for formatting
    const formatCategory = (cat) => {
        switch (cat) {
            case 'bug': return 'Bug Report';
            case 'feature_request': return 'Feature Request';
            case 'technical_issue': return 'Technical Issue';
            case 'general_inquiry': return 'General Inquiry';
            default: return cat ? cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';
        }
    };

    const formatStatus = (st) => {
        switch (st?.toLowerCase()) {
            case 'open': return 'Open';
            case 'in_progress': return 'In Progress';
            case 'resolved': return 'Resolved';
            case 'closed': return 'Closed';
            default: return st || 'Open';
        }
    };

    const formatPriority = (pr) => {
        switch (pr?.toLowerCase()) {
            case 'urgent': return 'Urgent';
            case 'high': return 'High';
            case 'medium': return 'Medium';
            case 'low': return 'Low';
            default: return pr ? pr.toUpperCase() : 'Medium';
        }
    };

    const formatTicketId = (t) => {
        if (!t) return '#TICKET';
        if (t.ticketId) return t.ticketId;
        if (t._id) {
            return `#TICKET-${t._id.slice(-6).toUpperCase()}`;
        }
        return '#TICKET';
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return iso;
        }
    };

    // Priority badge class
    const getPriorityClass = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return 'client-priority-urgent';
            case 'high': return 'client-priority-high';
            case 'medium': return 'client-priority-medium';
            default: return 'client-priority-low';
        }
    };

    // Status badge class
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'client-status-open';
            case 'in_progress': return 'client-status-in-progress';
            case 'resolved': return 'client-status-resolved';
            default: return 'client-status-closed';
        }
    };

    // Statistics counts based on real tickets
    const counts = useMemo(() => {
        const total = tickets.length;
        const open = tickets.filter(t => t.status?.toLowerCase() === 'open').length;
        const inProgress = tickets.filter(t => t.status?.toLowerCase() === 'in_progress').length;
        const resolved = tickets.filter(t => t.status?.toLowerCase() === 'resolved').length;
        return { total, open, inProgress, resolved };
    }, [tickets]);

    // Open ticket split modal
    const handleOpenTicket = async (ticket) => {
        setActiveTicket(ticket);
        setChatInput('');

        // If ticket has unread messages, mark them as read
        const hasUnread = (ticket.unreadByAdmin > 0) || (ticket.responses || []).some(r => !r.isAdminResponse && !r.isReadByAdmin);
        if (hasUnread) {
            setTickets(prev => prev.map(t => (t._id === ticket._id ? { ...t, unreadByAdmin: 0 } : t)));
            setActiveTicket(prev => prev ? { ...prev, unreadByAdmin: 0 } : prev);
            try {
                await api.update(`/api/v1/admin/client-support/${ticket._id}/read`);
            } catch (err) {
                console.error('Error marking ticket as read:', err);
            }
        }
    };

    // Close ticket modal
    const handleCloseTicket = () => {
        setActiveTicket(null);
        setChatInput('');
    };

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (activeTicket && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTicket, activeTicket?.responses]);

    // Update ticket status on backend
    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            setUpdatingStatus(true);
            const backendStatus = newStatus.toLowerCase().replace(/\s+/g, '_');
            const res = await api.update(`/api/v1/admin/client-support/${ticketId}`, { status: backendStatus });

            if (res && res.data && res.data.data) {
                const updatedTicket = res.data.data;
                setTickets(prev => prev.map(t => (t._id === ticketId ? updatedTicket : t)));
                if (activeTicket && activeTicket._id === ticketId) {
                    setActiveTicket(updatedTicket);
                }
            }
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Handle file selection for PM chat attachments
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setPendingFiles(prev => [...prev, ...files]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemovePendingFile = (idx) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== idx));
    };

    // Send PM response message with optional attachments to client via backend
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const hasText = !!chatInput.trim();
        const hasFiles = pendingFiles.length > 0;
        if ((!hasText && !hasFiles) || !activeTicket || sendingMessage) return;

        const messageText = chatInput.trim();
        setSendingMessage(true);

        try {
            let res;
            if (hasFiles) {
                const formData = new FormData();
                if (messageText) formData.append('message', messageText);
                pendingFiles.forEach(file => {
                    formData.append('attachments', file);
                });
                res = await api.createWithFileDocument(
                    `/api/v1/admin/client-support/${activeTicket._id}/response`,
                    formData
                );
            } else {
                res = await api.create(
                    `/api/v1/admin/client-support/${activeTicket._id}/response`,
                    { message: messageText }
                );
            }

            if (res && res.data && res.data.data) {
                const updatedTicket = res.data.data;
                setActiveTicket(updatedTicket);
                setTickets(prev => prev.map(t => (t._id === updatedTicket._id ? updatedTicket : t)));
                setChatInput('');
                setPendingFiles([]);
            }
        } catch (err) {
            console.error('Error sending response to client:', err);
        } finally {
            setSendingMessage(false);
        }
    };

    // Quick PM prompt chip click
    const handleQuickPromptClick = (text) => {
        setChatInput(prev => (prev ? `${prev} ${text}` : text));
    };

    // Helper to download an attachment reliably
    const handleDownloadAttachment = async (url, filename) => {
        if (!url) return;
        const safeFilename = filename || 'attachment.png';

        // 1. Data URLs can be saved directly in browser
        if (url.startsWith('data:')) {
            const a = document.createElement('a');
            a.href = url;
            a.download = safeFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        // 2. Try fetching blob (works if CORS is enabled)
        try {
            const res = await fetch(url, { mode: 'cors' });
            if (res.ok) {
                const blob = await res.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = safeFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
                return;
            }
        } catch (fetchErr) {
            // CORS blocked, fallback to server download endpoint
        }

        // 3. Fallback to server download proxy endpoint which sets Content-Disposition
        const baseUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const proxyUrl = `${baseUrl}/api/v1/admin/client-support/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(safeFilename)}`;
        const a = document.createElement('a');
        a.href = proxyUrl;
        a.download = safeFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="container-fluid pt-3 client-support-page">
            {/* Header */}
            <div className="client-support-header">
                <div>
                    <h3 className="client-support-title">
                        <i className="uil uil-headphones me-2 text-primary"></i>
                        Client Supports
                    </h3>
                    <p className="client-support-subtitle">
                        Filter and resolve client tickets project-wise with real-time direct communication
                    </p>
                </div>
                <div>
                    <button
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                        onClick={fetchTickets}
                        disabled={loading}
                        title="Refresh client tickets from database"
                    >
                        <i className={`uil uil-sync ${loading ? 'spin' : ''}`}></i>
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="client-support-stats-grid">
                <div
                    className={`client-stat-card ${selectedStatus === 'all' ? 'active-filter' : ''}`}
                    onClick={() => setSelectedStatus('all')}
                >
                    <div>
                        <div className="client-stat-label">Total Tickets</div>
                        <div className="client-stat-value">{counts.total}</div>
                    </div>
                    <div className="client-stat-icon-wrap client-stat-icon-all">
                        <i className="uil uil-ticket"></i>
                    </div>
                </div>

                <div
                    className={`client-stat-card ${selectedStatus === 'open' ? 'active-filter' : ''}`}
                    onClick={() => setSelectedStatus('open')}
                >
                    <div>
                        <div className="client-stat-label">Open Tickets</div>
                        <div className="client-stat-value text-warning">{counts.open}</div>
                    </div>
                    <div className="client-stat-icon-wrap client-stat-icon-open">
                        <i className="uil uil-exclamation-triangle"></i>
                    </div>
                </div>

                <div
                    className={`client-stat-card ${selectedStatus === 'in_progress' ? 'active-filter' : ''}`}
                    onClick={() => setSelectedStatus('in_progress')}
                >
                    <div>
                        <div className="client-stat-label">In Progress</div>
                        <div className="client-stat-value text-info">{counts.inProgress}</div>
                    </div>
                    <div className="client-stat-icon-wrap client-stat-icon-progress">
                        <i className="uil uil-clock"></i>
                    </div>
                </div>

                <div
                    className={`client-stat-card ${selectedStatus === 'resolved' ? 'active-filter' : ''}`}
                    onClick={() => setSelectedStatus('resolved')}
                >
                    <div>
                        <div className="client-stat-label">Resolved</div>
                        <div className="client-stat-value text-success">{counts.resolved}</div>
                    </div>
                    <div className="client-stat-icon-wrap client-stat-icon-resolved">
                        <i className="uil uil-check-circle"></i>
                    </div>
                </div>
            </div>

            {/* Client & Project Filtering Bar */}
            <div className="client-support-filter-card">
                <div className="client-filter-title">
                    <i className="uil uil-filter text-primary"></i>
                    Filter Client Support Tickets
                </div>

                <div className="client-filter-row">
                    {/* Client Project Dropdown */}
                    <div className="client-filter-item">
                        <label className="client-filter-label">Select Project</label>
                        <select
                            className="client-filter-select"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="all">All Projects ({projectsList.length})</option>
                            {projectsList.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Dropdown */}
                    <div className="client-filter-item">
                        <label className="client-filter-label">Status</label>
                        <select
                            className="client-filter-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    {/* Priority Dropdown */}
                    <div className="client-filter-item">
                        <label className="client-filter-label">Priority</label>
                        <select
                            className="client-filter-select"
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    {/* Search Input */}
                    <div className="client-filter-item-search">
                        <label className="client-filter-label">Search Tickets</label>
                        <div className="client-filter-search-wrap">
                            <i className="uil uil-search client-filter-search-icon"></i>
                            <input
                                type="text"
                                className="client-filter-input client-filter-search-input"
                                placeholder="Search by Ticket ID, subject, client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div>
                        <button
                            type="button"
                            className="client-filter-reset-btn"
                            onClick={handleResetFilters}
                            title="Reset all filters"
                        >
                            <i className="uil uil-redo"></i> Reset
                        </button>
                    </div>
                </div>

                {/* Active Filter Tags */}
                {(selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || searchTerm) && (
                    <div className="client-active-tags-bar">
                        <span className="text-muted fw-bold me-1">Active filters:</span>
                        {selectedProject !== 'all' && (
                            <span className="client-tag-pill">
                                Project: {projectsList.find(p => p.id === selectedProject)?.name || selectedProject}
                                <span className="client-tag-remove" onClick={() => setSelectedProject('all')}>&times;</span>
                            </span>
                        )}
                        {selectedStatus !== 'all' && (
                            <span className="client-tag-pill">
                                Status: {formatStatus(selectedStatus)}
                                <span className="client-tag-remove" onClick={() => setSelectedStatus('all')}>&times;</span>
                            </span>
                        )}
                        {selectedPriority !== 'all' && (
                            <span className="client-tag-pill">
                                Priority: {formatPriority(selectedPriority)}
                                <span className="client-tag-remove" onClick={() => setSelectedPriority('all')}>&times;</span>
                            </span>
                        )}
                        {searchTerm && (
                            <span className="client-tag-pill">
                                Search: "{searchTerm}"
                                <span className="client-tag-remove" onClick={() => setSearchTerm('')}>&times;</span>
                            </span>
                        )}
                        <span
                            className="text-primary cp ms-2 fw-semibold"
                            style={{ cursor: 'pointer', fontSize: '0.74rem' }}
                            onClick={handleResetFilters}
                        >
                            Clear all
                        </span>
                    </div>
                )}
            </div>

            {/* Tickets Table Card */}
            <div className="client-tickets-table-card">
                <div className="client-table-head-info">
                    <span className="client-table-count">
                        Showing <strong>{tickets.length}</strong> {tickets.length === 1 ? 'ticket' : 'tickets'}
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-5 text-muted">
                        <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }} role="status">
                            <span className="visually-hidden">Loading tickets...</span>
                        </div>
                        <p className="small mt-2 mb-0">Loading real client tickets from database...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <i className="uil uil-comment-alt-slash" style={{ fontSize: '3rem', opacity: 0.4 }}></i>
                        <h6 className="mt-2 text-dark fw-bold">No real client tickets found</h6>
                        <p className="small text-muted mb-3">
                            Tickets created by clients in the client portal will appear here automatically.
                        </p>
                        <button className="btn btn-sm btn-outline-primary" onClick={handleResetFilters}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="client-support-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Title &amp; Category</th>
                                    <th>Client</th>
                                    <th>Project</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map(t => {
                                    const clientName = t.client?.name || 'Client';
                                    const projectName = t.project?.name || 'Project';
                                    const unreadCount = t.unreadByAdmin !== undefined && t.unreadByAdmin !== null
                                        ? t.unreadByAdmin
                                        : (t.responses || []).filter(r => !r.isAdminResponse && !r.isReadByAdmin).length;

                                    return (
                                        <tr key={t._id} className={unreadCount > 0 ? 'client-row-has-unread' : ''}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {unreadCount > 0 && (
                                                        <span className="client-unread-dot" title={`${unreadCount} unread message(s)`}></span>
                                                    )}
                                                    <span className="client-ticket-id-badge">{formatTicketId(t)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="client-ticket-title-link"
                                                    onClick={() => handleOpenTicket(t)}
                                                    title={t.title}
                                                >
                                                    {t.title}
                                                </span>
                                                <span className="client-ticket-category-tag">
                                                    {formatCategory(t.category)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="client-badge-client">
                                                    <div className="client-avatar-dot">
                                                        {clientName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{clientName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="client-project-pill">
                                                    <i className="uil uil-folder me-1 text-primary"></i>
                                                    {projectName}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`client-priority-pill ${getPriorityClass(t.priority)}`}>
                                                    {formatPriority(t.priority)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`client-status-pill ${getStatusClass(t.status)}`}>
                                                    {formatStatus(t.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="small text-muted">{formatDate(t.createdAt)}</span>
                                            </td>
                                            <td className="text-end">
                                                <button
                                                    type="button"
                                                    className={`client-action-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                                                    onClick={() => handleOpenTicket(t)}
                                                    title={unreadCount > 0 ? `${unreadCount} unread message(s) from client` : 'View & Chat'}
                                                >
                                                    <i className="uil uil-comments text-primary"></i>
                                                    <span>View &amp; Chat</span>
                                                    {unreadCount > 0 && (
                                                        <span className="client-action-unread-badge" title={`${unreadCount} new message${unreadCount > 1 ? 's' : ''}`}>
                                                            {unreadCount > 99 ? '99+' : unreadCount}
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Split Ticket Details + Live Chat Modal */}
            {activeTicket && (
                <Modal
                    show={true}
                    onHide={handleCloseTicket}
                    className="client-split-modal"
                    backdropClassName="client-split-modal-backdrop"
                    centered
                    backdrop="static"
                >
                    {/* Header */}
                    <div className="client-modal-header">
                        <div className="client-modal-header-left">
                            <span className="client-modal-ticket-id">{formatTicketId(activeTicket)}</span>
                            <h5 className="client-modal-title">{activeTicket.title}</h5>
                        </div>
                        <button
                            type="button"
                            className="client-modal-close-btn"
                            onClick={handleCloseTicket}
                            title="Close modal"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Split Modal Body */}
                    <div className="client-modal-split-body">
                        {/* Left Column: Ticket Details */}
                        <div className="client-details-pane">
                            {/* Status Change Selector */}
                            <div className="client-pane-section">
                                <div className="client-pane-heading">
                                    <span>Ticket Status</span>
                                    <span className={`client-status-pill ${getStatusClass(activeTicket.status)}`}>
                                        {formatStatus(activeTicket.status)}
                                    </span>
                                </div>
                                <div className="client-status-change-box">
                                    <label className="client-detail-label mb-0">Update Status:</label>
                                    <select
                                        className="client-status-select"
                                        value={ticketStatusToUpdate}
                                        onChange={(e) => setTicketStatusToUpdate(e.target.value)}
                                        disabled={updatingStatus}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                    <button
                                        type="button"
                                        className="client-status-update-btn"
                                        disabled={updatingStatus || ticketStatusToUpdate === activeTicket.status?.toLowerCase()}
                                        onClick={() => handleStatusChange(activeTicket._id, ticketStatusToUpdate)}
                                    >
                                        {updatingStatus ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </div>

                            {/* Ticket Overview Attributes */}
                            <div className="client-pane-section">
                                <div className="client-pane-heading">Overview</div>
                                <div className="client-details-grid">
                                    <div className="client-detail-field">
                                        <span className="client-detail-label">Client Name</span>
                                        <span className="client-detail-value">{activeTicket.client?.name || 'Client'}</span>
                                    </div>
                                    <div className="client-detail-field">
                                        <span className="client-detail-label">Project</span>
                                        <span className="client-detail-value">{activeTicket.project?.name || 'Project'}</span>
                                    </div>
                                    <div className="client-detail-field">
                                        <span className="client-detail-label">Category</span>
                                        <span className="client-detail-value">{formatCategory(activeTicket.category)}</span>
                                    </div>
                                    <div className="client-detail-field">
                                        <span className="client-detail-label">Priority</span>
                                        <span className={`client-detail-value client-priority-pill ${getPriorityClass(activeTicket.priority)}`}>
                                            {formatPriority(activeTicket.priority)}
                                        </span>
                                    </div>
                                    <div className="client-detail-field" style={{ gridColumn: 'span 2' }}>
                                        <span className="client-detail-label">Date Submitted</span>
                                        <span className="client-detail-value">{formatDate(activeTicket.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Full Description */}
                            <div className="client-pane-section">
                                <div className="client-pane-heading">Description</div>
                                <p className="client-desc-text">{activeTicket.description || 'No description provided.'}</p>
                            </div>

                            {/* Screenshots / Attachments Grid */}
                            {activeTicket.screenshots && activeTicket.screenshots.length > 0 && (
                                <div className="client-pane-section client-pane-attachments">
                                    <div className="client-pane-heading">
                                        <span>Attachments ({activeTicket.screenshots.length})</span>
                                        <span className="small text-muted">Click to preview</span>
                                    </div>
                                    <div className="client-attachments-grid">
                                        {activeTicket.screenshots.map((s, idx) => {
                                            const sUrl = typeof s === 'string' ? s : s?.url;
                                            const sName = typeof s === 'object' ? (s.originalName || s.name || `Attachment_${idx + 1}.png`) : `Attachment_${idx + 1}.png`;
                                            return (
                                                <div key={idx} className="client-attachment-thumb-card">
                                                    <div
                                                        className="client-attachment-thumb"
                                                        onClick={() => setPreviewImage(s)}
                                                        title={`Click to view ${sName}`}
                                                    >
                                                        <img src={sUrl} alt={sName} />
                                                        <div className="client-attachment-overlay">
                                                            <span className="client-thumb-action-btn" title="Preview image">
                                                                <i className="uil uil-eye"></i>
                                                            </span>
                                                            <span
                                                                className="client-thumb-action-btn"
                                                                title="Download attachment"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDownloadAttachment(sUrl, sName);
                                                                }}
                                                            >
                                                                <i className="uil uil-download-alt"></i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="client-thumb-caption">
                                                        <span className="client-thumb-filename" title={sName}>{sName}</span>
                                                        <button
                                                            type="button"
                                                            className="client-thumb-dl-btn"
                                                            title="Download attachment"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadAttachment(sUrl, sName);
                                                            }}
                                                        >
                                                            <i className="uil uil-download-alt"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Direct Live PM-Client Chat */}
                        <div className="client-chat-pane">
                            {/* Chat Topbar */}
                            <div className="client-chat-topbar">
                                <div className="client-chat-client-info">
                                    <div className="client-chat-avatar">
                                        {(activeTicket.client?.name || 'C').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="client-chat-name">{activeTicket.client?.name || 'Client'}</div>
                                    </div>
                                </div>

                                <div className="client-project-pill">
                                    <i className="uil uil-folder me-1 text-primary"></i>
                                    {activeTicket.project?.name || 'Project'}
                                </div>
                            </div>

                            {/* Message Thread */}
                            <div className="client-chat-messages">
                                {(!activeTicket.responses || activeTicket.responses.length === 0) ? (
                                    <div className="text-center py-4 text-muted">
                                        <i className="uil uil-comments" style={{ fontSize: '2rem', opacity: 0.5 }}></i>
                                        <p className="small mt-2 mb-0">No messages in this ticket yet.</p>
                                        <p className="small text-muted">Send a message below to reach out directly to the client.</p>
                                    </div>
                                ) : (
                                    activeTicket.responses.map((msg, index) => {
                                        const isPM = msg.isAdminResponse || msg.sender === 'pm';
                                        const senderName = isPM
                                            ? 'You'
                                            : msg.respondedBy?.name || activeTicket.client?.name || 'Client';

                                        return (
                                            <div
                                                key={msg._id || index}
                                                className={`client-msg-row ${isPM ? 'outgoing' : 'incoming'}`}
                                            >
                                                <div className={`client-msg-avatar ${isPM ? 'pm' : 'client'}`}>
                                                    {isPM ? 'PM' : (activeTicket.client?.name || 'C').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="client-msg-bubble-wrap">
                                                    <span className="client-msg-sender-name">
                                                        {senderName}
                                                    </span>
                                                    {msg.message && (
                                                        <div className="client-msg-bubble">
                                                            {msg.message}
                                                        </div>
                                                    )}

                                                    {/* Attachments rendering */}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="client-msg-attachments-wrap">
                                                            {msg.attachments.map((att, attIdx) => {
                                                                const isImg = att.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(att.originalName || att.url || '');
                                                                if (isImg) {
                                                                    return (
                                                                        <div key={attIdx} className="client-msg-attachment-item">
                                                                            <div
                                                                                className="client-msg-img-attachment"
                                                                                onClick={() => setPreviewImage(att)}
                                                                                title={`Click to preview ${att.originalName || 'Image'}`}
                                                                            >
                                                                                <img src={att.url} alt={att.originalName || 'Attachment'} />
                                                                                <div className="client-msg-img-overlay">
                                                                                    <span className="client-msg-overlay-btn" title="Preview image">
                                                                                        <i className="uil uil-eye"></i>
                                                                                    </span>
                                                                                    <span
                                                                                        className="client-msg-overlay-btn"
                                                                                        title="Download image"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDownloadAttachment(att.url, att.originalName || 'image.png');
                                                                                        }}
                                                                                    >
                                                                                        <i className="uil uil-download-alt"></i>
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="client-msg-att-footer">
                                                                                <span className="client-msg-att-name" title={att.originalName || 'Image'}>
                                                                                    {att.originalName || 'Image'}
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    className="client-msg-download-icon-btn"
                                                                                    title="Download image"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleDownloadAttachment(att.url, att.originalName || 'image.png');
                                                                                    }}
                                                                                >
                                                                                    <i className="uil uil-download-alt"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                return (
                                                                    <div
                                                                        key={attIdx}
                                                                        className="client-msg-doc-attachment"
                                                                        onClick={() => handleDownloadAttachment(att.url, att.originalName || 'Document')}
                                                                        title={`Download ${att.originalName || 'Document'}`}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        <i className="uil uil-file-alt"></i>
                                                                        <span className="client-msg-doc-name">{att.originalName || 'Document'}</span>
                                                                        <button
                                                                            type="button"
                                                                            className="client-msg-download-icon-btn ms-auto"
                                                                            title="Download file"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDownloadAttachment(att.url, att.originalName || 'Document');
                                                                            }}
                                                                        >
                                                                            <i className="uil uil-download-alt"></i>
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    <div className="client-msg-meta">
                                                        <span>{formatDate(msg.respondedAt || msg.createdAt)}</span>
                                                        {isPM && <i className="uil uil-check-circle text-primary ms-1"></i>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Quick PM Prompt Chips */}
                            <div className="client-quick-prompts-bar">
                                {QUICK_PM_RESPONSES.map((chip, i) => (
                                    <span
                                        key={i}
                                        className="client-prompt-chip"
                                        onClick={() => handleQuickPromptClick(chip)}
                                    >
                                        + {chip}
                                    </span>
                                ))}
                            </div>

                            {/* Pending Attachments Bar */}
                            {pendingFiles.length > 0 && (
                                <div className="client-chat-pending-files-bar">
                                    {pendingFiles.map((file, idx) => {
                                        const isImage = file.type.startsWith('image/');
                                        return (
                                            <div key={idx} className="client-chat-pending-chip">
                                                {isImage ? (
                                                    <img src={URL.createObjectURL(file)} alt="preview" />
                                                ) : (
                                                    <i className="uil uil-file-alt text-primary"></i>
                                                )}
                                                <span className="client-chat-pending-name">{file.name}</span>
                                                <button
                                                    type="button"
                                                    className="client-chat-pending-remove"
                                                    onClick={() => handleRemovePendingFile(idx)}
                                                    title="Remove file"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Chat Input Bar */}
                            <form className="client-chat-input-area" onSubmit={handleSendMessage}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    className="client-chat-attach-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Attach screenshots or files"
                                    disabled={sendingMessage}
                                >
                                    <i className="uil uil-paperclip"></i>
                                </button>
                                <textarea
                                    className="client-chat-textarea"
                                    rows="1"
                                    placeholder="Type your response to the client..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="client-chat-send-btn"
                                    disabled={(!chatInput.trim() && pendingFiles.length === 0) || sendingMessage}
                                >
                                    <i className="uil uil-message"></i> {sendingMessage ? 'Sending...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Lightbox Modal for Screenshots Preview */}
            {previewImage && (() => {
                const previewUrl = typeof previewImage === 'string' ? previewImage : (previewImage?.url || '');
                const previewName = typeof previewImage === 'object' ? (previewImage.originalName || previewImage.name || 'screenshot.png') : 'screenshot.png';
                return (
                    <div
                        className="client-lightbox-overlay"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div
                            className="client-lightbox-topbar"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="client-lightbox-left">
                                <div className="client-lightbox-icon">
                                    <i className="uil uil-image"></i>
                                </div>
                                <div className="client-lightbox-title-wrap">
                                    <div className="client-lightbox-filename">{previewName}</div>
                                    <div className="client-lightbox-subtitle">Ticket attachment preview</div>
                                </div>
                            </div>
                            <div className="client-lightbox-actions">
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="client-lightbox-tool-btn"
                                    title="Open image in new tab"
                                >
                                    <i className="uil uil-external-link-alt"></i>
                                    <span>Open Original</span>
                                </a>
                                <button
                                    type="button"
                                    className="client-lightbox-download-btn"
                                    onClick={() => handleDownloadAttachment(previewUrl, previewName)}
                                    title="Download full size image"
                                >
                                    <i className="uil uil-download-alt"></i>
                                    <span>Download</span>
                                </button>
                                <button
                                    type="button"
                                    className="client-lightbox-close"
                                    onClick={() => setPreviewImage(null)}
                                    title="Close image preview (Esc)"
                                >
                                    &times;
                                </button>
                            </div>
                        </div>

                        <div className="client-lightbox-stage">
                            <img
                                src={previewUrl}
                                alt={previewName}
                                className="client-lightbox-img"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default ClientSupport;
