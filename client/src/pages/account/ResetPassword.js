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
            <div className="text-center w-75 m-auto">
                <h4 className="text-dark-50 fw-bold">
                    Reset Password
                </h4>

                <p
                    className="text-muted mb-4"
                    style={{ fontSize: "13px" }}
                >
                    Please enter your new password.
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

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label
                        style={{ fontSize: 13, fontWeight: 500 }}
                    >
                        New Password
                    </Form.Label>

                    <Form.Control
                        type="password"
                        name="password"
                        placeholder="Enter New Password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label
                        style={{ fontSize: 13, fontWeight: 500 }}
                    >
                        Confirm Password
                    </Form.Label>

                    <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </Form.Group>

                <div className="text-center">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-dark  px-4 d-flex align-items-center justify-content-center gap-2"
                    >
                        {loading && (
                            <Spinner animation="grow" size="sm" />
                        )}
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </div>
            </Form>
        </AccountLayout>
    );
};

export default ResetPassword;