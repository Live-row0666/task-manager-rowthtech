import { useSelector } from "react-redux";

const MenuItems = () => {
    const userData = JSON.parse(localStorage.getItem('hyper_user'));
    const store = useSelector((state) => state);
    const Role = userData?.role || store?.Auth?.user?.role;
    console.log(userData, "cvcxvbxcvbcxbhhhhh")
    let MENU_ITEMS = [
        { key: 'navigation', label: 'Navigation', isTitle: true },
        {
            key: 'dashboard',
            label: 'Dashboard',
            url: 'dashboard/analytics',
            icon: 'uil-window-grid',
        },
        {
            key: 'taskDashboard',
            label: 'Task Dashboard',
            url: 'dashboard/taskDashboard',
            icon: 'uil-clipboard-notes',
        },
        {
            key: 'projectsss',
            label: 'Projects',
            url: 'dashboard/projects',
            icon: 'uil-home',
        },
        {
            key: 'users',
            label: 'Users',
            url: 'dashboard/users',
            icon: 'uil-users-alt',
        },

        {
            key: 'clients',
            label: 'Clients',
            url: 'dashboard/clients',
            icon: 'uil-file',
        },
        {
            key: 'meetings',
            label: 'Meetings',
            url: 'dashboard/meetings',
            icon: 'uil-calendar-alt',
        },
        {
            key: 'timeTracker',
            label: 'Time Tracker',
            url: 'dashboard/timeTracker',
            icon: 'bi-clock',
        },
        // {
        //     key: 'chat',
        //     label: 'Chat',
        //     url: 'dashboard/chat',
        //     icon: 'uil-comment-message',
        // },
        {
            key: 'support',
            label: 'Help and Support',
            url: 'dashboard/support',
            icon: 'uil-question-circle',
        },
        {
            key: 'reports',
            label: 'Reports',
            url: 'dashboard/reports',
            icon: 'uil-chart-pie',
        },
        {
            key: 'tickets',
            label: 'Tickets',
            url: 'dashboard/tickets',
            icon: 'uil-ticket',
        },
        // {
        //     key: 'quickAdd',
        //     label: 'Client Panel',
        //     url: 'dashboard/quick-add',
        //     icon: 'uil-plus-circle',
        // },
        // {
        //     key: 'clientProjects',
        //     label: 'Client Projects',
        //     url: 'dashboard/client-projects',
        //     icon: 'uil-briefcase',
        // },

        {
            key: 'clientTaskBoard',
            label: 'Client Task Board',
            url: 'dashboard/client-task-board',
            icon: 'uil-columns',
        },
        {
            key: 'documents',
            label: 'Documents',
            url: 'dashboard/documents',
            icon: 'uil-columns',
        },
        {
            key: 'clientSupports',
            label: 'Client Supports',
            url: 'dashboard/client-supports',
            icon: 'uil-headphones',
        },
        {
            key: 'clientDependencies',
            label: 'Dependencies',
            url: 'dashboard/client-dependencies',
            icon: 'uil-layer-group',
        },
        {
            key: 'Settings',
            label: 'Settings',
            icon: 'uil-lock-open-alt',
            children: [
                {
                    label: 'Category',
                    parentKey: 'Settings',
                    url: 'dashboard/technologyCategory',
                },
                {
                    label: 'Technology',
                    parentKey: 'Settings',
                    url: 'dashboard/technology',
                },
                {
                    label: 'Designation',
                    parentKey: 'Settings',
                    url: 'dashboard/designation',
                },
            ],
        },
        // {
        //     key: 'logout',
        //     label: 'Logout',
        //     url: 'account/logout',
        //     icon: 'uil-entry',
        // },
    ];

    // 🧼 Role based access


    if (Role !== 'sub-admin' && Role !== 'admin' && Role !== 'Project Manager') {
        MENU_ITEMS = MENU_ITEMS.filter(item =>
            !['clientProjects', 'clientTaskBoard', 'documents', 'clientSupports', 'clientDependencies'].includes(item.key)
        );
    }

    if (Role === 'QA') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'clients');
    }
    if (Role === 'QA') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'meetings');
    }
    if (Role === 'QA') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'meetings');
    }
    if (Role === 'QA') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'tickets');
    }
    if (Role === 'QA') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'dashboard');
    }
    if (Role === 'QA') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'reports');
    }
    if (Role === 'QA') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'timeTracker');
    }
    if (Role === 'Support') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key === 'tickets' || item.key === 'logout');
    }

    if (Role === 'Sales') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key === 'projectsss' || item.key === 'taskDashboard' || item.key === "support" || item.key === "reports");
    }

    if (Role === 'admin') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'tickets');
    }

    if (Role === 'sub-admin') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'tickets');
    }
    if (Role === 'Project Manager') {
        MENU_ITEMS = MENU_ITEMS.filter(item => !['users', 'Settings', 'tickets'].includes(item.key));
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'dashboard');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'meetings');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'users');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'clients');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'meetings');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'Settings');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'tickets');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'timeTracker');
    }
    if (Role === 'Marketing') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'reports');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'dashboard');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'meetings');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'users');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'clients');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'meetings');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'Settings');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'tickets');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'timeTracker');
    }
    if (Role === 'Freelancers') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'reports');
    }
    // if (Role === 'Marketing') {
    //     MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'support');
    // }
    if (Role === 'Seo Manager') {
        MENU_ITEMS = MENU_ITEMS.filter(item => item.key !== 'timeTracker');
    }


    return MENU_ITEMS;
};

export default MenuItems;
