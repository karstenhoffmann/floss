/**
 * Wave Plane Effect
 * A flat plane with diagonal sine wave displacement and tiled text
 */

import EffectBase from './effect-base.js';
import { createTextTexture, updateTextTexture } from '../utils/text-texture.js';

export class WavePlaneEffect extends EffectBase {
    static get metadata() {
        return {
            id: 'wave-plane',
            name: 'Wave Plane',
            icon: '🌊',
            description: 'Tiled text on a plane with diagonal sine wave displacement'
        };
    }

    static get exportDefaults() {
        return {
            type: 'loop',
            recommendedDuration: 6,
            minDuration: 2,
            maxDuration: 30,
            seamlessLoop: true
        };
    }

    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),
            text: {
                ...super.getSettingsSchema().text,
                default: 'WAVE'
            },
            // Wave Plane specific settings
            tileRepeatX: {
                type: 'number',
                default: 4,
                min: 1,
                max: 20,
                step: 1,
                label: 'Horizontal Tiles',
                group: 'effect'
            },
            tileRepeatY: {
                type: 'number',
                default: 16,
                min: 1,
                max: 40,
                step: 1,
                label: 'Vertical Tiles',
                group: 'effect'
            },
            waveFrequency: {
                type: 'number',
                default: 0.5,
                min: 0.1,
                max: 2.0,
                step: 0.1,
                label: 'Wave Frequency',
                group: 'effect'
            },
            waveAmplitude: {
                type: 'number',
                default: 1.0,
                min: 0,
                max: 5.0,
                step: 0.1,
                label: 'Wave Amplitude',
                group: 'effect'
            },
            planeWidth: {
                type: 'number',
                default: 27,
                min: 5,
                max: 50,
                step: 1,
                label: 'Plane Width',
                group: 'effect'
            },
            planeHeight: {
                type: 'number',
                default: 27,
                min: 5,
                max: 50,
                step: 1,
                label: 'Plane Height',
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
                default: '#000000',
                label: 'Surface Color',
                group: 'colors'
            },
            shadowColor: {
                type: 'color',
                default: '#000000',
                label: 'Shadow Color',
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
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            uniforms: {
                uTime: { value: 0 },
                uTexture: { value: this.textTextureData.texture },
                uRepeat: { value: new THREE.Vector2(this.settings.tileRepeatX, this.settings.tileRepeatY) },
                uFrequency: { value: this.settings.waveFrequency },
                uAmplitude: { value: this.settings.waveAmplitude },
                uShadowColor: { value: new THREE.Color(this.settings.shadowColor) }
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false
        });

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        // Set scene background
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
    }

    createGeometry() {
        const segments = 64;
        this.geometry = new THREE.PlaneGeometry(
            this.settings.planeWidth,
            this.settings.planeHeight,
            segments,
            segments
        );
    }

    getVertexShader() {
        return `
            varying vec2 vUv;
            varying float vWave;

            uniform float uTime;
            uniform float uFrequency;
            uniform float uAmplitude;

            void main() {
                vUv = uv;

                vec3 pos = position;
                float freq = uFrequency;
                float amp = uAmplitude;
                float time = uTime * 3.5;

                // Diagonal wave: sin((x - y) * freq - time)
                pos.z += sin((pos.x - pos.y) * freq - time) * amp;

                vWave = pos.z; // Wave height for fragment shader

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;
    }

    getFragmentShader() {
        return `
            varying vec2 vUv;
            varying float vWave;

            uniform float uTime;
            uniform sampler2D uTexture;
            uniform vec2 uRepeat;
            uniform vec3 uShadowColor;

            float map(float value, float min1, float max1, float min2, float max2) {
                return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
            }

            void main() {
                // Tiled UV coordinates
                vec2 uv = fract(vUv * uRepeat);
                vec4 textureColor = texture2D(uTexture, uv);

                // Map wave height from -1..1 to 0..1
                float wave = map(vWave, -1.0, 1.0, 0.0, 1.0);

                // Mix between shadow (low) and texture (high)
                vec3 finalColor = mix(uShadowColor, textureColor.rgb, wave);
                float finalAlpha = mix(0.5, textureColor.a, wave);

                gl_FragColor = vec4(finalColor, finalAlpha);
            }
        `;
    }

    update(deltaTime, elapsedTime) {
        if (!this.material) return;
        this.material.uniforms.uTime.value = elapsedTime;
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
                if (this.material && this.material.uniforms.uShadowColor) {
                    this.material.uniforms.uShadowColor.value = new THREE.Color(value);
                }
                break;

            case 'tileRepeatX':
            case 'tileRepeatY':
                if (this.material && this.material.uniforms.uRepeat) {
                    this.material.uniforms.uRepeat.value.set(
                        this.settings.tileRepeatX,
                        this.settings.tileRepeatY
                    );
                }
                break;

            case 'waveFrequency':
                if (this.material && this.material.uniforms.uFrequency) {
                    this.material.uniforms.uFrequency.value = value;
                }
                break;

            case 'waveAmplitude':
                if (this.material && this.material.uniforms.uAmplitude) {
                    this.material.uniforms.uAmplitude.value = value;
                }
                break;

            case 'planeWidth':
            case 'planeHeight':
                // Recreate geometry with new dimensions
                if (this.geometry) {
                    this.geometry.dispose();
                }
                this.createGeometry();
                if (this.mesh) {
                    this.mesh.geometry = this.geometry;
                }
                break;
        }
    }

    /**
     * Calculate perfect loop duration based on wave frequency
     */
    calculateExportSuggestion() {
        const frequency = this.settings.waveFrequency || 0.5;
        const timeMultiplier = 3.5; // From vertex shader

        // One complete wave cycle
        const period = (2 * Math.PI) / (frequency * timeMultiplier);

        return {
            duration: period,
            loopPoint: period,
            isSeamless: true,
            confidence: 'high',
            explanation: `One wave cycle (${period.toFixed(1)}s at frequency ${frequency})`
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

export default WavePlaneEffect;
