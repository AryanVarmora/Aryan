/**
 * loader.js - Asset Loading System
 * 3D Portfolio Carousel
 * 
 * This file manages the loading of all assets (models, textures, fonts, etc.)
 * with proper progress tracking and error handling.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Asset manager class
class AssetManager {
    constructor() {
        // Initialize loaders
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new GLTFLoader();
        this.fontLoader = new FontLoader();
        this.svgLoader = new SVGLoader();
        this.audioLoader = new THREE.AudioLoader();
        
        // Setup DRACO loader for compressed models
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // Asset storage
        this.textures = {};
        this.models = {};
        this.fonts = {};
        this.svgs = {};
        this.audio = {};
        
        // Loading tracking
        this.loadingQueue = [];
        this.totalItems = 0;
        this.loadedItems = 0;
        
        // Callbacks
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
        this.onErrorCallback = null;
    }
    
    /**
     * Set loading callbacks
     * 
     * @param {Object} callbacks - Callback functions
     */
    setCallbacks(callbacks) {
        if (callbacks.onProgress) this.onProgressCallback = callbacks.onProgress;
        if (callbacks.onComplete) this.onCompleteCallback = callbacks.onComplete;
        if (callbacks.onError) this.onErrorCallback = callbacks.onError;
    }
    
    /**
     * Update loading progress
     */
    updateProgress() {
        this.loadedItems++;
        const progress = (this.loadedItems / this.totalItems) * 100;
        
        if (this.onProgressCallback) {
            this.onProgressCallback(progress, this.loadedItems, this.totalItems);
        }
        
        // Check if all assets are loaded
        if (this.loadedItems === this.totalItems && this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }
    
    /**
     * Handle loading error
     * 
     * @param {string} assetType - Type of asset
     * @param {string} url - Asset URL
     * @param {Error} error - Error object
     */
    handleError(assetType, url, error) {
        console.error(`Error loading ${assetType}: ${url}`, error);
        
        if (this.onErrorCallback) {
            this.onErrorCallback(assetType, url, error);
        }
        
        // Still update progress to prevent loading from getting stuck
        this.updateProgress();
    }
    
    /**
     * Queue a texture for loading
     * 
     * @param {string} name - Texture identifier
     * @param {string} url - Texture URL
     * @param {Object} options - Texture options
     */
    queueTexture(name, url, options = {}) {
        this.loadingQueue.push({
            type: 'texture',
            name,
            url,
            options
        });
        this.totalItems++;
    }
    
    /**
     * Queue a model for loading
     * 
     * @param {string} name - Model identifier
     * @param {string} url - Model URL
     * @param {Object} options - Model options
     */
    queueModel(name, url, options = {}) {
        this.loadingQueue.push({
            type: 'model',
            name,
            url,
            options
        });
        this.totalItems++;
    }
    
    /**
     * Queue a font for loading
     * 
     * @param {string} name - Font identifier
     * @param {string} url - Font URL
     */
    queueFont(name, url) {
        this.loadingQueue.push({
            type: 'font',
            name,
            url
        });
        this.totalItems++;
    }
    
    /**
     * Queue an SVG for loading
     * 
     * @param {string} name - SVG identifier
     * @param {string} url - SVG URL
     */
    queueSVG(name, url) {
        this.loadingQueue.push({
            type: 'svg',
            name,
            url
        });
        this.totalItems++;
    }
    
    /**
     * Queue an audio file for loading
     * 
     * @param {string} name - Audio identifier
     * @param {string} url - Audio URL
     */
    queueAudio(name, url) {
        this.loadingQueue.push({
            type: 'audio',
            name,
            url
        });
        this.totalItems++;
    }
    
    /**
     * Load a texture
     * 
     * @param {string} name - Texture identifier
     * @param {string} url - Texture URL
     * @param {Object} options - Texture options
     * @returns {Promise} Promise that resolves with the texture
     */
    loadTexture(name, url, options = {}) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => {
                    // Apply texture options
                    if (options.repeat) {
                        texture.repeat.set(options.repeat.x, options.repeat.y);
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                    }
                    
                    if (options.flipY !== undefined) {
                        texture.flipY = options.flipY;
                    }
                    
                    if (options.encoding) {
                        texture.encoding = options.encoding;
                    }
                    
                    if (options.anisotropy) {
                        const renderer = options.renderer || null;
                        const maxAnisotropy = renderer ? 
                            renderer.capabilities.getMaxAnisotropy() : 
                            options.anisotropy;
                            
                        texture.anisotropy = maxAnisotropy;
                    }
                    
                    // Store texture
                    this.textures[name] = texture;
                    this.updateProgress();
                    resolve(texture);
                },
                undefined, // onProgress is not supported by THREE.TextureLoader
                (error) => {
                    this.handleError('texture', url, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load a model
     * 
     * @param {string} name - Model identifier
     * @param {string} url - Model URL
     * @param {Object} options - Model options
     * @returns {Promise} Promise that resolves with the model
     */
    loadModel(name, url, options = {}) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => {
                    // Apply model options
                    if (options.scale) {
                        gltf.scene.scale.set(
                            options.scale,
                            options.scale,
                            options.scale
                        );
                    }
                    
                    if (options.position) {
                        gltf.scene.position.set(
                            options.position.x,
                            options.position.y,
                            options.position.z
                        );
                    }
                    
                    if (options.rotation) {
                        gltf.scene.rotation.set(
                            options.rotation.x,
                            options.rotation.y,
                            options.rotation.z
                        );
                    }
                    
                    // Setup shadows
                    if (options.castShadow || options.receiveShadow) {
                        gltf.scene.traverse((child) => {
                            if (child.isMesh) {
                                if (options.castShadow) {
                                    child.castShadow = true;
                                }
                                if (options.receiveShadow) {
                                    child.receiveShadow = true;
                                }
                            }
                        });
                    }
                    
                    // Store model
                    this.models[name] = gltf;
                    this.updateProgress();
                    resolve(gltf);
                },
                (xhr) => {
                    // Model loading progress is reported but not used for overall progress
                    // We can add more granular progress tracking if needed
                },
                (error) => {
                    this.handleError('model', url, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load a font
     * 
     * @param {string} name - Font identifier
     * @param {string} url - Font URL
     * @returns {Promise} Promise that resolves with the font
     */
    loadFont(name, url) {
        return new Promise((resolve, reject) => {
            this.fontLoader.load(
                url,
                (font) => {
                    this.fonts[name] = font;
                    this.updateProgress();
                    resolve(font);
                },
                undefined, // onProgress is not supported by FontLoader
                (error) => {
                    this.handleError('font', url, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load an SVG
     * 
     * @param {string} name - SVG identifier
     * @param {string} url - SVG URL
     * @returns {Promise} Promise that resolves with the SVG data
     */
    loadSVG(name, url) {
        return new Promise((resolve, reject) => {
            this.svgLoader.load(
                url,
                (data) => {
                    this.svgs[name] = data;
                    this.updateProgress();
                    resolve(data);
                },
                undefined, // onProgress is not supported by SVGLoader
                (error) => {
                    this.handleError('svg', url, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Load an audio file
     * 
     * @param {string} name - Audio identifier
     * @param {string} url - Audio URL
     * @returns {Promise} Promise that resolves with the audio buffer
     */
    loadAudio(name, url) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                (buffer) => {
                    this.audio[name] = buffer;
                    this.updateProgress();
                    resolve(buffer);
                },
                undefined, // onProgress is not supported by AudioLoader
                (error) => {
                    this.handleError('audio', url, error);
                    reject(error);
                }
            );
        });
    }
    
    /**
     * Start loading all queued assets
     * 
     * @returns {Promise} Promise that resolves when all assets are loaded
     */
    loadAll() {
        if (this.loadingQueue.length === 0) {
            if (this.onCompleteCallback) {
                this.onCompleteCallback();
            }
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // Set completion callback
            const originalCompleteCallback = this.onCompleteCallback;
            this.onCompleteCallback = () => {
                if (originalCompleteCallback) {
                    originalCompleteCallback();
                }
                resolve({
                    textures: this.textures,
                    models: this.models,
                    fonts: this.fonts,
                    svgs: this.svgs,
                    audio: this.audio
                });
            };
            
            // Load each asset
            this.loadingQueue.forEach((item) => {
                switch (item.type) {
                    case 'texture':
                        this.loadTexture(item.name, item.url, item.options).catch(reject);
                        break;
                    case 'model':
                        this.loadModel(item.name, item.url, item.options).catch(reject);
                        break;
                    case 'font':
                        this.loadFont(item.name, item.url).catch(reject);
                        break;
                    case 'svg':
                        this.loadSVG(item.name, item.url).catch(reject);
                        break;
                    case 'audio':
                        this.loadAudio(item.name, item.url).catch(reject);
                        break;
                }
            });
        });
    }
    
    /**
     * Get a loaded texture
     * 
     * @param {string} name - Texture identifier
     * @returns {THREE.Texture} The texture
     */
    getTexture(name) {
        return this.textures[name];
    }
    
    /**
     * Get a loaded model
     * 
     * @param {string} name - Model identifier
     * @returns {Object} The model (GLTF)
     */
    getModel(name) {
        return this.models[name];
    }
    
    /**
     * Get a loaded font
     * 
     * @param {string} name - Font identifier
     * @returns {Object} The font
     */
    getFont(name) {
        return this.fonts[name];
    }
    
    /**
     * Get a loaded SVG
     * 
     * @param {string} name - SVG identifier
     * @returns {Object} The SVG data
     */
    getSVG(name) {
        return this.svgs[name];
    }
    
    /**
     * Get a loaded audio buffer
     * 
     * @param {string} name - Audio identifier
     * @returns {AudioBuffer} The audio buffer
     */
    getAudio(name) {
        return this.audio[name];
    }
    
    /**
     * Create a clone of a loaded model
     * 
     * @param {string} name - Model identifier
     * @returns {THREE.Group} Cloned model scene
     */
    cloneModel(name) {
        const model = this.models[name];
        
        if (!model) {
            console.warn(`Model "${name}" not found`);
            return null;
        }
        
        // Clone the model
        return SkeletonUtils.clone(model.scene);
    }
    
    /**
     * Get loading progress
     * 
     * @returns {number} Progress percentage
     */
    getProgress() {
        return (this.loadedItems / this.totalItems) * 100;
    }
    
    /**
     * Reset the asset manager
     */
    reset() {
        this.loadingQueue = [];
        this.totalItems = 0;
        this.loadedItems = 0;
    }
    
    /**
     * Dispose of all loaded assets
     */
    dispose() {
        // Dispose textures
        Object.values(this.textures).forEach(texture => {
            texture.dispose();
        });
        
        // Dispose geometries and materials from models
        Object.values(this.models).forEach(model => {
            model.scene.traverse(child => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => this.disposeMaterial(material));
                        } else {
                            this.disposeMaterial(child.material);
                        }
                    }
                }
            });
        });
        
        // Clear references
        this.textures = {};
        this.models = {};
        this.fonts = {};
        this.svgs = {};
        this.audio = {};
        
        console.log('All assets disposed');
    }
    
    /**
     * Dispose a material and its textures
     * 
     * @param {THREE.Material} material - Material to dispose
     */
    disposeMaterial(material) {
        // Dispose textures associated with the material
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.displacementMap) material.displacementMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.emissiveMap) material.emissiveMap.dispose();
        if (material.alphaMap) material.alphaMap.dispose();
        if (material.roughnessMap) material.roughnessMap.dispose();
        if (material.metalnessMap) material.metalnessMap.dispose();
        if (material.envMap) material.envMap.dispose();
        
        // Dispose the material itself
        material.dispose();
    }
}

// Create singleton instance
const assetManager = new AssetManager();

// Export the manager
export default assetManager;

// Helper functions to simplify usage
export function loadCarouselAssets() {
    // Queue all essential assets for the carousel
    
    // Textures
    assetManager.queueTexture('noiseTex', 'assets/textures/noise.jpg', { 
        repeat: { x: 4, y: 4 } 
    });
    assetManager.queueTexture('starsTex', 'assets/textures/stars.jpg');
    assetManager.queueTexture('platformTex', 'assets/textures/platform_normal.jpg');
    assetManager.queueTexture('glowTex', 'assets/textures/glow.png', {
        repeat: { x: 1, y: 1 }
    });
    
    // Models
    assetManager.queueModel('platform', 'assets/models/platform.glb', {
        castShadow: true,
        receiveShadow: true
    });
    assetManager.queueModel('projectDisplay', 'assets/models/project_display.glb', {
        castShadow: true,
        receiveShadow: true
    });
    assetManager.queueModel('achievementShelf', 'assets/models/achievement_shelf.glb', {
        castShadow: true,
        receiveShadow: true
    });
    assetManager.queueModel('skillPlanet', 'assets/models/skill_planet.glb', {
        castShadow: true
    });
    assetManager.queueModel('chillZone', 'assets/models/chill_zone.glb', {
        castShadow: true,
        receiveShadow: true
    });
    
    // Fonts
    assetManager.queueFont('neonFont', 'assets/fonts/neon_font.json');
    
    // Audio
    assetManager.queueAudio('background', 'assets/audio/ambient_loop.mp3');
    assetManager.queueAudio('click', 'assets/audio/click.mp3');
    assetManager.queueAudio('hover', 'assets/audio/hover.mp3');
    
    return assetManager.loadAll();
}

// SkeletonUtils for cloning models with skeletons
// Copied from Three.js examples as it's not exported in the main package
export const SkeletonUtils = {
    clone: function(source) {
        const sourceLookup = new Map();
        const cloneLookup = new Map();
        
        const clone = source.clone();
        
        parallelTraverse(source, clone, function(sourceNode, clonedNode) {
            sourceLookup.set(clonedNode, sourceNode);
            cloneLookup.set(sourceNode, clonedNode);
        });
        
        clone.traverse(function(node) {
            if (!node.isSkinnedMesh) return;
            
            const clonedMesh = node;
            const sourceMesh = sourceLookup.get(node);
            const sourceBones = sourceMesh.skeleton.bones;
            
            clonedMesh.skeleton = sourceMesh.skeleton.clone();
            clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
            
            clonedMesh.skeleton.bones = sourceBones.map(function(bone) {
                return cloneLookup.get(bone);
            });
            
            clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
        });
        
        return clone;
    }
};

// Helper function for SkeletonUtils
function parallelTraverse(a, b, callback) {
    callback(a, b);
    
    for (let i = 0; i < a.children.length; i++) {
        parallelTraverse(a.children[i], b.children[i], callback);
    }
}