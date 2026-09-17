import React from 'react';
import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col, Button, CloseButton, Card } from 'react-bootstrap';
import { createTask } from '../../../../../../../redux/task/action';
import ToastHandle from '../../../../../../../constants/toaster/toaster';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
const Create = ({ modal, CloseModal, projectid, milestoneid, sprintid }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState('');
    const store = useSelector((state) => state);
    const errorhandel = store?.createTaskReducer;
    // disable previous date
    const today = new Date().toISOString().split('T')[0];
    //
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = (val) => {
        let body = new FormData();
        body.append("projectId", projectid)
        body.append("milestoneId", milestoneid)
        body.append("sprintId", sprintid)
        body.append("summary", val?.summary)
        body.append("description", description)
        body.append("assigneeId", val?.Assignee)
        body.append("reporterId", val?.Reporter)
        body.append("priority", val?.Priority)
        body.append("startDate", val?.startdate)
        body.append("dueDate", val?.dueDate)
        body.append("status", 1)
        body.append("attachment", val?.attachment[0])
        dispatch(createTask(body));
    };
    const handleClose = () => {
        reset();
        CloseModal();
    };
    useEffect(() => {
        reset({
            projectname: projectid,
            Milestone: milestoneid,
            Sprint: sprintid,
        });
    }, [modal]);

    useEffect(() => {
        if (errorhandel?.data?.status == 200) {
            ToastHandle('success', 'Successfully added');
            CloseModal('render');
            reset();
        } else if (errorhandel?.data?.status == 400) {
            ToastHandle('error', errorhandel?.data?.message);
        } else if (errorhandel?.data?.status == 500) {
            ToastHandle('error', errorhandel?.data?.message);
        }
    }, [errorhandel]);

    return (
        <>
            <Modal show={modal} onHide={handleClose} size="lg">
                <Row className="m-0 p-0">
                    <Col lg={12}>
                        <Row>
                            <Col lg={7} className="text-end">
                                <Modal.Title id="" className="mx-auto">
                                    Add Task
                                </Modal.Title>
                            </Col>
                            <Col lg={5} className="text-end pt-2">
                                <CloseButton onClick={handleClose} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Modal.Body className="py-0">
                    <Card className="p-2">
                        <Form onSubmit={handleSubmit(onSubmit)}>
                            <Row>
                                <Col lg={12}>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Project<span className="text-danger">*</span>:
                                                </Form.Label>

                                                <Form.Select {...register('projectname', { required: true, disabled: true })}>
                                                    {store?.getProject?.data?.response?.projects?.map((ele, ind) => (
                                                        <option value={ele?._id}> {ele?.projectName} </option>
                                                    ))}
                                                </Form.Select>
                                                {errors.projectname?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Milestone<span className="text-danger">*</span>:
                                                </Form.Label>

                                                <Form.Select {...register('Milestone', { required: true, disabled: true })}>
                                                    {store?.getSigleMileStone?.data?.response?.map((ele, ind) => (
                                                        <option value={ele?._id}> {ele?.title} </option>
                                                    ))}
                                                </Form.Select>
                                                {errors.Milestone?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={12}>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    Sprint <span className="text-danger">*</span>:
                                                </Form.Label>

                                                <Form.Select {...register('Sprint', { required: true, disabled: true })}>
                                                    {store?.getAllSingleSprints?.data?.Response?.map((ele, ind) => (
                                                        <option value={ele?._id}> {ele?.sprintName} </option>
                                                    ))}
                                                </Form.Select>
                                                {errors.Sprint?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Summary <span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder=" Enter Task Summary"
                                                    {...register('summary', { required: true })}
                                                />{' '}
                                                {errors.summary?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={12}>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Description<span className="text-danger">*</span>:
                                                </Form.Label>
                                                <CKEditor
                                                    editor={ClassicEditor}
                                                    config={{
                                                        ckfinder: {
                                                            uploadUrl:
                                                                'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json',
                                                        },
                                                    }}
                                                    data=""
                                                    onChange={(event, editor) => {
                                                        const data = editor.getData();
                                                        setDescription(data);
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Assignee <span className="text-danger">*</span>:
                                                </Form.Label>

                                                <Form.Select {...register('Assignee', { required: true })}>
                                                    <option value={''}>--Select--</option>
                                                    {store?.getAllUsers?.data?.response?.map((ele, ind) => (
                                                        <option value={ele?._id}> {ele?.firstName}{ele?.lastName} </option>
                                                    ))}
                                                </Form.Select>
                                                {errors.Assignee?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={12}>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Reporter<span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Select {...register('Reporter', { required: true })}>
                                                    <option value={''}>--Select--</option>
                                                    {store?.getAllRoles?.data?.response?.map((ele, ind) => (
                                                        <option value={ele?._id}> {ele?.role} </option>
                                                    ))}
                                                </Form.Select>
                                                {errors.Reporter?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Priority <span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Select {...register('Priority', { required: true })}>
                                                    <option>-------select----</option>
                                                    <option value="1">High</option>
                                                    <option value="2">Medium</option>
                                                    <option value="3">Low</option>
                                                </Form.Select>
                                                {errors.Priority?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={12}>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Start Date <span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    min={today}
                                                    {...register('startdate', { required: true })}
                                                />{' '}
                                                {errors.estimatedate?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Due Date<span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    disabled={watch("startdate") == "" || watch("startdate") == undefined}
                                                    min={watch("startdate")}
                                                    {...register('dueDate', { required: true })}
                                                />{' '}
                                                {errors.dueDate?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col lg={12}>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Status <span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="To-Do"
                                                    {...register('status', { required: true, disabled: true })}
                                                />
                                                {errors.status?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Attachment<span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Control
                                                    type="file"

                                                    {...register('attachment', { required: true })}
                                                />
                                                {errors.attachment?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="text-start d-flex align-items-center justify-content-center">
                                    <Button
                                        variant="info"
                                        type="submit"
                                        className="btn btn-sm  text-white pt-1 pb-1 mt-3 web_button ">
                                        Add
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Create;
