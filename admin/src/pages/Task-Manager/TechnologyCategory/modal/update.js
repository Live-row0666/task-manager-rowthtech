import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import MainLoader from '../../../../constants/Loader/loader';
import { updateTechnologyCategory, getAllTechnologyCategory } from '../../../../redux/technology/action';

const CategoryUpdate = ({ modal, closeModal, editData }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const sucessCatogeryhandel = store?.UpdateTechnologyCategoryReducer;
    const loaderhandle = store?.UpdateTechnologyCategoryReducer;
    const updateResponse = store?.UpdateTechnologyCategoryReducer?.data?.status;
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        reset({
            Category: editData?.name,
            description: editData?.description,

        });
    }, [modal]);

    const onSubmit = (data) => {
        let body = {
            // id: editData?._id,
            name: data?.Category,
            description: data?.description,

        };
        dispatch(updateTechnologyCategory({ id: editData?._id, body }));
    };

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
                    <Modal.Title className='text-black fw-bold' style={{ fontSize: '14px' }}>Update Category</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        {loaderhandle?.loading ? (
                            <MainLoader />
                        ) : (
                            <Row>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>
                                            Category Name <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            className='form'
                                            type="text"
                                            placeholder="Enter category name"
                                            {...register('Category', { required: true })}
                                        />
                                        {errors.Category?.type === 'required' && (
                                            <span className="text-danger"> This field is required *</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={12}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>
                                            Description
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Enter Description"
                                            {...register('description')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className="btn btn-outline-secondary fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button type="submit"
                            className="btn bg-dark text-white fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            disabled={store?.UpdateTechnologyCategoryReducer?.loading}>
                            {store?.UpdateTechnologyCategoryReducer?.loading ? 'Updating...' : 'Update Category'}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default CategoryUpdate;
