// Game state variables
let targetPopulation = 0;
let selectedCountries = [];
let gameActive = false;
let gameRound = 0;
let gameScore = 0;

// Constants
const NUMBER_OF_COUNTRIES = Math.floor(Math.random() * 2) + 3;


let startButton;
let resetButton;
let minimizedSelectionPanel;

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    // Add game initialization to the existing code
    initGameElements();
    setupGameEventListeners();
});

// Add to the original setup event listeners to ensure game elements are visible
const originalSetupEventListeners = setupEventListeners;
setupEventListeners = function() {
    originalSetupEventListeners();

    // Add button to show game panel
    const showGameButton = document.createElement('button');
    showGameButton.id = 'show-game-button';
    showGameButton.textContent = 'Play Population Game';
    showGameButton.style.position = 'absolute';
    showGameButton.style.top = '10px';
    showGameButton.style.right = '10px';
    showGameButton.style.backgroundColor = '#FF5700';
    showGameButton.style.color = 'white';
    showGameButton.style.border = 'none';
    showGameButton.style.padding = '10px 15px';
    showGameButton.style.borderRadius = '25px';
    showGameButton.style.cursor = 'pointer';
    showGameButton.style.zIndex = '1000';

    showGameButton.addEventListener('click', () => {
        if (!gameActive) {
            startNewGame();
            showGameButton.textContent = 'Quit Game';
        } else {
            quitGame();
            showGameButton.textContent = 'Play Population Game';
        }
    });

    document.body.appendChild(showGameButton);
};