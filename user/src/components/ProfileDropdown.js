// @flow
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import classNames from 'classnames';

type ProfileMenuItem = {
    label: string,
    icon: string,
    redirectTo: string,
};

type ProfileDropdownProps = {
    menuItems: Array<ProfileMenuItem>,
    profilePic?: any,
    username: string,
    userTitle?: string,
};

type ProfileDropdownState = {
    dropdownOpen?: boolean,
};

const ProfileDropdown = (props: ProfileDropdownProps, state: ProfileDropdownState): React$Element<any> => {
    const profilePic = props.profilePic || null;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    /*
     * toggle profile-dropdown
     */
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <Dropdown show={dropdownOpen} className="w-100" onToggle={toggleDropdown}>
            <div className="row ">
                <div className="col-6 d-flex align-items-center justify-content-start">
                    {/* <div className="name_div px-5 py-2">
                        <h5 className="m-0 p-0">Welcome</h5>
                    </div> */}
                </div>
                <div className="col-6 d-flex align-items-center justify-content-end">
                    <Dropdown.Toggle
                        variant="link"
                        id="dropdown-profile"
                        as={Link}
                        to="#"
                        onClick={toggleDropdown}
                        className="nav-link dropdown-toggle nav-user arrow-none me-0 d-flex align-items-center">
                        <span className="account-user-avatar">
                            <img src={profilePic} className="rounded-circle border object-fit-cover" alt="user" />
                        </span>
                        <span>
                            <span className="account-user-name" >{props.username}</span>
                            {/* <span className="account-position">{p   rops.userTitle||'kjhghjkl'}</span> */}
                        </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu
                        align={'end'}
                        className="dropdown-menu-animated topbar-dropdown-menu profile-dropdown">
                        <div onClick={toggleDropdown}>

                            {props.menuItems.map((item, i) => {
                                return (
                                    <Link
                                        to={item.redirectTo}
                                        className="dropdown-item notify-item"
                                        key={i + '-profile-menu'}>
                                        <i className={classNames(item.icon, 'me-1')}></i>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </Dropdown.Menu>
                </div>
            </div>
        </Dropdown>
    );
};

export default ProfileDropdown;
