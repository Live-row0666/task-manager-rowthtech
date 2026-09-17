import { useState, useEffect } from 'react';
import { Modal, Button, Form, Badge, Alert, Spinner, Tab, Tabs, Card, Row, Col, ProgressBar, ListGroup } from 'react-bootstrap';
import { getUserTask, updateUserTask, addTaskComment } from '../../../redux/tasks/api';

const TaskDetailModal = ({ show, onHide, taskId, onTaskUpdate }) => {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [statusUpdate, setStatusUpdate] = useState('');
    const [progressUpdate, setProgressUpdate] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(() => {
        if (show && taskId) {
            fetchTaskDetails();
        }
    }, [show, taskId]);

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const response = await getUserTask(taskId);
            if (response && response.data && response.data.data) {
                setTask(response.data.data);
                setStatusUpdate(response.data.data.status);
                setProgressUpdate(response.data.data.progress || 0);
            }
        } catch (error) {
            console.error('Error fetching task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            setUpdating(true);
            const updateData = {};

            if (statusUpdate && statusUpdate !== task.status) {
                updateData.status = statusUpdate;
            }

            if (progressUpdate !== undefined && progressUpdate !== task.progress) {
                updateData.progress = parseInt(progressUpdate);
            }

            if (newComment.trim()) {
                updateData.workLog = newComment;
            }

            if (Object.keys(updateData).length > 0) {
                await updateUserTask(taskId, updateData);
            }

            if (onTaskUpdate) {
                onTaskUpdate();
            }
            onHide();
            setActiveTab('overview');
            setNewComment('');
        } catch (error) {
            console.error('Error updating task:', error);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'To Do': { bg: 'secondary', text: 'white' },
            'In Progress': { bg: 'primary', text: 'white' },
            'Testing': { bg: 'warning', text: 'dark' },
            'Done': { bg: 'success', text: 'white' },
            'On Hold': { bg: 'danger', text: 'white' }
        };
        const config = statusConfig[status] || { bg: 'secondary', text: 'white' };
        return (
            <span
                bg={config.bg}
                text={config.text}
                className={`badge bg-${config.bg} text-${config.text}`}
            >
                {status}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'Low': { bg: 'priority-low', text: 'white' },
            'Medium': { bg: 'priority-medium', text: 'dark' },
            'High': { bg: 'priority-high', text: 'white' },
            'Critical': { bg: 'priority-critical', text: 'white' }
        };
        const config = priorityConfig[priority] || { bg: 'priority-default', text: 'white' };
        return (
            <span
                className={`badge ${config.bg}`}
            >
                {priority}
            </span>
        );
    };

    const getWorkTypeBadge = (workType) => {
        const workTypeColors = {
            'Sprint': 'info',
            'Bug': 'danger',
            'Feature': 'success',
            'Enhancement': 'warning',
            'Task': 'primary'
        };
        return (
            <span
                // bg={workTypeColors[workType] || 'secondary'}
                // style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem' }}
                className={`badge bg-${workTypeColors[workType]}`}
            >
                {workType}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateTimeSpent = () => {
        if (!task.timeEntries || task.timeEntries.length === 0) return '0h 0m';
        const totalMinutes = task.timeEntries.reduce((acc, entry) => acc + (entry.duration || 0), 0);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <Modal show={show} onHide={() => {
                onHide();
                setActiveTab('overview');
            }} size="xl" centered>
                <Modal.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Loading task details...</p>
                </Modal.Body>
            </Modal>
        );
    }

    if (!task) {
        return (
            <Modal show={show} onHide={() => {
                onHide();
                setActiveTab('overview');
            }} centered>
                <Modal.Body className="text-center py-5">
                    <Alert variant="danger">
                        <Alert.Heading>Task Not Found</Alert.Heading>
                        <p>The requested task could not be found or you don't have permission to view it.</p>
                    </Alert>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal scrollable show={show} onHide={() => {
            onHide();
            setActiveTab('overview');
        }} size="xl" centered className="task-detail-modal" fullscreen="lg-down">
            <Modal.Header style={{ backgroundColor: '#fff', borderBottom: '2px solid #dee2e6' }}>
                <div className="w-100">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start">
                        <div className="mb-2 mb-md-0">
                            <Modal.Title className="text-capitalize text-black mb-1" >
                                <h5 className="mb-0">
                                    {task?.summary}
                                </h5>
                            </Modal.Title>
                            <div className="d-flex gap-2 align-items-center flex-wrap mt-2">
                                {getWorkTypeBadge(task.workType)}
                                {task.isImpediment && (
                                    <Badge bg="warning" text="dark" style={{ fontSize: '0.65rem' }}>
                                        Impediment
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                        </div>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ padding: '0', backgroundColor: '#f8f9fa' }}>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-0"
                    style={{ borderBottom: '1px solid #dee2e6' }}
                >
                    <Tab eventKey="overview" title="📋 Overview">
                        <div className="p-3">
                            <Row>
                                <Col lg={8} md={12}>
                                    <Card className="mb-3 shadow-sm">
                                        <Card.Header style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                            📄 Description
                                        </Card.Header>
                                        <Card.Body>
                                            {task.description ? (
                                                <div>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: showFullDescription
                                                                ? task.description
                                                                : task.description.slice(0, 300) + (task.description.length > 300 ? '...' : ''),
                                                        }}
                                                    />
                                                    {task.description.length > 300 && (
                                                        <small
                                                            className="p-0 cp text-info ms-1"
                                                            onClick={() => setShowFullDescription(!showFullDescription)}
                                                        >
                                                            {showFullDescription ? 'read less' : 'read more ...'}
                                                        </small>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-muted mb-0 fst-italic">No description provided</p>
                                            )}

                                        </Card.Body>
                                    </Card>

                                    {task.labels && task.labels.length > 0 && (
                                        <Card className="mb-3 shadow-sm">
                                            <Card.Header style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                                🏷️ Labels
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {task.labels.map((label, index) => (
                                                        <Badge
                                                            key={index}
                                                            bg="light"
                                                            text="dark"
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                padding: '0.5rem 0.75rem',
                                                                border: '1px solid #dee2e6'
                                                            }}
                                                        >
                                                            {label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )}

                                    <Card className="mb-3 shadow-sm">
                                        <Card.Header style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                            📈 Progress Tracking
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span style={{ fontWeight: '500' }}>Completion Progress</span>
                                                    <span style={{ fontWeight: '600' }}>{task.progress || 0}%</span>
                                                </div>
                                                <ProgressBar
                                                    now={task.progress || 0}
                                                    style={{ height: '10px' }}
                                                    variant={task.progress >= 100 ? 'success' : task.progress >= 50 ? 'info' : 'warning'}
                                                />
                                            </div>
                                            <Row>
                                                <Col md={6}>
                                                    <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0d6efd' }}>
                                                            {task.estimatedTime || 0}h
                                                        </div>
                                                        <small className="text-muted">Estimated</small>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="text-center p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#198754' }}>
                                                            {calculateTimeSpent()}
                                                        </div>
                                                        <small className="text-muted">Time Spent</small>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                <Col lg={4} md={12}>
                                    <Card className="mb-4 shadow-sm">
                                        <Card.Header style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                            ℹ️ Task Details
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="mb-1">
                                                <div className="d-flex justify-content-between">
                                                    <span className='fw-semibold'>Project:</span>
                                                    <span className="text-end">{task.project?.name}</span>
                                                </div>
                                            </div>

                                            {task.milestone && (
                                                <div className="mb-1">
                                                    <div className="d-flex justify-content-between">
                                                        <span className='fw-semibold'>Milestone:</span>
                                                        <span className="text-end">{task.milestone.title}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-1">
                                                <div className="d-flex justify-content-between">
                                                    <span className='fw-semibold'>Reporter:</span>
                                                    <div className="text-end">
                                                        <div className='text-primary' style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                                            {task.reporter?.name}
                                                        </div>
                                                        <small className="text-muted" style={{ fontSize: '10px' }}>
                                                            {task.reporter?.designation}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-1">
                                                <div className="d-flex justify-content-between">
                                                    <span className='fw-semibold'>Assignee:</span>
                                                    <div className="text-end">
                                                        <div className='text-primary mb-0' style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                                            {task.assignee?.name}
                                                        </div>
                                                        <small className="text-muted" style={{ fontSize: '10px' }}>
                                                            {task.assignee?.designation}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-1">
                                                <div className="d-flex justify-content-between">
                                                    <span className='fw-semibold'>Start Date:</span>
                                                    <span className="text-end">{formatDate(task.startDate)}</span>
                                                </div>
                                            </div>

                                            <div className="mb-1">
                                                <div className="d-flex justify-content-between">
                                                    <span className='fw-semibold'>Due Date:</span>
                                                    <span className="text-end">{formatDate(task.dueDate)}</span>
                                                </div>
                                            </div>

                                            <div className="mb-1">
                                                <div className="d-flex justify-content-between">
                                                    <span className='fw-semibold'>Created:</span>
                                                    <span className="text-end">{formatDate(task.createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="mb-0">
                                                <div className="d-flex justify-content-between">
                                                    <span className='fw-semibold'>Updated:</span>
                                                    <span className="text-end">{formatDate(task.updatedAt)}</span>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </Tab>

                    <Tab eventKey="attachments" title={`📎 Attachments (${task.attachments?.length || 0})`}>
                        <div className="p-3">
                            <Card className="shadow-sm">
                                <Card.Header style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                    📎 File Attachments
                                </Card.Header>
                                <Card.Body>
                                    {task.attachments && task.attachments.length > 0 ? (
                                        <Row>
                                            {task.attachments.map((attachment, index) => (
                                                <Col sm={6} md={4} lg={3} key={index} className="mb-3">
                                                    <Card className="h-100" style={{ border: '1px solid #dee2e6' }}>
                                                        <Card.Body className="p-3">
                                                            <div className="d-flex align-items-center mb-2">
                                                                <div className="me-2" style={{ fontSize: '1.5rem' }}>
                                                                    {attachment.name.includes('.png') || attachment.name.includes('.jpg') || attachment.name.includes('.jpeg') ? '🖼️' : '📄'}
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <div
                                                                        style={{
                                                                            fontSize: '0.9rem',
                                                                            fontWeight: '500',
                                                                            wordBreak: 'break-word'
                                                                        }}
                                                                    >
                                                                        {attachment.name}
                                                                    </div>
                                                                    <small className="text-muted">
                                                                        {formatDateTime(attachment.uploadedAt)}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className="w-100"
                                                                onClick={() => window.open(attachment.url, '_blank')}
                                                            >
                                                                View File
                                                            </Button>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <div className="text-center py-5">
                                            <div style={{ fontSize: '3rem', opacity: '0.3' }}>📎</div>
                                            <p className="text-muted mt-3">No attachments found</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    </Tab>

                    <Tab eventKey="comments" title={`💬 Comments (${task.comments?.length || 0})`}>
                        <div className="p-3">
                            <Card className="shadow-sm">
                                <Card.Header style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                    💬 Activity & Comments
                                </Card.Header>
                                <Card.Body >
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {task.comments && task.comments.length > 0 ? (
                                            task.comments.map((comment, index) => (
                                                <div key={index} className="mb-3 px-3 py-1" style={{
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e9ecef'
                                                }}>
                                                    <div className="d-flex justify-content-between align-items-center mb-0">
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className="d-flex me-1 align-items-center justify-content-center"
                                                                style={{
                                                                    width: '28px',
                                                                    height: '28px',
                                                                    backgroundColor: '#f0f2f5',
                                                                    borderRadius: '50%'
                                                                }}
                                                            >
                                                                <span style={{ fontSize: '0.9rem' }}>👤</span>
                                                            </div>
                                                            <strong className='py-0 my-0' style={{ fontSize: '0.83rem' }}>
                                                                {comment.user?.name}
                                                            </strong>
                                                        </div>
                                                        <small className="text-muted">
                                                            {formatDateTime(comment.createdAt)}
                                                        </small>
                                                    </div>
                                                    <p className="my-0 ms-4">
                                                        {comment.comment.length > 200 ? (
                                                            <>
                                                                {comment.expanded ? (
                                                                    <>
                                                                        {comment.comment}
                                                                        <small
                                                                            className="p-0 cp text-info ms-1"
                                                                            onClick={() => {
                                                                                const updatedComments = [...task.comments];
                                                                                updatedComments[index] = {
                                                                                    ...comment,
                                                                                    expanded: false
                                                                                };
                                                                                setTask({ ...task, comments: updatedComments });
                                                                            }}
                                                                        >
                                                                            read less
                                                                        </small>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {comment.comment.slice(0, 200)}...
                                                                        <small
                                                                            className="p-0 cp text-info ms-1"
                                                                            onClick={() => {
                                                                                const updatedComments = [...task.comments];
                                                                                updatedComments[index] = {
                                                                                    ...comment,
                                                                                    expanded: true
                                                                                };
                                                                                setTask({ ...task, comments: updatedComments });
                                                                            }}
                                                                        >
                                                                            read more
                                                                        </small>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            comment.comment
                                                        )}
                                                    </p>                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-5">
                                                <div style={{ fontSize: '3rem', opacity: '0.3' }}>💬</div>
                                                <p className="text-muted mt-3">No comments yet. Be the first to comment!</p>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Tab>

                    <Tab eventKey="update" title="✏️ Update Task">
                        <div className="p-3">
                            <Card className="shadow-sm">
                                <Card.Header style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                    ✏️ Update Task Status & Progress
                                </Card.Header>
                                <Card.Body>
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label style={{ fontWeight: '500' }}>
                                                        Status
                                                    </Form.Label>
                                                    <Form.Select
                                                        value={statusUpdate || task.status}
                                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                                        style={{ padding: '0.75rem' }}
                                                    >
                                                        {task.status === 'To Do' ? (
                                                            <>
                                                                <option value="To Do">📋 To Do</option>
                                                                <option value="In Progress">🔄 In Progress</option>
                                                            </>
                                                        ) : task.status === 'In Progress' ? (
                                                            <>
                                                                <option value="In Progress">🔄 In Progress</option>
                                                                <option value="Testing">🧪 Testing</option>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <option value="To Do">📋 To Do</option>
                                                                <option value="In Progress">🔄 In Progress</option>
                                                                <option value="Testing">🧪 Testing</option>
                                                                <option value="Done">✅ Done</option>
                                                                <option value="On Hold">⏸️ On Hold</option>
                                                            </>
                                                        )}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label style={{ fontWeight: '500' }}>
                                                        Progress ({progressUpdate || task.progress || 0}%)
                                                    </Form.Label>
                                                    <Form.Range
                                                        value={progressUpdate || task.progress || 0}
                                                        onChange={(e) => setProgressUpdate(e.target.value)}
                                                        min="0"
                                                        max="100"
                                                        style={{ height: '8px' }}
                                                    />
                                                    <ProgressBar
                                                        now={progressUpdate || task.progress || 0}
                                                        style={{ height: '8px', marginTop: '0.5rem' }}
                                                        variant={progressUpdate >= 100 ? 'success' : progressUpdate >= 50 ? 'info' : 'warning'}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                            <Form.Label style={{ fontWeight: '500' }}>
                                                Work Log / Comment
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a detailed work log or comment about your progress..."
                                                style={{
                                                    resize: 'vertical',
                                                    minHeight: '100px',
                                                    padding: '0.75rem'
                                                }}
                                            />
                                        </Form.Group>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    </Tab>                </Tabs>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: '#fff', borderTop: '2px solid #dee2e6' }}>
                <div className="d-flex justify-content-between w-100">
                    <div className="d-flex align-items-center">
                        <small className="text-muted">
                            Last updated: {formatDateTime(task.updatedAt)}
                        </small>
                    </div>
                    <div>
                        <Button
                            className="me-2 web_close_button"
                            onClick={() => {
                                onHide();
                                setActiveTab('overview');
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            className='web_button'
                            onClick={handleStatusUpdate}
                            disabled={updating}
                        >
                            {updating ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Updating...
                                </>
                            ) : (
                                'Update Task'
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default TaskDetailModal;
