/**
 * Floss - Main Application Entry Point
 * Modern kinetic typography with Three.js
 */

import Gl from './gl/index.js';
import Type from './gl/Type.js';
import options from './options.js';
import ui from './ui.js';

class App {
  constructor() {
    this.prev = 0;
    this.current = 0;
    this.turn = 0;
    this.types = []; // Store references to Type instances

    this.init();
  }

  init() {
    this.createGl();
    this.addEventListeners();

    // Hide loader after scene is ready
    setTimeout(() => {
      ui.hideLoader();
    }, 1500);
  }

  createGl() {
    for (let i = 0; i < options.length; i++) {
      // Position elements in a circle
      let angle = (i / options.length) * (Math.PI * 2) + Math.PI * 1.5; // Offset the turn
      let radius = 50;
      let x = radius * Math.cos(angle);
      let z = radius * Math.sin(angle);
      options[i].position.mesh = [x, 0, z];

      // Create kinetic type
      let type = new Type();
      type.init(options[i]);
      this.types.push(type);
    }
  }

  addEventListeners() {
    // Listen to effect change from UI
    window.addEventListener('effectChange', (e) => {
      this.changeEffect(e.detail.index);
    });

    // Listen to reset from UI
    window.addEventListener('reset', () => {
      this.reset();
    });

    // Listen to speed change from UI
    window.addEventListener('speedChange', (e) => {
      // TODO: Implement time scaling
      console.log('Speed changed to:', e.detail.speed);
    });
  }

  changeEffect(index) {
    this.prev = this.current;
    this.current = index;

    if (this.prev === this.current) return;

    this.turn = (Math.PI / 2) * (this.current - this.prev);

    // Update body class for background color
    document.body.classList = '';
    document.body.classList.add(options[index].class);

    // Animate scene rotation with GSAP
    if (window.gsap) {
      gsap.to(Gl.scene.rotation, {
        duration: 1.5,
        ease: 'expo.inOut',
        y: `+=${this.turn}`,
      });
    } else {
      // Fallback if GSAP not loaded
      Gl.scene.rotation.y += this.turn;
    }
  }

  reset() {
    // Reset scene rotation to initial state
    if (window.gsap) {
      gsap.to(Gl.scene.rotation, {
        duration: 1,
        ease: 'expo.out',
        x: 0,
        y: 0,
        z: 0
      });
    } else {
      Gl.scene.rotation.set(0, 0, 0);
    }

    // Reset to first effect
    ui.selectEffect(0);
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App();
  });
} else {
  new App();
}

export default App;
