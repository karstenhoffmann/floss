/**
 * Rendering Loop with FPS Counter
 */

import state from './state.js';

export class RenderLoop {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.running = false;
        this.frameId = null;

        // FPS counter
        this.fps = 60;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // Update FPS display every 500ms
        this.lastFpsUpdate = performance.now();

        // FPS elements
        this.fpsCounter = document.getElementById('fps-counter');
        this.fpsValue = document.getElementById('fps-value');

        // Subscribe to FPS visibility state
        state.subscribe('showFPS', (show) => {
            this.toggleFPSDisplay(show);
        });

        // Initialize FPS display state
        this.toggleFPSDisplay(state.get('showFPS'));
    }

    /**
     * Start render loop
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        this.animate();
        console.log('✓ Render loop started');
    }

    /**
     * Stop render loop
     */
    stop() {
        if (!this.running) return;
        this.running = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
        console.log('Render loop stopped');
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.running) return;

        this.frameId = requestAnimationFrame(this.animate.bind(this));

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            this.updateFPSDisplay();
        }

        // Update scene
        this.sceneManager.update();

        // Render scene
        this.sceneManager.render();
    }

    /**
     * Update FPS display
     */
    updateFPSDisplay() {
        if (!this.fpsValue) return;

        this.fpsValue.textContent = this.fps;

        // Update color based on FPS
        this.fpsCounter.classList.remove('fps-low', 'fps-medium', 'fps-high');
        if (this.fps < 60) {
            this.fpsCounter.classList.add('fps-low');
        } else if (this.fps >= 60 && this.fps < 120) {
            this.fpsCounter.classList.add('fps-medium');
        } else {
            this.fpsCounter.classList.add('fps-high');
        }
    }

    /**
     * Toggle FPS counter visibility
     */
    toggleFPSDisplay(show) {
        if (!this.fpsCounter) return;

        if (show) {
            this.fpsCounter.style.display = 'flex';
        } else {
            this.fpsCounter.style.display = 'none';
        }
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }
}

export default RenderLoop;
