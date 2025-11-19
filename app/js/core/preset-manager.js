/**
 * Preset Manager
 * Manages preset CRUD operations with LocalStorage
 */

import { getItem, setItem } from '../utils/storage.js';

// Unique storage key to isolate presets from other forks/versions
const STORAGE_KEY = 'tt-kinetic-v2-presets';

export class PresetManager {
    constructor() {
        this.presets = [];
        this.load();
    }

    /**
     * Load presets from LocalStorage
     */
    load() {
        this.presets = getItem(STORAGE_KEY, []);
        console.log(`✓ Loaded ${this.presets.length} presets`);
    }

    /**
     * Save presets to LocalStorage
     */
    save() {
        return setItem(STORAGE_KEY, this.presets);
    }

    /**
     * Get all presets
     */
    getAll() {
        return [...this.presets];
    }

    /**
     * Get preset by ID
     */
    get(id) {
        return this.presets.find(p => p.id === id);
    }

    /**
     * Create new preset
     */
    create(data) {
        const preset = {
            id: this.generateId(),
            name: data.name || 'Untitled Preset',
            effectId: data.effectId,
            icon: data.icon || '✨',
            settings: data.settings || {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.presets.push(preset);
        this.save();

        return preset;
    }

    /**
     * Update preset
     */
    update(id, updates) {
        const preset = this.get(id);
        if (!preset) return false;

        Object.assign(preset, updates, {
            updatedAt: Date.now()
        });

        this.save();
        return preset;
    }

    /**
     * Delete preset
     */
    delete(id) {
        const index = this.presets.findIndex(p => p.id === id);
        if (index === -1) return false;

        this.presets.splice(index, 1);
        this.save();
        return true;
    }

    /**
     * Duplicate preset
     */
    duplicate(id) {
        const original = this.get(id);
        if (!original) return null;

        const duplicate = {
            ...original,
            id: this.generateId(),
            name: `${original.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.presets.push(duplicate);
        this.save();

        return duplicate;
    }

    /**
     * Search presets
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        return this.presets.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.effectId.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Filter presets by effect
     */
    filterByEffect(effectId) {
        return this.presets.filter(p => p.effectId === effectId);
    }

    /**
     * Sort presets
     */
    sort(by = 'date') {
        switch (by) {
            case 'name':
                this.presets.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'date':
            default:
                this.presets.sort((a, b) => b.updatedAt - a.updatedAt);
                break;
        }
    }

    /**
     * Export preset as JSON
     */
    export(id) {
        const preset = this.get(id);
        if (!preset) return null;

        const data = {
            version: '1.0.0',
            exportedAt: Date.now(),
            preset: {
                name: preset.name,
                effectId: preset.effectId,
                icon: preset.icon,
                settings: preset.settings
            }
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Export all presets
     */
    exportAll() {
        const data = {
            version: '1.0.0',
            exportedAt: Date.now(),
            presets: this.presets.map(p => ({
                name: p.name,
                effectId: p.effectId,
                icon: p.icon,
                settings: p.settings
            }))
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import preset from JSON
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // Validate
            if (!data.preset && !data.presets) {
                throw new Error('Invalid preset file');
            }

            // Import single preset
            if (data.preset) {
                return this.create(data.preset);
            }

            // Import multiple presets
            if (data.presets) {
                const imported = [];
                data.presets.forEach(presetData => {
                    imported.push(this.create(presetData));
                });
                return imported;
            }
        } catch (error) {
            console.error('Failed to import preset:', error);
            return null;
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get preset count
     */
    count() {
        return this.presets.length;
    }

    /**
     * Clear all presets
     */
    clear() {
        this.presets = [];
        this.save();
    }
}

// Export singleton instance
export default new PresetManager();
