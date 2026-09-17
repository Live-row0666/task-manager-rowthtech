import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import MainLoader from '../../../../constants/Loader/loader';
import styled from '@emotion/styled';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { getAllProjects, getAllTaskStatusesAction, getsingleSprintTask } from '../../../../redux/actions';
import { useSelector } from 'react-redux';
import TaskCard from '../MarketingDashboard/TaskCard';
import { updateTaskFunction } from '../../../../helpers/marketingTeamApiService';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getUserTasksTimer } from '../../../../redux/task/api';
import ConfirmationModal from '../../projects/modal/ConfirmationModal';

const Container = styled.div`
    display: flex;
    flex: 1;
`;

const TaskList = styled.div`
    height: 80vh;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
    width: 100%;
    border-radius: 8px;
    padding: 8px 5px;
    margin-right: 8px;
    border: 1px solid #e9ecef;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);

    ::-webkit-scrollbar {
        width: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background-color: #dee2e6;
        border-radius: 4px;
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
    overflow: auto;
    gap: 4px;
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
    &::-webkit-scrollbar {
        display: none;  /* Chrome, Safari and Opera */
    }
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

const FreelanceTeamDashboard = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const projects = store?.getProject?.data?.data;
    const projectTaskStatuses = store?.getAllTaskStatusesReducer?.data?.data;
    const getSingleSprintTask = store?.getSigleSprintTask?.data?.data;
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [taskTimings, setTaskTimings] = useState([]);
    const [projectSelected, setProjectSelected] = useState(null);
    const [visibleItems, setVisibleItems] = useState({});
    const [activeTaskId, setActiveTaskId] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [timerLoading, setTimerLoading] = useState({});

    const isWithinWorkingHours = () => {
        const now = new Date();
        const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const currentHour = istTime.getHours();
        const currentMinute = istTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        return currentTimeInMinutes >= 570 && currentTimeInMinutes < 1140; // 9:30 AM to 7:00 PM
    };

    useEffect(() => {
        dispatch(getAllProjects({ status: true, projectType: "Freelance", projectStatus: '', skip: 1, userId: store?.Auth?.user?.id }));
    }, [dispatch]);

    const fetchUserTaskTimings = async () => {
        setLoading(true);
        try {
            const response = await getUserTasksTimer(JSON.parse(localStorage.getItem('hyper_user'))?.id);
            if (response?.data?.data) {
                const timings = Array.isArray(response.data.data) ? response.data.data : [];
                setTaskTimings(timings);
                setLoading(false);
                let allactives = []
                for (let index = 0; index < timings?.length; index++) {
                    allactives.push(timings[index]?.task?._id)
                }
                setActiveTaskId(allactives);
            }
        } catch (error) {
            console.error('Error fetching task timings:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const startTimerApi = async (taskId) => {
        if (!isWithinWorkingHours()) {
            toast.error('Timer can only be started between 9:30 AM to 7:00 PM (IST)');
            return;
        }

        const activeTiming = taskTimings.find(timing => timing.isActive && !timing.isPaused);
        if (activeTaskId.length > 0 && !activeTaskId.includes(taskId) && activeTiming) {
            const projectName = activeTiming?.project?.name || 'Unknown Project';
            toast.error(`${activeTiming?.task?.summary} in ${projectName} is already running
                 First pause it or complete it.`);
            return;
        }

        setTimerLoading(prev => ({ ...prev, [taskId]: 'starting' }));
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/time-tracking-logs/start`, {
                taskId: taskId,
                projectId: projectSelected,
                projectType: 'Freelance'
            });
            await fetchUserTaskTimings();
            toast.success('Task timer started');
        } catch (error) {
            toast.error('Failed to start timer');
            console.error('Timer start error:', error);
        } finally {
            setTimerLoading(prev => ({ ...prev, [taskId]: null }));
        }
    };

    const pauseTimer = async (taskId) => {
        setTimerLoading(prev => ({ ...prev, [taskId]: 'pausing' }));
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/time-tracking-logs/pause?id=${taskId}`);
            await fetchUserTaskTimings();
            toast.success('Timer paused');
        } catch (error) {
            toast.error('Failed to pause timer');
            console.error('Timer pause error:', error);
        } finally {
            setTimerLoading(prev => ({ ...prev, [taskId]: null }));
        }
    };

    const resumeTimer = async (taskId) => {
        if (!isWithinWorkingHours()) {
            toast.error('Timer can only be resumed between 9:30 AM to 7:00 PM (IST)');
            return;
        }

        const activeTiming = taskTimings.find(timing => timing.isActive && !timing.isPaused);
        if (activeTiming && activeTiming.task._id !== taskId) {
            const projectName = activeTiming?.project?.name || 'Unknown Project';
            toast.error(`${activeTiming?.task?.summary} in ${projectName} is already running
                 First pause it or complete it.`);
            return;
        }

        setTimerLoading(prev => ({ ...prev, [taskId]: 'resuming' }));
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/time-tracking-logs/resume?id=${taskId}`);
            await fetchUserTaskTimings();
            toast.success('Timer resumed.');
        } catch (error) {
            toast.error('Failed to resume timer');
            console.error('Timer resume error:', error);
        } finally {
            setTimerLoading(prev => ({ ...prev, [taskId]: null }));
        }
    };

    const stopTimerApi = async (taskId, trackingId) => {
        setConfirmAction(() => () => executeStopTimer(taskId, trackingId));
        setShowConfirmModal(true);
    };

    const executeStopTimer = async (taskId, trackingId) => {
        try {
            const taskTiming = taskTimings.find(timing => timing.task._id === taskId);
            let timeSpent = 0;

            if (taskTiming) {
                if (taskTiming.isPaused) {
                    timeSpent = getPausedTaskElapsedTime(taskTiming);
                } else {
                    timeSpent = getCurrentElapsedTime();
                }
            }

            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/time-tracking-logs/stop`, { id: trackingId });
            await updateTaskFunction(taskId, {
                status: 'Testing',
                qastatus: 'Not Started',
                timeSpent: timeSpent,
            }, projectSelected, store?.Auth?.user?.id);
            setShowConfirmModal(false);
            await fetchUserTaskTimings();
            toast.success('Timer stopped and task moved to Testing');
        } catch (error) {
            toast.error('Failed to stop timer');
            console.error('Timer stop error:', error);
        }
    };

    const getPausedTaskElapsedTime = (timing) => {
        if (!timing || !timing.isPaused) return 0;

        const startTime = new Date(timing.startTime).getTime();
        let totalWorkedTime = 0;

        // Calculate time worked in completed pause periods
        const completedPausePeriods = timing.pausePeriods?.filter(period => period.endTime) || [];
        let lastWorkEndTime = startTime;

        completedPausePeriods.forEach(pausePeriod => {
            const pauseStart = new Date(pausePeriod.startTime).getTime();
            totalWorkedTime += pauseStart - lastWorkEndTime;
            lastWorkEndTime = new Date(pausePeriod.endTime).getTime();
        });

        // Handle current pause period (if any)
        const currentPausePeriod = timing.pausePeriods?.find(period => !period.endTime);
        if (currentPausePeriod) {
            const pauseStart = new Date(currentPausePeriod.startTime).getTime();
            totalWorkedTime += pauseStart - lastWorkEndTime;
        }
        return Math.max(0, totalWorkedTime);
    };

    const getCurrentElapsedTime = () => {
        const activeTiming = taskTimings.find(timing => timing.isActive);
        if (!activeTiming) return 0;
        if (activeTiming.isPaused) return activeTiming.duration;
        const startTime = new Date(activeTiming.startTime).getTime();
        const currentTime = Date.now();
        const totalElapsed = currentTime - startTime;
        return Math.max(0, totalElapsed - (activeTiming.totalPausedTime || 0));
    };

    useEffect(() => {
        if (projects?.length > 0 && !projectSelected) {
            const savedProject = localStorage.getItem('selectedFreelanceProject');
            const projectToSelect = savedProject && projects.find(p => p._id === savedProject) ? savedProject : projects[0]?._id;
            setProjectSelected(projectToSelect);
        }
    }, [projects, projectSelected]);

    useEffect(() => {
        if (projectTaskStatuses && getSingleSprintTask) {
            const initialColumns = {};
            const initialVisibleItems = {};
            projectTaskStatuses.forEach(status => {
                const statusTasks = getSingleSprintTask.filter(task => task?.status === status?.name) || [];
                initialColumns[status._id] = {
                    _id: status._id,
                    title: status.name,
                    items: statusTasks,
                    count: statusTasks.length,
                    color: status.color
                };
                initialVisibleItems[status._id] = 5;
            });
            setColumns(initialColumns);
            setVisibleItems(initialVisibleItems);
        }
    }, [projectTaskStatuses, getSingleSprintTask]);

    useEffect(() => {
        if (projectSelected) {
            dispatch(getAllTaskStatusesAction({ projectId: projectSelected }));
            dispatch(getsingleSprintTask({ projectId: projectSelected, assignee: store?.Auth?.user?.id }));
            fetchUserTaskTimings();
        }
    }, [projectSelected]);

    // Real-time timer updates
    useEffect(() => {
        const interval = setInterval(() => {
            const activeTiming = taskTimings.find(timing => timing.isActive && !timing.isPaused);
            if (activeTiming) {
                setTaskTimings(prev => [...prev]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [taskTimings]);

    const updateTaskFunction = async (taskId, body, projectId, assigneeId) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/admin/task/${taskId}`, body)
            if (response?.status === 200) {
                dispatch(getsingleSprintTask({ projectId, assignee: assigneeId || '' }));
            }
        } catch (error) {
            console.log(error);
        }
    }

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];
        const activeTiming = taskTimings.find(timing => timing.task?._id === draggableId && timing.isActive);

        // Prevent moving tasks with active timers backward
        if (activeTiming && (sourceColumn.title === 'In Progress' || sourceColumn.title === 'Testing')) {
            if (destColumn.title === 'To Do' || (sourceColumn.title === 'Testing' && destColumn.title === 'In Progress')) {
                toast.error('Cannot move task backward while timer is active. Stop the timer first.');
                return;
            }
        }

        // Prevent moving tasks from Done status
        if (sourceColumn.title === 'Done') {
            toast.error('Cannot move completed tasks.');
            return;
        }

        // Update columns state
        const newColumns = { ...columns };
        const sourceItems = [...sourceColumn.items];
        const destItems = source.droppableId === destination.droppableId ? sourceItems : [...destColumn.items];

        const [movedItem] = sourceItems?.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);

        newColumns[source.droppableId] = {
            ...sourceColumn,
            items: sourceItems,
            count: sourceItems.length
        };

        if (source.droppableId !== destination.droppableId) {
            newColumns[destination.droppableId] = {
                ...destColumn,
                items: destItems,
                count: destItems.length
            };
        }
        setColumns(newColumns);

        if ((destColumn.title === 'Testing' || destColumn.title === 'Done') && activeTiming) {
            // Behave like Complete button
            stopTimerApi(draggableId, activeTiming._id);
        } else {
            // Normal update
            const payload = {
                status: destColumn.title,
                ...(destColumn.title === 'Done' && { qastatus: 'Completed' })
            };
            updateTaskFunction(draggableId, payload, projectSelected, store?.Auth?.user?.id);
        }

    };

    const getValidMoves = (columnTitle) => {
        // Freelancers can move tasks to any status - return all possible statuses
        const allStatuses = Object.values(columns).map(col => col.title);
        return allStatuses.filter(status => status !== columnTitle);
    };
    return (
        <>
            <div className="mb-3">
                <div className="bg-white rounded-3 shadow border-0 p-2" style={{ background: 'linear-gradient(135deg, #313A46 0%, #4a5568 100%)', color: 'white' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <div>
                                <h5 className="my-0 fw-bold">{`Task Board`}</h5>
                                <small className="my-0 opacity-75">{`Drag & drop tasks`}</small>
                            </div>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            <div className="position-relative">
                                <i className="mdi mdi-folder-outline position-absolute" style={{ left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', fontSize: '0.9rem', zIndex: 2 }}></i>
                                <select
                                    className="form-select border-0 shadow-sm"
                                    value={projectSelected}
                                    onChange={(e) => {
                                        setProjectSelected(e.target.value);
                                        localStorage.setItem('selectedFreelanceProject', e.target.value);
                                    }}
                                    style={{
                                        width: '230px',
                                        fontSize: '12px',
                                        padding: '6px 8px 6px 28px',
                                        borderRadius: '8px',
                                        backgroundColor: 'white',
                                        color: '#495057',
                                        fontWeight: '500'
                                    }}
                                >
                                    {!selectedProject && <option value="" disabled>{`Select Project`}</option>}
                                    {projects?.map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                // onClick={fetchTasks}
                                className="d-flex align-items-center gap-1 border-0 shadow-sm"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                            >
                                <i className="mdi mdi-refresh"></i>
                                {`Refresh`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {projects?.length > 0 ?
                loading ? (
                    <MainLoader />
                ) : (
                    <Container>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <TaskColumnStyles className='task-page-columns-dash '>
                                {Object.entries(columns || {}).map(([columnId, column]) => (
                                    <div key={columnId} className="task-list-col">
                                        <TaskList>
                                            <Title style={{ color: column?.color }}>
                                                <span className='text-capitalize'>
                                                    {column?.title === "Testing" ? "In Review" : column?.title}
                                                </span>
                                                <span className='badge bg-primary text-white' style={{ fontSize: '10px' }}>{column?.count}</span>
                                            </Title>

                                            <Droppable droppableId={columnId}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        style={{
                                                            minHeight: '30rem',
                                                            backgroundColor: snapshot.isDraggingOver ? '#e3f2fd' : 'transparent',
                                                            transition: 'background-color 0.2s ease',
                                                            borderRadius: '8px',
                                                            padding: '8px',
                                                            border: snapshot.isDraggingOver ? '2px dashed #2196f3' : '2px dashed transparent'
                                                        }}
                                                    >
                                                        {column?.items?.length > 0 ?
                                                            column?.items?.map((item, index) => (
                                                                <Draggable key={item._id} draggableId={item._id} index={index} isDragDisabled={
                                                                    taskTimings.find(timing => timing.task?._id === item._id)?.isPaused ||
                                                                    column.title === 'Done' ||
                                                                    (taskTimings.find(timing => timing.task?._id === item._id && timing.isActive) && 
                                                                     (column.title === 'In Progress' || column.title === 'Testing'))
                                                                }>
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
                                                                                getValidMoves={() => getValidMoves(column.title)}
                                                                                item={item}
                                                                                index={index}
                                                                                columns={columns}
                                                                                projectId={projectSelected}
                                                                                activeTaskId={activeTaskId}
                                                                                taskTimings={taskTimings.find(timing => timing.task?._id === item._id)}
                                                                                startTimerApi={startTimerApi}
                                                                                pauseTimer={pauseTimer}
                                                                                resumeTimer={resumeTimer}
                                                                                stopTimerApi={stopTimerApi}
                                                                                getPausedTaskElapsedTime={getPausedTaskElapsedTime}
                                                                                getCurrentElapsedTime={getCurrentElapsedTime}
                                                                                isInProgressColumn={column.title === 'In Progress'}
                                                                                timerLoading={timerLoading[item._id]}
                                                                                activeTaskId={activeTaskId}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))
                                                            :
                                                            <div className="d-flex justify-content-center align-items-center h-100">
                                                                <div className="text-center text-muted">
                                                                    <i className="bi bi-inbox fs-2"></i>
                                                                    <p className="mt-2">{`No data found`}</p>
                                                                </div>
                                                            </div>
                                                        }

                                                        {provided?.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </TaskList>
                                    </div>
                                ))}
                            </TaskColumnStyles>
                        </DragDropContext>
                    </Container>
                )
                :
                <div className="d-flex justify-content-center py-5 align-items-center h-100">
                    <div className="text-center text-muted">
                        <i className="bi bi-inbox fs-2"></i>
                        <p className="mt-2">{`No Projects Assigned Yet`}</p>
                    </div>
                </div>
            }

            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    confirmAction();
                }}
                title="Confirm Timer Stop"
                message="Stopping the timer will move this task to Testing status and you won't be able to restart it. Use Pause if you want to resume later. Continue?"
            />
        </>
    )
}

export default FreelanceTeamDashboard;