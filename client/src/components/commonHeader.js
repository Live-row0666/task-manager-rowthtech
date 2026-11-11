import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { logoutUser } from "../redux/actions";
import DependencyAlerts from "./DependencyAlerts";

const CommonHeader = ({ title }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.Auth.user);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifFilter, setNotifFilter] = useState("all"); // 'all' | 'unread'
    const [notifications, setNotifications] = useState([]);

    const name = user?.username || user?.name || "LegalTech Client";
    const initials = name
        ? name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "LC"
        : "LC";

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsNotifOpen(false);
            }
        };
        if (isNotifOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isNotifOpen]);

    const unreadCount = useMemo(() => {
        return notifications.filter((n) => !n.isRead).length;
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        if (notifFilter === "unread") {
            return notifications.filter((n) => !n.isRead);
        }
        return notifications;
    }, [notifications, notifFilter]);

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleDismissNotif = (id, e) => {
        e.stopPropagation();
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleNotificationClick = (notif) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setIsNotifOpen(false);
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const getNotifIconConfig = (type) => {
        switch (type) {
            case "milestone":
                return { className: "notif-item-icon notif-icon-milestone", icon: "bi-flag-fill" };
            case "task":
                return { className: "notif-item-icon notif-icon-task", icon: "bi-check2-circle" };
            case "doc":
                return { className: "notif-item-icon notif-icon-doc", icon: "bi-file-earmark-text-fill" };
            case "support":
                return { className: "notif-item-icon notif-icon-support", icon: "bi-headset" };
            default:
                return { className: "notif-item-icon notif-icon-system", icon: "bi-bell-fill" };
        }
    };

    return (
        <>
            <header className="dash-header">
                <div className="header-left-group">
                    <button
                        type="button"
                        className="btn-mobile-sidebar-toggle"
                        onClick={() => document.body.classList.toggle("sidebar-mobile-open")}
                        title="Toggle navigation menu"
                        aria-label="Toggle navigation"
                    >
                        <i className="bi bi-list"></i>
                    </button>
                    <div className="header-page-title">
                        {typeof title === "string" ? <h3>{title}</h3> : title}
                    </div>
                </div>

                <div className="header-actions">
                    <DependencyAlerts userId={user?._id || user?.id} />
                    {/* Notification Bell Trigger */}
                    <button
                        className={`notification-btn ${isNotifOpen ? "active" : ""}`}
                        title="Notifications"
                        type="button"
                        onClick={() => setIsNotifOpen(true)}
                        aria-expanded={isNotifOpen}
                    >
                        <i className="bi bi-bell"></i>
                        {unreadCount > 0 && <span className="notification-badge"></span>}
                    </button>

                    {/* User Profile Pill (Displays only client name) */}
                    <div className="user-profile-card">
                        <div className="user-avatar-circle">{initials}</div>
                        <span className="user-profile-name">{name}</span>
                    </div>

                    <button
                        className="logout-btn-styled"
                        onClick={() => dispatch(logoutUser())}
                        title="Logout session"
                        type="button"
                    >
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Right-To-Left Slide-Over Backdrop */}
            <div
                className={`notif-backdrop ${isNotifOpen ? "open" : ""}`}
                onClick={() => setIsNotifOpen(false)}
                aria-hidden="true"
            />

            {/* Right-To-Left Slide-Over Modal Drawer */}
            <aside
                className={`notif-drawer-modal ${isNotifOpen ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="notif-drawer-title"
            >
                {/* Drawer Header */}
                <div className="notif-drawer-header">
                    <div className="notif-header-left">
                        <div className="notif-header-icon">
                            <i className="bi bi-bell-fill"></i>
                        </div>
                        <div>
                            <h3 className="notif-header-title" id="notif-drawer-title">
                                Notifications
                            </h3>
                        </div>
                        {unreadCount > 0 && (
                            <span className="notif-unread-count">{unreadCount} New</span>
                        )}
                    </div>

                    <button
                        type="button"
                        className="notif-close-btn"
                        onClick={() => setIsNotifOpen(false)}
                        title="Close notifications"
                        aria-label="Close notifications"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Sub-Header Tabs & Mark Read */}
                <div className="notif-drawer-tabs">
                    <div className="notif-tab-pills">
                        <button
                            type="button"
                            className={`notif-tab-btn ${notifFilter === "all" ? "active" : ""}`}
                            onClick={() => setNotifFilter("all")}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            type="button"
                            className={`notif-tab-btn ${notifFilter === "unread" ? "active" : ""}`}
                            onClick={() => setNotifFilter("unread")}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            className="notif-mark-read-btn"
                            onClick={handleMarkAllAsRead}
                        >
                            <i className="bi bi-check2-all"></i>
                            <span>Mark all read</span>
                        </button>
                    )}
                </div>

                {/* Drawer Body Notification List */}
                <div className="notif-drawer-body">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((n) => {
                            const iconConfig = getNotifIconConfig(n.type);
                            return (
                                <div
                                    key={n.id}
                                    className={`notif-item-card ${!n.isRead ? "unread" : ""}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div className={iconConfig.className}>
                                        <i className={`bi ${iconConfig.icon}`}></i>
                                    </div>

                                    <div className="notif-item-content">
                                        <div className="notif-item-title-row">
                                            <span className="notif-item-title">{n.title}</span>
                                            {!n.isRead && <span className="notif-dot-unread"></span>}
                                        </div>
                                        <p className="notif-item-desc">{n.desc}</p>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="notif-item-time">
                                                <i className="bi bi-clock"></i>
                                                <span>{n.time}</span>
                                            </span>
                                            <button
                                                type="button"
                                                className="notif-dismiss-btn"
                                                onClick={(e) => handleDismissNotif(n.id, e)}
                                                title="Dismiss notification"
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="notif-empty-state">
                            <div className="notif-empty-icon">
                                <i className="bi bi-bell-slash"></i>
                            </div>
                            <h4 className="notif-empty-title">All Caught Up!</h4>
                            <p className="notif-empty-desc">
                                {notifFilter === "unread"
                                    ? "You have no unread notifications at the moment."
                                    : "You have no new alerts or notifications."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Drawer Footer */}
                {notifications.length > 0 && (
                    <div className="notif-drawer-footer">
                        <button
                            type="button"
                            className="notif-footer-action danger"
                            onClick={handleClearAll}
                        >
                            <i className="bi bi-trash me-1"></i>
                            <span>Clear all</span>
                        </button>
                        <Link
                            to="/dashboard"
                            className="notif-footer-action"
                            onClick={() => setIsNotifOpen(false)}
                        >
                            <span>View Dashboard</span>
                            <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
};

export default CommonHeader;
