import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import config from '../../config';
import { toast } from 'react-toastify';

// content type
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.baseURL = config.API_URL;

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!navigator.onLine) {
            window.location.href = "/no-internet";
            return Promise.reject("No internet connection");
        }
        if (!error.response) {
            return Promise.reject(error.message || 'An unexpected error occurred.');
        }
        const { status, data } = error.response;
        let message;
        switch (status) {
            case 400:
                message = data?.message || data?.error || 'Invalid credentials';
                break;
            case 401:
                message = data?.message || 'Unauthorized access';
                break;
            case 403:
                message = data?.message || 'Access Forbidden';
                break;
            case 404:
                message = data?.message || 'Sorry! The data you are looking for could not be found.';
                break;
            case 500:
                message = data?.message || 'Internal server error';
                break;
            default:
                message = data?.message || error.message || 'An unknown error occurred.';
        }

        return Promise.reject(message);
    }
);

const AUTH_SESSION_KEY = 'hyper_user';

/**
* Sets the default authorization
* @param {*} token
*/
const setAuthorization = (token) => {
    if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    else delete axios.defaults.headers.common['Authorization'];
};

const getUserFromSession = () => {
    const user = localStorage.getItem(AUTH_SESSION_KEY);
    if (!user) return null;
    
    try {
        return JSON.parse(user);
    } catch (error) {
        console.warn('Invalid session data found, clearing localStorage');
        localStorage.removeItem(AUTH_SESSION_KEY);
        return null;
    }
};

class APICore {
    get = (url, params) => {
        let response;
        if (params) {
            var queryString = params
                ? Object.keys(params)
                    .map((key) => key + '=' + params[key])
                    .join('&')
                : '';
            response = axios.get(`${url}?${queryString}`, params);
        } else {
            response = axios.get(`${url}`, params);
        }
        return response;
    };

    getFile = (url, params) => {
        let response;
        if (params) {
            var queryString = params
                ? Object.keys(params)
                    .map((key) => key + '=' + params[key])
                    .join('&')
                : '';
            response = axios.get(`${url}?${queryString}`, { responseType: 'blob' });
        } else {
            response = axios.get(`${url}`, { responseType: 'blob' });
        }
        return response;
    };

    create = (url, data) => {
        return axios.post(url, data);
    };

    createWithFormData = (url, data) => {
        return axios.post(url, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    updatePatch = (url, data) => {
        return axios.patch(url, data);
    };

    update = (url, data) => {
        return axios.put(url, data);
    };

    updateWithFormData = (url, data) => {
        return axios.put(url, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    };

    delete = (url) => {
        return axios.delete(url);
    };

    isUserAuthenticated = () => {
        const user = this.getLoggedInUser();
        if (!user || (user && !user.token)) {
            return false;
        }
        const decoded = jwtDecode(user.token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.warn('Access token expired !');
            toast.error('Your session has expired. Redirecting you to the login page.');
            localStorage.removeItem(AUTH_SESSION_KEY);
            localStorage.clear();
            window.location.href = '/account/login';
            return false;
        } else {
            return true;
        }
    };

    setLoggedInUser = (session) => {
        if (session) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
        else {
            localStorage.removeItem(AUTH_SESSION_KEY);
        }
    };

    getLoggedInUser = () => {
        return getUserFromSession();
    };

    setUserInSession = (modifiedUser) => {
        let userInfo = localStorage.getItem(AUTH_SESSION_KEY);
        if (userInfo) {
            const { token, user } = JSON.parse(userInfo);
            this.setLoggedInUser({ token, ...user, ...modifiedUser });
        }
    };
}

let user = getUserFromSession();
if (user) {
    const { token } = user;
    if (token) {
        setAuthorization(token);
    }
}

export { APICore, setAuthorization, getUserFromSession };
