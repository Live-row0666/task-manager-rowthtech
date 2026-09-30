import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboard } from '../redux/actions';
import CommonHeader from '../components/commonHeader';
import CommonSidebar from '../components/commonSidebar';
import './Dashboard.css';
import './Team.css';

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

const Team = () => {
    const dispatch = useDispatch();
    const { dashboard } = useSelector((state) => ({
        dashboard: state.Auth.dashboard,
    }));

    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'engineering' | 'qa' | 'management'
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const projectDropdownRef = useRef(null);

    useEffect(() => {
        dispatch(getDashboard());
    }, [dispatch]);

    useEffect(() => {
        if (selectedProjectId) {
            dispatch(getDashboard(selectedProjectId));
        }
    }, [selectedProjectId, dispatch]);

    const projects = useMemo(() => dashboard?.projects || [], [dashboard?.projects]);

    useEffect(() => {
        if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0]._id);
        }
    }, [projects, selectedProjectId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
                setIsProjectDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentProject = projects.find(p => p._id === selectedProjectId) || dashboard?.project;
    const team = useMemo(() => dashboard?.team || [], [dashboard?.team]);
    const technologies = useMemo(() => dashboard?.project?.technology || [], [dashboard?.project?.technology]);
    const projectName = currentProject?.name || 'Active Project';

    // Categorization helper
    const getMemberCategory = (member) => {
        const designation = (
            typeof member.designation === 'string'
                ? member.designation
                : (member.designation?.name || member.role?.name || '')
        ).toLowerCase();

        if (designation.includes('qa') || designation.includes('test') || designation.includes('quality')) {
            return 'qa';
        }
        if (designation.includes('manager') || designation.includes('lead') || designation.includes('product') || designation.includes('scrum')) {
            return 'management';
        }
        return 'engineering';
    };

    const getRoleBadgeStyle = (designationName) => {
        const lower = (designationName || '').toLowerCase();
        if (lower.includes('manager') || lower.includes('product') || lower.includes('lead')) {
            return { className: 'member-role-badge role-badge-mgmt', icon: 'bi-briefcase-fill' };
        }
        if (lower.includes('qa') || lower.includes('test') || lower.includes('quality')) {
            return { className: 'member-role-badge role-badge-qa', icon: 'bi-shield-check' };
        }
        if (lower.includes('flutter') || lower.includes('mobile') || lower.includes('ios') || lower.includes('android')) {
            return { className: 'member-role-badge role-badge-mobile', icon: 'bi-phone-fill' };
        }
        if (lower.includes('backend') || lower.includes('node') || lower.includes('python') || lower.includes('devops')) {
            return { className: 'member-role-badge role-badge-be', icon: 'bi-hdd-stack-fill' };
        }
        if (lower.includes('frontend') || lower.includes('react') || lower.includes('ui') || lower.includes('web')) {
            return { className: 'member-role-badge role-badge-fe', icon: 'bi-code-slash' };
        }
        return { className: 'member-role-badge role-badge-general', icon: 'bi-person-badge' };
    };

    // Filter team members
    const filteredTeam = useMemo(() => {
        return team.filter((m) => {
            const name = (m.name || m.username || '').toLowerCase();
            const desig = (
                typeof m.designation === 'string'
                    ? m.designation
                    : (m.designation?.name || m.role?.name || '')
            ).toLowerCase();

            const matchesSearch = !search.trim() || 
                name.includes(search.toLowerCase()) || 
                desig.includes(search.toLowerCase());

            const category = getMemberCategory(m);
            const matchesRole = roleFilter === 'all' || category === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [team, search, roleFilter]);

    // Statistics
    const totalTeamCount = team.length;
    const engineeringCount = team.filter(m => getMemberCategory(m) === 'engineering').length;
    const qaCount = team.filter(m => getMemberCategory(m) === 'qa').length;
    const managementCount = team.filter(m => getMemberCategory(m) === 'management').length;

    const gradients = [
        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
        'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)',
        'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    ];

    return (
        <div className="dashboard-wrapper">
            <CommonSidebar active="team" />

            <main className="dash-main">
                <CommonHeader title="Assigned Team" />

                {/* Hero Header Section */}
                <div className="team-hero-bar">
                    <div className="team-hero-left">
                        <div className="team-badge-tag">
                            <i className="bi bi-people-fill"></i>
                            Engineering & Talent Roster
                        </div>
                        <h2 className="team-hero-title">Project Team & Technology Stack</h2>
                        <p className="team-hero-subtitle">
                            Dedicated engineers, quality specialists, and product managers driving deliverables for <strong>{projectName}</strong>.
                        </p>

                        <div className="team-meta-chips">
                            <div className="team-meta-chip">
                                <i className="bi bi-folder2-open"></i>
                                <span>{projectName}</span>
                            </div>
                            <div className="team-meta-chip">
                                <i className="bi bi-person-check-fill text-success"></i>
                                <span>{totalTeamCount} Dedicated Specialists</span>
                            </div>
                            {technologies.map((t, i) => (
                                <div key={t._id || i} className="team-meta-chip team-tech-chip">
                                    <i className="bi bi-cpu"></i>
                                    <span>{t.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="team-hero-actions">
                        {/* Project Switcher Dropdown */}
                        {projects.length > 0 && (
                            <div className="project-dropdown-wrapper" ref={projectDropdownRef}>
                                <button
                                    type="button"
                                    className={`project-dropdown-trigger ${isProjectDropdownOpen ? 'active' : ''}`}
                                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                    title="Switch active project team"
                                >
                                    <div className="project-trigger-left">
                                        <i className="bi bi-briefcase-fill project-trigger-icon"></i>
                                        <span className="project-trigger-name">
                                            {projectName}
                                        </span>
                                    </div>
                                    <i className={`bi bi-chevron-down project-trigger-chevron ${isProjectDropdownOpen ? 'open' : ''}`}></i>
                                </button>

                                {isProjectDropdownOpen && (
                                    <div className="project-dropdown-menu">
                                        <div className="project-dropdown-header">
                                            <span>Switch Project Team</span>
                                        </div>
                                        <div className="project-dropdown-list">
                                            {projects.map((p) => {
                                                const isSelected = p._id === selectedProjectId;
                                                return (
                                                    <div
                                                        key={p._id}
                                                        className={`project-dropdown-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => {
                                                            setSelectedProjectId(p._id);
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

                        <button 
                            type="button" 
                            className="btn-team-action" 
                            onClick={() => dispatch(getDashboard(selectedProjectId))}
                            title="Refresh team roster"
                        >
                            <i className="bi bi-arrow-clockwise"></i>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* 4 Executive KPI Cards */}
                <div className="team-kpi-grid">
                    {/* Card 1: Team Strength */}
                    <div className="team-kpi-card">
                        <div className="team-kpi-top">
                            <span className="team-kpi-label">Team Strength</span>
                            <div className="team-kpi-icon team-icon-indigo">
                                <i className="bi bi-people-fill"></i>
                            </div>
                        </div>
                        <div className="team-kpi-main">
                            <span className="team-kpi-val text-primary">
                                <CountUp end={totalTeamCount} />
                            </span>
                            <span className="team-kpi-tag tag-indigo">Allocated</span>
                        </div>
                        <span className="team-kpi-sub">
                            Active talent assigned to project
                        </span>
                    </div>

                    {/* Card 2: Software Engineers */}
                    <div className="team-kpi-card">
                        <div className="team-kpi-top">
                            <span className="team-kpi-label">Engineering</span>
                            <div className="team-kpi-icon team-icon-sky">
                                <i className="bi bi-code-square"></i>
                            </div>
                        </div>
                        <div className="team-kpi-main">
                            <span className="team-kpi-val text-info">
                                <CountUp end={engineeringCount} />
                            </span>
                            <span className="team-kpi-tag tag-sky">Devs</span>
                        </div>
                        <span className="team-kpi-sub">
                            Frontend, Backend & Mobile
                        </span>
                    </div>

                    {/* Card 3: QA & Testing */}
                    <div className="team-kpi-card">
                        <div className="team-kpi-top">
                            <span className="team-kpi-label">QA & Testing</span>
                            <div className="team-kpi-icon team-icon-emerald">
                                <i className="bi bi-shield-check"></i>
                            </div>
                        </div>
                        <div className="team-kpi-main">
                            <span className="team-kpi-val text-success">
                                <CountUp end={qaCount} />
                            </span>
                            <span className="team-kpi-tag tag-emerald">Quality</span>
                        </div>
                        <span className="team-kpi-sub">
                            Test automation & verification
                        </span>
                    </div>

                    {/* Card 4: Tech Stack Count */}
                    <div className="team-kpi-card">
                        <div className="team-kpi-top">
                            <span className="team-kpi-label">Core Tech Stack</span>
                            <div className="team-kpi-icon team-icon-purple">
                                <i className="bi bi-cpu-fill"></i>
                            </div>
                        </div>
                        <div className="team-kpi-main">
                            <span className="team-kpi-val text-dark">
                                <CountUp end={technologies.length} />
                            </span>
                            <span className="team-kpi-tag tag-purple">Frameworks</span>
                        </div>
                        <span className="team-kpi-sub">
                            {technologies.map(t => t.name).join(', ') || 'Modern Stack'}
                        </span>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="team-toolbar-card">
                    <div className="team-toolbar-left">
                        <h3 className="team-toolbar-title">Assigned Members</h3>
                        <span className="team-count-badge">
                            {filteredTeam.length} of {totalTeamCount} Members
                        </span>
                    </div>

                    <div className="team-toolbar-controls">
                        {/* Role Filter Tabs */}
                        <div className="team-filter-tabs">
                            <button
                                type="button"
                                className={`team-filter-btn ${roleFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('all')}
                            >
                                <span>All</span>
                                <span className="team-filter-count">{totalTeamCount}</span>
                            </button>
                            <button
                                type="button"
                                className={`team-filter-btn ${roleFilter === 'engineering' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('engineering')}
                            >
                                <span>Engineering</span>
                                <span className="team-filter-count">{engineeringCount}</span>
                            </button>
                            <button
                                type="button"
                                className={`team-filter-btn ${roleFilter === 'qa' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('qa')}
                            >
                                <span>QA & Testing</span>
                                <span className="team-filter-count">{qaCount}</span>
                            </button>
                            {managementCount > 0 && (
                                <button
                                    type="button"
                                    className={`team-filter-btn ${roleFilter === 'management' ? 'active' : ''}`}
                                    onClick={() => setRoleFilter('management')}
                                >
                                    <span>Management</span>
                                    <span className="team-filter-count">{managementCount}</span>
                                </button>
                            )}
                        </div>

                        {/* Search Box */}
                        <div className="team-search-box">
                            <i className="bi bi-search team-search-icon"></i>
                            <input
                                type="text"
                                className="team-search-input"
                                placeholder="Search member or role..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="team-search-clear"
                                    onClick={() => setSearch('')}
                                    title="Clear search"
                                >
                                    <i className="bi bi-x-circle-fill"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Members Grid */}
                {filteredTeam.length > 0 ? (
                    <div className="team-members-grid">
                        {filteredTeam.map((member, idx) => {
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

                            const avatarBg = gradients[idx % gradients.length];
                            const badgeConfig = getRoleBadgeStyle(designationName);

                            return (
                                <div className="member-profile-card" key={member._id || idx}>
                                    <div className="member-avatar-wrap">
                                        <div
                                            className="member-avatar"
                                            style={{ background: avatarBg }}
                                        >
                                            {initials}
                                        </div>
                                        <span className="member-status-dot" title="Active"></span>
                                    </div>

                                    <h4 className="member-name">{name}</h4>

                                    <div className={badgeConfig.className}>
                                        <i className={`bi ${badgeConfig.icon}`}></i>
                                        <span>{designationName}</span>
                                    </div>

                                    <div className="member-footer-strip">
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="member-email-link"
                                            title={`Send email to ${member.email}`}
                                        >
                                            <i className="bi bi-envelope-fill"></i>
                                            <span>{member.email}</span>
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="team-empty-state">
                        <div className="team-empty-icon-wrap">
                            <i className="bi bi-people"></i>
                        </div>
                        <h4 className="team-empty-title">No Team Members Found</h4>
                        <p className="team-empty-desc">
                            {search || roleFilter !== 'all'
                                ? "No team members matched your active search query or role filter."
                                : "No team members are currently assigned to this project."}
                        </p>
                        {(search || roleFilter !== 'all') && (
                            <button
                                type="button"
                                className="btn-team-action"
                                onClick={() => {
                                    setSearch('');
                                    setRoleFilter('all');
                                }}
                            >
                                <i className="bi bi-arrow-counterclockwise"></i>
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Team;
