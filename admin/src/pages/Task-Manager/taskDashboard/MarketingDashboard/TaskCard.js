import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import moment from 'moment/moment';
import TimeDisplay from '../../../../components/TimeDisplay';
import DescriptionOffCanvas from '../../../../components/DescriptionOffCanvas';
import TaskPreviewModal from '../TaskPreviewModal';
import axios from 'axios';
import ToastHandle from '../../../../constants/toaster/toaster';
import { startTimerApi } from '../../../../helpers/marketingTeamApiService';

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
  border: 1px solid white;
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);

  &:hover {
    border: 0.1px solid #727CF5;
  }

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
const TaskCard = ({ item, projectId, closeModal, getValidMoves, progressTimeLoading, pauseTimer, resumeTimer, stopTimerApi, startTimerApi, taskTimings, activeTaskId, isInProgressColumn, timeTrackingData, onTaskDelete, getPausedTaskElapsedTime, getCurrentElapsedTime, timerLoading }) => {
    const store = useSelector((state) => state);
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


    const closeTaskPreview = () => {
        setTaskPreviewData(null);
        setTaskPreviewModal(false);
        if (changesDone) {
        }
    }


    const getTaskElapsedTime = () => {
        if (!taskTimings || !taskTimings.isActive) return 0;
        if (taskTimings.isPaused) return taskTimings.duration;
        const startTime = new Date(taskTimings.startTime).getTime();
        const currentTime = Date.now();
        const totalElapsed = currentTime - startTime;
        return Math.max(0, totalElapsed - (taskTimings.totalPausedTime || 0));
    };
    return (
        <div>
            <TaskCardContainer
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <TaskInformation
                    priority={item?.priority}
                    className="cp"
                >
                    <div className="row">
                        <div
                            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)' }}
                            className="col-12 pe-0 d-flex flex-wrap gap-1">
                            <div className="d-flex gap-1 flex-wrap" style={{ flex: '1 1 auto', minWidth: '0' }}>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Priority</Tooltip>}
                                >
                                    <PriorityBadge priority={item?.priority}>
                                        {item?.priority || 'No Priority'}
                                    </PriorityBadge>
                                </OverlayTrigger>
                                {moment(item?.dueDate).isBefore(moment().subtract(5, 'seconds')) &&
                                    (item?.status === 'In Progress' || item?.status === 'To Do' || item?.status === 'Testing') ? (
                                    <span
                                        className="text-danger"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.15rem 0.35rem',
                                            borderRadius: '12px',
                                            fontSize: '0.45rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px',
                                            background: 'rgba(220, 53, 69, 0.1)',
                                            whiteSpace: 'nowrap',
                                            lineHeight: '1.2'
                                        }}
                                    >
                                        {`Overdue`}
                                    </span>) : (
                                    <span
                                        className="text-success"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '0.15rem 0.35rem',
                                            borderRadius: '12px',
                                            fontSize: '0.45rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.3px',
                                            background: 'rgba(0, 255, 38, 0.1)',
                                            whiteSpace: 'nowrap',
                                            lineHeight: '1.2'
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
                                <div className="text-end pe-1" style={{ flexShrink: 0 }}>
                                    <small style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                        {item?.dueDate ? moment(item?.dueDate).format('DD MMM') : ''}
                                    </small>
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div
                            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)' }}
                            className="col-12 pt-1 pb-0">
                            {item?.summary?.length > 250 ? item?.summary?.slice(0.249) + '...' : item?.summary}
                        </div>

                        <div
                            style={{
                                fontSize: '0.7rem',
                                fontWeight: '700',
                            }}
                            className="col-12 d-flex flex-wrap justify-content-between align-items-center pt-0 pb-2 gap-1">
                            <span style={{ whiteSpace: 'nowrap' }}>Timeline: {item?.estimatedTime} hrs</span>
                            {item?.status === 'In Progress' && activeTaskId?.includes(item?._id) && (
                                <span className="fw-bold text-info" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                                    {taskTimings?.isPaused ? (
                                        <TimeDisplay timeInMs={getPausedTaskElapsedTime(taskTimings)} format="standard" />
                                    ) : (
                                        <TimeDisplay timeInMs={getTaskElapsedTime()} format="standard" />
                                    )}
                                </span>
                            )}
                            {item.status === 'Testing' && item.timeSpent && (
                                <span className="fw-bold text-success" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                                    Time spent: <TimeDisplay timeInMs={item.timeSpent} format="readable" />
                                </span>
                            )}
                            {item.status === 'Done' && item.timeSpent && (
                                <span className="fw-bold text-success" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                                    Time spent: <TimeDisplay timeInMs={item.timeSpent} format="readable" />
                                </span>
                            )}
                        </div>
                        {item?.status === 'In Progress' && (
                            <div className="mt-0 mb-1 px-2 py-1 rounded" onClick={(e) => e.stopPropagation()}>
                                {!activeTaskId?.includes(item._id) ? (
                                    <Button
                                        size="sm"
                                        variant="success"
                                        onClick={() => startTimerApi(item?._id, item?.project?._id)}
                                        disabled={timerLoading === 'starting'}
                                        style={{
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            width: '100%'
                                        }}
                                    >
                                        {timerLoading === 'starting' ? 'Starting...' : 'Start Timer'}
                                    </Button>
                                ) : (
                                    <div className="d-flex gap-1">
                                        <Button
                                            size="sm"
                                            variant={taskTimings?.isPaused ? "success" : "warning"}
                                            onClick={() => taskTimings?.isPaused ? resumeTimer(taskTimings?._id) : pauseTimer(taskTimings?._id)}
                                            disabled={timerLoading === 'pausing' || timerLoading === 'resuming'}
                                            style={{ fontSize: '9px', padding: '1px 4px', flex: 1 }}
                                        >
                                            {timerLoading === 'pausing' ? 'Pausing...' :
                                                timerLoading === 'resuming' ? 'Resuming...' :
                                                    taskTimings?.isPaused ? 'Resume' : 'Pause'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => stopTimerApi(item._id, taskTimings?._id)}
                                            style={{ fontSize: '9px', padding: '1px 4px', flex: 1 }}
                                            title="Complete task and record time spent"
                                            disabled={taskTimings?.isPaused || timerLoading}
                                        >
                                            Complete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="row">

                        <div className="col-12 d-flex align-items-center justify-content-between">
                            <OverlayTrigger
                                placement="bottom"
                                overlay={
                                    <Tooltip>
                                        {item?.assignee?.name ? item?.assignee?.name : store?.Auth?.user?.name}
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
                                        item?.assignee?.name.split(' ').map(word => word[0]).join('').toUpperCase()
                                        :
                                        store?.Auth?.user?.name.split(' ').map(word => word[0]).join('').toUpperCase()
                                    }                                </span>
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
                </TaskInformation>
            </TaskCardContainer>
        </div>
    )
}

export default TaskCard