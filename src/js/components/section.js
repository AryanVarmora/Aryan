/**
 * section.js - Section Implementations
 * 3D Portfolio Carousel
 * 
 * This file defines and manages the different interactive sections of the carousel,
 * including project display, achievement showcase, skill visualization, and more.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { createNeonGlow } from '../core/lights.js';
import * as MathUtils from '../utils/math.js';

// Section definitions and configurations
const SECTION_CONFIG = {
    'project-theater': {
        name: 'Project Theater',
        description: 'Interactive showcase of featured projects',
        color: 0x9966ff,
        secondaryColor: 0xcc99ff,
        maxProjects: 6,
        animationDuration: 1.2
    },
    'achievement-shelf': {
        name: 'Achievement Shelf',
        description: 'Collection of accomplishments and certifications',
        color: 0xffcc99,
        secondaryColor: 0xffddbb,
        maxAchievements: 8,
        animationDuration: 0.8
    },
    'skill-planet': {
        name: 'Skill Planet',
        description: 'Orbital visualization of technical skills',
        color: 0x99ffee,
        secondaryColor: 0xbbffee,
        maxSkills: 12,
        rotationSpeed: 0.3,
        orbitSpeed: 0.5
    },
    'chill-zone': {
        name: 'Chill Zone',
        description: 'Contact and personal information',
        color: 0x66ccff,
        secondaryColor: 0x99ddff,
        animationDuration: 1.0
    }
}

/**
 * Set up skill nodes with actual data
 * 
 * @param {THREE.Mesh} planetMesh - Planet mesh
 * @param {Object} config - Section configuration
 * @param {Array} skillData - Skill data
 */
function setupSkillNodes(planetMesh, config, skillData) {
    // Implementation for real skill data similar to
    // createPlaceholderSkills but using actual data
    // This would create orbital nodes based on skill categories and levels
}

/**
 * Set up skill nodes with actual data
 * 
 * @param {THREE.Mesh} planetMesh - Planet mesh
 * @param {Object} config - Section configuration
 * @param {Array} skillData - Skill data
 */
function setupSkillNodes(planetMesh, config, skillData) {
    // Implementation for real skill data similar to
    // createPlaceholderSkills but using actual data
    // This would create orbital nodes based on skill categories and levels
}

/**
 * Create Chill Zone section
 * 
 * @param {THREE.Group} sectionGroup - Parent group for the section
 * @param {Object} config - Section configuration
 * @param {Object} options - Additional options
 */
function createChillZone(sectionGroup, config, options) {
    // Create a cozy environment
    
    // Create floor
    const floorGeometry = new THREE.CircleGeometry(3.5, 32);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x335566,
        metalness: 0.2,
        roughness: 0.8
    });
    
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    floorMesh.name = 'chill-floor';
    
    sectionGroup.add(floorMesh);
    
    // Create a small table
    const tableTopGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16);
    const tableTopMaterial = new THREE.MeshStandardMaterial({
        color: 0x885533,
        metalness: 0.3,
        roughness: 0.8
    });
    
    const tableTopMesh = new THREE.Mesh(tableTopGeometry, tableTopMaterial);
    tableTopMesh.position.set(0, 0.8, 0);
    tableTopMesh.castShadow = true;
    tableTopMesh.receiveShadow = true;
    tableTopMesh.name = 'table-top';
    
    // Create table legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x774422,
        metalness: 0.3,
        roughness: 0.8
    });
    
    // Position legs in four corners
    const legPositions = [
        { x: 0.8, z: 0.8 },
        { x: -0.8, z: 0.8 },
        { x: 0.8, z: -0.8 },
        { x: -0.8, z: -0.8 }
    ];
    
    legPositions.forEach((pos, index) => {
        const legMesh = new THREE.Mesh(legGeometry, legMaterial);
        legMesh.position.set(pos.x, 0.4, pos.z);
        legMesh.castShadow = true;
        legMesh.name = `table-leg-${index}`;
        
        tableTopMesh.add(legMesh);
    });
    
    sectionGroup.add(tableTopMesh);
    
    // Create a laptop on the table
    const laptopBaseGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.6);
    const laptopScreenGeometry = new THREE.BoxGeometry(0.76, 0.5, 0.02);
    const laptopMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.7,
        roughness: 0.3
    });
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        emissive: config.color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    
    // Create laptop base
    const laptopBaseMesh = new THREE.Mesh(laptopBaseGeometry, laptopMaterial);
    laptopBaseMesh.position.set(0, 0.85, 0);
    laptopBaseMesh.castShadow = true;
    laptopBaseMesh.name = 'laptop-base';
    
    // Create laptop screen
    const laptopScreenMesh = new THREE.Mesh(laptopScreenGeometry, screenMaterial);
    laptopScreenMesh.position.set(0, 0.3, -0.3);
    laptopScreenMesh.rotation.x = Math.PI / 6;
    laptopScreenMesh.castShadow = true;
    laptopScreenMesh.name = 'laptop-screen';
    
    laptopBaseMesh.add(laptopScreenMesh);
    sectionGroup.add(laptopBaseMesh);
    
    // Create floating contact icons
    const iconCount = 4;
    const iconRadius = 2.0;
    const iconGroup = new THREE.Group();
    iconGroup.name = 'contact-icons';
    
    for (let i = 0; i < iconCount; i++) {
        const angle = (i / iconCount) * Math.PI * 2;
        
        // Create icon
        const iconGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const iconMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.5,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
        
        // Position in a circle
        const x = Math.cos(angle) * iconRadius;
        const z = Math.sin(angle) * iconRadius;
        iconMesh.position.set(x, 2.5, z);
        
        // Add floating animation
        const floatSpeed = 0.5 + Math.random() * 0.5;
        const floatAmount = 0.1 + Math.random() * 0.1;
        let floatOffset = Math.random() * Math.PI * 2;
        
        iconMesh.userData.update = (delta) => {
            floatOffset += floatSpeed * delta;
            iconMesh.position.y = 2.5 + Math.sin(floatOffset) * floatAmount;
            
            // Slow rotation
            iconMesh.rotation.y += 0.3 * delta;
        };
        
        // Add interaction data
        iconMesh.userData = {
            ...iconMesh.userData,
            interactive: true,
            iconIndex: i,
            onHover: () => {
                // Hover effect
                gsap.to(iconMesh.scale, {
                    x: 1.3,
                    y: 1.3,
                    z: 1.3,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                // Increase glow
                iconMaterial.emissiveIntensity = 1.0;
            },
            onLeave: () => {
                // Reset hover effect
                gsap.to(iconMesh.scale, {
                    x: 1.0,
                    y: 1.0,
                    z: 1.0,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                
                // Reset glow
                iconMaterial.emissiveIntensity = 0.5;
            }
        };
        
        iconMesh.name = `contact-icon-${i}`;
        iconGroup.add(iconMesh);
    }
    
    // Create rotation for icon group
    const iconRotationSpeed = 0.1;
    iconGroup.userData.update = (delta) => {
        iconGroup.rotation.y += iconRotationSpeed * delta;
        
        // Update children
        iconGroup.children.forEach(child => {
            if (child.userData && child.userData.update) {
                child.userData.update(delta);
            }
        });
    };
    
    sectionGroup.add(iconGroup);
}

/**
 * Update a section with animation
 * 
 * @param {THREE.Group} sectionGroup - Section group
 * @param {number} delta - Time delta
 */
export function updateSection(sectionGroup, delta) {
    // Update animations for the section and its children
    if (sectionGroup.userData && sectionGroup.userData.update) {
        sectionGroup.userData.update(delta);
    }
    
    // Update all children that have update functions
    sectionGroup.children.forEach(child => {
        if (child.userData && child.userData.update) {
            child.userData.update(delta);
        }
    });
}

/**
 * Get section information
 * 
 * @param {string} sectionType - Section type
 * @returns {Object} Section configuration
 */
export function getSectionConfig(sectionType) {
    return SECTION_CONFIG[sectionType] || null;
}

/**
 * Toggle interactive elements in a section
 * 
 * @param {THREE.Group} sectionGroup - Section group
 * @param {boolean} enabled - Whether interaction is enabled
 */
export function toggleInteraction(sectionGroup, enabled) {
    // Find all interactive elements
    const toggleInteractive = (object) => {
        if (object.userData && object.userData.interactive !== undefined) {
            object.userData.interactive = enabled;
        }
        
        // Process children
        if (object.children) {
            object.children.forEach(toggleInteractive);
        }
    };
    
    toggleInteractive(sectionGroup);
}
;

/**
 * Create a section base with common functionality
 * 
 * @param {string} sectionType - Type of section to create
 * @param {Object} options - Additional section options
 * @returns {THREE.Group} Section group
 */
export function createSection(sectionType, options = {}) {
    // Get section configuration
    const config = SECTION_CONFIG[sectionType];
    
    if (!config) {
        console.error(`Section type "${sectionType}" not found`);
        return null;
    }
    
    // Create section group
    const sectionGroup = new THREE.Group();
    sectionGroup.name = `section-${sectionType}`;
    
    // Set user data for interaction
    sectionGroup.userData = {
        type: sectionType,
        name: config.name,
        description: config.description,
        interactive: true,
        section: sectionType
    };
    
    // Create base platform for the section
    createSectionBase(sectionGroup, config, options);
    
    // Create specific section content
    switch (sectionType) {
        case 'project-theater':
            createProjectTheater(sectionGroup, config, options);
            break;
        case 'achievement-shelf':
            createAchievementShelf(sectionGroup, config, options);
            break;
        case 'skill-planet':
            createSkillPlanet(sectionGroup, config, options);
            break;
        case 'chill-zone':
            createChillZone(sectionGroup, config, options);
            break;
    }
    
    // Return the section group
    return sectionGroup;
}

/**
 * Create base geometry for a section
 * 
 * @param {THREE.Group} sectionGroup - Parent group for the section
 * @param {Object} config - Section configuration
 * @param {Object} options - Additional options
 */
function createSectionBase(sectionGroup, config, options) {
    // Create base platform
    const baseGeometry = new THREE.BoxGeometry(8, 0.5, 8);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: config.color,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.y = -0.25;
    baseMesh.receiveShadow = true;
    baseMesh.name = 'section-base';
    
    sectionGroup.add(baseMesh);
    
    // Add neon trim
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
    trimMesh.name = 'section-trim';
    
    sectionGroup.add(trimMesh);
    
    // Add section label if font is provided
    if (options.font) {
        createSectionLabel(sectionGroup, config, options.font);
    }
}

/**
 * Create text label for a section
 * 
 * @param {THREE.Group} sectionGroup - Parent group for the section
 * @param {Object} config - Section configuration
 * @param {THREE.Font} font - Font to use for text
 */
function createSectionLabel(sectionGroup, config, font) {
    const textGeometry = new TextGeometry(config.name, {
        font: font,
        size: 0.5,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: false
    });
    
    // Center text
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textGeometry.translate(-textWidth / 2, 0, 0);
    
    // Create text material
    const textMaterial = new THREE.MeshStandardMaterial({
        color: config.secondaryColor,
        emissive: config.secondaryColor,
        emissiveIntensity: 1.0
    });
    
    // Create text mesh
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 0.5, -3.5);
    textMesh.rotation.x = -Math.PI / 8;
    textMesh.name = 'section-label';
    
    sectionGroup.add(textMesh);
    
    // Add glow effect
    const glowMesh = createNeonGlow(textMesh, {
        color: config.secondaryColor,
        size: 0.15,
        opacity: 0.6
    });
    
    if (glowMesh) {
        glowMesh.name = 'section-label-glow';
        sectionGroup.add(glowMesh);
    }
}

/**
 * Create Project Theater section
 * 
 * @param {THREE.Group} sectionGroup - Parent group for the section
 * @param {Object} config - Section configuration
 * @param {Object} options - Additional options
 */
function createProjectTheater(sectionGroup, config, options) {
    // Create central screen
    const screenGeometry = new THREE.BoxGeometry(6, 4, 0.2);
    const screenMaterial = new THREE.MeshStandardMaterial({
        color: 0x222233,
        emissive: config.color,
        emissiveIntensity: 0.2,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    screenMesh.position.set(0, 2.5, -1);
    screenMesh.name = 'project-screen';
    
    // Create screen frame
    const frameGeometry = new THREE.BoxGeometry(6.4, 4.4, 0.1);
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.position.set(0, 2.5, -1.1);
    frameMesh.name = 'project-frame';
    
    // Create control panel
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
        { x: -2, z: 0 },
        { x: -1, z: 0 },
        { x: 0, z: 0 },
        { x: 1, z: 0 },
        { x: 2, z: 0 }
    ];
    
    const buttonGeometry = new THREE.CylinderGeometry(
        buttonSize, buttonSize, 0.1, 16
    );
    
    buttonPositions.forEach((pos, index) => {
        const buttonMaterial = new THREE.MeshStandardMaterial({
            color: index === 2 ? config.color : config.secondaryColor,
            emissive: index === 2 ? config.color : config.secondaryColor,
            emissiveIntensity: index === 2 ? 1.0 : 0.5,
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
            originalColor: buttonMaterial.color.clone(),
            originalEmissive: buttonMaterial.emissive.clone(),
            originalEmissiveIntensity: buttonMaterial.emissiveIntensity,
            buttonAction: () => {
                console.log(`Button ${index} clicked`);
                
                // Play button animation
                gsap.to(buttonMesh.position, {
                    y: 0.75,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1
                });
                
                // Change current project
                if (options.projectData) {
                    // Logic to switch displayed project
                }
            },
            onHover: () => {
                // Hover effect
                buttonMaterial.emissiveIntensity = 1.0;
                buttonMesh.scale.set(1.1, 1.1, 1.1);
            },
            onLeave: () => {
                // Reset hover effect
                buttonMaterial.emissiveIntensity = buttonMesh.userData.originalEmissiveIntensity;
                buttonMesh.scale.set(1.0, 1.0, 1.0);
            }
        };
        
        panelMesh.add(buttonMesh);
    });
    
    // Add all elements to the section
    sectionGroup.add(screenMesh);
    sectionGroup.add(frameMesh);
    sectionGroup.add(panelMesh);
    
    // Set up project display (if project data is available)
    if (options.projectData && options.projectData.length > 0) {
        setupProjectDisplay(sectionGroup, config, options.projectData);
    }
}

/**
 * Set up project display on screen
 * 
 * @param {THREE.Group} sectionGroup - Section group
 * @param {Object} config - Section configuration
 * @param {Array} projectData - Project data to display
 */
function setupProjectDisplay(sectionGroup, config, projectData) {
    // Get screen from section
    const screen = sectionGroup.getObjectByName('project-screen');
    
    if (!screen) return;
    
    // Create project display group
    const displayGroup = new THREE.Group();
    displayGroup.name = 'project-display';
    
    // Current project index
    let currentIndex = 0;
    
    // Create project cards
    projectData.forEach((project, index) => {
        // Project card geometry
        const cardGeometry = new THREE.PlaneGeometry(5.5, 3.5);
        
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
        cardMesh.userData = {
            projectIndex: index,
            projectData: project
        };
        
        displayGroup.add(cardMesh);
    });
    
    // Add display group to screen
    displayGroup.position.z = 0.11;
    screen.add(displayGroup);
    
    // Store navigation function
    screen.userData = {
        ...screen.userData,
        currentProjectIndex: 0,
        navigate: (direction) => {
            const prevIndex = currentIndex;
            
            // Calculate new index
            if (direction === 'next') {
                currentIndex = (currentIndex + 1) % projectData.length;
            } else if (direction === 'prev') {
                currentIndex = (currentIndex - 1 + projectData.length) % projectData.length;
            } else {
                currentIndex = Math.max(0, Math.min(parseInt(direction) || 0, projectData.length - 1));
            }
            
            // Update display
            const prevCard = displayGroup.getObjectByName(`project-card-${prevIndex}`);
            const nextCard = displayGroup.getObjectByName(`project-card-${currentIndex}`);
            
            if (prevCard && nextCard) {
                // Fade out current
                gsap.to(prevCard.material, {
                    opacity: 0,
                    duration: config.animationDuration / 2,
                    onComplete: () => {
                        prevCard.visible = false;
                    }
                });
                
                // Fade in next
                nextCard.visible = true;
                gsap.to(nextCard.material, {
                    opacity: 1,
                    duration: config.animationDuration / 2
                });
            }
            
            // Update current index
            screen.userData.currentProjectIndex = currentIndex;
        }
    };
}

/**
 * Create Achievement Shelf section
 * 
 * @param {THREE.Group} sectionGroup - Parent group for the section
 * @param {Object} config - Section configuration
 * @param {Object} options - Additional options
 */
function createAchievementShelf(sectionGroup, config, options) {
    // Create display shelf
    const shelfGeometry = new THREE.BoxGeometry(7, 0.2, 3);
    const shelfMaterial = new THREE.MeshStandardMaterial({
        color: 0x553322,
        metalness: 0.3,
        roughness: 0.8
    });
    
    // Create the shelves
    const shelfPositions = [
        { y: 1.0, z: 0 },
        { y: 2.5, z: 0 },
        { y: 4.0, z: 0 }
    ];
    
    shelfPositions.forEach((pos, index) => {
        const shelfMesh = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelfMesh.position.set(0, pos.y, pos.z);
        shelfMesh.castShadow = true;
        shelfMesh.receiveShadow = true;
        shelfMesh.name = `achievement-shelf-${index}`;
        
        sectionGroup.add(shelfMesh);
    });
    
    // Create shelf supports
    const supportGeometry = new THREE.BoxGeometry(0.2, 4, 3);
    const supportMaterial = new THREE.MeshStandardMaterial({
        color: 0x442211,
        metalness: 0.3,
        roughness: 0.8
    });
    
    const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    leftSupport.position.set(-3.5, 2, 0);
    leftSupport.castShadow = true;
    leftSupport.name = 'left-support';
    
    const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
    rightSupport.position.set(3.5, 2, 0);
    rightSupport.castShadow = true;
    rightSupport.name = 'right-support';
    
    sectionGroup.add(leftSupport);
    sectionGroup.add(rightSupport);
    
    // Create achievement items
    if (options.achievementData && options.achievementData.length > 0) {
        setupAchievementItems(sectionGroup, config, options.achievementData);
    } else {
        // Create placeholder achievement items
        createPlaceholderAchievements(sectionGroup, config);
    }
    
    // Add display sign
    const signGeometry = new THREE.BoxGeometry(5, 1, 0.1);
    const signMaterial = new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const signMesh = new THREE.Mesh(signGeometry, signMaterial);
    signMesh.position.set(0, 5, 0);
    signMesh.rotation.x = -Math.PI / 10;
    signMesh.castShadow = true;
    signMesh.name = 'achievement-sign';
    
    sectionGroup.add(signMesh);
}

/**
 * Create placeholder achievements
 * 
 * @param {THREE.Group} sectionGroup - Section group
 * @param {Object} config - Section configuration
 */
function createPlaceholderAchievements(sectionGroup, config) {
    // Create some placeholder achievements
    const types = [
        { geometry: new THREE.BoxGeometry(1, 1.2, 0.1), name: 'certificate', y: 0.6 },
        { geometry: new THREE.CylinderGeometry(0.4, 0.5, 1.0, 16), name: 'trophy', y: 0.5 },
        { geometry: new THREE.SphereGeometry(0.5, 16, 16), name: 'medal', y: 0.5 }
    ];
    
    // Positions for each shelf
    const shelfPositions = [
        { y: 1.5, items: 3 },
        { y: 3.0, items: 2 },
        { y: 4.5, items: 3 }
    ];
    
    // Create items
    let itemIndex = 0;
    
    shelfPositions.forEach((shelf) => {
        const itemCount = shelf.items;
        const spacing = 6 / (itemCount + 1);
        
        for (let i = 0; i < itemCount; i++) {
            const posX = -3 + spacing * (i + 1);
            const typeIndex = itemIndex % types.length;
            const itemType = types[typeIndex];
            
            // Choose color based on "value"
            const itemColors = [
                0xDAA520, // Gold
                0xC0C0C0, // Silver
                0xCD7F32  // Bronze
            ];
            
            const itemMaterial = new THREE.MeshStandardMaterial({
                color: itemColors[itemIndex % itemColors.length],
                metalness: 0.8,
                roughness: 0.2
            });
            
            const itemMesh = new THREE.Mesh(itemType.geometry, itemMaterial);
            itemMesh.position.set(posX, shelf.y + itemType.y, 0);
            itemMesh.castShadow = true;
            itemMesh.name = `achievement-item-${itemIndex}`;
            
            // Add interaction data
            itemMesh.userData = {
                interactive: true,
                achievementIndex: itemIndex,
                onHover: () => {
                    // Hover effect
                    gsap.to(itemMesh.scale, {
                        x: 1.1,
                        y: 1.1,
                        z: 1.1,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    
                    itemMaterial.emissive.setHex(config.color);
                    itemMaterial.emissiveIntensity = 0.5;
                },
                onLeave: () => {
                    // Reset hover effect
                    gsap.to(itemMesh.scale, {
                        x: 1.0,
                        y: 1.0,
                        z: 1.0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    
                    itemMaterial.emissiveIntensity = 0;
                }
            };
            
            sectionGroup.add(itemMesh);
            itemIndex++;
        }
    });
}

/**
 * Set up achievement items
 * 
 * @param {THREE.Group} sectionGroup - Section group
 * @param {Object} config - Section configuration
 * @param {Array} achievementData - Achievement data
 */
function setupAchievementItems(sectionGroup, config, achievementData) {
    // Implementation for real achievement data similar to
    // createPlaceholderAchievements but using actual data
    // This would use the actual data to create each item
}

/**
 * Create Skill Planet section
 * 
 * @param {THREE.Group} sectionGroup - Parent group for the section
 * @param {Object} config - Section configuration
 * @param {Object} options - Additional options
 */
function createSkillPlanet(sectionGroup, config, options) {
    // Create center planet
    const planetGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
        color: config.color,
        emissive: config.color,
        emissiveIntensity: 0.2,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.set(0, 3, 0);
    planetMesh.castShadow = true;
    planetMesh.name = 'skill-planet';
    
    // Create glow effect for planet
    const glowMesh = createNeonGlow(planetMesh, {
        color: config.color,
        size: 0.2,
        opacity: 0.3
    });
    
    if (glowMesh) {
        glowMesh.name = 'planet-glow';
        planetMesh.add(glowMesh);
    }
    
    // Create orbits
    const orbitCount = 3;
    const orbitGroup = new THREE.Group();
    orbitGroup.name = 'orbit-group';
    
    for (let i = 0; i < orbitCount; i++) {
        const orbitRadius = 2.5 + i * 0.8;
        const orbitGeometry = new THREE.TorusGeometry(orbitRadius, 0.02, 16, 100);
        const orbitMaterial = new THREE.MeshStandardMaterial({
            color: config.secondaryColor,
            emissive: config.secondaryColor,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });
        
        const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbitMesh.rotation.x = Math.PI / 2 + i * Math.PI / 6;
        orbitMesh.name = `orbit-${i}`;
        
        orbitGroup.add(orbitMesh);
    }
    
    planetMesh.add(orbitGroup);
    
    // Add orbital skill nodes
    if (options.skillData && options.skillData.length > 0) {
        setupSkillNodes(planetMesh, config, options.skillData);
    } else {
        // Create placeholder skill nodes
        createPlaceholderSkills(planetMesh, config, orbitCount);
    }
    
    // Make planet rotate
    const rotationSpeed = config.rotationSpeed || 0.3;
    planetMesh.userData.update = (delta) => {
        planetMesh.rotation.y += rotationSpeed * delta;
        
        // Update orbital nodes if they have update functions
        planetMesh.children.forEach(child => {
            if (child.userData && child.userData.update) {
                child.userData.update(delta);
            }
        });
    };
    
    sectionGroup.add(planetMesh);
    
    // Add base stand
    const standGeometry = new THREE.CylinderGeometry(0.5, 1.0, 3, 16);
    const standMaterial = new THREE.MeshStandardMaterial({
        color: 0x333344,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const standMesh = new THREE.Mesh(standGeometry, standMaterial);
    standMesh.position.set(0, 1.5, 0);
    standMesh.castShadow = true;
    standMesh.receiveShadow = true;
    standMesh.name = 'planet-stand';
    
    sectionGroup.add(standMesh);
}

/**
 * Create placeholder skill nodes
 * 
 * @param {THREE.Mesh} planetMesh - Planet mesh
 * @param {Object} config - Section configuration
 * @param {number} orbitCount - Number of orbits
 */
function createPlaceholderSkills(planetMesh, config, orbitCount) {
    // Create placeholder skill nodes
    const skillColors = [
        0xff3366, // Pink
        0x33ccff, // Blue
        0xffcc33  // Yellow
    ];
    
    // Define skill counts for each orbit
    const skillsPerOrbit = [4, 6, 8];
    
    for (let orbitIndex = 0; orbitIndex < orbitCount; orbitIndex++) {
        const orbitRadius = 2.5 + orbitIndex * 0.8;
        const skillCount = skillsPerOrbit[orbitIndex];
        const orbitColor = skillColors[orbitIndex % skillColors.length];
        
        const orbitGroup = new THREE.Group();
        orbitGroup.name = `skills-orbit-${orbitIndex}`;
        
        // Create the skills for this orbit
        for (let i = 0; i < skillCount; i++) {
            const angle = (i / skillCount) * Math.PI * 2;
            
            // Create skill node
            const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const nodeMaterial = new THREE.MeshStandardMaterial({
                color: orbitColor,
                emissive: orbitColor,
                emissiveIntensity: 0.5,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
            
            // Position on orbit
            const x = Math.cos(angle) * orbitRadius;
            const z = Math.sin(angle) * orbitRadius;
            nodeMesh.position.set(x, 0, z);
            
            // Add rotation animation
            const rotationSpeed = 0.5 + Math.random() * 0.5;
            const wobbleAmount = 0.1 + Math.random() * 0.2;
            const wobbleSpeed = 1 + Math.random() * 2;
            let wobbleOffset = Math.random() * Math.PI * 2;
            
            nodeMesh.userData.update = (delta) => {
                wobbleOffset += wobbleSpeed * delta;
                nodeMesh.position.y = Math.sin(wobbleOffset) * wobbleAmount;
            };
            
            // Add interaction data
            nodeMesh.userData = {
                ...nodeMesh.userData,
                interactive: true,
                skillIndex: i,
                orbitIndex: orbitIndex,
                onHover: () => {
                    // Hover effect
                    gsap.to(nodeMesh.scale, {
                        x: 1.5,
                        y: 1.5,
                        z: 1.5,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    
                    // Increase glow
                    nodeMaterial.emissiveIntensity = 1.0;
                },
                onLeave: () => {
                    // Reset hover effect
                    gsap.to(nodeMesh.scale, {
                        x: 1.0,
                        y: 1.0,
                        z: 1.0,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                    
                    // Reset glow
                    nodeMaterial.emissiveIntensity = 0.5;
                }
            };
            
            nodeMesh.name = `skill-node-${orbitIndex}-${i}`;
            orbitGroup.add(nodeMesh);
        }
        
        // Create rotation for orbit group
        const orbitRotationSpeed = (0.2 + orbitIndex * 0.1) * (orbitIndex % 2 === 0 ? 1 : -1);
        orbitGroup.userData.update = (delta) => {
            orbitGroup.rotation.y += orbitRotationSpeed * delta;
            
            // Update children
            orbitGroup.children.forEach(child => {
                if (child.userData && child.userData.update) {
                    child.userData.update(delta);
                }
            });
        };
        
        planetMesh.add(orbitGroup);
    }
}