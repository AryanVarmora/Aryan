/**
 * scene.js - Scene Management
 * 3D Portfolio Carousel
 * 
 * Responsible for creating and managing the 3D scene environment.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

// Scene configuration
const sceneConfig = {
    backgroundColor: 0x050520,
    fogColor: 0x0a0a1f,
    fogDensity: 0.002,
    bloomStrength: 0.7,
    bloomRadius: 0.4,
    bloomThreshold: 0.85,
    rgbShiftAmount: 0.0015,
    antialiasing: true
};

/**
 * Create and configure the 3D scene
 * @returns {Object} Scene object with all components
 */
export function createScene(domElement = 'app') {
    // Initialize components
    const renderer = createRenderer(domElement);
    const scene = new THREE.Scene();
    const camera = createCamera();
    const composer = setupPostProcessing(renderer, scene, camera);
    
    // Setup scene properties
    setupSceneEnvironment(scene);
    
    // Create scene controller object
    const sceneController = {
        scene,
        camera,
        renderer,
        composer,
        
        // Resize handler
        resize: () => handleResize(camera, renderer, composer),
        
        // Render function
        render: () => composer.render(),
        
        // Add object to scene with optional name
        add: (object, name) => {
            if (name) object.name = name;
            scene.add(object);
            return object;
        },
        
        // Remove object from scene
        remove: (object) => {
            scene.remove(object);
        },
        
        // Find object by name
        findByName: (name) => scene.getObjectByName(name),
        
        // Toggle wireframe mode for all objects
        toggleWireframe: (enabled) => {
            scene.traverse((obj) => {
                if (obj.isMesh && obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.wireframe = enabled);
                    } else {
                        obj.material.wireframe = enabled;
                    }
                }
            });
        },
        
        // Adjust bloom effect strength
        setBloomStrength: (strength) => {
            const bloomPass = composer.passes.find(pass => pass instanceof UnrealBloomPass);
            if (bloomPass) bloomPass.strength = strength;
        },
        
        // Enable/disable fog
        setFogEnabled: (enabled) => {
            if (enabled) {
                scene.fog = new THREE.FogExp2(sceneConfig.fogColor, sceneConfig.fogDensity);
            } else {
                scene.fog = null;
            }
        },
        
        // Change background color
        setBackgroundColor: (color) => {
            scene.background = new THREE.Color(color);
        },
        
        // Clear all objects from scene
        clear: () => {
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        },
        
        // Dispose of all resources
        dispose: () => {
            // Dispose of renderer
            renderer.dispose();
            
            // Dispose of all materials
            scene.traverse((obj) => {
                if (obj.isMesh) {
                    if (obj.geometry) obj.geometry.dispose();
                    
                    if (obj.material) {
                        if (Array.isArray(obj.material)) {
                            obj.material.forEach(disposeMaterial);
                        } else {
                            disposeMaterial(obj.material);
                        }
                    }
                }
            });
            
            // Dispose of composer passes
            composer.passes.forEach(pass => {
                if (pass.dispose) pass.dispose();
            });
            
            // Helper function to dispose material
            function disposeMaterial(material) {
                if (material.map) material.map.dispose();
                if (material.lightMap) material.lightMap.dispose();
                if (material.bumpMap) material.bumpMap.dispose();
                if (material.normalMap) material.normalMap.dispose();
                if (material.specularMap) material.specularMap.dispose();
                if (material.envMap) material.envMap.dispose();
                material.dispose();
            }
        }
    };
    
    // Add window resize handler
    window.addEventListener('resize', sceneController.resize);
    
    return sceneController;
}

/**
 * Create and configure WebGL renderer
 * @param {string} domElementId - DOM element ID to append canvas to
 * @returns {THREE.WebGLRenderer} Configured renderer
 */
function createRenderer(domElementId) {
    // Create renderer with antialiasing
    const renderer = new THREE.WebGLRenderer({ 
        antialias: sceneConfig.antialiasing,
        alpha: true,
        powerPreference: 'high-performance'
    });
    
    // Configure renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    renderer.setClearColor(sceneConfig.backgroundColor);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Add canvas to DOM
    const container = document.getElementById(domElementId);
    if (container) {
        container.appendChild(renderer.domElement);
    } else {
        console.warn(`Container element #${domElementId} not found, appending to body`);
        document.body.appendChild(renderer.domElement);
    }
    
    return renderer;
}

/**
 * Create and configure the camera
 * @returns {THREE.PerspectiveCamera} Configured camera
 */
function createCamera() {
    // Create perspective camera
    const camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    
    // Set initial camera position
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    
    return camera;
}

/**
 * Setup post-processing effects
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {THREE.Scene} scene - 3D scene
 * @param {THREE.Camera} camera - Camera
 * @returns {EffectComposer} Post-processing composer
 */
function setupPostProcessing(renderer, scene, camera) {
    // Create composer
    const composer = new EffectComposer(renderer);
    
    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Add bloom pass for glow effects
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        sceneConfig.bloomStrength,
        sceneConfig.bloomRadius,
        sceneConfig.bloomThreshold
    );
    composer.addPass(bloomPass);
    
    // Add subtle RGB shift for chromatic aberration effect
    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.uniforms.amount.value = sceneConfig.rgbShiftAmount;
    rgbShiftPass.uniforms.angle.value = 0;
    composer.addPass(rgbShiftPass);
    
    // Add FXAA antialiasing pass
    const fxaaPass = new ShaderPass(FXAAShader);
    const pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms.resolution.value.set(
        1 / (window.innerWidth * pixelRatio),
        1 / (window.innerHeight * pixelRatio)
    );
    composer.addPass(fxaaPass);
    
    return composer;
}

/**
 * Setup scene environment properties
 * @param {THREE.Scene} scene - 3D scene
 */
function setupSceneEnvironment(scene) {
    // Set background color
    scene.background = new THREE.Color(sceneConfig.backgroundColor);
    
    // Add exponential fog for depth
    scene.fog = new THREE.FogExp2(sceneConfig.fogColor, sceneConfig.fogDensity);
}

/**
 * Handle window resize
 * @param {THREE.Camera} camera - Camera to update
 * @param {THREE.WebGLRenderer} renderer - Renderer to resize
 * @param {EffectComposer} composer - Post-processing composer to resize
 */
function handleResize(camera, renderer, composer) {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Resize renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Resize composer
    composer.setSize(window.innerWidth, window.innerHeight);
    
    // Update FXAA resolution
    const fxaaPass = composer.passes.find(pass => pass.material && pass.material.uniforms.resolution);
    if (fxaaPass) {
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass.material.uniforms.resolution.value.set(
            1 / (window.innerWidth * pixelRatio),
            1 / (window.innerHeight * pixelRatio)
        );
    }
}

/**
 * Create a scene debug helper
 * @param {Object} sceneController - Scene controller object
 * @returns {Object} Debug controls
 */
export function createSceneDebugHelper(sceneController) {
    // This would normally connect to a GUI library like lil-gui
    // For now, we'll return some helper functions
    return {
        toggleWireframe: (enabled) => sceneController.toggleWireframe(enabled),
        setBloomStrength: (value) => sceneController.setBloomStrength(value),
        toggleFog: (enabled) => sceneController.setFogEnabled(enabled),
        showAxesHelper: (size = 5) => {
            const axesHelper = new THREE.AxesHelper(size);
            axesHelper.name = 'axes-helper';
            sceneController.add(axesHelper);
        },
        removeAxesHelper: () => {
            const axesHelper = sceneController.findByName('axes-helper');
            if (axesHelper) sceneController.remove(axesHelper);
        }
    };
}