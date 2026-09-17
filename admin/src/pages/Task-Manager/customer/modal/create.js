import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { addPreSalesData, getPreSalesData, updatePreSalesData } from '../../../../redux/customer/action';
import { useSelector, useDispatch } from 'react-redux';
import ToastHandle from '../../../../constants/toaster/toaster';
import Multiselect from 'multiselect-react-dropdown';
const Create = ({ modal, closemodal }) => {
    const store = useSelector((state) => state);
    const [selected, setSelected] = useState(['Web', 'Mobile']);
    const [addValue, setAddValue] = useState();
    const dispatch = useDispatch();
    // create
    const customerCreateStatus = store?.addPreSaleReducer?.data?.status;
    const customerCreateMessage = store?.addPreSaleReducer?.data?.message;
    const customerCreateLoading = store?.addPreSaleReducer?.loading;
    const updatePreSaleStatus = store?.updatePreSaleReducer?.updatePreSale?.status;
    const updatePreSaleMessage = store?.updatePreSaleReducer?.updatePreSale?.message;
    // update
    const addhandle = (selectedList, selectItem) => {
        setAddValue(selectedList);
    };
    const removehandle = (selectedList, removedItem) => {
        const remove = selected.filter((ele, ind) => {
            return ele !== removedItem;
        });
        setAddValue(remove);
    };
    const closeModal = () => {
        closemodal();
    };
    const {
        register,
        handleSubmit,
        reset, setValue,
        formState: { errors },
    } = useForm();
    const onSubmit = (data) => {
        dispatch(
            addPreSalesData({
                clientName: data?.name,
                projectName: data?.project,
                description: data?.description,
                stage: data?.stage,
                type: addValue,
                status: 0,
            })
        );
        setValue("name", "")
        setValue("project", "")
        setValue("description", "")
        setValue("type", "")
        setValue("stage", "")
    };

    useEffect(() => {
        if (customerCreateStatus === '200') {
            ToastHandle('success', customerCreateMessage);
            closemodal('render');
        } else if (customerCreateStatus === '400') {
            ToastHandle('error', customerCreateMessage);
        }
    }, [customerCreateStatus]);
    // model check two type add and edite;

    return (
        <>
            <Modal
                // {...props}
                show={modal}
                onHide={closeModal}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">Create</Modal.Title>
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

                                    <Form.Control
                                        type="text"
                                        placeholder="NOT-CONVERTED"
                                        disabled={true}
                                        {...register('type')}
                                    />

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
                                        <option value="" hidden>
                                            {' '}
                                            --select--
                                        </option>
                                        <option value="1">HOT</option>
                                        <option value="2">COLD</option>
                                        <option value="3">MEDIUM</option>
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


                                    <Multiselect
                                        onRemove={removehandle}
                                        onSelect={addhandle}
                                        isObject={false}
                                        options={selected}
                                        showCheckbox
                                        placeholder="Select Type"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg={6} className="text-end">
                                <Button type="submit web_button" className="web_button">
                                    {' '}
                                    Add
                                </Button>
                            </Col>
                            <Col lg={6}>
                                <Button className="btn btn-danger " onClick={closemodal}>
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};
export default Create;
