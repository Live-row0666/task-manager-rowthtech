import React, { useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Logo from '../../assets/images/logo/rowthtech.svg';

const AccountLayout = ({ bottomLinks, children }) => {
    useEffect(() => {
        if (document.body) document.body.classList.add('authentication-bg');

        return () => {
            if (document.body) document.body.classList.remove('authentication-bg');
        };
    }, []);

    return (
        <>
            <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5 ">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5} xxl={4}>
                            <Card className="overflow-hidden">
                                {/* logo */}
                                <div className="pt-4 pb-4 text-center bg-black">
                                    <Link to="/">
                                        <span>
                                            <img src={Logo} alt="ROWTH TECH" height="26" />
                                        </span>
                                    </Link>
                                </div>
                                <Card.Body className="p-4 bg-white">{children}</Card.Body>
                            </Card>

                            {/* bottom links */}
                            {bottomLinks}
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default AccountLayout;
