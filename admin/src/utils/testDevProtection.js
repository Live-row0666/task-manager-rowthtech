// Test file to verify developer tools protection
// This file can be used to test if the protection is working

export const testProtection = () => {
    console.log("Testing developer tools protection...");

    // Test console blocking
    console.log("This should not appear in console if protection is active");
    console.warn("This warning should be blocked");
    console.error("This error should be blocked");

    // Test right-click blocking
    document.addEventListener('contextmenu', (e) => {
        console.log("Right-click detected - should be blocked");
    });

    // Test keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123) {
            console.log("F12 pressed - should be blocked");
        }
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            console.log("Ctrl+Shift+I pressed - should be blocked");
        }
    });

    return "Protection test initialized";
};

// Export for testing in development
if (process.env.NODE_ENV === 'development') {
    window.testDevProtection = testProtection;
}