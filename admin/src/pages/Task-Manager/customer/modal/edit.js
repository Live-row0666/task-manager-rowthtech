import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { addPreSalesData, getPreSalesData, updatePreSalesData } from '../../../../redux/customer/action';
import { useSelector, useDispatch } from 'react-redux';
import { getAllTechnology } from '../../../../redux/technology/action';
import ToastHandle from '../../../../constants/toaster/toaster';
import Multiselect from 'multiselect-react-dropdown';
import DatePicker from 'react-datepicker';
import { parseISO } from 'date-fns';
const Edit = ({ modal, editData, closemodal }) => {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();
    const updatePreSaleStatus = store?.updatePreSaleReducer?.updatePreSale?.status;
    const updatePreSaleMessage = store?.updatePreSaleReducer?.updatePreSale?.message;
    const [addValue, setAddValue] = useState([]);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [selected, setSelected] = useState([]);
    const [selectedType, setSelectedType] = useState(['Web', 'Mobile']);
    const [addValueType, setAddValueType] = useState([]);
    const getTechnology = store?.getAllTechnologyReducer?.data?.response;
    // disable previous date
    const today = new Date();
    // end date
    const handleStartDate = (date) => {
        setStartDate(date);
    };
    const handleEndDate = (date) => {
        setEndDate(date);
    };
    // update
    const closeModal = () => { };
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm();
    const onSubmit = (data) => {
        dispatch(
            updatePreSalesData({
                preSalesId: editData?._id,
                clientName: data?.name,
                projectName: data?.project,
                description: data?.description,
                stage: data?.stage,
                type: addValueType,
                status: data?.status,
                technology: addValue,
                startDate: startDate,
                endDate: endDate,
                projectType: data?.project_type,
                projectStatus: data?.Projectstatus,
            })
        );
        setAddValue('');
    };

    useEffect(() => {
        if (updatePreSaleStatus === '200') {
            ToastHandle('success', updatePreSaleMessage);
            closemodal('render');
        } else if (updatePreSaleStatus === 400) {
            ToastHandle('error', updatePreSaleMessage);
        }
    }, [updatePreSaleStatus]);
    // model check two type add and edite;

    useEffect(() => {
        setAddValue(editData?.Project[0]?.technologies ? editData?.Project[0]?.technologies : '');
        setStartDate(editData?.Project[0]?.startDate ? parseISO(editData?.Project[0]?.startDate) : '');
        setEndDate(editData?.Project[0]?.endDate ? parseISO(editData?.Project[0]?.endDate) : '');
        setAddValueType(editData?.type);
        reset({
            name: editData?.clientName,
            project: editData?.projectName,
            description: editData?.description,
            status: editData?.status,
            stage: editData?.stage,
            type: editData?.type,
            project_type: editData?.Project[0]?.projectType,
            Projectstatus: editData?.Project[0]?.projectStatus,
        });
    }, [modal]);
    const selectedTypeValues = editData?.type?.map((item) => {
        return item;
    });
    const addTypehandle = (selectedList, selectItem) => {
        setAddValueType(selectedList);
    };
    const removeTypehandle = (selectedList, removedItem) => {
        const remove = selectedType.filter((ele, ind) => {
            return ele !== removedItem;
        });
        const arr = [];
        selectedList.forEach((element) => {
            selectedType.filter((ele) => {
                if (ele === element) {
                    arr.push(ele);
                    return setAddValueType(arr);
                }
            });
        });
    };
    const addhandle = (selectedList, selectItem) => {
        const add = getTechnology.filter((ele, ind) => {
            return ele?.techName == selectItem;
        });
        setAddValue([...addValue, add[0]?._id]);
    };
    const removehandle = (selectedList, removedItem) => {
        const remove = getTechnology.filter((ele, ind) => {
            return ele?.techName !== removedItem;
        });
        const arr = [];
        selectedList.forEach((element) => {
            getTechnology.filter((ele) => {
                if (ele?.techName === element) {
                    arr.push(ele);
                    return setAddValue(arr);
                }
            });
        });
    };
    const selectedValues = editData?.Project[0]?.technologies?.map((item) => {
        return item?.techName;
    });
    useEffect(() => {
        const getTechnologyname = [];
        dispatch(getAllTechnology({ status: true }));
        for (let i = 0; i < getTechnology?.length; i++) {
            getTechnologyname.push(getTechnology[i]?.techName);
        }
        setSelected(getTechnologyname);
    }, [modal]);

    return (
        <>
            <Modal
                // {...props}
                show={modal}
                onHide={closemodal}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered>
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">update</Modal.Title>
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

                                    <Form.Select
                                        {...register('status', { required: true })}
                                        disabled={editData?.status == 1 ? true : ''}>
                                        <option value="" hidden>
                                            {' '}
                                            --select--
                                        </option>
                                        <option value="1">CONVERTED</option>
                                        <option value="0">NOT-CONVERTED</option>
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
                                        <option value="" hidden >
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
                                        {...register('type', { required: false })}
                                        onRemove={removeTypehandle}
                                        onSelect={addTypehandle}
                                        isObject={false}
                                        options={selectedType}
                                        selectedValues={selectedTypeValues}
                                        showCheckbox
                                        placeholder="Select Type"
                                    />
                                    {errors.type?.type === 'required' && (
                                        <span className="text-danger"> This field is required *</span>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        {watch('status') == 1 ? (
                            <>
                                {' '}
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                Type Of Project <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Select {...register('project_type', { required: true })}>
                                                <option hidden >
                                                    Choose an Project Type{' '}
                                                </option>
                                                <option value="T&M">T&M</option>
                                                <option value="FC">FC</option>
                                                <option value=" HR">HR</option>
                                                <option value="DT">DT</option>
                                            </Form.Select>
                                            {errors.project_type?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                Select Your Technology <span className="text-danger">*</span>:
                                            </Form.Label>

                                            <Multiselect
                                                {...register('technology', { required: false })}
                                                onRemove={removehandle}
                                                onSelect={addhandle}
                                                isObject={false}
                                                options={selected}
                                                selectedValues={selectedValues}
                                                placeholder="Select Technology"
                                            />
                                            {errors.technology?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className="w-100">
                                                Start Date<span className="text-danger">*</span>:
                                            </Form.Label>

                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => handleStartDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                minDate={today}
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className="w-100">
                                                End Date<span className="text-danger">*</span>:
                                            </Form.Label>

                                            <DatePicker
                                                selected={endDate}
                                                disabled={startDate == '' || startDate == undefined}
                                                onChange={(date) => handleEndDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                minDate={startDate}
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label>
                                                Status<span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Select {...register('Projectstatus', { required: true })}>
                                                <option hidden >
                                                    Select Status
                                                </option>
                                                <option value="1">To-Do</option>
                                                <option value="2">Live</option>
                                                <option value="3">Hold</option>
                                                <option value="4">Completed</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        ) : (
                            ''
                        )}

                        <Row>
                            <Col lg={6} className="text-end">
                                <Button type="submit web_button" className="web_button">
                                    Update
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
export default Edit;
