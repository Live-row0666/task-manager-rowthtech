import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import AccountLayout from "./AccountLayout";
import { resetAuth, resetPassword } from "../../redux/actions";
import { toast } from "react-toastify";
const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        dispatch(resetAuth());
    }, [dispatch]);
    const [loader, setLoader] = useState(false);

    const { loading, error, resetPasswordSuccess } = useSelector((state) => ({
        loading: state.Auth.loading,
        error: state.Auth.error,
        resetPasswordSuccess: state.Auth.resetPasswordSuccess,
    }));

    console.log(resetPasswordSuccess, "resetPasswordSucces")
    useEffect(() => {
        if (resetPasswordSuccess) {
            setTimeout(() => {
                navigate("/account/login");
            }, 2000);
        }
    }, [resetPasswordSuccess, navigate]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.password) {
            toast.error("Password is required.");
            return;
        }

        if (!formData.confirmPassword) {
            toast.error("Confirm Password is required.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            await dispatch(resetPassword(token, formData.password));

        } catch (error) {
            toast.error(error?.message || "Failed to reset password.");
        } finally {
            setLoader(false);
        }
    };

    useEffect(() => {
        if (resetPasswordSuccess) {
            setSubmitting(false);

            setFormData({
                password: "",
                confirmPassword: "",
            });

            const timer = setTimeout(() => {
                dispatch(resetAuth()); // Reset redux state
                navigate("/account/login");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [resetPasswordSuccess, navigate, dispatch]);
    const bottomLink = (
        <div className="text-center mt-3">
            <p className="text-muted" style={{ fontSize: "13px" }}>
                Back to{" "}
                <Link
                    to="/account/login"
                    className="text-dark fw-bold"
                    style={{ textDecoration: "none" }}
                >
                    Login
                </Link>
            </p>
        </div>
    );

    return (
        <AccountLayout bottomLinks={bottomLink}>
            <div className="text-center mb-4">
                <h4 className="auth-card-title">Reset Password</h4>
                <p className="auth-card-subtitle">
                    Please enter your new password
                </p>
            </div>

            {resetPasswordSuccess && (
                <Alert variant="success">
                    Password reset successfully. Redirecting to Login...
                </Alert>
            )}

            {error && (
                <Alert variant="danger">
                    {error}
                </Alert>
            )}

            <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="mb-3">
                    <Form.Label className="auth-form-label">New Password</Form.Label>
                    <div className="auth-input-wrap">
                        <i className="bi bi-lock auth-input-icon"></i>
                        <Form.Control
                            type="password"
                            name="password"
                            className="auth-input-field"
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="auth-form-label">Confirm Password</Form.Label>
                    <div className="auth-input-wrap">
                        <i className="bi bi-shield-check auth-input-icon"></i>
                        <Form.Control
                            type="password"
                            name="confirmPassword"
                            className="auth-input-field"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                                <span>Resetting Password...</span>
                            </>
                        ) : (
                            <>
                                <span>Reset Password</span>
                                <i className="bi bi-arrow-right" style={{ fontSize: '15px' }}></i>
                            </>
                        )}
                    </Button>
                </div>
            </Form>
        </AccountLayout>
    );
};

export default ResetPassword;