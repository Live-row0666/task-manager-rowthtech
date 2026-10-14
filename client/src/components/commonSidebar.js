import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import config from "../config";
import { APICore } from "../helpers/api/apiCore";
import Logo from "../assets/images/logo/logo.webp";

const api = new APICore();

const CommonSidebar = ({ active }) => {
    const location = useLocation();

    const [hasSupportUpdate, setHasSupportUpdate] = useState(false);
    const [hasDependencyUpdate, setHasDependencyUpdate] = useState(false);

    const closeMobileSidebar = () => {
        document.body.classList.remove('sidebar-mobile-open');
    };

    // Auto-close mobile sidebar whenever route changes
    useEffect(() => {
        closeMobileSidebar();
    }, [location.pathname]);

    // Auto-clear notification dots when user is viewing the respective section
    useEffect(() => {
        if (active === "support" || location.pathname.includes('/support')) {
            setHasSupportUpdate(false);
        }
        if (active === "dependencies" || location.pathname.includes('/dependencies')) {
            setHasDependencyUpdate(false);
        }
    }, [active, location.pathname]);

    // Fetch initial notification/update counts from server
    const checkUpdates = useCallback(async () => {
        try {
            const [supportRes, depRes] = await Promise.allSettled([
                api.get('/api/v1/client/support/unread-count'),
                api.get('/api/v1/client/dependency/stats')
            ]);

            if (supportRes.status === 'fulfilled' && supportRes.value?.data) {
                const data = supportRes.value.data.data || supportRes.value.data;
                if (data.hasUpdates || data.unreadCount > 0) {
                    if (active !== 'support' && !window.location.pathname.includes('/support')) {
                        setHasSupportUpdate(true);
                    }
                }
            }

            if (depRes.status === 'fulfilled' && depRes.value?.data) {
                const data = depRes.value.data.data || depRes.value.data;
                if (data.hasUpdates || data.unreadCount > 0 || data.pending > 0) {
                    if (active !== 'dependencies' && !window.location.pathname.includes('/dependencies')) {
                        setHasDependencyUpdate(true);
                    }
                }
            }
        } catch (e) { }
    }, [active]);

    // Real-time socket events for support and dependency updates
    useEffect(() => {
        const user = api.getLoggedInUser();
        const userId = user?._id || user?.id;
        if (!userId) return;

        checkUpdates();

        const socketServerUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const socket = io(socketServerUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            timeout: 20000
        });

        const joinRoom = () => {
            socket.emit('join_client_channel', userId);
        };
        joinRoom();
        socket.on('connect', joinRoom);

        // Support tickets updates
        const onSupportUpdate = () => {
            if (active !== 'support' && !window.location.pathname.includes('/support')) {
                setHasSupportUpdate(true);
            }
        };
        socket.on('ticket_updated', onSupportUpdate);
        socket.on('support_updated', onSupportUpdate);
        socket.on('new_client_support_response', onSupportUpdate);

        // Dependency updates
        const onDepUpdate = () => {
            if (active !== 'dependencies' && !window.location.pathname.includes('/dependencies')) {
                setHasDependencyUpdate(true);
            }
        };
        socket.on('new_dependency_assigned', onDepUpdate);
        socket.on('dependency_status_changed', onDepUpdate);
        socket.on('dependency_updated', onDepUpdate);

        return () => {
            socket.disconnect();
        };
    }, [checkUpdates, active]);

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            <div
                className="sidebar-mobile-backdrop"
                onClick={closeMobileSidebar}
                aria-hidden="true"
            />

            <aside className="dash-sidebar">
                <div className="sidebar-logo">
                    <Link to="/dashboard" onClick={closeMobileSidebar} className="d-flex align-items-center">
                        <img src={Logo} alt="RowthTech" />
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        className="btn-sidebar-close-mobile"
                        onClick={closeMobileSidebar}
                        title="Close menu"
                        aria-label="Close navigation"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <Link
                            to="/dashboard"
                            className={`menu-item-link ${active === "dashboard" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-grid-fill"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/milestones"
                            className={`menu-item-link ${active === "milestones" || active === "milestone-task" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-flag"></i>
                            <span>Milestones</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/dashboard/dependencies"
                            className={`menu-item-link ${active === "dependencies" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-stack"></i>
                            <span>Dependencies</span>
                            {hasDependencyUpdate && (
                                <span className="client-sidebar-green-dot" title="New updates available"></span>
                            )}
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/documents"
                            className={`menu-item-link ${active === "documents" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-file-earmark-text"></i>
                            <span>Documents</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/reports"
                            className={`menu-item-link ${active === "reports" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-bar-chart"></i>
                            <span>Reports</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/team"
                            className={`menu-item-link ${active === "team" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-people"></i>
                            <span>Team</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/support"
                            className={`menu-item-link ${active === "support" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-headset"></i>
                            <span>Support</span>
                            {hasSupportUpdate && (
                                <span className="client-sidebar-green-dot" title="New updates available"></span>
                            )}
                        </Link>
                    </li>
                </ul>

                <div className="sidebar-help-card">
                    <div className="help-icon-wrapper">
                        <i className="bi bi-question-circle"></i>
                    </div>

                    <h6>Need Help?</h6>
                    <p>Our support team is here to help you.</p>

                    <Link
                        to="/dashboard/support"
                        className="btn-contact-support text-decoration-none d-block text-center"
                        onClick={closeMobileSidebar}
                    >
                        Contact Support
                    </Link>
                </div>

                <div className="sidebar-footer">
                    © 2025 RowthTech Limited.
                    <br />
                    All rights reserved.
                </div>
            </aside>
        </>
    );
};

export default CommonSidebar;