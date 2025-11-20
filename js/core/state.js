/**
 * State Management System
 * Reactive state with LocalStorage persistence
 */

export class AppState {
    constructor() {
        this.state = {
            activeEffectId: null,
            activePresetId: null,
            currentSettings: {},
            uiHidden: false,
            showFPS: false,
            animationSpeed: 1.0,  // Global animation speed multiplier
            settingsPanelCollapsed: false,
            presetPanelOpen: false,
            userPreferences: {
                lastUsedFont: null,
                defaultSettings: {}
            }
        };

        this.listeners = new Map();
        this.persistTimer = null;

        this.restore();
    }

    /**
     * Get state value by key
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Set state value and notify listeners
     */
    set(key, value) {
        if (this.state[key] === value) return;

        this.state[key] = value;
        this.notify(key, value);
        this.persist();
    }

    /**
     * Update multiple state values at once
     */
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            if (this.state[key] !== value) {
                this.state[key] = value;
                this.notify(key, value);
            }
        });
        this.persist();
    }

    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => this.listeners.get(key).delete(callback);
    }

    /**
     * Notify all listeners for a specific key
     */
    notify(key, value) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(cb => {
                try {
                    cb(value);
                } catch (error) {
                    console.error(`Error in state listener for "${key}":`, error);
                }
            });
        }
    }

    /**
     * Persist state to LocalStorage (debounced)
     */
    persist() {
        clearTimeout(this.persistTimer);
        this.persistTimer = setTimeout(() => {
            try {
                localStorage.setItem('tt-kinetic-v2-state', JSON.stringify(this.state));
            } catch (e) {
                console.error('Failed to persist state:', e);
                // Emit error event for UI notification
                window.dispatchEvent(new CustomEvent('storage-error', {
                    detail: { error: e, message: 'Storage full. Please export presets.' }
                }));
            }
        }, 500);
    }

    /**
     * Restore state from LocalStorage
     */
    restore() {
        try {
            const saved = localStorage.getItem('tt-kinetic-v2-state');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.state = { ...this.state, ...parsed };
            }
        } catch (e) {
            console.error('Failed to restore state:', e);
        }
    }

    /**
     * Clear all state
     */
    clear() {
        this.state = {
            activeEffectId: null,
            activePresetId: null,
            currentSettings: {},
            uiHidden: false,
            showFPS: false,
            animationSpeed: 1.0,
            settingsPanelCollapsed: false,
            presetPanelOpen: false,
            userPreferences: {
                lastUsedFont: null,
                defaultSettings: {}
            }
        };
        this.persist();
    }

    /**
     * Get entire state object (for debugging)
     */
    getAll() {
        return { ...this.state };
    }
}

// Export singleton instance
export default new AppState();
