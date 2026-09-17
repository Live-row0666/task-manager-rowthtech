import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

/**
 * NetworkStatusMonitor component to display network status changes
 */
const NetworkStatusMonitor = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setToastMessage('Your internet connection has been restored');
            setToastVariant('success');
            setShowToast(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setToastMessage('You are currently offline');
            setToastVariant('danger');
            setShowToast(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
            <Toast 
                show={showToast} 
                onClose={() => setShowToast(false)} 
                delay={5000} 
                autohide 
                bg={toastVariant}
                className="text-white"
            >
                <Toast.Header closeButton>
                    <i className={`me-2 mdi ${isOnline ? 'mdi-wifi' : 'mdi-wifi-off'}`}></i>
                    <strong className="me-auto">Network Status</strong>
                </Toast.Header>
                <Toast.Body>{toastMessage}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default NetworkStatusMonitor;