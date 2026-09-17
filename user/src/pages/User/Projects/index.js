import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Modal, Table, ProgressBar, Offcanvas, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';
import { getUserProjects, getUserTasksByProject } from '../../../redux/projects/api';
import TaskDetailModal from '../Tasks/TaskDetailModal';
import TaskPreviewModal from '../Tasks/TaskPreviewModal';
import DescriptionOffCanvas from '../../../components/DescriptionOffCanvas';

const UserProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectTasks, setProjectTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [changesDone, setChangesDone] = useState(false);
    const closeTaskPreview = () => {
        // setTaskPreviewData(null);
        setShowTaskDetail(false);
    }


    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await getUserProjects({ search: searchTerm });
            if (response && response.data && response.data.data) {
                setProjects(Array.isArray(response.data.data) ? response.data.data : []);
            } else {
                setProjects([]);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTasks = async (project) => {
        try {
            setSelectedProject(project);
            const response = await getUserTasksByProject(project._id);
            if (response && response.data && response.data.data) {
                setProjectTasks(Array.isArray(response.data.data) ? response.data.data : []);
                setShowTaskModal(true);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setProjectTasks([]);
            setShowTaskModal(true);
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            'To Do': { bg: 'bg-secondary bg-opacity-10', text: 'text-secondary' },
            'In Progress': { bg: 'bg-primary bg-opacity-10', text: 'text-primary' },
            'Testing': { bg: 'bg-warning bg-opacity-10', text: 'text-warning' },
            'Done': { bg: 'bg-success bg-opacity-10', text: 'text-success' },
            'On Hold': { bg: 'bg-danger bg-opacity-10', text: 'text-danger' }
        };
        const style = statusStyles[status] || { bg: 'bg-secondary bg-opacity-10', text: 'text-secondary' };
        return <span className={`p-1 badge ${style.bg} ${style.text}`}>{status}</span>;
    };

    const getPriorityBadge = (priority) => {
        const priorityStyles = {
            'Low': { bg: 'bg-info bg-opacity-10', text: 'text-info' },
            'Medium': { bg: 'bg-warning bg-opacity-10', text: 'text-warning' },
            'High': { bg: 'bg-danger bg-opacity-10', text: 'text-danger' },
            'Critical': { bg: 'bg-dark bg-opacity-10', text: 'text-dark' }
        };
        const style = priorityStyles[priority] || { bg: 'bg-secondary bg-opacity-10', text: 'text-secondary' };
        return <span className={`p-1 badge ${style.bg} ${style.text}`}>{priority}</span>;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Row className="mb-2 mt-5">
                <Col lg={12} className="d-flex justify-content-between align-items-center">
                    <div className="d-flex justify-content-between w-100">
                        <Link to="/dashboard/taskboard">
                            <Button className='web_button'>
                                <i className="uil-clipboard-alt me-1"></i>
                                Task Board
                            </Button>
                        </Link>
                        <div className='d-flex gap-2'>
                            <input
                                type="text"
                                className="form-control h-100"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '250px', fontSize: '11px', padding: '5px 6px' }}
                            />
                            <Button className='web_button' onClick={fetchProjects}>
                                Search
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row>
                {!Array.isArray(projects) || projects.length === 0 ? (
                    <Col>
                        <Card>
                            <Card.Body className="text-center py-5">
                                <h5>No Projects Assigned</h5>
                                <p className="text-muted">You haven't been assigned to any projects yet.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                ) : (
                    (projects || []).map((project) => (
                        <Col lg={6} xl={4} key={project._id} className="mb-4">
                            <Card className='h-100 d-flex flex-column' >
                                {/* <Card className='h-100 d-flex flex-column' style={{ background: 'linear-gradient(135deg, rgba(49, 58, 70, 0.9), rgba(49, 58, 70, 0.7))' }}> */}
                                <Card.Body className='d-flex flex-column'>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="d-flex align-items-center">
                                            <h5 className="card-title mb-0 me-2 text-dark">{project.name}</h5>
                                            {project.description && (
                                                <Button
                                                    variant="link"
                                                    title='Description'
                                                    className="p-0"
                                                    onClick={() => {
                                                        setSelectedProject(project);
                                                        setShowDescription(true);
                                                    }}
                                                >
                                                    <i className="uil-info-circle text-muted"></i>
                                                </Button>
                                            )}

                                        </div>
                                        <div className='d-flex align-items-center gap-1'>
                                            {project?.figmaLinks?.length > 0 && (
                                                <Dropdown>
                                                    <Dropdown.Toggle
                                                        variant="outline-none"
                                                        size="sm"
                                                        className="p-0"
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        <i className="mdi mdi-pencil-ruler text-primary "></i>
                                                        {project?.figmaLinks?.length}
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="shadow-sm p-0" style={{ minWidth: '180px', fontSize: '12px' }}>
                                                        {project?.figmaLinks?.map((links, idx) => (
                                                            <Dropdown.Item key={idx} className="px-2 py-1">
                                                                <div onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.open(links?.url);
                                                                }} className='d-flex align-items-center cp'>
                                                                    <i className="mdi mdi-vector-link me-1 text-info"></i>
                                                                    <span className="text-info">{links?.title}</span>
                                                                </div>
                                                            </Dropdown.Item>
                                                        ))}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            )}
                                            <Badge bg={project.projectStatus === 'Active' ? 'success' : 'secondary'} className='p-1'>
                                                {project.projectStatus}
                                            </Badge>
                                        </div>
                                    </div>

                                    {project?.technology && project?.technology?.length > 0 && (
                                        <div className="mb-3">
                                            <small className="text-muted d-block mb-1">Technologies:</small>
                                            <div className="d-flex flex-wrap gap-1">
                                                {project?.technology?.map((tech) => (
                                                    <Badge key={tech._id} bg="info" className="p-1">
                                                        {tech.name}
                                                    </Badge>
                                                ))}
                                                {/* {project.technology.length > 3 && (
                                                    <Badge bg="light" text="dark" className="small">
                                                        +{project.technology.length - 3} more
                                                    </Badge>
                                                )} */}
                                            </div>
                                        </div>
                                    )}

                                    {project.taskStats && (
                                        <div className="mb-3 mt-auto">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <small className="text-muted">Task Progress</small>
                                                <small className="text-muted">
                                                    {project.taskStats.completed}/{project.taskStats.total}
                                                </small>
                                            </div>
                                            <ProgressBar
                                                now={project.taskStats.total > 0 ? (project.taskStats.completed / project.taskStats.total) * 100 : 0}
                                                variant="success"
                                                style={{ height: '6px' }}
                                            />
                                            <div className="d-flex justify-content-between mt-2">
                                                <small className="fw-semibold text-success">
                                                    ✓ {project.taskStats.completed} Done
                                                </small>
                                                <small className="fw-semibold text-primary">
                                                    ⟳ {project.taskStats.inProgress} In Progress
                                                </small>
                                                <small className="fw-semibold text-muted">
                                                    ○ {project.taskStats.pending} Pending
                                                </small>
                                            </div>
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div>
                                            <small className="text-muted">
                                                Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                                            </small>
                                        </div>
                                        <Button
                                            className='web_button'
                                            onClick={() => handleViewTasks(project)}
                                        >
                                            View Tasks
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            {/* Task Modal */}
            {!showTaskDetail &&
                <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)} size="xl" scrollable centered>
                    <Modal.Header className="border-bottom-0 pb-1">
                        <Modal.Title className="w-100">
                            <div className="d-flex mb-2 justify-content-between align-items-center">
                                <div>
                                    <h5 className="my-0 text-black">Tasks for: {selectedProject?.name}</h5>
                                </div>
                                {/* {projectTasks.length > 0 && (
                                    <div className="d-flex align-items-center">
                                        <span className="me-2 small text-muted">Filter:</span>
                                        <select className="form-select form-select-sm" style={{ width: '120px' }}>
                                            <option>All</option>
                                            <option>To Do</option>
                                            <option>In Progress</option>
                                            <option>Testing</option>
                                            <option>Done</option>
                                        </select>
                                    </div>
                                )} */}
                                <small className="text-muted">
                                    {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''} found
                                </small>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="py-0">
                        {projectTasks.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="mb-3">
                                    <i className="uil-clipboard-alt text-muted" style={{ fontSize: '3rem' }}></i>
                                </div>
                                <h5>No tasks assigned</h5>
                                <p className="text-muted">You don't have any tasks in this project yet.</p>
                                <Button className='web_button' size="sm">
                                    Request Tasks
                                </Button>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <Table className="mb-0 table-hover table-sm" style={{ fontSize: '14px' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className='text-start' width="40%">Task</th>
                                            <th className='text-start' width="20%">Status</th>
                                            <th className='text-start' width="20%">Priority</th>
                                            <th className='text-start' width="20%">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projectTasks.map((task) => (
                                            <tr key={task._id} className="cursor-pointer">
                                                <td onClick={() => {
                                                    setSelectedTaskId(task._id);
                                                    setShowTaskDetail(true);
                                                }}>
                                                    <div className="text-start">
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-0 fw-semibold text-black">{task.summary}</h6>
                                                            {task.description && (
                                                                <small title={task.description} className="text-muted cp d-block text-truncate" style={{ maxWidth: '300px' }}>
                                                                    {/* {task.description} */}
                                                                    {task?.description ?
                                                                        <div
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: task.description?.slice(0, 30) + '...',
                                                                            }}
                                                                        />
                                                                        :
                                                                        <></>
                                                                    }

                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    className="text-start"
                                                    onClick={() => {
                                                        setSelectedTaskId(task._id);
                                                        setShowTaskDetail(true);
                                                    }}>
                                                    {getStatusBadge(task.status)}
                                                </td>
                                                <td
                                                    className="text-start"
                                                    onClick={() => {
                                                        setSelectedTaskId(task._id);
                                                        setShowTaskDetail(true);
                                                    }}>
                                                    {getPriorityBadge(task.priority)}
                                                </td>
                                                <td
                                                    className="text-start"
                                                    onClick={() => {
                                                        setSelectedTaskId(task._id);
                                                        setShowTaskDetail(true);
                                                    }}>
                                                    <div className="d-flex align-items-center">
                                                        {task.dueDate ? (
                                                            <span title={`${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'OVERDUE' : ''}`}
                                                                className={`${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-danger cp' : ''}`}>
                                                                <i className="uil uil-calendar-alt me-1 "></i>
                                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-top-0">
                        <div className="d-flex justify-content-between w-100">
                            <div>
                                {projectTasks.length > 0 && (
                                    <span className="text-muted small">
                                        Showing {projectTasks.length} of {projectTasks.length} tasks
                                    </span>
                                )}
                            </div>
                            <div>
                                <Button className=" web_close_button" onClick={() => setShowTaskModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Modal.Footer>
                </Modal>
            }

            {/* Task Detail Modal */}
            {/* <TaskDetailModal
                show={showTaskDetail}
                onHide={() => {
                    setShowTaskDetail(false);
                    setSelectedTaskId(null);
                }}
                taskId={selectedTaskId}
                onTaskUpdate={() => {
                    // Refresh project tasks if needed
                    if (selectedProject) {
                        handleViewTasks(selectedProject);
                    }
                    fetchProjects();
                }}
            /> */}

            {/* <TaskPreviewModal show={showTaskDetail} /> */}
            <TaskPreviewModal
                projectId={selectedProject}
                taskId={selectedTaskId}
                setChangesDone={setChangesDone}
                show={showTaskDetail}
                closeModal={closeTaskPreview} />
            {/* Project Description Offcanvas */}

            <DescriptionOffCanvas show={showDescription} onHide={() => setShowDescription(false)} description={selectedProject?.description} title={selectedProject?.name} />
        </>
    );
};

export default UserProjects;