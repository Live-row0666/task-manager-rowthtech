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

                <button className="notification-btn">
                    <i className="bi bi-bell"></i>
                    <span className="notification-badge"></span>
                </button>

                <div className="user-profile-widget">
                    <div className="user-avatar-circle">
                        {initials}
                    </div>

                    <div className="user-profile-details">
                        <span className="user-profile-name">
                            {name}
                        </span>

                        <span className="user-profile-role">
                            {user?.role || "Client"}
                        </span>
                    </div>
                </div>

                <button
                    className="btn btn-outline-danger btn-sm ms-logout-btn"
                    onClick={() => dispatch(logoutUser())}
                >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                </button>

            </div>
        </header>
    );
};

export default CommonHeader;