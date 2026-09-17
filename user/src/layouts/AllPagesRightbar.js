import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, getAllProjects, getAllUsers, getSingleSprint } from '../redux/actions';
import { getsingleMileStone } from '../redux/milestone/action';
import { Form, Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import '../../node_modules/react-datepicker/dist/react-datepicker.css';
import ToastHandle from '../constants/toaster/toaster';
import Select from 'react-select';
import { handleUpload } from '../constants/handleUpload';

export default function Pagesaddtask(props) {
    const [startDate, setStartDate] = useState();
    const [dueDate, setDueDate] = useState();
    const [files, setFiles] = useState([]);
    const [projectSelected, setProjectSelected] = useState(null);
    const [milestoneSelected, setMilestoneSelected] = useState(null);
    const [milestoneType, setMilestoneType] = useState(null);
    const [sprintSelected, setSprintSelected] = useState(null);
    const [priority, setPriority] = useState('Medium');
    const [input, setInput] = useState('');
    const [labels, setLabels] = useState([]);
    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }, control
    } = useForm();
    const { showModal, setShowModal } = props;

    const store = useSelector((state) => state);
    const defaultOption = {
        value: store?.Auth?.user?.id,
        label: `You (${store?.Auth?.user?.name})`
    };
    const projects = store?.getProject?.data?.data;
    const users = store?.getAllUsers?.data?.data;
    const createResponse = store?.createTaskReducer?.data?.status;
    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
    // const workTypes = ['Task', 'Story', 'Bug', 'Epic'];
    const workTypes = ['Bug', 'Sprint'];
    const statusOptions = ['To Do', 'In Progress', 'Done', 'Blocked'];

    const [filesUploading, setFilesUploading] = useState(false);
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

    const removeFile = (index) => {
        const updatedFiles = [...files];
        updatedFiles.splice(index, 1);
        setFiles(updatedFiles);
    };

    const handleStartDate = (date) => {
        setStartDate(date);
    };

    const handleDueDate = (date) => {
        setDueDate(date);
    };

    const onSubmit = (data) => {
        data.project = data.project?.value;
        data.assignee = data.assignee?.value;
        data.reporter = data.reporter?.value;
        data.milestone = data.milestone?.value;
        data.sprint = data.sprint?.value;
        data.attachments = files;
        data.startDate = startDate;
        data.dueDate = dueDate;
        data.labels = labels;

        const cleanedData = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) =>
                    value !== '' &&
                    value !== null &&
                    value !== undefined &&
                    !(Array.isArray(value) && value.length === 0)
            )
        );

        dispatch(createTask(cleanedData));
    };


    const handleClose = () => {
        reset();
        setShowModal(false);
        setStartDate(null);
        setDueDate(null);
        setFiles([]);
        setProjectSelected(null);
        setMilestoneSelected(null);
        setMilestoneType(null);
        setSprintSelected(null);
    };

    useEffect(() => {
        if (createResponse === 201) {
            reset();
            setLabels([]);
            setDueDate();
            setStartDate();
            setFiles([]);
            handleClose();

        }
    }, [createResponse]);



    // useEffect(() => {
    //     if (milestoneType && projectSelected) {
    //         dispatch(getsingleMileStone({
    //             id: projectSelected,
    //             activeStatus: milestoneType === 'active',
    //             skip: 1
    //         }));
    //     }
    // }, [milestoneType, projectSelected, dispatch]);

    useEffect(() => {
        if (!users?.length && showModal) {
            dispatch(getAllUsers())
        }
    }, [dispatch, showModal])


    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && input.trim() !== '') {
            e.preventDefault();

            const trimmedInput = input.trim();

            if (labels.includes(trimmedInput)) {
                ToastHandle('danger', `Label "${trimmedInput}" already exists.`);
                return;
            }

            if (labels.length >= 5) {
                ToastHandle('danger', 'You can only add up to 5 labels.');
                return;
            }

            setLabels([...labels, trimmedInput]);
            setInput('');
        }
    };

    const removeLabel = (labelToRemove) => {
        setLabels(labels.filter(label => label !== labelToRemove));
    };

    return (
        <Modal show={showModal} onHide={handleClose} backdrop="static" className='taskModal' centered size="xl">
            <Modal.Header className='py-2'>
                <Modal.Title className='text-black fs-5 fw-bold'>Add Task</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-1" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="bg-white p-1 rounded-3 shadow-sm" style={{
                        maxHeight: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}>
                        {/* Basic Information Section */}
                        <div className="mb-1">
                            <h6 className="text-primary fw-bold mb-1 border-bottom pb-1" style={{ fontSize: '13px' }}>
                                <i className="fas fa-info-circle me-1"></i>Basic Information
                            </h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Summary<span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Task Summary"
                                            {...register('summary', { required: true, pattern: /^[^\s].*$/ })}
                                        />
                                        {errors.summary?.type === 'required' && (
                                            <span className="text-danger">This field is required</span>
                                        )}
                                        {errors.summary?.type === 'pattern' && (
                                            <span className="text-danger">Cannot start with empty space</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                {/* <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Work Type <span className='text-danger'>*</span></Form.Label>
                                        <Form.Select
                                            {...register('workType', { required: true })}
                                        >
                                            {workTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Form.Select>
                                        {errors.workType?.type === 'required' && (
                                            <span className="text-danger">This field is required</span>
                                        )}
                                    </Form.Group>
                                </Col> */}
                            </Row>
                        </div>

                        {/* Project Details Section */}
                        <div className="mb-1">
                            <h6 className="text-success fw-bold mb-1 border-bottom pb-1" style={{ fontSize: '13px' }}>
                                <i className="fas fa-project-diagram me-1"></i>Project Details
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>
                                            Project<span className="text-danger">*</span>
                                        </Form.Label>
                                        <Controller
                                            name="project"
                                            control={control}
                                            defaultValue={null}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={projects?.map(project => ({
                                                        value: project?._id,
                                                        label: project?.name
                                                    }))}
                                                    onChange={(option) => {
                                                        field.onChange(option); // Updates react-hook-form
                                                        setProjectSelected(option?.value || null); // Your own local state (if needed)
                                                        dispatch(getsingleMileStone({
                                                            id: option?.value,
                                                            isActive: true,
                                                            skip: 1,
                                                        }));
                                                    }}
                                                    onInputChange={(inputValue) => {
                                                        dispatch(getAllProjects({ status: true, projectStatus: 'Ongoing', skip: 1, search: inputValue }));
                                                    }}
                                                    placeholder="Select Project"
                                                    isClearable
                                                    isSearchable
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Milestone</Form.Label>
                                        <Controller
                                            name="milestone"
                                            control={control}
                                            defaultValue={null}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={store?.getSigleMileStone?.data?.data?.map(milestone => ({
                                                        value: milestone?._id,
                                                        label: milestone?.title
                                                    }))}
                                                    onChange={(option) => {
                                                        field.onChange(option);
                                                        setMilestoneSelected(option?.value || null)
                                                        if (option?.value) {
                                                            dispatch(getSingleSprint({ isActive: true, id: option?.value, skip: 1 }));
                                                        }
                                                    }}
                                                    onInputChange={(inputValue) => {
                                                        if (inputValue && projectSelected) {
                                                            dispatch(getsingleMileStone({
                                                                id: projectSelected,
                                                                isActive: true,
                                                                skip: 1,
                                                                search: inputValue
                                                            }));
                                                        }
                                                    }}
                                                    placeholder="Select Milestone"
                                                    isClearable
                                                    isSearchable
                                                    isDisabled={!projectSelected}
                                                    isLoading={store?.getSigleMileStone?.loading}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Sprint</Form.Label>
                                        <Controller
                                            name="sprint"
                                            control={control}
                                            defaultValue={null}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={store?.getAllSingleSprints?.data?.data?.map(sprint => ({
                                                        value: sprint?._id,
                                                        label: sprint?.sprintName
                                                    }))}
                                                    onChange={(option) => {
                                                        field.onChange(option);
                                                        setSprintSelected(option?.value || null);
                                                    }}
                                                    onInputChange={(inputValue) => {
                                                        if (inputValue && milestoneSelected) {
                                                            dispatch(getSingleSprint({ isActive: true, id: milestoneSelected, skip: 1, search: inputValue }));
                                                        }
                                                    }}
                                                    placeholder="Select Sprint"
                                                    isClearable
                                                    isSearchable
                                                    isDisabled={!milestoneSelected}
                                                    isLoading={store?.getAllSingleSprints?.loading}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Work Type <span className='text-danger'>*</span></Form.Label>
                                        <Form.Select
                                            {...register('workType', { required: true })}
                                        >
                                            <option value='' hidden>Select Work Type</option>
                                            {workTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Form.Select>
                                        {errors.workType?.type === 'required' && (
                                            <span className="text-danger">This field is required</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select
                                            {...register('status')}
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Assignee</Form.Label>
                                        <Controller
                                            name="assignee"
                                            control={control}
                                            defaultValue={null}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={users?.map(user => ({
                                                        value: user._id,
                                                        label: user.name
                                                    }))}
                                                    onInputChange={(inputValue) => {
                                                        dispatch(getAllUsers({ search: inputValue }));
                                                    }}
                                                    placeholder="Select Project"
                                                    isClearable
                                                    isSearchable
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Reporter<span className="text-danger">*</span></Form.Label>
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
                                                    placeholder="Select Reporter"
                                                    isClearable
                                                    isSearchable
                                                />
                                            )}
                                        />
                                        {errors.reporter && (
                                            <span className="text-danger">{errors.reporter.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Task Configuration Section */}
                        <div className="mb-1">
                            <h6 className="text-warning fw-bold mb-1 border-bottom pb-1" style={{ fontSize: '13px' }}>
                                <i className="fas fa-cogs me-1"></i>Task Configuration
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Priority</Form.Label>
                                        <Form.Select
                                            value={priority}
                                            {...register('priority', { required: true })}
                                            onChange={(e) => setPriority(e.target.value)}
                                            style={{
                                                color: priority === 'Critical' ? '#dc3545' :
                                                    priority === 'High' ? '#fd7e14' :
                                                        priority === 'Medium' ? '#198754' :
                                                            priority === 'Low' ? '#0d6efd' : 'inherit'
                                            }}
                                        >
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
                                        </Form.Select>
                                        {errors.priotity?.type === 'required' && (
                                            <span className="text-danger">This field is required</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Labels</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter label and press Enter"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12} className='d-flex align-items-center mb-1'>
                                    {labels?.map((label, index) => (
                                        <Badge
                                            key={index}
                                            bg="primary"
                                            className="me-2"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => removeLabel(label)}
                                        >
                                            {label} &times;
                                        </Badge>
                                    ))}
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Start Date</Form.Label>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={handleStartDate}
                                            placeholderText="Select start date"
                                            className="form-control"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Due Date</Form.Label>
                                        <DatePicker
                                            selected={dueDate}
                                            onChange={handleDueDate}
                                            placeholderText="Select due date"
                                            minDate={startDate}
                                            className="form-control"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Estimated Time (hours)<span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            placeholder="Enter estimated hours"
                                            {...register('estimatedTime', {
                                                required: "Estimated time is required",
                                                min: {
                                                    value: 0,
                                                    message: "Estimated time cannot be negative"
                                                },
                                                pattern: {
                                                    value: /^[0-9]*\.?[0-9]*$/,
                                                    message: "Please enter a valid number"
                                                }
                                            })}
                                        />
                                        {errors.estimatedTime && (
                                            <span className="text-danger">{errors.estimatedTime.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6} className='d-flex align-items-center'>
                                    <Form.Group>
                                        <Form.Check
                                            type="checkbox"
                                            label="Is Impediment"
                                            {...register('isImpediment')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Attachments&nbsp;
                                            <i
                                                onClick={() => document.getElementById('fileInput').click()}
                                                className='bi bi-plus-circle cp text-danger' />
                                        </Form.Label>
                                        <div className="mb-2">
                                            <input
                                                type="file"
                                                id="fileInput"
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                                multiple
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Additional Information Section */}
                        <div className="mb-1">
                            <h6 className="text-info fw-bold mb-1 border-bottom pb-1" style={{ fontSize: '13px' }}>
                                <i className="fas fa-paperclip me-1"></i>Additional Information
                            </h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            placeholder="Enter Description"
                                            {...register('description')}
                                            style={{ fontSize: '12px' }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Attachments&nbsp;
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
                                            />
                                        </div>
                                        {filesUploading ? (
                                            <div className="mt-2 d-flex flex-wrap gap-2">
                                                {[...Array(3)].map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="d-flex shadow-sm w-25 justify-content-between p-0  align-items-center mb-2"
                                                        style={{
                                                            // width: '150px',
                                                            height: '30px',
                                                            borderRadius: '4px'
                                                        }}
                                                    >
                                                        <div className="w-100 h-100 placeholder placeholder-wave  rounded-2" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            files?.length > 0 && (
                                                <div className="mt-2 d-flex flex-wrap gap-2">
                                                    {files?.map((file, index) => (
                                                        <div key={index} className="d-flex shadow-sm border justify-content-between p-1 px-2 align-items-center mb-2 rounded">
                                                            <span className="me-2" style={{ fontSize: '12px' }}>
                                                                {file?.name?.length > 25 ? file?.name?.slice(0, 24) + '...' : file?.name}
                                                            </span>
                                                            <i
                                                                onClick={() => removeFile(index)}
                                                                className="bi bi-x-circle cp text-danger"
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-outline-secondary fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={handleClose}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                    >
                        Add Task
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>

    );
}