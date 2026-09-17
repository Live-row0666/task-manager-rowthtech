import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Row, Col, Card } from 'react-bootstrap';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../../redux/notifications/api';
import './notifications.css';

const UserNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = { limit: 100 };
            if (filter === 'unread') params.isRead = false;
            if (filter === 'read') params.isRead = true;

            const response = await getNotifications(params);
            if (response && response.data) {
                setNotifications(Array.isArray(response.data.data) ? response.data.data : []);
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications(notifications.map(notif =>
                notif._id === notificationId
                    ? { ...notif, isRead: true, readAt: new Date() }
                    : notif
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
            window.dispatchEvent(new CustomEvent('notificationUpdated'));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(notif => ({
                ...notif,
                isRead: true,
                readAt: new Date()
            })));
            setUnreadCount(0);
            window.dispatchEvent(new CustomEvent('notificationUpdated'));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            const deletedNotif = notifications.find(n => n._id === notificationId);
            setNotifications(notifications.filter(notif => notif._id !== notificationId));
            if (!deletedNotif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            window.dispatchEvent(new CustomEvent('notificationUpdated'));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'task_assigned': '📋',
            'task_update': '🔄',
            'task_comment': '💬',
            'project_update': '📁',
            'deadline_reminder': '⏰',
            'default': '🔔'
        };
        return icons[type] || icons.default;
    };

    const getNotificationColor = (type) => {
        const colors = {
            'task_assigned': '#6366f1',
            'task_update': '#06b6d4',
            'task_comment': '#10b981',
            'project_update': '#f59e0b',
            'deadline_reminder': '#ef4444'
        };
        return colors[type] || '#64748b';
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return notifDate.toLocaleDateString();
    };

    const loadingSkeleton = () => (
        <div className="d-flex flex-column gap-3 p-3">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                    className="d-flex gap-3 p-3"
                >
                    <div className="rounded-circle bg-light" style={{ width: 40, height: 40 }} />
                    <div className="flex-grow-1">
                        <div className="bg-light rounded mb-2" style={{ height: 16, width: '60%' }} />
                        <div className="bg-light rounded" style={{ height: 14, width: '80%' }} />
                    </div>
                </motion.div>
            ))}
        </div>
    );

    return (
        <>
            <Row>
                <Col className='px-0'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 pb-0 px-2">
                                <div className="d-flex mt-0 mb-2 align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <button
                                            onClick={() => setFilter('all')}
                                            className={`btn fw-semibold px-2 rounded-0 ${filter === 'all' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setFilter('unread')}
                                            className={`btn fw-semibold px-2 rounded-0 ${filter === 'unread' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                        >
                                            Unread
                                            {unreadCount > 0 && (
                                                <span
                                                    className="badge bg-danger text-white ms-1"
                                                    style={{
                                                        fontSize: '9px',
                                                        minWidth: '16px',
                                                        height: '16px',
                                                        borderRadius: '50%',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        lineHeight: '2'
                                                    }}
                                                >
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setFilter('read')}
                                            className={`btn fw-semibold px-2 rounded-0 ${filter === 'read' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                        >
                                            Read
                                        </button>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="btn bg-dark text-white fw-semibold"
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                        >
                                            Mark All Read
                                        </button>
                                    )}
                                </div>
                            </Card.Header>
                            <Card.Body className="p-1" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                                {loading ? (
                                    loadingSkeleton()
                                ) : notifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-5"
                                        style={{
                                            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
                                            borderRadius: '16px',
                                            margin: '20px'
                                        }}
                                    >
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ repeat: Infinity, repeatType: "mirror", duration: 2 }}
                                            style={{
                                                fontSize: '2.5rem',
                                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                                            }}
                                        >
                                            🔔
                                        </motion.div>
                                        <h5 className="mt-3 fw-bold" style={{ color: '#1e293b' }}>No Notifications</h5>
                                        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                            {filter === 'unread'
                                                ? "You're all caught up! 🎉"
                                                : filter === 'read'
                                                    ? "No read notifications found."
                                                    : "You don't have any notifications yet."
                                            }
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="notification-container" style={{ height: '75vh', overflowY: 'auto', overflowX: 'hidden', padding: '4px' }}>
                                        <AnimatePresence>
                                            {notifications.map((notification, index) => (
                                                <motion.div
                                                    key={notification._id}
                                                    layout
                                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                                    className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
                                                    style={{
                                                        background: !notification.isRead
                                                            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                                                            : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                                                        border: !notification.isRead
                                                            ? `1px solid ${getNotificationColor(notification.type)}20`
                                                            : '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        padding: '8px',
                                                        marginBottom: '4px',
                                                        // cursor: 'pointer',
                                                        position: 'relative',
                                                        boxShadow: !notification.isRead
                                                            ? `0 2px 8px ${getNotificationColor(notification.type)}10, 0 1px 3px rgba(0,0,0,0.05)`
                                                            : '0 1px 3px rgba(0,0,0,0.05)',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        transform: 'translateZ(0)'
                                                    }}
                                                >
                                                    {/* Priority stripe */}
                                                    {!notification.isRead && (
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '4px',
                                                                height: '100%',
                                                                background: `linear-gradient(180deg, ${getNotificationColor(notification.type)} 0%, ${getNotificationColor(notification.type)}80 100%)`,
                                                                borderRadius: '12px 0 0 12px'
                                                            }}
                                                        />
                                                    )}

                                                    <div className="d-flex align-items-start gap-2 mx-2">
                                                        {/* Enhanced Icon */}
                                                        <div
                                                            className="notification-icon d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                                                            style={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: '8px',
                                                                background: `linear-gradient(135deg, ${getNotificationColor(notification.type)}15 0%, ${getNotificationColor(notification.type)}25 100%)`,
                                                                border: `2px solid ${getNotificationColor(notification.type)}20`,
                                                                color: getNotificationColor(notification.type),
                                                                fontSize: '16px',
                                                                fontWeight: '600',
                                                                paddingTop: '-10px',
                                                                boxShadow: `0 2px 4px ${getNotificationColor(notification.type)}10`
                                                            }}
                                                        >
                                                            {getNotificationIcon(notification.type)}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-grow-1 min-w-0">
                                                            <div className="d-flex justify-content-between align-items-start mb-0">
                                                                <h6 className="notification-title mb-0" style={{
                                                                    fontSize: '15px',
                                                                    fontWeight: !notification.isRead ? '700' : '500',
                                                                    color: !notification.isRead ? '#0f172a' : '#64748b',
                                                                    lineHeight: '1.4',
                                                                    letterSpacing: '-0.01em'
                                                                }}>
                                                                    {notification.title}
                                                                </h6>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="notification-time" style={{
                                                                        fontSize: '11px',
                                                                        fontWeight: '600',
                                                                        color: getNotificationColor(notification.type),
                                                                        backgroundColor: `${getNotificationColor(notification.type)}10`,
                                                                        padding: '2px 8px',
                                                                        borderRadius: '12px',
                                                                        whiteSpace: 'nowrap'
                                                                    }}>
                                                                        {formatTimeAgo(notification.createdAt)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <small className='text-muted fw-semibold'>{notification?.message}</small>

                                                            {/* {notification.sender && (
                                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        fontWeight: '500',
                                                                        color: '#64748b'
                                                                    }}>
                                                                        {notification.sender.name}
                                                                    </span>
                                                                </div>
                                                            )} */}


                                                        </div>
                                                    </div>

                                                    {/* Action Buttons - Right side */}
                                                    <div className="d-flex gap-1" style={{ position: 'absolute', top: '30px', right: '20px', marginTop: '4px' }}>
                                                        {!notification.isRead && (
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsRead(notification._id);
                                                                }}
                                                                title='Mark as read'
                                                                className="text-success hover-shadow rounded-circle px-1"
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            </span>
                                                        )}
                                                        <span
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteNotification(notification._id);
                                                            }}
                                                            title='Delete'
                                                            className="text-danger hover-shadow rounded-circle px-1"

                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                                            </svg>
                                                        </span>
                                                    </div>

                                                    {/* Status indicator */}
                                                    {/* {!notification.isRead && (
                                                        <div
                                                            style={{
                                                                position: 'absolute',
                                                                top: '8px',
                                                                right: !notification.isRead ? '60px' : '32px',
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                backgroundColor: getNotificationColor(notification.type),
                                                                boxShadow: `0 0 0 2px white, 0 0 8px ${getNotificationColor(notification.type)}40`
                                                            }}
                                                        />
                                                    )} */}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </>
    );
};

export default UserNotifications;