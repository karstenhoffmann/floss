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

        this.create();
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
        const label = document.createElement('div');
        label.className = 'safe-frame-label';
        label.textContent = '1920 × 1080 (16:9) Export Region';
        this.rect.appendChild(label);

        // Center crosshair
        const center = document.createElement('div');
        center.className = 'safe-frame-center';
        this.rect.appendChild(center);

        // Resize handles (disabled for now - fixed 1920x1080)
        // const handles = ['nw', 'ne', 'sw', 'se'];
        // handles.forEach(pos => {
        //     const handle = document.createElement('div');
        //     handle.className = `safe-frame-handle ${pos}`;
        //     this.rect.appendChild(handle);
        // });

        this.element.appendChild(this.rect);
        document.body.appendChild(this.element);

        // Setup drag
        this.setupDrag();

        console.log('✓ SafeFrameComponent created');
    }

    /**
     * Setup drag to move safe frame
     */
    setupDrag() {
        this.rect.addEventListener('mousedown', (e) => {
            if (e.target === this.rect) {
                this.isDragging = true;
                const safeFrame = this.videoExportManager.getSafeFrame();
                this.dragOffset.x = e.clientX - safeFrame.x;
                this.dragOffset.y = e.clientY - safeFrame.y;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const x = e.clientX - this.dragOffset.x;
                const y = e.clientY - this.dragOffset.y;
                this.videoExportManager.updateSafeFrame({ x, y });
                this.update();
            }
        });

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
     * Update position from VideoExportManager
     */
    update() {
        const safeFrame = this.videoExportManager.getSafeFrame();

        this.rect.style.left = `${safeFrame.x}px`;
        this.rect.style.top = `${safeFrame.y}px`;
        this.rect.style.width = `${safeFrame.width}px`;
        this.rect.style.height = `${safeFrame.height}px`;
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
