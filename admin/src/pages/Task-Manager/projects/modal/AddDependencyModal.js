import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { handleUpload } from '../../../../constants/handleUpload';
import { useDispatch } from 'react-redux';
import { updateProject, getProjectsById } from '../../../../redux/projects/action';
import { toast } from 'react-toastify';

const AddDependencyModal = ({ show, onHide, projectData, dependencies, editData, editIndex }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        provider: '',
        costInvolved: false,
        cost: '',
        status: 'Pending',
        notes: '',
        links: [],
        documents: []
    });
    const [linkInput, setLinkInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editData) {
            setFormData({ ...editData, links: editData.links || [] });
        } else {
            setFormData({ name: '', provider: '', status: 'Pending', notes: '', links: [], documents: [] });
        }
    }, [editData]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const result = await handleUpload(file, setUploading);
        if (result?.url) {
            const fileUrl = result.url.split('?')[0];
            setFormData(prev => ({
                ...prev,
                documents: [...prev.documents, { name: file.name, url: fileUrl }]
            }));
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            setError('Dependency name is required.');
            return;
        }

        setIsSubmitting(true);
        let updatedDependencies;

        if (editData) {
            updatedDependencies = [...dependencies];
            updatedDependencies[editIndex] = formData;
        } else {
            updatedDependencies = [...dependencies, formData];
        }

        const body = { dependencies: updatedDependencies };
        await dispatch(updateProject({ body, projectId: projectData._id }));
        await dispatch(getProjectsById({ id: projectData._id }));

        setIsSubmitting(false);
        setFormData({ name: '', provider: '', status: 'Pending', notes: '', links: [], documents: [] });
        setLinkInput('');
        setError('');
        onHide();
    };

    const handleClose = () => {
        setFormData({ name: '', provider: '', status: 'Pending', notes: '', links: [], documents: [] });
        setLinkInput('');
        setError('');
        onHide();
    };

    const isValidURL = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleAddLink = () => {
        const trimmedLink = linkInput.trim();
        if (!trimmedLink) return;

        if (!isValidURL(trimmedLink)) {
            toast.error('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        setFormData({ ...formData, links: [...formData.links, trimmedLink] });
        setLinkInput('');
        setError('');
    };

    const handleRemoveLink = (index) => {
        setFormData({ ...formData, links: formData.links.filter((_, i) => i !== index) });
    };


    return (
        <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="fs-6">{editData ? 'Edit Dependency' : 'Add Dependency'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <div className="row">
                        <div className="col-4">
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold">Name <span className='text-danger'>*</span></Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter dependency name"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData({ ...formData, name: e.target.value });
                                        setError('');
                                    }}
                                    size="sm"
                                />
                            </Form.Group>
                        </div>
                        <div className="col-4">
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold">Provider <span className='text-danger'>*</span></Form.Label>
                                <Form.Select
                                    size='sm'
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                >
                                    <option value="">Select Provider</option>
                                    <option value="RTL">RTL</option>
                                    <option value="Client">Client</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className="col-4">
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Is Cost Involved</Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    checked={formData.costInvolved}
                                    onChange={(e) => {
                                        setFormData({ ...formData, costInvolved: e.target.checked });
                                        setError('');
                                    }}
                                />
                            </Form.Group>
                        </div>
                        {formData.costInvolved && (
                            <div className="col-4">
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-semibold">Costing <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter costing"
                                        value={formData.cost}
                                        onChange={(e) => {
                                            setFormData({ ...formData, cost: e.target.value });
                                            setError('');
                                        }}
                                        size="sm"
                                    />
                                </Form.Group>
                            </div>
                        )}
                        <div className="col-4">
                            <Form.Group>
                                <Form.Label className="small fw-semibold">Status</Form.Label>
                                <Form.Select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    size="sm"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Done">Done</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className="col-4">
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold">Links</Form.Label>
                                <div className="d-flex gap-2 mb-2">
                                    <Form.Control
                                        type="url"
                                        placeholder="Enter link URL"
                                        value={linkInput}
                                        onChange={(e) => setLinkInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
                                        size="sm"
                                    />
                                    <Button variant="dark" size="sm" onClick={handleAddLink}>
                                        <i className="bi bi-plus"></i>
                                    </Button>
                                </div>
                            </Form.Group>
                        </div>
                    </div>
                    <div className="row mb-2">
                        {formData.links?.length > 0 && (
                            formData.links.map((link, idx) => (
                                <div key={idx} className=" col-4  px-2 py-0">
                                    <div className='bg-light w-100 h-100 d-flex justify-content-between align-items-center  rounded p-1'>
                                        <a href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-truncate me-2 text-decoration-none"
                                        >
                                            {link}
                                        </a>
                                        <i onClick={() => handleRemoveLink(idx)} className="bi bi-trash text-danger cursor-pointer" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Notes</Form.Label>
                        <ReactQuill
                            theme="snow"
                            value={formData.notes}
                            onChange={(value) => setFormData({ ...formData, notes: value })}
                            style={{ height: '150px', marginBottom: '50px' }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold">Upload Documents</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            size="sm"
                        />
                        {uploading && <small className="text-info">Uploading...</small>}
                    </Form.Group>

                    {formData.documents?.length > 0 && (
                        <div className="mb-3">
                            <small className="fw-semibold">Uploaded Files:</small>
                            <ul className="list-unstyled mt-2">
                                {formData.documents.map((doc, idx) => (
                                    <li key={idx} className="d-flex justify-content-between align-items-center mb-1">
                                        <small>{doc.name}</small>
                                        <i
                                            className="bi bi-trash text-danger cp"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                const newDocs = formData.documents.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, documents: newDocs });
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && <div className="text-danger small mb-2">{error}</div>}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" size="sm" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="dark" size="sm" onClick={handleSubmit} disabled={uploading || isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editData ? 'Update' : 'Add Dependency')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddDependencyModal;
