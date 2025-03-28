/**
 * Plane Animation Module
 * Creates a smooth plane animation between two points on the globe
 */

// Animation state
let animationId = null;
let planeElement = null;
let pathElement = null;
let animationStartTime = 0;
let animationDuration = 3000; // 3 seconds total
let fromLocation = null;
let toLocation = null;
let onAnimationEndCallback = null;

/**
 * Initialize the plane animation component
 * @returns {Object} Animation control object
 */
export function initPlaneAnimation() {
    // Create plane element if it doesn't exist
    if (!planeElement) {
        planeElement = document.createElement('div');
        planeElement.className = 'plane-icon';
        planeElement.innerHTML = '✈️';
        planeElement.style.display = 'none';
        document.body.appendChild(planeElement);
    }

    // Create path element if it doesn't exist
    if (!pathElement) {
        pathElement = document.createElement('div');
        pathElement.className = 'plane-path';
        pathElement.style.display = 'none';
        document.body.appendChild(pathElement);
    }

    // Return controller
    return {
        animate: animatePlane,
        stop: stopAnimation,
        isAnimating: () => animationId !== null
    };
}

/**
 * Animate a plane between two locations
 * @param {Object} appContext - Application context
 * @param {Object} from - Starting location {lat, lng, name}
 * @param {Object} to - Destination location {lat, lng, name}
 * @param {number} [duration=3000] - Animation duration in ms
 * @param {Function} [onEnd] - Callback when animation ends
 */
export function animatePlane(appContext, from, to, duration = 3000, onEnd = null) {
    // Stop any existing animation
    stopAnimation();

    // Store locations
    fromLocation = from;
    toLocation = to;
    animationDuration = duration;
    onAnimationEndCallback = onEnd;

    // Show plane and path
    planeElement.style.display = 'block';
    pathElement.style.display = 'block';

    // Draw the flight path
    drawFlightPath(appContext, from, to);

    // Set initial position
    const fromPoint = projectGlobePoint(appContext, from.lat, from.lng);
    planeElement.style.left = `${fromPoint.x}px`;
    planeElement.style.top = `${fromPoint.y}px`;
    planeElement.style.transform = 'translate(-50%, -50%) rotate(0deg)';

    // Start animation
    animationStartTime = performance.now();
    animationId = requestAnimationFrame((timestamp) => updatePlanePosition(timestamp, appContext));
}

/**
 * Update plane position in the animation frame
 * @param {number} timestamp - Animation timestamp
 * @param {Object} appContext - Application context
 */
function updatePlanePosition(timestamp, appContext) {
    // Calculate progress (0 to 1)
    const elapsed = timestamp - animationStartTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    // Use easing for smoother animation
    const easedProgress = easeInOutCubic(progress);

    // Interpolate between points using a great circle path
    const currentLat = interpolateLatLng(fromLocation.lat, toLocation.lat, easedProgress);
    const currentLng = interpolateLatLng(fromLocation.lng, toLocation.lng, easedProgress);

    // Project to screen coordinates
    const point = projectGlobePoint(appContext, currentLat, currentLng);

    // Only update if point is visible (z > 0)
    if (point.z > 0) {
        // Calculate rotation angle based on direction
        const angle = calculateHeading(
            fromLocation.lat, fromLocation.lng,
            toLocation.lat, toLocation.lng,
            easedProgress
        );

        // Position the plane
        planeElement.style.left = `${point.x}px`;
        planeElement.style.top = `${point.y}px`;
        planeElement.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

        // Make plane size responsive to zoom level
        const scaleFactor = 1 + (appContext.zoomScale - 1) * 0.5;
        planeElement.style.fontSize = `${Math.max(16, 24 * scaleFactor)}px`;

        // Add animation class for pulsing effect
        if (!planeElement.classList.contains('animated')) {
            planeElement.classList.add('animated');
        }

        // Adjust z-index based on position (make plane appear behind globe when on far side)
        planeElement.style.zIndex = point.z > 0.5 ? '1000' : '5';

        // Adjust opacity based on position (fade when going to back of globe)
        planeElement.style.opacity = Math.max(0.2, point.z);
    }

    // Check if animation is complete
    if (progress < 1) {
        animationId = requestAnimationFrame((ts) => updatePlanePosition(ts, appContext));
    } else {
        // Animation finished
        setTimeout(() => {
            stopAnimation();
            if (onAnimationEndCallback) onAnimationEndCallback();
        }, 500); // Short delay at destination
    }
}

/**
 * Draw the flight path
 * @param {Object} appContext - Application context
 * @param {Object} from - Starting location {lat, lng}
 * @param {Object} to - Destination location {lat, lng}
 */
function drawFlightPath(appContext, from, to) {
    // Create an SVG to draw the path
    pathElement.innerHTML = '';

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.pointerEvents = "none";

    // Create the path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#FFFFFF");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-dasharray", "5,5");
    path.setAttribute("opacity", "0.7");

    // Generate path data
    let pathData = "M ";
    const steps = 30; // Number of steps for the curve

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const lat = interpolateLatLng(from.lat, to.lat, progress);
        const lng = interpolateLatLng(from.lng, to.lng, progress);

        const point = projectGlobePoint(appContext, lat, lng);

        // Only add visible points (z > 0)
        if (point.z > 0) {
            pathData += (i === 0 ? "" : " L ") + point.x + " " + point.y;
        }
    }

    path.setAttribute("d", pathData);
    svg.appendChild(path);
    pathElement.appendChild(svg);
}

/**
 * Stop the current animation and hide elements
 */
function stopAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (planeElement) {
        planeElement.style.display = 'none';
    }

    if (pathElement) {
        pathElement.style.display = 'none';
    }
}

/**
 * Interpolate between two lat/lng values
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} fraction - Progress (0-1)
 * @returns {number} Interpolated value
 */
function interpolateLatLng(start, end, fraction) {
    // Ensure we take the shortest path around the globe
    if (Math.abs(end - start) > 180) {
        if (start < end) {
            start += 360;
        } else {
            end += 360;
        }
    }

    const value = start + (end - start) * fraction;
    return ((value + 180) % 360) - 180; // Normalize to -180 to 180
}

/**
 * Calculate heading angle between two points
 * @param {number} lat1 - Starting latitude
 * @param {number} lng1 - Starting longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lng2 - Destination longitude
 * @param {number} progress - Current animation progress
 * @returns {number} Heading angle in degrees
 */
function calculateHeading(lat1, lng1, lat2, lng2, progress) {
    // For the current position, interpolate between source and destination
    const currentLat = interpolateLatLng(lat1, lat2, progress);
    const currentLng = interpolateLatLng(lng1, lng2, progress);

    // Calculate a point slightly ahead in the journey for direction
    const aheadProgress = Math.min(1, progress + 0.05);
    const aheadLat = interpolateLatLng(lat1, lat2, aheadProgress);
    const aheadLng = interpolateLatLng(lng1, lng2, aheadProgress);

    // Convert to radians
    const currentLatRad = (currentLat * Math.PI) / 180;
    const currentLngRad = (currentLng * Math.PI) / 180;
    const aheadLatRad = (aheadLat * Math.PI) / 180;
    const aheadLngRad = (aheadLng * Math.PI) / 180;

    // Calculate bearing to the ahead point
    const y = Math.sin(aheadLngRad - currentLngRad) * Math.cos(aheadLatRad);
    const x = Math.cos(currentLatRad) * Math.sin(aheadLatRad) -
        Math.sin(currentLatRad) * Math.cos(aheadLatRad) * Math.cos(aheadLngRad - currentLngRad);

    // Get bearing in degrees
    let angle = Math.atan2(y, x) * 180 / Math.PI;

    // Add 90 degrees because the plane emoji naturally points to the right
    angle -= 90;

    return angle;
}

/**
 * Project 3D globe coordinates to 2D screen coordinates
 * Simplified version from globe/renderer.js
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
 * Cubic easing function for smoother animation
 * @param {number} t - Progress (0-1)
 * @returns {number} Eased value
 */
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}