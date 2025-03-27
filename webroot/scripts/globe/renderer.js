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
 * Highlight a specific location on the globe
 * @param {Object} appContext - Application context
 * @param {Object} location - Location data {lat, lng, name}
 */
function highlightLocation(appContext, location) {
    const {ctx, centerX, centerY} = appContext;

    // Calculate point projection
    const point = projectGlobePoint(appContext, location.lat, location.lng);

    // Only draw if point is on the visible side of the globe (z > 0)
    if (point.z <= 0) return;

    // Draw marker with pulse effect
    ctx.save();

    // Draw glow
    const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, 15
    );
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw marker dot
    ctx.fillStyle = 'gold';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Add name label if needed
    if (location.name) {
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(location.name, point.x, point.y - 15);
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

/**
 * Draw latitude and longitude grid lines on the globe
 * @param {Object} appContext - Application context
 */
function drawGridLines(appContext) {
    const {ctx, centerX, centerY, rotation, zoomScale} = appContext;

    // Set line style for grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 0.5;

    // Draw longitude lines (vertical)
    for (let lng = -180; lng <= 180; lng += 30) {
        ctx.beginPath();

        // Draw points along the longitude line
        for (let lat = -90; lat <= 90; lat += 5) {
            const point = projectGlobePoint(appContext, lat, lng);

            // Only draw points on the visible side of the globe (z > 0)
            if (point.z > 0) {
                if (lat === -90) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
        }

        ctx.stroke();
    }

    // Draw latitude lines (horizontal)
    for (let lat = -90; lat <= 90; lat += 30) {
        // Skip poles
        if (lat === -90 || lat === 90) continue;

        ctx.beginPath();

        // Draw points along the latitude line
        let firstPoint = null;
        for (let lng = -180; lng <= 180; lng += 5) {
            const point = projectGlobePoint(appContext, lat, lng);

            // Only draw points on the visible side of the globe (z > 0)
            if (point.z > 0) {
                if (!firstPoint) {
                    ctx.moveTo(point.x, point.y);
                    firstPoint = point;
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
        }

        ctx.stroke();
    }
}

/**
 * Project 3D globe coordinates to 2D screen coordinates
 * @param {Object} appContext - Application context
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @returns {Object} Projected point {x, y, z}
 */
function projectGlobePoint(appContext, lat, lng) {
    const {centerX, centerY, rotation, zoomScale} = appContext;
    const EARTH_RADIUS = 240;

    // Convert to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Calculate 3D coordinates on a sphere
    const x = EARTH_RADIUS * Math.cos(latRad) * Math.sin(lngRad);
    const y = EARTH_RADIUS * Math.sin(latRad);
    const z = EARTH_RADIUS * Math.cos(latRad) * Math.cos(lngRad);

    // Apply rotation to get the visible coordinates
    const rotatedPoint = rotatePoint(x, y, z, rotation);

    // Apply zoom and project 3D to 2D
    return {
        x: centerX + rotatedPoint.x * zoomScale,
        y: centerY - rotatedPoint.y * zoomScale,
        z: rotatedPoint.z / EARTH_RADIUS // Normalized z for depth
    };
}

/**
 * Rotate a point in 3D space
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {Object} rotation - Rotation angles {x, y}
 * @returns {Object} Rotated point {x, y, z}
 */
function rotatePoint(x, y, z, rotation) {
    // Rotate around X axis
    const y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
    const z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);

    // Rotate around Y axis
    const x2 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
    const z2 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);

    return {x: x2, y: y1, z: z2};
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
            drawPolygon(appContext, feature.geometry.coordinates, feature.properties.adm0_a3_gb);
        } else if (feature.geometry.type === 'MultiPolygon') {
            for (const polygon of feature.geometry.coordinates) {
                drawPolygon(appContext, polygon, feature.properties.adm0_a3_gb);
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
        (hoveredFeature.properties.code || hoveredFeature.properties.adm0_a3_gb) :
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

        // CRITICAL FIX: This is the missing code that draws the country paths
        let firstPoint = null;
        let firstVisiblePoint = null;

        // Loop through coordinates to draw the polygon
        for (let i = 0; i < ring.length; i++) {
            const coords = ring[i];
            const point = projectGlobePoint(appContext, coords[1], coords[0]);

            // Only draw points on the visible side of the globe (z > 0)
            if (point.z > 0) {
                if (!firstVisiblePoint) {
                    ctx.moveTo(point.x, point.y);
                    firstVisiblePoint = point;
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
        }

        // Close the path if we found at least one visible point
        if (firstVisiblePoint) {
            ctx.closePath();
        } else {
            // Skip rendering if no points are visible
            continue;
        }

        // Apply different styles based on state
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