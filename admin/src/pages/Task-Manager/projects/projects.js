import { useState, useEffect } from 'react';
import { Card, Dropdown, Form, Table } from 'react-bootstrap';
import './projects.css';
import { Link } from 'react-router-dom';
import { getAllProjects, updateProject, getAmcProjects, updateProjectStatuses } from '../../../redux/projects/action';
import { useDispatch, useSelector } from 'react-redux';
import MainLoader from '../../../constants/Loader/loader';
import moment from 'moment';
import ProjectModal from './modal/ProjectModal';
import DescriptionOffCanvas from '../../../components/DescriptionOffCanvas';
import CommentsOffCanvas from '../../../components/CommentsOffCanvas';
import ConfirmationModal from './modal/ConfirmationModal';
import DependenciesModal from './modal/DependenciesModal';
import AmcTable from './AmcTable';
import axios from 'axios';
import { getScopedUserIdParams } from '../../../helpers/scopeUserParams';

const Projects = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const getProjectList = useSelector(state => state?.getProject);
    const addProjectsResponse = useSelector(state => state?.addProject?.data?.status);
    const updateProjectsResponse = useSelector(state => state?.updateProject?.data?.status);
    const updateProjectsStatusResponse = useSelector(state => state?.updateProjectStatusReducer?.data?.status);
    const projectData = useSelector(state => state?.getProject?.data?.data);
    const amcProjectData = useSelector(state => state?.getAmcProjectsReducer?.data?.data);
    const amcProjectsLoading = useSelector(state => state?.getAmcProjectsReducer?.loading);
    const selectedDepartment = localStorage?.getItem('selectedDepartment');
    const sessionData = localStorage.getItem('hyper_user');
    const userData = JSON.parse(sessionData);
    const userRole = userData?.role || store?.Auth?.user?.role;
    const scopedUserParams = getScopedUserIdParams(userRole, store?.Auth?.user?.id);
    const teamView = store?.Auth?.user?.role === 'admin' || store?.Auth?.user?.role === 'Sales' ? (selectedDepartment) : (store?.Auth?.user?.role === 'Marketing' ? 'Marketing' : store?.Auth?.user?.role === 'Freelancers' ? 'Freelance' : 'Tech');
    const [openModal, setOpenModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editData, setEditData] = useState();
    const [skip, setSkip] = useState(1);
    const [status, setStatus] = useState(true);
    const [projectStatus, setprojectStatus] = useState(() => {
        return localStorage.getItem('activeProjectTab') || 'Ongoing';
    });
    console.log(projectStatus, "projectStatus")
    const [projectSearch, setProjectSearch] = useState('');
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [showCommentsOffCanvas, setShowCommentsOffCanvas] = useState(false);
    const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [copiedItems, setCopiedItems] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [statusChangeData, setStatusChangeData] = useState(null);
    const [localMentionCounts, setLocalMentionCounts] = useState({});
    const [showDependenciesModal, setShowDependenciesModal] = useState(false);
    const [selectedProjectForDependencies, setSelectedProjectForDependencies] = useState(null);
    const [teamType, setTeamType] = useState(teamView);

    const handelCreate = () => {
        setOpenModal(true);
    };

    const closeModal = () => {
        setOpenModal(false);
    };

    const handelUpdate = (data) => {
        setEditData(data);
        setOpenEditModal(true);
    };

    const closeupdatemodal = () => {
        setOpenEditModal(false);
    };

    const fetchProjects = (params = {}) => {
        if (projectStatus === 'Support') {
            dispatch(getAmcProjects({ projectType: teamType, page: 1, limit: 100, search: projectSearch, ...scopedUserParams, ...params }));
        } else {
            dispatch(getAllProjects({ status, projectType: teamType, skip, projectStatus, limit: 100, search: projectSearch, ...scopedUserParams, ...params }));
        }
    };

    const handleActive = (val) => {
        setStatus(val);
        setSkip(1);
        if (projectStatus !== 'Support') {
            dispatch(getAllProjects({
                status: val,
                skip: 1,
                projectStatus,
                limit: 100,
                projectType: teamType,
                ...scopedUserParams,
            }));
        }
    };

    const handleProjectStatus = (val) => {
        setStatus(true);
        const statusMap = { '1': 'Ongoing', '2': 'Support', '3': 'Delivered', '4': 'Hold' };
        const newStatus = statusMap[val];
        setprojectStatus(newStatus);
        localStorage.setItem('activeProjectTab', newStatus);
        setSkip(1);
    };

    const truncateText = (text, maxLength = 25) => {
        if (!text) return '-';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    useEffect(() => {
        if (addProjectsResponse === 201 || updateProjectsResponse === 200) {
            handleActive(true);
            // fetchProjects();
            fetchProjectCounts();
        }
    }, [addProjectsResponse, updateProjectsResponse])

    useEffect(() => {
        if (updateProjectsStatusResponse === 200) {
            fetchProjectCounts();
            fetchProjects();
        }
    }, [updateProjectsStatusResponse])

    useEffect(() => {
        fetchProjects();
    }, [dispatch, projectSearch, teamType, projectStatus]);

    const [projectTypesCount, setProjectTypesCount] = useState(null);

    const fetchProjectCounts = async () => {
        try {
            const response = await axios.get(`/api/v1/admin/project/status-counts?isActive=${status}&projectType=${selectedDepartment}${(store?.Auth?.user?.role === 'QA' || store?.Auth?.user?.role === 'Sales' || store?.Auth?.user?.role === 'Marketing' || store?.Auth?.user?.role === 'Freelancers') ? `&user=${store?.Auth?.user?.id}` : ''}`)
            if (response?.status === 200) {
                await setProjectTypesCount(response?.data?.data)
            }
        } catch (error) {
            console.log(error, "Error fetching the project counts")
        }
    }

    useEffect(() => {
        fetchProjectCounts();
    }, [dispatch, status, selectedDepartment]);

    return (
        <>
            <div>
                <Card style={{ height: '92vh', display: 'flex', flexDirection: 'column' }}>
                    <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="mb-0">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="d-flex align-items-center">
                                        <button
                                            className={`btn rounded-0 fw-semibold px-2 ${projectStatus == 'Ongoing' ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => handleProjectStatus('1')}>
                                            {`Ongoing`}&nbsp;&nbsp;
                                            <span style={{ fontSize: '10px' }} className={`${projectStatus == 'Ongoing' ? 'bg-white text-black' : 'bg-dark text-white'} rounded-2 text-black px-1  fw-semibold`}>{projectTypesCount?.Ongoing}</span>
                                        </button>
                                        <button
                                            className={`btn rounded-0 fw-semibold px-2 ${projectStatus == "Support" ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }}
                                            onClick={() => handleProjectStatus('2')}>
                                            {`AMC`}&nbsp;&nbsp;
                                            <span style={{ fontSize: '10px' }} className={`${projectStatus == 'Support' ? 'bg-white text-black' : 'bg-dark text-white'} rounded-2 text-black px-1  fw-semibold`}>{projectTypesCount?.Support}</span>
                                        </button>
                                        <button className={`btn rounded-0 fw-semibold px-2 ${projectStatus == "Delivered" ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleProjectStatus('3')}>
                                            Delivered&nbsp;&nbsp;
                                            <span style={{ fontSize: '10px' }} className={`${projectStatus == 'Delivered' ? 'bg-white text-black' : 'bg-dark text-white'} rounded-2 text-black px-1  fw-semibold`}>{projectTypesCount?.Delivered}</span>
                                        </button>
                                        <button className={`btn rounded-0 fw-semibold px-2 ${projectStatus == "Hold" ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                            style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleProjectStatus('4')}>
                                            Hold&nbsp;&nbsp;
                                            <span style={{ fontSize: '10px' }} className={`${projectStatus == 'Hold' ? 'bg-white text-black' : 'bg-dark text-white'} rounded-2 text-black px-1  fw-semibold`}>{projectTypesCount?.Hold}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-1">
                                    <div style={{ position: 'relative', width: '10vw' }}>
                                        <input
                                            type="text"
                                            style={{ padding: '4px 22px 4px 8px', fontSize: '11px', width: '100%' }}
                                            className='form-control'
                                            placeholder="Search projects..."
                                            value={typeof projectSearch !== 'undefined' ? projectSearch : ''}
                                            onChange={e => {
                                                setProjectSearch(e.target.value);
                                            }}
                                        />
                                        {projectSearch && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProjectSearch('');
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    right: '8px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    color: '#888'
                                                }}
                                                aria-label="Clear search"
                                            >
                                                &#10005;
                                            </button>
                                        )}
                                    </div>
                                    {/* {projectStatus !== "Support" && (
                                        <select style={{ padding: '4px 16px', fontSize: '11px', width: '7vw' }} className='form-select'
                                            value={status === true ? 'Active' : "Inactive"}
                                            onChange={(e) => {
                                                if (e.target.value === 'Active') {
                                                    handleActive(true);
                                                } else {
                                                    handleActive(false);
                                                }
                                            }}>
                                            {['Active', 'Inactive']?.map((data, index) => (
                                                <option key={index} value={data}>{data}</option>
                                            ))}
                                        </select>
                                    )} */}
                                    {userRole !== "Sales" && (
                                        <button className="btn text-nowrap bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handelCreate()}>
                                            {`Add Project`}
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {(projectStatus === 'Support' ? amcProjectsLoading : getProjectList?.loading) ? (
                                <MainLoader />
                            ) : (projectStatus === 'Support' ? amcProjectData : projectData)?.length === 0 ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <h5 className="text-muted">{`No Data Found`}</h5>
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ height: '83vh', overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
                                    {projectStatus === 'Support' ? (
                                        <AmcTable
                                            amcProjectData={amcProjectData}
                                            handleViewDescription={(desc, title) => {
                                                setSelectedDescription(desc);
                                                setSelectedTitle(title);
                                                setShowOffCanvas(true);
                                            }}
                                            handleViewComments={(id, title) => {
                                                setSelectedProjectId(id);
                                                setSelectedProjectTitle(title);
                                                setShowCommentsOffCanvas(true);
                                            }}
                                            handleStatusChange={(id, status) => {
                                                dispatch(updateProject({ id, projectStatus: status }));
                                            }}
                                            handleUpdate={handelUpdate}
                                            handleCopyToClipboard={(text, id) => {
                                                navigator.clipboard.writeText(text);
                                                setCopiedItems(prev => ({ ...prev, [id]: true }));
                                                setTimeout(() => {
                                                    setCopiedItems(prev => ({ ...prev, [id]: false }));
                                                }, 2000);
                                            }}
                                            copiedItems={copiedItems}
                                            setCopiedItems={setCopiedItems}
                                            userRole={userRole}
                                            truncateText={truncateText}
                                            localMentionCounts={localMentionCounts}
                                            setLocalMentionCounts={setLocalMentionCounts}
                                            setSelectedProjectTitle={setSelectedProjectTitle}
                                            setSelectedProjectId={setSelectedProjectId}
                                            setShowCommentsOffCanvas={setShowCommentsOffCanvas}
                                            setSelectedProjectForDependencies={setSelectedProjectForDependencies}
                                            setShowDependenciesModal={setShowDependenciesModal}
                                        />
                                    ) : (
                                        <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%' }}>
                                            <thead className="table-dark sticky-top">
                                                <tr>
                                                    <th className='fw-bold fs-6 text-start text-nowrap' style={{ width: '12%' }}>{`Project Name`}</th>
                                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '12%' }}>{`Client Name`}</th>
                                                    {projectStatus === 'Support' && (
                                                        <>
                                                            <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '6%' }}>{`Type`}</th>
                                                            <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '6%' }}>{`Value`}</th>
                                                            <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '6%' }}>{`Hours`}</th>
                                                        </>
                                                    )}
                                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>{`Resources`}</th>
                                                    {projectStatus !== 'Delivered' && (
                                                        <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '8%' }}>{`Meetings`}</th>
                                                    )}
                                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '12%' }}>{`Duration`}</th>
                                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '8%' }}>{`Worked Hours`}</th>
                                                    {projectStatus !== 'Delivered' && (
                                                        <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '8%' }}>{`Days Left`}</th>
                                                    )}
                                                    {store?.Auth?.user?.role !== 'Marketing' && projectStatus !== "Delivered" && (
                                                        <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '6%' }}>{`Status`}</th>
                                                    )}
                                                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '12%' }}>{`Actions`}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(projectStatus === 'Support' ? amcProjectData : projectData)?.map((ele, ind) => {
                                                    const clientNames = ele?.client?.length ?
                                                        ele.client.map(c => c.name).join(', ') : '-'
                                                    return (
                                                        <tr className="align-middle" key={ele._id} style={{ transition: 'all 0.2s ease' }}>
                                                            <td className="text-start" style={{ fontSize: '12px', width: '15%', wordWrap: 'break-word' }}>
                                                                {userRole === 'Marketing' || userRole === 'Sales' || userRole === 'Freelancers' ? (
                                                                    <span className="namelink text-primary fw-semibold text-capitalize">
                                                                        {ele?.name}
                                                                        {ele?.hasAmc && <span className="badge bg-soft-info text-primary border border-primary ms-1" style={{ fontSize: '9px' }} title="AMC Contract Active">AMC</span>}
                                                                    </span>
                                                                ) : (
                                                                    <Link to={`/dashboard/milestone/${ele?._id}`} className="text-decoration-none">
                                                                        <span className="namelink text-primary fw-semibold text-capitalize">
                                                                            {ele?.name}
                                                                            {ele?.hasAmc && <span className="badge bg-soft-info text-primary border border-primary ms-1" style={{ fontSize: '9px' }} title="AMC Contract Active">AMC</span>}
                                                                        </span>
                                                                    </Link>
                                                                )}
                                                            </td>
                                                            <td className="text-center py-0" style={{ fontSize: '12px', width: '12%', wordWrap: 'break-word' }}>
                                                                <span className="namelink text-dark text-capitalize">
                                                                    {clientNames}
                                                                </span>
                                                            </td>
                                                            <td className='text-center' style={{ width: '10%' }}>
                                                                <div>
                                                                    {(ele?.figmaLinks?.length > 0 || ele?.documentLinks?.length > 0 || ele?.websites?.length > 0) ? (
                                                                        <Dropdown autoClose="outside" renderOnMount container="body" className="d-inline-block">
                                                                            <Dropdown.Toggle variant="outline-none" size="sm" className="p-0" style={{ fontSize: '11px' }}>
                                                                                <i className="mdi mdi-folder-multiple text-primary me-1"></i>
                                                                                {(ele?.figmaLinks?.length || 0) + (ele?.documentLinks?.length || 0) + (ele?.websites?.length || 0)}
                                                                            </Dropdown.Toggle>
                                                                            <Dropdown.Menu className="shadow-sm p-0" style={{ minWidth: '200px', fontSize: '12px', zIndex: 9999 }}>
                                                                                {ele?.figmaLinks?.length > 0 && (
                                                                                    <>
                                                                                        <Dropdown.Header className="px-2 py-1 fw-bold text-primary">Figmas</Dropdown.Header>
                                                                                        {ele.figmaLinks.map((links, idx) => (
                                                                                            <Dropdown.Item key={`figma-${idx}`} className="px-2 py-1">
                                                                                                <div onClick={(e) => { e.stopPropagation(); window.open(links?.url); }} className='d-flex align-items-center cp'>
                                                                                                    <i className="mdi mdi-pencil-ruler me-2 text-info"></i>
                                                                                                    <span className="text-info">{links?.title}</span>
                                                                                                </div>
                                                                                            </Dropdown.Item>
                                                                                        ))}
                                                                                    </>
                                                                                )}
                                                                                {ele?.documentLinks?.length > 0 && (
                                                                                    <>
                                                                                        <Dropdown.Divider />
                                                                                        <Dropdown.Header className="px-2 py-1 fw-bold text-primary">Documents</Dropdown.Header>
                                                                                        {ele.documentLinks.map((links, idx) => (
                                                                                            <Dropdown.Item key={`doc-${idx}`} className="px-2 py-1">
                                                                                                <div onClick={(e) => { e.stopPropagation(); window.open(links?.url); }} className='d-flex align-items-center cp'>
                                                                                                    <i className="mdi mdi-file-document me-2 text-info"></i>
                                                                                                    <span className="text-info">{links?.title}</span>
                                                                                                </div>
                                                                                            </Dropdown.Item>
                                                                                        ))}
                                                                                    </>
                                                                                )}
                                                                                {ele?.websites?.length > 0 && (
                                                                                    <>
                                                                                        <Dropdown.Divider />
                                                                                        <Dropdown.Header className="px-2 py-1 fw-bold text-primary">Websites</Dropdown.Header>
                                                                                        {ele.websites.map((links, idx) => (
                                                                                            <Dropdown.Item key={`web-${idx}`} className="px-2 py-1">
                                                                                                <div className="d-flex flex-column">
                                                                                                    <p onClick={(e) => { e.stopPropagation(); window.open(links?.url); }} className="mb-1 fw-semibold cp text-info d-flex align-items-center">
                                                                                                        <i className="mdi mdi-web me-2"></i>
                                                                                                        {links?.title}
                                                                                                    </p>
                                                                                                    {links?.creds?.map((creds, i) => (
                                                                                                        <div key={i} className="border-top pt-1 mt-1" style={{ fontSize: '11px' }}>
                                                                                                            <div className="d-flex align-items-center justify-content-between">
                                                                                                                <div className="d-flex align-items-center">
                                                                                                                    <span className="me-1">👤</span>
                                                                                                                    <span>{creds?.username}</span>
                                                                                                                </div>
                                                                                                                <i className={`mdi ${copiedItems[`username-${links.url}-${i}`] ? 'mdi-check text-success' : 'mdi-content-copy text-secondary'} cp`}
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        navigator.clipboard.writeText(creds?.username);
                                                                                                                        setCopiedItems((prev) => ({ ...prev, [`username-${links.url}-${i}`]: true }));
                                                                                                                        setTimeout(() => setCopiedItems((prev) => ({ ...prev, [`username-${links.url}-${i}`]: false })), 2000);
                                                                                                                    }}
                                                                                                                    title={copiedItems[`username-${links.url}-${i}`] ? 'Copied!' : 'Copy username'}>
                                                                                                                </i>
                                                                                                            </div>
                                                                                                            <div className="d-flex align-items-center justify-content-between">
                                                                                                                <div className="d-flex align-items-center">
                                                                                                                    <span className="me-1">🔐</span>
                                                                                                                    <span>{creds?.password}</span>
                                                                                                                </div>
                                                                                                                <i className={`mdi ${copiedItems[`password-${links.url}-${i}`] ? 'mdi-check text-success' : 'mdi-content-copy text-secondary'} cp`}
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        navigator.clipboard.writeText(creds?.password);
                                                                                                                        setCopiedItems((prev) => ({ ...prev, [`password-${links.url}-${i}`]: true }));
                                                                                                                        setTimeout(() => setCopiedItems((prev) => ({ ...prev, [`password-${links.url}-${i}`]: false })), 2000);
                                                                                                                    }}
                                                                                                                    title={copiedItems[`password-${links.url}-${i}`] ? 'Copied!' : 'Copy password'}>
                                                                                                                </i>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </Dropdown.Item>
                                                                                        ))}
                                                                                    </>
                                                                                )}
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    ) : (
                                                                        <span className="text-muted">-</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            {projectStatus !== 'Delivered' && (
                                                                <td className='text-center' style={{ fontSize: '12px', width: '8%' }}>
                                                                    <div className="d-flex justify-content-center align-items-center">
                                                                        {(() => {
                                                                            const todayMeetings = ele?.meetings?.filter(meeting =>
                                                                                moment(meeting.startDateTime).isSame(moment(), 'day')
                                                                            ) || [];

                                                                            return todayMeetings.length > 0 ? (
                                                                                <Dropdown>
                                                                                    <Dropdown.Toggle variant="link" className="p-0 border-0 text-decoration-none">
                                                                                        <span className="badge bg-warning text-white" style={{ fontSize: '10px' }}>
                                                                                            <i className="mdi mdi-calendar-today me-1"></i>
                                                                                            Meeting Today
                                                                                        </span>
                                                                                    </Dropdown.Toggle>
                                                                                    <Dropdown.Menu className="p-2" style={{ minWidth: '300px' }}>
                                                                                        <div className="fw-bold mb-2 text-center border-bottom pb-2">
                                                                                            <i className="mdi mdi-calendar-multiple me-1"></i>
                                                                                            Today's Meetings
                                                                                        </div>
                                                                                        {todayMeetings.map((meeting, idx) => (
                                                                                            <div key={idx} className="mb-2 p-2 border rounded">
                                                                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                                                                    <div className="fw-semibold" style={{ fontSize: '11px' }}>
                                                                                                        {meeting.title}
                                                                                                    </div>
                                                                                                    <span className={`badge ${meeting.status === 'scheduled' ? 'bg-success' : meeting.status === 'completed' ? 'bg-secondary' : 'bg-danger'}`} style={{ fontSize: '9px' }}>
                                                                                                        {meeting.status}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="text-muted mb-1" style={{ fontSize: '10px' }}>
                                                                                                    <i className="mdi mdi-clock-outline me-1"></i>
                                                                                                    {moment(meeting.startDateTime).format('MMM DD, YYYY HH:mm')} - {moment(meeting.endDateTime).format('HH:mm')}
                                                                                                </div>
                                                                                                {meeting.location && (
                                                                                                    <div className="text-muted mb-1" style={{ fontSize: '10px' }}>
                                                                                                        <i className="mdi mdi-map-marker me-1"></i>
                                                                                                        {meeting.location}
                                                                                                    </div>
                                                                                                )}
                                                                                                {meeting.meetingLink && (
                                                                                                    <div className="d-flex gap-1 mt-2">
                                                                                                        <button
                                                                                                            className="btn btn-primary btn-sm"
                                                                                                            style={{ fontSize: '9px', padding: '2px 8px' }}
                                                                                                            onClick={() => window.open(meeting.meetingLink, '_blank')}
                                                                                                        >
                                                                                                            <i className="mdi mdi-video me-1"></i>
                                                                                                            Join Meeting
                                                                                                        </button>
                                                                                                        <button
                                                                                                            className="btn btn-outline-secondary btn-sm"
                                                                                                            style={{ fontSize: '9px', padding: '2px 8px' }}
                                                                                                            onClick={() => {
                                                                                                                navigator.clipboard.writeText(meeting.meetingLink);
                                                                                                            }}
                                                                                                        >
                                                                                                            <i className="mdi mdi-content-copy"></i>
                                                                                                        </button>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ))}
                                                                                    </Dropdown.Menu>
                                                                                </Dropdown>
                                                                            ) : (
                                                                                <span className="text-muted">No Meetings</span>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                </td>
                                                            )}
                                                            <td className='text-center' style={{ fontSize: '12px', width: '12%' }}>
                                                                {(ele?.start ? moment(ele?.start).format("MMM'YY") : '-') + ' - ' + (ele?.end ? moment(ele?.end).format("MMM'YY") : '-')}
                                                            </td>
                                                            <td className='text-center' style={{ fontSize: '12px', width: '12%' }}>
                                                                {ele?.monthlyHours + ' h' || '-'}
                                                            </td>
                                                            {projectStatus !== 'Delivered' && (
                                                                <td className='text-center' style={{ fontSize: '12px', width: '8%' }}>
                                                                    {ele?.isActive ? (
                                                                        (() => {
                                                                            const days =
                                                                                projectStatus === "Support"
                                                                                    ? moment(ele?.amcEndDate).isBefore(moment())
                                                                                        ? moment().diff(moment(ele?.amcEndDate), "days") === 0
                                                                                            ? 0
                                                                                            : -moment().diff(moment(ele?.amcEndDate), "days")
                                                                                        : moment(ele?.amcEndDate).diff(moment(), "days")
                                                                                    : moment(ele?.end).isBefore(moment())
                                                                                        ? moment().diff(moment(ele?.end), "days") === 0
                                                                                            ? 0
                                                                                            : -moment().diff(moment(ele?.end), "days")
                                                                                        : moment(ele?.end).diff(moment(), "days");

                                                                            if (isNaN(days)) {
                                                                                return <span style={{ fontSize: "10px", width: "2.5vw" }}>N/A</span>;
                                                                            }

                                                                            // ✅ decide badge color
                                                                            let badgeClass = "badge py-1 text-white";
                                                                            let bgColor = "";

                                                                            if (days === 0) {
                                                                                bgColor = "#8FD1A3"; // custom green
                                                                            } else if (projectStatus === "Support") {
                                                                                if (moment(ele?.amcEndDate).isBefore(moment())) {
                                                                                    badgeClass += " bg-danger";
                                                                                } else {
                                                                                    bgColor = "#8FD1A3";
                                                                                }
                                                                            } else {
                                                                                if (moment(ele?.end).isBefore(moment())) {
                                                                                    badgeClass += " bg-danger";
                                                                                } else {
                                                                                    bgColor = "#8FD1A3";
                                                                                }
                                                                            }

                                                                            return (
                                                                                <span
                                                                                    className={badgeClass}
                                                                                    style={{
                                                                                        fontSize: "10px",
                                                                                        width: "2.5vw",
                                                                                        backgroundColor: bgColor,
                                                                                    }}
                                                                                >
                                                                                    {days}
                                                                                </span>
                                                                            );
                                                                        })()
                                                                    ) : (
                                                                        <span>0</span>
                                                                    )}
                                                                </td>
                                                            )}
                                                            {store?.Auth?.user?.role !== 'Marketing' && projectStatus !== "Delivered" && (
                                                                <td className='text-center' style={{ width: '6%' }}>
                                                                    <Form.Switch disabled={store?.Auth?.user?.role === 'Sales'} checked={ele?.projectStatus === 'Ongoing'} onClick={(e) => {
                                                                        e.preventDefault();
                                                                        // const newStatus = !ele?.isActive;
                                                                        setStatusChangeData({
                                                                            projectId: ele?._id,
                                                                            // newStatus: newStatus,
                                                                            projectName: ele?.name,
                                                                            currentStatus: projectStatus === "Hold" ? ele?.lastStatus : ele?.projectStatus
                                                                        });
                                                                        setShowConfirmModal(true);
                                                                    }} />
                                                                </td>
                                                            )}
                                                            {userRole === "Sales" ?
                                                                <td className='text-center' style={{ width: '9%' }}>
                                                                    <div className='d-flex justify-content-center' style={{ gap: '5px' }}>
                                                                        <button
                                                                            title='Comments'
                                                                            className="btn btn-outline-secondary"
                                                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                            onClick={() => {
                                                                                setSelectedProjectTitle(ele?.name);
                                                                                setSelectedProjectId(ele?._id);
                                                                                setLocalMentionCounts(prev => ({
                                                                                    ...prev,
                                                                                    [ele._id]: 0
                                                                                }));
                                                                                setShowCommentsOffCanvas(true);
                                                                            }}>
                                                                            <i className="mdi mdi-comment-text-outline" style={{ fontSize: '12px' }}></i>
                                                                        </button>
                                                                        <button
                                                                            title='View Description'
                                                                            className="btn btn-outline-secondary"
                                                                            style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                            onClick={() => {
                                                                                setSelectedDescription(ele?.description || 'No description');
                                                                                setSelectedTitle(ele?.name);
                                                                                setShowOffCanvas(true);
                                                                            }}>
                                                                            <i className="bi bi-info" style={{ fontSize: '12px' }}></i>
                                                                        </button>

                                                                    </div>
                                                                </td>
                                                                :
                                                                <td className='text-center' style={{ width: '9%' }}>
                                                                    <div className='d-flex justify-content-center' style={{ gap: '5px' }}>
                                                                        <Link title='View Milestones' to={`/dashboard/milestone/${ele?._id}`} className="btn btn-outline-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                                                            <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                                        </Link>
                                                                        {userRole !== "Marketing" && userRole !== "Freelancers" && (
                                                                            <button
                                                                                title='Edit Project'
                                                                                className="btn btn-outline-secondary"
                                                                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                                onClick={() => handelUpdate(ele)}>
                                                                                <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                                                            </button>
                                                                        )}
                                                                        <div className="dropdown">
                                                                            <button
                                                                                className="btn btn-outline-dark dropdown-toggle"
                                                                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                                type="button"
                                                                                data-bs-toggle="dropdown"
                                                                                aria-expanded="false"
                                                                            >
                                                                                <i className="mdi mdi-dots-vertical" style={{ fontSize: '12px' }}></i>
                                                                            </button>
                                                                            <ul className="dropdown-menu">
                                                                                <li>
                                                                                    <button
                                                                                        className="dropdown-item"
                                                                                        onClick={() => {
                                                                                            setSelectedDescription(ele?.description || 'No description');
                                                                                            setSelectedTitle(ele?.name);
                                                                                            setShowOffCanvas(true);
                                                                                        }}
                                                                                    >
                                                                                        <i className="bi bi-info me-2"></i>View Description
                                                                                    </button>
                                                                                </li>
                                                                                {userRole !== "QA" && (
                                                                                    <li>
                                                                                        <button
                                                                                            className="dropdown-item position-relative"
                                                                                            onClick={() => {
                                                                                                setSelectedProjectTitle(ele?.name);
                                                                                                setSelectedProjectId(ele?._id);
                                                                                                setLocalMentionCounts(prev => ({
                                                                                                    ...prev,
                                                                                                    [ele._id]: 0
                                                                                                }));
                                                                                                setShowCommentsOffCanvas(true);
                                                                                            }}
                                                                                        >
                                                                                            <i className="mdi mdi-comment-text-outline me-2"></i>Comments
                                                                                            {(localMentionCounts[ele._id] !== undefined ? localMentionCounts[ele._id] : ele.mentionCount) > 0 && (
                                                                                                <span className="badge bg-danger ms-2">
                                                                                                    {(localMentionCounts[ele._id] !== undefined ? localMentionCounts[ele._id] : ele.mentionCount) > 99 ? '99+' : (localMentionCounts[ele._id] !== undefined ? localMentionCounts[ele._id] : ele.mentionCount)}
                                                                                                </span>
                                                                                            )}
                                                                                        </button>
                                                                                    </li>
                                                                                )}
                                                                                <li>
                                                                                    <button
                                                                                        className="dropdown-item"
                                                                                        onClick={() => {
                                                                                            setSelectedProjectForDependencies(ele);
                                                                                            setShowDependenciesModal(true);
                                                                                        }}
                                                                                    >
                                                                                        <span className="fw-bold me-2">D</span>Dependencies
                                                                                    </button>
                                                                                </li>
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            }
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                <ProjectModal modal={openModal} closeModal={closeModal} />
                <ProjectModal modal={openEditModal} closeModal={closeupdatemodal} editData={editData} />

                <DescriptionOffCanvas
                    show={showOffCanvas}
                    onHide={() => setShowOffCanvas(false)}
                    description={selectedDescription}
                    title={selectedTitle}
                />

                <CommentsOffCanvas
                    show={showCommentsOffCanvas}
                    onHide={() => setShowCommentsOffCanvas(false)}
                    title={selectedProjectTitle}
                    projectId={selectedProjectId}
                />

                <ConfirmationModal
                    show={showConfirmModal}
                    onHide={() => setShowConfirmModal(false)}
                    onConfirm={() => {
                        if (statusChangeData) {
                            const body = {
                                projectStatus: projectStatus === "Hold" ? statusChangeData?.currentStatus : 'Hold',
                                lastStatus: projectStatus === "Hold" ? "Hold" : statusChangeData?.currentStatus
                            };
                            dispatch(updateProjectStatuses({ projectId: statusChangeData.projectId, body }));
                            setShowConfirmModal(false);
                        }
                    }}
                    title="Confirm Status Change"
                    message={statusChangeData ?
                        `Are you sure you want to ${statusChangeData.newStatus ? 'activate' : 'deactivate'} the project "${statusChangeData.projectName}"?` :
                        'Are you sure you want to change the project status?'}
                />

                <DependenciesModal
                    show={showDependenciesModal}
                    onHide={() => setShowDependenciesModal(false)}
                    projectData={selectedProjectForDependencies}
                />
            </div>
        </>
    );
};

export default Projects;
