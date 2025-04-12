/**
 * carousel.js - 3D Carousel Platform
 * 3D Portfolio Carousel
 * 
 * This file handles the creation and management of the main carousel platform,
 * section positioning, rotation animations, and interactions.
 */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Default carousel settings
const DEFAULT_SETTINGS = {
    // Platform dimensions
    radius: 12,
    height: 0.5,
    cylinderSegments: 64,
    
    // Materials
    platformColor: 0x222244,
    platformMetalness: 0.7,
    platformRoughness: 0.3,
    glowColor: 0x6633ff,
    
    // Sections
    sectionCount: 4,
    sectionRadius: 10,
    sectionHeight: 5,
    
    // Animations
    rotationDuration: 1.2,
    rotationEase: 'power2.inOut',
    hoverAnimationDuration: 0.3,
    selectionAnimationDuration: 0.5,
    
    // Physics
    damping: 0.95,
    
    // Labels
    showLabels: true,
    labelHeight: 6,
    labelSize: 0.8,
    labelFont: null // Set via loadFont method
};

// Section definitions
const SECTION_DEFINITIONS = {
    'project-theater': {
        name: 'Project Theater',
        color: 0x9966ff,
        position: { x: -10, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        angle: 0, // 0 degrees
        model: null, // Set via loadModel method
        interactive: true
    },
    'achievement-shelf': {
        name: 'Achievement Shelf',
        color: 0xffcc99,
        position: { x: 0, y: 0, z: -10 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        angle: Math.PI / 2, // 90 degrees
        model: null, // Set via loadModel method
        interactive: true
    },
    'skill-planet': {
        name: 'Skill Planet',
        color: 0x99ffee,
        position: { x: 10, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        angle: Math.PI, // 180 degrees
        model: null, // Set via loadModel method
        interactive: true
    },
    'chill-zone': {
        name: 'Chill Zone',
        color: 0x66ccff,
        position: { x: 0, y: 0, z: 10 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        angle: -Math.PI / 2, // 270 degrees
        model: null, // Set via loadModel method
        interactive: true
    }
};

/**
 * Create and manage the 3D carousel platform
 * 
 * @param {THREE.Scene} scene - The scene to add the carousel to
 * @param {Object} options - Carousel configuration options
 * @returns {Object} Carousel controller
 */
export function createCarousel(scene, options = {}) {
    // Merge options with defaults
    const settings = { ...DEFAULT_SETTINGS };
    Object.keys(options).forEach(key => {
        if (typeof options[key] === 'object' && options[key] !== null && !Array.isArray(options[key])) {
            settings[key] = { ...settings[key], ...options[key] };
        } else {
            settings[key] = options[key];
        }
    });
    
    // Create main group for carousel
    const carouselGroup = new THREE.Group();
    carouselGroup.name = 'carousel';
    scene.add(carouselGroup);
    
    // Store all carousel objects and sections
    const objects = {
        platform: null,
        columnBase: null,
        columnTop: null,
        sections: {},
        labels: {},
        interactiveObjects: []
    };
    
    // State tracking
    const state = {
        rotation: 0,
        targetRotation: 0,
        rotationVelocity: 0,
        isAnimating: false,
        activeSection: null,
        isLocked: false
    };
    
    // Create the platform
    const createPlatform = () => {
        // Create the platform cylinder
        const platformGeometry = new THREE.CylinderGeometry(
            settings.radius,
            settings.radius,
            settings.height,
            settings.cylinderSegments
        );
        
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: settings.platformColor,
            metalness: settings.platformMetalness,
            roughness: settings.platformRoughness
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -settings.height / 2;
        platform.receiveShadow = true;
        platform.name = 'carousel-platform';
        
        carouselGroup.add(platform);
        objects.platform = platform;
        
        // Create glow ring
        const ringGeometry = new THREE.TorusGeometry(
            settings.radius + 0.2,
            0.2,
            16,
            settings.cylinderSegments
        );
        
        const glowMaterial = new THREE.MeshStandardMaterial({
            color: settings.glowColor,
            emissive: settings.glowColor,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.7
        });
        
        const glowRing = new THREE.Mesh(ringGeometry, glowMaterial);
        glowRing.position.y = -settings.height / 2;
        glowRing.rotation.x = Math.PI / 2;
        glowRing.name = 'carousel-glow-ring';
        
        carouselGroup.add(glowRing);
        
        // Create center column (optional)
        const columnBaseGeometry = new THREE.CylinderGeometry(1, 1.5, 1, 16);
        const columnBaseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333355,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const columnBase = new THREE.Mesh(columnBaseGeometry, columnBaseMaterial);
        columnBase.position.y = 0;
        columnBase.castShadow = true;
        columnBase.receiveShadow = true;
        columnBase.name = 'carousel-column-base';
        
        carouselGroup.add(columnBase);
        objects.columnBase = columnBase;
        
        // Create column top
        const columnTopGeometry = new THREE.CylinderGeometry(0.8, 1, 8, 16);
        const columnTopMaterial = new THREE.MeshStandardMaterial({
            color: 0x333355,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const columnTop = new THREE.Mesh(columnTopGeometry, columnTopMaterial);
        columnTop.position.y = 4.5;
        columnTop.castShadow = true;
        columnTop.receiveShadow = true;
        columnTop.name = 'carousel-column-top';
        
        carouselGroup.add(columnTop);
        objects.columnTop = columnTop;
        
        // Create top disc
        const topDiscGeometry = new THREE.CylinderGeometry(6, 6, 0.3, 32);
        const topDiscMaterial = new THREE.MeshStandardMaterial({
            color: 0x222244,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const topDisc = new THREE.Mesh(topDiscGeometry, topDiscMaterial);
        topDisc.position.y = 8.5;
        topDisc.castShadow = true;
        topDisc.receiveShadow = true;
        topDisc.name = 'carousel-top-disc';
        
        carouselGroup.add(topDisc);
    };
    
    // Create section placeholders
    const createSectionPlaceholders = () => {
        const sectionKeys = Object.keys(SECTION_DEFINITIONS);
        
        sectionKeys.forEach(key => {
            const sectionDef = SECTION_DEFINITIONS[key];
            
            // Create section group
            const sectionGroup = new THREE.Group();
            sectionGroup.name = `section-${key}`;
            sectionGroup.position.copy(new THREE.Vector3(
                sectionDef.position.x,
                sectionDef.position.y,
                sectionDef.position.z
            ));
            sectionGroup.rotation.set(
                sectionDef.rotation.x,
                sectionDef.rotation.y,
                sectionDef.rotation.z
            );
            
            // Add user data for interaction
            sectionGroup.userData = {
                section: key,
                interactive: sectionDef.interactive
            };
            
            // Add to interactive objects if needed
            if (sectionDef.interactive) {
                objects.interactiveObjects.push(sectionGroup);
            }
            
            // Create placeholder if no model is loaded
            if (!sectionDef.model) {
                // Create a simple placeholder
                const placeholderGeometry = new THREE.BoxGeometry(4, 4, 1);
                const placeholderMaterial = new THREE.MeshStandardMaterial({
                    color: sectionDef.color,
                    transparent: true,
                    opacity: 0.7
                });
                
                const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
                placeholder.castShadow = true;
                placeholder.name = `placeholder-${key}`;
                
                // Add to section group
                sectionGroup.add(placeholder);
            } else {
                // Clone model from definition
                const model = sectionDef.model.clone();
                sectionGroup.add(model);
            }
            
            // Add to carousel
            carouselGroup.add(sectionGroup);
            objects.sections[key] = sectionGroup;
            
            // Create section label if enabled
            if (settings.showLabels && settings.labelFont) {
                createSectionLabel(key, sectionDef);
            }
        });
    };
    
    // Create labels for sections
    const createSectionLabel = (key, sectionDef) => {
        // Skip if font not loaded
        if (!settings.labelFont) return;
        
        // Create text geometry
        const textGeometry = new TextGeometry(sectionDef.name, {
            font: settings.labelFont,
            size: settings.labelSize,
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: false
        });
        
        // Center the text geometry
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
        textGeometry.translate(-textWidth / 2, 0, 0);
        
        // Create text material
        const textMaterial = new THREE.MeshStandardMaterial({
            color: sectionDef.color,
            emissive: sectionDef.color,
            emissiveIntensity: 0.8
        });
        
        // Create text mesh
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(
            sectionDef.position.x * 0.8,
            settings.labelHeight,
            sectionDef.position.z * 0.8
        );
        
        // Rotate to face outward
        textMesh.rotation.y = Math.atan2(
            -sectionDef.position.x,
            -sectionDef.position.z
        );
        
        textMesh.castShadow = true;
        textMesh.name = `label-${key}`;
        
        // Add to carousel
        carouselGroup.add(textMesh);
        objects.labels[key] = textMesh;
    };
    
    // Load model for a section
    const loadModel = (sectionKey, model) => {
        // Update section definition
        if (SECTION_DEFINITIONS[sectionKey]) {
            SECTION_DEFINITIONS[sectionKey].model = model;
            
            // If section placeholder exists, replace it
            if (objects.sections[sectionKey]) {
                // Remove existing placeholder
                const placeholder = objects.sections[sectionKey].getObjectByName(`placeholder-${sectionKey}`);
                if (placeholder) {
                    objects.sections[sectionKey].remove(placeholder);
                }
                
                // Add model
                objects.sections[sectionKey].add(model.clone());
            }
        }
    };
    
    // Load font for labels
    const loadFont = (font) => {
        settings.labelFont = font;
        
        // Create labels for existing sections
        if (settings.showLabels) {
            Object.keys(SECTION_DEFINITIONS).forEach(key => {
                if (!objects.labels[key]) {
                    createSectionLabel(key, SECTION_DEFINITIONS[key]);
                }
            });
        }
    };
    
    // Rotate the carousel
    const rotate = (amount) => {
        // Skip if locked
        if (state.isLocked) return;
        
        // Apply rotation
        state.rotation += amount;
        carouselGroup.rotation.y = state.rotation;
    };
    
    // Rotate to a specific angle with animation
    const rotateTo = (targetAngle, duration = settings.rotationDuration) => {
        // Skip if locked or already animating
        if (state.isLocked || state.isAnimating) return null;
        
        // Normalize target angle (ensure shortest path)
        const currentAngle = state.rotation % (Math.PI * 2);
        let normalizedTarget = targetAngle % (Math.PI * 2);
        
        // Determine shortest rotation path
        const diff = normalizedTarget - currentAngle;
        if (Math.abs(diff) > Math.PI) {
            if (diff > 0) {
                normalizedTarget -= Math.PI * 2;
            } else {
                normalizedTarget += Math.PI * 2;
            }
        }
        
        // Set target rotation
        state.targetRotation = normalizedTarget;
        state.isAnimating = true;
        
        // Animate rotation
        const rotationTween = gsap.to(state, {
            rotation: normalizedTarget,
            duration: duration,
            ease: settings.rotationEase,
            onUpdate: () => {
                carouselGroup.rotation.y = state.rotation;
            },
            onComplete: () => {
                state.isAnimating = false;
            }
        });
        
        return rotationTween;
    };
    
    // Rotate to a specific section
    const rotateToSection = (sectionKey, duration = settings.rotationDuration) => {
        // Get section definition
        const sectionDef = SECTION_DEFINITIONS[sectionKey];
        
        if (!sectionDef) {
            console.warn(`Section "${sectionKey}" not found`);
            return null;
        }
        
        // Calculate target angle (inverse of section angle)
        const targetAngle = -sectionDef.angle;
        
        // Rotate to target angle
        return rotateTo(targetAngle, duration);
    };
    
    // Update carousel animation
    const update = (deltaTime) => {
        // Skip if locked
        if (state.isLocked) return;
        
        // Apply animation updates if needed
        if (!state.isAnimating && Math.abs(state.rotation - state.targetRotation) > 0.001) {
            // Apply damping to reach target rotation
            state.rotation += (state.targetRotation - state.rotation) * 0.1;
            carouselGroup.rotation.y = state.rotation;
        }
        
        // Pulse effect for glow ring
        if (objects.platform) {
            const glowRing = carouselGroup.getObjectByName('carousel-glow-ring');
            if (glowRing) {
                glowRing.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.002) * 0.5;
            }
        }
    };
    
    // Get interactive objects for raycasting
    const getInteractiveObjects = () => {
        return objects.interactiveObjects;
    };
    
    // Get all sections
    const getSections = () => {
        return Object.values(objects.sections);
    };
    
    // Initialize the carousel
    const init = () => {
        // Create platform and components
        createPlatform();
        
        // Create section placeholders
        createSectionPlaceholders();
        
        console.log('Carousel initialized');
    };
    
    // Create carousel controller
    const carouselController = {
        // Initialize
        init,
        
        // Update loop
        update,
        
        // Rotation methods
        rotate,
        rotateTo,
        rotateToSection,
        
        // Get current rotation
        getRotation: () => state.rotation,
        
        // Get interactive objects for raycasting
        getInteractiveObjects,
        
        // Get all sections
        getSections,
        
        // Load assets
        loadModel,
        loadFont,
        
        // Lock/unlock carousel
        setLocked: (locked) => {
            state.isLocked = locked;
        },
        
        // Get carousel group
        getGroup: () => carouselGroup,
        
        // Get all objects
        getObjects: () => objects
    };
    
    // Initialize
    init();
    
    return carouselController;
}