import React from 'react';
import { Modal, Button, Badge, Row, Col } from 'react-bootstrap';
import moment from 'moment';

const ClientTaskReportModal = ({ show, onHide, task }) => {
    if (!task) return null;

    const report = task.report || {};
    const deliverables = Array.isArray(report.deliverables) ? report.deliverables : [];
    const attachments = Array.isArray(report.attachments) ? report.attachments : [];

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" className="client-task-report-modal">
            <Modal.Header className="py-2 px-3 bg-light border-bottom">
                <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: '#e6f7ed',
                                color: '#198754',
                                fontSize: 16,
                            }}
                        >
                            <i className="bi bi-file-earmark-check-fill" />
                        </div>
                        <div>
                            <Modal.Title className="h6 mb-0 fw-bold text-dark">
                                Task Delivery &amp; Completion Report
                            </Modal.Title>
                            <small className="text-muted d-block" style={{ fontSize: '11px', lineHeight: 1.2 }}>
                                Verified &amp; Handed Over
                            </small>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Badge
                            bg="success"
                            className="d-inline-flex align-items-center gap-1 px-2"
                            style={{ height: '31px', fontSize: '11px', fontWeight: 600, borderRadius: '4px' }}
                        >
                            <i className="bi bi-shield-check" /> Approved Delivery
                        </Badge>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handlePrint}
                            className="d-none d-md-inline-flex align-items-center gap-1 px-2"
                            style={{ height: '31px', fontSize: '11px', fontWeight: 500 }}
                            title="Print or Save as PDF"
                        >
                            <i className="bi bi-printer" /> Print
                        </Button>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body className="p-3 p-md-4" style={{ maxHeight: '78vh', overflowY: 'auto' }}>
                {/* Header Banner */}
                <div
                    className="p-3 rounded-3 mb-3 border"
                    style={{
                        background: 'linear-gradient(135deg, #f8fbf9 0%, #f0f7f3 100%)',
                        borderColor: '#d2ebd9',
                    }}
                >
                    {/* Top row: Milestone badge and Delivered On date aligned along same baseline */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                        <span
                            className="badge bg-success-subtle text-success border border-success-subtle px-2 d-inline-flex align-items-center"
                            style={{ height: '22px', fontSize: '10.5px', fontWeight: 600 }}
                        >
                            Milestone: {task.milestone?.title || 'Milestone Task'}
                        </span>
                        {report.approvedAt && (
                            <div className="d-inline-flex align-items-center gap-1" style={{ height: '22px' }}>
                                <span className="text-muted" style={{ fontSize: '11px' }}>Delivered on:</span>
                                <span className="fw-semibold text-dark" style={{ fontSize: '11px' }}>
                                    {moment(report.approvedAt).format('DD MMM YYYY, hh:mm A')}
                                </span>
                            </div>
                        )}
                    </div>

                    <h5 className="fw-bold text-dark mb-1">
                        {report.title || task.summary || 'Task Delivery Report'}
                    </h5>
                    {task.summary && task.summary !== report.title && (
                        <p className="text-muted mb-0 small">{task.summary}</p>
                    )}

                    {/* Metadata strip */}
                    <div className="row g-2 mt-2 pt-2 border-top border-light-subtle">
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>Task Priority</small>
                            <span className="fw-semibold small text-dark">{task.priority || 'Medium'}</span>
                        </div>
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>Estimated Time</small>
                            <span className="fw-semibold small text-dark">{task.estimatedTime || 0} hrs</span>
                        </div>
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>Actual Hours</small>
                            <span className="fw-semibold small text-success">
                                {report.timeSpentHours || task.timeSpent || task.estimatedTime || 0} hrs
                            </span>
                        </div>
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block" style={{ fontSize: '10px' }}>Delivered By</small>
                            <span className="fw-semibold small text-dark">
                                {task.assignee?.name || report.approvedBy?.name || 'Development Team'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Summary of Work */}
                <div className="mb-3">
                    <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '13px' }}>
                        <i className="bi bi-card-text text-primary" />
                        Summary of Completed Work
                    </h6>
                    <div
                        className="p-3 bg-light rounded-2 border text-secondary"
                        style={{ fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}
                    >
                        {report.summaryOfWork || 'No summary provided.'}
                    </div>
                </div>

                {/* Deliverables Checklist */}
                {deliverables.length > 0 && (
                    <div className="mb-3">
                        <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '13px' }}>
                            <i className="bi bi-check-all text-success" />
                            Completed Deliverables &amp; Outcomes
                        </h6>
                        <div className="border rounded-2 p-2 bg-white">
                            {deliverables.map((d, index) => (
                                <div
                                    key={index}
                                    className="d-flex align-items-start gap-2 py-1 px-2 border-bottom last-no-border"
                                    style={{ fontSize: '13px' }}
                                >
                                    <i className="bi bi-check-circle-fill text-success mt-1" style={{ fontSize: '14px' }} />
                                    <span className="text-dark">{d}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Demo Link */}
                {report.demoUrl && (
                    <div className="mb-3 p-3 bg-white border border-primary-subtle rounded-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <small className="text-primary fw-semibold d-block text-uppercase" style={{ fontSize: '10px' }}>
                                Live Staging / Preview
                            </small>
                            <span className="text-dark small text-break">{report.demoUrl}</span>
                        </div>
                        <a
                            href={report.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                            style={{ fontSize: '11px', padding: '3px 10px', height: '26px', borderRadius: '4px' }}
                        >
                            <span>Open Link</span>
                            <i className="bi bi-box-arrow-up-right" style={{ fontSize: '10px' }} />
                        </a>
                    </div>
                )}

                {/* QA & Testing Notes */}
                {report.testingNotes && (
                    <div className="mb-3">
                        <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '13px' }}>
                            <i className="bi bi-shield-check text-info" />
                            Testing &amp; Quality Verification Notes
                        </h6>
                        <div
                            className="p-3 bg-light rounded-2 border text-secondary"
                            style={{ fontSize: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}
                        >
                            {report.testingNotes}
                        </div>
                    </div>
                )}

                {/* Attachments & Artifacts */}
                {attachments.length > 0 && (
                    <div className="mb-2">
                        <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2" style={{ fontSize: '13px' }}>
                            <i className="bi bi-paperclip text-secondary" />
                            Deliverable Files &amp; Artifacts
                        </h6>
                        <div className="row g-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="col-12 col-md-6">
                                    <div className="p-2 border rounded-2 d-flex align-items-center justify-content-between bg-white">
                                        <div className="d-flex align-items-center gap-2 text-truncate me-2">
                                            <i className="bi bi-file-earmark-arrow-down-fill text-primary fs-5" />
                                            <span className="small text-truncate text-dark fw-medium" title={file.name}>
                                                {file.name || `Attachment ${idx + 1}`}
                                            </span>
                                        </div>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            download
                                            className="btn btn-xs btn-outline-primary py-1 px-2 d-flex align-items-center gap-1"
                                            style={{ fontSize: '11px', whiteSpace: 'nowrap' }}
                                        >
                                            <i className="bi bi-download" /> Download
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer className="py-2 bg-light border-top d-flex justify-content-between">
                <small className="text-muted" style={{ fontSize: '11px' }}>
                    <i className="bi bi-shield-lock me-1" />
                    Official Client Delivery Document
                </small>
                <Button variant="secondary" size="sm" onClick={onHide} style={{ fontSize: '12px' }}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ClientTaskReportModal;
