/**
 * Canvas Recorder - Lightweight MP4 video recording for canvas elements
 * Uses native MediaRecorder API (no dependencies!)
 *
 * Browser Support:
 * - Chrome/Edge: H.264 (MP4) via 'video/mp4; codecs=avc1'
 * - Firefox: VP9 (WebM) fallback
 * - Safari: H.264 (MP4)
 */

export class CanvasRecorder {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.options = {
            mimeType: this.getSupportedMimeType(),
            videoBitsPerSecond: options.videoBitsPerSecond || 8000000,  // 8 Mbps
            frameRate: options.frameRate || 30,
            ...options
        };

        this.mediaRecorder = null;
        this.chunks = [];
        this.stream = null;
    }

    /**
     * Detect best supported MIME type
     * Priority: MP4 (H.264) > WebM (VP9) > WebM (VP8)
     */
    getSupportedMimeType() {
        const types = [
            'video/mp4; codecs=avc1.42E032',     // H.264 Baseline (best compatibility)
            'video/mp4; codecs=avc1.4D401F',     // H.264 Main
            'video/mp4',                          // Generic MP4
            'video/webm; codecs=vp9',            // VP9 (good quality)
            'video/webm; codecs=vp8',            // VP8 (fallback)
            'video/webm'                          // Generic WebM
        ];

        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                console.log(`✓ Using MIME type: ${type}`);
                return type;
            }
        }

        // Fallback to default (browser will choose)
        console.warn('No preferred MIME type supported, using browser default');
        return undefined;
    }

    /**
     * Start recording with manual frame control
     * Uses captureStream(0) + requestFrame() for frame-perfect recording
     */
    async start() {
        try {
            // Capture stream with MANUAL frame triggering (0 = no automatic sampling)
            // This gives us 100% control over when frames are captured
            this.stream = this.canvas.captureStream(0);
            this.videoTrack = this.stream.getVideoTracks()[0];

            if (!this.videoTrack) {
                throw new Error('No video track available from canvas stream');
            }

            // Create MediaRecorder with optimal settings
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: this.options.mimeType,
                videoBitsPerSecond: this.options.videoBitsPerSecond
            });

            // Collect chunks
            this.chunks = [];
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            // Start recording
            this.mediaRecorder.start(100);  // Collect data every 100ms
            console.log('✓ Canvas recording started (manual frame control via requestFrame)');

        } catch (error) {
            console.error('Failed to start recording:', error);
            throw new Error(`Recording failed: ${error.message}`);
        }
    }

    /**
     * Request MediaRecorder to capture the current canvas frame
     * Call this after each render() to ensure frame-perfect recording
     *
     * This is the KEY to eliminating dropped frames!
     */
    captureFrame() {
        if (this.videoTrack && this.videoTrack.readyState === 'live') {
            this.videoTrack.requestFrame();
        }
    }

    /**
     * Stop recording and return video blob
     * @returns {Promise<Blob>} Video blob (MP4 or WebM)
     */
    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('MediaRecorder not initialized'));
                return;
            }

            // Wait for final data and create blob
            this.mediaRecorder.onstop = () => {
                try {
                    const blob = new Blob(this.chunks, {
                        type: this.options.mimeType || 'video/mp4'
                    });

                    console.log(`✓ Recording stopped, blob size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
                    console.log(`✓ MIME type: ${blob.type}`);

                    // Cleanup
                    this.stream.getTracks().forEach(track => track.stop());
                    this.chunks = [];

                    resolve(blob);
                } catch (error) {
                    reject(error);
                }
            };

            this.mediaRecorder.onerror = (error) => {
                reject(error);
            };

            // Stop recording
            if (this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            } else {
                reject(new Error('MediaRecorder already stopped'));
            }
        });
    }

    /**
     * Pause recording
     */
    pause() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.pause();
            console.log('⏸ Recording paused');
        }
    }

    /**
     * Resume recording
     */
    resume() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
            this.mediaRecorder.resume();
            console.log('▶️ Recording resumed');
        }
    }

    /**
     * Get current recording state
     */
    get state() {
        return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
    }

    /**
     * Check if MP4/H.264 is supported
     */
    static isMP4Supported() {
        return MediaRecorder.isTypeSupported('video/mp4; codecs=avc1.42E032') ||
               MediaRecorder.isTypeSupported('video/mp4');
    }

    /**
     * Get supported codecs info
     */
    static getSupportedCodecs() {
        const codecs = {
            'H.264 (MP4) - Baseline': 'video/mp4; codecs=avc1.42E032',
            'H.264 (MP4) - Main': 'video/mp4; codecs=avc1.4D401F',
            'VP9 (WebM)': 'video/webm; codecs=vp9',
            'VP8 (WebM)': 'video/webm; codecs=vp8',
            'Generic MP4': 'video/mp4',
            'Generic WebM': 'video/webm'
        };

        const supported = {};
        for (const [name, mime] of Object.entries(codecs)) {
            supported[name] = MediaRecorder.isTypeSupported(mime);
        }

        return supported;
    }
}

export default CanvasRecorder;
