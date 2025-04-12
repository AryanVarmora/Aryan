/**
 * math.js - Math Utilities
 * 3D Portfolio Carousel
 * 
 * This file contains math utility functions for 3D transformations,
 * animations, and other calculations needed for the portfolio carousel.
 */

import * as THREE from 'three';

/**
 * Convert degrees to radians
 * 
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * 
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Linear interpolation between two values
 * 
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

/**
 * Clamp a value between min and max
 * 
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Map a value from one range to another
 * 
 * @param {number} value - Value to map
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 * @returns {number} Mapped value
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

/**
 * Get a random float between min and max
 * 
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get a random integer between min and max (inclusive)
 * 
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random point on a sphere
 * 
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3} Random point
 */
export function randomPointOnSphere(radius) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
}

/**
 * Get a random point inside a sphere
 * 
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3} Random point
 */
export function randomPointInSphere(radius) {
    const r = radius * Math.cbrt(Math.random());
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
}

/**
 * Calculate the distance between two Vector3 points
 * 
 * @param {THREE.Vector3} point1 - First point
 * @param {THREE.Vector3} point2 - Second point
 * @returns {number} Distance
 */
export function distance(point1, point2) {
    return point1.distanceTo(point2);
}

/**
 * Calculate position on a circular path
 * 
 * @param {number} angle - Angle in radians
 * @param {number} radius - Circle radius
 * @returns {Object} Position {x, z}
 */
export function pointOnCircle(angle, radius) {
    return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius
    };
}

/**
 * Calculate position on an elliptical path
 * 
 * @param {number} angle - Angle in radians
 * @param {number} radiusX - X-axis radius
 * @param {number} radiusZ - Z-axis radius
 * @returns {Object} Position {x, z}
 */
export function pointOnEllipse(angle, radiusX, radiusZ) {
    return {
        x: Math.cos(angle) * radiusX,
        z: Math.sin(angle) * radiusZ
    };
}

/**
 * Calculate angle between two points in the XZ plane (from p1 to p2)
 * 
 * @param {THREE.Vector3 | Object} p1 - First point with x,z coordinates
 * @param {THREE.Vector3 | Object} p2 - Second point with x,z coordinates
 * @returns {number} Angle in radians
 */
export function angleBetweenPointsXZ(p1, p2) {
    return Math.atan2(p2.z - p1.z, p2.x - p1.x);
}

/**
 * Ease-in-out function based on cubic bezier
 * 
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Ease-out function based on cubic bezier
 * 
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
}

/**
 * Ease-in function based on cubic bezier
 * 
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export function easeIn(t) {
    return t * t * t;
}

/**
 * Elastic ease-out function
 * 
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    
    return t === 0
        ? 0
        : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Bounce ease-out function
 * 
 * @param {number} t - Input value (0-1)
 * @returns {number} Eased value
 */
export function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}

/**
 * Calculate position on a Fibonacci sphere
 * Useful for even distribution of points on a sphere surface
 * 
 * @param {number} index - Point index
 * @param {number} total - Total number of points
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3} Point position
 */
export function fibonacciSphere(index, total, radius) {
    const phi = Math.acos(1 - 2 * (index + 0.5) / total);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
    
    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
}

/**
 * Spring physics simulation
 * 
 * @param {number} current - Current value
 * @param {number} target - Target value
 * @param {Object} options - Spring options
 * @returns {number} New value
 */
export function spring(current, target, options = {}) {
    const { velocity = 0, mass = 1, stiffness = 100, damping = 10, dt = 1/60 } = options;
    
    // Calculate spring force
    const springForce = -stiffness * (current - target);
    
    // Calculate damping force
    const dampingForce = -damping * velocity;
    
    // Calculate acceleration
    const acceleration = (springForce + dampingForce) / mass;
    
    // Calculate new velocity
    const newVelocity = velocity + acceleration * dt;
    
    // Calculate new position
    const newPosition = current + newVelocity * dt;
    
    return {
        value: newPosition,
        velocity: newVelocity,
        settled: Math.abs(newPosition - target) < 0.001 && Math.abs(newVelocity) < 0.001
    };
}

/**
 * Calculate Perlin noise value at given coordinates
 * A simple Perlin noise implementation for Three.js
 * 
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 * @returns {number} Noise value (-1 to 1)
 */
export function perlinNoise(x, y, z = 0) {
    // Permutation table
    const permutation = [
        151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
        140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148,
        247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32,
        57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175,
        74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
        60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54,
        65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169,
        200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
        52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212,
        207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213,
        119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104,
        218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
        81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
        184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
        222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];

    // Double permutation to avoid overflow
    const p = new Array(512);
    for (let i = 0; i < 256; i++) {
        p[i] = p[i + 256] = permutation[i];
    }

    // Find unit cube that contains point
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;

    // Get relative xyz coordinates of point within cube
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);

    // Compute fade curves for each of x, y, z
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);

    // Hash coordinates of the 8 cube corners
    const A = p[X] + Y;
    const AA = p[A] + Z;
    const AB = p[A + 1] + Z;
    const B = p[X + 1] + Y;
    const BA = p[B] + Z;
    const BB = p[B + 1] + Z;

    // Add blended results from 8 corners of cube
    return lerp(
        lerp(
            lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
            lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u),
            v
        ),
        lerp(
            lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
            lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u),
            v
        ),
        w
    );

    // Helper functions for Perlin noise
    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function grad(hash, x, y, z) {
        // Convert low 4 bits of hash code into 12 gradient directions
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}

/**
 * Calculate the shortest arc between two angles
 * 
 * @param {number} start - Start angle in radians
 * @param {number} end - End angle in radians
 * @returns {number} Shortest arc in radians
 */
export function shortestArc(start, end) {
    const diff = (end - start) % (Math.PI * 2);
    return diff < -Math.PI ? diff + Math.PI * 2 : diff > Math.PI ? diff - Math.PI * 2 : diff;
}

/**
 * Get the index of the closest point in an array to a target point
 * 
 * @param {THREE.Vector3} target - Target point
 * @param {Array<THREE.Vector3>} points - Array of points
 * @returns {number} Index of closest point
 */
export function getClosestPointIndex(target, points) {
    let minDistance = Infinity;
    let closestIndex = -1;
    
    for (let i = 0; i < points.length; i++) {
        const dist = target.distanceTo(points[i]);
        if (dist < minDistance) {
            minDistance = dist;
            closestIndex = i;
        }
    }
    
    return closestIndex;
}

/**
 * Normalize a value between 0 and 1
 * 
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum of range
 * @param {number} max - Maximum of range
 * @returns {number} Normalized value (0-1)
 */
export function normalize(value, min, max) {
    return (value - min) / (max - min);
}

/**
 * Rotate a point around an axis in 3D space
 * 
 * @param {THREE.Vector3} point - Point to rotate
 * @param {THREE.Vector3} axis - Axis to rotate around (normalized)
 * @param {number} angle - Angle in radians
 * @returns {THREE.Vector3} Rotated point
 */
export function rotatePointAroundAxis(point, axis, angle) {
    // Create rotation quaternion
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(axis, angle);
    
    // Apply rotation to point
    const rotatedPoint = point.clone();
    rotatedPoint.applyQuaternion(q);
    
    return rotatedPoint;
}

/**
 * Generate a smooth step function
 * 
 * @param {number} x - Input value
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @returns {number} Smoothed value
 */
export function smoothstep(x, edge0, edge1) {
    // Scale, bias and saturate x to 0..1 range
    x = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    // Evaluate polynomial
    return x * x * (3 - 2 * x);
}

/**
 * Convert cartesian coordinates to polar coordinates
 * 
 * @param {THREE.Vector3} point - Point in cartesian space
 * @returns {Object} Polar coordinates {radius, theta, phi}
 */
export function cartesianToPolar(point) {
    const radius = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
    const theta = Math.atan2(point.z, point.x);
    const phi = Math.acos(point.y / radius);
    
    return { radius, theta, phi };
}

/**
 * Convert polar coordinates to cartesian coordinates
 * 
 * @param {number} radius - Distance from origin
 * @param {number} theta - Angle in XZ plane (radians)
 * @param {number} phi - Angle from Y axis (radians)
 * @returns {THREE.Vector3} Point in cartesian space
 */
export function polarToCartesian(radius, theta, phi) {
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
}