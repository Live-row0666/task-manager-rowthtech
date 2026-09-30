import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo/logo.webp";

const CommonSidebar = ({ active }) => {
    const location = useLocation();

    const closeMobileSidebar = () => {
        document.body.classList.remove('sidebar-mobile-open');
    };

    // Auto-close mobile sidebar whenever route changes
    useEffect(() => {
        closeMobileSidebar();
    }, [location.pathname]);

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            <div
                className="sidebar-mobile-backdrop"
                onClick={closeMobileSidebar}
                aria-hidden="true"
            />

            <aside className="dash-sidebar">
                <div className="sidebar-logo">
                    <Link to="/dashboard" onClick={closeMobileSidebar} className="d-flex align-items-center">
                        <img src={Logo} alt="RowthTech" />
                    </Link>

                    {/* Mobile Close Button */}
                    <button
                        type="button"
                        className="btn-sidebar-close-mobile"
                        onClick={closeMobileSidebar}
                        title="Close menu"
                        aria-label="Close navigation"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <Link
                            to="/dashboard"
                            className={`menu-item-link ${active === "dashboard" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-grid-fill"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/projects"
                            className={`menu-item-link ${active === "projects" || active === "myprojects" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-folder2"></i>
                            <span>My Project</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/milestones"
                            className={`menu-item-link ${active === "milestones" || active === "milestone-task" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-flag"></i>
                            <span>Milestones</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/documents"
                            className={`menu-item-link ${active === "documents" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-file-earmark-text"></i>
                            <span>Documents</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/reports"
                            className={`menu-item-link ${active === "reports" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-bar-chart"></i>
                            <span>Reports</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/team"
                            className={`menu-item-link ${active === "team" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-people"></i>
                            <span>Team</span>
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/dashboard/support"
                            className={`menu-item-link ${active === "support" ? "active" : ""}`}
                            onClick={closeMobileSidebar}
                        >
                            <i className="bi bi-headset"></i>
                            <span>Support</span>
                        </Link>
                    </li>
                </ul>

                <div className="sidebar-help-card">
                    <div className="help-icon-wrapper">
                        <i className="bi bi-question-circle"></i>
                    </div>

                    <h6>Need Help?</h6>
                    <p>Our support team is here to help you.</p>

                    <Link
                        to="/dashboard/support"
                        className="btn-contact-support text-decoration-none d-block text-center"
                        onClick={closeMobileSidebar}
                    >
                        Contact Support
                    </Link>
                </div>

                <div className="sidebar-footer">
                    © 2025 RowthTech Limited.
                    <br />
                    All rights reserved.
                </div>
            </aside>
        </>
    );
};

export default CommonSidebar;