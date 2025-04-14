/**
 * transition.js - Smooth Transitions
 * 3D Portfolio Carousel
 * 
 * This file handles smooth transitions between sections, camera movements,
 * and visual state changes throughout the portfolio experience.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { optimizeForSection } from './postprocessing.js';

// Default transition settings
const DEFAULT_TRANSITION_SETTINGS = {
    duration: 1.2,
    cameraEase: 'power2.inOut',
    rotationEase: 'power2.inOut',
    colorEase: 'power1.out',
    bloomTransition: true,
    audioTransition: true,
    particleTransition: true
};

// Transition states
const TRANSITION_STATES = {
    IDLE: 'idle',
    ACTIVE: 'active',
    COMPLETING: 'completing'
};

/**
 * Create a transition controller
 * 
 * @param {Object} scene - Scene controller
 * @param {Object} camera - Camera controller
 * @param {Object} carousel - Carousel controller
 * @param {Object} postprocessing - Post-processing controller
 * @param {Object} audio - Audio controller (optional)
 * @param {Object} options - Transition options
 * @returns {Object} Transition controller
 */
export function createTransitionController(scene, camera, carousel, postprocessing, audio = null, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_TRANSITION_SETTINGS, ...options };
    
    // Transition state
    let currentState = TRANSITION_STATES.IDLE;
    let activeTransitions = [];
    let activeTimelines = [];
    let previousSection = null;
    let targetSection = null;
    
    // Create transition controller
    const transitionController = {
        // Get current state
        getState: () => currentState,
        
        // Check if transitions are active
        isTransitioning: () => currentState !== TRANSITION_STATES.IDLE,
        
        // Get previous section
        getPreviousSection: () => previousSection,
        
        // Get target section
        getTargetSection: () => targetSection,
        
        // Transition to a section
        transitionToSection: (sectionName, customOptions = {}) => {
            // Skip if already transitioning
            if (currentState !== TRANSITION_STATES.IDLE) {
                console.warn('Transition already in progress, skipping');
                return null;
            }
            
            // Update state
            currentState = TRANSITION_STATES.ACTIVE;
            previousSection = targetSection;
            targetSection = sectionName;
            
            // Merge custom options with defaults
            const transitionOptions = { ...settings, ...customOptions };
            
            // Create master timeline
            const masterTimeline = gsap.timeline({
                onComplete: () => {
                    currentState = TRANSITION_STATES.IDLE;
                    activeTimelines = [];
                    
                    // Update section-specific settings
                    if (postprocessing && postprocessing.optimizeForSection) {
                        optimizeForSection(postprocessing, sectionName);
                    }
                    
                    console.log(`Transition to ${sectionName} complete`);
                }
            });
            
            // Clear existing animations
            clearActiveTransitions();
            
            // Add camera transition
            const cameraTimeline = createCameraTransition(camera, sectionName, transitionOptions);
            if (cameraTimeline) {
                masterTimeline.add(cameraTimeline, 0);
            }
            
            // Add carousel rotation transition
            const carouselTimeline = createCarouselTransition(carousel, sectionName, transitionOptions);
            if (carouselTimeline) {
                masterTimeline.add(carouselTimeline, 0);
            }
            
            // Add post-processing transition
            if (postprocessing && transitionOptions.bloomTransition) {
                const postTimeline = createPostProcessingTransition(postprocessing, sectionName, transitionOptions);
                if (postTimeline) {
                    masterTimeline.add(postTimeline, 0);
                }
            }
            
            // Add audio transition
            if (audio && transitionOptions.audioTransition) {
                const audioTimeline = createAudioTransition(audio, sectionName, transitionOptions);
                if (audioTimeline) {
                    masterTimeline.add(audioTimeline, 0);
                }
            }
            
            // Store active timeline
            activeTimelines.push(masterTimeline);
            
            return {
                timeline: masterTimeline,
                cancel: () => {
                    masterTimeline.kill();
                    currentState = TRANSITION_STATES.IDLE;
                    activeTimelines = [];
                    console.log('Transition cancelled');
                }
            };
        },
        
        // Create a custom transition
        createCustomTransition: (customOptions = {}) => {
            // Create custom transition timeline
            const customTimeline = gsap.timeline({
                onComplete: () => {
                    // Remove from active timelines
                    const index = activeTimelines.indexOf(customTimeline);
                    if (index > -1) {
                        activeTimelines.splice(index, 1);
                    }
                }
            });
            
            // Add to active timelines
            activeTimelines.push(customTimeline);
            
            return {
                timeline: customTimeline,
                cancel: () => {
                    customTimeline.kill();
                    
                    // Remove from active timelines
                    const index = activeTimelines.indexOf(customTimeline);
                    if (index > -1) {
                        activeTimelines.splice(index, 1);
                    }
                }
            };
        },
        
        // Create a fade transition
        createFadeTransition: (object, fromOpacity, toOpacity, duration, ease = 'power2.inOut') => {
            // Check if object has opacity property
            if (!object.material || object.material.opacity === undefined) {
                console.warn('Object has no opacity property for fade transition');
                return null;
            }
            
            // Create fade timeline
            const fadeTimeline = gsap.timeline();
            
            // Set initial opacity if different from current
            if (fromOpacity !== undefined && object.material.opacity !== fromOpacity) {
                object.material.opacity = fromOpacity;
                
                // Ensure visibility if fading in from 0
                if (fromOpacity === 0 && toOpacity > 0) {
                    object.visible = true;
                }
            }
            
            // Add fade animation
            fadeTimeline.to(object.material, {
                opacity: toOpacity,
                duration: duration,
                ease: ease,
                onComplete: () => {
                    // Hide object if fully transparent
                    if (toOpacity === 0) {
                        object.visible = false;
                    }
                }
            });
            
            // Add to active timelines
            activeTimelines.push(fadeTimeline);
            
            return {
                timeline: fadeTimeline,
                cancel: () => {
                    fadeTimeline.kill();
                    
                    // Remove from active timelines
                    const index = activeTimelines.indexOf(fadeTimeline);
                    if (index > -1) {
                        activeTimelines.splice(index, 1);
                    }
                }
            };
        },
        
        // Create a color transition
        createColorTransition: (material, fromColor, toColor, duration, ease = 'power2.inOut') => {
            // Check if material has color property
            if (!material || !material.color) {
                console.warn('Material has no color property for transition');
                return null;
            }
            
            // Create color timeline
            const colorTimeline = gsap.timeline();
            
            // Set initial color if provided
            if (fromColor) {
                material.color.set(fromColor);
            }
            
            // Store initial emissive color if present
            let emissiveColor = null;
            if (material.emissive) {
                emissiveColor = material.emissive.clone();
            }
            
            // Add color animation
            colorTimeline.to(material.color, {
                r: new THREE.Color(toColor).r,
                g: new THREE.Color(toColor).g,
                b: new THREE.Color(toColor).b,
                duration: duration,
                ease: ease,
                onUpdate: () => {
                    // Update emissive color if present
                    if (material.emissive && emissiveColor) {
                        material.emissive.copy(material.color).multiplyScalar(0.5);
                    }
                }
            });
            
            // Add to active timelines
            activeTimelines.push(colorTimeline);
            
            return {
                timeline: colorTimeline,
                cancel: () => {
                    colorTimeline.kill();
                    
                    // Remove from active timelines
                    const index = activeTimelines.indexOf(colorTimeline);
                    if (index > -1) {
                        activeTimelines.splice(index, 1);
                    }
                }
            };
        },
        
        // Cancel all transitions
        cancelAllTransitions: () => {
            clearActiveTransitions();
            currentState = TRANSITION_STATES.IDLE;
            console.log('All transitions cancelled');
        },
        
        // Create transition back to overview
        transitionToOverview: (customOptions = {}) => {
            return transitionController.transitionToSection('overview', customOptions);
        },
        
        // Update transitions (for partial transitions not using GSAP)
        update: (delta) => {
            // Update active transitions
            for (let i = activeTransitions.length - 1; i >= 0; i--) {
                const transition = activeTransitions[i];
                
                // Call update function
                const complete = transition.update(delta);
                
                // Remove if complete
                if (complete) {
                    activeTransitions.splice(i, 1);
                }
            }
        }
    };
    
    // Helper function to clear active transitions
    function clearActiveTransitions() {
        // Kill all active timelines
        activeTimelines.forEach(timeline => {
            timeline.kill();
        });
        
        activeTimelines = [];
        
        // Clear non-GSAP transitions
        activeTransitions = [];
    }
    
    // Return controller
    return transitionController;
}

/**
 * Create camera transition to a section
 * 
 * @param {Object} camera - Camera controller
 * @param {string} sectionName - Target section
 * @param {Object} options - Transition options
 * @returns {Object} GSAP timeline
 */
function createCameraTransition(camera, sectionName, options) {
    // Check if camera has transitionToSection method
    if (!camera || !camera.transitionToSection) {
        console.warn('Camera controller has no transitionToSection method');
        return null;
    }
    
    // Execute camera transition
    const cameraTransition = camera.transitionToSection(
        sectionName,
        options.duration,
        options.cameraEase
    );
    
    return cameraTransition ? cameraTransition.timeline : null;
}

/**
 * Create carousel rotation transition
 * 
 * @param {Object} carousel - Carousel controller
 * @param {string} sectionName - Target section
 * @param {Object} options - Transition options
 * @returns {Object} GSAP timeline
 */
function createCarouselTransition(carousel, sectionName, options) {
    // Check if carousel has rotateToSection method
    if (!carousel || !carousel.rotateToSection) {
        console.warn('Carousel controller has no rotateToSection method');
        return null;
    }
    
    // Skip rotation if transitioning to overview
    if (sectionName === 'overview') {
        return null;
    }
    
    // Execute carousel transition
    return carousel.rotateToSection(
        sectionName,
        options.duration,
        options.rotationEase
    );
}

/**
 * Create post-processing transition
 * 
 * @param {Object} postprocessing - Post-processing controller
 * @param {string} sectionName - Target section
 * @param {Object} options - Transition options
 * @returns {Object} GSAP timeline
 */
function createPostProcessingTransition(postprocessing, sectionName, options) {
    // Create transition timeline
    const timeline = gsap.timeline();
    
    // Get current bloom strength
    const bloomPass = postprocessing.getPass('bloom');
    if (!bloomPass) return null;
    
    const currentBloom = bloomPass.strength;
    
    // Transition bloom strength
    timeline.to(bloomPass, {
        strength: currentBloom * 1.5, // Peak bloom during transition
        duration: options.duration / 3,
        ease: 'power2.in',
        onComplete: () => {
            // Create section transition effect
            if (postprocessing.createSectionTransition) {
                const transition = postprocessing.createSectionTransition(
                    postprocessing,
                    sectionName === 'overview' ? postprocessing.getPreviousSection() : sectionName,
                    sectionName
                );
                
                // Add to active transitions (for non-GSAP animations)
                if (transition) {
                    activeTransitions.push(transition);
                }
            }
        }
    }).to(bloomPass, {
        strength: currentBloom, // Return to normal
        duration: options.duration / 3 * 2,
        ease: 'power2.out',
        delay: options.duration / 3
    });
    
    return timeline;
}

/**
 * Create audio transition
 * 
 * @param {Object} audio - Audio controller
 * @param {string} sectionName - Target section
 * @param {Object} options - Transition options
 * @returns {Object} GSAP timeline
 */
function createAudioTransition(audio, sectionName, options) {
    // Check if audio controller exists
    if (!audio) return null;
    
    // Create transition timeline
    const timeline = gsap.timeline();
    
    // Check if controller has setSectionAudio method
    if (audio.setSectionAudio) {
        // Set section-specific audio with crossfade
        audio.setSectionAudio(sectionName, options.duration);
    } else if (audio.setFilter) {
        // Apply audio filter transition if available
        const filterValues = {
            overview: { frequency: 20000, Q: 1 },
            'project-theater': { frequency: 8000, Q: 1.5 },
            'achievement-shelf': { frequency: 10000, Q: 1 },
            'skill-planet': { frequency: 12000, Q: 0.8 },
            'chill-zone': { frequency: 15000, Q: 0.5 }
        };
        
        const targetFilter = filterValues[sectionName] || filterValues.overview;
        
        // Create filter transition
        timeline.to(audio.getFilterValues(), {
            frequency: targetFilter.frequency,
            Q: targetFilter.Q,
            duration: options.duration,
            ease: 'power2.inOut',
            onUpdate: () => {
                audio.updateFilter();
            }
        });
    }
    
    // Play transition sound if available
    if (audio.playTransitionSound) {
        audio.playTransitionSound(sectionName);
    }
    
    return timeline;
}

/**
 * Create a parallax transition effect
 * 
 * @param {Array} objects - Array of objects to affect
 * @param {THREE.Vector3} direction - Movement direction
 * @param {Array} depthFactors - Depth factors for parallax (0-1)
 * @param {Object} options - Transition options
 * @returns {Object} Transition controller
 */
export function createParallaxTransition(objects, direction, depthFactors, options = {}) {
    // Default options
    const settings = {
        duration: 1.0,
        distance: 2.0,
        ease: 'power2.inOut',
        stagger: 0.05,
        ...options
    };
    
    // Store original positions
    const originalPositions = objects.map(obj => obj.position.clone());
    
    // Normalize direction
    const moveDirection = direction.clone().normalize();
    
    // Create timeline
    const timeline = gsap.timeline();
    
    // Add parallax animations
    objects.forEach((obj, index) => {
        // Calculate parallax factor (0-1)
        const depthFactor = depthFactors ? depthFactors[index] : 1 - (index / objects.length);
        
        // Calculate target position
        const targetPosition = originalPositions[index].clone().add(
            moveDirection.clone().multiplyScalar(settings.distance * depthFactor)
        );
        
        // Add to timeline
        timeline.to(obj.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: settings.duration,
            ease: settings.ease,
            delay: index * settings.stagger
        }, 0);
    });
    
    // Add return animation
    timeline.to(objects.map(obj => obj.position), {
        x: (i) => originalPositions[i].x,
        y: (i) => originalPositions[i].y,
        z: (i) => originalPositions[i].z,
        duration: settings.duration,
        ease: 'power1.inOut',
        stagger: settings.stagger
    });
    
    return {
        timeline: timeline,
        cancel: () => {
            timeline.kill();
            
            // Reset to original positions
            objects.forEach((obj, index) => {
                obj.position.copy(originalPositions[index]);
            });
        }
    };
}

/**
 * Create a reveal transition for an object
 * 
 * @param {THREE.Object3D} object - Object to reveal
 * @param {Object} options - Reveal options
 * @returns {Object} Transition controller
 */
export function createRevealTransition(object, options = {}) {
    // Default options
    const settings = {
        duration: 1.2,
        delay: 0,
        from: 'bottom', // 'bottom', 'top', 'left', 'right', 'fade'
        distance: 5,
        ease: 'power3.out',
        rotation: true,
        rotationAmount: Math.PI / 4,
        scale: true,
        initialScale: 0.5,
        ...options
    };
    
    // Store original properties
    const originalPosition = object.position.clone();
    const originalRotation = object.rotation.clone();
    const originalScale = object.scale.clone();
    const originalVisibility = object.visible;
    
    // Set initial visibility
    object.visible = true;
    
    // Calculate starting position based on reveal direction
    let startPosition;
    let startRotation;
    
    switch (settings.from) {
        case 'bottom':
            startPosition = originalPosition.clone().add(new THREE.Vector3(0, -settings.distance, 0));
            startRotation = settings.rotation 
                ? new THREE.Euler(originalRotation.x - settings.rotationAmount, originalRotation.y, originalRotation.z)
                : originalRotation.clone();
            break;
        case 'top':
            startPosition = originalPosition.clone().add(new THREE.Vector3(0, settings.distance, 0));
            startRotation = settings.rotation 
                ? new THREE.Euler(originalRotation.x + settings.rotationAmount, originalRotation.y, originalRotation.z)
                : originalRotation.clone();
            break;
        case 'left':
            startPosition = originalPosition.clone().add(new THREE.Vector3(-settings.distance, 0, 0));
            startRotation = settings.rotation 
                ? new THREE.Euler(originalRotation.x, originalRotation.y, originalRotation.z - settings.rotationAmount)
                : originalRotation.clone();
            break;
        case 'right':
            startPosition = originalPosition.clone().add(new THREE.Vector3(settings.distance, 0, 0));
            startRotation = settings.rotation 
                ? new THREE.Euler(originalRotation.x, originalRotation.y, originalRotation.z + settings.rotationAmount)
                : originalRotation.clone();
            break;
        case 'fade':
        default:
            startPosition = originalPosition.clone();
            startRotation = originalRotation.clone();
            
            // Set initial opacity if object has material
            if (object.material && object.material.transparent) {
                object.material.opacity = 0;
            }
            break;
    }
    
    // Set initial position and rotation
    object.position.copy(startPosition);
    object.rotation.copy(startRotation);
    
    // Set initial scale if enabled
    if (settings.scale) {
        object.scale.set(
            originalScale.x * settings.initialScale,
            originalScale.y * settings.initialScale,
            originalScale.z * settings.initialScale
        );
    }
    
    // Create timeline
    const timeline = gsap.timeline({
        delay: settings.delay
    });
    
    // Add position animation
    timeline.to(object.position, {
        x: originalPosition.x,
        y: originalPosition.y,
        z: originalPosition.z,
        duration: settings.duration,
        ease: settings.ease
    }, 0);
    
    // Add rotation animation if enabled
    if (settings.rotation) {
        timeline.to(object.rotation, {
            x: originalRotation.x,
            y: originalRotation.y,
            z: originalRotation.z,
            duration: settings.duration,
            ease: settings.ease
        }, 0);
    }
    
    // Add scale animation if enabled
    if (settings.scale) {
        timeline.to(object.scale, {
            x: originalScale.x,
            y: originalScale.y,
            z: originalScale.z,
            duration: settings.duration,
            ease: settings.ease
        }, 0);
    }
    
    // Add fade animation if applicable
    if (settings.from === 'fade' && object.material && object.material.transparent) {
        timeline.to(object.material, {
            opacity: 1,
            duration: settings.duration,
            ease: settings.ease
        }, 0);
    }
    
    return {
        timeline: timeline,
        cancel: () => {
            timeline.kill();
            
            // Reset to original properties
            object.position.copy(originalPosition);
            object.rotation.copy(originalRotation);
            object.scale.copy(originalScale);
            object.visible = originalVisibility;
            
            // Reset opacity if needed
            if (object.material && object.material.transparent) {
                object.material.opacity = 1;
            }
        }
    };
}

/**
 * Create a sequential reveal transition for multiple objects
 * 
 * @param {Array} objects - Array of objects to reveal
 * @param {Object} options - Reveal options
 * @returns {Object} Transition controller
 */
export function createSequentialReveal(objects, options = {}) {
    // Default options
    const settings = {
        duration: 0.8,
        staggerDelay: 0.15,
        from: 'bottom',
        distance: 3,
        ease: 'back.out(1.2)',
        ...options
    };
    
    // Create master timeline
    const masterTimeline = gsap.timeline();
    
    // Create reveal transitions for each object
    objects.forEach((obj, index) => {
        // Create reveal with staggered delay
        const revealOptions = {
            ...settings,
            delay: index * settings.staggerDelay
        };
        
        const reveal = createRevealTransition(obj, revealOptions);
        
        // Add to master timeline
        masterTimeline.add(reveal.timeline, 0);
    });
    
    return {
        timeline: masterTimeline,
        cancel: () => {
            masterTimeline.kill();
            
            // Reset object positions
            objects.forEach((obj) => {
                // Reset logic would need to be more sophisticated
                // for a real implementation since we don't store
                // original positions here
            });
        }
    };
}

/**
 * Create a camera shake effect
 * 
 * @param {THREE.Camera} camera - Camera to shake
 * @param {Object} options - Shake options
 * @returns {Object} Shake controller
 */
export function createCameraShake(camera, options = {}) {
    // Default options
    const settings = {
        duration: 0.5,
        strength: 0.3,
        decay: true,
        frequency: 20,
        ...options
    };
    
    // Store original camera position
    const originalPosition = camera.position.clone();
    
    // Create timeline
    const timeline = gsap.timeline();
    
    // Setup shake variables
    let time = 0;
    const shakeDuration = settings.duration;
    
    // Create shake animation
    const shakeAnimation = {
        time: 0,
        update: (delta) => {
            time += delta;
            
            // Calculate intensity with decay
            const progress = Math.min(time / shakeDuration, 1.0);
            const intensity = settings.decay 
                ? settings.strength * (1.0 - progress)
                : settings.strength;
            
            // Apply random offset
            const offsetX = (Math.random() * 2 - 1) * intensity;
            const offsetY = (Math.random() * 2 - 1) * intensity;
            const offsetZ = (Math.random() * 2 - 1) * intensity * 0.5;
            
            camera.position.set(
                originalPosition.x + offsetX,
                originalPosition.y + offsetY,
                originalPosition.z + offsetZ
            );
            
            // Check if complete
            if (progress >= 1.0) {
                // Reset to original position
                camera.position.copy(originalPosition);
                return true;
            }
            
            return false;
        },
        reset: () => {
            camera.position.copy(originalPosition);
        }
    };
    
    return shakeAnimation;
}

// Export transition states enum
export { TRANSITION_STATES };