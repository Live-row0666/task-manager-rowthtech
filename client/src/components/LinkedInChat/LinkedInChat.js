import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import config from '../../config';
import { APICore } from '../../helpers/api/apiCore';
import './LinkedInChat.css';

const api = new APICore();

// Web Audio API subtle notification chime
const playMessageChime = () => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        // Audio policy or unsupported
    }
};

const LinkedInChat = () => {
    const reduxUser = useSelector((s) => s.Auth?.user);
    const sessionUser = api.getLoggedInUser();
    const user = reduxUser || sessionUser;
    const userId = user?._id || user?.id;

    // Chat window state - closed by default, opens only when user clicks trigger
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [adminIsTyping, setAdminIsTyping] = useState(false);

    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, adminIsTyping]);

    // Fetch messages from backend
    const fetchMessages = useCallback(async (currentlyOpen = isOpen) => {
        if (!userId) return;
        try {
            const res = await api.get('/api/v1/client/chat/messages');
            if (res && res.data) {
                const data = res.data.data || res.data;
                const msgs = data.messages || [];
                setMessages(msgs);
                // If closed, calculate unread admin messages
                if (!currentlyOpen) {
                    const unread = msgs.filter(
                        (m) => m.senderType === 'admin' && !m.readByClient
                    ).length;
                    setUnreadCount(unread);
                } else {
                    setUnreadCount(0);
                }
            }
        } catch (err) {
            console.error('Error fetching client chat messages:', err);
        }
    }, [userId, isOpen]);

    useEffect(() => {
        if (userId) {
            fetchMessages();
        }
    }, [userId, fetchMessages]);

    // Mark messages as read when opening chat
    const markAsRead = async () => {
        if (!userId) return;
        try {
            setUnreadCount(0);
            await api.update('/api/v1/client/chat/read', {});
        } catch (err) {
            console.error('Error marking client chat read:', err);
        }
    };

    // Auto mark as read whenever chat is opened
    useEffect(() => {
        if (isOpen && userId) {
            setUnreadCount(0);
            markAsRead();
        }
    }, [isOpen, userId]);

    const handleToggleOpen = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            setUnreadCount(0);
            markAsRead();
            fetchMessages(true);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const isOpenRef = useRef(isOpen);
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    // Socket.io real-time connection
    useEffect(() => {
        if (!userId) return;

        const socketServerUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const socket = io(socketServerUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            timeout: 20000
        });
        socketRef.current = socket;

        const joinClientRoom = () => {
            socket.emit('join_client_channel', userId);
        };

        joinClientRoom();
        socket.on('connect', joinClientRoom);

        // Listen for new messages
        socket.on('new_client_chat_message', (payload) => {
            if (payload?.message) {
                const newMsg = payload.message;
                setMessages((prev) => {
                    // Prevent duplicate if already added
                    if (prev.some((m) => m._id === newMsg._id)) return prev;
                    return [...prev, newMsg];
                });

                if (newMsg.senderType === 'admin') {
                    playMessageChime();
                    setAdminIsTyping(false);
                    if (isOpenRef.current) {
                        setUnreadCount(0);
                        markAsRead();
                    } else {
                        setUnreadCount((c) => c + 1);
                    }
                }
            }
        });

        // Listen for typing events
        socket.on('client_chat_typing', (payload) => {
            if (payload && payload.senderType === 'admin') {
                setAdminIsTyping(payload.isTyping);
                if (payload.isTyping) {
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        setAdminIsTyping(false);
                    }, 3500);
                }
            }
        });

        // Listen for read events
        socket.on('client_chat_read', (payload) => {
            if (payload?.readBy === 'client') {
                setUnreadCount(0);
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [userId]);

    // Handle typing input change & broadcast typing event
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (socketRef.current && userId) {
            socketRef.current.emit('client_chat_typing', {
                clientId: userId,
                senderType: 'client',
                isTyping: true
            });
        }
    };

    // File selection
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Send Message
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed && !selectedFile) return;
        if (!userId || isSending) return;

        try {
            setIsSending(true);

            // Notify typing stopped
            if (socketRef.current && userId) {
                socketRef.current.emit('client_chat_typing', {
                    clientId: userId,
                    senderType: 'client',
                    isTyping: false
                });
            }

            const formData = new FormData();
            if (trimmed) formData.append('message', trimmed);
            if (selectedFile) formData.append('attachments', selectedFile);

            setInputValue('');
            setSelectedFile(null);

            const res = await api.createWithFormData('/api/v1/client/chat/send', formData);

            if (res && res.data) {
                const sentMsg = res.data.data || res.data;
                setMessages((prev) => {
                    if (prev.some((m) => m._id === sentMsg._id)) return prev;
                    return [...prev, sentMsg];
                });
            }
        } catch (err) {
            console.error('Error sending client chat message:', err);
        } finally {
            setIsSending(false);
        }
    };

    // Handle Enter to send
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Helper: format message time
    const formatMsgTime = (timestamp) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // If user is not logged in or is on the login/account page, don't display
    if (!userId || window.location.pathname.startsWith('/account/')) {
        return null;
    }

    return (
        <div className="li-chat-container">
            {/* 1. FLOATING CHAT ICON ON BOTTOM RIGHT */}
            {!isOpen && (
                <div
                    className="client-floating-chat-trigger"
                    onClick={handleToggleOpen}
                    title="Chat with PM & Support"
                >
                    <div className="client-chat-icon-btn">
                        <i className="bi bi-chat-dots-fill client-chat-icon-main"></i>
                        <span className="client-chat-pulse-ring"></span>
                        {unreadCount > 0 && (
                            <span className="client-chat-badge-bubble">{unreadCount}</span>
                        )}
                    </div>
                    {/* <div className="client-chat-pill-tooltip">
                        <span className="tooltip-online-dot"></span>
                        <span>Chat with PM</span>
                    </div> */}
                </div>
            )}

            {/* 2. OPEN FLOATING CHAT WINDOW (LINKEDIN STYLE) */}
            {isOpen && (
                <div className="li-chat-window">
                    {/* Header */}
                    <div className="li-chat-header">
                        <div className="li-header-info">
                            <div className="li-avatar-wrap">
                                <div className="li-avatar-fallback">RS</div>
                                <span className="li-online-dot"></span>
                            </div>
                            <div className="li-header-names">
                                <span className="li-header-title">RowthTech Support</span>
                                {/* <span className="li-header-status">
                                    <i className="bi bi-circle-fill" style={{ fontSize: '7px' }}></i> Active Now
                                </span> */}
                            </div>
                        </div>

                        <div className="li-header-actions">
                            <button
                                type="button"
                                className="li-btn-header-action"
                                onClick={handleToggleOpen}
                                title="Minimize"
                            >
                                <i className="bi bi-dash-lg"></i>
                            </button>
                            <button
                                type="button"
                                className="li-btn-header-action"
                                onClick={handleClose}
                                title="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="li-chat-body">
                        {/* Welcome Announcement Card */}
                        <div className="li-welcome-box">
                            <div className="li-welcome-icon">💬</div>
                            <div className="li-welcome-title">Direct PM & Support Messaging</div>
                            <p className="li-welcome-text">
                                Have questions about deliverables, credentials, or project tasks? Message your Project Manager directly.
                            </p>
                        </div>

                        {/* Date Divider */}
                        <div className="li-date-divider">
                            <span>Today</span>
                        </div>

                        {/* Message Stream */}
                        {messages.map((msg, index) => {
                            const isMe = msg.senderType === 'client';
                            return (
                                <div
                                    key={msg._id || index}
                                    className={`li-msg-row ${isMe ? 'sent' : 'received'}`}
                                >
                                    {!isMe && (
                                        <div className="li-msg-avatar-fallback">PM</div>
                                    )}

                                    <div className="li-msg-content-wrap">
                                        {!isMe && (
                                            <span className="li-msg-sender-name">
                                                {msg.senderUser?.name || 'Project Manager'}
                                            </span>
                                        )}

                                        <div className="li-msg-bubble">
                                            {msg.message}

                                            {/* Attachments if any */}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="li-msg-attachments">
                                                    {msg.attachments.map((att, i) => {
                                                        const isImg = att.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.originalName || att.fileName);
                                                        if (isImg) {
                                                            return (
                                                                <a
                                                                    key={i}
                                                                    href={att.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <img
                                                                        src={att.url}
                                                                        alt={att.originalName || 'attachment'}
                                                                        className="li-attachment-img"
                                                                    />
                                                                </a>
                                                            );
                                                        }
                                                        return (
                                                            <a
                                                                key={i}
                                                                href={att.url}
                                                                download={att.originalName}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="li-attachment-file"
                                                            >
                                                                <i className="bi bi-file-earmark-arrow-down"></i>
                                                                <span>{att.originalName || 'Download File'}</span>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <span className="li-msg-meta">
                                            {formatMsgTime(msg.createdAt)}
                                            {isMe && <i className="bi bi-check2-all text-primary ms-1"></i>}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Admin Typing Indicator */}
                        {adminIsTyping && (
                            <div className="li-typing-row">
                                <div className="li-msg-avatar-fallback">PM</div>
                                <div className="li-typing-bubble">
                                    <span className="li-dot"></span>
                                    <span className="li-dot"></span>
                                    <span className="li-dot"></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input Footer */}
                    <div className="li-chat-footer">
                        {/* Selected file preview */}
                        {selectedFile && (
                            <div className="li-selected-attach-pill">
                                <div className="li-attach-info">
                                    <i className="bi bi-paperclip"></i>
                                    <span>{selectedFile.name}</span>
                                    <small className="text-muted ms-1">
                                        ({(selectedFile.size / 1024).toFixed(0)} KB)
                                    </small>
                                </div>
                                <button
                                    type="button"
                                    className="li-btn-remove-attach"
                                    onClick={() => setSelectedFile(null)}
                                    title="Remove attachment"
                                >
                                    <i className="bi bi-x-circle-fill"></i>
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSendMessage} className="li-input-row">
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            <button
                                type="button"
                                className="li-btn-attach"
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach screenshot or document"
                            >
                                <i className="bi bi-paperclip"></i>
                            </button>

                            <textarea
                                className="li-chat-textarea"
                                placeholder="Write a message..."
                                rows="1"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />

                            <button
                                type="submit"
                                className="li-btn-send"
                                disabled={(!inputValue.trim() && !selectedFile) || isSending}
                                title="Send message (Enter)"
                            >
                                <i className="bi bi-send-fill"></i>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinkedInChat;
