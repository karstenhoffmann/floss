/**
 * Endless Effect (Wave Tiles)
 * Inspired by the original Codrops demo
 * Text mapped onto a torus knot with scrolling animation
 */

import EffectBase from './effect-base.js';
import { createTextTexture, updateTextTexture } from '../utils/text-texture.js';

export class EndlessEffect extends EffectBase {
    static get metadata() {
        return {
            id: 'endless',
            name: 'Endless',
            icon: '🌀',
            description: 'Infinite scrolling text on torus knot geometry'
        };
    }

    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),
            text: {
                ...super.getSettingsSchema().text,
                default: 'ENDLESS'
            },
            animationSpeed: {
                ...super.getSettingsSchema().animationSpeed,
                default: 0.4
            },
            // Endless-specific settings
            repeats: {
                type: 'number',
                default: 12,
                min: 1,
                max: 20,
                label: 'Tile Repeats',
                group: 'effect'
            },
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
            fogColor: {
                type: 'color',
                default: '#000000',
                label: 'Fog Color',
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

        // Create geometry (Torus Knot)
        this.geometry = new THREE.TorusKnotGeometry(9, 3, 768, 3, 4, 3);

        // Create material with custom shader
        const fogColor = new THREE.Color(this.settings.fogColor);
        this.material = new THREE.ShaderMaterial({
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            uniforms: {
                uTime: { value: 0 },
                uTexture: { value: this.textTextureData.texture },
                uRepeats: { value: new THREE.Vector2(this.settings.repeats, 3) },
                uSpeed: { value: this.settings.animationSpeed },
                uFogColor: { value: fogColor }
            },
            side: THREE.DoubleSide
        });

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotation.set(0, 0, 0);

        this.scene.add(this.mesh);

        // Set scene background
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
    }

    getVertexShader() {
        return `
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vPosition = position;
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
            uniform vec2 uRepeats;
            uniform float uSpeed;
            uniform vec3 uFogColor;

            void main() {
                float time = uTime * uSpeed;

                // Tiled UV with scrolling animation
                vec2 uv = fract(vUv * uRepeats - vec2(time, 0.0));
                vec3 texture = texture2D(uTexture, uv).rgb;

                // Depth fog effect with customizable fog color
                float fog = clamp(vPosition.z / 6.0, 0.0, 1.0);
                vec3 fragColor = mix(uFogColor, texture, fog);

                gl_FragColor = vec4(fragColor, 1.0);
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

            case 'fogColor':
                if (this.material && this.material.uniforms.uFogColor) {
                    this.material.uniforms.uFogColor.value = new THREE.Color(value);
                }
                break;

            case 'repeats':
                this.material.uniforms.uRepeats.value.set(value, 3);
                break;

            case 'animationSpeed':
                this.material.uniforms.uSpeed.value = value;
                break;
        }
    }

    /**
     * Get visual center of endless tunnel effect
     * Used by CameraController for rotation pivot
     */
    getVisualCenter() {
        // Endless effect uses a tunnel, so mesh provides good bounding box
        if (this.mesh) {
            const box = new THREE.Box3().setFromObject(this.mesh);
            if (!box.isEmpty()) {
                return box.getCenter(new THREE.Vector3());
            }
        }
        return new THREE.Vector3(0, 0, 0);
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

export default EndlessEffect;
