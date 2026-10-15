import { Table, Badge, Dropdown, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useState } from 'react';
import ConfirmationModal from './modal/ConfirmationModal';
import { updateProject, updateProjectStatuses } from '../../../redux/actions';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const AmcTable = ({
    amcProjectData,
    handleViewDescription,
    handleViewComments,
    handleStatusChange,
    handleUpdate,
    handleCopyToClipboard,
    copiedItems,
    setCopiedItems,
    userRole,
    truncateText,
    localMentionCounts,
    setLocalMentionCounts,
    setSelectedProjectTitle,
    setSelectedProjectId,
    setShowCommentsOffCanvas,
    setSelectedProjectForDependencies,
    setShowDependenciesModal
}) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [statusChangeData, setStatusChangeData] = useState(null);
    return (
        <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%' }}>
            <thead className="table-dark sticky-top">
                <tr>
                    <th className='fw-bold fs-6 text-start text-nowrap' style={{ width: '12%' }}>Project name</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>Client</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '8%' }}>Duration</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>Resources</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>AMC Hours</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '10%' }}>Worked Hours</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '12%' }}>Remaining Hours</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '8%' }}>Team Hours</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '6%' }}>Status</th>
                    <th className='fw-bold fs-6 text-center text-nowrap' style={{ width: '6%' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {amcProjectData?.map((project, index) => (
                    <tr key={project._id} className="align-middle">
                        <td className="text-start" style={{ fontSize: '12px' }}>
                            <div className="fw-semibold text-primary text-capitalize">
                                <Link to={`/dashboard/milestone/${project?._id}?type=AMC`} className="text-decoration-none">
                                    {project?.name}
                                </Link>
                                {project?.projectStatus === 'Ongoing' && (
                                    <span className="badge bg-soft-success text-success border border-success ms-1" style={{ fontSize: '9px' }} title="Also active in Ongoing Development">Ongoing</span>
                                )}
                            </div>
                        </td>
                        <td className="text-center" style={{ fontSize: '12px' }}>
                            {project?.client?.map((client) => client?.name).join(', ') || 'N/A'}
                        </td>
                        <td className="text-center" style={{ fontSize: '12px' }}>
                            {project?.amcType?.value} {project?.amcType?.type === "Monthly" ? 'M' : 'Y'}
                        </td>
                        <td className="text-center" style={{ fontSize: '12px' }}>
                            {(project?.figmaLinks?.length > 0 || project?.documentLinks?.length > 0 || project?.websites?.length > 0) ? (
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-none" size="sm" className="p-0" style={{ fontSize: '11px' }}>
                                        <i className="mdi mdi-folder-multiple text-primary me-1"></i>
                                        {(project?.figmaLinks?.length || 0) + (project?.documentLinks?.length || 0) + (project?.websites?.length || 0)}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className="shadow-sm p-0" style={{ minWidth: '200px', fontSize: '12px' }}>
                                        {project?.figmaLinks?.length > 0 && (
                                            <>
                                                <Dropdown.Header className="px-2 py-1 fw-bold text-primary">Figmas</Dropdown.Header>
                                                {project.figmaLinks.map((links, idx) => (
                                                    <Dropdown.Item key={`figma-${idx}`} className="px-2 py-1" onClick={() => window.open(links?.url)}>
                                                        <i className="mdi mdi-pencil-ruler me-2 text-info"></i>
                                                        {links?.title}
                                                    </Dropdown.Item>
                                                ))}
                                            </>
                                        )}
                                        {project?.documentLinks?.length > 0 && (
                                            <>
                                                <Dropdown.Divider />
                                                <Dropdown.Header className="px-2 py-1 fw-bold text-primary">Documents</Dropdown.Header>
                                                {project.documentLinks.map((links, idx) => (
                                                    <Dropdown.Item key={`doc-${idx}`} className="px-2 py-1" onClick={() => window.open(links?.url)}>
                                                        <i className="mdi mdi-file-document me-2 text-info"></i>
                                                        {links?.title}
                                                    </Dropdown.Item>
                                                ))}
                                            </>
                                        )}
                                        {project?.websites?.length > 0 && (
                                            <>
                                                <Dropdown.Divider />
                                                <Dropdown.Header className="px-2 py-1 fw-bold text-primary">Websites</Dropdown.Header>
                                                {project.websites.map((links, idx) => (
                                                    <Dropdown.Item key={`web-${idx}`} className="px-2 py-1" onClick={() => window.open(links?.url)}>
                                                        <i className="mdi mdi-web me-2 text-info"></i>
                                                        {links?.title}
                                                    </Dropdown.Item>
                                                ))}
                                            </>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            ) : '-'}
                        </td>
                        <td className="text-center" style={{ fontSize: '12px' }}>
                            {project?.amcHours || 0}
                        </td>
                        <td className="text-center" style={{ fontSize: '12px' }}>
                            {project.workedHours || 0}
                        </td>
                        <td className={`${project?.remainingHours < 0 ? 'text-danger' : 'text-success'} text-center`} style={{ fontSize: '12px' }}>
                            {project?.remainingHours || 0}
                        </td>
                        <td className="text-center" style={{ fontSize: '12px' }}>
                            {project?.teamHours || 0}
                        </td>
                        <td className="text-center" style={{ fontSize: '12px' }}>
                            <Form.Switch disabled={store?.Auth?.user?.role === 'Sales'} checked onClick={(e) => {
                                e.preventDefault();
                                // const newStatus = !ele?.isActive;
                                setStatusChangeData({
                                    projectId: project?._id,
                                    // newStatus: newStatus,
                                    projectName: project?.name,
                                    currentStatus: "Support"
                                });
                                setShowConfirmModal(true);
                            }} />
                            <ConfirmationModal
                                show={showConfirmModal}
                                onHide={() => setShowConfirmModal(false)}
                                onConfirm={() => {
                                    if (statusChangeData) {
                                        const body = {
                                            projectStatus: 'Hold',
                                            lastStatus: 'Support'
                                        };
                                        dispatch(updateProjectStatuses({ projectId: statusChangeData.projectId, body }));
                                        setShowConfirmModal(false);
                                    }
                                }}
                                title="Confirm Status Change"
                                message={statusChangeData ?
                                    `Are you sure you want to ${statusChangeData.newStatus ? 'activate' : 'deactivate'} the AMC "${statusChangeData.projectName}"?` :
                                    'Are you sure you want to change the project status?'}
                            />
                        </td>
                        <td className='text-start'>
                            <div className='d-flex justify-content-center' style={{ gap: '3px' }}>
                                <Link to={`/dashboard/milestone/${project?._id}?type=AMC`} className="btn btn-outline-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                    <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                </Link>
                                {userRole !== "Marketing" && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        style={{ padding: '2px 6px', fontSize: '10px' }}
                                        onClick={() => handleUpdate(project)}>
                                        <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                    </button>
                                )}
                                {userRole !== "QA" && (
                                    <button
                                        className="btn btn-outline-success position-relative"
                                        style={{ padding: '2px 6px', fontSize: '10px' }}
                                        onClick={() => {
                                            setSelectedProjectTitle(project?.name);
                                            setSelectedProjectId(project?._id);
                                            setLocalMentionCounts(prev => ({
                                                ...prev,
                                                [project._id]: 0
                                            }));
                                            setShowCommentsOffCanvas(true);
                                        }}
                                    >
                                        <i className="mdi mdi-comment-text-outline" style={{ fontSize: '13px' }}></i>
                                        {(localMentionCounts[project._id] !== undefined ? localMentionCounts[project._id] : project.mentionCount) > 0 && (
                                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                                style={{
                                                    fontSize: '9px',
                                                    minWidth: '18px',
                                                    height: '18px',
                                                    lineHeight: '18px',
                                                    padding: '0 6px',
                                                    transform: 'translate(-50%, -50%)',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                                }}>
                                                {(localMentionCounts[project._id] !== undefined ? localMentionCounts[project._id] : project.mentionCount) > 99 ? '99+' : (localMentionCounts[project._id] !== undefined ? localMentionCounts[project._id] : project.mentionCount)}
                                            </span>
                                        )}
                                    </button>
                                )}
                                <button
                                    className="btn btn-outline-info"
                                    style={{ padding: '2px 6px', fontSize: '12px' }}
                                    onClick={() => {
                                        setSelectedProjectForDependencies(project);
                                        setShowDependenciesModal(true);
                                    }}
                                    title="View Dependencies"
                                >
                                    <span className='fw-bold'>D</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default AmcTable;