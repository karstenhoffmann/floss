/**
 * ExportPanelComponent
 * Control panel for video export configuration
 */

export class ExportPanelComponent {
    constructor(videoExportManager) {
        this.videoExportManager = videoExportManager;
        this.element = null;
        this.durationInput = null;
        this.progressBar = null;
        this.progressText = null;
        this.startButton = null;
        this.cancelButton = null;

        this.create();
        this.setupEventListeners();
    }

    /**
     * Create DOM elements
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'export-panel';

        // Get export options from current effect
        const opts = this.videoExportManager.getExportOptions();

        this.element.innerHTML = `
            <div class="export-panel__header">
                <h3 class="export-panel__title">📹 Export Video</h3>
                <button class="export-panel__close" title="Exit Export Mode (ESC)">×</button>
            </div>

            <div class="export-panel__content">
                <!-- Export Info -->
                <div class="export-info">
                    <div class="export-info__item">
                        <span class="export-info__label">Effect</span>
                        <span class="export-info__value">${opts.effectName}</span>
                    </div>
                    <div class="export-info__item">
                        <span class="export-info__label">Resolution</span>
                        <span class="export-info__value">1920 × 1080</span>
                    </div>
                    <div class="export-info__item">
                        <span class="export-info__label">Frame Rate</span>
                        <span class="export-info__value">30 FPS</span>
                    </div>
                    <div class="export-info__item">
                        <span class="export-info__label">Format</span>
                        <span class="export-info__value">MP4 (H.264)</span>
                    </div>
                    <div class="export-info__item">
                        <span class="export-info__label">Loop Type</span>
                        <span class="export-info__value highlight">${opts.type === 'loop' ? '🔁 Loop' : '▶️ Oneshot'}</span>
                    </div>
                    <div class="export-info__item">
                        <span class="export-info__label">Seamless</span>
                        <span class="export-info__value highlight">${opts.isSeamless ? '✓ Yes' : '✗ No'}</span>
                    </div>
                </div>

                <!-- Duration Control -->
                <div class="duration-control">
                    <label for="export-duration">Duration:</label>
                    <input
                        type="number"
                        id="export-duration"
                        min="${opts.minDuration}"
                        max="${opts.maxDuration}"
                        step="0.1"
                        value="${opts.duration.toFixed(1)}"
                    />
                    <span class="duration-control__hint">${opts.explanation}</span>
                </div>

                <!-- Progress Bar (hidden initially) -->
                <div class="export-progress">
                    <div class="export-progress__bar">
                        <div class="export-progress__fill" style="width: 0%"></div>
                    </div>
                    <div class="export-progress__text">Frame 0 / 0 (0%)</div>
                </div>

                <!-- Action Buttons -->
                <div class="export-panel__actions">
                    <button class="export-btn export-btn--secondary" data-action="cancel">
                        Cancel
                    </button>
                    <button class="export-btn export-btn--primary" data-action="start">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="10" fill="currentColor"/>
                        </svg>
                        Start Recording
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.element);

        // Store references
        this.durationInput = this.element.querySelector('#export-duration');
        this.progressBar = this.element.querySelector('.export-progress');
        this.progressFill = this.element.querySelector('.export-progress__fill');
        this.progressText = this.element.querySelector('.export-progress__text');
        this.startButton = this.element.querySelector('[data-action="start"]');
        this.cancelButton = this.element.querySelector('[data-action="cancel"]');
        this.closeButton = this.element.querySelector('.export-panel__close');

        console.log('✓ ExportPanelComponent created');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Start button
        this.startButton.addEventListener('click', async () => {
            const duration = parseFloat(this.durationInput.value);
            await this.startExport(duration);
        });

        // Cancel button
        this.cancelButton.addEventListener('click', () => {
            if (this.videoExportManager.exportMode === 'recording') {
                this.videoExportManager.cancelExport();
            } else {
                this.videoExportManager.exit();
            }
        });

        // Close button
        this.closeButton.addEventListener('click', () => {
            this.videoExportManager.exit();
        });

        // Listen to export progress
        this.setupProgressListener();
    }

    /**
     * Setup progress listener
     */
    setupProgressListener() {
        // Import state to listen to exportProgress
        import('../core/state.js').then(module => {
            const state = module.default;

            state.subscribe('exportProgress', (progress) => {
                this.updateProgress(progress);
            });
        });
    }

    /**
     * Start export
     */
    async startExport(duration) {
        // Disable controls
        this.startButton.disabled = true;
        this.durationInput.disabled = true;

        // Show progress
        this.progressBar.classList.add('visible');

        // Change button text
        this.startButton.innerHTML = '⏸️ Recording...';

        try {
            await this.videoExportManager.startExport({ duration });
        } catch (error) {
            console.error('Export error:', error);
            alert(`Export failed: ${error.message}`);
        }

        // Re-enable controls
        this.startButton.disabled = false;
        this.durationInput.disabled = false;
        this.startButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="currentColor"/>
            </svg>
            Start Recording
        `;

        // Hide progress after delay
        setTimeout(() => {
            this.progressBar.classList.remove('visible');
        }, 2000);
    }

    /**
     * Update progress bar
     */
    updateProgress(progress) {
        const { currentFrame, totalFrames, percentage } = progress;

        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `Frame ${currentFrame} / ${totalFrames} (${percentage}%)`;
    }

    /**
     * Show panel
     */
    show() {
        this.element.classList.add('visible');

        // Refresh export options in case effect changed
        const opts = this.videoExportManager.getExportOptions();
        this.durationInput.value = opts.duration.toFixed(1);
    }

    /**
     * Hide panel
     */
    hide() {
        this.element.classList.remove('visible');
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default ExportPanelComponent;
