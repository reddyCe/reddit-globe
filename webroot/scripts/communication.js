/**
 * Communication Module
 * Handles message passing between the WebView and the Devvit app
 */

/**
 * Initialize communication with Devvit
 * @param {Object} appContext - Application context
 */
export function initCommunication(appContext) {
    console.log('Initializing communication with Devvit...');

    // Set up event listener for messages from Devvit
    addEventListener('message', (event) => handleDevvitMessage(event, appContext));

    // Send ready event when WebView is loaded
    window.addEventListener('load', () => {
        postMessageToDevvit({type: 'webViewReady'});
        console.log('Sent webViewReady message to Devvit');
    });

    // Set up location click handler
    appContext.onLocationClicked = (location) => {
        postMessageToDevvit({
            type: 'locationClicked',
            data: {location}
        });
        console.log('Sent locationClicked message to Devvit:', location);
    };

    console.log('Communication initialized');
}

/**
 * Handle incoming messages from Devvit
 * @param {MessageEvent} event - Message event
 * @param {Object} appContext - Application context
 */

function handleDevvitMessage(event, appContext) {
    // Log the entire event for debugging
    console.log('Received event:', event);

    // Check if we have valid data structure before proceeding
    if (!event || !event.data) {
        console.error('Invalid event received');
        return;
    }

    // Check if it's a Devvit message - if not, we might need to handle it differently
    if (event.data.type !== 'devvit-message') {
        console.log('Non-Devvit message received:', event.data);
        return;
    }

    // Safely extract the message
    const messageData = event.data.data;
    if (!messageData || !messageData.message) {
        console.error('Invalid message data structure:', messageData);
        return;
    }

    const message = messageData.message;
    console.log('Processing Devvit message:', message);

    // Now proceed with your switch statement
    switch (message.type) {
        // Your existing code
    }
}
/**
 * Handle initial data from Devvit
 * @param {Object} data - Initial data
 * @param {Object} appContext - Application context
 */
function handleInitialData(data, appContext) {
    console.log('Received initial data:', data);

    // Store username
    appContext.username = data.username;

    // If there was a previous location, restore it
    if (data.lastLocation) {
        appContext.lastClickedLocation = data.lastLocation;
        appContext.needsRedraw = true;
    }
}

/**
 * Handle location update confirmation from Devvit
 * @param {Object} data - Location data
 * @param {Object} appContext - Application context
 */
function handleLocationUpdated(data, appContext) {
    console.log('Location update confirmed:', data.location);

    // Update the app context with the confirmed location
    appContext.lastClickedLocation = data.location;
    appContext.needsRedraw = true;
}

/**
 * Send a message to the Devvit app
 * @param {Object} message - Message to send
 */
export function postMessageToDevvit(message) {
    parent.postMessage(message, '*');
}

/**
 * Send game results to Devvit
 * @param {number} score - Game score
 */
export function sendGameResults(score) {
    // Create a properly formatted message
    const message = {
        type: 'gameFinished',
        data: {
            roundScore: score
        }
    };

    console.log('Sending game results to Devvit:', message);
    parent.postMessage(message, '*');
}