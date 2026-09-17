import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import '../../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-bootstrap/Modal';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { AddComment, getComment, getBugs, UpdateCommentAction, createSubTask, getSubTask, deleteComment, getHistoryAction, } from '../../../redux/task/action';
import ToastHandle from '../../../constants/toaster/toaster';
import { Row, Col, Button, Alert, CloseButton, Table } from 'react-bootstrap';
import pdfImage from '../../../assets/images/pdff-removebg-preview.png';

const TaskDetailPage = ({ modal, editData, closeModal, taskId }) => {
    const store = useSelector((state) => state);
    const technology = store?.getSingleSprintTask?.data?.response;
    const dispatch = useDispatch();
    const [connectComponent, setConnectComponent] = useState('All');
    const [buttonChange, setButtonChange] = useState(true);
    const [commentId, setCommentId] = useState();
    const getCommentData = store?.getComment?.data?.response;
    const getHistory = store?.getHistoryReducer?.data?.response;
    const [historyResponse, setHistoryResponse] = useState(null);
    const updateresponse = store?.updateCommentReducer?.data.status;
    const sessionData = localStorage.getItem('hyper_user');
    const userData = JSON.parse(sessionData);
    const userName = userData?.firstName + ' ' + userData?.lastName;
    const historyLoader = store?.getHistoryReducer;
    const connectComponentCheck = (type) => {
        setConnectComponent(type);
        setValue('comment', "");
        setValue('subtasks', "");
        setButtonChange(true);
        if (type === 'History') {
            dispatch(getHistoryAction(editData?.id));
        }
        else if (type === 'Bugs') {
            dispatch(getBugs({ type: 'Bug', taskId: editData?._id }));
        }
        else if (type === 'Subtask') {
            dispatch(getSubTask({ taskId: editData?._id, type: "SubTask" }));
        }
        else if (type === 'Comments') {
            dispatch(getComment({ taskId: editData?._id, }));
        }
    };
    const [allCommetUpdateId, setAllCommetUpdateId] = useState('');
    const [inputForUpdate, setInputForUpdate] = useState('');
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [submitted, setSubmitted] = useState(false);
    const today = new Date();
    const bugsResponse = store?.getBugsReducer?.data?.response
    const subtaskResponse = store?.getSubTaskReducer?.data?.response;
    const handleStartDate = (date) => {
        setStartDate(date);
    };
    const handleEndDate = (date) => {
        setEndDate(date);
    };
    const createSubtasksuccess = store?.createTaskReducer?.data?.response;
    if (createSubtasksuccess !== undefined) {
    }
    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = useForm();
    const subtasksSubmit = (e) => {
        if (!taskId) {
            return;
        }
        let subtask_body = new FormData();
        subtask_body.append('taskId', editData._id);
        subtask_body.append('summary', e?.summary);
        subtask_body.append('description', e?.description);
        subtask_body.append('priority', e?.priority);
        subtask_body.append('expectedHours', e?.expectedHours);
        subtask_body.append('startDate', startDate);
        subtask_body.append('dueDate', endDate);
        subtask_body.append('type', e?.type);
        subtask_body.append('subtaskCreator', e?.subtaskCreator);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput?.files?.length > 0) {
            subtask_body.append('attachment', fileInput?.files?.[0]);
        }
        if (editData?._id !== '') {
            dispatch(createSubTask(subtask_body));
            ToastHandle('success', 'Sub-task created successfully');
        }
        setStartDate("");
        setEndDate("");
        reset();
        dispatch(getSubTask({ taskId: editData?._id, type: "SubTask" }));
    }
    useEffect(() => {
        const historyData = store?.getHistoryReducer?.data?.response;
        if (historyData) {
            setHistoryResponse(historyData);
        }
        if (updateresponse !== undefined) {
            dispatch(getComment({ taskId: editData?._id }))
        }
    }, [store?.getHistoryReducer?.data?.response]);
    const onSubmit = (val) => {
        if (buttonChange) {
            let body = {
                taskId: editData?._id,
                comment: val?.comment,
            };
            dispatch(AddComment(body));
            dispatch(getComment({ taskId: editData?._id }))
        } else {
            let body = {
                commentId: commentId,
                comment: val?.comment,
            };
            dispatch(UpdateCommentAction(body));
            dispatch(getComment({ taskId: editData?._id }))
            setButtonChange(true);
        }
        setValue('comment', '');
    };
    useEffect(() => {
        if (submitted) {
            setSubmitted(false);
        }
    }, [submitted]);
    const handeldelete = (data) => {
        dispatch(deleteComment({ taskId: data?._id }));
    };
    const handelUpdate = (data) => {
        setCommentId(data?._id);
        setValue('comment', data?.comment);
        setButtonChange(false);
    };
    const handelUpdateAll = (data, indx) => {
        setAllCommetUpdateId(data?._id);
        reset({
            updated_comment: data?.comment,
        });
        setInputForUpdate(indx);
    };
    const submitUpdateComment = (data) => {
        let body = {
            commentId: allCommetUpdateId,
            comment: data?.updated_comment,
        };
        dispatch(UpdateCommentAction(body));
        setInputForUpdate(false);
    };
    const closeModalHandle = () => {
        closeModal()
        setValue('comment', "");
        setButtonChange(true);
    }
    function generateLink(userActivity, item) {
        switch (userActivity) {
            case "Created milestone":
                return `/dashboard/projects/${item?.sprintId?.projectId}`;
            case "Created Sprint":
                return `/dashboard/sprint/${item?.sprintId?.projectId}/${item?.milestoneId?._id}`;
            case "Created Task":
                return `/dashboard/taskBord/projectId=${item?.sprintId?.projectId}&milestoneId=${item?.milestoneId?._id}&spriteId=${item?.sprintId?._id}`;
            case "Create Project":
                return "/dashboard/projects";
            default:
                return "/dashboard/analytics";
        }
    }

    return (
        <>
            <Modal show={modal} onHide={closeModal} size={'xl'}>
                <Row className="m-0 p-0">
                    <Col lg={12}>
                        <Row>
                            <Col lg={7} className="text-end">
                                <Modal.Title id="" className="text-start modal_titles">
                                    Task Detail : {editData?.summary ? editData?.summary?.charAt(0)?.toUpperCase() + editData?.summary?.slice(1, 50) : ''}
                                </Modal.Title>
                            </Col>
                            <Col lg={5} className="text-end pt-2">
                                <button type="button" className="close border-0 bg-black text-white" onClick={closeModalHandle} aria-label="Close">
                                    <span aria-hidden="true" >&times;</span>
                                </button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <hr />
                <Modal.Body>
                    <Row>
                        <Col lg={8}>
                            <h4 className='modal_titles'>Activity</h4>
                            <Row>
                                <Col lg={12} className='d-flex align-items-center gap-1'>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('All');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'All' ? 'active-button-tdp' : 'inactive-button-tdp'}`}
                                    >
                                        <span><i class="bi bi-people-fill "></i></span> All
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('Comments');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'Comments' ? 'active-button-tdp' : 'inactive-button-tdp'}`}
                                    >
                                        <span><i class="bi bi-chat-right-text-fill"></i></span>  Comments
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('History');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'History' ? 'active-button-tdp' : 'inactive-button-tdp'}`}
                                    >
                                        <span><i class="bi bi-clock-history"></i></span>  History
                                    </Button>

                                    {/* Add Sub-tasks button */}
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('AddSubtask');
                                        }
                                        }
                                        className={`btn px-2 fw-bold py-1  web_button ${connectComponent === 'AddSubtask' ? 'active-button-tdp' : 'inactive-button-tdp'}`}
                                    >
                                        <span><i class="bi bi-pencil-square"></i></span> Add Sub-tasks
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('Bugs');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'Bugs' ? 'active-button-tdp' : 'inactive-button-tdp'}`}
                                    >
                                        <span><i class="bi bi-bug-fill"></i></span>  Bugs
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('Subtask');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'Subtask' ? 'active-button-tdp' : 'inactive-button-tdp'}`}
                                    >
                                        <span><i class="bi bi-check-square-fill"></i></span>  SubTask
                                    </Button>
                                </Col>
                            </Row>
                            {connectComponent === 'All' ? (
                                <>
                                    <Row className='scrollable-content mt-2'>
                                        {getCommentData?.map((ele, ind) => (
                                            <ul style={{ listStyle: 'none' }}>
                                                <Row>
                                                    <Col lg={12} className="d-flex pt-2">
                                                        <Col lg={1} className="d-flex justify-content-start align-items-center">
                                                            <span
                                                                style={{
                                                                    backgroundColor: '#605e5a',
                                                                    borderRadius: '100%',
                                                                    padding: ' 10px',
                                                                    color: 'white',
                                                                    fontWeight: '800',
                                                                }}>
                                                                {ele?.userId?.firstName.charAt(0)}
                                                                {ele?.userId?.lastName.charAt(0)}
                                                            </span>
                                                        </Col>
                                                        <Col lg={11} className="m-0 p-0 d-flex flex-column justify-content-center">
                                                            <div className="d-flex align-items-center">
                                                                <h5 className="m-0 p-0"> {ele?.userId?.firstName} {ele?.userId?.lastName}</h5>
                                                                <p className="ps-1 m-0 p-0 ">
                                                                    ( {moment(ele?.createdAt).fromNow()} )
                                                                </p>
                                                            </div>
                                                            <div className="m-0 p-0">
                                                                <li className="font-18">{ele?.comment}</li>
                                                            </div>
                                                            <div className="d-flex m-0 p-0">
                                                                <p className=" p-0 mb-0" onClick={() => handelUpdate(ele)}>
                                                                    Edit
                                                                </p>
                                                            </div>
                                                        </Col>
                                                    </Col>
                                                </Row>
                                            </ul>
                                        ))}
                                    </Row>
                                </>
                            ) : connectComponent === 'AddSubtask' ? (
                                <form onSubmit={handleSubmit(subtasksSubmit)}>
                                    <Row className="mt-2">
                                        <Col>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='mb-0'>
                                                    Summary<span className='text-danger'>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter Subtask Name"
                                                    {...register('summary', { required: true, pattern: /^[^\s].*$/ })}
                                                    style={{ border: '1px solid #a6b3c3' }}
                                                />
                                                {errors.summary?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                                {errors.summary?.type === 'pattern' && (
                                                    <span className="text-danger"> Empty fields / spaces at first character are not allowed</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col sm={12}>
                                            <Form.Group className="mb-1">
                                                <Form.Label className='mb-0'>
                                                    Description<span className='text-danger'>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={5}
                                                    placeholder="Enter Subtask Description"
                                                    {...register('description', { required: true })}
                                                    style={{ border: '1px solid #a6b3c3' }}
                                                />
                                                {errors.description?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='mb-0'>
                                                    Priority<span className='text-danger'>*</span>
                                                </Form.Label>
                                                <select
                                                    name="priority"
                                                    className={`form-select ${errors.priority ? 'is-invalid' : ''}`}
                                                    style={{ border: '1px solid #a6b3c3' }}
                                                    {...register('priority', { required: true })}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled hidden>Select</option>
                                                    <option value="Critical">&#128308; Critical</option>
                                                    <option value="High">&#128992; High</option>
                                                    <option value="Medium">&#128993; Medium</option>
                                                    <option value="Low">&#128994; Low</option>
                                                </select>
                                                {errors.priority && (
                                                    <div className="invalid-feedback">This field is required</div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='mb-0'>
                                                    Expected Hours<span className='text-danger'>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    style={{ border: '1px solid #a6b3c3' }}
                                                    placeholder="Expected Hours"
                                                    {...register('expectedHours', { required: true })}
                                                />
                                            </Form.Group>
                                            {errors.expectedHours?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                                <Form.Label className="w-100 mb-0">
                                                    Start Date<span className="text-danger">*</span>:
                                                </Form.Label>

                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={(date) => handleStartDate(date)}
                                                    placeholderText="mm-dd-yyyy"
                                                    required
                                                    className="add_width_input"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                                <Form.Label className="w-100 mb-0">
                                                    End Date<span className="text-danger">*</span>:
                                                </Form.Label>
                                                <DatePicker
                                                    selected={endDate}
                                                    disabled={startDate == '' || startDate == undefined}
                                                    required
                                                    onChange={(date) => handleEndDate(date)}
                                                    placeholderText="mm-dd-yyyy"
                                                    className="add_width_input"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='mb-0'>
                                                    Subtask Type<span className='text-danger'>*</span>
                                                </Form.Label>
                                                <select
                                                    style={{ border: '1px solid #a6b3c3' }}
                                                    name="type"
                                                    className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                                                    {...register('type', { required: true })}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled hidden>Select</option>
                                                    <option value="SubTask">SubTask</option>
                                                    <option value="Bug">Bug</option>
                                                </select>
                                                {errors.type && (
                                                    <div className="invalid-feedback">This field is required</div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='mb-0'>
                                                    Created By<span className='text-danger'>*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    defaultValue={userName}
                                                    disabled
                                                    style={{ border: '1px solid #a6b3c3' }}
                                                    {...register('subtaskCreator')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='mb-0'>
                                                    Attachment
                                                </Form.Label>
                                                <Form.Control
                                                    style={{ border: '1px solid #a6b3c3' }}
                                                    type='file'
                                                    {...register('uploadfile')}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Row>
                                            <Col className='text-center'>
                                                <Button type="submit" className='mybutton btn px-2 fw-bold py-1 mt-2 web_button'>{buttonChange ? 'Add' : 'Update'}</Button>
                                            </Col>
                                        </Row>
                                    </Row>
                                </form>
                            ) : connectComponent === 'Comments' ? (
                                <>
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <Row className="mt-2">
                                            <Col lg={10}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Add comment"
                                                        {...register('comment', { required: true })}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col className="m-0 p-0" lg={2}>
                                                <Button type="submit" className='bg-black border-0'>{buttonChange ? 'Add' : 'Update'}</Button>
                                            </Col>
                                        </Row>
                                    </form>
                                    <Row className='scrollable-content'>
                                        {getCommentData?.map((ele, ind) => (
                                            <ul style={{ listStyle: 'none' }}>
                                                <Row>
                                                    <Col lg={12} className="d-flex pt-2">
                                                        <Col lg={1} className="d-flex justify-content-start align-items-center">
                                                            <span
                                                                style={{
                                                                    backgroundColor: '#605e5a',
                                                                    borderRadius: '100%',
                                                                    padding: ' 10px',
                                                                    color: 'white',
                                                                    fontWeight: '800',
                                                                }}>
                                                                {ele?.userId?.firstName.charAt(0)}
                                                                {ele?.userId?.lastName.charAt(0)}
                                                            </span>
                                                        </Col>
                                                        <Col lg={11} className="m-0 p-0 d-flex flex-column justify-content-center">
                                                            <div className="d-flex align-items-center">
                                                                <h5 className="m-0 p-0"> {ele?.userId?.firstName} {ele?.userId?.lastName}</h5>
                                                                <p className="ps-1 m-0 p-0 ">
                                                                    ( {moment(ele?.createdAt).fromNow()} )
                                                                </p>
                                                            </div>
                                                            <div className="m-0 p-0">
                                                                <li className="font-18">{ele?.comment}</li>
                                                            </div>
                                                            <div className="d-flex m-0 p-0">
                                                                <p className=" p-0 mb-0" onClick={() => handelUpdate(ele)}>
                                                                    Edit
                                                                </p>
                                                            </div>
                                                        </Col>
                                                    </Col>
                                                </Row>
                                            </ul>
                                        ))}
                                    </Row>
                                </>
                            ) : connectComponent === 'History' ? (
                                <div className="d-flex flex-column justify-content-center my-2">
                                    {historyResponse && historyResponse?.map((item, index) => (
                                        <div key={index} className='d-flex gap-2 align-items-center lh-lg'>
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip id="tooltip1">
                                                        {item?.userId?.firstName}
                                                        {item?.userId?.lastName}
                                                    </Tooltip>
                                                }>
                                                <div className="mt-1 cp">
                                                    <span
                                                        style={{
                                                            backgroundColor: '#605e5a',
                                                            borderRadius: '100%',
                                                            padding: '5px 6px',

                                                            color: 'white',
                                                            fontWeight: '700',
                                                        }}>
                                                        {item?.userId?.firstName.charAt(0).toUpperCase()}
                                                        {item?.userId?.lastName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </OverlayTrigger>
                                            <Link to={generateLink(item?.userActivity, item)}
                                                className='text-dark'>
                                                <span>
                                                    {item?.userId?.firstName} {item?.userId?.lastName}
                                                    {item?.userActivity === "Created milestone" && <span> created milestone</span>}
                                                    {item?.userActivity === "Created Sprint" && <span> created sprint</span>}
                                                    {item?.userActivity === "Create Project" && <span> create project</span>}
                                                    {item?.userActivity === "Created Task" && <span> created task</span>}
                                                    {' on ' + item?.createdAt}
                                                </span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : connectComponent === 'Bugs' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <Table className="mb-0 add_Color_font text-nowrap w-100 " striped>
                                        <thead className=''>
                                            <tr>
                                                <th className='fw-bold'>#</th>
                                                <th className='fw-bold'>Summary</th>
                                                <th className='fw-bold'>Decription</th>
                                                <th className='fw-bold'>Assignee</th>
                                                <th className='fw-bold'>Assigned By</th>
                                                <th className='fw-bold'>Priority</th>
                                                <th className='fw-bold'>Status</th>
                                                <th className='fw-bold'>Technology</th>
                                                <th className='fw-bold'>Reporter</th>
                                                <th className='fw-bold'>Start Date</th>
                                                <th className='fw-bold'>End Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bugsResponse && bugsResponse?.map((bug, ind) => {
                                                return (
                                                    <tr className="align-middle">
                                                        <th>{ind + 1}</th>
                                                        <td>
                                                            <span title={bug?.summary}>
                                                                {bug?.summary ? bug?.summary?.slice(0, 7).charAt(0).toUpperCase() + bug?.summary?.(1, 7) : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span title={bug?.description}>{bug?.description?.slice(0, 10)}</span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.assigneeInfo?.firstName} {editData?.assigneeInfo?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {bug?.createdBy?.firstName} {bug?.createdBy?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {bug?.priority}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.status == 1 ? 'To-Do' : ''}
                                                                {editData?.status == 2 ? 'In-Progress' : ''}
                                                                {editData?.status == 3 ? 'Hold' : ''}
                                                                {editData?.status == 4 ? 'Done' : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.technology?.name}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.reporterInfo?.firstName} {editData?.reporterInfo?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {bug?.startDate?.slice(0, 10)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {bug?.dueDate?.slice(0, 10)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : connectComponent === 'Subtask' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <Table className="mb-0 add_Color_font text-nowrap w-100 " striped>
                                        <thead className=''>
                                            <tr>
                                                <th className='fw-bold'>#</th>
                                                <th className='fw-bold'>Summary</th>
                                                <th className='fw-bold'>Decription</th>
                                                <th className='fw-bold'>Assignee</th>
                                                <th className='fw-bold'>Assigned By</th>
                                                <th className='fw-bold'>Priority</th>
                                                <th className='fw-bold'>Status</th>
                                                <th className='fw-bold'>Technology</th>
                                                <th className='fw-bold'>Reporter</th>
                                                <th className='fw-bold'>Start Date</th>
                                                <th className='fw-bold'>End Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subtaskResponse && subtaskResponse?.map((sub, ind) => {
                                                return (
                                                    <tr className="align-middle">
                                                        <th>{ind + 1}</th>
                                                        <td>
                                                            <span title={sub?.summary}>
                                                                {sub?.summary ? sub?.summary?.slice(0, 7).charAt(0).toUpperCase() + sub?.summary?.slice(1, 7) : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span title={sub?.description}>{sub?.description?.slice(0, 10)}</span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.assigneeInfo?.firstName} {editData?.assigneeInfo?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {sub?.createdBy?.firstName} {sub?.createdBy?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {sub?.priority}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.status == 1 ? 'To-Do' : ''}
                                                                {editData?.status == 2 ? 'In-Progress' : ''}
                                                                {editData?.status == 3 ? 'Hold' : ''}
                                                                {editData?.status == 4 ? 'Done' : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.technology?.name}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {editData?.reporterInfo?.firstName} {editData?.reporterInfo?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {sub?.startDate?.slice(0, 10)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {sub?.dueDate?.slice(0, 10)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                ''
                            )}
                        </Col>
                        <Col lg={4}>
                            <div className="table-responsive">
                                <table className="table lh-sm table-borderless" style={{ fontSize: '14px' }} >
                                    <tbody className='text-start'>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Project Name :</th>
                                            <td>{editData?.projects?.projectName}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Milestone Name :</th>
                                            <td>{editData?.milestones?.title}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Sprint Name :</th>
                                            <td>{editData?.sprints?.sprintName}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Summary :</th>
                                            <td>   {editData?.summary ? editData?.summary?.slice(0, 10).charAt(0).toUpperCase() + editData?.summary?.slice(1, 20) : ''}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Start Date :</th>
                                            <td>{editData?.startDate ? moment(editData?.startDate).format('DD/MM/YYYY') : ''}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>End Date :</th>
                                            <td>{editData?.dueDate ? moment(editData?.dueDate).format('DD/MM/YYYY') : ''}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Assignee :</th>
                                            <td>{editData?.assigneeInfo?.firstName} {editData?.assigneeInfo?.lastName}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Technology :</th>
                                            <td>{editData?.technology?.name} </td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Reporter :</th>
                                            <td>{editData?.reporterInfo?.firstName} {editData?.reporterInfo?.lastName}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Priority :</th>
                                            <td class="fw-bold">{editData?.priority}</td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold text-nowrap' style={{ width: 'fit-content', }}>Status :</th>
                                            <td>
                                                {editData?.status == 1 ? 'To-Do' : ''}
                                                {editData?.status == 2 ? 'In-Progress' : ''}
                                                {editData?.status == 3 ? 'Hold' : ''}
                                                {editData?.status == 4 ? 'Done' : ''}
                                            </td>
                                        </tr>
                                        <tr className='text-start'>
                                            <th className='fw-bold'>Description:</th>
                                            <div style={{ maxHeight: '7rem', overflowY: 'scroll' }}>
                                                <td>
                                                    {editData?.description}
                                                </td>
                                            </div>
                                        </tr>
                                        {editData?.attachment !== '' ? (
                                            <tr className='text-start'>
                                                <th className='fw-bold' style={{ width: 'fit-content', }}>Attachment:</th>
                                                <td>
                                                    <a href={editData?.attachment} download target="_blank">
                                                        <i class="dripicons-download download_color"></i>
                                                    </a>
                                                    <img style="width: 10rem; height: 10rem;" class="img_style ps-1" src={editData?.attachmentType !== 'application/pdf' ? editData?.attachment : pdfImage} />
                                                </td>
                                            </tr>
                                        ) : (
                                            ''
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </Col>
                    </Row>
                </Modal.Body >
            </Modal >
        </>
    );
};

export default TaskDetailPage;
