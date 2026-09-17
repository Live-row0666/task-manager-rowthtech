import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, getComment, gettaskId, getBugs, getSubTask, getsingleSprintTask } from '../../../redux/task/action';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import UpdateTask from './update';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import TaskDetailPage from './taskDetailPage';

import Pagesaddtask from '../../../layouts/AllPagesRightbar';
import DescriptionOffCanvas from '../../../components/DescriptionOffCanvas';
import TaskPreviewModal from '../taskDashboard/TaskPreviewModal';
import TimeDisplay from '../../../components/TimeDisplay';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0,123,255,0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0,123,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,123,255,0); }
`;

// Styled components
const TaskCardContainer = styled.div`
  perspective: 1000px;
  margin-bottom: 0.7rem;
`;

const TaskInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.4rem 0.8rem;
  min-height: 120px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  transform-style: preserve-3d;
 
  &:hover {
    transform: translateY(-3px) rotateX(1deg);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
  }

  animation: ${fadeIn} 0.3s ease-out;
`;

const PriorityBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
        switch (props.priority) {
            case 'Critical': return 'rgba(255, 71, 87, 0.1)';
            case 'High': return 'rgba(255, 165, 2, 0.1)';
            case 'Medium': return 'rgba(30, 144, 255, 0.1)';
            case 'Low': return 'rgba(46, 213, 115, 0.1)';
            default: return 'rgba(223, 228, 234, 0.5)';
        }
    }};
  color: ${props => {
        switch (props.priority) {
            case 'Critical': return '#ff4757';
            case 'High': return '#ffa502';
            case 'Medium': return '#1e90ff';
            case 'Low': return '#2ed573';
            default: return '#57606f';
        }
    }};
`;

const TimerButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => props.isPaused ? '#2ed573' : '#ffa502'};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const DropdownMenu = styled.ul`
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  border: none;
  overflow: hidden;
  animation: ${fadeIn} 0.2s ease-out;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  
  &:hover {
    background: ${props => props.danger ? 'rgba(255, 71, 87, 0.1)' : 'rgba(0, 123, 255, 0.1)'};
    color: ${props => props.danger ? '#ff4757' : '#007bff'};
  }
  
  i {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`;

const TaskCard = ({ item, projectId, closeModal, getValidMoves, progressTimeLoading, isInProgressColumn, timeTrackingData, onTaskDelete }) => {
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState();
    const [editData, setEditData] = useState();
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDetailPage, setOpenDetailPage] = useState(false);
    const [detailData, setDetailData] = useState();
    const [isHovered, setIsHovered] = useState(false);
    const [taskPreviewModal, setTaskPreviewModal] = useState(false);
    const [changesDone, setChangesDone] = useState(false);
    const [taskPreviewData, setTaskPreviewData] = useState(null);
    const [descriptionModal, setDescriptionModal] = useState(false);
    const store = useSelector((state) => state);

    const closeTaskPreview = () => {
        setTaskPreviewData(null);
        setTaskPreviewModal(false);
        if (changesDone) {
            dispatch(getsingleSprintTask({ projectId }));
        }
    }

    useEffect(() => {
        if (!taskPreviewModal && store?.UpdateTaskReducer?.data?.status === 200) {
            dispatch(getsingleSprintTask({ projectId }));
        }
    }, [taskPreviewModal, store?.UpdateTaskReducer?.data?.status])

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '00:00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formattedTime = timeTrackingData?.elapsedTime ? formatTime(timeTrackingData.elapsedTime) : '00:00:00';

    const deleteResponse = store?.deleteTask?.data?.status;
    const dispatch = useDispatch();

    const deleteData = (id) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const handelUpdate = (data) => {
        setEditData(data);
        setOpenEditModal(true);
    };

    const closeupdatemodal = (val) => {
        closeModal('render');
        setOpenEditModal(false);
    };

    const handleDetailPage = (data) => {
        setOpenDetailPage(true);
        setDetailData(data);
        dispatch(getComment({ taskId: data?.id }));
        dispatch(getBugs({ taskId: data?.id, type: "Bug" }));
        dispatch(getSubTask({ taskId: data?.id, type: "SubTask" }));
        dispatch(gettaskId(data?.id));
    };

    const closeDetailPage = () => {
        setOpenDetailPage(false);
    };

    useEffect(() => {
        if (deleteResponse === "200" && deleteResponse !== undefined) {
            onTaskDelete(item.id);
        }
    }, [deleteResponse]);

    const formatTimeToMs = (seconds) => {
        if (!seconds || isNaN(seconds)) return 0;
        return seconds * 1000; // Convert seconds to milliseconds
    };

    // Calculate elapsed time for paused tasks
    const calculatePausedElapsedTime = (timeData) => {
        if (!timeData || !timeData.startTime) return 0;
        
        const startTime = new Date(timeData.startTime);
        const currentTime = new Date();
        
        // If task has pause periods, calculate time until the last pause
        if (timeData.isPaused && timeData.pausePeriods && timeData.pausePeriods.length > 0) {
            const lastPauseStart = new Date(timeData.pausePeriods[timeData.pausePeriods.length - 1].startTime);
            const elapsedMs = lastPauseStart - startTime - (timeData.totalPausedTime || 0);
            return Math.max(0, elapsedMs);
        }
        
        // If not paused, calculate normal elapsed time
        const elapsedMs = currentTime - startTime - (timeData.totalPausedTime || 0);
        return Math.max(0, elapsedMs);
    };

    const elapsedTimeMs = timeTrackingData?.elapsedTime ? 
        formatTimeToMs(timeTrackingData.elapsedTime) : 
        (timeTrackingData?.isPaused ? calculatePausedElapsedTime(timeTrackingData) : 0);

    return (
        <>
            <TaskCardContainer
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <TaskInformation
                    priority={item?.priority}
                    // onClick={() => handleDetailPage(item)}
                    className="cp"
                >
                    <div className="row">
                        <div
                            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)' }}
                            className="col-12 pe-0 d-flex gap-1">
                            <div className="w-75 d-flex gap-1">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Priority</Tooltip>}
                                >
                                    <PriorityBadge priority={item?.priority}>
                                        {item?.priority || 'No Priority'}
                                    </PriorityBadge>
                                </OverlayTrigger>
                                {moment(item?.dueDate).isBefore(moment()) &&
                                    (item?.status === 'In Progress' || item?.status === 'To Do' || item?.status === 'Testing') ? (
                                    <span
                                        className="text-danger"
                                        style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '20px',
                                            fontSize: '0.5rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            background: 'rgba(220, 53, 69, 0.1)',
                                        }}
                                    >
                                        Overdue
                                    </span>) : (
                                    <span
                                        className="text-success"
                                        style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '20px',
                                            fontSize: '0.5rem',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            background: 'rgba(0, 255, 38, 0.1)',
                                        }}
                                    >
                                        On Time
                                    </span>
                                )}
                            </div>
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Due Date</Tooltip>}
                            >
                                <div className="w-25 text-end pe-2">
                                    <small className='w-100'>
                                        {item?.dueDate ? moment(item?.dueDate).format('DD MMM') : ''}
                                    </small>
                                </div>
                            </OverlayTrigger>                        </div>
                        <div
                            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)' }}
                            className="col-12 pt-1 pb-0">
                            {item?.summary?.length > 250 ? item?.summary?.slice(0.249) + '...' : item?.summary}
                        </div>

                        <div
                            style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                            }}
                            className="col-12 d-flex justify-content-between pt-0 pb-2">
                            Timeline: {item?.estimatedTime} hrs
                            {isInProgressColumn && (
                                <div className="">
                                    {progressTimeLoading ? (
                                        <div className="bg-light rounded animate-pulse" ></div>
                                    ) : (
                                        <span className={`fw-bold ${timeTrackingData?.isPaused ? 'text-warning' : 'text-info'}`} style={{ fontSize: '0.7rem' }}>
                                            {timeTrackingData?.isPaused ? 'Paused' : 'Time'}: <TimeDisplay timeInMs={elapsedTimeMs} format="readable" />
                                        </span>
                                    )}
                                    {item?.status === 'Testing' &&
                                        <span className="fw-bold text-success" style={{ fontSize: '0.7rem' }}>
                                            Time spent: <TimeDisplay timeInMs={item.timeSpent} format="readable" />
                                        </span>
                                    }
                                    {item?.status === 'Done' &&
                                        <span className="fw-bold text-success" style={{ fontSize: '0.7rem' }}>
                                            Time spent: <TimeDisplay timeInMs={item.timeSpent} format="readable" />
                                        </span>
                                    }
                                </div>
                            )}
                        </div>



                    </div>
                    <div className="row">

                        <div className="col-12 d-flex align-items-center justify-content-between">
                            <OverlayTrigger
                                placement="bottom"
                                overlay={
                                    <Tooltip>
                                        {item?.assignee?.name ?
                                            item?.assignee?.name
                                            :
                                            `Unassigned`
                                        }
                                    </Tooltip>
                                }
                            >
                                <span
                                    className='d-flex bg-primary text-white cp align-items-center justify-content-center'
                                    style={{
                                        borderRadius: '100%',
                                        width: '23px',
                                        height: '23px',
                                        fontSize: '11px'
                                    }}
                                >
                                    {item?.assignee?.name ?
                                        item?.assignee?.name?.split(' ').map(word => word[0]).join('')
                                        :
                                        `UA`
                                    }
                                </span>
                            </OverlayTrigger>

                            <div className='d-flex gap-1 align-items-center'>
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                        <Tooltip>
                                            Comments
                                        </Tooltip>
                                    }
                                >
                                    <div
                                        onClick={() => {
                                            setTaskPreviewModal(true);
                                            setChangesDone(false);
                                        }}
                                        className="d-flex gap-0 taskCardIcons">
                                        <i className="bi bi-chat-dots"></i>
                                        <sup style={{ fontSize: '0.6rem' }} className='m-0 p-0 pt-1 fw-bold'>{item?.commentCount || 0}</sup>
                                    </div>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                        <Tooltip>
                                            Attachments
                                        </Tooltip>
                                    }
                                >
                                    <div
                                        onClick={() => {
                                            setTaskPreviewModal(true);
                                            setChangesDone(false);
                                        }}
                                        className="d-flex gap-0 taskCardIcons">
                                        <i className="bi bi-paperclip"></i>
                                        <sup style={{ fontSize: '0.6rem' }} className='m-0 p-0 pt-1 fw-bold'>{item?.attachments?.length}</sup>
                                    </div>
                                </OverlayTrigger>

                                <div
                                    className="d-flex gap-0 taskCardIcons">
                                    <OverlayTrigger
                                        placement="bottom"
                                        overlay={
                                            <Tooltip>
                                                Description
                                            </Tooltip>
                                        }
                                    >
                                        <i onClick={() => setDescriptionModal(true)} className="bi bi-file-earmark-text"></i>
                                    </OverlayTrigger>
                                    <DescriptionOffCanvas show={descriptionModal} onHide={() => setDescriptionModal(false)} description={item?.description} title={item?.summary} />
                                </div>
                                <div
                                    className="d-flex gap-0 taskCardIcons">
                                    <OverlayTrigger
                                        placement="bottom"
                                        overlay={
                                            <Tooltip>
                                                Edit Task
                                            </Tooltip>
                                        }
                                    >
                                        <i onClick={() => {
                                            setTaskPreviewModal(true)
                                            setChangesDone(false);
                                        }} className="bi-pencil-square fs-5"></i>
                                    </OverlayTrigger>
                                    <TaskPreviewModal
                                        projectId={projectId}
                                        taskId={item?._id}
                                        setChangesDone={setChangesDone}
                                        show={taskPreviewModal}
                                        closeModal={closeTaskPreview} />
                                </div>

                            </div>
                        </div>
                    </div>
                    {/* <div className="d-flex justify-content-between align-items-start my-0">
                        <div className='d-flex align-items-center gap-1'>
                            <PriorityBadge priority={item?.priority}>
                                {item?.priority || 'No Priority'}
                            </PriorityBadge>
                            {item?.dueDate && (
                                <div>
                                    {moment(item?.dueDate).isBefore(moment()) &&
                                        (item?.status === 'In Progress' || item?.status === 'To Do' || item?.status === 'Testing') ? (
                                        <span
                                            className="text-danger"
                                            style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '20px',
                                                fontSize: '0.5rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                background: 'rgba(220, 53, 69, 0.1)',
                                                color: '#dc3545'
                                            }}
                                        >
                                            Overdue
                                        </span>) : (
                                        <></>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='d-flex gap-2 align-items-center'>
                            {isInProgressColumn && (
                                <div className="">
                                    {progressTimeLoading ? (
                                        <div className="bg-light rounded animate-pulse" ></div>
                                    ) : (
                                        <span className="fw-bold text-info" style={{ fontSize: '0.7rem' }}>
                                            {formattedTime}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="dropdown">
                                <button
                                    className="border-0 bg-transparent p-0 py-0 rounded-circle"
                                    type="button"
                                    id={`dropdownMenuButton-${item.id}`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    aria-label="Actions"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <i className="bi bi-three-dots-vertical fs-5 text-muted"></i>
                                </button>
                                <DropdownMenu
                                    className="dropdown-menu dropdown-menu-end"
                                    aria-labelledby={`dropdownMenuButton-${item.id}`}
                                >
                                    <li>
                                        <DropdownItem onClick={(e) => { e.stopPropagation(); handelUpdate(item); }}>
                                            <i className="uil-edit-alt"></i>
                                            <span>Edit Task</span>
                                        </DropdownItem>
                                    </li>
                                    <li>
                                        <DropdownItem
                                            danger
                                            onClick={(e) => { e.stopPropagation(); deleteData(item?.id); }}
                                        >
                                            <i className="mdi mdi-delete"></i>
                                            <span>Delete</span>
                                        </DropdownItem>
                                    </li>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <div className="my-0">
                        <span className="fw-semibold text-black my-0" style={{ fontSize: '0.76rem' }}>
                            {item?.summary}
                        </span>
                    </div>

                    <div className="d-flex justify-content-between pt-1 border-top align-items-center">
                        <small className="text-black" style={{ fontSize: '0.7rem' }}>
                            Assignee:
                        </small>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {item?.assignee?.name}
                        </small>
                    </div> */}
                </TaskInformation>
            </TaskCardContainer>

            {/* Delete Confirmation Modal */}
            <Modal
                show={deleteModal}
                onHide={() => setDeleteModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this task? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setDeleteModal(false)}
                        className="px-4"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        // onClick={() => handleYes()}
                        className="px-4"
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Pagesaddtask
                className="d-none"
                showModal={openEditModal}
                closeModal={closeupdatemodal}
                setShowModal={setOpenEditModal}
                editData={editData}
            />
        </>
    );
};

export default TaskCard;