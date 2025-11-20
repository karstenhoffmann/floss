/**
 * ParticleEffect - GPU-based particle system for smoke/vapor effects
 * Features:
 * - Reveal animation with particles spawning at leading edge
 * - Organic motion with turbulence and swirl
 * - Smooth fade-out with soft edges
 * - Fine particles for realistic smoke appearance
 */

import * as THREE from 'three';
import loadFont from 'load-bmfont';
import createGeometry from 'three-bmfont-text';
import MSDFShader from 'three-bmfont-text/shaders/msdf.js';

export default class ParticleEffect extends THREE.Object3D {
  constructor() {
    super();

    this.particleCount = 8000; // High count for fine particles
    this.particles = [];
    this.isPlaying = true;
    this.revealProgress = 0;
    this.revealSpeed = 0.3;
    this.elapsedTime = 0;

    // Particle spawn configuration
    this.spawnRate = 40; // Particles per frame during reveal
    this.particlePool = [];
  }

  init(options) {
    this.opts = {
      word: options.word,
      color: options.color,
      fill: options.fill,
      wordPosition: options.position.texture,
      wordScale: options.scale,
      position: options.position.mesh,
      rotation: options.rotation || [0, 0, 0],
      fontFile: options.font.file,
      fontAtlas: options.font.atlas
    };

    // Load font for text bounds
    loadFont(this.opts.fontFile, (err, font) => {
      if (err) {
        console.error('Error loading font:', err);
        return;
      }

      this.font = font;
      this.fontGeometry = createGeometry({
        font,
        text: this.opts.word,
      });

      // Load texture
      this.loader = new THREE.TextureLoader();
      this.loader.load(this.opts.fontAtlas, (texture) => {
        this.fontTexture = texture;
        this.createTextMesh();
        this.createParticleSystem();
        this.createRevealMask();
      });
    });
  }

  createTextMesh() {
    // Create invisible text mesh for sampling positions
    this.fontMaterial = new THREE.RawShaderMaterial(
      MSDFShader({
        map: this.fontTexture,
        side: THREE.DoubleSide,
        transparent: true,
        negate: false,
        color: this.opts.color
      })
    );

    this.textMesh = new THREE.Mesh(this.fontGeometry, this.fontMaterial);
    this.textMesh.position.set(...this.opts.wordPosition);
    this.textMesh.rotation.set(Math.PI, 0, 0);
    this.textMesh.scale.set(...this.opts.wordScale);

    // Calculate text bounds for particle spawning
    this.fontGeometry.computeBoundingBox();
    this.textBounds = this.fontGeometry.boundingBox;
  }

  createRevealMask() {
    // Create a render target for the reveal mask
    this.maskRT = new THREE.WebGLRenderTarget(512, 512);
    this.maskCamera = new THREE.OrthographicCamera(-2, 2, 1, -1, 0.1, 10);
    this.maskCamera.position.z = 5;

    this.maskScene = new THREE.Scene();
    this.maskScene.background = new THREE.Color(0x000000);

    // Add text to mask scene
    this.maskScene.add(this.textMesh);
  }

  createParticleSystem() {
    const geometry = new THREE.BufferGeometry();

    // Particle attributes
    const positions = new Float32Array(this.particleCount * 3);
    const velocities = new Float32Array(this.particleCount * 3);
    const lifetimes = new Float32Array(this.particleCount); // 0 = dead, 1 = just born
    const sizes = new Float32Array(this.particleCount);
    const turbulence = new Float32Array(this.particleCount * 3); // Random turbulence vectors

    // Initialize all particles as inactive
    for (let i = 0; i < this.particleCount; i++) {
      lifetimes[i] = 0;
      sizes[i] = Math.random() * 0.015 + 0.005; // Small varied sizes
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('turbulence', new THREE.BufferAttribute(turbulence, 3));

    // Particle shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(this.opts.color) },
        uOpacity: { value: 0.6 }
      },
      vertexShader: this.particleVertexShader(),
      fragmentShader: this.particleFragmentShader(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.particleSystem.position.set(...this.opts.position);
    this.add(this.particleSystem);
  }

  particleVertexShader() {
    return `
      attribute vec3 velocity;
      attribute float lifetime;
      attribute float size;
      attribute vec3 turbulence;

      uniform float uTime;

      varying float vLifetime;

      // 3D Simplex noise (simplified version)
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
        vLifetime = lifetime;

        if (lifetime > 0.0) {
          // Apply base velocity
          vec3 pos = position + velocity * lifetime;

          // Add turbulence based on noise
          float noiseScale = 0.8;
          float noiseTime = uTime * 0.5;
          vec3 noisePos = pos * noiseScale + vec3(noiseTime);

          // Multi-octave noise for organic motion
          float noise1 = snoise(noisePos);
          float noise2 = snoise(noisePos * 2.0 + vec3(10.0));
          float noise3 = snoise(noisePos * 4.0 + vec3(20.0));

          vec3 turbulenceOffset = turbulence * (noise1 * 0.15 + noise2 * 0.08 + noise3 * 0.04);
          pos += turbulenceOffset;

          // Add swirl motion
          float swirlAngle = lifetime * 2.0 + noise1 * 1.5;
          float swirlRadius = 0.1 * lifetime;
          pos.x += cos(swirlAngle) * swirlRadius;
          pos.y += sin(swirlAngle) * swirlRadius;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Size decreases with lifetime (particles shrink as they fade)
          float lifeFactor = 1.0 - lifetime;
          gl_PointSize = size * 300.0 * lifeFactor * (1.0 / -mvPosition.z);
        } else {
          // Hide inactive particles
          gl_Position = vec4(0.0, 0.0, -1000.0, 1.0);
          gl_PointSize = 0.0;
        }
      }
    `;
  }

  particleFragmentShader() {
    return `
      uniform vec3 uColor;
      uniform float uOpacity;

      varying float vLifetime;

      void main() {
        if (vLifetime <= 0.0) discard;

        // Circular particle with soft edges
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        // Soft falloff
        float alpha = 1.0 - smoothstep(0.2, 0.5, dist);

        // Fade out based on lifetime
        float lifeFactor = 1.0 - vLifetime;
        alpha *= lifeFactor * uOpacity;

        // Add subtle variation in brightness
        float brightness = 0.8 + 0.2 * (1.0 - dist * 2.0);

        gl_FragColor = vec4(uColor * brightness, alpha);
      }
    `;
  }

  spawnParticle(index, spawnPos) {
    const geometry = this.particleSystem.geometry;
    const positions = geometry.attributes.position.array;
    const velocities = geometry.attributes.velocity.array;
    const lifetimes = geometry.attributes.lifetime.array;
    const turbulence = geometry.attributes.turbulence.array;

    const i = index * 3;

    // Spawn at text edge with small random offset
    positions[i] = spawnPos.x + (Math.random() - 0.5) * 0.05;
    positions[i + 1] = spawnPos.y + (Math.random() - 0.5) * 0.05;
    positions[i + 2] = spawnPos.z;

    // Random velocity (upward and outward bias)
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.02 + Math.random() * 0.04;
    velocities[i] = Math.cos(angle) * speed;
    velocities[i + 1] = 0.05 + Math.random() * 0.08; // Upward bias
    velocities[i + 2] = Math.sin(angle) * speed;

    // Random turbulence direction
    turbulence[i] = Math.random() - 0.5;
    turbulence[i + 1] = Math.random() - 0.5;
    turbulence[i + 2] = Math.random() - 0.5;

    // Start with full life
    lifetimes[index] = 0.01; // Just born
  }

  updateParticles(deltaTime) {
    if (!this.particleSystem) return;

    const geometry = this.particleSystem.geometry;
    const lifetimes = geometry.attributes.lifetime.array;

    // Update existing particles
    for (let i = 0; i < this.particleCount; i++) {
      if (lifetimes[i] > 0) {
        lifetimes[i] += deltaTime * 0.3; // Lifetime decay rate

        // Kill particles that are too old
        if (lifetimes[i] > 1.0) {
          lifetimes[i] = 0;
        }
      }
    }

    // Spawn new particles during reveal
    if (this.revealProgress < 1.0 && this.isPlaying) {
      const spawnCount = Math.floor(this.spawnRate * deltaTime * 60); // Frame-rate independent

      for (let s = 0; s < spawnCount; s++) {
        // Find dead particle to respawn
        const deadIndex = this.findDeadParticle();
        if (deadIndex !== -1) {
          // Spawn at reveal edge
          const spawnPos = this.getRevealEdgePosition();
          this.spawnParticle(deadIndex, spawnPos);
        }
      }
    }

    geometry.attributes.lifetime.needsUpdate = true;
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.velocity.needsUpdate = true;
    geometry.attributes.turbulence.needsUpdate = true;
  }

  findDeadParticle() {
    const lifetimes = this.particleSystem.geometry.attributes.lifetime.array;
    for (let i = 0; i < this.particleCount; i++) {
      if (lifetimes[i] <= 0) {
        return i;
      }
    }
    return -1;
  }

  getRevealEdgePosition() {
    if (!this.textBounds) {
      return new THREE.Vector3(0, 0, 0);
    }

    // Sample position along the text bounds
    const bounds = this.textBounds;
    const progress = this.revealProgress;

    // Interpolate along text width
    const x = bounds.min.x + (bounds.max.x - bounds.min.x) * progress;

    // Random position along height
    const y = bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y);

    // Transform to world space (approximate)
    const localPos = new THREE.Vector3(x, y, 0);
    localPos.multiply(new THREE.Vector3(...this.opts.wordScale));
    localPos.add(new THREE.Vector3(...this.opts.wordPosition));

    return localPos;
  }

  updateReveal(deltaTime) {
    if (!this.isPlaying) return;

    this.revealProgress += this.revealSpeed * deltaTime;
    if (this.revealProgress > 1.2) {
      this.revealProgress = 1.2; // Slight overshoot
    }

    // Update text opacity based on reveal
    if (this.textMesh && this.textMesh.material.uniforms.opacity) {
      this.textMesh.material.uniforms.opacity.value = Math.min(this.revealProgress, 1.0);
    }
  }

  updateTime(time) {
    const deltaTime = time - this.elapsedTime;
    this.elapsedTime = time;

    if (this.particleSystem) {
      this.particleSystem.material.uniforms.uTime.value = time;
      this.updateParticles(deltaTime);
      this.updateReveal(deltaTime);
    }
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.revealProgress = 0;
    this.elapsedTime = 0;

    // Reset all particles
    if (this.particleSystem) {
      const lifetimes = this.particleSystem.geometry.attributes.lifetime.array;
      for (let i = 0; i < this.particleCount; i++) {
        lifetimes[i] = 0;
      }
      this.particleSystem.geometry.attributes.lifetime.needsUpdate = true;
    }
  }

  restart() {
    this.stop();
    this.isPlaying = true;
  }
}
