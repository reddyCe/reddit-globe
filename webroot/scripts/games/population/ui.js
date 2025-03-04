// Initialize game UI elements with Reddit-like styling
function initGameElements() {
    // We'll only use the minimized panel, making it more functional
    minimizedSelectionPanel = document.createElement('div');
    minimizedSelectionPanel.id = 'minimized-selection-panel';
    minimizedSelectionPanel.style.position = 'absolute';
    minimizedSelectionPanel.style.bottom = '20px';
    minimizedSelectionPanel.style.right = '20px';
    minimizedSelectionPanel.style.width = '280px'; // Slightly wider for more info
    minimizedSelectionPanel.style.backgroundColor = '#1A1A1B'; // Reddit dark mode background
    minimizedSelectionPanel.style.color = '#D7DADC'; // Reddit text color
    minimizedSelectionPanel.style.padding = '10px';
    minimizedSelectionPanel.style.borderRadius = '4px';
    minimizedSelectionPanel.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
    minimizedSelectionPanel.style.zIndex = '1000';
    minimizedSelectionPanel.style.fontFamily = '"Noto Sans", "Helvetica Neue", Arial, sans-serif'; // Reddit font
    minimizedSelectionPanel.style.fontSize = '12px'; // Slightly larger font
    minimizedSelectionPanel.style.display = 'none';
    minimizedSelectionPanel.style.border = '1px solid #343536'; // Reddit card border

    // Game title
    const gameTitle = document.createElement('h5');
    gameTitle.textContent = 'r/PopulationTarget';
    gameTitle.style.textAlign = 'center';
    gameTitle.style.margin = '0 0 8px 0';
    gameTitle.style.color = '#FF4500'; // Reddit orange
    gameTitle.style.fontWeight = '500';
    gameTitle.style.fontSize = '14px';
    minimizedSelectionPanel.appendChild(gameTitle);

    // Target info in panel
    const miniTargetInfo = document.createElement('div');
    miniTargetInfo.style.display = 'flex';
    miniTargetInfo.style.justifyContent = 'space-between';
    miniTargetInfo.style.marginBottom = '5px';
    miniTargetInfo.style.fontSize = '12px';
    miniTargetInfo.style.fontWeight = 'bold';
    miniTargetInfo.style.padding = '5px';
    miniTargetInfo.style.backgroundColor = '#272729';
    miniTargetInfo.style.borderRadius = '4px';
    miniTargetInfo.style.border = '1px solid #343536';

    const miniTargetLabel = document.createElement('span');
    miniTargetLabel.textContent = 'Target:';
    miniTargetLabel.style.color = '#818384';
    miniTargetInfo.appendChild(miniTargetLabel);

    const miniTargetValue = document.createElement('span');
    miniTargetValue.id = 'mini-target-value';
    miniTargetValue.textContent = '0';
    miniTargetValue.style.color = '#FF4500'; // Reddit orange
    miniTargetInfo.appendChild(miniTargetValue);

    minimizedSelectionPanel.appendChild(miniTargetInfo);

    // Score display in panel
    const scoreContainer = document.createElement('div');
    scoreContainer.style.display = 'flex';
    scoreContainer.style.justifyContent = 'space-between';
    scoreContainer.style.marginBottom = '5px';
    scoreContainer.style.padding = '5px';
    scoreContainer.style.backgroundColor = '#272729';
    scoreContainer.style.borderRadius = '4px';
    scoreContainer.style.border = '1px solid #343536';

    const scoreLabel = document.createElement('span');
    scoreLabel.textContent = 'Karma:';
    scoreLabel.style.color = '#818384';
    scoreContainer.appendChild(scoreLabel);

    const scoreDisplay = document.createElement('span');
    scoreDisplay.id = 'score';
    scoreDisplay.style.fontWeight = 'bold';
    scoreDisplay.style.color = '#FF4500';
    scoreDisplay.textContent = '0';
    scoreContainer.appendChild(scoreDisplay);

    minimizedSelectionPanel.appendChild(scoreContainer);

    // Container for selected countries
    const miniSelectedContainer = document.createElement('div');
    miniSelectedContainer.id = 'mini-selected-container';
    miniSelectedContainer.style.marginBottom = '5px';
    miniSelectedContainer.style.backgroundColor = '#272729';
    miniSelectedContainer.style.borderRadius = '4px';
    miniSelectedContainer.style.padding = '5px';
    miniSelectedContainer.style.border = '1px solid #343536';
    minimizedSelectionPanel.appendChild(miniSelectedContainer);

    // Add a label for the selected countries
    const selectionLabel = document.createElement('div');
    selectionLabel.textContent = `Selected Countries (${NUMBER_OF_COUNTRIES} max):`;
    selectionLabel.style.fontSize = '11px';
    selectionLabel.style.color = '#818384';
    selectionLabel.style.padding = '2px 3px';
    selectionLabel.style.marginBottom = '3px';
    miniSelectedContainer.appendChild(selectionLabel);

    // Summary info in panel
    const miniSummaryInfo = document.createElement('div');
    miniSummaryInfo.style.display = 'flex';
    miniSummaryInfo.style.justifyContent = 'space-between';
    miniSummaryInfo.style.padding = '5px';
    miniSummaryInfo.style.fontSize = '12px';
    miniSummaryInfo.style.backgroundColor = '#272729';
    miniSummaryInfo.style.borderRadius = '4px';
    miniSummaryInfo.style.border = '1px solid #343536';

    const miniSumContainer = document.createElement('div');
    miniSumContainer.style.display = 'flex';
    const miniSumLabel = document.createElement('span');
    miniSumLabel.textContent = 'Sum:  ';
    miniSumLabel.style.color = '#818384';
    miniSumContainer.appendChild(miniSumLabel);

    const miniSumValue = document.createElement('span');
    miniSumValue.id = 'mini-sum-value';
    miniSumValue.textContent = '0';
    miniSumContainer.appendChild(miniSumValue);
    miniSummaryInfo.appendChild(miniSumContainer);

    const miniDiffContainer = document.createElement('div');
    miniDiffContainer.style.display = 'flex';
    const miniDiffLabel = document.createElement('span');
    miniDiffLabel.textContent = 'Diff: ';
    miniDiffLabel.style.color = '#818384';
    miniDiffContainer.appendChild(miniDiffLabel);

    const miniDiffValue = document.createElement('span');
    miniDiffValue.id = 'mini-diff-value';
    miniDiffValue.textContent = '0';
    miniDiffContainer.appendChild(miniDiffValue);
    miniSummaryInfo.appendChild(miniDiffContainer);

    minimizedSelectionPanel.appendChild(miniSummaryInfo);

    // Controls for panel
    const miniControls = document.createElement('div');
    miniControls.style.display = 'flex';
    miniControls.style.justifyContent = 'space-between';
    miniControls.style.marginTop = '5px';

    resetButton = document.createElement('button');
    resetButton.textContent = 'Reset';
    resetButton.style.backgroundColor = '#272729';
    resetButton.style.color = '#D7DADC';
    resetButton.style.border = '1px solid #343536';
    resetButton.style.padding = '6px 10px';
    resetButton.style.borderRadius = '20px';
    resetButton.style.fontSize = '12px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.width = '48%';
    resetButton.disabled = true;
    resetButton.style.opacity = '0.5';
    miniControls.appendChild(resetButton);

    startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.backgroundColor = '#FF4500';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.padding = '6px 10px';
    startButton.style.borderRadius = '20px';
    startButton.style.fontSize = '12px';
    startButton.style.cursor = 'pointer';
    startButton.style.width = '48%';
    startButton.style.fontWeight = 'bold';
    miniControls.appendChild(startButton);

    minimizedSelectionPanel.appendChild(miniControls);
    document.body.appendChild(minimizedSelectionPanel);

    // Create animated target display element that will appear in the middle
    const animatedTargetContainer = document.getElementById('animated-target-container');
    document.body.appendChild(animatedTargetContainer);
}

function quitGame() {
    // Reset for a new game
    resetSelections(); // This clears gameSelectedCountries

    // Hide the minimized panel
    gameActive = false;
    minimizedSelectionPanel.style.display = 'none';

    // Update UI
    startButton.textContent = 'Start Game';
    resetButton.disabled = true;
    resetButton.style.opacity = '0.5';
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

        // Update mini panel display
        const miniCountryElement = document.createElement('div');
        miniCountryElement.style.display = 'flex';
        miniCountryElement.style.justifyContent = 'space-between';
        miniCountryElement.style.padding = '3px 5px';
        miniCountryElement.style.fontSize = '11px';
        if (index < selectedCountries.length - 1) {
            miniCountryElement.style.borderBottom = '1px solid #343536';
        }

        // Add vote arrows (decorative) to mimic Reddit style
        const miniVote = document.createElement('span');
        miniVote.textContent = '▲';
        miniVote.style.color = '#FF4500';
        miniVote.style.marginRight = '3px';
        miniVote.style.fontSize = '9px';
        miniCountryElement.appendChild(miniVote);

        const miniNameElement = document.createElement('span');
        miniNameElement.textContent = country.name;
        miniNameElement.style.overflow = 'hidden';
        miniNameElement.style.textOverflow = 'ellipsis';
        miniNameElement.style.whiteSpace = 'nowrap';
        miniNameElement.style.maxWidth = '130px';
        miniNameElement.style.flex = '1';
        miniCountryElement.appendChild(miniNameElement);

        const miniPopElement = document.createElement('span');
        miniPopElement.textContent = formatNumber(country.population);
        miniPopElement.style.color = '#818384';
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
    // Create a result modal - like a Reddit post
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
    modal.style.minWidth = '300px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.5)';
    modal.style.border = '1px solid #343536'; // Reddit card border

    // Add content
    const title = document.createElement('h2');
    title.textContent = 'Round Results';
    title.style.color = '#FF4500'; // Reddit orange
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
    redditHeader.textContent = 'Posted by u/PopulationGame • 1m • Free Award';
    modal.appendChild(redditHeader);

    const resultsList = document.createElement('div'); // using div instead of ul for Reddit style
    resultsList.style.padding = '0';
    resultsList.style.textAlign = 'left';
    resultsList.style.backgroundColor = '#272729'; // Reddit card background
    resultsList.style.borderRadius = '4px';
    resultsList.style.border = '1px solid #343536'; // Reddit card border

    const items = [
        `Target: ${formatNumber(targetPopulation)}`,
        `Your Total: ${formatNumber(totalPopulation)}`,
        `Difference: ${formatNumber(difference)} (${((difference/targetPopulation)*100).toFixed(2)}%)`,
        `Round Karma: ${formatNumber(roundScore)}`,
        `Total Karma: ${formatNumber(gameScore)}`
    ];

    items.forEach((item, index) => {
        const li = document.createElement('div'); // Using div for Reddit style
        li.style.padding = '8px 12px';
        li.style.borderBottom = index < items.length - 1 ? '1px solid #343536' : 'none';
        li.textContent = item;
        resultsList.appendChild(li);
    });

    modal.appendChild(resultsList);


    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '20px';

    const newGameBtn = document.createElement('button');
    newGameBtn.textContent = 'New Round';
    newGameBtn.style.backgroundColor = '#FF4500'; // Reddit orange
    newGameBtn.style.color = 'white';
    newGameBtn.style.border = 'none';
    newGameBtn.style.padding = '8px 12px';
    newGameBtn.style.borderRadius = '20px'; // Reddit rounded buttons
    newGameBtn.style.cursor = 'pointer';
    newGameBtn.style.width = '48%';
    newGameBtn.style.fontWeight = 'bold';

    newGameBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        startNewGame();
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.backgroundColor = '#272729'; // Dark button
    closeBtn.style.color = '#D7DADC';
    closeBtn.style.border = '1px solid #343536';
    closeBtn.style.padding = '8px 12px';
    closeBtn.style.borderRadius = '20px'; // Reddit rounded buttons
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.width = '48%';

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
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#1A1A1B'; // Reddit dark background
    toast.style.color = '#D7DADC'; // Reddit text color
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '2000';
    toast.style.border = '1px solid #343536'; // Reddit border
    toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    toast.style.fontFamily = '"Noto Sans", "Helvetica Neue", Arial, sans-serif'; // Reddit font

    // Add Reddit-style icon
    const toastContent = document.createElement('div');
    toastContent.style.display = 'flex';
    toastContent.style.alignItems = 'center';

    const redditIcon = document.createElement('span');
    redditIcon.textContent = '🔴'; // Simple Reddit-like icon
    redditIcon.style.marginRight = '8px';
    redditIcon.style.color = '#FF4500'; // Reddit orange

    toastContent.appendChild(redditIcon);
    toastContent.appendChild(document.createTextNode(message));
    toast.innerHTML = '';
    toast.appendChild(toastContent);

    // Add to document
    document.body.appendChild(toast);

    // Remove after duration
    setTimeout(() => {
        document.body.removeChild(toast);
    }, duration);
}