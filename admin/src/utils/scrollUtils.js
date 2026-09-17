// Scroll utility functions to prevent scroll sticking

export const smoothScrollToTop = (element) => {
    if (element) {
        element.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

export const preserveScrollPosition = (element, callback) => {
    if (!element) return callback();
    
    const scrollTop = element.scrollTop;
    const scrollLeft = element.scrollLeft;
    
    callback();
    
    // Restore scroll position after callback
    requestAnimationFrame(() => {
        element.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'auto'
        });
    });
};

export const debounceScroll = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export const getScrollableParent = (element) => {
    if (!element) return null;
    
    const isScrollable = (el) => {
        const style = window.getComputedStyle(el);
        return /(auto|scroll)/.test(style.overflow + style.overflowY + style.overflowX);
    };
    
    let parent = element.parentElement;
    while (parent) {
        if (isScrollable(parent)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    
    return document.documentElement;
};

export const resetScrollPosition = (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
        element.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        });
    });
};