import ClientProjectTypes from './constant';

export const addClientProject = (data) => ({
    type: ClientProjectTypes.ADD_CLIENT_PROJECT,
    payload: data,
});

export const getClientProjects = (data) => ({
    type: ClientProjectTypes.GET_CLIENT_PROJECTS,
    payload: data,
});
