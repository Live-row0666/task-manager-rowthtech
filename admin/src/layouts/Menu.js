import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';
import classNames from 'classnames';
import { io } from 'socket.io-client';
import config from '../config';
import { APICore } from '../helpers/api/apiCore';

import { findAllParent, findMenuItem } from '../helpers/menu';

const api = new APICore();

const MenuItemWithChildren = ({ item, linkClassName, subMenuClassNames, activeMenuItems, toggleMenu }) => {
    const [open, setOpen] = useState(activeMenuItems.includes(item.key));

    useEffect(() => {
        setOpen(activeMenuItems.includes(item.key));
    }, [activeMenuItems, item]);

    const toggleMenuItem = (e) => {
        e.preventDefault();
        const status = !open;
        setOpen(status);
        if (toggleMenu) toggleMenu(item, status);
        return false;
    };

    return (
        <li className={classNames('side-nav-item', { 'menuitem-active': open })}>
            <Link
                to="/#"
                onClick={toggleMenuItem}
                data-menu-key={item.key}
                aria-expanded={open}
                className={classNames('has-arrow', 'side-sub-nav-link', linkClassName, {
                    'menuitem-active': activeMenuItems.includes(item.key) ? 'active' : '',
                })}>
                {item.icon && <i className={item.icon}></i>}
                {!item.badge ? (
                    <span className="menu-arrow"></span>
                ) : (
                    <span
                        className={classNames('badge', 'bg-' + item.badge.variant, 'float-end', {
                            'text-dark': item.badge.variant === 'light',
                        })}>
                        {item.badge.text}
                    </span>
                )}
                <span> {item.label} </span>
            </Link>
            <Collapse in={open}>
                <ul className={classNames(subMenuClassNames)}>
                    {item.children.map((child, i) => {
                        return (
                            <React.Fragment key={i}>
                                {child.children ? (
                                    <>
                                        {/* parent */}
                                        <MenuItemWithChildren
                                            item={child}
                                            linkClassName={activeMenuItems.includes(child.key) ? 'active' : ''}
                                            activeMenuItems={activeMenuItems}
                                            subMenuClassNames="side-nav-third-level"
                                            toggleMenu={toggleMenu}
                                        />
                                    </>
                                ) : (
                                    <>
                                        {/* child */}
                                        <MenuItem
                                            item={child}
                                            className={activeMenuItems.includes(child.key) ? 'menuitem-active' : ''}
                                            linkClassName={activeMenuItems.includes(child.key) ? 'active' : ''}
                                        />
                                    </>
                                )}
                            </React.Fragment>
                        );
                    })}
                </ul>
            </Collapse>
        </li>
    );
};

const MenuItem = ({ item, className, linkClassName }) => {
    return (
        <li className={classNames('side-nav-item', className)}>
            <MenuItemLink item={item} className={linkClassName} />
        </li>
    );
};

const MenuItemLink = ({ item, className }) => {
    return (
        <Link
            to={{ pathname: item.url }}
            target={item.target}
            className={classNames('side-nav-link-ref', 'side-sub-nav-link', className)}
            data-menu-key={item.key}>
            {item.icon && <i className={item.icon}></i>}
            {item.badge && (
                <span
                    className={classNames('badge', 'bg-' + item.badge.variant, 'rounded-pill', 'font-10', 'float-end', {
                        'text-dark': item.badge.variant === 'light',
                    })}>
                    {item.badge.text}
                </span>
            )}
            <span> {item.label} </span>
            {item.hasGreenDot && (
                <span className="admin-sidebar-green-dot" title="New updates available" />
            )}
        </Link>
    );
};

/**
 * Renders the application menu
 */

type AppMenuProps = {
    menuItems: Array<any>,
};

const AppMenu = ({ menuItems }: AppMenuProps): React$Element<React$FragmentType> => {
    let location = useLocation();
    const menuRef = useRef(null);

    const [activeMenuItems, setActiveMenuItems] = useState([]);
    const [supportHasUpdate, setSupportHasUpdate] = useState(false);
    const [dependencyHasUpdate, setDependencyHasUpdate] = useState(false);

    // Auto-clear dot when visiting the respective section
    useEffect(() => {
        if (location.pathname.includes('/client-supports')) {
            setSupportHasUpdate(false);
        }
        if (location.pathname.includes('/client-dependencies')) {
            setDependencyHasUpdate(false);
        }
    }, [location.pathname]);

    // Check updates on mount and periodically
    const checkUpdates = useCallback(async () => {
        if (!api.isUserAuthenticated()) return;
        try {
            const [supportRes, depRes] = await Promise.allSettled([
                api.get('/api/v1/admin/client-support/unread-count'),
                api.get('/api/v1/admin/client-dependency/stats')
            ]);

            if (supportRes.status === 'fulfilled' && supportRes.value?.data) {
                const data = supportRes.value.data.data || supportRes.value.data;
                if (data.hasUpdates || data.unreadCount > 0) {
                    if (!window.location.pathname.includes('/client-supports')) {
                        setSupportHasUpdate(true);
                    }
                }
            }

            if (depRes.status === 'fulfilled' && depRes.value?.data) {
                const data = depRes.value.data.data || depRes.value.data;
                if (data.hasUpdates || data.unreadCount > 0 || data.submitted > 0) {
                    if (!window.location.pathname.includes('/client-dependencies')) {
                        setDependencyHasUpdate(true);
                    }
                }
            }
        } catch (e) { }
    }, []);

    // Socket.io real-time notifications for sidebar green dots
    useEffect(() => {
        if (!api.isUserAuthenticated()) return;
        checkUpdates();

        const socketServerUrl = config.API_URL || (window.location.protocol + '//' + window.location.hostname + ':9100');
        const socket = io(socketServerUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            timeout: 20000
        });

        const joinAdmin = () => {
            socket.emit('join_admin_support');
        };
        joinAdmin();
        socket.on('connect', joinAdmin);

        // Support ticket socket triggers
        const onSupportUpdate = () => {
            if (!window.location.pathname.includes('/client-supports')) {
                setSupportHasUpdate(true);
            }
        };
        socket.on('ticket_created', onSupportUpdate);
        socket.on('ticket_updated', onSupportUpdate);
        socket.on('support_updated', onSupportUpdate);
        socket.on('new_client_support_response', onSupportUpdate);

        // Dependency socket triggers
        const onDepUpdate = () => {
            if (!window.location.pathname.includes('/client-dependencies')) {
                setDependencyHasUpdate(true);
            }
        };
        socket.on('dependency_submitted', onDepUpdate);
        socket.on('dependency_created', onDepUpdate);
        socket.on('dependency_updated', onDepUpdate);
        socket.on('dependency_status_changed', onDepUpdate);
        socket.on('new_dependency_assigned', onDepUpdate);

        return () => {
            socket.disconnect();
        };
    }, [checkUpdates]);

    /*
     * toggle the menus
     */
    const toggleMenu = (menuItem, show) => {
        if (show) setActiveMenuItems([menuItem['key'], ...findAllParent(menuItems, menuItem)]);
    };

    /**
     * activate the menuitems
     */
    const activeMenu = useCallback(() => {
        const div = document.getElementById('main-side-menu');
        let matchingMenuItem = null;

        if (div) {
            let items: any = div.getElementsByClassName('side-nav-link-ref');
            for (let i = 0; i < items.length; ++i) {
                if (location.pathname === items[i].pathname) {
                    matchingMenuItem = items[i];
                    break;
                }
            }

            if (matchingMenuItem) {
                const mid = matchingMenuItem.getAttribute('data-menu-key');
                const activeMt = findMenuItem(menuItems, mid);
                if (activeMt) {
                    setActiveMenuItems([activeMt['key'], ...findAllParent(menuItems, activeMt)]);
                }
            }
        }
    }, [location.pathname, menuItems]);

    useEffect(() => {
        activeMenu();
    }, [activeMenu]);

    // Augment menu items with green dot flags
    const augmentedMenuItems = (menuItems || []).map((item) => {
        let hasGreenDot = false;
        if (item.key === 'clientSupports' && supportHasUpdate) hasGreenDot = true;
        if (item.key === 'clientDependencies' && dependencyHasUpdate) hasGreenDot = true;
        return {
            ...item,
            hasGreenDot
        };
    });

    return (
        <>
            <ul className="side-nav" ref={menuRef} id="main-side-menu">
                {augmentedMenuItems.map((item, idx) => {
                    return (
                        <React.Fragment key={idx}>
                            {item.isTitle ? (
                                <></>
                            ) : (
                                <>
                                    {item.children ? (
                                        <MenuItemWithChildren
                                            item={item}
                                            toggleMenu={toggleMenu}
                                            subMenuClassNames="side-nav-second-level"
                                            activeMenuItems={activeMenuItems}
                                            linkClassName="side-nav-link"
                                        />
                                    ) : (
                                        <MenuItem
                                            item={item}
                                            linkClassName="side-nav-link"
                                            className={activeMenuItems.includes(item.key) ? 'menuitem-active' : ''}
                                        />
                                    )}
                                </>
                            )}
                        </React.Fragment>
                    );
                })}
            </ul>
        </>
    );
};

export default AppMenu;
