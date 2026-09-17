// @flow
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import '../global.css';
import { getNotifications } from '../redux/notifications/api';

// actions
import {
    showRightSidebar,
    changeSidebarType,
} from '../redux/actions';
import ProfileDropdown from '../components/ProfileDropdown';
import TopbarSearch from '../components/TopbarSearch';
// images
import profilePic from '../assets/images/users/avatar-1.jpg';
import logoImg from '../assets/images/logo/rowthtech.jpg';
import logoSmDark from '../assets/images/logo_sm_dark.png';
import logoSmLight from '../assets/images/logo_sm.png';
//constants
import * as layoutConstants from '../constants/layout';

// get the profilemenu
const ProfileMenus = [
    // {
    //     label: 'My Account',
    //     icon: 'mdi mdi-account-circle',
    //     redirectTo: '#',
    // },
    // {
    //     label: 'Settings',
    //     icon: 'mdi mdi-account-edit',
    //     redirectTo: '#',
    // },
    // {
    //     label: 'Support',
    //     icon: 'mdi mdi-lifebuoy',
    //     redirectTo: '#',
    // },
    // {
    //     label: 'Lock Screen',
    //     icon: 'mdi mdi-lock-outline',
    //     redirectTo: '/account/lock-screen',
    // },
    {
        label: 'Logout',
        icon: 'mdi mdi-logout',
        redirectTo: '/account/logout',
    },
];

type TopbarProps = {
    hideLogo?: boolean,
    navCssClasses?: string,
    openLeftMenuCallBack?: () => void,
    topbarDark?: boolean,
};

const Topbar = ({ hideLogo, navCssClasses, openLeftMenuCallBack, topbarDark }: TopbarProps): React$Element<any> => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const [isopen, setIsopen] = useState(false);
    const navbarCssClasses = navCssClasses || '';
    const containerCssClasses = !hideLogo ? 'container-fluid' : '';
    const location = useLocation();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const { layoutType, leftSideBarType } = useSelector((state) => ({
        layoutType: state.Layout.layoutType,
        leftSideBarType: state.Layout.leftSideBarType,
    }));

    /**
     * Toggle the leftmenu when having mobile screen
     */
    const handleLeftMenuCallBack = () => {
        setIsopen((prevState) => !prevState);
        if (openLeftMenuCallBack) openLeftMenuCallBack();

        switch (layoutType) {
            case layoutConstants.LAYOUT_VERTICAL:
                // condition added
                if (window.innerWidth >= 768) {
                    if (leftSideBarType === 'fixed' || leftSideBarType === 'scrollable')
                        dispatch(changeSidebarType(layoutConstants.LEFT_SIDEBAR_TYPE_CONDENSED));
                    if (leftSideBarType === 'condensed')
                        dispatch(changeSidebarType(layoutConstants.LEFT_SIDEBAR_TYPE_FIXED));
                }
                break;

            case layoutConstants.LAYOUT_FULL:
                if (document.body) {
                    document.body.classList.toggle('hide-menu');
                }
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const pathToTitle = {
            '/dashboard/projects': 'Projects',
            '/dashboard/taskboard': 'Task Board',
            '/dashboard/notifications': 'Notifications',
        };

        const matchedEntry = Object.entries(pathToTitle).find(([key]) =>
            location.pathname.startsWith(key)
        );

        const currentTitle = matchedEntry ? matchedEntry[1] : 'Dashboard';
        setTitle(currentTitle);
    }, [location]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 120000); // 2 minutes
        
        const handleNotificationUpdate = () => {
            fetchNotifications();
        };
        
        window.addEventListener('notificationUpdated', handleNotificationUpdate);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('notificationUpdated', handleNotificationUpdate);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications({ limit: 1 });
            if (response && response.data) {
                setUnreadCount(response.data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };


    /**
     * Toggles the right sidebar
     */
    const handleRightSideBar = () => {
        dispatch(showRightSidebar());
    };

    const userData = JSON.parse(sessionStorage.getItem('hyper_user'));
    console.log(userData, "userData")

    const [currentTime, setCurrentTime] = useState("");

useEffect(() => {

    if (!userData?.loginTime) return;

    const updateTime = () => {

        setCurrentTime(
            new Date().toLocaleTimeString("en-GB", {
                hour12: false
            })
        );

    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);

}, [userData]);


console.log(userData, "userData")

    return (
        <>
            <div className={classNames('navbar-custom', navbarCssClasses)}>
                <div className={containerCssClasses}>
                    <div className="topbarinfo">
                        {!hideLogo && (
                            <Link to="/" className="topnav-logo">
                                <span className="topnav-logo-lg">
                                    <img src={logoImg} alt="logo" height="20" />
                                </span>
                                <span className="topnav-logo-sm">
                                    <img src={topbarDark ? logoSmLight : logoSmDark} alt="logo" height="16" />
                                </span>
                            </Link>
                        )}
                        <div className="d-flex align-items-center">
                            <div className="lefbar_info">
                                {(layoutType === layoutConstants.LAYOUT_VERTICAL ||
                                    layoutType === layoutConstants.LAYOUT_FULL) && (
                                        <button className="button-menu-mobile open-left" onClick={handleLeftMenuCallBack}>
                                            <i className="mdi mdi-menu" />
                                        </button>
                                    )}
                                <div class="menuinfo">
                                    <h5 className='mb-0 text-dark fw-bold'>{title}</h5>
                                </div>
                            </div>

                        </div>

                        <ul className="list-unstyled d-flex align-items-center float-end mb-0 topbarr">

                               <li className="me-3">
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderRadius: "25px",
           marginTop:"10px"
        }}
    >
        <span
            style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#28a745",
                display: "inline-block"
            }}
        />

        <span
            style={{
                color: "#6c757d",
                fontSize: "13px",
                fontWeight: "500"
            }}
        >
            Working Time
        </span>

        <span
            style={{
                color: "#212529",
                fontSize: "15px",
                fontWeight: "700",
                fontFamily: "monospace",
                letterSpacing: "1px"
            }}
        >
            {currentTime}
        </span>
    </div>
</li>
                            <li className="dropdown notification-list mt-1">
                                <span
                                    className="btn btn-link position-relative"
                                    // onClick={() => navigate('/dashboard/notifications')}
                                    style={{
                                        border: 'none',
                                        background: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <i className="mdi mdi-bell-outline" style={{ fontSize: '20px', color: '#6c757d', cursor: 'pointer', }} onClick={() => navigate('/dashboard/notifications')}></i>
                                    {unreadCount > 0 && (
                                        <span
                                            className="position-absolute badge bg-danger"
                                            style={{
                                                fontSize: '9px',
                                                top: '2px',
                                                right: '2px',
                                                minWidth: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                lineHeight: '1'
                                            }}
                                        >
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </span>
                            </li>
                          
                   
                            <li className="dropdown notification-list listlist text-capitalize">
                                <ProfileDropdown
                                    menuItems={ProfileMenus}
                                    username={userData?.username}
                                    userTitle={userData?.role}
                                    profilePic={userData?.profilePic ? userData?.profilePic : profilePic}
                                />
                            </li>
                        </ul>

                        {layoutType === layoutConstants.LAYOUT_HORIZONTAL && (
                            <Link
                                to="#"
                                className={classNames('navbar-toggle', { open: isopen })}
                                onClick={handleLeftMenuCallBack}>
                                <div className="lines">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </Link>
                        )}

                        {layoutType === layoutConstants.LAYOUT_DETACHED && (
                            <Link to="#" className="button-menu-mobile disable-btn" onClick={handleLeftMenuCallBack}>
                                <div className="lines">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </Link>
                        )}
                        <TopbarSearch />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Topbar;
