import * as THREE from 'three';
import Gl from './index.js';

export default class extends THREE.Object3D {
  init(options) {
    this.opts = {
      word: options.word,
      color: options.color,
      fill: options.fill,
      wordPosition: options.position.texture,
      wordScale: options.scale,
      position: options.position.mesh,
      rotation: options.rotation || [0, 0, 0],
      geometry: options.geometry,
      vertex: options.shaders.vertex,
      fragment: options.shaders.fragment,
      fontFamily: options.font?.family || 'Inter'
    };

    // Wait for fonts to load before creating canvas
    this.initAsync();
  }

  async initAsync() {
    try {
      // Wait for all fonts to be loaded
      await document.fonts.ready;
      console.log('[Type] Fonts loaded, creating text canvas');

      this.createTextCanvas();
      this.createRenderTarget();
      this.createMesh();
    } catch (error) {
      console.error('[Type] Error during initialization:', error);
      // Fallback: create anyway
      this.createTextCanvas();
      this.createRenderTarget();
      this.createMesh();
    }
  }

  createTextCanvas() {
    console.log('[Type] Creating canvas for:', this.opts.word, 'with font:', this.opts.fontFamily);

    // Canvas setup for high-quality text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // High resolution for crisp text (retina-ready)
    const scale = 2;
    canvas.width = 2048 * scale;
    canvas.height = 512 * scale;

    // Fill background
    ctx.fillStyle = this.opts.fill;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text styling
    const fontSize = 400 * scale;
    ctx.font = `bold ${fontSize}px ${this.opts.fontFamily}`;
    ctx.fillStyle = this.opts.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw text centered
    ctx.fillText(this.opts.word, canvas.width / 2, canvas.height / 2);

    // Debug: Log text rendering
    console.log('[Type] Text rendered:', {
      word: this.opts.word,
      font: ctx.font,
      color: this.opts.color,
      canvasSize: `${canvas.width}x${canvas.height}`
    });

    // Debug: Optionally append canvas to DOM to verify rendering
    // canvas.style.position = 'fixed';
    // canvas.style.top = '10px';
    // canvas.style.left = '10px';
    // canvas.style.zIndex = '10000';
    // canvas.style.border = '2px solid red';
    // canvas.style.width = '512px';
    // canvas.style.height = '128px';
    // document.body.appendChild(canvas);

    // Create texture from canvas
    this.canvasTexture = new THREE.CanvasTexture(canvas);
    this.canvasTexture.needsUpdate = true;

    // Create a plane to display the text
    const planeGeometry = new THREE.PlaneGeometry(2, 0.5);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.canvasTexture,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.textMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    this.textMesh.position.set(...this.opts.wordPosition);
    this.textMesh.scale.set(...this.opts.wordScale);
    this.textMesh.rotation.set(Math.PI, 0, 0); // Flip 180° (Canvas text is mirrored)

    console.log('[Type] TextMesh created at position:', this.opts.wordPosition, 'scale:', this.opts.wordScale);
  }

  createRenderTarget() {
    // Render Target setup
    this.rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.rtCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.rtCamera.position.z = 2.4;

    this.rtScene = new THREE.Scene();
    this.rtScene.background = new THREE.Color(this.opts.fill);

    // Add text to render target scene
    this.rtScene.add(this.textMesh);

    // DEBUG: Also add to main scene to verify visibility
    const debugTextMesh = this.textMesh.clone();
    debugTextMesh.position.set(0, 0, 0); // Center of main scene
    debugTextMesh.scale.set(10, 10, 1); // Make it MUCH bigger
    Gl.scene.add(debugTextMesh);
    console.log('[Type] DEBUG: Added visible text mesh to main scene');
  }

  createMesh() {
    this.geometry = this.opts.geometry;

    this.material = new THREE.ShaderMaterial({
      vertexShader: this.opts.vertex,
      fragmentShader: this.opts.fragment,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.rt.texture },
      },
      defines: {
        PI: Math.PI
      },
      side: THREE.DoubleSide
    });

    console.log('[Type] ShaderMaterial created with texture:', this.rt.texture);

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(...this.opts.position);
    this.mesh.rotation.set(...this.opts.rotation);
    this.mesh.lookAt(new THREE.Vector3());

    console.log('[Type] Main mesh created at position:', this.opts.position);

    this.mesh.onBeforeRender = (renderer) => {
      renderer.setRenderTarget(this.rt);
      renderer.render(this.rtScene, this.rtCamera);
      renderer.setRenderTarget(null);
    };

    this.add(this.mesh);

    Gl.scene.add(this);

    console.log('[Type] Added to scene. Total scene children:', Gl.scene.children.length);
  }

  updateTime(time) {
    if (this.material) {
      this.material.uniforms.uTime.value = time;
    }
  }

  // Clean up
  dispose() {
    if (this.canvasTexture) {
      this.canvasTexture.dispose();
    }
    if (this.textMesh) {
      this.textMesh.geometry.dispose();
      this.textMesh.material.dispose();
    }
    if (this.rt) {
      this.rt.dispose();
    }
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
  }
}
