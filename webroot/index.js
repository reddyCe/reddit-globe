/**
 * Main entry point for the Globe Explorer frontend application
 */
import {initGlobe} from './scripts/globe/index.js';
import {initCommunication} from './scripts/communication.js';
import {initGameSelector} from './games/common/gameSelector.js';
import {initPopulationGame} from './games/population/index.js';
import {initQuizGame} from './games/quiz/index.js';

// Create an application context to share state between modules
const appContext = {
    gameActive: false,
    quizActive: false,
    worldData: null,
    selectedCountries: [],
    hoveredFeature: null,
    needsRedraw: true
};

// Initialize the application once the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Globe Explorer initializing...');

    try {
        // Initialize core globe visualization
        await initGlobe(appContext);
        console.log('Globe visualization initialized');

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

        console.log('Globe Explorer initialization complete');
    } catch (error) {
        console.error('Error initializing application:', error);
        showErrorMessage('Failed to initialize the application. Please try again later.');
    }
});

// Display error message to the user
function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
}

// Export the context for debugging purposes
window.appContext = appContext;