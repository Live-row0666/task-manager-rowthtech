import { format } from 'date-fns';
import React, { useState } from 'react';
import { Accordion, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
    FiCalendar,
    FiUser,
    FiUsers,
    FiCode,
    FiClock,
    FiEdit,
    FiLayers,
    FiAward,
    FiSettings
} from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

const ProjectPreview = ({ closed = false }) => {
    const store = useSelector((state) => state);
    const [searchParams] = useSearchParams();
    const milestoneName = searchParams.get('mName');
    const sprintName = searchParams.get('sName');
    const projectData = store?.getProjectById?.data?.data;
    const [hoveredItem, setHoveredItem] = useState(null);
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'PP');
    };

    const renderArrayWithMore = (array, key, maxVisible = 1) => {
        if (!array || array.length === 0) return <span className="small text-muted">None</span>;

        if (array.length <= maxVisible) {
            return array.map((item, index) => (
                <div key={`${key}-${index}`} className="d-inline">
                    {item.name || item.email || item}
                    {index < array.length - 1 ? ', ' : ''}
                </div>
            ));
        }

        const visibleItems = array.slice(0, maxVisible);
        const remainingCount = array.length - maxVisible;
        const remainingItems = array.slice(maxVisible);

        return (
            <div className="d-inline">
                {visibleItems.map((item, index) => (
                    <span key={`${key}-${index}`}>
                        {item.name || item.email || item}
                        {index < visibleItems.length - 1 ? ', ' : ''}
                    </span>
                ))}
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id={`tooltip-${key}`}>
                            {remainingItems.map((item, index) => (
                                <div key={`remaining-${key}-${index}`}>
                                    {item.name || item.email || item}
                                </div>
                            ))}
                        </Tooltip>
                    }
                >
                    <span
                        className="text-primary cursor-pointer ms-1 hover-effect"
                        onMouseEnter={() => setHoveredItem(key)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        +{remainingCount} more
                    </span>
                </OverlayTrigger>
            </div>
        );
    };

    return (
        <div className="project-preview">
            <Accordion defaultActiveKey={closed ? '1' : "0"} flush>
                <Accordion.Item eventKey="0" className="border border-light mb-3 card-hover">
                    <Accordion.Header className="bg-white accordionHeader border-0">
                        <div className="d-flex align-items-center w-100">
                            <div className="icon-wrapper">
                                <FiLayers className="text-primary" size={22} />
                            </div>
                            <div className="flex-grow-1 text-black ms-3">
                                {projectData?.name ? (
                                    <>
                                        <span>{projectData.name}</span>
                                        {(milestoneName || sprintName) && <i className="bi bi-arrow-right mx-1"></i>}
                                    </>
                                ) : (
                                    <span>Untitled Project</span>
                                )}

                                {milestoneName && (
                                    <>
                                        <span>{milestoneName}</span>
                                        {sprintName && <i className="bi bi-arrow-right mx-1"></i>}
                                    </>
                                )}

                                {sprintName && <span>{sprintName}</span>}
                                <small className="text-muted d-flex align-items-center" style={{ marginTop: '3px' }}>
                                    <FiCalendar size={12} className="me-1" />
                                    {projectData?.start ? formatDate(projectData.start) : 'N/A'}
                                    &nbsp;–&nbsp;
                                    {projectData?.end ? formatDate(projectData.end) : 'Present'}
                                </small>
                            </div>
                            <span
                                className="py-1 fw-semibold rounded-1 me-2 icon-wrapper text-primary"
                                style={{ padding: '4px 16px', fontSize: '11px' }}
                            >
                                {projectData?.type || 'N/A'}
                            </span>
                            {/* <p
                                className="my-0 me-2 sideText text-white px-2 py-1  text-capitalize fw-light bg-dark"
                            >
                               
                            </p> */}
                        </div>
                    </Accordion.Header>
                    <Accordion.Body className=" bg-light pb-0 pt-2 px-2">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="info-card p-3 bg-white rounded-3 shadow-sm h-100 d-flex align-items-center">
                                    <FiUser size={18} className="me-2 text-primary" />
                                    <div>
                                        <p className="d-flex sideText fw-semibold align-items-center text-dark mb-0">
                                            <span>Client</span>
                                        </p>
                                        {projectData?.client?.length > 0 ? (
                                            <div className="content fw-normal text-dark">
                                                {renderArrayWithMore(projectData.client, 'clients')}
                                            </div>
                                        ) : (
                                            <div className="content text-muted">No clients assigned</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="info-card p-3 bg-white rounded-3 shadow-sm h-100 d-flex align-items-center">
                                    <FiUsers size={22} className="me-2 text-primary" />
                                    <div>
                                        {/* <p className="d-flex sideText fw-semibold align-items-center text-dark mb-1">
                                            <span>Team</span>
                                        </p> */}
                                        {projectData?.team?.length > 0 ? (
                                            <div className="content fw-normal text-dark">
                                                {renderArrayWithMore(projectData.team, 'team', 10)}
                                            </div>
                                        ) : (
                                            <div className="content text-muted">No team members assigned</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="info-card p-3 bg-white rounded-3 shadow-sm h-100 d-flex align-items-center">
                                    <FiSettings size={18} className="me-2 text-primary" />
                                    <div>
                                        {/* <p className="d-flex sideText fw-semibold align-items-center text-dark mb-1">
                                            <span>Technologies</span>
                                        </p> */}
                                        <div className="content fw-normal text-dark">
                                            {projectData?.technology?.length > 0 ? (
                                                <div className="d-flex flex-wrap gap-2">
                                                    {renderArrayWithMore(projectData.technology, 'tech', 10)}
                                                </div>
                                            ) : (
                                                <span className="text-muted">No technologies specified</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 mt-2 ">
                                <div className="d-flex justify-content-between text-muted py-2 p-0 border-top">
                                    <span className="d-flex align-items-center timestamp">
                                        <FiClock size={14} className="me-2" />
                                        Created: {formatDate(projectData?.createdAt)}
                                    </span>
                                    <span className="d-flex align-items-center timestamp">
                                        <FiEdit size={14} className="me-2" />
                                        Updated: {formatDate(projectData?.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <style jsx>{`
                .project-preview {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }
                    .sideText{
                    font-size: 0.8375rem;
                    }
                .accordion-button:not(.collapsed) {
                    background-color: white;
                    box-shadow: none;
                    min-height: 36px;
                    padding: 0.3rem 1rem;
                }
                .accordion-button {
                    min-height: 36px;
                    padding: 0.3rem 1rem;
                }
                .accordion-button:focus {
                    box-shadow: none;
                    border-color: transparent;
                }
                .accordion-item {
                    border-radius: 8px !important;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    margin-bottom: 0.7rem !important;
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                .icon-wrapper {
                    background: rgba(13, 110, 253, 0.08);
                    padding: 7px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .info-card {
                    transition: all 0.3s ease;
                    padding: 0.8rem 0.7rem !important;
                }
                .info-card:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
                }
                .hover-effect:hover {
                    text-decoration: underline;
                    opacity: 0.8;
                }
                .timestamp {
                    font-size: 0.78rem;
                    opacity: 0.8;
                }
                .content {
                    font-size: 0.75rem;
                    font-weight: 600;
                }
               
                .project-preview .d-flex.align-items-center.w-100 {
                    min-height: 36px;
                }
                .project-preview .p-4 {
                    padding: 1.1rem !important;
                }
                .project-preview .p-3 {
                    padding: 0.7rem !important;
                }
                .project-preview .mb-0 {
                    margin-bottom: 0 !important;
                }
                .project-preview .mb-3 {
                    margin-bottom: 0.5rem !important;
                }
                .project-preview .ms-3 {
                    margin-left: 0.7rem !important;
                }
                .project-preview .ms-2 {
                    margin-left: 0.5rem !important;
                }
                .project-preview .me-1 {
                    margin-right: 0.3rem !important;
                }
                .project-preview .gap-2 {
                    gap: 0.3rem !important;
                }
                .project-preview .rounded-3 {
                    border-radius: 7px !important;
                }
            `}</style>
        </div>
    );
};

export default ProjectPreview;
