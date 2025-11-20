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
                default: 10.0,
                min: 0.1,
                max: 10.0,
                step: 0.1,
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
            varying vec3 vColor;
            varying float vDepth;
            varying float vPulse;

            uniform float uTime;

            // 3D Simplex noise function for smooth organic movement
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);

                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);

                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;

                i = mod289(i);
                vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                float n_ = 0.142857142857;
                vec3 ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);

                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
            }

            void main() {
                vColor = color;

                vec3 pos = position;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

                // Calculate depth for visual effects
                vDepth = -mvPosition.z / 100.0;

                // Multi-layered pulsing with different frequencies for organic feel
                float slowPulse = sin(uTime * 0.8 + position.x * 3.0) * 0.5 + 0.5;
                float fastPulse = sin(uTime * 4.0 + position.y * 7.0) * 0.5 + 0.5;
                float combinedPulse = mix(slowPulse, fastPulse, 0.4);

                // Breathing effect (entire system)
                float globalBreath = sin(uTime * 0.5) * 0.15 + 1.0;

                // Individual particle variation
                float particleId = position.x + position.y * 100.0;
                float particlePhase = fract(particleId * 0.1);

                // Final pulse with easing
                vPulse = globalBreath * (0.7 + combinedPulse * 0.6 + particlePhase * 0.3);

                // Size calculation with depth-based scaling
                float depthScale = 1.0 + vDepth * 0.3;
                gl_PointSize = size * 50.0 * vPulse * depthScale / -mvPosition.z;

                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    getFragmentShader() {
        return `
            varying vec3 vColor;
            varying float vDepth;
            varying float vPulse;

            uniform float uGlowIntensity;
            uniform float uTime;

            void main() {
                // Calculate distance from center
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center) * 2.0;

                // Discard pixels outside circle
                if (dist > 1.0) {
                    discard;
                }

                // Multi-layered glow with different falloff curves
                // Core - bright center
                float core = 1.0 - smoothstep(0.0, 0.3, dist);
                // Middle - soft falloff
                float middle = 1.0 - smoothstep(0.2, 0.7, dist);
                // Outer - wide glow
                float outer = 1.0 - smoothstep(0.5, 1.0, dist);

                // Combine layers with different intensities
                float intensity = core * 1.5 + middle * 0.8 + outer * 0.4;

                // Pulsing color shift
                float colorShift = sin(uTime * 2.0 + vDepth * 10.0) * 0.5 + 0.5;
                vec3 shiftedColor = mix(vColor, vColor * vec3(1.2, 0.9, 1.1), colorShift * 0.3);

                // Add depth-based brightness variation
                float depthBrightness = 1.0 + vDepth * 0.4;

                // Pulse-based intensity modulation
                float pulseIntensity = vPulse * 0.8 + 0.4;

                // Final color with all effects combined
                vec3 finalColor = shiftedColor * intensity * uGlowIntensity * depthBrightness * pulseIntensity;

                // Alpha with soft edges
                float alpha = intensity * (0.6 + pulseIntensity * 0.4);

                // Add subtle sparkle effect on brightest particles
                float sparkle = core * (sin(uTime * 15.0 + vDepth * 50.0) * 0.5 + 0.5);
                finalColor += vec3(sparkle * 0.3);

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
        if (!this.mesh || !this.geometry) return;

        const positions = this.geometry.attributes.position.array;
        const time = elapsedTime * 0.001; // Convert to seconds

        // Update particle physics with advanced motion
        for (let i = 0; i < this.originalPositions.length; i++) {
            const originalPos = this.originalPositions[i];
            const velocity = this.velocities[i];

            // Current position
            const currentPos = new THREE.Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );

            // Force towards original position (spring-like attraction)
            const toOriginal = originalPos.clone().sub(currentPos);
            const distance = toOriginal.length();
            const attractionForce = toOriginal.normalize().multiplyScalar(
                this.settings.attractionForce * deltaTime * distance * 0.1
            );

            // Smooth Perlin-like noise for organic turbulence
            const noiseScale = 0.02;
            const noiseSpeed = time * 0.3;
            const turbulenceX = this.smoothNoise3D(
                originalPos.x * noiseScale,
                originalPos.y * noiseScale,
                noiseSpeed
            ) * this.settings.turbulence * deltaTime;

            const turbulenceY = this.smoothNoise3D(
                originalPos.y * noiseScale + 100,
                originalPos.x * noiseScale,
                noiseSpeed + 50
            ) * this.settings.turbulence * deltaTime;

            const turbulenceZ = this.smoothNoise3D(
                originalPos.z * noiseScale + 200,
                originalPos.x * noiseScale + originalPos.y * noiseScale,
                noiseSpeed + 100
            ) * this.settings.turbulence * deltaTime * 0.5;

            const turbulenceForce = new THREE.Vector3(turbulenceX, turbulenceY, turbulenceZ);

            // Wave-based coordinated movement for elegance
            const wavePhase = time * 0.8;
            const waveFreq = 0.05;
            const waveX = Math.sin(originalPos.y * waveFreq + wavePhase) * 0.02;
            const waveY = Math.cos(originalPos.x * waveFreq + wavePhase) * 0.02;
            const waveZ = Math.sin((originalPos.x + originalPos.y) * waveFreq * 0.5 + wavePhase) * 0.015;

            const waveForce = new THREE.Vector3(waveX, waveY, waveZ);

            // Breathing expansion/contraction
            const breathPhase = Math.sin(time * 0.5) * 0.03;
            const breathForce = originalPos.clone().normalize().multiplyScalar(breathPhase);

            // Apply all forces with smooth blending
            velocity.add(attractionForce);
            velocity.add(turbulenceForce);
            velocity.add(waveForce);
            velocity.add(breathForce);

            // Enhanced damping with easing
            const dampingFactor = this.settings.damping * (0.95 + Math.sin(time * 2.0) * 0.02);
            velocity.multiplyScalar(dampingFactor);

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
            this.material.uniforms.uTime.value = elapsedTime * 0.001;
            this.material.uniforms.uGlowIntensity.value = this.settings.glowIntensity;
        }

        // Smooth organic rotation with easing
        if (this.mesh) {
            const rotationEase = Math.sin(time * 0.3) * 0.5 + 0.5;
            this.mesh.rotation.y += deltaTime * this.settings.rotationSpeed * 0.1 * (0.5 + rotationEase * 0.5);
            this.mesh.rotation.x = Math.sin(time * 0.2) * 0.05;
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
