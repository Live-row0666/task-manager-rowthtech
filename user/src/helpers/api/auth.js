// @flow
import { APICore } from './apiCore';

const api = new APICore();

// account
// function login(params: any): any {
//     const baseUrl = '/login/';
//     return api.create(`${baseUrl}`, params);
// }
const baseurl = 'api/v1/user/auth'
function login(params: any): any {
    return api.create(`${baseurl}/login`, params);
}


function logout(): any {
    const baseUrl = '/logout/';
    // return api.create(`${baseUrl}`, {});
     return api.create(`${baseurl}/logout`, {});
}


function signup(params: any): any {
    const baseUrl = '/register/';
    return api.create(`${baseUrl}`, params);
}

function forgotPassword(params: any): any {
    const baseUrl = '/forget-password/';
    return api.create(`${baseUrl}`, params);
}

function forgotPasswordConfirm(params: any): any {
    const baseUrl = '/password/reset/confirm/';
    return api.create(`${baseUrl}`, params);
}

export { login, logout, signup, forgotPassword, forgotPasswordConfirm };
