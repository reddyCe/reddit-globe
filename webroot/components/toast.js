/**
 * Toast Component
 * Provides non-intrusive notifications
 */

let activeToast = null;
let toastTimeout = null;

/**
 * Show a toast notification
 * @param {Object} options - Toast options
 * @param {string} options.message - Message to display
 * @param {string} [options.type='info'] - Toast type (info, success, error, warning)
 * @param {number} [options.duration=3000] - Duration in milliseconds
 * @param {boolean} [options.showIcon=true] - Whether to show an icon
 */
export function showToast(options) {
    // Default options
    const config = {
        message: '',
        type: 'info',
        duration: 3000,
        showIcon: true,
        ...options
    };

    // Remove existing toast if any
    if (activeToast) {
        document.body.removeChild(activeToast);
        clearTimeout(toastTimeout);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';

    // Add toast content container
    const toastContent = document.createElement('div');
    toastContent.className = 'toast-content';

    // Add icon based on type
    if (config.showIcon) {
        const icon = document.createElement('span');
        icon.className = 'toast-icon';

        switch (config.type) {
            case 'success':
                icon.textContent = '✓';
                icon.style.color = '#4CAF50';
                break;
            case 'error':
                icon.textContent = '✕';
                icon.style.color = '#F44336';
                break;
            case 'warning':
                icon.textContent = '⚠';
                icon.style.color = '#FF9800';
                break;
            default: // info
                icon.textContent = 'ℹ';
                icon.style.color = '#2196F3';
                break;
        }

        toastContent.appendChild(icon);
    }

    // Add message
    toastContent.appendChild(document.createTextNode(config.message));
    toast.appendChild(toastContent);

    // Apply type-specific styling
    switch (config.type) {
        case 'success':
            toast.style.borderLeft = '4px solid #4CAF50';
            break;
        case 'error':
            toast.style.borderLeft = '4px solid #F44336';
            break;
        case 'warning':
            toast.style.borderLeft = '4px solid #FF9800';
            break;
        default: // info
            toast.style.borderLeft = '4px solid #2196F3';
            break;
    }

    // Add to document
    document.body.appendChild(toast);
    activeToast = toast;

    // Fade in
    toast.style.opacity = '0';
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    // Remove after duration
    toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
                activeToast = null;
            }
        }, 300);
    }, config.duration);

    return toast;
}

/**
 * Hide the active toast
 */
export function hideToast() {
    if (!activeToast) return;

    activeToast.style.opacity = '0';
    setTimeout(() => {
        if (activeToast && activeToast.parentNode) {
            document.body.removeChild(activeToast);
            activeToast = null;
        }
    }, 300);

    clearTimeout(toastTimeout);
}