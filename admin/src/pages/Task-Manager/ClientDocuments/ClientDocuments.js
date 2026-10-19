import React, { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "react-bootstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import {
    getDocumentClients,
    getDocumentProjects,
    uploadClientDocument,
    getClientDocuments,
    deleteClientDocument,
    resetUploadDocument
} from "../../../redux/actions";
import "./ClientDocuments.css";

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "42px",
        borderRadius: "8px",
        borderColor: state.isFocused ? "#727cf5" : "#cbd5e1",
        boxShadow: state.isFocused ? "0 0 0 3px rgba(114, 124, 245, 0.15)" : "none",
        "&:hover": {
            borderColor: state.isFocused ? "#727cf5" : "#94a3b8"
        }
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999
    })
};

const Documents = () => {
    const dispatch = useDispatch();

    // Toolbar Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientFilter, setSelectedClientFilter] = useState("all");
    const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [client, setClient] = useState(null);
    const [project, setProject] = useState(null);
    const [title, setTitle] = useState("");
    const [documents, setDocuments] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    const store = useSelector((state) => state);

    const rawDocumentList =
        store?.getDocumentsReducer?.message?.data ||
        store?.getDocumentsReducer?.data?.data ||
        store?.getDocumentsReducer?.data ||
        [];
    const documentList = useMemo(() => Array.isArray(rawDocumentList) ? rawDocumentList : [], [rawDocumentList]);
    const loading = store?.getDocumentsReducer?.loading;

    const rawClients =
        store?.getClientsReducer?.data?.data ||
        store?.getClientsReducer?.data ||
        [];
    const clients = useMemo(() => Array.isArray(rawClients) ? rawClients : [], [rawClients]);

    const rawProjects =
        store?.getProjectsReducer?.data?.data ||
        store?.getProjectsReducer?.data ||
        [];
    const projects = useMemo(() => Array.isArray(rawProjects) ? rawProjects : [], [rawProjects]);

    const uploadResponse = store?.uploadDocumentReducer?.data || {};
    const isUploading = store?.uploadDocumentReducer?.loading;

    const deleteResponse = store?.deleteDocumentReducer?.data || {};
    const isDeleting = store?.deleteDocumentReducer?.loading;

    useEffect(() => {
        dispatch(getDocumentClients());
        dispatch(getClientDocuments());
    }, [dispatch]);

    // Handle upload success
    useEffect(() => {
        if (uploadResponse?.success) {
            setShowUploadModal(false);
            setClient(null);
            setProject(null);
            setTitle("");
            setDocuments([]);
            setErrors({});
            dispatch(resetUploadDocument());
            dispatch(getClientDocuments());
        }
    }, [uploadResponse, dispatch]);

    // Handle delete success
    useEffect(() => {
        if (deleteResponse?.success) {
            setShowDeleteModal(false);
            setDocToDelete(null);
            dispatch(getClientDocuments());
        }
    }, [deleteResponse, dispatch]);

    // Client and Project options for react-select
    const clientOptions = useMemo(() => {
        return clients.map((item) => ({
            value: item._id,
            label: item.name,
        }));
    }, [clients]);

    const projectOptions = useMemo(() => {
        return projects.map((item) => ({
            value: item._id,
            label: item.name,
        }));
    }, [projects]);

    // File addition helper
    const handleFilesAdded = (filesList) => {
        if (!filesList || !filesList.length) return;
        const newFiles = Array.from(filesList);
        setDocuments((prev) => {
            const existingKeys = new Set(prev.map(f => `${f.name}_${f.size}`));
            const filteredNew = newFiles.filter(f => !existingKeys.has(`${f.name}_${f.size}`));
            return [...prev, ...filteredNew];
        });
        setErrors((prev) => ({ ...prev, documents: "" }));
    };

    const handleRemoveFile = (index) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer && e.dataTransfer.files) {
            handleFilesAdded(e.dataTransfer.files);
        }
    };

    // Validation
    const validateForm = () => {
        let newErrors = {};

        if (!client) {
            newErrors.client = "Please select a client.";
        }

        if (!project) {
            newErrors.project = "Please select a project.";
        }

        if (!title.trim()) {
            newErrors.title = "Document title is required.";
        }

        if (documents.length === 0) {
            newErrors.documents = "Please upload or attach at least one file.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit handler
    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!validateForm()) return;

        const formData = new FormData();
        formData.append("clientId", client.value);
        formData.append("projectId", project.value);
        formData.append("title", title.trim());

        documents.forEach((file) => {
            formData.append("documents", file, file.name);
        });

        dispatch(uploadClientDocument(formData));
    };

    // Delete handler
    const handleOpenDelete = (item) => {
        setDocToDelete(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!docToDelete?._id) return;
        dispatch(deleteClientDocument({ documentId: docToDelete._id }));
    };

    // Filter documents
    const filteredDocuments = useMemo(() => {
        return documentList.filter((item) => {
            const q = searchTerm.toLowerCase().trim();
            const titleMatch = !q ||
                (item.title || "").toLowerCase().includes(q) ||
                (item.clientId?.name || "").toLowerCase().includes(q) ||
                (item.projectId?.name || "").toLowerCase().includes(q) ||
                (item.documents || []).some(d => (d.originalName || "").toLowerCase().includes(q));

            const clientMatch = selectedClientFilter === "all" ||
                item.clientId?._id === selectedClientFilter ||
                item.clientId === selectedClientFilter;

            const projectMatch = selectedProjectFilter === "all" ||
                item.projectId?._id === selectedProjectFilter ||
                item.projectId === selectedProjectFilter;

            return titleMatch && clientMatch && projectMatch;
        });
    }, [documentList, searchTerm, selectedClientFilter, selectedProjectFilter]);

    // Statistics
    const totalDocs = documentList.length;
    const totalFiles = useMemo(() => {
        return documentList.reduce((acc, curr) => acc + ((curr.documents || []).length || 1), 0);
    }, [documentList]);

    const activeClientsCount = useMemo(() => {
        const set = new Set(documentList.map(d => d.clientId?._id || d.clientId).filter(Boolean));
        return set.size;
    }, [documentList]);

    const activeProjectsCount = useMemo(() => {
        const set = new Set(documentList.map(d => d.projectId?._id || d.projectId).filter(Boolean));
        return set.size;
    }, [documentList]);

    // Helper for file icons
    const getFileIconClass = (fileName) => {
        const ext = (fileName || "").split(".").pop()?.toLowerCase();
        if (ext === "pdf") return "bi bi-file-earmark-pdf-fill text-danger";
        if (["doc", "docx"].includes(ext)) return "bi bi-file-earmark-word-fill text-primary";
        if (["xls", "xlsx"].includes(ext)) return "bi bi-file-earmark-excel-fill text-success";
        if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "bi bi-file-earmark-image-fill text-warning";
        return "bi bi-file-earmark-text-fill text-secondary";
    };

    return (
        <div className="admin-docs-container">
            {/* Page Header */}
            <div className="admin-docs-header">
                <div className="admin-docs-title-wrap">
                    <h3>
                        <i className="uil uil-folder-check"></i>
                        Client Documents & Deliverables
                    </h3>
                    <p className="admin-docs-subtitle">
                        Upload, organize, and monitor project documentation, deliverables, and client assets securely.
                    </p>
                </div>

                <div className="admin-docs-header-actions">
                    <button
                        type="button"
                        className="btn-admin-refresh"
                        onClick={() => dispatch(getClientDocuments())}
                        title="Refresh document list"
                    >
                        <i className="uil uil-sync"></i>
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        className="btn-admin-upload"
                        onClick={() => {
                            setErrors({});
                            setShowUploadModal(true);
                        }}
                    >
                        <i className="uil uil-cloud-upload"></i>
                        <span>Upload Document</span>
                    </button>
                </div>
            </div>

            {/* KPI Executive Stat Cards */}
            <div className="admin-docs-stats-grid">
                <div className="admin-doc-stat-card">
                    <div>
                        <div className="admin-doc-stat-label">Total Documents</div>
                        <div className="admin-doc-stat-value text-primary">{totalDocs}</div>
                        <div className="admin-doc-stat-sub">Indexed entries</div>
                    </div>
                    <div className="admin-doc-stat-icon-wrap icon-wrap-indigo">
                        <i className="uil uil-files-landscapes-alt"></i>
                    </div>
                </div>

                <div className="admin-doc-stat-card">
                    <div>
                        <div className="admin-doc-stat-label">File Attachments</div>
                        <div className="admin-doc-stat-value text-danger">{totalFiles}</div>
                        <div className="admin-doc-stat-sub">PDFs, Docs & Assets</div>
                    </div>
                    <div className="admin-doc-stat-icon-wrap icon-wrap-rose">
                        <i className="uil uil-paperclip"></i>
                    </div>
                </div>

                <div className="admin-doc-stat-card">
                    <div>
                        <div className="admin-doc-stat-label">Active Clients</div>
                        <div className="admin-doc-stat-value text-success">{activeClientsCount}</div>
                        <div className="admin-doc-stat-sub">With document records</div>
                    </div>
                    <div className="admin-doc-stat-icon-wrap icon-wrap-emerald">
                        <i className="uil uil-users-alt"></i>
                    </div>
                </div>

                <div className="admin-doc-stat-card">
                    <div>
                        <div className="admin-doc-stat-label">Projects Covered</div>
                        <div className="admin-doc-stat-value text-info">{activeProjectsCount}</div>
                        <div className="admin-doc-stat-sub">Workspaces linked</div>
                    </div>
                    <div className="admin-doc-stat-icon-wrap icon-wrap-sky">
                        <i className="uil uil-layer-group"></i>
                    </div>
                </div>
            </div>

            {/* Main Documents Hub Card */}
            <div className="admin-docs-main-card">
                {/* Toolbar: Search & Filters */}
                <div className="admin-docs-toolbar">
                    <div className="admin-docs-toolbar-left">
                        <h4 className="admin-docs-card-title">All Project Documents</h4>
                        <span className="admin-docs-badge-count">
                            {filteredDocuments.length} of {totalDocs} records
                        </span>
                    </div>

                    <div className="admin-docs-filters">
                        {/* Live Search */}
                        <div className="admin-docs-search-box">
                            <i className="uil uil-search admin-docs-search-icon"></i>
                            <input
                                type="text"
                                className="admin-docs-search-input"
                                placeholder="Search title, client, file..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Client Filter */}
                        <select
                            className="admin-docs-filter-select"
                            value={selectedClientFilter}
                            onChange={(e) => setSelectedClientFilter(e.target.value)}
                        >
                            <option value="all">All Clients</option>
                            {clients.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* Clear Filters */}
                        {(searchTerm || selectedClientFilter !== "all" || selectedProjectFilter !== "all") && (
                            <button
                                type="button"
                                className="btn-admin-clear-filter"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedClientFilter("all");
                                    setSelectedProjectFilter("all");
                                }}
                            >
                                <i className="uil uil-times"></i>
                                <span>Clear</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table-admin-docs">
                        <thead>
                            <tr>
                                <th className="col-num">#</th>
                                <th className="col-title">Document Title</th>
                                <th className="col-client">Client</th>
                                <th className="col-project">Project</th>
                                <th className="col-files">Files & Attachments</th>
                                <th className="col-date">Date</th>
                                <th className="col-actions">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                                        <span>Loading documents...</span>
                                    </td>
                                </tr>
                            ) : filteredDocuments.length > 0 ? (
                                filteredDocuments.map((item, index) => (
                                    <tr key={item._id || index}>
                                        <td className="col-num fw-bold text-muted">{index + 1}</td>

                                        {/* Title */}
                                        <td className="col-title">
                                            <div className="admin-doc-title-cell">
                                                <div className="admin-doc-type-icon">
                                                    <i className={getFileIconClass(item.documents?.[0]?.originalName)}></i>
                                                </div>
                                                <div className="admin-doc-title-content">
                                                    <div className="admin-doc-title-main">{item.title}</div>
                                                    <div className="admin-doc-title-sub">
                                                        {item.documents?.[0]?.originalName || "Attached asset"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Client */}
                                        <td className="col-client">
                                            <div className="admin-doc-client-pill">
                                                <i className="uil uil-building"></i>
                                                <span>{item.clientId?.name || "-"}</span>
                                            </div>
                                        </td>

                                        {/* Project */}
                                        <td className="col-project">
                                            <div className="admin-doc-project-pill">
                                                <i className="uil uil-folder"></i>
                                                <span>{item.projectId?.name || "-"}</span>
                                            </div>
                                        </td>

                                        {/* Files */}
                                        <td className="col-files">
                                            <div className="admin-doc-files-list">
                                                {item.documents && item.documents.length > 0 ? (
                                                    item.documents.map((doc, i) => (
                                                        <a
                                                            key={i}
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="admin-file-download-badge"
                                                            title={`Open ${doc.originalName || "file"}`}
                                                        >
                                                            <i className={getFileIconClass(doc.originalName)}></i>
                                                            <span>
                                                                {doc.originalName 
                                                                    ? (doc.originalName.length > 18 
                                                                        ? doc.originalName.substring(0, 16) + '...' 
                                                                        : doc.originalName)
                                                                    : `File #${i + 1}`}
                                                            </span>
                                                        </a>
                                                    ))
                                                ) : (
                                                    <span className="text-muted small">No file</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Upload Date */}
                                        <td className="col-date">
                                            <span className="text-muted small fw-medium">
                                                {item.createdAt ? moment(item.createdAt).format("DD MMM YYYY") : "-"}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="col-actions">
                                            <div className="admin-doc-actions">
                                                {item.documents?.[0]?.url && (
                                                    <a
                                                        href={item.documents[0].url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn-admin-action-view"
                                                        title="Open in new tab"
                                                    >
                                                        <i className="uil uil-external-link-alt"></i>
                                                    </a>
                                                )}

                                                <button
                                                    type="button"
                                                    className="btn-admin-action-delete"
                                                    onClick={() => handleOpenDelete(item)}
                                                    title="Delete document"
                                                >
                                                    <i className="uil uil-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7">
                                        <div className="admin-docs-empty">
                                            <div className="admin-docs-empty-icon">
                                                <i className="uil uil-folder-open"></i>
                                            </div>
                                            <div className="admin-docs-empty-title">No Documents Found</div>
                                            <div className="admin-docs-empty-desc">
                                                {searchTerm || selectedClientFilter !== "all"
                                                    ? "No document records match the active search or client filter."
                                                    : "No client documents have been uploaded yet. Click 'Upload Document' to add the first one."}
                                            </div>
                                            {(searchTerm || selectedClientFilter !== "all") ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => {
                                                        setSearchTerm("");
                                                        setSelectedClientFilter("all");
                                                    }}
                                                >
                                                    Reset Filters
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn-admin-upload"
                                                    onClick={() => setShowUploadModal(true)}
                                                >
                                                    <i className="uil uil-plus"></i>
                                                    <span>Upload Document</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Document Modal */}
            <Modal
                show={showUploadModal}
                onHide={() => !isUploading && setShowUploadModal(false)}
                centered
                size="lg"
                className="admin-docs-modal"
            >
                <Modal.Header closeButton={!isUploading}>
                    <Modal.Title className="admin-docs-modal-title">
                        <div className="admin-docs-modal-title-icon">
                            <i className="uil uil-cloud-upload"></i>
                        </div>
                        <span>Upload Client Document</span>
                    </Modal.Title>
                </Modal.Header>

                <form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row g-3">
                            {/* Client Selection */}
                            <div className="col-md-6">
                                <div className="admin-modal-group">
                                    <label className="admin-modal-label">
                                        Select Client <span className="req">*</span>
                                    </label>
                                    <Select
                                        styles={selectStyles}
                                        options={clientOptions}
                                        value={client}
                                        placeholder="Select target client..."
                                        isDisabled={isUploading}
                                        onChange={(selected) => {
                                            setClient(selected);
                                            setProject(null);
                                            setErrors((prev) => ({
                                                ...prev,
                                                client: "",
                                                project: "",
                                            }));

                                            if (selected) {
                                                dispatch(
                                                    getDocumentProjects({
                                                        clientId: selected.value,
                                                    })
                                                );
                                            }
                                        }}
                                    />
                                    {errors.client && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.client}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Project Selection */}
                            <div className="col-md-6">
                                <div className="admin-modal-group">
                                    <label className="admin-modal-label">
                                        Select Project <span className="req">*</span>
                                    </label>
                                    <Select
                                        styles={selectStyles}
                                        options={projectOptions}
                                        value={project}
                                        placeholder={client ? "Select client project..." : "Choose client first"}
                                        isDisabled={!client || isUploading}
                                        onChange={(selected) => {
                                            setProject(selected);
                                            setErrors((prev) => ({
                                                ...prev,
                                                project: "",
                                            }));
                                        }}
                                    />
                                    {errors.project && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.project}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* Document Title */}
                            <div className="col-12">
                                <div className="admin-modal-group">
                                    <label className="admin-modal-label">
                                        Document Title <span className="req">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="admin-modal-input"
                                        placeholder="e.g. Master Service Agreement, Sprint 2 Deliverables, Design Guide"
                                        value={title}
                                        disabled={isUploading}
                                        onChange={(e) => {
                                            setTitle(e.target.value);
                                            setErrors((prev) => ({
                                                ...prev,
                                                title: "",
                                            }));
                                        }}
                                    />
                                    {errors.title && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.title}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* File Upload Dropzone */}
                            <div className="col-12">
                                <div className="admin-modal-group">
                                    <label className="admin-modal-label">
                                        Files & Attachments <span className="req">*</span>
                                    </label>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        multiple
                                        style={{ display: "none" }}
                                        disabled={isUploading}
                                        onChange={(e) => handleFilesAdded(e.target.files)}
                                    />

                                    <div
                                        className={`admin-docs-dropzone ${isDragging ? "dragging" : ""}`}
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <div className="admin-dropzone-icon">
                                            <i className="uil uil-file-upload-alt"></i>
                                        </div>
                                        <div className="admin-dropzone-title">
                                            Drag & drop files here, or <span>browse from computer</span>
                                        </div>
                                        <div className="admin-dropzone-sub">
                                            Supports PDF, DOC, DOCX, XLS, XLSX, Images, ZIP up to 25MB each
                                        </div>
                                    </div>

                                    {errors.documents && (
                                        <small className="text-danger d-block mt-1">
                                            {errors.documents}
                                        </small>
                                    )}

                                    {/* Selected Files List */}
                                    {documents.length > 0 && (
                                        <div className="admin-selected-files-list">
                                            {documents.map((file, idx) => (
                                                <div key={idx} className="admin-file-pill-item">
                                                    <div className="admin-file-pill-left">
                                                        <i className={getFileIconClass(file.name)}></i>
                                                        <span className="admin-file-pill-name" title={file.name}>
                                                            {file.name}
                                                        </span>
                                                        <span className="admin-file-pill-size">
                                                            ({(file.size / 1024).toFixed(0)} KB)
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="btn-remove-pill"
                                                        onClick={() => handleRemoveFile(idx)}
                                                        disabled={isUploading}
                                                        title="Remove file"
                                                    >
                                                        <i className="uil uil-times"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => setShowUploadModal(false)}
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-admin-upload"
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <i className="uil uil-check me-1"></i>
                                    <span>Upload & Save Document</span>
                                </>
                            )}
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => !isDeleting && setShowDeleteModal(false)}
                centered
                className="admin-docs-modal"
            >
                <Modal.Header closeButton={!isDeleting}>
                    <Modal.Title className="admin-docs-modal-title">
                        <div className="admin-docs-modal-title-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                            <i className="uil uil-trash-alt"></i>
                        </div>
                        <span>Confirm Delete Document</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1 text-dark fw-medium">
                        Are you sure you want to permanently delete this document?
                    </p>
                    <p className="text-muted small mb-0">
                        <strong>"{docToDelete?.title}"</strong> associated with client <strong>{docToDelete?.clientId?.name || "Client"}</strong> will be removed.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="btn btn-light"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600 }}
                    >
                        {isDeleting ? "Deleting..." : "Delete Permanently"}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Documents;