import { useEffect, useState, useRef } from 'react';
import { Offcanvas, Card, Form, Button } from 'react-bootstrap';
import moment from 'moment';
import {
    addProjectCommentAction,
    getProjectCommentAction,
    deleteProjectCommentAction,
    updateProjectCommentAction
} from '../redux/projectsComments/action';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from '../redux/actions';

const CommentsOffCanvas = ({ show, onHide, title, projectId }) => {
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [showUserList, setShowUserList] = useState(false);
    const [showEditUserList, setShowEditUserList] = useState(false);
    const [selectedUserIndex, setSelectedUserIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [atPosition, setAtPosition] = useState(-1);
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const newCommentRef = useRef(null);
    const editCommentRef = useRef(null);
    const dispatch = useDispatch();
    const userData = JSON.parse(localStorage.getItem('hyper_user'));
    const store = useSelector((state) => state);
    const UserId = userData?.id || store?.Auth?.user?.id;
    const comments = useSelector(state => state?.getProjectCommentReducer?.data?.data);
    const emailToNameMap = useSelector(state => state?.getProjectCommentReducer?.data?.emailToNameMap);
    const CreateResponse = useSelector(state => state?.addProjectCommentReducer?.data?.status);
    const deleteResponse = useSelector(state => state?.deleteProjectCommentReducer?.data?.status);
    const updateResponse = useSelector(state => state?.updateProjectCommentReducer?.data?.status);
    const getUsers = useSelector(state => state?.getAllUsers?.data?.data);
    const getUsersLoading = useSelector(state => state?.getAllUsers?.loading);
    const selectedDepartment = localStorage.getItem('selectedDepartment');

    // Filter users with sub-admin role
    const userList = selectedDepartment === "Tech" ?
        getUsers?.filter(user => (user.role?.name === 'sub-admin' || user.role?.name === 'admin') && user._id !== UserId) || [] :
        getUsers?.filter(user => (user.role?.name === 'Marketing') && user._id !== UserId) || [];

    useEffect(() => {
        dispatch(getProjectCommentAction({ projectId, page: 1, limit: 50 }));
    }, [dispatch, projectId]);

    useEffect(() => {
        dispatch(getAllUsers({ search: '', page: 1, limit: 100, userType: selectedDepartment }));
    }, []);
    useEffect(() => {
        if (CreateResponse === 201 || deleteResponse === 200 || updateResponse) {
            dispatch(getProjectCommentAction({ projectId, page: 1, limit: 50 }));
        }
    }, [CreateResponse, deleteResponse, updateResponse, dispatch, projectId]);

    const handleAddComment = () => {
        if (newComment.trim()) {
            const payload = {
                project: projectId,
                comment: newComment,
                author: UserId,
                isActive: true,
            };
            dispatch(addProjectCommentAction(payload));
            setNewComment('');
        }
    };

    const handleDeleteComment = (commentId) => {
        dispatch(deleteProjectCommentAction(commentId));
        dispatch(getProjectCommentAction({ projectId, page: 1, limit: 50 }));
        setDeletingCommentId(null);
    };

    const handleShowDeleteConfirm = (commentId) => {
        setDeletingCommentId(commentId);
    };

    const handleCancelDelete = () => {
        setDeletingCommentId(null);
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditCommentText(comment?.comment);
    };

    const handleSaveEdit = (commentId) => {
        dispatch(updateProjectCommentAction({ id: commentId, userId: UserId, body: { comment: editCommentText } }));
        setEditingCommentId(null);
        setEditCommentText('');
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditCommentText('');
        setShowEditUserList(false);
    };

    const handleNewCommentChange = (e) => {
        const value = e.target.value;
        const position = e.target.selectionStart;
        setNewComment(value);
        setCursorPosition(position);

        const lastAtIndex = value.lastIndexOf('@', position - 1);
        if (lastAtIndex !== -1 && (lastAtIndex === 0 || value[lastAtIndex - 1] === ' ')) {
            const textAfterAt = value.substring(lastAtIndex + 1, position);
            if (!textAfterAt.includes(' ')) {
                setAtPosition(lastAtIndex);
                setShowUserList(true);
                setSelectedUserIndex(0);
                // Trigger API call with search term
                dispatch(getAllUsers({ search: textAfterAt, page: 1, limit: 100 }));
            } else {
                setShowUserList(false);
            }
        } else {
            setShowUserList(false);
        }
    };

    const handleEditCommentChange = (e) => {
        const value = e.target.value;
        const position = e.target.selectionStart;
        setEditCommentText(value);
        setCursorPosition(position);

        const lastAtIndex = value.lastIndexOf('@', position - 1);
        if (lastAtIndex !== -1 && (lastAtIndex === 0 || value[lastAtIndex - 1] === ' ')) {
            const textAfterAt = value.substring(lastAtIndex + 1, position);
            if (!textAfterAt.includes(' ')) {
                setAtPosition(lastAtIndex);
                setShowEditUserList(true);
                setSelectedUserIndex(0);
                // Trigger API call with search term
                dispatch(getAllUsers({ search: textAfterAt, page: 1, limit: 100 }));
            } else {
                setShowEditUserList(false);
            }
        } else {
            setShowEditUserList(false);
        }
    };

    const insertUser = (user, isEdit = false) => {
        const currentText = isEdit ? editCommentText : newComment;
        const beforeAt = currentText.substring(0, atPosition);
        const afterCursor = currentText.substring(cursorPosition);
        const newText = beforeAt + `${user.email} ` + afterCursor;

        if (isEdit) {
            setEditCommentText(newText);
            setShowEditUserList(false);
        } else {
            setNewComment(newText);
            setShowUserList(false);
        }
    };

    const handleKeyDown = (e, isEdit = false) => {
        const isShowingList = isEdit ? showEditUserList : showUserList;
        if (!isShowingList) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedUserIndex(prev => (prev + 1) % userList.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedUserIndex(prev => (prev - 1 + userList.length) % userList.length);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertUser(userList[selectedUserIndex], isEdit);
        } else if (e.key === 'Escape') {
            if (isEdit) {
                setShowEditUserList(false);
            } else {
                setShowUserList(false);
            }
        }
    };

    // Transform emails to names in comment text with bold formatting
    const transformEmailsToNames = (text, emailToNameMap) => {
        if (!text || !emailToNameMap) return text;

        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = emailRegex.exec(text)) !== null) {
            // Add text before the email
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }

            const email = match[0];
            const name = emailToNameMap[email];

            if (name) {
                parts.push(<strong key={match.index}>@{name}</strong>);
            } else {
                parts.push(email);
            }

            lastIndex = match.index + email.length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts.length > 1 ? parts : text;
    };

    const UserSkeleton = () => (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f8f9fa' }}>
            <div style={{ height: '14px', backgroundColor: '#e9ecef', borderRadius: '3px', marginBottom: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
            <div style={{ height: '11px', backgroundColor: '#f8f9fa', borderRadius: '3px', width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
        </div>
    );

    const UserDropdown = ({ show, users, onSelect, selectedIndex, isEdit = false }) => {
        const dropdownRef = useRef(null);
        const [showAbove, setShowAbove] = useState(false);
        const [hoverIndex, setHoverIndex] = useState(-1);

        useEffect(() => {
            if (show && dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.top;
                setShowAbove(spaceBelow < 200);
            }
        }, [show]);

        if (!show) return null;

        return (
            <div
                ref={dropdownRef}
                style={{
                    position: 'absolute',
                    [showAbove ? 'bottom' : 'top']: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                {getUsersLoading ? (
                    Array(3).fill().map((_, index) => <UserSkeleton key={index} />)
                ) : users.length === 0 ? (
                    <div style={{ padding: '12px', textAlign: 'center', color: '#6c757d', fontSize: '12px' }}>
                        No emails found
                    </div>
                ) : (
                    users.filter(user => user._id !== UserId).map((user, index) => (
                        <div
                            key={user._id}
                            onClick={() => onSelect(user)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: (hoverIndex === index || (hoverIndex === -1 && index === selectedIndex)) ? '#e9ecef' : 'white',
                                borderBottom: index < users.filter(u => u._id !== UserId).length - 1 ? '1px solid #f8f9fa' : 'none',
                                fontSize: '13px'
                            }}
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(-1)}
                        >
                            <div className="fw-semibold">{user.name}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>{user.email}</div>
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <>
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
            </style>
            <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '400px' }}>
                <Offcanvas.Header closeButton className="bg-dark text-white border-0">
                    <Offcanvas.Title title={title} className="fw-bold cp">
                        <i className="mdi mdi-comment-text-outline me-2"></i>
                        {title}
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0 d-flex flex-column">
                    <Card className="border-0 flex-grow-1 d-flex flex-column">
                        <Card.Body className="p-2 pt-1 flex-grow-1 d-flex flex-column">
                            <div className="mb-2">
                                <small className="text-muted fw-semibold text-uppercase">Comments ({comments?.length})</small>
                            </div>

                            <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                {comments?.length === 0 ? (
                                    <div className='p-5 bg-light rounded d-flex align-items-center justify-content-center'>
                                        No comments yet
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column" style={{ gap: '6px' }}>
                                        {comments?.map((comment) => {
                                            const isCurrentUser = comment?.author?._id === UserId;
                                            return (
                                                <div key={comment.id} className={`p-2 rounded ${isCurrentUser ? 'bg-primary bg-opacity-10 border border-primary border-opacity-25' : 'bg-light'}`} style={{ fontSize: '13px' }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className={`fw-semibold ${isCurrentUser ? 'text-success' : 'text-primary'}`}>
                                                            {isCurrentUser ? 'You' : comment.author?.name}
                                                        </span>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <small className="text-muted">
                                                                {moment(comment.createdAt).calendar(null, {
                                                                    sameDay: '[Today] h:mm A',
                                                                    lastDay: '[Yesterday] h:mm A',
                                                                    lastWeek: 'MMM DD h:mm A',
                                                                    sameElse: 'MMM DD, YYYY h:mm A'
                                                                })}
                                                            </small>
                                                            {isCurrentUser && (
                                                                <div className="d-flex gap-1">
                                                                    <i
                                                                        className="mdi mdi-pencil text-primary"
                                                                        style={{ cursor: 'pointer', fontSize: '14px' }}
                                                                        onClick={() => handleEditComment(comment)}
                                                                        title="Edit comment"
                                                                    ></i>
                                                                    <i
                                                                        className="mdi mdi-delete text-danger"
                                                                        style={{ cursor: 'pointer', fontSize: '14px' }}
                                                                        onClick={() => handleShowDeleteConfirm(comment._id)}
                                                                        title="Delete comment"
                                                                    ></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {editingCommentId === comment._id ? (
                                                        <div className="mt-1" style={{ position: 'relative' }}>
                                                            <Form.Control
                                                                ref={editCommentRef}
                                                                as="textarea"
                                                                rows={2}
                                                                value={editCommentText}
                                                                onChange={handleEditCommentChange}
                                                                onKeyDown={(e) => handleKeyDown(e, true)}
                                                                style={{ fontSize: '13px', resize: 'none' }}
                                                            />
                                                            <UserDropdown
                                                                show={showEditUserList}
                                                                users={userList}
                                                                onSelect={(user) => insertUser(user, true)}
                                                                selectedIndex={selectedUserIndex}
                                                                isEdit={true}
                                                            />
                                                            <div className="d-flex justify-content-end gap-1 mt-1">
                                                                <button
                                                                    className="btn btn-outline-secondary fw-semibold"
                                                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                                                    onClick={handleCancelEdit}>
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type='button'
                                                                    className="btn bg-dark text-white fw-semibold"
                                                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                                                    onClick={() => handleSaveEdit(comment._id)}>
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : deletingCommentId === comment._id ? (
                                                        <div className="mt-1">
                                                            <div className="text-danger mb-2" style={{ fontSize: '12px' }}>
                                                                Are you sure you want to delete this comment?
                                                            </div>
                                                            <div className="d-flex justify-content-end gap-1">
                                                                <button
                                                                    className="btn btn-outline-secondary fw-semibold"
                                                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                                                    onClick={handleCancelDelete}>
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger fw-semibold"
                                                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                                                    onClick={() => handleDeleteComment(comment._id)}>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mb-0 text-dark" style={{ lineHeight: '1.4' }}>
                                                            {transformEmailsToNames(comment?.comment, emailToNameMap)}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="border-top pt-2">
                                <Form.Group className="mb-2" style={{ position: 'relative' }}>
                                    <Form.Control
                                        ref={newCommentRef}
                                        as="textarea"
                                        rows={2}
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={handleNewCommentChange}
                                        onKeyDown={(e) => handleKeyDown(e, false)}
                                        style={{ fontSize: '13px', resize: 'none' }}
                                    />
                                    <UserDropdown
                                        show={showUserList}
                                        users={userList}
                                        onSelect={(user) => insertUser(user, false)}
                                        selectedIndex={selectedUserIndex}
                                        isEdit={false}
                                    />
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    className="w-100"
                                >
                                    <i className="mdi mdi-send me-1"></i>
                                    Add Comment
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default CommentsOffCanvas;