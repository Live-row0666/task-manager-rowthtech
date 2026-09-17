import { useState, useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Controller, useForm } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import ToastHandle from '../../../../../constants/toaster/toaster';
import { useDispatch, useSelector } from 'react-redux';
import { updateMileStone } from '../../../../../redux/milestone/action';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import '../../../../../../node_modules/react-datepicker/dist/react-datepicker.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { parseISO } from 'date-fns';
import { handleUpload } from '../../../../../constants/handleUpload';
import Select from 'react-select';
import { getAllUsers } from '../../../../../redux/actions';
import { toast } from 'react-toastify';
import useQuillWordLimit from '../../../../../helpers/quillWordLimit';
import { emojiRegex } from '../../../../../helpers/emojiRegex';
import { useSearchParams } from 'react-router-dom';
import ConfirmationModal from '../../modal/ConfirmationModal';

const Update = ({ modal, closeModal, editData }) => {
    const selectedDepartment = localStorage.getItem('selectedDepartment');
    const quillRef = useRef(null);
    const MAX_WORDS = 1000;
    const MAX_WORD_LENGTH = 45;
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const projectData = store?.getProjectById?.data?.data;
    const sucesshandel = store?.updateMilestone;
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [attachments, setAttachments] = useState([]);
    const today = new Date();
    const [searchParams] = useSearchParams();
    const projectType = searchParams.get('type');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingSubmitData, setPendingSubmitData] = useState(null);

    const handleStartDate = (date) => {
        setStartDate(date);
    };

    const handleEndDate = (date) => {
        setEndDate(date);
    };

    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);

    useEffect(() => {
        reset({
            title: editData?.title,
            status: editData?.status,
        });
        setValue('description', editData?.description || '');
        setValue('workedHours', editData?.workedHours);
        setValue('deliveryStatus', editData?.isDelivered ? "Yes" : "No");
        if (editData?.startDate || editData?.completionDate) {
            const parsedDate = new Date(editData?.startDate?.split('T')[0])
            const endate = new Date(editData?.completionDate?.split('T')[0])
            if (parsedDate || endate) {
                setStartDate(parsedDate);
                setEndDate(endate)
            } else {
                console.error('Invalid date format:', editData.startDate);
            }
        }
        if (editData) {
            setAttachments(editData?.attachments || []);
        }
    }, [modal]);

    const onSubmit = (data) => {
        let body = {
            milestoneId: editData?._id,
            title: data?.title,
            description: data?.description,
            startDate: startDate,
            attachments: attachments,
            status: data.status,
            completionDate: endDate,
            isDelivered: data?.deliveryStatus === "Yes" ? true : false,
            updateParentDates: true
        };
        if (projectType === 'AMC') {
            body.workedHours = data.workedHours
        }

        // Check if milestone end date exceeds project completion date
        if (endDate && projectData?.end && new Date(endDate) > new Date(projectData.end)) {
            setPendingSubmitData(body);
            setShowConfirmModal(true);
            return;
        }

        dispatch(updateMileStone(body));
        closeModal('render');
    };

    const handleConfirmSubmit = () => {
        if (pendingSubmitData) {
            dispatch(updateMileStone(pendingSubmitData));
            setShowConfirmModal(false);
            setPendingSubmitData(null);
            closeModal('render');
        }
    };

    const {
        register,
        handleSubmit,
        reset, watch, control, setValue,
        formState: { errors },
    } = useForm();
    const CloseModal = () => {
        closeModal();
    };
    useEffect(() => {
        if (sucesshandel?.data?.status == 200) {
            ToastHandle('success', 'Updated Successfully');
            closeModal('render');
        } else if (sucesshandel?.data?.status == 400) {
            ToastHandle('error', sucesshandel?.data?.message);
        } else if (sucesshandel?.data?.status == 500) {
            ToastHandle('error', sucesshandel?.data?.message);
        }
    }, [sucesshandel]);

    const [filesUploading, setFilesUploading] = useState(false);
    const handleFileChange = async (e) => {
        const filesToUpload = e.target.files;
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            // Add null check for fileUrl
            const fileUrl = await handleUpload(file, setFilesUploading);
            if (fileUrl) { // Check if fileUrl exists before adding
                setAttachments(prevFiles => [...prevFiles, {
                    name: file.name,
                    url: fileUrl?.url?.split('?')[0]
                }]);
            }
        }
    };
    const removeAttachment = (index) => {
        const updatedAttachments = [...attachments];
        updatedAttachments.splice(index, 1);
        setAttachments(updatedAttachments);
    };

    const handleLimitExceed = ({ type, message }) => {
        toast.error(message);
    };

    useQuillWordLimit({
        quillRef,
        maxWords: MAX_WORDS,
        maxWordLength: MAX_WORD_LENGTH,
        onLimitExceed: handleLimitExceed,
        setValue,
        fieldName: 'note',
    });

    return (
        <>
            <Modal show={modal} onHide={CloseModal} size="lg" className={`${showConfirmModal ? 'd-none' : ''}`}>
                <Modal.Header className='py-2'>
                    <Modal.Title className='text-black fw-bold' style={{ fontSize: '14px' }}>Update {projectType === "AMC" ? "AMC" : (selectedDepartment === "Marketing" || selectedDepartment === "Freelance") ? "Sprint" : "Milestone"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="bg-white p-2 rounded-3 shadow-sm">
                            {/* Basic Information Section */}
                            <div className="mb-2">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-info-circle me-2"></i>Basic Information
                                </h6>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="exampleForm.ControlInput1">
                                            <Form.Label className='mb-0 small'>
                                                {projectType === "AMC" ? "AMC Name" : (selectedDepartment === "Marketing" || selectedDepartment === "Freelance") ? "Sprint Name" : "Milestone Name"} <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Control
                                                className='form'
                                                type="text"
                                                placeholder={`Enter ${projectType === "AMC" ? "AMC" : (selectedDepartment === "Marketing" || selectedDepartment === "Freelance") ? "Sprint" : "Milestone"} name`}
                                                {...register('title', { required: true, pattern: /^[^\s].*$/ })}
                                            />
                                            {errors.title?.type === 'required' && (
                                                <span className="text-danger"> This field is required *</span>
                                            )}
                                            {errors.title?.type === 'pattern' && (
                                                <span className="text-danger">Empty fields / space at first character is not allowed</span>
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="status">
                                            <Form.Label className='mb-0 small'>
                                                Status <span className="text-danger">*</span>
                                            </Form.Label>
                                            <Form.Select
                                                className='formSelect'
                                                {...register('status', { required: true })}
                                                defaultValue="Not Started"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Delayed">Delayed</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="status">
                                            <Form.Label className='mb-0 small'>
                                                Delivered
                                            </Form.Label>
                                            <Form.Select
                                                className='formSelect'
                                                {...register('deliveryStatus', { required: true })}
                                                defaultValue="Not Started"
                                            >
                                                <option value="No" selected>No</option>
                                                <option value="Yes">Yes</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>


                                </Row>
                            </div>

                            {/* Timeline Section */}
                            <div className="mb-2">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-calendar-alt me-2"></i>Timeline
                                </h6>
                                <Row>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="startDate">
                                            <Form.Label className="w-100 mb-0 small">
                                                Start Date <span className="text-danger">*</span>
                                            </Form.Label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => handleStartDate(date)}
                                                placeholderText="dd-mm-yyyy"
                                                dateFormat='dd/MM/yyyy'
                                                required
                                                className="form-control form"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col lg={6}>
                                        <Form.Group className="mb-2" controlId="endDate">
                                            <Form.Label className="w-100 mb-0 small">
                                                End Date <span className="text-danger">*</span>
                                            </Form.Label>
                                            <DatePicker
                                                selected={endDate}
                                                disabled={!startDate}
                                                onChange={(date) => handleEndDate(date)}
                                                minDate={startDate ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000) : null}
                                                required
                                                placeholderText="dd-mm-yyyy"
                                                dateFormat='dd/MM/yyyy'
                                                className="form-control form"
                                            />
                                        </Form.Group>
                                    </Col>
                                    {projectType === "AMC" && (
                                        <Col lg={6}>
                                            <Form.Group className="mb-2" controlId="endDate">
                                                <Form.Label className="w-100 mb-0 small">
                                                    Actual Worked Hours
                                                    {/* <span className="text-danger">*</span> */}
                                                </Form.Label>
                                                <Form.Control   type="number"
                                                        step="0.01"
                                                         min={0} {...register('workedHours')} />
                                                {/* {errors.workedHours && (
                                                    <span className="text-danger small"> {errors.workedHours.message}</span>
                                                )} */}
                                            </Form.Group>
                                        </Col>
                                    )}
                                </Row>
                            </div>

                            {/* Details Section */}
                            <div className="mb-2">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-file-alt me-2"></i>Details
                                </h6>
                                <Row>
                                    <Col lg={12}>
                                        <Form.Group className="mb-2" controlId="attachments">
                                            <Form.Label className='mb-0 small'>
                                                Attachments&nbsp;
                                                <i
                                                    onClick={() => document.getElementById('fileInput').click()}
                                                    className='bi bi-plus-circle cp text-danger'
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </Form.Label>
                                            <div className="mb-2">
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileChange}
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                                    // Maximum file size of 5MB
                                                    onInput={(e) => {
                                                        const files = e.target.files;
                                                        for (let i = 0; i < files.length; i++) {
                                                            if (files[i].size > 25 * 1024 * 1024) {
                                                                e.target.value = '';
                                                                toast.error('File size should not exceed 25MB');
                                                                return;
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {filesUploading ? (
                                                <div className="mt-2 d-flex flex-wrap gap-2">
                                                    {[...Array(3)].map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="d-flex shadow-sm w-25 justify-content-between p-0  align-items-center mb-2"
                                                            style={{
                                                                height: '30px',
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            <div className="w-100 h-100 placeholder placeholder-wave  rounded-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                attachments?.length > 0 && (
                                                    <div className="mt-2 d-flex flex-wrap gap-2">
                                                        {attachments.map((file, index) => (
                                                            <div key={index} className="d-flex shadow-sm border justify-content-between p-1 px-2 align-items-center mb-2">
                                                                <span className="me-2" style={{ fontSize: '12px' }}>{file.name}</span>
                                                                <i
                                                                    onClick={() => removeAttachment(index)}
                                                                    className="bi bi-x-circle cp text-danger"
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            )}
                                        </Form.Group>
                                    </Col>

                                    <Col lg={12}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 d-flex justify-content-between small'>Description   <small className="text-muted">
                                                {(() => {
                                                    const content = watch('description') || '';
                                                    const plainText = quillRef?.current?.getEditor()?.getText()?.trim();
                                                    const words = plainText?.split(/\s+/)?.filter(Boolean);
                                                    const wordCount = words?.length;
                                                    return (
                                                        <div>
                                                            <div>{`${wordCount || 0} / ${MAX_WORDS} words`}</div>
                                                        </div>
                                                    );
                                                })()}
                                            </small>
                                            </Form.Label>
                                            <Controller
                                                name="description"
                                                control={control}
                                                render={({ field: { onChange, value } }) => (
                                                    <ReactQuill
                                                        ref={quillRef}
                                                        value={value}
                                                        onChange={(content, delta, source) => {
                                                            if (source === 'user') {
                                                                const plainText = quillRef.current.getEditor().getText().trim();

                                                                if (emojiRegex.test(plainText)) {
                                                                    const editor = quillRef.current.getEditor();
                                                                    editor.history.undo();
                                                                    return;
                                                                }

                                                                const words = plainText.split(/\s+/).filter(Boolean);
                                                                if (words.length > MAX_WORDS) {
                                                                    const editor = quillRef.current.getEditor();
                                                                    editor.history.undo();
                                                                    toast.error(`Word limit of ${MAX_WORDS} words exceeded`);
                                                                    return;
                                                                }
                                                                onChange(content);
                                                            }
                                                        }}
                                                        theme="snow"
                                                        placeholder="Enter detailed notes here..."
                                                        style={{ height: '150px', marginBottom: '50px' }}
                                                        modules={{
                                                            toolbar: [
                                                                ['bold', 'italic', 'underline'],
                                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                                ['link'],
                                                                ['clean']
                                                            ]
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className="btn btn-outline-secondary fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            onClick={CloseModal}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn bg-dark text-white fw-semibold"
                            style={{ padding: '4px 16px', fontSize: '11px' }}
                            disabled={store?.updateMilestone?.loading}
                        >
                            {store?.updateMilestone?.loading ? 'Updating...' : `Update ${(selectedDepartment === "Marketing" || selectedDepartment === "Freelance") ? "Sprint" : "Milestone"}`}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <ConfirmationModal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSubmit}
                title="Extend Project Timeline"
                message={`The milestone end date extends beyond the project completion date. This will automatically extend the project timeline. Do you want to continue?`}
            />
        </>
    );
};

export default Update;
