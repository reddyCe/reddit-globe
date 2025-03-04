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

// Arcade Game Selector Implementation
function initArcadeGameSelector() {
    // Remove existing game buttons if they exist
    const existingGameBtn = document.getElementById('show-game-button');
    const existingQuizBtn = document.getElementById('show-quiz-button');

    if (existingGameBtn) document.body.removeChild(existingGameBtn);
    if (existingQuizBtn) document.body.removeChild(existingQuizBtn);

    // Create the HTML structure
    const selectorHTML = `
    <div id="arcade-game-selector" class="game-selector">
      <div id="population-game" class="game-block population-game">
        <h3 class="game-title">POPULATION TARGET</h3>
        <p class="game-desc">Match the target population by selecting countries</p>
        <div class="game-score">KARMA: <span id="population-score">0</span></div>
      </div>
      
      <div id="quiz-game" class="game-block quiz-game">
        <h3 class="game-title">GEOGRAPHY QUIZ</h3>
        <p class="game-desc">Test your knowledge of countries and geography</p>
        <div class="game-score">SCORE: <span id="quiz-score">0</span></div>
      </div>
    </div>
  `;

    // Insert the HTML into the document
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = selectorHTML;
    document.body.appendChild(tempDiv.firstElementChild);

    // Get references to the elements
    const gameSelector = document.getElementById('arcade-game-selector');
    const populationBlock = document.getElementById('population-game');
    const quizBlock = document.getElementById('quiz-game');
    const populationScore = document.getElementById('population-score');
    const quizScore = document.getElementById('quiz-score');

    // Update initial scores if available
    if (window.gameScore !== undefined) {
        populationScore.textContent = window.gameScore;
    }

    if (window.quizScore !== undefined) {
        quizScore.textContent = window.quizScore;
    }

    // Add event listeners to game blocks
    populationBlock.addEventListener('click', () => {
        if (!window.gameActive) {
            // Start the game and hide the selector
            window.startNewGame();
            gameSelector.style.opacity = '0';
            setTimeout(() => {
                gameSelector.style.display = 'none';
            }, 300);
        } else {
            window.quitGame();
        }
    });

    quizBlock.addEventListener('click', () => {
        if (!window.quizActive) {
            // Start the quiz and hide the selector
            window.startQuizGame();
            gameSelector.style.opacity = '0';
            setTimeout(() => {
                gameSelector.style.display = 'none';
            }, 300);
        } else {
            window.quitQuizGame();
        }
    });

    // Override the quit functions to show the selector
    const originalQuitGame = window.quitGame;
    window.quitGame = function () {
        originalQuitGame();
        // Show game selector with animation
        gameSelector.style.display = 'flex';
        setTimeout(() => {
            gameSelector.style.opacity = '1';
        }, 10);
    };

    const originalQuitQuizGame = window.quitQuizGame;
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
            if (window.gameScore !== undefined) {
                populationScore.textContent = window.gameScore;
            }

            if (window.quizScore !== undefined) {
                quizScore.textContent = window.quizScore;
            }

            // Show the game selector after a small delay
            setTimeout(() => {
                if (!window.gameActive && !window.quizActive) {
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
        }, 500);
    });
};