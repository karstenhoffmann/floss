import * as THREE from 'three';
import { Text } from 'troika-three-text';
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
      fontUrl: options.font?.url || 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
    };

    this.createTextMesh();
    this.createRenderTarget();
    this.createMesh();
  }

  createTextMesh() {
    // Create troika Text object
    this.textMesh = new Text();

    // Set text properties
    this.textMesh.text = this.opts.word;
    this.textMesh.fontSize = 1;
    this.textMesh.color = this.opts.color;
    this.textMesh.font = this.opts.fontUrl;
    this.textMesh.anchorX = 'center';
    this.textMesh.anchorY = 'middle';

    // Position and scale
    this.textMesh.position.set(...this.opts.wordPosition);
    this.textMesh.scale.set(...this.opts.wordScale);

    // Sync to ensure geometry is ready
    this.textMesh.sync();
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
    if (this.textMesh) {
      this.textMesh.dispose();
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
