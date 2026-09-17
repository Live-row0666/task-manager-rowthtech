import React, { useState, useEffect } from 'react';
import { Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getUserTasks, updateUserTask, getTaskStatusesByProject, getUserTasksTimer } from '../../../redux/tasks/api';
import { getUserProjects } from '../../../redux/projects/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import TaskPreviewModal from '../Tasks/TaskPreviewModal';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useSelector } from 'react-redux';
import moment from 'moment/moment';
import DescriptionOffCanvas from '../../../components/DescriptionOffCanvas';
import MainLoader from '../../../constants/Loader/loader';
import TimeDisplay from '../../../components/TimeDisplay';
import { getSelectedProject, setSelectedProject as saveSelectedProject, getProjectToSelect } from '../../../utils/projectUtils';
import ConfirmationModal from '../../../components/ConfirmationModal';
import './taskBoard.css'
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
const UserTaskBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [columns, setColumns] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [showTaskDetail, setShowTaskDetail] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [taskTimings, setTaskTimings] = useState([]);
    const [search, setSearch] = useState('');
    const [activeTaskId, setActiveTaskId] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [overdueCount, setOverdueCount] = useState(0);

    console.log(overdueTasks, "overdueTasks")
    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject && projects.length > 0) {
            setColumns({});
            setTasks([]);
            fetchTaskStatusesForProject(selectedProject);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await getUserProjects();
            if (response?.data?.data) {
                const projectData = Array.isArray(response.data.data) ? response.data.data : [];
                setProjects(projectData);
                if (projectData.length > 0) {
                    const savedProject = getSelectedProject();
                    const projectToSelect = getProjectToSelect(projectData, savedProject);
                    setSelectedProject(projectToSelect);
                    saveSelectedProject(projectToSelect);
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchTaskStatusesForProject = async (projectId) => {
        setLoading(true);
        try {
            const response = await getTaskStatusesByProject(projectId);
            console.log(response?.data?.data, "response?.data?.data")
            if (response?.data?.data) {
                const statusData = Array.isArray(response.data.data) ? response.data.data : [];
                const newColumns = {};
                statusData.forEach(status => {
                    newColumns[status.name] = { title: status.name, items: [], color: status.color };
                });
                setColumns(newColumns);
                setLoading(false);
                await fetchTasksWithColumns(projectId, newColumns);
                await fetchUserTaskTimings();
            }
        } catch (error) {
            console.error('Error fetching task statuses:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserTaskTimings = async () => {
        setLoading(true);
        try {
            const response = await getUserTasksTimer(JSON.parse(sessionStorage.getItem('hyper_user'))?.id);
            if (response?.data?.data) {
                const timings = Array.isArray(response.data.data) ? response.data.data : [];
                console.log(timings, "xcvncxvncxvnx")
                setTaskTimings(timings);
                setLoading(false);
                let allactives = []
                for (let index = 0; index < timings?.length; index++) {
                    allactives.push(timings[index]?.task?._id)
                }
                setActiveTaskId(allactives);
                // const activeTiming = timings.find(timing => timing.isActive);
                // if (activeTiming) {
                //     setActiveTaskId(activeTiming.task._id);
                // }
            }
        } catch (error) {
            console.error('Error fetching task timings:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasksWithColumns = async (projectId, columnsData) => {
        setLoading(true);
        try {
            const response = await getUserTasks({ project: projectId, limit: 100 });
            if (response?.data?.data) {

                setOverdueTasks(response.data.overdueTasks || []);
                setOverdueCount(response.data.overdueCount || 0);
                const taskData = Array.isArray(response.data.data) ? response.data.data : [];
                setLoading(false);
                setTasks(taskData);
                organizeTasksByStatusWithColumns(taskData, columnsData);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        if (!selectedProject) return;
        await fetchTaskStatusesForProject(selectedProject);
    };

    const organizeTasksByStatusWithColumns = (taskData, columnsData) => {
        const newColumns = {};
        Object.keys(columnsData).forEach(key => {
            newColumns[key] = { ...columnsData[key], items: [] };
        });

        taskData.forEach(task => {
            const status = task?.status || Object.keys(newColumns)[0];
            if (newColumns[status]) {
                newColumns[status]?.items?.push(task);
            } else {
                const firstColumn = Object.keys(newColumns)[0];
                if (firstColumn) {
                    newColumns[firstColumn].items.push(task);
                }
            }
        });
        setColumns(newColumns);
    };


    const startTimerApi = async (taskId) => {
        if (!isWithinWorkingHours()) {
            toast.error('Timer can only be started between 9:30 AM to 7:00 PM (IST)');
            return;
        }

        const activeTiming = taskTimings.find(timing => timing.isActive && !timing.isPaused);
        if (activeTaskId && activeTaskId !== taskId && activeTiming) {
            const projectName = activeTiming?.project?.name || 'Unknown Project';
            toast.error(`You already have a task running in ${projectName}. First pause it or complete it.`);
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/user/time-tracking/start`, {
                taskId: taskId,
                projectId: selectedProject,
            });
            // setActiveTaskId(taskId);
            await fetchUserTaskTimings();
            toast.success('Task timer started');
        } catch (error) {
            toast.error('Failed to start timer');
            console.error('Timer start error:', error);
        }
    };

    const stopTimerApi = async (taskId) => {
        setConfirmAction(() => () => executeStopTimer(taskId));

        setShowConfirmModal(true);
        await fetchTasks()
    };

    const executeStopTimer = async (taskId) => {
        try {
            // Find the specific task timing
            const taskTiming = taskTimings.find(timing => timing.task._id === taskId);
            let timeSpent = 0;

            if (taskTiming) {
                if (taskTiming.isPaused) {
                    timeSpent = getPausedTaskElapsedTime(taskTiming);
                } else {
                    timeSpent = getCurrentElapsedTime();
                }
            }

            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/user/time-tracking/stop`, { taskId });
            await updateUserTask(taskId, {
                status: 'Testing',
                qastatus: 'To Do',
                timeSpent: timeSpent,
            });
            // setActiveTaskId(null);
            setTaskTimings([]);
            await fetchTasks();
            toast.success('Timer stopped and task moved to Testing');
        } catch (error) {
            toast.error('Failed to stop timer');
            console.error('Timer stop error:', error);
        }
    };

    const pauseTimer = async (taskId) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/user/time-tracking/pause?task=${taskId}`);
            await fetchUserTaskTimings();
            toast.success('Timer paused');
        } catch (error) {
            toast.error('Failed to pause timer');
            console.error('Timer pause error:', error);
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
            toast.error(`You already have a task running in ${projectName}. First pause it or complete it.`);
            return;
        }

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/user/time-tracking/resume?task=${taskId}`);
            await fetchUserTaskTimings();
            toast.success('Timer resumed.');
        } catch (error) {
            toast.error('Failed to resume timer');
            console.error('Timer resume error:', error);
        }
    };



    const getCurrentElapsedTime = () => {
        const activeTiming = taskTimings.find(timing => timing.isActive);
        if (!activeTiming) return 0;
        if (activeTiming.isPaused) return activeTiming.duration;
        const startTime = new Date(activeTiming.startTime).getTime();
        const currentTime = Date.now();
        const totalElapsed = currentTime - startTime;
        return Math.max(0, totalElapsed - activeTiming.totalPausedTime);
    };


    const getPausedTaskElapsedTime = (timing) => {
        if (!timing || !timing.isPaused) return 0;

        const startTime = new Date(timing.startTime).getTime();
        let totalWorkedTime = 0;

        // Calculate time worked in completed pause periods
        const completedPausePeriods = timing.pausePeriods.filter(period => period.endTime);
        let lastWorkEndTime = startTime;

        completedPausePeriods.forEach(pausePeriod => {
            const pauseStart = new Date(pausePeriod.startTime).getTime();
            totalWorkedTime += pauseStart - lastWorkEndTime;
            lastWorkEndTime = new Date(pausePeriod.endTime).getTime();
        });

        // Handle current pause period (if any)
        const currentPausePeriod = timing.pausePeriods.find(period => !period.endTime);
        if (currentPausePeriod) {
            const pauseStart = new Date(currentPausePeriod.startTime).getTime();
            totalWorkedTime += pauseStart - lastWorkEndTime;
        }

        return Math.max(0, totalWorkedTime);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const activeTiming = taskTimings.find(timing => timing.isActive && !timing.isPaused);
            if (activeTiming) {
                setTaskTimings(prev => [...prev]);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [taskTimings]);

    const isWithinWorkingHours = () => {
        const now = new Date();
        const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const currentHour = istTime.getHours();
        const currentMinute = istTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        return currentTimeInMinutes >= 570 && currentTimeInMinutes < 1140; // 9:30 AM to 7:00 PM
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const sourceColumn = columns[source.droppableId];
        const destColumn = columns[destination.droppableId];

        if (!sourceColumn || !destColumn) {
            return;
        }

        // Check if the move is valid based on our rules
        const validMoves = getValidMoves(source.droppableId);
        if (!validMoves.includes(destination.droppableId)) {
            toast.error(`Cannot move task from ${source.droppableId} to ${destination.droppableId}`);
            return;
        }

        // Create deep copies to avoid reference issues
        const newSourceItems = JSON.parse(JSON.stringify(sourceColumn.items));
        const newDestItems = source.droppableId === destination.droppableId ?
            newSourceItems : JSON.parse(JSON.stringify(destColumn.items));

        const [movedTask] = newSourceItems.splice(source.index, 1);
        const updatedTask = { ...movedTask, status: destination.droppableId };
        newDestItems.splice(destination.index, 0, updatedTask);

        setColumns({
            ...columns,
            [source.droppableId]: { ...sourceColumn, items: newSourceItems },
            [destination.droppableId]: { ...destColumn, items: newDestItems }
        });

        try {
            if (destination.droppableId === 'Testing' && source.droppableId === 'In Progress') {
                if (activeTaskId.includes(draggableId)) {
                    setConfirmAction(() => () => executeStopTimer(draggableId));
                    setShowConfirmModal(true);
                    setColumns(columns);
                    return;
                } else {
                    // Calculate time spent for paused tasks moved from In Progress to Testing
                    const taskTiming = taskTimings.find(timing => timing.task._id === draggableId);
                    let timeSpent = 0;

                    if (taskTiming && taskTiming.isPaused) {
                        timeSpent = getPausedTaskElapsedTime(taskTiming);
                    }

                    await updateUserTask(draggableId, {
                        status: destination.droppableId,
                        timeSpent: timeSpent,
                        ...(destination.droppableId === 'Testing' && { qastatus: 'Not Started' })
                    });
                }
            } else {
                let updateData = { status: destination.droppableId };

                if (destination.droppableId === 'Testing') {
                    updateData.qastatus = 'Not Started';

                    // If moving from In Progress to Testing, calculate timeSpent
                    if (source.droppableId === 'In Progress') {
                        const taskTiming = taskTimings.find(timing => timing.task._id === draggableId);
                        if (taskTiming && taskTiming.isPaused) {
                            updateData.timeSpent = getPausedTaskElapsedTime(taskTiming);
                        } else {
                            updateData.timeSpent = 0;
                        }
                    }
                }

                await updateUserTask(draggableId, updateData);
            }
            await fetchTasks();
        } catch (error) {
            toast.error('Failed to update task status');
            setColumns(columns);
        }
    };
    const getValidMoves = (status) => {
        const rules = {
            'To Do': ['In Progress'],
            'In Progress': ['Testing']
        };
        return rules[status] || [];
    };

    return (
        <>
            <div className="mb-3">


                <div className="bg-white rounded-3 shadow border-0 p-2" style={{ background: 'linear-gradient(135deg, #313A46 0%, #4a5568 100%)', color: 'white' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <div>
                                <h5 className="my-0 fw-bold">Task Board</h5>
                                <small className="my-0 opacity-75">Drag & drop tasks</small>
                            </div>
                        </div>

                        <div className="d-flex gap-2 align-items-center">
                            <div className="position-relative">
                                <i className="mdi mdi-folder-outline position-absolute" style={{ left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', fontSize: '0.9rem', zIndex: 2 }}></i>
                                <select
                                    className="form-select border-0 shadow-sm"
                                    value={selectedProject}
                                    onChange={(e) => {
                                        setSelectedProject(e.target.value);
                                        saveSelectedProject(e.target.value);
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
                                    {!selectedProject && <option value="" disabled>Select Project</option>}
                                    {projects?.map(project => (
                                        <option key={project._id} value={project._id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                onClick={fetchTasks}
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
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            {overdueCount > 0 && (
                <div className="overdue-banner">
                    <div className="overdue-scroll">
                        ⚠️ {overdueCount} task(s) have exceeded their estimated completion time. Please update its progress.


                    </div>
                </div>
           )} 
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
                                                <span className='text-capitalize'>{column?.title}
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
                                                                <Draggable key={item._id} draggableId={item._id} index={index} isDragDisabled={getValidMoves(columnId).length === 0 || (taskTimings.find(timing => timing.task?._id === item._id)?.isPaused)}>
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
                                                                                projectId={selectedProject}
                                                                                // closeModal={closeaddModal}
                                                                                isInProgressColumn={column.title === 'In Progress'}
                                                                                // timeTrackingData={timeTrackingData[item._id]}
                                                                                onTaskDelete={() => { }}
                                                                                startTimerApi={startTimerApi}
                                                                                pauseTimer={pauseTimer}
                                                                                resumeTimer={resumeTimer}
                                                                                stopTimerApi={stopTimerApi}
                                                                                fetchTasksWithColumns={fetchTasksWithColumns}
                                                                                taskTimings={taskTimings.find(timing => timing.task?._id === item._id)}
                                                                                getPausedTaskElapsedTime={getPausedTaskElapsedTime}
                                                                                activeTaskId={activeTaskId}
                                                                            // progressTimeLoading={progressTimeLoading}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))
                                                            :
                                                            <div className="d-flex justify-content-center align-items-center h-100">
                                                                <div className="text-center text-muted">
                                                                    <i className="bi bi-inbox fs-2"></i>
                                                                    <p className="mt-2">No data found</p>
                                                                </div>
                                                            </div>
                                                        }

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
                )
                :
                <div className="d-flex justify-content-center py-5 align-items-center h-100">
                    <div className="text-center text-muted">
                        <i className="bi bi-inbox fs-2"></i>
                        <p className="mt-2">No Projects Assigned Yet</p>
                    </div>
                </div>
            }


            <TaskPreviewModal show={showTaskDetail} closeModal={() => {
                setShowTaskDetail(false);
                setSelectedTaskId(null);
            }}
                taskId={selectedTaskId} />

            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    confirmAction();
                    setShowConfirmModal(false);
                }}
                title="Confirm Timer Stop"
                message="Stopping the timer will move this task to Testing status and you won't be able to restart it. Use Pause if you want to resume later. Continue?"
            />
        </>
    );
};

const TaskCard = ({ item, projectId, closeModal, getValidMoves, progressTimeLoading, startTimerApi, pauseTimer, resumeTimer, stopTimerApi, taskTimings, activeTaskId, isInProgressColumn, timeTrackingData, onTaskDelete, getPausedTaskElapsedTime }) => {
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
        }
    }

    useEffect(() => {

        if (!taskPreviewModal && store?.UpdateTaskReducer?.data?.status === 200) {
        }
    }, [taskPreviewModal, store?.UpdateTaskReducer?.data?.status])

    const getCurrentElapsedTime = () => {
        if (!taskTimings || !taskTimings.isActive) return 0;
        if (taskTimings.isPaused) return taskTimings.duration;
        const startTime = new Date(taskTimings.startTime).getTime();
        const currentTime = Date.now();
        const totalElapsed = currentTime - startTime;
        return Math.max(0, totalElapsed - taskTimings.totalPausedTime);
    };

    const deleteResponse = store?.deleteTask?.data?.status;
    useEffect(() => {
        if (deleteResponse === "200" && deleteResponse !== undefined) {
            onTaskDelete(item.id);
        }
    }, [deleteResponse]);
    return (
        <>
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
                                        Overdue
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
                            {item.status === 'In Progress' && activeTaskId.includes(item?._id) && (
                                <span className="fw-bold text-info" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                                    {taskTimings?.isPaused ? (
                                        <TimeDisplay timeInMs={getPausedTaskElapsedTime(taskTimings)} format="standard" />
                                    ) : (
                                        <TimeDisplay timeInMs={getCurrentElapsedTime()} format="standard" />
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
                        {item.status === 'In Progress' && (
                            <div className="mt-0 mb-1 px-2 py-1 rounded" onClick={(e) => e.stopPropagation()}>
                                {!activeTaskId.includes(item._id) ? (
                                    <Button
                                        size="sm"
                                        variant="success"
                                        onClick={() => startTimerApi(item._id)}
                                        style={{
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            width: '100%'
                                        }}
                                    >
                                        Start Timer
                                    </Button>
                                ) : (
                                    <div className="d-flex gap-1">
                                        <Button
                                            size="sm"
                                            variant={taskTimings?.isPaused ? "success" : "warning"}
                                            onClick={() => taskTimings?.isPaused ? resumeTimer(item._id) : pauseTimer(item._id)}
                                            style={{ fontSize: '9px', padding: '1px 4px', flex: 1 }}
                                        >
                                            {taskTimings?.isPaused ? 'Resume' : 'Pause'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => stopTimerApi(item._id)}
                                            style={{ fontSize: '9px', padding: '1px 4px', flex: 1 }}
                                            title="Complete task and record time spent"
                                            disabled={taskTimings?.isPaused}
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


        </>
    );
};

export default UserTaskBoard;
