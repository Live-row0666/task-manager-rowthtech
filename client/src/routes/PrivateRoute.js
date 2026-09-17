import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { APICore } from '../helpers/api/apiCore';

const PrivateRoute = ({ component: RouteComponent, roles }) => {
    const location = useLocation();
    const api = new APICore();
    
    // Subscribe to Redux state for automatic reactive redirects on logout/login
    const { user } = useSelector((state) => state.Auth);

    const isAuthenticated = api.isUserAuthenticated();

    if (!isAuthenticated || !user) {
        return <Navigate to="/account/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/account/login" replace />;
    }

    return <RouteComponent />;
};

export default PrivateRoute;
