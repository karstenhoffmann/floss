/**
 * Particles Effect
 * Demo-scene style particle explosion with text formation
 * Features: Additive blending, physics, instancing, smooth transitions
 */

import EffectBase from './effect-base.js';
import { createTextTexture, updateTextTexture } from '../utils/text-texture.js';

export class ParticlesEffect extends EffectBase {
    static get metadata() {
        return {
            id: 'particles',
            name: 'Particles',
            icon: '✨',
            description: 'Text explosion with physics-based particle system'
        };
    }

    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),
            text: {
                ...super.getSettingsSchema().text,
                default: 'PARTICLE'
            },
            // Particle System Settings
            particleCount: {
                type: 'number',
                default: 5000,
                min: 100,
                max: 15000,
                step: 100,
                label: 'Particle Count',
                group: 'effect'
            },
            particleSize: {
                type: 'number',
                default: 0.08,
                min: 0.01,
                max: 0.5,
                step: 0.01,
                label: 'Particle Size',
                group: 'effect'
            },
            explosionStrength: {
                type: 'number',
                default: 8.0,
                min: 0,
                max: 20,
                step: 0.5,
                label: 'Explosion Strength',
                group: 'effect'
            },
            attractionForce: {
                type: 'number',
                default: 2.0,
                min: 0,
                max: 10,
                step: 0.1,
                label: 'Attraction Force',
                group: 'effect'
            },
            turbulence: {
                type: 'number',
                default: 1.5,
                min: 0,
                max: 5,
                step: 0.1,
                label: 'Turbulence',
                group: 'effect'
            },
            damping: {
                type: 'number',
                default: 0.95,
                min: 0.8,
                max: 0.99,
                step: 0.01,
                label: 'Damping',
                group: 'effect'
            },
            glowIntensity: {
                type: 'number',
                default: 1.5,
                min: 0.5,
                max: 3,
                step: 0.1,
                label: 'Glow Intensity',
                group: 'effect'
            },
            rotationSpeed: {
                type: 'number',
                default: 0.3,
                min: 0,
                max: 2,
                step: 0.1,
                label: 'Rotation Speed',
                group: 'effect'
            },
            // Particle Color Settings
            particleColor: {
                type: 'color',
                default: '#00ffff',
                label: 'Particle Color',
                group: 'colors'
            },
            particleColor2: {
                type: 'color',
                default: '#ff00ff',
                label: 'Secondary Color',
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
            fitToTile: true,
            textColor: '#ffffff',
            backgroundColor: '#000000'
        });

        // Set scene background
        this.scene.background = new THREE.Color(this.settings.backgroundColor);

        // Initialize particle system
        this.particles = [];
        this.velocities = [];
        this.originalPositions = [];
        this.colors = [];

        this.createParticleSystem();
    }

    createParticleSystem() {
        // Extract particle positions from text texture
        const positions = this.extractParticlePositionsFromTexture();

        if (positions.length === 0) {
            console.error('No particles extracted from texture');
            return;
        }

        // Sample particles to match desired count
        const sampledPositions = this.samplePositions(positions, this.settings.particleCount);

        // Create geometry
        this.geometry = new THREE.BufferGeometry();

        const positionArray = new Float32Array(sampledPositions.length * 3);
        const colorArray = new Float32Array(sampledPositions.length * 3);
        const sizeArray = new Float32Array(sampledPositions.length);

        // Initialize particles with random velocities
        for (let i = 0; i < sampledPositions.length; i++) {
            const pos = sampledPositions[i];

            // Position
            positionArray[i * 3] = pos.x;
            positionArray[i * 3 + 1] = pos.y;
            positionArray[i * 3 + 2] = pos.z;

            // Store original position
            this.originalPositions.push(pos.clone());

            // Random initial velocity (explosion)
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * this.settings.explosionStrength,
                (Math.random() - 0.5) * this.settings.explosionStrength,
                (Math.random() - 0.5) * this.settings.explosionStrength
            );
            this.velocities.push(velocity);

            // Color gradient between two colors
            const t = i / sampledPositions.length;
            const color1 = new THREE.Color(this.settings.particleColor);
            const color2 = new THREE.Color(this.settings.particleColor2);
            const color = color1.clone().lerp(color2, t);

            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
            this.colors.push(color);

            // Size variation
            sizeArray[i] = this.settings.particleSize * (0.5 + Math.random() * 0.5);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

        // Create shader material with additive blending
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uGlowIntensity: { value: this.settings.glowIntensity }
            },
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });

        // Create points
        this.mesh = new THREE.Points(this.geometry, this.material);
        this.scene.add(this.mesh);

        console.log(`✓ Particle system created with ${sampledPositions.length} particles`);
    }

    extractParticlePositionsFromTexture() {
        const canvas = this.textTextureData.canvas;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const positions = [];
        const threshold = 128; // Only use bright pixels

        // Sample every nth pixel to control density
        const step = 2;
        const scaleX = 20 / canvas.width;  // Scale to fit in scene
        const scaleY = 20 / canvas.height;

        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const i = (y * canvas.width + x) * 4;
                const brightness = data[i]; // Red channel (grayscale)

                if (brightness > threshold) {
                    // Convert to 3D position (centered)
                    const posX = (x - canvas.width / 2) * scaleX;
                    const posY = -(y - canvas.height / 2) * scaleY;
                    const posZ = 0;

                    positions.push(new THREE.Vector3(posX, posY, posZ));
                }
            }
        }

        return positions;
    }

    samplePositions(positions, targetCount) {
        if (positions.length <= targetCount) {
            return positions;
        }

        // Uniformly sample positions
        const sampled = [];
        const step = positions.length / targetCount;

        for (let i = 0; i < targetCount; i++) {
            const index = Math.floor(i * step);
            sampled.push(positions[index].clone());
        }

        return sampled;
    }

    getVertexShader() {
        return `
            attribute float size;
            // Note: 'color' attribute is automatically added by THREE.js when vertexColors: true

            varying vec3 vColor;

            uniform float uTime;

            void main() {
                vColor = color;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                // Pulsing size based on time
                float pulse = 1.0 + sin(uTime * 3.0 + position.x * 10.0) * 0.2;

                gl_PointSize = size * 100.0 * pulse / -mvPosition.z;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    getFragmentShader() {
        return `
            varying vec3 vColor;

            uniform float uGlowIntensity;

            void main() {
                // Circular particle shape with smooth falloff
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);

                if (dist > 0.5) {
                    discard;
                }

                // Soft glow falloff
                float alpha = smoothstep(0.5, 0.0, dist);

                // Additive glow
                vec3 glow = vColor * uGlowIntensity * alpha;

                gl_FragColor = vec4(glow, alpha);
            }
        `;
    }

    update(deltaTime, elapsedTime) {
        if (!this.mesh || !this.geometry) return;

        const positions = this.geometry.attributes.position.array;

        // Update particle physics
        for (let i = 0; i < this.originalPositions.length; i++) {
            const originalPos = this.originalPositions[i];
            const velocity = this.velocities[i];

            // Current position
            const currentPos = new THREE.Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );

            // Force towards original position (attraction)
            const toOriginal = originalPos.clone().sub(currentPos);
            const distance = toOriginal.length();
            const attractionForce = toOriginal.normalize().multiplyScalar(
                this.settings.attractionForce * deltaTime * distance * 0.1
            );

            // Turbulence (noise)
            const turbulenceForce = new THREE.Vector3(
                (Math.random() - 0.5) * this.settings.turbulence * deltaTime,
                (Math.random() - 0.5) * this.settings.turbulence * deltaTime,
                (Math.random() - 0.5) * this.settings.turbulence * deltaTime
            );

            // Apply forces
            velocity.add(attractionForce);
            velocity.add(turbulenceForce);

            // Damping
            velocity.multiplyScalar(this.settings.damping);

            // Update position
            currentPos.add(velocity);

            // Write back to buffer
            positions[i * 3] = currentPos.x;
            positions[i * 3 + 1] = currentPos.y;
            positions[i * 3 + 2] = currentPos.z;
        }

        this.geometry.attributes.position.needsUpdate = true;

        // Update material uniforms
        if (this.material.uniforms) {
            this.material.uniforms.uTime.value = elapsedTime;
            this.material.uniforms.uGlowIntensity.value = this.settings.glowIntensity;
        }

        // Gentle rotation
        if (this.mesh) {
            this.mesh.rotation.y += deltaTime * this.settings.rotationSpeed * 0.1;
        }
    }

    onSettingChanged(key, value) {
        if (!this.initialized) return;

        switch (key) {
            case 'text':
            case 'fontSize':
            case 'fontFamily':
            case 'letterSpacing':
                // Recreate particle system with new text
                if (this.mesh) {
                    this.scene.remove(this.mesh);
                    if (this.geometry) this.geometry.dispose();
                    if (this.material) this.material.dispose();
                }

                updateTextTexture(this.textTextureData, {
                    text: this.settings.text,
                    fontSize: this.settings.fontSize,
                    fontFamily: this.settings.fontFamily,
                    letterSpacing: this.settings.letterSpacing,
                    padding: this.settings.padding,
                    fitToTile: true,
                    textColor: '#ffffff',
                    backgroundColor: '#000000'
                });

                this.particles = [];
                this.velocities = [];
                this.originalPositions = [];
                this.colors = [];

                this.createParticleSystem();
                break;

            case 'backgroundColor':
                this.scene.background = new THREE.Color(value);
                break;

            case 'particleColor':
            case 'particleColor2':
                // Update particle colors
                if (this.geometry && this.geometry.attributes.color) {
                    const colors = this.geometry.attributes.color.array;
                    const color1 = new THREE.Color(this.settings.particleColor);
                    const color2 = new THREE.Color(this.settings.particleColor2);

                    for (let i = 0; i < this.originalPositions.length; i++) {
                        const t = i / this.originalPositions.length;
                        const color = color1.clone().lerp(color2, t);
                        colors[i * 3] = color.r;
                        colors[i * 3 + 1] = color.g;
                        colors[i * 3 + 2] = color.b;
                    }

                    this.geometry.attributes.color.needsUpdate = true;
                }
                break;

            case 'glowIntensity':
                if (this.material && this.material.uniforms) {
                    this.material.uniforms.uGlowIntensity.value = value;
                }
                break;

            case 'particleCount':
            case 'particleSize':
            case 'explosionStrength':
                // Recreate particle system
                if (this.mesh) {
                    this.scene.remove(this.mesh);
                    if (this.geometry) this.geometry.dispose();
                    if (this.material) this.material.dispose();
                }

                this.particles = [];
                this.velocities = [];
                this.originalPositions = [];
                this.colors = [];

                this.createParticleSystem();
                break;

            // Physics parameters update in real-time via update()
            case 'attractionForce':
            case 'turbulence':
            case 'damping':
            case 'rotationSpeed':
                // These are used directly in update()
                break;
        }
    }

    resize(width, height) {
        // No special handling needed
    }

    destroy() {
        if (this.textTextureData) {
            this.textTextureData.texture.dispose();
        }

        // Clear arrays
        this.particles = [];
        this.velocities = [];
        this.originalPositions = [];
        this.colors = [];

        super.destroy();
    }
}

export default ParticlesEffect;
