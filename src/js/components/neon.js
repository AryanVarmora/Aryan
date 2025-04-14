/**
 * neon.js - Neon Glow Effects
 * 3D Portfolio Carousel
 * 
 * This file provides utilities for creating neon glow effects
 * for text, objects, and UI elements throughout the portfolio.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Default neon color presets
const NEON_COLORS = {
    purple: 0x9966ff,
    blue: 0x33ccff,
    pink: 0xff3388,
    cyan: 0x00ffee,
    green: 0x33ff99,
    orange: 0xff9933,
    white: 0xffffff
};

// Default neon effect settings
const DEFAULT_NEON_SETTINGS = {
    color: NEON_COLORS.purple,
    intensity: 1.0,
    size: 0.15,
    opacity: 0.7,
    pulsate: false,
    pulsateSpeed: 1.0,
    pulsateMin: 0.7,
    pulsateMax: 1.0
};

/**
 * Create a neon glow effect for a mesh
 * 
 * @param {THREE.Mesh} mesh - The mesh to add glow to
 * @param {Object} options - Glow options
 * @returns {THREE.Mesh} The glow mesh
 */
export function createNeonGlow(mesh, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_NEON_SETTINGS, ...options };
    
    // Check if mesh exists
    if (!mesh) {
        console.error('Cannot create neon glow: Mesh is null or undefined');
        return null;
    }
    
    // Get geometry
    let glowGeometry;
    if (mesh.geometry) {
        glowGeometry = mesh.geometry.clone();
    } else {
        console.error('Cannot create neon glow: Mesh has no geometry');
        return null;
    }
    
    // Create glow material
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: settings.color,
        transparent: true,
        opacity: settings.opacity,
        side: THREE.BackSide
    });
    
    // Create glow mesh
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    
    // Make glow slightly larger than original mesh
    glowMesh.scale.multiplyScalar(1 + settings.size);
    
    // Setup pulsating animation if enabled
    if (settings.pulsate) {
        glowMesh.userData.pulsate = {
            time: Math.random() * Math.PI * 2, // Random start phase
            speed: settings.pulsateSpeed,
            min: settings.pulsateMin,
            max: settings.pulsateMax,
            update: function(delta) {
                this.time += delta * this.speed;
                const pulseFactor = this.min + (Math.sin(this.time) * 0.5 + 0.5) * (this.max - this.min);
                glowMaterial.opacity = settings.opacity * pulseFactor;
            }
        };
    }
    
    return glowMesh;
}

/**
 * Create neon text using a TextGeometry
 * 
 * @param {string} text - The text to display
 * @param {THREE.Font} font - The font to use
 * @param {Object} options - Text and neon options
 * @returns {THREE.Group} Group containing text and glow
 */
export function createNeonText(text, font, options = {}) {
    // Default text options
    const defaultTextOptions = {
        size: 1,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: false
    };
    
    // Merge text options
    const textOptions = { ...defaultTextOptions, ...options.textOptions };
    
    // Merge neon options
    const neonOptions = { ...DEFAULT_NEON_SETTINGS, ...options.neonOptions };
    
    // Check if font is loaded
    if (!font) {
        console.error('Cannot create neon text: Font is null or undefined');
        return null;
    }
    
    // Create text geometry
    const textGeometry = new THREE.TextGeometry(text, {
        font: font,
        size: textOptions.size,
        height: textOptions.height,
        curveSegments: textOptions.curveSegments,
        bevelEnabled: textOptions.bevelEnabled,
        bevelThickness: textOptions.bevelThickness,
        bevelSize: textOptions.bevelSize,
        bevelOffset: textOptions.bevelOffset,
        bevelSegments: textOptions.bevelSegments
    });
    
    // Center text geometry
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
    
    if (options.centerX) {
        textGeometry.translate(-textWidth / 2, 0, 0);
    }
    
    if (options.centerY) {
        textGeometry.translate(0, -textHeight / 2, 0);
    }
    
    // Create text material (emissive for neon effect)
    const textMaterial = new THREE.MeshStandardMaterial({
        color: neonOptions.color,
        emissive: neonOptions.color,
        emissiveIntensity: neonOptions.intensity,
        metalness: 0.8,
        roughness: 0.2
    });
    
    // Create text mesh
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.castShadow = true;
    
    // Create group to hold text and glow
    const textGroup = new THREE.Group();
    textGroup.add(textMesh);
    
    // Create glow effect
    const glowMesh = createNeonGlow(textMesh, neonOptions);
    
    if (glowMesh) {
        textGroup.add(glowMesh);
    }
    
    // Setup update function for animations
    textGroup.userData.update = function(delta) {
        // Update glow pulsation if enabled
        if (glowMesh && glowMesh.userData.pulsate) {
            glowMesh.userData.pulsate.update(delta);
        }
    };
    
    return textGroup;
}

/**
 * Create a neon outline for a shape
 * 
 * @param {THREE.Path} shape - Shape to outline
 * @param {Object} options - Outline options
 * @returns {THREE.Line} Neon outline line
 */
export function createNeonOutline(shape, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_NEON_SETTINGS, ...options };
    
    // Create points from shape
    const points = shape.getPoints();
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create line material
    const material = new THREE.LineBasicMaterial({
        color: settings.color,
        transparent: true,
        opacity: settings.opacity,
        linewidth: 1
    });
    
    // Create line
    const line = new THREE.Line(geometry, material);
    
    // Setup pulsating animation if enabled
    if (settings.pulsate) {
        line.userData.pulsate = {
            time: Math.random() * Math.PI * 2, // Random start phase
            speed: settings.pulsateSpeed,
            min: settings.pulsateMin,
            max: settings.pulsateMax,
            update: function(delta) {
                this.time += delta * this.speed;
                const pulseFactor = this.min + (Math.sin(this.time) * 0.5 + 0.5) * (this.max - this.min);
                material.opacity = settings.opacity * pulseFactor;
            }
        };
    }
    
    return line;
}

/**
 * Create a neon particle system
 * 
 * @param {number} count - Number of particles
 * @param {Object} options - Particle system options
 * @returns {THREE.Points} Particle system
 */
export function createNeonParticles(count, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_NEON_SETTINGS, ...options };
    
    // Default particle options
    const defaultParticleOptions = {
        size: { min: 0.05, max: 0.2 },
        distribution: 'sphere',
        radius: 5,
        speed: 0.2
    };
    
    // Merge particle options
    const particleOptions = { ...defaultParticleOptions, ...options.particleOptions };
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    const colors = [];
    const velocities = [];
    
    // Base color
    const color = new THREE.Color(settings.color);
    
    // Generate particles
    for (let i = 0; i < count; i++) {
        // Generate position based on distribution
        let x, y, z;
        
        if (particleOptions.distribution === 'sphere') {
            // Spherical distribution
            const radius = particleOptions.radius * Math.pow(Math.random(), 1/3);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            x = radius * Math.sin(phi) * Math.cos(theta);
            y = radius * Math.sin(phi) * Math.sin(theta);
            z = radius * Math.cos(phi);
        } else if (particleOptions.distribution === 'disc') {
            // Disc distribution (XZ plane)
            const radius = particleOptions.radius * Math.sqrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            
            x = radius * Math.cos(theta);
            y = (Math.random() * 2 - 1) * particleOptions.thickness || 0.1;
            z = radius * Math.sin(theta);
        } else {
            // Cube distribution
            x = (Math.random() * 2 - 1) * particleOptions.radius;
            y = (Math.random() * 2 - 1) * particleOptions.radius;
            z = (Math.random() * 2 - 1) * particleOptions.radius;
        }
        
        positions.push(x, y, z);
        
        // Random size
        const size = particleOptions.size.min + Math.random() * (particleOptions.size.max - particleOptions.size.min);
        sizes.push(size);
        
        // Slight color variation
        const particleColor = color.clone();
        particleColor.r += (Math.random() * 0.1 - 0.05);
        particleColor.g += (Math.random() * 0.1 - 0.05);
        particleColor.b += (Math.random() * 0.1 - 0.05);
        
        colors.push(particleColor.r, particleColor.g, particleColor.b);
        
        // Random velocity for animation
        const vx = (Math.random() * 2 - 1) * particleOptions.speed;
        const vy = (Math.random() * 2 - 1) * particleOptions.speed;
        const vz = (Math.random() * 2 - 1) * particleOptions.speed;
        
        velocities.push(vx, vy, vz);
    }
    
    // Create attributes
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // Store velocities for animation
    geometry.userData.velocities = velocities;
    geometry.userData.radius = particleOptions.radius;
    
    // Create shader material for particles
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            opacity: { value: settings.opacity }
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
    
    // Create particle system
    const particles = new THREE.Points(geometry, material);
    
    // Setup update function for animation
    particles.userData.update = function(delta) {
        const positionAttribute = geometry.getAttribute('position');
        const velocities = geometry.userData.velocities;
        const radius = geometry.userData.radius;
        
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
            x += vx * delta;
            y += vy * delta;
            z += vz * delta;
            
            // Check if particle is outside radius
            const distance = Math.sqrt(x * x + y * y + z * z);
            
            if (distance > radius) {
                // Reset to random position within radius
                if (particleOptions.distribution === 'sphere') {
                    const newRadius = radius * Math.random() * 0.1;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    
                    x = newRadius * Math.sin(phi) * Math.cos(theta);
                    y = newRadius * Math.sin(phi) * Math.sin(theta);
                    z = newRadius * Math.cos(phi);
                } else {
                    // Just reverse velocity for other distributions
                    velocities[i3] = -vx;
                    velocities[i3 + 1] = -vy;
                    velocities[i3 + 2] = -vz;
                }
            }
            
            // Update position
            positionAttribute.setXYZ(i, x, y, z);
        }
        
        positionAttribute.needsUpdate = true;
        
        // Update time uniform for shader effects
        material.uniforms.time.value += delta;
        
        // Update opacity if pulsating
        if (settings.pulsate) {
            const time = material.uniforms.time.value * settings.pulsateSpeed;
            const pulseFactor = settings.pulsateMin + (Math.sin(time) * 0.5 + 0.5) * (settings.pulsateMax - settings.pulsateMin);
            material.uniforms.opacity.value = settings.opacity * pulseFactor;
        }
    };
    
    return particles;
}

/**
 * Create a neon grid effect
 * 
 * @param {number} width - Grid width
 * @param {number} height - Grid height
 * @param {number} divisions - Number of grid divisions
 * @param {Object} options - Grid options
 * @returns {THREE.Group} Grid group
 */
export function createNeonGrid(width, height, divisions, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_NEON_SETTINGS, ...options };
    
    // Create group to hold grid lines
    const gridGroup = new THREE.Group();
    gridGroup.name = 'neon-grid';
    
    // Create material for grid lines
    const material = new THREE.LineBasicMaterial({
        color: settings.color,
        transparent: true,
        opacity: settings.opacity,
        linewidth: 1
    });
    
    // Calculate spacing
    const xStep = width / divisions;
    const yStep = height / divisions;
    
    // Create horizontal lines
    for (let i = 0; i <= divisions; i++) {
        const y = (i * yStep) - (height / 2);
        
        const points = [
            new THREE.Vector3(-width / 2, y, 0),
            new THREE.Vector3(width / 2, y, 0)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        
        gridGroup.add(line);
    }
    
    // Create vertical lines
    for (let i = 0; i <= divisions; i++) {
        const x = (i * xStep) - (width / 2);
        
        const points = [
            new THREE.Vector3(x, -height / 2, 0),
            new THREE.Vector3(x, height / 2, 0)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        
        gridGroup.add(line);
    }
    
    // Setup pulsating animation if enabled
    if (settings.pulsate) {
        gridGroup.userData.pulsate = {
            time: 0,
            speed: settings.pulsateSpeed,
            min: settings.pulsateMin,
            max: settings.pulsateMax,
            update: function(delta) {
                this.time += delta * this.speed;
                const pulseFactor = this.min + (Math.sin(this.time) * 0.5 + 0.5) * (this.max - this.min);
                material.opacity = settings.opacity * pulseFactor;
            }
        };
        
        // Add update function
        gridGroup.userData.update = function(delta) {
            this.userData.pulsate.update(delta);
        };
    }
    
    return gridGroup;
}

/**
 * Create a custom post-processing shader for global neon bloom effect
 * 
 * @param {EffectComposer} composer - The effect composer
 * @param {Object} options - Bloom options
 */
export function addNeonBloomEffect(composer, options = {}) {
    // Default bloom options
    const defaultBloomOptions = {
        threshold: 0.8,
        strength: 1.5,
        radius: 0.7,
        color: NEON_COLORS.purple
    };
    
    // Merge options
    const bloomOptions = { ...defaultBloomOptions, ...options };
    
    // Create custom neon bloom shader
    const NeonBloomShader = {
        uniforms: {
            "tDiffuse": { value: null },
            "threshold": { value: bloomOptions.threshold },
            "strength": { value: bloomOptions.strength },
            "radius": { value: bloomOptions.radius },
            "bloomColor": { value: new THREE.Color(bloomOptions.color) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float threshold;
            uniform float strength;
            uniform float radius;
            uniform vec3 bloomColor;
            varying vec2 vUv;

            // Gaussian blur function
            vec4 blur(sampler2D image, vec2 uv, float radius) {
                vec4 color = vec4(0.0);
                float total = 0.0;
                
                // Sample 9 neighboring pixels
                for (float x = -1.0; x <= 1.0; x += 1.0) {
                    for (float y = -1.0; y <= 1.0; y += 1.0) {
                        vec2 offset = vec2(x, y) * radius / 300.0;
                        color += texture2D(image, uv + offset);
                        total += 1.0;
                    }
                }
                
                return color / total;
            }

            void main() {
                vec4 texel = texture2D(tDiffuse, vUv);
                
                // Extract bright areas
                float brightness = max(texel.r, max(texel.g, texel.b));
                vec4 brightAreas = vec4(0.0);
                
                if (brightness > threshold) {
                    brightAreas = texel;
                }
                
                // Apply blur to bright areas
                vec4 blurred = blur(tDiffuse, vUv, radius);
                
                // Mix the bloom color into the bright areas
                vec4 bloomEffect = vec4(blurred.rgb * bloomColor, blurred.a) * strength;
                
                // Add bloom to original image
                gl_FragColor = texel + bloomEffect;
            }
        `
    };
    
    // Create shader pass
    const bloomPass = new ShaderPass(NeonBloomShader);
    
    // Add to composer
    composer.addPass(bloomPass);
}

/**
 * Generate random pulsation parameters
 * 
 * @returns {Object} Pulsation parameters
 */
export function generateRandomPulsation() {
    return {
        speed: 0.5 + Math.random() * 1.5,
        min: 0.6 + Math.random() * 0.2,
        max: 0.9 + Math.random() * 0.1
    };
}

/**
 * Get a random neon color
 * 
 * @returns {number} RGB color value
 */
export function getRandomNeonColor() {
    const colors = Object.values(NEON_COLORS);
    return colors[Math.floor(Math.random() * colors.length)];
}

// Export color presets
export { NEON_COLORS };