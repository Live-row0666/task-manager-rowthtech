import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { set, useForm } from 'react-hook-form';
import { Row, Col, Card, Button, Alert, CloseButton } from 'react-bootstrap';
import ToastHandle from '../../../../../../../constants/toaster/toaster';
import { useDispatch, useSelector } from 'react-redux';
import { updateSprint } from '../../../../../../../redux/sprint/action';
import MainLoader from '../../../../../../../constants/Loader/loader';
import noimage from '../../../../../../../assets/images/noimage.png';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { updateTask } from '../../../../../../../redux/actions';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
const Update = ({ modal, CloseModal, editData }) => {
    const [imageShow, setImageShow] = useState(true);
    const [description, setDescription] = useState('');
    const [data, setData] = useState({
        image: '',
    });
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const sucesshandel = store?.UpdateTaskReducer;
    const loaderhandel = store?.UpdateTaskReducer;
    // disable previous date
    const today = new Date().toISOString().split('T')[0];
    // start date
    function findMinimumStartDate(startdate1, startdate2) {
        return new Date(Math.min(new Date(startdate1), new Date(startdate2)));
    }
    const startdate1 = new Date();
    const startdate2 = editData?.startDate;
    const minimumStartDate = findMinimumStartDate(startdate1, startdate2);
    //
    // end date
    function findMinimumEndDate(date1, date2) {
        return new Date(Math.min(new Date(date1), new Date(date2)));
    }
    const date1 = new Date();
    const date2 = editData?.dueDate;
    const minimumEndDate = findMinimumEndDate(date1, date2);
    //
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();
    const CloseModaal = () => {
        CloseModal();
    };
    const onSubmit = (val) => {
        let body = new FormData();
        body.append('taskId', editData?._id);
        body.append('projectId', editData?.projectInfo?._id);
        body.append('milestoneId', editData?.milestoneInfo?._id);
        body.append('sprintId', editData?.sprintInfo?._id);
        body.append('summary', val?.summary);
        body.append('description', description);
        body.append('assigneeId', val?.Assignee);
        body.append('reporterId', val?.Reporter);
        body.append('priority', val?.priority);
        body.append('startDate', val?.startDate);
        body.append('dueDate', val?.dueDate);
        body.append('status', val?.status);
        body.append('attachment', data?.image);
        dispatch(updateTask(body));
    };
    useEffect(() => {
        reset({
            Milestone: editData?.milestoneId,
            projectname: editData?.projectId,
            Sprint: editData?.sprintId,
            startDate: handleDate(editData?.startDate),
            dueDate: handleDate(editData?.dueDate),
            summary: editData?.summary,
            Assignee: editData?.assignees?.assigneeId,
            Reporter: editData?.assignees?.reporterInfo?._id,
            priority: editData?.priority,
            status: editData?.status,
        });
        setDescription(editData?.description);
        setData({ ...data, image: editData?.attachment });
        setImageShow(true);
    }, [modal]);
    const handleDate = (data) => {
        let date = new Date(data);
        let year = date.toLocaleString('default', { year: 'numeric' });
        let month = date.toLocaleString('default', { month: '2-digit' });
        let day = date.toLocaleString('default', { day: '2-digit' });
        let formattedDate = year + '-' + month + '-' + day;
        return formattedDate;
    };

    useEffect(() => {
        if (sucesshandel?.data?.status == 200) {
            ToastHandle('success', 'Updated Successfully');
            CloseModal('render');
        } else if (sucesshandel?.data?.status == 400) {
            ToastHandle('error', sucesshandel?.data?.message);
        } else if (sucesshandel?.data?.status == 500) {
            ToastHandle('error', sucesshandel?.data?.message);
        }
    }, [sucesshandel]);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const allowedTypes = ['image/png', 'image/gif', 'image/jpeg'];

        if (file && allowedTypes.includes(file.type)) {
            setData({ ...data, image: e.target.files[0] });
        } else {
            ToastHandle('error', 'Please select only an image file (PNG, GIF, JPEG).');
        }
    };
    const handelimageclose = () => {
        setImageShow(false);
        setData({ ...data, image: '' });
    };
    return (
        <>
            <Modal show={modal} onHide={CloseModaal} size={'lg'}>
                <Row className="m-0 p-0">
                    <Col lg={12}>
                        <Row>
                            <Col lg={7} className="text-end">
                                <Modal.Title id="" className="mx-auto">
                                    Update Task
                                </Modal.Title>
                            </Col>
                            <Col lg={5} className="text-end pt-2">
                                <CloseButton onClick={CloseModal} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {loaderhandel.loading ? (
                    <MainLoader />
                ) : (
                    <Modal.Body className="py-0">
                        <div className="p-3">
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Row>
                                    <Col lg={12}>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Project<span className="text-danger">*</span>:
                                                    </Form.Label>

                                                    <Form.Select
                                                        {...register('projectname', {
                                                            required: true,
                                                            disabled: true,
                                                        })}>
                                                        {/* <option value={''}>--Select--</option> */}
                                                        {store?.getProject?.data?.response?.projects?.map((ele, ind) => (
                                                            <option value={ele?._id}> {ele?.projectName} </option>
                                                        ))}
                                                    </Form.Select>
                                                    {errors.projectname?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Milestone<span className="text-danger">*</span>:
                                                    </Form.Label>

                                                    <Form.Select
                                                        {...register('Milestone', { required: true, disabled: true })}>
                                                        {store?.getSigleMileStone?.data?.response?.map((ele, ind) => (
                                                            <option value={ele?._id}> {ele?.title} </option>
                                                        ))}
                                                    </Form.Select>
                                                    {errors.Milestone?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={12}>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        Sprint <span className="text-danger">*</span>:
                                                    </Form.Label>

                                                    <Form.Select
                                                        {...register('Sprint', { required: true, disabled: true })}>
                                                        {store?.getAllSingleSprints?.data?.Response?.map((ele, ind) => (
                                                            <option value={ele?._id}> {ele?.sprintName} </option>
                                                        ))}
                                                    </Form.Select>
                                                    {errors.Sprint?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Summary <span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder=" Enter Task Summary"
                                                        {...register('summary', { required: true })}
                                                    />{' '}
                                                    {errors.summary?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={12}>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Description<span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <CKEditor
                                                        config={{
                                                            ckfinder: {
                                                                // Upload the images to the server using the CKFinder QuickUpload command.
                                                                uploadUrl:
                                                                    'https://example.com/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json',
                                                            },
                                                        }}
                                                        editor={ClassicEditor}
                                                        data={description}
                                                        onChange={(event, editor) => {
                                                            const data = editor.getData();
                                                            setDescription(data);
                                                        }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Assignee <span className="text-danger">*</span>:
                                                    </Form.Label>

                                                    <Form.Select {...register('Assignee', { required: true })}>
                                                        <option value={''}>--Select--</option>
                                                        {store?.getAllUsers?.data?.response?.map((ele, ind) => (
                                                            <option value={ele?._id}>
                                                                {' '}
                                                                {ele?.firstName} {ele?.LastName}{' '}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    {errors.Assignee?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={12}>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Reporter<span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <Form.Select {...register('Reporter', { required: true })}>
                                                        <option value={''}>--Select--</option>
                                                        {store?.getAllRoles?.data?.response?.map((ele, ind) => (
                                                            <option value={ele?._id}> {ele?.role} </option>
                                                        ))}
                                                    </Form.Select>
                                                    {errors.Reporter?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Priority <span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <Form.Select {...register('priority', { required: true })}>
                                                        <option>-------select----</option>
                                                        <option value="1">High</option>
                                                        <option value="2">Medium</option>
                                                        <option value="3">Low</option>
                                                    </Form.Select>
                                                    {errors.priority?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={12}>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Start Date <span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        min={handleDate(minimumStartDate)}
                                                        {...register('startDate', { required: true })}
                                                    />{' '}
                                                    {errors.startDate?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Due Date<span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        min={watch('startDate')}
                                                        {...register('dueDate', { required: true })}
                                                    />{' '}
                                                    {errors.dueDate?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={12}>
                                        <Row>
                                            <Col lg={6}>
                                                <Form.Group className="mb-1" controlId="exampleForm.ControlInput1">
                                                    <Form.Label>
                                                        {' '}
                                                        Status <span className="text-danger">*</span>:
                                                    </Form.Label>
                                                    <Form.Select {...register('status', { required: true })}>
                                                        <option>-------select----</option>
                                                        <option value="1">todo</option>
                                                        <option value="2">inProgress</option>
                                                        <option value="3">Hold</option>
                                                        <option value="4">Done</option>
                                                    </Form.Select>
                                                    {errors.status?.type === 'required' && (
                                                        <span className="text-danger"> This field is required *</span>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col lg={6}>
                                                <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                                    <Form.Label>
                                                        Attachment <span className="text-danger">*</span>
                                                    </Form.Label>

                                                    {imageShow ? (
                                                        <>
                                                            {editData?.attachment?.length ? (
                                                                <Col className="d-flex justify-content-center">
                                                                    <div style={{ width: '50%', position: 'relative' }}>
                                                                        <div className="img_div">
                                                                            <img
                                                                                className=" all_logo_img w-100"
                                                                                src={editData?.attachment}
                                                                            />
                                                                        </div>
                                                                        <div
                                                                            className="cross_div"
                                                                            style={{
                                                                                position: 'absolute',
                                                                                rigth: '0',
                                                                            }}>
                                                                            <i
                                                                                onClick={handelimageclose}
                                                                                className=" dripicons-cross"></i>
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            ) : (
                                                                <div style={{ width: '15%', position: 'relative' }}>
                                                                    <div className="img_div">
                                                                        <img className="all_logo_img" src={noimage} />
                                                                    </div>
                                                                    <div
                                                                        className="cross_div"
                                                                        style={{ position: 'absolute', rigth: '0' }}>
                                                                        <i
                                                                            onClick={handelimageclose}
                                                                            className=" dripicons-cross"></i>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Form.Control
                                                            type="file"
                                                            accept="image/png, image/gif, image/jpeg"
                                                            onChange={(e) => {
                                                                handleImageChange(e);
                                                            }}
                                                        />
                                                    )}
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="text-start d-flex align-items-center justify-content-center">
                                        <Button
                                            variant="info"
                                            type="submit"
                                            className="btn btn-sm  text-white pt-1 pb-1 mt-3 web_button ">
                                            Update
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

export default Update;
