import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { APICore } from '../helpers/api/apiCore';
import './ClientLoginHistory.css';

const api = new APICore();
const PAGE_SIZE = 20;

const ClientLoginHistory = () => {
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [data, setData] = useState({ data: [], total: 0, recentCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const requestRef = useRef(0);

    const refresh = useCallback(async () => {
        const request = ++requestRef.current;
        try {
            const res = await api.get('/api/v1/admin/client-login-history', { page: open ? page : 1, limit: PAGE_SIZE });
            if (request !== requestRef.current) return;
            setData(res.data);
            setError('');
        } catch {
            if (request === requestRef.current) setError('Unable to load client login history. Please retry.');
        } finally {
            if (request === requestRef.current) setLoading(false);
        }
    }, [open, page]);

    useEffect(() => {
        setLoading(true);
        refresh();
        // Authenticated polling keeps login metadata out of public socket rooms.
        const interval = setInterval(refresh, 30000);
        window.addEventListener('focus', refresh);
        return () => {
            requestRef.current += 1;
            clearInterval(interval);
            window.removeEventListener('focus', refresh);
        };
    }, [refresh]);

    return (
        <>
            <button type="button" className="btn btn-light btn-sm position-relative me-2"
                title="Client logins in the last 24 hours" aria-label={`Client login history: ${data.recentCount} in last 24 hours`}
                onClick={() => { setPage(1); setOpen(true); }}>
                <i className="uil uil-signin me-1" aria-hidden="true"></i>
                Client Logins <span className="badge bg-primary ms-1">{data.recentCount}</span>
            </button>
            <Modal show={open} onHide={() => setOpen(false)} size="xl" centered scrollable className="client-login-history-modal">
                <Modal.Header>
                    <Modal.Title className="client-login-history-title"><i className="uil uil-signin" aria-hidden="true"></i> Client Login History</Modal.Title>
                    <button type="button" className="client-login-history-close" aria-label="Close" onClick={() => setOpen(false)}>
                        <i className="uil uil-times" aria-hidden="true"></i>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <p className="client-login-history-note">Successful client portal logins. Device details are browser estimates; location is approximate. Times use your browser’s timezone.</p>
                    {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={refresh}>Retry</button></div>}
                    {loading ? <p role="status">Loading login history...</p> : (
                        <div className="table-responsive client-login-history-table-wrap">
                            <table className="table table-hover align-middle mb-0 client-login-history-table">
                                <thead className="table-light"><tr>
                                    <th>Client</th><th>Project</th><th>Login Time</th><th>IP / Location</th><th>Device / Browser</th><th>Portal</th>
                                </tr></thead>
                                <tbody>
                                    {data.data.map((event) => (
                                        <tr key={event._id}>
                                            <td><strong>{event.clientName}</strong><div className="small text-muted">{event.clientEmail}</div></td>
                                            <td><div className="client-login-history-projects">{event.projects.length ? event.projects.map(project => <span key={project._id} className="client-login-history-project">{project.name}</span>) : '—'}</div></td>
                                            <td className="text-nowrap"><div>{new Date(event.loggedInAt).toLocaleDateString()}</div><div className="small text-muted">{new Date(event.loggedInAt).toLocaleTimeString()}</div></td>
                                            <td><div className="client-login-history-ip">{event.ip || 'Unavailable'}</div>
                                                <div className="small text-muted">{[event.location?.city, event.location?.region, event.location?.country].filter(Boolean).join(', ') || 'Location unavailable'}</div>
                                                {event.reportedTimezone && <div className="small text-muted">Reported timezone: {event.reportedTimezone}</div>}
                                            </td>
                                            <td>{event.device} / {event.os}<div className="small text-muted">{event.browser}</div></td>
                                            <td className="client-login-history-portal" title={event.portalOrigin}>{event.portalOrigin}</td>
                                        </tr>
                                    ))}
                                    {!data.data.length && <tr><td colSpan="6" className="text-center text-muted py-4">No client logins recorded yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="justify-content-between">
                    <span className="small text-muted">{data.total} {data.total === 1 ? 'login' : 'logins'} · Page {page}</span>
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || page * PAGE_SIZE >= data.total} onClick={() => setPage(value => value + 1)}>Next</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ClientLoginHistory;
