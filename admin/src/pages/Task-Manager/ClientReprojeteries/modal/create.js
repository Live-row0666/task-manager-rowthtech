import { React, useEffect } from 'react';
import { Row, CloseButton, Col, Form, Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { uploadProjectDetail } from '../../../../redux/clientRepository/action';
import MainLoader from '../../../../constants/Loader/loader';
import ToastHandle from '../../../../constants/toaster/toaster';
const Create = ({ modal, closemodal }) => {
    const { projectId } = useParams();
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const loader = store?.uploadProjectDetail;
    const successHandle = store?.uploadProjectDetail;
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm();
    const onSubmit = (val) => {
        let body = new FormData();
        body.append('projectId', projectId);
        body.append('fileName', val?.fileName);
        body.append('project', val?.file[0]);
        dispatch(uploadProjectDetail(body));
        setValue('fileName', '');
    };
    const closeModal = () => {
        closemodal();
    };
    useEffect(() => {
        if (successHandle?.data?.status == 200) {
            ToastHandle('success', successHandle?.data?.message);
            closemodal('render');
        } else if (successHandle?.data?.status == 400) {
            ToastHandle('error', successHandle?.data?.message);
        } else if (successHandle?.data?.status == 500) {
            ToastHandle('error', successHandle?.data?.message);
        }
    }, [successHandle]);
    return (
        <>
            <Modal show={modal} className="add_round" onHide={closeModal}>
                {loader?.loading ? (
                    <MainLoader />
                ) : (
                    <>
                        {' '}
                        <Row>
                            <Col lg={8} className="text-end">
                                <Modal.Title id="" className="mx-auto">
                                    Upload Project Detail
                                </Modal.Title>
                            </Col>
                            <Col lg={4} className="text-end pt-1 ">
                                <CloseButton onClick={closeModal} />
                            </Col>
                        </Row>
                        <Modal.Body className="py-0">
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Row>
                                    <Col lg={12}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label>
                                                File Name <span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Please Enter File Name"
                                                {...register('fileName', { required: true })}
                                            />
                                            {errors.fileName?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label>
                                                File<span className="text-danger">*</span>:
                                            </Form.Label>
                                            <Form.Control
                                                type="file"
                                                accept="application/pdf,image/png,image/jpeg,image/jpg, .ppt , .pptx ,application/vnd.ms-powerpoint ,.doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document,.csv,.zip"
                                                {...register('file', { required: true })}
                                            />
                                            {errors.file?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="text-start d-flex align-items-center justify-content-center m-3">
                                        <Button
                                            variant="info"
                                            type="submit"
                                            className="btn btn-sm  text-white  web_button ">
                                            Upload
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </>
    );
};

export default Create;
