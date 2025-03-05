/**
 * Globe projection module
 * Handles projection calculations for the globe visualization
 */

// Constants
const EARTH_RADIUS = 240;

/**
 * Project 3D globe coordinates to 2D screen coordinates
 * @param {Object} appContext - Application context
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @returns {Object} Projected point {x, y, z}
 */
export function projectGlobePoint(appContext, lat, lng) {
    const {centerX, centerY, rotation, zoomScale} = appContext;

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
export function rotatePoint(x, y, z, rotation) {
    // Rotate around X axis
    const y1 = y * Math.cos(rotation.x) - z * Math.sin(rotation.x);
    const z1 = y * Math.sin(rotation.x) + z * Math.cos(rotation.x);

    // Rotate around Y axis
    const x2 = x * Math.cos(rotation.y) + z1 * Math.sin(rotation.y);
    const z2 = -x * Math.sin(rotation.y) + z1 * Math.cos(rotation.y);

    return {x: x2, y: y1, z: z2};
}

/**
 * Convert screen coordinates to 3D point on unit sphere
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {Object} appContext - Application context
 * @returns {Object|null} 3D point or null if outside sphere
 */
export function screenTo3D(screenX, screenY, appContext) {
    const {centerX, centerY, zoomScale} = appContext;

    // Vector from center to mouse point, adjusted for zoom
    const x = (screenX - centerX) / zoomScale;
    const y = -(screenY - centerY) / zoomScale; // Flip Y for 3D coordinates

    // Distance from center
    const distSq = x * x + y * y;

    // If outside the sphere projection, return null
    if (distSq > EARTH_RADIUS * EARTH_RADIUS) {
        return null;
    }

    // Calculate z using the sphere equation x² + y² + z² = r²
    const z = Math.sqrt(EARTH_RADIUS * EARTH_RADIUS - distSq);

    // Apply inverse rotation to get the point in the original coordinate system
    return inverseRotatePoint(x, y, z, appContext.rotation);
}

/**
 * Inverse rotation to get original coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @param {Object} rotation - Rotation angles {x, y}
 * @returns {Object} Original 3D point
 */
export function inverseRotatePoint(x, y, z, rotation) {
    // Inverse rotation around Y axis
    const x1 = x * Math.cos(-rotation.y) + z * Math.sin(-rotation.y);
    const z1 = -x * Math.sin(-rotation.y) + z * Math.cos(-rotation.y);

    // Inverse rotation around X axis
    const y2 = y * Math.cos(-rotation.x) - z1 * Math.sin(-rotation.x);
    const z2 = y * Math.sin(-rotation.x) + z1 * Math.cos(-rotation.x);

    return {x: x1, y: y2, z: z2};
}

/**
 * Convert 3D cartesian coordinates to lat/lng
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @returns {Object|null} Lat/lng coordinates or null if invalid
 */
export function cartesianToLatLng(x, y, z) {
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
 * Convert lat/lng to 3D cartesian coordinates
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @param {number} [radius=EARTH_RADIUS] - Radius of the sphere
 * @returns {Object} 3D point {x, y, z}
 */
export function latLngToCartesian(lat, lng, radius = EARTH_RADIUS) {
    // Convert to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    // Calculate 3D coordinates
    const x = radius * Math.cos(latRad) * Math.sin(lngRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.cos(lngRad);

    return {x, y, z};
}

/**
 * Calculate great circle distance between two points
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lng1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lng2 - Longitude of second point in degrees
 * @param {number} [radius=6371] - Radius of the Earth in km
 * @returns {number} Distance in kilometers
 */
export function greatCircleDistance(lat1, lng1, lat2, lng2, radius = 6371) {
    // Convert to radians
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lng1Rad = (lng1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lng2Rad = (lng2 * Math.PI) / 180;

    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLng = lng2Rad - lng1Rad;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
}