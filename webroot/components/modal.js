/**
 * Modal Component
 * Creates customizable modal dialogs
 */

let activeModals = [];
let modalCounter = 0;

/**
 * Create and show a modal
 * @param {Object} options - Modal options
 * @param {string} [options.title] - Modal title
 * @param {string|HTMLElement} [options.content] - Modal content (string or HTML element)
 * @param {Array} [options.buttons] - Button definitions [{label, onClick, type}]
 * @param {boolean} [options.closeOnBackdrop=true] - Whether clicking the backdrop closes the modal
 * @param {boolean} [options.showClose=true] - Whether to show a close button
 * @param {string} [options.size='medium'] - Modal size (small, medium, large)
 * @param {function} [options.onClose] - Callback when modal is closed
 * @returns {Object} Modal control object with close method
 */
export function showModal(options) {
    // Default options
    const config = {
        title: '',
        content: '',
        buttons: [],
        closeOnBackdrop: true,
        showClose: true,
        size: 'medium',
        onClose: null,
        ...options
    };

    // Create modal ID
    const modalId = `modal-${++modalCounter}`;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = `${modalId}-backdrop`;

    // Create modal container
    const modal = document.createElement('div');
    modal.className = `modal modal-${config.size}`;
    modal.id = modalId;

    // Create modal header if title is provided
    if (config.title) {
        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.textContent = config.title;
        header.appendChild(title);

        // Add close button
        if (config.showClose) {
            const closeButton = document.createElement('button');
            closeButton.className = 'modal-close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => closeModal(modalId));
            header.appendChild(closeButton);
        }

        modal.appendChild(header);
    }

    // Create modal content
    const contentElement = document.createElement('div');
    contentElement.className = 'modal-content';

    // Add content (string or element)
    if (typeof config.content === 'string') {
        contentElement.innerHTML = config.content;
    } else if (config.content instanceof HTMLElement) {
        contentElement.appendChild(config.content);
    }

    modal.appendChild(contentElement);

    // Add buttons if provided
    if (config.buttons && config.buttons.length > 0) {
        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        config.buttons.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = button.label;
            buttonElement.className = `button-${button.type || 'secondary'}`;

            // Handle button click
            buttonElement.addEventListener('click', (e) => {
                if (button.onClick) {
                    button.onClick(e);
                }

                // Close modal if not prevented
                if (button.closeOnClick !== false) {
                    closeModal(modalId);
                }
            });

            footer.appendChild(buttonElement);
        });

        modal.appendChild(footer);
    }

    // Append modal to backdrop
    backdrop.appendChild(modal);

    // Add to document
    document.body.appendChild(backdrop);

    // Handle backdrop click
    if (config.closeOnBackdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closeModal(modalId);
            }
        });
    }

    // Add keydown handler for Escape
    const keyHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(modalId);
        }
    };
    document.addEventListener('keydown', keyHandler);

    // Store modal info
    activeModals.push({
        id: modalId,
        element: backdrop,
        keyHandler,
        onClose: config.onClose
    });

    // Animate in
    setTimeout(() => {
        backdrop.style.opacity = '1';
        modal.style.transform = 'translateY(0)';
    }, 10);

    // Return control object
    return {
        id: modalId,
        close: () => closeModal(modalId),
        getElement: () => modal,
        getContentElement: () => contentElement,
        getBackdrop: () => backdrop
    };
}

/**
 * Close a specific modal
 * @param {string} modalId - ID of the modal to close
 */
export function closeModal(modalId) {
    const modalIndex = activeModals.findIndex(m => m.id === modalId);
    if (modalIndex === -1) return;

    const {element, keyHandler, onClose} = activeModals[modalIndex];

    // Animate out
    element.style.opacity = '0';
    const modal = element.querySelector('.modal');
    if (modal) {
        modal.style.transform = 'translateY(-20px)';
    }

    // Remove after animation
    setTimeout(() => {
        if (element.parentNode) {
            document.body.removeChild(element);
        }

        // Remove keydown handler
        document.removeEventListener('keydown', keyHandler);

        // Call onClose callback
        if (onClose) {
            onClose();
        }

        // Remove from active modals
        activeModals.splice(modalIndex, 1);
    }, 300);
}

/**
 * Close all active modals
 */
export function closeAllModals() {
    // Clone the array because we'll be modifying it while iterating
    const modalsToClose = [...activeModals];
    modalsToClose.forEach(modal => closeModal(modal.id));
}

/**
 * Show a confirmation modal
 * @param {Object} options - Confirmation options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Confirmation message
 * @param {string} [options.confirmText='Confirm'] - Confirm button text
 * @param {string} [options.cancelText='Cancel'] - Cancel button text
 * @param {function} [options.onConfirm] - Callback when confirmed
 * @param {function} [options.onCancel] - Callback when canceled
 * @returns {Object} Modal control object
 */
export function confirm(options) {
    return showModal({
        title: options.title,
        content: options.message,
        buttons: [
            {
                label: options.cancelText || 'Cancel',
                type: 'secondary',
                onClick: options.onCancel
            },
            {
                label: options.confirmText || 'Confirm',
                type: 'primary',
                onClick: options.onConfirm
            }
        ],
        size: 'small'
    });
}

/**
 * Show an alert modal
 * @param {Object} options - Alert options
 * @param {string} options.title - Modal title
 * @param {string} options.message - Alert message
 * @param {string} [options.buttonText='OK'] - Button text
 * @param {function} [options.onClose] - Callback when closed
 * @returns {Object} Modal control object
 */
export function alert(options) {
    return showModal({
        title: options.title,
        content: options.message,
        buttons: [
            {
                label: options.buttonText || 'OK',
                type: 'primary',
                onClick: options.onClose
            }
        ],
        size: 'small',
        onClose: options.onClose
    });
}