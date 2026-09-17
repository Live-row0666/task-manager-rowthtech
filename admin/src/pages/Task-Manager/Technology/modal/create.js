import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Row, Col, Card, Button, Alert, CloseButton } from 'react-bootstrap';
import ToastHandle from '../../../../constants/toaster/toaster';
import MainLoader from '../../../../constants/Loader/loader';
import { MultiSelect } from 'react-multi-select-component';
import { createTechnology, getAllTechnologyCategory } from '../../../../redux/technology/action';
const Create = ({ modal, closeModal }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [selected, setSelected] = useState([]);
    const loaderhandel = store?.createTechnologyReducer;
    const createResponse = store?.createTechnologyReducer?.data?.status;
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
            category: data?.category,
            name: data?.technologyName,
            description: data?.description,
        };
        dispatch(createTechnology(body));
    };
    useEffect(() => {
        if (createResponse === 201) {
            dispatch(getAllTechnologyCategory({ status: true }));
            closeModal('render');
        }
    }, [createResponse]);

    useEffect(() => {
        reset();
    }, [modal]);

    useEffect(() => {
        let body = {
            status: true,
        };
        dispatch(getAllTechnologyCategory(body));
    }, []);

    return (
        <>
            <Modal show={modal} onHide={closeModal} size="lg">
                <Modal.Header className='py-2'>
                    <Modal.Title className='text-black fw-bold' style={{ fontSize: '14px' }}>Create Technology</Modal.Title>
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
                                        <Form.Select className='formSelect' {...register('category', { required: true })}>
                                            <option value={''}>Select Category</option>
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
                                            {...register('technologyName', {
                                                required: true,
                                            })}
                                        />
                                        {errors.technologyName && (
                                            <span className="text-danger">
                                                {errors.technologyName.type === 'required' && 'This field is required *'}
                                            </span>
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
                                            {...register('description')}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
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
                            disabled={store?.createTechnologyReducer?.loading}>
                            {store?.createTechnologyReducer?.loading ? 'Adding...' : 'Add Technology'}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default Create;
