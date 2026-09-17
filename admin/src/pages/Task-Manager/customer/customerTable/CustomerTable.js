import React, { useEffect, useState } from 'react';
import MainLoader from '../../../../constants/Loader/loader';
import { Table, Form } from 'react-bootstrap';
import { deletePreSalesData, getPreSalesData } from '../../../../redux/customer/action';
import { useSelector, useDispatch } from 'react-redux';
import ToastHandle from '../../../../constants/toaster/toaster';
import MainDeleteModel from '../../../../constants/deleteModel/MainDeleteModel';

const CustomerTable = (props) => {
    const { checkModel } = props;
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const preSaleData = store?.getPreSaleReducer?.data?.response;
    const preSaleLoading = store?.getPreSaleReducer?.loading;
    const preSaleDeleteStatus = store?.deletePreSaleReducer?.deletePreSale?.status;
    const preSaleDeleteMessage = store?.deletePreSaleReducer?.deletePreSale?.message;

    // delete model
    const [deleteModel, setDeleteModel] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const comfimDelete = () => {
        dispatch(deletePreSalesData(deleteId));
    };
    const deleteIdGet = (id) => {
        setDeleteId(id);
        setDeleteModel(true);
    };

    useEffect(() => {
        if (preSaleDeleteStatus === '200') {
            ToastHandle('success', preSaleDeleteMessage);
            dispatch(getPreSalesData());
            setDeleteModel(false);
        }
    }, [preSaleDeleteStatus]);
    return (
        <div>
            {preSaleLoading ? (
                <MainLoader />
            ) : (
                <Table className="mb-0 add_Color_font" striped>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th> First Name</th>
                            <th>Project</th>
                            <th>Description</th>
                            <th> Status</th>
                            <th> Type</th>
                            <th> Stage</th>
                            <th> Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <>
                            {preSaleData?.map((ele, ind) => {
                                return (
                                    <tr className="align-middle">
                                        <th scope="row">{ind + 1}</th>
                                        <td className="cp">
                                            <span className="namelink"> {ele?.clientName} </span>
                                        </td>
                                        <td className="cp">
                                            <span className="namelink"> {ele?.projectName} </span>
                                        </td>
                                        <td className="w-20">
                                            <span className="namelink">
                                                {' '}
                                                {ele?.description?.slice(0, 10).concat('...')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="namelink">
                                                {ele?.status === 1 ? (
                                                    <>CONVERTED</>
                                                ) : ele?.status === 2 ? (
                                                    <>NOT-CONVERTED</>
                                                ) : (
                                                    ''
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="namelink">
                                                {ele?.stage === 1 ? (
                                                    <>HOT</>
                                                ) : ele?.stage === 2 ? (
                                                    <>COLD</>
                                                ) : ele?.stage === 3 ? (
                                                    <>MEDIUM</>
                                                ) : (
                                                    <></>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="namelink">
                                                {ele?.type[0] === 1 ? <>WEB</> : ele?.type[0] === 2 ? <>MOBILE</> : ''}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="namelink">
                                                <span>
                                                    <i
                                                        class="bi bi-pencil-square"
                                                        onClick={() => {
                                                            checkModel(ele);
                                                        }}></i>
                                                </span>
                                                <span className="ms-2">
                                                    <i
                                                        class="bi bi-trash"
                                                        onClick={() => {
                                                            deleteIdGet(ele?._id);
                                                        }}></i>
                                                </span>
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </>
                    </tbody>
                </Table>
            )}
            <MainDeleteModel
                deleteModel={deleteModel}
                onHide={() => setDeleteModel(false)}
                comfimDelete={comfimDelete}
            />
        </div>
    );
};

export default CustomerTable;
