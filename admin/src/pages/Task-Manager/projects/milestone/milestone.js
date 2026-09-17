import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, Table, Form, Button } from 'react-bootstrap';
import './milstone.css';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Create from '../milestone/modal/create';
import { getsingleMileStone, updateMileStone } from './../../../../redux/milestone/action';
import MainLoader from '../../../../constants/Loader/loader';
import Modal from 'react-bootstrap/Modal';
import ToastHandle from '../../../../constants/toaster/toaster';
import Update from './modal/update';
import Pagination from '@mui/material/Pagination';
import ProjectPreview from '../Projectpreview';
import { getProjectsById } from '../../../../redux/actions';
import DescriptionOffCanvas from '../../../../components/DescriptionOffCanvas';

// import ToastHandle from '../../../constants/toaster/toaster';
const Milestone = () => {

    const { id } = useParams();
    const store = useSelector((state) => state);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const projectType = searchParams.get('type');
    const dispatch = useDispatch();
    const [openModel, setOpenModel] = useState(false);
    const [render, setRender] = useState(false);
    const [status, setStatus] = useState(true);
    const GetSinglemilstonesData = store?.getSigleMileStone?.data?.data;
    const loaderhandel = store?.getSigleMileStone;
    const [activeTab, setActiveTab] = useState(true);
    const [skip, setSkip] = useState(1);
    const [checkedStatus, setCheckedStatus] = useState();
    const [statusModal, setStatusModal] = useState(false);
    const [checkedData, setCheckedData] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editData, setEditData] = useState();
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedTitle, setSelectedTitle] = useState('');
    const [isDelivered, setIsDelivered] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState(null);
    const deletehandle = store?.deleteMileStone?.data;
    const sessionData = localStorage.getItem('hyper_user');
    const userData = JSON.parse(sessionData);
    const userRole = userData?.role;
    const selectedDepartment = localStorage.getItem('selectedDepartment');

    useEffect(() => {
        dispatch(getProjectsById({ id: id }))
    }, [id]);

    useEffect(() => {
        dispatch(getsingleMileStone({ id: id, skip, mileStoneId: '', isDelivered, isActive: activeTab }));
    }, [render, isDelivered, activeTab]);

    useEffect(() => {
        if (deletehandle?.status == 200) {
            ToastHandle('success', deletehandle?.message);
            closeModal('render');
        } else if (deletehandle?.status == 400) {
            ToastHandle('error', deletehandle?.message);
        } else if (deletehandle?.status == 500) {
            ToastHandle('error', deletehandle?.message);
        }
    }, [deletehandle]);

    const closeModal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        setOpenModel(false);
    };

    const handleActive = (val) => {
        setStatus(val);
        setIsDelivered(!val);
        setSkip(1);
        dispatch(getsingleMileStone({ id: id, skip: 1, mileStoneId: '', isDelivered: !val, isActive: activeTab }));
    };

    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value);
        dispatch(getsingleMileStone({ id: id, skip: value, mileStoneId: '', isDelivered: isDelivered, isActive: activeTab }));
    };

    const handleStatusChange = (e, data) => {
        if (userRole === 'Testing') {
            ToastHandle('error', 'Tester is not allowed to change milestone status');
            return;
        }
        if (e.target.checked) {
            setCheckedStatus(true);
        } else {
            setCheckedStatus(false);
        }
        setCheckedData(data);
        setStatusModal(true);

    };

    const handleYes = () => {
        if (checkedStatus) {
            let body = {
                isActive: true,
                milestoneId: checkedData._id
            };
            dispatch(updateMileStone(body));
        } else {
            let body = {
                isActive: false,
                milestoneId: checkedData._id
            };
            dispatch(updateMileStone(body));
        }
        setStatusModal(false);
    };

    const handelUpdate = (data) => {
        setEditData(data);
        setOpenEditModal(true);
    };

    const closeupdatemodal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        setOpenEditModal(false);
    };

    const truncateText = (text, maxLength = 25) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const renderExpandableCell = (content, title, maxLength = 25, originalContent = null) => {
        const shouldTruncate = content && content.length > maxLength;

        return (
            <div className="d-flex align-items-center gap-1">
                <span className="text-muted">
                    {truncateText(content, maxLength)}
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
        const today = moment();
        const end = moment(endDate);
        return end.diff(today, 'days');
    };

    const handleDeliveryToggle = (item) => {
        setSelectedMilestone(item);
        setShowDeliveryModal(true);
    };

    const confirmDeliveryUpdate = () => {
        const body = {
            isDelivered: !selectedMilestone.isDelivered,
            milestoneId: selectedMilestone._id
        };
        dispatch(updateMileStone(body));
        setShowDeliveryModal(false);
        setSelectedMilestone(null);
    };


    const totalAmcHours = store?.getProjectById?.data?.data?.amcHours;

    const calculateTrendingAmcHours = (index, currentAmcHours) => {
        if (index === 0) return totalAmcHours;

        let remainingHours = totalAmcHours;
        for (let i = 0; i < index; i++) {
            remainingHours -= GetSinglemilstonesData[i]?.amcHours || 0;
        }
        return Math.max(0, remainingHours)?.toFixed(2);
    };

    return (
        <>
            <div>
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
                                    <button className={`btn fw-semibold px-2 rounded-0 ${status === true ? 'bg-dark text-white' : 'btn-outline-secondary'}`} style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleActive(true)}>In Progress</button>
                                    <button className={`btn fw-semibold px-2 rounded-0 ${status === false ? 'bg-dark text-white' : 'btn-outline-secondary'}`} style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleActive(false)}>Delivered</button>
                                </div>
                                {projectType !== "AMC" && (
                                    <div className="d-flex align-items-center gap-1">
                                        <select style={{ padding: '4px 16px', fontSize: '11px', width: '7vw' }} className='form-select' onChange={(e) => {
                                            if (e.target.value === 'Active') {
                                                setActiveTab(true);
                                            } else {
                                                setActiveTab(false);
                                            }
                                        }}>
                                            {['Active', 'Inactive']?.map((data, index) => (
                                                <option key={index} value={data}>{data}</option>
                                            ))}
                                        </select>
                                        {userRole !== "Testing" && (
                                            <button className="btn bg-dark text-white fw-semibold" style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => setOpenModel(true)}>
                                                Add {projectType === "AMC" ? "AMC" : (selectedDepartment === "Marketing" || selectedDepartment === "Freelance") ? "Sprint" : "Milestone"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {loaderhandel.loading ? (
                                <MainLoader />
                            ) : GetSinglemilstonesData?.length === 0 ? (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <h5 className="text-muted">No Milestones Found</h5>
                                </div>
                            ) : (
                                <div className="table-responsive scroll-container" style={{ height: '90%' }}>
                                    <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', overflow: 'hidden' }}>
                                        <thead className="table-dark">
                                            {projectType === "AMC" ?
                                                <tr>
                                                    <th className='fw-bold fs-6 text-start'>#</th>
                                                    <th className='fw-bold fs-6 text-start'>AMC</th>
                                                    <th className='fw-bold fs-6 text-start'>Description</th>
                                                    <th className='fw-bold fs-6 text-start'>AMC Hours</th>
                                                    <th className='fw-bold fs-6 text-start'>Worked Hours</th>
                                                    <th className='fw-bold fs-6 text-start'>Remaining Hours</th>
                                                    <th className='fw-bold fs-6 text-start'>Team Hours</th>
                                                    <th className='fw-bold fs-6 text-start'>Delivered</th>
                                                    <th className='fw-bold fs-6 text-start'>Action</th>
                                                </tr>
                                                :
                                                <tr>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '5%' }}>#</th>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>{(selectedDepartment === 'Marketing' || selectedDepartment === 'Freelance') ? 'Sprint' : 'Milestone'} Name</th>
                                                    {/* <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Project Name</th> */}
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Description</th>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '12%' }}>Start Date</th>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '12%' }}>End Date</th>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '8%' }}>Days Left</th>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '6%' }}>Priority</th>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '6%' }}>Status</th>
                                                    <th className='fw-bold fs-6 text-start' style={{ width: '7%' }}>Action</th>
                                                </tr>
                                            }
                                        </thead>
                                        <tbody>
                                            {projectType === "AMC" ?
                                                GetSinglemilstonesData?.map((item, index) => (
                                                    <tr className="align-middle" key={item._id} style={{ transition: 'all 0.2s ease' }}>
                                                        <td className="text-start fw-bold" style={{ fontSize: '12px' }}>{(skip - 1) * 10 + index + 1}</td>
                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            {selectedDepartment === 'Marketing' ?
                                                                <Link to={`/dashboard/taskDashboard?isMarketing=true`} className="text-decoration-none">
                                                                    <span className="namelink  fw-semibold text-capitalize" title={item?.title}>
                                                                        {truncateText(item?.title, 25)}
                                                                    </span>
                                                                </Link>
                                                                :
                                                                <Link to={`/dashboard/sprint/${item?._id}?projectId=${id}&mName=${item?.title}`} className="text-decoration-none">
                                                                    <span className="namelink text-primary fw-semibold text-capitalize" title={item?.title}>
                                                                        {truncateText(item?.title, 25)}
                                                                    </span>
                                                                </Link>
                                                            }
                                                        </td>
                                                        <td className="text-start py-0" style={{ fontSize: '12px' }}>
                                                            <span className="text-dark text-capitalize">
                                                                {renderExpandableCell(
                                                                    item?.description?.replace(/<[^>]+>/g, ''), // strip HTML tags for display
                                                                    item?.title || 'Milestone',
                                                                    25, // character limit
                                                                    item?.description // pass original HTML content
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="text-start py-0" style={{ fontSize: '12px' }}>
                                                            {/* {calculateTrendingAmcHours(index, item?.remainingHours)} */}
                                                            {item?.amcHours || 0}
                                                        </td>
                                                        <td className="text-start py-0" style={{ fontSize: '12px' }}>
                                                            {item?.workedHours || 0}
                                                        </td>
                                                        <td className="text-start py-0" style={{ fontSize: '12px' }}>
                                                            {item?.remainingHours || 0}
                                                        </td>
                                                        <td className="text-start py-0" style={{ fontSize: '12px' }}>
                                                            {item?.workedHoursByTeam || 0}
                                                        </td>
                                                        <td className="text-start py-0">
                                                            <Form.Switch
                                                                checked={item?.isDelivered}
                                                                onChange={() => handleDeliveryToggle(item)}
                                                            />
                                                        </td>
                                                        <td className='text-start'>
                                                            <div className='d-flex justify-content-start gap-1'>
                                                                {(selectedDepartment !== 'Marketing' && selectedDepartment !== 'Freelance') ? (
                                                                    <Link to={`/dashboard/sprint/${item?._id}?projectId=${id}&mName=${item?.title}`} className="btn btn-outline-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                                                        <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                                    </Link>
                                                                ) : (
                                                                    <Link to={`/dashboard/taskDashboard?isMarketing=true`} className="text-decoration-none">
                                                                        <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                                    </Link>
                                                                )}
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
                                                ))
                                                :
                                                GetSinglemilstonesData?.map((item, index) => (
                                                    <tr className="align-middle" key={item._id} style={{ transition: 'all 0.2s ease' }}>
                                                        <td className="text-center fw-bold" style={{ fontSize: '12px' }}>{(skip - 1) * 10 + index + 1}</td>
                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            {selectedDepartment === 'Marketing' ?
                                                                <Link to={`/dashboard/taskDashboard?isMarketing=true`} className="text-decoration-none">
                                                                    <span className="namelink  fw-semibold text-capitalize" title={item?.title}>
                                                                        {truncateText(item?.title, 25)}
                                                                    </span>
                                                                </Link>
                                                                :
                                                                <Link to={`/dashboard/sprint/${item?._id}?projectId=${id}&mName=${item?.title}`} className="text-decoration-none">
                                                                    <span className="namelink text-primary fw-semibold text-capitalize" title={item?.title}>
                                                                        {truncateText(item?.title, 25)}
                                                                    </span>
                                                                </Link>
                                                            }
                                                        </td>
                                                        <td className="text-start py-0" style={{ fontSize: '12px' }}>
                                                            <span className="text-dark text-capitalize">
                                                                {renderExpandableCell(
                                                                    item?.description?.replace(/<[^>]+>/g, ''), // strip HTML tags for display
                                                                    item?.title || 'Milestone',
                                                                    25, // character limit
                                                                    item?.description // pass original HTML content
                                                                )}
                                                            </span>

                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className="text-muted">
                                                                {moment.utc(item?.startDate).format("DD/MM/YYYY")}
                                                            </span>
                                                        </td>
                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className="text-muted">
                                                                {moment.utc(item?.completionDate).format('DD/MM/YYYY')}
                                                            </span>
                                                        </td>
                                                        <td className="text-start" style={{ fontSize: "12px" }}>
                                                            {(() => {
                                                                const days = item?.isActive ? calculateDaysLeft(item?.completionDate) : 0;

                                                                if (isNaN(days)) {
                                                                    return <span style={{ fontSize: "10px", width: "2.5vw" }}>N/A</span>;
                                                                }

                                                                let badgeClass = "badge py-1 text-white";
                                                                let bgColor = "";

                                                                if (days === 0) {
                                                                    bgColor = "#8FD1A3"; // custom green
                                                                } else if (days < 0) {
                                                                    badgeClass += " bg-danger";
                                                                } else {
                                                                    bgColor = "#8FD1A3"; // custom green
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

                                                        <td className='text-start' style={{ fontSize: '12px' }}>
                                                            <span className="badge py-1 text-white" style={{
                                                                fontSize: '10px',
                                                                backgroundColor: item?.priority === 'High' ? '#dc3545' :
                                                                    item?.priority === 'Medium' ? '#ffc107' : '#28a745'
                                                            }}>
                                                                {item?.priority}
                                                            </span>
                                                        </td>
                                                        <td className='text-start'>
                                                            <Form.Check
                                                                type="switch"
                                                                checked={item?.isActive === true}
                                                                onChange={(e) => handleStatusChange(e, item)}
                                                                className="d-flex justify-content-start"
                                                            />
                                                        </td>
                                                        <td className='text-start'>
                                                            <div className='d-flex justify-content-start gap-1'>
                                                                {selectedDepartment !== 'Marketing' ? (
                                                                    <Link to={`/dashboard/sprint/${item?._id}?projectId=${id}&mName=${item?.title}`} className="btn btn-outline-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                                                        <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                                    </Link>
                                                                ) : (
                                                                    <Link to={`/dashboard/taskDashboard?isMarketing=true`} className="btn btn-outline-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>
                                                                        <i className="mdi mdi-eye" style={{ fontSize: '12px' }}></i>
                                                                    </Link>
                                                                )}
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
                        {store?.getSigleMileStone?.data?.totalPages > 0 && (
                            <div className="d-flex justify-content-end mt-3 pt-2 border-top">
                                <Pagination
                                    page={skip}
                                    count={store?.getSigleMileStone?.data?.totalPages}
                                    color="primary"
                                    variant="outlined"
                                    onChange={handlePaginationChange}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>

                <Create modal={openModel} closeModal={closeModal} />
                <Update modal={openEditModal} closeModal={closeupdatemodal} editData={editData} />
                {/* status modal */}
                <Modal show={statusModal} onHide={() => setStatusModal(false)}>
                    <Modal.Header className='py-2' >
                        <Modal.Title className='fs-5 text-black fw-semibold'>Update Milestone Status</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to change status to {!checkedStatus ? 'inactive' : 'active'} of this Milestone?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className='border-0'
                            onClick={() => setStatusModal(false)}>No</Button>
                        <Button variant="primary" className='web_buttons bg-black text-white border-0' onClick={() => handleYes()}>Yes</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showDeliveryModal} onHide={() => setShowDeliveryModal(false)}>
                    <Modal.Header className='py-2' >
                        <Modal.Title className='fs-5 text-black fw-semibold'>Update AMC Status</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to mark this AMC as {selectedMilestone?.isDelivered ? 'In Progress' : 'Delivered'}?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeliveryModal(false)}>Cancel</Button>
                        <Button variant="primary" className='bg-dark text-white border-0' onClick={confirmDeliveryUpdate}>Confirm</Button>
                    </Modal.Footer>
                </Modal>

                <DescriptionOffCanvas
                    show={showOffCanvas}
                    onHide={() => setShowOffCanvas(false)}
                    description={selectedDescription}
                    title={selectedTitle}
                />
            </div>
        </>
    );
};

export default Milestone;
