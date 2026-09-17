import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { addProject } from '../../../../redux/projects/action';
import ToastHandle from '../../../../constants/toaster/toaster';
import MainLoader from '../../../../constants/Loader/loader';
import { getAllTechnology } from '../../../../redux/technology/action';
import Multiselect from 'multiselect-react-dropdown';
import DatePicker from 'react-datepicker';
import '../../../../../node_modules/react-datepicker/dist/react-datepicker.css';
import { getClients } from '../../../../redux/client/action';
import { getAllUsers } from '../../../../redux/actions';

const Create = ({ modal, closeModal }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [selected, setSelected] = useState([]);
    const [description, setDescription] = useState('');
    const [documents, setDocuments] = useState([]);
    const [team, setTeam] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const errorhandel = store?.addProject;
    const loaderhandel = store?.addProject;
    const [addValue, setAddValue] = useState([]);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const users = store?.getAllUsers?.data?.data;
   
    const getTechnology = store?.getAllTechnologyReducer?.data?.response;
    const clients = Array.isArray(store?.clientReducer?.clients) ? store.clientReducer.clients : [];
    const technologies = store?.getAllTechnologyReducer?.data?.data;
    const [selectedClients, setSelectedClients] = useState([]);
    const addProjectsResponse = store?.addProject?.data?.status;

    const selectedDepartment = localStorage.getItem('selectedDepartment');

    useEffect(() => {
        if (addProjectsResponse === 201) {
            reset();
            setStartDate('');
            setEndDate('');
            setAddValue([]);
            setDescription('');
            setDocuments([]);
            setTeam([]);
            closeModal();
            setSelectedClients([]);
        }
    }, [addProjectsResponse])
    // Search handlers
    const handleUserSearch = (searchText) => {
        dispatch(getAllUsers({ name: searchText }));
    };

    const handleTechnologySearch = (searchText) => {
        dispatch(getAllTechnology({ status: true, search: searchText }));
    };

    const handleClientSearch = (searchText) => {
        dispatch(getClients({ search: searchText }));
    };

    // Initial data load
    useEffect(() => {
        dispatch(getAllUsers({ name: '' }));
        dispatch(getAllTechnology({ status: true }));
        dispatch(getClients({ page: 1, projectType: selectedDepartment }));
    }, []);

    // Options mapping
    const teamMembers = users?.map((user) => ({
        value: user?._id,
        label: user?.name
    }));

    const technologyOptions = technologies?.map((tech) => ({
        value: tech?._id,
        label: tech?.name?.charAt(0).toUpperCase() + tech?.name?.slice(1)
    }));

    const clientOptions = clients?.map((data) => ({
        value: data?._id,
        label: data?.name?.charAt(0).toUpperCase() + data?.name?.slice(1),
    }));

    // Form handlers
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        let body = {
            name: data?.projectName,
            description: description,
            client: selectedClients,
            technology: addValue,
            start: startDate,
            end: endDate,
            type: data?.project_type,
            projectType: data?.projectFor,
            projectStatus: data?.projectStatus || 'Ongoing',
            team: team,
            documents: documents
        };

        await dispatch(addProject(body));
        setIsSubmitting(false);
    };

    // Select handlers
    const handleTeamSelect = (selectedList) => {
        setTeam(selectedList.map(item => item.value));
    };

    const handleTeamRemove = (selectedList) => {
        setTeam(selectedList.map(item => item.value));
    };

    const handleStartDate = (date) => {
        setStartDate(date);
    };

    const handleEndDate = (date) => {
        setEndDate(date);
    };

    // Technology select/remove handlers
    const removehandle = (selectedList, removedItem) => {
        const newAddValue = addValue.filter(id => id !== removedItem.value);
        setAddValue(newAddValue);
    };

    const addhandle = (selectedList, selectedItem) => {
        if (!addValue.includes(selectedItem.value)) {
            setAddValue([...addValue, selectedItem.value]);
        }
    };

    // Reset form on modal close
    useEffect(() => {
        reset();
        setStartDate('');
        setEndDate('');
        setAddValue([]);
        setDescription('');
        setDocuments([]);
        setTeam([]);
    }, [modal]);

    // Handle API response
    useEffect(() => {
        if (errorhandel?.data?.status === 200) {
            ToastHandle('success', 'Successfully added');
            closeModal('render');
            reset();
        } else if (errorhandel?.data?.status === 400 || errorhandel?.data?.status === 500) {
            ToastHandle('error', errorhandel?.data?.message);
        }
    }, [errorhandel?.data?.status]);

    const addClients = (selectedList, selectedClient) => {
        const clientsArray = selectedList?.map((data) => (
            data?.value
        ));

        setSelectedClients(clientsArray);
    }
    return (
        <>
            <Modal show={modal} className="add_round" backdrop='static' onHide={closeModal} size="lg">
                <Row className="m-0 p-0">
                    <Col lg={12}>
                        <Row className='mt-2' style={{ borderBottom: '1px solid #DEE2E6' }}>
                            <Col className="">
                                <Modal.Title id="" className="text-black fw-bold fs-5 mb-1">
                                    Create Project
                                </Modal.Title>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Modal.Body className="py-0 px-1">
                    {loaderhandel?.loading ? (
                        <>
                            <MainLoader />
                        </>
                    ) : (
                        <div className="px-1 pt-0 pb-1">
                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Row className='mt-2'>
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
                                        <Form.Group className="mb-2" controlId="client">
                                            <Form.Label className="mb-0">
                                                Client
                                            </Form.Label>
                                            <Multiselect
                                                options={clientOptions}
                                                placeholder="Select Client"
                                                displayValue="label"
                                                showCheckbox
                                                onSearch={handleClientSearch}
                                                onSelect={addClients}
                                            // {...register('client')}
                                            />

                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label className='mb-0'>
                                                Type Of Project
                                            </Form.Label>
                                            <Form.Select
                                                {...register('project_type')}
                                                onChange={(e) => e.target.value && setValue('project_type', e.target.value, { shouldValidate: true })}
                                            >
                                                <option hidden value="">Choose a Project Type</option>
                                                <option value="T&M">T&M</option>
                                                <option value="FC">FC</option>
                                                <option value="HR">HR</option>
                                                <option value="DT">DT</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="projectFor">
                                            <Form.Label className='mb-0'>
                                                Project For
                                            </Form.Label>
                                            <Form.Select
                                                {...register('projectFor')}
                                            >
                                                <option hidden value="">Choose Project For</option>
                                                <option value="Tech">Tech</option>
                                                <option value="Marketing">Marketing</option>
                                                <option value="Sales">Sales</option>
                                                <option value="Freelance">Freelance</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="projectStatus">
                                            <Form.Label className='mb-0'>
                                                Project Status
                                            </Form.Label>
                                            <Form.Select
                                                {...register('projectStatus')}
                                            >
                                                <option value="Ongoing">Ongoing</option>
                                                <option value="Support">Support</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Hold">Hold</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label className='mb-0'>
                                                Select Your Technology
                                            </Form.Label>
                                            <Multiselect
                                                options={technologyOptions}
                                                displayValue="label"
                                                onRemove={removehandle}
                                                onSelect={addhandle}
                                                onSearch={handleTechnologySearch}
                                                showCheckbox
                                                placeholder="Select Technology"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="team">
                                            <Form.Label className='mb-0'>
                                                Team Members
                                            </Form.Label>
                                            <Multiselect
                                                options={teamMembers}
                                                onSelect={handleTeamSelect}
                                                onRemove={handleTeamRemove}
                                                displayValue="label"
                                                onSearch={handleUserSearch}
                                                showCheckbox
                                                placeholder="Select Team Members"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className='mb-0 w-100'>
                                                Start Date
                                            </Form.Label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => handleStartDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlTextarea1">
                                            <Form.Label className="w-100 mb-0">
                                                End Date
                                            </Form.Label>
                                            <DatePicker
                                                selected={endDate}
                                                disabled={startDate == '' || startDate == undefined}
                                                onChange={(date) => handleEndDate(date)}
                                                placeholderText="mm-dd-yyyy"
                                                minDate={startDate}
                                                className="add_width_input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col lg={12}>
                                        <Form.Group className="mb-2" controlId="description">
                                            <Form.Label className='mb-0'>
                                                Description
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Enter project description"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <div className='d-flex justify-content-end gap-2'>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary fw-semibold"
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                        onClick={closeModal}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn bg-dark text-white fw-semibold"
                                        style={{ padding: '4px 16px', fontSize: '11px' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add Project'}
                                    </button>
                                </div>
                            </Form>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Create;
