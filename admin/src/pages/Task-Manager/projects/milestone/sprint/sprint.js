import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ListGroup, Container, Row, Col, Card, Table, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import { Modal } from 'react-bootstrap';
import Create from './modal/create';
import { getSingleSprint, deleteSprint, updateSprint } from '../../../../../redux/sprint/action';
import ToastHandle from '../../../../../constants/toaster/toaster';
import Update from './modal/update';
import { Link } from 'react-router-dom';
import MainLoader from '../../../../../constants/Loader/loader';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ProjectPreview from '../../Projectpreview';
import DescriptionOffCanvas from '../../../../../components/DescriptionOffCanvas';
import { getProjectsById } from '../../../../../redux/actions';

const Sprint = () => {
    const { milestoneId } = useParams();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('projectId');
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [render, setRender] = useState(false);
    const [skip, setSkip] = useState(1);
    const [data, setData] = useState();
    const [checkedStatus, setCheckedStatus] = useState();
    const [statusModal, setStatusModal] = useState(false);
    const [checkedData, setCheckedData] = useState();
    const [status, setStatus] = useState(true);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openModal, SetOpenModal] = useState(false);
    const [editData, setEditData] = useState();
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const GetAllSingleSprintData = store?.getAllSingleSprints?.data?.data;
    const projectFromSprint = GetAllSingleSprintData?.[0]?.project?.projectName;
    const milestoneFromSprint = GetAllSingleSprintData?.[0]?.milestone?.title;
    const deletehandle = store?.deleteSprint?.data;
    const loaderhandel = store?.getAllSingleSprints;
    const sessionData = localStorage.getItem('hyper_user');
    const userData = JSON.parse(sessionData);
    const userRole = userData?.role;
    const handelUpdate = (data) => {
        setEditData(data);
        setOpenEditModal(true);
    };
    // for getting the sprints on update and after adding new sprints
    const getUpdatedSprints = () => {
        dispatch(getSingleSprint({ isActive: status, id: milestoneId, skip, limit: 100 }));
    }
    // CReate nrw sprint modal functions
    const getAddedSprints = () => {
        dispatch(getSingleSprint({ isActive: status, id: milestoneId, skip, limit: 100 }));
    }
    const handleCreate = () => {
        SetOpenModal(true);
    };

    useEffect(() => {
        dispatch(getProjectsById({ id: id }))
    }, [id])

    // //////////////////////////////////////
    const CloseModal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        SetOpenModal(false);
        dispatch(getSingleSprint({ isActive: status, id: milestoneId, skip, limit: 100 }));
    };
    const closeupdatemodal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        setOpenEditModal(false);
        getUpdatedSprints();
    };

    const handleActive = (val) => {
        if (val) {
            setStatus(true);
            setSkip(1);
            let data = {
                id: milestoneId,
                isActive: true,
                skip: 1,
                limit: 100
            };
            dispatch(getSingleSprint(data));
        } else {
            setStatus(false);
            setSkip(1);

            let data = {
                id: milestoneId,
                isActive: false,
                skip: 1,
                limit: 100
            };
            dispatch(getSingleSprint(data));
        }

    };
    const handleStatusChange = (e, data) => {
        if (userRole === 'Testing') {
            ToastHandle('error', 'Tester is not allowed to change sprint status');
            return;
        }
        setCheckedStatus(e.target.checked);
        setCheckedData(data);
        setStatusModal(true);
    };



    const handleYes = async () => {
        const body = {
            isActive: checkedStatus,
        };
        await dispatch(updateSprint({ body, sprintId: checkedData._id }));
        dispatch(getSingleSprint({ isActive: status, id: milestoneId, skip, limit: 100 }));
        setStatusModal(false);
    };
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value);
        dispatch(getSingleSprint({ isActive: status, id: milestoneId, skip: value, limit: 100 }));
    };

    const fetchSprintData = () => {
        dispatch(getSingleSprint({ isActive: status, id: milestoneId, skip, limit: 100 }));
    };

    useEffect(() => {
        if (deletehandle?.status === 200) {
            ToastHandle('success', deletehandle?.message);
            CloseModal('render');
        } else if (deletehandle?.status === 400) {
            ToastHandle('error', deletehandle?.message);
        } else if (deletehandle?.status === 500) {
            ToastHandle('error', deletehandle?.message);
        }
    }, [deletehandle]);


    useEffect(() => {
        fetchSprintData(); // Fetch initial data
    }, [status, milestoneId, skip]);

    const toggleRowExpansion = (rowId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(rowId)) {
            newExpandedRows.delete(rowId);
        } else {
            newExpandedRows.add(rowId);
        }
        setExpandedRows(newExpandedRows);
    };

    const truncateText = (text, maxLength = 25) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const truncateDescription = (text, maxLength = 25) => {
        if (!text || text.trim() === '') return 'No description available';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const renderExpandableCell = (content, title, maxLength = 25, originalContent = null) => {
        const displayText = truncateDescription(content, maxLength);
        const shouldTruncate = content && content.trim() !== '' && content.length > maxLength;

        return (
            <div className="d-flex align-items-center gap-1">
                <span className="text-muted">
                    {displayText}
                </span>
                {shouldTruncate && (
                    <i
                        className="mdi mdi-information-outline text-primary"
                        style={{ fontSize: '14px', cursor: 'pointer' }}
                        title="View full description"
                        onClick={() => {
                            setSelectedDescription(originalContent || content || 'No description available');
                            setSelectedTitle(title);
                            setShowOffCanvas(true);
                        }}
                    ></i>
                )}
            </div>
        );
    };

    const calculateDaysLeft = (endDate) => {
        const today = moment().startOf('day');
        const end = moment(endDate).startOf('day');
        const daysLeft = end.diff(today, 'days');
        return daysLeft;
    };

    return (
        <>
            <Card style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="row">
                        <div className="col-12 mb-2">
                            <ProjectPreview />
                        </div>
                    </div>
                    <div className="mb-2">
                        <div className='d-flex justify-content-between'>
                            <div className="d-flex align-items-center">
                                <button
                                    className="btn btn-outline-secondary fw-semibold d-flex align-items-center gap-1 me-2"
                                    style={{ padding: '4px 16px', fontSize: '11px' }}
                                    onClick={() => navigate(-1)}
                                >
                                    <i className="mdi mdi-arrow-left" style={{ fontSize: '11px' }}></i>
                                    Back
                                </button>
                                <button className={`btn fw-semibold px-2 rounded-0 ${status == true ? 'bg-dark text-white' : 'btn-outline-secondary'}`} style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleActive(true)}>In Progress</button>
                                <button className={`btn fw-semibold px-2 rounded-0 ${status == false ? 'bg-dark text-white' : 'btn-outline-secondary'}`} style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleActive(false)}>Delivered</button>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                                {status == true && userRole !== "Testing" && (
                                    <button className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={handleCreate}>
                                        Add Sprint
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {loaderhandel.loading ? (
                            <MainLoader />
                        ) : GetAllSingleSprintData?.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <h5 className="text-muted">No Sprints Found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive scroll-container" style={{ height: '90%' }}>
                                <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', overflow: 'hidden' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '5%' }}>#</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Sprint Name</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '22%' }}>Description</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '11%' }}>Pending Tasks</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '11%' }}>Start Date</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '11%' }}>End Date</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '14%' }}>Days Left</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>Status</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {GetAllSingleSprintData?.map((item, index) => (
                                            <tr className="align-middle" key={item._id} style={{ transition: 'all 0.2s ease' }}>
                                                <td className="text-center fw-bold" style={{ fontSize: '12px' }}>{(skip - 1) * 10 + index + 1}</td>
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <Link to={`/dashboard/taskBord/${item?.project?._id}/${item?.milestone?._id}/${item?._id}/${(projectFromSprint)}/${encodeURIComponent(milestoneFromSprint)}/${encodeURIComponent(item?.sprintName)}?mName=${item?.milestone?.title}&sName=${item?.sprintName}`} className="text-decoration-none">
                                                        <span className="namelink text-primary fw-semibold text-capitalize" title={item?.sprintName}>
                                                            {truncateText(item?.sprintName, 25)}
                                                        </span>
                                                    </Link>
                                                </td>
                                                <td className="text-start py-0" style={{ fontSize: '12px' }}>
                                                    <span className="text-dark text-capitalize">
                                                        {renderExpandableCell(
                                                            item?.sprintDesc?.replace(/<[^>]+>/g, ''), // strip HTML tags for display
                                                            item?.sprintName || 'Sprint',
                                                            25, // character limit
                                                            item?.sprintDesc // pass original HTML content
                                                        )}
                                                    </span>

                                                </td>
                                                <td className={`text-center`} style={{ fontSize: '12px' }}>
                                                    {item?.pendingTaskCount || 0}
                                                </td>
                                                <td className='text-center' style={{ fontSize: '12px' }}>
                                                    <span className="text-muted">
                                                        {moment.utc(item?.startDate).format("DD/MM/YYYY")}
                                                    </span>
                                                </td>
                                                <td className='text-center' style={{ fontSize: '12px' }}>
                                                    <span className="text-muted">
                                                        {moment.utc(item?.endDate).format('DD/MM/YYYY')}
                                                    </span>
                                                </td>
                                                <td className="text-center" style={{ fontSize: "12px" }}>
                                                    {(() => {
                                                        const days = item?.isActive ? calculateDaysLeft(item?.endDate) : 0;

                                                        if (isNaN(days)) {
                                                            return <span style={{ fontSize: "10px", width: "2.5vw" }}>N/A</span>;
                                                        }

                                                        let badgeClass = "badge py-1 text-white";
                                                        let bgColor = "";

                                                        if (days < 0) {
                                                            badgeClass += " bg-danger"; // expired
                                                        } else {
                                                            bgColor = "#8FD1A3"; // custom green for 0 and positive
                                                        }

                                                        return (
                                                            <span
                                                                className={badgeClass}
                                                                style={{ fontSize: "10px", width: "2.5vw", backgroundColor: bgColor }}
                                                            >
                                                                {days}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>

                                                <td>
                                                    <Form.Check
                                                        type="switch"
                                                        checked={item?.isActive}
                                                        onChange={(e) => handleStatusChange(e, item)}
                                                        className="d-flex justify-content-center"
                                                    />
                                                </td>
                                                <td className='text-center'>
                                                    <div className='d-flex justify-content-center gap-1'>
                                                        <Link to={`/dashboard/taskBord/${item?.project?._id}/${item?.milestone?._id}/${item?._id}/${(projectFromSprint)}/${encodeURIComponent(milestoneFromSprint)}/${encodeURIComponent(item?.sprintName)}?mName=${item?.milestone?.title}&sName=${item?.sprintName}`} className="btn btn-outline-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                                            <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                        </Link>
                                                        {userRole !== "Testing" && (
                                                            <button
                                                                className="btn btn-outline-secondary"
                                                                style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                onClick={() => handelUpdate(item)}
                                                            >
                                                                <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                                            </button>
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

                    {store?.getAllSingleSprints?.data?.totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-0 pt-0 ">
                            <Pagination
                                page={skip}
                                count={store?.getAllSingleSprints?.data?.totalPages}
                                color="primary"
                                variant="outlined"
                                onChange={handlePaginationChange}
                            />
                        </div>
                    )}
                </Card.Body>
            </Card >
            <Create modal={openModal} CloseModal={CloseModal} projectId={id} milestoneId={milestoneId} />
            <Update modal={openEditModal} closeModal={closeupdatemodal} editData={editData} />
            <Modal show={statusModal} onHide={() => setStatusModal(false)}>
                <Modal.Body>
                    Are you sure you want to change status to {!checkedStatus ? 'Delivered' : 'In Progress'} of this Sprint?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className='border-0'
                        onClick={() => setStatusModal(false)}>No</Button>
                    <Button variant="primary" className='web_buttons bg-black text-white border-0' onClick={() => handleYes()}>Yes</Button>
                </Modal.Footer>
            </Modal>

            <DescriptionOffCanvas
                show={showOffCanvas}
                onHide={() => setShowOffCanvas(false)}
                description={selectedDescription}
                title={selectedTitle}
            />
        </>
    );
};
export default Sprint;
