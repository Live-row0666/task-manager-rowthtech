import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Row, Col, Card, Button, Alert, CloseButton, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    addComment,
    getComment,
    updateComment,
    deleteComment,
    getSubTask,
    getBugs,
    getHistoryAction,
    addCommentReset,
    updateCommentReset,
} from '../../../redux/addcomment/actions';
import Attachments from '../../../apps/Tasks/Details/Attachments';
import { Link } from 'react-router-dom';
import { IoCloseSharp } from 'react-icons/io5';
import ToastHandle from '../../../constants/toaster/toaster';
import { CircularProgress } from '@mui/material';
import { ImCancelCircle } from 'react-icons/im';

const Taskdetail = (props) => {
    const { item, commentData } = props;
    // console.log(item, 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const bugsdata = store?.getBugsReducer?.data?.response;
    // console.log(bugsdata, 'bugsdata')
    const [inputForUpdate, setInputForUpdate] = useState('');
    const [allCommetUpdateId, setAllCommetUpdateId] = useState('');
    const [updatedCommentInitialValue, setUpdatedCommentInitialValue] = useState('');
    // console.log(updatedCommentInitialValue, 'updatedCommentInitialValue')
    const [error, setError] = useState('');
    const [connectComponent, setConnectComponent] = useState('All');
    const [buttonChange, setButtonChange] = useState(true);
    const [commentId, setCommentId] = useState();
    const [historyResponse, setHistoryResponse] = useState(null);
    const getAllComment = store?.getAllComment?.data?.response;
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm();
    const [apiCall, setApiCall] = useState(false);

    useEffect(() => {
        if (connectComponent == 'Bugs') {
            dispatch(getBugs({ taskId, type: 'Bug' }));
        } else if (connectComponent == 'Subtask') {
            dispatch(getSubTask({ taskId, type: 'SubTask' }));
        } else if (connectComponent == 'Comments') {
            dispatch(getComment({ taskId: props?.item?._id }));
        }
    }, [connectComponent, apiCall]);
    const [taskId, setTaskId] = useState('');
    // alert(props.item._id)
    const connectComponentCheck = (type) => {
        setConnectComponent(type);
        setValue('comment', '');
        setValue('history', '');
        setValue('subtasks', '');
        setButtonChange(true);
        if (type === 'History') {
            dispatch(getHistoryAction({ taskId: props.item._id }));
        }
        const taskId = props?.item?._id;
        setTaskId(taskId);
        // dispatch(getBugs({ taskId, type: 'Bug' }));
        // dispatch(getSubTask({ taskId, type: 'SubTask' }));
        // dispatch(getComment({ taskId: props?.item?._id }));
    };

    const [isUpdate, setIsUpdate] = useState(false);
    const addCommentReducer = store?.addComments;

    console.log(addCommentReducer, 'addCommentReducer');
    useEffect(() => {
        if (addCommentReducer?.data?.status) {
            if (addCommentReducer?.data?.status == 200) {
                ToastHandle('success', addCommentReducer?.data?.message);
                setApiCall((prev) => !prev);
            } else {
                ToastHandle('error', addCommentReducer?.data?.message);
            }
            dispatch(addCommentReset());
        }
    }, [addCommentReducer]);
    const updateCommentReducer = store?.updateComment;
    console.log(updateCommentReducer, 'updateCommentReducer');
    useEffect(() => {
        if (updateCommentReducer?.data?.status) {
            if (updateCommentReducer?.data?.status == 200) {
                ToastHandle('success', updateCommentReducer?.data?.message);
                setApiCall((prev) => !prev);
            } else {
                ToastHandle('error', updateCommentReducer?.data?.message);
            }
            dispatch(updateCommentReset());
        }
    }, [updateCommentReducer?.data?.status]);
    const onSubmit = (e) => {
        if (buttonChange) {
            const commentData = {
                userId: props.userId,
                taskId: props.item?._id,
                comment: e.comment,
            };
            // let bodyTask = props?.item?.taskId
            // console.log({bodyTask})
            dispatch(addComment(commentData));
            // dispatch(getComment({ taskId: props?.item?._id }));
        } else {
            dispatch(updateComment({ commentId: commentId, comment: e?.comment }));
            setButtonChange(true);
            // dispatch(getComment({ taskId: props?.item?._id }));
        }
        setValue('comment', '');
    };

    useEffect(() => {
        const historyData = store?.getHistoryReducer?.data?.response;
        if (historyData) {
            setHistoryResponse(historyData);
        }

        // dispatch(getComment({taskId:props?.item?._id}));
    }, [store?.getHistoryReducer?.data?.response]);

    const handelUpdate = (data) => {
        setCommentId(data?._id);
        setValue('comment', data?.comment);
        setButtonChange(false);
    };

    const downloadFile = (file) => {
        fetch(file).then((response) => {
            response.blob().then((blob) => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = getfileNameFromUrl(file);
                alink.click();
            });
        });
    };
    const getfileNameFromUrl = (url) => {
        var filename = '';
        if (url != '') {
            filename = new URL(url).pathname.split('/').pop();
            getfileNameExt(url);
        }

        return filename;
    };
    const getfileNameExt = (url) => {
        var ext = '';
        if (url != '') {
            ext = new URL(url).pathname.split('.').pop();
        }
        return ext;
    };

    const DeleteData = (id) => {
        console.log(id);
        dispatch(deleteComment({ commentId: id._id }));
        // setTimeout(() => {
        //     dispatch(getComment(item?.taskId));
        // }, 500);
    };
    // console.log(updatedCommentValue, 'data===');
    const updateHandle = (condition) => {
        if (updatedCommentInitialValue !== '') {
            if (condition === 'updateComment') {
                let body = {
                    taskId: item?.taskId,
                    commentId: allCommetUpdateId,
                    comment: updatedCommentInitialValue,
                };
                dispatch(updateComment(body));
                setInputForUpdate(false);
            } else {
                setInputForUpdate(false);
            }
        } else {
            setError('This field is required');
            setInputForUpdate(false);
        }
    };
    function generateLink(userActivity, item) {
        switch (userActivity) {
            case 'Created milestone':
                return `/dashboard/projects/projectId=${item?.sprintId?.projectId}`;
            case 'Created Sprint':
                return `/dashboard/singleMilestonesprint/projectId=${item?.sprintId?.projectId}/${item?.milestoneId?._id}`;
            case 'Created Task':
                return `/dashboard/taskBoard=${item?.sprintId?.projectId}&milestoneId=${item?.milestoneId?._id}&spriteId=${item?.sprintId?._id}`;
            case 'Create Project':
                return '/dashboard/projects';
            default:
                return '/dashboard/adminsummary';
        }
    }
    useEffect(() => {
        if (props.show) {
            setConnectComponent('All');
        }
    }, [props.show]);

    return (
        <>
            <Modal show={props.show} size={'xl'} onHide={props.closeTaskDetailMOdel}>
                <Modal.Header>
                    <div className="row">
                        <div className="col-12">
                            <button onClick={props.closeTaskDetailMOdel}>
                                <IoCloseSharp />
                            </button>
                        </div>
                        <div className="col-12 text-center">
                            Task Detail :{' '}
                            {props?.item?.summary
                                ? props?.item.summary.charAt(0).toUpperCase() + props?.item.summary.slice(1, 50)
                                : ''}
                        </div>
                    </div>
                    {/* <Modal.Title id="" className="text-start text-dark modal_titles"> */}
                    {/* </Modal.Title> */}
                </Modal.Header>
                <Modal.Body className="cardinfo">
                    <div className="row w-100">
                        <Col lg={8}>
                            <h4 className="modal_titles">Activity</h4>
                            <Row>
                                <Col lg={12} className="d-flex align-items-center gap-1">
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('All');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'All' ? 'active-button-tdp' : 'inactive-button-tdp'
                                            }`}>
                                        <span>
                                            <i class="bi bi-people-fill "></i>
                                        </span>{' '}
                                        All
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('Comments');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'Comments'
                                            ? 'active-button-tdp'
                                            : 'inactive-button-tdp'
                                            }`}>
                                        <span>
                                            <i class="bi bi-chat-right-text-fill"></i>
                                        </span>{' '}
                                        Comments
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('History');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'History' ? 'active-button-tdp' : 'inactive-button-tdp'
                                            }`}>
                                        <span>
                                            <i class="bi bi-clock-history"></i>
                                        </span>{' '}
                                        History
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('Bugs');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'Bugs' ? 'active-button-tdp' : 'inactive-button-tdp'
                                            }`}>
                                        <span>
                                            <i class="bi bi-bug-fill"></i>
                                        </span>{' '}
                                        Bugs
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            connectComponentCheck('Subtask');
                                        }}
                                        className={`mybutton btn px-2 fw-bold py-1  web_button ${connectComponent === 'Subtask' ? 'active-button-tdp' : 'inactive-button-tdp'
                                            }`}>
                                        <span>
                                            <i class="bi bi-check-square-fill"></i>
                                        </span>{' '}
                                        SubTask
                                    </Button>
                                </Col>
                            </Row>
                            {connectComponent === 'All' ? (
                                <div
                                    style={{
                                        maxHeight: '400px',
                                        msOverflowStyle: 'none',
                                        overflowY: 'scroll',
                                        scrollbarWidth: 'none',
                                    }}>
                                    <Row>
                                        {store?.getAllComment?.data?.response?.map((ele, ind) => (
                                            <ul className="m-0 p-0" key={ind} style={{ listStyle: 'none' }}>
                                                <Row className="mx-auto m-0 p-0">
                                                    <Col lg={12} className="d-flex pt-2">
                                                        <Col lg={2} className="pt-2 m-0">
                                                            <span
                                                                className="rounded-circle py-1 px-1 text-white"
                                                                style={{
                                                                    backgroundColor: '#605e5a',
                                                                }}>
                                                                {ele?.userId?.firstName.charAt(0)}
                                                                {ele?.userId?.lastName.charAt(0)}
                                                            </span>
                                                        </Col>
                                                        <Col lg={10} className="m-0 p-0">
                                                            <div className="d-flex">
                                                                <h4 className="m-0 p-0"> {ele?.userId?.firstName}</h4>
                                                                <h4 className="ps-1 m-0 p-0">
                                                                    {' '}
                                                                    {ele?.userId?.lastName}
                                                                </h4>
                                                                <p className="ps-1 m-0 p-0">
                                                                    {moment(ele?.createdAt).fromNow()}{' '}
                                                                </p>
                                                            </div>
                                                            <div className="m-0 p-0" title={ele?.comment}>
                                                                <p>
                                                                    {ele?.comment
                                                                        ? ele?.comment
                                                                            .slice(0, 10)
                                                                            .charAt(0)
                                                                            .toUpperCase() + ele?.comment.slice(1)
                                                                        : ''}
                                                                </p>
                                                            </div>
                                                            <div className="d-flex m-0 p-0">
                                                                <button
                                                                    className="btn py-0 px-1 btn-secondary"
                                                                    onClick={() => setIsUpdate(true)}>
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </Col>
                                                    </Col>
                                                </Row>
                                            </ul>
                                        ))}
                                    </Row>
                                    <Row>
                                        <div className="d-flex flex-column justify-content-center my-2">
                                            {historyResponse &&
                                                historyResponse.map((item, index) => (
                                                    <div key={index} className="d-flex gap-2 align-items-center lh-lg">
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={
                                                                <Tooltip id="tooltip1">
                                                                    {item?.time}
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
                                                        <Link
                                                            to={generateLink(item.userActivity, item)}
                                                            className="text-dark">
                                                            <span>
                                                                {item?.userId?.firstName} {item?.userId?.lastName}
                                                                {item.userActivity === 'Created milestone' && (
                                                                    <span> created milestone</span>
                                                                )}
                                                                {item.userActivity === 'Created Sprint' && (
                                                                    <span> created sprint</span>
                                                                )}
                                                                {item.userActivity === 'Create Project' && (
                                                                    <span> create project</span>
                                                                )}
                                                                {item.userActivity === 'Created Task' && (
                                                                    <span> created task</span>
                                                                )}
                                                                {' on ' + item?.createdAt}
                                                            </span>
                                                        </Link>
                                                    </div>
                                                ))}
                                        </div>
                                    </Row>
                                    <Row>
                                        <div style={{ overflowX: 'auto' }}>
                                            <Table className="mb-0 add_Color_font text-nowrap w-100" striped>
                                                <thead>
                                                    <tr>
                                                        {/* <th className='fw-bold'>#</th> */}
                                                        <th className="fw-bold">Type</th>
                                                        <th className="fw-bold">Summary</th>
                                                        <th className="fw-bold">Decription</th>
                                                        <th className="fw-bold">Assignee</th>
                                                        <th className="fw-bold">Priority</th>

                                                        <th className="fw-bold">Status</th>
                                                        <th className="fw-bold">Technology</th>
                                                        <th className="fw-bold">Reporter</th>
                                                        <th className="fw-bold">Start Date</th>
                                                        <th className="fw-bold">End Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {store?.getSubTaskReducer?.data?.response?.map((sub, ind) => {
                                                        return (
                                                            <tr className="align-middle">
                                                                {/* <th>{ind + 1}</th> */}
                                                                <th>SubTask</th>
                                                                <td>
                                                                    <span title={sub?.summary}>
                                                                        {sub?.summary
                                                                            ? sub.summary
                                                                                .slice(0, 7)
                                                                                .charAt(0)
                                                                                .toUpperCase() +
                                                                            sub.summary.slice(1, 7)
                                                                            : ''}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span title={sub?.description}>
                                                                        {sub?.description.slice(0, 10)}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>
                                                                        {props?.item?.assigneeInfo?.firstName}{' '}
                                                                        {props?.item?.assigneeInfo?.lastName}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>{sub?.priority}</span>
                                                                </td>
                                                                <td>
                                                                    <span>
                                                                        {props?.item?.status == 1 ? 'To-Do' : ''}
                                                                        {props?.item?.status == 2 ? 'In-Progress' : ''}
                                                                        {props?.item?.status == 3 ? 'Hold' : ''}
                                                                        {props?.item?.status == 4 ? 'Done' : ''}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>{props?.item?.technology?.name}</span>
                                                                </td>
                                                                <td>
                                                                    <span>
                                                                        {props?.item?.reporterInfo?.firstName}{' '}
                                                                        {props?.item?.reporterInfo?.lastName}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>{sub?.startDate.slice(0, 10)}</span>
                                                                </td>
                                                                <td>
                                                                    <span>{sub?.dueDate.slice(0, 10)}</span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                                <tbody>
                                                    {bugsdata?.map((bug, ind) => {
                                                        return (
                                                            <tr className="align-middle">
                                                                {/* <th>{ind + 1}</th> */}
                                                                <th>Bug</th>

                                                                <td>
                                                                    <span title={bug?.summary}>
                                                                        {bug?.summary
                                                                            ? bug.summary
                                                                                .slice(0, 7)
                                                                                .charAt(0)
                                                                                .toUpperCase() +
                                                                            bug.summary.slice(1, 7)
                                                                            : ''}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span title={bug?.description}>
                                                                        {bug?.description.slice(0, 10)}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>
                                                                        {props?.item?.assigneeInfo?.firstName}{' '}
                                                                        {props?.item?.assigneeInfo?.lastName}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>{bug?.priority}</span>
                                                                </td>
                                                                <td>
                                                                    <span>
                                                                        {props?.item?.status == 1 ? 'To-Do' : ''}
                                                                        {props?.item?.status == 2 ? 'In-Progress' : ''}
                                                                        {props?.item?.status == 3 ? 'Hold' : ''}
                                                                        {props?.item?.status == 4 ? 'Done' : ''}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>{props?.item?.technology?.name}</span>
                                                                </td>
                                                                <td>
                                                                    <span>
                                                                        {props?.item?.reporterInfo?.firstName}{' '}
                                                                        {props?.item?.reporterInfo?.lastName}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span>{bug?.startDate.slice(0, 10)}</span>
                                                                </td>
                                                                <td>
                                                                    <span>{bug?.dueDate.slice(0, 10)}</span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Row>
                                </div>
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
                                                    {errors.comment?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}

                                                    {/* {errors.comment?.type === 'pattern' && (
                                            <span className="text-danger"> Empty fields are not allowed</span>
                                        )} */}
                                                </Form.Group>
                                            </Col>
                                            <Col className="m-0 p-0" lg={2}>
                                                {buttonChange ? (
                                                    <Button
                                                        disabled={addCommentReducer?.loading}
                                                        type="submit"
                                                        className="bg-black border-0">
                                                        {addCommentReducer?.loading ? <CircularProgress /> : 'Add'}
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            disabled={addCommentReducer?.loading}
                                                            type="submit"
                                                            className="bg-black border-0">
                                                            Update
                                                        </Button>
                                                        <ImCancelCircle
                                                            style={{
                                                                marginLeft: 2,
                                                            }}
                                                            onClick={() => {
                                                                setButtonChange(true);
                                                                setValue('comment', '');
                                                            }}
                                                            cursor={'pointer'}
                                                            size={20}
                                                        />
                                                    </>
                                                )}
                                            </Col>
                                        </Row>
                                    </form>
                                    <Row
                                        style={{
                                            overflowY: 'scroll',
                                            height: '65vh',
                                        }}>
                                        {getAllComment &&
                                            getAllComment.map((ele, ind) => (
                                                <ul key={ind} style={{ listStyle: 'none' }}>
                                                    <Row>
                                                        <Col lg={12} className="d-flex pt-2">
                                                            <Col sm={1} className="pt-2">
                                                                <span
                                                                    style={{
                                                                        backgroundColor: '#605e5a',
                                                                        borderRadius: '100%',
                                                                        padding: '10px 10px',
                                                                        color: 'white',
                                                                        fontWeight: '800',
                                                                    }}>
                                                                    {ele?.userId?.firstName.charAt(0).toUpperCase()}
                                                                    {ele?.userId?.lastName.charAt(0).toUpperCase()}
                                                                </span>
                                                            </Col>
                                                            <Col sm={11} className="m-0 p-0">
                                                                <div className="d-flex">
                                                                    <h4 className="m-0 fs-5 p-0">
                                                                        {' '}
                                                                        {ele?.userId?.firstName.charAt().slice()}{' '}
                                                                        {ele?.userId?.firstName
                                                                            ? ele?.userId?.firstName
                                                                                .slice(0, 7)
                                                                                .charAt()
                                                                                .toUpperCase() +
                                                                            ele?.userId?.firstName.slice(1, 7)
                                                                            : ''}
                                                                    </h4>
                                                                    <h4 className="ps-1 fs-5 m-0 p-0">
                                                                        {' '}
                                                                        {ele?.userId?.firstName.charAt().slice()}{' '}
                                                                        {ele?.userId?.lastName
                                                                            ? ele?.userId?.lastName
                                                                                .slice(0, 7)
                                                                                .charAt(0)
                                                                                .toUpperCase() +
                                                                            ele?.userId?.lastName.slice(1, 7)
                                                                            : ''}
                                                                    </h4>
                                                                    <p className="ps-1 m-0 p-0">
                                                                        {moment(ele?.createdAt).fromNow()}{' '}
                                                                    </p>
                                                                </div>
                                                                <div className="m-0 p-0" title={ele?.comment}>
                                                                    <p>
                                                                        {ele?.comment
                                                                            ? ele?.comment
                                                                                .slice(0, 10)
                                                                                .charAt(0)
                                                                                .toUpperCase() + ele?.comment.slice(1)
                                                                            : ''}
                                                                    </p>
                                                                </div>
                                                                <div className="d-flex m-0 p-0">
                                                                    <button
                                                                        className="btn py-0 px-1 btn-secondary"
                                                                        onClick={() => handelUpdate(ele)}>
                                                                        Edit
                                                                    </button>
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
                                    {historyResponse &&
                                        historyResponse.map((item, index) => (
                                            <div key={index} className="d-flex gap-2 align-items-center lh-lg">
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip id="tooltip1">
                                                            {item?.time}
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
                                                <Link to={generateLink(item.userActivity, item)} className="text-dark">
                                                    <span>
                                                        {item?.userId?.firstName} {item?.userId?.lastName}
                                                        {item.userActivity === 'Created milestone' && (
                                                            <span> created milestone</span>
                                                        )}
                                                        {item.userActivity === 'Created Sprint' && (
                                                            <span> created sprint</span>
                                                        )}
                                                        {item.userActivity === 'Create Project' && (
                                                            <span> create project</span>
                                                        )}
                                                        {item.userActivity === 'Created Task' && (
                                                            <span> created task</span>
                                                        )}
                                                        {' on ' + item?.createdAt}
                                                    </span>
                                                </Link>
                                            </div>
                                        ))}
                                </div>
                            ) : connectComponent === 'Subtask' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <Table className="mb-0 add_Color_font text-nowrap w-100 " striped>
                                        <thead className="">
                                            <tr>
                                                <th className="fw-bold">#</th>
                                                <th className="fw-bold">Summary</th>
                                                <th className="fw-bold">Decription</th>
                                                <th className="fw-bold">Assignee</th>
                                                <th className="fw-bold">Priority</th>
                                                <th className="fw-bold">Status</th>
                                                <th className="fw-bold">Technology</th>
                                                <th className="fw-bold">Reporter</th>
                                                <th className="fw-bold">Start Date</th>
                                                <th className="fw-bold">End Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {store?.getSubTaskReducer?.data?.response?.map((sub, ind) => {
                                                return (
                                                    <tr className="align-middle">
                                                        <th>{ind + 1}</th>

                                                        <td>
                                                            <span title={sub?.summary}>
                                                                {sub?.summary
                                                                    ? sub.summary.slice(0, 7).charAt(0).toUpperCase() +
                                                                    sub.summary.slice(1, 7)
                                                                    : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span title={sub?.description}>
                                                                {sub?.description.slice(0, 10)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {props?.item?.assigneeInfo?.firstName}{' '}
                                                                {props?.item?.assigneeInfo?.lastName}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span>{sub?.priority}</span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {props?.item?.status == 1 ? 'To-Do' : ''}
                                                                {props?.item?.status == 2 ? 'In-Progress' : ''}
                                                                {props?.item?.status == 3 ? 'Hold' : ''}
                                                                {props?.item?.status == 4 ? 'Done' : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>{props?.item?.technology?.name}</span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {props?.item?.reporterInfo?.firstName}{' '}
                                                                {props?.item?.reporterInfo?.lastName}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span>{sub?.startDate.slice(0, 10)}</span>
                                                        </td>
                                                        <td>
                                                            <span>{sub?.dueDate.slice(0, 10)}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : connectComponent === 'Bugs' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <Table className="mb-0 add_Color_font text-nowrap w-100" striped>
                                        <thead>
                                            <tr>
                                                <th className="fw-bold">#</th>
                                                <th className="fw-bold">Summary</th>
                                                <th className="fw-bold">Decription</th>
                                                <th className="fw-bold">Assignee</th>
                                                <th className="fw-bold">Priority</th>
                                                <th className="fw-bold">Status</th>
                                                <th className="fw-bold">Technology</th>
                                                <th className="fw-bold">Reporter</th>
                                                <th className="fw-bold">Start Date</th>
                                                <th className="fw-bold">End Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bugsdata?.map((bug, ind) => {
                                                return (
                                                    <tr className="align-middle">
                                                        <th>{ind + 1}</th>

                                                        <td>
                                                            <span title={bug?.summary}>
                                                                {bug?.summary
                                                                    ? bug.summary.slice(0, 7).charAt(0).toUpperCase() +
                                                                    bug.summary.slice(1, 7)
                                                                    : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span title={bug?.description}>
                                                                {bug?.description.slice(0, 10)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {props?.item?.assigneeInfo?.firstName}{' '}
                                                                {props?.item?.assigneeInfo?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>{bug?.priority}</span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {props?.item?.status == 1 ? 'To-Do' : ''}
                                                                {props?.item?.status == 2 ? 'In-Progress' : ''}
                                                                {props?.item?.status == 3 ? 'Hold' : ''}
                                                                {props?.item?.status == 4 ? 'Done' : ''}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>{props?.item?.technology?.name}</span>
                                                        </td>
                                                        <td>
                                                            <span>
                                                                {props?.item?.reporterInfo?.firstName}{' '}
                                                                {props?.item?.reporterInfo?.lastName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span>{bug?.startDate.slice(0, 10)}</span>
                                                        </td>
                                                        <td>
                                                            <span>{bug?.dueDate.slice(0, 10)}</span>
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
                        <Col lg={4} className=" ">
                            <div className="table-responsive">
                                <table className="table lh-sm table-borderless" style={{ fontSize: '14px' }}>
                                    <tbody className="text-start">
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Project Name :
                                            </th>
                                            <td>{props?.item?.projects?.projectName}</td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Milestone Name :
                                            </th>
                                            <td>{props?.item?.milestones?.title}</td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Sprint Name :
                                            </th>
                                            <td>{props?.item?.sprints?.sprintName}</td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Summary :
                                            </th>
                                            <td title={item?.summary}>
                                                {props?.item?.summary
                                                    ? props?.item.summary.slice(0, 10).charAt(0).toUpperCase() +
                                                    props?.item.summary.slice(1, 10)
                                                    : ''}
                                            </td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Start Date :
                                            </th>
                                            <td>
                                                {props?.item?.startDate
                                                    ? moment(props?.item?.startDate).format('DD/MM/YYYY')
                                                    : ''}
                                            </td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                End Date :
                                            </th>
                                            <td>
                                                {props?.item?.dueDate
                                                    ? moment(props?.item?.dueDate).format('DD/MM/YYYY')
                                                    : ''}
                                            </td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Assignee :
                                            </th>
                                            <td>
                                                {props?.item?.assigneeInfo?.firstName}{' '}
                                                {props?.item?.assigneeInfo?.lastName}
                                            </td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Technology :
                                            </th>
                                            <td>{props?.item?.technology?.name} </td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Reporter :
                                            </th>
                                            <td>
                                                {props?.item?.reporterInfo?.firstName}{' '}
                                                {props?.item?.reporterInfo?.lastName}
                                            </td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Priority :
                                            </th>
                                            <td class="fw-bold">{props?.item?.priority}</td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold text-nowrap" style={{ width: 'fit-content' }}>
                                                Status :
                                            </th>
                                            <td>
                                                {props?.item?.status == 1 ? 'To-Do' : ''}
                                                {props?.item?.status == 2 ? 'In-Progress' : ''}
                                                {props?.item?.status == 3 ? 'Hold' : ''}
                                                {props?.item?.status == 4 ? 'Done' : ''}
                                            </td>
                                        </tr>
                                        <tr className="text-start">
                                            <th className="fw-bold">Description:</th>
                                            <div style={{ maxHeight: '7rem', overflowY: 'scroll' }}>
                                                <td>
                                                    {props?.item?.description}
                                                    {/* </span> */}
                                                </td>
                                            </div>
                                        </tr>
                                        {props?.item?.attachment !== '' ? (
                                            <tr className="text-start">
                                                <th className="fw-bold" style={{ width: 'fit-content' }}>
                                                    Attachment:
                                                </th>
                                                <td>
                                                    <a href={props?.item?.attachment} download target="_blank">
                                                        <i class="dripicons-download download_color"></i>
                                                    </a>
                                                    {/* <img style="width: 10rem; height: 10rem;" class="img_style ps-1" src={props?.item?.attachmentType !== 'application/pdf' ? props?.item?.attachment : pdfImage} /> */}
                                                </td>
                                            </tr>
                                        ) : (
                                            ''
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Col>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Taskdetail;
