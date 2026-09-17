import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { APICore } from '../helpers/api/apiCore';

type PrivateRouteProps = {
    component: React.ComponentType,
    roles?: string,
};

// const PrivateRoute = ({ component: RouteComponent, roles, ...rest }: PrivateRouteProps) => {
//     let location = useLocation();
//     const api = new APICore();
//     const loggedInUser = api.getLoggedInUser();

//     /**
//      * not logged in so redirect to login page with the return url
//      */
//     // if (api.isUserAuthenticated() === false) {
//     //     return <Navigate to={'/account/login'} state={{ from: location }} replace />;
//     // }

//     if (!api.isUserAuthenticated()) {
//         return <Navigate to="/account/login" state={{ from: location }} replace />;
//     }


//     // check if route is restricted by role
//     if (roles && roles.indexOf(loggedInUser.role) === -1) {
//         // role not authorised so redirect to home page
//         return <Navigate to={{ pathname: '/' }} />;
//     }

//     return (
//         <>
//             {/* <Suspense fallback={loading()}>
//                 <Topbar />
//             </Suspense> */}
//             <RouteComponent />;
//         </>
//     );
// };

const PrivateRoute = ({ component: RouteComponent, roles }: PrivateRouteProps) => {
    const location = useLocation();
    const api = new APICore();

    const [authChecked, setAuthChecked] = React.useState(false);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    React.useEffect(() => {
        const isAuth = api.isUserAuthenticated();
        setIsAuthenticated(isAuth);
        setAuthChecked(true);
    }, []);

    if (!authChecked) return null; // or a spinner

    if (!isAuthenticated) {
        return <Navigate to="/account/login" state={{ from: location }} replace />;
    }

    const loggedInUser = api.getLoggedInUser();

    if (roles && !roles.includes(loggedInUser.role)) {
        return <Navigate to="/" replace />;
    }

    return <RouteComponent />;
};

export default PrivateRoute;