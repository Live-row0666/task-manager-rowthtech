import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { deletePreSalesData, getPreSalesData } from '../../../redux/customer/action';
import Create from './modal/create';
import MainDeleteModel from '../../../constants/deleteModel/MainDeleteModel';
import Edit from './modal/edit';
import { useSelector, useDispatch } from 'react-redux';
import ToastHandle from '../../../constants/toaster/toaster';
import MainLoader from '../../../constants/Loader/loader';
import { getAllTechnology } from '../../../redux/technology/action';
import Pagination from '@mui/material/Pagination';
const CustomerIndex = () => {
    const store = useSelector((state) => state);

    const dispatch = useDispatch();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [render, setRender] = useState(false);
    const [skip, setSkip] = useState(1);
    const createhandle = () => {
        setCreateModalOpen(true);
    };
    const closeModal = (val) => {
        if (val == 'render') {
            setRender(!render);
        }

        setCreateModalOpen(false);
        setEditModalOpen(false);
    };
    const handlePaginationChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSkip(value);
        dispatch(getPreSalesData({ skip: value }));
    };
    useEffect(() => {
        dispatch(getPreSalesData({ skip: 1 }));
    }, [render]);
    const preSaleData = store?.getPreSaleReducer?.data?.response;
    const preSaleLoading = store?.getPreSaleReducer?.loading;
    const preSaleDeleteStatus = store?.deletePreSaleReducer?.deletePreSale?.status;
    const preSaleDeleteMessage = store?.deletePreSaleReducer?.deletePreSale?.message;

    // delete model
    const [deleteModel, setDeleteModel] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [EditModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState();
    const comfimDelete = () => {
        dispatch(deletePreSalesData(deleteId));
    };
    const deleteIdGet = (id) => {
        setDeleteId(id);
        setDeleteModel(true);
    };
    const EditModalhandle = (ele) => {
        setEditModalOpen(true);
        setEditData(ele);
    };
    useEffect(() => {
        if (preSaleDeleteStatus === '200') {
            ToastHandle('success', preSaleDeleteMessage);
            dispatch(getPreSalesData({ skip: 1 }));
            setDeleteModel(false);
        }
        dispatch(getAllTechnology());
    }, [preSaleDeleteStatus]);
    return (
        <>
            <Card className='' style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
                <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="mb-2">
                        <div className="d-flex justify-content-end align-items-center mb-2">
                            <button className='btn bg-dark text-white fw-semibold' style={{ padding: '4px 16px', fontSize: '11px' }} onClick={createhandle}>
                                Create Client
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflow: 'auto' }}>
                        {preSaleLoading ? (
                            <MainLoader />
                        ) : !preSaleData || preSaleData?.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <h5 className="text-muted">No Data Found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive h-100">
                                <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', overflow: 'hidden' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '5%' }}>#</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Client Name</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Project</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Description</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '12%' }}>Status</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Stage</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '13%' }}>Type</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preSaleData?.map((ele, ind) => {
                                            return (
                                                <tr className="align-middle" key={ele._id || ind} style={{ transition: 'all 0.2s ease' }}>
                                                    <td className='text-center fw-bold' style={{ fontSize: '12px' }}>{(skip - 1) * 10 + ind + 1}</td>
                                                    <td className="text-start" style={{ fontSize: '12px' }}>
                                                        <span className="namelink text-dark fw-semibold text-capitalize">{ele?.clientName}</span>
                                                    </td>
                                                    <td className="text-start" style={{ fontSize: '12px' }}>
                                                        <span className="namelink text-dark fw-semibold">{ele?.projectName}</span>
                                                    </td>
                                                    <td className="text-start" style={{ fontSize: '12px' }}>
                                                        <span className="namelink text-muted">{ele?.description?.slice(0, 20).concat('...')}</span>
                                                    </td>
                                                    <td className='text-center' style={{ fontSize: '12px' }}>
                                                        <span className={`badge px-1 py-1 ${ele?.status === 1 ? 'text-white' : 'text-dark'}`} style={{ fontSize: '10px', backgroundColor: ele?.status === 1 ? '#8FD1A3' : '#FFB4B4' }}>
                                                            {ele?.status === 1 ? 'CONVERTED' : 'NOT-CONVERTED'}
                                                        </span>
                                                    </td>
                                                    <td className='text-center' style={{ fontSize: '12px' }}>
                                                        <span className={`badge px-1 py-1 text-white`} style={{
                                                            fontSize: '10px',
                                                            backgroundColor: ele?.stage === 1 ? '#FF6B6B' : ele?.stage === 2 ? '#74C0FC' : '#FFD93D'
                                                        }}>
                                                            {ele?.stage === 1 ? 'HOT' : ele?.stage === 2 ? 'COLD' : 'MEDIUM'}
                                                        </span>
                                                    </td>
                                                    <td className='text-center' style={{ fontSize: '12px' }}>
                                                        <div className="d-flex flex-column gap-1">
                                                            {ele?.type?.map((type, idx) => (
                                                                <span key={idx} className="badge text-dark px-1 py-0" style={{ fontSize: '9px', backgroundColor: '#B4E9FF' }}>{type}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className='text-center'>
                                                        <div className='d-flex justify-content-center gap-1'>
                                                            <button className="btn btn-outline-secondary" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => EditModalhandle(ele)}>
                                                                <i className="bi bi-pencil-square" style={{ fontSize: '12px' }}></i>
                                                            </button>
                                                            <button className="btn btn-outline-danger" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => deleteIdGet(ele?._id)}>
                                                                <i className="bi bi-trash" style={{ fontSize: '12px' }}></i>
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

                    {store?.getPreSaleReducer?.data?.totalPages > 0 && (
                        <div className="d-flex justify-content-end mt-3 pt-2 border-top">
                            <Pagination
                                page={skip}
                                count={store?.getPreSaleReducer?.data?.totalPages}
                                color="primary"
                                variant="outlined"
                                onChange={handlePaginationChange}
                            />
                        </div>
                    )}

                    <MainDeleteModel
                        deleteModel={deleteModel}
                        onHide={() => setDeleteModel(false)}
                        comfimDelete={comfimDelete}
                    />
                    <Edit modal={EditModalOpen} editData={editData} closemodal={closeModal} />
                    <Create modal={createModalOpen} closemodal={closeModal} />
                </Card.Body>
            </Card>
        </>
    );
};

export default CustomerIndex;
