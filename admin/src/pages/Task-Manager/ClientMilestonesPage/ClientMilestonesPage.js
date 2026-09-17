import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import moment from 'moment';
import { getClientProjects, getClientMilestones } from '../../../redux/actions';
import './ClientMilestonesPage.css';

const SS = {
    control: b => ({ ...b, minHeight: '32px', fontSize: '12px' }),
    valueContainer: b => ({ ...b, padding: '0 8px' }),
    input: b => ({ ...b, margin: 0, fontSize: '12px' }),
    singleValue: b => ({ ...b, fontSize: '12px' }),
    placeholder: b => ({ ...b, fontSize: '12px' }),
    option: b => ({ ...b, fontSize: '12px' }),
    indicatorsContainer: b => ({ ...b, height: '32px' }),
    menu: b => ({ ...b, zIndex: 9999 }),
};

const statusColor = {
    'Not Started': { bg: '#f1f3f5', text: '#6c757d', border: '#dee2e6' },
    'In Progress':  { bg: '#e7f3ff', text: '#0d6efd', border: '#b6d4fe' },
    'Completed':    { bg: '#e8f5e9', text: '#198754', border: '#a5d6a7' },
    'Delayed':      { bg: '#fff3cd', text: '#856404', border: '#ffe083' },
};

const ClientMilestonesPage = () => {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const store     = useSelector(s => s);

    const clientProjects   = store?.getClientProjectsReducer?.data?.data || [];
    const clientMilestones = store?.getClientMilestonesReducer?.data?.data || [];
    const loading          = store?.getClientMilestonesReducer?.loading;

    const [selProject, setSelProject] = useState(null);
    const [search,     setSearch]     = useState('');

    useEffect(() => {
        dispatch(getClientProjects({ page: 1, limit: 100 }));
    }, [dispatch]);

    const handleProjectChange = opt => {
        setSelProject(opt);
        if (opt?.value) {
            dispatch(getClientMilestones({ projectId: opt.value, page: 1, limit: 100 }));
        }
    };

    const filtered = clientMilestones.filter(m =>
        !search.trim() || m.title?.toLowerCase().includes(search.toLowerCase())
    );

    const projectOpts = clientProjects
        .filter(p => p?._id && p?.name)
        .map(p => ({ value: String(p._id), label: String(p.name) }));

    const calculateDaysLeft = endDate => {
        if (!endDate) return null;
        return moment(endDate).diff(moment(), 'days');
    };

    return (
        <div className="cmp-page">

            {/* Header */}
            <div className="cmp-header">
                <div>
                    <h4 className="cmp-title">Client Milestones</h4>
                    <p className="cmp-subtitle">Select a project to view its milestones</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="cmp-filter-card shadow-sm border-0 mb-3">
                <Card.Body className="cmp-filter-body">
                    <div className="cmp-filter-row">
                        <div className="cmp-select-wrap">
                            <Select
                                options={projectOpts}
                                value={selProject}
                                onChange={handleProjectChange}
                                onInputChange={v => v && dispatch(getClientProjects({ page: 1, limit: 100, search: v }))}
                                placeholder="Select Project..."
                                isClearable
                                isSearchable
                                styles={SS}
                            />
                        </div>
                        <div className="cmp-search-wrap">
                            <i className="bi bi-search cmp-search-icon" />
                            <input
                                type="text"
                                className="form-control cmp-search-input"
                                placeholder="Search milestones..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        {selProject && (
                            <small className="cmp-count text-muted ms-auto">
                                {filtered.length} milestone{filtered.length !== 1 ? 's' : ''}
                            </small>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Content */}
            {!selProject ? (
                <div className="cmp-empty">
                    <i className="uil-layers-alt cmp-empty-icon d-block" />
                    <p className="cmp-empty-text">Select a project to view milestones</p>
                </div>
            ) : loading ? (
                <div className="cmp-loading">
                    <div className="spinner-border text-dark" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="cmp-empty">
                    <i className="bi bi-inbox cmp-empty-icon d-block" />
                    <p className="cmp-empty-text">No milestones found</p>
                </div>
            ) : (
                <Row className="g-3">
                    {filtered.map(milestone => {
                        const days  = calculateDaysLeft(milestone.completionDate);
                        const style = statusColor[milestone.status] || statusColor['Not Started'];
                        return (
                            <Col key={milestone._id} xl={3} lg={4} md={6} sm={12}>
                                <div
                                    className="cmp-card"
                                    style={{ borderLeftColor: style.border }}
                                    onClick={() => navigate(`/dashboard/client-milestone-tasks/${milestone._id}?mName=${encodeURIComponent(milestone.title)}&pName=${encodeURIComponent(selProject.label)}`)}
                                >
                                    {/* Status badge */}
                                    <div className="cmp-card-top">
                                        <span className="cmp-badge"
                                            style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                                            {milestone.status}
                                        </span>
                                        <span className="cmp-priority-badge">
                                            {milestone.priority || 'Medium'}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h6 className="cmp-card-title">{milestone.title}</h6>

                                    {/* Dates */}
                                    <div className="cmp-dates">
                                        <span className="cmp-date-item">
                                            <i className="bi bi-calendar3 me-1" />
                                            {moment.utc(milestone.startDate).format('DD MMM YY')}
                                        </span>
                                        <span className="cmp-date-sep">→</span>
                                        <span className="cmp-date-item">
                                            {moment.utc(milestone.completionDate).format('DD MMM YY')}
                                        </span>
                                    </div>

                                    {/* Days left */}
                                    <div className="cmp-card-footer">
                                        <span className="cmp-days"
                                            style={{ background: days !== null && days < 0 ? '#dc3545' : '#8FD1A3', color: '#fff' }}>
                                            {days !== null ? (days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`) : 'N/A'}
                                        </span>
                                        <span className="cmp-goto">
                                            View Tasks <i className="bi bi-arrow-right ms-1" />
                                        </span>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
};

export default ClientMilestonesPage;
