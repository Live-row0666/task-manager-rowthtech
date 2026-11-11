import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from '../config';
import { APICore } from '../helpers/api/apiCore';
import './DependencyAlerts.css';

const api = new APICore();
const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

export const getOutstandingDependencies = (dependencies) => dependencies
    .filter((dep) => !['approved', 'completed', 'submitted'].includes(dep.status))
    .sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));

const DependencyAlerts = ({ userId }) => {
    const [dependencies, setDependencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);
    const refreshRef = useRef(null);

    useEffect(() => {
        if (!userId) return;
        let active = true;
        let requestId = 0;
        const refresh = async () => {
            const currentRequest = ++requestId;
            try {
                // Load every project and status independently of the page filters.
                const res = await api.get('/api/v1/client/dependency');
                const list = res?.data?.data || res?.data;
                if (!Array.isArray(list)) throw new Error('Invalid dependency response');
                if (active && currentRequest === requestId) {
                    setDependencies(getOutstandingDependencies(list));
                    setError(false);
                }
            } catch (err) {
                if (active && currentRequest === requestId) setError(true);
            } finally {
                if (active && currentRequest === requestId) setLoading(false);
            }
        };

        refreshRef.current = refresh;
        refresh();
        const socketUrl = config.API_URL || `${window.location.protocol}//${window.location.hostname}:9100`;
        const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
        socket.on('connect', () => {
            socket.emit('join_client_channel', userId);
            refresh();
        });
        ['new_dependency_assigned', 'dependency_created', 'dependency_updated',
            'dependency_status_changed', 'dependency_deleted'].forEach((event) => socket.on(event, refresh));
        window.addEventListener('focus', refresh);
        return () => {
            active = false;
            refreshRef.current = null;
            socket.disconnect();
            window.removeEventListener('focus', refresh);
        };
    }, [userId]);

    return (
        <Dropdown className="dependency-alerts" align="end" show={open} onToggle={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen) refreshRef.current?.();
        }}>
            <Dropdown.Toggle
                id="dependency-alert-toggle"
                className="notification-btn dependency-alert-toggle"
                variant="light"
                title="Dependency alerts"
                aria-label={`Dependency alerts: ${dependencies.length} outstanding`}
            >
                <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                {dependencies.length > 0 && <span className="dependency-alert-count">{dependencies.length}</span>}
            </Dropdown.Toggle>
            <Dropdown.Menu className="dependency-alert-menu">
                <Dropdown.Header className="dependency-alert-heading">
                    <span><i className="bi bi-exclamation-triangle" aria-hidden="true"></i> Dependency Alerts</span>
                    <span className="dependency-alert-total">{dependencies.length}</span>
                </Dropdown.Header>
                <div className="dependency-alert-columns"><span>Requirement &amp; Context</span><span>Priority</span></div>
                <div className="dependency-alert-list">
                    {loading ? (
                        <p className="dependency-alert-message" role="status">Loading dependencies...</p>
                    ) : error ? (
                        <p className="dependency-alert-message" role="status">Unable to load dependency alerts. Open Dependencies to try again.</p>
                    ) : dependencies.length === 0 ? (
                        <p className="dependency-alert-message">No outstanding dependencies.</p>
                    ) : dependencies.map((dep) => (
                        <Dropdown.Item as={Link} to={`/dashboard/dependencies?dependency=${encodeURIComponent(dep._id)}`} key={dep._id} className="dependency-alert-item">
                            <span className="dependency-alert-context">
                                <span className="dependency-alert-title">{dep.title}</span>
                                {dep.description && <span className="dependency-alert-description">{dep.description}</span>}
                            </span>
                            <span className="dependency-alert-meta">
                                <span className={`dependency-alert-priority ${dep.priority}`}>{dep.priority || 'Other'}</span>
                            </span>
                        </Dropdown.Item>
                    ))}
                </div>
                <Dropdown.Item as={Link} to="/dashboard/dependencies" className="dependency-alert-footer">
                    View all dependencies <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default DependencyAlerts;
