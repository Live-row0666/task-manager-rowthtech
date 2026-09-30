import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/actions";

const CommonHeader = ({ title }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.Auth.user);

    const name = user?.username || user?.name || "LegalTech Client";
    const initials = name
        ? name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "LC"
        : "LC";

    const roleName = typeof user?.role === 'object' ? user?.role?.name : (user?.role || "Client");

    return (
        <header className="dash-header">
            <div className="header-page-title">
                <h3>{title}</h3>
            </div>

            <div className="header-actions">
                <button className="notification-btn" title="Notifications" type="button">
                    <i className="bi bi-bell"></i>
                    <span className="notification-badge"></span>
                </button>

                <div className="user-profile-card">
                    <div className="user-avatar-circle">
                        {initials}
                    </div>

                    <div className="user-profile-details">
                        <span className="user-profile-name">{name}</span>
                        <span className="user-profile-role">{roleName}</span>
                    </div>
                </div>

                <button
                    className="logout-btn-styled"
                    onClick={() => dispatch(logoutUser())}
                    title="Logout session"
                    type="button"
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default CommonHeader;