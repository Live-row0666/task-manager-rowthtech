import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { updateProject } from '../../../../redux/projects/action';
import ToastHandle from '../../../../constants/toaster/toaster';
import { useDispatch, useSelector } from 'react-redux';
import MainLoader from '../../../../constants/Loader/loader';
import Multiselect from 'multiselect-react-dropdown';
import { getAllTechnology } from '../../../../redux/technology/action';
import DatePicker from 'react-datepicker';
import '../../../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { parseISO } from 'date-fns';

const Update = ({ modal, closeModal, editData }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const loaderhandle = store?.updateProject;
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const handleStartDate = (date) => {
        setStartDate(date);
    };
    const handleEndDate = (date) => {
        setEndDate(date);
    };
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const [selected, setSelected] = useState([]);
    const [finalTechnology, setFinalTechnology] = useState([]);
    const [addValue, setAddValue] = useState([]);
    const getTechnology = store?.getAllTechnologyReducer?.data?.response;
    // disable previous date
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        setFinalTechnology(editData?.technology);
        setAddValue(editData?.technology);
        // setStartDate(parseISO(editData?.startDate));
        reset({
            projectName: editData?.projectName,
            clientName: editData?.clientName,
            access: editData?.projectAccess,
            key: editData?.key,
            project_type: editData?.type,
            projectFor: editData?.projectType,
            technology: editData?.technology,
            projectstatus: editData?.projectStatus,
        });


        if (editData?.startDate || editData?.endDate) {
            const parsedDate = parseISO(editData?.startDate)
            const endate = parseISO(editData?.endDate)
            if (parsedDate || endate) {
                setStartDate(parsedDate);
                setEndDate(endate)
            } else {
                console.error('Invalid date format:', editData.startDate);
            }
        }
        // setEndDate(editData?.endDate);
    }, [modal]);
    const removehandle = (selectedList, removedItem) => {
        const remove = getTechnology.filter((ele, ind) => {
            return ele?.techName !== removedItem;
        });
        const arr = [];
        selectedList.forEach((element) => {
            getTechnology.filter((ele) => {
                if (ele?.techName === element) {
                    arr.push(ele);
                    return setAddValue(arr);
                }
            });
        });
    };
    const addhandle = (selectedList, selectItem) => {
        const add = getTechnology.filter((ele, ind) => {
            return ele?.techName == selectItem;
        });
        setAddValue([...addValue, add[0]]);
    };

    const onSubmit = (data) => {
        let body = {
            projectId: editData?._id,
            projectName: data?.projectName,
            startDate: startDate,
            endDate: endDate,
            clientName: data?.clientName,
            type: data?.project_type,
            projectType: data?.projectFor,
            technology: addValue,
            projectStatus: data?.projectstatus,
        };
        dispatch(updateProject(body));
        ToastHandle('success', "Project Updated Successfully");
    };
    const selectedValues = editData?.technology?.map((item) => {
        return item.techName;
    });

    useEffect(() => {
        const getTechnologyname = [];
        dispatch(getAllTechnology({ status: true }));
        for (let i = 0; i < getTechnology?.length; i++) {
            getTechnologyname.push(getTechnology[i]?.techName);
        }
        setSelected(getTechnologyname);
    }, [modal]);

    return (
        <>
            <Modal show={modal} onHide={closeModal} size="lg">
                <Modal.Header className='py-2'>
                    <Modal.Title className='text-black fs-5 fw-bold'>Update Project</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body>
                        {loaderhandle?.loading ? (
                            <MainLoader />
                        ) : (
                            <>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label className='mb-0'>
                                                Project Name <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Please Enter Project Name"
                                                {...register('projectName', { required: true, pattern: /^[^\s].*$/ })}
                                            />
                                            {errors.projectName?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                            {errors.projectName?.type === 'pattern' && (
                                                <span className="text-danger"> Empty fields / space at first character is not allowed</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className='mb-0'>
                                                Client Name <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Please Enter Client Name"
                                                {...register('clientName', { required: true, pattern: /^[^\s].*$/ })}
                                            />
                                            {errors.clientName?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                            {errors.clientName?.type === 'pattern' && (
                                                <span className="text-danger"> Empty fields / space at first character is not allowed</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className='mb-0'>
                                                Start Date <span className="text-danger">*</span>
                                            </Form.Label>

                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => handleStartDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                minDate={today}
                                                required
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className='mb-0'>
                                                End Date <span className="text-danger">*</span>
                                            </Form.Label>
                                            <DatePicker
                                                selected={endDate}
                                                disabled={startDate == '' || startDate == undefined}

                                                onChange={(date) => handleEndDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                minDate={startDate}
                                                required
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label className='mb-0'>
                                                Type Of Project <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Select {...register('project_type', { required: true })}>
                                                <option value="" hidden >
                                                    Choose an Project Type{' '}
                                                </option>
                                                <option value="T&M">T&M</option>
                                                <option value="FC">FC</option>
                                                <option value=" HR">HR</option>
                                                <option value="DT">DT</option>
                                            </Form.Select>
                                            {errors.project_type?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="projectFor">
                                            <Form.Label className='mb-0'>
                                                Project For
                                            </Form.Label>
                                            <Form.Select {...register('projectFor')}>
                                                <option value="" hidden>
                                                    Choose Project For
                                                </option>
                                                <option value="Tech">Tech</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Freelance">Freelance</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label className='mb-0'>
                                                Select Your Technology <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Multiselect
                                                {...register('technology', { required: false })}
                                                onRemove={removehandle}
                                                onSelect={addhandle}
                                                isObject={false}
                                                options={selected}
                                                selectedValues={selectedValues}
                                                placeholder="Select Technology"
                                            />
                                            {errors.technology?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className='mb-0'>
                                                Status <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Select {...register('projectstatus', { required: true })}>
                                                <option hidden>
                                                    Choose an Project Status
                                                </option>
                                                <option value="Ongoing">Ongoing</option>
                                                <option value="Support">Support</option>
                                                <option value="Delivered">Deliverd</option>

                                            </Form.Select>
                                            {errors.projectstatus?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            className="btn btn-outline-secondary fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-dark text-white fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                        >
                            Update Project
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};

export default Update;
