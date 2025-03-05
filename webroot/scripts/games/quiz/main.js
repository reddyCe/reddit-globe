// Quiz Game Variables
let quizActive = false;
let currentQuestion = null;
let quizSelectedCountries = [];
let quizCorrectCountries = [];
let quizPanel = null;
let quizScore = 0;
let quizButton;
let submitButton;

// Questions for the quiz game
const quizQuestions = [
    {
        "id": 9,
        "question": "Which countries are the world's largest cocoa producers?",
        "answer": [
            "CIV",
            "GHA",
            "IDN",
            "NGA",
            "CMR",
            "BRA",
            "ECU",
            "PER",
            "DOM",
            "COL"
        ],
        "difficulty": "Hard",
        "explanation": "Côte d'Ivoire (CIV), Ghana (GHA), Indonesia (IDN), Nigeria (NGA), Cameroon (CMR), Brazil (BRA), Ecuador (ECU), Peru (PER), Dominican Republic (DOM), and Colombia (COL) are the world's top cocoa-producing nations."
    },
    {
        "id": 7,
        "question": "Which countries have the highest literacy rates?",
        "answer": [
            "AND",
            "FIN",
            "LIE",
            "LUX",
            "NOR",
            "LVA",
            "EST",
            "POL",
            "DNK",
            "CUB"
        ],
        "difficulty": "Medium",
        "explanation": "Andorra (AND), Finland (FIN), Liechtenstein (LIE), Luxembourg (LUX), Norway (NOR), Latvia (LVA), Estonia (EST), Poland (POL), Denmark (DNK), and Cuba (CUB) all have literacy rates at or above 99%."
    },
    {
        "id": 5,
        "question": "Which countries have the highest percentage of protected natural areas?",
        "answer": [
            "VEN",
            "SVN",
            "MCO",
            "BHU",
            "TZA",
            "ZMB",
            "DEU",
            "NZL",
            "CRI",
            "THA"
        ],
        "difficulty": "Hard",
        "explanation": "Venezuela (VEN), Slovenia (SVN), Monaco (MCO), Bhutan (BHU), Tanzania (TZA), Zambia (ZMB), Germany (DEU), New Zealand (NZL), Costa Rica (CRI), and Thailand (THA) dedicate significant portions of their land to national parks, reserves, and other protected areas."
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
        "id": 4,
        "question": "Which countries are the world's largest producers of renewable energy?",
        "answer": [
            "CHN",
            "USA",
            "BRA",
            "CAN",
            "IND",
            "RUS",
            "NOR",
            "DEU",
            "JPN",
            "FRA"
        ],
        "difficulty": "Medium",
        "explanation": "China (CHN), United States (USA), Brazil (BRA), Canada (CAN), India (IND), Russia (RUS), Norway (NOR), Germany (DEU), Japan (JPN), and France (FRA) are leading producers of renewable energy from sources like hydroelectric, solar, wind, and geothermal."
    }
];

// Initialize quiz elements
function initQuizElements() {
    // Create quiz button
    quizButton = document.createElement('button');
    quizButton.id = 'show-quiz-button';
    quizButton.textContent = 'Play Quiz Game';
    quizButton.style.position = 'absolute';
    quizButton.style.top = '60px'; // Position below the population game button
    quizButton.style.right = '10px';
    quizButton.style.backgroundColor = '#FF8C00'; // Different color to distinguish from population game
    quizButton.style.color = 'white';
    quizButton.style.border = 'none';
    quizButton.style.padding = '10px 15px';
    quizButton.style.borderRadius = '25px';
    quizButton.style.cursor = 'pointer';
    quizButton.style.zIndex = '1000';

    // Add quiz button to the document
    document.body.appendChild(quizButton);

    // Create quiz panel
    quizPanel = document.createElement('div');
    quizPanel.id = 'quiz-panel';
    quizPanel.style.position = 'absolute';
    quizPanel.style.bottom = '20px';
    quizPanel.style.right = '20px';
    quizPanel.style.width = '320px';
    quizPanel.style.backgroundColor = '#1A1A1B'; // Reddit dark mode background
    quizPanel.style.color = '#D7DADC'; // Reddit text color
    quizPanel.style.padding = '15px';
    quizPanel.style.borderRadius = '4px';
    quizPanel.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
    quizPanel.style.zIndex = '1000';
    quizPanel.style.fontFamily = '"Noto Sans", "Helvetica Neue", Arial, sans-serif'; // Reddit font
    quizPanel.style.fontSize = '14px';
    quizPanel.style.display = 'none';
    quizPanel.style.border = '1px solid #343536'; // Reddit card border

    document.body.appendChild(quizPanel);

    // Set up quiz event listeners
    setupQuizEventListeners();
}

// Setup event listeners for quiz elements
function setupQuizEventListeners() {
    quizButton.addEventListener('click', () => {
        if (!quizActive) {
            startQuizGame();
            quizButton.textContent = 'Quit Quiz';
        } else {
            quitQuizGame();
            quizButton.textContent = 'Play Quiz Game';
        }
    });

    // Modify the existing handleGlobeClick function to support quiz functionality
    const originalHandleGlobeClick = handleGlobeClick;
    handleGlobeClick = function (e) {
        // Call the original function to handle basic globe interaction
        originalHandleGlobeClick(e);

        // Handle quiz selection if quiz is active
        if (quizActive && hoveredFeature && quizSelectedCountries.length < currentQuestion.answer.length) {
            handleQuizCountrySelection(hoveredFeature);
        }
    };
}

// Start the quiz game
function startQuizGame() {
    // Make sure population game is not active
    if (gameActive) {
        quitGame();
        document.getElementById('show-game-button').textContent = 'Play Population Game';
    }

    // Reset any previous quiz state
    quizSelectedCountries = [];
    quizCorrectCountries = [];

    // Get a random question
    currentQuestion = getRandomQuestion();

    // Update UI
    updateQuizPanel();

    // Show the quiz panel
    quizActive = true;
    quizPanel.style.display = 'block';

    // Show the exit button
    const exitButton = document.getElementById('exit-button');
    if (exitButton) {
        exitButton.style.display = 'block';
    }

    // Show toast notification
    showToast(`Quiz started! ${currentQuestion.question}`, 5000);

    // Force a redraw of the globe
    needsRedraw = true;
}
// Get a random question from the array
function getRandomQuestion() {
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    return quizQuestions[randomIndex];
}

// Update the quiz panel with current question and progress
function updateQuizPanel() {
    // Clear the panel
    quizPanel.innerHTML = '';

    // Add game title
    const quizTitle = document.createElement('h4');
    quizTitle.textContent = 'Geography Quiz';
    quizTitle.style.textAlign = 'center';
    quizTitle.style.margin = '0 0 10px 0';
    quizTitle.style.color = '#FF8C00'; // Quiz orange
    quizTitle.style.fontWeight = '500';
    quizPanel.appendChild(quizTitle);

    // Add difficulty badge
    const difficultyBadge = document.createElement('div');
    difficultyBadge.style.display = 'inline-block';
    difficultyBadge.style.padding = '3px 8px';
    difficultyBadge.style.borderRadius = '12px';
    difficultyBadge.style.fontSize = '12px';
    difficultyBadge.style.marginBottom = '10px';
    difficultyBadge.textContent = currentQuestion.difficulty;

    // Set color based on difficulty
    if (currentQuestion.difficulty === 'Easy') {
        difficultyBadge.style.backgroundColor = '#4CAF50';
    } else if (currentQuestion.difficulty === 'Medium') {
        difficultyBadge.style.backgroundColor = '#FF9800';
    } else {
        difficultyBadge.style.backgroundColor = '#F44336';
    }

    quizPanel.appendChild(difficultyBadge);

    // Add question
    const questionElement = document.createElement('div');
    questionElement.style.padding = '10px';
    questionElement.style.backgroundColor = '#272729';
    questionElement.style.borderRadius = '4px';
    questionElement.style.marginBottom = '15px';
    questionElement.style.border = '1px solid #343536';
    questionElement.textContent = currentQuestion.question;
    quizPanel.appendChild(questionElement);

    // Add selection counter
    const counterContainer = document.createElement('div');
    counterContainer.style.display = 'flex';
    counterContainer.style.justifyContent = 'space-between';
    counterContainer.style.marginBottom = '15px';
    counterContainer.style.padding = '8px';
    counterContainer.style.backgroundColor = '#272729';
    counterContainer.style.borderRadius = '4px';
    counterContainer.style.border = '1px solid #343536';

    const selectionLabel = document.createElement('span');
    selectionLabel.textContent = 'Selected countries:';
    selectionLabel.style.color = '#818384';
    counterContainer.appendChild(selectionLabel);

    const countDisplay = document.createElement('span');
    countDisplay.id = 'quiz-selection-count';
    countDisplay.textContent = `${quizSelectedCountries.length} / ${currentQuestion.answer.length}`;
    countDisplay.style.fontWeight = 'bold';
    counterContainer.appendChild(countDisplay);

    quizPanel.appendChild(counterContainer);

    // Add selected countries container
    const selectedContainer = document.createElement('div');
    selectedContainer.id = 'quiz-selected-container';
    selectedContainer.style.marginBottom = '15px';
    selectedContainer.style.maxHeight = '150px';
    selectedContainer.style.overflowY = 'auto';
    selectedContainer.style.backgroundColor = '#272729';
    selectedContainer.style.borderRadius = '4px';
    selectedContainer.style.padding = '8px';
    selectedContainer.style.border = '1px solid #343536';

    // Add selected countries
    if (quizSelectedCountries.length === 0) {
        const noSelectionMsg = document.createElement('div');
        noSelectionMsg.textContent = 'Click on countries to select them';
        noSelectionMsg.style.color = '#818384';
        noSelectionMsg.style.fontStyle = 'italic';
        noSelectionMsg.style.textAlign = 'center';
        noSelectionMsg.style.padding = '10px';
        selectedContainer.appendChild(noSelectionMsg);
    } else {
        quizSelectedCountries.forEach((country, index) => {
            const countryElement = document.createElement('div');
            countryElement.style.display = 'flex';
            countryElement.style.justifyContent = 'space-between';
            countryElement.style.padding = '5px';
            if (index < quizSelectedCountries.length - 1) {
                countryElement.style.borderBottom = '1px solid #343536';
            }

            const nameElement = document.createElement('span');
            nameElement.textContent = country.name;
            countryElement.appendChild(nameElement);

            const codeElement = document.createElement('span');
            codeElement.textContent = country.code;
            codeElement.style.color = '#818384';
            countryElement.appendChild(codeElement);

            selectedContainer.appendChild(countryElement);
        });
    }

    quizPanel.appendChild(selectedContainer);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.backgroundColor = '#272729';
    resetButton.style.color = '#D7DADC';
    resetButton.style.border = '1px solid #343536';
    resetButton.style.padding = '8px 15px';
    resetButton.style.borderRadius = '20px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.width = '48%';
    resetButton.addEventListener('click', resetQuizSelections);
    buttonContainer.appendChild(resetButton);

    submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.style.backgroundColor = '#FF8C00'; // Quiz orange
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.padding = '8px 15px';
    submitButton.style.borderRadius = '20px';
    submitButton.style.cursor = 'pointer';
    submitButton.style.width = '48%';
    submitButton.style.fontWeight = 'bold';
    submitButton.addEventListener('click', submitQuizAnswer);
    buttonContainer.appendChild(submitButton);

    quizPanel.appendChild(buttonContainer);
}

// Handle quiz country selection
function handleQuizCountrySelection(feature) {
    // Get country information
    const countryCode = feature.properties.code || feature.properties.ISO_A3;
    const countryName = feature.properties.name || feature.properties.NAME;

    // Check if country is already selected
    if (quizSelectedCountries.find(c => c.code === countryCode)) {
        showToast('Country already selected!', 2000);
        return;
    }

    // Add country to selection
    quizSelectedCountries.push({
        code: countryCode,
        name: countryName
    });

    // Update visuals
    updateQuizPanel();

    // Force a redraw of the globe to show the selection
    needsRedraw = true;
}

// Reset quiz selections
function resetQuizSelections() {
    quizSelectedCountries = [];
    updateQuizPanel();
    needsRedraw = true;
}

// Submit quiz answer
function submitQuizAnswer() {
    // Disable submit button during evaluation
    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';

    // Calculate correct and incorrect answers
    const selectedCodes = quizSelectedCountries.map(country => country.code);
    const correctCodes = currentQuestion.answer;

    // Track correct and incorrect selections
    const correctSelections = selectedCodes.filter(code => correctCodes.includes(code));
    const incorrectSelections = selectedCodes.filter(code => !correctCodes.includes(code));
    const missedAnswers = correctCodes.filter(code => !selectedCodes.includes(code));

    // Store correct countries for highlighting
    quizCorrectCountries = correctCodes;

    // Calculate score
    // +10 points for each correct answer
    // -5 points for each incorrect answer
    // No points deducted for missed answers (just no points gained)
    const scoreChange = (correctSelections.length * 10) - (incorrectSelections.length * 5);
    quizScore += scoreChange;

    // Show results modal
    showQuizResults({
        correctSelections,
        incorrectSelections,
        missedAnswers,
        scoreChange,
        totalScore: quizScore
    });

    // Highlight the correct answers on the globe
    needsRedraw = true;

    // Send score to Devvit if score is positive
    if (scoreChange > 0) {
        window.parent.postMessage(
            {
                type: 'gameFinished',
                data: {
                    roundScore: scoreChange
                },
            },
            '*'
        );
    }
}

// Show quiz results
function showQuizResults(results) {
    // Create a result modal - Reddit style
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#1A1A1B'; // Reddit dark mode
    modal.style.padding = '20px';
    modal.style.borderRadius = '4px';
    modal.style.color = '#D7DADC'; // Reddit text color
    modal.style.zIndex = '2000';
    modal.style.minWidth = '350px';
    modal.style.maxWidth = '500px';
    modal.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
    modal.style.border = '1px solid #343536'; // Reddit card border

    // Add content
    const title = document.createElement('h2');
    title.textContent = 'Quiz Results';
    title.style.color = '#FF8C00'; // Quiz orange
    title.style.marginTop = '0';
    title.style.fontWeight = '500';
    title.style.fontSize = '18px';
    title.style.textAlign = 'center';
    modal.appendChild(title);

    // Add decorative Reddit header
    const redditHeader = document.createElement('div');
    redditHeader.style.fontSize = '12px';
    redditHeader.style.color = '#818384';
    redditHeader.style.marginBottom = '15px';
    redditHeader.style.textAlign = 'left';
    redditHeader.textContent = 'Posted by u/GeoQuizMaster • Now • Geography';
    modal.appendChild(redditHeader);

    // Add question
    const questionElement = document.createElement('div');
    questionElement.style.padding = '10px';
    questionElement.style.backgroundColor = '#272729';
    questionElement.style.borderRadius = '4px';
    questionElement.style.marginBottom = '15px';
    questionElement.style.fontSize = '16px';
    questionElement.style.fontWeight = 'bold';
    questionElement.textContent = currentQuestion.question;
    modal.appendChild(questionElement);

    // Add results
    const resultsContainer = document.createElement('div');
    resultsContainer.style.backgroundColor = '#272729';
    resultsContainer.style.borderRadius = '4px';
    resultsContainer.style.padding = '10px';
    resultsContainer.style.marginBottom = '15px';

    // Add correct selections
    const correctTitle = document.createElement('div');
    correctTitle.style.fontWeight = 'bold';
    correctTitle.style.marginBottom = '5px';
    correctTitle.textContent = `Correct (${results.correctSelections.length}/${currentQuestion.answer.length})`;
    correctTitle.style.color = '#4CAF50'; // Green for correct
    resultsContainer.appendChild(correctTitle);

    if (results.correctSelections.length > 0) {
        const correctList = document.createElement('div');
        correctList.style.marginBottom = '10px';
        correctList.style.paddingLeft = '15px';

        results.correctSelections.forEach(code => {
            // Find the name for this country code from world data
            let countryName = code;
            if (worldData) {
                const country = worldData.features.find(f =>
                    (f.properties.code || f.properties.ISO_A3) === code);
                if (country) {
                    countryName = country.properties.name || country.properties.NAME || code;
                }
            }

            const item = document.createElement('div');
            item.textContent = `${countryName} (${code})`;
            item.style.padding = '2px 0';
            correctList.appendChild(item);
        });

        resultsContainer.appendChild(correctList);
    } else {
        const noCorrect = document.createElement('div');
        noCorrect.textContent = 'None';
        noCorrect.style.fontStyle = 'italic';
        noCorrect.style.marginBottom = '10px';
        noCorrect.style.paddingLeft = '15px';
        resultsContainer.appendChild(noCorrect);
    }

    // Add incorrect selections
    if (results.incorrectSelections.length > 0) {
        const incorrectTitle = document.createElement('div');
        incorrectTitle.style.fontWeight = 'bold';
        incorrectTitle.style.marginBottom = '5px';
        incorrectTitle.textContent = `Incorrect (${results.incorrectSelections.length})`;
        incorrectTitle.style.color = '#F44336'; // Red for incorrect
        resultsContainer.appendChild(incorrectTitle);

        const incorrectList = document.createElement('div');
        incorrectList.style.marginBottom = '10px';
        incorrectList.style.paddingLeft = '15px';

        results.incorrectSelections.forEach(code => {
            // Find the name for this country code
            let countryName = code;
            if (worldData) {
                const country = worldData.features.find(f =>
                    (f.properties.code || f.properties.ISO_A3) === code);
                if (country) {
                    countryName = country.properties.name || country.properties.NAME || code;
                }
            }

            const item = document.createElement('div');
            item.textContent = `${countryName} (${code})`;
            item.style.padding = '2px 0';
            item.style.color = '#F44336'; // Red text
            incorrectList.appendChild(item);
        });

        resultsContainer.appendChild(incorrectList);
    }

    // Add missed answers
    if (results.missedAnswers.length > 0) {
        const missedTitle = document.createElement('div');
        missedTitle.style.fontWeight = 'bold';
        missedTitle.style.marginBottom = '5px';
        missedTitle.textContent = `Missed (${results.missedAnswers.length})`;
        missedTitle.style.color = '#FFC107'; // Yellow for missed
        resultsContainer.appendChild(missedTitle);

        const missedList = document.createElement('div');
        missedList.style.marginBottom = '10px';
        missedList.style.paddingLeft = '15px';

        results.missedAnswers.forEach(code => {
            // Find the name for this country code
            let countryName = code;
            if (worldData) {
                const country = worldData.features.find(f =>
                    (f.properties.code || f.properties.ISO_A3) === code);
                if (country) {
                    countryName = country.properties.name || country.properties.NAME || code;
                }
            }

            const item = document.createElement('div');
            item.textContent = `${countryName} (${code})`;
            item.style.padding = '2px 0';
            item.style.color = '#FFC107'; // Yellow text
            missedList.appendChild(item);
        });

        resultsContainer.appendChild(missedList);
    }

    modal.appendChild(resultsContainer);

    // Add explanation
    const explanationContainer = document.createElement('div');
    explanationContainer.style.backgroundColor = '#272729';
    explanationContainer.style.borderRadius = '4px';
    explanationContainer.style.padding = '10px';
    explanationContainer.style.marginBottom = '15px';

    const explanationTitle = document.createElement('div');
    explanationTitle.style.fontWeight = 'bold';
    explanationTitle.textContent = 'Explanation:';
    explanationContainer.appendChild(explanationTitle);

    const explanation = document.createElement('div');
    explanation.style.marginTop = '5px';
    explanation.textContent = currentQuestion.explanation;
    explanationContainer.appendChild(explanation);

    modal.appendChild(explanationContainer);

    // Add score
    const scoreContainer = document.createElement('div');
    scoreContainer.style.backgroundColor = '#272729';
    scoreContainer.style.borderRadius = '4px';
    scoreContainer.style.padding = '10px';
    scoreContainer.style.marginBottom = '15px';
    scoreContainer.style.display = 'flex';
    scoreContainer.style.justifyContent = 'space-between';

    const roundScoreContainer = document.createElement('div');
    roundScoreContainer.style.textAlign = 'center';
    roundScoreContainer.style.flex = '1';

    const roundScoreLabel = document.createElement('div');
    roundScoreLabel.textContent = 'Round Score';
    roundScoreLabel.style.fontSize = '14px';
    roundScoreLabel.style.color = '#818384';
    roundScoreContainer.appendChild(roundScoreLabel);

    const roundScore = document.createElement('div');
    roundScore.textContent = results.scoreChange >= 0 ? `+${results.scoreChange}` : `${results.scoreChange}`;
    roundScore.style.fontSize = '20px';
    roundScore.style.fontWeight = 'bold';
    roundScore.style.color = results.scoreChange >= 0 ? '#4CAF50' : '#F44336';
    roundScoreContainer.appendChild(roundScore);

    scoreContainer.appendChild(roundScoreContainer);

    const totalScoreContainer = document.createElement('div');
    totalScoreContainer.style.textAlign = 'center';
    totalScoreContainer.style.flex = '1';

    const totalScoreLabel = document.createElement('div');
    totalScoreLabel.textContent = 'Total Score';
    totalScoreLabel.style.fontSize = '14px';
    totalScoreLabel.style.color = '#818384';
    totalScoreContainer.appendChild(totalScoreLabel);

    const totalScore = document.createElement('div');
    totalScore.textContent = results.totalScore;
    totalScore.style.fontSize = '20px';
    totalScore.style.fontWeight = 'bold';
    totalScore.style.color = '#FF8C00'; // Quiz orange
    totalScoreContainer.appendChild(totalScore);

    scoreContainer.appendChild(totalScoreContainer);

    modal.appendChild(scoreContainer);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    const newQuizBtn = document.createElement('button');
    newQuizBtn.textContent = 'New Question';
    newQuizBtn.style.backgroundColor = '#FF8C00'; // Quiz orange
    newQuizBtn.style.color = 'white';
    newQuizBtn.style.border = 'none';
    newQuizBtn.style.padding = '8px 15px';
    newQuizBtn.style.borderRadius = '20px';
    newQuizBtn.style.cursor = 'pointer';
    newQuizBtn.style.width = '48%';
    newQuizBtn.style.fontWeight = 'bold';
    newQuizBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        startQuizGame();
    });
    buttonContainer.appendChild(newQuizBtn);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.backgroundColor = '#272729';
    closeBtn.style.color = '#D7DADC';
    closeBtn.style.border = '1px solid #343536';
    closeBtn.style.padding = '8px 15px';
    closeBtn.style.borderRadius = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.width = '48%';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }
    });
    buttonContainer.appendChild(closeBtn);

    modal.appendChild(buttonContainer);

    // Add to document
    document.body.appendChild(modal);
}

// Quit the quiz game
function quitQuizGame() {
    // Reset quiz state
    quizActive = false;
    quizSelectedCountries = [];
    quizCorrectCountries = [];
    currentQuestion = null;

    // Hide quiz panel
    quizPanel.style.display = 'none';

    // Check if population game is also inactive before hiding exit button
    if (typeof gameActive === 'undefined' || !gameActive) {
        const exitButton = document.getElementById('exit-button');
        if (exitButton) {
            exitButton.style.display = 'none';
        }
    }

    // Reset button text
    quizButton.textContent = 'Play Quiz Game';

    // Force globe redraw to clear selections
    needsRedraw = true;
}