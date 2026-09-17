import React, { useState, useEffect } from 'react';
import { Form, Card, Table, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import CreateCategory from './modal/create';
import { getAllTechnologyCategory, updateTechnologyCategory } from '../../../redux/technology/action';
import CategoryUpdate from './modal/update';
import { Modal } from 'react-bootstrap';
import ToastHandle from '../../../constants/toaster/toaster';
import MainLoader from '../../../constants/Loader/loader';
const Category = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [status, setStatus] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [render, setRender] = useState(false);
    const [editData, setEditData] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [checkedData, setCheckedData] = useState();
    const [checkedStatus, setCheckedStatus] = useState();
    const [statusModal, setStatusModal] = useState(false);
    const deletehandle = store?.deleteTechnologyCategory?.data;
    const loader = store?.getAllTechnologyCategoryReducer;
    const handelCreate = () => {
        setOpenModal(true);
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
    const closeModal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }
        setOpenModal(false);
    };

    const handleYes = () => {
        if (checkedStatus) {
            let body = {
                id: checkedData._id,
                status: true,
            };
            dispatch(updateTechnologyCategory(body));
        } else {
            let body = {
                id: checkedData._id,
                status: false,
            };
            dispatch(updateTechnologyCategory(body));
        }
        setStatusModal(false);
    };
    useEffect(() => {
        let body = {
            status: status,
        };
        dispatch(getAllTechnologyCategory(body));
    }, [render]);

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

    return (
        <>
            <Card className='' style={{ height: '92vh', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center mb-0">
                            <div className="d-flex align-items-center">
                                {/* <button className={`btn fw-semibold rounded-0 ${status == true ? 'bg-dark text-white' : 'btn-outline-secondary'}`} style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleActive(true)}>Active</button>
                                <button className={`btn fw-semibold rounded-0 ${status == false ? 'bg-dark text-white' : 'btn-outline-secondary'}`} style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handleActive(false)}>Inactive</button> */}
                            </div>


                            {status == 1 && (
                                <button className='btn bg-dark text-white fw-semibold' style={{ padding: '4px 16px', fontSize: '11px' }} onClick={() => handelCreate()}>
                                    Add Category
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {loader?.loading ? (
                            <MainLoader />
                        ) : !store?.getAllTechnologyCategoryReducer?.data?.categories || store?.getAllTechnologyCategoryReducer?.data?.categories?.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <h5 className="text-muted">No Data Found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{height:'80vh'}}>
                                <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', overflow: 'hidden' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>#</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Category Name</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '40%' }}>Description</th>
                                            {/* <th className='fw-bold fs-6 text-center' style={{ width: '15%' }}>Status</th> */}
                                            <th className='fw-bold fs-6 text-center' style={{ width: '15%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {store?.getAllTechnologyCategoryReducer?.data?.categories?.map((ele, ind) => {
                                            return (
                                                <tr className="align-middle" key={ele._id || ind} style={{ transition: 'all 0.2s ease' }}>
                                                    <td className='text-center fw-bold' style={{ fontSize: '12px' }}>{ind + 1}</td>
                                                    <td className="text-start" style={{ fontSize: '12px' }}>
                                                        <span className="namelink text-dark fw-semibold text-capitalize">{ele?.name}</span>
                                                    </td>
                                                    <td className="text-start" style={{ fontSize: '12px' }}>
                                                        <span className="namelink text-dark fw-semibold text-capitalize">{ele?.description || "N/A"}</span>
                                                    </td>
                                                    {/* <td className='text-center'>
                                                        <Form.Check
                                                            type="switch"
                                                            checked={ele?.status}
                                                            onChange={(e) => handleStatusChange(e, ele)}
                                                            className="d-flex justify-content-center"
                                                        />
                                                    </td> */}
                                                    <td className='text-center'>
                                                        <div className='d-flex justify-content-center'>
                                                            <button className="btn btn-outline-secondary" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handelUpdate(ele)}>
                                                                <i className="uil-edit-alt" style={{ fontSize: '12px' }}></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <CreateCategory modal={openModal} closeModal={closeModal} />
            <CategoryUpdate modal={openEditModal} closeModal={closeupdatemodal} editData={editData} />

            <Modal show={statusModal} onHide={() => setStatusModal(false)}>
                <Modal.Body>
                    Are you sure you want to {!checkedStatus ? 'deactivate' : 'activate'} this Category ?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setStatusModal(false);
                        }}>
                        No
                    </Button>
                    <Button className=" web_button " variant="primary" onClick={() => handleYes()}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Category;
