import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';

const DesignationModal = ({ modal, closeModal, editData }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!editData;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    // Set form values when editing
    useEffect(() => {
        if (isEditMode && editData) {
            setValue('name', editData.name);
            setValue('description', editData.description);
            setValue('status', editData.status || 'active');
        } else {
            reset();
            setValue('status', 'active'); // Default to active for new designations
        }
    }, [editData, isEditMode, setValue, reset]);

    // Reset form when modal closes
    useEffect(() => {
        if (!modal) {
            reset();
        }
    }, [modal, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);

        const body = {
            name: data.name,
            description: data.description,
            isActive: isEditMode ? data.status === 'active' : true
        };
        try {
            if (isEditMode) {
                await axios.put(`/api/v1/admin/designation/${editData._id}`, body);
            } else {
                await axios.post('/api/v1/admin/designation', body);
            }

            closeModal();
            reset();
        } catch (error) {
            console.error('Error submitting designation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={modal} className="add_round" backdrop='static' onHide={closeModal} size="md">
            <Row className="m-0 p-0">
                <Col lg={12}>
                    <Row className='mt-2' style={{ borderBottom: '1px solid #DEE2E6' }}>
                        <Col className="">
                            <Modal.Title id="" className="text-black fw-bold mb-1" style={{ fontSize: '14px' }}>
                                {isEditMode ? 'Update Designation' : 'Add Designation'}
                            </Modal.Title>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Modal.Body className="py-0 px-1">
                <div className="px-1 pt-0 pb-1">
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Row className='mt-2'>
                            <Col lg={12}>
                                <Form.Group className="mb-2" controlId="name">
                                    <Form.Label className='mb-0 small'>
                                        Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        className='form'
                                        type="text"
                                        placeholder="Please Enter Designation Name"
                                        {...register('name', {
                                            required: 'This field is required',
                                            pattern: {
                                                value: /^[^\s].*$/,
                                                message: 'Empty fields / space at first character is not allowed'
                                            }
                                        })}
                                    />
                                    {errors.name && (
                                        <span className="text-danger">{errors.name.message}</span>
                                    )}
                                </Form.Group>
                            </Col>
                            {isEditMode && (
                                <Col lg={12}>
                                    <Form.Group className="mb-2" controlId="status">
                                        <Form.Label className='mb-0 small'>
                                            Status <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            className='formSelect'
                                            {...register('status', { required: 'Status is required' })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </Form.Select>
                                        {errors.status && (
                                            <span className="text-danger">{errors.status.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                            )}
                            <Col lg={12}>
                                <Form.Group className="mb-2" controlId="description">
                                    <Form.Label className='mb-0 small'>
                                        Description
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter designation description"
                                        {...register('description')}
                                    />
                                </Form.Group>
                            </Col>

                        </Row>
                        <div className='d-flex justify-content-end gap-2'>
                            <button
                                type="button"
                                className="btn btn-outline-secondary fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                onClick={closeModal}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="btn bg-dark text-white fw-semibold"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? (isEditMode ? 'Updating...' : 'Adding...')
                                    : (isEditMode ? 'Update Designation' : 'Add Designation')
                                }
                            </button>
                        </div>
                    </Form>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default DesignationModal;