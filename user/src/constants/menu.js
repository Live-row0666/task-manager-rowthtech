
const MenuItems = () => {
    let MENU_ITEMS = [];

    MENU_ITEMS = [
        { key: 'navigation', label: 'Navigation', isTitle: true },
        {
            key: 'taskboard',
            label: 'Task Board',
            url: 'dashboard/taskboard',
            icon: 'uil-clipboard-alt',
        },
        {
            key: 'projects',
            label: 'Projects',
            url: 'dashboard/projects',
            icon: 'uil-folder',
        },
        {
            key: 'notifications',
            label: 'Notifications',
            url: 'dashboard/notifications',
            icon: 'uil-bell',
        },
        {
            key: 'support',
            label: 'Help and Support', 
            url: 'dashboard/support',
            icon: 'uil-question-circle',
        },
        {
            key: 'logout',
            label: 'Logout',
            url: 'account/logout',
            icon: 'uil-sign-out-alt',
        }
    ]

    return MENU_ITEMS;
}


export default MenuItems;
