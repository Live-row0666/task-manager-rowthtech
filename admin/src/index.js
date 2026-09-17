// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import './global.css';
// import './i18n';

// import App from './App';

// import { Provider } from 'react-redux';
// import { configureStore } from './redux/store';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Early protection - only in production
// // if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
// //     console.clear();
// //     // Disable drag and drop
// //     document.addEventListener('dragstart', (e) => e.preventDefault());
// //     document.addEventListener('drop', (e) => e.preventDefault());
// //     document.addEventListener('dragover', (e) => e.preventDefault());

// //     // Immediate keyboard blocking
// //     document.addEventListener('keydown', (e) => {
// //         if (e.keyCode === 123 || 
// //             (e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
// //             (e.ctrlKey && e.shiftKey && e.keyCode === 74) || 
// //             (e.ctrlKey && e.keyCode === 85) ||
// //             (e.ctrlKey && e.shiftKey && e.keyCode === 67)) {
// //             e.preventDefault();
// //             e.stopPropagation();
// //             return false;
// //         }
// //     });

// //     // Block right-click but allow Ctrl+C copying
// //     document.addEventListener('contextmenu', (e) => {
// //         e.preventDefault();
// //         return false;
// //     });
// // }
// const root = createRoot(document.getElementById('root'));
// root.render(
//     <Provider store={configureStore({})}>
//         <App />
//         <ToastContainer />
//     </Provider>
// );

import React from 'react';
import ReactDOM from 'react-dom';
import './global.css';
import './i18n';

import App from './App';

import { Provider } from 'react-redux';
import { configureStore } from './redux/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
ReactDOM.render(
    <Provider store={configureStore({})}>
        <App />
        <ToastContainer />
    </Provider>,
    document.getElementById('root')
);