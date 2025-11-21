---
description: Create a new visual effect with all required methods and export configuration
---

# Create New Effect

You are about to create a new visual effect for the Floss kinetic typography app.

**CRITICAL: Before starting, read these documents in order:**

1. **PLUGIN_SPEC.md** ⭐ (REQUIRED)
   - Complete effect API reference
   - Settings schema system
   - Export configuration (MANDATORY)
   - Examples of loop vs oneshot effects

2. **js/effects/endless.js** (Reference implementation)
   - Production-ready example
   - Perfect loop calculation
   - Export configuration in action

3. **docs/VIDEO_EXPORT_SPEC.md** (Optional - for deep dive)
   - Technical export system details

---

## Effect Development Checklist

When creating a new effect, you MUST implement:

### Required (Basic Effect)
- [ ] `static get metadata()` - ID, name, icon, description
- [ ] `getSettingsSchema()` - Define parameters (extends EffectBase)
- [ ] `init(scene, camera, renderer)` - Create Three.js objects
- [ ] `update(deltaTime, elapsedTime)` - Animation loop
- [ ] `onSettingChanged(key, value)` - Reactive parameter updates
- [ ] `destroy()` - Cleanup Three.js resources

### Required (Video Export Support)
- [ ] `static get exportDefaults()` - Export behavior (type: 'loop'|'oneshot', duration)
- [ ] `calculateExportSuggestion()` - Smart duration based on CURRENT settings
- [ ] `reset()` - Optional, reset animation to t=0 (if effect needs it)

### Optional (Advanced)
- [ ] `resize(width, height)` - Handle window resize
- [ ] `isComplete()` - For oneshot effects, detect when animation finishes
- [ ] `getVisualCenter()` - Custom camera pivot point

---

## Questions to Ask User

Before implementing, gather this information from the user:

1. **Effect Type:**
   - Is this a **loop** effect (continuous, seamless) or **oneshot** effect (plays once)?

2. **Visual Concept:**
   - What should the effect look like?
   - What Three.js geometry/shader approach?

3. **Parameters:**
   - What settings should be adjustable?
   - Group them: 'text', 'colors', 'effect', etc.

4. **Animation:**
   - What moves/changes over time?
   - How do we calculate a perfect loop point?

5. **Export Behavior:**
   - What's the ideal export duration?
   - Is the loop seamless?
   - Any minimum/maximum duration constraints?

---

## Implementation Template

```javascript
import EffectBase from './effect-base.js';

export class MyEffect extends EffectBase {
    constructor() {
        super();
        // Add any custom properties here
    }

    /**
     * Effect metadata
     */
    static get metadata() {
        return {
            id: 'my-effect',              // Unique ID (lowercase-kebab-case)
            name: 'My Effect',             // Display name
            icon: '✨',                    // Emoji icon
            description: 'Brief description here'
        };
    }

    /**
     * Export configuration
     */
    static get exportDefaults() {
        return {
            type: 'loop',                  // 'loop' or 'oneshot'
            recommendedDuration: 5,        // Default duration in seconds
            minDuration: 1,                // Minimum allowed
            maxDuration: 30,               // Maximum allowed
            seamlessLoop: true             // Does it loop perfectly?
        };
    }

    /**
     * Settings schema
     */
    getSettingsSchema() {
        return {
            // Inherit universal text/color settings
            ...super.getSettingsSchema(),

            // Add effect-specific settings
            myParameter: {
                type: 'number',            // 'number', 'color', 'boolean', 'string', 'font'
                label: 'My Parameter',
                default: 1.0,
                min: 0,
                max: 2,
                step: 0.1,
                group: 'effect'            // Group in UI: 'text', 'colors', 'effect'
            }
        };
    }

    /**
     * Initialize effect
     */
    init(scene, camera, renderer) {
        super.init(scene, camera, renderer);

        // Create geometry
        this.geometry = new THREE.BoxGeometry(10, 10, 10);

        // Create material
        this.material = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Add to scene
        scene.add(this.mesh);

        console.log(`✓ ${this.constructor.metadata.name} initialized`);
    }

    /**
     * Update animation (called every frame)
     */
    update(deltaTime, elapsedTime) {
        if (!this.mesh) return;

        // Example: rotate based on settings
        const rotSpeed = this.settings.myParameter || 1.0;
        this.mesh.rotation.y += deltaTime * rotSpeed;
    }

    /**
     * Calculate smart export duration based on CURRENT settings
     */
    calculateExportSuggestion() {
        const rotSpeed = this.settings.myParameter || 1.0;

        // Calculate one complete rotation period
        const period = (2 * Math.PI) / rotSpeed;

        return {
            duration: period,              // Suggested duration in seconds
            loopPoint: period,             // Where loop restarts (usually same as duration)
            isSeamless: true,              // Will it loop perfectly?
            confidence: 'high',            // 'high', 'medium', 'low'
            explanation: `One complete rotation at speed ${rotSpeed.toFixed(2)} (${period.toFixed(1)}s)`
        };
    }

    /**
     * React to setting changes
     */
    onSettingChanged(key, value) {
        if (key === 'myParameter') {
            // Update animation when parameter changes
            console.log(`Parameter changed to ${value}`);
        }
    }

    /**
     * Reset animation to t=0 (optional, for export)
     */
    reset() {
        if (this.mesh) {
            this.mesh.rotation.set(0, 0, 0);
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }

        if (this.geometry) {
            this.geometry.dispose();
        }

        if (this.material) {
            this.material.dispose();
        }

        super.destroy();
    }
}

export default MyEffect;
```

---

## After Implementation

1. **Register the effect** in `js/core/effect-manager.js`:
   ```javascript
   import MyEffect from '../effects/my-effect.js';

   this.effects = [
       // ... existing effects
       MyEffect
   ];
   ```

2. **Test the effect:**
   - [ ] Effect loads without errors
   - [ ] All settings work in UI
   - [ ] Animation is smooth (60fps)
   - [ ] Export duration calculation is correct
   - [ ] Loop is seamless (if type: 'loop')
   - [ ] Resources are cleaned up on effect switch

3. **Update documentation:**
   - [ ] Add to effect list in README.md (if public-facing)
   - [ ] Document any unique behaviors in PLUGIN_SPEC.md examples

---

## Common Mistakes to Avoid

❌ **Forgetting export configuration** - Every effect MUST have `exportDefaults` and `calculateExportSuggestion()`
❌ **Static export duration** - Use `calculateExportSuggestion()` to recalculate based on CURRENT settings
❌ **Not disposing resources** - Always call `.dispose()` on geometries, materials, textures
❌ **Hardcoded values** - Use `this.settings.paramName` instead of magic numbers
❌ **Missing group property** - Settings need `group: 'text'|'colors'|'effect'` for UI organization

---

## Example Prompts for Claude

**Good prompt:**
> "Create a new 'spiral' effect that wraps text around a 3D spiral. It should loop seamlessly. Calculate the perfect loop duration based on spiral rotation speed. Use PLUGIN_SPEC.md for the complete API."

**Bad prompt:**
> "Make a cool text effect" (too vague, no details)

---

**Ready to create your effect? Provide the effect details above and I'll implement it following this checklist.**
