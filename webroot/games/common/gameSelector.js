/**
 * Game Selector Module
 * Handles the arcade-style game selector UI
 */

/**
 * Initialize the game selector UI
 * @param {Object} appContext - Application context
 */
export function initGameSelector(appContext) {
    // Remove any existing game buttons
    const existingGameBtn = document.getElementById('show-game-button');
    const existingQuizBtn = document.getElementById('show-quiz-button');

    if (existingGameBtn) document.body.removeChild(existingGameBtn);
    if (existingQuizBtn) document.body.removeChild(existingQuizBtn);

    // Get references to the selector elements
    const gameSelector = document.getElementById('arcade-game-selector');
    const populationBlock = document.getElementById('population-game');
    const quizBlock = document.getElementById('quiz-game');
    const populationScore = document.getElementById('population-score');
    const quizScore = document.getElementById('quiz-score');

    // Update initial scores if available
    if (appContext.gameState && appContext.gameState.score !== undefined) {
        populationScore.textContent = appContext.gameState.score;
    }

    if (appContext.quizScore !== undefined) {
        quizScore.textContent = appContext.quizScore;
    }

    // Add event listeners to game blocks
    populationBlock.addEventListener('click', () => {
        if (!appContext.gameActive) {
            // Start the population game and hide the selector
            appContext.startNewGame();
            gameSelector.style.opacity = '0';
            setTimeout(() => {
                gameSelector.style.display = 'none';
            }, 300);
        } else {
            appContext.quitGame();
        }
    });

    quizBlock.addEventListener('click', () => {
        if (!appContext.quizActive) {
            // Start the quiz game and hide the selector
            appContext.startQuizGame();
            gameSelector.style.opacity = '0';
            setTimeout(() => {
                gameSelector.style.display = 'none';
            }, 300);
        } else {
            appContext.quitQuizGame();
        }
    });

    // Set up listener for score updates
    window.addEventListener('message', function (event) {
        // Check if it's a game finished event
        if (event.data && event.data.type === 'gameFinished') {
            // Update scores
            if (appContext.gameState && appContext.gameState.score !== undefined) {
                populationScore.textContent = appContext.gameState.score;
            }

            if (appContext.quizScore !== undefined) {
                quizScore.textContent = appContext.quizScore;
            }

            // Show the game selector after a small delay
            setTimeout(() => {
                if (!appContext.gameActive && !appContext.quizActive) {
                    gameSelector.style.display = 'flex';
                    setTimeout(() => {
                        gameSelector.style.opacity = '1';
                    }, 10);
                }
            }, 1000); // Delay showing selector to avoid interrupting end game UI
        }
    });

    // Ensure the selector is initially visible
    gameSelector.style.display = 'flex';
    gameSelector.style.opacity = '1';

    return gameSelector;
}