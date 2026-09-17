// Developer Tools Protection Utility
class DevToolsProtection {
    constructor() {
        this.isDevToolsOpen = false;
        this.init();
    }

    init() {
        this.disableRightClick();
        this.disableKeyboardShortcuts();
        this.detectDevTools();
        this.disableConsole();
        this.disableSelectText();
    }

    // Disable right-click context menu
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    }

    // Disable keyboard shortcuts
    disableKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+I or Cmd+Shift+I (Developer Tools)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+J or Cmd+Shift+J (Console)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            // Ctrl+U or Cmd+U (View Source)
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+C or Cmd+Shift+C (Inspect Element)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+I (Mac Developer Tools)
            if (e.metaKey && e.altKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+J (Mac Console)
            if (e.metaKey && e.altKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+C (Mac Inspect Element)
            if (e.metaKey && e.altKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
        });
    }

    // Detect if developer tools are open
    detectDevTools() {
        setInterval(() => {
            const threshold = 160;
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!this.isDevToolsOpen) {
                    this.isDevToolsOpen = true;
                    this.handleDevToolsOpen();
                }
            } else {
                this.isDevToolsOpen = false;
            }
        }, 500);
    }

    // Handle when dev tools are detected
    handleDevToolsOpen() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #f8f9fa;
                font-family: Arial, sans-serif;
                text-align: center;
            ">
                <div>
                    <h1 style="color: #dc3545; margin-bottom: 20px;">⚠️ Access Restricted</h1>
                    <p style="color: #6c757d; font-size: 18px;">Developer tools are not allowed in this application.</p>
                    <p style="color: #6c757d;">Please close developer tools and refresh the page.</p>
                    <button onclick="window.location.reload()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">Refresh Page</button>
                </div>
            </div>
        `;
    }

    // Disable console methods
    disableConsole() {
        const noop = () => {};
        const methods = ['log', 'warn', 'error', 'info', 'debug', 'trace', 'dir', 'dirxml', 'table', 'clear'];
        
        methods.forEach(method => {
            Object.defineProperty(console, method, {
                value: noop,
                writable: false,
                configurable: false
            });
        });

        // Clear existing console
        if (console.clear) {
            console.clear();
        }
    }

    // Allow text selection everywhere
    disableSelectText() {
        // Text selection is now allowed everywhere
    }
}

// Initialize protection
export const initDevToolsProtection = () => {
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
        new DevToolsProtection();
    }
};

export default DevToolsProtection;