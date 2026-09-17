import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col, Card, Button, Alert, CloseButton } from 'react-bootstrap';
import ToastHandle from '../../../../constants/toaster/toaster';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTechnologyCategory, updateTechnology } from '../../../../redux/technology/action';

const Update = ({ modal, closeModal, editData }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const sucesshandel = store?.UpdateTechnologyReducer;
    const loaderhandle = store?.UpdateTechnologyReducer;
    const updateResponse = store?.UpdateTechnologyReducer?.data?.status;

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();


    useEffect(() => {
        if (editData) {
            const categoryId = editData?.category?._id || editData?.techCategory_id?._id;

            reset({
                category: categoryId,
                TechnologyName: editData?.name || editData?.techName,
                description: editData?.description,
            });
        }
    }, [modal, editData, reset]);

    const onSubmit = (data) => {
        let body = {
            techCategory_id: data?.category,
            techName: data?.TechnologyName,
            description: data?.description,
        };
        dispatch(updateTechnology({ id: editData?._id, body }));
    };
    useEffect(() => {
        let body = {
            status: true,
        };
        dispatch(getAllTechnologyCategory(body));
    }, []);

    useEffect(() => {
        if (updateResponse === 200) {
            dispatch(getAllTechnologyCategory({ status: true }));
            closeModal('render');
        }
    }, [updateResponse]);

    return (
        <>
            <Modal show={modal} onHide={closeModal} size="lg">
                <Modal.Header className='py-2'>
                    <Modal.Title className='text-black fw-bold' style={{ fontSize: '14px' }}>Update Technology</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        <>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>
                                            Category <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Select
                                            className='formSelect'
                                            {...register('category', { required: true })}
                                        >
                                            {store?.getAllTechnologyCategoryReducer?.data?.categories?.map(
                                                (ele, ind) => (
                                                    <option key={ind} value={ele?._id}>{ele?.name}</option>
                                                )
                                            )}
                                        </Form.Select>
                                        {errors.category?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </Form.Group>
                                </Col>

                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>
                                            Technology Name <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            className='form'
                                            type="text"
                                            placeholder="Enter technology name"
                                            {...register('TechnologyName', {
                                                required: true,
                                                pattern: /^[^\s]+$/
                                            })}
                                        />
                                        {errors.TechnologyName?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                        {errors.TechnologyName?.type === 'pattern' && (
                                            <span className="text-danger">Spaces are not allowed</span>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>
                                            Description
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Enter Description"
                                            {...register('description', {})}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
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
                        <button type="submit"
                            className="btn bg-dark text-white fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            disabled={store?.UpdateTechnologyReducer?.loading}>
                            {store?.UpdateTechnologyReducer?.loading ? 'Updating...' : 'Update Technology'}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default Update;
