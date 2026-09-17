import { useState, useEffect } from 'react';
import { Card, Table, Badge, Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getAmcProjects, updateProject } from '../../../redux/projects/action';
import MainLoader from '../../../constants/Loader/loader';
import moment from 'moment';
import DescriptionOffCanvas from '../../../components/DescriptionOffCanvas';
import CommentsOffCanvas from '../../../components/CommentsOffCanvas';
import './projects.css';

const AmcManagement = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const amcProjectData = useSelector(state => state?.getAmcProjectsReducer?.data?.data);
    const amcProjectsLoading = useSelector(state => state?.getAmcProjectsReducer?.loading);
    const updateProjectsResponse = useSelector(state => state?.updateProject?.data?.status);

    const selectedDepartment = localStorage?.getItem('selectedDepartment');
    const teamView = store?.Auth?.user?.role === 'admin' ? (selectedDepartment || 'Tech') : store?.Auth?.user?.role === 'Marketing' ? 'Marketing' : 'Tech';

    const [teamType, setTeamType] = useState(teamView);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [showCommentsOffCanvas, setShowCommentsOffCanvas] = useState(false);
    const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');

    const sessionData = localStorage.getItem('hyper_user');
    const userData = JSON.parse(sessionData);
    const userRole = userData?.role || store?.Auth?.user?.role;

    useEffect(() => {
        dispatch(getAmcProjects({
            projectType: teamType,
            page: currentPage,
            limit: 10,
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            ...(store?.Auth?.user?.role === 'QA' || store?.Auth?.user?.role === 'Sales' ? { userId: store?.Auth?.user?.id } : store?.Auth?.user?.role === 'Marketing' ? { userId: store?.Auth?.user?.id } : {})
        }));
    }, [dispatch, teamType, currentPage, searchTerm, statusFilter]);

    useEffect(() => {
        if (updateProjectsResponse === 200) {
            dispatch(getAmcProjects({
                projectType: teamType,
                page: currentPage,
                limit: 10,
                search: searchTerm,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                ...(store?.Auth?.user?.role === 'QA' || store?.Auth?.user?.role === 'Sales' ? { userId: store?.Auth?.user?.id } : store?.Auth?.user?.role === 'Marketing' ? { userId: store?.Auth?.user?.id } : {})
            }));
        }
    }, [updateProjectsResponse]);

    const handleStatusChange = (projectId, newStatus) => {
        dispatch(updateProject({
            id: projectId,
            projectStatus: newStatus
        }));
    };

    const handleViewDescription = (description, title) => {
        setSelectedDescription(description);
        setSelectedTitle(title);
        setShowOffCanvas(true);
    };

    const handleViewComments = (projectId, title) => {
        setSelectedProjectId(projectId);
        setSelectedProjectTitle(title);
        setShowCommentsOffCanvas(true);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'Support': 'bg-warning text-dark',
            'Ongoing': 'bg-primary text-white',
            'Delivered': 'bg-success text-white',
            'On Hold': 'bg-secondary text-white'
        };
        return statusMap[status] || 'bg-light text-dark';
    };

    const getPriorityBadge = (priority) => {
        const priorityMap = {
            'High': 'bg-danger text-white',
            'Medium': 'bg-warning text-dark',
            'Low': 'bg-success text-white'
        };
        return priorityMap[priority] || 'bg-light text-dark';
    };

    const truncateText = (text, maxLength = 25) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <>
            <Card style={{ height: '92vh', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center gap-3">
                                <h5 className="mb-0 fw-bold">AMC Management</h5>
                                <div className="d-flex align-items-center">
                                    <button
                                        className={`btn rounded-0 fw-semibold px-2 ${statusFilter === 'all' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                        onClick={() => setStatusFilter('all')}>All</button>
                                    <button
                                        className={`btn rounded-0 fw-semibold px-2 ${statusFilter === 'Support' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                        onClick={() => setStatusFilter('Support')}>Active</button>
                                    <button
                                        className={`btn rounded-0 fw-semibold px-2 ${statusFilter === 'On Hold' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                        onClick={() => setStatusFilter('On Hold')}>On Hold</button>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    type="text"
                                    style={{ padding: '4px 8px', fontSize: '11px', width: '200px' }}
                                    className='form-control'
                                    placeholder="Search AMC projects..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {amcProjectsLoading ? (
                            <MainLoader />
                        ) : !amcProjectData?.length ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <h5 className="text-muted">No AMC Projects Found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive h-100">
                                <Table className="mb-0 table-hover table-sm" style={{ fontSize: '11px' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Project</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Client</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Status</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Priority</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Team Lead</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Start Date</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>End Date</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {amcProjectData?.map((project) => (
                                            <tr key={project._id} className="align-middle">
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <div className="fw-semibold text-primary text-capitalize">
                                                        {truncateText(project.projectName, 20)}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: '10px' }}>
                                                        {project.technologies?.map(tech => tech.name).join(', ') || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <div className="fw-semibold">{project.client?.name || 'N/A'}</div>
                                                    <div className="text-muted" style={{ fontSize: '10px' }}>
                                                        {project.client?.email || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <Badge className={getStatusBadge(project.projectStatus)} style={{ fontSize: '10px', padding: '4px 8px' }}>
                                                        {project.projectStatus}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Badge className={getPriorityBadge(project.priority)} style={{ fontSize: '10px', padding: '4px 8px' }}>
                                                        {project.priority || 'Medium'}
                                                    </Badge>
                                                </td>
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <div>{project.teamLead?.name || 'N/A'}</div>
                                                    <div className="text-muted" style={{ fontSize: '10px' }}>
                                                        {project.teamLead?.email || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="text-center" style={{ fontSize: '12px' }}>
                                                    {project.startDate ? moment(project.startDate).format('DD/MM/YYYY') : 'N/A'}
                                                </td>
                                                <td className="text-center" style={{ fontSize: '12px' }}>
                                                    {project.endDate ? moment(project.endDate).format('DD/MM/YYYY') : 'N/A'}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                                            onClick={() => handleViewDescription(project.description, project.projectName)}
                                                            title="View Description"
                                                        >
                                                            <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-info"
                                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                                            onClick={() => handleViewComments(project._id, project.projectName)}
                                                            title="View Comments"
                                                        >
                                                            <i className="mdi mdi-comment" style={{ fontSize: '12px' }}></i>
                                                        </button>
                                                        {userRole === 'admin' && (
                                                            <Dropdown>
                                                                <Dropdown.Toggle
                                                                    variant="outline-secondary"
                                                                    size="sm"
                                                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                >
                                                                    <i className="mdi mdi-dots-vertical" style={{ fontSize: '12px' }}></i>
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item
                                                                        onClick={() => handleStatusChange(project._id, 'Support')}
                                                                        style={{ fontSize: '11px' }}
                                                                    >
                                                                        Mark as Active
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        onClick={() => handleStatusChange(project._id, 'On Hold')}
                                                                        style={{ fontSize: '11px' }}
                                                                    >
                                                                        Put on Hold
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item
                                                                        onClick={() => handleStatusChange(project._id, 'Delivered')}
                                                                        style={{ fontSize: '11px' }}
                                                                    >
                                                                        Mark as Completed
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <DescriptionOffCanvas
                show={showOffCanvas}
                onHide={() => setShowOffCanvas(false)}
                description={selectedDescription}
                title={selectedTitle}
            />

            <CommentsOffCanvas
                show={showCommentsOffCanvas}
                onHide={() => setShowCommentsOffCanvas(false)}
                projectId={selectedProjectId}
                projectTitle={selectedProjectTitle}
            />
        </>
    );
};

export default AmcManagement;