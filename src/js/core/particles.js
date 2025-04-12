/**
 * particles.js - Cosmic Background Effects
 * 3D Portfolio Carousel
 * 
 * This file handles the creation and animation of particle systems
 * to generate the cosmic background with stars and nebula effects.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

// Configuration presets
const PARTICLE_PRESETS = {
    cosmic: {
        stars: {
            count: 2000,
            size: { min: 0.1, max: 0.5 },
            color: 0xffffff,
            opacity: 0.8,
            distribution: 'sphere',
            radius: 100,
            depth: true
        },
        nebulae: [
            {
                name: 'purpleNebula',
                count: 500,
                size: { min: 0.5, max: 1.5 },
                color: 0xff3388,
                opacity: 0.4,
                position: { x: 30, y: -50, z: 20 },
                radius: 15,
                animation: 'rotate'
            },
            {
                name: 'blueNebula',
                count: 600,
                size: { min: 0.5, max: 1.5 },
                color: 0x3366ff,
                opacity: 0.35,
                position: { x: -40, y: 20, z: -30 },
                radius: 20,
                animation: 'pulse'
            },
            {
                name: 'purplishNebula',
                count: 700,
                size: { min: 0.5, max: 1.5 },
                color: 0x9933ff,
                opacity: 0.3,
                position: { x: 60, y: 10, z: -40 },
                radius: 25,
                animation: 'wave'
            }
        ],
        dustParticles: {
            count: 500,
            size: { min: 0.01, max: 0.05 },
            color: 0xaaaaff,
            opacity: 0.3,
            speed: 0.01,
            radius: 30
        }
    }
};

/**
 * Create a cosmic background with stars and nebula effects
 * 
 * @param {THREE.Scene} scene - The scene to add particles to
 * @param {string} preset - Name of particle preset to use
 * @returns {Object} Particle controller object
 */
export function createCosmicBackground(scene, preset = 'cosmic') {
    const config = PARTICLE_PRESETS[preset];
    if (!config) {
        console.error(`Preset "${preset}" not found, using cosmic preset instead`);
        preset = 'cosmic';
    }
    
    // Collection to store all particle systems
    const particles = {
        stars: null,
        nebulae: {},
        dust: null,
        animations: []
    };
    
    // Create stars
    if (config.stars) {
        particles.stars = createStars(config.stars);
        scene.add(particles.stars);
    }
    
    // Create nebulae
    if (config.nebulae) {
        config.nebulae.forEach(nebulaConfig => {
            const nebula = createNebula(nebulaConfig);
            scene.add(nebula);
            particles.nebulae[nebulaConfig.name] = nebula;
            
            // Setup animations
            if (nebulaConfig.animation) {
                const animation = createNebulaAnimation(nebula, nebulaConfig);
                if (animation) {
                    particles.animations.push(animation);
                }
            }
        });
    }
    
    // Create dust particles
    if (config.dustParticles) {
        particles.dust = createDustParticles(config.dustParticles);
        scene.add(particles.dust);
    }
    
    // Create particle controller
    const particleController = {
        // Get all particle systems
        getParticles: () => particles,
        
        // Update particle animations
        update: (delta) => {
            // Update all animations
            particles.animations.forEach(animation => {
                animation.update(delta);
            });
            
            // Animate dust particles if present
            if (particles.dust && config.dustParticles) {
                animateDustParticles(particles.dust, config.dustParticles, delta);
            }
        },
        
        // Set particle visibility
        setVisibility: (visible) => {
            if (particles.stars) particles.stars.visible = visible;
            
            Object.keys(particles.nebulae).forEach(name => {
                particles.nebulae[name].visible = visible;
            });
            
            if (particles.dust) particles.dust.visible = visible;
        },
        
        // Dispose of particle resources
        dispose: () => {
            // Dispose of stars
            if (particles.stars) {
                scene.remove(particles.stars);
                particles.stars.geometry.dispose();
                if (particles.stars.material.dispose) {
                    particles.stars.material.dispose();
                }
            }
            
            // Dispose of nebulae
            Object.keys(particles.nebulae).forEach(name => {
                scene.remove(particles.nebulae[name]);
                particles.nebulae[name].geometry.dispose();
                if (particles.nebulae[name].material.dispose) {
                    particles.nebulae[name].material.dispose();
                }
                delete particles.nebulae[name];
            });
            
            // Dispose of dust particles
            if (particles.dust) {
                scene.remove(particles.dust);
                particles.dust.geometry.dispose();
                if (particles.dust.material.dispose) {
                    particles.dust.material.dispose();
                }
            }
            
            // Clear animations
            particles.animations.length = 0;
        }
    };
    
    return particleController;
}

/**
 * Create a starfield with distributed stars
 * 
 * @param {Object} config - Star configuration
 * @returns {THREE.Points} Star particles
 */
function createStars(config) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];
    
    // Generate random positions based on distribution type
    for (let i = 0; i < config.count; i++) {
        let x, y, z;
        
        if (config.distribution === 'sphere') {
            // Spherical distribution
            const radius = config.radius * Math.random();
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            x = radius * Math.sin(phi) * Math.cos(theta);
            y = radius * Math.sin(phi) * Math.sin(theta);
            z = radius * Math.cos(phi);
        } else if (config.distribution === 'cube') {
            // Cubic distribution
            x = (Math.random() * 2 - 1) * config.radius;
            y = (Math.random() * 2 - 1) * config.radius;
            z = (Math.random() * 2 - 1) * config.radius;
        } else {
            // Default to disc distribution (flat XZ plane)
            const radius = config.radius * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            
            x = radius * Math.cos(theta);
            y = (Math.random() * 2 - 1) * 10; // Small height variation
            z = radius * Math.sin(theta);
        }
        
        vertices.push(x, y, z);
        
        // Randomize star size
        const size = config.size.min + Math.random() * (config.size.max - config.size.min);
        sizes.push(size);
    }
    
    // Create attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // Create shader material for better star appearance
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(config.color) },
            time: { value: 0.0 }
        },
        vertexShader: `
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = vec3(1.0);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying vec3 vColor;
            void main() {
                float r = 0.0;
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                r = dot(cxy, cxy);
                if (r > 1.0) {
                    discard;
                }
                gl_FragColor = vec4(color * vColor, 1.0 - r);
            }
        `,
        transparent: true,
        depthTest: config.depth,
        depthWrite: config.depth,
        blending: THREE.AdditiveBlending
    });
    
    // Create star particles
    return new THREE.Points(geometry, material);
}

/**
 * Create a nebula cloud with colored particles
 * 
 * @param {Object} config - Nebula configuration
 * @returns {THREE.Points} Nebula particles
 */
function createNebula(config) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];
    const colors = [];
    
    // Base color
    const baseColor = new THREE.Color(config.color);
    
    // Generate particles distributed in a sphere
    for (let i = 0; i < config.count; i++) {
        // Create gaussian distribution for denser core
        const radius = config.radius * Math.pow(Math.random(), 0.5);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Calculate position
        const x = config.position.x + radius * Math.sin(phi) * Math.cos(theta);
        const y = config.position.y + radius * Math.sin(phi) * Math.sin(theta);
        const z = config.position.z + radius * Math.cos(phi);
        
        vertices.push(x, y, z);
        
        // Randomize particle size
        const size = config.size.min + Math.random() * (config.size.max - config.size.min);
        sizes.push(size);
        
        // Slightly vary color for more natural appearance
        const color = baseColor.clone();
        
        // Adjust RGB channels slightly
        color.r += (Math.random() * 0.1 - 0.05);
        color.g += (Math.random() * 0.1 - 0.05);
        color.b += (Math.random() * 0.1 - 0.05);
        
        colors.push(color.r, color.g, color.b);
    }
    
    // Create attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // Store original positions for animations
    geometry.userData.originalPositions = vertices.slice();
    
    // Create shader material for better nebula appearance
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            opacity: { value: config.opacity }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float opacity;
            varying vec3 vColor;
            void main() {
                float r = 0.0;
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                r = dot(cxy, cxy);
                if (r > 1.0) {
                    discard;
                }
                float alpha = (1.0 - r) * opacity;
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    // Create nebula particles
    const nebula = new THREE.Points(geometry, material);
    nebula.name = config.name;
    
    return nebula;
}

/**
 * Create an animation for a nebula based on configuration
 * 
 * @param {THREE.Points} nebula - The nebula to animate
 * @param {Object} config - Nebula configuration
 * @returns {Object} Animation controller
 */
function createNebulaAnimation(nebula, config) {
    // Get animation type
    const animationType = config.animation;
    
    if (animationType === 'rotate') {
        // Rotation animation
        return {
            update: (delta) => {
                nebula.rotation.y += 0.05 * delta;
                nebula.rotation.z += 0.02 * delta;
            }
        };
    } else if (animationType === 'pulse') {
        // Pulsing animation
        const startScale = 1.0;
        let time = Math.random() * Math.PI * 2; // Random start time
        
        return {
            update: (delta) => {
                time += delta * 0.5;
                const scale = startScale + Math.sin(time) * 0.1;
                nebula.scale.set(scale, scale, scale);
                
                // Update shader time uniform
                if (nebula.material.uniforms && nebula.material.uniforms.time) {
                    nebula.material.uniforms.time.value = time;
                }
            }
        };
    } else if (animationType === 'wave') {
        // Wave animation that distorts the nebula
        let time = Math.random() * Math.PI * 2; // Random start time
        const positionAttribute = nebula.geometry.getAttribute('position');
        const originalPositions = nebula.geometry.userData.originalPositions;
        
        return {
            update: (delta) => {
                time += delta * 0.3;
                
                // Update each particle position
                for (let i = 0; i < positionAttribute.count; i++) {
                    const i3 = i * 3;
                    
                    // Get original position
                    const x = originalPositions[i3];
                    const y = originalPositions[i3 + 1];
                    const z = originalPositions[i3 + 2];
                    
                    // Apply wave distortion
                    const distance = Math.sqrt(x * x + y * y + z * z);
                    const wave = Math.sin(distance * 0.2 + time) * 0.5;
                    
                    // Update position with wave offset
                    positionAttribute.setXYZ(
                        i,
                        x + (x / distance) * wave,
                        y + (y / distance) * wave,
                        z + (z / distance) * wave
                    );
                }
                
                positionAttribute.needsUpdate = true;
            }
        };
    }
    
    // No animation
    return null;
}

/**
 * Create small dust particles for ambient motion
 * 
 * @param {Object} config - Dust particle configuration
 * @returns {THREE.Points} Dust particles
 */
function createDustParticles(config) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const sizes = [];
    const velocities = [];
    
    // Generate random positions and velocities
    for (let i = 0; i < config.count; i++) {
        // Random position within radius
        const radius = config.radius * Math.random();
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        vertices.push(x, y, z);
        
        // Random size
        const size = config.size.min + Math.random() * (config.size.max - config.size.min);
        sizes.push(size);
        
        // Random velocity for movement
        const vx = (Math.random() * 2 - 1) * config.speed;
        const vy = (Math.random() * 2 - 1) * config.speed;
        const vz = (Math.random() * 2 - 1) * config.speed;
        
        velocities.push(vx, vy, vz);
    }
    
    // Create attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    // Store velocities for animation
    geometry.userData.velocities = velocities;
    geometry.userData.radius = config.radius;
    
    // Create material
    const material = new THREE.PointsMaterial({
        color: config.color,
        size: config.size.max,
        transparent: true,
        opacity: config.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create dust particles
    return new THREE.Points(geometry, material);
}

/**
 * Animate dust particles with gentle drifting motion
 * 
 * @param {THREE.Points} particles - The dust particles
 * @param {Object} config - Dust configuration
 * @param {number} delta - Time delta
 */
function animateDustParticles(particles, config, delta) {
    const positionAttribute = particles.geometry.getAttribute('position');
    const velocities = particles.geometry.userData.velocities;
    const radius = particles.geometry.userData.radius;
    
    // Update each particle position
    for (let i = 0; i < positionAttribute.count; i++) {
        const i3 = i * 3;
        
        // Get current position
        let x = positionAttribute.getX(i);
        let y = positionAttribute.getY(i);
        let z = positionAttribute.getZ(i);
        
        // Get velocity
        const vx = velocities[i3];
        const vy = velocities[i3 + 1];
        const vz = velocities[i3 + 2];
        
        // Update position
        x += vx * delta * 5;
        y += vy * delta * 5;
        z += vz * delta * 5;
        
        // Check if particle is outside radius
        const distance = Math.sqrt(x * x + y * y + z * z);
        
        if (distance > radius) {
            // Reset to random position within radius
            const newRadius = radius * Math.random() * 0.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            x = newRadius * Math.sin(phi) * Math.cos(theta);
            y = newRadius * Math.sin(phi) * Math.sin(theta);
            z = newRadius * Math.cos(phi);
        }
        
        // Update position
        positionAttribute.setXYZ(i, x, y, z);
    }
    
    positionAttribute.needsUpdate = true;
}

/**
 * Create a special shooting star effect
 * 
 * @param {THREE.Scene} scene - The scene to add the shooting star to
 * @param {Object} options - Shooting star options
 * @returns {Object} Shooting star controller
 */
export function createShootingStar(scene, options = {}) {
    const defaultOptions = {
        color: 0xffffff,
        speed: 0.15,
        maxDistance: 200,
        size: 1.0,
        trailLength: 20
    };
    
    const starOptions = { ...defaultOptions, ...options };
    
    // Create geometry for the shooting star
    const geometry = new THREE.BufferGeometry();
    
    // Create trail points
    const trailPositions = [];
    for (let i = 0; i < starOptions.trailLength; i++) {
        trailPositions.push(0, 0, 0);
    }
    
    // Create attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
    
    // Create material with fading trail
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(starOptions.color) },
            size: { value: starOptions.size }
        },
        vertexShader: `
            attribute float size;
            uniform float size;
            varying float vAlpha;
            void main() {
                // Calculate alpha based on position in trail
                vAlpha = float(${starOptions.trailLength} - gl_VertexID) / float(${starOptions.trailLength});
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z) * vAlpha;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            void main() {
                float r = 0.0;
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                r = dot(cxy, cxy);
                if (r > 1.0) {
                    discard;
                }
                float alpha = (1.0 - r) * vAlpha;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    // Create shooting star
    const shootingStar = new THREE.Points(geometry, material);
    shootingStar.name = 'shootingStar';
    shootingStar.visible = false;
    scene.add(shootingStar);
    
    // Animation state
    let active = false;
    let currentPosition = new THREE.Vector3();
    let targetPosition = new THREE.Vector3();
    let direction = new THREE.Vector3();
    let positionTrail = [];
    
    // Trigger a shooting star
    const trigger = () => {
        if (active) return;
        
        // Generate random start and end positions
        const radius = starOptions.maxDistance;
        const theta1 = Math.random() * Math.PI * 2;
        const theta2 = theta1 + (Math.PI / 2) + (Math.random() * Math.PI);
        
        const startX = radius * Math.cos(theta1);
        const startZ = radius * Math.sin(theta1);
        const startY = 50 + Math.random() * 100;
        
        const endX = radius * Math.cos(theta2);
        const endZ = radius * Math.sin(theta2);
        const endY = -50 - Math.random() * 100;
        
        // Set positions
        currentPosition.set(startX, startY, startZ);
        targetPosition.set(endX, endY, endZ);
        
        // Calculate direction
        direction.subVectors(targetPosition, currentPosition).normalize();
        
        // Reset positions array
        positionTrail = [];
        for (let i = 0; i < starOptions.trailLength; i++) {
            positionTrail.push(currentPosition.clone());
        }
        
        // Activate shooting star
        active = true;
        shootingStar.visible = true;
    };
    
    // Update shooting star position
    const update = (delta) => {
        if (!active) {
            // Random chance to trigger new shooting star
            if (Math.random() < 0.001) {
                trigger();
            }
            return;
        }
        
        // Move current position towards target
        const step = starOptions.speed * delta * 100;
        currentPosition.addScaledVector(direction, step);
        
        // Update trail positions
        positionTrail.shift();
        positionTrail.push(currentPosition.clone());
        
        // Update geometry
        const positionAttribute = shootingStar.geometry.getAttribute('position');
        for (let i = 0; i < positionTrail.length; i++) {
            const pos = positionTrail[i];
            positionAttribute.setXYZ(i, pos.x, pos.y, pos.z);
        }
        positionAttribute.needsUpdate = true;
        
        // Check if shooting star has reached target
        const distanceToTarget = currentPosition.distanceTo(targetPosition);
        if (distanceToTarget < 10) {
            active = false;
            shootingStar.visible = false;
        }
    };
    
    // Return controller
    return {
        update,
        trigger,
        isActive: () => active
    };
}