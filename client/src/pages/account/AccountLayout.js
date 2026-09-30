import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '../../assets/images/logo/logo.webp';

const AccountLayout = ({ bottomLinks, children }) => {
    useEffect(() => {
        if (document.body) document.body.classList.add('authentication-bg');

        return () => {
            if (document.body) document.body.classList.remove('authentication-bg');
        };
    }, []);

    return (
        <div className="account-pages py-4 py-sm-5">
            <Container>
                <Row className="justify-content-center">
                    <Col xs={11} sm={9} md={7} lg={5} xl={4} xxl={4}>
                        {/* Auth Form Card */}
                        <Card className="auth-card">
                            <Card.Body className="p-4 p-sm-4">
                                {/* Brand Logo inside the card */}
                                <div className="text-center mb-3">
                                    <a
                                        href="https://www.rowthtech.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="d-inline-block"
                                        title="Visit RowthTech"
                                    >
                                        <img src={Logo} alt="RowthTech" className="auth-brand-logo" />
                                    </a>
                                </div>
                                {children}
                            </Card.Body>
                        </Card>

                        {/* Bottom Links */}
                        {bottomLinks}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AccountLayout;
