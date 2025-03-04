// quiz/main.js
let currentQuestion = null;
let currentStreak = 0;
let questionsAnswered = 0;
let gamePanel;
let startButtonQuiz;
let submitButton;
let skipButton;
let resetButtonQuiz;
let countriesData; // Will store the globe's country data

// Sample questions data
const quizQuestions = [
    {
        "id": 1,
        "question": "Which countries are completely landlocked in South America?",
        "answer": ["BOL", "PRY"],
        "difficulty": "Medium",
        "explanation": "Bolivia (BOL) and Paraguay (PRY) are the only two completely landlocked countries in South America."
    },
    {
        "id": 2,
        "question": "Which countries have a population of over 100 million?",
        "answer": ["CHN", "IND", "USA", "IDN", "PAK", "BRA", "NGA", "BGD", "RUS", "MEX", "JPN", "PHL", "ETH"],
        "difficulty": "Medium",
        "explanation": "China, India, USA, Indonesia, Pakistan, Brazil, Nigeria, Bangladesh, Russia, Mexico, Japan, Philippines, and Ethiopia all have populations exceeding 100 million people."
    },
    {
        "id": 3,
        "question": "Which countries have territory within the Arctic Circle?",
        "answer": ["USA", "CAN", "RUS", "NOR", "SWE", "FIN", "ISL", "DNK"],
        "difficulty": "Medium",
        "explanation": "The United States (Alaska), Canada, Russia, Norway, Sweden, Finland, Iceland, and Denmark (via Greenland) all have territory above the Arctic Circle."
    },
    {
        "id": 4,
        "question": "Which countries are monarchies in Europe?",
        "answer": ["GBR", "ESP", "BEL", "NLD", "DNK", "SWE", "NOR", "MCO", "LIE", "LUX", "AND"],
        "difficulty": "Hard",
        "explanation": "The United Kingdom, Spain, Belgium, Netherlands, Denmark, Sweden, Norway, Monaco, Liechtenstein, Luxembourg, and Andorra are all monarchies in Europe."
    },
    {
        "id": 5,
        "question": "Which countries are part of the Schengen Area?",
        "answer": ["AUT", "BEL", "CZE", "DNK", "EST", "FIN", "FRA", "DEU", "GRC", "HUN", "ISL", "ITA", "LVA", "LIE", "LTU", "LUX", "MLT", "NLD", "NOR", "POL", "PRT", "SVK", "SVN", "ESP", "SWE", "CHE"],
        "difficulty": "Hard",
        "explanation": "The Schengen Area consists of 26 European countries that have officially abolished passport and all other types of border control at their mutual borders."
    },
    {
        "id": 6,
        "question": "Which countries were part of the former Yugoslavia?",
        "answer": ["SVN", "HRV", "BIH", "SRB", "MNE", "MKD"],
        "difficulty": "Medium",
        "explanation": "Slovenia, Croatia, Bosnia and Herzegovina, Serbia, Montenegro, and North Macedonia were all part of the former Yugoslavia."
    },
    {
        "id": 7,
        "question": "Which countries are islands in the Caribbean?",
        "answer": ["CUB", "HTI", "DOM", "JAM", "TTO", "BHS", "BRB", "ATG", "DMA", "GRD", "KNA", "LCA", "VCT"],
        "difficulty": "Hard",
        "explanation": "Cuba, Haiti, Dominican Republic, Jamaica, Trinidad and Tobago, Bahamas, Barbados, Antigua and Barbuda, Dominica, Grenada, Saint Kitts and Nevis, Saint Lucia, and Saint Vincent and the Grenadines are all island nations in the Caribbean."
    },
    {
        "id": 8,
        "question": "Which countries joined the European Union in 2004?",
        "answer": ["CYP", "CZE", "EST", "HUN", "LVA", "LTU", "MLT", "POL", "SVK", "SVN"],
        "difficulty": "Hard",
        "explanation": "Cyprus, Czech Republic, Estonia, Hungary, Latvia, Lithuania, Malta, Poland, Slovakia, and Slovenia all joined the European Union in 2004."
    },
    {
        "id": 9,
        "question": "Which countries have the highest GDP per capita?",
        "answer": ["LUX", "CHE", "IRL", "NOR", "ISL", "USA", "DNK", "SGP", "QAT", "AUS"],
        "difficulty": "Medium",
        "explanation": "Luxembourg, Switzerland, Ireland, Norway, Iceland, United States, Denmark, Singapore, Qatar, and Australia typically have the highest GDP per capita."
    },
    {
        "id": 10,
        "question": "Which countries have the highest percentage of forest cover?",
        "answer": ["SUR", "GUF", "GUY", "FSM", "GAB", "SYC", "PLW", "BTN", "SLB", "FIN"],
        "difficulty": "Hard",
        "explanation": "Suriname (SUR), French Guiana (GUF), Guyana (GUY), Micronesia (FSM), Gabon (GAB), Seychelles (SYC), Palau (PLW), Bhutan (BTN), Solomon Islands (SLB), and Finland (FIN) have the highest percentages of their land covered by forests."
    }
];

// Modify the globe drawing function to highlight selected countries
    function modifyGlobeRenderer() {
        // Check if we have access to the globe's drawing function
        if (window.drawFeature) {
            // Keep reference to the original function
            const originalDrawFeature = window.drawFeature;

            // Override with our enhanced version
            window.drawFeature = function(ctx, feature, color) {
                let customColor = color;

                // Get the country code
                const countryCode = feature.properties.ISO_A3 || feature.properties.ISO_A3;

                if (countryCode) {
                    // Check if this country is selected in our game
                    if (gameActive && selectedCountries.some(c => c.ISO_A3 === countryCode)) {
                        customColor = 'rgba(255, 69, 0, 0.8)'; // Reddit orange for selection
                    }

                    // Check if this country should be highlighted as an answer
                    if (window.quizHighlightCountries && window.quizHighlightCountries.includes(countryCode)) {
                        customColor = 'rgba(76, 175, 80, 0.8)'; // Green for correct answers
                    }
                }

                // Call the original function with our modified color
                originalDrawFeature(ctx, feature, customColor);
            };

            console.log('Geography Quiz: Globe renderer modified for highlighting');
        } else {
            console.warn('Geography Quiz: Unable to modify globe renderer, drawFeature not found');
        }
    }

// Initialize the game
    function initGeographyQuiz() {
        console.log('Geography Quiz: Initializing...');

        // Save reference to countries data for lookup
        if (window.countriesData) {
            countriesData = window.countriesData;
        }

        // Initialize game UI elements
        initGameElements();

        // Setup event listeners
        setupGameEventListeners();

        // Modify the globe renderer
        modifyGlobeRenderer();

        // Wait a moment and then show a welcome message
        setTimeout(() => {
            showToast('Welcome to Geography Quiz! Click "Geography Quiz" to begin.', 3000);
        }, 1500);

        console.log('Geography Quiz: Initialization complete');
    }

// Initialize when the page has loaded
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize the game after the globe is loaded
        const checkGlobeLoaded = setInterval(() => {
            if (window.globe && window.drawFeature) {
                clearInterval(checkGlobeLoaded);
                initGeographyQuiz();
            }
        }, 500);

        // Failsafe - initialize anyway after 5 seconds
        setTimeout(() => {
            clearInterval(checkGlobeLoaded);
            initGeographyQuiz();
        }, 5000);
    });

// Game panel elements
function initGameElements() {
    // Create main game panel
    gamePanel = document.createElement('div');
    gamePanel.id = 'game-panel';
    gamePanel.style.position = 'absolute';
    gamePanel.style.bottom = '20px';
    gamePanel.style.right = '20px';
    gamePanel.style.width = '220px';
    gamePanel.style.backgroundColor = '#1A1A1B';
    gamePanel.style.color = '#D7DADC';
    gamePanel.style.padding = '15px';
    gamePanel.style.borderRadius = '4px';
    gamePanel.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
    gamePanel.style.zIndex = '1000';
    gamePanel.style.fontFamily = '"Noto Sans", "Helvetica Neue", Arial, sans-serif';
    gamePanel.style.fontSize = '14px';
    gamePanel.style.display = 'none';
    gamePanel.style.border = '1px solid #343536';
    gamePanel.style.maxHeight = '80vh';
    gamePanel.style.overflowY = 'auto';

    // Game title
    const gameTitle = document.createElement('h3');
    gameTitle.textContent = 'Geography Quiz';
    gameTitle.style.textAlign = 'center';
    gameTitle.style.margin = '0 0 15px 0';
    gameTitle.style.color = '#FF4500';
    gameTitle.style.fontWeight = '500';
    gamePanel.appendChild(gameTitle);

    // Score display
    const scoreContainer = document.createElement('div');
    scoreContainer.style.display = 'flex';
    scoreContainer.style.justifyContent = 'space-between';
    scoreContainer.style.marginBottom = '15px';
    scoreContainer.style.padding = '8px';
    scoreContainer.style.backgroundColor = '#272729';
    scoreContainer.style.borderRadius = '4px';
    scoreContainer.style.border = '1px solid #343536';

    const scoreLabel = document.createElement('span');
    scoreLabel.textContent = 'Score:';
    scoreLabel.style.color = '#818384';
    scoreContainer.appendChild(scoreLabel);

    const scoreDisplay = document.createElement('span');
    scoreDisplay.id = 'score';
    scoreDisplay.style.fontWeight = 'bold';
    scoreDisplay.style.color = '#FF4500';
    scoreDisplay.textContent = '0';
    scoreContainer.appendChild(scoreDisplay);
    gamePanel.appendChild(scoreContainer);

    // Streak display
    const streakContainer = document.createElement('div');
    streakContainer.style.display = 'flex';
    streakContainer.style.justifyContent = 'space-between';
    streakContainer.style.marginBottom = '15px';
    streakContainer.style.padding = '8px';
    streakContainer.style.backgroundColor = '#272729';
    streakContainer.style.borderRadius = '4px';
    streakContainer.style.border = '1px solid #343536';

    const streakLabel = document.createElement('span');
    streakLabel.textContent = 'Streak:';
    streakLabel.style.color = '#818384';
    streakContainer.appendChild(streakLabel);

    const streakDisplay = document.createElement('span');
    streakDisplay.id = 'streak';
    streakDisplay.style.fontWeight = 'bold';
    streakDisplay.style.color = '#FF4500';
    streakDisplay.textContent = '0';
    streakContainer.appendChild(streakDisplay);
    gamePanel.appendChild(streakContainer);

    // Question container
    const questionContainer = document.createElement('div');
    questionContainer.id = 'question-container';
    questionContainer.style.backgroundColor = '#272729';
    questionContainer.style.borderRadius = '4px';
    questionContainer.style.padding = '10px';
    questionContainer.style.marginBottom = '15px';
    questionContainer.style.border = '1px solid #343536';

    const questionTitle = document.createElement('div');
    questionTitle.textContent = 'Question:';
    questionTitle.style.fontSize = '12px';
    questionTitle.style.color = '#818384';
    questionTitle.style.marginBottom = '5px';
    questionContainer.appendChild(questionTitle);

    const questionText = document.createElement('div');
    questionText.id = 'question-text';
    questionText.style.fontSize = '16px';
    questionText.style.lineHeight = '1.4';
    questionText.style.fontWeight = '500';
    questionContainer.appendChild(questionText);

    const difficultyText = document.createElement('div');
    difficultyText.id = 'difficulty-text';
    difficultyText.style.fontSize = '12px';
    difficultyText.style.marginTop = '10px';
    difficultyText.style.color = '#818384';
    questionContainer.appendChild(difficultyText);

    const selectionCounter = document.createElement('div');
    selectionCounter.id = 'selection-counter';
    selectionCounter.style.fontSize = '14px';
    selectionCounter.style.marginTop = '10px';
    selectionCounter.style.textAlign = 'center';
    questionContainer.appendChild(selectionCounter);

    gamePanel.appendChild(questionContainer);

    // Selected countries container
    const selectedContainer = document.createElement('div');
    selectedContainer.id = 'selected-container';
    selectedContainer.style.backgroundColor = '#272729';
    selectedContainer.style.borderRadius = '4px';
    selectedContainer.style.padding = '10px';
    selectedContainer.style.marginBottom = '15px';
    selectedContainer.style.border = '1px solid #343536';
    selectedContainer.style.maxHeight = '200px';
    selectedContainer.style.overflowY = 'auto';

    const selectedTitle = document.createElement('div');
    selectedTitle.textContent = 'Selected Countries:';
    selectedTitle.style.fontSize = '12px';
    selectedTitle.style.color = '#818384';
    selectedTitle.style.marginBottom = '5px';
    selectedContainer.appendChild(selectedTitle);

    const selectedList = document.createElement('div');
    selectedList.id = 'selected-list';
    selectedContainer.appendChild(selectedList);

    gamePanel.appendChild(selectedContainer);

    // Controls
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.flexWrap = 'wrap';
    controlsContainer.style.gap = '10px';

    // Start button
    startButtonQuiz = document.createElement('button');
    startButtonQuiz.id = 'start-button';
    startButtonQuiz.textContent = 'Start Game';
    startButtonQuiz.style.backgroundColor = '#FF4500';
    startButtonQuiz.style.color = 'white';
    startButtonQuiz.style.border = 'none';
    startButtonQuiz.style.padding = '8px 12px';
    startButtonQuiz.style.borderRadius = '20px';
    startButtonQuiz.style.fontSize = '14px';
    startButtonQuiz.style.cursor = 'pointer';
    startButtonQuiz.style.flex = '1';
    startButtonQuiz.style.fontWeight = 'bold';
    controlsContainer.appendChild(startButtonQuiz);

    // Reset button
    resetButtonQuiz = document.createElement('button');
    resetButtonQuiz.id = 'reset-button';
    resetButtonQuiz.textContent = 'Reset';
    resetButtonQuiz.style.backgroundColor = '#272729';
    resetButtonQuiz.style.color = '#D7DADC';
    resetButtonQuiz.style.border = '1px solid #343536';
    resetButtonQuiz.style.padding = '8px 12px';
    resetButtonQuiz.style.borderRadius = '20px';
    resetButtonQuiz.style.fontSize = '14px';
    resetButtonQuiz.style.cursor = 'pointer';
    resetButtonQuiz.style.flex = '1';
    resetButtonQuiz.disabled = true;
    resetButtonQuiz.style.opacity = '0.5';
    controlsContainer.appendChild(resetButtonQuiz);

    // Submit button
    submitButton = document.createElement('button');
    submitButton.id = 'submit-button';
    submitButton.textContent = 'Submit Answer';
    submitButton.style.backgroundColor = '#4CAF50';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.padding = '8px 12px';
    submitButton.style.borderRadius = '20px';
    submitButton.style.fontSize = '14px';
    submitButton.style.cursor = 'pointer';
    submitButton.style.width = '48%';
    submitButton.style.fontWeight = 'bold';
    submitButton.style.marginTop = '10px';
    submitButton.style.flex = '1';
    submitButton.disabled = false;
    submitButton.style.opacity = '0.5';

    // Skip button
    skipButton = document.createElement('button');
    skipButton.id = 'skip-button';
    skipButton.textContent = 'Skip Question';
    skipButton.style.backgroundColor = '#FFA500';
    skipButton.style.color = 'white';
    skipButton.style.border = 'none';
    skipButton.style.padding = '8px 12px';
    skipButton.style.borderRadius = '20px';
    skipButton.style.fontSize = '14px';
    skipButton.style.cursor = 'pointer';
    skipButton.style.width = '48%';
    skipButton.style.marginTop = '10px';
    skipButton.style.flex = '1';
    skipButton.disabled = true;
    skipButton.style.opacity = '0.5';

    // Add buttons to second row
    const secondRowButtons = document.createElement('div');
    secondRowButtons.style.display = 'flex';
    secondRowButtons.style.justifyContent = 'space-between';
    secondRowButtons.style.width = '100%';
    secondRowButtons.style.gap = '10px';
    secondRowButtons.appendChild(submitButton);
    secondRowButtons.appendChild(skipButton);

    controlsContainer.appendChild(secondRowButtons);
    gamePanel.appendChild(controlsContainer);

    document.body.appendChild(gamePanel);

    // Add game toggle button
    const showGameButton = document.createElement('button');
    showGameButton.id = 'show-game-button';
    showGameButton.textContent = 'Geography Quiz';
    showGameButton.style.position = 'absolute';
    showGameButton.style.top = '60px';
    showGameButton.style.right = '10px';
    showGameButton.style.backgroundColor = '#FF4500';
    showGameButton.style.color = 'white';
    showGameButton.style.border = 'none';
    showGameButton.style.padding = '8px 15px';
    showGameButton.style.borderRadius = '20px';
    showGameButton.style.fontSize = '14px';
    showGameButton.style.cursor = 'pointer';
    showGameButton.style.zIndex = '1000';

    showGameButton.addEventListener('click', () => {
        if (gamePanel.style.display === 'none') {
            gamePanel.style.display = 'block';
            showGameButton.textContent = 'Hide Quiz';
        } else {
            gamePanel.style.display = 'none';
            showGameButton.textContent = 'Geography Quiz';
        }
    });

    document.body.appendChild(showGameButton);
}

// Setup event listeners for game buttons
function setupGameEventListeners() {
    // Start button - Begin a new game
    startButtonQuiz.addEventListener('click', startNewGame);

    // Reset button - Clear current selections during a game
    resetButtonQuiz.addEventListener('click', resetSelections);

    // Submit button - Submit answer for evaluation
    submitButton.addEventListener('click', submitAnswer);

    // Skip button - Skip current question
    skipButton.addEventListener('click', skipQuestion);

    // Override the globe's click handler to work with our game
    console.log('Geography Quiz: Modifying globe click handler...', window.handleGlobeClick);
    if (window.handleGlobeClick) {
        const originalHandleGlobeClick = window.handleGlobeClick;
        window.handleGlobeClick = function(e) {
            // Call the original function to handle basic globe interaction
            originalHandleGlobeClick(e);
            console.log('Geography Quiz: Handling globe click...', e);
            // If a country was clicked and game is active, handle selection
            console.log('Geography Quiz: Game active?', gameActive, hoveredFeature);
            if (gameActive && hoveredFeature) {
                handleCountrySelectionQuiz(hoveredFeature);
            }
        };
    } else {
        console.warn('Geography Quiz: Unable to find global handleGlobeClick function');
    }
}
// Start a new game round
function startNewGame() {
    console.log('Geography Quiz: Starting new game...');
    // Reset for a new game
    resetSelections();

    // Get a random question
    const questionIndex = Math.floor(Math.random() * quizQuestions.length);
    currentQuestion = quizQuestions[questionIndex];
    console.log('Geography Quiz: New question', currentQuestion);
    // Display the question
    document.getElementById('question-text').textContent = currentQuestion.question;
    document.getElementById('difficulty-text').textContent = `Difficulty: ${currentQuestion.difficulty}`;
    updateSelectionCounter();

    // Update UI
    gameActive = true;
    startButtonQuiz.textContent = 'New Question';
    resetButtonQuiz.disabled = false;
    resetButtonQuiz.style.opacity = '1';
    console.log('Geography Quiz: Disabling submit button');

    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';
    skipButton.disabled = false;
    skipButton.style.opacity = '1';

    // Show toast notification
    showToast(`New question! Select the correct countries.`, 3000);

    // Force a redraw of the globe
    window.needsRedraw = true;
}

// Reset current selections
function resetSelections() {
    selectedCountries = [];

    // Update selection counter
    updateSelectionCounter();

    // Update UI
    document.getElementById('selected-list').innerHTML = '';
    console.log('Geography Quiz: Disabling submit button');

    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';

    // Force a redraw of the globe
    window.needsRedraw = true;
}

// Handle country selection for the game
function handleCountrySelectionQuiz(feature) {
    if (!feature || !feature.properties) return;

    // Get country information - FIX: use proper property fallbacks
    const countryCode = feature.properties.code || feature.properties.ISO_A3;
    const countryName = feature.properties.name || feature.properties.NAME;
    console.log('Geography Quiz: Selected country', countryCode, countryName);
    if (!countryCode || !countryName) {
        console.warn('Geography Quiz: Missing country code or name', feature.properties);
        return;
    }

    // Check if country is already selected - FIX: use consistent property name
    const existingIndex = selectedCountries.findIndex(c => c.code === countryCode);
    console.log('Geography Quiz: Existing index', existingIndex);


        console.log(' Current question', currentQuestion, );
        // Check if we've reached the max number of selections
        if (currentQuestion && selectedCountries.length >= currentQuestion.answer.length) {
            showToast(`You can only select ${currentQuestion.answer.length} countries. Remove a country first.`, 2000);
            return;
        }

        // Add country to selection - FIX: use consistent property names (code instead of ISO_A3)
        console.log('Geography Quiz: Adding country to selection', countryCode, countryName);
        selectedCountries.push({
            code: countryCode,
            name: countryName
        });

        showToast(`Selected ${countryName}`, 1000);


    // Update UI
    updateSelectedCountriesDisplay();
    updateSelectionCounter();

    // Enable submit button if any countries are selected
    console.log('Geography Quiz: Selected countries', selectedCountries, selectedCountries.length);
    if (selectedCountries.length > 0) {
        console.log('Geography Quiz: Enabling submit button');
        submitButton.disabled = false;
        submitButton.style.opacity = '1';
    } else {
        console.log('Geography Quiz: Disabling submit button');

        submitButton.disabled = true;
        submitButton.style.opacity = '0.5';
    }

    // Force a redraw of the globe
    window.needsRedraw = true;
}
// Update the selection counter
function updateSelectionCounter() {
    if (!currentQuestion) return;

    const counter = document.getElementById('selection-counter');
    counter.textContent = `Selected: ${selectedCountries.length}/${currentQuestion.answer.length}`;

    // Change color based on completion
    if (selectedCountries.length === currentQuestion.answer.length) {
        counter.style.color = '#4CAF50';
        counter.style.fontWeight = 'bold';
    } else {
        counter.style.color = '#D7DADC';
        counter.style.fontWeight = 'normal';
    }
}

// Update the display of selected countries
function updateSelectedCountriesDisplay() {
    console.log('Geography Quiz: Updating selected countries display...');
    // Clear the display
    const selectedList = document.getElementById('selected-list');
    selectedList.innerHTML = '';
    console.log('Geography Quiz: Selected countries', selectedCountries);
    // Add each country to the display
    selectedCountries.forEach((country, index) => {
        const countryElement = document.createElement('div');
        countryElement.style.display = 'flex';
        countryElement.style.justifyContent = 'space-between';
        countryElement.style.alignItems = 'center';
        countryElement.style.padding = '2px';
        countryElement.style.marginBottom = '2px';
        countryElement.style.backgroundColor = '#333';
        countryElement.style.borderRadius = '4px';
        countryElement.style.fontSize = '10px';

        const nameElement = document.createElement('span');
        nameElement.textContent = country.name;
        countryElement.appendChild(nameElement);
        const removeButton = document.createElement('button');
        removeButton.textContent = '✕';
        removeButton.style.backgroundColor = 'transparent';
        removeButton.style.color = '#FF4500';
        removeButton.style.border = 'none';
        removeButton.style.cursor = 'pointer';
        removeButton.style.fontSize = '9px';
        removeButton.addEventListener('click', () => {
            // Remove country from selection
            selectedCountries.splice(index, 1);
            updateSelectedCountriesDisplay();
            updateSelectionCounter();

            // Update submit button state
            console.log('Geography Quiz: Selected countries', selectedCountries);
            if (selectedCountries.length === 0) {
                console.log('Geography Quiz: Disabling submit button');

                submitButton.disabled = true;
                submitButton.style.opacity = '0.5';
            }

            // Force a redraw of the globe
            window.needsRedraw = true;
        });
        countryElement.appendChild(removeButton);

        selectedList.appendChild(countryElement);
    });
}
// Submit answer for evaluation
function submitAnswer() {
    if (!currentQuestion || !gameActive) return;

    // Convert selected countries to array of codes - FIX: use consistent property name
    const selectedCodes = selectedCountries.map(country => country.code);

    // Calculate correct and incorrect answers
    const correctAnswers = [];
    const incorrectAnswers = [];

    selectedCodes.forEach(code => {
        if (currentQuestion.answer.includes(code)) {
            correctAnswers.push(code);
        } else {
            incorrectAnswers.push(code);
        }
    });

    // Rest of the function remains the same
    // Calculate missing answers
    const missingAnswers = currentQuestion.answer.filter(code => !selectedCodes.includes(code));
    console.log('Geography Quiz: Correct', correctAnswers, 'Incorrect', incorrectAnswers, 'Missing', missingAnswers);
    // Calculate score
    let roundScore = 0;
    const basePoints = 100;

    // Points for correct answers
    roundScore += correctAnswers.length * basePoints;

    // Penalty for incorrect answers
    roundScore -= incorrectAnswers.length * (basePoints / 2);

    // Bonus for all correct and no incorrect
    if (correctAnswers.length === currentQuestion.answer.length && incorrectAnswers.length === 0) {
        const perfectBonus = Math.floor(basePoints * currentQuestion.answer.length * 0.5);
        roundScore += perfectBonus;
        showAnimatedMessage(`Perfect! +${perfectBonus} bonus points!`);
        currentStreak++;
    } else {
        currentStreak = 0;
    }

    // Update total score (minimum 0)
    gameScore = Math.max(0, gameScore + roundScore);
    document.getElementById('score').textContent = gameScore;
    document.getElementById('streak').textContent = currentStreak;

    // Increment questions answered
    questionsAnswered++;

    // Show results
    showResults(correctAnswers, incorrectAnswers, missingAnswers, roundScore);
}
// Skip the current question
function skipQuestion() {
    if (!currentQuestion || !gameActive) return;

    // Reset streak on skip
    currentStreak = 0;
    document.getElementById('streak').textContent = currentStreak;

    // Show the correct answers briefly
    showAnswers(currentQuestion.answer);

    // Start a new game after a delay
    setTimeout(() => {
        startNewGame();
    }, 3000);
}

// Show animated message in the center of the screen
function showAnimatedMessage(message) {
    const container = document.getElementById('animated-target-container');
    const display = document.getElementById('animated-target-display');

    // Prepare the animation
    display.textContent = message;
    container.style.display = 'flex';
    display.style.transform = 'scale(0.5)';
    display.style.opacity = '0';

    // Animate in
    let startTime = null;
    const duration = 2000; // 2 seconds for the animation

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Scale up and fade in
        if (progress < 0.5) {
            // First half: scale up and fade in
            const scale = 0.5 + progress * 1.5; // Scale from 0.5 to 1.25
            const opacity = progress * 2; // Fade from 0 to 1
            display.style.transform = `scale(${scale})`;
            display.style.opacity = opacity;
        } else if (progress < 0.8) {
            // Hold at full size
            display.style.transform = 'scale(1.25)';
            display.style.opacity = '1';
        } else {
            // Last part: scale down slightly and prepare to fade out
            const finalProgress = (progress - 0.8) / 0.2;
            const scale = 1.25 - (finalProgress * 0.25); // Scale from 1.25 to 1
            display.style.transform = `scale(${scale})`;
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Final state
            display.style.transform = 'scale(1)';

            // Fade out after a short delay
            setTimeout(() => {
                let fadeStartTime = null;
                const fadeDuration = 500; // 0.5 seconds for fade out

                function fadeOut(timestamp) {
                    if (!fadeStartTime) fadeStartTime = timestamp;
                    const fadeElapsed = timestamp - fadeStartTime;
                    const fadeProgress = Math.min(fadeElapsed / fadeDuration, 1);

                    display.style.opacity = 1 - fadeProgress;

                    if (fadeProgress < 1) {
                        requestAnimationFrame(fadeOut);
                    } else {
                        // Hide when completely faded
                        container.style.display = 'none';
                    }
                }

                requestAnimationFrame(fadeOut);
            }, 1000); // Wait 1 second before starting fade out
        }
    }

    requestAnimationFrame(animate);
}

// Show the correct answers on the globe
function showAnswers(answerCodes) {
    // Create a temporary array to highlight on the globe
    window.quizHighlightCountries = answerCodes;

    // Show a toast with explanation
    showToast(currentQuestion.explanation, 5000);

    // Force a redraw of the globe
    window.needsRedraw = true;

    // Remove the highlight after a delay
    setTimeout(() => {
        window.quizHighlightCountries = null;
        window.needsRedraw = true;
    }, 3000);
}

// Show results of the quiz answer
function showResults(correctAnswers, incorrectAnswers, missingAnswers, roundScore) {
    // Create a result modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#1A1A1B';
    modal.style.padding = '20px';
    modal.style.borderRadius = '4px';
    modal.style.color = '#D7DADC';
    modal.style.zIndex = '2000';
    modal.style.minWidth = '300px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
    modal.style.border = '1px solid #343536';

    // Add content
    const title = document.createElement('h2');
    title.textContent = 'Results';
    title.style.color = '#FF4500';
    title.style.marginTop = '0';
    title.style.fontWeight = '500';
    title.style.fontSize = '18px';
    modal.appendChild(title);

    // Add a decorative Reddit header
    const redditHeader = document.createElement('div');
    redditHeader.style.fontSize = '12px';
    redditHeader.style.color = '#818384';
    redditHeader.style.marginBottom = '15px';
    redditHeader.style.textAlign = 'left';
    redditHeader.textContent = `r/GeographyQuiz • Posted by u/GlobeBot • ${questionsAnswered} Qs answered`;
    modal.appendChild(redditHeader);

    // Add the results summary
    const summary = document.createElement('div');
    summary.style.backgroundColor = '#272729';
    summary.style.borderRadius = '4px';
    summary.style.padding = '10px';
    summary.style.marginBottom = '15px';
    summary.style.textAlign = 'left';
    summary.style.border = '1px solid #343536';

    const scoreText = document.createElement('p');
    scoreText.style.margin = '5px 0';
    scoreText.innerHTML = `<strong>Round Score:</strong> ${roundScore > 0 ? '+' : ''}${roundScore} points`;
    scoreText.style.color = roundScore >= 0 ? '#4CAF50' : '#FF4500';
    summary.appendChild(scoreText);

    const statsText = document.createElement('p');
    statsText.style.margin = '5px 0';
    statsText.innerHTML = `<strong>Correct:</strong> ${correctAnswers.length}/${currentQuestion.answer.length} • <strong>Incorrect:</strong> ${incorrectAnswers.length} • <strong>Missed:</strong> ${missingAnswers.length}`;
    summary.appendChild(statsText);

    const totalText = document.createElement('p');
    totalText.style.margin = '10px 0 5px 0';
    totalText.innerHTML = `<strong>Total Score:</strong> ${gameScore}`;
    totalText.style.fontWeight = 'bold';
    summary.appendChild(totalText);

    modal.appendChild(summary);

    // Explanation
    const explanation = document.createElement('div');
    explanation.style.backgroundColor = '#272729';
    explanation.style.borderRadius = '4px';
    explanation.style.padding = '10px';
    explanation.style.marginBottom = '15px';
    explanation.style.textAlign = 'left';
    explanation.style.border = '1px solid #343536';

    const explanationTitle = document.createElement('div');
    explanationTitle.textContent = 'Answer Explanation:';
    explanationTitle.style.fontWeight = 'bold';
    explanationTitle.style.marginBottom = '5px';
    explanation.appendChild(explanationTitle);

    const explanationText = document.createElement('div');
    explanationText.textContent = currentQuestion.explanation;
    explanationText.style.lineHeight = '1.4';
    explanation.appendChild(explanationText);

    modal.appendChild(explanation);

    // Create container for correct and incorrect answers
    const answersContainer = document.createElement('div');
    answersContainer.style.display = 'flex';
    answersContainer.style.justifyContent = 'space-between';
    answersContainer.style.gap = '10px';
    answersContainer.style.marginBottom = '15px';

    // Show correct answers
    if (correctAnswers.length > 0) {
        const correctList = document.createElement('div');
        correctList.style.flex = '1';
        correctList.style.backgroundColor = '#272729';
        correctList.style.borderRadius = '4px';
        correctList.style.padding = '10px';
        correctList.style.textAlign = 'left';
        correctList.style.border = '1px solid #343536';

        const correctTitle = document.createElement('div');
        correctTitle.textContent = 'Correct:';
        correctTitle.style.fontWeight = 'bold';
        correctTitle.style.color = '#4CAF50';
        correctTitle.style.marginBottom = '5px';
        correctList.appendChild(correctTitle);

        // Get country names for the correct codes
        correctAnswers.forEach(code => {
            const country = selectedCountries.find(c => c.ISO_A3 === code);
            const item = document.createElement('div');
            item.textContent = `✓ ${country ? country.name : code}`;
            item.style.color = '#4CAF50';
            item.style.marginBottom = '2px';
            correctList.appendChild(item);
        });

        answersContainer.appendChild(correctList);
    }

    // Show incorrect answers
    if (incorrectAnswers.length > 0) {
        const incorrectList = document.createElement('div');
        incorrectList.style.flex = '1';
        incorrectList.style.backgroundColor = '#272729';
        incorrectList.style.borderRadius = '4px';
        incorrectList.style.padding = '10px';
        incorrectList.style.textAlign = 'left';
        incorrectList.style.border = '1px solid #343536';

        const incorrectTitle = document.createElement('div');
        incorrectTitle.textContent = 'Incorrect:';
        incorrectTitle.style.fontWeight = 'bold';
        incorrectTitle.style.color = '#FF4500';
        incorrectTitle.style.marginBottom = '5px';
        incorrectList.appendChild(incorrectTitle);

        // Get country names for the incorrect codes
        incorrectAnswers.forEach(code => {
            const country = selectedCountries.find(c => c.ISO_A3 === code);
            const item = document.createElement('div');
            item.textContent = `✗ ${country ? country.name : code}`;
            item.style.color = '#FF4500';
            item.style.marginBottom = '2px';
            incorrectList.appendChild(item);
        });

        answersContainer.appendChild(incorrectList);
    }

    // Show missing answers if there are any
    if (missingAnswers.length > 0) {
        const missingList = document.createElement('div');
        missingList.style.flex = '1';
        missingList.style.backgroundColor = '#272729';
        missingList.style.borderRadius = '4px';
        missingList.style.padding = '10px';
        missingList.style.textAlign = 'left';
        missingList.style.border = '1px solid #343536';

        const missingTitle = document.createElement('div');
        missingTitle.textContent = 'You Missed:';
        missingTitle.style.fontWeight = 'bold';
        missingTitle.style.color = '#FFA500';
        missingTitle.style.marginBottom = '5px';
        missingList.appendChild(missingTitle);

        // Try to find country names for the missing codes
        missingAnswers.forEach(code => {
            // Try to find country name from features if available
            let countryName = code;
            if (window.countriesData && window.countriesData.features) {
                const feature = window.countriesData.features.find(f =>
                    (f.properties.ISO_A3 === code || f.properties.ISO_A3 === code)
                );
                if (feature) {
                    countryName = feature.properties.name || feature.properties.NAME || code;
                }
            }

            const item = document.createElement('div');
            item.textContent = `! ${countryName}`;
            item.style.color = '#FFA500';
            item.style.marginBottom = '2px';
            missingList.appendChild(item);
        });

        answersContainer.appendChild(missingList);
    }

    modal.appendChild(answersContainer);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '15px';

    const newQuestionBtn = document.createElement('button');
    newQuestionBtn.textContent = 'Next Question';
    newQuestionBtn.style.backgroundColor = '#FF4500';
    newQuestionBtn.style.color = 'white';
    newQuestionBtn.style.border = 'none';
    newQuestionBtn.style.padding = '8px 12px';
    newQuestionBtn.style.borderRadius = '20px';
    newQuestionBtn.style.cursor = 'pointer';
    newQuestionBtn.style.width = '48%';
    newQuestionBtn.style.fontWeight = 'bold';

    newQuestionBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        startNewGame();
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.backgroundColor = '#272729';
    closeBtn.style.color = '#D7DADC';
    closeBtn.style.border = '1px solid #343536';
    closeBtn.style.padding = '8px 12px';
    closeBtn.style.borderRadius = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.width = '48%';

    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    buttonContainer.appendChild(newQuestionBtn);
    buttonContainer.appendChild(closeBtn);
    modal.appendChild(buttonContainer);

    // Add to document
    document.body.appendChild(modal);

    // Also show the correct answers on the globe
    showAnswers(currentQuestion.answer);
}