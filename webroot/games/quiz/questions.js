/**
 * Geography Quiz Game - Question Database
 * Library of questions for the quiz game
 */

/**
 * Complete quiz question library
 * Each question has:
 * - id: Unique identifier
 * - question: The question text
 * - answer: Array of country codes (ISO-3) that are correct answers
 * - difficulty: Easy, Medium, or Hard
 * - explanation: Explanatory text shown after answering
 * - category: Optional category for filtering
 */
export const quizQuestions = [
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
        "explanation": "Côte d'Ivoire (CIV), Ghana (GHA), Indonesia (IDN), Nigeria (NGA), and Cameroon (CMR) are the world's top five cocoa-producing nations.",
        "category": "Agriculture"
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
        "explanation": "Andorra (AND), Finland (FIN), Liechtenstein (LIE), Luxembourg (LUX), and Norway (NOR) all have literacy rates at or above 99%.",
        "category": "Education"
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
        "explanation": "Venezuela (VEN), Slovenia (SVN), Monaco (MCO), Bhutan (BHU), and Tanzania (TZA) dedicate significant portions of their land to national parks, reserves, and other protected areas.",
        "category": "Environment"
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
        "explanation": "The Group of Seven (G7) consists of the United States (USA), United Kingdom (GBR), France (FRA), Germany (DEU), Italy (ITA), Japan (JPN), and Canada (CAN).",
        "category": "Politics"
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
        "explanation": "China (CHN), United States (USA), Brazil (BRA), Canada (CAN), and India (IND) are leading producers of renewable energy.",
        "category": "Energy"
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
        "explanation": "Burundi (BDI), Belize (BLZ), Guinea-Bissau (GNB), Liberia (LBR), and South Sudan (SSD) are among the countries that have never won an Olympic medal.",
        "category": "Sports"
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
        "explanation": "Blue Zones are in Italy (Sardinia), Japan (Okinawa), Greece (Ikaria), Costa Rica (Nicoya Peninsula), and USA (Loma Linda, California).",
        "category": "Health"
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
        "explanation": "Finland (FIN), Norway (NOR), Iceland (ISL), Denmark (DNK), and the Netherlands (NLD) consume the most coffee per person annually.",
        "category": "Culture"
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
        "explanation": "Uganda (UGA), Ethiopia (ETH), Bolivia (BOL), Paraguay (PRY), and Switzerland (CHE) are examples of landlocked countries with no access to the sea.",
        "category": "Geography"
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
        "explanation": "Maldives (MDV), Mauritius (MUS), Cyprus (CYP), Jamaica (JAM), and Iceland (ISL) are all island nations surrounded entirely by water.",
        "category": "Geography"
    },
    {
        "id": 11,
        "question": "Which countries have the largest forest areas?",
        "answer": [
            "RUS",
            "BRA",
            "CAN",
            "USA",
            "CHN"
        ],
        "difficulty": "Easy",
        "explanation": "Russia (RUS), Brazil (BRA), Canada (CAN), United States (USA), and China (CHN) have the largest total forest areas in the world.",
        "category": "Environment"
    },
    {
        "id": 12,
        "question": "Which countries have the largest deserts?",
        "answer": [
            "DZA",
            "SAU",
            "LBY",
            "EGY",
            "MNG"
        ],
        "difficulty": "Medium",
        "explanation": "Algeria (DZA), Saudi Arabia (SAU), Libya (LBY), Egypt (EGY), and Mongolia (MNG) contain large desert regions including parts of the Sahara, Arabian, and Gobi deserts.",
        "category": "Geography"
    },
    {
        "id": 13,
        "question": "Which countries are in the BRICS economic group?",
        "answer": [
            "BRA",
            "RUS",
            "IND",
            "CHN",
            "ZAF"
        ],
        "difficulty": "Medium",
        "explanation": "The BRICS group consists of Brazil (BRA), Russia (RUS), India (IND), China (CHN), and South Africa (ZAF).",
        "category": "Economics"
    },
    {
        "id": 14,
        "question": "Which countries have the longest coastlines?",
        "answer": [
            "CAN",
            "IDN",
            "GRL",
            "RUS",
            "PHL"
        ],
        "difficulty": "Medium",
        "explanation": "Canada (CAN), Indonesia (IDN), Greenland (GRL), Russia (RUS), and the Philippines (PHL) have some of the longest coastlines in the world.",
        "category": "Geography"
    },
    {
        "id": 15,
        "question": "Which countries have won the most FIFA World Cup titles?",
        "answer": [
            "BRA",
            "DEU",
            "ITA",
            "ARG",
            "FRA"
        ],
        "difficulty": "Easy",
        "explanation": "Brazil (BRA), Germany (DEU), Italy (ITA), Argentina (ARG), and France (FRA) have won the most FIFA World Cup titles.",
        "category": "Sports"
    }
];

/**
 * Get a random question from the library
 * @param {string} [difficulty] - Optional difficulty filter
 * @param {string} [category] - Optional category filter
 * @returns {Object} Random question
 */
export function getRandomQuestion(difficulty = null, category = null) {
    let filteredQuestions = [...quizQuestions];

    // Filter by difficulty if specified
    if (difficulty) {
        filteredQuestions = filteredQuestions.filter(
            q => q.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
    }

    // Filter by category if specified
    if (category) {
        filteredQuestions = filteredQuestions.filter(
            q => q.category?.toLowerCase() === category.toLowerCase()
        );
    }

    // Return a random question from filtered list
    const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
    return filteredQuestions[randomIndex];
}

/**
 * Get questions by category
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered questions
 */
export function getQuestionsByCategory(category) {
    return quizQuestions.filter(
        q => q.category?.toLowerCase() === category.toLowerCase()
    );
}

/**
 * Get questions by difficulty
 * @param {string} difficulty - Difficulty level to filter by
 * @returns {Array} Filtered questions
 */
export function getQuestionsByDifficulty(difficulty) {
    return quizQuestions.filter(
        q => q.difficulty.toLowerCase() === difficulty.toLowerCase()
    );
}

/**
 * Get available categories
 * @returns {Array} Unique categories
 */
export function getCategories() {
    const categories = new Set();

    quizQuestions.forEach(q => {
        if (q.category) {
            categories.add(q.category);
        }
    });

    return Array.from(categories).sort();
}