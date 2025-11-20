/**
 * Effect Manager
 * Loads and manages effect plugins
 */

export class EffectManager {
    constructor() {
        this.effects = new Map();
        this.activeEffect = null;
    }

    /**
     * Register an effect
     */
    register(EffectClass) {
        const metadata = EffectClass.metadata;
        if (!metadata || !metadata.id) {
            console.error('Effect must have metadata with id');
            return false;
        }

        this.effects.set(metadata.id, EffectClass);
        console.log(`✓ Effect registered: ${metadata.name} (${metadata.id})`);
        return true;
    }

    /**
     * Get effect class by ID
     */
    get(id) {
        return this.effects.get(id);
    }

    /**
     * Get all registered effects
     */
    getAll() {
        const effectsList = [];
        this.effects.forEach((EffectClass, id) => {
            effectsList.push({
                id,
                ...EffectClass.metadata
            });
        });
        return effectsList;
    }

    /**
     * Create effect instance
     */
    create(id) {
        const EffectClass = this.effects.get(id);
        if (!EffectClass) {
            console.error(`Effect not found: ${id}`);
            return null;
        }

        try {
            return new EffectClass();
        } catch (error) {
            console.error(`Error creating effect "${id}":`, error);
            return null;
        }
    }

    /**
     * Check if effect exists
     */
    has(id) {
        return this.effects.has(id);
    }

    /**
     * Get effect count
     */
    count() {
        return this.effects.size;
    }
}

// Export singleton instance
export default new EffectManager();
