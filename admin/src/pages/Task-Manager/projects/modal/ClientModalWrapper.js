import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { getClients } from '../../../../redux/client/action';
import { clientAPI } from '../../../../redux/client/api';
import { CLIENT_CONSTANTS } from '../../../../redux/client/constant';
import ToastHandle from '../../../../constants/toaster/toaster';
import 'react-quill/dist/quill.snow.css';

const ClientModalWrapper = ({ show, onHide, onClientAdded }) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: [''],
        contact: [''],
        password: '',
        notes: '',
        status: 'active'
    });

    const selectedDepartment = localStorage.getItem('selectedDepartment');

    const emptyForm = {
        name: '',
        companyName: '',
        email: [''],
        contact: [''],
        password: '',
        notes: '',
        status: 'active'
    };

    useEffect(() => {
        if (!show) {
            setFormData(emptyForm);
            setIsSubmitting(false);
            setShowPassword(false);
        }
    }, [show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.name.trim()) {
            ToastHandle('error', 'Client Name cannot be empty or contain only spaces');
            return;
        }

        const emailValue = formData.email && formData.email[0] ? formData.email[0].trim() : '';
        if (!emailValue) {
            ToastHandle('error', 'Email is required');
            return;
        }

        if (!formData.password || !formData.password.trim()) {
            ToastHandle('error', 'Password is required');
            return;
        }

        setIsSubmitting(true);

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

        try {
            const cleanedData = removeEmpty(formData);
            cleanedData.projectType = selectedDepartment;
            cleanedData.loginEmail = emailValue.toLowerCase();
            cleanedData.loginPassword = formData.password.trim();
            cleanedData.password = formData.password.trim();

            const res = await clientAPI.createClient(cleanedData);
            const createdClient = res?.data?.client || res?.data;

            ToastHandle('success', res?.data?.message || 'Client created successfully');

            // Instantly update redux store with new client so dropdowns update with zero delay
            if (createdClient && createdClient._id) {
                dispatch({
                    type: CLIENT_CONSTANTS.CREATE_CLIENT_SUCCESS,
                    payload: { client: createdClient }
                });
            }

            // Sync with backend in background
            dispatch(getClients({ projectType: selectedDepartment }));

            if (typeof onClientAdded === 'function') {
                onClientAdded(createdClient);
            }
            onHide();
        } catch (error) {
            const errorMsg =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to create client';
            ToastHandle('error', errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            backdrop="static"
            className="client-modal-in-project"
        >
            <Modal.Header className='py-2'>
                <Modal.Title className="text-black fs-5 fw-bold">
                    Add Client
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="bg-white p-2 rounded-3 shadow-sm">
                        <Row>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small fw-semibold'>
                                        Client Name <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter client name"
                                        required
                                        autoFocus
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small fw-semibold'>Company Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="Enter company name"
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small fw-semibold'>
                                        Email <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email[0]}
                                        onChange={(e) => handleArrayChange('email', 0, e.target.value)}
                                        placeholder="Enter email"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small fw-semibold'>Contact</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={formData.contact[0]}
                                        onChange={(e) => handleArrayChange('contact', 0, e.target.value)}
                                        placeholder="Enter contact number"
                                        maxLength={16}
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0 small fw-semibold'>
                                        Password <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <div className="position-relative">
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter password"
                                            required
                                            style={{ paddingRight: '36px' }}
                                        />
                                        <span
                                            className="position-absolute"
                                            style={{
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                cursor: 'pointer',
                                                zIndex: 10
                                            }}
                                            onClick={() => setShowPassword(!showPassword)}
                                            role="button"
                                            tabIndex={-1}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-secondary`}></i>
                                        </span>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer className="py-2">
                    <Button
                        variant="outline-secondary"
                        className="fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={onHide}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="dark"
                        className="fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Creating...
                            </>
                        ) : (
                            'Create'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ClientModalWrapper;