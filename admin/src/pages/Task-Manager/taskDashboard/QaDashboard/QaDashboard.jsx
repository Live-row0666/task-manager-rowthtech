import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import MainLoader from '../../../../constants/Loader/loader';
import Pagesaddtask from '../../../../layouts/AllPagesRightbar';
import NewStatusModal from '../../TaskBoard/NewStatusModal';
import CsvExportModal from '../CsvExportModal';
import {
    getsingleSprintTask, getAllUsers, getAllProjects,
    getsingleMileStone, getSingleSprint
} from '../../../../redux/actions';
import { IoMdDownload } from "react-icons/io";
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../datepicker-styles.css';
import TaskListView from '../TaskList';
import { useSearchParams } from 'react-router-dom';
import QaTaskCard from './QaTaskCard';
import { getUserTasksTimer } from '../../../../redux/task/api';
import ConfirmationModal from '../../projects/modal/ConfirmationModal';

const isWithinWorkingHours = () => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = istTime.getHours();
    const currentMinute = istTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    return currentTimeInMinutes >= 570 && currentTimeInMinutes < 1140; // 9:30 AM to 7:00 PM
};


const Container = styled.div`
    display: flex;
    flex: 1;
`;

const TaskList = styled.div`
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    background: #f8f9fa;
    width: 100%;
    border-radius: 8px;
    padding: 8px;
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
            case 'Critical': return 'rgba(243, 4, 24, 0.19)';
            case 'High': return 'rgba(255, 165, 2, 0.1)';
            case 'Medium': return 'rgba(30, 144, 255, 0.1)';
            case 'Low': return 'rgba(46, 213, 115, 0.1)';
            default: return 'rgba(223, 228, 234, 0.5)';
        }
    }};
  color: ${props => {
        switch (props.priority) {
            case 'Critical': return '#fa172aff';
            case 'High': return '#ffa502';
            case 'Medium': return '#1e90ff';
            case 'Low': return '#2ed573';
            default: return '#57606f';
        }
    }};
`;

const QaDashboard = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [projectSelected, setProjectSelected] = useState(null);
    const [assigneeSelected, setAssigneeSelected] = useState(null);
    const [searchParams] = useSearchParams();
    const qaId = searchParams.get('qaId');
    const isMarketing = searchParams.get('isMarketing');
    const { control } = useForm();
    const projectTaskStatuses = [
        { _id: 'notStarted', name: 'Not Started', color: '' },
        { _id: 'toDo', name: 'To Do', color: '' },
        { _id: 'inProgress', name: 'In Progress', color: '' },
        { _id: 'completed', name: 'Completed', color: '' },
        { _id: 'hold', name: 'Hold', color: '' },
        { _id: 'reAssigned', name: 'Re Assigned', color: '' }
    ];

    // const projectTaskStatuses = store?.getAllTaskStatusesReducer?.data?.data;
    const getSingleSprintTask = store?.getSigleSprintTask?.data?.data;
    const projects = store?.getProject?.data?.data;
    const milestoneData = useSelector(state => state?.getSigleMileStone?.data?.data);
    const sprintData = useSelector(state => state?.getAllSingleSprints?.data?.data);
    const [columns, setColumns] = useState({});
    const [updateTaskStatusModal, setUpdateTaskStatusModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [timeTrackingData, setTimeTrackingData] = useState({});
    const [progressTimeLoading, setProgressTimeLoading] = useState(false);
    const [milestoneSelected, setMilestoneSelected] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [assigneesFilter, setAssigneesFilter] = useState([])
    const [taskView, setTaskView] = useState(store?.Auth?.user?.role === 'Marketing' || isMarketing === 'true' ? 'List view' : 'Board')
    const [sprintSelected, setSprintSelected] = useState(null);
    const [visibleItems, setVisibleItems] = useState({});
    const [taskTimings, setTaskTimings] = useState([]);
    const [activeTaskId, setActiveTaskId] = useState([]);
    const [loading, setLoading] = useState(false);
    const [timerLoading, setTimerLoading] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const projectId = projectSelected;
    const assigneeId = assigneeSelected;
    const selectedDepartment = localStorage.getItem('selectedDepartment');

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
        dispatch(getAllProjects({ status: true, projectType: selectedDepartment, projectStatus: '', skip: 1, ...(store?.Auth?.user?.role === 'QA' ? { userId: store?.Auth?.user?.id } : store?.Auth?.user?.role === 'Marketing' ? { userId: store?.Auth?.user?.id } : qaId ? { userId: qaId } : {}) }));
        dispatch(getAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (projects?.length > 0 && !projectSelected) {
            setProjectSelected(projects[0]?._id);
            setAssigneesFilter(projects[0]?.team);
        }
    }, [projects, projectSelected]);

    useEffect(() => {
        if (getSingleSprintTask) {
            const initialColumns = {};
            const initialVisibleItems = {};
            projectTaskStatuses.forEach(status => {
                const statusTasks = getSingleSprintTask.filter(task => task?.qastatus === status?.name) || [];
                initialColumns[status._id] = {
                    _id: status._id,
                    title: status.name,
                    items: statusTasks,
                    count: statusTasks.length,
                    color: status.color
                };
                initialVisibleItems[status._id] = 10;
            });
            setColumns(initialColumns);
            setVisibleItems(initialVisibleItems);
            fetchUserTaskTimings()
        }
    }, [getSingleSprintTask]);

    const closeaddModal = () => {
        setShowModal(false);
    };

    const closeUpdateStatusModal = () => {
        setEditData(null);
        setUpdateTaskStatusModal(false);
    };

    // const activeColumns = Object.keys(columns).length > 0 ? columns : staticColumns;

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
    useEffect(() => {
        if (projectSelected || assigneeSelected) {
            dispatch(getsingleSprintTask({ projectId, assignee: assigneeId || '' }));
            dispatch(getsingleMileStone({ id: projectSelected, isActive: true, skip: 1 }));
        }
    }, [projectSelected, assigneeSelected]);

    useEffect(() => {
        if (milestoneSelected || sprintSelected || startDate || endDate) {
            dispatch(getsingleSprintTask({
                projectId,
                assignee: assigneeId || '',
                milestone: milestoneSelected,
                sprint: sprintSelected,
                ...(startDate && { startDate: startDate }),
                ...(endDate && { endDate: endDate }),
            }));
        }
    }, [milestoneSelected, sprintSelected, endDate, startDate])


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


    // Update elapsed time every second for running timers only
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

    // CSV export state
    const [csvModalOpen, setCsvModalOpen] = useState(false);

    const getValidMoves = (status) => {
        const rules = {
            'To Do': ['In Progress'],
            'In Progress': ['On Hold', 'Completed'],
            'On Hold': ['To Do']
        };
        return rules[status] || [];
    };


    const updateTaskFunction = async (taskId, body) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/admin/task/${taskId}`, body)
            if (response?.status === 200) {
                dispatch(getsingleSprintTask({ projectId, assignee: assigneeId || '' }));
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

        if (!getValidMoves(task.qastatus).includes(destCol.title)) {
            return;
        }

        const timeTrackingId = taskTimings.find(timing => timing.task?._id === task?._id)?._id;
        if (source.droppableId === 'inProgress' && destination.droppableId === 'completed') {
            stopTimerApi(task?._id, timeTrackingId);
        } else {
            const payload = {
                taskId: task._id,
                body: {
                    qastatus: destCol.title,
                    ...(destCol.title === 'Completed' && { status: 'Done' })
                }
            }
            updateTaskFunction(payload?.taskId, payload?.body)
        }

    };


    useEffect(() => {
        if (store?.createTaskReducer?.data?.status === 201) {
            dispatch(getsingleSprintTask({ projectId, assignee: assigneeId || '' }));
        }
    }, [store?.createTaskReducer?.data?.status])

    const [isIMS, setIsIMS] = useState(false);
    const [imsLoading, setImsLoading] = useState(false);

    const fetchIMSTasks = async () => {
        setImsLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/project/ims-to-task`)
            if (response.status === 200) {
                toast.success(response?.data?.message);
                dispatch(getsingleSprintTask({ projectId, assignee: assigneeId || '' }));

            }
        } catch (error) {
            console.error(error);
            setImsLoading(false);
        } finally {
            setImsLoading(false);
        }
    }
    useEffect(() => {
        if (projects?.find((project) => project?._id === projectSelected)?.name?.trim() === 'IMS') {
            setIsIMS(true);
        } else {
            setIsIMS(false);
        }
    }, [projectSelected, projects])

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
                projectType: selectedDepartment
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

    const stopTimerApi = async (taskId, trackingId, reassigning = false) => {
        setConfirmAction(() => () => executeStopTimer(taskId, trackingId, reassigning));
        setShowConfirmModal(true);
    };

    const executeStopTimer = async (taskId, trackingId, reassigning) => {
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
                qastatus: reassigning ? 'Re Assigned' : 'Completed',
                status: reassigning ? 'To Do' : 'Done',
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

    const fetchUserTaskTimings = async () => {
        setLoading(true);
        try {
            const response = await getUserTasksTimer(qaId ? qaId : JSON.parse(localStorage.getItem('hyper_user'))?.id);
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
    return (
        <>
            <div className="card" style={{ height: '92vh' }}>
                <div className="card-body  px-2 pt-2">
                    <div className="mb-2 p-0 bg-white rounded">
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                            {store?.Auth?.user?.role !== 'Marketing' ? (
                                <div className='d-flex flex-wrap gap-1 mb-2 mb-md-0'>
                                    <button
                                        className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1 py-0"
                                        style={{ padding: '0px 12px!important', fontSize: '12px', height: '30px' }}
                                        onClick={() => setCsvModalOpen(true)}
                                        disabled={!projectSelected}
                                    >
                                        <IoMdDownload size={16} title='Export Tasks' />
                                        {/* <i className="bi bi-cloud-arrow-down"></i> */}
                                    </button>
                                    {isIMS && (
                                        <button
                                            className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1 py-0"
                                            style={{ padding: '0px 12px!important', fontSize: '12px', height: '30px' }}
                                            onClick={() => {
                                                fetchIMSTasks()
                                            }}
                                            disabled={imsLoading}
                                        >
                                            {imsLoading ? 'Fetching Tasks' : 'Fetch Tasks'}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        style={{ height: '30px' }}
                                        onClick={() => setTaskView(taskView === 'List view' ? 'Board' : 'List view')}
                                        title={taskView === 'List view' ? 'Switch to Board view' : 'Switch to List view'}
                                    >
                                        <i className={`bi ${taskView === 'List view' ? 'bi-kanban' : 'bi-list-ul'}`}></i>
                                    </button>
                                </div>
                            ) : <div></div>}
                            <div className="d-flex flex-wrap gap-2">
                                <div className='projectSelector' style={{ width: '160px' }}>
                                    <Controller
                                        name="project"
                                        control={control}
                                        value={projects?.length > 0 && projectSelected ?
                                            { value: projectSelected, label: projects.find(p => p._id === projectSelected)?.name } : null}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={projects?.length > 0 && projectSelected ?
                                                    { value: projectSelected, label: projects.find(p => p._id === projectSelected)?.name } : null}
                                                options={projects?.map(project => ({
                                                    value: project?._id,
                                                    label: project?.name,
                                                    team: project?.team
                                                })) || []}
                                                onChange={(option) => {
                                                    field.onChange(option);
                                                    setProjectSelected(option?.value || null);
                                                    setAssigneesFilter(option?.team);
                                                    let data = {
                                                        id: option?.value,
                                                        isActive: true,
                                                        skip: 1,
                                                        mileStoneId: '', limit: 50
                                                    };
                                                    dispatch(getsingleMileStone(data));
                                                    setAssigneeSelected(null);
                                                    setSprintSelected(null);
                                                    if (option?.label?.trim() === 'IMS') {
                                                        setIsIMS(true)
                                                    } else {
                                                        setIsIMS(false);
                                                    }
                                                }}
                                                onInputChange={(inputValue) => {
                                                    if (inputValue !== '') {
                                                        dispatch(getAllProjects({ status: true, projectType: selectedDepartment, projectStatus: '', skip: 1, search: inputValue, ...(store?.Auth?.user?.role === 'QA' ? { userId: store?.Auth?.user?.id } : store?.Auth?.user?.role === 'Marketing' ? { userId: store?.Auth?.user?.id } : qaId ? { userId: qaId } : {}) }));
                                                    }
                                                }}
                                                placeholder="Select Project"
                                                isSearchable
                                                isClearable
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '30px',
                                                        height: '30px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontSize: '12px'
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        padding: '0 8px'
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        margin: '0px',
                                                        fontSize: '12px'
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        fontSize: '12px'
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        fontSize: '12px'
                                                    }),
                                                    option: (base) => ({
                                                        ...base,
                                                        fontSize: '12px'
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        height: '30px'
                                                    }),
                                                    menu: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                <div className='milestoneSelector' style={{ width: '160px' }}>
                                    <Controller
                                        name="milestone"
                                        control={control}
                                        value={milestoneData?.length > 0 && projectSelected ?
                                            { value: milestoneSelected, label: milestoneData.find(p => p._id === milestoneSelected)?.title } : null}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={milestoneData?.length > 0 && milestoneSelected ?
                                                    { value: milestoneSelected, label: milestoneData.find(p => p._id === milestoneSelected)?.title } : null}
                                                options={milestoneData?.filter(milestone =>
                                                    store?.Auth?.user?.role === 'Marketing'
                                                        ? milestone?.title?.toLowerCase()?.includes('marketing')
                                                        : true
                                                )?.map(milestone => ({
                                                    value: milestone?._id,
                                                    label: milestone?.title
                                                }))}
                                                onChange={(option) => {
                                                    field.onChange(option);
                                                    setMilestoneSelected(option?.value || null);
                                                    dispatch(getSingleSprint({ isActive: true, id: option?.value, skip: 1, limit: 50 }));
                                                }}
                                                onInputChange={(inputValue) => {
                                                    if (inputValue !== '') {
                                                        let data = {
                                                            id: projectSelected,
                                                            isActive: true,
                                                            skip: 1,
                                                            mileStoneId: '',
                                                            search: inputValue
                                                        };
                                                        dispatch(getsingleMileStone(data));
                                                    }
                                                }}
                                                placeholder={selectedDepartment === 'Marketing' ? 'Select Sprint' : "Select Milestone"}
                                                isSearchable
                                                isClearable
                                                isLoading={store?.getMilestoneForTaskReducer?.loading}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '30px',
                                                        height: '30px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        fontSize: '12px'
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        padding: '0 8px'
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        margin: '0px',
                                                        fontSize: '12px'
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        fontSize: '12px'
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        fontSize: '12px'
                                                    }),
                                                    option: (base) => ({
                                                        ...base,
                                                        fontSize: '12px'
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        height: '30px'
                                                    }),
                                                    menu: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                            />
                                        )}
                                    />
                                </div>
                                {selectedDepartment === 'Tech' && (
                                    <div className='sprintSelector' style={{ width: '160px' }}>
                                        <Controller
                                            name="sprint"
                                            control={control}
                                            options={sprintData?.filter(sprint =>
                                                store?.Auth?.user?.role === 'Marketing'
                                                    ? sprint?.sprintName?.toLowerCase()?.includes('marketing')
                                                    : true
                                            )?.map(sprint => ({
                                                value: sprint?._id,
                                                label: sprint?.sprintName
                                            }))}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    value={sprintData?.length > 0 && sprintSelected ?
                                                        { value: sprintSelected, label: sprintData.find(p => p._id === sprintSelected)?.sprintName } : null}
                                                    options={sprintData?.map(sprint => ({
                                                        value: sprint?._id,
                                                        label: sprint?.sprintName,
                                                    })) || []}
                                                    onChange={(option) => {
                                                        field.onChange(option);
                                                        setSprintSelected(option?.value || null);
                                                    }}
                                                    onInputChange={(inputValue) => {
                                                        if (inputValue !== '') {
                                                            dispatch(getSingleSprint({ isActive: true, id: milestoneSelected, skip: 1, limit: 50, search: inputValue }));
                                                        }
                                                    }}
                                                    placeholder="Select Sprint"
                                                    isSearchable
                                                    isClearable
                                                    isLoading={store?.getAllSingleSprints?.loading}
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            minHeight: '30px',
                                                            height: '30px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            fontSize: '12px'
                                                        }),
                                                        valueContainer: (base) => ({
                                                            ...base,
                                                            padding: '0 8px'
                                                        }),
                                                        input: (base) => ({
                                                            ...base,
                                                            margin: '0px',
                                                            fontSize: '12px'
                                                        }),
                                                        singleValue: (base) => ({
                                                            ...base,
                                                            fontSize: '12px'
                                                        }),
                                                        placeholder: (base) => ({
                                                            ...base,
                                                            fontSize: '12px'
                                                        }),
                                                        option: (base) => ({
                                                            ...base,
                                                            fontSize: '12px'
                                                        }),
                                                        indicatorsContainer: (base) => ({
                                                            ...base,
                                                            height: '30px'
                                                        }),
                                                        menu: (base) => ({ ...base, zIndex: 9999 })
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                                {store?.Auth?.user?.role !== 'Marketing' && (
                                    <div className='assigneeSelector' style={{ width: '160px' }}>
                                        <Controller
                                            name="assignee"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    value={assigneeSelected && assigneesFilter?.find(u => u._id === assigneeSelected) ?
                                                        { value: assigneeSelected, label: assigneesFilter.find(u => u._id === assigneeSelected)?.name } : null}
                                                    options={assigneesFilter?.map(user => ({
                                                        value: user?._id,
                                                        label: user?.name
                                                    })) || []}
                                                    onChange={(option) => {
                                                        field.onChange(option);
                                                        setAssigneeSelected(option?.value || null);
                                                        dispatch(getsingleSprintTask({ projectId, assignee: option?.value }));
                                                    }}
                                                    onInputChange={(inputValue) => {
                                                        dispatch(getAllUsers({ search: inputValue }));
                                                    }}
                                                    placeholder="Select Assignee"
                                                    isSearchable
                                                    isClearable
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            minHeight: '30px',
                                                            height: '30px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            fontSize: '12px'
                                                        }),
                                                        valueContainer: (base) => ({
                                                            ...base,
                                                            padding: '0 8px'
                                                        }),
                                                        input: (base) => ({
                                                            ...base,
                                                            margin: '0px',
                                                            fontSize: '12px'
                                                        }),
                                                        singleValue: (base) => ({
                                                            ...base,
                                                            fontSize: '12px'
                                                        }),
                                                        placeholder: (base) => ({
                                                            ...base,
                                                            fontSize: '12px'
                                                        }),
                                                        option: (base) => ({
                                                            ...base,
                                                            fontSize: '12px'
                                                        }),
                                                        indicatorsContainer: (base) => ({
                                                            ...base,
                                                            height: '30px'
                                                        }),
                                                        menu: (base) => ({ ...base, zIndex: 9999 })
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                                <div className='dateRangeSelector' style={{ width: '160px', position: 'relative' }}>
                                    <DatePicker
                                        selectsRange
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={(update) => {
                                            const [start, end] = update;
                                            setStartDate(start);
                                            setEndDate(end);
                                        }}
                                        className="form-control"
                                        placeholderText="Select date range"
                                        popperProps={{ strategy: "fixed" }}
                                        popperPlacement="bottom"
                                        popperClassName="date-picker-popper"
                                        wrapperClassName="date-picker-wrapper"
                                        wrapperStyle={{
                                            width: '100%',
                                            height: '30px'
                                        }}
                                        calendarClassName="border-0 shadow"
                                        customInput={
                                            <input
                                                style={{
                                                    height: '30px',
                                                    padding: '0.375rem 0.75rem',
                                                    paddingRight: '15px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            />
                                        }
                                    />
                                    {(startDate || endDate) && (
                                        <span
                                            className=" p-0"
                                            style={{
                                                position: 'absolute',
                                                right: '2px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                zIndex: 1
                                            }}
                                            onClick={() => {
                                                setStartDate(null);
                                                setEndDate(null);
                                            }}
                                            title="Clear dates"
                                        >
                                            <i className="uil uil-times text-danger" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Pagesaddtask
                        className="d-none"
                        showModal={showModal}
                        closeModal={closeaddModal}
                        setShowModal={setShowModal}
                    />
                    {taskView === "Board" ?
                        store?.getSigleSprintTask?.loading || store?.getAllTaskStatusesReducer?.loading ? (
                            <MainLoader />
                        ) : projects?.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                                <div className="text-center text-muted">
                                    <i className="bi bi-inbox fs-1"></i>
                                    <p className="mt-3 fs-5">No data found</p>
                                </div>
                            </div>
                        ) : (
                            <Container>
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <TaskColumnStyles className='task-page-columns-dash'>
                                        {Object.entries(filteredColumns || {}).map(([columnId, column]) => (
                                            <div key={columnId} className="task-list-col">
                                                <TaskList>
                                                    <Title style={{ color: column?.color }}>
                                                        <span className='text-capitalize'>{column?.title === 'Testing' && selectedDepartment === "Marketing" ? "In Review" : column?.title}
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
                                                                {column?.items?.length > 0 ? (
                                                                    <>
                                                                        {column?.items?.slice(0, visibleItems[columnId] || 10).map((item, index) => (
                                                                            <Draggable isDragDisabled={store?.Auth?.user?.role !== 'QA'} key={item._id} draggableId={item._id} index={index}>
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
                                                                                        <QaTaskCard
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
                                                                                        // progressTimeLoading={progressTimeLoading}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </Draggable>
                                                                        ))}
                                                                        {column.items.length > (visibleItems[columnId] || 10) && (
                                                                            <div className="text-center mt-3 mb-2">
                                                                                <button
                                                                                    className="text-secondary border-0 d-flex align-items-center justify-content-center mx-auto"
                                                                                    style={{
                                                                                        padding: '8px 20px',
                                                                                        fontSize: '12px',
                                                                                        borderRadius: '20px',
                                                                                        background: 'transparent',
                                                                                        fontWeight: '600',
                                                                                        minWidth: '140px'
                                                                                    }}
                                                                                    onClick={() => setVisibleItems(prev => ({
                                                                                        ...prev,
                                                                                        [columnId]: (prev[columnId] || 10) + 10
                                                                                    }))}
                                                                                >
                                                                                    <i className="bi bi-chevron-down me-2" style={{ fontSize: '10px' }}></i>
                                                                                    <span>Load More</span>
                                                                                    <span className="badge bg-primary ms-2" style={{ fontSize: '9px', borderRadius: '10px' }}>
                                                                                        {column.items.length - (visibleItems[columnId] || 10)}
                                                                                    </span>
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="d-flex justify-content-center align-items-center h-100">
                                                                        <div className="text-center text-muted">
                                                                            <i className="bi bi-inbox fs-2"></i>
                                                                            <p className="mt-2">No data found</p>
                                                                        </div>
                                                                    </div>
                                                                )}
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
                        <TaskListView />}


                    <NewStatusModal
                        show={updateTaskStatusModal}
                        closeModal={closeUpdateStatusModal}
                        editData={editData}
                    />

                    <CsvExportModal
                        show={csvModalOpen}
                        onHide={() => setCsvModalOpen(false)}
                        projectId={projectSelected}
                        assigneeId={assigneeSelected}
                    />
                    <ConfirmationModal
                        show={showConfirmModal}
                        onHide={() => setShowConfirmModal(false)}
                        onConfirm={() => {
                            confirmAction();
                        }}
                        title="Confirm Timer Stop"
                        message="Stopping the timer will mark this task as Completed. Use Pause if you want to resume later. Continue?"
                    />
                </div>
            </div >
        </>
    );
};

export default QaDashboard;