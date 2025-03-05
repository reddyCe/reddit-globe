/**
 * Geography Quiz Game - State Management
 * Handles quiz state and business logic
 */

/**
 * QuizState class to manage the quiz game state
 */
export class QuizState {
    constructor() {
        this.isActive = false;
        this.selectedCountries = [];
        this.currentQuestion = null;
        this.score = 0;
        this.round = 0;
        this.streak = 0;
        this.difficulty = 'medium'; // easy, medium, hard
    }

    /**
     * Add a country to the selection
     * @param {Object} country - Country object {code, name}
     */
    selectCountry(country) {
        this.selectedCountries.push(country);

        // Notify any listeners
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selectedCountries);
        }
    }

    /**
     * Clear all selected countries
     */
    clearSelections() {
        this.selectedCountries = [];

        // Notify any listeners
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selectedCountries);
        }
    }

    /**
     * Check if the current selection fully answers the question
     * @returns {boolean} True if all required answers are selected
     */
    isSelectionComplete() {
        if (!this.currentQuestion) return false;

        return this.selectedCountries.length >= this.currentQuestion.answer.length;
    }

    /**
     * Set the difficulty level
     * @param {string} level - Difficulty level (easy, medium, hard)
     */
    setDifficulty(level) {
        if (['easy', 'medium', 'hard'].includes(level)) {
            this.difficulty = level;
        }
    }

    /**
     * Get the current difficulty multiplier
     * @returns {number} Difficulty multiplier for scoring
     */
    getDifficultyMultiplier() {
        switch (this.difficulty) {
            case 'easy':
                return 0.8;
            case 'medium':
                return 1.0;
            case 'hard':
                return 1.5;
            default:
                return 1.0;
        }
    }

    /**
     * Reset the game state for a new round
     */
    resetForNewRound() {
        this.clearSelections();
        this.currentQuestion = null;
        // Don't reset score or round number
    }

    /**
     * Reset the entire quiz state
     */
    resetQuiz() {
        this.isActive = false;
        this.clearSelections();
        this.currentQuestion = null;
        this.score = 0;
        this.round = 0;
        this.streak = 0;
    }
}