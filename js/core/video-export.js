/**
 * VideoExportManager
 * Handles video export functionality for PowerPoint integration
 *
 * Features:
 * - MP4/H.264 export (PowerPoint compatible)
 * - 1920×1080 @ 30fps
 * - Safe Frame system for export region
 * - Frame-by-frame offline rendering
 * - Perfect loop calculation via effects
 */

import state from './state.js';

export class VideoExportManager {
    constructor(app, sceneManager) {
        this.app = app;
        this.sceneManager = sceneManager;

        // Export state
        this.exportMode = null;  // null | 'setup' | 'recording' | 'complete'

        // Safe Frame (1920x1080 export region)
        this.safeFrame = {
            width: 1920,
            height: 1080,
            x: 0,  // Will be centered on enter()
            y: 0
        };

        // Recording state
        this.recorder = null;
        this.currentFrame = 0;
        this.totalFrames = 0;
        this.exportOptions = null;

        // Offscreen rendering
        this.offscreenCanvas = null;
        this.offscreenRenderer = null;

        // UI components (to be created in Phase 3)
        this.safeFrameComponent = null;
        this.exportPanelComponent = null;

        console.log('✓ VideoExportManager initialized');
    }

    /**
     * Enter Export Mode
     * Transition: null → setup
     */
    enter() {
        if (this.exportMode !== null) {
            console.warn('Already in export mode');
            return;
        }

        console.log('→ Entering Export Mode');

        // Update state
        this.exportMode = 'setup';
        state.set('exportMode', 'setup');

        // Center safe frame in viewport
        this.centerSafeFrame();

        // TODO Phase 3: Show SafeFrame UI
        // TODO Phase 3: Show ExportPanel UI

        console.log('✓ Export Mode: setup');
    }

    /**
     * Exit Export Mode
     * Transition: setup/complete → null
     */
    exit() {
        if (this.exportMode === 'recording') {
            console.warn('Cannot exit while recording');
            return;
        }

        console.log('← Exiting Export Mode');

        // Cleanup
        this.exportMode = null;
        state.set('exportMode', null);

        // Reset export progress
        state.set('exportProgress', {
            currentFrame: 0,
            totalFrames: 0,
            percentage: 0
        });

        // TODO Phase 3: Hide SafeFrame UI
        // TODO Phase 3: Hide ExportPanel UI

        console.log('✓ Export Mode: null (normal)');
    }

    /**
     * Start video export (recording)
     * Transition: setup → recording
     */
    async startExport(options) {
        if (this.exportMode !== 'setup') {
            throw new Error('Must be in setup mode to start export');
        }

        console.log('▶ Starting video export...', options);

        // Update state
        this.exportMode = 'recording';
        state.set('exportMode', 'recording');

        this.exportOptions = {
            duration: options.duration || 5,
            fps: options.fps || 30,
            width: 1920,
            height: 1080,
            format: 'mp4',
            bitrate: 8_000_000  // 8 Mbps
        };

        this.totalFrames = Math.ceil(this.exportOptions.duration * this.exportOptions.fps);
        this.currentFrame = 0;

        console.log(`  Duration: ${this.exportOptions.duration}s`);
        console.log(`  FPS: ${this.exportOptions.fps}`);
        console.log(`  Frames: ${this.totalFrames}`);
        console.log(`  Resolution: ${this.exportOptions.width}×${this.exportOptions.height}`);

        try {
            // 1. Create offscreen canvas and renderer
            this.createOffscreenRenderer();

            // 2. Initialize canvas-record for MP4 export
            if (typeof CanvasRecord === 'undefined') {
                throw new Error('canvas-record library not loaded');
            }

            this.recorder = new CanvasRecord.Recorder(this.offscreenCanvas, {
                encoderOptions: {
                    codec: 'avc1.42E032',  // H.264 Main Profile Level 5.0 (PowerPoint compatible)
                    bitrate: this.exportOptions.bitrate,
                    width: this.exportOptions.width,
                    height: this.exportOptions.height,
                    framerate: this.exportOptions.fps
                }
            });

            console.log('✓ canvas-record Recorder initialized');

            // 3. Reset effect to t=0
            const effect = this.sceneManager.activeEffect;
            if (effect && typeof effect.reset === 'function') {
                effect.reset();
                console.log('✓ Effect reset to t=0');
            }

            // 4. Start recording
            await this.recorder.start();
            console.log('✓ Recording started');

            // 5. Frame-by-frame rendering loop
            await this.renderAllFrames();

            // 6. Stop recording and get blob
            const blob = await this.recorder.stop();
            console.log('✓ Recording stopped, blob size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

            // 7. Trigger download
            this.downloadBlob(blob, `floss-export-${Date.now()}.mp4`);

            // 8. Complete export
            this.completeExport();

        } catch (error) {
            console.error('Export failed:', error);
            this.cancelExport();
            throw error;
        }
    }

    /**
     * Cancel ongoing export
     * Transition: recording → setup
     */
    cancelExport() {
        if (this.exportMode !== 'recording') {
            console.warn('No active export to cancel');
            return;
        }

        console.log('⏹ Cancelling export');

        // Cleanup
        if (this.recorder) {
            // TODO Phase 2: Stop recorder
            this.recorder = null;
        }

        // Back to setup mode
        this.exportMode = 'setup';
        state.set('exportMode', 'setup');

        // Reset progress
        state.set('exportProgress', {
            currentFrame: 0,
            totalFrames: 0,
            percentage: 0
        });

        console.log('✓ Export cancelled');
    }

    /**
     * Complete export
     * Transition: recording → complete
     */
    completeExport() {
        console.log('✓ Export complete');

        this.exportMode = 'complete';
        state.set('exportMode', 'complete');

        // TODO Phase 2: Trigger download

        // Auto-exit after 2 seconds
        setTimeout(() => {
            this.exit();
        }, 2000);
    }

    /**
     * Get current export options from active effect
     */
    getExportOptions() {
        const effect = this.sceneManager.activeEffect;

        if (!effect) {
            throw new Error('No active effect');
        }

        // Get export defaults from effect
        const defaults = effect.constructor.exportDefaults;

        // Get smart suggestion from effect (based on current settings)
        const suggestion = effect.calculateExportSuggestion();

        return {
            effectId: effect.constructor.metadata.id,
            effectName: effect.constructor.metadata.name,
            type: defaults.type,
            duration: suggestion.duration,
            loopPoint: suggestion.loopPoint,
            isSeamless: suggestion.isSeamless,
            confidence: suggestion.confidence,
            explanation: suggestion.explanation,
            minDuration: defaults.minDuration,
            maxDuration: defaults.maxDuration
        };
    }

    /**
     * Center safe frame in viewport
     */
    centerSafeFrame() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        this.safeFrame.x = (viewportWidth - this.safeFrame.width) / 2;
        this.safeFrame.y = (viewportHeight - this.safeFrame.height) / 2;

        console.log(`Safe Frame centered: ${this.safeFrame.x}, ${this.safeFrame.y}`);
    }

    /**
     * Update safe frame position/size
     */
    updateSafeFrame(rect) {
        this.safeFrame = { ...this.safeFrame, ...rect };
        console.log('Safe Frame updated:', this.safeFrame);
    }

    /**
     * Get safe frame rectangle
     */
    getSafeFrame() {
        return { ...this.safeFrame };
    }

    /**
     * Create offscreen canvas and Three.js renderer for export
     */
    createOffscreenRenderer() {
        // Create offscreen canvas
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.exportOptions.width;
        this.offscreenCanvas.height = this.exportOptions.height;

        // Create Three.js WebGL renderer
        this.offscreenRenderer = new THREE.WebGLRenderer({
            canvas: this.offscreenCanvas,
            antialias: true,
            alpha: false,
            preserveDrawingBuffer: true  // Required for canvas-record
        });

        this.offscreenRenderer.setSize(this.exportOptions.width, this.exportOptions.height);
        this.offscreenRenderer.setPixelRatio(1);  // Always 1 for export (not devicePixelRatio)

        console.log(`✓ Offscreen renderer created: ${this.exportOptions.width}×${this.exportOptions.height}`);
    }

    /**
     * Render all frames for export (frame-by-frame)
     */
    async renderAllFrames() {
        const effect = this.sceneManager.activeEffect;
        const scene = this.sceneManager.scene;
        const camera = this.sceneManager.camera;

        if (!effect || !scene || !camera) {
            throw new Error('Scene, camera, or effect not initialized');
        }

        const frameDuration = 1.0 / this.exportOptions.fps;  // Time per frame in seconds

        console.log(`→ Rendering ${this.totalFrames} frames...`);

        for (let frame = 0; frame < this.totalFrames; frame++) {
            this.currentFrame = frame;

            // Calculate elapsed time for this frame
            const elapsedTime = frame * frameDuration;

            // Update effect with this specific time
            effect.update(frameDuration, elapsedTime);

            // Render to offscreen canvas
            this.offscreenRenderer.render(scene, camera);

            // Record frame
            await this.recorder.step();

            // Update progress
            const percentage = ((frame + 1) / this.totalFrames) * 100;
            state.set('exportProgress', {
                currentFrame: frame + 1,
                totalFrames: this.totalFrames,
                percentage: Math.round(percentage)
            });

            // Log progress every 30 frames
            if (frame % 30 === 0 || frame === this.totalFrames - 1) {
                console.log(`  Frame ${frame + 1}/${this.totalFrames} (${percentage.toFixed(1)}%)`);
            }

            // Allow UI to update (prevent freezing)
            if (frame % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        console.log(`✓ All ${this.totalFrames} frames rendered`);
    }

    /**
     * Download blob as file
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        console.log(`✓ Download triggered: ${filename}`);
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.exportMode === 'recording') {
            this.cancelExport();
        }

        if (this.offscreenRenderer) {
            this.offscreenRenderer.dispose();
            this.offscreenRenderer = null;
        }

        console.log('✓ VideoExportManager destroyed');
    }
}

export default VideoExportManager;
