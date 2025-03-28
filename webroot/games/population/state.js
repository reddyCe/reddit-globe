/**
 * Population Target Game - State Management
 * Handles game state and business logic
 */

/**
 * GameState class to manage the population game state
 */
export class GameState {
    constructor() {
        this.isActive = false;
        this.selectedCountries = [];
        this.selectedCountryCodes = []; // For easier globe rendering
        this.targetPopulation = 0;
        this.score = 0;
        this.round = 0;
        this.maxCountries = 4; // Always require exactly 4 countries
        this.streak = 0;
    }

    /**
     * Add a country to the selection
     * @param {Object} country - Country object {code, name, population}
     */
    selectCountry(country) {
        this.selectedCountries.push(country);
        this.selectedCountryCodes.push(country.code);

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
        this.selectedCountryCodes = [];

        // Notify any listeners
        if (this.onSelectionChange) {
            this.onSelectionChange(this.selectedCountries);
        }
    }

    /**
     * Calculate total population of selected countries
     * @returns {number} Total population
     */
    getTotalPopulation() {
        return this.selectedCountries.reduce((sum, country) => sum + country.population, 0);
    }

    /**
     * Calculate difference from target population
     * @returns {number} Absolute difference
     */
    getPopulationDifference() {
        return Math.abs(this.getTotalPopulation() - this.targetPopulation);
    }

    /**
     * Calculate difference percentage from target
     * @returns {number} Percentage difference (0-1)
     */
    getDifferencePercentage() {
        if (this.targetPopulation === 0) return 1;
        return this.getPopulationDifference() / this.targetPopulation;
    }

    /**
     * Reset the game state for a new round
     */
    resetForNewRound() {
        this.clearSelections();
        this.targetPopulation = 0;
        // Don't reset score or round number
    }

    /**
     * Reset the entire game state
     */
    resetGame() {
        this.isActive = false;
        this.clearSelections();
        this.targetPopulation = 0;
        this.score = 0;
        this.round = 0;
        this.streak = 0;
    }
}