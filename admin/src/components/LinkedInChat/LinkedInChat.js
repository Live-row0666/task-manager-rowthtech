import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import config from '../../config';
import { APICore } from '../../helpers/api/apiCore';
import './LinkedInChat.css';

const api = new APICore();

// Web Audio API subtle chime
const playMessageChime = () => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) { }
};

// Safe helper to extract client email as a string
const getClientEmail = (client) => {
    if (!client) return '';
    if (typeof client.email === 'string') return client.email;
    if (Array.isArray(client.email) && client.email.length > 0) return String(client.email[0] || '');
    if (typeof client.loginEmail === 'string') return client.loginEmail;
    return '';
};

// Format message time
const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// ==========================================================================
// Individual Chat Tab Component (Supports Multiple Tabs Simultaneously)
// ==========================================================================
const AdminChatTab = ({
    client,
    isMinimized,
    onToggleMinimize,
    onClose,
    socket,
    onNewOutgoingMessage,
    onMarkAsRead
}) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [tabFile, setTabFile] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [clientIsTyping, setClientIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
        }
    }, [messages, isMinimized, clientIsTyping]);

    const fetchMessages = useCallback(async () => {
        if (!client?._id) return;
        try {
            const res = await api.get(`/api/v1/admin/client-chat/messages/${client._id}`);
            if (res && res.data) {
                const data = res.data.data || res.data;
                setMessages(data.messages || []);
                if (!isMinimized && onMarkAsRead) {
                    onMarkAsRead(client._id);
                }
            }
        } catch (err) {
            console.error('Error fetching client messages:', err);
        }
    }, [client?._id, isMinimized, onMarkAsRead]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        if (!isMinimized && client?._id) {
            setUnreadCount(0);
            if (onMarkAsRead) {
                onMarkAsRead(client._id);
            } else {
                api.update(`/api/v1/admin/client-chat/read/${client._id}`, {}).catch(() => { });
            }
        }
    }, [isMinimized, client?._id, onMarkAsRead]);

    // Socket events for this specific client tab
    useEffect(() => {
        if (!socket || !client?._id) return;

        const handleNewMessage = (payload) => {
            if (payload?.message) {
                const newMsg = payload.message;
                const msgClientId = payload.clientId || (newMsg.client && (newMsg.client._id || newMsg.client));
                if (String(msgClientId) === String(client._id)) {
                    setMessages((prev) => {
                        if (prev.some((m) => m._id === newMsg._id)) return prev;
                        return [...prev, newMsg];
                    });

                    if (newMsg.senderType === 'client') {
                        setClientIsTyping(false);
                        if (isMinimized) {
                            setUnreadCount((c) => c + 1);
                        } else {
                            if (onMarkAsRead) {
                                onMarkAsRead(client._id);
                            } else {
                                api.update(`/api/v1/admin/client-chat/read/${client._id}`, {}).catch(() => { });
                            }
                        }
                    }
                }
            }
        };

        const handleTyping = (payload) => {
            if (payload && payload.senderType === 'client') {
                if (String(payload.clientId) === String(client._id)) {
                    setClientIsTyping(payload.isTyping);
                    if (payload.isTyping) {
                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                            setClientIsTyping(false);
                        }, 3500);
                    }
                }
            }
        };

        socket.on('new_client_chat_message', handleNewMessage);
        socket.on('client_chat_typing', handleTyping);

        return () => {
            socket.off('new_client_chat_message', handleNewMessage);
            socket.off('client_chat_typing', handleTyping);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [socket, client?._id, isMinimized, onMarkAsRead]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (socket && client?._id) {
            socket.emit('client_chat_typing', {
                clientId: client._id,
                senderType: 'admin',
                isTyping: true
            });
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed && !tabFile) return;
        if (!client?._id || isSending) return;

        try {
            setIsSending(true);

            if (socket && client?._id) {
                socket.emit('client_chat_typing', {
                    clientId: client._id,
                    senderType: 'admin',
                    isTyping: false
                });
            }

            const formData = new FormData();
            if (trimmed) formData.append('message', trimmed);
            if (tabFile) formData.append('attachments', tabFile);

            setInputValue('');
            setTabFile(null);

            const res = await api.createWithFileDocument(
                `/api/v1/admin/client-chat/send/${client._id}`,
                formData
            );

            if (res && res.data) {
                const sentMsg = res.data.data || res.data;
                setMessages((prev) => {
                    if (prev.some((m) => m._id === sentMsg._id)) return prev;
                    return [...prev, sentMsg];
                });
                if (onNewOutgoingMessage) onNewOutgoingMessage();
            }
        } catch (err) {
            console.error('Error sending message to client:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={`admin-li-chat-tab ${isMinimized ? 'minimized' : ''}`}>
            {/* Tab Header */}
            <div
                className="admin-li-tab-header"
                onClick={onToggleMinimize}
                title={isMinimized ? 'Click to expand conversation' : 'Click to minimize conversation'}
            >
                <div className="admin-li-tab-client-info">
                    <div className="admin-li-tab-avatar">
                        {client.name ? client.name.substr(0, 2).toUpperCase() : 'CL'}
                    </div>
                    <div className="admin-li-tab-names">
                        <span className="admin-li-tab-name">{client.name || 'Client'}</span>
                        {!isMinimized && (
                            <span className="admin-li-tab-company">
                                {client.companyName || getClientEmail(client) || 'Client'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="admin-li-tab-actions">
                    {isMinimized && unreadCount > 0 && (
                        <span className="admin-li-badge-unread me-1">{unreadCount}</span>
                    )}
                    <button
                        type="button"
                        className="admin-li-tab-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleMinimize();
                        }}
                        title={isMinimized ? 'Expand' : 'Minimize'}
                    >
                        <i className={isMinimized ? 'uil uil-angle-up' : 'uil uil-minus'}></i>
                    </button>
                    <button
                        type="button"
                        className="admin-li-tab-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        title="Close conversation"
                    >
                        <i className="uil uil-multiply"></i>
                    </button>
                </div>
            </div>

            {/* Tab Body (when expanded) */}
            {!isMinimized && (
                <>
                    <div className="admin-li-tab-body">
                        <div className="admin-li-tab-date-divider">
                            <span>Direct Live Chat</span>
                        </div>

                        {messages.map((msg, index) => {
                            const isFromAdmin = msg.senderType === 'admin';
                            return (
                                <div
                                    key={msg._id || index}
                                    className={`admin-li-msg ${isFromAdmin ? 'outgoing' : 'incoming'}`}
                                >
                                    <div className="admin-li-msg-bubble">
                                        {msg.message}

                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="admin-li-attachments">
                                                {msg.attachments.map((att, i) => {
                                                    const isImg = att.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.originalName || att.fileName);
                                                    if (isImg) {
                                                        return (
                                                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                                                                <img src={att.url} alt="attachment" className="admin-li-att-img" />
                                                            </a>
                                                        );
                                                    }
                                                    return (
                                                        <a key={i} href={att.url} download={att.originalName} target="_blank" rel="noopener noreferrer" className="admin-li-att-link">
                                                            <i className="uil uil-file-download-alt"></i>
                                                            <span>{att.originalName || 'Download'}</span>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="admin-li-msg-meta">
                                        <span>{formatTime(msg.createdAt)}</span>
                                        {isFromAdmin && <i className="uil uil-check-circle text-primary"></i>}
                                    </div>
                                </div>
                            );
                        })}

                        {clientIsTyping && (
                            <div className="admin-li-typing-wrap">
                                <div className="admin-li-typing-bubble">
                                    <span className="admin-li-dot"></span>
                                    <span className="admin-li-dot"></span>
                                    <span className="admin-li-dot"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Tab Footer Input */}
                    <div className="admin-li-tab-footer">
                        {tabFile && (
                            <div className="admin-li-selected-file-pill">
                                <span>
                                    <i className="uil uil-paperclip me-1"></i>
                                    {tabFile.name} ({(tabFile.size / 1024).toFixed(0)} KB)
                                </span>
                                <button
                                    type="button"
                                    className="btn-close-file border-0 bg-transparent text-danger"
                                    onClick={() => setTabFile(null)}
                                >
                                    &times;
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="admin-li-input-row">
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={(e) => setTabFile(e.target.files?.[0])}
                            />
                            <button
                                type="button"
                                className="admin-li-btn-tool"
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach file"
                            >
                                <i className="uil uil-paperclip"></i>
                            </button>

                            <textarea
                                className="admin-li-textarea"
                                placeholder="Write a message..."
                                rows="1"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />

                            <button
                                type="submit"
                                className="admin-li-btn-send"
                                disabled={(!inputValue.trim() && !tabFile) || isSending}
                                title="Send message (Enter)"
                            >
                                <i className="uil uil-message"></i>
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

// ==========================================================================
// Main LinkedIn Chat Component
// ==========================================================================
const LinkedInChat = () => {
    // Redux auth tracking: ensures component updates when user logs in or auth state changes
    const authUser = useSelector((state) => state.Auth?.user);
    const userLoggedIn = useSelector((state) => state.Auth?.userLoggedIn);

    // Drawer state - defaults to true so chat box is shown immediately when first coming to the site
    const [isDrawerOpen, setIsDrawerOpen] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_chat_drawer_open');
            return saved !== null ? saved === 'true' : true;
        } catch (e) {
            return true;
        }
    });

    const handleOpenDrawer = () => {
        setIsDrawerOpen(true);
        try {
            localStorage.setItem('admin_chat_drawer_open', 'true');
        } catch (e) { }
    };

    const handleCloseDrawer = (e) => {
        if (e) e.stopPropagation();
        setIsDrawerOpen(false);
        try {
            localStorage.setItem('admin_chat_drawer_open', 'false');
        } catch (e) { }
    };

    const [conversations, setConversations] = useState([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // Multiple Open Chat Tabs State (LinkedIn Style)
    // Array of: { client, isMinimized: boolean }
    const [openTabs, setOpenTabs] = useState([]);
    const openTabsRef = useRef(openTabs);
    useEffect(() => {
        openTabsRef.current = openTabs;
    }, [openTabs]);

    const socketRef = useRef(null);

    // Fetch all conversations list
    const fetchConversations = useCallback(async () => {
        try {
            const res = await api.get('/api/v1/admin/client-chat/conversations');
            if (res && res.data) {
                const data = res.data.data || res.data;
                setConversations(data.conversations || []);
                setTotalUnread(data.totalUnread || 0);
            }
        } catch (err) {
            console.error('Error fetching admin chat conversations:', err);
        }
    }, []);

    // Mark a specific conversation as read (clears badge instantly)
    const markConversationAsRead = useCallback((clientId) => {
        if (!clientId) return;

        // Optimistically clear unread count for this client immediately
        setConversations((prev) => {
            let removedCount = 0;
            const updated = prev.map((item) => {
                if (String(item.client?._id) === String(clientId)) {
                    removedCount = item.unreadCount || 0;
                    return { ...item, unreadCount: 0 };
                }
                return item;
            });
            if (removedCount > 0) {
                setTotalUnread((tot) => Math.max(0, tot - removedCount));
            }
            return updated;
        });

        // Notify backend and re-sync silently
        api.update(`/api/v1/admin/client-chat/read/${clientId}`, {})
            .then(() => {
                fetchConversations();
            })
            .catch((err) => {
                console.error('Error marking client conversation read:', err);
            });
    }, [fetchConversations]);

    useEffect(() => {
        if (api.isUserAuthenticated()) {
            fetchConversations();
        }
    }, [fetchConversations, authUser, userLoggedIn]);

    // Socket.io real-time connection
    useEffect(() => {
        if (!api.isUserAuthenticated()) return;
        const socketServerUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const socket = io(socketServerUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            timeout: 20000
        });
        socketRef.current = socket;
        const joinAdmin = () => {
            socket.emit('join_admin_support');
        };
        joinAdmin();
        socket.on('connect', joinAdmin);
        socket.on('new_client_chat_message', (payload) => {
            if (payload?.message) {
                const newMsg = payload.message;
                const msgClientId = payload.clientId || (newMsg.client?._id || newMsg.client);
                const isTabActiveAndExpanded = openTabsRef.current.some(
                    (t) => String(t.client?._id) === String(msgClientId) && !t.isMinimized
                );

                if (isTabActiveAndExpanded) {
                    markConversationAsRead(msgClientId);
                } else {
                    playMessageChime();
                    fetchConversations();
                }
            }
        });

        socket.on('client_chat_read', (payload) => {
            if (payload?.readBy === 'admin' && payload?.clientId) {
                setConversations((prev) => {
                    let removedCount = 0;
                    const updated = prev.map((item) => {
                        if (String(item.client?._id) === String(payload.clientId)) {
                            removedCount = item.unreadCount || 0;
                            return { ...item, unreadCount: 0 };
                        }
                        return item;
                    });
                    if (removedCount > 0) {
                        setTotalUnread((tot) => Math.max(0, tot - removedCount));
                    }
                    return updated;
                });
            }
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [fetchConversations, markConversationAsRead, authUser, userLoggedIn]);

    // Open or focus chat tab with selected client
    const handleSelectClient = (client) => {
        if (!client?._id) return;
        markConversationAsRead(client._id);

        setOpenTabs((prev) => {
            const index = prev.findIndex((t) => t.client._id === client._id);
            if (index !== -1) {
                // Already open: ensure it is expanded and bring to end (active)
                const tab = prev[index];
                const rest = prev.filter((_, i) => i !== index);
                let trimmed = rest;
                if (trimmed.length >= 3) {
                    trimmed = trimmed.slice(trimmed.length - 2);
                }
                return [...trimmed, { ...tab, isMinimized: false }];
            }

            // Auto-minimize older tab if already 2 open expanded tabs
            let updated = prev.map((t, idx) => {
                const expandedCount = prev.filter((item) => !item.isMinimized).length;
                if (expandedCount >= 2 && idx === 0) {
                    return { ...t, isMinimized: true };
                }
                return t;
            });

            // Keep maximum 3 docked tabs (never more than 3 open chats)
            if (updated.length >= 3) {
                updated = updated.slice(updated.length - 2);
            }

            return [...updated, { client, isMinimized: false }];
        });
    };

    // Toggle minimize for a tab
    const handleToggleMinimize = (clientId) => {
        const targetTab = openTabs.find((t) => t.client._id === clientId);
        if (targetTab && targetTab.isMinimized) {
            // Expanding now -> mark read
            markConversationAsRead(clientId);
        }

        setOpenTabs((prev) =>
            prev.map((t) =>
                t.client._id === clientId ? { ...t, isMinimized: !t.isMinimized } : t
            )
        );
    };

    // Close a tab
    const handleCloseTab = (clientId) => {
        setOpenTabs((prev) => prev.filter((t) => t.client._id !== clientId));
    };

    // Filter conversations by search
    const filteredConversations = conversations.filter((item) => {
        const client = item.client;
        if (!client) return false;
        const q = (searchQuery || '').toLowerCase().trim();
        if (!q) return true;

        const name = String(client.name || '').toLowerCase();
        const companyName = String(client.companyName || '').toLowerCase();
        const email = getClientEmail(client).toLowerCase();

        return name.includes(q) || companyName.includes(q) || email.includes(q);
    });

    const isAccountPage = typeof window !== 'undefined' && window.location.pathname.includes('/account/');
    if (isAccountPage || !api.isUserAuthenticated()) {
        return null;
    }

    return (
        <div className="admin-li-chat-wrapper">
            {/* Multiple Active Chat Tabs Docked Side-by-Side (Maximum 3 Chats) */}
            {openTabs.slice(-3).map((tab) => (
                <AdminChatTab
                    key={tab.client._id}
                    client={tab.client}
                    isMinimized={tab.isMinimized}
                    onToggleMinimize={() => handleToggleMinimize(tab.client._id)}
                    onClose={() => handleCloseTab(tab.client._id)}
                    socket={socketRef.current}
                    onNewOutgoingMessage={fetchConversations}
                    onMarkAsRead={markConversationAsRead}
                />
            ))}

            {/* 1. Floating Circular Chat Icon on Bottom Right (Client-Style) */}
            {!isDrawerOpen && (
                <div
                    className="admin-floating-chat-trigger"
                    onClick={handleOpenDrawer}
                    title="Open Messaging"
                >
                    <div className="admin-chat-icon-btn">
                        <i className="bi bi-chat-dots-fill admin-chat-icon-main"></i>
                        <span className="admin-chat-pulse-ring"></span>
                        {totalUnread > 0 && (
                            <span className="admin-chat-badge-bubble">{totalUnread}</span>
                        )}
                    </div>
                </div>
            )}

            {/* 2. Open Messaging Drawer */}
            {isDrawerOpen && (
                <div className="admin-li-drawer">
                    {/* Drawer Header */}
                    <div
                        className="admin-li-drawer-header"
                        onClick={handleCloseDrawer}
                        title="Close Messaging"
                    >
                        <div className="admin-li-drawer-title-wrap">
                            <div className="admin-li-drawer-avatar">
                                <i className="uil uil-comments-alt"></i>
                            </div>
                            <span className="admin-li-drawer-title">
                                Messaging
                            </span>
                        </div>

                        <div className="admin-li-drawer-actions">
                            {totalUnread > 0 && (
                                <span className="admin-li-badge-unread">{totalUnread}</span>
                            )}
                            <button
                                type="button"
                                className="admin-li-btn-toggle"
                                onClick={handleCloseDrawer}
                                title="Close drawer"
                            >
                                <i className="uil uil-multiply"></i>
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="admin-li-search-box">
                        <i className="uil uil-search"></i>
                        <input
                            type="text"
                            className="admin-li-search-input"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Clients Conversation List */}
                    <div className="admin-li-conv-list">
                        {filteredConversations.length === 0 ? (
                            <div className="admin-li-empty-convs">
                                No clients found.
                            </div>
                        ) : (
                            filteredConversations.map((item) => {
                                const cl = item.client;
                                const isSelected = openTabs.some(
                                    (t) => t.client._id === cl._id && !t.isMinimized
                                );
                                const hasUnread = item.unreadCount > 0;

                                return (
                                    <div
                                        key={cl._id}
                                        className={`admin-li-conv-item ${isSelected ? 'active' : ''}`}
                                        onClick={() => handleSelectClient(cl)}
                                    >
                                        <div className="admin-li-conv-avatar-wrap">
                                            <div className="admin-li-conv-avatar">
                                                {cl.name ? cl.name.substr(0, 2).toUpperCase() : 'CL'}
                                            </div>
                                        </div>

                                        <div className="admin-li-conv-info">
                                            <div className="admin-li-conv-top-row">
                                                <span className="admin-li-client-name">{cl.name || 'Client'}</span>
                                                {item.lastMessage && (
                                                    <span className="admin-li-conv-time">
                                                        {formatTime(item.lastMessage.createdAt)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="admin-li-conv-sub-row">
                                                <p className={`admin-li-snippet ${hasUnread ? 'unread-bold' : ''}`}>
                                                    {item.lastMessage
                                                        ? (item.lastMessage.senderType === 'admin' ? 'You: ' : '') + (item.lastMessage.message || 'Sent an attachment')
                                                        : (cl.companyName || 'Start conversation...')}
                                                </p>
                                                {hasUnread && (
                                                    <span className="admin-li-conv-unread-pill">
                                                        {item.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkedInChat;
