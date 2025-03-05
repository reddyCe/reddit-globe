/**
 * Geography Quiz Game - Game Logic
 * Core quiz mechanics and questions
 */

// Quiz questions library
const quizQuestions = [
    {
        "id": 1,
        "question": "Which countries are the world's largest cocoa producers?",
        "answer": [
            "CIV",
            "GHA",
            "IDN",
            "NGA",
            "CMR"
        ],
        "difficulty": "Hard",
        "explanation": "Côte d'Ivoire (CIV), Ghana (GHA), Indonesia (IDN), Nigeria (NGA), and Cameroon (CMR) are the world's top five cocoa-producing nations."
    },
    {
        "id": 2,
        "question": "Which countries have the highest literacy rates?",
        "answer": [
            "AND",
            "FIN",
            "LIE",
            "LUX",
            "NOR"
        ],
        "difficulty": "Medium",
        "explanation": "Andorra (AND), Finland (FIN), Liechtenstein (LIE), Luxembourg (LUX), and Norway (NOR) all have literacy rates at or above 99%."
    },
    {
        "id": 3,
        "question": "Which countries have the highest percentage of protected natural areas?",
        "answer": [
            "VEN",
            "SVN",
            "MCO",
            "BHU",
            "TZA"
        ],
        "difficulty": "Hard",
        "explanation": "Venezuela (VEN), Slovenia (SVN), Monaco (MCO), Bhutan (BHU), and Tanzania (TZA) dedicate significant portions of their land to national parks, reserves, and other protected areas."
    },
    {
        "id": 4,
        "question": "Which countries are in the G7?",
        "answer": [
            "USA",
            "GBR",
            "FRA",
            "DEU",
            "ITA",
            "JPN",
            "CAN"
        ],
        "difficulty": "Medium",
        "explanation": "The Group of Seven (G7) consists of the United States (USA), United Kingdom (GBR), France (FRA), Germany (DEU), Italy (ITA), Japan (JPN), and Canada (CAN)."
    },
    {
        "id": 5,
        "question": "Which countries are the world's largest producers of renewable energy?",
        "answer": [
            "CHN",
            "USA",
            "BRA",
            "CAN",
            "IND"
        ],
        "difficulty": "Medium",
        "explanation": "China (CHN), United States (USA), Brazil (BRA), Canada (CAN), and India (IND) are leading producers of renewable energy."
    },
    {
        "id": 6,
        "question": "Which countries have never won a medal in the Summer Olympics?",
        "answer": [
            "BDI",
            "BLZ",
            "GNB",
            "LBR",
            "SSD"
        ],
        "difficulty": "Hard",
        "explanation": "Burundi (BDI), Belize (BLZ), Guinea-Bissau (GNB), Liberia (LBR), and South Sudan (SSD) are among the countries that have never won an Olympic medal."
    },
    {
        "id": 7,
        "question": "Which countries are considered 'Blue Zone' regions, known for longevity?",
        "answer": [
            "ITA",
            "JPN",
            "GRC",
            "CRI",
            "USA"
        ],
        "difficulty": "Medium",
        "explanation": "Blue Zones are in Italy (Sardinia), Japan (Okinawa), Greece (Ikaria), Costa Rica (Nicoya Peninsula), and USA (Loma Linda, California)."
    },
    {
        "id": 8,
        "question": "Which countries have the highest coffee consumption per capita?",
        "answer": [
            "FIN",
            "NOR",
            "ISL",
            "DNK",
            "NLD"
        ],
        "difficulty": "Medium",
        "explanation": "Finland (FIN), Norway (NOR), Iceland (ISL), Denmark (DNK), and the Netherlands (NLD) consume the most coffee per person annually."
    },
    {
        "id": 9,
        "question": "Which countries are completely landlocked?",
        "answer": [
            "UGA",
            "ETH",
            "BOL",
            "PRY",
            "CHE"
        ],
        "difficulty": "Easy",
        "explanation": "Uganda (UGA), Ethiopia (ETH), Bolivia (BOL), Paraguay (PRY), and Switzerland (CHE) are examples of landlocked countries with no access to the sea."
    },
    {
        "id": 10,
        "question": "Which countries are island nations?",
        "answer": [
            "MDV",
            "MUS",
            "CYP",
            "JAM",
            "ISL"
        ],
        "difficulty": "Easy",
        "explanation": "Maldives (MDV), Mauritius (MUS), Cyprus (CYP), Jamaica (JAM), and Iceland (ISL) are all island nations surrounded entirely by water."
    }
];

/**
 * Get a random question from the quiz library
 * @param {string} [difficulty] - Optional difficulty filter
 * @returns {Object} Random question object
 */
export function getRandomQuestion(difficulty = null) {
    // Filter questions by difficulty if specified
    const filteredQuestions = difficulty
        ? quizQuestions.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase())
        : quizQuestions;

    // Get a random question
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    return filteredQuestions[randomIndex];
}

/**
 * Validate the player's answer
 * @param {Array<string>} selectedCodes - Country codes selected by player
 * @param {Array<string>} correctCodes - Correct country codes for the question
 * @returns {Object} Validation results
 */
export function validateAnswer(selectedCodes, correctCodes) {
    // Find correct selections
    const correctSelections = selectedCodes.filter(code => correctCodes.includes(code));

    // Find incorrect selections
    const incorrectSelections = selectedCodes.filter(code => !correctCodes.includes(code));

    // Find missed answers
    const missedAnswers = correctCodes.filter(code => !selectedCodes.includes(code));

    // Calculate accuracy
    const accuracy = correctCodes.length > 0
        ? correctSelections.length / correctCodes.length
        : 0;

    // Calculate score
    const score = calculateScore(correctSelections.length, incorrectSelections.length);

    return {
        correctSelections,
        incorrectSelections,
        missedAnswers,
        accuracy,
        score,
        isCompletelyCorrect: correctSelections.length === correctCodes.length && incorrectSelections.length === 0
    };
}

/**
 * Calculate quiz score
 * @param {number} correct - Number of correct answers
 * @param {number} incorrect - Number of incorrect answers
 * @param {number} [difficultyMultiplier=1] - Difficulty multiplier
 * @returns {number} Calculated score
 */
function calculateScore(correct, incorrect, difficultyMultiplier = 1) {
    // Base points for correct answers
    const correctPoints = correct * 10 * difficultyMultiplier;

    // Penalty for incorrect answers
    const incorrectPenalty = incorrect * 5;

    // Calculate total (minimum score is 0)
    return Math.max(0, Math.floor(correctPoints - incorrectPenalty));
}

/**
 * Get difficulty multiplier for scoring
 * @param {string} difficulty - Difficulty level
 * @returns {number} Difficulty multiplier
 */
export function getDifficultyMultiplier(difficulty) {
    switch (difficulty.toLowerCase()) {
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
 * Get questions by category
 * @param {string} category - Question category
 * @returns {Array<Object>} Filtered questions
 */
export function getQuestionsByCategory(category) {
    // This is a placeholder function - in a full implementation,
    // we would tag questions with categories and filter by them
    return quizQuestions;
}