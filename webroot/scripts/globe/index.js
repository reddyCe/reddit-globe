/**
 * Main Globe visualization module
 * Coordinates between renderer, interaction, and data components
 */
import {initCanvas, drawGlobe, setupStars} from './renderer.js';
import {setupInteractions} from './interaction.js';
import {loadGeoJsonData} from './data.js';

// Main globe state
let canvas, ctx;
let centerX, centerY;
let rotation = {x: 0.3, y: 0};
let zoomScale = 1.0;
let animationId = null;

/**
 * Initialize the globe visualization
 * @param {Object} appContext - Global application context
 * @returns {Promise} - Resolves when globe is initialized
 */
export async function initGlobe(appContext) {
    console.log('Initializing globe...');

    // Set up loading indicator
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'block';

    try {
        // Initialize canvas and get context
        const canvasInit = initCanvas();
        canvas = canvasInit.canvas;
        ctx = canvasInit.ctx;
        centerX = canvasInit.centerX;
        centerY = canvasInit.centerY;

        // Update app context with canvas references
        appContext.canvas = canvas;
        appContext.ctx = ctx;
        appContext.centerX = centerX;
        appContext.centerY = centerY;
        appContext.rotation = rotation;
        appContext.zoomScale = zoomScale;

        // Initialize gameSelectedCountries and quizSelectedCountries if not exists
        if (!appContext.gameSelectedCountries) {
            appContext.gameSelectedCountries = [];
        }

        if (!appContext.quizSelectedCountries) {
            appContext.quizSelectedCountries = [];
        }

        if (!appContext.quizCorrectCountries) {
            appContext.quizCorrectCountries = [];
        }

        // Generate stars background
        setupStars(appContext, 400);

        // Load GeoJSON data
        appContext.worldData = await loadGeoJsonData();
        console.log('GeoJSON data loaded');

        // Set up user interactions
        setupInteractions(appContext);

        // Start animation loop
        startAnimationLoop(appContext);

        // Hide loading indicator
        if (loadingElement) loadingElement.style.display = 'none';

        return appContext;
    } catch (error) {
        console.error('Failed to initialize globe:', error);
        if (loadingElement) {
            loadingElement.textContent = 'Failed to load globe data. Please refresh the page.';
        }
        throw error;
    }
}

/**
 * Start the animation loop for continuous rendering
 * @param {Object} appContext - Global application context
 */
function startAnimationLoop(appContext) {
    // Animation function for the globe
    function animateGlobe() {
        if (appContext.needsRedraw) {
            drawGlobe(appContext);
            appContext.needsRedraw = false;
        }

        // Continue the animation loop
        animationId = requestAnimationFrame(animateGlobe);
    }

    // Start the animation loop
    animationId = requestAnimationFrame(animateGlobe);
}

/**
 * Stop the animation loop
 */
export function stopGlobeAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

/**
 * Force a redraw of the globe
 * @param {Object} appContext - Global application context
 */
export function redrawGlobe(appContext) {
    appContext.needsRedraw = true;
}