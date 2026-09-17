import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, Button, Card, CloseButton } from 'react-bootstrap';
import { deleteSprint, getAllSprint } from '../../../redux/sprint/action';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import moment from 'moment';
import MainLoader from '../../../constants/Loader/loader';
import ToastHandle from '../../../constants/toaster/toaster';
import Update from './Sprint/update';
import ActiveDeactiveSprintIndex from './Sprint/activeDeactive/ActiveDeactiveSprintIndex';

const AllSprint = () => {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const [data, setData] = useState([]);
    const [deleteId, setdeleteId] = useState()
    const [render, setRender] = useState(false);
    const getSprintsDetail = store?.getAllSprints;
    const deletehandle = store?.deleteSprint
    const [deletemodal, setDeleteModal] = useState(false);
    const [editData, setEditData] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
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
    const handeldelete = (ele) => {
        setdeleteId(ele?._id)
        setDeleteModal(true);
    };

    const handeldYes = () => {
        dispatch(deleteSprint(deleteId));
        setDeleteModal(false);
    }

    useEffect(() => {
        dispatch(getAllSprint());
    }, [render]);
    useEffect(() => {
        if (getSprintsDetail?.data?.status == 200) {
            setData(getSprintsDetail?.data?.data);
        }
    }, [getSprintsDetail]);
    useEffect(() => {
        if (deletehandle?.data?.status == 200) {
            ToastHandle('success', deletehandle?.data?.message);
            closeupdatemodal('render');
        } else if (deletehandle?.status == 400) {
            ToastHandle('error', deletehandle?.data?.message);
        } else if (deletehandle?.status == 500) {
            ToastHandle('error', deletehandle?.data?.message);
        }
    }, [deletehandle])

    return (
        <>
            <div>
                <div>
                    <ActiveDeactiveSprintIndex />
                </div>
                <Card>
                    <Card.Body>
                        <div className="row mx-auto">
                            <div className="col-6 d-flex align-items-end justify-content-end">
                                <h4 className="header-title heading_data">  All Sprints</h4>
                            </div>
                        </div>
                        {getSprintsDetail?.loading ? (
                            <MainLoader />
                        ) : (
                            <Table className="mb-0 add_Color_font" striped>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Milestone Name</th>
                                        <th>Sprint Name</th>
                                        <th>Description</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <>
                                        {data?.map((ele, ind) => {
                                            return (
                                                <tr className="align-middle">
                                                    <th scope="row">{ind + 1}</th>
                                                    <td><span className='namelink'>{ele?.milestone_id?.title}</span></td>
                                                    <td className="cp">
                                                        <span className="namelink"> {ele?.sprintName} </span>
                                                    </td>
                                                    <td className="w-20">
                                                        <span className="namelink"> {ele?.sprintDesc}</span>
                                                    </td>
                                                    <td>
                                                        <span className="namelink">
                                                            {moment(ele?.startDate).format('L')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="namelink">
                                                            {' '}
                                                            {moment(ele?.endDate).format('L')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="namelink"> {ele?.sprintStatus}</span>
                                                    </td>
                                                    <td>
                                                        <Row>
                                                            <Col>
                                                                <p className="action-icon m-0 p-0 ">
                                                                    <Link
                                                                        to={`/sprint/${ele._id}`}
                                                                    >
                                                                        <i className="mdi mdi-eye m-0 p-0"></i>
                                                                    </Link>
                                                                </p>
                                                                <p className="action-icon m-0 p-0  ">
                                                                    <i
                                                                        className="uil-edit-alt m-0 p-0"
                                                                        onClick={() => {
                                                                            handelUpdate(ele);
                                                                        }}
                                                                    ></i>
                                                                </p>
                                                                <p className="action-icon m-0 p-0  ">
                                                                    <i
                                                                        className="mdi mdi-delete m-0 p-0"
                                                                        onClick={() => {
                                                                            handeldelete(ele);
                                                                        }}
                                                                    ></i>
                                                                </p>
                                                            </Col>
                                                        </Row>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </>
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
                {/* delete modal */}
                <Modal show={deletemodal} onHide={() => setDeleteModal(false)}>
                    {deletehandle?.loading ? (<MainLoader />) : (
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

                            <Modal.Body>Are you sure you want to delete this Sprint</Modal.Body>
                            <Modal.Footer>
                                <Button className=" web_button " variant="primary" onClick={handeldYes}>
                                    Yes
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setDeleteModal(false);
                                    }}>
                                    No
                                </Button>
                            </Modal.Footer>
                        </>
                    )}

                </Modal>
                <Update modal={openEditModal} CloseModal={closeupdatemodal} editData={editData} />
            </div>
        </>
    );
};

export default AllSprint;
