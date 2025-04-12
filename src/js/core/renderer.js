/**
 * renderer.js - WebGL Renderer
 * 3D Portfolio Carousel
 * 
 * Responsible for setting up and configuring the Three.js WebGL renderer
 * with optimized settings for a visually impressive experience.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

// Default renderer configuration
const DEFAULT_CONFIG = {
    clearColor: 0x050520,
    clearAlpha: 1,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    shadowMapType: THREE.PCFSoftShadowMap,
    outputEncoding: THREE.sRGBEncoding,
    powerPreference: 'high-performance',
    physicallyCorrectLights: true,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2
};

// Default post-processing configuration
const DEFAULT_POST_CONFIG = {
    enabled: true,
    bloom: {
        enabled: true,
        strength: 0.7,
        radius: 0.4,
        threshold: 0.85
    },
    fxaa: {
        enabled: true
    },
    gammaCorrection: {
        enabled: true
    }
};

/**
 * Create and configure a WebGL renderer
 * 
 * @param {Object} config - Renderer configuration options
 * @returns {THREE.WebGLRenderer} Configured renderer
 */
export function createRenderer(config = {}) {
    // Merge default config with provided options
    const rendererConfig = { ...DEFAULT_CONFIG, ...config };
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({
        antialias: rendererConfig.antialias,
        powerPreference: rendererConfig.powerPreference,
        alpha: true
    });
    
    // Configure renderer properties
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(rendererConfig.pixelRatio);
    renderer.setClearColor(rendererConfig.clearColor, rendererConfig.clearAlpha);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = rendererConfig.shadowMapType;
    renderer.outputColorSpace = rendererConfig.outputEncoding;
    renderer.physicallyCorrectLights = rendererConfig.physicallyCorrectLights;
    renderer.toneMapping = rendererConfig.toneMapping;
    renderer.toneMappingExposure = rendererConfig.toneMappingExposure;
    
    // Enable logarithmic depth buffer for better z-fighting prevention
    renderer.logarithmicDepthBuffer = true;
    
    // Additional info and debug
    console.log(`Renderer created: ${renderer.getContext().getParameter(renderer.getContext().VERSION)}`);
    console.log(`GPU: ${getGPUInfo(renderer)}`);
    
    return renderer;
}

/**
 * Get GPU information from renderer
 * 
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @returns {string} GPU info
 */
function getGPUInfo(renderer) {
    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    if (debugInfo) {
        return `${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`;
    }
    
    return 'Unknown GPU';
}

/**
 * Setup post-processing effects
 * 
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {THREE.Scene} scene - The scene to render
 * @param {THREE.Camera} camera - The camera to use
 * @param {Object} config - Post-processing configuration
 * @returns {EffectComposer} Configured effect composer
 */
export function setupPostProcessing(renderer, scene, camera, config = {}) {
    // Merge default config with provided options
    const postConfig = {
        ...DEFAULT_POST_CONFIG,
        ...config,
        bloom: { ...DEFAULT_POST_CONFIG.bloom, ...(config.bloom || {}) },
        fxaa: { ...DEFAULT_POST_CONFIG.fxaa, ...(config.fxaa || {}) },
        gammaCorrection: { ...DEFAULT_POST_CONFIG.gammaCorrection, ...(config.gammaCorrection || {}) }
    };
    
    // If post-processing is disabled, return null
    if (!postConfig.enabled) {
        return null;
    }
    
    // Create effect composer
    const composer = new EffectComposer(renderer);
    
    // Add render pass (always required)
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Add bloom pass if enabled
    if (postConfig.bloom.enabled) {
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            postConfig.bloom.strength,
            postConfig.bloom.radius,
            postConfig.bloom.threshold
        );
        composer.addPass(bloomPass);
    }
    
    // Add FXAA pass if enabled
    if (postConfig.fxaa.enabled) {
        const fxaaPass = new ShaderPass(FXAAShader);
        
        // Configure FXAA resolution
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass.material.uniforms.resolution.value.set(
            1 / (window.innerWidth * pixelRatio),
            1 / (window.innerHeight * pixelRatio)
        );
        
        composer.addPass(fxaaPass);
    }
    
    // Add gamma correction pass if enabled
    if (postConfig.gammaCorrection.enabled) {
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        composer.addPass(gammaCorrectionPass);
    }
    
    // Configure composer size
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.setPixelRatio(renderer.getPixelRatio());
    
    return composer;
}

/**
 * Handle window resize for renderer and post-processing
 * 
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {THREE.Camera} camera - The camera to update
 * @param {EffectComposer} composer - The effect composer (optional)
 */
export function handleResize(renderer, camera, composer = null) {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    // Resize renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Resize composer if provided
    if (composer) {
        composer.setSize(window.innerWidth, window.innerHeight);
        
        // Update FXAA resolution
        const fxaaPass = composer.passes.find(pass => 
            pass.material && pass.material.uniforms && pass.material.uniforms.resolution
        );
        
        if (fxaaPass) {
            const pixelRatio = renderer.getPixelRatio();
            fxaaPass.material.uniforms.resolution.value.set(
                1 / (window.innerWidth * pixelRatio),
                1 / (window.innerHeight * pixelRatio)
            );
        }
    }
}

/**
 * Configure renderer for optimal shadow quality
 * 
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {Object} config - Shadow configuration
 */
export function setupShadowsQuality(renderer, config = {}) {
    // Default shadow configuration
    const shadowConfig = {
        type: THREE.PCFSoftShadowMap,
        mapSize: 2048,
        ...config
    };
    
    // Configure shadow map
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = shadowConfig.type;
    renderer.shadowMap.autoUpdate = true;
    
    // Return configuration function for lights
    return (light) => {
        if (light.shadow) {
            light.shadow.mapSize.width = shadowConfig.mapSize;
            light.shadow.mapSize.height = shadowConfig.mapSize;
            light.shadow.bias = -0.0001;
            light.shadow.normalBias = 0.02;
        }
    };
}

/**
 * Create a helper function for taking high-quality screenshots
 * 
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {THREE.Scene} scene - The scene to render
 * @param {THREE.Camera} camera - The camera to use
 * @param {Object} options - Screenshot options
 * @returns {Function} Screenshot function
 */
export function createScreenshotTool(renderer, scene, camera, options = {}) {
    const screenshotOptions = {
        width: 3840,  // 4K resolution width
        height: 2160, // 4K resolution height
        fileName: 'portfolio-screenshot',
        mimeType: 'image/png',
        ...options
    };
    
    return () => {
        // Store original renderer size and pixel ratio
        const originalSize = {
            width: renderer.domElement.width,
            height: renderer.domElement.height,
            pixelRatio: renderer.getPixelRatio()
        };
        
        // Resize renderer to screenshot size
        renderer.setSize(screenshotOptions.width, screenshotOptions.height, false);
        renderer.setPixelRatio(1);
        
        // Render the scene
        renderer.render(scene, camera);
        
        // Create download link
        try {
            const link = document.createElement('a');
            link.download = `${screenshotOptions.fileName}-${Date.now()}.png`;
            link.href = renderer.domElement.toDataURL(screenshotOptions.mimeType);
            link.click();
        } catch (error) {
            console.error('Error creating screenshot:', error);
        }
        
        // Restore original size and pixel ratio
        renderer.setSize(originalSize.width, originalSize.height, false);
        renderer.setPixelRatio(originalSize.pixelRatio);
        
        console.log(`Screenshot saved (${screenshotOptions.width}x${screenshotOptions.height})`);
    };
}

/**
 * Implements a performance monitor to track renderer stats
 * 
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @returns {Object} Performance monitoring tools
 */
export function createPerformanceMonitor(renderer) {
    // Store performance data
    const performanceData = {
        fps: 0,
        triangles: 0,
        calls: 0,
        lastUpdate: performance.now(),
        frameCount: 0,
        updateInterval: 1000, // Update interval in ms
    };
    
    // Create info panel if in development mode
    let infoPanel = null;
    
    if (process.env.NODE_ENV === 'development') {
        infoPanel = document.createElement('div');
        infoPanel.style.position = 'fixed';
        infoPanel.style.bottom = '10px';
        infoPanel.style.right = '10px';
        infoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        infoPanel.style.color = 'white';
        infoPanel.style.padding = '10px';
        infoPanel.style.fontFamily = 'monospace';
        infoPanel.style.fontSize = '12px';
        infoPanel.style.zIndex = 1000;
        document.body.appendChild(infoPanel);
    }
    
    // Update function to be called in animation loop
    const update = () => {
        performanceData.frameCount++;
        
        const now = performance.now();
        const elapsed = now - performanceData.lastUpdate;
        
        if (elapsed >= performanceData.updateInterval) {
            // Calculate FPS
            performanceData.fps = Math.round((performanceData.frameCount * 1000) / elapsed);
            performanceData.frameCount = 0;
            performanceData.lastUpdate = now;
            
            // Get renderer info
            const info = renderer.info;
            performanceData.triangles = info.render.triangles;
            performanceData.calls = info.render.calls;
            
            // Update info panel if available
            if (infoPanel) {
                infoPanel.innerHTML = `
                    FPS: ${performanceData.fps}<br>
                    Triangles: ${performanceData.triangles.toLocaleString()}<br>
                    Draw Calls: ${performanceData.calls}
                `;
            }
        }
    };
    
    // Return monitor object
    return {
        update,
        getData: () => ({ ...performanceData }),
        toggleVisibility: () => {
            if (infoPanel) {
                infoPanel.style.display = infoPanel.style.display === 'none' ? 'block' : 'none';
            }
        },
        destroy: () => {
            if (infoPanel && infoPanel.parentNode) {
                infoPanel.parentNode.removeChild(infoPanel);
            }
        }
    };
}

/**
 * Clean up renderer resources
 * 
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer
 * @param {EffectComposer} composer - The effect composer (optional)
 */
export function disposeRenderer(renderer, composer = null) {
    // Dispose composer passes if available
    if (composer) {
        composer.passes.forEach(pass => {
            if (pass.dispose) {
                pass.dispose();
            }
        });
    }
    
    // Dispose renderer
    renderer.dispose();
    
    console.log('Renderer resources disposed');
}