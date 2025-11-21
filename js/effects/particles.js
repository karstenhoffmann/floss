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

    static get exportDefaults() {
        return {
            type: 'loop',
            recommendedDuration: 5,    // Default: delay + dissolve + buffer
            minDuration: 1,
            maxDuration: 20,
            seamlessLoop: false        // Dissolve effect doesn't loop seamlessly by default
        };
    }

    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),
            text: {
                ...super.getSettingsSchema().text,
                default: 'SMOKE'
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
                default: 8.0,
                min: 0.1,
                max: 10.0,
                step: 0.1,
                label: 'Particle Size',
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
            // Smoke Dissolve Settings
            dissolveDirection: {
                type: 'select',
                default: 'left-to-right',
                options: [
                    { value: 'left-to-right', label: 'Left → Right' },
                    { value: 'right-to-left', label: 'Right → Left' },
                    { value: 'center-out', label: 'Center → Out' }
                ],
                label: 'Dissolve Direction',
                group: 'effect'
            },
            dissolveDelay: {
                type: 'number',
                default: 1.0,
                min: 0,
                max: 5,
                step: 0.1,
                label: 'Dissolve Delay (s)',
                group: 'effect'
            },
            dissolveWaveSpeed: {
                type: 'number',
                default: 1.5,
                min: 0.1,
                max: 5,
                step: 0.1,
                label: 'Wave Speed',
                group: 'effect'
            },
            dissolveDuration: {
                type: 'number',
                default: 2.0,
                min: 0.5,
                max: 5,
                step: 0.1,
                label: 'Dissolve Duration (s)',
                group: 'effect'
            },
            riseSpeed: {
                type: 'number',
                default: 3.0,
                min: 0,
                max: 10,
                step: 0.5,
                label: 'Rise Speed',
                group: 'effect'
            },
            swirlStrength: {
                type: 'number',
                default: 2.0,
                min: 0,
                max: 10,
                step: 0.5,
                label: 'Swirl Strength',
                group: 'effect'
            },
            glitterIntensity: {
                type: 'number',
                default: 0.8,
                min: 0,
                max: 2,
                step: 0.1,
                label: 'Glitter Intensity',
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
        this.velocities = [];
        this.originalPositions = [];
        this.particleXPositions = [];  // X position for dissolve wave calculation
        this.textBounds = { minX: 0, maxX: 0 };  // Text bounding box for wave calculation

        // Animation state
        this.animationStartTime = null;  // Will be set on first update()

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

        // Calculate text bounding box for dissolve wave
        let minX = Infinity, maxX = -Infinity;
        sampledPositions.forEach(pos => {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
        });
        this.textBounds = { minX, maxX };

        // Create geometry
        this.geometry = new THREE.BufferGeometry();

        const positionArray = new Float32Array(sampledPositions.length * 3);
        const colorArray = new Float32Array(sampledPositions.length * 3);
        const sizeArray = new Float32Array(sampledPositions.length);
        const dissolveArray = new Float32Array(sampledPositions.length);  // Dissolve progress per particle

        // Initialize particles (stable, no explosion)
        for (let i = 0; i < sampledPositions.length; i++) {
            const pos = sampledPositions[i];

            // Position
            positionArray[i * 3] = pos.x;
            positionArray[i * 3 + 1] = pos.y;
            positionArray[i * 3 + 2] = pos.z;

            // Store original position and X for wave calculation
            this.originalPositions.push(pos.clone());
            this.particleXPositions.push(pos.x);

            // Initialize velocity to zero (stable text)
            this.velocities.push(new THREE.Vector3(0, 0, 0));

            // Color gradient between two colors
            const t = i / sampledPositions.length;
            const color1 = new THREE.Color(this.settings.particleColor);
            const color2 = new THREE.Color(this.settings.particleColor2);
            const color = color1.clone().lerp(color2, t);

            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;

            // Size variation
            sizeArray[i] = this.settings.particleSize * (0.8 + Math.random() * 0.4);

            // Initialize dissolve progress to 0 (not dissolved yet)
            dissolveArray[i] = 0;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
        this.geometry.setAttribute('dissolve', new THREE.BufferAttribute(dissolveArray, 1));

        // Create shader material with additive blending
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uGlowIntensity: { value: this.settings.glowIntensity },
                uGlitterIntensity: { value: this.settings.glitterIntensity }
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

        console.log(`✓ Smoke dissolve system created with ${sampledPositions.length} particles`);
        console.log(`  Text bounds: X [${minX.toFixed(2)}, ${maxX.toFixed(2)}]`);
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
            attribute float dissolve;  // 0 = solid text, 1 = fully dissolved

            varying vec3 vColor;
            varying float vDissolve;
            varying float vParticleId;

            uniform float uTime;

            void main() {
                vColor = color;
                vDissolve = dissolve;

                // Unique particle ID for glitter effect
                vParticleId = position.x * 123.456 + position.y * 789.012;

                vec3 pos = position;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

                // Size calculation
                // Particles grow slightly as they dissolve (smoke expanding)
                float dissolveScale = 1.0 + vDissolve * 0.8;
                gl_PointSize = size * 40.0 * dissolveScale / -mvPosition.z;

                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    getFragmentShader() {
        return `
            varying vec3 vColor;
            varying float vDissolve;
            varying float vParticleId;

            uniform float uGlowIntensity;
            uniform float uGlitterIntensity;
            uniform float uTime;

            void main() {
                // Calculate distance from center for circular particles
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center) * 2.0;

                // Softer, more diffuse edges as particles dissolve (smoke effect)
                float edgeSoftness = mix(1.0, 1.8, vDissolve);
                if (dist > edgeSoftness) {
                    discard;
                }

                // Glow layers
                float core = 1.0 - smoothstep(0.0, 0.4, dist);
                float glow = 1.0 - smoothstep(0.3, edgeSoftness, dist);

                // Combine for final intensity
                float intensity = core * 0.8 + glow * 0.6;

                // Color transitions
                vec3 finalColor = vColor;

                // Fade to desaturated smoke color as dissolving
                vec3 smokeColor = vec3(0.4, 0.4, 0.5);  // Light gray smoke
                finalColor = mix(finalColor, smokeColor, vDissolve * 0.7);

                // Apply glow intensity
                finalColor *= intensity * uGlowIntensity;

                // Glitter effect (random sparkles)
                float sparkle = sin(vParticleId * 12.345 + uTime * 8.0) * 0.5 + 0.5;
                sparkle = step(0.95, sparkle);  // Only brightest 5%
                finalColor += vec3(sparkle * uGlitterIntensity * (1.0 - vDissolve));

                // Alpha fade based on dissolve progress
                // Particles fade out as they dissolve
                float dissolveFade = 1.0 - pow(vDissolve, 2.0);
                float alpha = intensity * dissolveFade * 0.9;

                gl_FragColor = vec4(finalColor, alpha);
            }
        `;
    }

    // Simple 3D Perlin-like noise (faster than full simplex in JS)
    noise3D(x, y, z) {
        // Simple hash-based noise for smooth organic movement
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
        return (n - Math.floor(n)) * 2.0 - 1.0;
    }

    smoothNoise3D(x, y, z) {
        // Sample multiple octaves for smoother noise
        let total = 0;
        let frequency = 1.0;
        let amplitude = 1.0;
        let maxValue = 0;

        for (let i = 0; i < 3; i++) {
            total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= 0.5;
            frequency *= 2.0;
        }

        return total / maxValue;
    }

    update(deltaTime, elapsedTime) {
        console.log('>>> update() called, deltaTime=' + deltaTime.toFixed(2) + ', elapsedTime=' + elapsedTime.toFixed(2));

        if (!this.mesh || !this.geometry) {
            console.error('>>> update() early return: mesh=' + !!this.mesh + ', geometry=' + !!this.geometry);
            return;
        }

        // elapsedTime is ALREADY in seconds, don't convert again!
        const time = elapsedTime;
        const dt = deltaTime;

        // Initialize animation start time on first update
        if (this.animationStartTime === null) {
            this.animationStartTime = time;
            console.log('✓ Dissolve animation started at t=' + time.toFixed(2) + 's');
            console.log('  Settings:', {
                dissolveDelay: this.settings.dissolveDelay,
                dissolveDirection: this.settings.dissolveDirection,
                dissolveWaveSpeed: this.settings.dissolveWaveSpeed,
                dissolveDuration: this.settings.dissolveDuration
            });
        }

        // Animation time (time since effect started)
        const animTime = time - this.animationStartTime;

        // Calculate dissolve wave position based on direction and time
        const waveProgress = Math.max(0, (animTime - this.settings.dissolveDelay) * this.settings.dissolveWaveSpeed);

        // Debug log every 2 seconds
        if (Math.floor(animTime) % 2 === 0 && Math.floor(animTime) !== this._lastDebugTime) {
            this._lastDebugTime = Math.floor(animTime);
            console.log(`[t=${animTime.toFixed(2)}s] waveProgress=${waveProgress.toFixed(3)}, dissolveAttr[0]=${this.geometry.attributes.dissolve.array[0].toFixed(3)}`);
        }

        const positions = this.geometry.attributes.position.array;
        const dissolveAttr = this.geometry.attributes.dissolve.array;

        // Update each particle
        for (let i = 0; i < this.originalPositions.length; i++) {
            const originalPos = this.originalPositions[i];
            const particleX = this.particleXPositions[i];
            const velocity = this.velocities[i];

            // Calculate when THIS particle should start dissolving based on wave direction
            let dissolveStartTime = 0;
            const textWidth = this.textBounds.maxX - this.textBounds.minX;

            if (this.settings.dissolveDirection === 'left-to-right') {
                // Normalize X position (0 = leftmost, 1 = rightmost)
                const normalizedX = (particleX - this.textBounds.minX) / textWidth;
                dissolveStartTime = normalizedX;
            } else if (this.settings.dissolveDirection === 'right-to-left') {
                // Normalize X position (0 = rightmost, 1 = leftmost)
                const normalizedX = (this.textBounds.maxX - particleX) / textWidth;
                dissolveStartTime = normalizedX;
            } else if (this.settings.dissolveDirection === 'center-out') {
                // Normalize X position (0 = center, 1 = edges)
                const centerX = (this.textBounds.minX + this.textBounds.maxX) / 2;
                const distFromCenter = Math.abs(particleX - centerX);
                const maxDist = textWidth / 2;
                dissolveStartTime = distFromCenter / maxDist;
            }

            // Calculate this particle's dissolve progress
            // dissolveProgress: 0 = solid text, 1 = fully dissolved
            const timeSinceDissolveStart = waveProgress - dissolveStartTime;
            const dissolveProgress = Math.max(0, Math.min(1, timeSinceDissolveStart / this.settings.dissolveDuration));

            // Update dissolve attribute for shader
            dissolveAttr[i] = dissolveProgress;

            // Current position
            const currentPos = new THREE.Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );

            // Physics behavior depends on dissolve state
            if (dissolveProgress > 0) {
                // DISSOLVING: Rising smoke with swirl

                // Upward drift (smoke rises)
                const riseForce = new THREE.Vector3(
                    0,
                    this.settings.riseSpeed * dissolveProgress * dt * 0.1,
                    0
                );
                velocity.add(riseForce);

                // Swirl/vortex (circular motion around Y axis)
                const swirlAngle = time * 3.0 + i * 0.05;
                const swirlRadius = dissolveProgress * 0.5;
                const swirlForce = new THREE.Vector3(
                    Math.cos(swirlAngle) * swirlRadius * this.settings.swirlStrength * dt * 0.1,
                    0,
                    Math.sin(swirlAngle) * swirlRadius * this.settings.swirlStrength * dt * 0.1
                );
                velocity.add(swirlForce);

                // Light turbulence (air disturbance)
                const turbulence = new THREE.Vector3(
                    this.smoothNoise3D(currentPos.x * 0.1, time * 0.5, i * 0.01) * dissolveProgress * dt * 0.05,
                    this.smoothNoise3D(currentPos.y * 0.1 + 100, time * 0.5, i * 0.01) * dissolveProgress * dt * 0.03,
                    this.smoothNoise3D(currentPos.z * 0.1 + 200, time * 0.5, i * 0.01) * dissolveProgress * dt * 0.05
                );
                velocity.add(turbulence);

                // Apply velocity with light damping (smoke has inertia)
                currentPos.add(velocity);
                velocity.multiplyScalar(0.98);

            } else {
                // STABLE: Particle stays at original position (no movement)
                currentPos.copy(originalPos);
                velocity.set(0, 0, 0);
            }

            // Write position back to buffer
            positions[i * 3] = currentPos.x;
            positions[i * 3 + 1] = currentPos.y;
            positions[i * 3 + 2] = currentPos.z;
        }

        // Mark buffers for update
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.dissolve.needsUpdate = true;

        // Update shader uniforms
        if (this.material.uniforms) {
            this.material.uniforms.uTime.value = time;
            this.material.uniforms.uGlowIntensity.value = this.settings.glowIntensity;
            this.material.uniforms.uGlitterIntensity.value = this.settings.glitterIntensity;
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

                this.velocities = [];
                this.originalPositions = [];
                this.particleXPositions = [];

                this.createParticleSystem();
                this.animationStartTime = null;  // Restart animation
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

            case 'glitterIntensity':
                if (this.material && this.material.uniforms) {
                    this.material.uniforms.uGlitterIntensity.value = value;
                }
                break;

            case 'particleCount':
            case 'particleSize':
                // Recreate particle system
                if (this.mesh) {
                    this.scene.remove(this.mesh);
                    if (this.geometry) this.geometry.dispose();
                    if (this.material) this.material.dispose();
                }

                this.velocities = [];
                this.originalPositions = [];
                this.particleXPositions = [];

                this.createParticleSystem();
                this.animationStartTime = null;  // Restart animation
                break;

            case 'dissolveDirection':
            case 'dissolveDelay':
                // Restart animation with new direction/delay
                this.animationStartTime = null;  // Will restart on next update()
                break;

            // These parameters update in real-time via update()
            case 'dissolveWaveSpeed':
            case 'dissolveDuration':
            case 'riseSpeed':
            case 'swirlStrength':
                // Used directly in update()
                break;
        }
    }

    /**
     * Get visual center of particle system
     * Used by CameraController for rotation pivot
     */
    getVisualCenter() {
        if (!this.originalPositions || this.originalPositions.length === 0) {
            return new THREE.Vector3(0, 0, 0);
        }

        // Calculate bounding box from original particle positions
        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

        this.originalPositions.forEach(pos => {
            min.x = Math.min(min.x, pos.x);
            min.y = Math.min(min.y, pos.y);
            min.z = Math.min(min.z, pos.z);
            max.x = Math.max(max.x, pos.x);
            max.y = Math.max(max.y, pos.y);
            max.z = Math.max(max.z, pos.z);
        });

        // Return center of bounding box
        return new THREE.Vector3(
            (min.x + max.x) / 2,
            (min.y + max.y) / 2,
            (min.z + max.z) / 2
        );
    }

    /**
     * Calculate export duration based on dissolve settings
     */
    calculateExportSuggestion() {
        const delay = this.settings.dissolveDelay || 1.0;
        const duration = this.settings.dissolveDuration || 2.0;
        const totalDuration = delay + duration + 0.5;  // Add buffer

        return {
            duration: totalDuration,
            loopPoint: null,
            isSeamless: false,
            confidence: 'medium',
            explanation: `Dissolve sequence: ${delay}s delay + ${duration}s dissolve + 0.5s buffer`
        };
    }

    /**
     * Reset animation to initial state
     */
    reset() {
        this.animationStartTime = null;  // Reset will trigger on next update()

        // Reset all particles to original positions
        if (this.geometry && this.originalPositions) {
            const positions = this.geometry.attributes.position.array;
            const dissolveAttr = this.geometry.attributes.dissolve.array;

            for (let i = 0; i < this.originalPositions.length; i++) {
                const orig = this.originalPositions[i];
                positions[i * 3] = orig.x;
                positions[i * 3 + 1] = orig.y;
                positions[i * 3 + 2] = orig.z;

                dissolveAttr[i] = 0;  // Reset dissolve progress

                if (this.velocities[i]) {
                    this.velocities[i].set(0, 0, 0);
                }
            }

            this.geometry.attributes.position.needsUpdate = true;
            this.geometry.attributes.dissolve.needsUpdate = true;
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
        this.velocities = [];
        this.originalPositions = [];
        this.particleXPositions = [];

        super.destroy();
    }
}

export default ParticlesEffect;
