/**
 * Globe data loading and processing module
 */

/**
 * Load GeoJSON data for the globe
 * @returns {Promise<Object>} - Parsed GeoJSON data
 */
export async function loadGeoJsonData() {
    try {
        const response = await fetch('./assets/data/globe.geojson');

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        return processGeoJsonData(data);
    } catch (error) {
        console.error('Error loading GeoJSON:', error);

        // As a fallback, return a simple demo dataset
        return processGeoJsonData(createFallbackGeoData());
    }
}

/**
 * Process the GeoJSON data
 * @param {Object} data - Raw GeoJSON data
 * @returns {Object} - Processed GeoJSON data
 */
function processGeoJsonData(data) {
    const countryColors = {};

    // Generate random colors for countries
    data.features.forEach(feature => {
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

    // Return processed data with colors
    return {
        geoData: data,
        countryColors: countryColors,
        features: data.features
    };
}

/**
 * Simplify geometry for performance
 * @param {Object} feature - GeoJSON feature
 */
function simplifyGeometry(feature) {
    const MAX_POLYGON_POINTS = 1000;

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

/**
 * Get color for heatmap mode
 * @param {number} value - Normalized value (0-1)
 * @returns {string} - RGB color string
 */
function getHeatmapColor(value) {
    // Color gradient from blue (cold) to red (hot)
    const r = Math.floor(255 * Math.min(1, value * 2));
    const g = Math.floor(255 * Math.min(1, 2 - value * 2));
    const b = Math.floor(255 * (1 - value));

    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Generate random color
 * @returns {string} - Hex color string
 */
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

/**
 * Convert HSL colors to Hex
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color string
 */
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

/**
 * Create fallback GeoJSON data if loading fails
 * @returns {Object} - Simple GeoJSON data
 */
function createFallbackGeoData() {
    return {
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
                    "ISO_A3": "USA",
                    "NAME": "United States",
                    "POP_EST": 331000000,
                    "CONTINENT": "North America"
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-10.0, 35.0], [-10.0, 45.0], [3.0, 45.0],
                        [3.0, 35.0], [-10.0, 35.0]
                    ]]
                },
                "properties": {
                    "ISO_A3": "ESP",
                    "NAME": "Spain",
                    "POP_EST": 47000000,
                    "CONTINENT": "Europe"
                }
            },
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [112.0, 18.0], [112.0, 53.0], [135.0, 53.0],
                        [135.0, 18.0], [112.0, 18.0]
                    ]]
                },
                "properties": {
                    "ISO_A3": "CHN",
                    "NAME": "China",
                    "POP_EST": 1400000000,
                    "CONTINENT": "Asia"
                }
            }
        ]
    };
}