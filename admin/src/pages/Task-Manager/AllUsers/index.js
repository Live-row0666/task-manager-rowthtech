import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { OverlayTrigger, Popover } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { Table, Card, Row, Col, CloseButton, Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import MainLoader from '../../../constants/Loader/loader';
import ToastHandle from '../../../constants/toaster/toaster';
import { deleteUser, getAllUsers, getCSVdata } from '../../../redux/user/action';
import { CSVLink } from 'react-csv';
import Pagination from '@mui/material/Pagination';
import { BiSolidDownload } from "react-icons/bi";
import InviteUserModal from './InviteUserModal/InviteUserModal';
import UpdateUserInfo from './UpdateUserModal/UpdateUserInfo';
import { buttonGroupClasses } from '@mui/material';
import UserStatsModal from './UserStatsModal/UserStatsModal';
const AllUsers = () => {
    const store = useSelector((state) => state);
    const csvLink = useRef();
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState([]);
    const [deleteId, setdeleteId] = useState();
    const [render, setRender] = useState(false);
    const [showUserStatsModal, setShowUserStatsModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [selectedSessions, setSelectedSessions] = useState([]);
    const [selectedUserName, setSelectedUserName] = useState("");
    const getUsers = store?.getAllUsers;
    const deletehandle = store?.deleteUser;
    const [deletemodal, setDeleteModal] = useState(false);
    const [csvdownload, setcsvdownload] = useState([]);
    const [csvName, setCsvName] = useState();
    const [editData, setEditData] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const csvdownloaddata = store?.getCsvDataReducer;
    const [skip, setSkip] = useState(1);
    const [search, setSearch] = useState('');
    const selectedDepartment = localStorage.getItem('selectedDepartment');
    const limit = 100;
    const [activeTab, setActiveTab] = useState('Active');
    const successHandle = store?.updateUser?.data;


    console.log(store.Auth.user, "storestorestorestore")
    const [selectedDate, setSelectedDate] = useState(
        moment().format("YYYY-MM-DD")
    );
    // Get search parameter from URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        if (searchParam) {
            setSearch(searchParam);
            dispatch(getAllUsers({ isActive: activeTab === 'Active' ? true : false, search: searchParam, page: 1, limit, userType: selectedDepartment }));
        }
    }, []);

    const handeldelete = (ele) => {
        setdeleteId(ele?._id);
        setDeleteModal(true);
    };

    const handeldYes = async () => {
        await dispatch(deleteUser(deleteId));
        setDeleteModal(false);
        await dispatch(getAllUsers({ isActive: activeTab === 'Active' ? true : false, search: '', limit, userType: selectedDepartment }));
    };

    useEffect(() => {
        if (successHandle?.status == 200) {
            setActiveTab("Active");
        }
    }, [successHandle]);

    useEffect(() => {
        if (!window.location.search.includes('search=')) {
            dispatch(getAllUsers({ isActive: activeTab === 'Active' ? true : false, search: '', limit, userType: selectedDepartment }));
        }
    }, [render]);

    useEffect(() => {
        if (getUsers?.data?.status == 200) {
            setData(getUsers?.data?.data);
        }
    }, [getUsers]);

    useEffect(() => {
        if (deletehandle?.data?.status == 200) {
            ToastHandle('success', deletehandle?.data?.message);
        } else if (deletehandle?.status == 400) {
            ToastHandle('error', deletehandle?.data?.message);
        } else if (deletehandle?.status == 500) {
            ToastHandle('error', deletehandle?.data?.message);
        }
    }, [deletehandle]);

    useEffect(() => {
        if (csvdownloaddata?.data?.status == 200 && csvdownloaddata?.data?.length !== 0) {
            setcsvdownload(
                csvdownloaddata?.data?.data?.map((ele) => {
                    return {
                        Name: ele?.userId?.firstName + ' ' + ele?.userId?.lastName,
                        Time: moment(ele?.loginTime).format('LT'),
                        Date: moment(ele?.loginTime).format('DD-MM-YYYY'),
                    };
                })
            );
            setTimeout(() => {
                csvLink.current.link.click();
            }, 1000);
        }
    }, [csvdownloaddata]);

    useEffect(() => {
        if (csvdownloaddata?.data?.status == 200) {
            ToastHandle('success', csvdownloaddata?.data?.message);
        } else if (csvdownloaddata?.data?.status == 404) {
            ToastHandle('error', csvdownloaddata?.data?.message);
        } else if (csvdownloaddata?.data?.status == 500) {
            ToastHandle('error', csvdownloaddata?.data?.message);
        }
    }, [csvdownloaddata]);


    const isAdmin = store?.Auth?.user?.role === "admin";


    const handleTab = (filter) => {
        setSkip(1);
        setActiveTab(filter);
        dispatch(getAllUsers({ isActive: filter === 'Active' ? true : false, page: 1, limit, userType: selectedDepartment }));
    };


    const handleOpenUrl = (ele) => {
        window.open(`/dashboard/taskDashboard?qaId=${ele?._id}`, '_blank');
    }
    return (
        <div>
            <Card className='' style={{ height: '92vh', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="mb-0">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                {["Active", "Inactive"]?.map((filter, index) => (
                                    <button
                                        className={`btn rounded-0 fw-semibold px-2 ${activeTab === filter ? 'bg-dark text-white' : 'btn-outline-secondary'}`}
                                        style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleTab(filter)}
                                        key={index}>
                                        {filter}
                                    </button>
                                ))}
                            </div>

                            <div className='d-flex align-items-center gap-1'>
                                <div className="me-2">
                                    <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);

                                            dispatch(
                                                getAllUsers({
                                                    isActive: activeTab === "Active",
                                                    search,
                                                    page: 1,
                                                    limit,
                                                    userType: selectedDepartment,
                                                    date: e.target.value,
                                                })
                                            );

                                            setSkip(1);
                                        }}
                                    />
                                </div>
                                <div style={{ position: 'relative', width: '200px' }} className="me-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            dispatch(getAllUsers({ search: e.target.value, page: 1, limit, userType: selectedDepartment }));
                                            setSkip(1);
                                        }}
                                        style={{ width: '100%' }}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch('');
                                                dispatch(getAllUsers({ search: '', page: 1, limit, userType: selectedDepartment }));
                                                setSkip(1);
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
                                                fontSize: '16px',
                                                color: '#888'
                                            }}
                                            aria-label="Clear search"
                                        >
                                            &#10005;
                                        </button>
                                    )}
                                </div>
                                <button onClick={() => setShowModal(true)} className='btn bg-dark text-white fw-semibold' style={{ padding: '4px 16px', fontSize: '11px' }}>Invite User</button>
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {getUsers?.loading ? (
                            <MainLoader />
                        ) : data?.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <h5 className="text-muted">No Data Found</h5>
                            </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '4%' }}>#</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '14%' }}>Username</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '12%' }}>Designation</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>Role</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '16%' }}>Email</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Joining Date</th>
                                            {isAdmin && (
                                                <>
                                                    <th className="fw-bold fs-6 text-center" style={{ width: "12%" }}>
                                                        Working Hrs
                                                    </th>
                                                    <th className="fw-bold fs-6 text-center" style={{ width: "12%" }}>
                                                        Productive Hrs
                                                    </th>
                                                    <th className="fw-bold fs-6 text-center" style={{ width: "12%" }}>
                                                        Idle Hrs
                                                    </th>
                                                </>
                                            )}
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Action</th>
                                        </tr>
                                    </thead>
                                </Table>
                                <div style={{ overflowY: 'auto', height: '80vh', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9' }}>
                                    <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', tableLayout: 'fixed', width: '100%' }}>
                                        <thead style={{ visibility: 'collapse' }}>
                                            <tr>
                                                <th style={{ width: "4%" }}>#</th>
                                                <th style={{ width: "14%" }}>Username</th>
                                                <th style={{ width: "12%" }}>Designation</th>
                                                <th style={{ width: "8%" }}>Role</th>
                                                <th style={{ width: "16%" }}>Email</th>
                                                <th style={{ width: "10%" }}>Joining Date</th>
                                              {isAdmin && (
                                                <>
                                                    <th className="fw-bold fs-6 text-center" style={{ width: "12%" }}>
                                                        Working Hrs
                                                    </th>
                                                    <th className="fw-bold fs-6 text-center" style={{ width: "12%" }}>
                                                        Productive Hrs
                                                    </th>
                                                    <th className="fw-bold fs-6 text-center" style={{ width: "12%" }}>
                                                        Idle Hrs
                                                    </th>
                                                </>
                                            )}
                                                <th style={{ width: "10%" }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data?.map((ele, ind) => {
                                                return (
                                                    <tr className="align-middle" key={ele.id || ind}>
                                                        <td className='text-center fw-bold' style={{ fontSize: '12px' }}>{(skip - 1) * limit + ind + 1}</td>
                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            <span className="namelink text-primary fw-semibold text-capitalize" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setSelectedUser(ele?._id); setOpenEditModal(true); }}>
                                                                {ele?.name.charAt(0).toUpperCase() + ele?.name?.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className='text-center' style={{ fontSize: '12px' }}>
                                                            <span className="" style={{ fontSize: '12px' }}>{ele?.designation}</span>
                                                        </td>
                                                        <td className='text-center' style={{ fontSize: '12px' }}>
                                                            <span className="badge text-dark px-1 py-1 text-uppercase" style={{ fontSize: '10px', backgroundColor: '#B4E9FF' }}>{ele?.role?.name}</span>
                                                        </td>
                                                        <td className="text-start" style={{ fontSize: '12px' }}>
                                                            <span className="namelink text-muted">{ele?.email}</span>
                                                        </td>
                                                        <td className='text-center' style={{ fontSize: '12px' }}>
                                                            <span className="text-muted">
                                                                {ele?.joinedDate ?
                                                                    moment(ele?.joinedDate).format("DD/MM/YYYY")
                                                                    :
                                                                    'N/A'
                                                                }
                                                            </span>
                                                        </td>
                                                        {isAdmin && (
    <>
                                                        <td className="text-center">
                                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                                <span className="badge bg-success fs-6 px-1 py-1" style={{ cursor: "pointer" }}
                                                                    onClick={() => {
                                                                        setSelectedUserId(ele._id);
                                                                        setShowUserStatsModal(true);
                                                                    }}>
                                                                    {ele?.totalWorkingHours || "00:00:00"}
                                                                </span>

                                                                <i
                                                                    className="mdi mdi-information-outline text-primary"
                                                                    style={{
                                                                        cursor: "pointer",
                                                                        fontSize: "16px"
                                                                    }}
                                                                    onClick={() => {
                                                                        setSelectedUserName(ele?.name);
                                                                        setSelectedSessions(ele?.loginTimes || []);
                                                                        setShowSessionModal(true);
                                                                    }}
                                                                ></i>
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-primary fs-6 px-1 py-1">
                                                                {ele?.totalProductiveHours || "00:00:00"}
                                                            </span>
                                                        </td>
                                                        <td className="text-center">
                                                            <span className="badge bg-danger fs-6 px-1 py-1">
                                                                {ele?.totalIdleHours || "00:00:00"}
                                                            </span>
                                                        </td>
</>
                                                        )}
                                                        <td className='text-center'>
                                                            <div className='d-flex justify-content-center gap-1'>
                                                                <button className="btn btn-outline-primary" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); setSelectedUser(ele?._id); setOpenEditModal(true); }}>
                                                                    <i className="mdi mdi-pencil" style={{ fontSize: '12px' }}></i>
                                                                </button>
                                                                <button className="btn btn-outline-danger" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={(e) => { e.stopPropagation(); handeldelete(ele); }}>
                                                                    <i className="mdi mdi-delete" style={{ fontSize: '12px' }}></i>
                                                                </button>
                                                                <button
                                                                    disabled={ele?.role?.name === 'QA' ? false : true}
                                                                    className="btn btn-outline-info"
                                                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenUrl(ele); }}>
                                                                    <i className="bi bi-box-arrow-up-right" style={{ fontSize: '12px' }}></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>

                    <CSVLink
                        data={csvdownload}
                        filename={csvName}
                        className="hidden"
                        ref={csvLink}
                        id={`csvid`}
                        target="_blank">
                        <span></span>
                    </CSVLink>
                </Card.Body>
            </Card>
            <UserStatsModal
                show={showUserStatsModal}
                onHide={() => {
                    setShowUserStatsModal(false);
                    setSelectedUserId(null);
                }}
                userId={selectedUserId}
                initialDate={selectedDate}
            />
            <Modal
                show={showSessionModal}
                onHide={() => setShowSessionModal(false)}
                centered
                size="lg"
            >
                <Modal.Header>
                    <Modal.Title>
                        {selectedUserName} Working Hours
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ maxHeight: "50vh", overflowY: "auto" }}>
                    {selectedSessions?.length > 0 ? (
                        <>
                            {/* Heading */}
                            <div className="d-flex justify-content-between fw-bold border-bottom pb-2 mb-1 text-primary">
                                <div style={{ width: "40%" }}>🟢 Check In</div>
                                <div style={{ width: "45%" }} className="text-end">
                                    🔴 Check Out
                                </div>
                            </div>

                            {selectedSessions.map((item, index) => (
                                <div
                                    key={index}
                                    className="d-flex justify-content-between align-items-center border rounded p-2 mb-1 bg-light"
                                >

                                    <div style={{ width: "40%" }}>
                                        {moment(item.loginTime).format(
                                            "DD MMM YYYY, hh:mm:ss A"
                                        )}
                                    </div>

                                    <div style={{ width: "45%" }} className="text-end">
                                        {item.logoutTime ? (
                                            moment(item.logoutTime).format(
                                                "DD MMM YYYY, hh:mm:ss A"
                                            )
                                        ) : (
                                            <span className="text-success fw-bold">
                                                Currently Logged In
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center text-muted py-4">
                            No Login / Logout History
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowSessionModal(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={deletemodal} onHide={() => setDeleteModal(false)}>
                {deletehandle?.loading ? (
                    <MainLoader />
                ) : (
                    <>
                        <Row>
                            <Col lg={12} className="text-end mt-1 ">
                                <CloseButton
                                    className="pe-2"
                                    onClick={() => {
                                        setDeleteModal(false);
                                    }}
                                />
                            </Col>
                        </Row>

                        <Modal.Body>Are you sure you want to delete this User</Modal.Body>
                        <Modal.Footer>
                            <button
                                className="btn bg-dark text-white fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                onClick={handeldYes}>
                                Yes
                            </button>
                            <button
                                className="btn btn-outline-secondary fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                onClick={() => {
                                    setDeleteModal(false);
                                }}>
                                No
                            </button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>
            <InviteUserModal show={showModal} onHide={() => setShowModal(false)} />
            <UpdateUserInfo show={openEditModal} onHide={() => setOpenEditModal(false)} userId={selectedUser} />
        </div>
    );
};

export default AllUsers;
