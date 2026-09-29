import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/actions";

const CommonHeader = ({ title }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.Auth.user);

    const name = user?.username || "Client";
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="dash-header">
            <div className="header-page-title">
                <h3>{title}</h3>
            </div>

            <div className="header-actions">
                <button className="notification-btn" title="Notifications">
                    <i className="bi bi-bell"></i>
                    <span className="notification-badge"></span>
                </button>

                <div className="user-profile-card">
                    <div className="user-avatar-circle">
                        {initials}
                    </div>

                    <div className="user-profile-details">
                        <span className="user-profile-name">{name}</span>
                        <span className="user-profile-role">
                            {typeof user?.role === 'object' ? user?.role?.name : (user?.role || "Client Portal")}
                        </span>
                    </div>
                </div>

                <button
                    className="logout-btn-styled"
                    onClick={() => dispatch(logoutUser())}
                    title="Logout session"
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default CommonHeader;