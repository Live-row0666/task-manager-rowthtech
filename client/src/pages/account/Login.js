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
            <div className="text-center w-75 m-auto">
                <h4 className="text-dark-50 text-center mt-0 fw-bold">Sign In</h4>
                <p className="text-muted mb-4">
                    Enter your email address and password to access client panel.
                </p>
            </div>

            {error && (
                <Alert variant="danger" className="my-2 py-2" style={{ fontSize: '12px' }}>
                    {error}
                </Alert>
            )}
                                                                                                          
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label className="mb-0" style={{ fontSize: '13px', fontWeight: 500 }}>Email</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter your Email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ fontSize: '12px' }}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                    <div className="d-flex justify-content-between align-items-center">
                        <Form.Label className="mb-0" style={{ fontSize: '13px', fontWeight: 500 }}>Password</Form.Label>
                        <Link to="/account/forget-password" style={{ fontSize: '12px', color: '#6c757d', textDecoration: 'none' }}>
                            Forgot your password?
                        </Link>
                    </div>
                    <InputGroup>
                        <Form.Control
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onPaste={(e) => e.preventDefault()}
                            required
                        />
                        <div
                            className={classNames('input-group-text', 'input-group-password', {
                                'show-password': showPassword,
                            })}
                            data-password={showPassword ? 'true' : 'false'}
                        >
                            <span
                                className="password-eye"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i
                                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"
                                        }`}
                                ></i>
                            </span>
                        </div>
                    </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="rememberMe">
                    <Form.Check
                        type="checkbox"
                        label="Remember Me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ fontSize: '13px', color: '#556272', cursor: 'pointer' }}
                    />
                </Form.Group>

                <div className="mb-3 mb-0 d-flex justify-content-center">
                    <Button
                        className="btn bg-dark text-white fw-semibold d-flex w-25 align-items-center justify-content-center gap-1"
                        style={{ padding: '4px 12px', fontSize: '11px', outline: 'none', border: 'none' }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" className="spinner-border-sm" /> : 'Log In'}
                    </Button>
                </div>
            </Form>
        </AccountLayout>
    );
};

export default Login;
