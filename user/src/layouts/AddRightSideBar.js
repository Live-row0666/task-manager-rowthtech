import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, getAllRoles, getAllCategory, getAllUsers } from '../redux/actions';
import Form from 'react-bootstrap/Form';
import { Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import '../../node_modules/react-datepicker/dist/react-datepicker.css';
import { getReporterAction } from '../redux/actions';
import ToastHandle from '../constants/toaster/toaster';

export default function RightBar(props) {
    //
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    // disable previous date
    const handleStartDate = (date) => {
        setStartDate(date);
    };
    const handleEndDate = (date) => {
        setEndDate(date);
    };
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm();
    const { showModal, setShowModal, content, projectId, mileStoneId, sprintId, onFormSubmit, projectName, milestoneName, sprintName } = props;
    const [selectedFile, setSelectedFile] = useState('');
    const store = useSelector((state) => state);
    const category = store?.getAllCategory?.data?.response;
    const dispatch = useDispatch();
    const onSubmit = (e) => {
        let body = new FormData();
        body.append('projectId', projectId);
        body.append('milestoneId', mileStoneId);
        body.append('sprintId', sprintId);
        body.append('summary', e.Summary);
        body.append('description', e.description);
        body.append('assigneeId', e.Assignee);
        body.append('label', e.label);
        body.append('reporterId', e.Reporter);
        body.append('priority', e.priority);
        body.append('startDate', startDate);
        body.append('dueDate', endDate);
        body.append('status', 1);
        body.append('expectedHours', e.expectedHours);
        body.append('attachment', selectedFile ? selectedFile : '');
        if (projectId !== '' && mileStoneId !== '' && sprintId !== '') {
            dispatch(createTask(body));
            ToastHandle('success', 'Task created successfully');
            onFormSubmit();
            reset();
        } else {
            alert('Please Select Project');
        }
        setValue('Summary', '');
        setValue('label', '');
        setValue('Reporter', '');
        setValue('priority', '');
        setValue('start_date', '');
        setValue('last_date', '');
        setValue('description', '');
        setShowModal(false);
        setSelectedFile('');
        setStartDate("");
        setEndDate("")
    };
    const handelClose = () => {
        setValue('Summary', '');
        setValue('label', '');
        setValue('Reporter', '');
        setValue('priority', '');
        setValue('start_date', '');
        setValue('last_date', '');
        setValue('description', '');
        setShowModal(false);
        setSelectedFile('');
        setStartDate("");
        setEndDate("")
        reset();
    };
    useEffect(() => {
        reset({ projectname: projectId, Milestone: mileStoneId, Sprint: sprintId });
    }, [showModal, mileStoneId, projectId, reset, sprintId]);

    useEffect(() => {
        dispatch(getAllRoles());
        dispatch(getAllUsers());
        // let status = true
        dispatch(getAllCategory({ status: true }));
        dispatch(getReporterAction())

    }, [dispatch]);

    const reporter = store?.getReporterReducer?.data?.reporterList
    return (
        <div className={showModal ? 'rightBar show' : 'rightBar'} role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Add Task</h3>
                    <button
                        type="button"
                        className="close "
                        data-dismiss="modal"
                        aria-label="Close"
                        onClick={handelClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <h4 className="modal-title" id="myModalLabel"></h4>
                </div>

                <div className="modal-body">
                    <p>{content}</p>
                    <div className="model-content-detail">
                        <form className="" onSubmit={handleSubmit(onSubmit)}>
                            <div className="row">
                                {' '}
                                <Col lg={12}>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}

                                                    Project<span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Control defaultValue={projectName}
                                                    disabled />
                                            </Form.Group>
                                        </Col>
                                        <Col lg={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label>
                                                    {' '}
                                                    Milestone<span className="text-danger">*</span>:
                                                </Form.Label>
                                                <Form.Control defaultValue={milestoneName}
                                                    disabled />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Col>
                            </div>

                            <div className="row">
                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                        <Form.Label>
                                            Sprint <span className="text-danger">*</span>:
                                        </Form.Label>
                                        <Form.Control defaultValue={sprintName}
                                            disabled />
                                    </Form.Group>
                                </Col>
                                <div className="mb-2 col-6">
                                    <label className="form-label" htmlFor="exampleForm.ControlTextarea1">
                                        Summary
                                        <span className="text-danger">*</span>:
                                    </label>
                                    <input
                                        placeholder="Please Enter Summary"
                                        type="text"
                                        id="exampleForm.ControlTextarea1"
                                        className="form-control"
                                        {...register('Summary', { required: true, pattern: /^[^\s].*$/ })}
                                    />
                                    {errors.Summary?.type === 'required' && (
                                        <span className="text-danger"> This field is required *</span>
                                    )}
                                    {errors.Summary?.type === 'pattern' && (
                                        <span className="text-danger"> Empty fields / space at first character is not allowed</span>
                                    )}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-12">
                                    <div className="mb-2">
                                        <label className="form-label" htmlFor="exampleForm.ControlInput1">
                                            Description:
                                        </label>

                                        <Form.Control
                                            as="textarea"
                                            placeholder="Please Enter Description"
                                            rows={3}
                                            type="text"
                                            {...register('description')}
                                        />
                                        {errors.description?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="">
                                <div className="">
                                    <div className="mb-2">
                                        <label className="form-label" htmlFor="exampleForm.ControlTextarea1">
                                            Assignee
                                            <span className="text-danger">*</span>:
                                        </label>

                                        <select
                                            name="Assignee"
                                            className="form-select chosen-select"
                                            id="exampleForm.ControlInput1"
                                            {...register('Assignee', { required: true })}>
                                            <option value={''} hidden>
                                                Select

                                            </option>
                                            {store?.getAllUsers?.data?.response?.map((ele, ind) => (
                                                <option value={ele?._id}>
                                                    {' '}
                                                    {ele?.firstName} {ele?.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.Assignee?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </div>
                                </div>
                                <div className="">
                                    <div className="mb-2">
                                        <label className="form-label" htmlFor="exampleForm.ControlTextarea1">
                                            label
                                            <span className="text-danger">*</span>:
                                        </label>

                                        <select
                                            name="label"
                                            className="form-select"
                                            id="exampleForm.ControlInput1"
                                            {...register('label', { required: true })}>
                                            <option value={''} hidden>
                                                Select

                                            </option>
                                            {category?.map((ele, ind) => (
                                                <option value={ele?._id}>
                                                    {' '}
                                                    {ele?.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.label?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </div>
                                </div>
                                <div className="">
                                    <div className="mb-2">
                                        <label className="form-label" htmlFor="exampleForm.ControlTextarea1">
                                            Reporter
                                            <span className="text-danger">*</span>:
                                        </label>

                                        <select
                                            name="Reporetr"
                                            className="form-select"
                                            id="exampleForm.ControlInput1"
                                            {...register('Reporter', { required: true })}>
                                            <option value={''} hidden >
                                                Select
                                            </option>
                                            {reporter?.map((ele, ind) => (
                                                <option value={ele?._id}>
                                                    {' '}
                                                    {ele?.firstName} {ele?.lastName}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.Reporter?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="mb-2">
                                        <label className="form-label" htmlFor="exampleForm.ControlInput1">
                                            Expected Hours <span className="text-danger">*</span>:
                                        </label>
                                        <input
                                            placeholder="Please Expected Hours "
                                            type="number"
                                            id="exampleForm.ControlTextarea1"
                                            className="form-control"
                                            {...register('expectedHours', { required: true })}
                                        />
                                        {errors.expectedHours?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                        <Form.Label className="w-100">
                                            Start Date<span className="text-danger">*</span>:
                                        </Form.Label>

                                        <DatePicker
                                            selected={startDate}
                                            // onChange={(date) => setStartDate(date)}
                                            onChange={(date) => handleStartDate(date)}
                                            placeholderText="mm-dd-yyyy"
                                            // minDate={today}
                                            className="add_width_input"
                                        />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-6">
                                    <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                        <Form.Label className="w-100">
                                            End Date<span className="text-danger">*</span>:
                                        </Form.Label>

                                        <DatePicker
                                            selected={endDate}
                                            disabled={startDate === '' || startDate === undefined}
                                            // onChange={(date) => setEndDate(date)}
                                            onChange={(date) => handleEndDate(date)}
                                            placeholderText="mm-dd-yyyy"
                                            // minDate={startDate}
                                            className="add_width_input"
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-lg-6">
                                    <div className="mb-1">
                                        <label className="form-label" htmlFor="exampleForm.ControlInput1">
                                            {' '}
                                            Priority <span className="text-danger">*</span>:
                                        </label>
                                        <select
                                            name="Priority"
                                            className="form-select"
                                            id="exampleForm.ControlInput1"
                                            {...register('priority', { required: true })}>
                                            <option hidden>
                                                Select
                                            </option>
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
                                        </select>

                                        {errors?.priority?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="row"></div>
                            <div className="row">
                                <div className="text-start d-flex align-items-end justify-content-end col">
                                    <button
                                        type="submit"
                                        className="btn btn-sm  text-white pt-1 pb-1 mt-3 web_button  btn btn-info">
                                        Add
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
