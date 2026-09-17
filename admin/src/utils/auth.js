import { APICore } from '../helpers/api/apiCore';

export const checkAuthStatus = () => {
    const api = new APICore();
    return api.isUserAuthenticated();
};

export const getCurrentUser = () => {
    const api = new APICore();
    return api.getLoggedInUser();
};

export const clearAuthData = () => {
    const api = new APICore();
    api.setLoggedInUser(null);
    localStorage.removeItem('hyper_user');
    localStorage.removeItem('hyper_user');
    localStorage.removeItem('roleId');
};