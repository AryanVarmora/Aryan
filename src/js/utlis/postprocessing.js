/**
 * postprocessing.js - Visual Effects System
 * 3D Portfolio Carousel
 * 
 * This file handles the setup and management of post-processing effects
 * to create the neon glow, bloom, and other visual enhancements.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

// Custom vignette shader
const VignetteShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "offset": { value: 1.0 },
        "darkness": { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        uniform float darkness;
        varying vec2 vUv;
        void main() {
            // Calculate vignette
            vec2 uv = vUv;
            uv *= 1.0 - uv.yx;
            float vig = uv.x * uv.y * 15.0;
            vig = pow(vig, offset);
            
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb *= 1.0 - darkness * (1.0 - vig);
            
            gl_FragColor = color;
        }
    `
};

// Custom glow shader
const NeonGlowShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "glowColor": { value: new THREE.Color(0x9966ff) },
        "glowIntensity": { value: 0.5 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 glowColor;
        uniform float glowIntensity;
        varying vec2 vUv;
        
        void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            
            // Extract bright areas
            float brightness = max(color.r, max(color.g, color.b));
            float threshold = 0.8;
            
            if (brightness > threshold) {
                // Add glow to bright areas
                float intensity = (brightness - threshold) * glowIntensity;
                color.rgb += glowColor * intensity;
            }
            
            gl_FragColor = color;
        }
    `
};

// Custom chromatic aberration shader
const ChromaticAberrationShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "amount": { value: 0.005 },
        "angle": { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float amount;
        uniform float angle;
        varying vec2 vUv;
        
        void main() {
            vec2 offset = amount * vec2(cos(angle), sin(angle));
            vec4 cr = texture2D(tDiffuse, vUv + offset);
            vec4 cg = texture2D(tDiffuse, vUv);
            vec4 cb = texture2D(tDiffuse, vUv - offset);
            gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
        }
    `
};

// Configuration presets
const POSTPROCESSING_PRESETS = {
    cosmic: {
        bloom: {
            enabled: true,
            strength: 0.7,
            radius: 0.4,
            threshold: 0.85
        },
        rgbShift: {
            enabled: true,
            amount: 0.0015,
            angle: 0.0
        },
        vignette: {
            enabled: true,
            offset: 1.0,
            darkness: 1.0
        },
        chromaticAberration: {
            enabled: true,
            amount: 0.003,
            angle: 0.0
        },
        gammaCorrection: {
            enabled: true
        },
        fxaa: {
            enabled: true
        },
        neonGlow: {
            enabled: true,
            color: 0x9966ff,
            intensity: 0.6
        },
        ssao: {
            enabled: false, // Disabled by default as it's performance-intensive
            radius: 4,
            minDistance: 0.005,
            maxDistance: 0.1
        },
        depthOfField: {
            enabled: false, // Disabled by default, can be enabled for specific sections
            focus: 20.0,
            aperture: 0.0001,
            maxblur: 0.01
        }
    }
};

/**
 * Create and configure post-processing effects
 * 
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {THREE.Scene} scene - Scene
 * @param {THREE.Camera} camera - Camera
 * @param {string} preset - Name of effect preset to use
 * @param {Object} customOptions - Custom overrides for preset
 * @returns {Object} Post-processing controller
 */
export function createPostProcessing(renderer, scene, camera, preset = 'cosmic', customOptions = {}) {
    // Get preset configuration
    const config = { ...POSTPROCESSING_PRESETS[preset] };
    
    // Apply custom overrides
    if (customOptions.bloom) config.bloom = { ...config.bloom, ...customOptions.bloom };
    if (customOptions.rgbShift) config.rgbShift = { ...config.rgbShift, ...customOptions.rgbShift };
    if (customOptions.vignette) config.vignette = { ...config.vignette, ...customOptions.vignette };
    if (customOptions.chromaticAberration) config.chromaticAberration = { ...config.chromaticAberration, ...customOptions.chromaticAberration };
    if (customOptions.gammaCorrection) config.gammaCorrection = { ...config.gammaCorrection, ...customOptions.gammaCorrection };
    if (customOptions.fxaa) config.fxaa = { ...config.fxaa, ...customOptions.fxaa };
    if (customOptions.neonGlow) config.neonGlow = { ...config.neonGlow, ...customOptions.neonGlow };
    if (customOptions.ssao) config.ssao = { ...config.ssao, ...customOptions.ssao };
    if (customOptions.depthOfField) config.depthOfField = { ...config.depthOfField, ...customOptions.depthOfField };
    
    // Create composer
    const composer = new EffectComposer(renderer);
    
    // Store all passes for reference
    const passes = {};
    
    // Add render pass (always required)
    passes.render = new RenderPass(scene, camera);
    composer.addPass(passes.render);
    
    // Add SSAO pass if enabled
    if (config.ssao && config.ssao.enabled) {
        passes.ssao = new SSAOPass(scene, camera, window.innerWidth, window.innerHeight);
        passes.ssao.kernelRadius = config.ssao.radius;
        passes.ssao.minDistance = config.ssao.minDistance;
        passes.ssao.maxDistance = config.ssao.maxDistance;
        composer.addPass(passes.ssao);
    }
    
    // Add depth of field pass if enabled
    if (config.depthOfField && config.depthOfField.enabled) {
        const bokehPass = new BokehPass(scene, camera, {
            focus: config.depthOfField.focus,
            aperture: config.depthOfField.aperture,
            maxblur: config.depthOfField.maxblur
        });
        passes.depthOfField = bokehPass;
        composer.addPass(bokehPass);
    }
    
    // Add bloom pass if enabled
    if (config.bloom && config.bloom.enabled) {
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            config.bloom.strength,
            config.bloom.radius,
            config.bloom.threshold
        );
        passes.bloom = bloomPass;
        composer.addPass(bloomPass);
    }
    
    // Add neon glow pass if enabled
    if (config.neonGlow && config.neonGlow.enabled) {
        const neonGlowPass = new ShaderPass(NeonGlowShader);
        neonGlowPass.uniforms.glowColor.value = new THREE.Color(config.neonGlow.color);
        neonGlowPass.uniforms.glowIntensity.value = config.neonGlow.intensity;
        passes.neonGlow = neonGlowPass;
        composer.addPass(neonGlowPass);
    }
    
    // Add RGB shift pass if enabled
    if (config.rgbShift && config.rgbShift.enabled) {
        const rgbShiftPass = new ShaderPass(RGBShiftShader);
        rgbShiftPass.uniforms.amount.value = config.rgbShift.amount;
        rgbShiftPass.uniforms.angle.value = config.rgbShift.angle;
        passes.rgbShift = rgbShiftPass;
        composer.addPass(rgbShiftPass);
    }
    
    // Add chromatic aberration pass if enabled
    if (config.chromaticAberration && config.chromaticAberration.enabled) {
        const chromaticAberrationPass = new ShaderPass(ChromaticAberrationShader);
        chromaticAberrationPass.uniforms.amount.value = config.chromaticAberration.amount;
        chromaticAberrationPass.uniforms.angle.value = config.chromaticAberration.angle;
        passes.chromaticAberration = chromaticAberrationPass;
        composer.addPass(chromaticAberrationPass);
    }
    
    // Add vignette pass if enabled
    if (config.vignette && config.vignette.enabled) {
        const vignettePass = new ShaderPass(VignetteShader);
        vignettePass.uniforms.offset.value = config.vignette.offset;
        vignettePass.uniforms.darkness.value = config.vignette.darkness;
        passes.vignette = vignettePass;
        composer.addPass(vignettePass);
    }
    
    // Add FXAA pass if enabled
    if (config.fxaa && config.fxaa.enabled) {
        const fxaaPass = new ShaderPass(FXAAShader);
        const pixelRatio = renderer.getPixelRatio();
        fxaaPass.material.uniforms.resolution.value.set(
            1 / (window.innerWidth * pixelRatio),
            1 / (window.innerHeight * pixelRatio)
        );
        passes.fxaa = fxaaPass;
        composer.addPass(fxaaPass);
    }
    
    // Add gamma correction pass if enabled
    if (config.gammaCorrection && config.gammaCorrection.enabled) {
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
        passes.gammaCorrection = gammaCorrectionPass;
        composer.addPass(gammaCorrectionPass);
    }
    
    // Add output pass as the final pass
    passes.output = new OutputPass();
    composer.addPass(passes.output);
    
    // Create post-processing controller
    const postProcessingController = {
        // Get composer
        getComposer: () => composer,
        
        // Get all passes
        getPasses: () => passes,
        
        // Get a specific pass
        getPass: (name) => passes[name],
        
        // Render with effects
        render: () => {
            composer.render();
        },
        
        // Resize handler
        resize: (width, height) => {
            composer.setSize(width, height);
            
            // Update FXAA resolution
            if (passes.fxaa) {
                const pixelRatio = renderer.getPixelRatio();
                passes.fxaa.material.uniforms.resolution.value.set(
                    1 / (width * pixelRatio),
                    1 / (height * pixelRatio)
                );
            }
            
            // Update SSAO size
            if (passes.ssao) {
                passes.ssao.setSize(width, height);
            }
        },
        
        // Enable/disable specific effect
        setEffectEnabled: (name, enabled) => {
            if (passes[name]) {
                passes[name].enabled = enabled;
            }
        },
        
        // Set bloom intensity
        setBloomStrength: (strength) => {
            if (passes.bloom) {
                passes.bloom.strength = strength;
            }
        },
        
        // Set chromatic aberration amount
        setChromaticAberration: (amount) => {
            if (passes.chromaticAberration) {
                passes.chromaticAberration.uniforms.amount.value = amount;
            }
        },
        
        // Focus the depth of field on a target object
        focusOnObject: (targetObject) => {
            if (passes.depthOfField) {
                // Calculate distance from camera to object
                const cameraPosition = camera.position.clone();
                const targetPosition = new THREE.Vector3();
                targetObject.getWorldPosition(targetPosition);
                const distance = cameraPosition.distanceTo(targetPosition);
                
                // Set focus to this distance
                passes.depthOfField.uniforms.focus.value = distance;
            }
        },
        
        // Set depth of field parameters
        setDepthOfField: (params) => {
            if (passes.depthOfField) {
                if (params.focus !== undefined) passes.depthOfField.uniforms.focus.value = params.focus;
                if (params.aperture !== undefined) passes.depthOfField.uniforms.aperture.value = params.aperture;
                if (params.maxblur !== undefined) passes.depthOfField.uniforms.maxblur.value = params.maxblur;
            }
        },
        
        // Create effect transition
        transitionEffect: (name, fromValue, toValue, duration, easing = 'linear') => {
            // Check if the pass exists
            if (!passes[name]) return null;
            
            // Get the property to animate based on effect type
            let property, object;
            
            switch (name) {
                case 'bloom':
                    property = 'strength';
                    object = passes.bloom;
                    break;
                case 'vignette':
                    property = 'darkness';
                    object = passes.vignette.uniforms;
                    break;
                case 'chromaticAberration':
                    property = 'amount';
                    object = passes.chromaticAberration.uniforms;
                    break;
                case 'neonGlow':
                    property = 'glowIntensity';
                    object = passes.neonGlow.uniforms;
                    break;
                default:
                    return null;
            }
            
            // Create the animation
            const startTime = Date.now();
            const endTime = startTime + duration * 1000;
            
            return {
                update: () => {
                    const now = Date.now();
                    
                    if (now >= endTime) {
                        // Animation complete, set final value
                        if (name === 'bloom') {
                            object[property] = toValue;
                        } else {
                            object[property].value = toValue;
                        }
                        return true;
                    }
                    
                    // Calculate progress
                    const progress = (now - startTime) / (endTime - startTime);
                    
                    // Apply easing
                    let easedProgress;
                    switch (easing) {
                        case 'easeIn':
                            easedProgress = progress * progress;
                            break;
                        case 'easeOut':
                            easedProgress = 1 - (1 - progress) * (1 - progress);
                            break;
                        case 'easeInOut':
                            easedProgress = progress < 0.5
                                ? 2 * progress * progress
                                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                            break;
                        default:
                            easedProgress = progress; // Linear
                    }
                    
                    // Calculate current value
                    const value = fromValue + (toValue - fromValue) * easedProgress;
                    
                    // Set value
                    if (name === 'bloom') {
                        object[property] = value;
                    } else {
                        object[property].value = value;
                    }
                    
                    return false; // Animation still in progress
                }
            };
        },
        
        // Dispose resources
        dispose: () => {
            Object.values(passes).forEach(pass => {
                if (pass.dispose) {
                    pass.dispose();
                }
            });
        }
    };
    
    return postProcessingController;
}

/**
 * Create post-processing effects optimized for a specific scene section
 * 
 * @param {Object} postProcessingController - Post-processing controller
 * @param {string} sectionName - Section name
 */
export function optimizeForSection(postProcessingController, sectionName) {
    // Get passes
    const passes = postProcessingController.getPasses();
    
    // Configure effects based on section
    switch (sectionName) {
        case 'project-theater':
            // Enhanced bloom and subtle chromatic aberration for the display screens
            postProcessingController.setBloomStrength(0.9);
            postProcessingController.setChromaticAberration(0.004);
            
            // Enable depth of field focused on project display
            postProcessingController.setEffectEnabled('depthOfField', true);
            postProcessingController.setDepthOfField({
                focus: 15.0,
                aperture: 0.0002,
                maxblur: 0.01
            });
            break;
            
        case 'achievement-shelf':
            // Medium bloom to highlight trophies and certificates
            postProcessingController.setBloomStrength(0.65);
            postProcessingController.setChromaticAberration(0.002);
            
            // Enable depth of field focused on achievements
            postProcessingController.setEffectEnabled('depthOfField', true);
            postProcessingController.setDepthOfField({
                focus: 12.0,
                aperture: 0.00015,
                maxblur: 0.008
            });
            break;
            
        case 'skill-planet':
            // Strong bloom for the glowing planet and orbiting skills
            postProcessingController.setBloomStrength(1.0);
            postProcessingController.setChromaticAberration(0.003);
            
            // Disable depth of field for better overall view
            postProcessingController.setEffectEnabled('depthOfField', false);
            break;
            
        case 'chill-zone':
            // Warm, subtle bloom and minimal aberration for a cozy feel
            postProcessingController.setBloomStrength(0.5);
            postProcessingController.setChromaticAberration(0.001);
            
            // Subtle depth of field
            postProcessingController.setEffectEnabled('depthOfField', true);
            postProcessingController.setDepthOfField({
                focus: 18.0,
                aperture: 0.0001,
                maxblur: 0.005
            });
            break;
            
        default:
            // Reset to default values for overview
            postProcessingController.setBloomStrength(0.7);
            postProcessingController.setChromaticAberration(0.003);
            postProcessingController.setEffectEnabled('depthOfField', false);
            break;
    }
}

/**
 * Create a special effect for section transitions
 * 
 * @param {Object} postProcessingController - Post-processing controller
 * @param {string} fromSection - Starting section name
 * @param {string} toSection - Target section name
 * @returns {Object} Transition controller
 */
export function createSectionTransition(postProcessingController, fromSection, toSection) {
    // Create a collection of effect animations
    const animations = [];
    
    // Add bloom transition
    animations.push(postProcessingController.transitionEffect(
        'bloom',
        postProcessingController.getPasses().bloom.strength,
        1.2, // Peak bloom during transition
        0.6, // Duration in seconds
        'easeOut'
    ));
    
    // Add chromatic aberration transition
    animations.push(postProcessingController.transitionEffect(
        'chromaticAberration',
        postProcessingController.getPasses().chromaticAberration.uniforms.amount.value,
        0.01, // Peak aberration during transition
        0.6, // Duration in seconds
        'easeOut'
    ));
    
    // Return transition controller
    return {
        update: () => {
            let allComplete = true;
            
            // Update all animations
            animations.forEach(animation => {
                if (animation) {
                    const complete = animation.update();
                    if (!complete) {
                        allComplete = false;
                    }
                }
            });
            
            // If all animations are complete, optimize for the target section
            if (allComplete) {
                optimizeForSection(postProcessingController, toSection);
                return true; // Transition complete
            }
            
            return false; // Transition still in progress
        }
    };
}