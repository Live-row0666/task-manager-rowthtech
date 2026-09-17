import React, { useEffect, useState } from "react";
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { addPreSalesData, getPreSalesData, updatePreSalesData } from "../../../../redux/customer/action";
import { useSelector, useDispatch } from "react-redux";
import ToastHandle from '../../../../constants/toaster/toaster';
const CustomerCreateFrom = (props) => {
    const { checkModel, show } = props
    const store = useSelector((state) => state);
    const dispatch = useDispatch()
    // create 
    const customerCreateStatus = store?.addPreSaleReducer?.data?.status;
    const customerCreateMessage = store?.addPreSaleReducer?.data?.message
    const customerCreateLoading = store?.addPreSaleReducer?.loading
    // create 
    // update 
    const updatePreSaleStatus = store?.updatePreSaleReducer?.updatePreSale?.status
    const updatePreSaleMessage = store?.updatePreSaleReducer?.updatePreSale?.message
    // update 

    const [showModel, setShowModel] = useState({
        modelType: '',
        modelShow: '',
        editData: ''
    })
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();
    const onSubmit = (data) => {
        if (showModel.modelType === 'add') {
            dispatch(addPreSalesData({
                clientName: data?.name,
                projectName: data?.project,
                description: data?.description,
                stage: data?.stage,
                type: data?.type,
                status: data?.status
            }))
        } else if (showModel.modelType === 'edit') {
            dispatch(updatePreSalesData({
                preSalesId: showModel?.editData?._id,
                clientName: data?.name,
                projectName: data?.project,
                description: data?.description,
                stage: data?.stage,
                type: data?.type,
                status: data?.status
            }))
        }
    };

    useEffect(() => {
        if (customerCreateStatus === "200") {
            ToastHandle('success', customerCreateMessage);
            checkModel(false, '')
            dispatch(getPreSalesData());
        }
        else if (updatePreSaleStatus === "200") {
            ToastHandle('success', updatePreSaleMessage);
            checkModel(false, '')
            dispatch(getPreSalesData());
        } else if (customerCreateStatus === "400") {
            ToastHandle('error', customerCreateMessage);
        }
    }, [customerCreateStatus, updatePreSaleStatus])
    // model check two type add and edite;


    useEffect(() => {
        if (show?.type !== "") {
            if (show?.type === "add") {
                setShowModel({
                    ...showModel,
                    modelType: show?.type,
                    modelShow: show?.item
                })
                reset({
                    name: "",
                    project: "",
                    description: "",
                    status: "",
                    STAGE: "",
                    TYPE: ""
                })
            } else if (show?.type === "edit") {
                setShowModel({
                    ...showModel,
                    modelType: show?.type,
                    modelShow: show?.item,
                    editData: show?.dataEdit
                })
                reset({
                    name: show?.dataEdit?.clientName,
                    project: show?.dataEdit?.projectName,
                    description: show?.dataEdit?.description,
                    status: show?.dataEdit?.description?.status,
                    STAGE: show?.dataEdit?.description?.stage,
                    TYPE: show?.dataEdit?.description?.type
                })
            }
        } else if (show?.type === "") {
            setShowModel({
                modelType: '',
                modelShow: ''
            })
        }
    }, [show?.type])

    return (<>
        <Modal
            // {...props}
            show={showModel?.modelShow}
            onHide={() => checkModel(false, '')}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header >
                <Modal.Title id="contained-modal-title-vcenter">
                    {showModel.modelType === "edit" ? <>Update</> : <>Create</>}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="pt-2">
                        <Col lg={6}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                <Form.Label>
                                    Name<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Please Enter Name"
                                    {...register('name', { required: true })}
                                />
                                {errors?.name?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                <Form.Label>
                                    Project<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Project"
                                    {...register('project', { required: true })}
                                />
                                {errors?.project?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    Description<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Description"
                                    {...register('description', { required: true })}
                                />
                                {errors?.description?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    Status<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Select {...register('status', { required: true })}>
                                    <option value='' hidden> --select--</option>
                                    <option value="1" selected={showModel?.editData?.status === 1 && true}>CONVERTED</option>
                                    <option value="0" selected={showModel?.editData?.status === 0 && true}>NOT-CONVERTED</option>
                                </Form.Select>
                                {errors?.status?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    STAGE<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Select {...register('stage', { required: true })}>
                                    <option value='' hidden> --select--</option>
                                    <option value="1" selected={showModel?.editData?.stage === 1 && true}>HOT</option>
                                    <option value="2" selected={showModel?.editData?.stage === 2 && true}>COLD</option>
                                    <option value="3" selected={showModel?.editData?.stage === 3 && true}>MEDIUM</option>
                                </Form.Select>
                                {errors?.stage?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    TYPE<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Select {...register('type', { required: true })}>
                                    <option value='' hidden> --select--</option>
                                    <option value="1" selected={showModel?.editData?.type?.[0] === 1 && true}>WEB</option>
                                    <option value="2" selected={showModel?.editData?.type?.[0] === 2 && true}>MOBILE</option>
                                </Form.Select>
                                {errors?.type?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={6} className="text-end">
                            <Button type="submit web_button" className="web_button"> {showModel.modelType === "edit" ? <>Update</> : <>Add</>}</Button>
                        </Col>
                        <Col lg={6}>
                            <Button type="submit web_button" className="btn btn-danger " onClick={() => { checkModel(false) }}>Cancle</Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    </>)
}
export default CustomerCreateFrom
