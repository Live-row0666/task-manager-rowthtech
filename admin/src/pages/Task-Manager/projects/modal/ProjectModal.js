// modal/ProjectModal.js
import { useState, useEffect, useRef, useMemo } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { addProject, getAllProjects, getAmcProjects, updateProject } from '../../../../redux/projects/action';
import { getAllUsers } from '../../../../redux/actions';
import { getAllTechnology } from '../../../../redux/technology/action';
import { getClients } from '../../../../redux/client/action';
import ToastHandle from '../../../../constants/toaster/toaster';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MainLoader from '../../../../constants/Loader/loader';
import { handleUpload } from '../../../../constants/handleUpload';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import useQuillWordLimit from '../../../../helpers/quillWordLimit';
import ClientModalWrapper from './ClientModalWrapper';
import TechnologyModalWrapper from './TechnologyModalWrapper';
import InviteUserModal from '../../AllUsers/InviteUserModal/InviteUserModal';
import { emojiRegex } from '../../../../helpers/emojiRegex';
import { getScopedUserIdParams } from '../../../../helpers/scopeUserParams';
import axios from 'axios';

const ProjectModal = ({ modal, closeModal, editData = null, isAMC = false, onProjectAdded = null, initialClientId = null }) => {
    const quillRef = useRef(null);
    const MAX_WORDS = 1000;
    const MAX_WORD_LENGTH = 45;
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const users = useSelector(state => state?.getAllUsers?.data?.data);
    const technologiesData = useSelector(state => state?.getAllTechnologyReducer?.data?.data);
    const clientsData = useSelector(state => state?.clientReducer?.clients);
    const technologies = useMemo(() => technologiesData || [], [technologiesData]);
    const clients = useMemo(() => Array.isArray(clientsData) ? clientsData : [], [clientsData]);
    const addProjectsResponse = useSelector(state => state?.addProject?.data?.status);
    const updateProjectsResponse = useSelector(state => state?.updateProject?.data?.status);
    const addProjectLoading = useSelector(state => state?.addProject?.loading);
    const updateProjectLoading = useSelector(state => state?.updateProject?.loading);

    const isEdit = Boolean(editData);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [addValue, setAddValue] = useState([]);
    const [selectedTechnologies, setSelectedTechnologies] = useState([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showTechnologyModal, setShowTechnologyModal] = useState(false);
    const [showInviteUserModal, setShowInviteUserModal] = useState(false);
    const [team, setTeam] = useState([]);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const [description, setDescription] = useState('');
    const [selectedClients, setSelectedClients] = useState([]);
    const [clientSelected, setClientSelected] = useState(true); // Set to true to enable the plus icon
    const [technologySelected, setTechnologySelected] = useState(true); // Set to true to enable the plus icon
    const [teamSelected, setTeamSelected] = useState(true); // Set to true to enable the plus icon
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filesUploading, setFilesUploading] = useState(false);
    const [selectedAmcType, setSelectedAmcType] = useState(null);
    const [files, setFiles] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [projectType, setProjectType] = useState('');
    const [amcStartDate, setAmcStartDate] = useState(null);
    const [amcEndDate, setAmcEndDate] = useState(null);
    const [projectStatus, setProjectStatus] = useState('Ongoing');
    const [hasAmc, setHasAmc] = useState(false);
    const [showRenewAmcModal, setShowRenewAmcModal] = useState(false);
    const [pendingNewClientName, setPendingNewClientName] = useState(null);
    const userRole = store?.Auth?.user?.role;
    const scopedUserParams = getScopedUserIdParams(
        userRole,
        store?.Auth?.user?.id
    );
    const selectedDepartment = localStorage.getItem('selectedDepartment');

    const {
        register,
        handleSubmit,
        reset, watch,
        setValue, getValues,
        formState: { errors }, control
    } = useForm();

    useEffect(() => {
        dispatch(getAllTechnology({ status: true }));
        dispatch(getClients({ projectType: selectedDepartment }));
    }, [dispatch]);

    useEffect(() => {
        if (modal) {
            dispatch(getAllUsers({ search: '', limit: 20, userType: selectedDepartment }));
        }
    }, [dispatch, modal])

    // Refresh team members list when InviteUserModal is closed
    useEffect(() => {
        if (!showInviteUserModal) {
            dispatch(getAllUsers({ search: '', limit: 20, userType: selectedDepartment }));
        }
    }, [showInviteUserModal, dispatch])

    useEffect(() => {
        if (isEdit) {
            setValue('projectName', editData?.name);
            setValue('project_type', editData?.type);
            setValue('projectStatus', editData?.projectStatus);
            setValue('description', editData?.description);
            setStartDate(editData?.start ? new Date(editData.start) : null);
            setEndDate(editData?.end ? new Date(editData.end) : null);
            setAddValue(editData?.technology?.map((data) => (data?._id)) || []);
            setSelectedTechnologies(editData?.technology?.map(t => ({ label: t.name, value: t._id })) || []);
            setTeam(editData?.team?.map((data) => (data?._id)) || []);
            setSelectedTeamMembers(editData?.team?.map(t => ({ label: t.name, value: t._id })) || []);
            setSelectedClients(editData?.client?.map(c => c._id));
            setAttachments(editData?.documents);

            // Set figma links and websites if they exist
            setValue('figmaLinks', editData?.figmaLinks || []);
            setValue('documentLinks', editData?.documentLinks || []);
            setValue('websites', editData?.websites || []);
            setDependencies(editData?.dependencies || []);
            setProjectType(editData?.projectType || '');
            setAmcStartDate(editData?.amcStartDate ? new Date(editData.amcStartDate) : null);
            setAmcEndDate(editData?.amcEndDate ? new Date(editData.amcEndDate) : null);
            setProjectStatus(editData?.projectStatus || 'Ongoing');
            const amcFlag = Boolean(editData?.hasAmc || editData?.projectStatus === 'Support');
            setHasAmc(amcFlag);
            setValue('hasAmc', amcFlag);
            setValue('amcType', editData?.amcType?.type || '');
            setValue('amcValue', editData?.amcType?.value || '');
            setValue('amcHours', editData?.amcHours || 0);
            setValue('workedHours', editData?.workedHours || 0);

        } else {
            reset();
            setStartDate(null);
            setEndDate(null);
            setAddValue([]);
            setSelectedTechnologies([]);
            setTeam([]);
            setSelectedTeamMembers([]);
            setFiles([]);
            setDescription('');
            setSelectedClients([]);
            setValue('figmaLinks', []);
            setValue('websites', []);
            setValue('documentLinks', []);
            setDependencies([]);
            setProjectType('');
            setAmcStartDate(null);
            setAmcEndDate(null);
            setProjectStatus('Ongoing');
            setHasAmc(false);
            setValue('hasAmc', false);
            setValue('amcType', '');
            setValue('amcValue', '');
            setValue('amcHours', 0);
        }
    }, [modal]);

    // Helper function to compare arrays
    const arraysEqual = (a, b) => {
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        return a.every((val, index) => val === b[index]);
    };

    // Helper function to compare objects deeply
    const objectsEqual = (a, b) => {
        if (a === b) return true;
        if (!a || !b) return a === b;
        return JSON.stringify(a) === JSON.stringify(b);
    };

    // Helper function to get changed fields only
    const getChangedFields = (currentData, originalData) => {
        const changes = {};

        // Compare basic fields
        if (currentData.name !== originalData?.name) changes.name = currentData.name;
        if (currentData.description !== originalData?.description) changes.description = currentData.description;
        if (currentData.type !== originalData?.type) changes.type = currentData.type;
        if (currentData.projectStatus !== originalData?.projectStatus) changes.projectStatus = currentData.projectStatus;
        if (currentData.projectType !== originalData?.projectType) changes.projectType = currentData.projectType;

        // Compare arrays
        const originalClients = originalData?.client?.map(c => c._id) || [];
        if (!arraysEqual(currentData.client, originalClients)) changes.client = currentData.client;

        const originalTech = originalData?.technology?.map(t => t._id) || [];
        if (!arraysEqual(currentData.technology, originalTech)) changes.technology = currentData.technology;

        const originalTeam = originalData?.team?.map(t => t._id) || [];
        if (!arraysEqual(currentData.team, originalTeam)) changes.team = currentData.team;

        // Compare documents
        if (!objectsEqual(currentData.documents, originalData?.documents)) changes.documents = currentData.documents;

        // Compare links
        if (!objectsEqual(currentData.documentLinks, originalData?.documentLinks)) changes.documentLinks = currentData.documentLinks;
        if (!objectsEqual(currentData.figmaLinks, originalData?.figmaLinks)) changes.figmaLinks = currentData.figmaLinks;
        if (!objectsEqual(currentData.websites, originalData?.websites)) changes.websites = currentData.websites;
        // Always include dependencies if they exist
        if (currentData.dependencies && currentData.dependencies.length > 0) {
            changes.dependencies = currentData.dependencies;
        } else if (!objectsEqual(currentData.dependencies, originalData?.dependencies)) {
            changes.dependencies = currentData.dependencies;
        }

        // Compare dates
        const originalStart = originalData?.start ? new Date(originalData.start).getTime() : null;
        const currentStart = currentData.start ? new Date(currentData.start).getTime() : null;
        if (originalStart !== currentStart) changes.start = currentData.start;

        const originalEnd = originalData?.end ? new Date(originalData.end).getTime() : null;
        const currentEnd = currentData.end ? new Date(currentData.end).getTime() : null;
        if (originalEnd !== currentEnd) changes.end = currentData.end;

        // Compare AMC fields
        if (currentData.projectStatus === 'Support' || currentData.hasAmc) {
            const originalAmcStart = originalData?.amcStartDate ? new Date(originalData.amcStartDate).getTime() : null;
            const currentAmcStart = currentData.amcStartDate ? new Date(currentData.amcStartDate).getTime() : null;
            if (originalAmcStart !== currentAmcStart) changes.amcStartDate = currentData.amcStartDate;

            const originalAmcEnd = originalData?.amcEndDate ? new Date(originalData.amcEndDate).getTime() : null;
            const currentAmcEnd = currentData.amcEndDate ? new Date(currentData.amcEndDate).getTime() : null;
            if (originalAmcEnd !== currentAmcEnd) changes.amcEndDate = currentData.amcEndDate;

            if (!objectsEqual(currentData.amcType, originalData?.amcType)) changes.amcType = currentData.amcType;
            if (parseFloat(currentData.amcHours) !== parseFloat(originalData?.amcHours || 0)) changes.amcHours = currentData.amcHours;
        }

        if (Boolean(currentData.hasAmc) !== Boolean(originalData?.hasAmc)) {
            changes.hasAmc = currentData.hasAmc;
        }

        return changes;
    };

    const onSubmit = async (data) => {
        // Validate dependencies - either RTL or Client must be checked for non-empty dependencies
        const invalidDependencies = dependencies.filter(dep => dep.name.trim() && !dep.rtl && !dep.client);
        if (invalidDependencies.length > 0) {
            toast.error('Each dependency must have either RTL or Client selected');
            return;
        }

        setIsSubmitting(true);

        let finalProjectType;
        if (userRole === 'Marketing') {
            finalProjectType = 'Marketing';
        } else if (userRole === 'Freelancers') {
            finalProjectType = 'Freelance';
        } else if (userRole === 'QA' || userRole === 'Support' || userRole === 'Project Manager') {
            finalProjectType = 'Tech';
        } else {
            finalProjectType = projectType;
        }

        const currentData = {
            name: data?.projectName,
            description: data?.description,
            client: selectedClients,
            technology: addValue,
            type: data?.project_type,
            projectStatus: data?.projectStatus || 'Ongoing',
            team,
            documents: attachments,
            documentLinks: data?.documentLinks || [],
            figmaLinks: data?.figmaLinks || [],
            websites: data?.websites || [],
            dependencies: dependencies.filter(dep => dep.name.trim()),
            projectType: finalProjectType
        };

        const isAmc = data?.projectStatus === 'Support' || hasAmc;
        currentData.hasAmc = isAmc;

        if (isAmc) {
            // Include AMC-specific fields
            currentData.amcType = {
                type: data?.amcType,
                value: parseInt(data?.amcValue)
            };
            currentData.amcStartDate = amcStartDate;
            currentData.amcEndDate = amcEndDate;
            currentData.amcHours = parseFloat(data?.amcHours) || 0;
        }

        if (data?.projectStatus !== 'Support') {
            // For Ongoing projects, keep development start/end dates
            currentData.start = startDate || amcStartDate;
            currentData.end = endDate || amcEndDate;
        } else {
            currentData.start = amcStartDate;
            currentData.end = amcEndDate;
        }

        let body;
        if (isEdit) {
            // For update, only send changed fields
            body = getChangedFields(currentData, editData);
            body.workedHours = data.workedHours;

            // If no changes detected, show message and return
            if (Object.keys(body).length === 0) {
                toast.info('No changes detected');
                setIsSubmitting(false);
                return;
            }
            await dispatch(updateProject({ body, projectId: editData?._id }));
        } else {
            // For create, send all data
            body = currentData;
            await dispatch(addProject(body));
        }
        setIsSubmitting(false);
        // closeModal();
    };

    const handleTechnologyChange = (selectedList) => {
        setAddValue(selectedList?.map(item => item.value));
        setSelectedTechnologies(selectedList || []);
    };

    const handleTeamChange = (selectedList) => {
        setTeam(selectedList?.map(item => item.value));
        setSelectedTeamMembers(selectedList || []);
    };

    const handleClientChange = (selectedList) => {
        setSelectedClients(selectedList?.map(item => item.value));
    };

    const technologyOptions = technologies?.map(t => ({ label: t.name, value: t._id }));

    // Merge selected technologies with current options to prevent disappearing
    const allTechnologyOptions = [...new Map([...selectedTechnologies, ...technologyOptions].map(t => [t.value, t])).values()];
    const teamOptions = users?.map(u => ({ label: u.name, value: u._id }));
    const clientOptions = clients?.map(c => ({ label: c.name, value: c._id }));

    const handleFileChange = async (e) => {
        const filesToUpload = e.target.files;
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];

            // Check file size - 5MB = 5 * 1024 * 1024 bytes
            if (file.size > 25 * 1024 * 1024) {
                toast.error('File size cannot exceed 25MB');
                continue;
            }

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

    // Auto-select newly added client once clients list refreshes
    useEffect(() => {
        if (pendingNewClientName && clients.length > 0) {
            const newClient = clients.find(c => c.name === pendingNewClientName);
            if (newClient) {
                setSelectedClients(prev => [...new Set([...prev, newClient._id])]);
                setPendingNewClientName(null);
            }
        }
    }, [clients, pendingNewClientName]);

    // Auto-calculate AMC end date based on start date, value, and type
    useEffect(() => {
        if (amcStartDate && watch('amcValue') && selectedAmcType) {
            const startDate = new Date(amcStartDate);
            const amcValue = parseInt(watch('amcValue'));

            if (selectedAmcType === 'Monthly') {
                startDate.setMonth(startDate.getMonth() + amcValue);
            } else if (selectedAmcType === 'Yearly') {
                startDate.setFullYear(startDate.getFullYear() + amcValue);
            }

            setAmcEndDate(startDate);
        }
    }, [amcStartDate, watch('amcValue'), selectedAmcType]);

    useEffect(() => {
        if (modal && !editData && initialClientId) {
            setSelectedClients([initialClientId]);
        }
    }, [modal, editData, initialClientId]);

    useEffect(() => {
        if (addProjectsResponse === 201 || updateProjectsResponse === 200) {
            const createdOrUpdatedProject = store?.addProject?.data?.data || store?.addProject?.data?.project || store?.addProject?.data;
            if (projectStatus === 'Support') {
                dispatch(getAmcProjects({ projectType: selectedDepartment, page: 1, limit: 100, search: '', ...scopedUserParams }));
            } else {
                dispatch(getAllProjects({ status: true, skip: 1, projectType: selectedDepartment, projectStatus: localStorage.getItem('activeProjectTab') || 'Ongoing', ...scopedUserParams }));
            }
            if (typeof onProjectAdded === 'function') {
                onProjectAdded(createdOrUpdatedProject);
            }
            closeModal();
        }
    }, [addProjectsResponse, updateProjectsResponse]);

    return (
        <Modal show={modal} onHide={closeModal} className={`${showClientModal || showTechnologyModal || showInviteUserModal || showRenewAmcModal ? 'd-none' : ''} taskModal`} size="xl" backdrop="static">
            <Modal.Header className='py-2'>
                <Modal.Title className="text-black fw-bold" style={{ fontSize: '14px' }}>
                    {isEdit ? 'Update Project' : 'Create Project'}
                </Modal.Title>
                {isEdit && (editData?.projectStatus === 'Support' || editData?.hasAmc || hasAmc) && (
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowRenewAmcModal(true)}
                        style={{ fontSize: '11px' }}
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i>Renew AMC
                    </button>
                )}
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-1" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="" style={{
                        maxHeight: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}>
                        <div className="bg-white p-2 rounded-3 shadow-sm">
                            {/* Basic Information Section */}
                            <div className="mb-1">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-project-diagram me-2"></i>Basic Information
                                </h6>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Project Name <span className='text-danger'>*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                className='form'
                                                placeholder="Enter project name"
                                                {...register('projectName', {
                                                    required: true,
                                                    validate: value => value.trim() !== '' || 'Project name cannot be empty'
                                                })}
                                            />
                                            {errors.projectName && <span className="text-danger small">{errors.projectName.message || 'Required'}</span>}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Client &nbsp;
                                                <i
                                                    onClick={() => setShowClientModal(true)}
                                                    className="bi bi-plus-circle cp text-danger"
                                                    style={{ cursor: 'pointer' }}
                                                    title="Add Client"
                                                />
                                            </Form.Label>
                                            <Select
                                                isMulti
                                                options={clientOptions}
                                                value={clientOptions?.filter(c => selectedClients.includes(c.value))}
                                                onChange={(selected) => handleClientChange(selected || [])}
                                                placeholder="Select clients..."
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '30px',
                                                        fontSize: '12px'
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        padding: '2px 8px',
                                                        flexWrap: 'wrap'
                                                    }),
                                                    multiValue: (base) => ({
                                                        ...base,
                                                        fontSize: '11px',
                                                        margin: '1px'
                                                    }),
                                                    multiValueLabel: (base) => ({
                                                        ...base,
                                                        fontSize: '11px',
                                                        padding: '2px 6px'
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        margin: '0px',
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
                                                    menu: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Project Type</Form.Label>
                                            <Form.Select {...register('project_type')} onChange={(e) => {
                                                if (e.target.value === "AMC") {
                                                    setProjectStatus('Support');
                                                    setValue('projectStatus', "Support")
                                                }
                                            }} style={{ height: '30px', paddingTop: '5px' }}>
                                                <option hidden value="">Select Type</option>
                                                <option value="T&M">T&M</option>
                                                <option value="FC">FC</option>
                                                <option value="HR">HR</option>
                                                <option value="AMC">AMC</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Project For</Form.Label>
                                            <Form.Select
                                                value={projectType}
                                                onChange={(e) => setProjectType(e.target.value)}
                                                style={{ height: '30px', paddingTop: '5px' }}
                                            >
                                                <option value="">Select Project For</option>
                                                <option value="Tech">Tech</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Freelance">Freelance</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    {editData?.projectStatus !== "Hold" && (
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className='mb-0 small'>Project Status</Form.Label>
                                                <Form.Select
                                                    {...register('projectStatus')}
                                                    onChange={(e) => {
                                                        const newStatus = e.target.value;
                                                        setProjectStatus(newStatus);
                                                        setValue('projectStatus', newStatus);
                                                        if (newStatus !== 'Ongoing') {
                                                            if (newStatus === 'Support') {
                                                                setHasAmc(true);
                                                                setValue('hasAmc', true);
                                                            } else {
                                                                setHasAmc(false);
                                                                setValue('hasAmc', false);
                                                            }
                                                        }
                                                    }}
                                                    style={{ height: '30px', paddingTop: '5px' }}
                                                >
                                                    <option value="Ongoing">Ongoing</option>
                                                    <option value="Support">AMC</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Hold">Hold</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    )}

                                    {/* Enable AMC Contract toggle beside Project Status only when status is Ongoing */}
                                    {(watch('projectStatus') === 'Ongoing' || projectStatus === 'Ongoing') && (
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className='mb-0 small text-muted'>AMC Contract</Form.Label>
                                                <div
                                                    className="d-flex align-items-center cp"
                                                    style={{ height: '30px', backgroundColor: '#fff', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        const newVal = !hasAmc;
                                                        setHasAmc(newVal);
                                                        setValue('hasAmc', newVal);
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: '34px',
                                                            height: '18px',
                                                            backgroundColor: hasAmc ? '#727cf5' : '#dee2e6',
                                                            borderRadius: '20px',
                                                            padding: '2px',
                                                            transition: 'background-color 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '14px',
                                                                height: '14px',
                                                                backgroundColor: '#fff',
                                                                borderRadius: '50%',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                                                transform: hasAmc ? 'translateX(16px)' : 'translateX(0px)',
                                                                transition: 'transform 0.2s ease-in-out'
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="fw-semibold text-primary ms-2" style={{ fontSize: '12px', userSelect: 'none' }}>
                                                        Enable AMC (Ongoing + AMC)
                                                    </span>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    )}

                                    {/* AMC Section */}
                                    {(watch('projectStatus') === 'Support' || projectStatus === 'Support' || hasAmc) && (
                                        <Col lg={12} className="my-2">
                                            <div className="p-2 rounded border bg-light">
                                                <h6 className="text-primary fw-bold mb-2 pb-1 border-bottom d-flex align-items-center" style={{ fontSize: '13px' }}>
                                                    <i className="bi bi-shield-check me-2 fs-5"></i>AMC Details
                                                </h6>
                                                <Row>
                                                    <Col lg={6}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className='mb-0 small'>{`AMC Type`} <span className='text-danger'>{`*`}</span></Form.Label>
                                                            <Form.Select
                                                                {...register('amcType', { required: (watch('projectStatus') === 'Support' || hasAmc) })}
                                                                onChange={(e) => {
                                                                    setSelectedAmcType(e.target.value);
                                                                    setValue('amcType', e.target.value);
                                                                }}
                                                                disabled={isEdit && editData?.projectStatus === 'Support'}
                                                                style={{ height: '30px', paddingTop: '5px' }}>
                                                                <option value="">Select AMC Type</option>
                                                                {["Monthly", "Yearly"]?.map((data, index) => (
                                                                    <option value={data} key={index}>{data}</option>
                                                                ))}
                                                            </Form.Select>
                                                            {errors.amcType && <span className="text-danger small">{`AMC Type is required`}</span>}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className='mb-0 small'>{`AMC Tenure`} {selectedAmcType ? "(" + selectedAmcType + ")" : ''} <span className='text-danger'>*</span></Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                className='form'
                                                                placeholder="Enter AMC Tenure"
                                                                {...register('amcValue', {
                                                                    required: (watch('projectStatus') === 'Support' || hasAmc),
                                                                    min: { value: 1, message: 'Value must be positive' },
                                                                })}
                                                                onChange={(e) => {
                                                                    let value = e.target.value;
                                                                    if (selectedAmcType === "Yearly" && value.length > 1) {
                                                                        value = value.slice(0, 1);
                                                                    } else if (selectedAmcType === "Monthly" && value.length > 3) {
                                                                        value = value.slice(0, 3);
                                                                    }
                                                                    setValue("amcValue", value);
                                                                }}
                                                                disabled={isEdit && editData?.projectStatus === 'Support'}
                                                                style={{ height: '30px' }}
                                                            />
                                                            {errors.amcValue && <span className="text-danger small">{errors.amcValue.message || 'AMC Tenure is required'}</span>}
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className='mb-0 small'>{`AMC Start Date`} <span className='text-danger'>{`*`}</span></Form.Label>
                                                            <DatePicker
                                                                selected={amcStartDate}
                                                                onChange={date => setAmcStartDate(date)}
                                                                placeholderText="Select AMC start date"
                                                                className="form-control form"
                                                                required={watch('projectStatus') === 'Support' || hasAmc}
                                                                disabled={isEdit && editData?.projectStatus === 'Support'}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className='mb-0 small'>{`AMC End Date`} <span className='text-danger'>{`*`}</span></Form.Label>
                                                            <DatePicker
                                                                selected={amcEndDate}
                                                                onChange={date => setAmcEndDate(date)}
                                                                minDate={amcStartDate}
                                                                placeholderText="Auto-calculated based on start date and tenure"
                                                                className="form-control form"
                                                                required={watch('projectStatus') === 'Support' || hasAmc}
                                                                readOnly
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={6}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className='mb-0 small'>{`AMC Hours`}<span className='text-danger'>*</span></Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                step="0.01"
                                                                className='form'
                                                                placeholder="Enter AMC hours"
                                                                {...register('amcHours', {
                                                                    required: (watch('projectStatus') === 'Support' || hasAmc) ? 'This field is required' : false,
                                                                    min: { value: 0.01, message: 'Hours must be more than 0' }
                                                                })}
                                                                disabled={isEdit && editData?.projectStatus === 'Support'}
                                                                style={{ height: '30px' }}
                                                            />
                                                            {errors.amcHours && <span className="text-danger small">{errors.amcHours.message}</span>}
                                                        </Form.Group>
                                                    </Col>
                                                    {editData?.amcHours ? (
                                                        <Col lg={6}>
                                                            <Form.Group className="mb-2">
                                                                <Form.Label className='mb-0 small'>{`Worked Hours`}</Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    className='form'
                                                                    placeholder="Enter worked hours"
                                                                    {...register('workedHours', {
                                                                        min: { value: 0, message: 'Hours must be positive' }
                                                                    })}
                                                                    disabled={isEdit && editData?.projectStatus === 'Support'}
                                                                    style={{ height: '30px' }}
                                                                />
                                                                {errors.workedHours && <span className="text-danger small">{errors.workedHours.message}</span>}
                                                            </Form.Group>
                                                        </Col>
                                                    ) : (
                                                        <Col lg={6} />
                                                    )}
                                                </Row>
                                            </div>
                                        </Col>
                                    )}

                                    {/* Ongoing Details Heading (shown in dual mode) */}
                                    {hasAmc && projectStatus !== 'Support' && (
                                        <Col lg={12} className="mt-2 mb-1">
                                            <h6 className="text-dark fw-bold border-bottom pb-1 d-flex align-items-center" style={{ fontSize: '13px' }}>
                                                <i className="bi bi-kanban me-2 text-primary fs-5"></i>Ongoing Details
                                            </h6>
                                        </Col>
                                    )}

                                    {selectedDepartment !== "Marketing" && selectedDepartment !== "Freelance" &&
                                        <Col lg={6}>
                                            <Form.Group className="mb-2">
                                                <Form.Label className='mb-0 small'>{`Technologies`} &nbsp;
                                                    <i
                                                        onClick={() => technologySelected ? setShowTechnologyModal(true) : null}
                                                        className={`bi bi-plus-circle cp ${technologySelected ? 'text-danger' : 'text-muted'}`}
                                                        style={{ cursor: technologySelected ? 'pointer' : 'not-allowed' }}
                                                    />
                                                </Form.Label>
                                                <Select
                                                    isMulti
                                                    options={allTechnologyOptions}
                                                    value={selectedTechnologies}
                                                    onChange={(selected) => handleTechnologyChange(selected || [])}
                                                    onInputChange={(inputValue) => {
                                                        dispatch(getAllTechnology({ status: true, search: inputValue }));
                                                    }}
                                                    placeholder="Select technologies..."
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            minHeight: '30px',
                                                            fontSize: '12px'
                                                        }),
                                                        valueContainer: (base) => ({
                                                            ...base,
                                                            padding: '2px 8px',
                                                            flexWrap: 'wrap'
                                                        }),
                                                        multiValue: (base) => ({
                                                            ...base,
                                                            fontSize: '11px',
                                                            margin: '1px'
                                                        }),
                                                        multiValueLabel: (base) => ({
                                                            ...base,
                                                            fontSize: '11px',
                                                            padding: '2px 6px'
                                                        }),
                                                        input: (base) => ({
                                                            ...base,
                                                            margin: '0px',
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
                                                        menu: (base) => ({ ...base, zIndex: 9999 })
                                                    }}
                                                />
                                            </Form.Group>
                                        </Col>
                                    }
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>{`Team Members`} &nbsp;
                                                <i
                                                    onClick={() => teamSelected ? setShowInviteUserModal(true) : null}
                                                    className={`bi bi-plus-circle cp ${teamSelected ? 'text-danger' : 'text-muted'}`}
                                                    style={{ cursor: teamSelected ? 'pointer' : 'not-allowed' }}
                                                />
                                            </Form.Label>
                                            <Select
                                                isMulti
                                                options={teamOptions}
                                                value={selectedTeamMembers}
                                                onChange={(selected) => handleTeamChange(selected || [])}
                                                onInputChange={(inputValue) => {
                                                    if (typeof inputValue === 'string' && inputValue && inputValue !== '') {
                                                        dispatch(getAllUsers({ search: inputValue, limit: 20, userType: selectedDepartment }))
                                                    }
                                                }}
                                                placeholder="Select team members..."
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minHeight: '30px',
                                                        fontSize: '12px'
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        padding: '2px 8px',
                                                        flexWrap: 'wrap'
                                                    }),
                                                    multiValue: (base) => ({
                                                        ...base,
                                                        fontSize: '11px',
                                                        margin: '1px'
                                                    }),
                                                    multiValueLabel: (base) => ({
                                                        ...base,
                                                        fontSize: '11px',
                                                        padding: '2px 6px'
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        margin: '0px',
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
                                                    menu: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    {projectStatus !== "Support" && (
                                        <>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>{hasAmc ? `Ongoing Start Date` : `Start Date`}</Form.Label>
                                                    <DatePicker
                                                        selected={startDate}
                                                        onChange={date => setStartDate(date)}
                                                        dateFormat="MM/yyyy"
                                                        showMonthYearPicker
                                                        placeholderText="MM/YYYY"
                                                        className="form-control form"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>{hasAmc ? `Ongoing End Date` : `End Date`}</Form.Label>
                                                    <DatePicker
                                                        selected={endDate}
                                                        onChange={date => setEndDate(date)}
                                                        dateFormat="MM/yyyy"
                                                        showMonthYearPicker
                                                        minDate={startDate}
                                                        placeholderText="MM/YYYY"
                                                        className="form-control form"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </>
                                    )}
                                </Row>
                            </div>


                            {/* External Links Section */}
                            <div className="mb-1">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-link me-2"></i>{`External Links`}
                                </h6>

                                {/* Figma Links */}
                                <div className="mb-3">
                                    <h6 className="mb-2 small">
                                        Figma Links
                                        {isEdit && editData?.figmaLinks?.length > 0 && (
                                            <span className="ms-2 badge bg-info">{editData.figmaLinks.length} links</span>
                                        )}

                                        <i onClick={() => {
                                            const currentLinks = watch('figmaLinks') || [];
                                            setValue('figmaLinks', [...currentLinks, { title: "", url: "" }]);
                                        }} className="bi text-info bi-plus-circle cp ms-1"></i>
                                    </h6>
                                    {watch('figmaLinks')?.map((field, index) => (
                                        <Row key={index} className="mb-2 align-items-center">
                                            <Col lg={5}>
                                                <Form.Control
                                                    className='form'
                                                    type="text"
                                                    placeholder="Title"
                                                    {...register(`figmaLinks.${index}.title`)}
                                                />
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Control
                                                    className='form'
                                                    type="url"
                                                    placeholder="URL"
                                                    {...register(`figmaLinks.${index}.url`)}
                                                />
                                            </Col>
                                            <Col lg={1}>

                                                <i onClick={() => {
                                                    const currentLinks = watch('figmaLinks') || [];
                                                    const newLinks = [...currentLinks];
                                                    newLinks.splice(index, 1);
                                                    setValue('figmaLinks', newLinks);
                                                }} className="bi text-danger cp bi-trash"></i>
                                            </Col>
                                        </Row>
                                    ))}
                                </div>

                                {/* Documents */}
                                <div className="mb-3">
                                    <h6 className="mb-2 small">
                                        {`Document Links`}
                                        {isEdit && editData?.documentLinks?.length > 0 && (
                                            <span className="ms-2 badge bg-info">{editData.documentLinks.length} docs</span>
                                        )}

                                        <i onClick={() => {
                                            const currentDocs = watch('documentLinks') || [];
                                            setValue('documentLinks', [...currentDocs, { title: "", url: "" }]);
                                        }} className="bi text-info bi-plus-circle cp ms-1"></i>
                                    </h6>
                                    {watch('documentLinks')?.map((field, index) => (
                                        <Row key={index} className="mb-2 align-items-center">
                                            <Col lg={5}>
                                                <Form.Control
                                                    className='form'
                                                    type="text"
                                                    placeholder="Title"
                                                    {...register(`documentLinks.${index}.title`)}
                                                />
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Control
                                                    className='form'
                                                    type="url"
                                                    placeholder="URL"
                                                    {...register(`documentLinks.${index}.url`)}
                                                />
                                            </Col>
                                            <Col lg={1}>
                                                <i onClick={() => {
                                                    const currentDocs = watch('documentLinks') || [];
                                                    const newDocs = [...currentDocs];
                                                    newDocs.splice(index, 1);
                                                    setValue('documentLinks', newDocs);
                                                }} className="bi text-danger cp bi-trash"></i>
                                            </Col>
                                        </Row>
                                    ))}
                                </div>

                                {/* Website Links */}
                                <div>
                                    <h6 className="mb-2 small">
                                        Website Links
                                        {isEdit && editData?.websites?.length > 0 && (
                                            <span className="ms-2 badge bg-info">{editData.websites.length} {`sites`}</span>
                                        )}
                                        <i
                                            onClick={() => {
                                                const currentWebsites = watch('websites') || [];
                                                setValue('websites', [...currentWebsites, { title: "", url: "", creds: [] }]);
                                            }}
                                            className="bi text-info bi-plus-circle cp ms-1"
                                        />
                                    </h6>
                                    {watch('websites')?.map((website, websiteIndex) => (
                                        <div key={websiteIndex} className="mb-3 p-2 border rounded">
                                            <Row className="mb-2 align-items-center">
                                                <Col lg={5}>
                                                    <Form.Control
                                                        className='form'
                                                        type="text"
                                                        placeholder="Website Title"
                                                        {...register(`websites.${websiteIndex}.title`)}
                                                    />
                                                </Col>
                                                <Col lg={6}>
                                                    <Form.Control
                                                        className='form'
                                                        type="url"
                                                        placeholder="Website URL"
                                                        {...register(`websites.${websiteIndex}.url`)}
                                                    />
                                                </Col>
                                                <Col lg={1} className='d-flex gap-1'>
                                                    <i onClick={() => {
                                                        const currentWebsites = watch('websites') || [];
                                                        const newWebsites = [...currentWebsites];
                                                        newWebsites.splice(websiteIndex, 1);
                                                        setValue('websites', newWebsites);
                                                    }} className="bi text-danger bi-trash cp"></i>
                                                    <i
                                                        title='Add Credentials'
                                                        onClick={() => {
                                                            const currentWebsites = watch('websites') || [];
                                                            const updatedWebsites = [...currentWebsites];

                                                            // Ensure creds exists
                                                            if (!updatedWebsites[websiteIndex].creds) {
                                                                updatedWebsites[websiteIndex].creds = [];
                                                            }

                                                            updatedWebsites[websiteIndex].creds.push({ role: "", username: "", password: "" });

                                                            setValue('websites', updatedWebsites);
                                                        }}
                                                        className="bi bi-plus-circle cp text-info ms-2"
                                                    />
                                                </Col>
                                            </Row>

                                            {/* Credentials */}
                                            <div className="ms-3 mt-2">
                                                {/* <h6 className="mb-2 small">
                                                    Credentials
                                                    <i
                                                        onClick={() => {
                                                            const currentWebsites = watch('websites') || [];
                                                            const updatedWebsites = [...currentWebsites];

                                                            // Ensure creds exists
                                                            if (!updatedWebsites[websiteIndex].creds) {
                                                                updatedWebsites[websiteIndex].creds = [];
                                                            }

                                                            updatedWebsites[websiteIndex].creds.push({ role: "", username: "", password: "" });

                                                            setValue('websites', updatedWebsites);
                                                        }}
                                                        className="bi bi-plus-circle cp text-info ms-2"
                                                    />
                                                </h6> */}
                                                {watch(`websites.${websiteIndex}.creds`)?.length > 0 && (
                                                    <div className="mb-1">
                                                        <small className="text-muted">{watch(`websites.${websiteIndex}.creds`)?.length} credential(s) found</small>
                                                    </div>
                                                )}
                                                {watch(`websites.${websiteIndex}.creds`)?.map((cred, credIndex) => (
                                                    <Row key={credIndex} className="mb-2 align-items-center">
                                                        <Col lg={3}>
                                                            <Form.Control
                                                                className='form'
                                                                type="text"
                                                                placeholder="Role"
                                                                {...register(`websites.${websiteIndex}.creds.${credIndex}.role`)}
                                                            />
                                                        </Col>
                                                        <Col lg={4}>
                                                            <Form.Control
                                                                className='form'
                                                                type="text"
                                                                placeholder="Username"
                                                                {...register(`websites.${websiteIndex}.creds.${credIndex}.username`)}
                                                            />
                                                        </Col>
                                                        <Col lg={4}>
                                                            <Form.Control
                                                                className='form'
                                                                type="password"
                                                                placeholder="Password"
                                                                {...register(`websites.${websiteIndex}.creds.${credIndex}.password`)}
                                                            />
                                                        </Col>
                                                        <Col lg={1}>
                                                            <i onClick={() => {
                                                                const currentCreds = watch(`websites.${websiteIndex}.creds`) || [];
                                                                const newCreds = [...currentCreds];
                                                                newCreds.splice(credIndex, 1);
                                                                setValue(`websites.${websiteIndex}.creds`, newCreds);
                                                            }} className="bi text-danger bi-trash"></i>
                                                        </Col>
                                                    </Row>
                                                ))}


                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>

                            {/* Additional Information Section */}
                            <div className="mb-2 mt-2">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-info-circle me-2"></i>Additional Information
                                </h6>
                                <Row>
                                    <Col lg={12}>
                                        {/* Dependencies Section */}
                                        <div className="mb-1">
                                            <h6 className="text-secondary pb-1">
                                                Dependencies
                                                <i
                                                    onClick={() => setDependencies([...dependencies, { name: '', rtl: false, client: false, status: 'Pending' }])}
                                                    className="bi bi-plus-circle cp text-info ms-2"
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </h6>
                                            {dependencies.length > 0 && (
                                                <div className="table-responsive">
                                                    <table className="table table-bordered table-sm mb-0">
                                                        <thead className="table-light">
                                                            <tr style={{ fontSize: '10px' }}>
                                                                <th style={{ padding: '4px 6px', width: '40%' }}>Name</th>
                                                                <th style={{ padding: '4px 6px', width: '15%' }}>RTL</th>
                                                                <th style={{ padding: '4px 6px', width: '15%' }}>Client</th>
                                                                <th style={{ padding: '4px 6px', width: '20%' }}>Status</th>
                                                                <th style={{ padding: '4px 6px', width: '10%' }}>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dependencies.map((dependency, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <Form.Control
                                                                            type="text"
                                                                            placeholder="Dependency Name"
                                                                            value={dependency.name}
                                                                            onChange={(e) => {
                                                                                const newDependencies = [...dependencies];
                                                                                newDependencies[index].name = e.target.value;
                                                                                setDependencies(newDependencies);
                                                                            }}
                                                                            size="sm"
                                                                        />
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <Form.Check
                                                                            type="checkbox"
                                                                            checked={dependency.rtl}
                                                                            onChange={(e) => {
                                                                                const newDependencies = [...dependencies];
                                                                                newDependencies[index].rtl = e.target.checked;
                                                                                setDependencies(newDependencies);
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <Form.Check
                                                                            type="checkbox"
                                                                            checked={dependency.client}
                                                                            onChange={(e) => {
                                                                                const newDependencies = [...dependencies];
                                                                                newDependencies[index].client = e.target.checked;
                                                                                setDependencies(newDependencies);
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <Form.Select
                                                                            value={dependency.status}
                                                                            onChange={(e) => {
                                                                                const newDependencies = [...dependencies];
                                                                                newDependencies[index].status = e.target.value;
                                                                                setDependencies(newDependencies);
                                                                            }}
                                                                            size="sm"
                                                                        >
                                                                            <option value="Pending">Pending</option>
                                                                            <option value="Done">Done</option>
                                                                        </Form.Select>
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <i
                                                                            onClick={() => {
                                                                                const newDependencies = [...dependencies];
                                                                                newDependencies.splice(index, 1);
                                                                                setDependencies(newDependencies);
                                                                            }}
                                                                            className="bi bi-trash cp text-danger"
                                                                            style={{ cursor: 'pointer' }}
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        <Form.Group className="mb-2" controlId="attachments">
                                            <Form.Label className='mb-0 small'>
                                                Attachments&nbsp;
                                                <i
                                                    onClick={() => document.getElementById('fileInput').click()}
                                                    className='bi bi-plus-circle cp text-info'
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
                                                            className="d-flex shadow-sm w-25 justify-content-between p-0 align-items-center mb-2"
                                                            style={{ height: '30px', borderRadius: '4px' }}
                                                        >
                                                            <div className="w-100 h-100 placeholder placeholder-wave rounded-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                attachments.length > 0 && (
                                                    <div className="mt-2 d-flex flex-wrap gap-2">
                                                        {attachments.map((file, index) => (
                                                            <div onClick={() => {
                                                                window.open(file.url, '_blank');
                                                            }} key={index} className="d-flex shadow-sm border justify-content-between p-1 px-2 align-items-center mb-2">
                                                                <span className="me-2" style={{ fontSize: '12px' }}>{file.name}</span>
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
                                            <Form.Label className='mb-0 small d-flex justify-content-between'>Notes   <small className="text-muted">
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
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button"
                        className="btn btn-outline-secondary fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={closeModal}>Cancel</button>
                    <button type="submit"
                        className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        disabled={addProjectLoading || updateProjectLoading}>
                        {addProjectLoading || updateProjectLoading ? 'Submitting...' : isEdit ? 'Update' : 'Create'}
                    </button>
                </Modal.Footer>
            </Form>

            {/* Add client modal */}
            <ClientModalWrapper
                show={showClientModal}
                onHide={() => setShowClientModal(false)}
                onClientAdded={(newClientData) => {
                    if (newClientData?._id) {
                        setSelectedClients(prev => [...new Set([...(prev || []), newClientData._id])]);
                    }
                    if (newClientData?.name) {
                        setPendingNewClientName(newClientData.name);
                    }
                }}
            />
            {/* Add technology modal */}
            <TechnologyModalWrapper
                show={showTechnologyModal}
                onHide={() => setShowTechnologyModal(false)}
                onTechnologyAdded={() => {
                    // Refresh technologies list when a new technology is added
                    dispatch(getAllTechnology({ status: true }));
                }}
            />
            {/* Add team member modal */}
            <InviteUserModal
                show={showInviteUserModal}
                onHide={() => setShowInviteUserModal(false)}
            />
            {/* Renew AMC Modal */}
            <RenewAmcModal
                show={showRenewAmcModal}
                onHide={() => setShowRenewAmcModal(false)}
                editData={editData}
                dispatch={dispatch}
                selectedDepartment={selectedDepartment}
                closeModal={closeModal}
                projectStatus={projectStatus}
            />
        </Modal>
    );
};

// RenewAmcModal Component
const RenewAmcModal = ({ show, projectStatus, closeModal, onHide, editData, dispatch, selectedDepartment }) => {
    const [renewAmcType, setRenewAmcType] = useState('');
    const [renewAmcStartDate, setRenewAmcStartDate] = useState(null);
    const [renewAmcEndDate, setRenewAmcEndDate] = useState(null);
    const store = useSelector((state) => state);

    const userRole = store?.Auth?.user?.role;

    const scopedUserParams = getScopedUserIdParams(
        userRole,
        store?.Auth?.user?.id
    );

    const {
        register: renewRegister,
        handleSubmit: renewHandleSubmit,
        setValue: renewSetValue,
        watch: renewWatch,
        formState: { errors: renewErrors }
    } = useForm();

    useEffect(() => {
        if (show && editData) {
            renewSetValue('amcType', editData?.amcType?.type || '');
            // renewSetValue('amcValue', editData?.amcType?.value || '');
            // renewSetValue('amcHours', editData?.amcHours || 0);
            setRenewAmcType(editData?.amcType?.type || '');

            // Set start date as next day of previous end date
            const nextDay = editData?.amcEndDate ? new Date(editData.amcEndDate) : new Date();
            nextDay.setDate(nextDay.getDate() + 1);
            setRenewAmcStartDate(nextDay);

            setRenewAmcEndDate(null);
        }
    }, [show, editData]);

    // Auto-calculate end date for renewal
    useEffect(() => {
        if (renewAmcStartDate && renewWatch('amcValue') && renewAmcType) {
            const startDate = new Date(renewAmcStartDate);
            const amcValue = parseInt(renewWatch('amcValue'));

            if (renewAmcType === 'Monthly') {
                startDate.setMonth(startDate.getMonth() + amcValue);
            } else if (renewAmcType === 'Yearly') {
                startDate.setFullYear(startDate.getFullYear() + amcValue);
            }

            setRenewAmcEndDate(startDate);
        }
    }, [renewAmcStartDate, renewWatch('amcValue'), renewAmcType]);

    const onRenewSubmit = async (data) => {
        const renewData = {
            project: editData._id,
            amcType: {
                type: data.amcType,
                value: parseInt(data.amcValue)
            },
            amcStartDate: renewAmcStartDate,
            // amcEndDate: renewAmcEndDate,
            amcHours: data.amcHours
        };

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/admin/milestone/renew-amc`, renewData);
        if (response.status === 200) {
            toast.success(response.data.message);
            onHide();

            if (response.status === 200) {
                toast.success(response.data.message);
                onHide();

                if (projectStatus === "Support") {
                    dispatch(
                        getAmcProjects({
                            projectType: selectedDepartment,
                            page: 1,
                            limit: 100,
                            search: "",
                            ...scopedUserParams,
                        })
                    );
                } else {
                    dispatch(
                        getAllProjects({
                            status: true,
                            skip: 1,
                            projectType: selectedDepartment,
                            projectStatus:
                                localStorage.getItem("activeProjectTab") || "Ongoing",
                            ...scopedUserParams,
                        })
                    );
                }

                closeModal();
            }

        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static">
            <Modal.Header>
                <Modal.Title style={{ fontSize: '14px' }}>Renew AMC - {editData?.name}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={renewHandleSubmit(onRenewSubmit)}>
                <Modal.Body>
                    <Row>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>AMC Type <span className='text-danger'>*</span></Form.Label>
                                <Form.Select
                                    {...renewRegister('amcType', { required: true })}
                                    onChange={(e) => {
                                        setRenewAmcType(e.target.value);
                                        renewSetValue('amcType', e.target.value);
                                    }}
                                    style={{ height: '30px', paddingTop: '5px' }}
                                >
                                    <option value="">Select AMC Type</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                                </Form.Select>
                                {renewErrors.amcType && <span className="text-danger small">AMC Type is required</span>}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>AMC Tenure {renewAmcType ? `(${renewAmcType})` : ''} <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter AMC Tenure"
                                    {...renewRegister('amcValue', {
                                        required: true,
                                        min: { value: 1, message: 'Value must be positive' },
                                        // max: { value: renewAmcType === "Yearly" && 9, message: 'Maximum 9 years allowed' }
                                    })}
                                    onChange={(e) => {
                                        let value = e.target.value;

                                        // if Yearly is selected, restrict to 1 digit
                                        if (renewAmcType === "Yearly" && value.length > 1) {
                                            value = value.slice(0, 1);
                                        } else if (renewAmcType === "Monthly" && value.length > 3) {
                                            value = value.slice(0, 3);
                                        }

                                        renewSetValue("amcValue", value);
                                    }}
                                    // onChange={(e) => renewSetValue('amcValue', e.target.value)}
                                    style={{ height: '30px' }}
                                />
                                {renewErrors.amcValue && <span className="text-danger small">{renewErrors.amcValue.message || 'AMC Tenure is required'}</span>}
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>AMC Start Date <span className='text-danger'>*</span></Form.Label>
                                <DatePicker
                                    selected={renewAmcStartDate}
                                    onChange={date => setRenewAmcStartDate(date)}
                                    placeholderText="Select AMC start date"
                                    className="form-control"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>AMC End Date <span className='text-danger'>*</span></Form.Label>
                                <DatePicker
                                    selected={renewAmcEndDate}
                                    onChange={date => setRenewAmcEndDate(date)}
                                    minDate={renewAmcStartDate}
                                    placeholderText="Auto-calculated"
                                    className="form-control"
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                        <Col lg={6}>
                            <Form.Group className="mb-2">
                                <Form.Label className='mb-0 small'>AMC Hours <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="Enter AMC hours"
                                    {...renewRegister('amcHours', {
                                        required: 'This field is required',
                                        min: { value: 0, message: 'Hours must be positive' }
                                    })}
                                    style={{ height: '30px' }}
                                />
                                {renewErrors.amcHours && <span className="text-danger small">{renewErrors.amcHours.message}</span>}
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="btn btn-outline-secondary" onClick={onHide} style={{ padding: '4px 16px', fontSize: '11px' }}>Cancel</button>
                    <button type="submit" className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}>Renew AMC</button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ProjectModal;
