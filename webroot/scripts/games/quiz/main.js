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

    // Add game title - UPDATED with smaller font and reduced margin
    const quizTitle = document.createElement('h4');
    quizTitle.textContent = 'Geography Quiz';
    quizTitle.style.textAlign = 'center';
    quizTitle.style.margin = '0 0 5px 0'; // Reduced margin
    quizTitle.style.color = '#FF8C00'; // Quiz orange
    quizTitle.style.fontWeight = '500';
    quizTitle.style.fontSize = '14px'; // Smaller font size
    quizPanel.appendChild(quizTitle);

    // Add difficulty badge - UPDATED with smaller size and padding
    const difficultyBadge = document.createElement('div');
    difficultyBadge.style.display = 'inline-block';
    difficultyBadge.style.padding = '2px 6px'; // Reduced padding
    difficultyBadge.style.borderRadius = '10px'; // Smaller radius
    difficultyBadge.style.fontSize = '10px'; // Smaller font
    difficultyBadge.style.marginBottom = '5px'; // Reduced margin
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

    // Add question - UPDATED with smaller padding and font
    const questionElement = document.createElement('div');
    questionElement.style.padding = '7px'; // Reduced padding
    questionElement.style.backgroundColor = '#272729';
    questionElement.style.borderRadius = '4px';
    questionElement.style.marginBottom = '10px'; // Reduced margin
    questionElement.style.border = '1px solid #343536';
    questionElement.style.fontSize = '12px'; // Smaller font
    questionElement.textContent = currentQuestion.question;
    quizPanel.appendChild(questionElement);

    // Add selection counter - UPDATED with smaller padding
    const counterContainer = document.createElement('div');
    counterContainer.style.display = 'flex';
    counterContainer.style.justifyContent = 'space-between';
    counterContainer.style.marginBottom = '10px'; // Reduced margin
    counterContainer.style.padding = '5px'; // Reduced padding
    counterContainer.style.backgroundColor = '#272729';
    counterContainer.style.borderRadius = '4px';
    counterContainer.style.border = '1px solid #343536';
    counterContainer.style.fontSize = '11px'; // Smaller font

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

    // Add selected countries container - UPDATED with smaller height and padding
    const selectedContainer = document.createElement('div');
    selectedContainer.id = 'quiz-selected-container';
    selectedContainer.style.marginBottom = '10px'; // Reduced margin
    selectedContainer.style.maxHeight = '120px'; // Reduced height
    selectedContainer.style.overflowY = 'auto';
    selectedContainer.style.backgroundColor = '#272729';
    selectedContainer.style.borderRadius = '4px';
    selectedContainer.style.padding = '5px'; // Reduced padding
    selectedContainer.style.border = '1px solid #343536';
    selectedContainer.style.fontSize = '11px'; // Smaller font

    // Add selected countries
    if (quizSelectedCountries.length === 0) {
        const noSelectionMsg = document.createElement('div');
        noSelectionMsg.textContent = 'Click on countries to select them';
        noSelectionMsg.style.color = '#818384';
        noSelectionMsg.style.fontStyle = 'italic';
        noSelectionMsg.style.textAlign = 'center';
        noSelectionMsg.style.padding = '7px'; // Reduced padding
        noSelectionMsg.style.fontSize = '11px'; // Smaller font
        selectedContainer.appendChild(noSelectionMsg);
    } else {
        quizSelectedCountries.forEach((country, index) => {
            const countryElement = document.createElement('div');
            countryElement.style.display = 'flex';
            countryElement.style.justifyContent = 'space-between';
            countryElement.style.padding = '3px'; // Reduced padding
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

    // Add buttons - UPDATED with smaller padding and font
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.backgroundColor = '#272729';
    resetButton.style.color = '#D7DADC';
    resetButton.style.border = '1px solid #343536';
    resetButton.style.padding = '5px 10px'; // Reduced padding
    resetButton.style.borderRadius = '15px'; // Reduced radius
    resetButton.style.cursor = 'pointer';
    resetButton.style.width = '48%';
    resetButton.style.fontSize = '11px'; // Smaller font
    resetButton.addEventListener('click', resetQuizSelections);
    buttonContainer.appendChild(resetButton);

    submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Answer';
    submitButton.style.backgroundColor = '#FF8C00'; // Quiz orange
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.padding = '5px 10px'; // Reduced padding
    submitButton.style.borderRadius = '15px'; // Reduced radius
    submitButton.style.cursor = 'pointer';
    submitButton.style.width = '48%';
    submitButton.style.fontWeight = 'bold';
    submitButton.style.fontSize = '11px'; // Smaller font
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
// Modified showQuizResults function to display results in a more compact layout
// Enhanced showQuizResults function with improved visual design
function showQuizResults(results) {
    // Create a result modal with improved styling
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#1A1A1B';
    modal.style.padding = '15px';
    modal.style.borderRadius = '8px';
    modal.style.color = '#D7DADC';
    modal.style.zIndex = '2000';
    modal.style.width = '350px';
    modal.style.maxHeight = '85vh';
    modal.style.overflowY = 'auto';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.7)';
    modal.style.border = '1px solid #343536';
    modal.style.fontSize = '12px';

    // Add a subtle gradient background for more visual appeal
    modal.style.background = 'linear-gradient(to bottom, #1F1F1F, #151515)';

    // Decorative top bar in quiz orange color
    const topBar = document.createElement('div');
    topBar.style.height = '4px';
    topBar.style.background = 'linear-gradient(to right, #FF8C00, #FFA500)';
    topBar.style.borderRadius = '3px 3px 0 0';
    topBar.style.marginTop = '-15px';
    topBar.style.marginLeft = '-15px';
    topBar.style.marginRight = '-15px';
    topBar.style.marginBottom = '12px';
    modal.appendChild(topBar);

    // Title with improved styling
    const title = document.createElement('h2');
    title.textContent = 'Quiz Results';
    title.style.color = '#FF8C00';
    title.style.margin = '0 0 8px 0';
    title.style.fontWeight = '600';
    title.style.fontSize = '18px';
    title.style.textAlign = 'center';
    title.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
    modal.appendChild(title);

    // Reddit-style post header
    const redditHeader = document.createElement('div');
    redditHeader.style.fontSize = '10px';
    redditHeader.style.color = '#818384';
    redditHeader.style.marginBottom = '10px';
    redditHeader.style.display = 'flex';
    redditHeader.style.alignItems = 'center';

    // Add Reddit-style icon
    const redditIcon = document.createElement('span');
    redditIcon.textContent = '🌍';
    redditIcon.style.marginRight = '5px';
    redditHeader.appendChild(redditIcon);

    const headerText = document.createElement('span');
    headerText.textContent = 'Posted by u/GeoQuizMaster • Now • Geography';
    redditHeader.appendChild(headerText);

    modal.appendChild(redditHeader);

    // Question card with improved styling
    const questionCard = document.createElement('div');
    questionCard.style.padding = '10px';
    questionCard.style.backgroundColor = '#272729';
    questionCard.style.borderRadius = '6px';
    questionCard.style.marginBottom = '12px';
    questionCard.style.fontSize = '13px';
    questionCard.style.fontWeight = 'bold';
    questionCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    questionCard.style.borderLeft = '3px solid #FF8C00';
    questionCard.textContent = currentQuestion.question;
    modal.appendChild(questionCard);

    // Score container with improved visual style
    const scoreContainer = document.createElement('div');
    scoreContainer.style.display = 'flex';
    scoreContainer.style.justifyContent = 'space-between';
    scoreContainer.style.marginBottom = '15px';
    scoreContainer.style.gap = '10px';

    // Round score card
    const roundScoreCard = document.createElement('div');
    roundScoreCard.style.flex = '1';
    roundScoreCard.style.backgroundColor = '#272729';
    roundScoreCard.style.borderRadius = '6px';
    roundScoreCard.style.padding = '8px';
    roundScoreCard.style.textAlign = 'center';
    roundScoreCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    roundScoreCard.style.display = 'flex';
    roundScoreCard.style.flexDirection = 'column';
    roundScoreCard.style.alignItems = 'center';
    roundScoreCard.style.justifyContent = 'center';

    const roundScoreLabel = document.createElement('div');
    roundScoreLabel.textContent = 'ROUND';
    roundScoreLabel.style.fontSize = '9px';
    roundScoreLabel.style.color = '#818384';
    roundScoreLabel.style.textTransform = 'uppercase';
    roundScoreLabel.style.letterSpacing = '1px';
    roundScoreCard.appendChild(roundScoreLabel);

    const roundScoreValue = document.createElement('div');
    roundScoreValue.textContent = results.scoreChange >= 0 ? `+${results.scoreChange}` : `${results.scoreChange}`;
    roundScoreValue.style.fontSize = '22px';
    roundScoreValue.style.fontWeight = 'bold';
    roundScoreValue.style.color = results.scoreChange >= 0 ? '#4CAF50' : '#F44336';
    roundScoreValue.style.margin = '3px 0';
    roundScoreCard.appendChild(roundScoreValue);

    scoreContainer.appendChild(roundScoreCard);

    // Total score card
    const totalScoreCard = document.createElement('div');
    totalScoreCard.style.flex = '1';
    totalScoreCard.style.backgroundColor = '#272729';
    totalScoreCard.style.borderRadius = '6px';
    totalScoreCard.style.padding = '8px';
    totalScoreCard.style.textAlign = 'center';
    totalScoreCard.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    totalScoreCard.style.display = 'flex';
    totalScoreCard.style.flexDirection = 'column';
    totalScoreCard.style.alignItems = 'center';
    totalScoreCard.style.justifyContent = 'center';

    const totalScoreLabel = document.createElement('div');
    totalScoreLabel.textContent = 'TOTAL';
    totalScoreLabel.style.fontSize = '9px';
    totalScoreLabel.style.color = '#818384';
    totalScoreLabel.style.textTransform = 'uppercase';
    totalScoreLabel.style.letterSpacing = '1px';
    totalScoreCard.appendChild(totalScoreLabel);

    const totalScoreValue = document.createElement('div');
    totalScoreValue.textContent = results.totalScore;
    totalScoreValue.style.fontSize = '22px';
    totalScoreValue.style.fontWeight = 'bold';
    totalScoreValue.style.color = '#FF8C00';
    totalScoreValue.style.margin = '3px 0';
    totalScoreCard.appendChild(totalScoreValue);

    scoreContainer.appendChild(totalScoreCard);
    modal.appendChild(scoreContainer);

    // Results grid container with improved styling
    const resultsContainer = document.createElement('div');
    resultsContainer.style.backgroundColor = '#272729';
    resultsContainer.style.borderRadius = '6px';
    resultsContainer.style.padding = '12px';
    resultsContainer.style.marginBottom = '15px';
    resultsContainer.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

    // Summary results in pill format
    const summaryContainer = document.createElement('div');
    summaryContainer.style.display = 'flex';
    summaryContainer.style.justifyContent = 'center';
    summaryContainer.style.gap = '10px';
    summaryContainer.style.marginBottom = '10px';

    // Correct count pill
    const correctPill = document.createElement('div');
    correctPill.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
    correctPill.style.color = '#4CAF50';
    correctPill.style.borderRadius = '15px';
    correctPill.style.padding = '3px 10px';
    correctPill.style.fontSize = '11px';
    correctPill.style.fontWeight = 'bold';
    correctPill.textContent = `✓ ${results.correctSelections.length}`;
    summaryContainer.appendChild(correctPill);

    // Incorrect count pill
    const incorrectPill = document.createElement('div');
    incorrectPill.style.backgroundColor = 'rgba(244, 67, 54, 0.2)';
    incorrectPill.style.color = '#F44336';
    incorrectPill.style.borderRadius = '15px';
    incorrectPill.style.padding = '3px 10px';
    incorrectPill.style.fontSize = '11px';
    incorrectPill.style.fontWeight = 'bold';
    incorrectPill.textContent = `✗ ${results.incorrectSelections.length}`;
    summaryContainer.appendChild(incorrectPill);

    // Missed count pill
    const missedPill = document.createElement('div');
    missedPill.style.backgroundColor = 'rgba(255, 193, 7, 0.2)';
    missedPill.style.color = '#FFC107';
    missedPill.style.borderRadius = '15px';
    missedPill.style.padding = '3px 10px';
    missedPill.style.fontSize = '11px';
    missedPill.style.fontWeight = 'bold';
    missedPill.textContent = `• ${results.missedAnswers.length}`;
    summaryContainer.appendChild(missedPill);

    resultsContainer.appendChild(summaryContainer);

    // Results grid - three column layout with dividers
    const resultsGrid = document.createElement('div');
    resultsGrid.style.display = 'flex';
    resultsGrid.style.gap = '0';

    // Column 1: Correct answers
    const correctColumn = document.createElement('div');
    correctColumn.style.flex = '1';
    correctColumn.style.minWidth = '0';
    correctColumn.style.padding = '0 8px';
    correctColumn.style.position = 'relative';

    // Right border divider
    correctColumn.style.borderRight = '1px solid rgba(255, 255, 255, 0.1)';

    const correctTitle = document.createElement('div');
    correctTitle.style.textAlign = 'center';
    correctTitle.style.fontSize = '11px';
    correctTitle.style.fontWeight = 'bold';
    correctTitle.style.color = '#4CAF50';
    correctTitle.style.marginBottom = '8px';
    correctTitle.style.textTransform = 'uppercase';
    correctTitle.style.letterSpacing = '0.5px';
    correctTitle.textContent = 'Correct';
    correctColumn.appendChild(correctTitle);

    const correctList = document.createElement('div');
    correctList.style.maxHeight = '120px';
    correctList.style.overflowY = 'auto';
    correctList.style.paddingRight = '5px';

    // Styling for scrollbar
    correctList.style.scrollbarWidth = 'thin';
    correctList.style.scrollbarColor = '#444 #272729';

    if (results.correctSelections.length > 0) {
        results.correctSelections.forEach(code => {
            let countryName = code;
            if (worldData) {
                const country = worldData.features.find(f =>
                    (f.properties.code || f.properties.ISO_A3) === code);
                if (country) {
                    countryName = country.properties.name || country.properties.NAME || code;
                }
            }

            const item = document.createElement('div');
            item.textContent = countryName;
            item.style.padding = '2px 0';
            item.style.fontSize = '10px';
            item.style.textOverflow = 'ellipsis';
            item.style.overflow = 'hidden';
            item.style.whiteSpace = 'nowrap';
            item.style.color = 'rgba(255, 255, 255, 0.9)';
            correctList.appendChild(item);
        });
    } else {
        const noCorrect = document.createElement('div');
        noCorrect.textContent = 'None';
        noCorrect.style.fontStyle = 'italic';
        noCorrect.style.textAlign = 'center';
        noCorrect.style.fontSize = '10px';
        noCorrect.style.color = 'rgba(255, 255, 255, 0.5)';
        correctList.appendChild(noCorrect);
    }

    correctColumn.appendChild(correctList);
    resultsGrid.appendChild(correctColumn);

    // Column 2: Incorrect answers
    const incorrectColumn = document.createElement('div');
    incorrectColumn.style.flex = '1';
    incorrectColumn.style.minWidth = '0';
    incorrectColumn.style.padding = '0 8px';
    incorrectColumn.style.position = 'relative';

    // Right border divider
    incorrectColumn.style.borderRight = '1px solid rgba(255, 255, 255, 0.1)';

    const incorrectTitle = document.createElement('div');
    incorrectTitle.style.textAlign = 'center';
    incorrectTitle.style.fontSize = '11px';
    incorrectTitle.style.fontWeight = 'bold';
    incorrectTitle.style.color = '#F44336';
    incorrectTitle.style.marginBottom = '8px';
    incorrectTitle.style.textTransform = 'uppercase';
    incorrectTitle.style.letterSpacing = '0.5px';
    incorrectTitle.textContent = 'Incorrect';
    incorrectColumn.appendChild(incorrectTitle);

    const incorrectList = document.createElement('div');
    incorrectList.style.maxHeight = '120px';
    incorrectList.style.overflowY = 'auto';
    incorrectList.style.paddingRight = '5px';

    // Styling for scrollbar
    incorrectList.style.scrollbarWidth = 'thin';
    incorrectList.style.scrollbarColor = '#444 #272729';

    if (results.incorrectSelections.length > 0) {
        results.incorrectSelections.forEach(code => {
            let countryName = code;
            if (worldData) {
                const country = worldData.features.find(f =>
                    (f.properties.code || f.properties.ISO_A3) === code);
                if (country) {
                    countryName = country.properties.name || country.properties.NAME || code;
                }
            }

            const item = document.createElement('div');
            item.textContent = countryName;
            item.style.padding = '2px 0';
            item.style.fontSize = '10px';
            item.style.textOverflow = 'ellipsis';
            item.style.overflow = 'hidden';
            item.style.whiteSpace = 'nowrap';
            item.style.color = 'rgba(255, 255, 255, 0.8)';
            incorrectList.appendChild(item);
        });
    } else {
        const noIncorrect = document.createElement('div');
        noIncorrect.textContent = 'None';
        noIncorrect.style.fontStyle = 'italic';
        noIncorrect.style.textAlign = 'center';
        noIncorrect.style.fontSize = '10px';
        noIncorrect.style.color = 'rgba(255, 255, 255, 0.5)';
        incorrectList.appendChild(noIncorrect);
    }

    incorrectColumn.appendChild(incorrectList);
    resultsGrid.appendChild(incorrectColumn);

    // Column 3: Missed answers
    const missedColumn = document.createElement('div');
    missedColumn.style.flex = '1';
    missedColumn.style.minWidth = '0';
    missedColumn.style.padding = '0 8px';

    const missedTitle = document.createElement('div');
    missedTitle.style.textAlign = 'center';
    missedTitle.style.fontSize = '11px';
    missedTitle.style.fontWeight = 'bold';
    missedTitle.style.color = '#FFC107';
    missedTitle.style.marginBottom = '8px';
    missedTitle.style.textTransform = 'uppercase';
    missedTitle.style.letterSpacing = '0.5px';
    missedTitle.textContent = 'Missed';
    missedColumn.appendChild(missedTitle);

    const missedList = document.createElement('div');
    missedList.style.maxHeight = '120px';
    missedList.style.overflowY = 'auto';
    missedList.style.paddingRight = '5px';

    // Styling for scrollbar
    missedList.style.scrollbarWidth = 'thin';
    missedList.style.scrollbarColor = '#444 #272729';

    if (results.missedAnswers.length > 0) {
        results.missedAnswers.forEach(code => {
            let countryName = code;
            if (worldData) {
                const country = worldData.features.find(f =>
                    (f.properties.code || f.properties.ISO_A3) === code);
                if (country) {
                    countryName = country.properties.name || country.properties.NAME || code;
                }
            }

            const item = document.createElement('div');
            item.textContent = countryName;
            item.style.padding = '2px 0';
            item.style.fontSize = '10px';
            item.style.textOverflow = 'ellipsis';
            item.style.overflow = 'hidden';
            item.style.whiteSpace = 'nowrap';
            item.style.color = 'rgba(255, 255, 255, 0.8)';
            missedList.appendChild(item);
        });
    } else {
        const noMissed = document.createElement('div');
        noMissed.textContent = 'None';
        noMissed.style.fontStyle = 'italic';
        noMissed.style.textAlign = 'center';
        noMissed.style.fontSize = '10px';
        noMissed.style.color = 'rgba(255, 255, 255, 0.5)';
        missedList.appendChild(noMissed);
    }

    missedColumn.appendChild(missedList);
    resultsGrid.appendChild(missedColumn);

    resultsContainer.appendChild(resultsGrid);


    modal.appendChild(resultsContainer);

    // Buttons with improved styling
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.gap = '10px';

    const newQuizBtn = document.createElement('button');
    newQuizBtn.textContent = 'New Question';
    newQuizBtn.style.flex = '1';
    newQuizBtn.style.backgroundColor = '#FF8C00';
    newQuizBtn.style.color = 'white';
    newQuizBtn.style.border = 'none';
    newQuizBtn.style.padding = '8px 12px';
    newQuizBtn.style.borderRadius = '20px';
    newQuizBtn.style.cursor = 'pointer';
    newQuizBtn.style.fontWeight = 'bold';
    newQuizBtn.style.fontSize = '12px';
    newQuizBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    newQuizBtn.style.transition = 'all 0.2s ease';

    // Hover effect
    newQuizBtn.onmouseover = () => {
        newQuizBtn.style.backgroundColor = '#FFA500';
        newQuizBtn.style.transform = 'translateY(-2px)';
        newQuizBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    };

    newQuizBtn.onmouseout = () => {
        newQuizBtn.style.backgroundColor = '#FF8C00';
        newQuizBtn.style.transform = 'translateY(0)';
        newQuizBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
    };

    newQuizBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        startQuizGame();
    });
    buttonContainer.appendChild(newQuizBtn);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.flex = '1';
    closeBtn.style.backgroundColor = '#333';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = '1px solid #444';
    closeBtn.style.padding = '8px 12px';
    closeBtn.style.borderRadius = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '12px';
    closeBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    closeBtn.style.transition = 'all 0.2s ease';

    // Hover effect
    closeBtn.onmouseover = () => {
        closeBtn.style.backgroundColor = '#444';
        closeBtn.style.transform = 'translateY(-2px)';
        closeBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
    };

    closeBtn.onmouseout = () => {
        closeBtn.style.backgroundColor = '#333';
        closeBtn.style.transform = 'translateY(0)';
        closeBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    };

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

    // Add to document with a fade-in effect
    modal.style.opacity = '0';
    document.body.appendChild(modal);

    setTimeout(() => {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '1';
    }, 10);
}

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