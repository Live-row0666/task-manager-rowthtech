// Utility functions for project selection persistence

export const getSelectedProject = () => {
    return sessionStorage.getItem('selectedProject');
};

export const setSelectedProject = (projectId) => {
    sessionStorage.setItem('selectedProject', projectId);
};

export const getProjectToSelect = (projects, savedProjectId) => {
    if (!projects || projects.length === 0) return null;
    
    const projectExists = savedProjectId && projects.find(p => p._id === savedProjectId);
    return projectExists ? savedProjectId : projects[0]._id;
};

export const clearSelectedProject = () => {
    sessionStorage.removeItem('selectedProject');
};