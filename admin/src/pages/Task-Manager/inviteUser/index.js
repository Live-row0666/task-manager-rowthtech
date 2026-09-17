import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col, Card, Button, Alert, CloseButton } from 'react-bootstrap';
import { getAllRoles, inviteUser } from '../../../redux/user/action';
import ToastHandle from '../../../constants/toaster/toaster';
const InviteUser = () => {
    const dispatch = useDispatch();

    const store = useSelector((state) => state);
    const successHandle = store?.createUser?.data;
    const roleid = store?.Auth?.user?.id;
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
            firstName: data?.title,
            password: data?.password,
            email: data?.email,
            lastName: data?.lastName,
            role: data?.role,
        };
        dispatch(inviteUser(body));
    };
    useEffect(() => {
        dispatch(getAllRoles());
    }, []);
    useEffect(() => {
        if (successHandle?.status == 200) {
            ToastHandle('success', 'User created successfully');
            reset();
        } else if (successHandle?.status == 400) {
            ToastHandle('error', successHandle?.message);
        } else if (successHandle?.status == 500) {
            ToastHandle('error', successHandle?.message);
        }
    }, [successHandle]);

    return (
        <>
            <div className="card px-3">
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="pt-4">
                        <Col lg={4}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                <Form.Label>
                                    First Name<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Please Enter First Name"
                                    {...register('title', { required: true, pattern: /^[^\s].*$/ })}
                                />
                                {errors.title?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                                {errors.title?.type === 'pattern' && (
                                    <span className="text-danger"> Empty fields  / space at first character is not allowed</span>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                <Form.Label>
                                    Last Name<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Please Enter  Last Name"
                                    {...register('lastName', { required: true, pattern: /^[^\s].*$/ })}
                                />
                                {errors.lastName?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                                {errors.lastName?.type === 'pattern' && (
                                    <span className="text-danger"> Empty fields  / space at first character is not allowed</span>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    Email<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Control
                                    type="mail"
                                    placeholder="Please Enter e-mail"
                                    {...register('email', { required: true, pattern: /^[^\s].*$/ })}
                                />
                                {errors.email?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                                {errors.email?.type === 'pattern' && (
                                    <span className="text-danger"> Empty fields  / space at first character is not allowed</span>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={4}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    Password<span className="text-danger">*</span>:
                                </Form.Label>
                                <Form.Control
                                    type="password"
                                    {...register('password', { required: true, pattern: /^[^\s].*$/ })}
                                    placeholder="Please enter password"
                                />
                                {errors.password?.type === 'required' && (
                                    <span className="text-danger"> This field is required *</span>
                                )}
                                {errors.password?.type === 'pattern' && (
                                    <span className="text-danger"> Empty fields  / space at first character is not allowed</span>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={4}>
                            <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                <Form.Label>
                                    Role<span className="text-danger">*</span>:
                                </Form.Label>
                                <select
                                    name="Reporter"
                                    class="form-select"
                                    id="exampleForm.ControlInput1"
                                    {...register('role')}>
                                    <option value={''}>--Select--</option>
                                    {store?.getAllRoles?.data?.response?.map((ele, ind) => (
                                        <option value={ele?.role}> {ele?.role} </option>
                                    ))}
                                </select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {' '}
                            <Button type="submit" className=" web_button">
                                Invite
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    );
};

export default InviteUser;
