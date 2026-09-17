import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { getDashboard, logoutUser } from '../redux/actions';
import Logo from '../assets/images/logo/rowthtech.svg';
import { Modal, Button, Table } from 'react-bootstrap';
import './Projects.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommonHeader from "../components/commonHeader";
import CommonSidebar from '../components/commonSidebar';
const Projects = () => {
    const dispatch = useDispatch();
    const { user, dashboard, loading } = useSelector((state) => ({
        user: state.Auth.user,
        dashboard: state.Auth.dashboard,
        loading: state.Auth.loading,
    }));

    const [selectedMilestone, setSelectedMilestone] = useState(null);

    const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
    const [startDate, endDate] = selectedDateRange;

    const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
    const [selectedProjectFilter, setSelectedProjectFilter] = useState(null);
    const [selectedTech, setSelectedTech] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    // Detail Modal State
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCopiedIndex, setShowCopiedIndex] = useState(null);

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);




    const handleProjectChange = (project) => {
        setSelectedProjectFilter(project);
        setSelectedMilestone(null);

        if (project) {
            dispatch(getDashboard(project.value));
        } else {
            dispatch(getDashboard());
        }
    };
    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const name = user?.username || 'John Smith';
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const projectsList = useMemo(() => {
        return dashboard?.projects || [];
    }, [dashboard]);


    console.log(dashboard, "xbncvnbnvcbcvbn")

    const allTechnologies = useMemo(() => {
        const techs = new Map();
        projectsList.forEach(project => {
            if (Array.isArray(project.technology)) {
                project.technology.forEach(t => {
                    if (t && t._id && t.name) {
                        techs.set(t._id, t.name);
                    }
                });
            }
        });
        return Array.from(techs.entries()).map(([id, name]) => ({ value: id, label: name }));
    }, [projectsList]);

    // Extract unique team members dynamically
    const allTeamMembers = useMemo(() => {
        const members = new Map();
        projectsList.forEach(project => {
            if (Array.isArray(project.team)) {
                project.team.forEach(m => {
                    if (m && m._id && m.name) {
                        members.set(m._id, m.name);
                    }
                });
            }
        });
        return Array.from(members.entries()).map(([id, name]) => ({ value: id, label: name }));
    }, [projectsList]);

    const projectOptions = useMemo(() => {
        return projectsList.map(project => ({ value: project._id, label: project.name }));
    }, [projectsList]);

    const badgeClass = {
        overdue: "bg-danger text-white",
        today: "bg-warning text-dark",
        upcoming: "bg-success text-white",
        completed: "bg-secondary text-white",
    };

    const milestoneOptions = useMemo(() => {
        return (dashboard?.milestones || []).map(item => ({
            value: item._id,
            label: item.title
        }));
    }, [dashboard?.milestones]);

    // Filter projects based on selections
    const filteredProjects = useMemo(() => {
        return projectsList.filter((project) => {

            // Project Filter
            const matchesProject =
                !selectedProjectFilter ||
                project._id === selectedProjectFilter.value;

            // Technology Filter
            const matchesTech =
                !selectedTech ||
                (project.technology || []).some(
                    (tech) => tech._id === selectedTech.value
                );

            // Resource Filter
            const matchesMember =
                !selectedMember ||
                (project.team || []).some(
                    (member) => member._id === selectedMember.value
                );

            // Date Range Filter
            let matchesDate = true;

            if (startDate && endDate) {

                const from = new Date(startDate);
                from.setHours(0, 0, 0, 0);

                const to = new Date(endDate);
                to.setHours(23, 59, 59, 999);

                const projectStart = project.start
                    ? new Date(project.start)
                    : null;

                const projectEnd = project.end
                    ? new Date(project.end)
                    : null;

                matchesDate = false;

                // Start date falls in range
                if (
                    projectStart &&
                    projectStart >= from &&
                    projectStart <= to
                ) {
                    matchesDate = true;
                }

                // End date falls in range
                if (
                    projectEnd &&
                    projectEnd >= from &&
                    projectEnd <= to
                ) {
                    matchesDate = true;
                }

                // Project duration overlaps selected range
                if (
                    projectStart &&
                    projectEnd &&
                    projectStart <= to &&
                    projectEnd >= from
                ) {
                    matchesDate = true;
                }
            }

            return (
                matchesProject &&
                matchesTech &&
                matchesMember &&
                matchesDate
            );
        });
    }, [
        projectsList,
        selectedProjectFilter,
        selectedTech,
        selectedMember,
        startDate,
        endDate
    ]);
    const boardData = useMemo(() => {
        const groups = {
            "Ongoing": {
                title: "To Do",
                items: [],
                color: "#f59e0b",
            },
            "In Progress": {
                title: "In Progress",
                items: [],
                color: "#3b82f6",
            },
             "Testing": {
            title: "Testing",
            items: [],
            color: "#6f42c1",
        },
            "Done": {
                title: "Done",
                items: [],
                color: "#22c55e",
            },
            "Hold": {
                title: "Hold",
                items: [],
                color: "#ef4444",
            },
        };

        filteredProjects.forEach((project) => {
            const status = (project.projectStatus || "").trim().toLowerCase();

            switch (status) {
                case "ongoing":
                    groups["Ongoing"].items.push(project);
                    break;

                case "in progress":
                    groups["In Progress"].items.push(project);
                    break;

                                case "testing":
                groups["Testing"].items.push(project);
                break;


                case "done":
                case "delivered":
                    groups["Done"].items.push(project);
                    break;

                case "hold":
                    groups["Hold"].items.push(project);
                    break;

                default:
                    groups["Ongoing"].items.push(project);
            }
        });

        return groups;
    }, [filteredProjects]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Calculate days left to match admin format
    const getDaysLeft = (endStr, status) => {
        if (status === 'Delivered') {
            return {
                text: 'Delivered',
                bg: 'rgba(46, 213, 115, 0.1)',
                textColor: '#2ed573'
            };
        }
        if (!endStr) {
            return {
                text: 'No Deadline',
                bg: 'rgba(255, 234, 0, 0.15)',
                textColor: '#57606f'
            };
        }
        const endDate = new Date(endStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = endDate - today;
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (days < 0) {
            return {
                text: 'Overdue',
                bg: 'rgba(243, 4, 24, 0.19)',
                textColor: '#fa172aff'
            };
        } else if (days <= 10) {
            return {
                text: 'Urgent',
                bg: 'rgba(255, 165, 2, 0.1)',
                textColor: '#ffa502'
            };
        }
        return {
            text: 'On Time',
            bg: 'rgba(46, 213, 115, 0.1)',
            textColor: '#2ed573'
        };
    };

    const handleCardClick = (project) => {
        setSelectedProject(project);
        setShowDetailModal(true);
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setShowCopiedIndex(idx);
        setTimeout(() => setShowCopiedIndex(null), 2000);
    };

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            borderColor: state.isFocused ? '#727cf5' : '#dee2e6',
            boxShadow: state.isFocused ? '0 0 0 1px #727cf5' : 'none',
            '&:hover': {
                borderColor: '#727cf5'
            }
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
            fontSize: '12px',
            color: '#495057',
            fontWeight: '500'
        }),
        placeholder: (base) => ({
            ...base,
            fontSize: '12px',
            color: '#98a6ad'
        }),
        option: (base, state) => ({
            ...base,
            fontSize: '12px',
            backgroundColor: state.isSelected ? '#727cf5' : state.isFocused ? '#f1f3fa' : 'transparent',
            color: state.isSelected ? '#ffffff' : '#495057',
            cursor: 'pointer',
            '&:active': {
                backgroundColor: '#727cf5'
            }
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: '30px'
        }),
        indicatorSeparator: (base) => ({
            ...base,
            backgroundColor: '#e3eaef'
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999,
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            border: '1px solid #e3eaef'
        })
    };

    useEffect(() => {
    if (projectsList.length > 0 && !selectedProjectFilter) {
        handleProjectChange({
            value: projectsList[0]._id,
            label: projectsList[0].name,
        });
    }
}, [projectsList]);

    return (
        <div className="dashboard-wrapper">
            {/* Sidebar */}
             <CommonSidebar active="myprojects" />

            {/* Main Area */}
            <main className="dash-main">
               <CommonHeader title="My Projects" />
                <div className="card" style={{ height: '92vh' }}>
                    <div className="card-body px-2 pt-2">
                        <div className="mb-2 p-0 bg-white rounded">
                            <div className="d-flex flex-column flex-md-row justify-content-between gap-2">
                                <div className="d-flex flex-wrap gap-1 mb-2 mb-md-0">

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center view-toggle-btn"
                                        onClick={() => setViewMode(viewMode === "list" ? "board" : "list")}
                                        title={viewMode === "list" ? "Switch to Board view" : "Switch to List view"}
                                    >
                                        <i className={`bi ${viewMode === "list" ? "bi-kanban" : "bi-list-ul"}`}></i>
                                    </button>
                                </div>
                                <div className="d-flex flex-wrap gap-2 align-items-center">


                                    <Select
                                        value={selectedProjectFilter}
                                        onChange={handleProjectChange}
                                        options={projectOptions}
                                        placeholder="Select Project"
                                        isClearable
                                        isSearchable
                                        styles={customSelectStyles}
                                    />

                                    {/* Milestone */}

                                    <div style={{ width: 180 }}>
                                        <Select
                                            value={selectedMilestone}
                                            onChange={setSelectedMilestone}
                                            options={milestoneOptions}
                                            placeholder="Select Milestone"
                                            isDisabled={!selectedProjectFilter}
                                            isClearable
                                            isSearchable
                                            styles={customSelectStyles}
                                        />
                                    </div>

                                    {/* Date Range */}

                                    <div style={{ width: 200 }}>
                                        <DatePicker
                                            selectsRange
                                            startDate={startDate}
                                            endDate={endDate}
                                            onChange={(update) => setSelectedDateRange(update)}
                                            isClearable
                                            placeholderText="Select Date Range"
                                            dateFormat="dd MMM yyyy"
                                            className="form-control form-control-sm"
                                        />
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : filteredProjects.length === 0 ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                                <div className="text-center text-muted">
                                    <i className="bi bi-inbox fs-1"></i>
                                    <p className="mt-3 fs-5">No data found</p>
                                </div>
                            </div>
                        ) : viewMode === 'board' ? (
                            <div className="projects-container">
                                <div className="task-page-columns-dash">
                                    {Object.entries(boardData).map(([columnId, column]) => (
                                        <div key={columnId} className="task-list-col">
                                            <div className="projects-task-list">
                                                <div className="projects-column-title" >
                                                    <span className="text-capitalize">{column.title}</span>
                                                    <span className="badge bg-primary text-white rounded-1 px-1 py-1">
                                                        {column.items.length}
                                                    </span>
                                                </div>

                                                <div style={{ minHeight: '300px', padding: '8px' }} className="d-flex flex-column gap-2">
                                                    {column.items.length > 0 ? (
                                                        column.items.map(project => {
                                                            const daysInfo = getDaysLeft(project.end, project.projectStatus);

                                                            let badgeBg = 'rgba(30, 144, 255, 0.1)';
                                                            let badgeColor = '#1e90ff';
                                                            if (project.projectType === 'Freelance') {
                                                                badgeBg = 'rgba(46, 213, 115, 0.1)';
                                                                badgeColor = '#2ed573';
                                                            } else if (project.projectType === 'Marketing') {
                                                                badgeBg = 'rgba(255, 165, 2, 0.1)';
                                                                badgeColor = '#ffa502';
                                                            } else if (project.projectType === 'Sales') {
                                                                badgeBg = 'rgba(243, 4, 24, 0.19)';
                                                                badgeColor = '#fa172aff';
                                                            }

                                                            return (
                                                                <div key={project._id} className="projects-card-container">
                                                                    <div
                                                                        className="projects-card-information cp"
                                                                        onClick={() => handleCardClick(project)}
                                                                    >
                                                                        <div className="row">
                                                                            <div
                                                                                style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)' }}
                                                                                className="col-12 pe-0 d-flex gap-1 align-items-center"
                                                                            >
                                                                                <span
                                                                                    className="projects-priority-badge"
                                                                                    style={{ backgroundColor: badgeBg, color: badgeColor }}
                                                                                >
                                                                                    {project.projectType || 'Tech'}
                                                                                </span>
                                                                                <span
                                                                                    className="badge rounded-pill px-2 py-1 d-inline-flex align-items-center fw-bold text-uppercase text-nowrap"
                                                                                    style={{
                                                                                        backgroundColor: daysInfo.bg,
                                                                                        color: daysInfo.textColor,
                                                                                    }}
                                                                                >
                                                                                    {daysInfo.text}
                                                                                </span>
                                                                                {project.projectStatus !== 'Delivered' && (
                                                                                    <div className="ms-auto text-end text-nowrap pe-1">
                                                                                        <small style={{ fontSize: '10.5px', color: '#64748b' }}>
                                                                                            {project.end ? new Date(project.end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}
                                                                                        </small>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <div
                                                                                style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(0, 0, 0, 0.77)', marginTop: '6px' }}
                                                                                className="col-12 pt-1 pb-0 fw-bold"
                                                                            >
                                                                                {project.name}
                                                                            </div>

                                                                            <div className="col-12 project-description">
                                                                                {(project.description || "No description provided.").replace(/<[^>]*>/g, "")}
                                                                            </div>

                                                                            <div
                                                                                style={{ fontSize: '0.72rem', fontWeight: '800', color: '#495057' }}
                                                                                className="col-12 d-flex justify-content-between pt-2 pb-1"
                                                                            >
                                                                                Duration: {formatDate(project.start)} - {project.end ? formatDate(project.end) : ""}
                                                                            </div>
                                                                        </div>

                                                                        <div className="row mt-1 pt-1 border-top" style={{ borderColor: '#e9ecef' }}>
                                                                            <div className="col-12 d-flex align-items-center justify-content-between">
                                                                                <div className="team-members">
                                                                                    {Array.isArray(project.team) &&
                                                                                        project.team.slice(0, 3).map((member, index) => {
                                                                                            const initials = member.name
                                                                                                ? member.name
                                                                                                    .split(" ")
                                                                                                    .map((n) => n[0])
                                                                                                    .join("")
                                                                                                    .slice(0, 2)
                                                                                                    .toUpperCase()
                                                                                                : "??";

                                                                                            return (
                                                                                                <span
                                                                                                    key={member._id}
                                                                                                    title={member.name}
                                                                                                    className={`team-avatar ${index === 0 ? "first-avatar" : ""}`}
                                                                                                >
                                                                                                    {initials}
                                                                                                </span>
                                                                                            );
                                                                                        })}

                                                                                    {project.team?.length > 3 && (
                                                                                        <span className="team-avatar team-more">
                                                                                            +{project.team.length - 3}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="d-flex gap-2">
                                                                                    {Array.isArray(project.figmaLinks) && project.figmaLinks.length > 0 && (
                                                                                        <i className="bi bi-pencil-ruler text-secondary" style={{ fontSize: '12px' }} title="Figma Design"></i>
                                                                                    )}
                                                                                    {Array.isArray(project.documentLinks) && project.documentLinks.length > 0 && (
                                                                                        <i className="bi bi-file-earmark-text text-secondary" style={{ fontSize: '12px' }} title="Documents"></i>
                                                                                    )}
                                                                                    {Array.isArray(project.websites) && project.websites.length > 0 && (
                                                                                        <i className="bi bi-globe text-secondary" style={{ fontSize: '12px' }} title="Websites"></i>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
                                                            <i className="bi bi-box2 fs-2 mb-2 opacity-50"></i>
                                                            <p className="small mb-0">No data found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* List View matching Admin Task List */
                           <div className="task-list-wrapper">
    <table className="task-dashboard-table">
        <thead>
            <tr>
                <th>Project Name</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Team / Resources</th>
                <th>Status</th>
                <th>Time Left</th>
                <th className="text-center">Actions</th>
            </tr>
        </thead>

        <tbody>
            {filteredProjects.map((project) => {
                const daysInfo = getDaysLeft(project.end, project.projectStatus);

                return (
                    <tr
                        key={project._id}
                        className="task-row"
                        onClick={() => handleCardClick(project)}
                    >
                        <td>
                            <div className="task-title">
                                {project.name}
                            </div>

                            <small className="task-desc">
                                {project.description
                                    ? project.description.slice(0, 60)
                                    : "No description"}
                            </small>
                        </td>

                        <td>
                            {project.projectType}
                        </td>

                        <td>
                            {formatDate(project.start)}
                            {" - "}
                            {formatDate(project.end)}
                        </td>

                        <td>
                            <div className="team-members">
                                {(project.team || []).slice(0,3).map(member=>(
                                    <span
                                        key={member._id}
                                        className="team-avatar"
                                    >
                                        {member.name
                                            .split(" ")
                                            .map(i=>i[0])
                                            .join("")
                                            .slice(0,2)}
                                    </span>
                                ))}
                            </div>
                        </td>

                        <td>

                            <span
                                className={`status-pill ${
                                    project.projectStatus
                                        ?.toLowerCase()
                                }`}
                            >
                                {project.projectStatus}
                            </span>

                        </td>

                        <td>

                            <span
                                className="time-pill"
                                style={{
                                    background:daysInfo.bg,
                                    color:daysInfo.textColor
                                }}
                            >
                                {daysInfo.text}
                            </span>

                        </td>

                        <td className="text-center">

                            <button
                                className="details-btn"
                                onClick={(e)=>{
                                    e.stopPropagation();
                                    handleCardClick(project);
                                }}
                            >
                                <i className="bi bi-eye-fill"></i>

                                Details
                            </button>

                        </td>
                    </tr>
                );
            })}
        </tbody>
    </table>
</div>
                        )}
                    </div>
                </div>
            </main>

            {/* Project Details Modal */}
            <Modal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                size="lg"
                centered
                className="project-detail-modal"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="modal-title-custom">
                        <span className="modal-project-tag">{selectedProject?.projectType || 'Tech'}</span>
                        <h2>{selectedProject?.name}</h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {selectedProject && (
                        <div className="modal-body-layout">
                            <div className="modal-section description-sec">
                                <h5 className="section-title"><i className="bi bi-file-earmark-text"></i> Description</h5>
                                <p className="modal-desc-content">
                                    {selectedProject.description || 'No description available for this project.'}
                                </p>
                            </div>

                            <div className="modal-section grid-section">
                                <div className="modal-grid-item">
                                    <span className="grid-item-label">Status</span>
                                    <span className={`status-badge-pill ${selectedProject.projectStatus?.toLowerCase() || 'ongoing'}`}>
                                        {selectedProject.projectStatus || 'Ongoing'}
                                    </span>
                                </div>
                                <div className="modal-grid-item">
                                    <span className="grid-item-label">Start Date</span>
                                    <span className="grid-item-val">{formatDate(selectedProject.start)}</span>
                                </div>
                                <div className="modal-grid-item">
                                    <span className="grid-item-label">End Date</span>
                                    <span className="grid-item-val">{formatDate(selectedProject.end)}</span>
                                </div>
                             
                            </div>

                            {((selectedProject.figmaLinks && selectedProject.figmaLinks.length > 0) ||
                                (selectedProject.documentLinks && selectedProject.documentLinks.length > 0) ||
                                (selectedProject.websites && selectedProject.websites.length > 0)) && (
                                    <div className="modal-section links-sec">
                                        <h5 className="section-title"><i className="bi bi-link-45deg"></i> Resources & Links</h5>

                                        {/* Figma Links */}
                                        {selectedProject.figmaLinks && selectedProject.figmaLinks.length > 0 && (
                                            <div className="link-sub-section">
                                                <div className="sub-section-title"><i className="bi bi-pencil-ruler text-info"></i> Figma Designs</div>
                                                <div className="resource-links-grid">
                                                    {selectedProject.figmaLinks.map((link, idx) => (
                                                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="resource-link-card">
                                                            <span className="link-title">{link.title || 'Design Link'}</span>
                                                            <i className="bi bi-box-arrow-up-right link-go-icon"></i>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Document Links */}
                                        {selectedProject.documentLinks && selectedProject.documentLinks.length > 0 && (
                                            <div className="link-sub-section">
                                                <div className="sub-section-title"><i className="bi bi-file-earmark-text text-primary"></i> Document Links</div>
                                                <div className="resource-links-grid">
                                                    {selectedProject.documentLinks.map((link, idx) => (
                                                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="resource-link-card">
                                                            <span className="link-title">{link.title || 'Document Link'}</span>
                                                            <i className="bi bi-box-arrow-up-right link-go-icon"></i>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Websites with Credential Details */}
                                        {selectedProject.websites && selectedProject.websites.length > 0 && (
                                            <div className="link-sub-section">
                                                <div className="sub-section-title"><i className="bi bi-globe text-success"></i> Websites & Credentials</div>
                                                <div className="websites-credentials-wrapper">
                                                    {selectedProject.websites.map((web, idx) => (
                                                        <div key={idx} className="website-cred-card">
                                                            <div className="web-header">
                                                                <span className="web-title">{web.title}</span>
                                                                <a href={web.url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-success py-1 px-2" style={{ fontSize: '10px' }}>
                                                                    Visit <i className="bi bi-box-arrow-up-right ms-1"></i>
                                                                </a>
                                                            </div>
                                                            {web.creds && web.creds.map((cred, cIdx) => (
                                                                <div key={cIdx} className="cred-row mt-2">
                                                                    <span className="cred-role">{cred.role || 'Access'}:</span>
                                                                    <div className="cred-details">
                                                                        <div className="cred-field">
                                                                            <span className="field-label">User:</span>
                                                                            <span className="field-val">{cred.username}</span>
                                                                            <button className="btn btn-xs btn-link p-0 text-muted ms-1" onClick={() => handleCopy(cred.username, `user-${idx}-${cIdx}`)}>
                                                                                <i className={`bi ${showCopiedIndex === `user-${idx}-${cIdx}` ? 'bi-check2 text-success' : 'bi-clipboard'}`}></i>
                                                                            </button>
                                                                        </div>
                                                                        <div className="cred-field ms-3">
                                                                            <span className="field-label">Pass:</span>
                                                                            <span className="field-val">••••••••</span>
                                                                            <button className="btn btn-xs btn-link p-0 text-muted ms-1" onClick={() => handleCopy(cred.password, `pass-${idx}-${cIdx}`)}>
                                                                                <i className={`bi ${showCopiedIndex === `pass-${idx}-${cIdx}` ? 'bi-check2 text-success' : 'bi-clipboard'}`}></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                            {/* Tech Stack List */}
                            {Array.isArray(selectedProject.technology) && selectedProject.technology.length > 0 && (
                                <div className="modal-section tech-sec">
                                    <h5 className="section-title"><i className="bi bi-cpu"></i> Technologies</h5>
                                    <div className="tech-badge-container">
                                        {selectedProject.technology.map(t => (
                                            <span key={t._id} className="tech-badge large">{t.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {Array.isArray(selectedProject.team) && selectedProject.team.length > 0 && (
                                <div className="modal-section team-sec">
                                    <h5 className="section-title"><i className="bi bi-people"></i> Assigned Resources</h5>
                                    <div className="modal-team-list-grid">
                                        {selectedProject.team.map((member) => (
                                            <div key={member._id} className="team-member-item">
                                                <div className="team-member-avatar">
                                                    {member.name ? member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??'}
                                                </div>
                                                <div className="team-member-details">
                                                    <span className="team-member-name">{member.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" className="btn-modal-close" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Projects;
