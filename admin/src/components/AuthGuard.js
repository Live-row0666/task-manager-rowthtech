import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const AuthGuard = ({ children, roles = [] }) => {
    const { isAuthenticated, user, isInitialized } = useAuth();
    const location = useLocation();

    // Show loader while initializing
    if (!isInitialized) {
        return <Loader fullScreen />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/account/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (roles.length > 0 && user) {
        const userRole = user.role;
        if (!userRole || !roles.includes(userRole)) {
            return <Navigate to="/dashboard/analytics" replace />;
        }
    }

    return children;
};

export default AuthGuard;