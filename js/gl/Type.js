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

    this.createTextCanvas();
    this.createRenderTarget();
    this.createMesh();
  }

  createTextCanvas() {
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

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(...this.opts.position);
    this.mesh.rotation.set(...this.opts.rotation);
    this.mesh.lookAt(new THREE.Vector3());

    this.mesh.onBeforeRender = (renderer) => {
      renderer.setRenderTarget(this.rt);
      renderer.render(this.rtScene, this.rtCamera);
      renderer.setRenderTarget(null);
    };

    this.add(this.mesh);

    Gl.scene.add(this);
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
