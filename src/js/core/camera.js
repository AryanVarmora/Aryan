/**
 * camera.js - Camera System
 * 3D Portfolio Carousel
 * 
 * This file handles the creation and management of the camera,
 * including transitions, animations, and interactions.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';

// Default camera settings
const DEFAULT_CAMERA_SETTINGS = {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(0, 15, 30),
    lookAt: new THREE.Vector3(0, 0, 0),
    orbitControls: {
        enabled: true,
        enableDamping: true,
        dampingFactor: 0.05,
        rotateSpeed: 0.5,
        minDistance: 15,
        maxDistance: 40,
        minPolarAngle: 0.1,
        maxPolarAngle: Math.PI / 1.5,
        enablePan: false,
        autoRotate: false,
        autoRotateSpeed: 0.5
    }
};

// Camera positions for each section
const SECTION_CAMERA_SETTINGS = {
    overview: {
        position: new THREE.Vector3(0, 15, 30),
        lookAt: new THREE.Vector3(0, 0, 0),
        fov: 75,
        orbitControls: {
            minDistance: 15,
            maxDistance: 40,
            minPolarAngle: 0.1,
            maxPolarAngle: Math.PI / 1.5,
            enablePan: false
        }
    },
    'project-theater': {
        position: new THREE.Vector3(-12, 5, 0),
        lookAt: new THREE.Vector3(-12, 5, -5),
        fov: 60,
        orbitControls: {
            minDistance: 5,
            maxDistance: 15,
            minPolarAngle: 0.3,
            maxPolarAngle: Math.PI / 1.8,
            enablePan: false
        }
    },
    'achievement-shelf': {
        position: new THREE.Vector3(0, 5, -12),
        lookAt: new THREE.Vector3(0, 5, -17),
        fov: 60,
        orbitControls: {
            minDistance: 5,
            maxDistance: 15,
            minPolarAngle: 0.3,
            maxPolarAngle: Math.PI / 1.8,
            enablePan: false
        }
    },
    'skill-planet': {
        position: new THREE.Vector3(12, 5, 0),
        lookAt: new THREE.Vector3(12, 5, -5),
        fov: 60,
        orbitControls: {
            minDistance: 5,
            maxDistance: 15,
            minPolarAngle: 0.3,
            maxPolarAngle: Math.PI / 1.8,
            enablePan: false
        }
    },
    'chill-zone': {
        position: new THREE.Vector3(0, 5, 12),
        lookAt: new THREE.Vector3(0, 5, 7),
        fov: 60,
        orbitControls: {
            minDistance: 5,
            maxDistance: 15,
            minPolarAngle: 0.3,
            maxPolarAngle: Math.PI / 1.8,
            enablePan: false
        }
    }
};

/**
 * Create and configure the camera system
 * 
 * @param {Object} renderer - The WebGL renderer
 * @param {Object} options - Camera options
 * @returns {Object} Camera controller
 */
export function createCameraSystem(renderer, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_CAMERA_SETTINGS };
    
    if (options.fov !== undefined) settings.fov = options.fov;
    if (options.near !== undefined) settings.near = options.near;
    if (options.far !== undefined) settings.far = options.far;
    if (options.position) settings.position.copy(options.position);
    if (options.lookAt) settings.lookAt.copy(options.lookAt);
    if (options.orbitControls) {
        settings.orbitControls = {
            ...settings.orbitControls,
            ...options.orbitControls
        };
    }
    
    // Create perspective camera
    const camera = new THREE.PerspectiveCamera(
        settings.fov,
        window.innerWidth / window.innerHeight,
        settings.near,
        settings.far
    );
    
    // Set initial position
    camera.position.copy(settings.position);
    camera.lookAt(settings.lookAt);
    
    // Create orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    configureOrbitControls(controls, settings.orbitControls);
    
    // Store current camera state
    let currentState = {
        position: camera.position.clone(),
        target: settings.lookAt.clone(),
        fov: settings.fov
    };
    
    // Active transitions
    let activeTransition = null;
    let currentSection = 'overview';
    let isLocked = false;
    
    // Create camera controller
    const cameraController = {
        // Get camera and controls
        camera,
        controls,
        
        // Get current section
        getCurrentSection: () => currentSection,
        
        // Check if camera is transitioning
        isTransitioning: () => activeTransition !== null,
        
        // Check if camera is locked
        isLocked: () => isLocked,
        
        // Lock/unlock camera controls
        setLocked: (locked) => {
            isLocked = locked;
            controls.enabled = !locked;
        },
        
        // Update camera and controls
        update: (deltaTime) => {
            // Update orbital controls if enabled
            if (controls.enabled && !isLocked) {
                controls.update();
            }
            
            // Update active transition
            if (activeTransition) {
                const complete = activeTransition.update(deltaTime);
                
                if (complete) {
                    activeTransition = null;
                }
            }
        },
        
        // Resize handler
        resize: (width, height) => {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        },
        
        // Transition to a specific section
        transitionToSection: (sectionName, duration = 2, easing = 'power2.inOut') => {
            // Get section settings
            const sectionSettings = SECTION_CAMERA_SETTINGS[sectionName];
            
            if (!sectionSettings) {
                console.warn(`Section "${sectionName}" not found, transitioning to overview`);
                return cameraController.transitionToSection('overview', duration, easing);
            }
            
            // Update current section
            currentSection = sectionName;
            
            // Store current camera state
            currentState = {
                position: camera.position.clone(),
                target: controls.target.clone(),
                fov: camera.fov
            };
            
            // Disable controls during transition
            controls.enabled = false;
            
            // Create GSAP timeline for transition
            const timeline = gsap.timeline({
                onComplete: () => {
                    // Re-enable controls with new settings
                    if (sectionSettings.orbitControls) {
                        configureOrbitControls(controls, sectionSettings.orbitControls);
                    }
                    
                    controls.enabled = !isLocked;
                    
                    // Update current state
                    currentState.position.copy(camera.position);
                    currentState.target.copy(controls.target);
                    currentState.fov = camera.fov;
                }
            });
            
            // Add position animation
            timeline.to(camera.position, {
                x: sectionSettings.position.x,
                y: sectionSettings.position.y,
                z: sectionSettings.position.z,
                duration: duration,
                ease: easing
            }, 0);
            
            // Add target animation
            timeline.to(controls.target, {
                x: sectionSettings.lookAt.x,
                y: sectionSettings.lookAt.y,
                z: sectionSettings.lookAt.z,
                duration: duration,
                ease: easing,
                onUpdate: () => {
                    camera.lookAt(controls.target);
                }
            }, 0);
            
            // Add FOV animation if different
            if (sectionSettings.fov && sectionSettings.fov !== camera.fov) {
                timeline.to(camera, {
                    fov: sectionSettings.fov,
                    duration: duration,
                    ease: easing,
                    onUpdate: () => {
                        camera.updateProjectionMatrix();
                    }
                }, 0);
            }
            
            // Create transition object
            activeTransition = {
                timeline: timeline,
                update: () => {
                    // Check if timeline is complete
                    if (timeline.progress() === 1) {
                        return true;
                    }
                    
                    return false;
                }
            };
            
            return activeTransition;
        },
        
        // Reset to overview
        resetToOverview: (duration = 1.5) => {
            return cameraController.transitionToSection('overview', duration);
        },
        
        // Create a custom camera animation
        createAnimation: (targetPosition, targetLookAt, duration = 1, easing = 'power2.inOut') => {
            // Store current camera state
            const startPosition = camera.position.clone();
            const startTarget = controls.target.clone();
            
            // Convert to Vector3 if not already
            const targetPos = targetPosition instanceof THREE.Vector3 ? 
                targetPosition : 
                new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z);
                
            const targetLook = targetLookAt instanceof THREE.Vector3 ? 
                targetLookAt : 
                new THREE.Vector3(targetLookAt.x, targetLookAt.y, targetLookAt.z);
            
            // Disable controls during animation
            controls.enabled = false;
            
            // Create GSAP timeline
            const timeline = gsap.timeline({
                onComplete: () => {
                    // Re-enable controls
                    controls.enabled = !isLocked;
                    
                    // Update current state
                    currentState.position.copy(camera.position);
                    currentState.target.copy(controls.target);
                }
            });
            
            // Add position animation
            timeline.to(camera.position, {
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z,
                duration: duration,
                ease: easing
            }, 0);
            
            // Add target animation
            timeline.to(controls.target, {
                x: targetLook.x,
                y: targetLook.y,
                z: targetLook.z,
                duration: duration,
                ease: easing,
                onUpdate: () => {
                    camera.lookAt(controls.target);
                }
            }, 0);
            
            // Create animation object
            const animation = {
                timeline: timeline,
                update: () => {
                    // Check if timeline is complete
                    if (timeline.progress() === 1) {
                        return true;
                    }
                    
                    return false;
                },
                cancel: () => {
                    // Stop the animation
                    timeline.kill();
                    
                    // Reset to starting state
                    camera.position.copy(startPosition);
                    controls.target.copy(startTarget);
                    camera.lookAt(controls.target);
                    
                    // Re-enable controls
                    controls.enabled = !isLocked;
                }
            };
            
            return animation;
        },
        
        // Shake the camera for effect
        shake: (intensity = 0.2, duration = 0.5) => {
            // Store original position
            const originalPosition = camera.position.clone();
            
            // Create animation
            const startTime = Date.now();
            const endTime = startTime + duration * 1000;
            
            // Create shake animation
            const shakeAnimation = {
                update: () => {
                    const now = Date.now();
                    
                    // Check if animation is complete
                    if (now >= endTime) {
                        // Reset to original position
                        camera.position.copy(originalPosition);
                        return true;
                    }
                    
                    // Calculate progress
                    const progress = (now - startTime) / (endTime - startTime);
                    
                    // Calculate intensity fade-out
                    const currentIntensity = intensity * (1 - progress);
                    
                    // Apply random offset
                    camera.position.x = originalPosition.x + (Math.random() * 2 - 1) * currentIntensity;
                    camera.position.y = originalPosition.y + (Math.random() * 2 - 1) * currentIntensity;
                    camera.position.z = originalPosition.z + (Math.random() * 2 - 1) * currentIntensity;
                    
                    return false;
                }
            };
            
            // Set as active transition
            activeTransition = shakeAnimation;
            
            return shakeAnimation;
        },
        
        // Create a flythrough animation
        createFlythrough: (path, duration = 5, lookAhead = true) => {
            // Ensure path has at least 2 points
            if (!path || path.length < 2) {
                console.error('Flythrough path must have at least 2 points');
                return null;
            }
            
            // Store original position and target
            const originalPosition = camera.position.clone();
            const originalTarget = controls.target.clone();
            
            // Disable controls during animation
            controls.enabled = false;
            
            // Create a curve from the path
            const curve = new THREE.CatmullRomCurve3(
                path.map(point => new THREE.Vector3(point.x, point.y, point.z))
            );
            
            // Points along the curve for lookAt
            const lookAtPoints = [];
            for (let i = 0; i < path.length - 1; i++) {
                lookAtPoints.push(path[i + 1]);
            }
            
            // Add last point's forward direction
            if (path.length >= 2) {
                const lastPoint = path[path.length - 1];
                const secondLastPoint = path[path.length - 2];
                
                const direction = new THREE.Vector3(
                    lastPoint.x - secondLastPoint.x,
                    lastPoint.y - secondLastPoint.y,
                    lastPoint.z - secondLastPoint.z
                ).normalize();
                
                const extraPoint = new THREE.Vector3(
                    lastPoint.x + direction.x * 5,
                    lastPoint.y + direction.y * 5,
                    lastPoint.z + direction.z * 5
                );
                
                lookAtPoints.push(extraPoint);
            }
            
            // Create animation
            const startTime = Date.now();
            const endTime = startTime + duration * 1000;
            
            const flythroughAnimation = {
                update: () => {
                    const now = Date.now();
                    
                    // Check if animation is complete
                    if (now >= endTime) {
                        // Reset controls
                        controls.enabled = !isLocked;
                        
                        // Update current state
                        currentState.position.copy(camera.position);
                        currentState.target.copy(controls.target);
                        
                        return true;
                    }
                    
                    // Calculate progress
                    const progress = (now - startTime) / (endTime - startTime);
                    
                    // Get position on curve
                    const position = curve.getPointAt(Math.min(progress, 1));
                    camera.position.copy(position);
                    
                    // Determine lookAt point
                    if (lookAhead) {
                        // Look ahead on curve
                        const lookAtProgress = Math.min(progress + 0.05, 1);
                        const lookAtPoint = curve.getPointAt(lookAtProgress);
                        controls.target.copy(lookAtPoint);
                    } else {
                        // Interpolate between lookAt points
                        const totalPoints = lookAtPoints.length;
                        const lookAtIndex = Math.min(
                            Math.floor(progress * totalPoints),
                            totalPoints - 1
                        );
                        
                        const lookAtPoint = lookAtPoints[lookAtIndex];
                        controls.target.copy(lookAtPoint);
                    }
                    
                    camera.lookAt(controls.target);
                    
                    return false;
                },
                cancel: () => {
                    // Reset to original state
                    camera.position.copy(originalPosition);
                    controls.target.copy(originalTarget);
                    camera.lookAt(controls.target);
                    
                    // Re-enable controls
                    controls.enabled = !isLocked;
                }
            };
            
            // Set as active transition
            activeTransition = flythroughAnimation;
            
            return flythroughAnimation;
        },
        
        // Orbit around a target point
        orbitAround: (target, distance = 20, speed = 0.5, heightOffset = 5, duration = 10) => {
            // Convert target to Vector3 if needed
            const targetPoint = target instanceof THREE.Vector3 ? 
                target.clone() : 
                new THREE.Vector3(target.x, target.y, target.z);
            
            // Store original position and target
            const originalPosition = camera.position.clone();
            const originalTarget = controls.target.clone();
            
            // Disable controls during animation
            controls.enabled = false;
            
            // Set target
            controls.target.copy(targetPoint);
            
            // Create animation
            const startTime = Date.now();
            const endTime = startTime + duration * 1000;
            let angle = 0;
            
            const orbitAnimation = {
                update: (deltaTime) => {
                    const now = Date.now();
                    
                    // Check if animation is complete
                    if (now >= endTime) {
                        // Reset controls
                        controls.enabled = !isLocked;
                        
                        // Update current state
                        currentState.position.copy(camera.position);
                        currentState.target.copy(controls.target);
                        
                        return true;
                    }
                    
                    // Update angle
                    angle += speed * deltaTime;
                    
                    // Calculate new position
                    const x = targetPoint.x + Math.cos(angle) * distance;
                    const z = targetPoint.z + Math.sin(angle) * distance;
                    const y = targetPoint.y + heightOffset;
                    
                    // Update camera position
                    camera.position.set(x, y, z);
                    camera.lookAt(targetPoint);
                    
                    return false;
                },
                cancel: () => {
                    // Reset to original state
                    camera.position.copy(originalPosition);
                    controls.target.copy(originalTarget);
                    camera.lookAt(controls.target);
                    
                    // Re-enable controls
                    controls.enabled = !isLocked;
                }
            };
            
            // Set as active transition
            activeTransition = orbitAnimation;
            
            return orbitAnimation;
        },
        
        // Cancel any active transition
        cancelTransition: () => {
            if (activeTransition && activeTransition.cancel) {
                activeTransition.cancel();
            }
            
            activeTransition = null;
            
            // Re-enable controls
            controls.enabled = !isLocked;
        }
    };
    
    return cameraController;
}

/**
 * Configure OrbitControls with provided settings
 * 
 * @param {OrbitControls} controls - The controls to configure
 * @param {Object} settings - Settings object
 */
function configureOrbitControls(controls, settings) {
    // Configure based on settings
    if (settings.enableDamping !== undefined) controls.enableDamping = settings.enableDamping;
    if (settings.dampingFactor !== undefined) controls.dampingFactor = settings.dampingFactor;
    if (settings.rotateSpeed !== undefined) controls.rotateSpeed = settings.rotateSpeed;
    if (settings.minDistance !== undefined) controls.minDistance = settings.minDistance;
    if (settings.maxDistance !== undefined) controls.maxDistance = settings.maxDistance;
    if (settings.minPolarAngle !== undefined) controls.minPolarAngle = settings.minPolarAngle;
    if (settings.maxPolarAngle !== undefined) controls.maxPolarAngle = settings.maxPolarAngle;
    if (settings.minAzimuthAngle !== undefined) controls.minAzimuthAngle = settings.minAzimuthAngle;
    if (settings.maxAzimuthAngle !== undefined) controls.maxAzimuthAngle = settings.maxAzimuthAngle;
    if (settings.enablePan !== undefined) controls.enablePan = settings.enablePan;
    if (settings.enableZoom !== undefined) controls.enableZoom = settings.enableZoom;
    if (settings.enableRotate !== undefined) controls.enableRotate = settings.enableRotate;
    if (settings.autoRotate !== undefined) controls.autoRotate = settings.autoRotate;
    if (settings.autoRotateSpeed !== undefined) controls.autoRotateSpeed = settings.autoRotateSpeed;
}