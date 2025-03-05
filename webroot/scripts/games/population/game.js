// Setup event listeners for game buttons
function setupGameEventListeners() {
    // Get reference to the game buttons
    const showGameButton = document.getElementById('show-game-button');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');

    // Start button - Begin a new game
    startButton.addEventListener('click', startNewGame);

    // Reset button - Clear current selections during a game
    resetButton.addEventListener('click', resetSelections);

    // Show/hide game button
    showGameButton.addEventListener('click', () => {
        if (!gameActive) {
            startNewGame();
            showGameButton.textContent = 'Quit Game';
        } else {
            quitGame();
            showGameButton.textContent = 'Play Population Game';
        }
    });

    // Modify the existing handleGlobeClick function to support game functionality
    const originalHandleGlobeClick = handleGlobeClick;
    handleGlobeClick = function(e) {
        // Call the original function to handle basic globe interaction
        originalHandleGlobeClick(e);

        // If a country was clicked and game is active, handle selection
        if (gameActive && hoveredFeature && selectedCountries.length < NUMBER_OF_COUNTRIES) {
            handleCountrySelection(hoveredFeature);
        }
    };
}

// Start a new game round
function startNewGame() {
    // Reset for a new game
    resetSelections(); // This clears gameSelectedCountries

    // Generate random target population between 10 million and 1 billion
    targetPopulation = getRandomInt(10000000, 500000000);

    // Update all target displays
    document.getElementById('mini-target-value').textContent = formatNumber(targetPopulation);

    // Show the minimized panel
    gameActive = true;
    gameRound++;
    minimizedSelectionPanel.style.display = 'block';

    // Show the exit button
    const exitButton = document.getElementById('exit-button');
    if (exitButton) {
        exitButton.style.display = 'block';
    }

    // Update UI
    startButton.textContent = 'New Target';
    resetButton.disabled = false;
    resetButton.style.opacity = '1';

    // Animate the target display in the middle of the screen
    showAnimatedTarget(targetPopulation);

    // Show toast notification
    showToast(`New game started! Select ${NUMBER_OF_COUNTRIES} countries to match the target population.`, 3000);
}
// Handle country selection for the game
function handleCountrySelection(feature) {
    // Get country information
    const countryCode = feature.properties.code || feature.properties.ISO_A3;
    const countryName = feature.properties.name || feature.properties.NAME;
    const population = feature.properties.population || feature.properties.POP_EST || 0;

    // Check if country is already selected
    if (selectedCountries.find(c => c.code === countryCode)) {
        showToast('Country already selected!', 2000);
        return;
    }

    // Add country to selection
    selectedCountries.push({
        code: countryCode,
        name: countryName,
        population: population
    });

    // Add to the gameSelectedCountries array to track visually
    gameSelectedCountries.push(countryCode);

    // Force a redraw of the globe to show the selection
    needsRedraw = true;

    // Update UI
    updateSelectedCountriesDisplay();

    // If max number of countries are selected, calculate score
    if (selectedCountries.length === NUMBER_OF_COUNTRIES) {
        calculateScore();
    }
}

// Calculate score after selecting countries
function calculateScore() {
    // Calculate total population of selected countries
    const totalPopulation = selectedCountries.reduce((sum, country) => sum + country.population, 0);

    // Calculate difference from target
    const difference = Math.abs(totalPopulation - targetPopulation);
    const percentDiff = difference / targetPopulation;

    // Base points - inversely proportional to the difference percentage
    // This creates a curve where score drops more rapidly as you get further from target
    let basePoints = Math.floor(1000 * Math.pow(0.9, percentDiff * 10));

    // Population factor - larger targets are harder, so give bonus points
    const populationFactor = Math.log10(targetPopulation) / 5;

    // Country count factor - using more countries is more challenging
    const countryFactor = 1 + (selectedCountries.length / 10);

    // Combine factors for final score calculation
    let roundScore = Math.floor(basePoints * populationFactor * countryFactor);

    // Bonus/penalty system - add some variability
    if (percentDiff < 0.01) {
        // Perfect match bonus (up to 50% extra points)
        const perfectBonus = Math.floor(roundScore * (0.3 + Math.random() * 0.2));
        roundScore += perfectBonus;
        showToast(`AMAZING! Perfect match bonus: +${formatNumber(perfectBonus)} points!`, 3000);
    } else if (percentDiff < 0.05) {
        // Near match bonus (up to 25% extra points)
        const nearBonus = Math.floor(roundScore * (0.1 + Math.random() * 0.15));
        roundScore += nearBonus;
        showToast(`Great job! Accuracy bonus: +${formatNumber(nearBonus)} points!`, 3000);
    } else if (percentDiff < 0.1) {
        // Good try bonus (up to 10% extra)
        const goodBonus = Math.floor(roundScore * (0.05 + Math.random() * 0.05));
        roundScore += goodBonus;
        showToast(`Good! Small bonus: +${formatNumber(goodBonus)} points!`, 3000);
    } else if (percentDiff > 0.5) {
        // Far miss penalty (lose up to 30% of points)
        const penalty = Math.floor(roundScore * (0.1 + Math.random() * 0.2));
        roundScore -= penalty;
        showToast(`Try again! Penalty: -${formatNumber(penalty)} points.`, 3000);
    }

    // Ensure minimum score
    roundScore = Math.max(100, roundScore);

    // Add streak bonus if applicable
    if (window.currentStreak && window.currentStreak > 1) {
        const streakBonus = Math.floor(roundScore * 0.1 * Math.min(window.currentStreak, 5));
        showToast(`${window.currentStreak}x streak bonus: +${formatNumber(streakBonus)} points!`, 3000);
        roundScore += streakBonus;
    }

    // Update streak
    if (percentDiff < 0.1) {
        window.currentStreak = (window.currentStreak || 0) + 1;
    } else {
        window.currentStreak = 0;
    }

    // Update total score
    gameScore += roundScore;
    document.getElementById('score').textContent = formatNumber(gameScore);

    // Show round results
    showRoundResults(totalPopulation, difference, roundScore);

    // Send game results to parent
    window.parent.postMessage(
        {
            type: 'gameFinished',
            data: {
                roundScore: roundScore
            },
        },
        '*'
    );
}

// Reset current selections
function resetSelections() {
    selectedCountries = [];
    gameSelectedCountries = [];

    // Update mini panel
    updateSelectedCountriesDisplay();

    document.getElementById('mini-sum-value').textContent = '0';
    document.getElementById('mini-diff-value').textContent = '0';
    document.getElementById('mini-diff-value').style.color = 'white';

    // Force a redraw of the globe
    needsRedraw = true;
}