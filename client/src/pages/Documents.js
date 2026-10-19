import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import moment from "moment";
import CommonHeader from "../components/commonHeader";
import CommonSidebar from "../components/commonSidebar";
import {
    getClientDocuments,
    uploadClientDocument,
    deleteClientDocument,
    resetUploadDocument
} from "../redux/clientDocuments/action";
import { getDashboard } from "../redux/actions";
import "./Dashboard.css";
import "./Documents.css";

// Smooth animated counter component
const CountUp = ({ end = 0, duration = 800 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const target = Number(end) || 0;
        if (target === 0) {
            setCount(0);
            return;
        }

        let animationFrameId;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = easeOutProgress * target;

            setCount(currentVal);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [end, duration]);

    return <>{Math.round(count)}</>;
};

const Documents = () => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState("");
    const [selectedProjectFilter, setSelectedProjectFilter] = useState("all");
    const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const projectDropdownRef = useRef(null);

    // Upload Modal State
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadProjectId, setUploadProjectId] = useState("");
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadErrors, setUploadErrors] = useState({});
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    const store = useSelector((state) => state);
    const documentState = store?.getDocumentsReducer || {};
    const rawDocumentList = documentState?.message?.data || documentState?.data?.data || documentState?.data;
    const documentList = useMemo(() => Array.isArray(rawDocumentList) ? rawDocumentList : [], [rawDocumentList]);
    const loading = documentState?.loading;

    const uploadState = useSelector((state) => state?.uploadDocumentReducer);
    const isUploading = uploadState?.loading;
    const uploadSuccess = uploadState?.data?.success;

    const deleteState = useSelector((state) => state?.deleteDocumentReducer);
    const isDeleting = deleteState?.loading;
    const deleteSuccess = deleteState?.data?.success;

    const dashboard = useSelector((state) => state.Auth.dashboard);
    const rawProjects = dashboard?.projects;
    const projects = useMemo(() => Array.isArray(rawProjects) ? rawProjects : [], [rawProjects]);

    useEffect(() => {
        dispatch(getClientDocuments());
        dispatch(getDashboard());
    }, [dispatch]);

    // Refresh after successful upload
    useEffect(() => {
        if (uploadSuccess) {
            setShowUploadModal(false);
            setUploadTitle("");
            setUploadFiles([]);
            setUploadErrors({});
            dispatch(resetUploadDocument());
            dispatch(getClientDocuments());
        }
    }, [uploadSuccess, dispatch]);

    // Refresh after successful delete
    useEffect(() => {
        if (deleteSuccess) {
            setShowDeleteModal(false);
            setDocToDelete(null);
            dispatch(getClientDocuments());
        }
    }, [deleteSuccess, dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter documents
    const filteredDocuments = useMemo(() => {
        if (!Array.isArray(documentList)) return [];
        return documentList.filter((item) => {
            const titleMatch = !search.trim() || 
                (item.title || "").toLowerCase().includes(search.toLowerCase()) ||
                (item.projectId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
                (item.documents || []).some(d => (d.originalName || "").toLowerCase().includes(search.toLowerCase()));

            const projectMatch = selectedProjectFilter === "all" || 
                item.projectId?._id === selectedProjectFilter ||
                item.projectId === selectedProjectFilter;

            return titleMatch && projectMatch;
        });
    }, [documentList, search, selectedProjectFilter]);

    // Statistics
    const totalDocs = Array.isArray(documentList) ? documentList.length : 0;
    const totalPdfFiles = useMemo(() => {
        if (!Array.isArray(documentList)) return 0;
        return documentList.reduce((acc, curr) => {
            const count = (curr.documents || []).length || 1;
            return acc + count;
        }, 0);
    }, [documentList]);

    const uniqueProjectsCount = useMemo(() => {
        if (!Array.isArray(documentList)) return 0;
        const set = new Set(documentList.map(d => d.projectId?._id || d.projectId).filter(Boolean));
        return set.size || projects.length || 1;
    }, [documentList, projects]);

    const latestUploadDate = useMemo(() => {
        if (!Array.isArray(documentList) || !documentList.length) return null;
        return documentList[0]?.createdAt;
    }, [documentList]);

    // Open upload modal
    const handleOpenUploadModal = () => {
        const defaultProjId = selectedProjectFilter !== "all" 
            ? selectedProjectFilter 
            : (projects[0]?._id || dashboard?.project?._id || "");
        setUploadProjectId(defaultProjId);
        setUploadTitle("");
        setUploadFiles([]);
        setUploadErrors({});
        setShowUploadModal(true);
    };

    // Handle files selection
    const handleFilesAdded = (filesList) => {
        if (!filesList || !filesList.length) return;
        const newFiles = Array.from(filesList);
        setUploadFiles((prev) => {
            const existingKeys = new Set(prev.map(f => `${f.name}_${f.size}`));
            const filteredNew = newFiles.filter(f => !existingKeys.has(`${f.name}_${f.size}`));
            return [...prev, ...filteredNew];
        });
        setUploadErrors((prev) => ({ ...prev, files: "" }));
    };

    const handleRemoveFile = (index) => {
        setUploadFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Drag and Drop handlers
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

    // Validate and submit document
    const handleUploadSubmit = (e) => {
        e.preventDefault();
        const errs = {};

        if (!uploadTitle.trim()) {
            errs.title = "Document title is required.";
        }

        if (!uploadProjectId) {
            errs.project = "Please select a project.";
        }

        if (!uploadFiles || uploadFiles.length === 0) {
            errs.files = "Please select or attach at least one file.";
        }

        if (Object.keys(errs).length > 0) {
            setUploadErrors(errs);
            return;
        }

        setUploadErrors({});

        const formData = new FormData();
        formData.append("title", uploadTitle.trim());
        formData.append("projectId", uploadProjectId);
        uploadFiles.forEach((file) => {
            formData.append("documents", file, file.name);
        });

        dispatch(uploadClientDocument(formData));
    };

    // Open delete confirmation
    const handleOpenDelete = (item) => {
        setDocToDelete(item);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (!docToDelete?._id) return;
        dispatch(deleteClientDocument({ documentId: docToDelete._id }));
    };

    // Helper to get extension icon
    const getFileIcon = (fileName) => {
        const ext = (fileName || "").split(".").pop()?.toLowerCase();
        if (ext === "pdf") return "bi bi-file-earmark-pdf-fill text-danger";
        if (["doc", "docx"].includes(ext)) return "bi bi-file-earmark-word-fill text-primary";
        if (["xls", "xlsx"].includes(ext)) return "bi bi-file-earmark-excel-fill text-success";
        if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "bi bi-file-earmark-image-fill text-warning";
        return "bi bi-file-earmark-text-fill text-secondary";
    };

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="documents" />

            <main className="dash-main">
                <CommonHeader title="Documents" />

                {/* Hero Header Bar */}
                <div className="docs-hero-bar">
                    <div className="docs-hero-left">
                        <div className="docs-badge-tag">
                            <i className="bi bi-shield-lock-fill"></i>
                            Project Document Vault
                        </div>
                        <h2 className="docs-hero-title">Project Documents & Assets</h2>
                        <p className="docs-hero-subtitle">
                            Securely access, upload, and manage contracts, project deliverables, design handoffs, and milestone documentation.
                        </p>

                        <div className="docs-meta-chips">
                            <div className="docs-chip">
                                <i className="bi bi-folder2-open"></i>
                                <span>{dashboard?.project?.name || "Active Workspace"}</span>
                            </div>
                            <div className="docs-chip docs-chip-secure">
                                <i className="bi bi-patch-check-fill text-success"></i>
                                <span>Encrypted & Verified</span>
                            </div>
                            <div className="docs-chip">
                                <i className="bi bi-files"></i>
                                <span>{totalDocs} Document Records</span>
                            </div>
                        </div>
                    </div>

                    <div className="docs-hero-actions">
                        {/* Project Switcher Filter */}
                        {projects.length > 0 && (
                            <div className="project-dropdown-wrapper" ref={projectDropdownRef}>
                                <button
                                    type="button"
                                    className={`project-dropdown-trigger ${isProjectDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                    title="Filter documents by project"
                                >
                                    <div className="project-trigger-left">
                                        <i className="bi bi-filter-circle project-trigger-icon"></i>
                                        <span className="project-trigger-name">
                                            {selectedProjectFilter === "all" 
                                                ? "All Projects" 
                                                : projects.find(p => p._id === selectedProjectFilter)?.name || "Project"}
                                        </span>
                                    </div>
                                    <i className={`bi bi-chevron-down project-trigger-chevron ${isProjectDropdownOpen ? 'open' : ''}`}></i>
                                </button>

                                {isProjectDropdownOpen && (
                                    <div className="project-dropdown-menu">
                                        <div className="project-dropdown-header">
                                            <span>Filter by Project</span>
                                        </div>
                                        <div className="project-dropdown-list">
                                            <div
                                                className={`project-dropdown-item ${selectedProjectFilter === 'all' ? 'selected' : ''}`}
                                                onClick={() => {
                                                    setSelectedProjectFilter('all');
                                                    setIsProjectDropdownOpen(false);
                                                }}
                                            >
                                                <div className="item-icon-wrap">
                                                    <i className="bi bi-grid"></i>
                                                </div>
                                                <span className="item-name">All Projects</span>
                                                {selectedProjectFilter === 'all' && <i className="bi bi-check2 item-check"></i>}
                                            </div>
                                            {projects.map((p) => {
                                                const isSelected = p._id === selectedProjectFilter;
                                                return (
                                                    <div
                                                        key={p._id}
                                                        className={`project-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedProjectFilter(p._id);
                                                            setIsProjectDropdownOpen(false);
                                                        }}
                                                    >
                                                        <div className="item-icon-wrap">
                                                            <i className="bi bi-folder2-open"></i>
                                                        </div>
                                                        <span className="item-name">{p.name}</span>
                                                        {isSelected && <i className="bi bi-check2 item-check"></i>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Add / Upload Document Button */}
                        <button
                            type="button"
                            className="btn-docs-action btn-docs-primary"
                            onClick={handleOpenUploadModal}
                            title="Upload new document to project"
                        >
                            <i className="bi bi-cloud-arrow-up-fill"></i>
                            <span>Upload Document</span>
                        </button>

                        <button 
                            type="button" 
                            className="btn-docs-action" 
                            onClick={() => dispatch(getClientDocuments())}
                            title="Refresh documents list"
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* 4 Executive KPI Metric Cards */}
                <div className="docs-kpi-grid">
                    {/* Card 1: Total Documents */}
                    <div className="doc-kpi-card">
                        <div className="doc-kpi-top">
                            <span className="doc-kpi-label">Total Documents</span>
                            <div className="doc-kpi-icon doc-icon-indigo">
                                <i className="bi bi-folder2-open"></i>
                            </div>
                        </div>
                        <div className="doc-kpi-main">
                            <span className="doc-kpi-val text-primary">
                                <CountUp end={totalDocs} />
                            </span>
                            <span className="doc-kpi-tag tag-indigo">Indexed</span>
                        </div>
                        <span className="doc-kpi-sub">
                            Active documentation entries
                        </span>
                    </div>

                    {/* Card 2: Files & Attachments */}
                    <div className="doc-kpi-card">
                        <div className="doc-kpi-top">
                            <span className="doc-kpi-label">File Attachments</span>
                            <div className="doc-kpi-icon doc-icon-rose">
                                <i className="bi bi-file-earmark-pdf-fill"></i>
                            </div>
                        </div>
                        <div className="doc-kpi-main">
                            <span className="doc-kpi-val text-danger">
                                <CountUp end={totalPdfFiles} />
                            </span>
                            <span className="doc-kpi-tag tag-rose">PDF & Docs</span>
                        </div>
                        <span className="doc-kpi-sub">
                            Available for download
                        </span>
                    </div>

                    {/* Card 3: Project Workspaces */}
                    <div className="doc-kpi-card">
                        <div className="doc-kpi-top">
                            <span className="doc-kpi-label">Workspaces</span>
                            <div className="doc-kpi-icon doc-icon-emerald">
                                <i className="bi bi-kanban-fill"></i>
                            </div>
                        </div>
                        <div className="doc-kpi-main">
                            <span className="doc-kpi-val text-success">
                                <CountUp end={uniqueProjectsCount} />
                            </span>
                            <span className="doc-kpi-tag tag-emerald">Linked</span>
                        </div>
                        <span className="doc-kpi-sub">
                            Connected project repositories
                        </span>
                    </div>

                    {/* Card 4: Recent Upload */}
                    <div className="doc-kpi-card">
                        <div className="doc-kpi-top">
                            <span className="doc-kpi-label">Latest Activity</span>
                            <div className="doc-kpi-icon doc-icon-sky">
                                <i className="bi bi-cloud-check-fill"></i>
                            </div>
                        </div>
                        <div className="doc-kpi-main">
                            <span className="doc-kpi-val" style={{ fontSize: '18px' }}>
                                {latestUploadDate ? moment(latestUploadDate).fromNow() : "Up to date"}
                            </span>
                            <span className="doc-kpi-tag tag-sky">Synced</span>
                        </div>
                        <span className="doc-kpi-sub">
                            {latestUploadDate ? moment(latestUploadDate).format("DD MMM YYYY") : "No recent activity"}
                        </span>
                    </div>
                </div>

                {/* Main Documents Hub Card */}
                <div className="docs-main-card">
                    <div className="docs-toolbar">
                        <div className="docs-toolbar-left">
                            <h3 className="docs-toolbar-title">All Project Files</h3>
                            <span className="docs-count-badge">
                                {filteredDocuments.length} of {totalDocs} Files
                            </span>
                        </div>

                        <div className="docs-toolbar-controls">
                            {/* View Switcher */}
                            <div className="view-mode-toggle">
                                <button
                                    type="button"
                                    className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
                                    onClick={() => setViewMode("table")}
                                    title="Table view"
                                >
                                    <i className="bi bi-list-ul"></i>
                                </button>
                                <button
                                    type="button"
                                    className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                                    onClick={() => setViewMode("grid")}
                                    title="Grid card view"
                                >
                                    <i className="bi bi-grid-fill"></i>
                                </button>
                            </div>

                            {/* Search Box */}
                            <div className="docs-search-box">
                                <i className="bi bi-search docs-search-icon"></i>
                                <input
                                    type="text"
                                    className="docs-search-input"
                                    placeholder="Search documents or files..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button
                                        type="button"
                                        className="docs-search-clear"
                                        onClick={() => setSearch("")}
                                        title="Clear search"
                                    >
                                        <i className="bi bi-x-circle-fill"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="docs-loading-wrap">
                            <div className="docs-spinner"></div>
                            <div>Loading project documents...</div>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="docs-empty-state">
                            <div className="docs-empty-icon-wrap">
                                <i className="bi bi-folder-x"></i>
                            </div>
                            <h4 className="docs-empty-title">No Documents Found</h4>
                            <p className="docs-empty-desc">
                                {search || selectedProjectFilter !== "all" 
                                    ? "No document records matched your active search query or filter." 
                                    : "No project documents or contracts have been uploaded yet. Click below to add your first document."}
                            </p>
                            {(search || selectedProjectFilter !== "all") ? (
                                <button
                                    type="button"
                                    className="btn-docs-action"
                                    onClick={() => {
                                        setSearch("");
                                        setSelectedProjectFilter("all");
                                    }}
                                >
                                    <i className="bi bi-arrow-counterclockwise"></i>
                                    Clear Filters
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-docs-action btn-docs-primary"
                                    onClick={handleOpenUploadModal}
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    Upload Document
                                </button>
                            )}
                        </div>
                    ) : viewMode === "table" ? (
                        <div className="table-responsive">
                            <table className="table-docs-custom">
                                <thead>
                                    <tr>
                                        <th style={{ width: '44px' }}>#</th>
                                        <th>Document Title</th>
                                        <th>Project</th>
                                        <th>Client</th>
                                        <th>Files & Attachments</th>
                                        <th>Upload Date</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocuments.map((item, index) => (
                                        <tr key={item._id || index}>
                                            <td className="fw-bold text-muted">{index + 1}</td>
                                            <td>
                                                <div className="doc-title-cell">
                                                    <div className="doc-file-icon icon-pdf">
                                                        <i className={getFileIcon(item.documents?.[0]?.originalName)}></i>
                                                    </div>
                                                    <div className="doc-info-text">
                                                        <span className="doc-info-title">{item.title}</span>
                                                        <span className="doc-info-filename">
                                                            {item.documents?.[0]?.originalName || item.documents?.[0]?.fileName || "Attached file"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="doc-project-badge">
                                                    <i className="bi bi-folder2-open"></i>
                                                    <span>{item.projectId?.name || "General"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="doc-client-badge">
                                                    <i className="bi bi-building"></i>
                                                    <span>{item.clientId?.name || "Client"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="doc-files-pills">
                                                    {item.documents && item.documents.length > 0 ? (
                                                        item.documents.map((doc, i) => (
                                                            <a
                                                                key={i}
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="btn-file-download"
                                                                title={`Open ${doc.originalName || 'file'}`}
                                                            >
                                                                <i className={getFileIcon(doc.originalName)}></i>
                                                                <span>View File {item.documents.length > 1 ? `#${i + 1}` : ''}</span>
                                                            </a>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted small">No direct attachment</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-muted small fw-medium">
                                                    {item.createdAt ? moment(item.createdAt).format("DD MMM YYYY") : "-"}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="d-flex align-items-center justify-content-end gap-1">
                                                    {item.documents?.[0]?.url && (
                                                        <a
                                                            href={item.documents[0].url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn-docs-action py-1 px-2"
                                                            title="Download / View"
                                                        >
                                                            <i className="bi bi-box-arrow-up-right"></i>
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="btn-doc-delete"
                                                        onClick={() => handleOpenDelete(item)}
                                                        title="Delete document"
                                                    >
                                                        <i className="bi bi-trash3"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="docs-grid-view">
                            {filteredDocuments.map((item, index) => (
                                <div className="doc-card-item" key={item._id || index}>
                                    <div>
                                        <div className="doc-card-header">
                                            <div className="doc-file-icon icon-pdf">
                                                <i className={getFileIcon(item.documents?.[0]?.originalName)}></i>
                                            </div>
                                            <div>
                                                <h5 className="doc-card-title">{item.title}</h5>
                                                <span className="text-muted small">
                                                    {item.projectId?.name || "General Project"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="doc-card-meta">
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-building text-muted"></i>
                                                <span>{item.clientId?.name || "Client"}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-calendar3 text-muted"></i>
                                                <span>{item.createdAt ? moment(item.createdAt).format("DD MMM YYYY") : "Recent"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="doc-card-footer">
                                        <span className="text-muted small">
                                            {item.documents?.length || 1} file(s)
                                        </span>
                                        <div className="d-flex align-items-center gap-2">
                                            {item.documents?.[0]?.url && (
                                                <a
                                                    href={item.documents[0].url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn-docs-action py-1 px-3 text-decoration-none"
                                                >
                                                    <i className="bi bi-box-arrow-up-right"></i>
                                                    <span>Open</span>
                                                </a>
                                            )}
                                            <button
                                                type="button"
                                                className="btn-doc-delete"
                                                onClick={() => handleOpenDelete(item)}
                                                title="Delete document"
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Document Modal */}
                <Modal
                    show={showUploadModal}
                    onHide={() => !isUploading && setShowUploadModal(false)}
                    centered
                    className="docs-custom-modal"
                >
                    <Modal.Header closeButton={!isUploading}>
                        <Modal.Title className="docs-modal-title">
                            <div className="docs-modal-title-icon">
                                <i className="bi bi-cloud-arrow-up-fill"></i>
                            </div>
                            <span>Upload Project Document</span>
                        </Modal.Title>
                    </Modal.Header>

                    <form onSubmit={handleUploadSubmit}>
                        <Modal.Body>
                            {/* Project Selector */}
                            <div className="docs-form-group">
                                <label className="docs-form-label">
                                    Project Workspace <span className="req">*</span>
                                </label>
                                <select
                                    className="docs-form-select"
                                    value={uploadProjectId}
                                    onChange={(e) => {
                                        setUploadProjectId(e.target.value);
                                        setUploadErrors((prev) => ({ ...prev, project: "" }));
                                    }}
                                    disabled={isUploading}
                                >
                                    <option value="">Select Target Project</option>
                                    {projects.map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                {uploadErrors.project && (
                                    <div className="docs-form-error">
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        <span>{uploadErrors.project}</span>
                                    </div>
                                )}
                            </div>

                            {/* Document Title */}
                            <div className="docs-form-group">
                                <label className="docs-form-label">
                                    Document Title <span className="req">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="docs-form-control"
                                    placeholder="e.g. Master Service Agreement, API Specs, Design Assets"
                                    value={uploadTitle}
                                    onChange={(e) => {
                                        setUploadTitle(e.target.value);
                                        setUploadErrors((prev) => ({ ...prev, title: "" }));
                                    }}
                                    disabled={isUploading}
                                />
                                {uploadErrors.title && (
                                    <div className="docs-form-error">
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        <span>{uploadErrors.title}</span>
                                    </div>
                                )}
                            </div>

                            {/* File Upload Dropzone */}
                            <div className="docs-form-group">
                                <label className="docs-form-label">
                                    Document Files <span className="req">*</span>
                                </label>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={(e) => handleFilesAdded(e.target.files)}
                                    disabled={isUploading}
                                />

                                <div
                                    className={`docs-dropzone ${isDragging ? "dragging" : ""}`}
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="docs-dropzone-icon">
                                        <i className="bi bi-file-earmark-arrow-up"></i>
                                    </div>
                                    <div className="docs-dropzone-title">
                                        Drag & drop files here, or <span>browse</span>
                                    </div>
                                    <div className="docs-dropzone-sub">
                                        Supports PDF, Word, Excel, Images, ZIP up to 25MB each
                                    </div>
                                </div>

                                {uploadErrors.files && (
                                    <div className="docs-form-error">
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        <span>{uploadErrors.files}</span>
                                    </div>
                                )}

                                {/* Selected Files List */}
                                {uploadFiles.length > 0 && (
                                    <div className="docs-selected-files-list">
                                        {uploadFiles.map((file, idx) => (
                                            <div key={idx} className="docs-file-pill">
                                                <div className="docs-file-pill-left">
                                                    <i className={getFileIcon(file.name)}></i>
                                                    <span className="docs-file-pill-name" title={file.name}>
                                                        {file.name}
                                                    </span>
                                                    <span className="docs-file-pill-size">
                                                        ({(file.size / 1024).toFixed(0)} KB)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-remove-file-pill"
                                                    onClick={() => handleRemoveFile(idx)}
                                                    disabled={isUploading}
                                                    title="Remove file"
                                                >
                                                    <i className="bi bi-x-circle-fill"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Modal.Body>

                        <Modal.Footer>
                            <button
                                type="button"
                                className="btn-docs-action"
                                onClick={() => setShowUploadModal(false)}
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-docs-action btn-docs-primary"
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-cloud-arrow-up-fill me-1"></i>
                                        <span>Upload Document</span>
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
                    className="docs-custom-modal"
                >
                    <Modal.Header closeButton={!isDeleting}>
                        <Modal.Title className="docs-modal-title">
                            <div className="docs-modal-title-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                                <i className="bi bi-trash3-fill"></i>
                            </div>
                            <span>Delete Document</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="mb-1 text-dark fw-medium">
                            Are you sure you want to delete this document?
                        </p>
                        <p className="text-muted small mb-0">
                            <strong>{docToDelete?.title}</strong> will be permanently removed from this project workspace.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type="button"
                            className="btn-docs-action"
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
            </main>
        </div>
    );
};

export default Documents;