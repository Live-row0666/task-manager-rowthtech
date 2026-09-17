import { useEffect, useRef } from 'react';

const useScrollRestoration = (dependency = null) => {
    const scrollPositions = useRef(new Map());
    const currentKey = useRef(0);

    useEffect(() => {
        const key = currentKey.current;
        
        // Save current scroll position
        const saveScrollPosition = () => {
            const scrollableElements = document.querySelectorAll('[data-scroll-key]');
            scrollableElements.forEach(element => {
                const scrollKey = element.getAttribute('data-scroll-key');
                scrollPositions.current.set(`${key}-${scrollKey}`, {
                    scrollTop: element.scrollTop,
                    scrollLeft: element.scrollLeft
                });
            });
        };

        // Restore scroll position
        const restoreScrollPosition = () => {
            const scrollableElements = document.querySelectorAll('[data-scroll-key]');
            scrollableElements.forEach(element => {
                const scrollKey = element.getAttribute('data-scroll-key');
                const savedPosition = scrollPositions.current.get(`${key}-${scrollKey}`);
                if (savedPosition) {
                    element.scrollTo({
                        top: savedPosition.scrollTop,
                        left: savedPosition.scrollLeft,
                        behavior: 'auto'
                    });
                }
            });
        };

        // Save position before component updates
        saveScrollPosition();

        // Restore position after component updates
        const timeoutId = setTimeout(restoreScrollPosition, 100);

        return () => {
            clearTimeout(timeoutId);
            saveScrollPosition();
        };
    }, [dependency]);

    const resetScrollPosition = () => {
        currentKey.current += 1;
        scrollPositions.current.clear();
    };

    return { resetScrollPosition };
};

export default useScrollRestoration;