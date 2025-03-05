/**
 * Population Target Game - Main module
 * Coordinates between game state, UI, and logic
 */
import {GameState} from './state.js';
import {initGameUI, updateGameUI, showRoundResults, showAnimatedTarget, showToast} from './ui.js';
import {calculateScore, getRandomTarget, formatNumber} from './game.js';

let gameState;

/**
 * Initialize the Population Target game
 * @param {Object} appContext - Global application context
 */
export function initPopulationGame(appContext) {
    console.log('Initializing Population Target game...');

    // Create game state
    gameState = new GameState();

    // Store references in app context
    appContext.gameState = gameState;

    // Initialize gameSelectedCountries if it doesn't exist
    if (!appContext.gameSelectedCountries) {
        appContext.gameSelectedCountries = [];
    }

    // Link game state selected country codes to app context
    appContext.gameSelectedCountries = gameState.selectedCountryCodes;

    // Set up game callback handlers in app context
    appContext.startNewGame = () => startNewGame(appContext);
    appContext.quitGame = () => quitGame(appContext);
    appContext.resetSelections = () => resetSelections(appContext);

    // Country selection handler
    appContext.onCountrySelected = (feature) => {
        if (gameState.isActive && gameState.selectedCountries.length < gameState.maxCountries) {
            handleCountrySelection(feature, appContext);
        }
    };

    // Initialize UI elements
    initGameUI(gameState, {
        onStartGame: () => startNewGame(appContext),
        onResetSelections: () => resetSelections(appContext)
    });

    console.log('Population Target game initialized');
}

/**
 * Start a new game round
 * @param {Object} appContext - Application context
 */
function startNewGame(appContext) {
    console.log('Starting new Population Target game round');

    // Reset for a new game
    resetSelections(appContext);

    // Generate random target population
    const targetPopulation = getRandomTarget();
    gameState.targetPopulation = targetPopulation;
    gameState.isActive = true;
    gameState.round++;

    // Show UI elements
    const exitButton = document.getElementById('exit-button');
    if (exitButton) exitButton.style.display = 'block';

    // Update app context flags
    appContext.gameActive = true;

    // Update UI
    updateGameUI(gameState);

    // Animate the target display
    showAnimatedTarget(targetPopulation);

    // Show toast notification
    showToast(`New game started! Select ${gameState.maxCountries} countries to match the target population.`, 3000);
}

/**
 * Handle country selection for the game
 * @param {Object} feature - GeoJSON feature of selected country
 * @param {Object} appContext - Application context
 */
function handleCountrySelection(feature, appContext) {
    // Get country information
    const countryCode = feature.properties.code || feature.properties.ISO_A3;
    const countryName = feature.properties.name || feature.properties.NAME;
    const population = feature.properties.population || feature.properties.POP_EST || 0;

    // Check if country is already selected
    if (gameState.selectedCountries.find(c => c.code === countryCode)) {
        showToast('Country already selected!', 2000);
        return;
    }

    // Add country to selection
    gameState.selectCountry({
        code: countryCode,
        name: countryName,
        population: population
    });

    // Force a redraw of the globe
    appContext.needsRedraw = true;

    // Update UI
    updateGameUI(gameState);

    // If max number of countries are selected, calculate score
    if (gameState.selectedCountries.length === gameState.maxCountries) {
        finishRound(appContext);
    }
}

/**
 * Calculate score and end the round
 * @param {Object} appContext - Application context
 */
function finishRound(appContext) {
    // Calculate total population of selected countries
    const totalPopulation = gameState.getTotalPopulation();

    // Calculate difference from target
    const difference = Math.abs(totalPopulation - gameState.targetPopulation);

    // Calculate score
    const roundScore = calculateScore(totalPopulation, gameState.targetPopulation, gameState.selectedCountries.length);

    // Update total score
    gameState.score += roundScore;

    // Show round results
    showRoundResults(gameState.targetPopulation, totalPopulation, difference, roundScore, gameState.score);

    // Send game results to parent
    window.parent.postMessage(
        {
            type: 'gameFinished',
            data: {
                roundScore: roundScore
            }
        },
        '*'
    );
}

/**
 * Reset current selections
 * @param {Object} appContext - Application context
 */
function resetSelections(appContext) {
    gameState.clearSelections();

    // Update UI
    updateGameUI(gameState);

    // Force a redraw of the globe
    appContext.needsRedraw = true;
}

/**
 * Quit the game
 * @param {Object} appContext - Application context
 */
function quitGame(appContext) {
    // Reset game state
    resetSelections(appContext);
    gameState.isActive = false;

    // Update app context
    appContext.gameActive = false;

    // Hide the game UI
    const gamePanel = document.getElementById('minimized-selection-panel');
    if (gamePanel) {
        gamePanel.style.display = 'none';
    }

    // Check if quiz is also inactive before hiding exit button
    if (!appContext.quizActive) {
        const exitButton = document.getElementById('exit-button');
        if (exitButton) {
            exitButton.style.display = 'none';
        }
    }

    // Force a redraw of the globe
    appContext.needsRedraw = true;
}