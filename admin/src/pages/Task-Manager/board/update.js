import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col, Card, Button, Alert, CloseButton } from 'react-bootstrap';
import ToastHandle from '../../../constants/toaster/toaster';
import { useDispatch, useSelector } from 'react-redux';
import MainLoader from '../../../constants/Loader/loader';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { getSingleSprint, getsingleMileStone, updateTask } from '../../../redux/actions';
import DatePicker from 'react-datepicker';
import '../../../../node_modules/react-datepicker/dist/react-datepicker.css';
import noimage from '../../../assets/images/noimage.png';
import pdfImage from '../../../assets/images/pdff-removebg-preview.png';
import { parseISO } from 'date-fns';
const UpdateTask = ({ modal, closeModal, editData, projectId, milestoneId, columns, speintId }) => {

    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [filePreview, setFilePreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const today = new Date();
    const handleStartDate = (date) => {
        setStartDate(date);
    };
    const handleEndDate = (date) => {
        setEndDate(date);
    };
    // (editData, 'update');
    const [data, setData] = useState({
        image: '',
    });
    const [imageShow, setImageShow] = useState(true);
    const dispatch = useDispatch();
    const store = useSelector((state) => state);

    const loaderhandel = store?.UpdateTaskReducer;
    const allDetails = columns?.[1]?.items[0];

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();
    const CloseModaal = () => {
        closeModal();
    };

    const onSubmit = (val) => {
        let body = new FormData();
        body.append('taskId', editData?._id);
        body.append('summary', val?.summary);
        body.append('description', val?.description);
        body.append('assigneeId', val?.Assignee);
        body.append('reporterId', val?.Reporter);
        body.append('priority', val?.priority);
        body.append('startDate', startDate);
        body.append('dueDate', endDate);
        body.append('status', val?.status);
        body.append('attachment', data?.image);

        dispatch(updateTask(body));
        closeModal();
        ToastHandle('success', "Task updated successfully")
    };

    useEffect(() => {
        reset({
            projectname: editData?.projectInfo?._id,
            Milestone: editData?.milestoneInfo?._id,
            Sprint: editData?.sprintInfo?._id,
            summary: editData?.summary,
            Assignee: editData?.assignees?.assigneeId,
            Reporter: editData?.assignees?.reporterId,
            priority: editData?.priority,
            status: editData?.status,
            description: editData?.description,
            expectedHours: editData?.expectedHours
        });
        setData({ image: editData?.attachment });
        if (editData?.startDate || editData?.dueDate) {
            const parsedDate = parseISO(editData?.startDate)
            const endate = parseISO(editData?.dueDate)
            if (parsedDate || endate) {
                setStartDate(parsedDate);
                setEndDate(endate)
            } else {
                console.error('Invalid date format:', editData.startDate);
            }
        }
    }, [modal]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData({ ...data, image: e.target.files[0] });
    };
    const handelimageclose = () => {
        setImageShow(false);
        setData({ ...data, image: '' });
    };

    return (
        <>
            <Modal show={modal} onHide={closeModal} size={'lg'}>
                <Row className="m-0 p-0">
                    <Col lg={12}>
                        <Row>
                            <Col lg={7} className="text-end">
                                <Modal.Title id="" className="mx-auto">
                                    Update Task
                                </Modal.Title>
                            </Col>
                            <Col lg={5} className="text-end pt-2">
                                <CloseButton onClick={closeModal} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {loaderhandel.loading ? (
                    <MainLoader />
                ) : (
                    <Modal.Body className="py-0">
                        <div className="p-3">
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

                                                    <Form.Select
                                                        {...register('projectname', {
                                                            required: true,
                                                            disabled: true,
                                                        })}>
                                                        {/* <option value={''}>--Select--</option> */}
                                                        {allDetails && allDetails.projects && (
                                                            <option value={allDetails?.projects?._id} defaultValue>{allDetails?.projects?.projectName}</option>
                                                        )}
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

                                                    <Form.Select
                                                        {...register('Milestone', { required: true, disabled: true })}>
                                                        {allDetails && allDetails.milestones && (
                                                            <option value={allDetails?.milestones?._id} defaultValue>{allDetails?.milestones?.title}</option>
                                                        )}
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

                                                    <Form.Select
                                                        {...register('Sprint', { required: true, disabled: true })}>
                                                        {allDetails && allDetails.sprints && (
                                                            <option value={allDetails?.sprints?._id} defaultValue>{allDetails?.sprints?.sprintName}</option>
                                                        )}
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
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        type="text"
                                                        {...register('description', { required: true })}
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
                                                        <option value={''} hidden>--Select--</option>
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
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Reporter<span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <Form.Select {...register('Reporter', { required: true })}>
                                                        <option value={''} hidden >--Select--</option>
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
                                                    <Form.Select {...register('priority', { required: true })}>
                                                        <option value="Critical">
                                                            &#128308;
                                                            Critical
                                                        </option>
                                                        <option value="High">
                                                            &#128992;
                                                            High</option>
                                                        <option value="Medium">
                                                            &#128993;
                                                            Medium</option>
                                                        <option value="Low">
                                                            &#128994;
                                                            Low</option>
                                                    </Form.Select>
                                                    {errors.priority?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={12}>
                                        <Row>
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
                                                        // onChange={(date) => setEndDate(date)}
                                                        onChange={(date) => handleEndDate(date)}
                                                        placeholderText="mm-dd-yyyy"
                                                        minDate={startDate}
                                                        className="add_width_input"
                                                    />
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
                                                    <Form.Select {...register('status', { required: true })}>
                                                        <option hidden>-------select----</option>
                                                        <option value="1" >todo</option>
                                                        <option value="2">inProgress</option>
                                                        <option value="3">Testing</option>
                                                        <option value="4">Hold</option>
                                                        <option value="5">Done</option>
                                                    </Form.Select>
                                                    {errors.status?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <div class="col-lg-6">
                                                <div class="mb-2">
                                                    <label class="form-label" htmlFor="exampleForm.ControlInput1">
                                                        Expected Hours <span class="text-danger">*</span>:
                                                    </label>
                                                    <input
                                                        placeholder="Please Expected Hours "
                                                        type="text"
                                                        id="exampleForm.ControlTextarea1"
                                                        class="form-control"
                                                        {...register('expectedHours', { required: true })}
                                                    />
                                                    {errors.expectedHours?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Row>
                                                <Col>
                                                    <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                                        <Form.Label>
                                                            Attachment <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <a
                                                            href={editData?.attachment}
                                                            download
                                                            target="_blank"
                                                            className="align_icon_dowl">
                                                            <i className="dripicons-download download_color"></i>
                                                        </a>
                                                        <Form.Control
                                                            style={{ border: '1px solid #a6b3c3' }}
                                                            type='file'
                                                            onChange={handleFileChange}
                                                        />
                                                    </Form.Group>
                                                    {filePreview && (
                                                        <div>
                                                            <p>Preview:</p>
                                                            <img src={filePreview} alt="File Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                                                        </div>
                                                    )}
                                                </Col>
                                            </Row>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="text-start d-flex align-items-center justify-content-center">
                                        <Button
                                            variant="info"
                                            type="submit"
                                            className="btn btn-sm  text-white pt-1 pb-1 mt-3 web_button ">
                                            Update
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Modal.Body>
                )}
            </Modal>
        </>
    );
};

export default UpdateTask;
