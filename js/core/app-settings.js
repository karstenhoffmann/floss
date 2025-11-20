/**
 * App Settings Manager
 * Manages app-wide configuration like default color swatches
 */

class AppSettings {
    constructor() {
        this.STORAGE_KEY = 'tt-kinetic-v2-app-settings';

        // Default settings
        this.defaults = {
            colorSwatches: [
                '#000000', // Black
                '#ffffff', // White
                '#8b5cf6', // Violet
                '#6366f1', // Indigo
                '#ec4899', // Pink
                '#f59e0b', // Amber
                '#10b981', // Emerald
                '#3b82f6', // Blue
                '#ef4444', // Red
                '#8b5cf6'  // Violet (10th color)
            ]
        };

        this.settings = { ...this.defaults };
        this.load();
    }

    /**
     * Get a setting value
     */
    get(key) {
        return this.settings[key];
    }

    /**
     * Set a setting value
     */
    set(key, value) {
        this.settings[key] = value;
        this.save();
    }

    /**
     * Update color swatch at index
     */
    updateColorSwatch(index, color) {
        if (index >= 0 && index < this.settings.colorSwatches.length) {
            this.settings.colorSwatches[index] = color;
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Get all color swatches
     */
    getColorSwatches() {
        return [...this.settings.colorSwatches];
    }

    /**
     * Set all color swatches
     */
    setColorSwatches(swatches) {
        if (Array.isArray(swatches) && swatches.length === 10) {
            this.settings.colorSwatches = [...swatches];
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Reset to defaults
     */
    reset() {
        this.settings = { ...this.defaults };
        this.save();
    }

    /**
     * Save settings to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
            console.log('✓ App settings saved');
        } catch (e) {
            console.error('Failed to save app settings:', e);
        }
    }

    /**
     * Load settings from localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.defaults, ...parsed };
                console.log('✓ App settings loaded');
            }
        } catch (e) {
            console.error('Failed to load app settings:', e);
            this.settings = { ...this.defaults };
        }
    }

    /**
     * Export settings as JSON
     */
    export() {
        return {
            version: '2.1.2',
            timestamp: new Date().toISOString(),
            settings: { ...this.settings }
        };
    }

    /**
     * Import settings from JSON
     */
    import(data) {
        try {
            if (data && data.settings) {
                // Validate color swatches
                if (data.settings.colorSwatches && Array.isArray(data.settings.colorSwatches)) {
                    this.settings.colorSwatches = data.settings.colorSwatches.slice(0, 10);

                    // Ensure we have exactly 10 colors
                    while (this.settings.colorSwatches.length < 10) {
                        this.settings.colorSwatches.push(this.defaults.colorSwatches[this.settings.colorSwatches.length]);
                    }
                }

                this.save();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import settings:', e);
            return false;
        }
    }

    /**
     * Get all settings
     */
    getAll() {
        return { ...this.settings };
    }
}

// Export singleton instance
export default new AppSettings();
