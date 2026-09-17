import React from 'react';
import { ScreenCapture } from 'react-screen-capture';

const ScreenCaptureComponent = ({ onScreenCapture }) => {
    const handleScreenCapture = (screenCapture) => {
        onScreenCapture(screenCapture);
    };

    return (
        <ScreenCapture onEndCapture={handleScreenCapture}>
            {({ onStartCapture }) => (
                <button
                    type="button"
                    className="btn btn-outline-info btn-sm"
                    onClick={onStartCapture}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                    <i className="fas fa-camera me-1"></i>
                    Capture Screen
                </button>
            )}
        </ScreenCapture>
    );
};

export default ScreenCaptureComponent;