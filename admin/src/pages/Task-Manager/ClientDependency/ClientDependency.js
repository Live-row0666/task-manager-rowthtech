import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { io } from 'socket.io-client';
import config from '../../../config';
import { getClientProjects } from '../../../redux/actions';
import { getClients } from '../../../redux/client/action';
import { APICore } from '../../../helpers/api/apiCore';
import './ClientDependency.css';

const api = new APICore();

const QUICK_FIELD_TEMPLATES = [
    {
        title: 'API Secret / Token',
        desc: 'Single secure token / secret key',
        fields: [
            {
                id: 'token_field',
                label: 'API Key / Secret Token',
                fieldType: 'password',
                placeholder: 'e.g. sk_live_...',
                helpText: 'Secret API authorization token or key',
                isRequired: true
            }
        ]
    },
    {
        title: 'User Credentials',
        desc: 'Username / Email & Password pair',
        fields: [
            {
                id: 'username_field',
                label: 'Username / Email',
                fieldType: 'text',
                placeholder: 'e.g. admin@company.com',
                helpText: 'Login username or email address',
                isRequired: true
            },
            {
                id: 'password_field',
                label: 'Account Password',
                fieldType: 'password',
                placeholder: 'Enter account password',
                helpText: 'Password will be securely encrypted',
                isRequired: true
            }
        ]
    },
    {
        title: 'Payment Gateway Keys',
        desc: 'Publishable & Secret keys',
        fields: [
            {
                id: 'pub_key_field',
                label: 'Publishable / Public Key',
                fieldType: 'text',
                placeholder: 'e.g. pk_live_...',
                helpText: 'Publicly readable gateway key',
                isRequired: true
            },
            {
                id: 'sec_key_field',
                label: 'Secret / Private Key',
                fieldType: 'password',
                placeholder: 'e.g. sk_live_...',
                helpText: 'Secret server-side key',
                isRequired: true
            }
        ]
    },
    {
        title: 'Document / Asset Upload',
        desc: 'Single file or document upload',
        fields: [
            {
                id: 'doc_field',
                label: 'Asset / Document File',
                fieldType: 'file',
                placeholder: '',
                helpText: 'Upload required PDF, image, schema, or asset',
                isRequired: true
            }
        ]
    },
    {
        title: 'Database / Host Credentials',
        desc: 'Host, Port, DB Name & Password',
        fields: [
            {
                id: 'db_host_field',
                label: 'Host / URL',
                fieldType: 'url',
                placeholder: 'e.g. https://api.service.com or db.aws.com',
                helpText: 'Server host or API endpoint',
                isRequired: true
            },
            {
                id: 'db_name_field',
                label: 'Port / Database Name',
                fieldType: 'text',
                placeholder: 'e.g. 5432 / prod_db',
                helpText: 'Port and DB name identifier',
                isRequired: false
            },
            {
                id: 'db_pwd_field',
                label: 'Database Password',
                fieldType: 'password',
                placeholder: 'Enter database password',
                helpText: 'Secure DB password',
                isRequired: true
            }
        ]
    }
];

const ClientDependency = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);

    // Dependencies and stats state
    const [dependencies, setDependencies] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        submitted: 0,
        in_review: 0,
        completed: 0,
        urgent: 0
    });
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedClient, setSelectedClient] = useState('all');
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDependency, setEditingDependency] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeDependency, setActiveDependency] = useState(null);
    const [depToDelete, setDepToDelete] = useState(null);
    const [saving, setSaving] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Dynamic Create Form State
    const [formClient, setFormClient] = useState('');
    const [formProject, setFormProject] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPriority, setFormPriority] = useState('medium');
    const [formExpectedDays, setFormExpectedDays] = useState(3);
    const [formAdminNotes, setFormAdminNotes] = useState('');
    const [formDynamicFields, setFormDynamicFields] = useState([]);

    // Review Modal State
    const [revealedPasswords, setRevealedPasswords] = useState({});
    const [copiedFieldId, setCopiedFieldId] = useState(null);
    const [reviewAdminNote, setReviewAdminNote] = useState('');

    // Admin Fill Modal State
    const [showFillModal, setShowFillModal] = useState(false);
    const [fillDep, setFillDep] = useState(null);
    const [fillValues, setFillValues] = useState({});
    const [fillFiles, setFillFiles] = useState({});
    const [fillAdminNotes, setFillAdminNotes] = useState('');
    const [fillStatus, setFillStatus] = useState('completed');
    const [fillRevealedSecrets, setFillRevealedSecrets] = useState({});
    const [submittingFill, setSubmittingFill] = useState(false);
    const fillFileInputRefs = useRef({});

    const socketRef = useRef(null);

    const [directProjects, setDirectProjects] = useState([]);

    // Redux clients
    const reduxClients = useMemo(() => {
        const raw = store?.clientReducer?.clients || store?.getClientsReducer?.data?.data || [];
        return Array.isArray(raw) ? raw : (raw?.data && Array.isArray(raw.data) ? raw.data : []);
    }, [store]);

    // Projects loaded from Project model
    const allProjects = useMemo(() => {
        if (directProjects && directProjects.length > 0) return directProjects;
        const list = store?.getProjectsReducer?.data?.data || [];
        return Array.isArray(list) ? list : [];
    }, [directProjects, store]);

    // Filter only Ongoing and AMC (Support) projects (exclude Delivered, Hold, etc.)
    const ongoingOrAmcProjects = useMemo(() => {
        return allProjects.filter((p) => {
            if (!p) return false;
            const status = String(p.projectStatus || p.status || '').trim().toLowerCase();
            return status === 'ongoing' || status === 'support' || status === 'amc';
        });
    }, [allProjects]);

    // Resolve client(s) attached to a given project
    const getProjectClients = useCallback((project) => {
        if (!project) return [];
        const result = [];

        const resolveClientObj = (c) => {
            if (!c) return null;
            if (typeof c === 'object' && c._id) {
                const full = reduxClients.find((rc) => String(rc._id) === String(c._id));
                return full || c;
            }
            const cId = String(c);
            const found = reduxClients.find((rc) => String(rc._id) === cId);
            return found || { _id: cId, name: 'Client' };
        };

        if (Array.isArray(project.client)) {
            project.client.forEach((c) => {
                const resolved = resolveClientObj(c);
                if (resolved && !result.some((item) => String(item._id) === String(resolved._id))) {
                    result.push(resolved);
                }
            });
        } else if (project.client) {
            const resolved = resolveClientObj(project.client);
            if (resolved && !result.some((item) => String(item._id) === String(resolved._id))) {
                result.push(resolved);
            }
        }

        if (project.clientId) {
            const resolved = resolveClientObj(project.clientId);
            if (resolved && !result.some((item) => String(item._id) === String(resolved._id))) {
                result.push(resolved);
            }
        }

        // Also check if any client has this project in client.projects
        if (result.length === 0 && project._id) {
            const pId = String(project._id);
            reduxClients.forEach((rc) => {
                if (Array.isArray(rc.projects)) {
                    const match = rc.projects.some((pr) => {
                        const id = typeof pr === 'object' ? (pr._id || pr.id) : pr;
                        return String(id) === pId;
                    });
                    if (match && !result.some((item) => String(item._id) === String(rc._id))) {
                        result.push(rc);
                    }
                }
            });
        }

        return result;
    }, [reduxClients]);

    // Current project's attached clients
    const currentProjectClients = useMemo(() => {
        if (!formProject) return [];
        const proj = ongoingOrAmcProjects.find((p) => String(p._id) === String(formProject));
        return getProjectClients(proj);
    }, [formProject, ongoingOrAmcProjects, getProjectClients]);

    // Handle project selection in Create Modal
    const handleProjectChange = (projectId) => {
        setFormProject(projectId);
        if (!projectId) {
            setFormClient('');
            return;
        }
        const proj = ongoingOrAmcProjects.find((p) => String(p._id) === String(projectId));
        const clients = getProjectClients(proj);
        if (clients.length > 0) {
            setFormClient(clients[0]._id || clients[0].id);
        } else {
            setFormClient('');
        }
    };

    // Check if project belongs to selected client (for table filters)
    const projectMatchesClient = useCallback((p, clientId) => {
        if (!p || !clientId) return false;
        if (clientId === 'all') return true;

        if (Array.isArray(p.client)) {
            return p.client.some((c) => {
                if (!c) return false;
                const cId = c._id || c.id || c;
                return String(cId) === String(clientId);
            });
        }

        if (p.client && typeof p.client === 'object') {
            const cId = p.client._id || p.client.id;
            if (String(cId) === String(clientId)) return true;
        } else if (p.client) {
            if (String(p.client) === String(clientId)) return true;
        }

        if (p.clientId && String(p.clientId) === String(clientId)) {
            return true;
        }

        return false;
    }, []);

    // Show temporary toast notification
    const triggerToast = (msg, type = 'success') => {
        setToastMessage({ msg, type });
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    };

    // Load clients & projects from Project model on mount
    useEffect(() => {
        dispatch(getClients({ page: 1, limit: 500 }));

        api.get('/api/v1/admin/project?page=1&limit=500')
            .then((res) => {
                const list = res?.data?.data || res?.data?.projects || res?.data || [];
                if (Array.isArray(list) && list.length > 0) {
                    setDirectProjects(list);
                }
            })
            .catch(() => { });
    }, [dispatch]);

    // Socket.IO real-time listener
    useEffect(() => {
        const socketServerUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const socket = io(socketServerUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });
        socketRef.current = socket;

        const joinAdmin = () => {
            socket.emit('join_admin_support');
        };

        joinAdmin();
        socket.on('connect', joinAdmin);

        socket.on('dependency_created', (data) => {
            fetchDependencies();
            fetchStats();
        });

        socket.on('dependency_submitted', (data) => {
            triggerToast(`Client submitted fulfillment for "${data.title || 'Dependency'}"!`, 'info');
            fetchDependencies();
            fetchStats();
        });

        socket.on('dependency_status_changed', (data) => {
            fetchDependencies();
            fetchStats();
        });

        socket.on('dependency_updated', () => {
            fetchDependencies();
            fetchStats();
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    // Fetch Stats
    const fetchStats = async () => {
        try {
            const res = await api.get('/api/v1/admin/client-dependency/stats');
            if (res && res.data) {
                const statsData = res.data.data || res.data;
                setStats(statsData);
            }
        } catch (err) {
            console.error('Error fetching dependency stats:', err);
        }
    };

    // Fetch Dependencies list
    const fetchDependencies = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedClient && selectedClient !== 'all') params.clientId = selectedClient;
            if (selectedProject && selectedProject !== 'all') params.projectId = selectedProject;
            if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
            if (selectedPriority && selectedPriority !== 'all') params.priority = selectedPriority;
            if (searchTerm.trim()) params.search = searchTerm.trim();

            const res = await api.get('/api/v1/admin/client-dependency', params);
            if (res && res.data) {
                const list = Array.isArray(res.data.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];
                setDependencies(list);
            } else {
                setDependencies([]);
            }
        } catch (err) {
            console.error('Error fetching dependencies:', err);
            setDependencies([]);
        } finally {
            setLoading(false);
        }
    }, [selectedClient, selectedProject, selectedStatus, selectedPriority, searchTerm]);

    useEffect(() => {
        fetchDependencies();
        fetchStats();
    }, [fetchDependencies]);

    // Reset Create Modal Form
    const handleOpenCreateModal = () => {
        setEditingDependency(null);
        setFormProject('');
        setFormClient('');
        setFormTitle('');
        setFormDescription('');
        setFormPriority('medium');
        setFormExpectedDays(3);
        setFormAdminNotes('');
        // Initialize with default API Token dynamic field
        setFormDynamicFields([
            {
                id: 'field_' + Date.now(),
                label: 'API Key / Secret Token',
                fieldType: 'password',
                placeholder: 'e.g. sk_live_...',
                helpText: 'Secret API authorization key or token',
                isRequired: true
            }
        ]);
        setShowCreateModal(true);
    };

    const handleOpenEditModal = (dep) => {
        setEditingDependency(dep);
        setFormProject(dep.project?._id || dep.project || '');
        setFormClient(dep.client?._id || dep.client || '');
        setFormTitle(dep.title || '');
        setFormDescription(dep.description || '');
        setFormPriority(dep.priority || 'medium');
        setFormExpectedDays(dep.expectedDays ?? 3);
        setFormAdminNotes(dep.adminNotes || '');
        setFormDynamicFields((dep.dynamicFields || []).map((field) => ({ ...field })));
        setShowCreateModal(true);
    };

    // Add dynamic field manually
    const handleAddCustomField = () => {
        const newField = {
            id: 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            label: `Requirement Field #${formDynamicFields.length + 1}`,
            fieldType: 'text',
            placeholder: 'Enter value',
            helpText: '',
            isRequired: true
        };
        setFormDynamicFields([...formDynamicFields, newField]);
    };

    // Apply quick template
    const handleApplyTemplate = (tmpl) => {
        const instantiatedFields = tmpl.fields.map((f, idx) => ({
            ...f,
            id: 'field_' + Date.now() + '_' + idx
        }));
        setFormDynamicFields([...formDynamicFields, ...instantiatedFields]);
        triggerToast(`Added template: "${tmpl.title}"`);
    };

    // Modify a dynamic field
    const handleUpdateField = (index, key, value) => {
        const updated = [...formDynamicFields];
        updated[index] = { ...updated[index], [key]: value };
        setFormDynamicFields(updated);
    };

    // Remove a dynamic field
    const handleRemoveField = (index) => {
        if (formDynamicFields.length <= 1) {
            triggerToast('A dependency must have at least one requirement field.', 'error');
            return;
        }
        const updated = formDynamicFields.filter((_, i) => i !== index);
        setFormDynamicFields(updated);
    };

    // Move field up or down
    const handleMoveField = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= formDynamicFields.length) return;
        const updated = [...formDynamicFields];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        setFormDynamicFields(updated);
    };

    // Save New Dependency
    const handleCreateDependencySubmit = async (e) => {
        e.preventDefault();
        if (!formProject) {
            triggerToast('Please select a project.', 'error');
            return;
        }
        if (!formClient) {
            triggerToast('This project does not have an attached client. Please link a client in project settings first.', 'error');
            return;
        }
        if (!formTitle.trim()) {
            triggerToast('Please enter dependency title.', 'error');
            return;
        }
        if (formDynamicFields.length === 0) {
            triggerToast('Please add at least one dynamic requirement field.', 'error');
            return;
        }

        // Validate that all dynamic fields have a label
        for (let i = 0; i < formDynamicFields.length; i++) {
            if (!formDynamicFields[i].label.trim()) {
                triggerToast(`Field #${i + 1} must have a title / label.`, 'error');
                return;
            }
        }

        try {
            setSaving(true);
            const payload = {
                clientId: formClient,
                projectId: formProject,
                title: formTitle.trim(),
                description: formDescription.trim(),
                priority: formPriority,
                expectedDays: parseInt(formExpectedDays, 10) || 3,
                adminNotes: formAdminNotes.trim(),
                dynamicFields: formDynamicFields
            };

            const res = editingDependency
                ? await api.update(`/api/v1/admin/client-dependency/${editingDependency._id}`, payload)
                : await api.create('/api/v1/admin/client-dependency', payload);
            if (res && res.status) {
                triggerToast(editingDependency ? 'Dependency updated successfully!' : 'Dependency requirement sent to client successfully!');
                setShowCreateModal(false);
                fetchDependencies();
                fetchStats();
            } else {
                triggerToast(res?.data?.message || 'Failed to save dependency.', 'error');
            }
        } catch (err) {
            console.error('Error creating dependency:', err);
            triggerToast(err?.message || (typeof err === 'string' ? err : 'Server error saving dependency.'), 'error');
        } finally {
            setSaving(false);
        }
    };

    // Open Review / Detail Modal
    const handleOpenReviewModal = async (dep) => {
        try {
            setActiveDependency(dep);
            setReviewAdminNote(dep.adminNotes || '');
            setRevealedPasswords({});
            setShowReviewModal(true);

            // Fetch latest fresh data for this dependency
            const res = await api.get(`/api/v1/admin/client-dependency/${dep._id}`);
            if (res && res.data) {
                const freshData = res.data.data || res.data;
                setActiveDependency(freshData);
                setReviewAdminNote(freshData.adminNotes || '');
            }
        } catch (err) {
            console.error('Error opening review modal:', err);
        }
    };

    // Copy to clipboard helper
    const handleCopyValue = (fieldId, value) => {
        if (!value) return;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(value);
            setCopiedFieldId(fieldId);
            setTimeout(() => {
                setCopiedFieldId(null);
            }, 2500);
        }
    };

    // Toggle reveal password
    const toggleRevealPassword = (fieldId) => {
        setRevealedPasswords((prev) => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    // Status Update Action
    const handleUpdateStatus = async (newStatus) => {
        if (!activeDependency?._id) return;
        try {
            setUpdatingStatus(true);
            const res = await api.update(`/api/v1/admin/client-dependency/${activeDependency._id}/status`, {
                status: newStatus,
                adminNotes: reviewAdminNote
            });
            if (res && res.status) {
                triggerToast(`Dependency status updated to "${newStatus.replace('_', ' ')}"!`);
                setActiveDependency((prev) => ({ ...prev, status: newStatus, adminNotes: reviewAdminNote }));
                fetchDependencies();
                fetchStats();
            } else {
                triggerToast(res?.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            triggerToast(err?.message || 'Error updating status', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Open Fill Modal
    const handleOpenFillModal = (dep) => {
        setFillDep(dep);
        const initialVals = {};
        const initialFiles = {};
        if (dep.dynamicFields) {
            dep.dynamicFields.forEach((field) => {
                initialVals[field.id] = field.value || '';
                if (field.fileValue) {
                    initialFiles[field.id] = field.fileValue;
                }
            });
        }
        setFillValues(initialVals);
        setFillFiles(initialFiles);
        setFillAdminNotes(dep.adminNotes || '');
        const allFilled = dep.dynamicFields && dep.dynamicFields.length > 0 && dep.dynamicFields.every((f) => {
            if (f.fieldType === 'file') return !!f.fileValue?.url;
            return !!f.value && String(f.value).trim().length > 0;
        });
        setFillStatus(allFilled ? 'completed' : (dep.status === 'completed' ? 'completed' : 'submitted'));
        setFillRevealedSecrets({});
        setShowFillModal(true);
    };

    // Handle field text change in fill modal
    const handleFillFieldChange = (fieldId, val) => {
        setFillValues((prev) => ({
            ...prev,
            [fieldId]: val
        }));
    };

    // Handle file select in fill modal
    const handleFillFileSelect = (fieldId, file) => {
        if (!file) return;
        setFillFiles((prev) => ({
            ...prev,
            [fieldId]: file
        }));
    };

    // Remove selected file in fill modal
    const handleFillRemoveFile = (fieldId) => {
        setFillFiles((prev) => {
            const copy = { ...prev };
            delete copy[fieldId];
            return copy;
        });
    };

    // Toggle reveal password in fill modal
    const toggleFillSecretReveal = (fieldId) => {
        setFillRevealedSecrets((prev) => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
    };

    // Submit Fulfillment by Admin
    const handleSubmitAdminFill = async (e) => {
        e.preventDefault();
        if (!fillDep?._id) return;

        // Allow partial fulfillment: admin can fill just one or more fields without requiring all fields at once
        const hasAnyField = fillDep.dynamicFields?.some((field) => {
            if (field.fieldType === 'file') {
                return fillFiles[field.id] || field.fileValue?.url;
            }
            const val = fillValues[field.id];
            return val !== undefined && String(val).trim().length > 0;
        });

        if (!hasAnyField && !fillAdminNotes.trim()) {
            triggerToast('Please fill in at least one requirement field or add a note before saving.', 'error');
            return;
        }

        try {
            setSubmittingFill(true);
            const formData = new FormData();
            formData.append('fields', JSON.stringify(fillValues));
            formData.append('adminNotes', fillAdminNotes.trim());
            formData.append('status', fillStatus);

            // Append newly uploaded files with field ID as key
            Object.keys(fillFiles).forEach((fieldId) => {
                const f = fillFiles[fieldId];
                if (f instanceof File) {
                    formData.append(fieldId, f);
                }
            });

            const res = await api.updateWithFormData(
                `/api/v1/admin/client-dependency/${fillDep._id}/submit`,
                formData
            );

            if (res && (res.status === 200 || res.data?.status === 200 || res.status === true)) {
                triggerToast('Requirement values fulfilled and saved successfully!');
                setShowFillModal(false);
                if (showReviewModal) setShowReviewModal(false);
                fetchDependencies();
                fetchStats();
            } else {
                triggerToast(res?.data?.message || res?.message || 'Failed to fulfill requirement', 'error');
            }
        } catch (err) {
            console.error('Error fulfilling dependency by admin:', err);
            triggerToast(err?.message || 'Error saving fulfillment', 'error');
        } finally {
            setSubmittingFill(false);
        }
    };

    // Delete Dependency
    const handleDeleteDependency = async () => {
        if (!depToDelete?._id) return;
        try {
            const res = await api.delete(`/api/v1/admin/client-dependency/${depToDelete._id}`);
            if (res && res.status) {
                triggerToast('Dependency deleted successfully.');
                setShowDeleteModal(false);
                setDepToDelete(null);
                if (showReviewModal) setShowReviewModal(false);
                fetchDependencies();
                fetchStats();
            } else {
                triggerToast(res?.message || 'Failed to delete dependency', 'error');
            }
        } catch (err) {
            console.error('Error deleting dependency:', err);
            triggerToast(err?.message || 'Error deleting dependency', 'error');
        }
    };

    // Days Remaining / Overdue Helper
    const getDueStatusText = (dueDate) => {
        if (!dueDate) return null;
        const now = new Date();
        const due = new Date(dueDate);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                text: `Overdue by ${Math.abs(diffDays)}d`,
                className: 'overdue'
            };
        } else if (diffDays === 0) {
            return {
                text: 'Due Today',
                className: 'urgent'
            };
        } else {
            return {
                text: `${diffDays} days left`,
                className: 'normal'
            };
        }
    };

    return (
        <div className="client-dep-page">
            {/* Top Toast Banner */}
            {toastMessage && (
                <div className={`dep-toast-banner ${toastMessage.type}`}>
                    <i className={toastMessage.type === 'error' ? 'uil uil-exclamation-triangle' : 'uil uil-check-circle'}></i>
                    <span>{toastMessage.msg}</span>
                    <button className="btn-close-toast" onClick={() => setToastMessage(null)}>×</button>
                </div>
            )}

            {/* Header */}
            <div className="client-dep-header">
                <div className="client-dep-title-wrap">
                    <h3>
                        <i className="uil uil-layer-group text-primary"></i>
                        Client Dependencies & Dynamic Requirements
                    </h3>
                    <p className="client-dep-subtitle">
                        Request dynamic API tokens, credentials, documents, and credentials from clients with deadline & priority tracking
                    </p>
                </div>
                <div>
                    <button
                        type="button"
                        className="btn-new-dep"
                        onClick={handleOpenCreateModal}
                    >
                        <i className="uil uil-plus"></i> New Dependency Request
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="client-dep-stats-grid">
                <div className="dep-stat-card">
                    <div>
                        <div className="dep-stat-label">Total Dependencies</div>
                        <div className="dep-stat-value text-primary">{stats.total || 0}</div>
                    </div>
                    <div className="dep-stat-icon-wrap dep-icon-total">
                        <i className="uil uil-layers"></i>
                    </div>
                </div>

                <div className="dep-stat-card">
                    <div>
                        <div className="dep-stat-label">Pending Client</div>
                        <div className="dep-stat-value text-warning">{stats.pending || 0}</div>
                    </div>
                    <div className="dep-stat-icon-wrap dep-icon-pending">
                        <i className="uil uil-clock-three"></i>
                    </div>
                </div>

                <div className="dep-stat-card">
                    <div>
                        <div className="dep-stat-label">Ready for Review</div>
                        <div className="dep-stat-value" style={{ color: '#7c3aed' }}>{stats.submitted || 0}</div>
                    </div>
                    <div className="dep-stat-icon-wrap dep-icon-submitted">
                        <i className="uil uil-envelope-upload"></i>
                    </div>
                </div>

                <div className="dep-stat-card">
                    <div>
                        <div className="dep-stat-label">In Review</div>
                        <div className="dep-stat-value text-info">{stats.in_review || 0}</div>
                    </div>
                    <div className="dep-stat-icon-wrap dep-icon-review">
                        <i className="uil uil-eye"></i>
                    </div>
                </div>

                <div className="dep-stat-card">
                    <div>
                        <div className="dep-stat-label">Completed</div>
                        <div className="dep-stat-value text-success">{stats.completed || 0}</div>
                    </div>
                    <div className="dep-stat-icon-wrap dep-icon-completed">
                        <i className="uil uil-check-circle"></i>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="client-dep-filter-card">
                <div className="dep-filter-title">
                    <i className="uil uil-filter text-primary"></i>
                    Filter Requirements
                </div>

                <div className="dep-filter-row">
                    <div className="dep-filter-item">
                        <label className="dep-filter-label">Select Project</label>
                        <select
                            className="dep-filter-select"
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="all">All Projects</option>
                            {allProjects.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name || p.projectName || 'Project'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="dep-filter-item">
                        <label className="dep-filter-label">Status</label>
                        <select
                            className="dep-filter-select"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending Client</option>
                            <option value="submitted">Submitted</option>
                            <option value="in_review">In Review</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected / Revision</option>
                        </select>
                    </div>

                    <div className="dep-filter-item">
                        <label className="dep-filter-label">Priority</label>
                        <select
                            className="dep-filter-select"
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div className="dep-filter-item-search">
                        <label className="dep-filter-label">Search Requirements</label>
                        <div className="dep-search-input-wrap">
                            <i className="uil uil-search dep-search-icon"></i>
                            <input
                                type="text"
                                className="dep-filter-input dep-search-input"
                                placeholder="Search by title, description or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            className="btn-filter-reset"
                            onClick={() => {
                                setSelectedClient('all');
                                setSelectedProject('all');
                                setSelectedStatus('all');
                                setSelectedPriority('all');
                                setSearchTerm('');
                            }}
                            title="Reset all filters"
                        >
                            <i className="uil uil-redo"></i> Reset
                        </button>
                    </div>
                </div>

                {/* Active filter tags */}
                {(selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || searchTerm) && (
                    <div className="dep-active-tags-bar">
                        <span className="text-muted fw-bold me-1">Active filters:</span>
                        {selectedProject !== 'all' && (
                            <span className="dep-tag-pill">
                                Project: {allProjects.find((p) => String(p._id) === String(selectedProject))?.name || allProjects.find((p) => String(p._id) === String(selectedProject))?.projectName || selectedProject}
                                <span className="dep-tag-remove" onClick={() => setSelectedProject('all')}>&times;</span>
                            </span>
                        )}
                        {selectedStatus !== 'all' && (
                            <span className="dep-tag-pill">
                                Status: {selectedStatus.replace('_', ' ')}
                                <span className="dep-tag-remove" onClick={() => setSelectedStatus('all')}>&times;</span>
                            </span>
                        )}
                        {selectedPriority !== 'all' && (
                            <span className="dep-tag-pill">
                                Priority: {selectedPriority}
                                <span className="dep-tag-remove" onClick={() => setSelectedPriority('all')}>&times;</span>
                            </span>
                        )}
                        {searchTerm && (
                            <span className="dep-tag-pill">
                                Query: "{searchTerm}"
                                <span className="dep-tag-remove" onClick={() => setSearchTerm('')}>&times;</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Dependencies Table or Polished Empty State */}
            {loading ? (
                <div className="dep-empty-card">
                    <div className="dep-spinner"></div>
                    <p className="mb-0">Loading client dependencies...</p>
                </div>
            ) : (!Array.isArray(dependencies) || dependencies.length === 0) ? (
                <div className="dep-empty-card">
                    <div className="dep-empty-icon-wrap">
                        <i className="uil uil-clipboard-notes"></i>
                    </div>
                    <h4>No Dependency Requirements Found</h4>
                    <p>
                        There are no requirements matching your filter criteria. Create a new request to solicit tokens, credentials, or documents from the client.
                    </p>
                    <button className="btn-new-dep" onClick={handleOpenCreateModal}>
                        <i className="uil uil-plus"></i> New Dependency Request
                    </button>
                </div>
            ) : (
                <div className="dep-table-card">
                    <table className="dep-table">
                        <thead>
                            <tr>
                                <th>Dependency & Scope</th>
                                <th>Client & Project</th>
                                <th>Priority</th>
                                <th>Timeline & Turnaround</th>
                                <th>Requirement Fields</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(dependencies) ? dependencies : []).map((dep) => {
                                const dueMeta = getDueStatusText(dep.dueDate);
                                const filledCount = dep.dynamicFields?.filter((f) => f.isFilled || f.value || f.fileValue?.url)?.length || 0;
                                const totalCount = dep.dynamicFields?.length || 0;

                                return (
                                    <tr key={dep._id} className={dep.priority === 'urgent' ? 'row-urgent' : ''}>
                                        <td>
                                            <div className="dep-cell-title">
                                                <span className="dep-code">
                                                    DEP-{dep._id.substr(-5).toUpperCase()}
                                                </span>
                                                <div className="dep-code-title-row">
                                                    <span className="dep-title-text" onClick={() => handleOpenReviewModal(dep)}>
                                                        {dep.title}
                                                    </span>
                                                </div>
                                                {dep.description && (
                                                    <span className="dep-desc-text">
                                                        {dep.description}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="dep-cell-client">
                                                <span className="client-name">
                                                    <i className="uil uil-user"></i>
                                                    {dep.client?.name || dep.client?.clientName || 'Assigned Client'}
                                                </span>
                                                <span className="project-badge">
                                                    <i className="uil uil-folder"></i>
                                                    {dep.project?.name || dep.project?.projectName || (typeof dep.project === 'string' ? (allProjects.find(p => String(p._id) === String(dep.project))?.name || allProjects.find(p => String(p._id) === String(dep.project))?.projectName) : '') || 'Assigned Project'}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span className={`dep-priority-pill ${dep.priority}`}>
                                                <span className="priority-dot"></span>
                                                {dep.priority?.toUpperCase()}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="dep-cell-timeline">
                                                <span className="expected-days">
                                                    {dep.expectedDays} {dep.expectedDays === 1 ? 'day' : 'days'} required
                                                </span>
                                                {dueMeta && (
                                                    <span className={`due-meta-pill ${dueMeta.className}`}>
                                                        {dueMeta.text}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="dep-cell-fields">
                                                <span className="fields-count-badge">
                                                    <i className="uil uil-sliders-v-alt"></i>
                                                    {filledCount} of {totalCount} filled
                                                </span>
                                                <div className="fields-type-chips">
                                                    {dep.dynamicFields?.slice(0, 3).map((f, i) => (
                                                        <span key={i} className="field-chip-mini" title={f.label}>
                                                            {f.fieldType === 'password' && <i className="uil uil-key-skeleton"></i>}
                                                            {f.fieldType === 'file' && <i className="uil uil-paperclip"></i>}
                                                            {f.fieldType === 'url' && <i className="uil uil-link-h"></i>}
                                                            {f.fieldType === 'text' && <i className="uil uil-font"></i>}
                                                            {f.fieldType === 'textarea' && <i className="uil uil-subject"></i>}
                                                            {f.label}
                                                        </span>
                                                    ))}
                                                    {dep.dynamicFields?.length > 3 && (
                                                        <span className="field-chip-more">+{dep.dynamicFields.length - 3}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`dep-status-pill ${dep.status}`}>
                                                {dep.status === 'pending' && <><i className="uil uil-clock"></i> Pending Client</>}
                                                {dep.status === 'submitted' && <><i className="uil uil-check"></i> Submitted</>}
                                                {dep.status === 'in_review' && <><i className="uil uil-eye"></i> In Review</>}
                                                {dep.status === 'completed' && <><i className="uil uil-check-circle"></i> Completed</>}
                                                {dep.status === 'rejected' && <><i className="uil uil-times-circle"></i> Revision</>}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="dep-actions-row">
                                                <button
                                                    className="btn-action-view"
                                                    onClick={() => handleOpenEditModal(dep)}
                                                    title="Edit dependency requirement"
                                                >
                                                    <i className="uil uil-edit"></i>
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    className="btn-action-fill"
                                                    onClick={() => handleOpenFillModal(dep)}
                                                    title="Fill requirement values"
                                                >
                                                    <i className="uil uil-edit-alt"></i>
                                                    <span>Fill</span>
                                                </button>
                                                <button
                                                    className="btn-action-view"
                                                    onClick={() => handleOpenReviewModal(dep)}
                                                    title="Review requirements and credentials"
                                                >
                                                    <i className="uil uil-eye"></i>
                                                    <span>Review</span>
                                                </button>
                                                <button
                                                    className="btn-action-delete"
                                                    onClick={() => {
                                                        setDepToDelete(dep);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    title="Delete dependency"
                                                >
                                                    <i className="uil uil-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {/* </div> */}
            <Modal
                show={showCreateModal}
                onHide={() => setShowCreateModal(false)}
                size="lg"
                centered
                dialogClassName="dep-custom-modal"
            >
                <form onSubmit={handleCreateDependencySubmit}>
                    <div className="dep-modal-header">
                        <div className="dep-modal-header-left">
                            <div className="dep-modal-header-icon">
                                <i className="uil uil-plus-circle"></i>
                            </div>
                            <div>
                                <h5 className="dep-modal-title">{editingDependency ? 'Edit Dependency Requirement' : 'Create Dynamic Dependency Requirement'}</h5>
                                <p className="dep-modal-subtitle">
                                    Request dynamic credentials, API tokens, documents or specifications from client
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="dep-modal-body">
                        <div className="dep-modal-grid">
                            {editingDependency ? (
                                <div className="dep-form-group">
                                    <label>Project / Client</label>
                                    <div className="dep-form-control">
                                        {editingDependency.project?.name || 'Project'} — {editingDependency.client?.name || 'Client'}
                                    </div>
                                </div>
                            ) : (
                                <>
                            {/* Project Selection (Ongoing & AMC Only) */}
                        <div className="dep-form-group">
                            <label className="d-flex justify-content-between align-items-center mb-1">
                                <span>
                                    Select Project <span className="req">*</span>
                                </span>
                                <span className="badge bg-soft-primary text-primary" style={{ fontSize: '11px', fontWeight: 600 }}>
                                    {ongoingOrAmcProjects.length} Ongoing &amp; AMC Projects
                                </span>
                            </label>
                            <select
                                className="dep-form-control"
                                value={formProject}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Ongoing or AMC Project --</option>
                                {ongoingOrAmcProjects.map((p) => {
                                    const pClients = getProjectClients(p);
                                    const clientName = pClients.map((c) => c.name || c.loginEmail).filter(Boolean).join(', ');
                                    const status = (p.projectStatus === 'Support' || p.projectStatus?.toLowerCase() === 'amc') ? 'AMC' : (p.projectStatus || 'Ongoing');
                                    return (
                                        <option key={p._id} value={p._id}>
                                            {p.name || p.projectName || 'Project'} ({status}){clientName ? ` — Client: ${clientName}` : ' — (No client)'}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Client Detection & Status */}
                        {formProject && (
                            <div className="dep-form-group" style={{ marginTop: '-4px', marginBottom: '14px' }}>
                                {currentProjectClients.length === 0 ? (
                                    <div className="p-2 rounded border text-warning d-flex align-items-center" style={{ backgroundColor: 'rgba(255, 193, 7, 0.08)', borderColor: '#ffc107', fontSize: '13px' }}>
                                        <i className="uil uil-exclamation-triangle me-2" style={{ fontSize: '18px' }}></i>
                                        <span>
                                            <strong>Notice:</strong> No client is currently linked to this project. Please link a client in Project settings so the dependency can reach their portal.
                                        </span>
                                    </div>
                                ) : currentProjectClients.length === 1 ? (
                                    <div className="p-2 rounded border d-flex align-items-center justify-content-between" style={{ backgroundColor: 'rgba(25, 135, 84, 0.08)', borderColor: '#198754', color: '#198754', fontSize: '13px' }}>
                                        <div className="d-flex align-items-center">
                                            <i className="uil uil-user-check me-2" style={{ fontSize: '18px' }}></i>
                                            <span>
                                                Linked Client: <strong>{currentProjectClients[0].name || currentProjectClients[0].loginEmail || 'Client'}</strong>
                                                {currentProjectClients[0].loginEmail ? ` (${currentProjectClients[0].loginEmail})` : ''}
                                            </span>
                                        </div>
                                        <span className="badge bg-success text-white" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                            Direct to Client Portal
                                        </span>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                                            Project has multiple clients — select recipient <span className="req">*</span>:
                                        </label>
                                        <select
                                            className="dep-form-control"
                                            value={formClient}
                                            onChange={(e) => setFormClient(e.target.value)}
                                            required
                                        >
                                            {currentProjectClients.map((c) => (
                                                <option key={c._id} value={c._id}>
                                                    {c.name || c.loginEmail || c.email} {c.companyName ? `(${c.companyName})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                                </>
                            )}

                        {/* Title & Priority & Turnaround */}
                        <div className="dep-form-group">
                            <label>
                                Requirement Title <span className="req">*</span>
                            </label>
                            <input
                                type="text"
                                className="dep-form-control"
                                placeholder="e.g. Production Stripe Keys & Webhook Signing Secret"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="dep-form-row three-col">
                            <div className="dep-form-group">
                                <label>Priority</label>
                                <select
                                    className="dep-form-control"
                                    value={formPriority}
                                    onChange={(e) => setFormPriority(e.target.value)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="dep-form-group">
                                <label>
                                    Turnaround Days <span className="req">*</span>
                                </label>
                                <div className="input-group-days">
                                    <input
                                        type="number"
                                        className="dep-form-control"
                                        min="1"
                                        max="60"
                                        value={formExpectedDays}
                                        onChange={(e) => setFormExpectedDays(e.target.value)}
                                        required
                                    />
                                    <span className="days-addon">days</span>
                                </div>
                            </div>

                            <div className="dep-form-group">
                                <label>Calculated Deadline</label>
                                <div className="calculated-due-badge">
                                    <i className="uil uil-calendar-alt"></i>
                                    {new Date(Date.now() + (parseInt(formExpectedDays, 10) || 1) * 86400000).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="dep-form-group">
                            <label>Instructions / Requirement Context</label>
                            <textarea
                                className="dep-form-control"
                                rows="2"
                                placeholder="Provide clear steps or instructions for the client regarding where to obtain these credentials or details..."
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                            />
                        </div>

                        {/* Quick Field Templates Section */}
                        <div className="dep-builder-section">
                            <div className="dep-builder-header">
                                <div>
                                    <h6>Requirement Fields</h6>
                                    <p>Build custom input fields the client must provide (passwords, tokens, text, urls, files).</p>
                                </div>
                            </div>

                            <div className="quick-templates-box">
                                <span className="quick-tmpl-title">1-Click Templates:</span>
                                <div className="quick-tmpl-chips">
                                    {QUICK_FIELD_TEMPLATES.map((tmpl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className="btn-quick-tmpl"
                                            onClick={() => handleApplyTemplate(tmpl)}
                                            title={tmpl.desc}
                                        >
                                            <i className="uil uil-plus"></i> {tmpl.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Field Items List */}
                            <div className="dynamic-fields-list">
                                {formDynamicFields.map((field, index) => (
                                    <div key={field.id || index} className="dynamic-field-item">
                                        <div className="dynamic-field-top">
                                            <span className="field-seq">#{index + 1}</span>
                                            <div className="field-inputs-row">
                                                <div className="field-label-col">
                                                    <input
                                                        type="text"
                                                        className="dep-form-control field-label-input"
                                                        placeholder="Field Label (e.g. API Secret Token)"
                                                        value={field.label}
                                                        onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="field-type-col">
                                                    <select
                                                        className="dep-form-control field-type-select"
                                                        value={field.fieldType}
                                                        onChange={(e) => handleUpdateField(index, 'fieldType', e.target.value)}
                                                    >
                                                        <option value="text">Single-line Text</option>
                                                        <option value="password">Password / Secret Token</option>
                                                        <option value="textarea">Multi-line Text</option>
                                                        <option value="url">URL / Web Link</option>
                                                        <option value="file">File / Attachment</option>
                                                    </select>
                                                </div>

                                                <div className="field-req-col">
                                                    <label className="checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            checked={field.isRequired}
                                                            onChange={(e) => handleUpdateField(index, 'isRequired', e.target.checked)}
                                                        />
                                                        <span>Required</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="field-actions-col">
                                                <button
                                                    type="button"
                                                    className="btn-field-seq"
                                                    disabled={index === 0}
                                                    onClick={() => handleMoveField(index, -1)}
                                                    title="Move Up"
                                                >
                                                    <i className="uil uil-arrow-up"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-field-seq"
                                                    disabled={index === formDynamicFields.length - 1}
                                                    onClick={() => handleMoveField(index, 1)}
                                                    title="Move Down"
                                                >
                                                    <i className="uil uil-arrow-down"></i>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-field-remove"
                                                    onClick={() => handleRemoveField(index)}
                                                    title="Remove Field"
                                                >
                                                    <i className="uil uil-trash-alt"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="dynamic-field-bottom">
                                            {field.fieldType !== 'file' && (
                                                <input
                                                    type="text"
                                                    className="dep-form-control field-sub-input"
                                                    placeholder="Placeholder text (e.g. sk_live_...)"
                                                    value={field.placeholder || ''}
                                                    onChange={(e) => handleUpdateField(index, 'placeholder', e.target.value)}
                                                />
                                            )}
                                            <input
                                                type="text"
                                                className="dep-form-control field-sub-input"
                                                placeholder="Helper guidance note for client (optional)"
                                                value={field.helpText || ''}
                                                onChange={(e) => handleUpdateField(index, 'helpText', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="btn-add-custom-field"
                                onClick={handleAddCustomField}
                            >
                                <i className="uil uil-plus"></i> Add Custom Field
                            </button>
                        </div>

                        {/* Internal Admin Note */}
                        <div className="dep-form-group">
                            <label>Internal Admin Notes (Optional)</label>
                            <input
                                type="text"
                                className="dep-form-control"
                                placeholder="Internal memo for project manager or developers..."
                                value={formAdminNotes}
                                onChange={(e) => setFormAdminNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="dep-modal-footer">
                    <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={() => setShowCreateModal(false)}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-modal-submit"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                {editingDependency ? 'Saving Changes...' : 'Dispatching to Client...'}
                            </>
                        ) : (
                            <>
                                <i className="uil uil-send"></i>
                                {editingDependency ? 'Save Changes' : 'Send Dependency to Client'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>

            {/* REVIEW / DETAIL MODAL */ }
    {
        activeDependency && (
            <Modal
                show={showReviewModal}
                onHide={() => setShowReviewModal(false)}
                size="lg"
                centered
                dialogClassName="dep-custom-modal dep-review-modal"
            >
                <div className="dep-modal-header">
                    <div className="dep-modal-header-left">
                        <div className="dep-modal-header-icon">
                            <i className="uil uil-file-alt"></i>
                        </div>
                        <div>
                            <div className="">
                                <span className="review-ticket-tag">
                                    DEP-{activeDependency._id ? activeDependency._id.substr(-5).toUpperCase() : 'REQ'}
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <h5 className="dep-modal-title mb-0">{activeDependency.title}</h5>
                                <span className={`dep-priority-pill ${activeDependency.priority}`}>
                                    <span className="priority-dot"></span>
                                    {activeDependency.priority?.toUpperCase()}
                                </span>
                                <span className={`dep-status-pill ${activeDependency.status}`}>
                                    {activeDependency.status?.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="dep-modal-close-btn"
                        onClick={() => setShowReviewModal(false)}
                        title="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <div className="dep-modal-body">
                    <div className="review-meta-bar">
                        <div className="review-meta-item">
                            <span className="meta-label">Client</span>
                            <span className="meta-val">
                                <i className="uil uil-user"></i>
                                {activeDependency.client?.name || activeDependency.client?.clientName || 'Client'}
                            </span>
                        </div>

                        <div className="review-meta-item">
                            <span className="meta-label">Project</span>
                            <span className="meta-val">
                                <i className="uil uil-folder"></i>
                                {activeDependency.project?.name || activeDependency.project?.projectName || (typeof activeDependency.project === 'string' ? (allProjects.find(p => String(p._id) === String(activeDependency.project))?.name) : '') || 'Project'}
                            </span>
                        </div>

                        <div className="review-meta-item">
                            <span className="meta-label">Timeline</span>
                            <span className="meta-val">
                                <i className="uil uil-hourglass"></i>
                                {activeDependency.expectedDays} Days Turnaround
                            </span>
                        </div>

                        <div className="review-meta-item">
                            <span className="meta-label">Current Status</span>
                            <span className={`dep-status-pill ${activeDependency.status}`}>
                                {activeDependency.status?.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {activeDependency.description && (
                        <div className="review-instructions-box">
                            <span className="instr-label">Requirement Instructions:</span>
                            <p>{activeDependency.description}</p>
                        </div>
                    )}

                    {/* Client Submitted Dynamic Fields */}
                    <div className="review-fields-section">
                        <div className="review-fields-heading">
                            <h6>Fulfilled Credentials & Requirement Data</h6>
                            <span className="fields-stat">
                                {activeDependency.dynamicFields?.filter((f) => f.isFilled || f.value || f.fileValue?.url)?.length} of{' '}
                                {activeDependency.dynamicFields?.length} provided
                            </span>
                        </div>

                        <div className="review-fields-grid">
                            {activeDependency.dynamicFields?.map((field, idx) => {
                                const hasValue = field.value || field.fileValue?.url;
                                const isPass = field.fieldType === 'password';
                                const isRevealed = revealedPasswords[field.id || idx];
                                const isCopied = copiedFieldId === (field.id || idx);

                                return (
                                    <div key={field.id || idx} className={`review-field-card ${hasValue ? 'filled' : 'unfilled'}`}>
                                        <div className="review-field-top">
                                            <div className="review-field-title">
                                                <span className="field-seq-tag">#{idx + 1}</span>
                                                <span className="field-label-name">{field.label}</span>
                                                {field.isRequired && <span className="field-req-tag">Required</span>}
                                                <span className="field-type-tag">{field.fieldType}</span>
                                            </div>

                                            {hasValue && (
                                                <div className="review-field-actions">
                                                    {isPass && (
                                                        <button
                                                            type="button"
                                                            className="btn-field-icon"
                                                            onClick={() => toggleRevealPassword(field.id || idx)}
                                                            title={isRevealed ? 'Mask secret' : 'Reveal secret'}
                                                        >
                                                            <i className={isRevealed ? 'uil uil-eye-slash' : 'uil uil-eye'}></i>
                                                        </button>
                                                    )}

                                                    {field.fieldType !== 'file' && (
                                                        <button
                                                            type="button"
                                                            className="btn-field-icon"
                                                            onClick={() => handleCopyValue(field.id || idx, field.value)}
                                                            title="Copy to clipboard"
                                                        >
                                                            <i className={isCopied ? 'uil uil-check text-success' : 'uil uil-copy'}></i>
                                                            {isCopied && <span className="copied-tooltip">Copied!</span>}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="review-field-body">
                                            {!hasValue ? (
                                                <div className="unfilled-field-badge">
                                                    <i className="uil uil-clock-three"></i>
                                                    Waiting for client submission...
                                                </div>
                                            ) : field.fieldType === 'file' ? (
                                                <div className="field-file-display">
                                                    <div className="file-icon-box">
                                                        <i className="uil uil-file-download-alt"></i>
                                                    </div>
                                                    <div className="file-info-col">
                                                        <span className="filename-text">
                                                            {field.fileValue?.name || 'Attached Requirement Document'}
                                                        </span>
                                                        {field.fileValue?.size && (
                                                            <span className="filesize-text">
                                                                {(field.fileValue.size / 1024).toFixed(1)} KB
                                                            </span>
                                                        )}
                                                    </div>
                                                    <a
                                                        href={field.fileValue?.url}
                                                        download={field.fileValue?.name || 'document'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-download-field-file"
                                                    >
                                                        <i className="uil uil-download-alt"></i> Download
                                                    </a>
                                                </div>
                                            ) : isPass ? (
                                                <div className="field-pass-display">
                                                    <span className="secret-text">
                                                        {isRevealed ? field.value : '••••••••••••••••••••'}
                                                    </span>
                                                </div>
                                            ) : field.fieldType === 'textarea' ? (
                                                <pre className="field-textarea-display">{field.value}</pre>
                                            ) : field.fieldType === 'url' ? (
                                                <a
                                                    href={field.value.startsWith('http') ? field.value : `https://${field.value}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="field-url-display"
                                                >
                                                    {field.value} <i className="uil uil-external-link-alt"></i>
                                                </a>
                                            ) : (
                                                <div className="field-text-display">{field.value}</div>
                                            )}
                                        </div>

                                        {field.helpText && (
                                            <div className="field-help-footer">
                                                <i className="uil uil-info-circle"></i> {field.helpText}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Client Notes if submitted */}
                    {activeDependency.clientNotes && (
                        <div className="review-client-notes-box">
                            <span className="notes-heading">
                                <i className="uil uil-comment-alt-lines"></i> Client Submission Note:
                            </span>
                            <p>{activeDependency.clientNotes}</p>
                        </div>
                    )}

                    {/* Admin Note / Revision feedback */}
                    <div className="dep-form-group mt-3">
                        <label className="fw-semibold">Admin Notes & Revision Instructions (Visible to Client if rejected)</label>
                        <textarea
                            className="dep-form-control"
                            rows="2"
                            placeholder="Add revision details or notes for client..."
                            value={reviewAdminNote}
                            onChange={(e) => setReviewAdminNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="dep-modal-footer">
                    <div className="review-modal-footer-flex">
                        <div className="status-action-btns">
                            {activeDependency.status !== 'in_review' && activeDependency.status !== 'completed' && (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => handleUpdateStatus('in_review')}
                                    disabled={updatingStatus}
                                >
                                    <i className="uil uil-eye me-1"></i> Mark In Review
                                </button>
                            )}

                            {activeDependency.status !== 'rejected' && (
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => handleUpdateStatus('rejected')}
                                    disabled={updatingStatus}
                                >
                                    <i className="uil uil-exclamation-octagon me-1"></i> Request Revision
                                </button>
                            )}

                            {activeDependency.status !== 'completed' && (
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={() => handleUpdateStatus('completed')}
                                    disabled={updatingStatus}
                                >
                                    <i className="uil uil-check-circle me-1"></i> Approve & Complete
                                </button>
                            )}

                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={() => {
                                    setShowReviewModal(false);
                                    handleOpenFillModal(activeDependency);
                                }}
                            >
                                <i className="uil uil-edit-alt me-1"></i> Fill / Edit Values
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }

    {/* ADMIN FILL / FULFILL MODAL */ }
    {
        fillDep && (
            <Modal
                show={showFillModal}
                onHide={() => setShowFillModal(false)}
                size="lg"
                centered
                dialogClassName="dep-custom-modal dep-fill-modal"
            >
                <form onSubmit={handleSubmitAdminFill}>
                    <div className="dep-modal-header">
                        <div className="dep-modal-header-left">
                            <div className="dep-modal-header-icon fill-header-icon">
                                <i className="uil uil-edit-alt"></i>
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <span className="review-ticket-tag">
                                        DEP-{fillDep._id ? fillDep._id.substr(-5).toUpperCase() : 'REQ'}
                                    </span>
                                    <span className={`dep-priority-pill ${fillDep.priority}`}>
                                        <span className="priority-dot"></span>
                                        {fillDep.priority?.toUpperCase()}
                                    </span>
                                    <span className={`dep-status-pill ${fillDep.status}`}>
                                        {fillDep.status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <h5 className="dep-modal-title mb-0">Fill Dependency: {fillDep.title}</h5>
                            </div>
                        </div>
                    </div>

                    <div className="dep-modal-body">
                        {/* Meta details bar */}
                        <div className="review-meta-bar mb-3">
                            <div className="review-meta-item">
                                <span className="meta-label">Client</span>
                                <span className="meta-val">
                                    <i className="uil uil-user"></i>
                                    {fillDep.client?.name || fillDep.client?.clientName || 'Assigned Client'}
                                </span>
                            </div>
                            <div className="review-meta-item">
                                <span className="meta-label">Project</span>
                                <span className="meta-val">
                                    <i className="uil uil-folder"></i>
                                    {fillDep.project?.projectName || fillDep.project?.name || 'Assigned Project'}
                                </span>
                            </div>
                            <div className="review-meta-item">
                                <span className="meta-label">Timeline</span>
                                <span className="meta-val">
                                    <i className="uil uil-hourglass"></i>
                                    {fillDep.expectedDays} Days Required
                                </span>
                            </div>
                        </div>

                        {fillDep.description && (
                            <div className="review-instructions-box mb-3">
                                <span className="instr-label">Requirement Instructions:</span>
                                <p>{fillDep.description}</p>
                            </div>
                        )}

                        {/* Dynamic Input Fields to Fill */}
                        <div className="fill-fields-section">
                            <div className="fill-fields-heading">
                                <h6>
                                    <i className="uil uil-sliders-v-alt text-primary me-1"></i>
                                    Requirement Details ({fillDep.dynamicFields?.length || 0})
                                </h6>
                                <span className="text-muted small">Fill credentials, API keys, documents or assets</span>
                            </div>

                            <div className="fill-fields-list">
                                {fillDep.dynamicFields?.map((field, idx) => {
                                    const isSecret = field.fieldType === 'password';
                                    const isRevealed = fillRevealedSecrets[field.id || idx];
                                    const currentVal = fillValues[field.id] || '';
                                    const currentFile = fillFiles[field.id];

                                    return (
                                        <div key={field.id || idx} className="fill-field-card">
                                            <div className="fill-field-header">
                                                <label className="fill-field-label">
                                                    <span className="field-seq-tag me-1">#{idx + 1}</span>
                                                    {field.label}
                                                    {field.isRequired && <span className="req ms-1">*</span>}
                                                </label>
                                                <span className={`field-type-pill ${field.fieldType}`}>
                                                    {field.fieldType === 'password' && <><i className="uil uil-key-skeleton me-1"></i>Secret Token</>}
                                                    {field.fieldType === 'file' && <><i className="uil uil-paperclip me-1"></i>File / Document</>}
                                                    {field.fieldType === 'url' && <><i className="uil uil-link-h me-1"></i>URL / Link</>}
                                                    {field.fieldType === 'textarea' && <><i className="uil uil-subject me-1"></i>Multi-line Text</>}
                                                    {field.fieldType === 'text' && <><i className="uil uil-font me-1"></i>Text</>}
                                                </span>
                                            </div>

                                            {/* Field input switch */}
                                            {field.fieldType === 'password' ? (
                                                <div className="fill-input-group">
                                                    <input
                                                        type={isRevealed ? 'text' : 'password'}
                                                        className="dep-form-control fill-input"
                                                        placeholder={field.placeholder || 'Enter secret key / token / password'}
                                                        value={currentVal}
                                                        onChange={(e) => handleFillFieldChange(field.id, e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-fill-toggle-pass"
                                                        onClick={() => toggleFillSecretReveal(field.id || idx)}
                                                        title={isRevealed ? 'Hide secret' : 'Show secret'}
                                                    >
                                                        <i className={isRevealed ? 'uil uil-eye-slash' : 'uil uil-eye'}></i>
                                                    </button>
                                                </div>
                                            ) : field.fieldType === 'textarea' ? (
                                                <textarea
                                                    className="dep-form-control fill-textarea"
                                                    rows="3"
                                                    placeholder={field.placeholder || 'Enter details / config...'}
                                                    value={currentVal}
                                                    onChange={(e) => handleFillFieldChange(field.id, e.target.value)}
                                                />
                                            ) : field.fieldType === 'url' ? (
                                                <input
                                                    type="url"
                                                    className="dep-form-control fill-input"
                                                    placeholder={field.placeholder || 'https://api.example.com/...'}
                                                    value={currentVal}
                                                    onChange={(e) => handleFillFieldChange(field.id, e.target.value)}
                                                />
                                            ) : field.fieldType === 'file' ? (
                                                <div>
                                                    <input
                                                        type="file"
                                                        style={{ display: 'none' }}
                                                        ref={(el) => (fillFileInputRefs.current[field.id] = el)}
                                                        onChange={(e) => handleFillFileSelect(field.id, e.target.files?.[0])}
                                                    />
                                                    {currentFile instanceof File ? (
                                                        <div className="fill-selected-file-pill">
                                                            <i className="uil uil-file-check-alt text-success fs-5"></i>
                                                            <div className="file-info-text">
                                                                <span className="fw-semibold">{currentFile.name}</span>
                                                                <span className="text-muted small ms-2">({(currentFile.size / 1024).toFixed(1)} KB)</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn-remove-fill-file ms-auto"
                                                                onClick={() => handleFillRemoveFile(field.id)}
                                                                title="Remove selected file"
                                                            >
                                                                <i className="uil uil-times"></i>
                                                            </button>
                                                        </div>
                                                    ) : (currentFile?.url || field.fileValue?.url) ? (
                                                        <div className="fill-selected-file-pill">
                                                            <i className="uil uil-paperclip text-primary fs-5"></i>
                                                            <div className="file-info-text">
                                                                <span className="fw-semibold">{currentFile?.name || field.fileValue?.name || 'Attached File'}</span>
                                                                <a
                                                                    href={currentFile?.url || field.fileValue?.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="ms-2 small text-primary text-decoration-underline"
                                                                >
                                                                    View Current
                                                                </a>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-secondary ms-auto"
                                                                onClick={() => fillFileInputRefs.current[field.id]?.click()}
                                                            >
                                                                <i className="uil uil-sync me-1"></i> Replace
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="fill-file-dropzone"
                                                            onClick={() => fillFileInputRefs.current[field.id]?.click()}
                                                        >
                                                            <i className="uil uil-cloud-upload dropzone-icon"></i>
                                                            <p className="dropzone-text mb-0">Click to upload document or asset</p>
                                                            <span className="dropzone-sub">PDF, PNG, JPG, ZIP, JSON, or TXT</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="dep-form-control fill-input"
                                                    placeholder={field.placeholder || 'Enter value...'}
                                                    value={currentVal}
                                                    onChange={(e) => handleFillFieldChange(field.id, e.target.value)}
                                                />
                                            )}

                                            {field.helpText && (
                                                <div className="fill-field-help">
                                                    <i className="uil uil-info-circle me-1"></i>
                                                    {field.helpText}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status Selection & Admin Notes */}
                        <div className="row g-3 mt-2">
                            <div className="col-md-6">
                                <label className="fw-semibold mb-1">Set Status upon Fulfilling</label>
                                <select
                                    className="dep-form-control"
                                    value={fillStatus}
                                    onChange={(e) => setFillStatus(e.target.value)}
                                >
                                    <option value="completed">Approve & Complete (Default)</option>
                                    <option value="submitted">Submitted (Ready for PM Review)</option>
                                    <option value="in_review">In Review</option>
                                </select>
                                <small className="text-muted d-block mt-1">
                                    Choose status to reflect on this dependency request
                                </small>
                            </div>

                            <div className="col-md-6">
                                <label className="fw-semibold mb-1">Admin Notes / Remarks (Optional)</label>
                                <input
                                    type="text"
                                    className="dep-form-control"
                                    placeholder="Add memo or fulfillment notes..."
                                    value={fillAdminNotes}
                                    onChange={(e) => setFillAdminNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="dep-modal-footer">
                        <button
                            type="button"
                            className="btn-modal-cancel"
                            onClick={() => setShowFillModal(false)}
                            disabled={submittingFill}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-modal-submit btn-save-fill"
                            disabled={submittingFill}
                        >
                            {submittingFill ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Saving Fulfillment...
                                </>
                            ) : (
                                <>
                                    <i className="uil uil-check-circle me-1"></i>
                                    Save & Fulfill Requirements
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        )
    }

    {/* DELETE CONFIRMATION MODAL */ }
    <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        dialogClassName="dep-custom-modal dep-delete-modal"
    >
        <div className="dep-modal-header" style={{ background: '#b91c1c' }}>
            <div className="dep-modal-header-left">
                <div className="dep-modal-header-icon" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                    <i className="uil uil-exclamation-triangle"></i>
                </div>
                <div>
                    <h5 className="dep-modal-title">Delete Dependency?</h5>
                </div>
            </div>
            <button
                type="button"
                className="dep-modal-close-btn"
                onClick={() => setShowDeleteModal(false)}
                title="Close"
            >
                &times;
            </button>
        </div>
        <div className="dep-modal-body" style={{ padding: '20px' }}>
            Are you sure you want to delete requirement{' '}
            <strong>"{depToDelete?.title}"</strong>? This will remove all dynamic credential fields and cannot be undone.
        </div>
        <div className="dep-modal-footer">
            <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
            >
                Cancel
            </button>
            <button
                type="button"
                className="btn btn-danger"
                style={{ height: '38px', borderRadius: '8px', padding: '0 18px', fontWeight: 600 }}
                onClick={handleDeleteDependency}
            >
                Delete Permanently
            </button>
        </div>
    </Modal>
        </div >
    );
};

export default ClientDependency;
