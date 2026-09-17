import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, getprojectForTasks, getAllUsers, getSingleSprint, getSprintForTaskAction, updateTask } from '../redux/actions';
import { getMilestoneForTaskAction, getsingleMileStone } from '../redux/milestone/action';
import ProjectModal from '../pages/Task-Manager/projects/modal/ProjectModal';
import MilestoneModal from '../pages/Task-Manager/projects/milestone/modal/create';
import SprintModal from '../pages/Task-Manager/projects/milestone/sprint/modal/create';
import { Form, Row, Col, Modal, Badge } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import '../../node_modules/react-datepicker/dist/react-datepicker.css';
import ToastHandle from '../constants/toaster/toaster';
import Select from 'react-select';
import { handleUpload } from '../constants/handleUpload';
import { toast } from 'react-toastify';
import useQuillWordLimit from '../helpers/quillWordLimit';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { emojiRegex } from '../helpers/emojiRegex';
import { getScopedUserIdParams } from '../helpers/scopeUserParams';

export default function Pagesaddtask(props) {
    const quillRef = useRef(null);
    const MAX_WORDS = 1000;
    const MAX_WORD_LENGTH = 45;
    const store = useSelector((state) => state);
    const [startDate, setStartDate] = useState();
    const [dueDate, setDueDate] = useState();
    const [files, setFiles] = useState([]);
    const [projectSelected, setProjectSelected] = useState(null);
    const [milestoneSelected, setMilestoneSelected] = useState(null);
    const [milestoneType, setMilestoneType] = useState(null);
    const [sprintSelected, setSprintSelected] = useState(null);
    const [priority, setPriority] = useState('Medium');
    const [input, setInput] = useState('');
    const [exit, setExit] = useState(true);
    // const [labels, setLabels] = useState([]);

    const dispatch = useDispatch();
    const {
        register,
        handleSubmit,
        reset, watch, setValue,
        formState: { errors }, control
    } = useForm();
    const { showModal, setShowModal, editData = null } = props;
    const authUser = useSelector(state => state?.Auth?.user);
    const scopedUserParams = getScopedUserIdParams(store?.Auth?.user?.role, store?.Auth?.user?.id);
    const projects = useSelector(state => state?.getprojectForTasks?.data?.data);
    const users = useSelector(state => state?.getAllUsers?.data?.data);
    const createResponse = useSelector(state => state?.createTaskReducer?.data?.status);
    const updateResponse = useSelector(state => state?.UpdateTaskReducer?.data?.status);
    const addProjectsResponse = useSelector(state => state?.addProject?.data?.status);
    const addMilestoneResponse = useSelector(state => state?.addMileStone?.data?.status);
    const createMilestoneResponse = useSelector(state => state?.createMileStone?.data?.status);
    const milestoneData = useSelector(state => state?.getMilestoneForTaskReducer?.data?.data);
    const milestoneLoading = useSelector(state => state?.getMilestoneForTaskReducer?.loading);
    const sprintData = useSelector(state => state?.getSprintForTaskReducer?.data?.data);
    const sprintLoading = useSelector(state => state?.getSprintForTaskReducer?.loading);
    const createTaskLoading = useSelector(state => state?.createTaskReducer?.loading);
    const updateTaskLoading = useSelector(state => state?.UpdateTaskReducer?.loading);
    const selectedDepartment = localStorage.getItem('selectedDepartment');
    const defaultOption = {
        value: authUser?.id,
        label: `You (${authUser?.name || JSON.parse(localStorage.getItem('hyper_user'))?.username || ''})`
    };

    const priorityOptions = ['Critical', 'High', 'Medium', 'Low'];
    const workTypes = ['Bug', 'Sprint'];

    const [filesUploading, setFilesUploading] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [showSprintModal, setShowSprintModal] = useState(false);
    const [projectAssignee, setProjectAssignee] = useState([]);
    const [teamAllocated, setTeamAllocated] = useState([]);

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

    const [labelColor, setLabelColor] = useState('#00000');

    const onSubmit = (data) => {
        data.project = data?.project?.value;
        data.reporter = data?.reporter?.value;
        data.milestone = data?.milestone?.value;
        data.sprint = data?.sprint?.value;
        data.attachments = files;
        data.projectType = selectedDepartment;
        if (store?.Auth?.user?.role === "Marketing") {
            data.assignee = store?.Auth?.user?.id;
        } else if (store?.Auth?.user?.role === "Freelancers") {
            data.assignee = store?.Auth?.user?.id;
        } else {
            data.assignee = data?.assignee?.value;
        }
        // data.isSeoTask = store?.Auth?.user?.role === 'Marketing' ? true : false;
        // data.labels = labelColor;

        const cleanedData = Object.fromEntries(
            Object.entries(data).filter(
                ([_, value]) =>
                    value !== '' &&
                    value !== null &&
                    value !== undefined &&
                    !(Array.isArray(value) && value.length === 0)
            )
        );
        if (editData) {
            dispatch(updateTask({ taskId: editData?._id, body: cleanedData }))
        } else {
            dispatch(createTask(cleanedData));
        }
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
        if (createResponse === 201 || updateResponse === 200) {
            reset();
            // setLabels([]);
            setDueDate();
            setStartDate();
            setFiles([]);
            if (exit) {
                handleClose();
                setExit(true)
            } else {
                reset();
                setExit(true);
            }
        }
    }, [createResponse, updateResponse]);

    useEffect(() => {
        if (addProjectsResponse === 201) {
            dispatch(getprojectForTasks({ status: true, skip: 1, projectType: selectedDepartment, projectStatus: '', ...scopedUserParams }));
        }
    }, [addProjectsResponse]);

    useEffect(() => {
        if (!projects?.length) {
            dispatch(getprojectForTasks({ status: true, skip: 1, projectType: selectedDepartment, projectStatus: '', ...scopedUserParams }));
        }
    }, [dispatch])


    useEffect(() => {
        if (!users?.length && showModal) {
            dispatch(getAllUsers({ userType: selectedDepartment }))
        }
    }, [dispatch, showModal])

    useEffect(() => {
        if (editData && showModal) {
            // Set basic form values
            reset({
                summary: editData.summary || '',
                description: editData.description || '',
                workType: editData.workType || '',
                priority: editData.priority || 'Medium',
                estimatedTime: editData.estimatedTime || '',
                startDate: editData.startDate ? new Date(editData.startDate) : null,
                dueDate: editData.dueDate ? new Date(editData.dueDate) : null,
                project: editData.project ? { value: editData.project._id, label: editData.project.name } : null,
                assignee: editData.assignee ? { value: editData.assignee._id, label: editData.assignee.name } : null,
                reporter: editData.reporter ? { value: editData.reporter._id, label: editData.reporter.name } : null,
                milestone: editData.milestone ? { value: editData.milestone._id, label: editData.milestone.title } : null,
                sprint: editData.sprint ? { value: editData.sprint._id, label: editData.sprint.sprintName } : null
            });

            // Set state values
            setPriority(editData.priority || 'Medium');
            setFiles(editData.attachments || []);
            setStartDate(editData.startDate ? new Date(editData.startDate) : null);
            setDueDate(editData.dueDate ? new Date(editData.dueDate) : null);
            setProjectSelected(editData.project?._id || null);
            setMilestoneSelected(editData.milestone?._id || null);
            setSprintSelected(editData.sprint?._id || null);
            setProjectAssignee(projects?.find((project) => project?._id === editData.project?._id)?.team || []);
        }
    }, [editData, showModal, reset]);

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
        <Modal show={showModal} onHide={handleClose} backdrop="static" className='taskModal' centered size="xl">
            <Modal.Header className='py-2'>
                <Modal.Title className='text-black fw-bold' style={{ fontSize: '14px' }}>{editData ? 'Edit Task' : 'Add Task'}</Modal.Title>
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
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1" >
                                <i className="fas fa-info-circle me-1"></i>Basic Information
                            </h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>Summary<span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            className='form'
                                            type="text"
                                            placeholder="Enter Task Summary"
                                            {...register('summary', { required: true, pattern: /^[^\s].*$/ })}
                                        />
                                        {errors.summary?.type === 'required' && (
                                            <span className="text-danger small">{`This field is required`}</span>
                                        )}
                                        {errors.summary?.type === 'pattern' && (
                                            <span className="text-danger small">{`Cannot start with empty space`}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Project Details Section */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1" >
                                <i className="fas fa-project-diagram me-1"></i>{`Project Details`}
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Project`}<span className="text-danger">*</span>&nbsp;
                                            <i
                                                onClick={() => setShowProjectModal(true)}
                                                className='bi bi-plus-circle cp text-danger'
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </Form.Label>
                                        <Controller
                                            name="project"
                                            control={control}
                                            defaultValue={null}
                                            rules={{ required: 'Project is required' }}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={projects?.map(project => ({
                                                        value: project?._id,
                                                        label: project?.name,
                                                        data: project
                                                    }))}
                                                    onChange={(option) => {
                                                        field.onChange(option); // Updates react-hook-form
                                                        setProjectSelected(option?.value || null); // Your own local state (if needed)
                                                        setProjectAssignee(option?.data?.team)
                                                        dispatch(getMilestoneForTaskAction({
                                                            id: option?.value,
                                                            isActive: true,
                                                            projectType: selectedDepartment,
                                                            skip: 1,
                                                        }));
                                                    }}
                                                    onInputChange={(inputValue) => {
                                                        if (inputValue && inputValue.trim() !== '') {
                                                            dispatch(getprojectForTasks({ status: true, projectType: selectedDepartment, projectStatus: '', skip: 1, search: inputValue || '', ...scopedUserParams }));
                                                        }
                                                    }}
                                                    placeholder="Select Project"
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
                                            )}
                                        />
                                        {errors.project && (
                                            <span className="text-danger small">{errors.project.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>
                                            {projects?.find((data) => data?._id === projectSelected)?.projectStatus === "Support" ? (
                                                <span>
                                                    {`AMC`}<span className='text-danger'>*</span>&nbsp;
                                                </span>
                                            )
                                                : (
                                                    <>
                                                        {`Milestone`}<span className='text-danger'>*</span>&nbsp;
                                                        <i
                                                            onClick={() => projectSelected ? setShowMilestoneModal(true) : null}
                                                            className={`bi bi-plus-circle cp ${projectSelected ? 'text-danger' : 'text-muted'}`}
                                                            style={{ cursor: projectSelected ? 'pointer' : 'not-allowed' }}
                                                        /></>
                                                )}
                                        </Form.Label>
                                        <Controller
                                            name="milestone"
                                            control={control}
                                            defaultValue={null}
                                            rules={{ required: `${projects?.find((data) => data?._id === projectSelected)?.projectStatus === "Support" ? 'AMC' : 'Milestone'} is required` }}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={milestoneData?.map(milestone => ({
                                                        value: milestone?._id,
                                                        label: milestone?.title
                                                    }))}
                                                    onChange={(option) => {
                                                        field.onChange(option);
                                                        setMilestoneSelected(option?.value || null)
                                                        if (option?.value) {
                                                            dispatch(getSprintForTaskAction({ isActive: true, id: option?.value, skip: 1 }));
                                                        }
                                                    }}
                                                    onInputChange={(inputValue) => {
                                                        if (inputValue && projectSelected) {
                                                            dispatch(getMilestoneForTaskAction({
                                                                id: projectSelected,
                                                                isActive: true,
                                                                skip: 1,
                                                                search: inputValue,
                                                                projectType: selectedDepartment
                                                            }));
                                                        }
                                                    }}
                                                    placeholder={`Select ${projects?.find((data) => data?._id === projectSelected)?.projectStatus === "Support" ? 'AMC' : 'Milestone'}`}
                                                    isClearable
                                                    isSearchable
                                                    isDisabled={!projectSelected}
                                                    isLoading={milestoneLoading}
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
                                        {errors.milestone && (
                                            <span className="text-danger small">{errors.milestone.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                {selectedDepartment !== "Marketing" && selectedDepartment !== "Freelance" &&
                                    <Col md={6}>
                                        <Form.Group className="mb-1">
                                            <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Sprint`}<span className='text-danger'>{`*`}</span>&nbsp;
                                                <i
                                                    onClick={() => milestoneSelected ? setShowSprintModal(true) : null}
                                                    className={`bi bi-plus-circle cp ${milestoneSelected ? 'text-danger' : 'text-muted'}`}
                                                    style={{ cursor: milestoneSelected ? 'pointer' : 'not-allowed' }}
                                                />
                                            </Form.Label>
                                            <Controller
                                                name="sprint"
                                                control={control}
                                                defaultValue={null}
                                                rules={{ required: 'Sprint is required' }}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        options={sprintData?.filter(sprint =>
                                                            (store?.Auth?.user?.role === 'Marketing' || store?.Auth?.user?.role === 'Freelancers')
                                                                ? sprint?.sprintName?.toLowerCase()?.includes(selectedDepartment === 'Marketing' ? 'marketing' : 'freelance')
                                                                : true
                                                        )?.map(sprint => ({
                                                            value: sprint?._id,
                                                            label: sprint?.sprintName
                                                        }))}
                                                        onChange={(option) => {
                                                            field.onChange(option);
                                                            setSprintSelected(option?.value || null);
                                                        }}
                                                        onInputChange={(inputValue) => {
                                                            if (inputValue && milestoneSelected) {
                                                                dispatch(getSprintForTaskAction({ isActive: true, id: milestoneSelected, skip: 1, search: inputValue }));
                                                            }
                                                        }}
                                                        placeholder="Select Sprint"
                                                        isClearable
                                                        isSearchable
                                                        isDisabled={!milestoneSelected}
                                                        isLoading={sprintLoading}
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
                                            {errors.sprint && (
                                                <span className="text-danger small">{errors.sprint.message}</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                }
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Work Type`} <span className='text-danger'>*</span></Form.Label>
                                        <Form.Select
                                            className='formSelect'
                                            {...register('workType', { required: true })}
                                        >
                                            <option value='' hidden>Select Work Type</option>
                                            {workTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Form.Select>
                                        {errors.workType?.type === 'required' && (
                                            <span className="text-danger small">{`This field is required`}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                {(store?.Auth?.user?.role !== 'Marketing' && store?.Auth?.user?.role !== 'Freelancers') && (
                                    <Col md={6}>
                                        <Form.Group className="mb-1">
                                            <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Assignee`}</Form.Label>
                                            <Controller
                                                name="assignee"
                                                control={control}
                                                defaultValue={null}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        options={projectAssignee?.map(user => ({
                                                            value: user._id,
                                                            label: user.name
                                                        }))}
                                                        onInputChange={(inputValue) => {
                                                            dispatch(getAllUsers({ search: inputValue, userType: selectedDepartment }));
                                                        }}
                                                        placeholder="Select Assignee"
                                                        isClearable
                                                        isSearchable
                                                        noOptionsMessage={() => "No team members found. Please add team members to project first."}
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
                                            {errors.assignee && (
                                                <span className="text-danger small">{errors.assignee.message}</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                )}

                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Reporter`}<span className="text-danger">*</span></Form.Label>
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
                                                            dispatch(getAllUsers({ search: inputValue, userType: selectedDepartment }));
                                                        }
                                                    }}
                                                    placeholder="Select Reporter"
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
                                            )}
                                        />
                                        {errors.reporter && (
                                            <span className="text-danger small">{errors.reporter.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Task Configuration Section */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1" >
                                <i className="fas fa-cogs me-1"></i>{`Task Configuration`}
                            </h6>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Priority`}</Form.Label>
                                        <Form.Select
                                            className='form'
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
                                            <span className="text-danger small">{`This field is required`}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Estimated Time ( 4 hours max. )`}<span className="text-danger">{`*`}</span></Form.Label>
                                        <Form.Control
                                            className='form'
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
                                                max: {
                                                    value: 4,
                                                    message: "Estimated time cannot be more than 4 hours"
                                                },
                                                pattern: {
                                                    value: /^[0-9]*\.?[0-9]*$/,
                                                    message: "Please enter a valid number"
                                                }
                                            })}
                                        />
                                        {errors.estimatedTime && (
                                            <span className="text-danger small">{errors.estimatedTime.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Start Date`}<span className="text-danger">{`*`}</span></Form.Label>
                                        <Controller
                                            name="startDate"
                                            control={control}
                                            rules={{ required: 'Start date is required' }}
                                            render={({ field }) => (
                                                <DatePicker
                                                    selected={field.value}
                                                    onChange={(date) => {
                                                        field.onChange(date);
                                                        setStartDate(date);
                                                    }}
                                                    placeholderText="Select start date"
                                                    className="form-control form"
                                                    dateFormat='dd/MM/yyyy'
                                                />
                                            )}
                                        />
                                        {errors.startDate && (
                                            <span className="text-danger small">{errors.startDate.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-1">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Due Date`}<span className="text-danger">{`*`}</span></Form.Label>
                                        <Controller
                                            name="dueDate"
                                            control={control}
                                            rules={{ required: 'Due date is required' }}
                                            render={({ field }) => (
                                                <DatePicker
                                                    selected={field.value}
                                                    onChange={(date) => {
                                                        field.onChange(date);
                                                        setDueDate(date);
                                                    }}
                                                    placeholderText="Select due date"
                                                    minDate={startDate}
                                                    className="form-control form"
                                                    dateFormat='dd/MM/yyyy'
                                                />
                                            )}
                                        />
                                        {errors.dueDate && (
                                            <span className="text-danger small">{errors.dueDate.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>

                            </Row>
                        </div>

                        {/* Additional Information Section */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-1 border-bottom pb-1" >
                                <i className="fas fa-paperclip me-1"></i>{`Additional Information`}
                            </h6>
                            <Row>
                                <Col md={12}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className='mb-0' style={{ fontSize: '12px' }}>{`Attachments`}&nbsp;
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
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    const oversizedFiles = files.filter(file => file.size > 25 * 1024 * 1024);
                                                    if (oversizedFiles.length > 0) {
                                                        toast.error('Files must be less than 25MB');
                                                        e.target.value = '';
                                                        return;
                                                    }
                                                    handleFileChange(e);
                                                }}
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
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 d-flex justify-content-between small align-items-center'>{`Description`}
                                            <small className="text-muted">
                                                {(() => {
                                                    const content = watch('description') || '';
                                                    const plainText = quillRef?.current?.getEditor()?.getText()?.trim();
                                                    const words = plainText?.split(/\s+/)?.filter(Boolean);
                                                    const wordCount = words?.length;
                                                    return (
                                                        <div>
                                                            <div>{`(${wordCount || 0} / ${MAX_WORDS} words)`}</div>
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
                                                                // toast.error('Emojis are not allowed');
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
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-outline-secondary fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={handleClose}
                        type="button"
                    >
                        {`Cancel`}
                    </button>

                    <button type="submit"
                        className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        disabled={createTaskLoading || updateTaskLoading}
                        onClick={() => {
                            setExit(false);
                        }}>
                        {createTaskLoading || updateTaskLoading ? 'Submitting...' : editData ? 'Update Task' : 'Create and Add Another'}
                    </button>

                    <button type="submit"
                        className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={() => setExit(true)}
                        disabled={createTaskLoading || updateTaskLoading}>
                        {createTaskLoading || updateTaskLoading ? 'Submitting...' : editData ? 'Update Task' : 'Create and Exit'}
                    </button>
                </Modal.Footer>
            </Form>

            <ProjectModal
                modal={showProjectModal}
                closeModal={() => setShowProjectModal(false)}
            />

            <MilestoneModal
                modal={showMilestoneModal}
                closeModal={() => setShowMilestoneModal(false)}
                projectId={projectSelected}
            />

            <SprintModal
                modal={showSprintModal}
                CloseModal={() => setShowSprintModal(false)}
                milestoneId={milestoneSelected}
                projectId={projectSelected}
                teamAllocated={projectAssignee}
            />
        </Modal>

    );
}