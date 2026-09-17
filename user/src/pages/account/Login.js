// @flow
import React, { useEffect } from 'react';
import { Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { Link, Navigate, useLocation } from 'react-router-dom';
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
const BottomLink = () => {
    const { t } = useTranslation();

    return (
        <></>
    );
};

const Login = (): React$Element<any> => {
    const store = useSelector((state) => state);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const redirectUrl = '/dashboard/taskboard';

    useEffect(() => {
        dispatch(resetAuth());
    }, [dispatch]);

    const { loading, userLoggedIn, user, error } = useSelector((state) => ({
        loading: state.Auth.loading,
        user: state.Auth.user,
        error: state.Auth.error,
        userLoggedIn: state.Auth.userLoggedIn,
    }));

    
    /*
    form validation schema
    */
    const schemaResolver = yupResolver(
        yup.object().shape({
            username: yup.string().required(t('Please enter email address.')),
            password: yup.string().required(t('Please enter Password')),
        })
    );

    /*
    handle form submission
    */
    const onSubmit = (formData) => {
        dispatch(loginUser(formData['username'], formData['password']));
        const roleId = store?.Auth?.user;

        console.log(store, "ZXcnzxcnbzxbncxnzb")
        localStorage.setItem('roleId', roleId);
    };

    return (
        // <>
        //     {(userLoggedIn || user) && <Navigate to={redirectUrl} replace />}

        //     <AccountLayout bottomLinks={<BottomLink />}>
        //         <div className="text-center w-75 m-auto">
        //             <h4 className="text-dark-50 text-center mt-0 fw-bold">{t('Sign In')}</h4>
        //             <p className="text-muted mb-4">
        //                 {t('Enter your email address and password to access user panel.')}
        //             </p>
        //         </div>

        //         {error && (
        //             <Alert variant="danger" className="my-2">
        //                 {error}
        //             </Alert>
        //         )}

        //         <VerticalForm
        //             onSubmit={onSubmit}
        //             resolver={schemaResolver}
        //         // defaultValues={{ username: 'test', password: 'test' }}
        //         >
        //             <FormInput
        //                 label={t('Email')}
        //                 type="text"
        //                 name="username"
        //                 placeholder={t('Enter your email address')}
        //                 containerClass={'mb-3'}
        //             />
        //             <FormInput
        //                 label={t('Password')}
        //                 type="password"
        //                 name="password"
        //                 placeholder={t('Enter your password')}
        //                 containerClass={'mb-3'}>
        //                 <Link to="/account/forget-password" className="text-mute float-end">
        //                     <small className='d-none'>{t('Forgot your password?')}</small>
        //                 </Link>
        //             </FormInput>

        //             <div className="mb-3 mb-0 text-center">
        //                 <Button variant="primary" className='bg-black border-0' type="submit" disabled={loading}>
        //                     {t('Log In')}
        //                 </Button>
        //             </div>
        //         </VerticalForm>
        //     </AccountLayout>
        // </>
        <>
            {(userLoggedIn || user) && <Navigate to={redirectUrl} replace />}
            <AccountLayout>
                <div className="text-center w-75 m-auto">
                    <h4 className="text-dark-50 text-center mt-0 fw-bold">{t('Sign In')}</h4>
                    <p className="text-muted mb-4">
                        {t('Enter your email address and password to access user panel.')}
                    </p>
                </div>

                {/* {error && (
                    <Alert variant="danger" className="my-2">
                        {error ? 'Please try again' : ''}
                    </Alert>
                )} */}

                <VerticalForm
                    onSubmit={onSubmit}
                    resolver={schemaResolver}
                // defaultValues={{ username: 'test', password: 'test' }}
                >
                    <FormInput
                        label={t('Email')}
                        type="email"
                        name="username"
                        placeholder={t('Enter your Email')}
                        containerClass={'mb-3'}
                        labelClassName={'mb-0'}
                    // onChange={(e) => {
                    //     e.target.value = e.target.value.replace(/\s+/g, ''); // Remove spaces
                    // }}
                    // onKeyPress={(e) => {
                    //     if (e.key === ' ') {
                    //         e.preventDefault(); // Prevent space keypress
                    //     }
                    // }}
                    />

                    <FormInput
                        label={t('Password')}
                        type="password"
                        name="password"
                        className=''
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onPaste={(e) => e.preventDefault()}
                        placeholder={t('Enter your password')}
                        labelClassName={'mb-0'}
                        containerClass={'mb-3'}>
                        <Link to="/account/forget-password" className="text-muted float-end">
                            <small>{t('Forgot your password?')}</small>
                        </Link>
                    </FormInput>

                    <div className="mb-3 mb-0 d-flex justify-content-center">
                        <Button
                            className="btn bg-dark text-white fw-semibold w-25 justify-content-center d-flex align-items-center gap-1"
                            style={{ padding: '4px 12px', fontSize: '11px' }} type="submit"
                            disabled={loading}>
                            {loading ? <Spinner className='spinner-border-sm' /> : `${t('Log In')}`}
                        </Button>
                    </div>
                </VerticalForm>
            </AccountLayout>
        </>
    );
};

export default Login;
