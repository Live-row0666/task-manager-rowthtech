import React, { useEffect, useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { createTaskStatusAction, editTaskStatusAction, getAllTaskStatusesAction } from '../../../redux/actions';

const NewStatusModal = ({ show, closeModal, editData = null }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const { projectId } = useParams();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [color, setColor] = useState('#6c757d'); // Default gray color
    const createResponse = store?.createTaskStatusReducer?.data?.status;
    const editResponse = store?.editTaskStatusReducer?.data?.status;
    useEffect(() => {
        if (show) {
            if (editData) {
                setColor(editData?.color || '#6c757d');
                reset({
                    order: editData?.order,
                    name: editData?.name,
                    description: editData?.description
                });
            } else {
                setColor('#6c757d');
                reset({
                    order: '',
                    name: '',
                    description: ''
                });
            }
        }
    }, [editData, show, reset])
    useEffect(() => {
        if (createResponse === 201 || editResponse === 200) {
            dispatch(getAllTaskStatusesAction({ projectId }));
            setColor('#6c757d');
            reset({ order: '', name: '', description: '' });
            closeModal();
        }
    }, [createResponse, editResponse]);

    const onSubmit = (data) => {
        data.color = color;
        data.project = projectId;
        data.order = parseInt(data.order);
        if (editData) {
            dispatch(editTaskStatusAction({ id: editData?._id, body: data }))
        } else {
            dispatch(createTaskStatusAction(data));
        }
    };



    return (
        <Modal show={show} onHide={closeModal} centered>
            <Modal.Header>
                <Modal.Title>{editData ? 'Update ' : 'Create New '} Status</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Status Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. In Progress, Review, Done"
                            {...register('name', {
                                required: 'Status name is required',
                                maxLength: {
                                    value: 50,
                                    message: 'Status name cannot exceed 50 characters'
                                }
                            })}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <div className="row">
                        <div className="col-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Task order <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    {...register('order', {
                                        required: 'Task order is required',
                                    })}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.order?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>
                        <div className="col-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Color</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                        type="color"
                                        value={color}
                                        className='p-0'
                                        onChange={(e) => setColor(e.target.value)}
                                        style={{ width: '30px', height: '30px' }}
                                    />
                                    <Form.Text className="text-muted">
                                        Selected: <span style={{ color }}>{color}</span>
                                    </Form.Text>
                                </div>
                            </Form.Group>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Optional description for this status"
                            {...register('description', {
                                maxLength: {
                                    value: 200,
                                    message: 'Description cannot exceed 200 characters'
                                }
                            })}
                            isInvalid={!!errors.description}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-outline-secondary fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                    <button className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        type="submit" >
                        Save
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default NewStatusModal;