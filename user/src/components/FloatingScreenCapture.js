import React, { useState } from 'react';
import { ScreenCapture } from 'react-screen-capture';
import CreateTicketModal from '../pages/support/modal/CreateTicketModal';
import { handleUpload } from '../constants/handleUpload';

const FloatingScreenCapture = () => {
    const [showModal, setShowModal] = useState(false);
    const [capturedAttachment, setCapturedAttachment] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const isBlankImage = (canvas) => {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
                return false;
            }
        }
        return true;
    };

    const handleScreenCapture = async (screenCapture) => {
        if (screenCapture) {
            setIsUploading(true);

            // Create canvas to check if image is blank
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                if (isBlankImage(canvas)) {
                    setIsUploading(false);
                    alert('Screenshot appears to be blank. Please try again or check browser permissions.');
                    return;
                }

                const response = await fetch(screenCapture);
                const blob = await response.blob();
                const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });

                const fileUrl = await handleUpload(file, setIsUploading);
                if (fileUrl) {
                    setCapturedAttachment({
                        filename: file.name,
                        url: fileUrl?.url?.split('?')[0]
                    });
                    setShowModal(true);
                }
                setIsUploading(false);
            };
            img.src = screenCapture;
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setCapturedAttachment(null);
    };

    return (
        <>
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999
            }}>
                <ScreenCapture onEndCapture={handleScreenCapture}>
                    {({ onStartCapture }) => (
                        <button
                            onClick={onStartCapture}
                            disabled={isUploading}
                            style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: '#3591f3ff',
                                color: 'white',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,123,255,0.3)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isUploading ? (
                                <div className="spinner-border spinner-border-sm" role="status"></div>
                            ) : (
                                <span>⛶</span>
                            )}
                        </button>
                    )}
                </ScreenCapture>
            </div>

            <CreateTicketModal
                show={showModal}
                onHide={handleModalClose}
                onSuccess={handleModalClose}
                preAttachment={capturedAttachment}
            />
        </>
    );
};

export default FloatingScreenCapture;