import React, { useEffect, useRef, useState } from 'react'
import { Badge, Button, Col, ListGroup, ListGroupItem, Modal, Row } from 'react-bootstrap'
import { Controller, Form, useForm } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useQuillWordLimit from '../../../helpers/quillWordLimit';
import { toast } from 'react-toastify';
import { handleUpload } from '../../../constants/handleUpload';
import { useDispatch } from 'react-redux';
// import { AddComment, getAllUsers, getsingleSprintTask, updateTask } from '../../../redux/actions';
import axios from 'axios';
import MainLoader from '../../../constants/Loader/loader';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import DeletionModal from '../../../components/DeletionModal';


const TaskPreviewModal = ({ show, closeModal, setChangesDone, taskId = null }) => {
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
    const UserId = JSON.parse(sessionStorage.getItem('hyper_user'))?.id
    const authUser = useSelector(state => state?.Auth?.user);
    const defaultOption = {
        value: authUser?.id,
        label: `You (${authUser?.name})`
    };
    const users = useSelector(state => state?.getAllUsers?.data?.data);

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

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [deleteCommentModal, setDeleteCommentModal] = useState(false);
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    const fetchTaskDetails = async () => {
        setApiFetching(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/user/task/${taskId}`);
            if (response?.data) {
                setData(response?.data?.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setApiFetching(false);
        }
    };

    useEffect(() => {
        if (show && taskId) {
            fetchTaskDetails();
        }
    }, [show, taskId])


    useEffect(() => {
        if (updateTaskResponse === 200 || addCommentResponse === 201) {
            setChangesDone(true);
            setCommentText('');
            setActiveDropdown(null);
            fetchTaskDetails();
        }
    }, [updateTaskResponse, addCommentResponse]);

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
        if (data?.reporter?.name) {
            setValue('reporter', data?.reporter?.name)
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

    const handleUpdateTask = async (submitData) => {
        // dispatch(updateTask({ taskId: data?._id, body: submitData }))
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/user/task/${taskId}`, submitData)
            if (response?.status === 200) {
                toast.success('Task updated successfully');
                fetchTaskDetails();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
    const handleAddComment = async (newComment) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/user/task/${taskId}/comment`, newComment)
            if (response?.status === 201) {
                toast.success('Comment added successfully');
                fetchTaskDetails();
            }
        } catch (error) {
            console.error(error);
        }
    }

    const handleUpdateComment = async () => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/v1/user/task-comments/${editingCommentId}`, { comment: editCommentText });
            if (response?.data?.status === 200) {
                fetchTaskDetails();
                setEditingCommentId(null);
                setEditCommentText('');
            }
        } catch (error) {
            console.error(error);
        }
    }
    const closeDeleteModal = () => {
        setDeleteCommentId(null);
        setDeleteCommentModal(false);
    }

    const deleteSelectedComment = async () => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/user/task-comments/${deleteCommentId}`);
            if (response?.data?.status === 200) {
                fetchTaskDetails();
                closeDeleteModal();
            }
        } catch (error) {
            console.error(error);
        }
    }
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
                            <span className='bg-light fs-6 p-1 rounded'>{data?.sprint?.sprintName || 'N/A'}</span>
                            <i className="bi bi-arrow-right text-muted"></i>
                            <span className='bg-light fs-6 p-1 rounded'>{data?.summary}</span>

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
                        <Col className="pt-2 border-end d-flex flex-column" md={7} style={{ height: '75vh', overflowY: 'scroll', scrollbarWidth: 'thin', scrollbarColor: '#c1dfe9ff #e6f2f9', }}>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="row">
                                        <div className="col-4">
                                            <label
                                                style={{ fontSize: '12px' }}
                                                className='form-label mb-0'>
                                                Priority
                                            </label>
                                            <select
                                                disabled
                                                value={priority}
                                                style={{
                                                    color: priority === 'Critical' ? '#dc3545' :
                                                        priority === 'High' ? '#fd7e14' :
                                                            priority === 'Medium' ? '#198754' :
                                                                priority === 'Low' ? '#0d6efd' : 'inherit'
                                                }}
                                                className='form-select'>
                                                {priorityOptions.map(priority => (
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
                                                Estimated Time ( 5 hours max. )
                                            </label>
                                            <input
                                                disabled
                                                className="form-control"
                                                type="number"
                                                min={0}
                                                max={5}
                                                value={estimatedTime}
                                            />

                                        </div>

                                        <div className="col-4">
                                            <label style={{ fontSize: '12px' }} className='form-label mb-0'>Start Date</label>
                                            <input type='date'
                                                {...register('startDate')}
                                                disabled
                                                className='form-control' />
                                        </div>
                                        <div className="col-4">
                                            <label style={{ fontSize: '12px' }} className='form-label mb-0'>Due Date</label>
                                            <input type='date'
                                                {...register('dueDate')}
                                                disabled
                                                className='form-control' />
                                        </div>
                                        <div className="col-4">
                                            <label style={{ fontSize: '12px' }} className='form-label mb-0'>Reporter</label>
                                            <input type='text'
                                                {...register('reporter')}
                                                disabled
                                                className='form-control' />
                                        </div>

                                        {(data?.status === 'In Progress' || data?.status === 'To Do') && (
                                            <div className="col-4">
                                                <label style={{ fontSize: '12px' }} className='form-label mb-0'>Status</label>
                                                <select
                                                    defaultValue={data?.status}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (window.confirm(`Are you sure you want to mark this task as ${value}?`)) {
                                                            handleUpdateTask({ status: value, qastatus: 'Not Started' });
                                                        }
                                                    }}
                                                    className='form-select'
                                                >
                                                    <option value={data?.status} disabled hidden>{data?.status}</option>
                                                    {data?.status === 'To Do' && (
                                                        <>
                                                            <option value="In Progress">In Progress</option>
                                                        </>
                                                    )}
                                                    {data?.status === 'In Progress' && (
                                                        <option value="Testing">Testing</option>
                                                    )}
                                                </select>
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
                                                Save
                                            </button>
                                        </div>
                                    }
                                </div>

                                <div className='col-12 mb-3'>
                                    <h4 className="fs-5 fw-bold text-black mb-1">
                                        Description
                                    </h4>
                                    <Controller
                                        name="description"
                                        control={control}
                                        defaultValue="<ul><li></li></ul>"
                                        render={({ field: { onChange, value } }) => (
                                            <ReactQuill
                                                ref={quillRef}
                                                value={value}
                                                onChange={(content, delta, source) => {
                                                    if (source === 'user') {
                                                        const plainText = quillRef.current.getEditor().getText().trim();
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
                                                Save
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
                                    Comments
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
                                                        handleAddComment(newComment);
                                                        setCommentText('');
                                                    }
                                                }}
                                            >
                                                Post
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>

                            {/* Comments list */}
                            {/* <div
                                className="comments-list p-3 mt-2 pt-0 px-1"
                                style={{
                                    overflowY: 'scroll',
                                    maxHeight: '600px',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#dee2e6 #ffffff',
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
                                                    fontSize: "0.6rem"
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

                                                <div
                                                    className="p-1 px-2 fs-6 rounded mb-1"
                                                    style={{
                                                        backgroundColor: '#e9ecef',
                                                        color: '#212529',
                                                    }}
                                                >
                                                    {comment?.comment}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='text-center text-muted py-4'>
                                        <i className='bi bi-chat-dots fs-1 mb-2'></i>
                                        <p>No comments yet</p>
                                    </div>
                                )}
                            </div> */}
                            <div
                                className="comments-list p-3 mt-2 pt-0 px-1"
                                style={{
                                    overflowY: 'scroll',
                                    maxHeight: '600px',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#c1dfe9ff #e6f2f9',
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
                                                    fontSize: "0.6rem"
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
