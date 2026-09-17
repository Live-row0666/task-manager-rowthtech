import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { MoonLoader } from 'react-spinners';

const MainLoader = () => {
    return (
        <>
            <Row>
                <Col
                    lg={12}
                    className="d-flex my-5 justify-content-center text-center  align-items-center top-0 bottom-0 end-0 start-0">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                        <MoonLoader color="#050505" />
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default MainLoader;
