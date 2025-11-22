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
        this.isMinimized = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };

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
                <div class="export-panel__controls">
                    <button class="export-panel__minimize" title="Minimize">−</button>
                    <button class="export-panel__close" title="Exit Export Mode (ESC)">×</button>
                </div>
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

                <!-- FPS Control -->
                <div class="fps-control">
                    <label for="export-fps">Frame Rate:</label>
                    <select id="export-fps" class="fps-select">
                        <option value="30" selected>30 FPS (Standard)</option>
                        <option value="60">60 FPS (Smooth)</option>
                    </select>
                    <span class="fps-control__hint">Higher FPS = smoother motion, larger file</span>
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
        this.header = this.element.querySelector('.export-panel__header');
        this.content = this.element.querySelector('.export-panel__content');
        this.durationInput = this.element.querySelector('#export-duration');
        this.fpsSelect = this.element.querySelector('#export-fps');
        this.progressBar = this.element.querySelector('.export-progress');
        this.progressFill = this.element.querySelector('.export-progress__fill');
        this.progressText = this.element.querySelector('.export-progress__text');
        this.startButton = this.element.querySelector('[data-action="start"]');
        this.cancelButton = this.element.querySelector('[data-action="cancel"]');
        this.minimizeButton = this.element.querySelector('.export-panel__minimize');
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
            const fps = parseInt(this.fpsSelect.value, 10);
            await this.startExport(duration, fps);
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

        // Minimize/Maximize button
        this.minimizeButton.addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Draggable header
        this.setupDrag();

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
    async startExport(duration, fps) {
        // Disable controls
        this.startButton.disabled = true;
        this.durationInput.disabled = true;
        this.fpsSelect.disabled = true;

        // Show progress
        this.progressBar.classList.add('visible');

        // Change button text
        this.startButton.innerHTML = '⏸️ Recording...';

        try {
            await this.videoExportManager.startExport({ duration, fps });
        } catch (error) {
            console.error('Export error:', error);
            alert(`Export failed: ${error.message}`);
        }

        // Re-enable controls
        this.startButton.disabled = false;
        this.durationInput.disabled = false;
        this.fpsSelect.disabled = false;
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
     * Toggle minimize/maximize
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;

        if (this.isMinimized) {
            this.element.classList.add('minimized');
            this.content.style.display = 'none';
            this.minimizeButton.innerHTML = '+';
            this.minimizeButton.title = 'Maximize';
        } else {
            this.element.classList.remove('minimized');
            this.content.style.display = 'block';
            this.minimizeButton.innerHTML = '−';
            this.minimizeButton.title = 'Minimize';
        }
    }

    /**
     * Setup dragging for the header
     */
    setupDrag() {
        this.header.addEventListener('mousedown', (e) => {
            // Don't drag if clicking on buttons
            if (e.target === this.minimizeButton || e.target === this.closeButton) {
                return;
            }

            this.isDragging = true;

            // Get current visual position
            const rect = this.element.getBoundingClientRect();

            // Remove centering transform to prevent jump
            this.element.style.transform = 'none';
            this.element.style.left = `${rect.left}px`;
            this.element.style.top = `${rect.top}px`;
            this.element.style.bottom = 'auto';
            this.element.style.right = 'auto';

            // Calculate drag offset from current position
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;

            this.header.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const x = e.clientX - this.dragOffset.x;
                const y = e.clientY - this.dragOffset.y;

                this.element.style.left = `${x}px`;
                this.element.style.top = `${y}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.header.style.cursor = 'grab';
            }
        });

        // Set initial cursor
        this.header.style.cursor = 'grab';
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
