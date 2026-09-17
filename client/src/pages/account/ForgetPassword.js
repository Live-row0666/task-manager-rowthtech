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
            <div className="text-center w-75 m-auto">
                <h4 className="text-dark-50 text-center mt-0 fw-bold">Reset Password</h4>
                <p className="text-muted mb-4" style={{ fontSize: '13px' }}>
                    Enter your email address and we'll send you an email with instructions to reset your password.
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
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label className="mb-0" style={{ fontSize: '13px', fontWeight: 500 }}>Email Address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ fontSize: '12px' }}
                        />
                    </Form.Group>

                    <div className="mb-3 d-flex justify-content-center">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-dark text-white fw-semibold d-flex align-items-center justify-content-center gap-2 w-50"
                            style={{
                                padding: "6px 16px",
                                fontSize: "11px",
                                border: "none",
                                minHeight: "36px",
                            }}
                        >
                            {loading && (
                                <Spinner
                                    animation="border"
                                    style={{
                                        width: "12px",
                                        height: "12px",
                                        borderWidth: "2px",
                                    }}
                                />
                            )}
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>
                </Form>
            )}
        </AccountLayout>
    );
};

export default ForgetPassword;
