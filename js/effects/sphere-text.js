/**
 * Sphere Text Effect
 * Text-textured sphere with wave distortion and depth-based shading
 */

import EffectBase from './effect-base.js';
import { createTextTexture, updateTextTexture } from '../utils/text-texture.js';

export class SphereTextEffect extends EffectBase {
    static get metadata() {
        return {
            id: 'sphere-text',
            name: 'Sphere Text',
            icon: '🌐',
            description: 'Text on a rotating sphere with wave distortion'
        };
    }

    static get exportDefaults() {
        return {
            type: 'loop',
            recommendedDuration: 5,
            minDuration: 2,
            maxDuration: 20,
            seamlessLoop: true
        };
    }

    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),
            text: {
                ...super.getSettingsSchema().text,
                default: 'SPHERE'
            },
            fontSize: {
                ...super.getSettingsSchema().fontSize,
                default: 80
            },
            // Sphere-specific settings
            sphereRadius: {
                type: 'number',
                default: 3,
                min: 1,
                max: 10,
                step: 0.5,
                label: 'Sphere Radius',
                group: 'effect'
            },
            sphereSegments: {
                type: 'number',
                default: 64,
                min: 16,
                max: 128,
                step: 8,
                label: 'Sphere Detail',
                group: 'effect'
            },
            uvRepeat: {
                type: 'number',
                default: 12,
                min: 1,
                max: 24,
                step: 1,
                label: 'UV Tiling',
                group: 'effect'
            },
            waveAmplitude: {
                type: 'number',
                default: 5,
                min: -10,
                max: 10,
                step: 0.5,
                label: 'Wave Distortion',
                group: 'effect'
            },
            animationSpeed: {
                type: 'number',
                default: 1.5,
                min: 0,
                max: 5,
                step: 0.1,
                label: 'Animation Speed',
                group: 'effect'
            },
            // Color settings
            textColor: {
                type: 'color',
                default: '#ffffff',
                label: 'Text Color',
                group: 'colors'
            },
            surfaceColor: {
                type: 'color',
                default: '#4444ff',
                label: 'Surface Color',
                group: 'colors'
            },
            shadowColor: {
                type: 'color',
                default: '#000000',
                label: 'Depth Color',
                group: 'colors'
            },
            backgroundColor: {
                type: 'color',
                default: '#0a0a0a',
                label: 'Background Color',
                group: 'colors'
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

        // Create geometry
        this.createGeometry();

        // Create material with custom shader
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: { value: this.textTextureData.texture },
                uTime: { value: 0 },
                uRepeat: { value: this.settings.uvRepeat },
                uWaveAmp: { value: this.settings.waveAmplitude },
                uDepthColor: { value: new THREE.Color(this.settings.shadowColor) },
                uTextColor: { value: new THREE.Color(this.settings.textColor) },
                uSphereRadius: { value: this.settings.sphereRadius }
            },
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            side: THREE.DoubleSide
        });

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        // Set scene background
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
    }

    createGeometry() {
        if (this.geometry) {
            this.geometry.dispose();
        }

        this.geometry = new THREE.SphereGeometry(
            this.settings.sphereRadius,
            this.settings.sphereSegments,
            this.settings.sphereSegments
        );
    }

    getVertexShader() {
        return `
            varying vec2 vUv;
            varying vec3 vPosition;

            uniform float uTime;

            void main() {
                vUv = uv;
                vPosition = position; // For depth calculation

                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    getFragmentShader() {
        return `
            varying vec2 vUv;
            varying vec3 vPosition;

            uniform float uTime;
            uniform sampler2D uTexture;
            uniform float uRepeat;
            uniform float uWaveAmp;
            uniform vec3 uDepthColor;
            uniform vec3 uTextColor;
            uniform float uSphereRadius;

            void main() {
                // UV animation with sine wave distortion
                float time = uTime;
                vec2 repeat = vec2(uRepeat, uRepeat);

                // Horizontal scroll + vertical sine wave distortion
                vec2 uv = fract(vUv * repeat + vec2(sin(vUv.y * 1.0) * uWaveAmp, time));

                // Texture sampling
                vec3 texture = texture2D(uTexture, uv).rgb;

                // Z-position to 0-1 range (for sphere: -radius to +radius → 0 to 1)
                float depth = clamp((vPosition.z / uSphereRadius) * 0.5 + 0.5, 0.0, 1.0);

                // Mix: back dark (Depth Color), front bright (Texture)
                vec3 fragColor = mix(uDepthColor, texture * uTextColor, depth);

                gl_FragColor = vec4(fragColor, 1.0);
            }
        `;
    }

    update(deltaTime, elapsedTime) {
        if (!this.material) return;

        // Apply animation speed multiplier
        const speed = this.settings.animationSpeed || 1.5;
        this.material.uniforms.uTime.value = elapsedTime * speed;
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

            case 'shadowColor':
                if (this.material && this.material.uniforms.uDepthColor) {
                    this.material.uniforms.uDepthColor.value = new THREE.Color(value);
                }
                break;

            case 'uvRepeat':
                if (this.material && this.material.uniforms.uRepeat) {
                    this.material.uniforms.uRepeat.value = value;
                }
                break;

            case 'waveAmplitude':
                if (this.material && this.material.uniforms.uWaveAmp) {
                    this.material.uniforms.uWaveAmp.value = value;
                }
                break;

            case 'sphereRadius':
                if (this.material && this.material.uniforms.uSphereRadius) {
                    this.material.uniforms.uSphereRadius.value = value;
                }
                // Recreate geometry
                this.createGeometry();
                if (this.mesh) {
                    this.mesh.geometry = this.geometry;
                }
                break;

            case 'sphereSegments':
                // Recreate geometry with new detail level
                this.createGeometry();
                if (this.mesh) {
                    this.mesh.geometry = this.geometry;
                }
                break;

            case 'animationSpeed':
                // Speed is applied in update(), no immediate action needed
                break;
        }
    }

    /**
     * Calculate perfect loop duration
     * For horizontal scroll: one complete UV repeat = uTime advances by 1.0
     */
    calculateExportSuggestion() {
        const speed = this.settings.animationSpeed || 1.5;

        // One complete horizontal scroll = uTime from 0 to 1
        // Since uTime = elapsedTime * speed, we need elapsedTime = 1 / speed
        const period = 1.0 / speed;

        return {
            duration: period,
            loopPoint: period,
            isSeamless: true,
            confidence: 'high',
            explanation: `One scroll cycle (${period.toFixed(1)}s at speed ${speed})`
        };
    }

    /**
     * Reset animation to t=0 for export
     */
    reset() {
        if (this.material && this.material.uniforms.uTime) {
            this.material.uniforms.uTime.value = 0;
        }
    }

    resize(width, height) {
        // No special resize handling needed
    }

    destroy() {
        if (this.textTextureData) {
            this.textTextureData.texture.dispose();
        }
        super.destroy();
    }
}

export default SphereTextEffect;
