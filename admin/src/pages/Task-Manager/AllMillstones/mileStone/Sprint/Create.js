import React from 'react';
import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col, Button, CloseButton, Card } from 'react-bootstrap';
import { addSprint } from '../../../../../redux/sprint/action';
import ToastHandle from '../../../../../constants/toaster/toaster';
import MainLoader from '../../../../../constants/Loader/loader';

const Create = ({ modal, CloseModal, id, data }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const successHandle = store?.addSprint;
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();
    const onSubmit = (val) => {
        let body = {
            project_id: data?._id,
            milestone_id: id,
            sprintName: val?.Name,
            sprintDesc: val?.Description,
            startDate: val?.Startdate,
            endDate: val?.Enddate,
            sprintStatus: val?.Status,
        };
        dispatch(addSprint(body));
    };
    useEffect(() => {
        reset();
    }, [modal]);
    useEffect(() => {
        if (successHandle?.data?.status == 200) {
            ToastHandle('success', successHandle?.data?.message);
            CloseModal('render');
        } else if (successHandle?.data?.status == 400) {
            ToastHandle('error', successHandle?.data?.message);
        } else if (successHandle?.data?.status == 500) {
            ToastHandle('error', successHandle?.data?.message);
        }
    }, [successHandle]);
    const handleClose = () => {
        CloseModal();
    };
    return (
        <>
            <Modal show={modal} onHide={handleClose}>
                <Row className="m-0 p-0">
                    <Col lg={12}>
                        <Row>
                            <Col lg={7} className="text-end">
                                <Modal.Title id="" className="mx-auto">
                                    Add Sprint
                                </Modal.Title>
                            </Col>
                            <Col lg={5} className="text-end pt-2">
                                <CloseButton onClick={handleClose} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {successHandle?.loading ? (
                    <MainLoader />
                ) : (
                    <Modal.Body className="py-0">
                        <div className="p-2">
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Row>
                                    <Col lg={12}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                {' '}
                                                Name <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control type="text" {...register('Name', { required: true })} />
                                            {errors.Name?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                Description <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                {...register('Description', { required: true })}
                                            />{' '}
                                            {errors.Description?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                {' '}
                                                Start date <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control type="date" {...register('Startdate', { required: true })} />{' '}
                                            {errors.Startdate?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                {' '}
                                                End date <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control type="date" {...register('Enddate', { required: true })} />{' '}
                                            {errors.Enddate?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12}>
                                        <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                {' '}
                                                Status <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control type="text" {...register('Status', { required: true })} />{' '}
                                            {errors.Status?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="text-start d-flex align-items-center justify-content-center">
                                        <Button
                                            variant="info"
                                            type="submit"
                                            className="btn btn-sm  text-white pt-1 pb-1 mt-3 web_button ">
                                            Add
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Modal.Body>
                )}
            </Modal>
        </>
    );
};

export default Create;
