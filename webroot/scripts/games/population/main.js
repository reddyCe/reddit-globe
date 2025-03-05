// Game state variables
let targetPopulation = 0;
let selectedCountries = [];
let gameActive = false;
let gameRound = 0;
let gameScore = 0;

// Constants
const NUMBER_OF_COUNTRIES = Math.floor(Math.random() * 2) + 3;

// UI references
let startButton;
let resetButton;
let minimizedSelectionPanel;

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Add game initialization to the existing code
    initGameElements();
    setupGameEventListeners();
});

// Arcade Game Selector Implementation - FIXED VERSION
function initArcadeGameSelector() {
    // Remove existing game buttons if they exist
    const existingGameBtn = document.getElementById('show-game-button');
    const existingQuizBtn = document.getElementById('show-quiz-button');

    if (existingGameBtn) document.body.removeChild(existingGameBtn);
    if (existingQuizBtn) document.body.removeChild(existingQuizBtn);

    // Get references to the elements
    const gameSelector = document.getElementById('arcade-game-selector');
    const populationBlock = document.getElementById('population-game');
    const quizBlock = document.getElementById('quiz-game');
    const populationScore = document.getElementById('population-score');
    const quizScore = document.getElementById('quiz-score');

    // Update initial scores if available
    if (gameScore !== undefined) {
        populationScore.textContent = gameScore;
    }

    if (quizScore !== undefined) {
        quizScore.textContent = quizScore;
    }

    // Add event listeners to game blocks
    populationBlock.addEventListener('click', () => {
        if (!gameActive) {
            // Start the game and hide the selector
            startNewGame(); // Use the function directly without window prefix
            gameSelector.style.opacity = '0';
            setTimeout(() => {
                gameSelector.style.display = 'none';
            }, 300);
        } else {
            quitGame(); // Use the function directly without window prefix
        }
    });

    quizBlock.addEventListener('click', () => {
        if (!quizActive) {
            // Start the quiz and hide the selector
            startQuizGame(); // Use the function directly without window prefix
            gameSelector.style.opacity = '0';
            setTimeout(() => {
                gameSelector.style.display = 'none';
            }, 300);
        } else {
            quitQuizGame(); // Use the function directly without window prefix
        }
    });

    // Override the quit functions to show the selector
    const originalQuitGame = quitGame;
    window.quitGame = function () {
        originalQuitGame();
        // Show game selector with animation
        gameSelector.style.display = 'flex';
        setTimeout(() => {
            gameSelector.style.opacity = '1';
        }, 10);
    };

    const originalQuitQuizGame = quitQuizGame;
    window.quitQuizGame = function () {
        originalQuitQuizGame();
        // Show game selector with animation
        gameSelector.style.display = 'flex';
        setTimeout(() => {
            gameSelector.style.opacity = '1';
        }, 10);
    };

    // Add listener for score updates
    window.addEventListener('message', function (event) {
        // Check if it's a game finished event
        if (event.data && event.data.type === 'gameFinished') {
            // Update scores
            if (gameScore !== undefined) {
                populationScore.textContent = gameScore;
            }

            if (quizScore !== undefined) {
                quizScore.textContent = quizScore;
            }

            // Show the game selector after a small delay
            setTimeout(() => {
                if (!gameActive && !quizActive) {
                    gameSelector.style.display = 'flex';
                    setTimeout(() => {
                        gameSelector.style.opacity = '1';
                    }, 10);
                }
            }, 1000); // Delay showing selector to avoid interrupting end game UI
        }
    });

    return gameSelector;
}

// Update setupEventListeners to use arcade game selector
const originalSetupEventListeners = setupEventListeners;
setupEventListeners = function() {
    originalSetupEventListeners();

    // Allow a short delay for the globe to initialize
    window.addEventListener('load', () => {
        setTimeout(() => {
            initArcadeGameSelector();
        }, 1000); // Increased delay to make sure all scripts are loaded
    });
};