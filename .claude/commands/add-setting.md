---
description: Add a new setting to an existing effect with proper schema and reactivity
---

# Add Setting to Existing Effect

You are about to add a new setting/parameter to an existing visual effect.

**CRITICAL: Read PLUGIN_SPEC.md first** - Especially the "Settings Schema" section.

---

## Questions to Ask User

Before adding the setting, gather:

1. **Which effect?**
   - Effect file name (e.g., `endless.js`, `particles.js`)

2. **What type of setting?**
   - `number` - Slider with min/max/step
   - `color` - Color picker
   - `boolean` - Checkbox/toggle
   - `string` - Text input
   - `font` - Font picker

3. **Setting details:**
   - Name (camelCase variable name)
   - Label (human-readable)
   - Default value
   - Min/max/step (for numbers)
   - Group ('text', 'colors', 'effect', or custom)

4. **How should it affect the animation?**
   - What visual property does it control?
   - Does it need reactive updates (change immediately)?

---

## Implementation Steps

### 1. Add to Settings Schema

Open the effect file (e.g., `js/effects/my-effect.js`) and locate `getSettingsSchema()`:

```javascript
getSettingsSchema() {
    return {
        ...super.getSettingsSchema(),

        // Add your new setting here:
        myNewSetting: {
            type: 'number',              // 'number', 'color', 'boolean', 'string', 'font'
            label: 'My New Setting',     // Displayed in UI
            default: 1.0,                // Initial value
            min: 0,                      // For numbers: minimum value
            max: 2,                      // For numbers: maximum value
            step: 0.1,                   // For numbers: slider increment
            group: 'effect'              // UI group: 'text', 'colors', 'effect'
        }
    };
}
```

**Setting Type Reference:**

```javascript
// Number (slider)
speedMultiplier: {
    type: 'number',
    label: 'Speed',
    default: 1.0,
    min: 0.1,
    max: 5.0,
    step: 0.1,
    group: 'effect'
}

// Color (color picker)
primaryColor: {
    type: 'color',
    label: 'Primary Color',
    default: '#ff0000',
    group: 'colors'
}

// Boolean (checkbox)
enableGlow: {
    type: 'boolean',
    label: 'Enable Glow',
    default: true,
    group: 'effect'
}

// String (text input)
customLabel: {
    type: 'string',
    label: 'Custom Label',
    default: 'Hello',
    group: 'text'
}

// Font (font picker)
fontFamily: {
    type: 'font',
    label: 'Font',
    default: 'Arial',
    group: 'text'
}
```

### 2. Use Setting in Effect Code

In `update()` or other methods, access via `this.settings.settingName`:

```javascript
update(deltaTime, elapsedTime) {
    if (!this.mesh) return;

    // Use the new setting
    const speed = this.settings.myNewSetting || 1.0;
    this.mesh.rotation.y += deltaTime * speed;
}
```

### 3. Add Reactive Updates (Optional)

If the setting should update immediately (not just on next frame), add to `onSettingChanged()`:

```javascript
onSettingChanged(key, value) {
    if (key === 'myNewSetting') {
        // Immediate update
        console.log(`Setting changed to ${value}`);

        // Example: Update material color immediately
        if (this.material) {
            this.material.color.set(value);
        }
    }

    // Call super if exists
    super.onSettingChanged(key, value);
}
```

### 4. Update Export Calculation (If Relevant)

If the new setting affects animation speed/duration, update `calculateExportSuggestion()`:

```javascript
calculateExportSuggestion() {
    const speed = this.settings.myNewSetting || 1.0;

    // Recalculate perfect loop based on new speed
    const period = (2 * Math.PI) / speed;

    return {
        duration: period,
        loopPoint: period,
        isSeamless: true,
        confidence: 'high',
        explanation: `One complete rotation at speed ${speed.toFixed(2)}`
    };
}
```

---

## Complete Example

**User Request:** "Add a 'thickness' setting to control line width in the endless effect"

**Implementation:**

```javascript
// 1. Add to getSettingsSchema()
getSettingsSchema() {
    return {
        ...super.getSettingsSchema(),

        thickness: {
            type: 'number',
            label: 'Line Thickness',
            default: 0.5,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            group: 'effect'
        }
    };
}

// 2. Use in init() or update()
init(scene, camera, renderer) {
    super.init(scene, camera, renderer);

    this.geometry = new THREE.TorusKnotGeometry(
        10,                                    // radius
        this.settings.thickness || 0.5,        // tube radius (thickness)
        100,
        16
    );

    // ... rest of init
}

// 3. React to changes
onSettingChanged(key, value) {
    if (key === 'thickness') {
        // Rebuild geometry with new thickness
        if (this.geometry) {
            this.geometry.dispose();
        }

        this.geometry = new THREE.TorusKnotGeometry(
            10,
            value,
            100,
            16
        );

        if (this.mesh) {
            this.mesh.geometry = this.geometry;
        }
    }
}
```

---

## Testing Checklist

After adding the setting:

- [ ] Setting appears in sidebar UI
- [ ] Default value is applied on effect load
- [ ] Changing setting updates the animation
- [ ] Min/max constraints work (for numbers)
- [ ] Setting persists in presets (save/load)
- [ ] No console errors
- [ ] Export duration recalculates if relevant

---

## UI Grouping Best Practices

**Use consistent groups:**

- `'text'` - Text content, font, size, spacing, padding
- `'colors'` - All color-related settings
- `'effect'` - Effect-specific animation parameters
- Custom groups - Only if you have 5+ settings in a logical category

**Example of good grouping:**

```javascript
{
    // Text group
    text: { type: 'string', group: 'text' },
    fontSize: { type: 'number', group: 'text' },
    fontFamily: { type: 'font', group: 'text' },

    // Colors group
    primaryColor: { type: 'color', group: 'colors' },
    secondaryColor: { type: 'color', group: 'colors' },
    backgroundColor: { type: 'color', group: 'colors' },

    // Effect group
    rotationSpeed: { type: 'number', group: 'effect' },
    amplitude: { type: 'number', group: 'effect' },
    frequency: { type: 'number', group: 'effect' }
}
```

---

## Common Mistakes to Avoid

❌ **Forgetting default value** - Always provide a sensible default
❌ **Missing group property** - UI won't organize settings properly
❌ **Hardcoded values** - Always use `this.settings.settingName` not `0.5`
❌ **Not disposing old resources** - When recreating geometry/materials, dispose old ones first
❌ **Ignoring export calculation** - If setting affects speed/duration, update `calculateExportSuggestion()`
❌ **Wrong type** - Use 'color' not 'string' for colors, etc.

---

## When to Use onSettingChanged() vs update()

**Use `onSettingChanged()`** when:
- ✅ Setting requires immediate visual update
- ✅ Need to rebuild geometry/material
- ✅ One-time operation (not every frame)
- ✅ Example: Changing mesh complexity, material type

**Use in `update()`** when:
- ✅ Setting affects continuous animation
- ✅ Needs to run every frame
- ✅ Example: Rotation speed, animation amplitude

**Example:**
```javascript
// Rotation speed: Use in update() (continuous)
update(deltaTime) {
    const speed = this.settings.rotationSpeed;
    this.mesh.rotation.y += deltaTime * speed;
}

// Mesh color: Use in onSettingChanged() (one-time)
onSettingChanged(key, value) {
    if (key === 'meshColor') {
        this.material.color.set(value);
    }
}
```

---

**Ready to add your setting? Provide the details above and I'll implement it.**
