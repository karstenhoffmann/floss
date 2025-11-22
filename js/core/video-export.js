/**
 * VideoExportManager
 * Handles video export functionality for PowerPoint integration
 *
 * Features:
 * - MP4/H.264 export (PowerPoint compatible) via native MediaRecorder
 * - 1920×1080 @ 30fps
 * - Safe Frame system for export region
 * - Frame-by-frame offline rendering
 * - Perfect loop calculation via effects
 * - No external dependencies (uses browser APIs)
 */

import state from './state.js';
import SafeFrameComponent from '../ui/safe-frame.js';
import ExportPanelComponent from '../ui/export-panel.js';
import CanvasRecorder from '../../lib/canvas-recorder.js';

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

        // UI components (lazy initialization on enter())
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

        // Create UI components if not already created (lazy initialization)
        if (!this.safeFrameComponent) {
            this.safeFrameComponent = new SafeFrameComponent(this);
        }

        if (!this.exportPanelComponent) {
            this.exportPanelComponent = new ExportPanelComponent(this);
        }

        // Hide main UI elements
        this.hideMainUI();

        // Show export UI
        this.safeFrameComponent.show();
        this.exportPanelComponent.show();

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

        // Hide export UI (if created)
        if (this.safeFrameComponent) {
            this.safeFrameComponent.hide();
        }

        if (this.exportPanelComponent) {
            this.exportPanelComponent.hide();
        }

        // Restore main UI
        this.showMainUI();

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

            // 2. Initialize canvas recorder (native MediaRecorder API - no dependencies!)
            console.log('→ Initializing CanvasRecorder (native MediaRecorder)...');

            // Log supported codecs
            const codecs = CanvasRecorder.getSupportedCodecs();
            console.log('📹 Supported codecs:', codecs);

            this.recorder = new CanvasRecorder(this.offscreenCanvas, {
                videoBitsPerSecond: this.exportOptions.bitrate,
                frameRate: this.exportOptions.fps
            });

            console.log('✓ canvas-record Recorder initialized');

            // 3. Reset effect to t=0
            const effect = this.sceneManager.activeEffect;
            if (effect && typeof effect.reset === 'function') {
                effect.reset();
                console.log('✓ Effect reset to t=0');
            }

            // 4. Warm-up: Render a few frames BEFORE starting recording
            // This ensures captureStream() is fully initialized
            console.log('→ Warming up captureStream (rendering 3 dummy frames)...');
            for (let i = 0; i < 3; i++) {
                effect.update(0, 0);
                this.offscreenRenderer.render(this.sceneManager.scene, this.sceneManager.camera);
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            console.log('✓ Warm-up complete');

            // 5. Start recording
            await this.recorder.start();
            console.log('✓ Recording started');

            // 6. Wait a moment for MediaRecorder to be ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // 7. Render animation in realtime (MediaRecorder captures stream)
            await this.renderRealtimeAnimation();

            // 8. Wait for last frame to be captured before stopping
            const frameDuration = 1000 / this.exportOptions.fps;
            await new Promise(resolve => setTimeout(resolve, frameDuration * 2));

            // 9. Stop recording and get blob
            const blob = await this.recorder.stop();
            console.log('✓ Recording stopped, blob size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

            // 10. Trigger download
            this.downloadBlob(blob, `floss-export-${Date.now()}.mp4`);

            // 11. Complete export
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
     * Render animation with precise frame timing for smooth video
     * Uses fixed-timestep rendering for consistent frame rate
     */
    async renderRealtimeAnimation() {
        const effect = this.sceneManager.activeEffect;
        const scene = this.sceneManager.scene;
        const camera = this.sceneManager.camera;

        if (!effect || !scene || !camera) {
            throw new Error('Scene, camera, or effect not initialized');
        }

        const duration = this.exportOptions.duration * 1000;  // Convert to ms
        const fps = this.exportOptions.fps;
        const frameDuration = 1000 / fps;  // ms per frame (33.33ms for 30fps, 16.67ms for 60fps)
        const totalFrames = Math.ceil(this.exportOptions.duration * fps);

        console.log(`→ Recording ${this.exportOptions.duration}s at ${fps}fps (frame-perfect timing)...`);
        console.log(`  Total frames to render: ${totalFrames}`);
        console.log(`  Frame duration: ${frameDuration.toFixed(2)}ms`);

        return new Promise((resolve, reject) => {
            let frameCount = 0;
            let startTime = null;
            let lastLogTime = 0;

            const renderFrame = () => {
                try {
                    // Check if recording is complete
                    if (frameCount >= totalFrames) {
                        const elapsed = performance.now() - startTime;
                        console.log(`✓ Recording complete (${frameCount} frames rendered in ${(elapsed / 1000).toFixed(2)}s)`);
                        resolve();
                        return;
                    }

                    // Initialize start time on first frame
                    if (startTime === null) {
                        startTime = performance.now();
                    }

                    // Calculate exact time for THIS specific frame (deterministic)
                    const frameTime = frameCount * (frameDuration / 1000);

                    // Render ONE frame per call
                    // captureStream(fps) will sample these frames at the target FPS
                    effect.update(frameDuration / 1000, frameTime);
                    this.offscreenRenderer.render(scene, camera);

                    frameCount++;

                    // Update progress
                    const percentage = (frameCount / totalFrames) * 100;
                    state.set('exportProgress', {
                        currentFrame: frameCount,
                        totalFrames: totalFrames,
                        percentage: Math.round(percentage)
                    });

                    // Log progress every second
                    if (frameCount % fps === 0) {
                        console.log(`  Frame ${frameCount}/${totalFrames} (${percentage.toFixed(1)}%) @ ${frameTime.toFixed(2)}s`);
                    }

                    // Continue rendering at steady pace
                    // Render at target FPS (or slightly faster to ensure MediaRecorder has frames)
                    setTimeout(renderFrame, frameDuration);

                } catch (error) {
                    console.error('Frame render error:', error);
                    reject(error);
                }
            };

            // Start rendering loop
            renderFrame();
        });
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
     * Hide main UI elements when entering Export Mode
     */
    hideMainUI() {
        const toolbar = document.getElementById('toolbar');
        const settingsPanel = document.getElementById('settings-panel');
        const inspectorPanel = document.getElementById('inspector-panel');
        const controlsPanel = document.getElementById('controls-panel');

        if (toolbar) {
            toolbar.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            toolbar.style.transform = 'translateY(-100%)';
            toolbar.style.opacity = '0';
        }

        if (settingsPanel) {
            settingsPanel.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            settingsPanel.style.transform = 'translateX(-100%)';
            settingsPanel.style.opacity = '0';
        }

        if (inspectorPanel) {
            inspectorPanel.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            inspectorPanel.style.transform = 'translateX(100%)';
            inspectorPanel.style.opacity = '0';
        }

        if (controlsPanel) {
            controlsPanel.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            controlsPanel.style.transform = 'translateY(100%)';
            controlsPanel.style.opacity = '0';
        }

        console.log('✓ Main UI hidden (toolbar, settings, inspector, controls)');
    }

    /**
     * Show main UI elements when exiting Export Mode
     */
    showMainUI() {
        const toolbar = document.getElementById('toolbar');
        const settingsPanel = document.getElementById('settings-panel');
        const inspectorPanel = document.getElementById('inspector-panel');
        const controlsPanel = document.getElementById('controls-panel');

        if (toolbar) {
            toolbar.style.transform = 'translateY(0)';
            toolbar.style.opacity = '1';
        }

        if (settingsPanel) {
            settingsPanel.style.transform = 'translateX(0)';
            settingsPanel.style.opacity = '1';
        }

        if (inspectorPanel) {
            inspectorPanel.style.transform = 'translateX(0)';
            inspectorPanel.style.opacity = '1';
        }

        if (controlsPanel) {
            controlsPanel.style.transform = 'translateY(0)';
            controlsPanel.style.opacity = '1';
        }

        console.log('✓ Main UI shown (toolbar, settings, inspector, controls)');
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

        // Cleanup UI components
        if (this.safeFrameComponent) {
            this.safeFrameComponent.destroy();
            this.safeFrameComponent = null;
        }

        if (this.exportPanelComponent) {
            this.exportPanelComponent.destroy();
            this.exportPanelComponent = null;
        }

        console.log('✓ VideoExportManager destroyed');
    }
}

export default VideoExportManager;
