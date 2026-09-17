// @flow
import React, { useEffect } from 'react';
import Routes from './routes/Routes';
import FloatingScreenCapture from './components/FloatingScreenCapture';
import { initDevToolsProtection } from './utils/devToolsProtection';

// setup fake backend
import { configureFakeBackend } from './helpers';


// For Saas import Saas.scss
import './assets/scss/Saas.scss';

configureFakeBackend();

type AppProps = {};

/**
 * Main app component
 */
const App = (props: AppProps): React$Element<any> => {
    useEffect(() => {
        // Initialize developer tools protection
        initDevToolsProtection();
    }, []);

    return (
        <>
            <Routes />
            <FloatingScreenCapture />
        </>
    );
};

export default App;
