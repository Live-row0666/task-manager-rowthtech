import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo/logo.webp";

const CommonSidebar = ({ active }) => {
    return (
        <aside className="dash-sidebar">

            <div className="sidebar-logo">
                <img src={Logo} alt="RowthTech" />
             
            </div>

            <ul className="sidebar-menu">

                <li>
                    <Link
                        to="/dashboard"
                        className={`menu-item-link ${active === "dashboard" ? "active" : ""}`}
                    >
                        <i className="bi bi-grid-fill"></i>
                        <span>Dashboard</span>
                    </Link>
                </li>

                <li>
                    <Link
                        to="/dashboard/projects"
                        className={`menu-item-link ${active === "projects" ? "active" : ""}`}
                    >
                        <i className="bi bi-folder2"></i>
                        <span>My Project</span>
                    </Link>
                </li>

                <li>
                    <Link
                        to="/dashboard/milestones"
                        className={`menu-item-link ${active === "milestones" ? "active" : ""}`}
                    >
                        <i className="bi bi-flag"></i>
                        <span>Milestones</span>
                    </Link>
                </li>

                <li>
                    <Link
                        to="/dashboard/documents"
                        className={`menu-item-link ${active === "documents" ? "active" : ""}`}
                    >
                        <i className="bi bi-file-earmark-text"></i>
                        <span>Documents</span>
                    </Link>
                </li>

                <li>
                    <Link
                        to="/dashboard/reports"
                        className={`menu-item-link ${active === "reports" ? "active" : ""}`}
                    >
                        <i className="bi bi-bar-chart"></i>
                        <span>Reports</span>
                    </Link>
                </li>

                <li>
                    <Link
                        to="/dashboard/team"
                        className={`menu-item-link ${active === "team" ? "active" : ""}`}
                    >
                        <i className="bi bi-people"></i>
                        <span>Team</span>
                    </Link>
                </li>

                <li>
                    <Link
                        to="/dashboard/support"
                        className={`menu-item-link ${active === "support" ? "active" : ""}`}
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

                <button className="btn-contact-support">
                    Contact Support
                </button>
            </div>

            <div className="sidebar-footer">
                © 2025 RowthTech Limited.
                <br />
                All rights reserved.
            </div>

        </aside>
    );
};

export default CommonSidebar;