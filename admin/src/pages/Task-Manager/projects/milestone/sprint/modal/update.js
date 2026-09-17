import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Controller, useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import ToastHandle from '../../../../../../constants/toaster/toaster';
import { useDispatch, useSelector } from 'react-redux';
import { updateSprint, getSingleSprint, getSprintForTaskAction } from '../../../../../../redux/actions';
import MainLoader from '../../../../../../constants/Loader/loader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { parseISO } from 'date-fns';
import { handleUpload } from '../../../../../../constants/handleUpload';
import { toast } from 'react-toastify';
import useQuillWordLimit from '../../../../../../helpers/quillWordLimit';
import { emojiRegex } from '../../../../../../helpers/emojiRegex';
import Select from 'react-select';
import ConfirmationModal from '../../../modal/ConfirmationModal';
const Update = ({ modal, closeModal, editData, milestoneId, projectId, teamAllocated = [] }) => {
    const quillRef = useRef(null);
    const MAX_WORDS = 1000;
    const MAX_WORD_LENGTH = 45;
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const sucesshandel = store?.updateSprint;
    const loaderhandel = store?.updateSprint;
    const projectData = store?.getProjectById?.data?.data;
    const users = useSelector(state => state?.getAllUsers?.data?.data);
    const GetAllSingleSprintData = store?.getAllSingleSprints?.data?.data;
    const milestoneData = GetAllSingleSprintData?.[0]?.milestone;
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [attachments, setAttachments] = useState([]);
    const [tasks, setTasks] = useState(['']);
    const [assignees, setAssignees] = useState([null]);
    const [taskStartDates, setTaskStartDates] = useState([null]);
    const [taskEndDates, setTaskEndDates] = useState([null]);
    const [description, setDescription] = useState('');
    const today = new Date();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingSubmitData, setPendingSubmitData] = useState(null);
    const handleStartDate = (date) => {
        setStartDate(date);
    };

    const handleEndDate = (date) => {
        setEndDate(date);
    };
    const {
        register,
        handleSubmit,
        control,
        watch, setValue,
        reset,
        formState: { errors },
    } = useForm();
    const [filesUploading, setFilesUploading] = useState(false);

    const handleFileChange = async (e) => {
        const filesToUpload = e.target.files;
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            // Add null check for fileUrl
            const fileUrl = await handleUpload(file, setFilesUploading);
            if (fileUrl) { // Check if fileUrl exists before adding
                setAttachments(prevFiles => [...prevFiles, {
                    name: file.name,
                    url: fileUrl?.url?.split('?')[0]
                }]);
            }
        }
    };

    const removeAttachment = (index) => {
        const updatedAttachments = [...attachments];
        updatedAttachments.splice(index, 1);
        setAttachments(updatedAttachments);
    };

    const CloseModaal = (e) => {
        if (e) e.preventDefault();
        closeModal();
    };

    const onSubmit = (val) => {
        // Validate tasks if any task has content
        const hasAnyTaskContent = tasks.some(task => task.trim() !== '');

        if (hasAnyTaskContent) {
            // Check if all tasks with content have all required fields
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].trim() !== '') {
                    if (!taskEndDates[i]) {
                        ToastHandle('error', `Task ${i + 1}: End date is required`);
                        return;
                    }
                }
            }
        }

        const taskData = tasks?.filter(item => item.trim() !== '')?.map((item, index) => ({
            summary: item,
            project: projectId,
            milestone: milestoneId,
            ...(assignees[index]?.value && { assignee: assignees[index]?.value }),
            startDate: taskStartDates[index] ? taskStartDates[index].toISOString() : null,
            endDate: taskEndDates[index] ? taskEndDates[index].toISOString() : null
        }));

        let body = {
            sprintName: val?.Name,
            sprintDesc: val?.description,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            priority: val?.priority,
            attachments: attachments,
            task: taskData,
        };

        // Check if sprint end date exceeds milestone or project completion date
        const milestoneEndDate = milestoneData?.completionDate;
        const projectEndDate = projectData?.end;

        if (endDate && ((milestoneEndDate && new Date(endDate) > new Date(milestoneEndDate)) ||
            (projectEndDate && new Date(endDate) > new Date(projectEndDate)))) {
            setPendingSubmitData({ body, sprintId: editData?._id });
            setShowConfirmModal(true);
            return;
        }

        dispatch(updateSprint({ body, sprintId: editData?._id }));
    };
    const addTask = () => {
        if (tasks.length >= 20) {
            ToastHandle('error', 'Maximum 20 tasks allowed');
            return;
        }
        setTasks([...tasks, '']);
        setAssignees([...assignees, null]);
        setTaskStartDates([...taskStartDates, null]);
        setTaskEndDates([...taskEndDates, null]);
    };

    const removeTask = (index) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter((_, i) => i !== index));
            setAssignees(assignees.filter((_, i) => i !== index));
            setTaskStartDates(taskStartDates.filter((_, i) => i !== index));
            setTaskEndDates(taskEndDates.filter((_, i) => i !== index));
        }
    };

    const updateTask = (index, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[index] = value;
        setTasks(updatedTasks);
    };

    const updateAssignee = (index, option) => {
        const updatedAssignees = [...assignees];
        updatedAssignees[index] = option;
        setAssignees(updatedAssignees);
    };

    const updateTaskStartDate = (index, date) => {
        const updatedDates = [...taskStartDates];
        updatedDates[index] = date;
        setTaskStartDates(updatedDates);
    };

    const updateTaskEndDate = (index, date) => {
        const updatedDates = [...taskEndDates];
        updatedDates[index] = date;
        setTaskEndDates(updatedDates);
    };

    const handleClose = () => {
        reset();
        setStartDate(null);
        setEndDate(null);
        setAttachments([]);
        setTasks(['']);
        setAssignees([null]);
        setTaskStartDates([null]);
        setTaskEndDates([null]);
        setDescription('');
        closeModal();
    };

    useEffect(() => {
        reset({
            Name: editData?.sprintName,
            priority: editData?.priority || 'Medium',
        });
        setValue('description', editData?.sprintDesc || '');
        if (editData?.startDate || editData?.endDate) {
            try {
                const parsedStartDate = parseISO(editData?.startDate);
                const parsedEndDate = parseISO(editData?.endDate);

                if (parsedStartDate) {
                    setStartDate(parsedStartDate);
                }

                if (parsedEndDate) {
                    setEndDate(parsedEndDate);
                }
            } catch (error) {
                console.error('Invalid date format:', error);
            }
        }
        if (editData?.attachments?.length) {
            setAttachments(editData?.attachments);
        }
        if (editData?.tasks?.length) {
            setTasks(editData?.tasks);
            // Initialize assignees and dates arrays based on existing tasks
            const taskCount = editData.tasks.length;
            setAssignees(new Array(taskCount).fill(null));
            setTaskStartDates(new Array(taskCount).fill(null));
            setTaskEndDates(new Array(taskCount).fill(null));
        } else {
            setTasks(['']);
            setAssignees([null]);
            setTaskStartDates([null]);
            setTaskEndDates([null]);
        }
    }, [modal, editData]);

    useEffect(() => {
        if (sucesshandel?.data?.status == 200) {
            dispatch(getSingleSprint({ isActive: true, id: milestoneId, skip: 1 }));
            dispatch(getSprintForTaskAction({ isActive: true, id: milestoneId, skip: 1 }));
            reset();
            setStartDate(null);
            setEndDate(null);
            setAttachments([]);
            setTasks(['']);
            setAssignees([null]);
            setTaskStartDates([null]);
            setTaskEndDates([null]);
            setDescription('');
            closeModal('render');
        } else if (sucesshandel?.data?.status == 400) {
            ToastHandle('error', sucesshandel?.data?.message);
        } else if (sucesshandel?.data?.status == 500) {
            ToastHandle('error', sucesshandel?.data?.message);
        }
    }, [sucesshandel?.data?.status]);

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
    return (
        <>
            <Modal show={modal} onHide={handleClose} size="xl" className={`taskModal ${showConfirmModal ? 'd-none' : ''}`}>
                <Modal.Header className='py-2'>
                    <Modal.Title className='text-black fw-bold' style={{ fontSize: '14px' }}>Update Sprint</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa', maxHeight: '77vh', overflowY: 'scroll' }}>
                        {loaderhandel.loading ? (
                            <MainLoader />
                        ) : (
                            <div className="bg-white p-2 rounded-3 shadow-sm">
                                {/* Basic Information Section */}
                                <div className="mb-2">
                                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                        <i className="fas fa-info-circle me-2"></i>Basic Information
                                    </h6>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                                <Form.Label className='mb-0 small'>
                                                    Sprint Name <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    className='form'
                                                    type="text"
                                                    placeholder="Enter sprint name"
                                                    {...register('Name', { required: true, pattern: /^[^\s].*$/ })}
                                                />
                                                {errors.Name?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                                {errors.Name?.type === 'pattern' && (
                                                    <span className="text-danger"> Empty fields / space at first character is not allowed</span>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group className="mb-2" controlId="priority">
                                                <Form.Label className='mb-0 small'>
                                                    Priority <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Select
                                                    className='formSelect'
                                                    {...register('priority', { required: true })}
                                                    defaultValue="Medium"
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </Form.Select>
                                                {errors.priority?.type === 'required' && (
                                                    <span className="text-danger"> This field is required *</span>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}></Col>


                                    </Row>
                                </div>

                                {/* Timeline Section */}
                                <div className="mb-2">
                                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                        <i className="fas fa-calendar-alt me-2"></i>Timeline
                                    </h6>
                                    <Row>
                                        <Col lg={6}>
                                            <Form.Group className="mb-2" controlId="startDate">
                                                <Form.Label className="w-100 mb-0 small">
                                                    Start Date <span className="text-danger">*</span>
                                                </Form.Label>
                                                <DatePicker
                                                    selected={startDate}
                                                    onChange={(date) => handleStartDate(date)}
                                                    placeholderText="dd-mm-yyyy"
                                                    required
                                                    className="form-control form"
                                                    dateFormat='dd/MM/yyyy'
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col lg={6}>
                                            <Form.Group className="mb-2" controlId="endDate">
                                                <Form.Label className="w-100 mb-0 small">
                                                    End Date <span className="text-danger">*</span>
                                                </Form.Label>
                                                <DatePicker
                                                    selected={endDate}
                                                    disabled={!startDate}
                                                    onChange={(date) => handleEndDate(date)}
                                                    minDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : null}
                                                    placeholderText="dd-mm-yyyy"
                                                    required
                                                    className="form-control form"
                                                    dateFormat='dd/MM/yyyy'
                                                />
                                            </Form.Group>
                                        </Col>

                                    </Row>
                                </div>

                                {/* Tasks Section */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom">
                                        <h6 className="text-dark fw-bold mb-0  pb-1">
                                            <i className="fas fa-tasks me-2"></i>Tasks
                                        </h6>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <small className="text-muted">({tasks.length}/20)</small>
                                            <button
                                                type="button"
                                                className="btn btn-outline-dark btn-sm d-flex align-items-center gap-1"
                                                onClick={addTask}
                                                disabled={tasks.length >= 20}
                                                style={{ fontSize: '11px', padding: '4px 16px' }}
                                            >
                                                <i className="bi bi-plus-circle"></i>
                                                Add Task
                                            </button>
                                        </div>
                                    </div>

                                    <div className="task-list-container">

                                        {tasks?.map((task, index) => (
                                            <Row key={index} className="mb-2 p-2 border rounded-2 bg-light align-items-center mx-1">
                                                <Col sm={3}>
                                                    <Form.Control
                                                        className='form'
                                                        type="text"
                                                        placeholder='Enter task name'
                                                        value={task}
                                                        onChange={(e) => updateTask(index, e.target.value)}
                                                    />
                                                </Col>
                                                <Col sm={3}>
                                                    <Select
                                                        value={assignees[index]}
                                                        options={
                                                            teamAllocated?.length > 0
                                                                ? teamAllocated.map(user => ({
                                                                    value: user._id,
                                                                    label: user.name
                                                                }))
                                                                : projectData?.team?.map(user => ({
                                                                    value: user._id,
                                                                    label: user.name
                                                                }))
                                                        }
                                                        onChange={(option) => updateAssignee(index, option)}
                                                        placeholder="Select Assignee"
                                                        isClearable
                                                        isSearchable
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
                                                </Col>
                                                <Col sm={3}>
                                                    <DatePicker
                                                        selected={taskStartDates[index]}
                                                        onChange={(date) => updateTaskStartDate(index, date)}
                                                        placeholderText="Start date"
                                                        className="form-control form"
                                                    />
                                                </Col>
                                                <Col sm={3} className="d-flex align-items-center gap-2">
                                                    <DatePicker
                                                        selected={taskEndDates[index]}
                                                        onChange={(date) => updateTaskEndDate(index, date)}
                                                        minDate={taskStartDates[index] ? new Date(taskStartDates[index].getTime() + 24 * 60 * 60 * 1000) : null}
                                                        disabled={!taskStartDates[index]}
                                                        placeholderText="End date"
                                                        className="form-control form"
                                                    />
                                                    {tasks.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => removeTask(index)}
                                                            title="Remove Task"
                                                            style={{ fontSize: '12px', padding: '2px 6px' }}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </Col>

                                            </Row>
                                        ))}
                                    </div>

                                    <div className="mt-2">
                                        <small className="text-muted">Maximum 20 tasks allowed</small>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="mb-2">
                                    <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                        <i className="fas fa-file-alt me-2"></i>Details
                                    </h6>
                                    <Row>
                                        <Col lg={12}>
                                            <Form.Group className="mb-2" controlId="attachments">
                                                <Form.Label className='mb-0 small'>
                                                    Attachments&nbsp;
                                                    <i
                                                        onClick={() => document.getElementById('fileInput').click()}
                                                        className='bi bi-plus-circle cp text-danger'
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </Form.Label>
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
                                                {filesUploading ? (
                                                    <div className="mt-2 d-flex flex-wrap gap-2">
                                                        {[...Array(3)].map((_, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="d-flex shadow-sm w-25 justify-content-between p-0 align-items-center mb-2"
                                                                style={{ height: '30px', borderRadius: '4px' }}
                                                            >
                                                                <div className="w-100 h-100 placeholder placeholder-wave rounded-2" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    attachments?.length > 0 && (
                                                        <div className="mt-2 d-flex flex-wrap gap-2">
                                                            {attachments?.map((file, index) => (
                                                                <div key={index} className="d-flex shadow-sm border justify-content-between p-1 px-2 align-items-center mb-2">
                                                                    <span
                                                                        className="me-2"
                                                                        style={{ fontSize: '12px', cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                                                                        onClick={() => {
                                                                            window.open(file?.url, '_blank')
                                                                        }}
                                                                        title="Click to open attachment"
                                                                    >
                                                                        {file?.name || file}
                                                                    </span>
                                                                    <i
                                                                        onClick={() => removeAttachment(index)}
                                                                        className="bi bi-x-circle cp text-danger"
                                                                        style={{ cursor: 'pointer' }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col lg={12}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className='mb-0 d-flex justify-content-between small'>Description   <small className="text-muted">
                                                    {(() => {
                                                        const content = watch('description') || '';
                                                        const plainText = quillRef?.current?.getEditor()?.getText()?.trim();
                                                        const words = plainText?.split(/\s+/)?.filter(Boolean);
                                                        const wordCount = words?.length;
                                                        return (
                                                            <div>
                                                                <div>{`${wordCount || 0} / ${MAX_WORDS} words`}</div>
                                                            </div>
                                                        );
                                                    })()}
                                                </small>
                                                </Form.Label>
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
                                                            placeholder="Enter detailed notes here..."
                                                            style={{ height: '150px', marginBottom: '50px' }}
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
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className="btn btn-outline-secondary fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-dark text-white fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            disabled={store?.updateSprint?.loading}
                        >
                            {store?.updateSprint?.loading ? 'Updating...' : 'Update Sprint'}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    if (pendingSubmitData) {
                        dispatch(updateSprint(pendingSubmitData));
                        setShowConfirmModal(false);
                        setPendingSubmitData(null);
                    }
                }}
                title="Extend Timeline"
                message={`The sprint end date extends beyond the milestone or project completion date. This will automatically extend the timeline. Do you want to continue?`}
            />
        </>
    );
};

export default Update;
