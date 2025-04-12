/**
 * controls.js - User Input and Interaction System
 * 3D Portfolio Carousel
 * 
 * This file handles user input, carousel rotation, section selection,
 * and other interactive elements of the 3D portfolio.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

// Default control settings
const DEFAULT_SETTINGS = {
    // Carousel rotation
    rotationSpeed: 0.5,
    dampingFactor: 0.92,
    autoRotate: true,
    autoRotateSpeed: 0.2,
    enableRotation: true,
    
    // Section selection
    sectionSelectDistance: 3.0,
    clickDebounceTime: 300,
    
    // Interaction
    enableZoom: true,
    zoomSpeed: 1.0,
    enablePan: false,
    
    // Mobile settings
    touchSensitivity: 1.5,
    doubleTapTime: 300
};

/**
 * Create and configure user interaction controls
 * 
 * @param {Object} scene - The Three.js scene
 * @param {Object} camera - Camera controller
 * @param {Object} renderer - WebGL renderer
 * @param {Object} carousel - Carousel controller
 * @param {Object} options - Control options
 * @returns {Object} Controls controller
 */
export function createControls(scene, camera, renderer, carousel, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_SETTINGS, ...options };
    
    // Input state tracking
    const input = {
        mouse: new THREE.Vector2(),
        mouseDown: false,
        mouseDragging: false,
        touchDown: false,
        touchDragging: false,
        keys: {},
        wheelDelta: 0,
        lastClickTime: 0,
        lastTouchTime: 0,
        lastTap: { x: 0, y: 0, time: 0 },
        touchStartPosition: { x: 0, y: 0 },
        targetRotationX: 0,
        targetRotationY: 0,
        currentRotationX: 0,
        currentRotationY: 0,
        rotationVelocity: 0,
        previousMousePosition: { x: 0, y: 0 },
        isTransitioning: false,
        activeSection: null,
        raycaster: new THREE.Raycaster()
    };
    
    // Audio feedback
    let audioEnabled = false;
    let hoverSound = null;
    let clickSound = null;
    
    // Setup audio if provided
    const setupAudio = (audioContext, audioBuffer) => {
        if (audioContext && audioBuffer) {
            audioEnabled = true;
            
            // Setup hover sound
            hoverSound = audioContext.createBufferSource();
            hoverSound.buffer = audioBuffer.hover;
            hoverSound.connect(audioContext.destination);
            
            // Setup click sound
            clickSound = audioContext.createBufferSource();
            clickSound.buffer = audioBuffer.click;
            clickSound.connect(audioContext.destination);
        }
    };
    
    // Play audio feedback
    const playSound = (type) => {
        if (!audioEnabled) return;
        
        const sound = type === 'hover' ? hoverSound : clickSound;
        if (sound) {
            sound.start();
        }
    };
    
    // Event listeners
    const setupEventListeners = () => {
        // Mouse events
        renderer.domElement.addEventListener('mousedown', onMouseDown);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        renderer.domElement.addEventListener('click', onClick);
        
        // Touch events
        renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
        renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
        renderer.domElement.addEventListener('touchend', onTouchEnd);
        
        // Wheel events
        renderer.domElement.addEventListener('wheel', onWheel);
        
        // Keyboard events
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        
        // Window events
        window.addEventListener('resize', onResize);
    };
    
    // Remove event listeners
    const removeEventListeners = () => {
        // Mouse events
        renderer.domElement.removeEventListener('mousedown', onMouseDown);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        renderer.domElement.removeEventListener('click', onClick);
        
        // Touch events
        renderer.domElement.removeEventListener('touchstart', onTouchStart);
        renderer.domElement.removeEventListener('touchmove', onTouchMove);
        renderer.domElement.removeEventListener('touchend', onTouchEnd);
        
        // Wheel events
        renderer.domElement.removeEventListener('wheel', onWheel);
        
        // Keyboard events
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        
        // Window events
        window.removeEventListener('resize', onResize);
    };
    
    // Mouse event handlers
    const onMouseDown = (event) => {
        event.preventDefault();
        
        input.mouseDown = true;
        input.mouseDragging = false;
        
        input.previousMousePosition.x = event.clientX;
        input.previousMousePosition.y = event.clientY;
    };
    
    const onMouseMove = (event) => {
        event.preventDefault();
        
        // Update mouse position for raycasting
        input.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        input.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Handle dragging for carousel rotation
        if (input.mouseDown && settings.enableRotation && !input.isTransitioning) {
            const deltaX = event.clientX - input.previousMousePosition.x;
            
            // Calculate rotation based on mouse movement
            input.rotationVelocity = deltaX * 0.01 * settings.rotationSpeed;
            
            input.previousMousePosition.x = event.clientX;
            input.previousMousePosition.y = event.clientY;
            
            input.mouseDragging = true;
            
            // Apply rotation to carousel
            if (carousel && carousel.rotate) {
                carousel.rotate(input.rotationVelocity);
            }
        }
        
        // Handle hover interactions
        handleHoverInteraction();
    };
    
    const onMouseUp = (event) => {
        input.mouseDown = false;
    };
    
    const onClick = (event) => {
        event.preventDefault();
        
        // Debounce clicks
        const currentTime = Date.now();
        if (currentTime - input.lastClickTime < settings.clickDebounceTime) {
            return;
        }
        input.lastClickTime = currentTime;
        
        // Ignore click if was dragging
        if (input.mouseDragging) {
            input.mouseDragging = false;
            return;
        }
        
        // Handle section selection
        handleSectionSelection();
    };
    
    // Touch event handlers
    const onTouchStart = (event) => {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            input.touchDown = true;
            input.touchDragging = false;
            
            const touch = event.touches[0];
            input.touchStartPosition.x = touch.clientX;
            input.touchStartPosition.y = touch.clientY;
            input.previousMousePosition.x = touch.clientX;
            input.previousMousePosition.y = touch.clientY;
            
            // Update mouse position for raycasting
            input.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            input.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            // Check for double tap
            const currentTime = Date.now();
            const lastTap = input.lastTap;
            
            if (currentTime - lastTap.time < settings.doubleTapTime && 
                Math.abs(touch.clientX - lastTap.x) < 30 && 
                Math.abs(touch.clientY - lastTap.y) < 30) {
                // Handle double tap (reset to overview)
                if (input.activeSection && camera.resetToOverview) {
                    camera.resetToOverview();
                    input.activeSection = null;
                }
            }
            
            // Store current tap data
            input.lastTap = {
                x: touch.clientX,
                y: touch.clientY,
                time: currentTime
            };
        } else if (event.touches.length === 2) {
            // Handle pinch zoom
            if (settings.enableZoom) {
                // Calculate initial pinch distance
                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                input.initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }
    };
    
    const onTouchMove = (event) => {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            
            // Handle dragging for carousel rotation
            if (input.touchDown && settings.enableRotation && !input.isTransitioning) {
                const deltaX = touch.clientX - input.previousMousePosition.x;
                
                // Calculate rotation based on touch movement
                input.rotationVelocity = deltaX * 0.01 * settings.rotationSpeed * settings.touchSensitivity;
                
                input.previousMousePosition.x = touch.clientX;
                input.previousMousePosition.y = touch.clientY;
                
                input.touchDragging = true;
                
                // Apply rotation to carousel
                if (carousel && carousel.rotate) {
                    carousel.rotate(input.rotationVelocity);
                }
            }
            
            // Update mouse position for raycasting
            input.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            input.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        } else if (event.touches.length === 2 && settings.enableZoom) {
            // Handle pinch zoom
            const dx = event.touches[0].clientX - event.touches[1].clientX;
            const dy = event.touches[0].clientY - event.touches[1].clientY;
            const currentPinchDistance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate zoom factor
            const pinchDelta = (currentPinchDistance - input.initialPinchDistance) * 0.01 * settings.zoomSpeed;
            
            // Apply zoom if camera controls are available
            if (camera.controls && camera.controls.enableZoom) {
                camera.controls.dollyIn(1 - pinchDelta);
                camera.controls.update();
            }
            
            // Update pinch distance
            input.initialPinchDistance = currentPinchDistance;
        }
    };
    
    const onTouchEnd = (event) => {
        input.touchDown = false;
        
        // Process tap if not dragging
        if (!input.touchDragging) {
            handleSectionSelection();
        }
        
        input.touchDragging = false;
    };
    
    // Wheel event handler
    const onWheel = (event) => {
        event.preventDefault();
        
        if (settings.enableZoom && !input.isTransitioning) {
            // Track wheel delta
            input.wheelDelta += event.deltaY;
            
            // Apply zoom if camera controls are available
            if (camera.controls && camera.controls.enableZoom) {
                if (event.deltaY > 0) {
                    camera.controls.dollyIn(1.05);
                } else {
                    camera.controls.dollyOut(1.05);
                }
                camera.controls.update();
            }
        }
    };
    
    // Keyboard event handlers
    const onKeyDown = (event) => {
        input.keys[event.code] = true;
        
        // Handle arrow keys for rotation
        if (!input.isTransitioning) {
            if (event.code === 'ArrowLeft') {
                handleArrowNavigation('left');
            } else if (event.code === 'ArrowRight') {
                handleArrowNavigation('right');
            } else if (event.code === 'Escape') {
                // ESC key returns to overview
                if (input.activeSection && camera.resetToOverview) {
                    camera.resetToOverview();
                    input.activeSection = null;
                }
            } else if (event.code === 'Space') {
                // Space toggles auto-rotation
                settings.autoRotate = !settings.autoRotate;
            }
        }
    };
    
    const onKeyUp = (event) => {
        input.keys[event.code] = false;
    };
    
    // Window resize handler
    const onResize = () => {
        // Update camera aspect ratio
        if (camera.resize) {
            camera.resize(window.innerWidth, window.innerHeight);
        }
    };
    
    // Handle arrow key navigation
    const handleArrowNavigation = (direction) => {
        if (!carousel || !carousel.getRotation) return;
        
        const currentRotation = carousel.getRotation();
        const sectionAngle = Math.PI / 2; // 90 degrees between sections
        
        let targetRotation;
        if (direction === 'left') {
            targetRotation = currentRotation + sectionAngle;
        } else {
            targetRotation = currentRotation - sectionAngle;
        }
        
        // Animate carousel rotation
        if (carousel.rotateTo) {
            carousel.rotateTo(targetRotation);
        }
    };
    
    // Handle hover interactions
    const handleHoverInteraction = () => {
        // Skip if transitioning
        if (input.isTransitioning) return;
        
        // Perform raycasting
        input.raycaster.setFromCamera(input.mouse, camera.camera);
        
        // Get interactive objects from carousel
        const interactiveObjects = carousel.getInteractiveObjects ? 
            carousel.getInteractiveObjects() : [];
            
        // Check for intersections
        const intersects = input.raycaster.intersectObjects(interactiveObjects, true);
        
        if (intersects.length > 0) {
            // Get the first intersected object
            const intersectedObject = intersects[0].object;
            
            // Check if object has hover handler
            if (intersectedObject.userData && intersectedObject.userData.onHover) {
                // Call hover handler
                intersectedObject.userData.onHover(intersectedObject);
                
                // Play hover sound
                playSound('hover');
                
                // Add hover effect
                if (!intersectedObject.userData.isHovered) {
                    intersectedObject.userData.isHovered = true;
                    
                    // Scale up slightly
                    gsap.to(intersectedObject.scale, {
                        x: intersectedObject.userData.originalScale ? 
                            intersectedObject.userData.originalScale.x * 1.1 : 1.1,
                        y: intersectedObject.userData.originalScale ? 
                            intersectedObject.userData.originalScale.y * 1.1 : 1.1,
                        z: intersectedObject.userData.originalScale ? 
                            intersectedObject.userData.originalScale.z * 1.1 : 1.1,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    
                    // Store original scale if not already stored
                    if (!intersectedObject.userData.originalScale) {
                        intersectedObject.userData.originalScale = {
                            x: intersectedObject.scale.x / 1.1,
                            y: intersectedObject.scale.y / 1.1,
                            z: intersectedObject.scale.z / 1.1
                        };
                    }
                }
                
                // Set cursor to pointer
                document.body.style.cursor = 'pointer';
            }
        } else {
            // Reset all hover states
            interactiveObjects.forEach(object => {
                if (object.userData && object.userData.isHovered) {
                    object.userData.isHovered = false;
                    
                    // Reset scale
                    if (object.userData.originalScale) {
                        gsap.to(object.scale, {
                            x: object.userData.originalScale.x,
                            y: object.userData.originalScale.y,
                            z: object.userData.originalScale.z,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }
                }
            });
            
            // Reset cursor
            document.body.style.cursor = 'auto';
        }
    };
    
    // Handle section selection
    const handleSectionSelection = () => {
        // Skip if transitioning
        if (input.isTransitioning) return;
        
        // Perform raycasting
        input.raycaster.setFromCamera(input.mouse, camera.camera);
        
        // Get sections from carousel
        const sections = carousel.getSections ? 
            carousel.getSections() : [];
            
        // Check for intersections
        const intersects = input.raycaster.intersectObjects(sections, true);
        
        if (intersects.length > 0) {
            // Get the first intersected object
            const intersectedObject = intersects[0].object;
            
            // Get section from object
            let sectionName = null;
            let sectionObject = null;
            
            // Traverse up the parent hierarchy to find section
            let currentObject = intersectedObject;
            while (currentObject && !sectionName) {
                if (currentObject.userData && currentObject.userData.section) {
                    sectionName = currentObject.userData.section;
                    sectionObject = currentObject;
                }
                currentObject = currentObject.parent;
            }
            
            // If section found, select it
            if (sectionName) {
                selectSection(sectionName, sectionObject);
                
                // Play click sound
                playSound('click');
            }
        }
    };
    
    // Select a section
    const selectSection = (sectionName, sectionObject) => {
        // Skip if same section already active
        if (input.activeSection === sectionName) return;
        
        console.log(`Selecting section: ${sectionName}`);
        
        // Set transitioning state
        input.isTransitioning = true;
        
        // Transition camera to section
        if (camera.transitionToSection) {
            // Get transition promise
            const transition = camera.transitionToSection(sectionName);
            
            // Reset transitioning state when complete
            if (transition && transition.timeline) {
                transition.timeline.eventCallback('onComplete', () => {
                    input.isTransitioning = false;
                    input.activeSection = sectionName;
                });
            } else {
                // Fallback if no timeline
                setTimeout(() => {
                    input.isTransitioning = false;
                    input.activeSection = sectionName;
                }, 2000);
            }
        }
    };
    
    // Update method called in animation loop
    const update = (deltaTime) => {
        // Skip if transitioning
        if (input.isTransitioning) return;
        
        // Apply auto-rotation if enabled
        if (settings.autoRotate && !input.mouseDown && !input.touchDown && !input.activeSection) {
            // Calculate rotation step
            const autoRotateStep = settings.autoRotateSpeed * deltaTime;
            
            // Apply rotation to carousel
            if (carousel && carousel.rotate) {
                carousel.rotate(autoRotateStep);
            }
        }
        
        // Apply damping to rotation velocity
        input.rotationVelocity *= settings.dampingFactor;
        
        // Apply momentum-based rotation
        if (!input.mouseDown && !input.touchDown && Math.abs(input.rotationVelocity) > 0.0001) {
            // Apply rotation to carousel
            if (carousel && carousel.rotate) {
                carousel.rotate(input.rotationVelocity);
            }
        }
    };
    
    // Initialize control system
    const init = () => {
        // Setup event listeners
        setupEventListeners();
        
        console.log('Controls initialized');
    };
    
    // Create control object
    const controlsController = {
        // Initialize
        init,
        
        // Update loop
        update,
        
        // Get current input state
        getInputState: () => ({ ...input }),
        
        // Select a section programmatically
        selectSection,
        
        // Reset to overview
        resetToOverview: () => {
            if (input.activeSection && camera.resetToOverview) {
                camera.resetToOverview();
                input.activeSection = null;
            }
        },
        
        // Set auto-rotation
        setAutoRotate: (enabled) => {
            settings.autoRotate = enabled;
        },
        
        // Setup audio feedback
        setupAudio,
        
        // Clean up resources
        dispose: () => {
            // Remove event listeners
            removeEventListeners();
        }
    };
    
    // Initialize
    init();
    
    return controlsController;
}