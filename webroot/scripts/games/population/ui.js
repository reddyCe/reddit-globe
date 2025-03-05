// Initialize game UI elements with Reddit-like styling
function initGameElements() {
    // Reference existing UI elements from HTML
    minimizedSelectionPanel = document.getElementById('minimized-selection-panel');
    startButton = document.getElementById('start-button');
    resetButton = document.getElementById('reset-button');

    // Set the maximum number of countries in the selection label
    document.getElementById('max-countries').textContent = NUMBER_OF_COUNTRIES;

    // Hide the panel initially
    minimizedSelectionPanel.style.display = 'none';
}

function quitGame() {
    // Reset for a new game
    resetSelections(); // This clears gameSelectedCountries

    // Hide the minimized panel
    gameActive = false;
    minimizedSelectionPanel.style.display = 'none';

    // Check if quiz is also inactive before hiding exit button
    if (typeof quizActive === 'undefined' || !quizActive) {
        const exitButton = document.getElementById('exit-button');
        if (exitButton) {
            exitButton.style.display = 'none';
        }
    }

    // Update UI
    startButton.textContent = 'Start Game';
    resetButton.disabled = true;
    resetButton.classList.add('disabled');
    needsRedraw = true; // Clear the globe selection
}

function showAnimatedTarget(population) {
    const container = document.getElementById('animated-target-container');
    const display = document.getElementById('animated-target-display');

    // Prepare the animation
    display.textContent = formatNumber(population);
    container.style.display = 'block';
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

// Update the display of selected countries
function updateSelectedCountriesDisplay() {
    // Clear the mini display
    const miniContainer = document.getElementById('mini-selected-container');

    // Keep the label for selected countries
    const oldLabel = miniContainer.firstChild;
    miniContainer.innerHTML = '';
    if (oldLabel) {
        miniContainer.appendChild(oldLabel);
    }

    // Calculate total population
    let totalPopulation = 0;

    // Add each country to the display
    console.log(selectedCountries);
    selectedCountries.forEach((country, index) => {
        totalPopulation += country.population;

        // Create country element
        const miniCountryElement = document.createElement('div');
        miniCountryElement.className = 'country-item';
        if (index < selectedCountries.length - 1) {
            miniCountryElement.classList.add('country-border-bottom');
        }

        // Add vote arrows (decorative) to mimic Reddit style
        const miniVote = document.createElement('span');
        miniVote.textContent = '▲';
        miniVote.className = 'country-vote';
        miniCountryElement.appendChild(miniVote);

        const miniNameElement = document.createElement('span');
        miniNameElement.textContent = country.name;
        miniNameElement.className = 'country-name';
        miniCountryElement.appendChild(miniNameElement);

        const miniPopElement = document.createElement('span');
        miniPopElement.textContent = formatNumber(country.population);
        miniPopElement.className = 'country-population';
        miniCountryElement.appendChild(miniPopElement);

        miniContainer.appendChild(miniCountryElement);
        drawCountries();
    });

    // Update the sum and difference
    document.getElementById('mini-sum-value').textContent = formatNumber(totalPopulation);

    // Calculate and display the difference from target
    const difference = Math.abs(totalPopulation - targetPopulation);
    document.getElementById('mini-diff-value').textContent = formatNumber(difference);

    // Color the difference based on how close it is
    const percentDiff = difference / targetPopulation;
    let diffColor = '#FF0000'; // Default red

    if (percentDiff < 0.01) {
        diffColor = '#46D160'; // Reddit's upvote green
    } else if (percentDiff < 0.05) {
        diffColor = '#ADFF2F'; // Light green
    } else if (percentDiff < 0.1) {
        diffColor = '#FFFF00'; // Yellow
    } else if (percentDiff < 0.3) {
        diffColor = '#FFA500'; // Orange
    }

    document.getElementById('mini-diff-value').style.color = diffColor;
}

// Show round results of the round
function showRoundResults(totalPopulation, difference, roundScore) {
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Add content
    const title = document.createElement('h2');
    title.textContent = 'Round Results';
    title.className = 'modal-title';
    modal.appendChild(title);

    // Add a decorative Reddit header
    const redditHeader = document.createElement('div');
    redditHeader.className = 'modal-header';
    redditHeader.textContent = 'Posted by u/PopulationGame • 1m • Free Award';
    modal.appendChild(redditHeader);

    const resultsList = document.createElement('div');
    resultsList.className = 'results-list';

    const items = [
        `Target: ${formatNumber(targetPopulation)}`,
        `Your Total: ${formatNumber(totalPopulation)}`,
        `Difference: ${formatNumber(difference)} (${((difference/targetPopulation)*100).toFixed(2)}%)`,
        `Round Karma: ${formatNumber(roundScore)}`,
        `Total Karma: ${formatNumber(gameScore)}`
    ];

    items.forEach((item, index) => {
        const li = document.createElement('div');
        li.className = 'results-item';
        if (index < items.length - 1) {
            li.classList.add('results-item-border');
        }
        li.textContent = item;
        resultsList.appendChild(li);
    });

    modal.appendChild(resultsList);

    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const newGameBtn = document.createElement('button');
    newGameBtn.textContent = 'New Round';
    newGameBtn.className = 'button-primary';
    newGameBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        startNewGame();
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'button-secondary';
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    buttonContainer.appendChild(newGameBtn);
    buttonContainer.appendChild(closeBtn);
    modal.appendChild(buttonContainer);

    // Add to document
    document.body.appendChild(modal);
}

// Show a toast notification
function showToast(message, duration = 2000) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';

    // Add Reddit-style icon
    const toastContent = document.createElement('div');
    toastContent.className = 'toast-content';

    const redditIcon = document.createElement('span');
    redditIcon.textContent = '🔴'; // Simple Reddit-like icon
    redditIcon.className = 'toast-icon';

    toastContent.appendChild(redditIcon);
    toastContent.appendChild(document.createTextNode(message));
    toast.appendChild(toastContent);

    // Add to document
    document.body.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
        document.body.removeChild(toast);
    }, duration);
}