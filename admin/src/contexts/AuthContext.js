import React, { createContext, useContext, useEffect, useState } from 'react';
import { APICore } from '../helpers/api/apiCore';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const api = new APICore();

    useEffect(() => {
        const initAuth = () => {
            const loggedUser = api.getLoggedInUser();
            if (loggedUser && api.isUserAuthenticated()) {
                setUser(loggedUser);
                setIsAuthenticated(true);
            }
            setIsInitialized(true);
        };
        initAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        api.setLoggedInUser(null);
        localStorage.clear();
        localStorage.clear();
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isInitialized,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};