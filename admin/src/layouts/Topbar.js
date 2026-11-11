// @flow
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import '../global.css';

// actions
import {
    showRightSidebar,
    changeSidebarType,
    getGlobalSearch,
} from '../redux/actions';
import ProfileDropdown from '../components/ProfileDropdown';
import ClientLoginHistory from '../components/ClientLoginHistory';
import Pagesaddtask from './AllPagesRightbar';
// images
import profilePic from '../assets/images/users/avatar-1.jpg';
import logoImg from '../assets/images/logo/rowthtech.svg';
import logoSmDark from '../assets/images/logo_sm_dark.png';
import logoSmLight from '../assets/images/logo_sm.png';
//constants
import * as layoutConstants from '../constants/layout';

// get the profilemenu
const ProfileMenus = [
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
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const navbarCssClasses = navCssClasses || '';
    const containerCssClasses = !hideLogo ? 'container-fluid' : '';
    const location = useLocation();
    const [title, setTitle] = useState('');
    const { layoutType, leftSideBarType } = useSelector((state) => ({
        layoutType: state.Layout.layoutType,
        leftSideBarType: state.Layout.leftSideBarType,
    }));

    const GlobalSearchData = store?.getGlobalSearchReducer?.data?.data || {};
    // Flatten all search results into a single array
    const GlobalSearch = [
        ...(GlobalSearchData.projects || []).map(item => ({ ...item, type: 'project' })),
        ...(GlobalSearchData.tasks || []).map(item => ({ ...item, type: 'task' })),
        ...(GlobalSearchData.users || []).map(item => ({ ...item, type: 'user' }))
    ];

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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim().length > 0) {
            const data = {
                query: value,
                limit: '10'
            };
            dispatch(getGlobalSearch(data));
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const navigate = useNavigate();

    const handleResultClick = (result) => {
        setSearchQuery('');
        setShowDropdown(false);
        if (result.type === 'project') {
            navigate(`/dashboard/milestone/${result._id}`);
        } else if (result.type === 'task') {
            const projectId = result?.project?._id;
            const milestoneId = result?.milestone?._id;
            const sprintId = result?.sprint?._id;
            const milestoneName = result?.milestone?.title;
            const sprintName = result?.sprint?.sprintName;
            const taskUrl = `/dashboard/taskBord/${projectId}/${milestoneId}/${sprintId}/null/${milestoneName}/${sprintName}?mName=${milestoneName}&sName=${sprintName}`;
            navigate(taskUrl)
        }
        else if (result.type === 'user') {
            navigate(`/dashboard/users?search=${encodeURIComponent(result.name)}`);
        }
    };

    useEffect(() => {
        const pathToTitle = {
            '/dashboard/analytics': 'Dashboard',
            '/dashboard/projects': 'Projects',
            '/dashboard/users': 'Users',
            '/dashboard/clients': 'Clients',
            '/dashboard/technologyCategory': 'Category',
            '/dashboard/technology': 'Technology',
            '/dashboard/timeTracker': 'Time Tracker',
            '/dashboard/milestone': selectedDepartment === "Marketing" ? "Sprint" : 'Milestones',
            '/dashboard/sprint': 'Sprints',
            '/dashboard/task': 'Tasks',
            '/dashboard/taskBoard': 'Task Board',
            '/dashboard/allTaskList': 'All Task List',
            '/dashboard/support': 'Help and Support',
            '/dashboard/tickets': 'Tickets',
            '/dashboard/reports': 'Reports',
            '/dashboard/designation': 'Designations',
            "/dashboard/meetings": 'Meetings',
            '/dashboard/quick-add': 'Client Panel',
            '/dashboard/client-projects': 'Client Projects',
            '/dashboard/client-task-board': 'Client Task Board',
            '/dashboard/documents': 'Documents',
            '/dashboard/client-supports': 'Client Supports',
            '/dashboard/client-dependencies': 'Client Dependencies',
        };

        const matchedEntry = Object.entries(pathToTitle).find(([key]) =>
            location.pathname.startsWith(key)
        );

        const currentTitle = matchedEntry ? matchedEntry[1] : 'Page';
        setTitle(currentTitle);
    }, [location]);


    /**
     * Toggles the right sidebar
     */
    const handleRightSideBar = () => {
        dispatch(showRightSidebar());
    };

    const userData = JSON.parse(localStorage.getItem('hyper_user'));
    const Role = userData?.role || store?.Auth?.user?.role;

   
  
    const closeaddModal = () => {
        setShowModal(false);
    };

    const isClientTaskBoard = location.pathname.startsWith('/dashboard/client-task-board');

    const handleAddTaskClick = () => {
        if (isClientTaskBoard) {
            window.dispatchEvent(new CustomEvent('open-client-add-task'));
        } else {
            setShowModal(true);
        }
    };

    // Initialize department based on role
    const initializeDepartment = () => {
        if (Role === 'Marketing') return 'Marketing';
        if (Role === 'Freelancers') return 'Freelance';
        if (Role === 'QA') return 'Tech';
        return localStorage.getItem('selectedDepartment') || 'Tech';
    };

    const [selectedDepartment, setSelectedDepartment] = useState(initializeDepartment());
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

    const departmentOptions = ['Tech', 'Marketing', 'Sales', 'Freelance'];

    useEffect(() => {
        localStorage.setItem('selectedDepartment', selectedDepartment);
    }, [selectedDepartment]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDepartmentDropdown && !event.target.closest('.position-relative')) {
                setShowDepartmentDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDepartmentDropdown]);

    const handleDepartmentChange = async (dept) => {
        await setSelectedDepartment(dept);
        setShowDepartmentDropdown(false);
        if (location.pathname.startsWith('/dashboard/milestone/') ||
            location.pathname.startsWith('/dashboard/sprint/') ||
            location.pathname.startsWith('/dashboard/taskBord/')) {
            await navigate('/dashboard/projects')
        }
        window.location.reload();
    };

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
                                <div className="menuinfo">
                                    <h5 className='mb-0 text-dark fw-bold'>{title}</h5>
                                </div>
                            </div>
                        </div>

                        <ul className="list-unstyled d-flex align-items-center float-end mb-0 topbarr">
                            {['Project Manager', 'admin', 'sub-admin'].includes(Role) && <li><ClientLoginHistory /></li>}
                            {Role !== 'Support' || Role !== 'Seo Manager' && (
                                <li className="position-relative me-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        style={{ width: '200px' }}
                                    />
                                    {showDropdown && GlobalSearch.length > 0 && (
                                        <div className="position-absolute bg-white border rounded shadow-sm"
                                            style={{
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                zIndex: 1050,
                                                maxHeight: '300px',
                                                overflowY: 'auto'
                                            }}>
                                            {GlobalSearch?.map((result, index) => (
                                                <div
                                                    key={index}
                                                    className="p-2 border-bottom cursor-pointer hover-bg-light"
                                                    onClick={() => handleResultClick(result)}
                                                    style={{ cursor: 'pointer', fontSize: '12px' }}
                                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                                >
                                                    <div className="fw-semibold text-dark">{result.name || result.title || result?.summary}</div>
                                                    <div className="text-muted small">
                                                        {result.type === 'user' ? result.designation : result.type}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            )}
                            {/* {Role !== 'Support' && ( */}
                            <li className="d-flex align-items-center gap-2">
                                {(Role === 'admin' || Role === 'Sales') && (
                                    <div className="position-relative me-2">
                                        <button
                                            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                                            style={{ fontSize: '11px', padding: '4px 8px' }}
                                            onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                                        >
                                            <span>{selectedDepartment}</span>
                                            <i className="mdi mdi-chevron-down"></i>
                                        </button>
                                        {showDepartmentDropdown && (
                                            <div 
                                                className="position-absolute bg-white border rounded shadow-sm"
                                                style={{
                                                    top: '100%',
                                                    left: 0,
                                                    zIndex: 9999,
                                                    minWidth: '120px'
                                                }}
                                            >
                                                {departmentOptions.map((dept) => (
                                                    <div
                                                        key={dept}
                                                        className={`p-2 cursor-pointer ${selectedDepartment === dept ? 'bg-light' : ''}`}
                                                        onClick={() => handleDepartmentChange(dept)}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            fontSize: '12px',
                                                            borderBottom: dept !== departmentOptions[departmentOptions.length - 1] ? '1px solid #eee' : 'none'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = selectedDepartment === dept ? '#f8f9fa' : 'white'}
                                                    >
                                                        {dept}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {store?.Auth?.user?.role !== "Sales" && !isClientTaskBoard && (
                                    <button
                                        className="btn bg-dark text-white fw-semibold d-flex align-items-center gap-1"
                                        style={{ padding: '4px 12px', fontSize: '11px' }}
                                        onClick={handleAddTaskClick}
                                    >
                                        Add Task
                                    </button>
                                )}
                                {!isClientTaskBoard && (
                                    <Pagesaddtask
                                        className="d-none"
                                        showModal={showModal}
                                        closeModal={closeaddModal}
                                        setShowModal={setShowModal}
                                    />
                                )}
                            </li>
                            {/* )} */}

                            {/* <li className="dropdown notification-list listlist">
                                <ProfileDropdown
                                    menuItems={ProfileMenus}
                                    username={userData?.username}
                                    userTitle={userData?.role}
                                    profilePic={userData?.profilePic ? userData?.profilePic : profilePic}
                                />
                            </li> */}
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
                    </div>
                </div>
            </div>
        </>
    );
};

export default Topbar; 
