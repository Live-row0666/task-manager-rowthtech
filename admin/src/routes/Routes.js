import { BrowserRouter } from 'react-router-dom';
import { AllRoutes } from './index';
import NetworkHandler from '../components/NetworkHandler';

const Routes = () => {
    return (
        <BrowserRouter>
            <NetworkHandler>
                <AllRoutes />
            </NetworkHandler>
        </BrowserRouter>
    );
};

export default Routes;
