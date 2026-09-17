import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Button, Col, Form, Card, Table, CloseButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Modal from 'react-bootstrap/Modal';
import { deleteMileStone, getallMileStones } from '../../../redux/milestone/action';
import MainLoader from '../../../constants/Loader/loader';
import ToastHandle from '../../../constants/toaster/toaster';
import Update from './update';
import ActiveDeactiveIndex from './activeDeactive/ActiveDeactiveIndex';
const AllMillStones = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const getallmilestones = store?.getAllMileStones?.data?.response;
    const loaderhandle = store?.getAllMileStones;
    const deletemessagehandle = store?.deleteMileStone;
    const [deletemodal, setDeleteModal] = useState(false);
    const [render, setRender] = useState(false);
    const [deleteId, setdeleteId] = useState();
    const [editData, setEditData] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const handeldelete = (ele) => {
        setdeleteId(ele?._id);
        setDeleteModal(true);
    };
    const handeldYes = () => {
        dispatch(deleteMileStone(deleteId));
        setDeleteModal(false);
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
    const [statusMilstone, setStatusMilstone] = useState(1);
    const milstonesPrnt = (id) => {
        setStatusMilstone(id);
    };
    useEffect(() => {
        dispatch(
            getallMileStones({
                status: statusMilstone,
            })
        );
    }, [render, statusMilstone]);
    useEffect(() => {
        if (deletemessagehandle?.data?.status == 200) {
            ToastHandle('success', deletemessagehandle?.data?.message);
            closeupdatemodal('render');
        } else if (deletemessagehandle?.data?.status == 400) {
            ToastHandle('error', deletemessagehandle?.data?.message);
        } else if (deletemessagehandle?.data?.status == 500) {
            ToastHandle('error', deletemessagehandle?.data?.message);
        }
    }, [deletemessagehandle]);

    return (
        <>
            <div>
                <ActiveDeactiveIndex milstonesPrnt={milstonesPrnt} />
            </div>
            <Card>
                <Card.Body>
                    <Row>
                        <Col lg={12} className="text-center">
                            <h4 className="header-title heading_data"> All MileStones</h4>
                        </Col>
                    </Row>

                    {loaderhandle?.loading ? (
                        <>
                            <MainLoader />
                        </>
                    ) : (
                        <Table className="mb-0 add_Color_font" striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Project Name</th>
                                    <th> Milestone Name</th>
                                    <th>Description</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    {/* <th>Status</th> */}

                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getallmilestones?.map((ele, ind) => {
                                    return (
                                        <tr className="align-middle">
                                            <th scope="row">{ind + 1}</th>
                                            <td>
                                                <span className="namelink">{ele?.project_id?.projectName}</span>
                                            </td>
                                            <td className="cp">
                                                <span className="namelink">{ele?.title}</span>
                                            </td>
                                            <td className="w-20">
                                                <span className="namelink">{ele?.description}</span>
                                            </td>
                                            <td>
                                                <span className="namelink"> {moment(ele?.start_date).format('L')}</span>
                                            </td>
                                            <td>
                                                <span className="namelink">
                                                    {moment(ele?.completion_date).format('L')}
                                                </span>
                                            </td>
                                            <td>
                                                {ele?.status ? (
                                                    <div class="form-check form-switch">
                                                        <input
                                                            class="form-check-input"
                                                            type="checkbox"
                                                            checked={ele?.status ? true : false}
                                                            onClick={() => {
                                                                handeldelete(ele);
                                                            }}
                                                            role="switch"
                                                            id="flexSwitchCheckChecked"
                                                        />
                                                        <label
                                                            class="form-check-label text-success"
                                                            htmlFor="flexSwitchCheckChecked">
                                                            Active
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div class="form-check form-switch">
                                                        <input
                                                            class="form-check-input"
                                                            type="checkbox"
                                                            checked={ele?.status ? true : false}
                                                            onClick={() => {
                                                                handeldelete(ele);
                                                            }}
                                                            role="switch"
                                                            id="flexSwitchCheckChecked"
                                                        />
                                                        <label
                                                            class="form-check-label text-danger"
                                                            for="flexSwitchCheckChecked">
                                                            Deactive
                                                        </label>
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <Row>
                                                    <Col>
                                                        <p className="action-icon m-0 p-0 ">
                                                            <Link to={`/milestone/${ele._id}`}>
                                                                <i className="mdi mdi-eye m-0 p-0"></i>
                                                            </Link>
                                                        </p>
                                                        <p className="action-icon m-0 p-0 ms-2 ">
                                                            <i
                                                                className="uil-edit-alt m-0 p-0"
                                                                onClick={() => {
                                                                    handelUpdate(ele);
                                                                }}></i>
                                                        </p>
                                                    </Col>
                                                </Row>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
            {/* delete modal */}
            <Modal show={deletemodal} onHide={() => setDeleteModal(false)}>
                {deletemessagehandle?.loading ? (
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

                        <Modal.Body>Are you sure you want to delete this MileStone</Modal.Body>
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
            <Update modal={openEditModal} closeModal={closeupdatemodal} editData={editData} />
        </>
    );
};

export default AllMillStones;
