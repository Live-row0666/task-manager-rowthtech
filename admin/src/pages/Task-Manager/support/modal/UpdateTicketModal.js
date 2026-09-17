import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Row, Col } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { updateTicket } from '../../../../redux/support/action';
import { handleUpload } from '../../../../constants/handleUpload';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import { emojiRegex } from '../../../../helpers/emojiRegex';

const UpdateTicketModal = ({ show, onHide, ticket, onSuccess }) => {
    const quillRef = useRef(null);
    const MAX_WORDS = 1000;
    const dispatch = useDispatch();
    const updateTicketState = useSelector(state => state?.updateTicket);
    const [attachments, setAttachments] = useState([]);
    const [filesUploading, setFilesUploading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (ticket && show) {
            setValue('title', ticket.title);
            setValue('description', ticket.description);
            setValue('category', ticket.category);
            setValue('priority', ticket.priority);
            setValue('status', ticket.status);
            // setValue('assignedTo', ticket.assignedTo?._id || '');
            setAttachments(ticket.attachments || []);
        }
    }, [ticket, show, setValue]);

    useEffect(() => {
        if (updateTicketState?.data?.status === 200) {
            onHide();
            onSuccess();
        }
    }, [updateTicketState?.data?.status]);

    const onSubmit = async (data) => {
        const updateData = {
            id: ticket._id,
            body: {
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                status: data.status,
                // assignedTo: data.assignedTo,
                attachments: attachments
            }
        };

        dispatch(updateTicket(updateData));
    };

    const isSubmitting = updateTicketState?.loading;

    const handleFileChange = async (e) => {
        const filesToUpload = e.target.files;
        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            const fileUrl = await handleUpload(file, setFilesUploading);
            if (fileUrl) {
                setAttachments(prevFiles => [...prevFiles, {
                    filename: file.name,
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

    const handleClose = () => {
        reset();
        setAttachments([]);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} className='taskModal' size="xl" backdrop="static">
            <Modal.Header className='py-2'>
                <Modal.Title className="text-black fw-bold" style={{fontSize:'14px'}}>
                    Update Support Ticket
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body className="p-2" style={{ backgroundColor: '#f8f9fa' }}>
                    <div className="" style={{
                        maxHeight: 'calc(100vh - 180px)',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}>
                        <div className="bg-white p-2 rounded-3 shadow-sm">
                            {/* Basic Information Section */}
                            <div className="mb-1">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-ticket-alt me-2"></i>Ticket Information
                                </h6>
                                <Row>
                                    <Col lg={12}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Title <span className='text-danger'>*</span></Form.Label>
                                            <Form.Control
                                            className='form'
                                                type="text"
                                                placeholder="Enter ticket title"
                                                {...register('title', {
                                                    required: 'Title is required',
                                                    pattern: {
                                                        value: /^[^\s].*$/,
                                                        message: 'Title cannot start with space'
                                                    }
                                                })}
                                            />
                                            {errors.title && (
                                                <span className="text-danger small">{errors.title.message}</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Category <span className='text-danger'>*</span></Form.Label>
                                            <Form.Select
                                            className='formSelect'
                                                {...register('category', { required: 'Category is required' })}
                                            >
                                                <option value="">Select Category</option>
                                                <option value="bug">Bug Report</option>
                                                <option value="feature_request">Feature Request</option>
                                                <option value="technical_issue">Technical Issue</option>
                                                <option value="general_inquiry">General Inquiry</option>
                                            </Form.Select>
                                            {errors.category && (
                                                <span className="text-danger small">{errors.category.message}</span>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={6}>
                                        <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Priority</Form.Label>
                                            <Form.Select
                                            className='formSelect' {...register('priority')}>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* Attachments Section */}
                            <div className="mb-2">
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-paperclip me-2"></i>Attachments
                                </h6>
                                <Row>
                                    <Col lg={12}>
                                        <Form.Group className="mb-2">
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
                                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                                                />
                                            </div>
                                            <Form.Text className="text-muted">
                                                Supported formats: JPG, PNG, PDF, DOC, DOCX, TXT (Max 5MB each)
                                            </Form.Text>
                                            {filesUploading ? (
                                                <div className="mt-2 d-flex flex-wrap gap-2">
                                                    {[...Array(3)].map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="d-flex shadow-sm w-25 justify-content-between p-0 align-items-center mb-2"
                                                            style={{ height: '30px', borderRadius: '4px' }}
                                                        >
                                                            <div className="w-100 h-100 placeholder placeholder-wave rounded-2" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                attachments.length > 0 && (
                                                    <div className="mt-2 d-flex flex-wrap gap-2">
                                                        {attachments.map((file, index) => (
                                                            <div key={index} className="d-flex shadow-sm border justify-content-between p-1 px-2 align-items-center mb-2">
                                                                <span className="me-2" style={{ fontSize: '12px', cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
                                                                    onClick={() => {
                                                                        window.open(file?.url, '_blank')
                                                                    }}
                                                                    title="Click to open attachment"
                                                                >
                                                                    {file.filename}
                                                                </span>
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
                                </Row>
                            </div>

                            {/* Description Section */}
                            <div>
                                <h6 className="text-dark fw-bold mb-2 border-bottom pb-1">
                                    <i className="fas fa-align-left me-2"></i>Description
                                </h6>
                                <Row>
                                    <Col lg={12}>
                                        <Form.Group className="mb-1">
                                            <Form.Label className='mb-0 small d-flex justify-content-between'>Description   <small className="text-muted">
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
                                        {/* <Form.Group className="mb-2">
                                            <Form.Label className='mb-0 small'>Detailed Description</Form.Label>
                                            <Form.Control
                                            className='form'
                                                as="textarea"
                                                rows={4}
                                                placeholder="Describe your issue or request in detail"
                                                {...register('description')}
                                            />
                                        </Form.Group> */}
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button"
                        className="btn btn-outline-secondary fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        onClick={handleClose}
                        disabled={isSubmitting}>
                        Cancel
                    </button>
                    <button type="submit"
                        className="btn bg-dark text-white fw-semibold"
                        style={{ padding: '4px 16px', fontSize: '11px' }}
                        disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update Ticket'}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UpdateTicketModal;