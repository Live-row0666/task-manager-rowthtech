import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { createClient, getClients } from '../../../../redux/client/action';
import ToastHandle from '../../../../constants/toaster/toaster';
import 'react-quill/dist/quill.snow.css';

const ClientModalWrapper = ({ show, onHide, onClientAdded }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        email: [''],
        contact: [''],
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

    const emptyForm = {
        name: '',
        companyName: '',
        email: [''],
        contact: [''],
        notes: '',
        status: 'active'
    };

    useEffect(() => {
        if (!show) {
            setFormData(emptyForm);
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if client name contains only spaces
        if (!formData.name.trim()) {
            ToastHandle('error', 'Client Name cannot be empty or contain only spaces');
            return;
        }

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
        cleanedData.projectType = selectedDepartment;
        dispatch(createClient(cleanedData));
        if (typeof onClientAdded === 'function') {
            onClientAdded(cleanedData);
        }
        onHide();
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
                                    <Form.Label className='mb-0'>
                                        Client Name <span className='text-danger'>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter client name"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0'>Company Name</Form.Label>
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
                                    <Form.Label className='mb-0'>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email[0]}
                                        onChange={(e) => handleArrayChange('email', 0, e.target.value)}
                                        placeholder="Enter email"
                                    />
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group className="mb-2">
                                    <Form.Label className='mb-0'>Contact</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={formData.contact[0]}
                                        onChange={(e) => handleArrayChange('contact', 0, e.target.value)}
                                        placeholder="Enter contact number"
                                        maxLength={16}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        className="fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={onHide}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="dark"
                        className="fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ClientModalWrapper;