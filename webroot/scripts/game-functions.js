// This script ensures the game functions are globally accessible
function exposeGameFunctions() {
    // For the population game
    if (typeof startNewGame === 'function' && typeof window.startNewGame === 'undefined') {
        window.startNewGame = startNewGame;
        console.log("Exposed startNewGame to global scope");
    }

    if (typeof quitGame === 'function' && typeof window.quitGame === 'undefined') {
        window.quitGame = quitGame;
        console.log("Exposed quitGame to global scope");
    }

    // For the quiz game
    if (typeof startQuizGame === 'function' && typeof window.startQuizGame === 'undefined') {
        window.startQuizGame = startQuizGame;
        console.log("Exposed startQuizGame to global scope");
    }

    if (typeof quitQuizGame === 'function' && typeof window.quitQuizGame === 'undefined') {
        window.quitQuizGame = quitQuizGame;
        console.log("Exposed quitQuizGame to global scope");
    }
}

// Run this function after a delay to ensure the original functions are defined
setTimeout(exposeGameFunctions, 1000);