import React, { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { getClients, createClient, updateClient, deleteClient, sendInvitation, } from '../../../redux/client/action';
import { getAllTechnology } from '../../../redux/technology/action';
import ToastHandle from '../../../constants/toaster/toaster';
import MainLoader from '../../../constants/Loader/loader';
import MainDeleteModel from '../../../constants/deleteModel/MainDeleteModel';
import Pagination from '@mui/material/Pagination';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { emojiRegex } from '../../../helpers/emojiRegex';

const ClientsIndex = ({ inProjectModal = false, onClientAdded }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const quillRef = useRef();
    const [sendingInvitation, setSendingInvitation] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [statusModal, setStatusModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const [deleteId, setDeleteId] = useState('');
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: [''],
        contact: [''],
        loginEmail: '',
        loginPassword: '',
        role: '',
        // address: {
        //     street: '',
        //     city: '',
        //     state: '',
        //     zipCode: '',
        //     country: ''
        // },
        // contactPerson: {
        //     name: '',
        //     position: '',
        //     phone: '',
        //     email: ''
        // },
        notes: '',
        status: 'active'
    });
    const selectedDepartment = localStorage.getItem('selectedDepartment');

    const handleStatus = (client) => {
        setSelectedClient(client);
        setStatusModal(true);
    };

    const confirmStatusChange = () => {
        dispatch(
            updateClient(selectedClient._id, {
                status:
                    selectedClient.status === "active"
                        ? "inactive"
                        : "active",
            })
        );

        setStatusModal(false);
        setSelectedClient(null);
    };
    useEffect(() => {
        dispatch(getClients({ page: 1, projectType: selectedDepartment, search: searchTerm }));
        dispatch(getAllTechnology());
    }, [dispatch, searchTerm]);

    const clients = Array.isArray(store?.clientReducer?.clients) ? store.clientReducer.clients : [];
    const loading = store?.clientReducer?.loading;
    const totalPages = store?.clientReducer?.totalPages || 1;

    const handleShowModal = (client = null) => {
        if (client) {
            setEditMode(true);
            setCurrentClient(client);
            setFormData({
                name: client.name || '',
                companyName: client.companyName || '',
                email: client.email || [''],
                contact: client.contact || [''],
                notes: client.notes || '',
                status: client.status || 'active',
                loginEmail: client.loginEmail || '',
                loginPassword: client.password || '',

            });
        } else {
            setEditMode(false);
            setCurrentClient(null);
            setFormData({
                name: '',
                companyName: '',
                email: [''],
                contact: [''],
                notes: '',
                status: 'active',
                loginEmail: '',
                loginPassword: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentClient(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name && name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else if (name) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleArrayChange = (field, index, value) => {
        // Validate contact number to allow 16 digits and phone special characters
        if (field === 'contact') {
            // Allow digits and phone special characters: +, -, space, (, ), ., /
            const allowedChars = /^[0-9+\-\s()./]*$/;
            if (!allowedChars.test(value)) {
                return; // Don't update if invalid characters
            }
            // Count only digits to enforce 16 digit limit
            const digitCount = (value.match(/\d/g) || []).length;
            if (digitCount > 16) {
                return; // Don't update if more than 16 digits
            }
        }

        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayField = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayField = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if client name contains only spaces
        if (!formData.name.trim()) {
            ToastHandle('error', 'Client Name cannot be empty or contain only spaces');
            return;
        }

        // Helper function to remove empty values
        const removeEmpty = (obj) => {
            const newObj = {};
            Object.keys(obj).forEach(key => {
                const value = obj[key];
                if (value !== null && value !== undefined) {
                    if (Array.isArray(value)) {
                        const filtered = value.filter(item => item && item.trim && item.trim() !== '');
                        if (filtered.length > 0) newObj[key] = filtered;
                    } else if (typeof value === 'object') {
                        const cleaned = removeEmpty(value);
                        if (Object.keys(cleaned).length > 0) newObj[key] = cleaned;
                    } else if (value.trim && value.trim() !== '' || typeof value === 'boolean' || typeof value === 'number') {
                        newObj[key] = value;
                    }
                }
            });
            return newObj;
        };

        const cleanedData = removeEmpty(formData);
        cleanedData.projectType = selectedDepartment
        if (editMode) {
            dispatch(updateClient(currentClient._id, cleanedData));
        } else {
            dispatch(createClient(cleanedData));
            // If this component is being used inside ProjectModal, notify it about the new client
            if (inProjectModal && typeof onClientAdded === 'function') {
                onClientAdded();
            }
        }
        handleCloseModal();
    };
    const handleDelete = (id) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        dispatch(deleteClient(deleteId));
        setDeleteModal(false);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
        dispatch(getClients({ page: value, projectType: selectedDepartment, search: searchTerm }));
    };
    const handleSendInvitation = () => {
        setSendingInvitation(true);

        dispatch(
            sendInvitation({
                name: formData.name,
                loginEmail: formData.loginEmail,
                loginPassword: formData.loginPassword,
            })
        );
        setTimeout(() => {
            setSendingInvitation(false);
        }, 3000);
    };
    return (
        <Card style={{ height: inProjectModal ? 'auto' : '87vh', display: 'flex', flexDirection: 'column', border: inProjectModal ? 'none' : undefined }}>
            <Card.Body className='p-2' style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="d-flex justify-content-end gap-2 align-items-center mb-2">
                    <div className="d-flex align-items-center gap-1">
                        <div style={{ position: 'relative', width: '10vw' }}>
                            <input
                                type="text"
                                style={{ padding: '4px 22px 4px 8px', fontSize: '11px', width: '100%' }}
                                className='form-control'
                                placeholder="Search clients..."
                                value={searchTerm || ''}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        border: 'none',
                                        background: 'transparent',
                                        padding: 0,
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: '#888'
                                    }}
                                    aria-label="Clear search"
                                >
                                    &#10005;
                                </button>
                            )}
                        </div>
                    </div>
                    <div className='d-flex justify-content-end align-items-center'>
                        <Button
                            className="btn bg-dark text-white fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            onClick={() => handleShowModal()}>
                            Add Client
                        </Button>
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                    {loading ? (
                        <MainLoader />
                    ) : clients.length === 0 ? (
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <h5 className="text-muted">No Clients Found</h5>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ height: '75vh', overflowY: 'auto' }}>
                            <Table className="mb-0 add_Color_font table-hover table-sm" style={{ fontSize: '11px' }}>
                                <thead className="table-dark sticky-top">
                                    <tr>
                                        <th className='fw-bold fs-6 text-center' style={{ width: '5%' }}>#</th>
                                        <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Name</th>
                                        <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Company</th>
                                        <th className='fw-bold fs-6 text-start' style={{ width: '20%' }}>Email</th>
                                        <th className='fw-bold fs-6 text-center' style={{ width: '15%' }}>Contact</th>
                                        <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Status</th>
                                        <th className='fw-bold fs-6 text-center' style={{ width: '10%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client, index) => (
                                        <tr className="align-middle" key={client._id} style={{ transition: 'all 0.2s ease' }}>
                                            <td className='text-center fw-bold' style={{ fontSize: '12px' }}>{(page - 1) * 10 + index + 1}</td>
                                            <td className="text-start" style={{ fontSize: '12px' }}>
                                                <span className="namelink text-dark fw-semibold text-capitalize">{client.name}</span>
                                            </td>
                                            <td className="text-start" style={{ fontSize: '12px' }}>
                                                <span className="namelink text-dark fw-semibold">{client.companyName || 'N/A'}</span>
                                            </td>
                                            <td className="text-start" style={{ fontSize: '12px' }}>
                                                <span className="namelink text-muted">{client.email?.[0] || 'N/A'}</span>
                                            </td>
                                            <td className='text-center' style={{ fontSize: '12px' }}>
                                                <span className="namelink text-muted">{client.contact?.[0] || 'N/A'}</span>
                                            </td>
                                            <td className='text-center' style={{ fontSize: '12px' }}>
                                                <span className={`badge px-1 py-1 ${client.status === 'active' ? 'text-white' : 'text-dark'}`} style={{ fontSize: '10px', backgroundColor: client.status === 'active' ? '#8FD1A3' : '#FFB4B4' }}>
                                                    {client.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className='text-center'>
                                                <div className='d-flex justify-content-center gap-1'>
                                                    <button className="btn btn-outline-secondary" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleShowModal(client)}>
                                                        <i className="bi bi-pencil-square" style={{ fontSize: '12px' }}></i>
                                                    </button>
                                                    <button
                                                        className={`btn ${client.status === "active"
                                                            ? "btn-outline-warning"
                                                            : "btn-outline-success"
                                                            }`}
                                                        style={{ padding: "2px 6px", fontSize: "10px" }}
                                                        onClick={() => handleStatus(client)}
                                                    >
                                                        <i
                                                            className={`bi ${client.status === "active"
                                                                ? "bi-person-x"
                                                                : "bi-person-check"
                                                                }`}
                                                            style={{ fontSize: "12px" }}
                                                        ></i>
                                                    </button>
                                                    {/* <button className="btn btn-outline-danger" style={{ padding: '2px 6px', fontSize: '10px' }} onClick={() => handleDelete(client._id)}>
                                                        <i className="bi bi-trash" style={{ fontSize: '12px' }}></i>
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-end mt-3 pt-2 border-top">
                        <Pagination
                            page={page}
                            count={totalPages}
                            color="primary"
                            variant="outlined"
                            onChange={handlePageChange}
                        />
                    </div>
                )}

                <Modal show={showModal} onHide={handleCloseModal} size="xl" backdrop="static">
                    <Modal.Header className='py-2'>
                        <Modal.Title className="text-black fw-bold" style={{ fontSize: '14px' }}>
                            {editMode ? 'Update Client' : 'Create Client'}
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="" style={{
                                maxHeight: 'calc(100vh - 180px)',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}>
                                <div className="bg-white p-2 rounded-3 shadow-sm">
                                    {/* Basic Information Section */}
                                    <div className="mb-1">
                                        <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                            <i className="fas fa-user me-2"></i>Basic Information
                                        </h6>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>
                                                        Client Name <span className='text-danger'>*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        className='form'
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter client name"
                                                        required
                                                        isInvalid={formData.name !== '' && !formData.name.trim()}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        Client Name cannot contain only spaces.
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Company Name</Form.Label>
                                                    <Form.Control
                                                        className='form'
                                                        type="text"
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter company name"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            {/* <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Contact Person</Form.Label>
                                                    <Form.Control
                                                    className='form'
                                                        type="text"
                                                        name="contactPerson.name"
                                                        value={formData.contactPerson.name}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter contact person name"
                                                    />
                                                </Form.Group>
                                            </Col> */}
                                            {editMode ? <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Status</Form.Label>
                                                    <Form.Select
                                                        className='formSelect'
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col> : <></>}
                                        </Row>
                                    </div>

                                    {/* Contact Information Section */}
                                    <div className="mb-1">
                                        <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                            <i className="fas fa-address-book me-2"></i>Contact Information
                                        </h6>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Email Addresses</Form.Label>
                                                    <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                                                        {formData.email.map((email, index) => (
                                                            <div key={index} className="input-group input-group-sm mb-2">
                                                                <span className="input-group-text " style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                                    <i className="bi bi-envelope"></i>
                                                                </span>
                                                                <Form.Control
                                                                    type="email"
                                                                    value={email}
                                                                    placeholder={`Email ${index + 1}`}
                                                                    onChange={(e) => handleArrayChange('email', index, e.target.value)}
                                                                    style={{ fontSize: '12px', maxHeight: '30px' }}
                                                                />
                                                                {formData.email.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger form"
                                                                        style={{ padding: '4px 8px', fontSize: '10px' }}
                                                                        onClick={() => removeArrayField('email', index)}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {formData?.email?.length < 2 &&
                                                            <div className="d-flex justify-content-end">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    style={{ fontSize: '10px', padding: '2px 6px', maxHeight: '28px!important' }}
                                                                    onClick={() => addArrayField('email')}
                                                                >
                                                                    <i className="bi bi-plus"></i> Add Email
                                                                </button>
                                                            </div>
                                                        }
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Contact Numbers</Form.Label>
                                                    <div className="border rounded p-2" style={{ backgroundColor: '#f8f9fa' }}>
                                                        {formData.contact.map((contact, index) => (
                                                            <div key={index} className="input-group input-group-sm mb-2">
                                                                <span className="input-group-text" style={{ fontSize: '10px', padding: '2px 8px', }}>
                                                                    <i className="bi bi-telephone"></i>
                                                                </span>
                                                                <Form.Control
                                                                    type="tel"
                                                                    value={contact}
                                                                    placeholder={`Contact ${index + 1}`}
                                                                    onChange={(e) => handleArrayChange('contact', index, e.target.value)}
                                                                    style={{ fontSize: '12px' }}
                                                                />

                                                                {formData.contact.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger"
                                                                        style={{ padding: '4px 8px', fontSize: '10px' }}
                                                                        onClick={() => removeArrayField('contact', index)}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {formData?.contact?.length < 2 &&
                                                            <div className="d-flex justify-content-end">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    style={{ fontSize: '10px', padding: '2px 6px', maxHeight: '28px!important' }}
                                                                    onClick={() => addArrayField('contact')}
                                                                >
                                                                    <i className="bi bi-plus"></i> Add Contact
                                                                </button>
                                                            </div>
                                                        }
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>

                                    <div className="mb-1">
                                        <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                                            <h6 className="text-dark fw-bold mb-0">
                                                <i className="fas fa-user-lock me-2"></i>
                                                Login Credentials
                                            </h6>


                                        </div>

                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small">
                                                        Login Email<span className='text-danger'>*</span>
                                                    </Form.Label>

                                                    <Form.Control
                                                        className="form"
                                                        type="email"
                                                        name="loginEmail"
                                                        required
                                                        value={formData.loginEmail}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter Login Email"
                                                    />
                                                </Form.Group>
                                            </Col>

                                            <Col lg={6}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className="mb-0 small">
                                                        Login Password<span className='text-danger'>*</span>
                                                    </Form.Label>

                                                    <div className="position-relative">
                                                        <Form.Control
                                                            className="form"
                                                            type={showPassword ? "text" : "password"}
                                                            name="loginPassword"
                                                            required
                                                            value={formData.loginPassword}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter Login Password"
                                                            maxLength={22}
                                                        />

                                                        <div
                                                            className="position-absolute"
                                                            style={{
                                                                right: "10px",
                                                                top: "50%",
                                                                transform: "translateY(-50%)",
                                                                cursor: "pointer",
                                                                zIndex: 10
                                                            }}
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? (
                                                                <i className="fas fa-eye-slash fs-6 text-secondary"></i>
                                                            ) : (
                                                                <i className="fas fa-eye fs-6 text-secondary"></i>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <div className="text-end mt-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm px-2 py-1"
                                                style={{ fontSize: "10px" }}
                                                onClick={handleSendInvitation}
                                                disabled={
                                                    sendingInvitation ||
                                                    !formData.loginEmail.trim() ||
                                                    !formData.loginPassword.trim()
                                                }
                                            >
                                                {sendingInvitation ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-1"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-paper-plane me-1"></i>
                                                        Send Invitation
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                    </div>
                                    {/* Address Information Section */}
                                    {/* <div className="mb-1">
                                        <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                            <i className="fas fa-map-marker-alt me-2"></i>Address Information
                                        </h6>
                                        <Row>
                                            <Col lg={8}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Street</Form.Label>
                                                    <Form.Control
                                                    className='form'
                                                        type="text"
                                                        name="address.street"
                                                        value={formData.address.street}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter street address"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col lg={4}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>City</Form.Label>
                                                    <Form.Control
                                                    className='form'
                                                        type="text"
                                                        name="address.city"
                                                        value={formData.address.city}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter city"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col lg={4}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>State</Form.Label>
                                                    <Form.Control
                                                    className='form'
                                                        type="text"
                                                        name="address.state"
                                                        value={formData.address.state}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter State"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col lg={4}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>ZIP Code</Form.Label>
                                                    <Form.Control
                                                    className='form'
                                                        type="text"
                                                        name="address.zipCode"
                                                        value={formData.address.zipCode}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter ZIP Code"
                                                        maxLength={8}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col lg={4}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Country</Form.Label>
                                                    <Select
                                                        options={countriesData.map(country => ({
                                                            value: country.name,
                                                            label: country.name
                                                        }))}
                                                        value={formData.address.country ? { value: formData.address.country, label: formData.address.country } : null}
                                                        onChange={(option) => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                address: {
                                                                    ...prev.address,
                                                                    country: option ? option.value : ''
                                                                }
                                                            }));
                                                        }}
                                                        placeholder="Select Country"
                                                        isClearable
                                                        isSearchable
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div> */}

                                    {/* Additional Information Section */}
                                    <div className="mb-2">
                                        <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                            <i className="fas fa-info-circle me-2"></i>Additional Information
                                        </h6>
                                        <Row>
                                            <Col lg={12}>
                                                <Form.Group className="mb-2">
                                                    <Form.Label className='mb-0 small'>Notes</Form.Label>
                                                    <ReactQuill
                                                        ref={quillRef}
                                                        value={formData.notes}
                                                        onChange={(content, delta, source, editor) => {
                                                            if (source === 'user') {
                                                                const plainText = editor.getText().trim();

                                                                if (emojiRegex.test(plainText)) {
                                                                    const editor = quillRef.current.getEditor();
                                                                    editor.history.undo();
                                                                    return;
                                                                }
                                                            }
                                                            setFormData(prev => ({ ...prev, notes: content }));
                                                        }}
                                                        placeholder="Enter any additional notes or comments..."
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
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type="button"
                                className="btn btn-outline-secondary fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <Button type="submit"
                                className="btn bg-dark text-white fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                            >
                                {editMode ? 'Update' : 'Create'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                <MainDeleteModel
                    deleteModel={deleteModal}
                    onHide={() => setDeleteModal(false)}
                    comfimDelete={confirmDelete}
                />
                <Modal
                    show={statusModal}
                    onHide={() => setStatusModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {selectedClient?.status === "active"
                                ? "Disable Client"
                                : "Enable Client"}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        {selectedClient?.status === "active"
                            ? "Are you sure you want to disable this client? The client will not be able to login or perform any actions."
                            : "Are you sure you want to enable this client? The client will be able to login again."}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setStatusModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant={
                                selectedClient?.status === "active"
                                    ? "warning"
                                    : "success"
                            }
                            onClick={confirmStatusChange}
                        >
                            {selectedClient?.status === "active"
                                ? "Disable"
                                : "Enable"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Card.Body>
        </Card>
    );
};

export default ClientsIndex;