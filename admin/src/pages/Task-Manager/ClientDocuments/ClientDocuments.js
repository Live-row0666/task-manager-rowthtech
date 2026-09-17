import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Modal, } from "react-bootstrap";
import Select from "react-select";
import { useDispatch, useSelector } from "react-redux";

import {
    getDocumentClients,
    getDocumentProjects,
    uploadClientDocument,
    getClientDocuments
} from "../../../redux/actions";
const SS = {
    control: (base) => ({
        ...base,
        minHeight: "42px",
        borderRadius: "8px",
    }),
};

const Documents = () => {
    const dispatch = useDispatch();
    const [client, setClient] = useState(null);
    const [project, setProject] = useState(null);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);

    const [errors, setErrors] = useState({
        client: "",
        project: "",
        title: "",
        documents: "",
    });
    const store = useSelector((state) => state);

    const documentList =
        store?.getDocumentsReducer?.message?.data || [];

    console.log(documentList, "xvbcvcbnxvbbbnnbnn")
    const clients =
        store?.getClientsReducer?.data?.data || [];

    const projects =
        store?.getProjectsReducer?.data?.data || [];

    const uploadResponse =
        store?.uploadDocumentReducer?.data || {};

    useEffect(() => {
        dispatch(getDocumentClients());
        dispatch(getClientDocuments());
    }, [dispatch]);

    const [documents, setDocuments] = useState([]);
    console.log(documents, "documents")
    const [showModal, setShowModal] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);

    const handleAddDocument = () => {

        if (!selectedFile) {
            return;
        }

        setDocuments((prev) => [...prev, selectedFile]);

        setErrors((prev) => ({
            ...prev,
            documents: "",
        }));

        setSelectedFile(null);
        setShowModal(false);
    };
    const handleDeleteDocument = (index) => {

        const temp = [...documents];

        temp.splice(index, 1);

        setDocuments(temp);
    };
    const clientOptions = clients.map((item) => ({
        value: item._id,
        label: item.name,
    }));
    const projectOptions = projects.map((item) => ({
        value: item._id,
        label: item.name,
    }));

    const validateForm = () => {
        let newErrors = {};

        if (!client) {
            newErrors.client = "Client is required.";
        }

        if (!project) {
            newErrors.project = "Project is required.";
        }

        if (!title.trim()) {
            newErrors.title = "Title is required.";
        }

        if (documents.length === 0) {
            newErrors.documents = "Please upload at least one document.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const formData = new FormData();
        formData.append("clientId", client.value);
        formData.append("projectId", project.value);
        formData.append("title", title);

        documents.forEach((file) => {
            formData.append("documents", file, file.name);
        });

        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        dispatch(uploadClientDocument(formData));
    };

    useEffect(() => {
        if (uploadResponse?.success) {
            setClient(null);
            setProject(null);
            setTitle("");
            setDocuments([]);
            setSelectedFile(null);

            dispatch(getClientDocuments());
        }
    }, [uploadResponse, dispatch]);
    return (
        <div className="card shadow-sm border-0">
            <div className="card-body">

                {/* First Row */}
                <div className="row g-3">

                    {/* Client */}
                    <div className="col-lg-2">
                        <label className="form-label">Client</label>

                        <Select
                            styles={SS}
                            options={clientOptions}
                            value={client}
                            placeholder="Select Client"
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

                    {/* Project */}
                    <div className="col-lg-2">
                        <label className="form-label">Project</label>

                        <Select
                            styles={SS}
                            options={projectOptions}
                            value={project}
                            placeholder="Select Project"
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

                    {/* Title */}
                    <div className="col-lg-3">
                        <label className="form-label">Title</label>

                        <input
                            type="text"
                            className="form-control"
                            style={{ height: "42px" }}
                            placeholder="Enter document title"
                            value={title}
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

                    {/* Documents */}
                    <div className="col-lg-3">
                        <label className="form-label">Documents</label>

                        <div
                            className="border rounded d-flex align-items-center justify-content-between px-3"
                            style={{
                                height: "42px",
                                borderColor: "#ced4da",
                                background: "#fff",
                            }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-light text-dark">
                                    📄 {documents.length} Files
                                </span>
                            </div>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="bi bi-plus-lg"></i>
                            </button>
                        </div>

                        {errors.documents && (
                            <small className="text-danger d-block mt-1">
                                {errors.documents}
                            </small>
                        )}
                    </div>

                </div>

                <div className="row mt-2">
                    <div className="col-lg-2">
                        <button
                            type="button"
                            className="btn btn-primary w-100"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </div>

            </div>
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Upload Document
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                    />

                </Modal.Body>

                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleAddDocument}
                    >
                        Upload
                    </Button>

                </Modal.Footer>

            </Modal>

            <div className="table-responsive mt-2">
                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Client</th>
                            <th>Project</th>
                            <th>Title</th>
                            <th>Documents</th>
                            <th>Date</th>
                        </tr>
                    </thead>

                    <tbody>
                        {documentList.length > 0 ? (
                            documentList.map((item, index) => (
                                <tr key={item._id}>
                                    <td>{index + 1}</td>

                                    <td>{item.clientId?.name}</td>

                                    <td>{item.projectId?.name}</td>

                                    <td>{item.title}</td>

                                    <td className="text-center align-middle">
                                        {item.documents?.length > 0 ? (
                                            <div className="d-flex justify-content-center align-items-center gap-3">
                                                {item.documents.map((doc, i) => {
                                                    const fileName = doc.originalName || "";
                                                    const ext = fileName.split(".").pop()?.toLowerCase();

                                                    let icon = "bi bi-file-earmark fs-2 text-secondary";

                                                    if (ext === "pdf")
                                                        icon = "bi bi-file-earmark-pdf-fill fs-2 text-danger";
                                                    else if (["doc", "docx"].includes(ext))
                                                        icon = "bi bi-file-earmark-word-fill fs-2 text-primary";
                                                    else if (["xls", "xlsx"].includes(ext))
                                                        icon = "bi bi-file-earmark-excel-fill fs-2 text-success";
                                                    else if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
                                                        icon = "bi bi-file-earmark-image-fill fs-2 text-warning";

                                                    return (
                                                        <a
                                                            key={i}
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title={fileName}
                                                            className="text-decoration-none"
                                                        >
                                                            <i className={icon}></i>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    <td>
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center">
                                    No Documents Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Documents;