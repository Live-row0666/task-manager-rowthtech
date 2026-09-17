import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Modal, } from "react-bootstrap";
import Select from "react-select";
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/images/logo/rowthtech.svg';
import './Milestones.css';
import './Documents.css';
import { getDashboard, getClientMilestonesAction, logoutUser } from '../redux/actions';
import { useDispatch, useSelector } from "react-redux";
import CommonSidebar from "../components/commonSidebar";
import {
    getDocumentClients,
    getDocumentProjects,
    uploadClientDocument,
    getClientDocuments
} from "../redux/clientDocuments/action";
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


    const store = useSelector((state) => state);

    const { user, dashboard, clientMilestones, clientMilestonesLoading } = useSelector(s => ({
        user: s.Auth.user,
        dashboard: s.Auth.dashboard,
        clientMilestones: s.Auth.clientMilestones || [],
        clientMilestonesLoading: s.Auth.clientMilestonesLoading,
    }));

    const name = user?.username || 'Client';

    const documentList =
        store?.getDocumentsReducer?.message?.data || [];

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

        if (!selectedFile) return;

        setDocuments([...documents, selectedFile]);

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

    const smallSelectStyle = {
        control: (base) => ({
            ...base,
            minHeight: "28px",
            height: "28px",
        }),
        valueContainer: (base) => ({
            ...base,
            height: "28px",
            padding: "0 8px",
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: "28px",
        }),
        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0,
        }),
    };
    const [search, setSearch] = useState("");
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    const filteredDocuments = documentList.filter((item) => {

        const matchSearch =
            item.title?.toLowerCase().includes(search.toLowerCase());

        const matchClient =
            !selectedClient ||
            item.clientId?._id === selectedClient.value;

        const matchProject =
            !selectedProject ||
            item.projectId?._id === selectedProject.value;

        return matchSearch && matchClient && matchProject;
    });
    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="documents" />
            <main className="dash-main">
                <header className="dash-header">
                    <div className="header-page-title"><h3>Documents</h3></div>
                    <div className="header-actions">
                        <button className="notification-btn"><i className="bi bi-bell" /><span className="notification-badge" /></button>
                        <div className="user-profile-widget">
                            <div className="user-avatar-circle">{initials}</div>
                            <div className="user-profile-details">
                                <span className="user-profile-name">{name}</span>
                                <span className="user-profile-role">{user?.role || 'Client'}</span>
                            </div>
                        </div>
                        <button className="btn btn-outline-danger btn-sm ms-logout-btn"
                            onClick={() => dispatch(logoutUser())}>
                            <i className="bi bi-box-arrow-right me-1" />Logout
                        </button>
                    </div>
                </header>

                <div className="card shadow-sm border-0">
           <Card className="documents-table-card">

    <Card.Header className="documents-table-header">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

           

            <div
                className="position-relative"
                style={{ width: "260px" }}
            >

                <i
                    className="bi bi-search"
                    style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#6c757d",
                        fontSize: "14px",
                    }}
                />

                <input
                    type="text"
                    className="form-control form-control-sm ps-5"
                    placeholder="Search title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </div>

        </div>

    </Card.Header>

    <div className="table-responsive">

        <table className="table documents-table mb-0">

            <thead>

                <tr>

                    <th>#</th>

                    <th>Client</th>

                    <th>Project</th>

                    <th>Title</th>

                    <th>Document</th>

                    <th>Date</th>

                </tr>

            </thead>

            <tbody>

                {filteredDocuments.length > 0 ? (

                    filteredDocuments.map((item, index) => (

                        <tr key={item._id}>

                            <td>{index + 1}</td>

                            <td>{item.clientId?.name}</td>

                            <td>{item.projectId?.name}</td>

                            <td>{item.title}</td>

                            <td>

                                <div className="doc-icons">

                                    {item.documents?.map((doc, i) => (

                                        <a
                                            key={i}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                                        </a>

                                    ))}

                                </div>

                            </td>

                            <td>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </td>

                        </tr>

                    ))

                ) : (

                    <tr>

                        <td
                            colSpan="6"
                            className="text-center py-5"
                        >
                            No Documents Found
                        </td>

                    </tr>

                )}

            </tbody>

        </table>

    </div>

</Card>
                </div>
            </main>
        </div>
    );
};

export default Documents;