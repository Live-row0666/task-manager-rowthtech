import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import TaskCard from './TaskCard';
import { useParams } from 'react-router-dom';
import { FaFilter } from "react-icons/fa";
import MainLoader from '../../../constants/Loader/loader';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { TiPlus } from "react-icons/ti";
import Pagesaddtask from '../../../layouts/AllPagesRightbar';
import NewStatusModal from '../TaskBoard/NewStatusModal';
import { getsingleSprintTask, updateTask } from '../../../redux/actions';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useScrollRestoration from '../../../hooks/useScrollRestoration';

const Container = styled.div`
    display: flex;
    flex: 1;
`;

const TaskList = styled.div`
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
    width: 100%;
    border-radius: 8px;
    padding: 8px;
    margin-right: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;

    ::-webkit-scrollbar {
        width: 6px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #dee2e6;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: #adb5bd;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }
`;

const TaskColumnStyles = styled.div`
    margin: 4px;
    display: flex;
    width: 100%;
    overflow-x: auto;
    scrollbar-width: thin;
    overflow-y: hidden;
    gap: 4px;
    scroll-behavior: smooth; 
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    .task-list-col {
        flex: 1;
        min-width: 18vw;
        padding: 0 4px; 
    }
`;

const Title = styled.div`
    color: #495057;
    background: #ffffff;
    padding: 8px 12px;
    border-radius: 6px;
    align-self: stretch;
    font-weight: 600;
    font-size: 14px;
    border-bottom: 2px solid #e9ecef;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
`;

const Boards = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [columns, setColumns] = useState({});
    const [updateTaskStatusModal, setUpdateTaskStatusModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [timeTrackingData, setTimeTrackingData] = useState({});
    const [progressTimeLoading, setProgressTimeLoading] = useState(false);
    const { projectId, milestoneId, spriteId } = useParams();
    const projectTaskStatuses = store?.getAllTaskStatusesReducer?.data?.data;
    const getSingleSprintTask = store?.getSigleSprintTask?.data?.data;

    // Use scroll restoration hook
    useScrollRestoration([columns, getSingleSprintTask]);

    useEffect(() => {
        if (projectTaskStatuses && getSingleSprintTask) {
            const initialColumns = {};
            projectTaskStatuses.forEach(status => {
                const statusTasks = getSingleSprintTask.filter(task => task?.status === status?.name) || [];
                initialColumns[status._id] = {
                    _id: status._id,
                    title: status.name,
                    items: statusTasks,
                    count: statusTasks.length,
                    color: status?.color
                };
            });
            setColumns(initialColumns);
        }
    }, [projectTaskStatuses, getSingleSprintTask]);

    const closeaddModal = () => {
        setShowModal(false);
        dispatch(getsingleSprintTask({
            id: spriteId,
            taskStatus: 1,
            activeStatus: true,
            skip: 1,
            projectId,
            milestone: milestoneId,
            sprint: spriteId
        }));
    };

    const closeUpdateStatusModal = () => {
        setEditData(null);
        setUpdateTaskStatusModal(false);
    };

    const filteredColumns = search ?
        Object.fromEntries(
            Object.entries(columns).map(([key, column]) => [
                key,
                {
                    ...column,
                    items: column.items.filter(task =>
                        task.summary?.toLowerCase().includes(search.toLowerCase()) ||
                        task.description?.toLowerCase().includes(search.toLowerCase())
                    )
                }
            ])
        ) : columns;

    const inProgressSection = Object.values(filteredColumns).find(
        col => col.title === 'In Progress'
    );

    const fetchInProgressTime = async () => {
        setProgressTimeLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/time-tracking/get-active-tasks`, {
                tasksIds: inProgressSection?.items?.map((data) => (data?._id))
            });

            const timeData = {};
            response?.data?.data?.forEach(item => {
                timeData[item.task] = {
                    isActive: item.isActive,
                    isPaused: item.isPaused,
                    startTime: item.startTime,
                    totalPausedTime: item.totalPausedTime,
                    pausePeriods: item.pausePeriods
                };
            });

            setTimeTrackingData(timeData);
            return response.data;
        } catch (error) {
            setProgressTimeLoading(false);
            console.error('Error fetching in-progress time:', error);
            throw error;
        } finally {
            setProgressTimeLoading(false);
        }
    }

    useEffect(() => {
        if (inProgressSection?.items?.map((data) => (data?._id))?.length > 0) {
            fetchInProgressTime();

            // Fetch data every 30 seconds
            const fetchInterval = setInterval(() => {
                fetchInProgressTime();
            }, 30000);
            return () => clearInterval(fetchInterval);
        }
    }, [inProgressSection])

    // Update elapsed time every second for running timers
    useEffect(() => {
        const timerInterval = setInterval(() => {
            setTimeTrackingData(prevData => {
                const updatedData = { ...prevData };
                Object.keys(updatedData).forEach(taskId => {
                    const item = updatedData[taskId];
                    if (item.isActive && !item.isPaused) {
                        const currentTime = new Date();
                        const startTime = new Date(item.startTime);
                        const elapsedMs = currentTime - startTime - (item.totalPausedTime || 0);
                        updatedData[taskId] = {
                            ...item,
                            elapsedTime: Math.max(0, Math.floor(elapsedMs / 1000))
                        };
                    }
                });
                return updatedData;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [])

    const getValidMoves = (status) => {
        const rules = {
            'To Do': ['On Hold'],
            'Testing': ['On Hold', 'Done'],
            'On Hold': ['To Do', 'Testing']
        };
        return rules[status] || [];
    };

    const updateTaskFunction = async (taskId, body) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/admin/task/${taskId}`, body)
            if (response?.status === 200) {
                dispatch(getsingleSprintTask({ projectId }));
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const sourceCol = Object.values(columns).find(col => col._id === source.droppableId);
        const destCol = Object.values(columns).find(col => col._id === destination.droppableId);

        if (!sourceCol || !destCol) {
            return;
        }

        const task = sourceCol.items.find(item => item._id === draggableId);

        if (!task) {
            return;
        }

        if (!getValidMoves(task.status).includes(destCol.title)) {
            return;
        }
        const payload = {
            taskId: task._id,
            body: {
                status: destCol.title,
                ...(destCol.title === 'Done' && { qastatus: 'Completed' })
            }
        }
        updateTaskFunction(payload?.taskId, payload?.body)

        // dispatch(updateTask({
        //     taskId: task._id, body: {
        //         status: destCol.title,
        //         ...(destCol.title === 'Done' && { qastatus: 'Completed' })
        //     }
        // }));
    };

    return (
        <>
            <Pagesaddtask
                className="d-none"
                showModal={showModal}
                closeModal={closeaddModal}
                setShowModal={setShowModal}
            />

            {store?.getSigleSprintTask?.loading || store?.getAllTaskStatusesReducer?.loading ? (
                <MainLoader />
            ) : (
                <Container>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <TaskColumnStyles className='task-page-columns' data-scroll-key="task-columns">
                            {Object.entries(filteredColumns).map(([columnId, column]) => (
                                <div key={columnId} className="task-list-col">
                                    <TaskList data-scroll-key={`task-list-${columnId}`}>
                                        <Title style={{ color: column?.color }}>
                                            <span className='text-capitalize'>{column?.title}
                                                {column?.title !== 'To Do' || column?.title !== 'In Progress' || column?.title !== 'Done' || column?.title !== 'Testing' || column?.title !== 'To Do' || column?.title !== 'On Hold' && (
                                                    <i
                                                        onClick={() => {
                                                            const statusData = projectTaskStatuses?.find(status => status?._id === column?._id);
                                                            setEditData(statusData);
                                                            setUpdateTaskStatusModal(true);
                                                        }}

                                                        className="ms-1 cp fs-6 uil-edit-alt" />
                                                )}
                                            </span>
                                            <span className='badge bg-primary text-white' style={{ fontSize: '10px' }}>{column?.count}</span>
                                        </Title>
                                        <Droppable droppableId={column._id}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    style={{
                                                        minHeight: '300px',
                                                        backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
                                                        transition: 'background-color 0.2s ease',
                                                        borderRadius: '8px',
                                                        padding: '8px',
                                                        border: snapshot.isDraggingOver ? '2px dashed #2196f3' : '2px dashed transparent'
                                                    }}
                                                >
                                                    {column?.items?.map((item, index) => (
                                                        <Draggable key={item._id} draggableId={item._id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        opacity: snapshot.isDragging ? 0.8 : 1
                                                                    }}
                                                                >
                                                                    <TaskCard
                                                                        key={item._id}
                                                                        getValidMoves={getValidMoves}
                                                                        item={item}
                                                                        index={index}
                                                                        columns={columns}
                                                                        projectId={projectId}
                                                                        closeModal={closeaddModal}
                                                                        isInProgressColumn={column.title === 'In Progress'}
                                                                        timeTrackingData={timeTrackingData[item._id]}
                                                                        onTaskDelete={() => { }}
                                                                        progressTimeLoading={progressTimeLoading}
                                                                    />
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </TaskList>
                                </div>
                            ))}
                        </TaskColumnStyles>
                    </DragDropContext>
                </Container>
            )}
            <NewStatusModal
                show={updateTaskStatusModal}
                closeModal={closeUpdateStatusModal}
                editData={editData}
            />
        </>
    );
};

export default Boards;