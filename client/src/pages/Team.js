import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard } from '../redux/actions';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import './Dashboard.css';

const Team = () => {
    const dispatch = useDispatch();
    const { dashboard } = useSelector((state) => ({
        dashboard: state.Auth.dashboard,
    }));

    const [search, setSearch] = useState('');

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    const team = dashboard?.team || [];
    const technologies = dashboard?.project?.technology || [];
    const projectName = dashboard?.project?.name || 'Client Project';

    const getRoleBadgeColor = (title) => {
        const lower = (title || '').toLowerCase();
        if (lower.includes('manager') || lower.includes('lead')) return 'bg-primary text-white';
        if (lower.includes('backend') || lower.includes('node') || lower.includes('python')) return 'bg-info text-dark';
        if (lower.includes('frontend') || lower.includes('react') || lower.includes('ui')) return 'bg-purple text-white';
        if (lower.includes('qa') || lower.includes('test')) return 'bg-success text-white';
        return 'bg-light text-dark border';
    };

    const filteredTeam = team.filter(m => {
        const name = m.name || m.username || '';
        const desig = m.designation?.name || m.role?.name || '';
        return name.toLowerCase().includes(search.toLowerCase()) || desig.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="team" />

            <main className="dash-main">
                <CommonHeader title="Assigned Team" />

                <div className="overview-heading-row mb-4 flex-wrap gap-3">
                    <div className="overview-title-section">
                        <h3>Project Team & Technology Stack</h3>
                        <p className="mb-2">Dedicated engineers and specialists working on <strong>{projectName}</strong>.</p>

                        {/* Technology Stack Badges */}
                        {technologies.length > 0 && (
                            <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                                <span className="small text-muted fw-bold me-1">TECH STACK:</span>
                                {technologies.map((t, i) => (
                                    <span key={t._id || i} className="badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill">
                                        <i className="bi bi-cpu text-primary me-1"></i> {t.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="search-box ms-auto" style={{ minWidth: '240px' }}>
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Search team member or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Team Members Grid */}
                <div className="row g-4">
                    {filteredTeam.length > 0 ? (
                        filteredTeam.map((member, idx) => {
                            const name = member.name || member.username || 'Team Member';
                            const designationName = typeof member.designation === 'string'
                                ? member.designation
                                : (member.designation?.name || member.role?.name || 'Software Engineer');

                            const initials = name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2);

                            const gradients = [
                                'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                            ];
                            const avatarBg = gradients[idx % gradients.length];

                            return (
                                <div className="col-md-4 col-lg-3" key={member._id || idx}>
                                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center h-100 position-relative hover-top">
                                        <div
                                            className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mb-3 shadow"
                                            style={{
                                                width: '68px',
                                                height: '68px',
                                                fontSize: '22px',
                                                background: avatarBg,
                                            }}
                                        >
                                            {initials}
                                        </div>
                                        <h5 className="fw-bold mb-1 text-dark" style={{ fontSize: '16px' }}>{name}</h5>

                                        <div className="mb-3">
                                            <span className={`badge px-3 py-2 rounded-pill font-semibold ${getRoleBadgeColor(designationName)}`}>
                                                {designationName}
                                            </span>
                                        </div>
                                        <div className="mt-auto pt-2 border-top">
                                            <a
                                                href={`mailto:${member.email}`}
                                                className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1"
                                                title="Send email"
                                            >
                                                <i className="bi bi-envelope text-primary"></i>
                                                <span className="text-truncate" style={{ maxWidth: '180px' }}>{member.email}</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-12 text-center py-5 text-muted">
                            <i className="bi bi-people display-4 text-secondary mb-3 d-block"></i>
                            <h5>No team members matching your search</h5>
                            <p className="small">Try searching with a different name or role title.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Team;
