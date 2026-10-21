import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import { APICore } from '../../../helpers/api/apiCore';
import { handleUpload } from '../../../constants/handleUpload';

const api = new APICore();

const stripHtml = (html) => {
    if (!html) return '';
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return (doc.body.textContent || '').trim();
    } catch (e) {
        return html.replace(/<[^>]*>?/gm, '').trim();
    }
};

const TaskReportModal = ({ show, onHide, task, onReportSaved }) => {
    const [title, setTitle] = useState('');
    const [summaryOfWork, setSummaryOfWork] = useState('');
    const [deliverables, setDeliverables] = useState([]);
    const [newDeliverable, setNewDeliverable] = useState('');
    const [timeSpentHours, setTimeSpentHours] = useState(0);
    const [completionDate, setCompletionDate] = useState(new Date());
    const [testingNotes, setTestingNotes] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('Draft');

    useEffect(() => {
        if (task && show) {
            const r = task.report || {};
            setTitle(r.title || `Delivery Report: ${task.summary || 'Task'}`);
            setSummaryOfWork(r.summaryOfWork || stripHtml(task.description) || '');
            setDeliverables(Array.isArray(r.deliverables) && r.deliverables.length > 0 ? r.deliverables : []);
            setTimeSpentHours(r.timeSpentHours || task.timeSpent || task.estimatedTime || 0);
            setCompletionDate(r.completionDate ? new Date(r.completionDate) : new Date());
            setTestingNotes(r.testingNotes || '');
            setDemoUrl(r.demoUrl || '');
            setAttachments(Array.isArray(r.attachments) ? r.attachments : (task.attachments || []));
            setStatus(r.status || 'Draft');
            setNewDeliverable('');
        }
    }, [task, show]);

    const handleAddDeliverable = () => {
        if (!newDeliverable.trim()) return;
        setDeliverables(prev => [...prev, newDeliverable.trim()]);
        setNewDeliverable('');
    };

    const handleRemoveDeliverable = (index) => {
        setDeliverables(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (e) => {
        const selected = Array.from(e.target.files || []);
        for (const file of selected) {
            if (file.size > 25 * 1024 * 1024) {
                toast.error(`${file.name} is larger than 25MB`);
                continue;
            }
            const res = await handleUpload(file, setUploading);
            if (res?.url) {
                const cleanUrl = res.url.split('?')[0];
                setAttachments(prev => [...prev, { name: file.name, url: cleanUrl }]);
            }
        }
    };

    const handleRemoveAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (submitStatus) => {
        if (!title.trim()) {
            toast.error('Report title is required');
            return;
        }
        if (!summaryOfWork.trim()) {
            toast.error('Summary of work is required');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                summaryOfWork: summaryOfWork.trim(),
                deliverables,
                timeSpentHours: Number(timeSpentHours) || 0,
                completionDate,
                testingNotes: testingNotes.trim(),
                demoUrl: demoUrl.trim(),
                attachments,
                status: submitStatus,
            };

            const res = await api.update(`/api/v1/admin/client-task/${task._id}/report`, payload);
            if (res?.status === 200 || res?.data?.status === 200) {
                toast.success(
                    submitStatus === 'Approved'
                        ? '🎉 Report approved & published to client!'
                        : '💾 Report saved as Draft (hidden from client)'
                );
                if (onReportSaved) onReportSaved(res?.data?.data || res?.data);
                onHide();
            } else {
                toast.error(res?.message || 'Failed to save report');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || 'Error saving report');
        } finally {
            setSubmitting(false);
        }
    };

    if (!task) return null;

    const isApproved = status === 'Approved';

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            {/* Header */}
            <Modal.Header className="py-2 px-3 bg-white border-bottom align-items-center">
                <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                background: isApproved ? '#e6f7ed' : '#eef2ff',
                                color: isApproved ? '#198754' : '#727cf5',
                                fontSize: 15,
                            }}
                        >
                            <i className={isApproved ? "bi bi-file-earmark-check-fill" : "bi bi-file-earmark-text-fill"} />
                        </div>
                        <div>
                            <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>
                                Client Task Delivery Report
                            </h6>
                            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px' }}>
                                <span className="text-truncate" style={{ maxWidth: 280 }} title={task.summary}>
                                    Task: {task.summary}
                                </span>
                                {task.milestone?.title && (
                                    <>
                                        <span>•</span>
                                        <span className="badge bg-light text-secondary border py-0 px-1" style={{ fontSize: '10px' }}>
                                            {task.milestone.title}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        {isApproved ? (
                            <span
                                className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 d-flex align-items-center gap-1"
                                style={{ fontSize: '11px' }}
                            >
                                <i className="bi bi-check-circle-fill" /> Approved &amp; Published
                            </span>
                        ) : (
                            <span
                                className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 d-flex align-items-center gap-1"
                                style={{ fontSize: '11px' }}
                            >
                                <i className="bi bi-clock-history" /> Draft (Hidden from Client)
                            </span>
                        )}
                    </div>
                </div>
            </Modal.Header>

            {/* Body */}
            <Modal.Body className="p-2 bg-light" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
                <div className="bg-white p-3 rounded-3 shadow-sm">
                    {/* Section 1: Overview */}
                    <div className="mb-3">
                        <h6 className="text-dark fw-bold mb-2 pb-1 border-bottom" style={{ fontSize: '12px' }}>
                            <i className="bi bi-info-circle text-primary me-1" />
                            General Information
                        </h6>
                        <Row className="g-2">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1" style={{ fontSize: '11px' }}>
                                        Report Headline / Title <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="sm"
                                        style={{ height: '32px', fontSize: '12px' }}
                                        placeholder="e.g. Feature Implementation & Release Summary"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1" style={{ fontSize: '11px' }}>
                                        Summary of Completed Work <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        style={{ fontSize: '12px', resize: 'vertical' }}
                                        placeholder="Explain what was accomplished, changes implemented, and results delivered..."
                                        value={summaryOfWork}
                                        onChange={e => setSummaryOfWork(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 2: Deliverables Checklist */}
                    <div className="mb-3">
                        <h6 className="text-dark fw-bold mb-2 pb-1 border-bottom" style={{ fontSize: '12px' }}>
                            <i className="bi bi-check2-square text-success me-1" />
                            Completed Deliverables &amp; Outcomes
                        </h6>
                        <div className="input-group input-group-sm mb-2">
                            <Form.Control
                                type="text"
                                placeholder="Type a completed deliverable (e.g. Responsive layout verified, Stripe integration complete)..."
                                value={newDeliverable}
                                onChange={e => setNewDeliverable(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddDeliverable();
                                    }
                                }}
                                style={{ height: '32px', fontSize: '12px' }}
                            />
                            <button
                                className="btn btn-outline-primary px-3 fw-semibold"
                                type="button"
                                onClick={handleAddDeliverable}
                                style={{ fontSize: '11px' }}
                            >
                                <i className="bi bi-plus-lg me-1" /> Add
                            </button>
                        </div>

                        {deliverables.length > 0 ? (
                            <div className="p-2 border rounded-2 bg-light">
                                <div className="d-flex flex-column gap-1">
                                    {deliverables.map((item, index) => (
                                        <div
                                            key={index}
                                            className="d-flex align-items-center justify-content-between px-2 py-1 bg-white border rounded small"
                                            style={{ fontSize: '12px' }}
                                        >
                                            <span className="text-dark d-flex align-items-center gap-2">
                                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '13px' }} />
                                                {item}
                                            </span>
                                            <i
                                                className="bi bi-trash text-danger cp ms-2 opacity-75"
                                                onClick={() => handleRemoveDeliverable(index)}
                                                title="Delete item"
                                                style={{ fontSize: '12px' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-muted small fst-italic px-1" style={{ fontSize: '11px' }}>
                                No deliverables added yet. Press Enter or click &quot;Add&quot; to append checklist items.
                            </div>
                        )}
                    </div>

                    {/* Section 3: Time, Dates, Preview */}
                    <div className="mb-3">
                        <h6 className="text-dark fw-bold mb-2 pb-1 border-bottom" style={{ fontSize: '12px' }}>
                            <i className="bi bi-clock-history text-info me-1" />
                            Delivery Metrics &amp; Live Link
                        </h6>
                        <Row className="g-2">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1" style={{ fontSize: '11px' }}>
                                        Actual Hours Invested
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        size="sm"
                                        style={{ height: '32px', fontSize: '12px' }}
                                        value={timeSpentHours}
                                        onChange={e => setTimeSpentHours(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1" style={{ fontSize: '11px' }}>
                                        Completion Date
                                    </Form.Label>
                                    <DatePicker
                                        selected={completionDate}
                                        onChange={d => setCompletionDate(d)}
                                        className="form-control form-control-sm w-100"
                                        style={{ height: '32px', fontSize: '12px' }}
                                        dateFormat="dd/MM/yyyy"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1" style={{ fontSize: '11px' }}>
                                        Demo / Staging Preview URL
                                    </Form.Label>
                                    <Form.Control
                                        type="url"
                                        size="sm"
                                        style={{ height: '32px', fontSize: '12px' }}
                                        placeholder="https://staging.app.com/..."
                                        value={demoUrl}
                                        onChange={e => setDemoUrl(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Section 4: QA Notes & Attachments */}
                    <div className="mb-1">
                        <h6 className="text-dark fw-bold mb-2 pb-1 border-bottom" style={{ fontSize: '12px' }}>
                            <i className="bi bi-paperclip text-secondary me-1" />
                            Testing Notes &amp; Delivery Attachments
                        </h6>
                        <Row className="g-2">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-secondary mb-1" style={{ fontSize: '11px' }}>
                                        QA &amp; Verification Notes
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        style={{ fontSize: '12px' }}
                                        placeholder="Steps to test, test accounts used, environments verified..."
                                        value={testingNotes}
                                        onChange={e => setTestingNotes(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <div className="d-flex align-items-center justify-content-between mb-1">
                                    <Form.Label className="small fw-semibold text-secondary mb-0" style={{ fontSize: '11px' }}>
                                        Deliverable Files &amp; Artifacts
                                    </Form.Label>
                                    <label
                                        htmlFor="ctd-report-file-input"
                                        className="btn btn-outline-primary btn-sm py-0 px-2 cp m-0 d-flex align-items-center gap-1"
                                        style={{ fontSize: '11px', height: '24px' }}
                                    >
                                        <i className="bi bi-cloud-arrow-up" /> Upload Files
                                    </label>
                                </div>
                                <input
                                    type="file"
                                    id="ctd-report-file-input"
                                    className="d-none"
                                    multiple
                                    onChange={handleFileUpload}
                                />

                                {uploading && (
                                    <div className="text-center py-2 text-primary small" style={{ fontSize: '11px' }}>
                                        <span className="spinner-border spinner-border-sm me-2" /> Uploading attachment...
                                    </div>
                                )}

                                {attachments.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2 p-2 border rounded-2 bg-light mt-1">
                                        {attachments.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="d-flex align-items-center gap-2 px-2 py-1 bg-white border rounded shadow-sm"
                                                style={{ fontSize: '11px' }}
                                            >
                                                <i className="bi bi-file-earmark-text text-primary" />
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-truncate text-dark text-decoration-none fw-medium"
                                                    style={{ maxWidth: 170 }}
                                                    title={file.name}
                                                >
                                                    {file.name || 'Attachment'}
                                                </a>
                                                <i
                                                    className="bi bi-x-circle text-danger cp ms-1"
                                                    onClick={() => handleRemoveAttachment(idx)}
                                                    title="Remove attachment"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className="border border-dashed rounded-2 p-2 text-center text-muted small"
                                        style={{ fontSize: '11px', background: '#fafbfc' }}
                                    >
                                        No files attached. Click &quot;Upload Files&quot; to include proof of work, test logs, or design assets.
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>
                </div>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="py-2 px-3 bg-white border-top d-flex justify-content-between align-items-center">
                <div>
                    {isApproved ? (
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-warning text-dark py-1 px-2"
                            disabled={submitting}
                            onClick={() => handleSubmit('Draft')}
                            style={{ fontSize: '11px' }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1" /> Revert to Draft
                        </button>
                    ) : (
                        <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '10.5px' }}>
                            <i className="bi bi-shield-lock" /> Hidden from client until published
                        </small>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-light border py-1 px-3 text-secondary"
                        onClick={onHide}
                        style={{ fontSize: '11px' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-1 px-3"
                        disabled={submitting}
                        onClick={() => handleSubmit('Draft')}
                        style={{ fontSize: '11px' }}
                    >
                        <i className="bi bi-bookmark me-1" /> Save Draft
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm bg-dark text-white fw-semibold py-1 px-3"
                        disabled={submitting}
                        onClick={() => handleSubmit('Approved')}
                        style={{ fontSize: '11px' }}
                    >
                        <i className="bi bi-check-circle-fill me-1 text-success" />
                        {isApproved ? 'Update Report' : 'Approve & Publish to Client'}
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default TaskReportModal;
