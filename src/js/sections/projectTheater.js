/**
 * projectTheater.js - Project Theater Section
 * 3D Portfolio Carousel
 * 
 * This file implements the interactive Project Theater section,
 * displaying projects in an immersive theater environment.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { createNeonGlow } from './neon.js';
import { createRevealTransition, createSequentialReveal } from './transition.js';

// Default configuration
const DEFAULT_CONFIG = {
    maxProjects: 6,
    transitionDuration: 1.2,
    primaryColor: 0x9966ff,
    secondaryColor: 0xcc99ff,
    screenWidth: 6,
    screenHeight: 4,
    showControls: true
};

/**
 * Create a Project Theater section
 * 
 * @param {Object} options - Configuration options
 * @returns {THREE.Group} Project theater group
 */
export function createProjectTheater(options = {}) {
    // Merge options with defaults
    const config = { ...DEFAULT_CONFIG, ...options };
    
    // Create main group for project theater
    const theaterGroup = new THREE.Group();
    theaterGroup.name = 'project-theater';
    
    // Create base platform
    createTheaterBase(theaterGroup, config);
    
    // Create screen
    const screen = createScreen(theaterGroup, config);
    
    // Create seating and environment
    createTheaterEnvironment(theaterGroup, config);
    
    // Create control panel
    if (config.showControls) {
        createControlPanel(theaterGroup, screen, config);
    }
    
    // Setup project display with available data
    if (options.projectData && options.projectData.length > 0) {
        setupProjectDisplay(screen, options.projectData, config);
    } else {
        // Add placeholder content if no projects provided
        addPlaceholderContent(screen, config);
    }
    
    // Add animations
    addTheaterAnimations(theaterGroup, config);
    
    // Store configuration in userData
    theaterGroup.userData = {
        ...theaterGroup.userData,
        config: config,
        activeProject: 0,
        interactive: true,
        section: 'project-theater'
    };
    
    return theaterGroup;
}

/**
 * Create theater base platform
 * 
 * @param {THREE.Group} group - Parent group
 * @param {Object} config - Configuration options
 */
function createTheaterBase(group, config) {
    // Create the base
    const baseGeometry = new THREE.BoxGeometry(8, 0.5, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: config.primaryColor,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = -0.25;
    baseMesh.receiveShadow = true;
    baseMesh.name = 'theater-base';
    
    group.add(baseMesh);
    
    // Add glow trim
    const trimGeometry = new THREE.BoxGeometry(8.2, 0.1, 8.2);
    const trimMaterial = new THREE.MeshStandardMaterial({
        color: config.secondaryColor,
        emissive: config.secondaryColor,
        emissiveIntensity: 1.0,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const trimMesh = new THREE.Mesh(trimGeometry, trimMaterial);
    trimMesh.position.y = 0.05;
    trimMesh.name = 'theater-trim';
    
    group.add(trimMesh);
    
    // Add floor with grid pattern
    const floorGeometry = new THREE.PlaneGeometry(7.8, 7.8);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x222244,
        metalness: 0.8,
        roughness: 0.3
    });
    
    // Add grid texture or pattern programmatically
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0.01;
    floorMesh.receiveShadow = true;
    floorMesh.name = 'theater-floor';
    
    group.add(floorMesh);
}

/**
 * Create main projection screen
 * 
 * @param {THREE.Group} group - Parent group
 * @param {Object} config - Configuration options
 * @returns {THREE.Mesh} Screen mesh
 */
function createScreen(group, config) {
    // Create screen frame
    const frameGeometry = new THREE.BoxGeometry(
        config.screenWidth + 0.4, 
        config.screenHeight + 0.4, 
        0.1
    );
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: config.primaryColor,
        emissive: config.primaryColor,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.position.set(0, 2.5, -1.1);
    frameMesh.name = 'screen-frame';
    
    group.add(frameMesh);
    
    // Create main screen
    const screenGeometry = new THREE.BoxGeometry(
        config.screenWidth, 
        config.screenHeight, 
        0.2
    );
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x222233,
        emissive: config.primaryColor,
        emissiveIntensity: 0.2,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0, 2.5, -1);
    screenMesh.name = 'project-screen';
    
    // Add neon glow effect to frame
    const screenGlow = createNeonGlow(frameMesh, {
        color: config.primaryColor,
        intensity: 1.0,
        size: 0.1,
        opacity: 0.5
    });
    
    if (screenGlow) {
        screenGlow.name = 'screen-glow';
        group.add(screenGlow);
    }
    
    // Store screen properties
    screenMesh.userData = {
        currentProject: 0,
        navigate: (direction) => {
            // Navigation function will be implemented 
            // when projects are loaded
        }
    };
    
    group.add(screenMesh);
    return screenMesh;
}

/**
 * Create theater environment elements
 * 
 * @param {THREE.Group} group - Parent group
 * @param {Object} config - Configuration options
 */
function createTheaterEnvironment(group, config) {
    // Create seating rows
    const seatingGroup = new THREE.Group();
    seatingGroup.name = 'theater-seating';
    
    // Create three rows of seats
    const rowCount = 3;
    const seatsPerRow = 5;
    const rowSpacing = 1.0;
    const seatSpacing = 0.8;
    
    // Create seats with simple geometries
    for (let row = 0; row < rowCount; row++) {
        // Calculate z position (back rows are higher)
        const zPos = 2 + row * rowSpacing;
        const yOffset = row * 0.2; // Each row is slightly elevated
        
        for (let seat = 0; seat < seatsPerRow; seat++) {
            // Distribute seats evenly
            const totalWidth = (seatsPerRow - 1) * seatSpacing;
            const xPos = (seat * seatSpacing) - (totalWidth / 2);
            
            // Create seat
            const seatGeometry = new THREE.BoxGeometry(0.6, 0.5, 0.6);
            const seatMaterial = new THREE.MeshStandardMaterial({
                color: 0x333355,
                metalness: 0.6,
                roughness: 0.4
            });
            
            const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
            seatMesh.position.set(xPos, 0.25 + yOffset, zPos);
            seatMesh.castShadow = true;
            seatMesh.receiveShadow = true;
            seatMesh.name = `seat-${row}-${seat}`;
            
            seatingGroup.add(seatMesh);
            
            // Create backrest
            const backrestGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.1);
            const backrestMaterial = new THREE.MeshStandardMaterial({
                color: 0x333355,
                metalness: 0.6,
                roughness: 0.4
            });
            
            const backrestMesh = new THREE.Mesh(backrestGeometry, backrestMaterial);
            backrestMesh.position.set(xPos, 0.55 + yOffset, zPos + 0.25);
            backrestMesh.castShadow = true;
            backrestMesh.receiveShadow = true;
            backrestMesh.name = `backrest-${row}-${seat}`;
            
            seatingGroup.add(backrestMesh);
        }
    }
    
    group.add(seatingGroup);
    
    // Add side walls
    const wallGeometry = new THREE.BoxGeometry(0.1, 4, 8);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x222244,
        metalness: 0.7,
        roughness: 0.3
    });
    
    // Left wall
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-4, 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    leftWall.name = 'left-wall';
    
    // Right wall
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(4, 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    rightWall.name = 'right-wall';
    
    group.add(leftWall);
    group.add(rightWall);
    
    // Add spotlights on ceiling
    const spotLightGeometry = new THREE.CylinderGeometry(0.1, 0.2, 0.3, 16);
    const spotLightMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.9,
        roughness: 0.1
    });
    
    // Create a row of spotlights
    for (let i = -2; i <= 2; i++) {
        const spotLightMesh = new THREE.Mesh(spotLightGeometry, spotLightMaterial);
        spotLightMesh.position.set(i * 1.5, 3.9, 0);
        spotLightMesh.rotation.x = Math.PI;
        spotLightMesh.name = `ceiling-spotlight-${i+2}`;
        
        // Create light cone (subtle emissive cone pointing down)
        const lightConeGeometry = new THREE.ConeGeometry(0.15, 0.2, 16, 1, true);
        const lightConeMaterial = new THREE.MeshBasicMaterial({
            color: config.secondaryColor,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        const lightCone = new THREE.Mesh(lightConeGeometry, lightConeMaterial);
        lightCone.position.y = -0.1;
        lightCone.name = `light-cone-${i+2}`;
        
        spotLightMesh.add(lightCone);
        group.add(spotLightMesh);
    }
}

/**
 * Create control panel for project navigation
 * 
 * @param {THREE.Group} group - Parent group
 * @param {THREE.Mesh} screen - Screen mesh
 * @param {Object} config - Configuration options
 */
function createControlPanel(group, screen, config) {
    // Create control panel base
    const panelGeometry = new THREE.BoxGeometry(6, 0.8, 2);
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x333344,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
    panelMesh.position.set(0, 0.4, 2);
    panelMesh.name = 'control-panel';
    
    // Create control buttons
    const buttonSize = 0.3;
    const buttonPositions = [
        { x: -2, z: 0, label: '◀◀', action: 'first' },
        { x: -1, z: 0, label: '◀', action: 'prev' },
        { x: 0, z: 0, label: '■', action: 'play' },
        { x: 1, z: 0, label: '▶', action: 'next' },
        { x: 2, z: 0, label: '▶▶', action: 'last' }
    ];
    
    const buttonGeometry = new THREE.CylinderGeometry(
        buttonSize, buttonSize, 0.1, 16
    );
    
    buttonPositions.forEach((pos, index) => {
        // Different color for center button
        const isCenter = index === 2;
        
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: isCenter ? config.primaryColor : config.secondaryColor,
            emissive: isCenter ? config.primaryColor : config.secondaryColor,
            emissiveIntensity: isCenter ? 1.0 : 0.5,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
        buttonMesh.rotation.x = Math.PI / 2;
        buttonMesh.position.set(pos.x, 0.8, 2 + buttonSize);
        buttonMesh.name = `control-button-${index}`;
        
        // Add interaction data
        buttonMesh.userData = {
            interactive: true,
            button: true,
            buttonIndex: index,
            action: pos.action,
            label: pos.label,
            originalColor: buttonMaterial.color.clone(),
            originalEmissive: buttonMaterial.emissive.clone(),
            originalEmissiveIntensity: buttonMaterial.emissiveIntensity,
            buttonAction: () => {
                // Handle button click
                switch(pos.action) {
                    case 'first':
                        screen.userData.navigate('first');
                        break;
                    case 'prev':
                        screen.userData.navigate('prev');
                        break;
                    case 'play':
                        screen.userData.toggleAutoPlay();
                        break;
                    case 'next':
                        screen.userData.navigate('next');
                        break;
                    case 'last':
                        screen.userData.navigate('last');
                        break;
                }
                
                // Play button animation
                gsap.to(buttonMesh.position, {
                    y: 0.75,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1
                });
            },
            onHover: () => {
                // Hover effect
                buttonMaterial.emissiveIntensity = 1.0;
                gsap.to(buttonMesh.scale, {
                    x: 1.1,
                    y: 1.1,
                    z: 1.1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            },
            onLeave: () => {
                // Reset hover effect
                buttonMaterial.emissiveIntensity = buttonMesh.userData.originalEmissiveIntensity;
                gsap.to(buttonMesh.scale, {
                    x: 1.0,
                    y: 1.0,
                    z: 1.0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        };
        
        panelMesh.add(buttonMesh);
    });
    
    group.add(panelMesh);
}

/**
 * Setup project display on screen
 * 
 * @param {THREE.Mesh} screen - Screen mesh for project display
 * @param {Array} projectData - Array of project data objects
 * @param {Object} config - Configuration options
 */
function setupProjectDisplay(screen, projectData, config) {
    // Create project display group
    const displayGroup = new THREE.Group();
    displayGroup.name = 'project-display';
    
    // Get subset of projects to display if there are more than max
    const projectsToDisplay = projectData.slice(0, config.maxProjects);
    
    // Current project index
    let currentIndex = 0;
    let autoPlayActive = false;
    let autoPlayInterval = null;
    
    // Create project cards
    projectsToDisplay.forEach((project, index) => {
        // Project card geometry
        const cardGeometry = new THREE.PlaneGeometry(
            config.screenWidth - 0.5, 
            config.screenHeight - 0.5
        );
        
        // Project card material
        const cardMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: index === 0 ? 1.0 : 0.0
        });
        
        // Create card mesh
        const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
        cardMesh.name = `project-card-${index}`;
        cardMesh.visible = index === 0;
        
        // Store project data in userData
        cardMesh.userData = {
            projectIndex: index,
            projectData: project
        };
        
        displayGroup.add(cardMesh);
    });
    
    // Add display group to screen
    displayGroup.position.z = 0.11;
    screen.add(displayGroup);
    
    // Setup navigation function
    screen.userData.navigate = (direction) => {
        const prevIndex = currentIndex;
        
        // Calculate new index
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % projectsToDisplay.length;
        } else if (direction === 'prev') {
            currentIndex = (currentIndex - 1 + projectsToDisplay.length) % projectsToDisplay.length;
        } else if (direction === 'first') {
            currentIndex = 0;
        } else if (direction === 'last') {
            currentIndex = projectsToDisplay.length - 1;
        } else {
            // Handle direct number
            const targetIndex = parseInt(direction);
            if (!isNaN(targetIndex) && targetIndex >= 0 && targetIndex < projectsToDisplay.length) {
                currentIndex = targetIndex;
            }
        }
        
        // If index didn't change, do nothing
        if (prevIndex === currentIndex) return;
        
        // Update display
        const prevCard = displayGroup.getObjectByName(`project-card-${prevIndex}`);
        const nextCard = displayGroup.getObjectByName(`project-card-${currentIndex}`);
        
        if (prevCard && nextCard) {
            // Fade out current
            gsap.to(prevCard.material, {
                opacity: 0,
                duration: config.transitionDuration / 2,
                onComplete: () => {
                    prevCard.visible = false;
                }
            });
            
            // Fade in next
            nextCard.visible = true;
            gsap.to(nextCard.material, {
                opacity: 1,
                duration: config.transitionDuration / 2
            });
        }
        
        // Update current index
        screen.userData.currentProject = currentIndex;
    };
    
    // Setup auto-play toggle
    screen.userData.toggleAutoPlay = () => {
        autoPlayActive = !autoPlayActive;
        
        if (autoPlayActive) {
            // Start auto-play interval
            autoPlayInterval = setInterval(() => {
                screen.userData.navigate('next');
            }, 5000); // Change every 5 seconds
        } else {
            // Clear interval
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        return autoPlayActive;
    };
    
    // Cleanup function to clear intervals
    screen.userData.dispose = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    };
}

/**
 * Add placeholder content when no projects are provided
 * 
 * @param {THREE.Mesh} screen - Screen mesh
 * @param {Object} config - Configuration options
 */
function addPlaceholderContent(screen, config) {
    // Create placeholder geometry
    const placeholderGeometry = new THREE.PlaneGeometry(
        config.screenWidth - 0.5, 
        config.screenHeight - 0.5
    );
    
    const placeholderMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
    });
    
    // Create placeholder mesh
    const placeholderMesh = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
    placeholderMesh.name = 'placeholder-content';
    placeholderMesh.position.z = 0.11;
    
    screen.add(placeholderMesh);
    
    // Add empty navigation function
    screen.userData.navigate = () => {
        console.log('No projects available for navigation');
    };
    
    screen.userData.toggleAutoPlay = () => false;
}

/**
 * Add animations to theater elements
 * 
 * @param {THREE.Group} group - Theater group
 * @param {Object} config - Configuration options
 */
function addTheaterAnimations(group, config) {
    // Store animation properties
    let time = 0;
    
    // Create update function
    group.userData.update = (delta) => {
        time += delta;
        
        // Animate spotlights - subtle pulsing
        for (let i = -2; i <= 2; i++) {
            const spotlight = group.getObjectByName(`ceiling-spotlight-${i+2}`);
            if (spotlight) {
                const cone = spotlight.getObjectByName(`light-cone-${i+2}`);
                if (cone && cone.material) {
                    // Slightly different timing for each spotlight
                    const pulseOffset = i * 0.5;
                    cone.material.opacity = 0.1 + Math.sin(time * 2 + pulseOffset) * 0.1;
                }
            }
        }
        
        // Animate screen glow
        const screenGlow = group.getObjectByName('screen-glow');
        if (screenGlow && screenGlow.material) {
            screenGlow.material.opacity = 0.4 + Math.sin(time) * 0.1;
        }
    };
}

/**
 * Create an entrance animation sequence for the theater
 * 
 * @param {THREE.Group} group - Theater group
 * @param {Object} options - Animation options
 * @returns {Object} Animation controller
 */
export function createTheaterEntrance(group, options = {}) {
    const defaults = {
        duration: 2.0,
        delay: 0.2
    };
    
    const config = { ...defaults, ...options };
    
    // Store theater elements to animate
    const elements = [];
    
    // Find key elements to animate
    const screen = group.getObjectByName('project-screen');
    if (screen) {
        elements.push({
            object: screen,
            from: 'top',
            delay: config.delay
        });
    }
    
    const frame = group.getObjectByName('screen-frame');
    if (frame) {
        elements.push({
            object: frame,
            from: 'top',
            delay: config.delay + 0.1
        });
    }
    
    const panel = group.getObjectByName('control-panel');
    if (panel) {
        elements.push({
            object: panel,
            from: 'bottom',
            delay: config.delay + 0.3
        });
    }
    
    // Find seats to animate
    for (let row = 0; row < 3; row++) {
        for (let seat = 0; seat < 5; seat++) {
            const seatObj = group.getObjectByName(`seat-${row}-${seat}`);
            const backrest = group.getObjectByName(`backrest-${row}-${seat}`);
            
            if (seatObj) {
                elements.push({
                    object: seatObj,
                    from: 'bottom',
                    delay: config.delay + 0.5 + (row * 0.1) + (seat * 0.05)
                });
            }
            
            if (backrest) {
                elements.push({
                    object: backrest,
                    from: 'bottom',
                    delay: config.delay + 0.6 + (row * 0.1) + (seat * 0.05)
                });
            }
        }
    }
    
    // Create sequential reveal animation
    const animations = elements.map(el => {
        return createRevealTransition(el.object, {
            from: el.from,
            duration: config.duration,
            delay: el.delay,
            distance: 5,
            rotation: true,
            scale: true,
            ease: 'back.out(1.2)'
        });
    });
    
    // Create master timeline
    const masterTimeline = {
        update: () => {
            let allComplete = true;
            
            // Update all animations
            animations.forEach(anim => {
                if (anim.update && !anim.completed) {
                    const complete = anim.update();
                    if (complete) {
                        anim.completed = true;
                    } else {
                        allComplete = false;
                    }
                }
            });
            
            return allComplete;
        },
        cancel: () => {
            animations.forEach(anim => {
                if (anim.cancel) {
                    anim.cancel();
                }
            });
        }
    };
    
    return masterTimeline;
}