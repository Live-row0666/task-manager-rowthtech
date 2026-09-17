import { Navigate } from 'react-router-dom';

const Root = () => {

    const getRootUrl = () => {
        return "dashboard/projects"
    }
    const url = getRootUrl();
    return <Navigate to={`/${url}`} />;
};

export default Root;
