import React, { useEffect, useRef, useState } from 'react'
import { Badge, Button, Col, ListGroup, ListGroupItem, Modal, Row } from 'react-bootstrap'
import { Controller, Form, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useQuillWordLimit from '../../../helpers/quillWordLimit';
import { toast } from 'react-toastify';
import { handleUpload } from '../../../constants/handleUpload';
import { useDispatch } from 'react-redux';
import { AddComment, deleteComment, getAllUsers, getsingleSprintTask, UpdateCommentAction, updateTask } from '../../../redux/actions';
import axios from 'axios';
import MainLoader from '../../../constants/Loader/loader';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import DeletionModal from '../../../constants/DeletionModal';
import { emojiRegex } from '../../../helpers/emojiRegex';


const TaskPreviewModal = ({ show, closeModal, setChangesDone, taskId = null, isStarted = false, stopTimerApi, timeTrackingId }) => {
    const quillRef = useRef(null);
    const {
        register,
        handleSubmit,
        reset, watch, setValue,
        formState: { errors }, control, getValues
    } = useForm();
    const store = useSelector((state) => state);

    const MAX_WORDS = 1000;
    const MAX_WORD_LENGTH = 45;

    const updateTaskResponse = store?.UpdateTaskReducer?.data?.status;
    const addCommentResponse = store?.AddCommentReducer?.data?.status;
    const deleteCommentResponse = store?.deleteCommentReducer?.data?.status;
    const updateCommentResponse = store?.updateCommentReducer?.data?.status;
    const authUser = useSelector(state => state?.Auth?.user);
    const defaultOption = {
        value: authUser?.id,
        label: `You (${authUser?.name || JSON.parse(localStorage.getItem('hyper_user'))?.username || ''})`
    };
    const users = useSelector(state => state?.getAllUsers?.data?.data);
    const selectedDepartment = localStorage.getItem('selectedDepartment');
    const [files, setFiles] = useState([]);
    const [filesUploading, setFilesUploading] = useState(false);
    const [data, setData] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(null);
    const [apiFetching, setApiFetching] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isEditingSummary, setIsEditingSummary] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [qaStatus, setQaStatus] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [deleteCommentModal, setDeleteCommentModal] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState(null);

    const deleteSelectedComment = () => {
        dispatch(deleteComment({ id: deleteCommentId }));
    }

    const closeDeleteModal = () => {
        setDeleteCommentId(null);
        setDeleteCommentModal(false);
    }

    const fetchTaskDetails = async () => {
        setApiFetching(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/task/${taskId}`);
            if (response?.data) {
                setData(response?.data?.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setApiFetching(false);
        }
    };
    const UserId = JSON.parse(localStorage.getItem('hyper_user'))?.id
    const CommentData = data?.comments


    useEffect(() => {
        if (show) {
            fetchTaskDetails();
        }
    }, [show])

    useEffect(() => {
        if (updateTaskResponse === 200) {
            setChangesDone(true);
            setCommentText('');
            setActiveDropdown(null);
            fetchTaskDetails();
        }
    }, [updateTaskResponse]);

    useEffect(() => {
        if (addCommentResponse === 201) {
            setChangesDone(true);
            setCommentText('');
            setActiveDropdown(null);
            fetchTaskDetails();
        }
    }, [addCommentResponse]);

    useEffect(() => {
        if (deleteCommentResponse === 200) {
            setChangesDone(true);
            fetchTaskDetails();
            closeDeleteModal();
        }
    }, [deleteCommentResponse]);

    useEffect(() => {
        if (updateCommentResponse === 200) {
            setChangesDone(true);
            setEditCommentText('');
            setEditingCommentId(null);
            fetchTaskDetails();
        }
    }, [updateCommentResponse]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.position-relative')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    useEffect(() => {
        if (data?.description) {
            setValue('description', data?.description || '')
        }
        if (data?.attachments?.length > 0) {
            setFiles(data?.attachments || [])
        }
        if (data?.comments?.length > 0) {
            setComments(data?.comments || [])
        }
        if (data?.priority) {
            setPriority(data?.priority || [])
        }
        if (data?.estimatedTime) {
            setEstimatedTime(data?.estimatedTime || [])
        }
        if (data?.startDate) {
            setValue('startDate', data?.startDate?.split('T')[0] || '')
        }
        if (data?.dueDate) {
            setValue('dueDate', data?.dueDate?.split('T')[0] || '')
        }
        if (data?.summary) {
            setSummaryText(data?.summary)
        }
        if (data?.qastatus) {
            setQaStatus(data?.qastatus)
        }
        if (data?.reporter) {
            setValue('reporter', {
                value: data.reporter._id,
                label: data.reporter.name
            } || null)
        }
    }, [data])

    const handleSubmitDates = (formData) => {
        const payload = {
            startDate: formData.startDate,
            dueDate: formData.dueDate
        };
        handleUpdateTask(payload);
    }

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return 'bi-file-earmark-pdf-fill text-danger';
            case 'png': case 'jpg': case 'jpeg': case 'gif': case 'webp': return 'bi-file-earmark-image-fill text-primary';
            case 'doc': case 'docx': return 'bi-file-earmark-word-fill text-info';
            case 'xls': case 'xlsx': return 'bi-file-earmark-excel-fill text-success';
            case 'ppt': case 'pptx': return 'bi-file-earmark-ppt-fill text-warning';
            case 'zip': case 'rar': return 'bi-file-earmark-zip-fill text-secondary';
            default: return 'bi-file-earmark-fill text-muted';
        }
    };

    const handlePreview = (url) => {
        window.open(url, '_blank');
    };

    const handleDownload = (url, fileName) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
    };

    const handleLimitExceed = ({ type, message }) => {
        toast.error(message);
    };

    useQuillWordLimit({
        quillRef,
        maxWords: MAX_WORDS,
        maxWordLength: MAX_WORD_LENGTH,
        onLimitExceed: handleLimitExceed,
        setValue,
        fieldName: 'note',
    });

    const handleFileChange = async (e) => {
        const filesToUpload = e.target.files;
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            // Add null check for fileUrl
            const fileUrl = await handleUpload(file, setFilesUploading);
            if (fileUrl) { // Check if fileUrl exists before adding
                setFiles(prevFiles => [...prevFiles, {
                    name: file.name,
                    url: fileUrl?.url?.split('?')[0]
                }]);
            }
        }
    };

    const dispatch = useDispatch();

    const updateTaskPreview = async (submitData) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/admin/task/${data?._id}`, submitData)
            if (response?.data?.status === 200) {
                fetchTaskDetails();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleUpdateTask = (submitData) => {
        setChangesDone(true);
        updateTaskPreview(submitData);
    }

    const fetchTaskPreviewApi = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/getTaskPreview`, { taskId: taskId });
            if (response?.data?.status === 200) {
                setActiveDropdown(true);
            }
        } catch (error) {
            console.error(error, 'This error is encountered in the fatchTaskPreviewApi function in the @TaskPreviewModal .');
        }
    }

    const handleUpdateComment = () => {

        dispatch(UpdateCommentAction({ taskId, id: editingCommentId, body: { comment: editCommentText } }))
    }

    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
    return (
        <Modal scrollable className={`task-preview-modal ${deleteCommentModal ? 'd-none' : ''}`} show={show} size='xl' centered onHide={closeModal}>
            <Modal.Header className='py-1 px-2 text-black gap-2 d-flex justify-content-between align-items-center fw-semibold'>
                <span className='fs-6 d-flex align-items-center gap-2'>
                    {apiFetching ? (
                        <>
                            <span className='bg-light p-1 rounded placeholder-wave'>
                                <span className="placeholder col-8" style={{ width: '80px', height: '20px' }}></span>
                            </span>
                            <i className="bi bi-arrow-right text-muted"></i>
                            <span className='bg-light p-1 rounded placeholder-wave'>
                                <span className="placeholder col-6" style={{ width: '120px', height: '20px' }}></span>
                            </span>
                            <i className="bi bi-arrow-right text-muted"></i>
                            <span className='bg-light p-1 rounded placeholder-wave'>
                                <span className="placeholder col-5" style={{ width: '100px', height: '20px' }}></span>
                            </span>
                            <i className="bi bi-arrow-right text-muted"></i>
                            <span className='bg-light p-1 rounded placeholder-wave'>
                                <span className="placeholder col-7" style={{ width: '150px', height: '20px' }}></span>
                            </span>
                        </>
                    ) : (
                        <>
                            <span className='bg-light fs-6 p-1 rounded'>{data?.project?.name}</span>
                            <i className="bi bi-arrow-right text-muted"></i>
                            <span className='bg-light fs-6 p-1 rounded'>{data?.milestone?.title || 'N/A'}</span>
                            <i className="bi bi-arrow-right text-muted"></i>
                            {selectedDepartment !== "Marketing" && (
                                <>
                                    <span className='bg-light fs-6 p-1 rounded'>{data?.sprint?.sprintName || 'N/A'}</span>
                                    <i className="bi bi-arrow-right text-muted"></i>
                                </>
                            )}
                            {isEditingSummary ? (
                                <div className='d-flex align-items-center gap-1'>
                                    <input
                                        type="text"
                                        value={summaryText}
                                        onChange={(e) => setSummaryText(e.target.value)}
                                        className='form-control form-control-sm '
                                        style={{ fontSize: '14px', padding: '2px 6px', width: '30vw' }}
                                        autoFocus
                                    />
                                    <i
                                        className="bi bi-check-lg text-success cp fs-5"
                                        onClick={() => {
                                            if (summaryText.trim()) {
                                                handleUpdateTask({ summary: summaryText });
                                                setIsEditingSummary(false);
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className='d-flex align-items-center gap-1'>
                                    <span className='bg-light fs-6 p-1 rounded'>{data?.summary}</span>
                                    <i
                                        className="bi bi-pencil text-muted cp fs-6"
                                        onClick={() => setIsEditingSummary(true)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </span>
                <i
                    onClick={() => closeModal()}
                    className="cp fs-4 bi bi-x-circle-fill" />
            </Modal.Header>
            <Modal.Body className='py-0' style={{ maxHeight: '80vh' }}>
                {apiFetching ?
                    <Row className='h-100 d-flex align-items-center justify-content-center'>
                        <MainLoader />
                    </Row>
                    :
                    <Row className='h-100'>
                        <Col className="pt-2 border-end d-flex flex-column" md={7} style={{ height: '75vh', overflowY: 'scroll', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #ecf5faff', }}>
                            <div className="row">
                                <div className="col-12 mb-1">
                                    <div className="row">
                                        <div className="col-4">
                                            <label
                                                style={{ fontSize: '12px' }}
                                                className='form-label mb-0'>
                                                Priority
                                            </label>
                                            <select
                                                value={priority}
                                                onChange={(e) => {
                                                    setPriority(e.target.value)
                                                    handleUpdateTask({
                                                        priority: e.target.value
                                                    })
                                                }}
                                                style={{
                                                    color: priority === 'Critical' ? '#dc3545' :
                                                        priority === 'High' ? '#fd7e14' :
                                                            priority === 'Medium' ? '#198754' :
                                                                priority === 'Low' ? '#0d6efd' : 'inherit'
                                                }}
                                                className='form-select'>
                                                {priorityOptions?.map(priority => (
                                                    <option
                                                        key={priority}
                                                        value={priority}
                                                        style={{
                                                            color: priority === 'Critical' ? '#dc3545' :
                                                                priority === 'High' ? '#fd7e14' :
                                                                    priority === 'Medium' ? '#198754' :
                                                                        priority === 'Low' ? '#0d6efd' : 'inherit'
                                                        }}
                                                    >
                                                        {priority}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-4">
                                            <label style={{ fontSize: '12px' }}
                                                className='form-label mb-0'>
                                                Estimated Time ( 8 hours max. )
                                            </label>
                                            <input
                                                className="form-control"
                                                type="number"
                                                min={0}
                                                max={8}
                                                step={0.5}
                                                value={estimatedTime}
                                                onChange={(e) => {
                                                    let value = e.target.value;

                                                    // Allow empty value for deletion or reset
                                                    if (value === '') {
                                                        setEstimatedTime('');
                                                        return;
                                                    }

                                                    // Allow decimal numbers
                                                    if (!/^\d*\.?\d*$/.test(value)) return;

                                                    const numericValue = parseFloat(value);

                                                    // Enforce range between 0 and 8
                                                    if (numericValue >= 0 && numericValue <= 8) {
                                                        setEstimatedTime(value);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    const numericValue = parseFloat(estimatedTime);

                                                    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 8) {
                                                        handleUpdateTask({ estimatedTime: numericValue });
                                                    } else {
                                                        // Reset or handle invalid value if needed
                                                        setEstimatedTime(''); // or keep the previous valid value
                                                    }
                                                }}
                                            />

                                        </div>
                                        <div className="col-4">
                                            <label style={{ fontSize: '12px' }} className='form-label mb-0'>Reporter</label>
                                            <Controller
                                                name="reporter"
                                                control={control}
                                                defaultValue={defaultOption}
                                                rules={{ required: 'Reporter is required' }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        options={[
                                                            defaultOption,
                                                            ...((users ?? []).map(user => ({
                                                                value: user?._id,
                                                                label: user?.name
                                                            }))),
                                                        ]}
                                                        onInputChange={(inputValue) => {
                                                            if (inputValue) {
                                                                dispatch(getAllUsers({ search: inputValue }));
                                                            }
                                                        }}
                                                        onChange={(data) => {
                                                            field.onChange(data);
                                                            handleUpdateTask({ reporter: data?.value });
                                                        }}
                                                        placeholder="Select Reporter"
                                                        isClearable
                                                        isSearchable
                                                    />
                                                )}
                                            />
                                            {errors.reporter && (
                                                <span className="text-danger">{errors.reporter.message}</span>
                                            )}
                                        </div>
                                        {(data?.status === 'Testing' || data?.status === 'On Hold' || data?.status === 'To Do') && (
                                            <div className="col-4">
                                                <label style={{ fontSize: '12px' }} className='form-label mb-0'>Status</label>
                                                <select
                                                    defaultValue={data?.status}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (window.confirm(`Are you sure you want to mark this task as ${value}?`)) {
                                                            handleUpdateTask({
                                                                status: value,
                                                                ...(value === 'Done' && { qaStatus: 'Completed' })
                                                            });
                                                        }
                                                    }}
                                                    className='form-select'
                                                >
                                                    <option value={data?.status} disabled hidden>{data?.status === "Testing" && selectedDepartment === "Marketing" ? "In Review" : data?.status}</option>
                                                    {data?.status === 'Testing' && (
                                                        <>
                                                            <option value="Done">Done</option>
                                                            <option value="On Hold">On Hold</option>
                                                        </>
                                                    )}
                                                    {data?.status === 'On Hold' && (
                                                        <option value="To Do">To Do</option>
                                                    )}
                                                    {data?.status === 'To Do' && (
                                                        <option value="On Hold">On Hold</option>
                                                    )}
                                                </select>
                                            </div>
                                        )}
                                        {data?.status === 'Testing' && (
                                            <div className="col-4">
                                                <label style={{ fontSize: '12px' }} className='form-label mb-0'>QA Status</label>
                                                <select className='form-select' onChange={(e) => {
                                                    setQaStatus(e.target.value);
                                                    handleUpdateTask({
                                                        qastatus: e.target.value
                                                    })
                                                }} value={qaStatus}>
                                                    <option value={''} key='' hidden>Select QA status</option>
                                                    {['Not Started', 'In Progress', 'Not Applicable', 'Deferred']?.map((qa) => (
                                                        <option value={qa} key={qa}>{qa}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {data?.status === 'To Do' && (
                                            <div className="col-4">
                                                <label style={{ fontSize: '12px' }} className='form-label mb-0'>Assignee</label>
                                                <Controller
                                                    name="taskAssignee"
                                                    control={control}
                                                    defaultValue={data?.assignee ? {
                                                        value: data?.assignee?._id,
                                                        label: data?.assignee?.name
                                                    } : null}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={data?.project?.team?.map(user => ({
                                                                value: user?._id,
                                                                label: user?.name
                                                            })) || []}
                                                            value={data?.assignee ? {
                                                                value: data?.assignee?._id,
                                                                label: data?.assignee?.name
                                                            } : null}
                                                            onChange={async (option) => {
                                                                if (window.confirm(`Are you sure you want to assign this task to ${option?.label}?`)) {
                                                                    handleUpdateTask({ assignee: option?.value })
                                                                }
                                                            }}
                                                            placeholder="Select Assignee"
                                                            isSearchable
                                                            isClearable
                                                            styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                        {/* {!data?.assignee && (
                                            <div className="col-4">
                                                <label style={{ fontSize: '12px' }} className='form-label mb-0'>Assignee</label>
                                                <Controller
                                                    name="taskAssignee"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={data?.project?.team?.map(user => ({
                                                                value: user?._id,
                                                                label: user?.name
                                                            })) || []}
                                                            onChange={async (option) => {
                                                                if (window.confirm(`Are you sure you want to assign this task to ${option?.label}?`)) {
                                                                    handleUpdateTask({ assignee: option.value })
                                                                }
                                                            }}
                                                            placeholder="Select Assignee"
                                                            isSearchable
                                                            isClearable
                                                            styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )} */}
                                        {/* {(data?.assignee?._id === store?.Auth?.user?.id || data?.assignee?._id === JSON.parse(localStorage?.getItem('hyper_user'))?.id) && data?.status === 'To Do' && (
                                            <div className="col-4">
                                                <label style={{ fontSize: '12px' }} className='form-label mb-0'>Assignee</label>
                                                <Controller
                                                    name="taskAssignee"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={data?.project?.team?.map(user => ({
                                                                value: user?._id,
                                                                label: user?.name
                                                            })) || []}
                                                            onChange={async (option) => {
                                                                handleUpdateTask({ assignee: option.value })
                                                            }
                                                            }
                                                            placeholder="Select Assignee"
                                                            isSearchable
                                                            isClearable
                                                            styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )} */}
                                        <div className="col-4">
                                            <label style={{ fontSize: '12px' }} className='form-label mb-0'>Start Date</label>
                                            <input type='date'
                                                {...register('startDate')}
                                                onChange={(e) => handleUpdateTask({ startDate: e.target.value })}
                                                className='form-control' />
                                        </div>
                                        <div className="col-4">
                                            <label style={{ fontSize: '12px' }} className='form-label mb-0'>Due Date</label>
                                            <input type='date'
                                                {...register('dueDate')}
                                                onChange={(e) => handleUpdateTask({ dueDate: e.target.value })}
                                                className='form-control' />
                                        </div>
                                        {data?.status === 'Testing' && (
                                            <div className="col-4">
                                                <label style={{ fontSize: '12px' }} className='form-label mb-0'>Reassign to</label>
                                                <Controller
                                                    name="assignee"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            // value={users?.length > 0 ?
                                                            //     users?.map((user) => (
                                                            //         { value: user?._id, label: user?.name }
                                                            //     ))
                                                            //     : null}
                                                            options={data?.project?.team?.map(user => ({
                                                                value: user?._id,
                                                                label: user?.name
                                                            })) || []}
                                                            onChange={async (option) => {
                                                                try {
                                                                    const payload = {
                                                                        taskId: data?._id,
                                                                        assigneeId: option?.value
                                                                    }
                                                                    if (isStarted) {
                                                                        stopTimerApi(taskId, timeTrackingId, true);
                                                                    } else {
                                                                        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/task/re-assign`, payload)
                                                                        if (response.status === 200) {
                                                                            fetchTaskDetails();
                                                                            setChangesDone(true);
                                                                        }
                                                                    }
                                                                } catch (error) {
                                                                    console.error(error);
                                                                }
                                                                field.onChange(option);
                                                            }}
                                                            // onInputChange={(inputValue) => {
                                                            //     dispatch(getAllUsers({ search: inputValue }));
                                                            // }}
                                                            placeholder="Select Assignee"
                                                            isSearchable
                                                            isClearable
                                                            styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='col-12 mb-3'>
                                    <h4 className="fs-5 fw-bold text-black mb-1">
                                        Attachments
                                        <i
                                            onClick={() => document.getElementById('fileInput').click()}
                                            className='bi bi-plus-circle ms-1 fs-6 cp text-danger'
                                        />
                                    </h4>
                                    <div className="mb-2">
                                        <input
                                            type="file"
                                            id="fileInput"
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                            multiple
                                            onInput={(e) => {
                                                const files = e.target.files;
                                                for (let i = 0; i < files.length; i++) {
                                                    if (files[i].size > 25 * 1024 * 1024) {
                                                        e.target.value = '';
                                                        toast.error('File size should not exceed 25MB');
                                                        return;
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    {files?.length > 0 ? (
                                        <div className='row g-1'>
                                            {files?.map((attachment, index) => (
                                                <div className="col-6">
                                                    <div key={attachment._id || index} className='d-flex align-items-center justify-content-between p-1 bg-light border'>
                                                        <div className='d-flex align-items-center gap-2 flex-1'>
                                                            <i className={`fs-4 bi ${getFileIcon(attachment.name)}`}></i>
                                                            <div className='flex-1'>
                                                                <strong className='fs-6 text-dark text-truncate' title={attachment.name}>
                                                                    {attachment?.name?.length > 20 ? attachment?.name?.slice(0, 19) + '...' : attachment?.name}
                                                                </strong>

                                                            </div>
                                                        </div>
                                                        <div className='d-flex gap-1'>
                                                            <i
                                                                title='Preview'
                                                                onClick={() => handlePreview(attachment.url)}
                                                                className='bi bi-box-arrow-up-right cp text-info fs-6'></i>
                                                            <i title='Download'
                                                                onClick={() => handleDownload(attachment.url, attachment.name)}
                                                                className='bi cp ms-1 text-success bi-download fs-6'></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='text-center text-muted py-4'>
                                            <i className='bi bi-paperclip fs-1 mb-2'></i>
                                            <p>No attachments found</p>
                                        </div>
                                    )}
                                    {filesUploading && (
                                        <div className='row g-1 mt-2'>
                                            <div className="col-6">
                                                <div className='d-flex align-items-center justify-content-between p-1 bg-light border placeholder-wave'>
                                                    <div className='d-flex align-items-center gap-2 flex-1'>
                                                        <span className="placeholder fs-4" style={{ width: '24px', height: '24px' }}></span>
                                                        <div className='flex-1'>
                                                            <span className="placeholder col-8" style={{ height: '16px' }}></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {files?.length > (data?.attachments?.length || 0) &&
                                        <div className="mt-1 d-flex justify-content-end">
                                            <button onClick={() => {
                                                const payload = {
                                                    attachments: files
                                                }
                                                handleUpdateTask(payload)
                                            }} className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                                                style={{ padding: '4px 12px', fontSize: '11px' }}>
                                                {`Save`}
                                            </button>
                                        </div>
                                    }
                                </div>

                                <div className='col-12 mb-3'>
                                    <h4 className="fs-5 fw-bold text-black mb-1">
                                        {`Description`}
                                    </h4>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <ReactQuill
                                                ref={quillRef}
                                                value={value}
                                                onChange={(content, delta, source) => {
                                                    if (source === 'user') {
                                                        const plainText = quillRef.current.getEditor().getText().trim();

                                                        if (emojiRegex.test(plainText)) {
                                                            const editor = quillRef.current.getEditor();
                                                            editor.history.undo();
                                                            return;
                                                        }

                                                        const words = plainText.split(/\s+/).filter(Boolean);
                                                        if (words.length > MAX_WORDS) {
                                                            const editor = quillRef.current.getEditor();
                                                            editor.history.undo();
                                                            toast.error(`Word limit of ${MAX_WORDS} words exceeded`);
                                                            return;
                                                        }
                                                        onChange(content);
                                                    }
                                                }}
                                                theme="snow"
                                                placeholder="Enter detailed description here..."
                                                style={{ height: '200px', marginBottom: '50px' }}
                                                modules={{
                                                    toolbar: [
                                                        ['bold', 'italic', 'underline'],
                                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                        ['link'],
                                                        ['clean']
                                                    ]
                                                }}
                                            />
                                        )}
                                    />
                                    {getValues('description') !== data?.description &&
                                        <div className="mt-1 d-flex justify-content-end">
                                            <button onClick={() => {
                                                const payload = {
                                                    description: getValues('description')
                                                }
                                                handleUpdateTask(payload)
                                            }} className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                                                style={{ padding: '4px 12px', fontSize: '11px' }}>
                                                {`Save`}
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>
                        </Col>
                        <Col className="pt-2 d-flex flex-column" md={5} style={{ height: '75vh' }}>
                            <div>
                                <h4 className="fs-5 fw-bold text-black mb-2">
                                    <i class="me-1 fs-5 bi bi-chat-dots"></i>
                                    {`Comments`}
                                </h4>

                                <div className="mb-0">
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Write a comment..."
                                    />
                                    {commentText !== '' &&
                                        <div className="d-flex justify-content-end my-1">
                                            <button
                                                className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                                                style={{ padding: '4px 12px', fontSize: '11px' }}
                                                onClick={() => {
                                                    if (commentText.trim()) {
                                                        const newComment = {
                                                            user: store?.Auth?.user?.id,
                                                            date: Date.now(),
                                                            comment: commentText,
                                                        };
                                                        // const updatedComments = [...(data?.comments || []), newComment];
                                                        // const payload = {
                                                        //     comments: updatedComments,
                                                        // };
                                                        // handleUpdateTask(payload);
                                                        dispatch(AddComment({ taskId: data?._id, body: newComment }))
                                                        setCommentText('');
                                                    }
                                                }}
                                            >
                                                {`Post`}
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>

                            {/* Comments list */}
                            <div
                                className="comments-list p-3 mt-2 pt-0 px-1"
                                style={{
                                    overflowY: 'scroll',
                                    maxHeight: '600px',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#c1dfe9ff #e6f2f9'
                                }}
                            >
                                {data?.comments?.length > 0 ? (
                                    data.comments.map((comment, index) => (
                                        <div key={index} className="d-flex mb-2">
                                            <p
                                                className="me-2 my-0 d-flex align-items-center justify-content-center rounded-circle"
                                                style={{
                                                    width: '22px',
                                                    height: '22px',
                                                    backgroundColor: '#dee2e6',
                                                    color: '#495057',
                                                    fontWeight: '700',
                                                    fontSize: "0.6rem",
                                                    flexShrink: 0
                                                }}
                                            >
                                                {comment?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </p>

                                            <div style={{ flex: 1 }}>
                                                <div className="mb-1">
                                                    <strong className="fs-6 text-dark">{comment?.user?.name || 'Unknown User'}</strong>
                                                    <span
                                                        className="ms-2"
                                                        style={{ color: '#6c757d', fontSize: '0.82rem' }}
                                                    >
                                                        {comment?.date && new Date(comment.date).toLocaleString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false,
                                                        })}
                                                    </span>
                                                </div>

                                                {editingCommentId === comment?._id ? (
                                                    <div className="p-1 px-2 fs-6 rounded mb-1">
                                                        <textarea
                                                            className="form-control"
                                                            value={editCommentText}
                                                            onChange={(e) => setEditCommentText(e.target.value)}
                                                            rows="2"
                                                            autoFocus
                                                        />
                                                        <div className="d-flex justify-content-end gap-1">
                                                            <i
                                                                className="bi bi-check-circle-fill text-success fs-5"
                                                                style={{ cursor: 'pointer' }}
                                                                title='Save changes'
                                                                onClick={() => {
                                                                    if (editCommentText.trim()) {
                                                                        handleUpdateComment();
                                                                        setEditingCommentId(null);
                                                                    }
                                                                }}
                                                            ></i>
                                                            <i
                                                                className="bi bi-x-circle-fill text-danger fs-5"
                                                                title='Cancel'
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => {
                                                                    setEditingCommentId(null);
                                                                }}
                                                            ></i>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="p-1 px-2 fs-6 rounded mb-1 d-flex justify-content-between"
                                                        style={{
                                                            backgroundColor: '#e9ecef',
                                                            color: '#212529',
                                                        }}
                                                    >
                                                        <div>{comment?.comment}</div>
                                                        {comment?.user?._id === UserId && (

                                                            <div className="d-flex align-items-center">
                                                                <i
                                                                    className="bi bi-pencil-square me-2"
                                                                    style={{ cursor: 'pointer' }}
                                                                    onClick={() => {
                                                                        setEditingCommentId(comment?._id);
                                                                        setEditCommentText(comment?.comment);
                                                                    }}
                                                                ></i>
                                                                <i onClick={() => {
                                                                    setDeleteCommentId(comment?._id);
                                                                    setDeleteCommentModal(true);
                                                                    // dispatch(deleteComment({ id: comment?._id }))
                                                                }} className="bi cp bi-trash" style={{ cursor: 'pointer' }}></i>
                                                                <DeletionModal show={deleteCommentModal} onHide={closeDeleteModal} item='comment' onConfirm={deleteSelectedComment} isLoading={store?.deleteCommentReducer?.loading} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='text-center text-muted py-4'>
                                        <i className='bi bi-chat-dots fs-1 mb-2'></i>
                                        <p>No comments yet</p>
                                    </div>
                                )}
                            </div>
                        </Col>

                    </Row>
                }
            </Modal.Body>
        </Modal >
    )
}

export default TaskPreviewModal;
