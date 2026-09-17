import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';

const NoInternetPage = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        const handleOnline = () => {
            const lastRoute = localStorage.getItem("lastOnlineRoute");
            if (lastRoute) {
                localStorage.removeItem("lastOnlineRoute");
                navigate(lastRoute, { replace: true });
            } else {
                navigate("/dashboard/analytics", { replace: true });
            }
        };

        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }, [navigate]);

    const handleRetry = () => {
        if (navigator.onLine) {
            const lastRoute = localStorage.getItem("lastOnlineRoute");
            if (lastRoute) {
                localStorage.removeItem("lastOnlineRoute");
                navigate(lastRoute, { replace: true });
            } else {
                navigate("/dashboard/analytics", { replace: true });
            }
        }
    };

    return (
        <div className="account-pages pt-2 pt-sm-5 pb-4 pb-sm-5">
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <Card className="text-center">
                            <Card.Body className="p-4">
                                <div className="mb-4">
                                    <i className="mdi mdi-wifi-off text-danger" style={{ fontSize: '54px' }}></i>
                                </div>
                                <h1 className="text-error mt-0 mb-3">No Internet Connection</h1>
                                <p className="text-muted mb-4">
                                    Oops! It seems you're offline. Please check your internet connection and try again.
                                </p>
                                <div className="mb-3 d-flex gap-2 justify-content-center">
                                    <Button className='web_button' onClick={handleRetry}>
                                        <i className="mdi mdi-refresh me-1"></i> Retry Connection
                                    </Button>
                                    <Button className='web_button' onClick={() => navigate('/dashboard/analytics')}>
                                        <i className="mdi mdi-home me-1"></i> Go to Dashboard
                                    </Button>
                                </div>
                                <div className="mt-4 pt-3 border-top">
                                    <p className="text-muted">
                                        While offline, you can still access previously loaded content.
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default NoInternetPage;