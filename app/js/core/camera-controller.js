/**
 * Enhanced Camera Controller
 * Wraps THREE.OrbitControls with unified camera/object control
 * Features:
 * - Distance-scaled Pan sensitivity
 * - Unified Visual Center (pivot point)
 * - Bidirectional sync with UI (Mouse ↔ Sidebar)
 * - Spherical coordinate system for consistent rotation
 */

export class CameraController {
    constructor(camera, domElement, sceneManager) {
        this.camera = camera;
        this.domElement = domElement;
        this.sceneManager = sceneManager;

        // OrbitControls instance
        this.controls = null;

        // State tracking
        this.isProgrammaticUpdate = false;
        this.syncCallbacks = [];

        // Settings (configurable)
        this.settings = {
            panSensitivity: 1.0,        // Base pan speed multiplier
            rotateSensitivity: 1.0,     // Base rotation speed
            zoomSensitivity: 1.0,       // Zoom speed
            enableDamping: true,
            dampingFactor: 0.05,
            minDistance: 10,
            maxDistance: 200
        };

        this.init();
    }

    init() {
        if (typeof THREE.OrbitControls === 'undefined') {
            console.error('❌ OrbitControls not available');
            return;
        }

        // Create OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.domElement);

        // Configure OrbitControls
        this.controls.enableDamping = this.settings.enableDamping;
        this.controls.dampingFactor = this.settings.dampingFactor;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;

        // Mouse button mapping
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,      // LMB = Camera Pan
            MIDDLE: THREE.MOUSE.DOLLY,  // MMB = Zoom
            RIGHT: THREE.MOUSE.ROTATE   // RMB = Orbit around target
        };

        // Distance constraints
        this.controls.minDistance = this.settings.minDistance;
        this.controls.maxDistance = this.settings.maxDistance;

        // Enhanced pan with distance scaling
        this.enhancePan();

        // Listen to control changes
        this.controls.addEventListener('change', () => this.onControlsChange());
        this.controls.addEventListener('end', () => this.onControlsEnd());

        console.log('✓ Enhanced CameraController initialized');
    }

    /**
     * Enhance pan behavior with distance-based scaling
     */
    enhancePan() {
        if (!this.controls) return;

        // Store original pan method
        const originalPan = this.controls.pan.bind(this.controls);

        // Override with distance-scaled version
        this.controls.pan = (deltaX, deltaY) => {
            // Calculate distance from camera to target
            const distance = this.camera.position.distanceTo(this.controls.target);

            // Scale factor: larger distance = faster pan
            // Formula: scale = distance * sensitivity * base_factor
            const scale = distance * this.settings.panSensitivity * 0.001;

            // Apply scaled pan
            originalPan(deltaX * scale, deltaY * scale);
        };
    }

    /**
     * Get visual center (pivot point for rotation)
     * Priority:
     * 1. Effect-specific visual center
     * 2. Bounding sphere center
     * 3. Fallback to origin
     */
    getVisualCenter() {
        // Check if active effect provides custom visual center
        const effect = this.sceneManager.activeEffect;

        if (effect && typeof effect.getVisualCenter === 'function') {
            return effect.getVisualCenter();
        }

        // Fallback: Calculate from bounding box
        if (effect && effect.mesh) {
            const box = new THREE.Box3().setFromObject(effect.mesh);
            if (box.isEmpty()) {
                return new THREE.Vector3(0, 0, 0);
            }
            return box.getCenter(new THREE.Vector3());
        }

        // Default: origin
        return new THREE.Vector3(0, 0, 0);
    }

    /**
     * Update orbit target to visual center
     * Call this when effect changes or visual content updates
     */
    updatePivot() {
        if (!this.controls) return;

        const visualCenter = this.getVisualCenter();

        // Only update if center has changed significantly
        const threshold = 0.01;
        const distance = this.controls.target.distanceTo(visualCenter);

        if (distance > threshold) {
            this.controls.target.copy(visualCenter);
            console.log(`✓ Pivot updated to visual center: (${visualCenter.x.toFixed(2)}, ${visualCenter.y.toFixed(2)}, ${visualCenter.z.toFixed(2)})`);
        }
    }

    /**
     * Called during controls change (every frame when interacting)
     */
    onControlsChange() {
        if (this.isProgrammaticUpdate) return;

        // Don't sync on every frame (performance)
        // Sync happens on 'end' event instead
    }

    /**
     * Called when user releases mouse (interaction complete)
     */
    onControlsEnd() {
        if (this.isProgrammaticUpdate) return;

        // Extract current state
        const state = this.getState();

        // Notify all sync callbacks (e.g., update sidebar)
        this.syncCallbacks.forEach(callback => {
            try {
                callback(state);
            } catch (err) {
                console.error('Error in sync callback:', err);
            }
        });
    }

    /**
     * Get current camera state
     */
    getState() {
        if (!this.controls) return null;

        // Camera position and target
        const position = this.camera.position.clone();
        const target = this.controls.target.clone();

        // Spherical coordinates (for rotation representation)
        const offset = position.clone().sub(target);
        const spherical = new THREE.Spherical().setFromVector3(offset);

        return {
            // Raw values
            position: position,
            target: target,

            // Spherical (useful for UI)
            distance: spherical.radius,
            theta: spherical.theta * (180 / Math.PI),  // Horizontal angle (degrees)
            phi: spherical.phi * (180 / Math.PI),      // Vertical angle (degrees)

            // Pan offsets (relative to origin)
            panX: target.x,
            panY: target.y,
            panZ: target.z,

            // Zoom (camera distance on Z-axis)
            zoom: position.z
        };
    }

    /**
     * Set camera state from UI (sidebar sliders)
     * @param {Object} state - Camera state object
     */
    setState(state) {
        if (!this.controls) return;

        // Set flag to prevent sync loop
        this.isProgrammaticUpdate = true;

        try {
            // Update pan target
            if (state.panX !== undefined) {
                this.controls.target.x = state.panX;
            }
            if (state.panY !== undefined) {
                this.controls.target.y = state.panY;
            }
            if (state.panZ !== undefined) {
                this.controls.target.z = state.panZ;
            }

            // Update zoom (camera Z position)
            if (state.zoom !== undefined) {
                this.camera.position.z = state.zoom;
            }

            // Update rotation via spherical coordinates
            if (state.theta !== undefined || state.phi !== undefined) {
                this.setOrbitRotation(state.theta, state.phi);
            }

            // Update controls
            this.controls.update();
        } finally {
            // Always reset flag
            this.isProgrammaticUpdate = false;
        }
    }

    /**
     * Set camera orbit rotation using spherical coordinates
     * @param {number} theta - Horizontal angle in degrees (nullable)
     * @param {number} phi - Vertical angle in degrees (nullable)
     */
    setOrbitRotation(theta = null, phi = null) {
        if (!this.controls) return;

        // Get current spherical coordinates
        const offset = this.camera.position.clone().sub(this.controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);

        // Update angles (only if provided)
        if (theta !== null) {
            spherical.theta = theta * (Math.PI / 180);
        }
        if (phi !== null) {
            // Clamp phi to prevent gimbal lock
            const phiRadians = phi * (Math.PI / 180);
            spherical.phi = THREE.MathUtils.clamp(phiRadians, 0.01, Math.PI - 0.01);
        }

        // Convert back to Cartesian and update camera position
        const newOffset = new THREE.Vector3().setFromSpherical(spherical);
        this.camera.position.copy(this.controls.target).add(newOffset);
    }

    /**
     * Register callback for state sync (e.g., update sidebar)
     * @param {Function} callback - Function called with camera state
     */
    onSync(callback) {
        if (typeof callback === 'function') {
            this.syncCallbacks.push(callback);
        }
    }

    /**
     * Update controls (call in render loop)
     */
    update() {
        if (this.controls) {
            this.controls.update();
        }
    }

    /**
     * Reset camera to default position
     */
    reset() {
        if (!this.controls) return;

        this.isProgrammaticUpdate = true;

        try {
            this.camera.position.set(0, 0, 50);
            this.controls.target.set(0, 0, 0);
            this.controls.update();

            // Notify sync callbacks
            const state = this.getState();
            this.syncCallbacks.forEach(callback => callback(state));
        } finally {
            this.isProgrammaticUpdate = false;
        }
    }

    /**
     * Update settings
     */
    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);

        // Re-apply settings to controls
        if (this.controls) {
            this.controls.dampingFactor = this.settings.dampingFactor;
            this.controls.minDistance = this.settings.minDistance;
            this.controls.maxDistance = this.settings.maxDistance;
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        this.syncCallbacks = [];
    }
}

export default CameraController;
