/**
 * Scoring utility functions
 * Handles score calculations and formatting for the Globe Explorer
 */

/**
 * Calculate score for the Population Target game
 * @param totalPopulation - Total population of selected countries
 * @param targetPopulation - Target population to match
 * @param difficultyFactor - Optional difficulty factor (higher = more points)
 * @returns Calculated score
 */
export function calculatePopulationScore(
    totalPopulation: number,
    targetPopulation: number,
    difficultyFactor: number = 1.0
): number {
    // Calculate difference from target
    const difference = Math.abs(totalPopulation - targetPopulation);
    const percentDiff = difference / targetPopulation;

    // Base points - inversely proportional to the difference percentage
    // This creates a curve where score drops more rapidly as you get further from target
    let basePoints = Math.floor(1000 * Math.pow(0.9, percentDiff * 10));

    // Population factor - larger targets are harder, so give bonus points
    const populationFactor = Math.log10(targetPopulation) / 5;

    // Apply difficulty factor
    const adjustedScore = Math.floor(basePoints * populationFactor * difficultyFactor);

    // Apply bonus/penalty based on accuracy
    const finalScore = applyAccuracyBonus(adjustedScore, percentDiff);

    // Ensure minimum score
    return Math.max(100, finalScore);
}

/**
 * Apply bonus or penalty based on accuracy
 * @param baseScore - Base score
 * @param percentDiff - Percentage difference from target
 * @returns Adjusted score with bonus/penalty
 */
function applyAccuracyBonus(baseScore: number, percentDiff: number): number {
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
 * Calculate score for the Quiz game
 * @param correctAnswers - Number of correct answers
 * @param incorrectAnswers - Number of incorrect answers
 * @param difficultyMultiplier - Multiplier based on difficulty
 * @returns Calculated score
 */
export function calculateQuizScore(
    correctAnswers: number,
    incorrectAnswers: number,
    difficultyMultiplier: number = 1.0
): number {
    // Base points for correct answers
    const correctPoints = correctAnswers * 10 * difficultyMultiplier;

    // Penalty for incorrect answers
    const incorrectPenalty = incorrectAnswers * 5;

    // Calculate total (minimum score is 0)
    return Math.max(0, Math.floor(correctPoints - incorrectPenalty));
}

/**
 * Apply streak bonus to score
 * @param score - Base score
 * @param streak - Current streak count
 * @returns Score with streak bonus
 */
export function applyStreakBonus(score: number, streak: number): number {
    if (streak <= 1) return score;

    // Cap streak bonus at 5x
    const cappedStreak = Math.min(streak, 5);
    const streakBonus = Math.floor(score * 0.1 * cappedStreak);

    return score + streakBonus;
}

/**
 * Format number with commas
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}