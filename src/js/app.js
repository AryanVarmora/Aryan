/**
 * App.js - Main Application Controller
 * 3D Portfolio Carousel
 * 
 * This file initializes and manages the core application state and components.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'gsap';

// Application state
const APP = {
    // Core Three.js components
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    composer: null,
    clock: new THREE.Clock(),
    
    // Application state
    isLoading: true,
    isTransitioning: false,
    activeSection: null,
    sections: ['project-theater', 'achievement-shelf', 'skill-planet', 'chill-zone'],
    carouselRotation: 0,
    targetRotation: 0,
    
    // Component references
    carousel: null,
    audioPlayer: null,
    
    // Settings
    settings: {
        rotationSpeed: 0.01,
        autoRotate: true,
        bloomStrength: 0.7,
        bloomRadius: 0.4,
        bloomThreshold: 0.85,
        particleDensity: 2000
    }
};

/**
 * Initialize the application
 */
export function init() {
    console.log('Initializing 3D Portfolio Carousel');
    
    // Create core Three.js components
    createScene();
    createCamera();
    createRenderer();
    createControls();
    createLighting();
    setupPostProcessing();
    
    // Add event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
    
    // Return APP for external access if needed
    return APP;
}

/**
 * Create the Three.js scene
 */
function createScene() {
    APP.scene = new THREE.Scene();
    APP.scene.fog = new THREE.FogExp2(0x0a0a1f, 0.002);
    console.log('Scene created');
}

/**
 * Create and configure the camera
 */
function createCamera() {
    APP.camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    // Set initial camera position
    APP.camera.position.set(0, 15, 30);
    APP.camera.lookAt(0, 0, 0);
    
    console.log('Camera created');
}

/**
 * Create and configure the renderer
 */
function createRenderer() {
    APP.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    
    // Configure renderer
    APP.renderer.setSize(window.innerWidth, window.innerHeight);
    APP.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    APP.renderer.setClearColor(0x000020);
    APP.renderer.shadowMap.enabled = true;
    APP.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add canvas to DOM
    document.getElementById('app').appendChild(APP.renderer.domElement);
    
    console.log('Renderer created');
}

/**
 * Create and configure OrbitControls
 */
function createControls() {
    APP.controls = new OrbitControls(APP.camera, APP.renderer.domElement);
    
    // Configure controls
    APP.controls.enableDamping = true;
    APP.controls.dampingFactor = 0.05;
    APP.controls.screenSpacePanning = false;
    APP.controls.minDistance = 15;
    APP.controls.maxDistance = 40;
    APP.controls.maxPolarAngle = Math.PI / 1.5;
    APP.controls.enablePan = false;
    
    console.log('Controls created');
}

/**
 * Create and configure scene lighting
 */
function createLighting() {
    // Ambient light - soft overall illumination
    const ambientLight = new THREE.AmbientLight(0x333366, 0.5);
    APP.scene.add(ambientLight);
    
    // Main directional light - creates shadows
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(10, 20, 15);
    mainLight.castShadow = true;
    
    // Configure shadow properties
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    
    APP.scene.add(mainLight);
    
    // Add colored rim lights for dramatic effect
    const purpleLight = new THREE.PointLight(0x9966ff, 1.5, 30);
    purpleLight.position.set(-15, 10, -15);
    APP.scene.add(purpleLight);
    
    const blueLight = new THREE.PointLight(0x0099ff, 1.5, 30);
    blueLight.position.set(15, 5, -15);
    APP.scene.add(blueLight);
    
    const pinkLight = new THREE.PointLight(0xff3388, 1.2, 25);
    pinkLight.position.set(0, -5, -20);
    APP.scene.add(pinkLight);
    
    console.log('Lighting created');
}

/**
 * Set up post-processing effects
 */
function setupPostProcessing() {
    // Create composer
    APP.composer = new EffectComposer(APP.renderer);
    
    // Add render pass
    const renderPass = new RenderPass(APP.scene, APP.camera);
    APP.composer.addPass(renderPass);
    
    // Add bloom pass for glow effects
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        APP.settings.bloomStrength,
        APP.settings.bloomRadius,
        APP.settings.bloomThreshold
    );
    
    APP.composer.addPass(bloomPass);
    
    console.log('Post-processing setup complete');
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Keyboard controls
    window.addEventListener('keydown', onKeyDown);
    
    // Mouse/touch for section selection
    APP.renderer.domElement.addEventListener('click', onCanvasClick);
    
    // Audio toggle
    const audioToggle = document.getElementById('toggle-audio');
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
    }
    
    // Info panel close button
    const closeBtn = document.querySelector('#info-panel .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInfoPanel);
    }
    
    console.log('Event listeners set up');
}

/**
 * Handle window resize
 */
function onWindowResize() {
    // Update camera
    APP.camera.aspect = window.innerWidth / window.innerHeight;
    APP.camera.updateProjectionMatrix();
    
    // Update renderer and composer
    APP.renderer.setSize(window.innerWidth, window.innerHeight);
    APP.composer.setSize(window.innerWidth, window.innerHeight);
    
    console.log('Resized to', window.innerWidth, 'x', window.innerHeight);
}

/**
 * Handle keyboard events
 */
function onKeyDown(event) {
    // ESC key - return to overview
    if (event.key === 'Escape' && APP.activeSection) {
        returnToOverview();
    }
    
    // Arrow keys - rotate carousel
    if (event.key === 'ArrowLeft') {
        rotateCarouselTo(APP.carouselRotation + Math.PI/2);
    } else if (event.key === 'ArrowRight') {
        rotateCarouselTo(APP.carouselRotation - Math.PI/2);
    }
}

/**
 * Handle canvas click for section selection
 */
function onCanvasClick(event) {
    if (APP.isTransitioning || APP.isLoading) return;
    
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycasting to detect clicked objects
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, APP.camera);
    
    // Check for intersections with carousel sections
    const intersects = raycaster.intersectObjects(APP.scene.children, true);
    
    if (intersects.length > 0) {
        // Find the first intersected object that has a userData.section property
        const clickedObject = intersects.find(intersect => 
            intersect.object.userData && intersect.object.userData.section
        );
        
        if (clickedObject) {
            const sectionName = clickedObject.object.userData.section;
            selectSection(sectionName);
        }
    }
}

/**
 * Toggle background audio
 */
function toggleAudio() {
    if (APP.audioPlayer) {
        if (APP.audioPlayer.isPlaying) {
            APP.audioPlayer.pause();
            document.querySelector('#toggle-audio .icon').textContent = '🔇';
        } else {
            APP.audioPlayer.play();
            document.querySelector('#toggle-audio .icon').textContent = '🔊';
        }
    }
}

/**
 * Close the info panel
 */
function closeInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
        infoPanel.classList.add('hidden');
    }
}

/**
 * Rotate carousel to a specific angle
 */
function rotateCarouselTo(targetAngle) {
    if (!APP.carousel || APP.isTransitioning) return;
    
    APP.isTransitioning = true;
    APP.targetRotation = targetAngle;
    
    // Animate rotation with GSAP
    gsap.to(APP.carousel.rotation, {
        y: targetAngle,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => {
            APP.carouselRotation = APP.carousel.rotation.y;
        },
        onComplete: () => {
            APP.isTransitioning = false;
        }
    });
}

/**
 * Select and focus on a carousel section
 */
function selectSection(sectionName) {
    if (APP.isTransitioning || APP.activeSection === sectionName) return;
    
    console.log('Selecting section:', sectionName);
    APP.activeSection = sectionName;
    
    // Determine camera position based on section
    let cameraTarget, lookAtPosition;
    
    switch(sectionName) {
        case 'project-theater':
            cameraTarget = new THREE.Vector3(-12, 5, 0);
            lookAtPosition = new THREE.Vector3(-12, 5, -5);
            break;
        case 'achievement-shelf':
            cameraTarget = new THREE.Vector3(0, 5, -12);
            lookAtPosition = new THREE.Vector3(0, 5, -17);
            break;
        case 'skill-planet':
            cameraTarget = new THREE.Vector3(12, 5, 0);
            lookAtPosition = new THREE.Vector3(12, 5, -5);
            break;
        case 'chill-zone':
            cameraTarget = new THREE.Vector3(0, 5, 12);
            lookAtPosition = new THREE.Vector3(0, 5, 7);
            break;
    }
    
    // Disable controls during transition
    APP.controls.enabled = false;
    APP.isTransitioning = true;
    
    // Animate camera movement
    gsap.to(APP.camera.position, {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
        duration: 2,
        ease: 'power2.inOut',
        onUpdate: () => {
            APP.camera.lookAt(lookAtPosition);
        },
        onComplete: () => {
            APP.isTransitioning = false;
            showInfoPanel(sectionName);
            
            // Re-enable controls with new constraints
            APP.controls.target.copy(lookAtPosition);
            APP.controls.minDistance = 5;
            APP.controls.maxDistance = 15;
            APP.controls.enabled = true;
        }
    });
}

/**
 * Return to carousel overview
 */
function returnToOverview() {
    if (APP.isTransitioning) return;
    
    console.log('Returning to overview');
    closeInfoPanel();
    
    // Disable controls during transition
    APP.controls.enabled = false;
    APP.isTransitioning = true;
    
    // Animate camera back to overview position
    gsap.to(APP.camera.position, {
        x: 0,
        y: 15,
        z: 30,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
            APP.camera.lookAt(0, 0, 0);
        },
        onComplete: () => {
            APP.isTransitioning = false;
            APP.activeSection = null;
            
            // Reset controls
            APP.controls.target.set(0, 0, 0);
            APP.controls.minDistance = 15;
            APP.controls.maxDistance = 40;
            APP.controls.enabled = true;
        }
    });
}

/**
 * Show info panel with section content
 */
function showInfoPanel(sectionName) {
    const infoPanel = document.getElementById('info-panel');
    const panelContent = document.querySelector('#info-panel .panel-content');
    
    if (!infoPanel || !panelContent) return;
    
    // Set content based on section
    let content = '';
    
    switch(sectionName) {
        case 'project-theater':
            content = `
                <h2 class="purple-glow">Project Theater</h2>
                <p>Explore a showcase of my latest projects and technical work.</p>
                <div class="section-divider"></div>
                <div class="project-list">
                    <!-- Project items will be dynamically loaded -->
                    <p>Loading projects...</p>
                </div>
            `;
            break;
        case 'achievement-shelf':
            content = `
                <h2 class="blue-glow">Achievement Shelf</h2>
                <p>Certifications, awards, and milestones from my professional journey.</p>
                <div class="section-divider"></div>
                <div class="achievement-list">
                    <!-- Achievement items will be dynamically loaded -->
                    <p>Loading achievements...</p>
                </div>
            `;
            break;
        case 'skill-planet':
            content = `
                <h2 class="pink-glow">Skill Planet</h2>
                <p>Technologies and tools I've mastered throughout my career.</p>
                <div class="section-divider"></div>
                <div class="skills-container">
                    <!-- Skill items will be dynamically loaded -->
                    <p>Loading skills...</p>
                </div>
            `;
            break;
        case 'chill-zone':
            content = `
                <h2 class="blue-glow">Chill Zone</h2>
                <p>Let's connect! Feel free to reach out for collaboration or just a friendly chat.</p>
                <div class="section-divider"></div>
                <p>I'm passionate about creating innovative solutions and always open to new opportunities.</p>
                <div class="contact-form">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" placeholder="Your name">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="Your email">
                    </div>
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" placeholder="Your message"></textarea>
                    </div>
                    <button type="button" id="send-message">Send Message</button>
                </div>
            `;
            break;
    }
    
    // Update panel content
    panelContent.innerHTML = content;
    
    // Show panel with animation
    infoPanel.classList.remove('hidden');
    
    // Load dynamic content for the section
    loadSectionContent(sectionName);
}

/**
 * Load dynamic content for a section
 */
function loadSectionContent(sectionName) {
    // This function would fetch and populate dynamic content
    // For now, we'll use placeholders
    
    // Would normally fetch from API or data files
    console.log(`Loading content for ${sectionName}`);
    
    setTimeout(() => {
        // Example of updating content dynamically after "loading"
        if (sectionName === 'project-theater') {
            const projectList = document.querySelector('.project-list');
            if (projectList) {
                projectList.innerHTML = `
                    <div class="project-item">
                        <h3>Interactive Data Visualization</h3>
                        <p>A real-time dashboard for analytics with customizable widgets.</p>
                        <div class="project-tags">
                            <span>React</span>
                            <span>D3.js</span>
                            <span>Firebase</span>
                        </div>
                        <div class="project-links">
                            <a href="#" target="_blank">View Demo</a>
                            <a href="#" target="_blank">GitHub</a>
                        </div>
                    </div>
                    <div class="project-item">
                        <h3>AI Content Generator</h3>
                        <p>Machine learning tool that creates customized content based on user parameters.</p>
                        <div class="project-tags">
                            <span>Python</span>
                            <span>TensorFlow</span>
                            <span>Flask</span>
                        </div>
                        <div class="project-links">
                            <a href="#" target="_blank">View Demo</a>
                            <a href="#" target="_blank">GitHub</a>
                        </div>
                    </div>
                `;
            }
        }
    }, 800);  // Simulate loading delay
}

/**
 * Main animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    
    const delta = APP.clock.getDelta();
    
    // Update controls if enabled
    if (APP.controls) {
        APP.controls.update();
    }
    
    // Auto-rotate carousel when in overview and not transitioning
    if (APP.carousel && !APP.activeSection && !APP.isTransitioning && APP.settings.autoRotate) {
        APP.carousel.rotation.y += APP.settings.rotationSpeed * delta;
        APP.carouselRotation = APP.carousel.rotation.y;
    }
    
    // Render scene with post-processing
    if (APP.composer) {
        APP.composer.render();
    }
}

// Export necessary functions and APP object
export {
    APP,
    rotateCarouselTo,
    selectSection,
    returnToOverview
};