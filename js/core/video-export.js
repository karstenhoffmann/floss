/**
 * VideoExportManager
 * Handles video export functionality for PowerPoint integration
 *
 * Features:
 * - WebM export (PowerPoint compatible) via WebCodecs + custom muxer
 * - 1920×1080 @ 30/60fps
 * - Safe Frame system for export region
 * - Frame-perfect offline rendering (faster than realtime)
 * - Perfect loop calculation via effects
 * - Zero external dependencies - vendored WebM muxer
 *
 * Architecture:
 * - Uses WebCodecs VideoEncoder API (hardware-accelerated VP9)
 * - Custom EBML-based WebM muxer (vendored in /lib/)
 * - Frame-by-frame offline rendering (deterministic)
 * - Exact timestamp control (no frame drops, no timing drift)
 */

import state from './state.js';
import SafeFrameComponent from '../ui/safe-frame.js';
import ExportPanelComponent from '../ui/export-panel.js';
import WebMMuxer from '../../lib/webm-muxer/index.js';

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
        this.encoder = null;         // WebCodecs VideoEncoder
        this.muxer = null;           // WebM muxer
        this.encoderReady = null;    // Promise for encoder configuration
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
            // 1. Check WebCodecs support
            if (!window.VideoEncoder) {
                throw new Error('WebCodecs API not supported in this browser. Use Chrome/Edge 94+');
            }

            // 2. Create offscreen canvas and renderer
            this.createOffscreenRenderer();
            console.log('✓ Offscreen renderer created');

            // 3. Reset effect to t=0
            const effect = this.sceneManager.activeEffect;
            if (effect && typeof effect.reset === 'function') {
                effect.reset();
                console.log('✓ Effect reset to t=0');
            }

            // 4. Detect best supported codec
            console.log('→ Detecting best supported video codec...');
            const codecConfig = await this.detectBestCodec();
            console.log(`✓ Selected codec: ${codecConfig.codec} (${codecConfig.name})`);

            // 5. Initialize WebM muxer
            console.log('→ Initializing WebM muxer...');
            this.muxer = new WebMMuxer({
                width: this.exportOptions.width,
                height: this.exportOptions.height,
                frameRate: this.exportOptions.fps,
                codec: codecConfig.muxerCodec
            });
            console.log('✓ WebM muxer initialized');

            // 6. Initialize VideoEncoder
            console.log('→ Initializing VideoEncoder (WebCodecs API)...');

            let encoderError = null;
            this.encoderReady = new Promise((resolve) => {
                this.encoder = new VideoEncoder({
                    output: (chunk, metadata) => {
                        // Add encoded chunk to muxer
                        const timestamp = chunk.timestamp / 1000; // microseconds → milliseconds
                        this.muxer.addFrame(chunk, timestamp);
                    },
                    error: (e) => {
                        encoderError = e;
                        console.error('VideoEncoder error:', e);
                    }
                });

                // Configure encoder with detected codec
                this.encoder.configure(codecConfig);

                resolve();
            });

            await this.encoderReady;

            if (encoderError) {
                throw encoderError;
            }

            console.log('✓ VideoEncoder configured');

            // 7. Render animation frame-by-frame (OFFLINE - frame-perfect!)
            console.log('✓ Encoder ready - rendering frames...');
            await this.renderFrameByFrame();

            // 8. Flush encoder (finish encoding all frames)
            console.log('→ Flushing encoder...');
            await this.encoder.flush();
            this.encoder.close();
            console.log('✓ Encoder flushed and closed');

            // 9. Finalize muxer and get blob
            console.log('→ Finalizing WebM file...');
            const blob = this.muxer.finalize();
            console.log('✓ WebM finalized, blob size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');

            // 10. Complete export and trigger download
            this.completeExport(blob);

        } catch (error) {
            console.error('Export failed:', error);
            this.cancelExport();
            throw error;
        }
    }

    /**
     * Detect best supported video codec
     * Tests VP9, VP8, and AV1 in order of preference
     */
    async detectBestCodec() {
        const width = this.exportOptions.width;
        const height = this.exportOptions.height;
        const bitrate = this.exportOptions.bitrate;
        const fps = this.exportOptions.fps;

        // Codec candidates (in order of preference)
        const candidates = [
            {
                name: 'VP9',
                codec: 'vp09.00.10.08',
                muxerCodec: 'vp9',
                config: {
                    codec: 'vp09.00.10.08',
                    width,
                    height,
                    bitrate,
                    framerate: fps,
                    hardwareAcceleration: 'prefer-hardware',
                    latencyMode: 'quality'
                }
            },
            {
                name: 'VP8',
                codec: 'vp8',
                muxerCodec: 'vp8',
                config: {
                    codec: 'vp8',
                    width,
                    height,
                    bitrate,
                    framerate: fps,
                    hardwareAcceleration: 'prefer-hardware',
                    latencyMode: 'quality'
                }
            },
            {
                name: 'AV1',
                codec: 'av01.0.04M.08',
                muxerCodec: 'vp9', // AV1 goes in WebM container
                config: {
                    codec: 'av01.0.04M.08',
                    width,
                    height,
                    bitrate,
                    framerate: fps,
                    hardwareAcceleration: 'prefer-hardware',
                    latencyMode: 'quality'
                }
            }
        ];

        // Test each codec
        for (const candidate of candidates) {
            try {
                const support = await VideoEncoder.isConfigSupported(candidate.config);

                if (support.supported) {
                    console.log(`  ✓ ${candidate.name} supported`);
                    // Return full candidate object (includes muxerCodec and name)
                    return {
                        ...candidate.config,
                        muxerCodec: candidate.muxerCodec,
                        name: candidate.name
                    };
                } else {
                    console.log(`  ✗ ${candidate.name} not supported`);
                }
            } catch (error) {
                console.log(`  ✗ ${candidate.name} check failed:`, error.message);
            }
        }

        // No codec supported - throw error
        throw new Error('No supported video codec found. WebCodecs requires Chrome/Edge 94+');
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

        // Cleanup encoder
        if (this.encoder && this.encoder.state !== 'closed') {
            this.encoder.close();
        }
        this.encoder = null;
        this.muxer = null;

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
     * - encoder.encode(VideoFrame) captures each frame exactly
     * - 100% deterministic - no timing issues, no dropped frames
     *
     * Uses WebCodecs VideoEncoder API for frame-perfect encoding.
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

        // Frame-by-frame rendering loop (OFFLINE - not realtime!)
        for (let frameNumber = 0; frameNumber < totalFrames; frameNumber++) {
            // Calculate exact time for this frame (deterministic)
            const time = frameNumber * frameDuration;
            const timestamp = time * 1_000_000;  // seconds → microseconds

            // 1. Update effect state
            effect.update(frameDuration, time);

            // 2. Render to offscreen canvas
            this.offscreenRenderer.render(scene, camera);

            // 3. Create VideoFrame from canvas
            const videoFrame = new VideoFrame(this.offscreenCanvas, {
                timestamp: timestamp,
                duration: frameDuration * 1_000_000  // microseconds
            });

            // 4. Encode frame
            const isKeyframe = frameNumber % (fps * 2) === 0;  // Keyframe every 2 seconds
            this.encoder.encode(videoFrame, { keyFrame: isKeyframe });

            // 5. Close VideoFrame (free memory)
            videoFrame.close();

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
