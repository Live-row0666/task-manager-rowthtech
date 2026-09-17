import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { getsingleSprintTask, updateTask } from '../../../redux/task/action';
import MainLoader from '../../../constants/Loader/loader';
import Pagination from '@mui/material/Pagination';
import ToastHandle from '../../../constants/toaster/toaster';
import Create from './modal/create';
import { getAllProjects } from '../../../redux/projects/action';
import Pagesaddtask from '../../../layouts/AllPagesRightbar';
import { getAllUsers } from '../../../redux/actions';
import useScrollRestoration from '../../../hooks/useScrollRestoration';

const TaskList = () => {

    const { projectId, milestoneId, spriteId } = useParams();
    const [skip, setSkip] = useState(1);
    const store = useSelector((state) => state);
    const [openModal, SetOpenModal] = useState(false);
    const dispatch = useDispatch();
    const [checkedData, setCheckedData] = useState();
    const [checkedStatus, setCheckedStatus] = useState();
    const [render, setRender] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [taskStatus, setTaskStatus] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const getSingleSprintTask = store?.getSigleSprintTask?.data?.data;
    const deletehandle = store?.TaskStatusReducer?.data;
    const loaderhandel = store?.getSigleSprintTask;

    // Use scroll restoration hook
    useScrollRestoration([getSingleSprintTask, skip, taskStatus]);

    const handleAssigneeFilterChange = (e) => {
        const selectedAssigneeId = e.target.value;
        dispatch(getsingleSprintTask({
            id: spriteId,
            skip: 1,
            taskStatus,
            projectId,
            milestoneId,
            assigneeId: selectedAssigneeId
        }));
    }

    const handlePaginationChange = (event, value) => {
        setSkip(value);
        dispatch(getsingleSprintTask({
            id: spriteId,
            taskStatus,
            skip: value,
            projectId,
            milestoneId
        }));
    };

    const closeModal = (val) => {
        if (val === 'render') {
            setRender(!render);
        }
        SetOpenModal(false);
    };



    const handleStatusChange = (e, data) => {
        setCheckedStatus(e.target.checked);
        setCheckedData(data);
        setStatusModal(true);
    };

    const handleYes = () => {
        const body = {
            taskId: checkedData._id,
            activeStatus: checkedStatus
        };
        dispatch(updateTask(body));
        setStatusModal(false);
    };

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    useEffect(() => {
        if (deletehandle?.status === 200) {
            ToastHandle('success', deletehandle?.message);
            closeModal('render');
        } else if (deletehandle?.status === 400 || deletehandle?.status === 500) {
            ToastHandle('error', deletehandle?.message);
        }
    }, [deletehandle]);

    useEffect(() => {
        dispatch(getAllProjects({
            status: 1,
            skip: '',
            projectStatus: '',
            ...(store?.Auth?.user?.role === 'QA' || store?.Auth?.user?.role === 'Sales' && { userId: store?.Auth?.user?.id })
        }));
    }, [render, dispatch]);

    const handleTaskStatus = (val) => {
        const statusValue = parseInt(val, 10);
        setTaskStatus(statusValue);
        setSkip(1);
        dispatch(getsingleSprintTask({
            id: spriteId,
            skip: 1,
            taskStatus: statusValue,
            projectId,
            milestoneId
        }));
    };

    const closeaddModal = () => {
        setShowModal(false);
    }

    const getShortSummaryHTML = (summary) => {
        if (!summary) return '';
        const words = summary.split(' ');
        const shortText = words.slice(0, 3).join(' ');
        return words.length > 3 ? `${shortText}...` : shortText;
    }

    return (
        <>
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="mb-2">
                        <div className='d-flex justify-content-between align-items-center'>
                            <div className="d-flex align-items-center"></div>
                            <div className="d-flex align-items-center gap-2">
                                {/* Task Status Filter Dropdown */}
                                {/* <div className="d-flex align-items-center">
                                    <label className="form-label mb-0 me-2 fw-semibold" style={{ fontSize: '12px' }}>Status:</label>
                                    <Form.Select
                                        value={taskStatus}
                                        onChange={(e) => handleTaskStatus(e.target.value)}
                                        style={{ fontSize: '11px', width: '120px', padding: '4px 8px' }}
                                        className="form-select-sm"
                                    >
                                        <option value={1}>Todo</option>
                                        <option value={2}>In Progress</option>
                                        <option value={3}>Testing</option>
                                        <option value={4}>Done</option>
                                        <option value={5}>Hold</option>
                                    </Form.Select>
                                </div> */}
                                <Pagesaddtask
                                    className="d-none"
                                    showModal={showModal}
                                    closeModal={closeaddModal}
                                    setShowModal={setShowModal}
                                />
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', scrollBehavior: 'smooth' }} data-scroll-key="task-list-table">
                        {loaderhandel.loading ? (
                            <MainLoader />
                        ) : getSingleSprintTask?.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <h5 className="text-muted">No Tasks Found</h5>
                            </div>
                        ) : (
                            <div className="table-responsive h-100">
                                <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px', overflow: 'hidden' }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '5%' }}>#</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '15%' }}>Summary</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Description</th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '12%' }}>
                                                <select
                                                    name="assigneeFilter"
                                                    className="form-select border-0 p-0 text-white fw-bold bg-transparent"
                                                    onChange={handleAssigneeFilterChange}
                                                    style={{ fontSize: '11px' }}
                                                >
                                                    <option value="" className="text-dark">Assignee</option>
                                                    {store?.getAllUsers?.data?.response?.map((ele, ind) => (
                                                        <option key={ind} value={ele?._id} className="text-dark">
                                                            {ele?.firstName} {ele?.lastName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </th>
                                            <th className='fw-bold fs-6 text-start' style={{ width: '12%' }}>Reporter</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>Priority</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Start Date</th>
                                            <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>End Date</th>
                                            {/* <th className='fw-bold fs-6 text-center' style={{ width: '8%' }}>Status</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getSingleSprintTask?.map((item, index) => (
                                            <tr className="align-middle" key={item._id} style={{ transition: 'all 0.2s ease' }}>
                                                <td className="text-center fw-bold" style={{ fontSize: '12px' }}>{(skip - 1) * 10 + index + 1}</td>
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <span className="text-dark text-capitalize" title={item?.summary}>
                                                        {item?.summary?.split(' ')?.slice(0, 3).join(' ')}{item?.summary?.split(' ').length > 3 ? '...' : ''}
                                                    </span>
                                                </td>
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <div
                                                        title={item?.summary}
                                                        dangerouslySetInnerHTML={{
                                                            __html: getShortSummaryHTML(item?.summary),
                                                        }}
                                                    />
                                                </td>
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <span className="text-dark text-capitalize">
                                                        {item?.assignee?.name || "Unassigned"}
                                                    </span>
                                                </td>
                                                <td className="text-start" style={{ fontSize: '12px' }}>
                                                    <span className="text-dark">
                                                        {item?.reporter?.name}
                                                    </span>
                                                </td>

                                                <td className='text-center' style={{ fontSize: '12px' }}>
                                                    <span className="badge py-1 text-white" style={{
                                                        fontSize: '10px',
                                                        backgroundColor: item?.priority === 'Critical' ? '#dc3545' :
                                                            item?.priority === 'High' ? '#fd7e14' :
                                                                item?.priority === 'Medium' ? '#ffc107' : '#28a745'
                                                    }}>
                                                        {item?.priority}
                                                    </span>
                                                </td>
                                                <td className='text-center' style={{ fontSize: '12px' }}>
                                                    <span className="text-muted">
                                                        {moment.utc(item?.startDate).format("DD/MM/YYYY")}
                                                    </span>
                                                </td>
                                                <td className='text-center' style={{ fontSize: '12px' }}>
                                                    <span className="text-muted">
                                                        {moment.utc(item?.dueDate).format("DD/MM/YYYY")}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {store?.getSigleSprintTask?.data?.totalPages > 0 && (
                        <div className="d-flex justify-content-end mt-3 pt-2 border-top">
                            <Pagination
                                page={skip}
                                count={store?.getSigleSprintTask?.data?.totalPages}
                                color="primary"
                                variant="outlined"
                                onChange={handlePaginationChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modals  */}
            <Create modal={openModal} CloseModal={closeModal} />
            <Modal show={statusModal} onHide={() => setStatusModal(false)}>
                <Modal.Body>
                    Are you sure you want to {!checkedStatus ? 'deactivate' : 'activate'} this Task?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" className='border-0'
                        onClick={() => setStatusModal(false)}>No</Button>
                    <Button variant="primary" className='web_buttons bg-black text-white border-0' onClick={() => handleYes()}>Yes</Button>
                </Modal.Footer>
            </Modal>


        </>
    );
};

export default TaskList;
