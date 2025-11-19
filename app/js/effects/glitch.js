/**
 * Glitch Effect
 * VHS/Digital glitch effect with post-processing
 * Features: RGB split, scanlines, noise, block displacement
 */

import EffectBase from './effect-base.js';
import { createTextTexture, updateTextTexture } from '../utils/text-texture.js';
import GlitchShader from './glitch-shader.js';

export class GlitchEffect extends EffectBase {
    static get metadata() {
        return {
            id: 'glitch',
            name: 'Glitch',
            icon: '📺',
            description: 'VHS/digital glitch effect with RGB split and scanlines'
        };
    }

    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),
            text: {
                ...super.getSettingsSchema().text,
                default: 'GLITCH'
            },
            // Glitch-specific settings
            glitchIntensity: {
                type: 'number',
                default: 0.5,
                min: 0,
                max: 1,
                step: 0.01,
                label: 'Glitch Intensity'
            },
            rgbShift: {
                type: 'number',
                default: 0.003,
                min: 0,
                max: 0.02,
                step: 0.001,
                label: 'RGB Shift'
            },
            scanlines: {
                type: 'number',
                default: 1.0,
                min: 0,
                max: 2,
                step: 0.1,
                label: 'Scanlines'
            },
            noiseIntensity: {
                type: 'number',
                default: 0.1,
                min: 0,
                max: 0.5,
                step: 0.01,
                label: 'Noise Intensity'
            },
            blockSize: {
                type: 'number',
                default: 0.05,
                min: 0.01,
                max: 0.2,
                step: 0.01,
                label: 'Block Size'
            },
            distortion: {
                type: 'number',
                default: 0.1,
                min: 0,
                max: 0.5,
                step: 0.01,
                label: 'Distortion'
            },
            rotationSpeed: {
                type: 'number',
                default: 0.2,
                min: 0,
                max: 2,
                step: 0.1,
                label: 'Rotation Speed'
            }
        };
    }

    init(scene, camera, renderer) {
        super.init(scene, camera, renderer);

        // Create text texture
        this.textTextureData = createTextTexture({
            text: this.settings.text,
            fontSize: this.settings.fontSize,
            fontFamily: this.settings.fontFamily,
            letterSpacing: this.settings.letterSpacing,
            padding: this.settings.padding,
            fitToTile: this.settings.fitToTile,
            textColor: this.settings.textColor,
            backgroundColor: this.settings.surfaceColor
        });

        // Create a simple plane to display text
        this.geometry = new THREE.PlaneGeometry(20, 10);
        this.material = new THREE.MeshBasicMaterial({
            map: this.textTextureData.texture,
            transparent: false
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        // Set scene background
        this.scene.background = new THREE.Color(this.settings.backgroundColor);

        // Setup post-processing
        this.setupPostProcessing();
    }

    setupPostProcessing() {
        // Check if EffectComposer is available
        if (typeof THREE.EffectComposer === 'undefined') {
            console.warn('EffectComposer not available, loading from CDN...');
            this.loadPostProcessingLibraries();
            return;
        }

        this.createComposer();
    }

    createComposer() {
        // Create EffectComposer
        this.composer = new THREE.EffectComposer(this.renderer);

        // Render pass (renders the scene)
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Glitch shader pass
        this.glitchPass = new THREE.ShaderPass(GlitchShader);
        this.glitchPass.uniforms.uGlitchIntensity.value = this.settings.glitchIntensity;
        this.glitchPass.uniforms.uRGBShift.value = this.settings.rgbShift;
        this.glitchPass.uniforms.uScanlines.value = this.settings.scanlines;
        this.glitchPass.uniforms.uNoiseIntensity.value = this.settings.noiseIntensity;
        this.glitchPass.uniforms.uBlockSize.value = this.settings.blockSize;
        this.glitchPass.uniforms.uDistortion.value = this.settings.distortion;
        this.glitchPass.renderToScreen = true;
        this.composer.addPass(this.glitchPass);

        console.log('✓ Post-processing composer created');
    }

    loadPostProcessingLibraries() {
        // Load EffectComposer and passes from CDN
        const scripts = [
            'https://unpkg.com/three@0.115.0/examples/js/postprocessing/EffectComposer.js',
            'https://unpkg.com/three@0.115.0/examples/js/postprocessing/RenderPass.js',
            'https://unpkg.com/three@0.115.0/examples/js/postprocessing/ShaderPass.js',
            'https://unpkg.com/three@0.115.0/examples/js/shaders/CopyShader.js'
        ];

        let loadedCount = 0;

        scripts.forEach((src) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loadedCount++;
                if (loadedCount === scripts.length) {
                    console.log('✓ Post-processing libraries loaded');
                    this.createComposer();
                }
            };
            script.onerror = () => {
                console.error(`Failed to load: ${src}`);
            };
            document.head.appendChild(script);
        });
    }

    usesPostProcessing() {
        return true;
    }

    getComposer() {
        return this.composer;
    }

    update(deltaTime, elapsedTime) {
        if (!this.initialized) return;

        // Update glitch shader time
        if (this.glitchPass) {
            this.glitchPass.uniforms.uTime.value = elapsedTime;
        }

        // Rotate mesh for visual interest
        if (this.mesh) {
            this.mesh.rotation.z += deltaTime * this.settings.rotationSpeed * 0.1;
        }

        // Update composer size if needed
        if (this.composer) {
            const width = this.renderer.domElement.width;
            const height = this.renderer.domElement.height;
            if (this.composer.width !== width || this.composer.height !== height) {
                this.composer.setSize(width, height);
            }
        }
    }

    onSettingChanged(key, value) {
        if (!this.initialized) return;

        switch (key) {
            case 'text':
            case 'fontSize':
            case 'fontFamily':
            case 'letterSpacing':
            case 'padding':
            case 'fitToTile':
            case 'textColor':
            case 'surfaceColor':
                // Update text texture
                updateTextTexture(this.textTextureData, {
                    text: this.settings.text,
                    fontSize: this.settings.fontSize,
                    fontFamily: this.settings.fontFamily,
                    letterSpacing: this.settings.letterSpacing,
                    padding: this.settings.padding,
                    fitToTile: this.settings.fitToTile,
                    textColor: this.settings.textColor,
                    backgroundColor: this.settings.surfaceColor
                });
                break;

            case 'backgroundColor':
                this.scene.background = new THREE.Color(value);
                break;

            case 'glitchIntensity':
                if (this.glitchPass) {
                    this.glitchPass.uniforms.uGlitchIntensity.value = value;
                }
                break;

            case 'rgbShift':
                if (this.glitchPass) {
                    this.glitchPass.uniforms.uRGBShift.value = value;
                }
                break;

            case 'scanlines':
                if (this.glitchPass) {
                    this.glitchPass.uniforms.uScanlines.value = value;
                }
                break;

            case 'noiseIntensity':
                if (this.glitchPass) {
                    this.glitchPass.uniforms.uNoiseIntensity.value = value;
                }
                break;

            case 'blockSize':
                if (this.glitchPass) {
                    this.glitchPass.uniforms.uBlockSize.value = value;
                }
                break;

            case 'distortion':
                if (this.glitchPass) {
                    this.glitchPass.uniforms.uDistortion.value = value;
                }
                break;

            case 'rotationSpeed':
                // Used directly in update()
                break;
        }
    }

    resize(width, height) {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }

    destroy() {
        if (this.textTextureData) {
            this.textTextureData.texture.dispose();
        }

        if (this.composer) {
            // Dispose composer passes
            this.composer.passes.forEach(pass => {
                if (pass.dispose) pass.dispose();
            });
        }

        super.destroy();
    }
}

export default GlitchEffect;
