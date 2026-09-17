import React from 'react';
import { Offcanvas, Card } from 'react-bootstrap';

const DescriptionOffCanvas = ({ show, onHide, description, title }) => {

    return (
        <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: '400px' }}>
            <Offcanvas.Header closeButton className="bg-dark text-white border-0">
                <Offcanvas.Title title={title} className="fw-bold cp">
                    <i className="mdi mdi-folder-outline me-2"></i>
                    {title?.length > 40 ? title?.slice(0, 39) + '...' : title}
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
                <Card className="border-0 h-100">
                    <Card.Body className="p-2 pt-1">
                        <div className="mb-1">
                            <small className="text-muted fw-semibold text-uppercase">Description</small>
                        </div>
                        {description === '<p><br></p>' || !description ?
                            <div className='p-5 bg-light rounded d-flex align-items-center justify-content-center'>
                                No description available
                            </div>
                            :
                            <div className="p-2 bg-light rounded" style={{ lineHeight: '1.6' }}>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: description,
                                    }}
                                />
                                {/* <p className="mb-0 text-dark" style={{ fontSize: '14px' }}>
                                {description || 'No description available'}
                            </p> */}
                            </div>
                        }

                    </Card.Body>
                </Card>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default DescriptionOffCanvas;