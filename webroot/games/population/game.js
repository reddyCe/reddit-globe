/**
 * Population Target Game - Game Logic
 * Core game mechanics and calculations
 */

/**
 * Generate a random target population
 * @returns {number} Random population between 10M and 500M
 */
export function getRandomTarget() {
    return getRandomInt(10000000, 500000000);
}

/**
 * Get random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    if (!num && num !== 0) return 'N/A';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculate score based on population match
 * @param {number} totalPopulation - Achieved population
 * @param {number} targetPopulation - Target population
 * @param {number} countryCount - Number of countries selected
 * @returns {number} Calculated score
 */
export function calculateScore(totalPopulation, targetPopulation, countryCount) {
    // Calculate difference from target
    const difference = Math.abs(totalPopulation - targetPopulation);
    const percentDiff = difference / targetPopulation;

    // Base points - inversely proportional to the difference percentage
    // This creates a curve where score drops more rapidly as you get further from target
    let basePoints = Math.floor(1000 * Math.pow(0.9, percentDiff * 10));

    // Population factor - larger targets are harder, so give bonus points
    const populationFactor = Math.log10(targetPopulation) / 5;

    // Country count factor - using more countries is more challenging
    const countryFactor = 1 + (countryCount / 10);

    // Combine factors for final score calculation
    let roundScore = Math.floor(basePoints * populationFactor * countryFactor);

    // Apply bonus/penalty system
    roundScore = applyBonusPenalty(roundScore, percentDiff);

    // Ensure minimum score
    return Math.max(100, roundScore);
}

/**
 * Apply bonus or penalty to score based on accuracy
 * @param {number} baseScore - Base score before bonus/penalty
 * @param {number} percentDiff - Percentage difference from target
 * @returns {number} Adjusted score
 */
function applyBonusPenalty(baseScore, percentDiff) {
    let adjustedScore = baseScore;

    if (percentDiff < 0.01) {
        // Perfect match bonus (up to 50% extra points)
        const perfectBonus = Math.floor(baseScore * (0.3 + Math.random() * 0.2));
        adjustedScore += perfectBonus;
    } else if (percentDiff < 0.05) {
        // Near match bonus (up to 25% extra points)
        const nearBonus = Math.floor(baseScore * (0.1 + Math.random() * 0.15));
        adjustedScore += nearBonus;
    } else if (percentDiff < 0.1) {
        // Good try bonus (up to 10% extra)
        const goodBonus = Math.floor(baseScore * (0.05 + Math.random() * 0.05));
        adjustedScore += goodBonus;
    } else if (percentDiff > 0.5) {
        // Far miss penalty (lose up to 30% of points)
        const penalty = Math.floor(baseScore * (0.1 + Math.random() * 0.2));
        adjustedScore -= penalty;
    }

    return adjustedScore;
}

/**
 * Apply streak bonus to score
 * @param {number} score - Base score
 * @param {number} streak - Current streak count
 * @returns {number} Score with streak bonus
 */
export function applyStreakBonus(score, streak) {
    if (streak <= 1) return score;

    // Cap streak bonus at 5x
    const cappedStreak = Math.min(streak, 5);
    const streakBonus = Math.floor(score * 0.1 * cappedStreak);

    return score + streakBonus;
}