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
     */
    getSettingsSchema() {
        return {
            // Core settings (every effect should have these)
            text: {
                type: 'string',
                default: 'TERRITORY',
                label: 'Text',
                emoji: true
            },
            fontSize: {
                type: 'number',
                default: 120,
                min: 20,
                max: 500,
                label: 'Font Size'
            },
            fontFamily: {
                type: 'font',
                default: 'Arial',
                label: 'Font'
            },
            letterSpacing: {
                type: 'number',
                default: 0,
                min: -50,
                max: 200,
                label: 'Letter Spacing'
            },
            padding: {
                type: 'number',
                default: 20,
                min: 0,
                max: 100,
                label: 'Padding'
            },
            fitToTile: {
                type: 'boolean',
                default: false,
                label: 'Fit to Tile'
            },
            repeats: {
                type: 'number',
                default: 3,
                min: 1,
                max: 20,
                label: 'Tile Repeats'
            },
            textColor: {
                type: 'color',
                default: '#ffffff',
                label: 'Text Color'
            },
            surfaceColor: {
                type: 'color',
                default: '#1a1a1a',
                label: 'Surface Color'
            },
            backgroundColor: {
                type: 'color',
                default: '#000000',
                label: 'Background Color'
            },
            animationSpeed: {
                type: 'number',
                default: 1.0,
                min: 0,
                max: 5,
                step: 0.1,
                label: 'Animation Speed'
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

        this.initialized = false;
        console.log(`✓ Effect destroyed: ${this.constructor.metadata.name}`);
    }
}

export default EffectBase;
