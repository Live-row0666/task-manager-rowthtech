// @flow
import React, { useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Navigate, } from 'react-router-dom';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

//actions
import { resetAuth, loginUser } from '../../redux/actions';

// components
import { VerticalForm, FormInput } from '../../components/';

import AccountLayout from './AccountLayout';

/* bottom link of account pages */

const Login = (): React$Element<any> => {
    const store = useSelector((state) => state);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(resetAuth());
    }, [dispatch]);

    const { loading, userLoggedIn, user } = useSelector((state) => ({
        loading: state.Auth.loading,
        user: state.Auth.user,
        userLoggedIn: state.Auth.userLoggedIn,
    }));

    const redirectUrl = user?.role === 'Support' ? '/dashboard/tickets' : '/dashboard/projects';

    /*
    form validation schema
    */
    const schemaResolver = yupResolver(
        yup.object().shape({
            username: yup.string().required(t('Please enter Username')),
            password: yup.string().required(t('Please enter Password')),
        })
    );

    /*
    handle form submission
    */
    const onSubmit = (formData) => {
        dispatch(loginUser(formData['username'], formData['password'], formData['rememberMe']));
        const roleId = store?.Auth?.user;
        localStorage.setItem('roleId', roleId);
    };

    return (
        <>
            {(userLoggedIn || user) && <Navigate to={redirectUrl} replace />}
            <AccountLayout>
                <div className="text-center w-75 m-auto">
                    <h4 className="text-dark-50 text-center mt-0 fw-bold">{t('Sign In')}</h4>
                    <p className="text-muted mb-4">
                        {t('Enter your email address and password to access admin panel.')}
                    </p>
                </div>
                <VerticalForm
                    onSubmit={onSubmit}
                    resolver={schemaResolver}
                >
                    <FormInput
                        label={t('Email')}
                        type="email"
                        name="username"
                        placeholder={t('Enter your Email')}
                        containerClass={'mb-3'}
                        labelClassName={'mb-0'}
                    />
                    <FormInput
                        label={t('Password')}
                        type="password"
                        name="password"
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                        placeholder={t('Enter your password')}
                        containerClass={'mb-3'}
                        labelClassName={'mb-0'}
                    />
                    <FormInput
                        label="Remember Me"
                        type="checkbox"
                        name="rememberMe"
                        containerClass="mb-3"
                        labelClassName="mb-0"
                    />
                    <div className="mb-3 mb-0 d-flex justify-content-center">
                        <Button
                            className="btn bg-dark text-white fw-semibold d-flex w-25 align-items-center justify-content-center gap-1"
                            style={{ padding: '4px 12px', fontSize: '11px', outline: 'none' }}
                            type="submit"
                            disabled={loading}>
                            {loading ? <Spinner className='spinner-border-sm' /> : 'Log In'}
                        </Button>
                    </div>
                </VerticalForm>
            </AccountLayout>
        </>
    );
};

export default Login;
