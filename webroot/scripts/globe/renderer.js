/**
 * Globe rendering module
 * Handles all canvas drawing operations
 */

// Globe constants
const EARTH_RADIUS = 240;
const MAX_POLYGON_POINTS = 1000; // Limit for performance

// Stars array for background
let stars = [];

/**
 * Initialize the canvas for globe rendering
 * @returns {Object} Canvas initialization objects
 */
export function initCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const container = document.getElementById('canvas-container');
    if (!container) {
        throw new Error('Canvas container not found');
    }

    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Center of the screen
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    return {canvas, ctx, centerX, centerY};
}

/**
 * Initialize stars background
 * @param {Object} appContext - Application context
 * @param {number} count - Number of stars to generate
 */
export function setupStars(appContext, count) {
    stars = [];
    const {canvas} = appContext;

    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random(),
            opacity: Math.random() * 0.8 + 0.2
        });
    }

    appContext.stars = stars;
}

/**
 * Draw the stars background
 * @param {Object} appContext - Application context
 */
function drawStars(appContext) {
    const {ctx, stars} = appContext;

    ctx.fillStyle = 'whitesmoke';
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0; // Reset alpha
}

/**
 * Main function to draw the globe and all its elements
 * @param {Object} appContext - Application context
 */
export function drawGlobe(appContext) {
    const {
        ctx, canvas, centerX, centerY,
        worldData, hoveredFeature,
        gameActive, quizActive,
        gameSelectedCountries, quizSelectedCountries, quizCorrectCountries
    } = appContext;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create a dark space gradient background
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, canvas.width / 1.5
    );
    gradient.addColorStop(0, '#1a2040'); // Dark blue at center
    gradient.addColorStop(1, '#000510'); // Nearly black at edges

    // Apply gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the pre-generated stars
    drawStars(appContext);

    // Draw the Earth base (dark globe)
    drawBaseGlobe(appContext);

    // Draw country polygons if data is loaded
    if (worldData) {
        drawCountries(appContext);
    }

    // Draw grid lines for reference
    drawGridLines(appContext);

    // Highlight last clicked location if any
    if (appContext.lastClickedLocation) {
        highlightLocation(appContext, appContext.lastClickedLocation);
    }
}

/**
 * Draw a base dark globe
 * @param {Object} appContext - Application context
 */
function drawBaseGlobe(appContext) {
    const {ctx, centerX, centerY, zoomScale} = appContext;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, EARTH_RADIUS * zoomScale, 0, Math.PI * 2);
    ctx.fillStyle = '#0077D6';
    ctx.fill();
    ctx.restore();
}

/**
 * Draw all countries from GeoJSON
 * @param {Object} appContext - Application context
 */
function drawCountries(appContext) {
    const {worldData} = appContext;

    for (const feature of worldData.features) {
        if (feature.geometry.type === 'Polygon') {
            drawPolygon(appContext, feature.geometry.coordinates, feature.properties.ISO_A3);
        } else if (feature.geometry.type === 'MultiPolygon') {
            for (const polygon of feature.geometry.coordinates) {
                drawPolygon(appContext, polygon, feature.properties.ISO_A3);
            }
        }
    }
}

/**
 * Draw a polygon (country outline)
 * @param {Object} appContext - Application context
 * @param {Array} coordinates - Polygon coordinates
 * @param {string} countryCode - Country code for coloring
 */
function drawPolygon(appContext, coordinates, countryCode) {
    if (!coordinates || coordinates.length === 0) return;

    const {
        ctx, worldData, hoveredFeature,
        lastClickedLocation, gameActive, quizActive,
        gameSelectedCountries, quizSelectedCountries, quizCorrectCountries
    } = appContext;

    // Default color if country code not found
    const defaultColor = '#CCCCCC';

    // Get color for the country - avoid accessing undefined countryColors
    let color = defaultColor;
    if (appContext.worldData && appContext.worldData.countryColors &&
        appContext.worldData.countryColors[countryCode]) {
        const colorObj = appContext.worldData.countryColors[countryCode];
        color = colorObj.randomColor;
    }

    // Check if the polygon is being hovered
    const hoveredCode = hoveredFeature ?
        (hoveredFeature.properties.code || hoveredFeature.properties.ISO_A3) :
        null;

    const isHovered = hoveredCode === countryCode;

    // Check if this is the last clicked country
    const isClicked = lastClickedLocation &&
        lastClickedLocation.code === countryCode;

    // CRITICAL FIX: Check if country is selected in either game mode
    // Add defensive checks to avoid errors with undefined or null arrays

    // For Population Target game
    const isGameSelected = gameActive &&
        Array.isArray(gameSelectedCountries) &&
        gameSelectedCountries.includes(countryCode);

    // For Quiz game - selected countries
    const isQuizSelected = quizActive &&
        Array.isArray(quizSelectedCountries) &&
        quizSelectedCountries.some(c => c && c.code === countryCode);

    // For Quiz game - correct answers
    const isQuizCorrect = quizActive &&
        Array.isArray(quizCorrectCountries) &&
        quizCorrectCountries.includes(countryCode);

    // Draw all rings in the polygon
    for (const ring of coordinates) {
        if (ring.length < 3) continue;

        ctx.beginPath();

        // Drawing code remains the same...

        // Apply different styles based on state - this code is correct but was failing
        // due to the selection checks above not working properly
        if (isQuizCorrect) {
            // Correct answer in quiz - bright green
            ctx.fillStyle = `rgba(76, 175, 80, 0.8)`;
            ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.lineWidth = 3;
        } else if (isQuizSelected) {
            // Selected in quiz - orange highlight
            ctx.fillStyle = `rgba(255, 140, 0, 0.8)`;
            ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.lineWidth = 3;
        } else if (isGameSelected) {
            // Game selection style
            ctx.fillStyle = `${color}EE`;
            ctx.strokeStyle = 'rgba(255, 215, 0, 1.0)';
            ctx.lineWidth = 4;
        } else if (isHovered || isClicked) {
            // Highlighted style
            ctx.fillStyle = `${color}EE`;
            ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.lineWidth = 3;
        } else {
            // Normal style
            ctx.fillStyle = `${color}AA`;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 0.8;
        }

        ctx.fill();
        ctx.stroke();
    }
}

/**
 * FIX 6: Add a debug function to trace selection state changes
 * Add this to webroot/index.js to help diagnose problems
 */
// Debug function to monitor selection state
function debugSelectionState() {
    console.log("SELECTION STATE:");
    console.log("Game Active:", window.appContext.gameActive);
    console.log("Game Selected Countries:", window.appContext.gameSelectedCountries);
    console.log("Quiz Active:", window.appContext.quizActive);
    console.log("Quiz Selected Countries:", window.appContext.quizSelectedCountries);
    console.log("Quiz Correct Countries:", window.appContext.quizCorrectCountries);
}