/**
 * Globe interaction module - IMPROVED VERSION
 * Handles mouse and touch interactions with the globe
 */
import {hideTooltip, showTooltip} from '../../components/tooltip.js';

// Constants for interactions
const MIN_ZOOM = 0.5;  // Half size
const MAX_ZOOM = 7.0;  // 7x size
const ZOOM_SPEED = 0.1; // Original zoom speed value (restored)
const DRAG_THRESHOLD = 3; // pixels - reduced for more responsive dragging
const CLICK_TIMEOUT = 250; // milliseconds
const ROTATION_INERTIA = 0.92; // Higher values = longer spin (0.95 = long, 0.8 = short)
const MAX_ROTATION_SPEED = 0.03; // Prevent too fast rotation

// Interaction state
let dragging = false;
let lastX, lastY;
let dragStartTime = 0;
let mouseHasMoved = false;
let rotationVelocity = {x: 0, y: 0};
let useInertia = true;
let inertiaAnimationId = null;

// For double-touch (pinch)
let initialPinchDistance = 0;
let initialZoomScale = 1.0;
let lastPinchCenter = {x: 0, y: 0};

/**
 * Set up all event listeners for globe interactions
 * @param {Object} appContext - Application context
 */
export function setupInteractions(appContext) {
    const {canvas} = appContext;

    // Mouse events for dragging the globe
    canvas.addEventListener('mousedown', (e) => handleMouseDown(e, appContext));
    canvas.addEventListener('mousemove', (e) => handleMouseMove(e, appContext));
    canvas.addEventListener('mouseup', (e) => handleMouseUp(e, appContext));
    canvas.addEventListener('wheel', (e) => handleMouseWheel(e, appContext));
    canvas.addEventListener('mouseleave', () => handleMouseLeave(appContext));

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => handleTouchStart(e, appContext), {passive: false});
    canvas.addEventListener('touchmove', (e) => handleTouchMove(e, appContext), {passive: false});
    canvas.addEventListener('touchend', (e) => handleTouchEnd(e, appContext), {passive: false});
    canvas.addEventListener('touchcancel', (e) => handleTouchEnd(e, appContext), {passive: false});

    // Window resize event
    window.addEventListener('resize', () => handleWindowResize(appContext));

    // Exit button handler
    setupExitButtonHandler(appContext);

    // Disable context menu on canvas for better touch experience
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    console.log('Globe interactions initialized');
}

/**
 * Handle mouse down event
 * @param {MouseEvent} e - Mouse event
 * @param {Object} appContext - Application context
 */
function handleMouseDown(e, appContext) {
    // Stop any ongoing inertia animation
    stopInertiaAnimation();

    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    dragStartTime = Date.now();
    mouseHasMoved = false;

    // Reset velocity when starting new drag
    rotationVelocity = {x: 0, y: 0};

    // Store in app context
    appContext.dragging = true;
}

/**
 * Handle mouse move event
 * @param {MouseEvent} e - Mouse event
 * @param {Object} appContext - Application context
 */
function handleMouseMove(e, appContext) {
    if (dragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        const timeElapsed = Date.now() - dragStartTime;

        // Check if mouse has moved enough to be considered a drag
        if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
            mouseHasMoved = true;
            appContext.mouseHasMoved = true;
        }

        // Calculate rotation delta with damping for smoother control
        const damping = Math.min(1.0, timeElapsed / 200); // Gradual increase in responsiveness
        const rotXDelta = deltaY * 0.01 * damping;
        const rotYDelta = deltaX * 0.01 * damping;

        // Update rotation
        appContext.rotation.y += rotYDelta;
        appContext.rotation.x += rotXDelta;

        // Update velocity for inertia - weighted average with previous velocity
        rotationVelocity.x = rotationVelocity.x * 0.8 + rotXDelta * 0.2;
        rotationVelocity.y = rotationVelocity.y * 0.8 + rotYDelta * 0.2;

        // Limit rotation velocity
        rotationVelocity.x = Math.max(-MAX_ROTATION_SPEED, Math.min(MAX_ROTATION_SPEED, rotationVelocity.x));
        rotationVelocity.y = Math.max(-MAX_ROTATION_SPEED, Math.min(MAX_ROTATION_SPEED, rotationVelocity.y));

        // Limit vertical rotation to avoid flipping
        appContext.rotation.x = Math.max(-Math.PI / 2 + 0.1,
            Math.min(Math.PI / 2 - 0.1, appContext.rotation.x));

        lastX = e.clientX;
        lastY = e.clientY;

        appContext.needsRedraw = true;
    } else {
        // Handle hover effects
        const didHoverChange = processPointForHover(e.clientX, e.clientY, appContext);
        if (didHoverChange) {
            appContext.needsRedraw = true;
        }
    }
}

/**
 * Handle mouse up event
 * @param {MouseEvent} e - Mouse event
 * @param {Object} appContext - Application context
 */
function handleMouseUp(e, appContext) {
    // Only consider it a click if the mouse hasn't moved beyond the threshold
    // and the drag duration was short
    const dragDuration = Date.now() - dragStartTime;

    if (dragging && !mouseHasMoved && dragDuration < CLICK_TIMEOUT) {
        // This was a legitimate click (not a drag)
        handleGlobeClick(e, appContext);
    } else if (useInertia && (Math.abs(rotationVelocity.x) > 0.001 || Math.abs(rotationVelocity.y) > 0.001)) {
        // Start inertia if we have significant velocity
        startInertiaAnimation(appContext);
    }

    dragging = false;
    appContext.dragging = false;
    appContext.needsRedraw = true;
}

/**
 * Handle mouse wheel event for zooming
 * @param {WheelEvent} e - Wheel event
 * @param {Object} appContext - Application context
 */
function handleMouseWheel(e, appContext) {
    e.preventDefault();

    // Stop any ongoing inertia when user starts zooming
    stopInertiaAnimation();

    // Determine zoom direction - using the original simple approach
    const zoomDirection = e.deltaY > 0 ? -1 : 1;

    // Apply zoom using the original formula that worked well
    appContext.zoomScale += zoomDirection * ZOOM_SPEED;

    // Enforce zoom limits
    appContext.zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, appContext.zoomScale));

    // Force redraw
    appContext.needsRedraw = true;
}

/**
 * Handle mouse leave event
 * @param {Object} appContext - Application context
 */
function handleMouseLeave(appContext) {
    hideTooltip();
    appContext.hoveredFeature = null;

    // Don't cancel dragging on mouse leave - this allows dragging outside the canvas
    // This makes the control feel more natural
}

/**
 * Handle touch start event
 * @param {TouchEvent} e - Touch event
 * @param {Object} appContext - Application context
 */
function handleTouchStart(e, appContext) {
    e.preventDefault();

    // Stop any ongoing inertia animation
    stopInertiaAnimation();

    if (e.touches.length === 1) {
        // Single touch - similar to mousedown
        dragging = true;
        appContext.dragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        dragStartTime = Date.now();
        mouseHasMoved = false;
        appContext.mouseHasMoved = false;

        // Reset velocity when starting new drag
        rotationVelocity = {x: 0, y: 0};
    } else if (e.touches.length === 2) {
        // Two finger touch - prepare for pinch zoom and two-finger rotation
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Calculate center point between the two touches
        lastPinchCenter = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };

        // Calculate initial distance for pinch zoom
        initialPinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        initialZoomScale = appContext.zoomScale;

        // Also handle the angle for rotation
        appContext.initialPinchAngle = Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        );

        // Disable regular dragging
        dragging = false;
    }
}

/**
 * Handle touch move event
 * @param {TouchEvent} e - Touch event
 * @param {Object} appContext - Application context
 */
function handleTouchMove(e, appContext) {
    e.preventDefault();

    if (e.touches.length === 1 && dragging) {
        // Single touch movement - handle rotation
        const deltaX = e.touches[0].clientX - lastX;
        const deltaY = e.touches[0].clientY - lastY;
        const timeElapsed = Date.now() - dragStartTime;

        // Check if touch has moved enough to be considered a drag
        if (Math.abs(deltaX) > DRAG_THRESHOLD || Math.abs(deltaY) > DRAG_THRESHOLD) {
            mouseHasMoved = true;
            appContext.mouseHasMoved = true;
        }

        // Calculate rotation delta with damping for smoother control
        const damping = Math.min(1.0, timeElapsed / 200);
        const rotXDelta = deltaY * 0.01 * damping;
        const rotYDelta = deltaX * 0.01 * damping;

        // Update rotation
        appContext.rotation.y += rotYDelta;
        appContext.rotation.x += rotXDelta;

        // Update velocity for inertia
        rotationVelocity.x = rotationVelocity.x * 0.8 + rotXDelta * 0.2;
        rotationVelocity.y = rotationVelocity.y * 0.8 + rotYDelta * 0.2;

        // Limit rotation velocity
        rotationVelocity.x = Math.max(-MAX_ROTATION_SPEED, Math.min(MAX_ROTATION_SPEED, rotationVelocity.x));
        rotationVelocity.y = Math.max(-MAX_ROTATION_SPEED, Math.min(MAX_ROTATION_SPEED, rotationVelocity.y));

        // Limit vertical rotation to avoid flipping
        appContext.rotation.x = Math.max(-Math.PI / 2 + 0.1,
            Math.min(Math.PI / 2 - 0.1, appContext.rotation.x));

        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;

        appContext.needsRedraw = true;

        // Process hover while dragging
        processPointForHover(e.touches[0].clientX, e.touches[0].clientY, appContext);
    } else if (e.touches.length === 2) {
        // Two finger touch - handle pinch zoom and rotation
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Calculate current center point
        const currentPinchCenter = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };

        // Calculate current distance
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        // Calculate current angle for rotation
        const currentAngle = Math.atan2(
            touch2.clientY - touch1.clientY,
            touch2.clientX - touch1.clientX
        );

        // Calculate zoom factor based on distance change - using direct approach
        const pinchDelta = currentDistance / initialPinchDistance;

        // Apply zoom directly without additional smoothing
        appContext.zoomScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM,
            initialZoomScale * pinchDelta));

        // Handle two-finger rotation (optional - only if initial angle was set)
        if (appContext.initialPinchAngle !== undefined) {
            const rotationDelta = currentAngle - appContext.initialPinchAngle;
            // This rotates around the z-axis (screen normal)
            // We map this to y-axis rotation for the globe
            appContext.rotation.y += rotationDelta * 0.5; // Scale down for smoother control
            appContext.initialPinchAngle = currentAngle; // Update for continuous rotation
        }

        // Update last pinch center
        lastPinchCenter = currentPinchCenter;

        appContext.needsRedraw = true;
    }
}

/**
 * Handle touch end event
 * @param {TouchEvent} e - Touch event
 * @param {Object} appContext - Application context
 */
function handleTouchEnd(e, appContext) {
    e.preventDefault();

    if (dragging && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dragDuration = Date.now() - dragStartTime;

        // If touch didn't move much and was brief, treat it as a tap (click)
        if (!mouseHasMoved && dragDuration < CLICK_TIMEOUT) {
            handleGlobeClick({
                clientX: touch.clientX,
                clientY: touch.clientY
            }, appContext);
        } else if (useInertia && (Math.abs(rotationVelocity.x) > 0.001 || Math.abs(rotationVelocity.y) > 0.001)) {
            // Start inertia if we have velocity
            startInertiaAnimation(appContext);
        }
    }

    // Reset states
    dragging = false;
    appContext.dragging = false;
    appContext.initialPinchDistance = 0;
    appContext.initialPinchAngle = undefined;

    appContext.needsRedraw = true;
}

/**
 * Start inertia animation for smooth rotation after drag
 * @param {Object} appContext - Application context
 */
function startInertiaAnimation(appContext) {
    // Cancel any existing animation
    stopInertiaAnimation();

    // Function to update rotation with inertia
    function applyInertia() {
        // Apply velocity with decay
        appContext.rotation.x += rotationVelocity.x;
        appContext.rotation.y += rotationVelocity.y;

        // Limit vertical rotation to avoid flipping
        appContext.rotation.x = Math.max(-Math.PI / 2 + 0.1,
            Math.min(Math.PI / 2 - 0.1, appContext.rotation.x));

        // Apply decay to velocity
        rotationVelocity.x *= ROTATION_INERTIA;
        rotationVelocity.y *= ROTATION_INERTIA;

        // Stop when velocity becomes very small
        if (Math.abs(rotationVelocity.x) < 0.0001 && Math.abs(rotationVelocity.y) < 0.0001) {
            stopInertiaAnimation();
            return;
        }

        appContext.needsRedraw = true;
        inertiaAnimationId = requestAnimationFrame(() => applyInertia());
    }

    inertiaAnimationId = requestAnimationFrame(applyInertia);
}

/**
 * Stop inertia animation
 */
function stopInertiaAnimation() {
    if (inertiaAnimationId !== null) {
        cancelAnimationFrame(inertiaAnimationId);
        inertiaAnimationId = null;
    }
}

/**
 * Handle window resize event
 * @param {Object} appContext - Application context
 */
function handleWindowResize(appContext) {
    const {canvas} = appContext;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    appContext.centerX = canvas.width / 2;
    appContext.centerY = canvas.height / 2;
    appContext.needsRedraw = true;
}

/**
 * Set up exit button handler
 * @param {Object} appContext - Application context
 */
function setupExitButtonHandler(appContext) {
    const exitButton = document.getElementById('exit-button');
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            // Stop any ongoing inertia animation
            stopInertiaAnimation();

            // Check if any game is active and quit it
            if (appContext.gameActive) {
                appContext.quitGame();
            }

            if (appContext.quizActive) {
                appContext.quitQuizGame();
            }

            // Show the game selector
            const gameSelector = document.getElementById('arcade-game-selector');
            if (gameSelector) {
                gameSelector.style.display = 'flex';
                setTimeout(() => {
                    gameSelector.style.opacity = '1';
                }, 10);
            }

            // Hide the exit button
            exitButton.style.display = 'none';
        });
    }
}

/**
 * Process point for hover effects
 * @param {number} clientX - Client X coordinate
 * @param {number} clientY - Client Y coordinate
 * @param {Object} appContext - Application context
 * @returns {boolean} Whether the hover state changed
 */
function processPointForHover(clientX, clientY, appContext) {
    const {canvas, worldData} = appContext;
    if (!worldData) return false;

    const oldHoveredFeature = appContext.hoveredFeature;

    const rect = canvas.getBoundingClientRect();
    const pointX = clientX - rect.left;
    const pointY = clientY - rect.top;

    // Reset hovered feature
    appContext.hoveredFeature = null;

    // First, check if the point is within the globe circle, adjusted for zoom
    const adjustedRadius = 240 * appContext.zoomScale; // EARTH_RADIUS * zoomScale
    const distFromCenter = Math.sqrt(
        Math.pow(pointX - appContext.centerX, 2) +
        Math.pow(pointY - appContext.centerY, 2)
    );

    if (distFromCenter > adjustedRadius) {
        hideTooltip();
        return oldHoveredFeature !== null;
    }

    // Convert point position to 3D point on the sphere
    const point3D = screenTo3D(pointX, pointY, appContext);
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
            appContext.hoveredFeature = feature;

            // Get property names based on GeoJSON structure
            const name = feature.properties.name || feature.properties.NAME || "Unknown";
            const code = feature.properties.code || feature.properties.ISO_A3 || "Unknown";

            // Show tooltip with country info
            showTooltip({
                content: `<b>${name} (${code})</b>`,
                x: clientX,
                y: clientY
            });

            return oldHoveredFeature !== appContext.hoveredFeature;
        }
    }

    // If we get here, no feature was found under the pointer
    hideTooltip();

    return oldHoveredFeature !== null;
}

/**
 * Handle a click on the globe
 * @param {MouseEvent} e - Mouse event
 * @param {Object} appContext - Application context
 */
function handleGlobeClick(e, appContext) {
    const {worldData} = appContext;
    if (!worldData) return;

    const rect = appContext.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // First, check if the click is within the globe circle, adjusted for zoom
    const adjustedRadius = 240 * appContext.zoomScale; // EARTH_RADIUS * zoomScale
    const distFromCenter = Math.sqrt(
        Math.pow(clickX - appContext.centerX, 2) +
        Math.pow(clickY - appContext.centerY, 2)
    );

    if (distFromCenter > adjustedRadius) {
        return;
    }

    // Convert mouse position to 3D point on the sphere
    const point3D = screenTo3D(clickX, clickY, appContext);
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
            appContext.lastClickedLocation = location;
            appContext.hoveredFeature = feature;

            // Handle game-specific logic through event system
            if (appContext.gameActive && appContext.onCountrySelected) {
                appContext.onCountrySelected(feature);
            } else if (appContext.quizActive && appContext.onQuizCountrySelected) {
                appContext.onQuizCountrySelected(feature);
            } else {
                // Otherwise, just send the location to Devvit
                if (appContext.onLocationClicked) {
                    appContext.onLocationClicked(location);
                }
            }

            appContext.needsRedraw = true;

            return; // Exit once we find the feature under the click
        }
    }
}

/**
 * Convert screen coordinates to 3D point on unit sphere
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {Object} appContext - Application context
 * @returns {Object|null} 3D point or null if outside sphere
 */
function screenTo3D(screenX, screenY, appContext) {
    const {centerX, centerY, zoomScale} = appContext;

    // Vector from center to mouse point, adjusted for zoom
    const x = (screenX - centerX) / zoomScale;
    const y = -(screenY - centerY) / zoomScale; // Flip Y for 3D coordinates

    // Distance from center
    const distSq = x * x + y * y;

    // If outside the sphere projection, return null
    if (distSq > 240 * 240) { // EARTH_RADIUS * EARTH_RADIUS
        return null;
    }

    // Calculate z using the sphere equation x² + y² + z² = r²
    const z = Math.sqrt(240 * 240 - distSq); // EARTH_RADIUS * EARTH_RADIUS

    // Apply inverse rotation to get the point in the original coordinate system
    return inverseRotatePoint(x, y, z, appContext.rotation);
}

/**
 * Convert 3D cartesian coordinates to lat/lng
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @returns {Object|null} Lat/lng coordinates or null if invalid
 */
function cartesianToLatLng(x, y, z) {
    const r = Math.sqrt(x * x + y * y + z * z);

    if (r === 0) return null;

    // Normalize to unit sphere
    x /= r;
    y /= r;
    z /= r;

    const lat = Math.asin(y) * 180 / Math.PI;
    const lng = Math.atan2(x, z) * 180 / Math.PI;

    return {lat, lng};
}

/**
 * Inverse rotation to get original coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {Object} rotation - Rotation angles {x, y}
 * @returns {Object} Original 3D point
 */
function inverseRotatePoint(x, y, z, rotation) {
    // Inverse rotation around Y axis
    let x1 = x * Math.cos(-rotation.y) + z * Math.sin(-rotation.y);
    let z1 = -x * Math.sin(-rotation.y) + z * Math.cos(-rotation.y);

    // Inverse rotation around X axis
    let y2 = y * Math.cos(-rotation.x) - z1 * Math.sin(-rotation.x);
    let z2 = y * Math.sin(-rotation.x) + z1 * Math.cos(-rotation.x);

    return {x: x1, y: y2, z: z2};
}

/**
 * Format large numbers with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "N/A";
}

/**
 * Check if a point is inside a feature (country)
 * @param {Object} point - Point coordinates {lat, lng}
 * @param {Object} feature - GeoJSON feature
 * @returns {boolean} True if point is inside feature
 */
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

/**
 * Check if a point is inside a polygon
 * @param {Object} point - Point coordinates {lat, lng}
 * @param {Array} polygon - Polygon coordinates
 * @returns {boolean} True if point is inside polygon
 */
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