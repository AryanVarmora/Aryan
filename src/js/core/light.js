/**
 * lights.js - Lighting System
 * 3D Portfolio Carousel
 * 
 * This file handles the creation and management of all lights in the scene,
 * creating the dramatic cosmic atmosphere with neon accents.
 */

import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

// Light configuration presets
const LIGHT_PRESETS = {
    cosmic: {
        ambient: {
            color: 0x333366,
            intensity: 0.5
        },
        directional: {
            color: 0xffffff,
            intensity: 1.0,
            position: { x: 10, y: 20, z: 15 },
            castShadow: true
        },
        points: [
            {
                name: 'purpleLight',
                color: 0x9966ff,
                intensity: 1.5,
                position: { x: -15, y: 10, z: -15 },
                distance: 30,
                castShadow: false
            },
            {
                name: 'blueLight',
                color: 0x0099ff,
                intensity: 1.5,
                position: { x: 15, y: 5, z: -15 },
                distance: 30,
                castShadow: false
            },
            {
                name: 'pinkLight',
                color: 0xff3388,
                intensity: 1.2,
                position: { x: 0, y: -5, z: -20 },
                distance: 25,
                castShadow: false
            }
        ],
        spotlights: [
            {
                name: 'projectSpotlight',
                color: 0xccaaff,
                intensity: 2.0,
                position: { x: -12, y: 10, z: 5 },
                target: { x: -12, y: 0, z: 0 },
                angle: Math.PI / 6,
                penumbra: 0.2,
                distance: 30,
                castShadow: true
            },
            {
                name: 'achievementSpotlight',
                color: 0xffcc99,
                intensity: 2.0,
                position: { x: 0, y: 10, z: -12 },
                target: { x: 0, y: 0, z: -12 },
                angle: Math.PI / 6,
                penumbra: 0.2,
                distance: 30,
                castShadow: true
            },
            {
                name: 'skillSpotlight',
                color: 0x99ffee,
                intensity: 2.0,
                position: { x: 12, y: 10, z: 0 },
                target: { x: 12, y: 0, z: 0 },
                angle: Math.PI / 6,
                penumbra: 0.2,
                distance: 30,
                castShadow: true
            },
            {
                name: 'chillSpotlight',
                color: 0x66ccff,
                intensity: 2.0,
                position: { x: 0, y: 10, z: 12 },
                target: { x: 0, y: 0, z: 12 },
                angle: Math.PI / 6,
                penumbra: 0.2,
                distance: 30,
                castShadow: true
            }
        ],
        rectAreas: [
            {
                name: 'carouselGlow',
                color: 0x6633ff,
                intensity: 3.0,
                position: { x: 0, y: -2, z: 0 },
                width: 30,
                height: 2,
                rotation: { x: Math.PI / 2, y: 0, z: 0 }
            }
        ]
    }
};

/**
 * Create all lights for the scene based on preset
 * 
 * @param {THREE.Scene} scene - The scene to add lights to
 * @param {string} preset - Name of lighting preset to use
 * @param {boolean} showHelpers - Whether to show debug helpers
 * @returns {Object} Light controller object
 */
export function createLights(scene, preset = 'cosmic', showHelpers = false) {
    const config = LIGHT_PRESETS[preset];
    if (!config) {
        console.error(`Preset "${preset}" not found, using cosmic preset instead`);
        preset = 'cosmic';
    }
    
    // Collection to store all lights
    const lights = {
        ambient: null,
        directional: null,
        points: {},
        spotlights: {},
        rectAreas: {},
        helpers: []
    };
    
    // Create ambient light
    if (config.ambient) {
        lights.ambient = new THREE.AmbientLight(
            config.ambient.color,
            config.ambient.intensity
        );
        scene.add(lights.ambient);
    }
    
    // Create directional light
    if (config.directional) {
        lights.directional = new THREE.DirectionalLight(
            config.directional.color,
            config.directional.intensity
        );
        
        // Set position
        lights.directional.position.set(
            config.directional.position.x,
            config.directional.position.y,
            config.directional.position.z
        );
        
        // Configure shadows
        if (config.directional.castShadow) {
            lights.directional.castShadow = true;
            
            // Configure shadow properties
            const shadowSize = 30;
            lights.directional.shadow.camera.left = -shadowSize;
            lights.directional.shadow.camera.right = shadowSize;
            lights.directional.shadow.camera.top = shadowSize;
            lights.directional.shadow.camera.bottom = -shadowSize;
            lights.directional.shadow.camera.near = 0.1;
            lights.directional.shadow.camera.far = 100;
            lights.directional.shadow.mapSize.width = 2048;
            lights.directional.shadow.mapSize.height = 2048;
            lights.directional.shadow.bias = -0.0001;
            lights.directional.shadow.normalBias = 0.02;
        }
        
        scene.add(lights.directional);
        
        // Add helper
        if (showHelpers) {
            const helper = new THREE.DirectionalLightHelper(lights.directional, 5);
            scene.add(helper);
            lights.helpers.push(helper);
            
            if (config.directional.castShadow) {
                const shadowHelper = new THREE.CameraHelper(lights.directional.shadow.camera);
                scene.add(shadowHelper);
                lights.helpers.push(shadowHelper);
            }
        }
    }
    
    // Create point lights
    if (config.points) {
        config.points.forEach(pointConfig => {
            const pointLight = new THREE.PointLight(
                pointConfig.color,
                pointConfig.intensity,
                pointConfig.distance
            );
            
            // Set position
            pointLight.position.set(
                pointConfig.position.x,
                pointConfig.position.y,
                pointConfig.position.z
            );
            
            // Configure shadows
            if (pointConfig.castShadow) {
                pointLight.castShadow = true;
                pointLight.shadow.mapSize.width = 1024;
                pointLight.shadow.mapSize.height = 1024;
                pointLight.shadow.bias = -0.0001;
            }
            
            scene.add(pointLight);
            lights.points[pointConfig.name] = pointLight;
            
            // Add helper
            if (showHelpers) {
                const helper = new THREE.PointLightHelper(pointLight, 1);
                scene.add(helper);
                lights.helpers.push(helper);
            }
        });
    }
    
    // Create spotlights
    if (config.spotlights) {
        config.spotlights.forEach(spotConfig => {
            const spotlight = new THREE.SpotLight(
                spotConfig.color,
                spotConfig.intensity,
                spotConfig.distance,
                spotConfig.angle,
                spotConfig.penumbra
            );
            
            // Set position
            spotlight.position.set(
                spotConfig.position.x,
                spotConfig.position.y,
                spotConfig.position.z
            );
            
            // Create and position target
            const target = new THREE.Object3D();
            target.position.set(
                spotConfig.target.x,
                spotConfig.target.y,
                spotConfig.target.z
            );
            scene.add(target);
            spotlight.target = target;
            
            // Configure shadows
            if (spotConfig.castShadow) {
                spotlight.castShadow = true;
                spotlight.shadow.mapSize.width = 1024;
                spotlight.shadow.mapSize.height = 1024;
                spotlight.shadow.camera.near = 0.5;
                spotlight.shadow.camera.far = spotConfig.distance;
                spotlight.shadow.bias = -0.0001;
            }
            
            scene.add(spotlight);
            lights.spotlights[spotConfig.name] = {
                light: spotlight,
                target: target
            };
            
            // Add helper
            if (showHelpers) {
                const helper = new THREE.SpotLightHelper(spotlight);
                scene.add(helper);
                lights.helpers.push(helper);
            }
        });
    }
    
    // Create rect area lights
    if (config.rectAreas) {
        config.rectAreas.forEach(rectConfig => {
            const rectLight = new THREE.RectAreaLight(
                rectConfig.color,
                rectConfig.intensity,
                rectConfig.width,
                rectConfig.height
            );
            
            // Set position
            rectLight.position.set(
                rectConfig.position.x,
                rectConfig.position.y,
                rectConfig.position.z
            );
            
            // Set rotation
            rectLight.rotation.set(
                rectConfig.rotation.x,
                rectConfig.rotation.y,
                rectConfig.rotation.z
            );
            
            scene.add(rectLight);
            lights.rectAreas[rectConfig.name] = rectLight;
            
            // Add helper
            if (showHelpers) {
                const helper = new RectAreaLightHelper(rectLight);
                rectLight.add(helper);
                lights.helpers.push(helper);
            }
        });
    }
    
    // Create light controller
    const lightController = {
        // Get all lights
        getLights: () => lights,
        
        // Get a specific light by type and name
        getLight: (type, name) => {
            if (type === 'ambient') return lights.ambient;
            if (type === 'directional') return lights.directional;
            return lights[type][name];
        },
        
        // Set intensity for all lights by multiplier
        setIntensity: (multiplier) => {
            if (lights.ambient) {
                lights.ambient.intensity = config.ambient.intensity * multiplier;
            }
            
            if (lights.directional) {
                lights.directional.intensity = config.directional.intensity * multiplier;
            }
            
            Object.keys(lights.points).forEach(name => {
                const pointConfig = config.points.find(p => p.name === name);
                lights.points[name].intensity = pointConfig.intensity * multiplier;
            });
            
            Object.keys(lights.spotlights).forEach(name => {
                const spotConfig = config.spotlights.find(p => p.name === name);
                lights.spotlights[name].light.intensity = spotConfig.intensity * multiplier;
            });
            
            Object.keys(lights.rectAreas).forEach(name => {
                const rectConfig = config.rectAreas.find(p => p.name === name);
                lights.rectAreas[name].intensity = rectConfig.intensity * multiplier;
            });
        },
        
        // Toggle helpers visibility
        toggleHelpers: (visible) => {
            lights.helpers.forEach(helper => {
                helper.visible = visible;
            });
        },
        
        // Create animated pulse effect for a light
        pulseLight: (type, name, options = {}) => {
            const defaultOptions = {
                minIntensity: 0.5,
                maxIntensity: 1.5,
                duration: 2,
                easing: 'sine.inOut'
            };
            
            const pulseOptions = { ...defaultOptions, ...options };
            let light;
            
            switch (type) {
                case 'ambient':
                    light = lights.ambient;
                    break;
                case 'directional':
                    light = lights.directional;
                    break;
                case 'point':
                    light = lights.points[name];
                    break;
                case 'spotlight':
                    light = lights.spotlights[name].light;
                    break;
                case 'rectArea':
                    light = lights.rectAreas[name];
                    break;
            }
            
            if (!light) {
                console.warn(`Light ${type} ${name} not found`);
                return null;
            }
            
            // Store original intensity
            const originalIntensity = light.intensity;
            
            // Start pulse animation
            const startTime = Date.now();
            
            // Return animation controller
            return {
                update: () => {
                    const elapsedTime = (Date.now() - startTime) / 1000;
                    const cycle = (Math.sin(elapsedTime * Math.PI / pulseOptions.duration) + 1) / 2;
                    
                    const intensity = pulseOptions.minIntensity + 
                        cycle * (pulseOptions.maxIntensity - pulseOptions.minIntensity);
                        
                    light.intensity = originalIntensity * intensity;
                },
                stop: () => {
                    light.intensity = originalIntensity;
                }
            };
        },
        
        // Animate a spotlight to focus on a position
        focusSpotlight: (name, position, duration = 1) => {
            if (!lights.spotlights[name]) {
                console.warn(`Spotlight ${name} not found`);
                return;
            }
            
            const target = lights.spotlights[name].target;
            const originalPosition = target.position.clone();
            
            // Animation variables
            const startTime = Date.now();
            const endTime = startTime + duration * 1000;
            
            // Return animation controller
            return {
                update: () => {
                    const now = Date.now();
                    
                    if (now >= endTime) {
                        target.position.copy(position);
                        return true; // Animation complete
                    }
                    
                    const progress = (now - startTime) / (endTime - startTime);
                    
                    // Ease function (ease-out cubic)
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    
                    target.position.lerpVectors(
                        originalPosition,
                        position,
                        easeProgress
                    );
                    
                    return false; // Animation in progress
                },
                reset: () => {
                    target.position.copy(originalPosition);
                }
            };
        },
        
        // Cleanup and dispose resources
        dispose: () => {
            // Remove helpers
            lights.helpers.forEach(helper => {
                scene.remove(helper);
                if (helper.dispose) helper.dispose();
            });
            
            // Clear references
            lights.helpers = [];
        }
    };
    
    return lightController;
}

/**
 * Create a neon glow effect for an object
 * 
 * @param {THREE.Object3D} object - The object to add glow to
 * @param {Object} options - Glow options
 * @returns {THREE.Object3D} The glow mesh
 */
export function createNeonGlow(object, options = {}) {
    const defaultOptions = {
        color: 0x9966ff,
        opacity: 0.5,
        size: 0.15,
        intensity: 1.5
    };
    
    const glowOptions = { ...defaultOptions, ...options };
    
    // Create glow material
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: glowOptions.color,
        transparent: true,
        opacity: glowOptions.opacity,
        side: THREE.BackSide
    });
    
    // Clone geometry and scale it slightly larger
    let glowGeometry;
    
    if (object.geometry) {
        // Direct geometry
        glowGeometry = object.geometry.clone();
    } else if (object.children.length > 0) {
        // Find first mesh child with geometry
        const meshChild = object.children.find(child => child.isMesh && child.geometry);
        
        if (meshChild) {
            glowGeometry = meshChild.geometry.clone();
        } else {
            console.warn('No geometry found for glow effect');
            return null;
        }
    } else {
        console.warn('No geometry found for glow effect');
        return null;
    }
    
    // Create glow mesh
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    
    // Scale glow mesh larger than original
    glowMesh.scale.multiplyScalar(1 + glowOptions.size);
    
    // Copy position and rotation
    glowMesh.position.copy(object.position);
    glowMesh.rotation.copy(object.rotation);
    
    // Set renderOrder to ensure it renders behind the original object
    glowMesh.renderOrder = -1;
    
    return glowMesh;
}

/**
 * Create a light animation sequence for the carousel
 * 
 * @param {Object} lightController - The light controller
 * @returns {Object} Animation controller
 */
export function createLightAnimations(lightController) {
    // Store all active animations
    const animations = {
        pulses: {},
        focuses: {}
    };
    
    // Initialize default animations
    const initDefaultAnimations = () => {
        // Add subtle pulse to all point lights
        const lights = lightController.getLights();
        
        Object.keys(lights.points).forEach(name => {
            animations.pulses[name] = lightController.pulseLight('point', name, {
                minIntensity: 0.8,
                maxIntensity: 1.2,
                duration: 3 + Math.random() * 2 // Slightly different timing for each
            });
        });
    };
    
    // Update all active animations
    const updateAnimations = () => {
        // Update pulses
        Object.keys(animations.pulses).forEach(key => {
            animations.pulses[key].update();
        });
        
        // Update focuses
        Object.keys(animations.focuses).forEach(key => {
            const completed = animations.focuses[key].update();
            
            if (completed) {
                delete animations.focuses[key];
            }
        });
    };
    
    // Focus spotlights on section
    const focusOnSection = (sectionName) => {
        // Stop any existing focus animations
        Object.keys(animations.focuses).forEach(key => {
            delete animations.focuses[key];
        });
        
        // Determine target positions based on section
        let positions = {};
        
        switch(sectionName) {
            case 'project-theater':
                positions = {
                    projectSpotlight: new THREE.Vector3(-12, 0, 0),
                    achievementSpotlight: new THREE.Vector3(-8, 0, -8),
                    skillSpotlight: new THREE.Vector3(-8, 0, 8),
                    chillSpotlight: new THREE.Vector3(-16, 0, 0)
                };
                break;
            case 'achievement-shelf':
                positions = {
                    projectSpotlight: new THREE.Vector3(-8, 0, -8),
                    achievementSpotlight: new THREE.Vector3(0, 0, -12),
                    skillSpotlight: new THREE.Vector3(8, 0, -8),
                    chillSpotlight: new THREE.Vector3(0, 0, -16)
                };
                break;
            case 'skill-planet':
                positions = {
                    projectSpotlight: new THREE.Vector3(8, 0, -8),
                    achievementSpotlight: new THREE.Vector3(8, 0, 8),
                    skillSpotlight: new THREE.Vector3(12, 0, 0),
                    chillSpotlight: new THREE.Vector3(16, 0, 0)
                };
                break;
            case 'chill-zone':
                positions = {
                    projectSpotlight: new THREE.Vector3(8, 0, 8),
                    achievementSpotlight: new THREE.Vector3(0, 0, 16),
                    skillSpotlight: new THREE.Vector3(-8, 0, 8),
                    chillSpotlight: new THREE.Vector3(0, 0, 12)
                };
                break;
            default:
                // Reset to original positions from config
                const config = LIGHT_PRESETS.cosmic;
                positions = {
                    projectSpotlight: new THREE.Vector3(
                        config.spotlights[0].target.x,
                        config.spotlights[0].target.y,
                        config.spotlights[0].target.z
                    ),
                    achievementSpotlight: new THREE.Vector3(
                        config.spotlights[1].target.x,
                        config.spotlights[1].target.y,
                        config.spotlights[1].target.z
                    ),
                    skillSpotlight: new THREE.Vector3(
                        config.spotlights[2].target.x,
                        config.spotlights[2].target.y,
                        config.spotlights[2].target.z
                    ),
                    chillSpotlight: new THREE.Vector3(
                        config.spotlights[3].target.x,
                        config.spotlights[3].target.y,
                        config.spotlights[3].target.z
                    )
                };
        }
        
        // Create focus animations
        Object.keys(positions).forEach(name => {
            animations.focuses[name] = lightController.focusSpotlight(
                name,
                positions[name],
                1.5
            );
        });
    };
    
    // Initialize animations
    initDefaultAnimations();
    
    // Return animation controller
    return {
        update: updateAnimations,
        focusOnSection: focusOnSection,
        reset: () => {
            // Stop all pulse animations
            Object.keys(animations.pulses).forEach(key => {
                animations.pulses[key].stop();
                delete animations.pulses[key];
            });
            
            // Stop all focus animations
            Object.keys(animations.focuses).forEach(key => {
                animations.focuses[key].reset();
                delete animations.focuses[key];
            });
            
            // Reinitialize default animations
            initDefaultAnimations();
        }
    };
}
