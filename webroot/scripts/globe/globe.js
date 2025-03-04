// Globe state
let canvas, ctx;
let dragging = false;
let lastX, lastY;
let rotation = { x: 0.3, y: 0 };
let lastClickedLocation = null;
let centerX, centerY;
let tooltip = null;
let tooltipVisible = false;
let hoveredFeature = null;
let displayMode = 'country';
let needsRedraw = true; // Initial draw is needed
// Zoom functionality
let zoomScale = 1.0;
const MIN_ZOOM = 0.5;  // Half size
const MAX_ZOOM = 7.0;  // 7x size
const ZOOM_SPEED = 0.1;
let dragStartTime = 0;
let mouseHasMoved = false;
const DRAG_THRESHOLD = 5; // pixels
const CLICK_TIMEOUT = 200; // milliseconds
// GeoJSON data
let worldData = null;
let countryColors = {};
let loadingElement = null;
let gameSelectedCountries = []; // Store country codes of game-selected countries

// Globe constants
const EARTH_RADIUS = 240;
const MAX_POLYGON_POINTS = 1000; // Limit for performance

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    setupEventListeners();
    initStars(400);
    // Initialize loading indicator and tooltip
    loadingElement = document.getElementById('loading');
    tooltip = document.getElementById('tooltip');

    // Start the globe visualization and load GeoJSON data
    initGeoJsonData();
    animateGlobe();
});

// Initialize the canvas
function initCanvas() {
    canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.getElementById('canvas-container').appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Center of the screen
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
}

// Set up event listeners
function setupEventListeners() {
    // Mouse events for dragging the globe
    canvas.addEventListener('mousedown', (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        dragStartTime = Date.now();
        mouseHasMoved = false;
    });


    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    canvas.addEventListener('mouseup', (e) => {
        // Only consider it a click if:
        // 1. The mouse hasn't moved beyond the threshold
        // 2. The drag duration was short (not a long press or slow drag)
        const dragDuration = Date.now() - dragStartTime;

        if (dragging && !mouseHasMoved && dragDuration < CLICK_TIMEOUT) {
            // This was a legitimate click (not a drag)
            handleGlobeClick(e);
        }

        dragging = false;
        needsRedraw = true; // Redraw after interaction ends
    });


    canvas.addEventListener('mousemove', (e) => {
        if (dragging) {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            // Check if mouse has moved enough to be considered a drag
            if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
                mouseHasMoved = true;
            }

            rotation.y += deltaX * 0.01;
            rotation.x += deltaY * 0.01;

            // Limit vertical rotation to avoid flipping
            rotation.x = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, rotation.x));

            lastX = e.clientX;
            lastY = e.clientY;

            needsRedraw = true; // Need to redraw when rotating
        } else {
            // Handle hover effects
            const didHoverChange = processPointForHover(e.clientX, e.clientY);
            if (didHoverChange) {
                needsRedraw = true; // Only redraw if hover state changed
            }
        }
    });

    // Add mouse wheel event for zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();

        // Determine zoom direction
        const zoomDirection = e.deltaY > 0 ? -1 : 1;

        // Apply zoom
        zoomScale += zoomDirection * ZOOM_SPEED;

        // Enforce zoom limits
        zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomScale));
        needsRedraw = true;
    });

    // Handle mouse leave
    canvas.addEventListener('mouseleave', () => {
        hideTooltip();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        needsRedraw = true;
    });
}

function handleTouchStart(e) {
    e.preventDefault(); // Prevent default touch actions like scrolling

    if (e.touches.length === 1) {
        // Single touch - similar to mousedown
        dragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        dragStartTime = Date.now();
        mouseHasMoved = false;
    } else if (e.touches.length === 2) {
        // Two finger touch - prepare for pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const initialDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        // Store initial distance for pinch zoom calculation
        e.currentTarget.initialPinchDistance = initialDistance;
        e.currentTarget.initialZoomScale = zoomScale;
    }
}
function handleTouchMove(e) {
    e.preventDefault(); // Prevent default touch actions

    if (e.touches.length === 1 && dragging) {
        // Single touch movement - handle rotation (similar to mouse drag)
        const deltaX = e.touches[0].clientX - lastX;
        const deltaY = e.touches[0].clientY - lastY;

        // Check if touch has moved enough to be considered a drag
        if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
            mouseHasMoved = true;
        }

        rotation.y += deltaX * 0.01;
        rotation.x += deltaY * 0.01;

        // Limit vertical rotation to avoid flipping
        rotation.x = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, rotation.x));

        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;

        needsRedraw = true;

        // Process hover while dragging (for continuous feedback)
        processPointForHover(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
        // Two finger touch - handle pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        // Calculate zoom factor based on pinch distance change
        if (e.currentTarget.initialPinchDistance > 0) {
            const factor = currentDistance / e.currentTarget.initialPinchDistance;
            zoomScale = e.currentTarget.initialZoomScale * factor;

            // Enforce zoom limits
            zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomScale));
            needsRedraw = true;
        }
    }
}
function processPointForHover(clientX, clientY) {
    if (!worldData) return false;
    const oldHoveredFeature = hoveredFeature;

    const rect = canvas.getBoundingClientRect();
    const pointX = clientX - rect.left;
    const pointY = clientY - rect.top;

    // Reset hovered feature
    hoveredFeature = null;

    // First, check if the point is within the globe circle, adjusted for zoom
    const adjustedRadius = EARTH_RADIUS * zoomScale;
    const distFromCenter = Math.sqrt(
        Math.pow(pointX - centerX, 2) +
        Math.pow(pointY - centerY, 2)
    );

    if (distFromCenter > adjustedRadius) {
        hideTooltip();
        return oldHoveredFeature !== null;
    }

    // Convert point position to 3D point on the sphere
    const point3D = screenTo3D(pointX, pointY);
    if (!point3D) {
        hideTooltip();
        return oldHoveredFeature !== null;
    }

    // Convert 3D point to lat/lng
    const pointLatLng = cartesianToLatLng(point3D.x, point3D.y, point3D.z);
    if (!pointLatLng) {
        hideTooltip();
        return oldHoveredFeature !== null;
    }

    // Check if point is inside any feature
    for (const feature of worldData.features) {
        if (isPointInFeature(pointLatLng, feature)) {
            hoveredFeature = feature;

            // Get property names based on your GeoJSON structure
            const name = hoveredFeature.properties.name || hoveredFeature.properties.NAME || "Unknown";
            const code = hoveredFeature.properties.code || hoveredFeature.properties.ISO_A3 || "Unknown";
            const population = hoveredFeature.properties.population || hoveredFeature.properties.POP_EST || "N/A";
            const continent = hoveredFeature.properties.continent || hoveredFeature.properties.CONTINENT || "Unknown";

            // Show tooltip with country info

            window.
            tooltip.innerHTML = `
                <b>${name} (${code})</b> `;
            // window.parent.postMessage(
            //     {
            //         type: 'loadCountryInfo',
            //         data: {
            //             country: name
            //         },
            //     },
            //     '*'
            // );
            // Position tooltip with some offset from pointer
            tooltip.style.left = `${clientX + 15}px`;
            tooltip.style.top = `${clientY + 15}px`;

            // Make sure tooltip stays within viewport
            const tooltipRect = tooltip.getBoundingClientRect();
            if (tooltipRect.right > window.innerWidth) {
                tooltip.style.left = `${clientX - tooltipRect.width - 10}px`;
            }
            if (tooltipRect.bottom > window.innerHeight) {
                tooltip.style.top = `${clientY - tooltipRect.height - 10}px`;
            }

            // Show tooltip with a fade-in effect
            tooltip.style.display = 'block';
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.2s ease-in-out';

            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);

            tooltipVisible = true;
            return oldHoveredFeature !== hoveredFeature;
        }
    }

    // If we get here, no feature was found under the pointer
    if (tooltipVisible) {
        hideTooltip();
    }

    return oldHoveredFeature !== null;
}


function handleTouchEnd(e) {
    e.preventDefault();

    if (dragging && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dragDuration = Date.now() - dragStartTime;

        // If touch didn't move much and was brief, treat it as a tap (click)
        if (!mouseHasMoved && dragDuration < CLICK_TIMEOUT) {
            handleGlobeClick({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }

    // Reset dragging state
    dragging = false;

    // Reset pinch zoom tracking
    if (e.currentTarget) {
        e.currentTarget.initialPinchDistance = 0;
    }

    needsRedraw = true;
}

// Initialize GeoJSON data
function initGeoJsonData() {
    // Show loading indicator
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }

    // Use fetch to load the GeoJSON file
    fetch('./globe.geojson')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Process the loaded GeoJSON data
            processGeoJsonData(data);
        })
        .catch(error => {
            console.error('Error loading GeoJSON:', error);

            // As a fallback, use a simple demo dataset
            const demoWorldData = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [[
                                [-125.0, 24.0], [-125.0, 49.0], [-66.0, 49.0],
                                [-66.0, 24.0], [-125.0, 24.0]
                            ]]
                        },
                        "properties": {
                            "code": "US",
                            "name": "United States",
                            "population": 331000000,
                            "continent": "North America"
                        }
                    }
                    // Add more fallback countries if needed
                ]
            };

            processGeoJsonData(demoWorldData);
        });
}

// Process the GeoJSON data
function processGeoJsonData(data) {
    // Store the data
    worldData = data;

    // Generate random colors for countries
    worldData.features.forEach(feature => {
        // Generate a color based on population for heatmap mode
        const population = feature.properties.POP_EST || 0;
        const normalizedPop = Math.min(Math.log(population) / Math.log(1500000000), 1);
        // Create both a random color and a heat color
        countryColors[feature.properties.ISO_A3] = {
            randomColor: randomColor(),
            heatColor: getHeatmapColor(normalizedPop)
        };

        // Simplify geometry if needed
        simplifyGeometry(feature);
    });

    // Hide loading indicator
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Simplify geometry for performance
function simplifyGeometry(feature) {
    if (feature.geometry.type === 'Polygon') {
        feature.geometry.coordinates = feature.geometry.coordinates.map(ring => {
            if (ring.length > MAX_POLYGON_POINTS) {
                // Simple decimation (every Nth point)
                const factor = Math.ceil(ring.length / MAX_POLYGON_POINTS);
                return ring.filter((_, i) => i % factor === 0);
            }
            return ring;
        });
    } else if (feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates = feature.geometry.coordinates.map(polygon => {
            return polygon.map(ring => {
                if (ring.length > MAX_POLYGON_POINTS) {
                    const factor = Math.ceil(ring.length / MAX_POLYGON_POINTS);
                    return ring.filter((_, i) => i % factor === 0);
                }
                return ring;
            });
        });
    }
}

// Get color for heatmap mode
function getHeatmapColor(value) {
    // Color gradient from blue (cold) to red (hot)
    const r = Math.floor(255 * Math.min(1, value * 2));
    const g = Math.floor(255 * Math.min(1, 2 - value * 2));
    const b = Math.floor(255 * (1 - value));

    return `rgb(${r}, ${g}, ${b})`;
}

// Generate random color
function randomColor() {
    // Generate HSL color with:
    // - Random hue (0-360)
    // - Lower saturation (20-50%) for subtlety
    // - Medium to high lightness (50-80%) to avoid dark colors
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30 + 20); // 20-50%
    const lightness = Math.floor(Math.random() * 30 + 50);  // 50-80%

    // Convert HSL to hex
    return hslToHex(hue, saturation, lightness);
}

function hslToHex(h, s, l) {
    // Convert HSL percentages to 0-1 scale
    s /= 100;
    l /= 100;

    // Algorithm to convert HSL to RGB
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let r, g, b;
    if (h >= 0 && h < 60) {
        [r, g, b] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, c, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, c];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, c];
    } else {
        [r, g, b] = [c, 0, x];
    }

    // Convert RGB to hex
    const toHex = (value) => {
        const hex = Math.round((value + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Handle mouse move for hover effects
function handleMouseMove(e) {
    if (dragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;

        rotation.y += deltaX * 0.01;
        rotation.x += deltaY * 0.01;

        // Limit vertical rotation to avoid flipping
        rotation.x = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, rotation.x));

        lastX = e.clientX;
        lastY = e.clientY;

        needsRedraw = true; // Need to redraw when rotating
    } else {
        // Handle hover effects
        const didHoverChange = processPointForHover(e.clientX, e.clientY);
        if (didHoverChange) {
            needsRedraw = true; // Only redraw if hover state changed
        }
    }
}


// Convert screen coordinates to 3D point on unit sphere
function screenTo3D(screenX, screenY) {
    // Vector from center to mouse point, adjusted for zoom
    const x = (screenX - centerX) / zoomScale;
    const y = -(screenY - centerY) / zoomScale; // Flip Y for 3D coordinates

    // Distance from center
    const distSq = x*x + y*y;

    // If outside the sphere projection, return null
    if (distSq > EARTH_RADIUS * EARTH_RADIUS) {
        return null;
    }

    // Calculate z using the sphere equation x² + y² + z² = r²
    const z = Math.sqrt(EARTH_RADIUS * EARTH_RADIUS - distSq);

    // Apply inverse rotation to get the point in the original coordinate system
    return inverseRotatePoint(x, y, z);
}

// Convert 3D cartesian coordinates to lat/lng
function cartesianToLatLng(x, y, z) {
    const r = Math.sqrt(x*x + y*y + z*z);

    if (r === 0) return null;

    // Normalize to unit sphere
    x /= r;
    y /= r;
    z /= r;

    const lat = Math.asin(y) * 180 / Math.PI;
    const lng = Math.atan2(x, z) * 180 / Math.PI;

    return { lat, lng };
}

// Inverse rotation to get original coordinates
function inverseRotatePoint(x, y, z) {
    // Inverse rotation around Y axis
    let x1 = x * Math.cos(-rotation.y) + z * Math.sin(-rotation.y);
    let z1 = -x * Math.sin(-rotation.y) + z * Math.cos(-rotation.y);

    // Inverse rotation around X axis
    let y2 = y * Math.cos(-rotation.x) - z1 * Math.sin(-rotation.x);
    let z2 = y * Math.sin(-rotation.x) + z1 * Math.cos(-rotation.x);

    return { x: x1, y: y2, z: z2 };
}

// Format large numbers with commas
function formatNumber(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "N/A";
}

// Point-in-polygon test
function isPointInFeature(point, feature) {
    const geometry = feature.geometry;

    // Handle different geometry types
    if (geometry.type === 'Polygon') {
        return isPointInPolygon(point, geometry.coordinates[0]);
    } else if (geometry.type === 'MultiPolygon') {
        // Check all polygons in the MultiPolygon
        for (const polygon of geometry.coordinates) {
            if (isPointInPolygon(point, polygon[0])) {
                return true;
            }
        }
    }

    return false;
}

function isPointInPolygon(point, polygon) {
    const x = point.lng || point[0];
    const y = point.lat || point[1];

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0];
        const yi = polygon[i][1];
        const xj = polygon[j][0];
        const yj = polygon[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) inside = !inside;
    }

    return inside;
}
// Convert screen coordinates to lat/lng
function screenToLatLng(screenX, screenY) {
    // Calculate vector from center of screen
    const vectorX = screenX - centerX;
    const vectorY = screenY - centerY;

    // Calculate distance from center
    const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

    // If outside the globe radius, return null
    if (distance > EARTH_RADIUS) {
        return null;
    }

    // Calculate the theta angle (around the y-axis)
    const theta = Math.atan2(vectorX, -vectorY);

    // Calculate the phi angle (latitude)
    const phi = Math.PI / 2 - Math.acos(distance / EARTH_RADIUS);

    // Convert to lat/lng, adjusting for current rotation
    const lng = (theta * 180 / Math.PI) - (rotation.y * 180 / Math.PI);
    const lat = (phi * 180 / Math.PI) - (rotation.x * 180 / Math.PI);

    return { lat, lng };
}

// Hide tooltip
function hideTooltip() {
    if (tooltipVisible) {
        tooltip.style.opacity = '0';
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 200);
    }
    tooltipVisible = false;
    hoveredFeature = null;
}

// Animate the globe
function animateGlobe() {
    if (needsRedraw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGlobe();
        needsRedraw = false; // Reset the flag after drawing
    }

    // Always continue the animation loop
    requestAnimationFrame(animateGlobe);
}

// Draw the globe on the canvas
// Create a stars array to store star data
let stars = [];

// Initialize stars once
function initStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random(),
            opacity: Math.random() * 0.8 + 0.2
        });
    }
}

// Function to draw the pre-generated stars
function drawStars() {
    ctx.fillStyle = 'whitesmoke';
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;  // Reset alpha
}

function drawGlobe() {
    // Create a dark space gradient background
    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width/1.5
    );
    gradient.addColorStop(0, '#1a2040');  // Dark blue at center
    gradient.addColorStop(1, '#000510');  // Nearly black at edges

    // Apply gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the pre-generated stars
    drawStars();

    // Draw the Earth base (dark globe)
    drawBaseGlobe();

    // Draw country polygons if data is loaded
    if (worldData) {
        drawCountries();
    }

    // Draw grid lines for reference
    drawGridLines();

    // Highlight last clicked location if any
    if (lastClickedLocation) {
        highlightLocation(lastClickedLocation);
    }
}


// Draw a base dark globe
function drawBaseGlobe() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, EARTH_RADIUS * zoomScale, 0, Math.PI * 2);
    ctx.fillStyle = '#0077D6';
    ctx.fill();
    ctx.restore();
}

// Draw countries from GeoJSON
function drawCountries() {
    for (const feature of worldData.features) {
        if (feature.geometry.type === 'Polygon') {
            drawPolygon(feature.geometry.coordinates, feature.properties.ISO_A3);
        } else if (feature.geometry.type === 'MultiPolygon') {
            for (const polygon of feature.geometry.coordinates) {
                drawPolygon(polygon, feature.properties.ISO_A3);
            }
        }
    }
}

// Draw a polygon (country outline)
function drawPolygon(coordinates, countryCode) {
    if (!coordinates || coordinates.length === 0) return;

    // Get color based on mode
    const colorObj = countryColors[countryCode] || {
        randomColor: '#CCCCCC',
        heatColor: '#CCCCCC'
    };

    const color = displayMode === 'country' ? colorObj.randomColor : colorObj.heatColor;

    // Check if the polygon is being hovered - handle both property naming conventions
    const hoveredCode = hoveredFeature ?
        (hoveredFeature.properties.code || hoveredFeature.properties.ISO_A3 || "Unknown") :
        null;

    const isHovered = hoveredCode === countryCode;

    // Check if this is the last clicked country
    const isClicked = lastClickedLocation &&
        lastClickedLocation.code === countryCode;

    // Check if this country is selected in the game
    const isGameSelected = gameActive && gameSelectedCountries.includes(countryCode);

    // Draw all rings in the polygon
    for (const ring of coordinates) {
        if (ring.length < 3) continue;

        ctx.beginPath();

        let firstPoint = true;
        let lastVisiblePoint = null;

        for (const coordinate of ring) {
            const point = projectGlobePoint(coordinate[1], coordinate[0]);

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

        // Apply different styles based on hover/click/selected state
        if (isGameSelected) {
            // Game selection style - bright highlight with gold outline
            ctx.fillStyle = `${color}EE`; // More opaque
            ctx.strokeStyle = 'rgba(255, 215, 0, 1.0)'; // Gold outline
            ctx.lineWidth = 4;
        } else if (isHovered || isClicked) {
            // Highlighted style
            ctx.fillStyle = `${color}EE`; // More opaque when highlighted
            ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)'; // Bright white outline
            ctx.lineWidth = 3;
        } else {
            // Normal style
            ctx.fillStyle = `${color}AA`; // Semi-transparent normally
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Dark outline normally
            ctx.lineWidth = 0.8;
        }

        ctx.fill();
        ctx.stroke();
    }
}// Draw grid lines (latitude/longitude)
function drawGridLines() {
    // Draw latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();

        let firstPoint = true;
        for (let lng = -180; lng <= 180; lng += 5) {
            const point = projectGlobePoint(lat, lng);

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
            const point = projectGlobePoint(lat, lng);

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

// Project 3D globe coordinates to 2D screen coordinates
function projectGlobePoint(lat, lng) {
    // Convert to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Calculate 3D coordinates on a sphere
    let x = EARTH_RADIUS * Math.cos(latRad) * Math.sin(lngRad);
    let y = EARTH_RADIUS * Math.sin(latRad);
    let z = EARTH_RADIUS * Math.cos(latRad) * Math.cos(lngRad);

    // Apply rotation
    const rotatedPoint = rotatePoint(x, y, z);

    // Apply zoom and project 3D to 2D
    return {
        x: centerX + rotatedPoint.x * zoomScale,
        y: centerY - rotatedPoint.y * zoomScale,
        z: rotatedPoint.z / EARTH_RADIUS // Normalized z for depth
    };
}

// Rotate a point in 3D space
function rotatePoint(x, y, z) {
    // Rotate around X axis
    let y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
    let z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);

    // Rotate around Y axis
    let x2 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
    let z2 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);

    return { x: x2, y: y1, z: z2 };
}

// Handle a click on the globe
function handleGlobeClick(e) {
    if (!worldData) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // First, check if the click is within the globe circle, adjusted for zoom
    const adjustedRadius = EARTH_RADIUS * zoomScale;
    const distFromCenter = Math.sqrt(
        Math.pow(clickX - centerX, 2) +
        Math.pow(clickY - centerY, 2)
    );

    if (distFromCenter > adjustedRadius) {
        return;
    }

    // Convert mouse position to 3D point on the sphere
    const point3D = screenTo3D(clickX, clickY);
    if (!point3D) {
        return;
    }

    // Convert 3D point to lat/lng
    const clickLatLng = cartesianToLatLng(point3D.x, point3D.y, point3D.z);
    if (!clickLatLng) {
        return;
    }

    // Check if point is inside any feature
    for (const feature of worldData.features) {
        if (isPointInFeature(clickLatLng, feature)) {
            const location = {
                lat: clickLatLng.lat,
                lng: clickLatLng.lng,
                name: feature.properties.name || feature.properties.NAME || "Unknown",
                code: feature.properties.code || feature.properties.ISO_A3 || "Unknown",
                details: `Population: ${formatNumber(feature.properties.population || feature.properties.POP_EST)}, ` +
                    `Continent: ${feature.properties.continent || feature.properties.CONTINENT || "Unknown"}`
            };

            // Update local state and highlight the clicked country
            lastClickedLocation = location;
            hoveredFeature = feature;


            return; // Exit once we find the feature under the click
        }
    }

    // If we get here, the click didn't hit any feature
    // You might want to add logic to clear the selection or show some default info
}
// Highlight a location on the globe
function highlightLocation(location) {
    if (!location) return;

    const point = projectGlobePoint(location.lat, location.lng);

    // Only highlight if the location is on the front of the globe
    if (point.z > 0) {
        // Draw a marker
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}