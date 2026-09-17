// @flow
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import { getMenuItems } from '../helpers/menu';

// components
import AppMenu from './Menu';

// images
import logoDark from '../assets/images/logo-dark.png';
import rtlogo from '../assets/images/rtlogo.png';
import profileImg from '../assets/images/users/avatar-1.jpg';
import logoImg from '../assets/images/logo/rowthtech.svg';
import { useSelector } from 'react-redux';

type SideBarContentProps = {
    hideUserProfile: boolean,
};

/* sidebar content */
const SideBarContent = ({ hideUserProfile }: SideBarContentProps) => {
    const store = useSelector((state) => state);
    return (
        <>
            {!hideUserProfile && (
                <div className="leftbar-user">
                    <Link to="/">
                        <img src={profileImg} alt="" height="42" className="rounded-circle shadow-sm" />
                        <span className="leftbar-user-name">Dominic Keller</span>
                    </Link>
                </div>
            )}
            <AppMenu menuItems={getMenuItems()} />
            <div className="clearfix" />

            {/* User Info and Logout Section */}
            <div className="leftbar-user-bottom" style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', borderTop: '1px solid #e3e6f0', paddingTop: '10px' }}>
                <div className="d-flex align-items-center justify-content-center">
                    <img src={profileImg} alt="" height="32" className="rounded-circle me-2" />
                    <div className="flex-grow-1">
                        <div className="text-truncate text-white fw-semibold fs-6">
                            {JSON.parse(localStorage.getItem('hyper_user') || '{}')?.username || 'User'}
                        </div>
                        <div className="text-white fw-semibold  text-capitalize" style={{ fontSize: '10px' }}>
                            {store?.Auth?.user?.role}
                        </div>
                    </div>
                </div>
                <div className='text-center d-flex justify-content-center my-2'>
                    <Link
                        className="btn fs-6 d-flex align-items-center gap-1 w-100 justify-content-center border-white text-white "
                        style={{ padding: '2px 8px' }}
                        to="/account/logout"
                        title="Logout"
                    >
                        <i className="mdi mdi-logout fs-5" />Logout
                    </Link>
                </div>
            </div>
        </>
    );
};

type LeftSidebarProps = {
    hideLogo: boolean,
    hideUserProfile: boolean,
    isLight: boolean,
    isCondensed: boolean,
};

const LeftSidebar = ({ isCondensed, isLight, hideLogo, hideUserProfile }: LeftSidebarProps): React$Element<any> => {
    const menuNodeRef: any = useRef(null);

    /**
     * Handle the click anywhere in doc
     */
    function handleOtherClick(e: any) {
        if (menuNodeRef && menuNodeRef.current && menuNodeRef.current.contains(e.target)) return;
        // else hide the menubar
        if (document.body) {
            document.body.classList.remove('sidebar-enable');
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleOtherClick, false);

        return () => {
            document.removeEventListener('mousedown', handleOtherClick, false);
        };
    }, []);

    const userData = JSON.parse(localStorage.getItem('hyper_user'));
    const Role = userData?.role;

    return (
        <>
            <div className="leftside-menu" ref={menuNodeRef}>
                {!hideLogo && (
                    <>
                        <Link
                            to={Role === 'Support' ? '/dashboard/tickets' : '/'}
                            className="logo text-center logo-light"
                        >                            <span className="logo-lg" style={{ height: '45px!important' }}>
                                <img src={isLight ? logoDark : logoImg} alt="logo" height="25" style={{ marginBottom: '20px' }} />
                            </span>
                            <span className="logo-sm">
                                <img src={isLight ? rtlogo : rtlogo} alt="logo" height="20" />
                            </span>
                        </Link>

                        <Link to={Role === 'Support' ? '/dashboard/tickets' : '/'} className="logo text-center logo-dark">
                            <span className="logo-lg">
                                <img src={isLight ? logoDark : logoImg} alt="logo" height="16" />
                            </span>
                            <span className="logo-sm">
                                <img src={isLight ? rtlogo : rtlogo} alt="logo" height="20" />
                            </span>
                        </Link>
                    </>
                )}

                {!isCondensed && (
                    <SimpleBar style={{ maxHeight: '100%' }} timeout={500} scrollbarMaxSize={320}>
                        <SideBarContent
                            menuClickHandler={() => { }}
                            isLight={isLight}
                            hideUserProfile={hideUserProfile}
                        />
                    </SimpleBar>
                )}
                {isCondensed && <SideBarContent isLight={isLight} hideUserProfile={hideUserProfile} />}
            </div>
        </>
    );
};

LeftSidebar.defaultProps = {
    hideLogo: false,
    hideUserProfile: false,
    isLight: false,
    isCondensed: false,
};

export default LeftSidebar;
