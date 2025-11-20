/**
 * Base Effect Class
 * All effects must extend this class
 */

export class EffectBase {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.settings = {};
        this.mesh = null;
        this.material = null;
        this.geometry = null;
        this.renderTarget = null;
        this.composer = null; // For post-processing effects
        this.initialized = false;
    }

    /**
     * Effect metadata (must be overridden by subclass)
     */
    static get metadata() {
        return {
            id: 'base-effect',
            name: 'Base Effect',
            icon: '✨',
            description: 'Base effect class'
        };
    }

    /**
     * Settings schema (must be overridden by subclass)
     * Note: Use 'group' property to organize settings in UI
     * Groups: 'text', 'colors', 'effect' (or custom)
     */
    getSettingsSchema() {
        return {
            // Universal Text Settings (every effect should have these)
            text: {
                type: 'string',
                default: 'TERRITORY',
                label: 'Text',
                emoji: true,
                group: 'text'
            },
            fontSize: {
                type: 'number',
                default: 120,
                min: 20,
                max: 500,
                label: 'Font Size',
                group: 'text'
            },
            fontFamily: {
                type: 'font',
                default: 'Arial',
                label: 'Font',
                group: 'text'
            },
            letterSpacing: {
                type: 'number',
                default: 0,
                min: -50,
                max: 200,
                label: 'Letter Spacing',
                group: 'text'
            },
            padding: {
                type: 'number',
                default: 20,
                min: 0,
                max: 100,
                label: 'Padding',
                group: 'text'
            },
            fitToTile: {
                type: 'boolean',
                default: false,
                label: 'Fit to Tile',
                group: 'text'
            },
            // Universal Color Settings
            backgroundColor: {
                type: 'color',
                default: '#000000',
                label: 'Background Color',
                group: 'colors'
            },
            animationSpeed: {
                type: 'number',
                default: 1.0,
                min: 0,
                max: 5,
                step: 0.1,
                label: 'Animation Speed',
                group: 'animation'
            }
        };
    }

    /**
     * Initialize effect (must be overridden by subclass)
     */
    init(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        // Initialize settings with defaults
        const schema = this.getSettingsSchema();
        this.settings = {};
        Object.entries(schema).forEach(([key, config]) => {
            this.settings[key] = config.default;
        });

        this.initialized = true;
        console.log(`✓ Effect initialized: ${this.constructor.metadata.name}`);
    }

    /**
     * Update animation (must be overridden by subclass)
     */
    update(deltaTime, elapsedTime) {
        // Override in subclass
    }

    /**
     * Handle window resize (must be overridden by subclass)
     */
    resize(width, height) {
        // Override in subclass
        if (this.renderTarget) {
            this.renderTarget.setSize(width, height);
        }
    }

    /**
     * Update a single setting
     */
    updateSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            this.onSettingChanged(key, value);
        }
    }

    /**
     * Update multiple settings
     */
    updateSettings(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.updateSetting(key, value);
        });
    }

    /**
     * Callback when setting changes (can be overridden by subclass)
     */
    onSettingChanged(key, value) {
        // Override in subclass for reactive updates
    }

    /**
     * Export current state
     */
    exportState() {
        return {
            effectId: this.constructor.metadata.id,
            settings: { ...this.settings }
        };
    }

    /**
     * Import state
     */
    importState(state) {
        if (state.settings) {
            this.updateSettings(state.settings);
        }
    }

    /**
     * Check if effect uses post-processing (override in subclass)
     */
    usesPostProcessing() {
        return false;
    }

    /**
     * Get composer for post-processing effects (override in subclass)
     */
    getComposer() {
        return this.composer;
    }

    /**
     * Render method (can be overridden for custom rendering)
     */
    render() {
        // Default: no custom rendering (uses scene manager's render)
        // Override this in effects that use post-processing
    }

    /**
     * Cleanup resources (must be overridden by subclass)
     */
    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }

        if (this.geometry) {
            this.geometry.dispose();
        }

        if (this.material) {
            if (this.material.map) this.material.map.dispose();
            this.material.dispose();
        }

        if (this.renderTarget) {
            this.renderTarget.dispose();
        }

        if (this.composer) {
            // Composer cleanup will be handled by SceneManager
            this.composer = null;
        }

        this.initialized = false;
        console.log(`✓ Effect destroyed: ${this.constructor.metadata.name}`);
    }
}

export default EffectBase;
