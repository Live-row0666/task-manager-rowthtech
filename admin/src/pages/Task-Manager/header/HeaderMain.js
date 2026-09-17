import React from 'react';
import ProfileDropdown from '../../../components/ProfileDropdown';
import profilePic from '../../../assets/images/users/avatar-1.jpg';
import { useSelector, useDispatch } from 'react-redux';

const HeaderMain = () => {
    // get the profilemenu
    const store = useSelector((state) => state);

    const ProfileMenus = [
        {
            label: 'My Account',
            icon: 'mdi mdi-account-circle',
            redirectTo: '#',
        },
        {
            label: 'Settings',
            icon: 'mdi mdi-account-edit',
            redirectTo: '#',
        },
        {
            label: 'Support',
            icon: 'mdi mdi-lifebuoy',
            redirectTo: '#',
        },
        {
            label: 'Lock Screen',
            icon: 'mdi mdi-lock-outline',
            redirectTo: '/account/lock-screen',
        },
        {
            label: 'Logout',
            icon: 'mdi mdi-logout',
            redirectTo: '/account/logout',
        },
    ];

    return (
        <div className="d-flex align-items-center mt-3">
            <ProfileDropdown
                profilePic={profilePic}
                menuItems={ProfileMenus}
                username={store?.Auth?.user?.username}
                userTitle={store?.Auth?.user?.firstName}
            />
        </div>
    );
};

export default HeaderMain;
