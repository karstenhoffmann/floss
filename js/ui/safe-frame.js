/**
 * SafeFrameComponent
 * Visual overlay showing 1920×1080 export region
 */

export class SafeFrameComponent {
    constructor(videoExportManager) {
        this.videoExportManager = videoExportManager;
        this.element = null;
        this.rect = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.scale = 1.0;  // Current scale (1.0 = full 1920x1080)
        this.isScaled = true;  // Start scaled to fit window

        this.create();
        this.calculateScale();
    }

    /**
     * Create DOM elements
     */
    create() {
        // Main overlay container
        this.element = document.createElement('div');
        this.element.className = 'safe-frame-overlay';

        // Safe frame rectangle
        this.rect = document.createElement('div');
        this.rect.className = 'safe-frame-rect';

        // Info label
        this.label = document.createElement('div');
        this.label.className = 'safe-frame-label';
        this.label.textContent = '1920 × 1080 (16:9) Export Region';
        this.rect.appendChild(this.label);

        // Scale toggle button
        this.scaleButton = document.createElement('button');
        this.scaleButton.className = 'safe-frame-scale-toggle';
        this.scaleButton.innerHTML = '⛶';  // Expand icon
        this.scaleButton.title = 'Expand to full size (1920×1080)';
        this.scaleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleScale();
        });
        this.rect.appendChild(this.scaleButton);

        // Center crosshair
        const center = document.createElement('div');
        center.className = 'safe-frame-center';
        this.rect.appendChild(center);

        // Create draggable edge zones (invisible but interactive)
        const edges = ['top', 'right', 'bottom', 'left'];
        this.edges = {};
        edges.forEach(edge => {
            const edgeEl = document.createElement('div');
            edgeEl.className = `safe-frame-edge ${edge}`;
            this.rect.appendChild(edgeEl);
            this.edges[edge] = edgeEl;
        });

        this.element.appendChild(this.rect);
        document.body.appendChild(this.element);

        // Setup drag
        this.setupDrag();

        console.log('✓ SafeFrameComponent created');
    }

    /**
     * Setup drag to move safe frame (only from edge elements)
     */
    setupDrag() {
        // Add mousedown listener to all edge elements
        Object.values(this.edges).forEach(edge => {
            edge.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                const safeFrame = this.videoExportManager.getSafeFrame();
                this.dragOffset.x = e.clientX - safeFrame.x;
                this.dragOffset.y = e.clientY - safeFrame.y;
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Global mousemove for dragging
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const x = e.clientX - this.dragOffset.x;
                const y = e.clientY - this.dragOffset.y;
                this.videoExportManager.updateSafeFrame({ x, y });
                this.update();
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Global mouseup to stop dragging
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    /**
     * Show safe frame
     */
    show() {
        this.element.classList.add('visible');
        this.update();
    }

    /**
     * Hide safe frame
     */
    hide() {
        this.element.classList.remove('visible');
    }

    /**
     * Calculate optimal scale to fit browser window and center
     */
    calculateScale() {
        const targetWidth = 1920;
        const targetHeight = 1080;
        const padding = 100;  // Safety margin from edges

        const maxWidth = window.innerWidth - padding * 2;
        const maxHeight = window.innerHeight - padding * 2;

        const scaleX = maxWidth / targetWidth;
        const scaleY = maxHeight / targetHeight;

        // Use smaller scale to maintain aspect ratio
        this.autoScale = Math.min(scaleX, scaleY, 1.0);  // Never scale up, only down

        // Apply auto scale if enabled
        if (this.isScaled) {
            this.scale = this.autoScale;
        }

        // Center based on SCALED size
        const scaledWidth = targetWidth * this.scale;
        const scaledHeight = targetHeight * this.scale;
        const x = (window.innerWidth - scaledWidth) / 2;
        const y = (window.innerHeight - scaledHeight) / 2;

        this.videoExportManager.updateSafeFrame({ x, y });

        this.updateLabel();
    }

    /**
     * Toggle between scaled and full size
     */
    toggleScale() {
        this.isScaled = !this.isScaled;

        if (this.isScaled) {
            this.scale = this.autoScale;
            this.scaleButton.innerHTML = '⛶';
            this.scaleButton.title = 'Expand to full size (1920×1080)';
        } else {
            this.scale = 1.0;
            this.scaleButton.innerHTML = '⛶';  // Could use different icon
            this.scaleButton.title = 'Fit to window';
        }

        this.updateLabel();
        this.update();

        // Recenter after scale change
        const safeFrame = this.videoExportManager.getSafeFrame();
        const scaledWidth = safeFrame.width * this.scale;
        const scaledHeight = safeFrame.height * this.scale;
        const x = (window.innerWidth - scaledWidth) / 2;
        const y = (window.innerHeight - scaledHeight) / 2;
        this.videoExportManager.updateSafeFrame({ x, y });
        this.update();
    }

    /**
     * Update label with current scale info
     */
    updateLabel() {
        const scalePercent = Math.round(this.scale * 100);
        if (this.scale < 1.0) {
            this.label.textContent = `1920 × 1080 (16:9) • ${scalePercent}% of target size`;
        } else {
            this.label.textContent = `1920 × 1080 (16:9) Export Region`;
        }
    }

    /**
     * Update position from VideoExportManager
     */
    update() {
        const safeFrame = this.videoExportManager.getSafeFrame();

        // Apply scale
        const scaledWidth = safeFrame.width * this.scale;
        const scaledHeight = safeFrame.height * this.scale;

        this.rect.style.left = `${safeFrame.x}px`;
        this.rect.style.top = `${safeFrame.y}px`;
        this.rect.style.width = `${scaledWidth}px`;
        this.rect.style.height = `${scaledHeight}px`;
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

export default SafeFrameComponent;
