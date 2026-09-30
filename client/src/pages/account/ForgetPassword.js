import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { resetAuth, forgotPassword } from '../../redux/actions';
import AccountLayout from './AccountLayout';

const ForgetPassword = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');

    useEffect(() => {
        dispatch(resetAuth());
    }, [dispatch]);

    const { loading, passwordReset, resetPasswordSuccess, error } = useSelector((state) => ({
        loading: state.Auth.loading,
        error: state.Auth.error,
        passwordReset: state.Auth.passwordReset,
        resetPasswordSuccess: state.Auth.resetPasswordSuccess,
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(forgotPassword(email));
    };

    const bottomLink = (
        <div className="text-center mt-3">
            <p className="text-muted" style={{ fontSize: '13px' }}>
                Back to{' '}
                <Link to="/account/login" className="text-dark fw-bold ms-1" style={{ textDecoration: 'none' }}>
                    Log In
                </Link>
            </p>
        </div>
    );

    return (
        <AccountLayout bottomLinks={bottomLink}>
            <div className="text-center mb-4">
                <h4 className="auth-card-title">Forgot Password</h4>
                <p className="auth-card-subtitle">
                    Enter your email to receive password reset instructions
                </p>
            </div>

            {resetPasswordSuccess && (
                <Alert variant="success" className="my-2 py-2" style={{ fontSize: '12px' }}>
                    {resetPasswordSuccess.message || 'Password reset link sent to your email!'}
                </Alert>
            )}

            {error && (
                <Alert variant="danger" className="my-2 py-2" style={{ fontSize: '12px' }}>
                    {error}
                </Alert>
            )}

            {!passwordReset && (
                <Form onSubmit={handleSubmit} className="auth-form">
                    <Form.Group className="mb-4" controlId="email">
                        <Form.Label className="auth-form-label">Email Address</Form.Label>
                        <div className="auth-input-wrap">
                            <i className="bi bi-envelope auth-input-icon"></i>
                            <Form.Control
                                type="email"
                                className="auth-input-field"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </Form.Group>

                    <div className="mt-4 mb-2">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-100 btn-auth-primary d-flex align-items-center justify-content-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="spinner-border-sm" />
                                    <span>Sending Reset Link...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send Reset Link</span>
                                    <i className="bi bi-arrow-right" style={{ fontSize: '15px' }}></i>
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            )}
        </AccountLayout>
    );
};

export default ForgetPassword;
