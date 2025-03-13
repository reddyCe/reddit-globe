/**
 * Geography Quiz Game - UI Module
 * Handles all UI-related functionality for the quiz game
 */
import {showToast} from '../../components/toast.js';
import {showModal} from '../../components/modal.js';

// UI element references
let quizPanel;
let submitButton;
let resetButton;

/**
 * Initialize quiz UI elements
 * @param {Object} quizState - Quiz state object
 * @param {Object} callbacks - Callback functions
 */
export function initQuizUI(quizState, callbacks) {
    // Reference existing UI elements from HTML
    quizPanel = document.getElementById('quiz-panel');

    // Hide the panel initially
    quizPanel.style.display = 'none';

    // Add event listeners once we know the panel is ready
    // This is lazy initialization - we'll set up the buttons when we first show the UI
    quizState.onInitUI = (panel) => {
        submitButton = document.getElementById('quiz-submit-button');
        resetButton = document.getElementById('quiz-reset-button');

        if (submitButton) {
            submitButton.addEventListener('click', callbacks.onSubmitAnswer);
        }

        if (resetButton) {
            resetButton.addEventListener('click', callbacks.onResetSelections);
        }
    };

    console.log('Quiz game UI initialized');
}

/**
 * Update the quiz UI based on current state
 * @param {Object} quizState - Quiz state object
 */
export function updateQuizUI(quizState) {
    // Show/hide the panel based on game state
    quizPanel.style.display = quizState.isActive ? 'block' : 'none';

    // If this is the first time showing the panel, initialize the buttons
    if (quizState.isActive && quizState.onInitUI) {
        quizState.onInitUI(quizPanel);
        quizState.onInitUI = null; // Only call once
    }

    // Exit if not active
    if (!quizState.isActive) return;

    // Get button references (may not be available on first call)
    submitButton = submitButton || document.getElementById('quiz-submit-button');
    resetButton = resetButton || document.getElementById('quiz-reset-button');

    // Update difficulty badge
    const difficultyBadge = document.getElementById('difficulty-badge');
    if (difficultyBadge) {
        difficultyBadge.textContent = quizState.currentQuestion?.difficulty || 'Medium';

        // Set color based on difficulty
        difficultyBadge.className = 'difficulty-badge';
        if (quizState.currentQuestion?.difficulty === 'Easy') {
            difficultyBadge.classList.add('difficulty-easy');
        } else if (quizState.currentQuestion?.difficulty === 'Medium') {
            difficultyBadge.classList.add('difficulty-medium');
        } else {
            difficultyBadge.classList.add('difficulty-hard');
        }
    }

    // Update question
    const questionContainer = document.getElementById('question-container');
    if (questionContainer && quizState.currentQuestion) {
        questionContainer.textContent = quizState.currentQuestion.question;
    }

    // Update selection count
    const selectionCount = document.getElementById('quiz-selection-count');
    if (selectionCount && quizState.currentQuestion) {
        selectionCount.textContent = `${quizState.selectedCountries.length} / ${quizState.currentQuestion.answer.length}`;
    }

    // Update selected countries
    updateSelectedCountriesUI(quizState);

    // Update submit button state
    if (submitButton) {
        const hasSelections = quizState.selectedCountries.length > 0;
        submitButton.disabled = !hasSelections;
        submitButton.style.opacity = hasSelections ? '1' : '0.5';
    }
}

/**
 * Update the selected countries UI
 * @param {Object} quizState - Quiz state object
 */
function updateSelectedCountriesUI(quizState) {
    // Get container
    const container = document.getElementById('quiz-selected-container');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Show message if no selections
    if (quizState.selectedCountries.length === 0) {
        const noSelection = document.createElement('div');
        noSelection.className = 'no-selection-message';
        noSelection.textContent = 'Click on countries to select them';
        container.appendChild(noSelection);
        return;
    }

    // Add each selected country
    quizState.selectedCountries.forEach((country, index) => {
        const countryItem = document.createElement('div');
        countryItem.className = 'quiz-country-item';

        // Add bottom border to all but last item
        if (index < quizState.selectedCountries.length - 1) {
            countryItem.style.borderBottom = '1px solid #343536';
        }

        // Country name
        const nameElement = document.createElement('span');
        nameElement.className = 'quiz-country-name';
        nameElement.textContent = country.name;
        countryItem.appendChild(nameElement);

        // Country code
        const codeElement = document.createElement('span');
        codeElement.className = 'quiz-country-code';
        codeElement.textContent = country.code;
        countryItem.appendChild(codeElement);

        container.appendChild(countryItem);
    });
}

/**
 * Show quiz results
 * @param {Object} results - Quiz results
 */
export function showQuizResults(results) {
    // Create a result modal with improved styling
    const modalContent = document.createElement('div');
    modalContent.className = 'quiz-results-container';

    // Create score display
    const scoreContainer = document.createElement('div');
    scoreContainer.className = 'quiz-score-container';

    // Round score section
    const roundScoreSection = document.createElement('div');
    roundScoreSection.className = 'score-section';

    const roundScoreLabel = document.createElement('div');
    roundScoreLabel.className = 'score-label';
    roundScoreLabel.textContent = 'ROUND';
    roundScoreSection.appendChild(roundScoreLabel);

    const roundScoreValue = document.createElement('div');
    roundScoreValue.className = `round-score ${results.scoreChange >= 0 ? 'round-score-positive' : 'round-score-negative'}`;
    roundScoreValue.textContent = results.scoreChange >= 0 ? `+${results.scoreChange}` : `${results.scoreChange}`;
    roundScoreSection.appendChild(roundScoreValue);

    scoreContainer.appendChild(roundScoreSection);

    // Total score section
    const totalScoreSection = document.createElement('div');
    totalScoreSection.className = 'score-section';

    const totalScoreLabel = document.createElement('div');
    totalScoreLabel.className = 'score-label';
    totalScoreLabel.textContent = 'TOTAL';
    totalScoreSection.appendChild(totalScoreLabel);

    const totalScoreValue = document.createElement('div');
    totalScoreValue.className = 'total-score';
    totalScoreValue.textContent = results.totalScore;
    totalScoreSection.appendChild(totalScoreValue);

    scoreContainer.appendChild(totalScoreSection);
    modalContent.appendChild(scoreContainer);

    // Results container
    const resultsSection = document.createElement('div');
    resultsSection.className = 'results-container';

    // Question
    if (results.question) {
        const questionSection = document.createElement('div');
        questionSection.className = 'results-section-title';
        questionSection.textContent = results.question.question;
        resultsSection.appendChild(questionSection);

        // Add explanation if available
        if (results.question.explanation) {
            const explanationSection = document.createElement('div');
            explanationSection.className = 'quiz-explanation';
            explanationSection.textContent = results.question.explanation;
            resultsSection.appendChild(explanationSection);
        }
    }

    // Create sections for correct, incorrect, and missed
    const createResultsList = (title, items, className) => {
        if (items.length === 0) return null;

        const section = document.createElement('div');

        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'results-section-title';
        sectionTitle.textContent = title;
        section.appendChild(sectionTitle);

        const list = document.createElement('div');
        list.className = 'results-section-list';

        items.forEach(code => {
            const item = document.createElement('div');
            item.className = `results-item-${className}`;
            item.textContent = code;
            list.appendChild(item);
        });

        section.appendChild(list);
        return section;
    };

    // Add results sections
    const correctSection = createResultsList('Correct', results.correctSelections, 'correct');
    const incorrectSection = createResultsList('Incorrect', results.incorrectSelections, 'incorrect');
    const missedSection = createResultsList('Missed', results.missedAnswers, 'missed');

    if (correctSection) resultsSection.appendChild(correctSection);
    if (incorrectSection) resultsSection.appendChild(incorrectSection);
    if (missedSection) resultsSection.appendChild(missedSection);

    modalContent.appendChild(resultsSection);

    // Show the modal - Change size from 'medium' to 'large' for more space
    showModal({
        title: 'Quiz Results',
        content: modalContent,
        buttons: [
            {
                label: 'New Question',
                type: 'primary',
                onClick: results.onNewQuestion
            },
            {
                label: 'Close',
                type: 'secondary'
            }
        ],
        size: 'large'
    });
}
