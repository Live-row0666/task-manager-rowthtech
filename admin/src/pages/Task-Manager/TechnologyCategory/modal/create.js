import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Row, Col, Button, CloseButton } from 'react-bootstrap';
import ToastHandle from '../../../../constants/toaster/toaster';
import MainLoader from '../../../../constants/Loader/loader';
import { createTechnologyCategory, getAllTechnologyCategory } from '../../../../redux/technology/action';
const CreateCategory = ({ modal, closeModal }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [selected, setSelected] = useState([]);
    const errorhandel = store?.createTechnologyCategoryReducer;
    const loaderhandel = store?.createTechnologyCategoryReducer;
    const createResponse = store?.createTechnologyCategoryReducer?.data?.status;

    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        let body = {
            name: data?.category,
            description: data?.description,
        };
        dispatch(createTechnologyCategory(body));
    };

    useEffect(() => {
        if (errorhandel?.data?.status == 200) {
            ToastHandle('success', errorhandel?.data?.message);
            closeModal('render');
        } else if (errorhandel?.data?.status == 400) {
            ToastHandle('error', errorhandel?.data?.message);
        } else if (errorhandel?.data?.status == 500) {
            ToastHandle('error', errorhandel?.data?.message);
        }
    }, [errorhandel]);
    useEffect(() => {
        reset();
    }, [modal]);

    useEffect(() => {
        if (createResponse === 201) {
            dispatch(getAllTechnologyCategory({ status: true }));
            closeModal('render');
        }
    }, [createResponse]);

    return (
        <>
            <Modal show={modal} onHide={closeModal} size="lg">
                <Modal.Header className='py-2'>
                    <Modal.Title className='text-black fw-bold' style={{fontSize:'14px'}}>Create Category</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
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
                                        {...register('category', {
                                            required: true,
                                            pattern: /^[^\s]+(?:\s[^\s]+)*$/
                                        })}
                                    />
                                    {errors.category?.type === 'required' && (
                                        <span className="text-danger"> This field is required *</span>
                                    )}
                                    {errors.category?.type === 'pattern' && (
                                        <span className="text-danger">Only single spaces are allowed between words</span>
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
                            disabled={store?.createTechnologyCategoryReducer?.loading}>
                            {store?.createTechnologyCategoryReducer?.loading ? 'Adding...' : 'Add Category'}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default CreateCategory;
