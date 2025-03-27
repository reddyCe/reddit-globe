/**
 * Geography Quiz Game - Main module
 * Coordinates between game state, UI, and logic
 */
import {QuizState} from './state.js';
import {initQuizUI, updateQuizUI, showQuizResults} from './ui.js';
import {getRandomQuestion, validateAnswer} from './game.js';
import {showToast} from '../../components/toast.js';

let quizState;

/**
 * Initialize the Geography Quiz game
 * @param {Object} appContext - Global application context
 */
export function initQuizGame(appContext) {
    console.log('Initializing Geography Quiz game...');

    // Create game state
    quizState = new QuizState();

    // Store references in app context
    appContext.quizState = quizState;
    appContext.quizSelectedCountries = quizState.selectedCountries;
    appContext.quizCorrectCountries = [];

    // Set up game callback handlers in app context
    appContext.startQuizGame = () => startQuizGame(appContext);
    appContext.quitQuizGame = () => quitQuizGame(appContext);
    appContext.resetQuizSelections = () => resetQuizSelections(appContext);

    // Country selection handler for quiz
    appContext.onQuizCountrySelected = (feature) => {
        if (quizState.isActive &&
            quizState.selectedCountries.length < quizState.currentQuestion.answer.length) {
            handleQuizCountrySelection(feature, appContext);
        }
    };

    // Initialize UI elements
    initQuizUI(quizState, {
        onStartQuiz: () => startQuizGame(appContext),
        onResetSelections: () => resetQuizSelections(appContext),
        onSubmitAnswer: () => submitQuizAnswer(appContext)
    });

    console.log('Geography Quiz game initialized');
}

/**
 * Start a new quiz game
 * @param {Object} appContext - Application context
 */
function startQuizGame(appContext) {
    console.log('Starting new Quiz game');

    // Reset for a new game
    resetQuizSelections(appContext);

    // Get a random question
    quizState.currentQuestion = getRandomQuestion();
    quizState.isActive = true;

    // Show UI elements
    const exitButton = document.getElementById('exit-button');
    if (exitButton) exitButton.style.display = 'block';

    // Update app context flags
    appContext.quizActive = true;

    // Update UI
    updateQuizUI(quizState);

    // Show toast notification
    showToast({
        message: `Quiz started! ${quizState.currentQuestion.question}`,
        type: 'info',
        duration: 5000
    });
}

/**
 * Handle country selection for the quiz
 * @param {Object} feature - GeoJSON feature of selected country
 * @param {Object} appContext - Application context
 */
function handleQuizCountrySelection(feature, appContext) {
    // Get country information
    const countryCode = feature.properties.code || feature.properties.adm0_a3_gb;
    const countryName = feature.properties.name || feature.properties.NAME;

    // Check if country is already selected
    if (quizState.selectedCountries.some(c => c.code === countryCode)) {
        showToast({
            message: 'Country already selected!',
            type: 'warning',
            duration: 2000
        });
        return;
    }

    // Add country to selection
    quizState.selectCountry({
        code: countryCode,
        name: countryName
    });

    // IMPORTANT FIX: Update the app context with a new array reference
    // This makes sure the renderer gets the latest selection data
    appContext.quizSelectedCountries = [...quizState.selectedCountries];

    // Force a redraw of the globe
    appContext.needsRedraw = true;

    // Update UI
    updateQuizUI(quizState);
}
/**
 * Submit answer for evaluation
 * @param {Object} appContext - Application context
 */
function submitQuizAnswer(appContext) {
    // Calculate correct and incorrect answers
    const selectedCodes = quizState.selectedCountries.map(country => country.code);
    const correctCodes = quizState.currentQuestion.answer;

    // Track correct and incorrect selections
    const correctSelections = selectedCodes.filter(code => correctCodes.includes(code));
    const incorrectSelections = selectedCodes.filter(code => !correctCodes.includes(code));
    const missedAnswers = correctCodes.filter(code => !selectedCodes.includes(code));

    // IMPORTANT FIX: Store correct countries for highlighting
    // Create a new array reference to ensure the renderer gets updated
    appContext.quizCorrectCountries = [...correctCodes];

    // Calculate score
    const scoreChange = (correctSelections.length * 10) - (incorrectSelections.length * 5);
    quizState.score += Math.max(0, scoreChange);

    // Update app context for score display
    appContext.quizScore = quizState.score;

    // Show results modal
    showQuizResults({
        correctSelections,
        incorrectSelections,
        missedAnswers,
        scoreChange,
        totalScore: quizState.score,
        onNewQuestion: () => startQuizGame(appContext),
        question: quizState.currentQuestion
    });

    // Highlight the correct answers on the globe
    appContext.needsRedraw = true;

    // Send score to Devvit if score is positive
    if (scoreChange > 0) {
        window.parent.postMessage(
            {
                type: 'gameFinished',
                data: {
                    roundScore: scoreChange
                }
            },
            '*'
        );
    }
}

/**
 * Reset quiz selections
 * @param {Object} appContext - Application context
 */
function resetQuizSelections(appContext) {
    quizState.clearSelections();

    // Clear correct countries highlight
    appContext.quizCorrectCountries = [];

    // Update app context to point to the new empty array
    appContext.quizSelectedCountries = [];

    // Update UI
    updateQuizUI(quizState);

    // Force a redraw of the globe
    appContext.needsRedraw = true;
}

/**
 * Quit the quiz game
 * @param {Object} appContext - Application context
 */
function quitQuizGame(appContext) {
    // Reset game state
    resetQuizSelections(appContext);
    quizState.isActive = false;

    // Update app context
    appContext.quizActive = false;

    // Hide the game UI
    const quizPanel = document.getElementById('quiz-panel');
    if (quizPanel) {
        quizPanel.style.display = 'none';
    }

    // Check if population game is also inactive before hiding exit button
    if (!appContext.gameActive) {
        const exitButton = document.getElementById('exit-button');
        if (exitButton) {
            exitButton.style.display = 'none';
        }
    }

    // Force a redraw of the globe
    appContext.needsRedraw = true;
}