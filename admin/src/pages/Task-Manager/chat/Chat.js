import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Row, Col, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import './Chat.css';
import profilePic from '../../../assets/images/users/avatar-1.jpg';
import { getAllUsers } from '../../../redux/user/action';
import MainLoader from '../../../constants/Loader/loader';

const ChatUsers = ({ users, selectedUser, onUserSelect, search, setSearch, onSearch, loading }) => {
    const usersListRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    return (
        <div className="chat-users d-flex flex-column h-100">
            <div className="d-flex align-items-center p-2 border-bottom">
                <div className="w-100">
                    <Form.Control
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => {
                            e.preventDefault();
                            setSearch(e.target.value)
                        }}
                        disabled={loading}
                    />
                </div>
            </div>

            <div
                className="users-list flex-grow-1 overflow-auto"
                ref={usersListRef}
            >
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <p className="text-muted">No users found</p>
                    </div>
                ) : (
                    users?.map((user, index) => (
                        <Link
                            to="#"
                            key={index}
                            className={classNames('text-body d-flex align-items-center p-2 border-bottom user-item', {
                                'bg-light': user?.id === selectedUser?.id,
                            })}
                            onClick={() => onUserSelect(user)}>
                            <div className="position-relative">
                                <img src={user?.avatar} className="rounded-circle avatar-sm" alt="" />
                                {user?.isOnline && <span className="user-status bg-success"></span>}
                            </div>
                            <div className="w-100 ms-2">
                                <h5 className="mb-0 mt-1">{user?.name}</h5>
                                <p className="mb-0 text-muted font-13 text-truncate">{user?.lastMessage}</p>
                            </div>
                            {user?.unread > 0 && (
                                <div className="text-end">
                                    <span className="badge bg-danger rounded-pill">{user?.unread}</span>
                                </div>
                            )}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

const ChatArea = ({ selectedUser, messages, onSendMessage, loading }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatAreaRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom of chat area when messages change
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage?.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
            inputRef.current?.focus();
        }
    };

    return (
        <div className="chat-area d-flex flex-column h-100">
            {/* Chat header */}
            <div className="chat-header d-flex align-items-center p-2 border-bottom">
                <div className="d-flex align-items-center">
                    <div className="position-relative">
                        <img src={selectedUser?.avatar} className="rounded-circle border avatar-sm" alt="" />
                        {selectedUser?.isOnline && <span className="user-status bg-success"></span>}
                    </div>
                    <div className="ms-2">
                        <h5 className="mb-0">{selectedUser?.name}</h5>
                        <p className="mb-0 text-muted font-12">
                            {selectedUser?.isOnline ? (
                                <span className="text-success">Online</span>
                            ) : (
                                'Last seen 2h ago'
                            )}
                        </p>
                    </div>
                </div>
                <div className="ms-auto">
                    <div className="d-flex">
                        <Button variant="light" className="btn-sm">
                            <i className="uil uil-ellipsis-v"></i>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chat messages */}
            <div
                className="chat-messages p-3 flex-grow-1 overflow-auto"
                ref={chatAreaRef}
            >
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : messages?.length === 0 ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <p className="text-muted">No messages yet</p>
                    </div>
                ) : (
                    messages?.map((message, index) => (
                        <div
                            key={index}
                            className={classNames('message mb-3 d-flex', {
                                'justify-content-end': message?.sender === 'me',
                            })}>
                            {message?.sender !== 'me' && (
                                <img src={selectedUser?.avatar} className="rounded-circle avatar-xs me-1" alt="" />
                            )}
                            <div
                                className={classNames('message-content p-2 rounded', {
                                    'bg-light': message?.sender !== 'me',
                                    'bg-primary text-white': message?.sender === 'me',
                                })}>
                                <p className="mb-0">{message?.text}</p>
                                <small
                                    className={classNames('d-block text-end', {
                                        'text-muted': message?.sender !== 'me',
                                        'text-white-50': message?.sender === 'me',
                                    })}>
                                    {message?.time}
                                </small>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Chat input */}
            <div className="chat-input p-2 border-top">
                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Button variant="light">
                            <i className="uil uil-smile"></i>
                        </Button>
                        <Button variant="light">
                            <i className="uil uil-paperclip"></i>
                        </Button>
                        <Form.Control
                            ref={inputRef}
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!newMessage.trim() || loading}
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <i className="uil uil-message"></i>
                            )}
                        </Button>
                    </InputGroup>
                </Form>
            </div>
        </div>
    );
};

const Chat = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const getUsers = store?.getAllUsers;

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const limit = 100;

    useEffect(() => {
        dispatch(getAllUsers({ search: search, limit }));
    }, [dispatch, search]);

    useEffect(() => {
        if (getUsers?.data?.status === 200) {
            const formattedUsers = getUsers?.data?.data?.map(user => ({
                id: user?._id,
                name: user?.name,
                avatar: profilePic,
                lastMessage: 'Available for chat',
                isOnline: Math.random() > 0.5,
                unread: Math.floor(Math.random() * 5),
                email: user?.email,
                role: user?.role?.name
            }));
            setUsers(formattedUsers);
            setIsSearching(false);
        }
    }, [getUsers]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (users.length > 0 && !selectedUser) {
            setSelectedUser(users[0]);
            setMessages([
                {
                    sender: 'other',
                    text: 'Hey there! How\'s the project going?',
                    time: '10:00 AM',
                },
                {
                    sender: 'me',
                    text: 'Hi! It\'s going well. I\'ve completed most of the tasks.',
                    time: '10:02 AM',
                }
            ]);
        }
    }, [users, selectedUser]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handleSendMessage = (text) => {
        setIsSending(true);
        setTimeout(() => {
            const newMessage = {
                sender: 'me',
                text: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, newMessage]);
            setIsSending(false);
        }, 500);
    };

    return (
        <>
            <Row>
                <Col  >
                    <Card className='' style={{ height: '90vh' }}>
                        {/* asd */}
                        <Card.Body className="p-0" >
                            {getUsers?.loading && !isSearching ? (
                                <MainLoader />
                            ) : (
                                <Row className="g-0" >
                                    <Col lg={4} className="border-end">
                                        <ChatUsers
                                            users={users}
                                            selectedUser={selectedUser}
                                            onUserSelect={handleUserSelect}
                                            search={search}
                                            setSearch={setSearch}
                                            // onSearch={handleSearch}
                                            loading={isSearching}
                                        />
                                    </Col>
                                    <Col lg={8}>
                                        {selectedUser ? (
                                            <ChatArea
                                                selectedUser={selectedUser}
                                                messages={messages}
                                                onSendMessage={handleSendMessage}
                                                loading={isSending}
                                            />
                                        ) : (
                                            <div className="d-flex justify-content-center align-items-center h-100">
                                                <h5 className="text-muted">Select a user to start chatting</h5>
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default Chat;