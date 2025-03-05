/**
 * Tooltip Component
 * Reusable tooltip for displaying information on hover
 */

let tooltipElement;
let tooltipVisible = false;

/**
 * Initialize the tooltip component
 */
export function initTooltip() {
    // Check if tooltip already exists
    tooltipElement = document.getElementById('tooltip');

    // Create tooltip if it doesn't exist
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'tooltip';
        tooltipElement.style.position = 'absolute';
        tooltipElement.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        tooltipElement.style.color = 'white';
        tooltipElement.style.padding = '10px';
        tooltipElement.style.borderRadius = '5px';
        tooltipElement.style.fontSize = '14px';
        tooltipElement.style.pointerEvents = 'none';
        tooltipElement.style.display = 'none';
        tooltipElement.style.zIndex = '1000';
        tooltipElement.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.3)';
        tooltipElement.style.transition = 'opacity 0.2s ease-in-out';

        document.body.appendChild(tooltipElement);
    }

    return tooltipElement;
}

/**
 * Show the tooltip with specific content and position
 * @param {Object} options - Tooltip options
 * @param {string} options.content - HTML content to display
 * @param {number} options.x - X position
 * @param {number} options.y - Y position
 */
export function showTooltip(options) {
    // Initialize tooltip if needed
    if (!tooltipElement) {
        tooltipElement = initTooltip();
    }

    // Set content
    tooltipElement.innerHTML = options.content;

    // Position tooltip with some offset from pointer
    tooltipElement.style.left = `${options.x + 15}px`;
    tooltipElement.style.top = `${options.y + 15}px`;

    // Make sure tooltip stays within viewport
    const tooltipRect = tooltipElement.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        tooltipElement.style.left = `${options.x - tooltipRect.width - 10}px`;
    }
    if (tooltipRect.bottom > window.innerHeight) {
        tooltipElement.style.top = `${options.y - tooltipRect.height - 10}px`;
    }

    // Show tooltip with a fade-in effect
    tooltipElement.style.display = 'block';
    tooltipElement.style.opacity = '0';

    setTimeout(() => {
        tooltipElement.style.opacity = '1';
    }, 10);

    tooltipVisible = true;
}

/**
 * Hide the tooltip
 */
export function hideTooltip() {
    if (!tooltipElement || !tooltipVisible) return;

    tooltipElement.style.opacity = '0';
    setTimeout(() => {
        tooltipElement.style.display = 'none';
    }, 200);

    tooltipVisible = false;
}

/**
 * Update tooltip position (for mousemove events)
 * @param {number} x - X position
 * @param {number} y - Y position
 */
export function updateTooltipPosition(x, y) {
    if (!tooltipElement || !tooltipVisible) return;

    tooltipElement.style.left = `${x + 15}px`;
    tooltipElement.style.top = `${y + 15}px`;

    // Make sure tooltip stays within viewport
    const tooltipRect = tooltipElement.getBoundingClientRect();
    if (tooltipRect.right > window.innerWidth) {
        tooltipElement.style.left = `${x - tooltipRect.width - 10}px`;
    }
    if (tooltipRect.bottom > window.innerHeight) {
        tooltipElement.style.top = `${y - tooltipRect.height - 10}px`;
    }
}