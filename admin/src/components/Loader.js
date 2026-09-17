import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ className, size, tag, color, children, fullScreen, ...otherProps }) => {
    const Tag = tag || 'div';
    const loaderColor = color || 'primary';

    if (fullScreen) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="text-center">
                    <Spinner animation="border" variant={loaderColor} size={size}>
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    {children && <div className="mt-2">{children}</div>}
                </div>
            </div>
        );
    }

    // Default preloader for backward compatibility
    if (!className && !tag) {
        return (
            <div className="preloader" id="preloader">
                <div className="status" id="status">
                    <div className="bouncing-loader">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Tag className={className} {...otherProps}>
            <Spinner animation="border" variant={loaderColor} size={size}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            {children}
        </Tag>
    );
};

export default Loader;
