/**
 * VideoExportManager
 * Handles video export functionality for PowerPoint integration
 *
 * Features:
 * - MP4 export (PowerPoint compatible) via canvas-record
 * - 1920×1080 @ 30/60fps
 * - Safe Frame system for export region
 * - Frame-perfect offline rendering (faster than realtime)
 * - Perfect loop calculation via effects
 * - Zero external dependencies - canvas-record vendored with embedded WASM
 *
 * Architecture:
 * - Uses canvas-record Recorder API with MP4WasmEncoder
 * - Embedded WASM MP4 encoder (no external dependencies)
 * - Frame-by-frame offline rendering via await recorder.step()
 * - Deterministic animation timing
 */

import state from './state.js';
import SafeFrameComponent from '../ui/safe-frame.js';
import ExportPanelComponent from '../ui/export-panel.js';
import { Recorder, Encoders } from '../../lib/canvas-record/package/index.js';

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
        this.recorder = null;        // canvas-record Recorder
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

            // 3. Initialize canvas-record Recorder
            console.log('→ Initializing canvas-record (frame-perfect MP4 export)...');
            console.log('  Canvas:', this.offscreenCanvas, 'Size:', this.offscreenCanvas.width, 'x', this.offscreenCanvas.height);

            // canvas-record expects a RenderingContext, not a Canvas element
            // Get the WebGL context from the Three.js renderer
            // In Three.js r115, the context is a property, not a method
            console.log('  Renderer:', this.offscreenRenderer);
            console.log('  Renderer.context:', this.offscreenRenderer.context);

            const gl = this.offscreenRenderer.context;  // Property, not method!

            console.log('  WebGL Context:', gl);
            console.log('  Context type:', gl ? gl.constructor.name : 'null/undefined');
            console.log('  Has canvas?', gl && 'canvas' in gl);
            console.log('  Has drawingBufferWidth?', gl && 'drawingBufferWidth' in gl);

            if (!gl) {
                throw new Error('Failed to get WebGL context from renderer');
            }

            const filename = `floss-export-${Date.now()}.mp4`;

            // Create MP4WasmEncoder explicitly (instead of letting canvas-record
            // auto-select WebCodecsEncoder, which has browser support issues)
            const encoder = new Encoders.MP4WasmEncoder({
                extension: 'mp4'
            });

            console.log('  Using encoder:', encoder.constructor.name);

            // Calculate bitrate manually (estimateBitRate has wrong param order in MP4WasmEncoder)
            // Formula: width × height × fps × motionRank × 0.07 × (0.75 if variable, 1 if constant)
            const width = this.offscreenCanvas.width;
            const height = this.offscreenCanvas.height;
            const fps = this.exportOptions.fps;
            const motionRank = 4;  // 1=low motion, 2=medium, 4=high motion
            const bitrateMode = 'variable';
            const bitrate = Math.round(
                width * height * fps * motionRank * 0.07 * (bitrateMode === 'variable' ? 0.75 : 1)
            );

            console.log(`  Bitrate: ${(bitrate / 1_000_000).toFixed(1)} Mbps (${bitrateMode})`);

            this.recorder = new Recorder(gl, {
                name: filename,
                duration: this.exportOptions.duration,
                frameRate: this.exportOptions.fps,
                download: false,  // We handle download ourselves
                extension: 'mp4',
                encoder: encoder,  // Explicitly use MP4WasmEncoder (embedded WASM)
                encoderOptions: {
                    bitrateMode: bitrateMode,
                    bitrate: bitrate  // Provide explicit bitrate value
                }
            });

            console.log('✓ canvas-record Recorder initialized with MP4WasmEncoder');

            // 4. Start recording
            await this.recorder.start();
            console.log('✓ Recording started - rendering frames...');

            // 5. Render animation frame-by-frame (OFFLINE - frame-perfect!)
            // The last step() call will automatically stop the recorder and return the buffer
            const buffer = await this.renderFrameByFrame();

            // 6. Convert buffer to Blob
            const blob = new Blob([buffer], { type: 'video/mp4' });
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
     * Cancel ongoing export
     * Transition: recording → setup
     */
    cancelExport() {
        if (this.exportMode !== 'recording') {
            console.warn('No active export to cancel');
            return;
        }

        console.log('⏹ Cancelling export');

        // Cleanup recorder
        if (this.recorder) {
            // canvas-record doesn't have explicit cancel/abort
            // Cleanup will happen in dispose
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
     * Render animation frame-by-frame (OFFLINE, deterministic)
     *
     * This is the correct approach for frame-perfect video:
     * - NO requestAnimationFrame (not realtime!)
     * - Simple for-loop rendering each frame
     * - await recorder.step() captures each frame
     * - 100% deterministic - no timing issues, no dropped frames
     *
     * Uses canvas-record Recorder API with MP4WasmEncoder.
     */
    async renderFrameByFrame() {
        const effect = this.sceneManager.activeEffect;
        const scene = this.sceneManager.scene;
        const camera = this.sceneManager.camera;

        if (!effect || !scene || !camera) {
            throw new Error('Scene, camera, or effect not initialized');
        }

        const fps = this.exportOptions.fps;
        const frameDuration = 1 / fps;  // seconds per frame (0.0333s for 30fps)
        const totalFrames = this.totalFrames;

        console.log(`→ Rendering ${totalFrames} frames at ${fps}fps (offline)...`);

        const startTime = performance.now();
        let buffer = null;

        // Frame-by-frame rendering loop (OFFLINE - not realtime!)
        for (let frameNumber = 0; frameNumber < totalFrames; frameNumber++) {
            // Calculate exact time for this frame (deterministic)
            const time = frameNumber * frameDuration;

            // 1. Update effect state
            effect.update(frameDuration, time);

            // 2. Render to offscreen canvas
            this.offscreenRenderer.render(scene, camera);

            // 3. Tell recorder to capture this frame
            // The LAST step() call will auto-stop and return the buffer
            const result = await this.recorder.step();
            if (result) {
                buffer = result;  // Capture buffer from last step
            }

            // Update progress
            const percentage = ((frameNumber + 1) / totalFrames) * 100;
            state.set('exportProgress', {
                currentFrame: frameNumber + 1,
                totalFrames: totalFrames,
                percentage: Math.round(percentage)
            });

            // Log progress every second worth of frames
            if ((frameNumber + 1) % fps === 0) {
                const elapsed = (performance.now() - startTime) / 1000;
                const speed = (frameNumber + 1) / elapsed;
                console.log(`  Frame ${frameNumber + 1}/${totalFrames} (${percentage.toFixed(1)}%) - ${speed.toFixed(1)}fps render speed`);
            }
        }

        const elapsed = (performance.now() - startTime) / 1000;
        const avgSpeed = totalFrames / elapsed;
        console.log(`✓ All frames rendered in ${elapsed.toFixed(2)}s (${avgSpeed.toFixed(1)}× realtime)`);

        return buffer;  // Return the buffer from the last step
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
