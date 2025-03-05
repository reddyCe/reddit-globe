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
    const {worldData, countryColors} = appContext;

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
        ctx, countryColors, displayMode, hoveredFeature,
        lastClickedLocation, gameActive, quizActive,
        gameSelectedCountries, quizSelectedCountries, quizCorrectCountries
    } = appContext;

    // Get color based on mode
    const colorObj = countryColors[countryCode] || {
        randomColor: '#CCCCCC',
        heatColor: '#CCCCCC'
    };

    const color = (displayMode === 'country') ?
        colorObj.randomColor : colorObj.heatColor;

    // Check if the polygon is being hovered
    const hoveredCode = hoveredFeature ?
        (hoveredFeature.properties.code || hoveredFeature.properties.ISO_A3) :
        null;

    const isHovered = hoveredCode === countryCode;

    // Check if this is the last clicked country
    const isClicked = lastClickedLocation &&
        lastClickedLocation.code === countryCode;

    // Check if country is selected in games
    const isGameSelected = gameActive && gameSelectedCountries.includes(countryCode);
    const isQuizSelected = quizActive && quizSelectedCountries.some(c => c.code === countryCode);
    const isQuizCorrect = quizActive && quizCorrectCountries && quizCorrectCountries.includes(countryCode);

    // Draw all rings in the polygon
    for (const ring of coordinates) {
        if (ring.length < 3) continue;

        ctx.beginPath();

        let firstPoint = true;
        let lastVisiblePoint = null;

        for (const coordinate of ring) {
            const point = projectGlobePoint(appContext, coordinate[1], coordinate[0]);

            // Only draw if point is on the front side of the globe
            if (point.z > 0) {
                if (firstPoint || !lastVisiblePoint) {
                    ctx.moveTo(point.x, point.y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(point.x, point.y);
                }
                lastVisiblePoint = point;
            } else if (lastVisiblePoint) {
                // We crossed the edge of the visible hemisphere
                ctx.lineTo(point.x, point.y);
                lastVisiblePoint = null;
            }
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

/**
 * Draw latitude and longitude grid lines
 * @param {Object} appContext - Application context
 */
function drawGridLines(appContext) {
    const {ctx} = appContext;

    // Draw latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();

        let firstPoint = true;
        for (let lng = -180; lng <= 180; lng += 5) {
            const point = projectGlobePoint(appContext, lat, lng);

            if (point.z > 0) {
                if (firstPoint) {
                    ctx.moveTo(point.x, point.y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    // Draw longitude lines
    for (let lng = -180; lng < 180; lng += 20) {
        ctx.beginPath();

        let firstPoint = true;
        for (let lat = -90; lat <= 90; lat += 5) {
            const point = projectGlobePoint(appContext, lat, lng);

            if (point.z > 0) {
                if (firstPoint) {
                    ctx.moveTo(point.x, point.y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}

/**
 * Project 3D globe coordinates to 2D screen coordinates
 * @param {Object} appContext - Application context
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Projected point {x, y, z}
 */
function projectGlobePoint(appContext, lat, lng) {
    const {centerX, centerY, rotation, zoomScale} = appContext;

    // Convert to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Calculate 3D coordinates on a sphere
    let x = EARTH_RADIUS * Math.cos(latRad) * Math.sin(lngRad);
    let y = EARTH_RADIUS * Math.sin(latRad);
    let z = EARTH_RADIUS * Math.cos(latRad) * Math.cos(lngRad);

    // Apply rotation
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
    let y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
    let z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);

    // Rotate around Y axis
    let x2 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
    let z2 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);

    return {x: x2, y: y1, z: z2};
}

/**
 * Highlight a location on the globe
 * @param {Object} appContext - Application context
 * @param {Object} location - Location to highlight
 */
function highlightLocation(appContext, location) {
    if (!location) return;

    const {ctx} = appContext;
    const point = projectGlobePoint(appContext, location.lat, location.lng);

    // Only highlight if the location is on the front of the globe
    if (point.z > 0) {
        // Draw a marker
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}