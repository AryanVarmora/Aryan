/**
 * Main Entry Point
 * Portfolio 3D Carousel
 * 
 * This file initializes the application and imports all necessary modules.
 */

// Import core modules
import { initScene } from './js/core/scene.js';
import { initCamera } from './js/core/camera.js';
import { initRenderer } from './js/core/renderer.js';
import { initControls } from './js/core/controls.js';
import { initLights } from './js/core/lights.js';
import { initPostProcessing } from './js/core/postprocessing.js';

// Import components
import { createCarousel } from './js/components/carousel.js';
import { createCosmicBackground } from './js/components/cosmicBackground.js';
import { initAudio } from './js/components/audio.js';

// Import UI components
import { initLoadingScreen } from './js/ui/loadingScreen.js';
import { initInfoPanel } from './js/ui/infoPanel.js';
import { initInstructions } from './js/ui/instructions.js';

// Import asset loaders and utilities
import { assetLoader } from './js/utils/assetLoader.js';
import { setupEventListeners } from './js/utils/eventListeners.js';
import { deviceDetection } from './js/utils/deviceDetection.js';

// Global application state
const APP = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    composer: null,
    carousel: null,
    clock: new THREE.Clock(),
    isLoading: true,
    currentSection: null,
    isMobile: false,
    audioEnabled: false,
    debug: window.location.hash === '#debug'
};

// Initialize the application
async function init() {
    console.log('Initializing Portfolio 3D Carousel');
    
    // Check device capabilities
    APP.isMobile = deviceDetection.isMobile();
    
    // Initialize loading screen
    initLoadingScreen(updateLoadingProgress);
    
    // Initialize core 3D components
    APP.scene = initScene();
    APP.renderer = initRenderer(APP.isMobile);
    APP.camera = initCamera();
    APP.controls = initControls(APP.camera, APP.renderer);
    APP.composer = initPostProcessing(APP.scene, APP.camera, APP.renderer);
    
    // Add main elements to DOM
    document.getElementById('app').appendChild(APP.renderer.domElement);
    
    // Initialize UI components
    initInfoPanel();
    initInstructions(APP.isMobile);
    
    // Load assets
    try {
        await loadAssets();
    } catch (error) {
        console.error('Error loading assets:', error);
        displayErrorMessage('Failed to load some assets. Please refresh or try again later.');
    }
    
    // Initialize scene components
    initLights(APP.scene);
    createCosmicBackground(APP.scene);
    APP.carousel = await createCarousel(APP.scene);
    initAudio(APP.audioEnabled);
    
    // Setup event listeners
    setupEventListeners(APP);
    
    // Start animation loop
    animate();
    
    // Hide loading screen
    finishLoading();
}

// Asset loading
async function loadAssets() {
    // Register assets to load
    assetLoader.addTexture('stars', 'assets/textures/stars.jpg');
    assetLoader.addTexture('noise', 'assets/textures/noise.jpg');
    assetLoader.addModel('platform', 'assets/models/carousel/platform.glb');
    
    // Start loading and track progress
    return assetLoader.loadAll(updateLoadingProgress);
}

// Update loading progress
function updateLoadingProgress(progress) {
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${progress}%`;
    
    const loadingText = document.querySelector('.loading-text');
    if (progress < 100) {
        loadingText.textContent = `Loading cosmic experience... ${Math.floor(progress)}%`;
    } else {
        loadingText.textContent = 'Preparing to launch...';
    }
}

// Complete loading process
function finishLoading() {
    APP.isLoading = false;
    
    const loadingScreen = document.getElementById('loading-screen');
    
    // Fade out loading screen
    loadingScreen.style.opacity = 0;
    loadingScreen.style.transition = 'opacity 1s ease-in-out';
    
    // Remove loading screen after animation completes
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1000);
}

// Display error message
function displayErrorMessage(message) {
    const loadingText = document.querySelector('.loading-text');
    loadingText.textContent = message;
    loadingText.style.color = '#ff5555';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = APP.clock.getDelta();
    
    // Update controls
    APP.controls.update();
    
    // Update carousel animations if loaded
    if (APP.carousel && !APP.isLoading) {
        APP.carousel.update(delta);
    }
    
    // Render scene with post-processing
    APP.composer.render();
}

// Start the application when DOM is loaded
window.addEventListener('DOMContentLoaded', init);

// Handle window resize
window.addEventListener('resize', () => {
    if (!APP.camera || !APP.renderer || !APP.composer) return;
    
    // Update camera
    APP.camera.aspect = window.innerWidth / window.innerHeight;
    APP.camera.updateProjectionMatrix();
    
    // Update renderer and composer
    APP.renderer.setSize(window.innerWidth, window.innerHeight);
    APP.composer.setSize(window.innerWidth, window.innerHeight);
});

// Export APP for debugging
if (APP.debug) {
    window.APP = APP;
}