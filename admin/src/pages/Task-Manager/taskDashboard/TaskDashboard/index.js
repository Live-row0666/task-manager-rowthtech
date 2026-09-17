import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import MainLoader from '../../../../constants/Loader/loader';
import Pagesaddtask from '../../../../layouts/AllPagesRightbar';
import NewStatusModal from '../../TaskBoard/NewStatusModal';
import CsvExportModal from '../CsvExportModal';
import {
    getsingleSprintTask, getComment, gettaskId,
    getBugs, getSubTask, getAllTaskStatusesAction,
    getAllUsers, getAllProjects,
    getsingleMileStone,
    getSingleSprint
} from '../../../../redux/actions';
import { IoMdDownload } from "react-icons/io";
import axios from 'axios';
import moment from 'moment/moment';
import DescriptionOffCanvas from '../../../../components/DescriptionOffCanvas';
import TaskPreviewModal from '../TaskPreviewModal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TimeDisplay from '../../../../components/TimeDisplay';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getScopedUserIdParams } from '../../../../helpers/scopeUserParams';
import '../datepicker-styles.css';
import TaskListView from '../TaskList';
import MarketingTeamDashboard from '../MarketingDashboard/MarketingTeamDashboard';
import FreelanceTeamDashboard from '../FreelanceDashboard/FreelanceTeamDashboard';
import { useSearchParams } from 'react-router-dom';


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
            default: return 'rgba(255, 234, 0, 0.5)';
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

const AdminTaskDashboard = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state || {});
    const scopedUserParams = getScopedUserIdParams(store?.Auth?.user?.role, store?.Auth?.user?.id);
    const [searchParams] = useSearchParams();
    const overviewTaskId = searchParams.get("overviewTaskId");       // string | null
    const overviewProjectId = searchParams.get("overviewProjectId"); // string | null


    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [projectSelected, setProjectSelected] = useState(null);
    const [assigneeSelected, setAssigneeSelected] = useState(null);
    const isMarketing = searchParams.get('isMarketing');
    const { control } = useForm();
    const projectTaskStatuses = store?.getAllTaskStatusesReducer?.data?.data || [];
    const getSingleSprintTask = store?.getSigleSprintTask?.data?.data || [];
    const projects = store?.getProject?.data?.data || [];
    const milestoneData = useSelector(state => state?.getSigleMileStone?.data?.data || []);
    const sprintData = useSelector(state => state?.getAllSingleSprints?.data?.data || []);
    const [columns, setColumns] = useState({});
    const [updateTaskStatusModal, setUpdateTaskStatusModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [timeTrackingData, setTimeTrackingData] = useState({});
    const [progressTimeLoading, setProgressTimeLoading] = useState(false);
    const [milestoneSelected, setMilestoneSelected] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [assigneesFilter, setAssigneesFilter] = useState([])
    const [taskView, setTaskView] = useState((store?.Auth?.user?.role === 'Marketing' || store?.Auth?.user?.role === 'Freelancers' || isMarketing === 'true') ? 'List view' : 'Board')
    const [sprintSelected, setSprintSelected] = useState(null);
    const [visibleItems, setVisibleItems] = useState({});
    const projectId = projectSelected;
    const assigneeId = assigneeSelected;
    const selectedDepartment = localStorage.getItem('selectedDepartment') || 'Tech';

    useEffect(() => {
        dispatch(getAllProjects({
            status: true,
            projectType: selectedDepartment,
            projectStatus: '',
            skip: 1,
            ...scopedUserParams
        }));
        dispatch(getAllUsers({ userType: selectedDepartment }));
    }, [dispatch]);

    useEffect(() => {
        if (overviewProjectId && overviewTaskId) {
            setProjectSelected(overviewProjectId);
        }
    }, [overviewProjectId, overviewTaskId])

    useEffect(() => {
        if (Array.isArray(projects) && projects.length > 0 && !projectSelected && !overviewProjectId && !overviewTaskId) {
            setProjectSelected(projects[0]?._id);
            setAssigneesFilter(projects[0]?.team || []);
        }
    }, [projects, projectSelected, overviewProjectId, overviewTaskId]);

    useEffect(() => {
        if (getSingleSprintTask && Array.isArray(getSingleSprintTask)) {
            const initialColumns = {};
            const initialVisibleItems = {};

            // Use DB statuses if available, else fallback to default 5 columns
            const statusList = (projectTaskStatuses && Array.isArray(projectTaskStatuses) && projectTaskStatuses.length > 0)
                ? projectTaskStatuses
                : [
                    { _id: 'ToDo',       name: 'To Do',       color: '#6c757d' },
                    { _id: 'InProgress', name: 'In Progress', color: '#0d6efd' },
                    { _id: 'Testing',    name: 'Testing',     color: '#6f42c1' },
                    { _id: 'OnHold',     name: 'On Hold',     color: '#fd7e14' },
                    { _id: 'Done',       name: 'Done',        color: '#198754' },
                ];

            statusList.forEach(status => {
                if (status && status._id && status.name) {
                    const statusTasks = getSingleSprintTask.filter(task => task?.status === status?.name) || [];
                    initialColumns[status._id] = {
                        _id: status._id,
                        title: status.name,
                        items: statusTasks,
                        count: statusTasks.length,
                        color: status.color || '#6c757d'
                    };
                    initialVisibleItems[status._id] = 10;
                }
            });
            setColumns(initialColumns);
            setVisibleItems(initialVisibleItems);
        }
    }, [projectTaskStatuses, getSingleSprintTask]);

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
            Object.entries(columns || {}).map(([key, column]) => [
                key,
                {
                    ...column,
                    items: (column?.items || []).filter(task =>
                        task?.summary?.toLowerCase()?.includes(search.toLowerCase()) ||
                        task?.description?.toLowerCase()?.includes(search.toLowerCase())
                    )
                }
            ])
        ) : columns || {};

    useEffect(() => {
        if (projectSelected || assigneeSelected) {
            dispatch(getAllTaskStatusesAction({ projectId }));
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

    const inProgressSection = Object.values(filteredColumns || {}).find(
        col => col?.title === 'In Progress'
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
        if (Array.isArray(projects) && projectSelected) {
            const selectedProject = projects.find((project) => project?._id === projectSelected);
            if (selectedProject?.name?.trim() === 'IMS') {
                setIsIMS(true);
            } else {
                setIsIMS(false);
            }
        } else {
            setIsIMS(false);
        }
    }, [projectSelected, projects])


    return (
        <>

            {(store?.Auth?.user?.role === 'Marketing' || store?.Auth?.user?.role === 'Freelancers') ?
                store?.Auth?.user?.role === 'Marketing' ? <MarketingTeamDashboard /> : <FreelanceTeamDashboard />
                :
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
                                                    options={Array.isArray(projects) ? projects.map(project => ({
                                                        value: project?._id,
                                                        label: project?.name || 'Unnamed Project',
                                                        team: project?.team || []
                                                    })) : []}
                                                    onChange={(option) => {
                                                        field.onChange(option);
                                                        setProjectSelected(option?.value || null);
                                                        setAssigneesFilter(option?.team || []);
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
                                                            dispatch(getAllProjects({ status: true, projectType: selectedDepartment, projectStatus: '', skip: 1, search: inputValue, ...scopedUserParams }));
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
                                                    options={Array.isArray(milestoneData) ? milestoneData.filter(milestone =>
                                                        store?.Auth?.user?.role === 'Marketing'
                                                            ? milestone?.title?.toLowerCase()?.includes('marketing')
                                                            : true
                                                    ).map(milestone => ({
                                                        value: milestone?._id,
                                                        label: milestone?.title || 'Unnamed Milestone'
                                                    })) : []}
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
                                                        options={Array.isArray(sprintData) ? sprintData.map(sprint => ({
                                                            value: sprint?._id,
                                                            label: sprint?.sprintName || 'Unnamed Sprint'
                                                        })) : []}
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
                                                        options={Array.isArray(assigneesFilter) ? assigneesFilter.map(user => ({
                                                            value: user?._id,
                                                            label: user?.name || 'Unnamed User'
                                                        })) : []}
                                                        onChange={(option) => {
                                                            field.onChange(option);
                                                            setAssigneeSelected(option?.value || null);
                                                            dispatch(getsingleSprintTask({ projectId, assignee: option?.value }));
                                                        }}
                                                        onInputChange={(inputValue) => {
                                                            dispatch(getAllUsers({ search: inputValue, userType: selectedDepartment }));
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
                                                                            {(overviewTaskId && overviewProjectId
                                                                                ? column?.items?.filter(item => item._id === overviewTaskId)
                                                                                : column?.items?.slice(0, visibleItems[columnId] || 10)
                                                                            ).map((item, index) => (
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
                                                                                                assigneeId={assigneeId}
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
                                                                            {!overviewTaskId && column.items.length > (visibleItems[columnId] || 10) && (
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
                            : <TaskListView />}


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

                    </div>
                </div >
            }
        </>
    );
};

// TaskCard Component with full API integration
const TaskCard = ({ item, projectId, assigneeId, closeModal, progressTimeLoading, isInProgressColumn, timeTrackingData, onTaskDelete }) => {
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
            dispatch(getsingleSprintTask({ projectId, assignee: assigneeId || '' }));
        }
    }

    // useEffect(() => {
    //     if (store?.UpdateTaskReducer?.data?.status === 200) {
    //         // dispatch({ type: TASK_TYPES.UPDATE_TASK_RESET });
    //         dispatch(getsingleSprintTask({ projectId }));
    //     }
    // }, [store?.UpdateTaskReducer?.data?.status])

    // Convert seconds to milliseconds for TimeDisplay component
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
                    <div className="row"
                        onClick={() => {
                            setTaskPreviewModal(true)
                            setChangesDone(false);
                        }}
                    >
                        <div
                            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)' }}
                            className="col-12 pe-0 d-flex gap-1">
                            <div className="w-75 d-flex gap-1 align-items-center">
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Priority</Tooltip>}
                                >
                                    <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                                        <PriorityBadge priority={item?.priority}>
                                            {item?.priority || 'No Priority'}
                                        </PriorityBadge>
                                    </div>
                                </OverlayTrigger>
                                {useMemo(() => {
                                    const isOverdue = moment(item?.dueDate).add(30, 'seconds').isBefore(moment()) &&
                                        (item?.status === 'In Progress' || item?.status === 'To Do' || item?.status === 'Testing');

                                    return isOverdue ? (
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                height: '20px',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '20px',
                                                fontSize: '0.5rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                background: 'rgba(255, 165, 0, 0.22)',
                                                whiteSpace: 'nowrap',
                                                color: 'orange'
                                            }}
                                        >
                                            Overdue
                                        </span>
                                    ) : (
                                        <span
                                            className="text-success"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                height: '20px',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '20px',
                                                fontSize: '0.5rem',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                background: 'rgba(0, 255, 38, 0.1)',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            On Time
                                        </span>
                                    );
                                }, [item?.dueDate, item?.status])}

                                {item?.status === 'Testing' && (
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={
                                            <Tooltip>
                                                {item?.qastatus
                                                    ? `QA Status: ${item.qastatus}`
                                                    : 'Quality Assurance'}
                                            </Tooltip>
                                        }
                                    >
                                        <div style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                                            <PriorityBadge>
                                                {item?.qastatus || 'QA Pending'}
                                            </PriorityBadge>
                                        </div>
                                    </OverlayTrigger>
                                )}

                            </div>
                            {item?.status !== 'Done' && (
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Due Date</Tooltip>}
                                >
                                    <div className="w-25 text-end text-nowrap pe-1">
                                        <small className='w-100'>
                                            {item?.dueDate ? moment(item?.dueDate).format('DD MMM') : ''}
                                        </small>
                                    </div>
                                </OverlayTrigger>
                            )}                        </div>
                        <div
                            style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)' }}
                            className="col-12 pt-1 pb-0">
                            {item?.summary?.length > 250 ? item?.summary?.slice(0, 249) + '...' : item?.summary || 'No summary'}
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
                                </div>
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
                                    className='d-flex fw-bold bg-primary text-white cp align-items-center justify-content-center'
                                    style={{
                                        borderRadius: '100%',
                                        width: '23px',
                                        height: '23px',
                                        fontSize: '9px'
                                    }}
                                >
                                    {item?.assignee?.name ?
                                        item?.assignee?.name?.split(' ')?.map(word => word?.[0])?.join('') || 'UA'
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

            {/* <Pagesaddtask
                className="d-none"
                showModal={openEditModal}
                closeModal={closeupdatemodal}
                setShowModal={setOpenEditModal}
                editData={editData}
            /> */}
        </>
    );
};

export default AdminTaskDashboard;