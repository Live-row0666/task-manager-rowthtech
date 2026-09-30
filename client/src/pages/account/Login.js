import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { Form, Button, Spinner, Alert, InputGroup } from 'react-bootstrap';
import { resetAuth, loginUser } from '../../redux/actions';
import AccountLayout from './AccountLayout';
import classNames from 'classnames';
import { FaEye, FaEyeSlash } from "react-icons/fa";
const Login = () => {
    const store = useSelector((state) => state);
    const dispatch = useDispatch();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        dispatch(resetAuth());
    }, [dispatch]);

    const { loading, userLoggedIn, user, error } = useSelector((state) => ({
        loading: state.Auth.loading,
        user: state.Auth.user,
        userLoggedIn: state.Auth.userLoggedIn,
        error: state.Auth.error,
    }));

    const onSubmit = (formData) => {
        dispatch(loginUser(formData['username'], formData['password'], formData['rememberMe']));
        const roleId = store?.Auth?.user;
        localStorage.setItem('roleId', roleId);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ username, password, rememberMe });
    };

    // If user is logged in, redirect to dashboard
    if (userLoggedIn || user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <AccountLayout>
            <div className="text-center mb-4">
                <p className="auth-card-subtitle">
                    Enter your email & password to access your dashboard
                </p>
            </div>

            {error && (
                <Alert variant="danger" className="my-2 py-2" style={{ fontSize: '12px' }}>
                    {error}
                </Alert>
            )}
                                                                                                          
            <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label className="auth-form-label">Email Address</Form.Label>
                    <div className="auth-input-wrap">
                        <i className="bi bi-envelope auth-input-icon"></i>
                        <Form.Control
                            type="email"
                            className="auth-input-field"
                            placeholder="name@company.com"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <Form.Label className="auth-form-label mb-0">Password</Form.Label>
                        <Link to="/account/forget-password" className="auth-forgot-link">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="auth-input-wrap">
                        <i className="bi bi-lock auth-input-icon"></i>
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            className="auth-input-field pe-5"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onPaste={(e) => e.preventDefault()}
                            required
                        />
                        <button
                            type="button"
                            className="auth-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </Form.Group>

                <div className="d-flex align-items-center justify-content-between mb-4 mt-2">
                    <Form.Check
                        type="checkbox"
                        id="rememberMe"
                        label="Remember me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="auth-checkbox"
                    />
                </div>

                <div className="mt-4 mb-2">
                    <Button
                        className="w-100 btn-auth-primary d-flex align-items-center justify-content-center gap-2"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" className="spinner-border-sm" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <i className="bi bi-arrow-right" style={{ fontSize: '15px' }}></i>
                            </>
                        )}
                    </Button>
                </div>
            </Form>
        </AccountLayout>
    );
};

export default Login;
