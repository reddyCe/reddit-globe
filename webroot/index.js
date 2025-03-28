/**
 * Main entry point for the Globe Explorer frontend application
 */
import {initGlobe} from './scripts/globe/index.js';
import {initCommunication} from './scripts/communication.js';
import {initGameSelector} from './games/common/gameSelector.js';
import {initPopulationGame} from './games/population/index.js';
import {initQuizGame} from './games/quiz/index.js';
import {initPlaneAnimation, animatePlane} from './scripts/planeAnimation.js';
import {showToast} from './components/toast.js';

// Create an application context to share state between modules
const appContext = {
    gameActive: false,
    quizActive: false,
    worldData: null,
    selectedCountries: [],
    hoveredFeature: null,
    needsRedraw: true,
    // Add explicit initializations for country selection tracking
    gameSelectedCountries: [],
    quizSelectedCountries: [],
    quizCorrectCountries: [],
    // Add plane animation tracking
    planeAnimationActive: false,
    pendingFlightFrom: null,
    pendingFlightTo: null
};

// Initialize the application once the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Globe Explorer initializing...');

    // Set up the info banner
    setupInfoBanner();

    try {
        // Initialize core globe visualization
        await initGlobe(appContext);
        console.log('Globe visualization initialized');

        // Initialize plane animation
        appContext.planeAnimation = initPlaneAnimation();
        console.log('Plane animation initialized');

        // Initialize game modules
        initPopulationGame(appContext);
        console.log('Population game initialized');

        initQuizGame(appContext);
        console.log('Quiz game initialized');

        // Initialize game selector UI
        initGameSelector(appContext);
        console.log('Game selector initialized');

        // Initialize communication with Devvit
        initCommunication(appContext);
        console.log('Communication layer initialized');

        // Set up a custom handler for normal (non-game) country clicks
        // This will be used for the plane animation
        setupFlightAnimationClicks(appContext);

        console.log('Globe Explorer initialization complete');
    } catch (error) {
        console.error('Error initializing application:', error);
        showErrorMessage('Failed to initialize the application. Please try again later.');
    }
});

/**
 * Set up flight animation click handling
 * @param {Object} appContext - Application context
 */
function setupFlightAnimationClicks(appContext) {
    const originalLocationClicked = appContext.onLocationClicked;

    // Override the location clicked handler
    appContext.onLocationClicked = (location) => {
        // Skip if in game mode
        if (appContext.gameActive || appContext.quizActive) {
            // Use original handler
            if (originalLocationClicked) {
                originalLocationClicked(location);
            }
            return;
        }

        // If plane animation is active, ignore clicks
        if (appContext.planeAnimationActive) {
            return;
        }

        // If no pending source, set this as source
        if (!appContext.pendingFlightFrom) {
            appContext.pendingFlightFrom = location;
            showToast('Click on another country to animate flight', 3000);

            // Create a marker for the source
            createSelectionMarker(appContext, location, 'source');

            return;
        }

        // If source is set, but no destination, set this as destination
        if (appContext.pendingFlightFrom && !appContext.pendingFlightTo) {
            // Don't allow same country
            if (appContext.pendingFlightFrom.code === location.code) {
                showToast('Please select a different country for destination', 2000);
                return;
            }

            appContext.pendingFlightTo = location;

            // Create a marker for the destination
            createSelectionMarker(appContext, location, 'destination');

            // Start plane animation
            appContext.planeAnimationActive = true;

            animatePlane(
                appContext,
                appContext.pendingFlightFrom,
                appContext.pendingFlightTo,
                3000, // 3 seconds duration
                () => {
                    // When animation finishes
                    appContext.planeAnimationActive = false;

                    // Clear the selection markers
                    clearSelectionMarkers();

                    // Reset flight points
                    appContext.pendingFlightFrom = null;
                    appContext.pendingFlightTo = null;

                    // Force a redraw
                    appContext.needsRedraw = true;
                }
            );

            return;
        }

        // If both are set, reset everything and set new source
        if (appContext.pendingFlightFrom && appContext.pendingFlightTo) {
            // Clear markers
            clearSelectionMarkers();

            // Reset and start over with new source
            appContext.pendingFlightFrom = location;
            appContext.pendingFlightTo = null;

            // Create a marker for the new source
            createSelectionMarker(appContext, location, 'source');

            showToast('Click on another country to animate flight', 3000);
            return;
        }

        // Fallback to original handler if needed
        if (originalLocationClicked) {
            originalLocationClicked(location);
        }
    };
}

/**
 * Create a selection marker for the flight source/destination
 * @param {Object} appContext - Application context
 * @param {Object} location - Location data
 * @param {string} type - 'source' or 'destination'
 */
function createSelectionMarker(appContext, location, type) {
    // Calculate position
    const point = projectGlobePoint(appContext, location.lat, location.lng);

    // Only create if visible
    if (point.z <= 0) return;

    // Remove any existing marker of this type
    const existingMarker = document.querySelector(`.country-selection-marker.${type}`);
    if (existingMarker) {
        existingMarker.remove();
    }

    const existingLabel = document.querySelector(`.country-selection-label.${type}`);
    if (existingLabel) {
        existingLabel.remove();
    }

    // Create marker
    const marker = document.createElement('div');
    marker.className = `country-selection-marker ${type}`;
    marker.style.left = `${point.x}px`;
    marker.style.top = `${point.y}px`;
    document.body.appendChild(marker);

    // Create label
    const label = document.createElement('div');
    label.className = `country-selection-label ${type}`;
    label.textContent = type === 'source' ? 'From: ' + location.name : 'To: ' + location.name;
    label.style.left = `${point.x}px`;
    label.style.top = `${point.y}px`;
    document.body.appendChild(label);
}

/**
 * Clear all selection markers
 */
function clearSelectionMarkers() {
    const markers = document.querySelectorAll('.country-selection-marker');
    markers.forEach(marker => marker.remove());

    const labels = document.querySelectorAll('.country-selection-label');
    labels.forEach(label => label.remove());
}

/**
 * Project 3D globe coordinates to 2D screen coordinates
 * Simplified version from globe/renderer.js
 * @param {Object} appContext - Application context
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @returns {Object} Projected point {x, y, z}
 */
function projectGlobePoint(appContext, lat, lng) {
    const {centerX, centerY, rotation, zoomScale} = appContext;
    const EARTH_RADIUS = 240;

    // Convert to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Calculate 3D coordinates on a sphere
    const x = EARTH_RADIUS * Math.cos(latRad) * Math.sin(lngRad);
    const y = EARTH_RADIUS * Math.sin(latRad);
    const z = EARTH_RADIUS * Math.cos(latRad) * Math.cos(lngRad);

    // Apply rotation to get the visible coordinates
    const rotatedPoint = rotatePoint(x, y, z, rotation);

    // Apply zoom and project 3D to 2D
    return {
        x: centerX + rotatedPoint.x * zoomScale,
        y: centerY - rotatedPoint.y * zoomScale,
        z: rotatedPoint.z / EARTH_RADIUS // Normalized z for depth
    };
}

/**
 * Rotate a point in 3D space
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {Object} rotation - Rotation angles {x, y}
 * @returns {Object} Rotated point {x, y, z}
 */
function rotatePoint(x, y, z, rotation) {
    // Rotate around X axis
    const y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
    const z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);

    // Rotate around Y axis
    const x2 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
    const z2 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);

    return {x: x2, y: y1, z: z2};
}

// Display error message to the user
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
}

/**
 * Set up the info banner
 */
function setupInfoBanner() {
    const infoBanner = document.getElementById('plane-animation-info');

    // Show the banner initially
    infoBanner.style.display = 'flex';

    // Function to update banner visibility based on game state
    const updateBannerVisibility = () => {
        if (appContext.gameActive || appContext.quizActive || appContext.planeAnimationActive) {
            infoBanner.style.display = 'none';
        } else {
            infoBanner.style.display = 'flex';
        }
    };

    // Add game start event listeners
    const populationGameBlock = document.getElementById('population-game');
    if (populationGameBlock) {
        populationGameBlock.addEventListener('click', () => {
            // Hide the banner immediately when game block is clicked
            infoBanner.style.display = 'none';
        });
    }

    const quizGameBlock = document.getElementById('quiz-game');
    if (quizGameBlock) {
        quizGameBlock.addEventListener('click', () => {
            // Hide the banner immediately when quiz block is clicked
            infoBanner.style.display = 'none';
        });
    }

    // Hide banner when flight animation starts
    const originalAnimatePlane = animatePlane;
    window.animatePlane = (...args) => {
        infoBanner.style.display = 'none';
        return originalAnimatePlane(...args);
    };

    // Show banner again when returning to the main menu
    document.getElementById('exit-button').addEventListener('click', () => {
        setTimeout(() => {
            updateBannerVisibility();
        }, 300);
    });

    // Add a direct game state observer - update every second
    setInterval(updateBannerVisibility, 1000);
}

// Export the context for debugging purposes
window.appContext = appContext;