import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Row, Col, Form } from 'react-bootstrap';
import { getAllRoles, getAllUsers, updateUser, getUserByIdAction } from '../../../../redux/user/action';
import ToastHandle from '../../../../constants/toaster/toaster';
import { getAllTechnology } from '../../../../redux/technology/action';
import Select from 'react-select';
import axios from 'axios';
import { handleUpload } from '../../../../constants/handleUpload';

const UpdateUserInfo = ({ show, onHide, userId }) => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const successHandle = store?.updateUser?.data;
    const userData = store?.getUserByIdReducer?.data?.data;
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [logoName, setLogoName] = useState('');
    const [logo, setLogo] = useState(null);
    const [profileUploading, setProfileUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [designationsLoading, setDesignationsLoading] = useState(false);
    const [designationData, setDesignationData] = useState([]);
    const [designationSearch, setDesignationSearch] = useState('');
    const {
        register,
        handleSubmit,
        setValue,
        control,
        clearErrors,
        watch, reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            technologyId: [],
        }
    });

    const fetchDesignations = async (search = '') => {
        setDesignationsLoading(true);
        try {
            const response = await axios.get(`/api/v1/admin/designation?status=true&search=${search}`);
            if (response.status === 200) {
                setDesignationData(response?.data?.data?.designations);
            }
        } catch (error) {
            console.error('Error fetching designations:', error);
        } finally {
            setDesignationsLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations(designationSearch);
    }, [show, designationSearch]);

    const designationOptions = designationData?.map(designation => ({
        value: designation?.name,
        label: designation?.name
    }));

    const techOptions = (store?.getAllTechnologyReducer?.data?.data || [])?.map(tech => ({
        value: tech._id,
        label: tech.name,
    }));

    const Loading = store?.updateUser?.loading;

    const onSubmit = (data) => {
        setFormSubmitted(true);

        const selectedTech = watch('technologyId') || [];
        const body = {
            name: data?.name,
            email: data?.email,
            password: data?.password,
            contact: data?.contact,
            role: data?.role,
            technology: selectedTech?.length > 0 ? selectedTech.map(item => item.value) : [],
            designation: watch('designation'),
            profilePicture: logo?.url ? logo.url.split('?')[0] : userData?.profilePicture,
            joinedDate: data?.joinedDate,
            isActive: data?.isActive === 'true' ? true : false
        };
        dispatch(updateUser({ id: userId, body }));
    };

    useEffect(() => {
        dispatch(getAllRoles());
    }, []);

    useEffect(() => {
        if (userId && show) {
            dispatch(getUserByIdAction({ id: userId }));
        }
    }, [userId, show]);

    useEffect(() => {
        let body = {
            status: true,
        };
        dispatch(getAllTechnology(body));
    }, []);

    // Populate form with existing user data
    useEffect(() => {
        if (userData && show) {
            setValue('name', userData?.name || '');
            setValue('contact', userData?.contact || '');
            setValue('email', userData?.email || '');
            setValue('password', userData?.password || '');
            setValue('designation', userData?.designation || '');
            setValue('isActive', userData?.isActive ? 'true' : 'false' || '');
            setValue('role', userData?.role?._id || '');
            setValue('joinedDate', userData?.joinedDate ? userData?.joinedDate.split('T')[0] : '');
            setSelectedRole(userData?.role?._id || null);

            // Set technology options
            const userTech = userData?.technology?.map(tech => ({
                value: tech._id,
                label: tech.name
            })) || [];
            setValue('technologyId', userTech);
        }
    }, [userData, show, setValue]);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setProfileUploading(true);
        try {
            const url = await handleUpload(selectedFile, setProfileUploading);
            setLogo(url);
            setLogoName(selectedFile?.name);
            clearErrors('profileImage');
        } catch (error) {
            console.error('Error during file upload:', error);
            setLogo(null);
        } finally {
            setProfileUploading(false);
        }
    };

    useEffect(() => {
        if (successHandle?.status == 200) {
            ToastHandle('success', 'User updated successfully');
            dispatch(getAllUsers({ name: '', limit: 100, isActive: true }));
            onHide();
            reset();
            setSelectedRole(null);
            setFormSubmitted(false);
        } else if (successHandle?.status === 400 || successHandle?.status === 500) {
            ToastHandle('error', successHandle?.message);
        }
    }, [successHandle]);

    const handleCancel = () => {
        reset();
        setValue('designation', '');
        setValue('technologyId', []);
        setFormSubmitted(false);
        setLogo(null);
        setLogoName('');
        onHide();
        setSelectedRole(null);
    };

    useEffect(() => {
        if (!show) {
            setFormSubmitted(false);
            reset();
            setSelectedRole(null);
            setValue('designation', '');
            setValue('technologyId', []);
            setLogo(null);
            setLogoName('');
        }
    }, [show]);

    return (
        <Modal show={show} onHide={onHide} backdrop='static' size="lg">
            <Modal.Header className='py-2'>
                <Modal.Title className='text-black fw-bold' style={{ fontSize: '14px' }}>Update User Information</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="bg-white p-2 rounded-3 shadow-sm">
                        {/* Personal Information Section */}
                        <div className="mb-1">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                <i className="fas fa-user me-2"></i>Personal Information
                            </h6>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>Name <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            className='form'
                                            type="text"
                                            placeholder="Enter Full Name"
                                            {...register('name', {
                                                required: 'This field is required',
                                                pattern: {
                                                    value: /^[A-Za-z\s]{3,}$/,
                                                    message: 'Name must contain only letters and spaces, minimum 3 characters'
                                                }
                                            })} />
                                        {errors.name && (
                                            <span className="text-danger">{errors.name.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>Contact <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            className='form'
                                            type="text"
                                            placeholder="Enter Contact Number"
                                            maxLength={10}
                                            {...register('contact', {
                                                required: 'This field is required',
                                                pattern: {
                                                    value: /^[6-9]\d{9}$/,
                                                    message: "Enter valid 10-digit Indian contact number"
                                                }
                                            })}
                                        />
                                        {errors.contact && (
                                            <span className="text-danger">{errors.contact.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>Email <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            className='form'
                                            type="email"
                                            placeholder="Enter Email"
                                            {...register('email', {
                                                required: 'This field is required.',
                                                pattern: {
                                                    value: /^[^\s].*$/, message: 'Please enter a valid email address.'
                                                }
                                            })}
                                        />
                                        {errors.email && (
                                            <span className="text-danger">{errors.email.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>{`Password`} <span className="text-danger">*</span></Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                className='form'
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter Password"
                                                {...register('password', {
                                                    required: 'This field is required.',
                                                    pattern: {
                                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                        message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
                                                    }
                                                })}
                                                maxLength={22}
                                            />
                                            <div
                                                className="position-absolute"
                                                style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <i className="fas fa-eye-slash fs-6"></i>
                                                ) : (
                                                    <i className="fas fa-eye fs-6"></i>
                                                )}
                                            </div>
                                        </div>
                                        {errors.password && (
                                            <span className="text-danger">{errors.password.message}</span>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Professional Information Section */}
                        <div className="mb-2">
                            <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                <i className="fas fa-briefcase me-2"></i>{`Professional Information`}
                            </h6>
                            <Row>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>{`Date of joining`}</Form.Label>
                                        <Form.Control
                                            className='form'
                                            type="date"
                                            max={new Date().toISOString().split('T')[0]}
                                            {...register('joinedDate')}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>{`Designation`}</Form.Label>
                                        <Select
                                            options={designationOptions}
                                            value={designationOptions.find(option => option.value === watch('designation'))}
                                            onChange={(selectedOption) => setValue('designation', selectedOption?.value || '')}
                                            onInputChange={(data) => {
                                                setDesignationSearch(data)
                                            }}
                                            placeholder="Select Designation"
                                            isSearchable={true}
                                            isClearable={true}
                                            noOptionsMessage={() => 'No designations found'}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    minHeight: '30px',
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    fontSize: '12px'
                                                }),
                                                valueContainer: (base) => ({
                                                    ...base,
                                                    padding: '0 8px'
                                                }),
                                                input: (base) => ({
                                                    ...base,
                                                    margin: '0px',
                                                    fontSize: '12px'
                                                }),
                                                singleValue: (base) => ({
                                                    ...base,
                                                    fontSize: '12px'
                                                }),
                                                placeholder: (base) => ({
                                                    ...base,
                                                    fontSize: '12px'
                                                }),
                                                option: (base) => ({
                                                    ...base,
                                                    fontSize: '12px'
                                                }),
                                                indicatorsContainer: (base) => ({
                                                    ...base,
                                                    height: '30px'
                                                }),
                                                menu: (base) => ({ ...base, zIndex: 9999 })
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-2">
                                        <Form.Label className='mb-0 small'>{`Role`}</Form.Label>
                                        <Form.Select className='text-capitalize formSelect' {...register('role')} onChange={(e) => setSelectedRole(e.target.value)}>
                                            <option value="" hidden>Select Role</option>
                                            {store?.getAllRoles?.data?.roles?.map((ele, i) => (
                                                <option className='text-capitalize' key={i} value={ele?._id}>{ele?.name}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                {store?.getAllRoles?.data?.roles?.find((role) => role?.name !== 'sub-admin' && role?._id === selectedRole) &&
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>{`Technology`}</Form.Label>
                                            <Controller
                                                name="technologyId"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        {...field}
                                                        options={techOptions}
                                                        isMulti
                                                        isSearchable={true}
                                                        placeholder="Select Technology"
                                                        onChange={(selected) => field.onChange(selected)}
                                                        value={field.value}
                                                        onInputChange={(data) => {
                                                            dispatch(getAllTechnology({ status: true, search: data }));
                                                        }}
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                minHeight: '30px',
                                                                fontSize: '12px'
                                                            }),
                                                            valueContainer: (base) => ({
                                                                ...base,
                                                                padding: '2px 8px',
                                                                flexWrap: 'wrap'
                                                            }),
                                                            multiValue: (base) => ({
                                                                ...base,
                                                                fontSize: '11px',
                                                                margin: '1px'
                                                            }),
                                                            multiValueLabel: (base) => ({
                                                                ...base,
                                                                fontSize: '11px',
                                                                padding: '2px 6px'
                                                            }),
                                                            input: (base) => ({
                                                                ...base,
                                                                margin: '0px',
                                                                fontSize: '12px'
                                                            }),
                                                            placeholder: (base) => ({
                                                                ...base,
                                                                fontSize: '12px'
                                                            }),
                                                            option: (base) => ({
                                                                ...base,
                                                                fontSize: '12px'
                                                            }),
                                                            menu: (base) => ({ ...base, zIndex: 9999 })
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Form.Group>
                                    </Col>
                                }
                                <Col lg={6}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className='mb-0 small'>{`Profile Picture`}</Form.Label>
                                        <Form.Control
                                            className='formSelect'
                                            type="file"
                                            style={{ height: '30px!important' }}
                                            {...register('profileImage', {})}
                                            accept=".png, .jpg, .jpeg, .svg"
                                            onChange={handleFileChange}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col lg={6}>
                                    <Form.Group className="mb-0">
                                        <Form.Label className='mb-0 small'>{`Status`}</Form.Label>
                                        <Form.Select className='formSelect' {...register('isActive')}>
                                            <option value="true">{`Active`}</option>
                                            <option value="false">{`Inactive`}</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className="btn btn-outline-secondary fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={handleCancel}
                        type="button"
                    >
                        {`Cancel`}
                    </button>
                    <button
                        type="submit"
                        className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        disabled={Loading}
                    >
                        {Loading ? 'Updating...' : 'Update User'}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UpdateUserInfo;