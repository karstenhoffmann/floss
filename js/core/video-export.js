/**
 * VideoExportManager
 * Handles video export functionality for PowerPoint integration
 *
 * Features:
 * - MP4/WebM export (PowerPoint compatible) via MediaRecorder
 * - 1920×1080 @ 30/60fps
 * - Safe Frame system for export region
 * - Realtime rendering with precise timing
 * - Perfect loop calculation via effects
 * - No external dependencies - pure browser APIs
 *
 * Architecture:
 * - Uses native MediaRecorder API (zero dependencies)
 * - captureStream(fps) for frame capture
 * - requestAnimationFrame for smooth rendering
 * - Deterministic animation timing
 */

import state from './state.js';
import SafeFrameComponent from '../ui/safe-frame.js';
import ExportPanelComponent from '../ui/export-panel.js';

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
        this.recordedChunks = [];  // MediaRecorder data chunks
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
            console.log('✓ Offscreen renderer created');

            // 2. Reset effect to t=0
            const effect = this.sceneManager.activeEffect;
            if (effect && typeof effect.reset === 'function') {
                effect.reset();
                console.log('✓ Effect reset to t=0');
            }

            // 3. Initialize MediaRecorder
            console.log('→ Initializing MediaRecorder (native browser API)...');

            // Create media stream from canvas at target FPS
            const stream = this.offscreenCanvas.captureStream(this.exportOptions.fps);
            const mimeType = this.getBestMimeType();

            this.recorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: this.exportOptions.bitrate
            });

            // Collect data chunks
            this.recordedChunks = [];
            this.recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            console.log('✓ MediaRecorder initialized');

            // 4. Start recording
            this.recorder.start();
            console.log('✓ Recording started - rendering realtime...');

            // 5. Render animation in realtime
            await this.renderRealtimeAnimation();

            // 6. Stop recording and get blob
            const blob = await this.stopRecording();
            console.log('✓ Recording stopped, blob size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

            // 7. Complete export and trigger download
            this.completeExport(blob);

        } catch (error) {
            console.error('Export failed:', error);
            this.cancelExport();
            throw error;
        }
    }

    /**
     * Stop MediaRecorder and return video blob
     */
    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.recorder) {
                reject(new Error('No recorder active'));
                return;
            }

            this.recorder.onstop = () => {
                const mimeType = this.recorder.mimeType || 'video/webm';
                const blob = new Blob(this.recordedChunks, { type: mimeType });
                resolve(blob);
            };

            this.recorder.onerror = (event) => {
                reject(new Error(`MediaRecorder error: ${event.error}`));
            };

            this.recorder.stop();
        });
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
        if (this.recorder && this.recorder.state !== 'inactive') {
            this.recorder.stop();
        }
        this.recorder = null;
        this.recordedChunks = [];

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
    completeExport(blob) {
        console.log('✓ Export complete');

        this.exportMode = 'complete';
        state.set('exportMode', 'complete');

        // Trigger download
        if (blob) {
            const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
            const filename = `floss-export-${Date.now()}.${extension}`;
            this.downloadBlob(blob, filename);
        }

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
     * Render animation in realtime for MediaRecorder
     *
     * MediaRecorder captures from canvas in realtime using captureStream(),
     * so we need to render at the target framerate using requestAnimationFrame.
     * Uses deterministic timing based on elapsed time (not deltaTime) for perfect loops.
     */
    renderRealtimeAnimation() {
        return new Promise((resolve, reject) => {
            const effect = this.sceneManager.activeEffect;
            const scene = this.sceneManager.scene;
            const camera = this.sceneManager.camera;

            if (!effect || !scene || !camera) {
                reject(new Error('Scene, camera, or effect not initialized'));
                return;
            }

            const fps = this.exportOptions.fps;
            const duration = this.exportOptions.duration;
            const frameDuration = 1000 / fps;  // milliseconds per frame

            console.log(`→ Rendering ${duration}s at ${fps}fps (realtime)...`);

            const startTime = performance.now();
            let lastFrameTime = startTime;
            let frameCount = 0;

            const animate = () => {
                const now = performance.now();
                const elapsed = now - startTime;
                const elapsedSeconds = elapsed / 1000;

                // Check if we've reached target duration
                if (elapsedSeconds >= duration) {
                    const totalTime = (now - startTime) / 1000;
                    console.log(`✓ Animation rendered in ${totalTime.toFixed(2)}s (${frameCount} frames)`);
                    resolve();
                    return;
                }

                // Frame-limiting: only render at target FPS
                const timeSinceLastFrame = now - lastFrameTime;
                if (timeSinceLastFrame >= frameDuration - 1) {  // -1ms tolerance
                    // Update effect with deterministic time
                    const dt = frameDuration / 1000;  // deltaTime in seconds
                    effect.update(dt, elapsedSeconds);

                    // Render to offscreen canvas (MediaRecorder captures automatically)
                    this.offscreenRenderer.render(scene, camera);

                    // Update progress
                    frameCount++;
                    const percentage = (elapsedSeconds / duration) * 100;
                    state.set('exportProgress', {
                        currentFrame: frameCount,
                        totalFrames: Math.ceil(duration * fps),
                        percentage: Math.round(percentage)
                    });

                    // Log progress every second
                    if (frameCount % fps === 0) {
                        const realElapsed = (now - startTime) / 1000;
                        const speed = frameCount / realElapsed;
                        console.log(`  ${elapsedSeconds.toFixed(1)}s/${duration}s (${percentage.toFixed(1)}%) - ${speed.toFixed(1)}fps`);
                    }

                    lastFrameTime = now;
                }

                // Continue animation
                requestAnimationFrame(animate);
            };

            // Start animation loop
            animate();
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
     * Get best supported MIME type for video recording
     * Prefers MP4 (PowerPoint compatible), falls back to WebM
     */
    getBestMimeType() {
        const types = [
            'video/mp4;codecs=h264',
            'video/mp4',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm'
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`✓ Using MIME type: ${type}`);
                return type;
            }
        }

        // Fallback to default
        console.warn('⚠️ No preferred MIME type supported, using default');
        return 'video/webm';
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
