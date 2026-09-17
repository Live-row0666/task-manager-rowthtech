import React from 'react';
import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col, Button, CloseButton, Card } from 'react-bootstrap';
import { createTask } from '../../../../redux/task/action';
import ToastHandle from '../../../../constants/toaster/toaster';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { getSingleSprint, getsingleMileStone, getReporterAction, getAllCategory } from '../../../../redux/actions';
import moment from 'moment';
import pdfImage from '../../../../../src/assets/images/pdf.png';
import DatePicker from 'react-datepicker';
import '../../../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { useParams } from 'react-router-dom';
const Create = ({ modal, CloseModal }) => {
    const { projectId, milestoneId, spriteId } = useParams();
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    // disable previous date
    const today = new Date();
    // end date
    const handleStartDate = (date) => {
        setStartDate(date);
    };
    const handleEndDate = (date) => {
        setEndDate(date);
    };

    const {
        register,
        handleSubmit,
        watch, setValue,
        formState: { errors },
    } = useForm();
    const store = useSelector((state) => state);

    const [description, setDescription] = useState('');
    const [milestoneDisable, setMilestoneDisable] = useState(true)
    const [sprintDisable, setsprintDisable] = useState(true)
    // const projectId = store?.getProjectId?.data;
    // const milestoneId = store?.getMilestoneId?.data;
    // const sprintid = store?.getSprintId?.data;
    const Createhandel = store?.createTaskReducer;
    const [selectedFile, setSelectedFile] = useState('');
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            alert('File selected');
        }
        else {
            alert('File Not selected');
            setSelectedFile("");
        }

    };

    const openFileInput = () => {
        document.getElementById('fileInput').click();
    };
    // const sucesshandel =store?.createTaskReducer?.data

    const dispatch = useDispatch();

    const onSubmit = (e) => {
        let body = new FormData();
        body.append('projectId', projectId);
        body.append('milestoneId', milestoneId);
        body.append('sprintId', spriteId);
        body.append('summary', e.summary);
        body.append('description', e.description);
        body.append('assigneeId', e.Assignee);
        body.append('label', e.label);
        body.append('priority', e.Priority);
        body.append('reporterId', e.Reporter);
        body.append('startDate', startDate);
        body.append('dueDate', endDate);
        body.append('status', 1);
        body.append('attachment', selectedFile);

        dispatch(createTask(body));
        setValue('projectname', '');
        setValue('Milestone', '');
        setsprintDisable(true)
        setMilestoneDisable(true)
        setValue('description', '');
        setValue('Sprint', '');
        setValue('summary', '');
        setValue('Assignee', '');
        setValue('label', '');
        setValue('Reporter', '');
        setValue('Priority', '');
        setSelectedFile("")
        setEndDate("")
        setStartDate("")
        // setShowModal(false);
    };

    const handleClose = () => {
        setValue('projectname', '');
        setValue('Milestone', '');
        setsprintDisable(true)
        setMilestoneDisable(true)
        setValue('description', '');
        setValue('Sprint', '');
        setValue('summary', '');
        setValue('Assignee', '');
        setValue('label', '');
        setValue('Reporter', '');
        setValue('Priority', '');
        setEndDate("")
        setStartDate("")
        setSelectedFile("")
        CloseModal();
    };
    useEffect(() => {
        if (Createhandel?.data?.status == 200) {
            CloseModal('render');
            ToastHandle('success', Createhandel?.data?.message);
        } else if (Createhandel?.data?.status == 400) {
            ToastHandle('error', Createhandel?.data?.message);
        } else if (Createhandel?.data?.status == 500) {
            ToastHandle('error', Createhandel?.data?.message);
        }
    }, [Createhandel]);
    const handelProject = (e) => {
        dispatch(getsingleMileStone({ id: e.target.value, activeStatus: 1, skip: 0, mileStoneId: "" }));
        setMilestoneDisable(false)
    }
    const handelmilestone = (e) => {
        dispatch(getSingleSprint({ activeStatus: 1, id: e.target.value, skip: 0 }));
        setsprintDisable(false)
    }
    useEffect(() => {
        dispatch(getReporterAction())
        dispatch(getAllCategory({ status: true }));
    }, [])
    const reporter = store?.getReporterReducer?.data?.reporterList
    return (
        <Modal show={modal} onHide={handleClose} size="lg">
            <Row className="m-0 p-0">
                <Col lg={12}>
                    <Row>
                        <Col lg={12} className="text-end pt-2">
                            <button type="button" className="close bg-black border-0 text-white" onClick={handleClose} aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </Col>
                        <Col lg={12} className="text-end">
                            <Modal.Title id="" className="mx-auto modal_titles text-center">
                                Add Task
                            </Modal.Title>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Modal.Body className="py-0">
                <div className="p-2">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row>
                            <Col lg={12}>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                {' '}
                                                Summary <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder=" Enter Task Summary"
                                                {...register('summary', { required: true, pattern: /^[^\s].*$/ })}
                                            />{' '}
                                            {errors.summary?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                            {errors.summary?.type === 'pattern' && (
                                                <span className="text-danger"> Empty fields / space at first character is not allowed</span>
                                            )}

                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                {' '}
                                                Reporter <span className="text-danger">*</span>:
                                            </Form.Label>

                                            <Form.Select {...register('Reporter', { required: true })}>
                                                <option value={''}>--Select--</option>
                                                {reporter?.map((ele, ind) => (
                                                    <option value={ele?._id}>
                                                        {' '}
                                                        {ele?.firstName} {ele?.lastName}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            {errors.Reporter?.type === 'required' && (
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
                                                Description:
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                type="text"
                                                placeholder="Please Enter Description"
                                                {...register('description')}
                                            />
                                            {errors.description?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
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
                                                    <option value={ele?._id}>
                                                        {' '}
                                                        {ele?.firstName} {ele?.lastName}
                                                    </option>
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
                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                    <Form.Label>
                                        {' '}
                                        label <span className="text-danger">*</span>:
                                    </Form.Label>

                                    <Form.Select {...register('label', { required: true })}>
                                        <option value={''}>--Select--</option>
                                        {store?.getAllCategory?.data?.response?.map((ele, ind) => (
                                            <option value={ele?._id}>
                                                {' '}
                                                {ele?.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {errors.label?.type === 'required' && (
                                        <span className="text-danger"> This field is required *</span>
                                    )}
                                </Form.Group>
                            </Col>

                            <Col lg={12}>
                                <Row>

                                    <Col lg={6}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                {' '}
                                                Priority <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Select {...register('Priority', { required: true })}>
                                                <option>-------select----</option>

                                                <option value="Critical">
                                                    &#128308;
                                                    Critical
                                                </option>
                                                <option value="High">
                                                    &#128992;
                                                    High</option>
                                                <option value="Medium;">
                                                    &#128993;
                                                    Medium</option>
                                                <option value="Low">
                                                    &#128994;
                                                    Low</option>
                                            </Form.Select>
                                            {errors.Priority?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className="w-100">
                                                Start Date<span className="text-danger">*</span>:
                                            </Form.Label>

                                            <DatePicker
                                                selected={startDate}
                                                // onChange={(date) => setStartDate(date)}
                                                onChange={(date) => handleStartDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                required
                                                // minDate={today}
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>

                                </Row>
                            </Col>
                            <Col lg={12}>
                                <Row>

                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className="w-100">
                                                End Date<span className="text-danger">*</span>:
                                            </Form.Label>

                                            <DatePicker
                                                selected={endDate}
                                                disabled={startDate == '' || startDate == undefined}
                                                // onChange={(date) => setEndDate(date)}
                                                required
                                                onChange={(date) => handleEndDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                // minDate={startDate}
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                            <Col lg={12}>
                                <Row>

                                    <Col lg={6}>

                                        <div class="mb-2">
                                            <label class="form-label" htmlFor="exampleForm.ControlTextarea1">
                                                Attachment :
                                            </label>
                                            <div onClick={openFileInput}>
                                                <i className="mdi mdi-attachment m-0 p-0 font-20 cp"></i>
                                            </div>
                                            <input
                                                type="file"
                                                accept="application/pdf,image/png,image/jpeg,image/jpg"
                                                id="fileInput"
                                                className="file-input"
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                            // {...register('Attachment', { required: true })}
                                            />{' '}
                                            {selectedFile ? (
                                                <img
                                                    src={
                                                        selectedFile?.type == 'image/png' ||
                                                            selectedFile?.type == 'image/jpg' ||
                                                            selectedFile?.type === 'image/jpeg'
                                                            ? URL.createObjectURL(selectedFile)
                                                            : pdfImage
                                                    }
                                                    className="add_upload_icon_load me-2 h-auto w-25 cp"
                                                    alt=""
                                                />
                                            ) : (
                                                ''
                                            )}

                                        </div>

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
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default Create;
