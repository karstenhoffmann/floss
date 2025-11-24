# Floss - Detailed Pitfalls & Common Mistakes

**Last Updated:** 2025-11-24

This file contains detailed versions of all common pitfalls and mistakes when working on the Floss project.

**Note:** CLAUDE.md only contains the essential top-level critical pitfalls. This file provides comprehensive examples and explanations.

---

## Table of Contents

1. [Effect Development Pitfalls](#effect-development-pitfalls)
2. [Video Export System Pitfalls](#video-export-system-pitfalls)
3. [GitHub Pages & Deployment Pitfalls](#github-pages--deployment-pitfalls)
4. [Documentation Pitfalls](#documentation-pitfalls)

---

## Effect Development Pitfalls

### 1. Forgetting Export Configuration

**❌ WRONG: No export configuration**
```javascript
export class MyEffect extends EffectBase {
    static get metadata() { ... }
    getSettingsSchema() { ... }
    // Missing exportDefaults and calculateExportSuggestion!
}
```

**✅ CORRECT: Always include export configuration**
```javascript
export class MyEffect extends EffectBase {
    static get exportDefaults() {
        return { type: 'loop', recommendedDuration: 5, ... };
    }

    calculateExportSuggestion() {
        const speed = this.settings.rotationSpeed;
        const period = (2 * Math.PI) / speed;
        return { duration: period, ... };
    }
}
```

**Why it matters:** Video export won't work without these methods. User will see errors when trying to export.

---

### 2. Static Export Duration Instead of Dynamic Calculation

**❌ WRONG: Hardcoded duration**
```javascript
calculateExportSuggestion() {
    return {
        duration: 5,  // Always 5 seconds, regardless of settings
        loopPoint: 5,
        isSeamless: true
    };
}
```

**✅ CORRECT: Calculate based on CURRENT settings**
```javascript
calculateExportSuggestion() {
    const rotSpeed = this.settings.rotationSpeed || 1.0;
    const period = (2 * Math.PI) / rotSpeed / 1000;  // Perfect loop

    return {
        duration: period,  // Recalculated each time settings change
        loopPoint: period,
        isSeamless: true,
        explanation: `One rotation at ${rotSpeed} rad/s = ${period.toFixed(1)}s`
    };
}
```

**Why it matters:** User changes rotation speed to 0.5, but export duration stays 5s → loop is broken.

---

### 3. Settings Without Group Property

**❌ WRONG: No group property**
```javascript
getSettingsSchema() {
    return {
        ...super.getSettingsSchema(),
        rotationSpeed: {
            type: 'number',
            label: 'Rotation Speed',
            default: 1.0
            // Missing: group property!
        }
    };
}
```

**✅ CORRECT: Always specify group**
```javascript
getSettingsSchema() {
    return {
        ...super.getSettingsSchema(),
        rotationSpeed: {
            type: 'number',
            label: 'Rotation Speed',
            default: 1.0,
            group: 'effect'  // Groups settings in UI
        }
    };
}
```

**Why it matters:** UI can't organize settings into collapsible sections. Everything appears in one giant list.

---

### 4. Not Disposing Three.js Resources

**❌ WRONG: Memory leak**
```javascript
destroy() {
    this.scene.remove(this.mesh);
    // Forgot to dispose geometry, material, textures!
}
```

**✅ CORRECT: Always dispose**
```javascript
destroy() {
    if (this.mesh) {
        this.scene.remove(this.mesh);
    }

    if (this.geometry) {
        this.geometry.dispose();
    }

    if (this.material) {
        if (this.material.map) this.material.map.dispose();
        if (this.material.normalMap) this.material.normalMap.dispose();
        this.material.dispose();
    }

    super.destroy();
}
```

**Why it matters:** Every effect switch leaks memory. After 10 switches, browser slows down or crashes.

---

### 5. Hardcoded Values Instead of Settings

**❌ WRONG: Hardcoded values**
```javascript
update(deltaTime) {
    this.mesh.rotation.y += deltaTime * 0.5;  // Magic number!
}
```

**✅ CORRECT: Use settings**
```javascript
update(deltaTime) {
    const speed = this.settings.rotationSpeed || 1.0;
    this.mesh.rotation.y += deltaTime * speed;
}
```

**Why it matters:** User can't control the animation. Defeats the purpose of having settings.

---

### 6. Using deltaTime for Position (Animation Drift)

**❌ WRONG: Using deltaTime for position (accumulates error)**
```javascript
update(deltaTime) {
    this.rotation += deltaTime * this.settings.rotationSpeed;
    this.mesh.rotation.y = this.rotation;
}
```

**✅ CORRECT: Use elapsedTime for deterministic position**
```javascript
update(deltaTime, elapsedTime) {
    const speed = this.settings.rotationSpeed || 1.0;
    this.mesh.rotation.y = elapsedTime * speed;  // Always exact
}
```

**Why it matters:** Export relies on exact frame timing. deltaTime causes drift, breaking perfect loops.

---

### 7. Circular Import Dependencies

**❌ WRONG: Circular imports**
```javascript
// app.js
import { MyEffect } from './effects/my-effect.js';

// my-effect.js
import { App } from './core/app.js';  // Circular!
```

**✅ CORRECT: Use dependency injection**
```javascript
// app.js
import { MyEffect } from './effects/my-effect.js';
const effect = new MyEffect();
effect.init(scene, camera, renderer);  // Pass dependencies

// my-effect.js
// No import of App needed - receives dependencies via init()
```

**Why it matters:** Module loading fails with cryptic errors. Very hard to debug.

---

### 8. Forgetting to Call super.destroy()

**❌ WRONG: Doesn't call parent cleanup**
```javascript
destroy() {
    this.geometry.dispose();
    this.material.dispose();
    // Forgot super.destroy()!
}
```

**✅ CORRECT: Always call super**
```javascript
destroy() {
    // Your cleanup
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();

    // Parent cleanup
    super.destroy();
}
```

**Why it matters:** EffectBase has its own cleanup logic. Skipping it causes incomplete cleanup.

---

## Video Export System Pitfalls

### 1. Using WebCodecsEncoder Instead of MP4WasmEncoder

**Problem:** canvas-record auto-selects WebCodecsEncoder if available, but it has browser inconsistencies.

**✅ SOLUTION: Explicitly create MP4WasmEncoder**
```javascript
import { Recorder, Encoders } from '../../lib/canvas-record/package/index.js';

const encoder = new Encoders.MP4WasmEncoder({
    extension: 'mp4'
});

this.recorder = new Recorder(gl, {
    encoder: encoder,  // Force MP4WasmEncoder
    // ...
});
```

---

### 2. Passing Canvas Element Instead of WebGL Context

**Problem:** Recorder expects WebGLRenderingContext, not HTMLCanvasElement

**✅ SOLUTION:**
```javascript
// ❌ WRONG:
this.recorder = new Recorder(this.offscreenCanvas, {...});

// ✅ CORRECT:
const gl = this.offscreenRenderer.context;  // Property, not method!
this.recorder = new Recorder(gl, {...});
```

---

### 3. Using .getContext() Method (Three.js r115)

**Problem:** Three.js r115 has `.context` property, not `.getContext()` method

**✅ SOLUTION:**
```javascript
// ❌ WRONG:
const gl = this.offscreenRenderer.getContext();  // Not a method!

// ✅ CORRECT:
const gl = this.offscreenRenderer.context;  // Property in r115
```

---

### 4. Missing encoderOptions.bitrateMode

**Problem:** MP4WasmEncoder requires bitrateMode in encoderOptions

**✅ SOLUTION:**
```javascript
this.recorder = new Recorder(gl, {
    encoder: encoder,
    encoderOptions: {
        bitrateMode: 'variable',  // Required!
        bitrate: bitrate
    }
});
```

---

### 5. Not Calculating Bitrate Manually

**Problem:** estimateBitRate() has parameter order bugs

**✅ SOLUTION: Calculate manually**
```javascript
const width = 1920;
const height = 1080;
const fps = 60;
const motionRank = 4;  // 1=low, 2=medium, 4=high motion
const bitrateMode = 'variable';

const bitrate = Math.round(
    width * height * fps * motionRank * 0.07 * (bitrateMode === 'variable' ? 0.75 : 1)
);
```

---

### 6. Not Using initOnly with start()

**Problem:** start() automatically calls first step() → encodes frame 0 twice

**✅ SOLUTION:**
```javascript
await this.recorder.start({ initOnly: true });

for (let frame = 0; frame < totalFrames; frame++) {
    effect.update(deltaTime, time);
    offscreenRenderer.render(scene, camera);
    await this.recorder.step();
}

const buffer = await this.recorder.stop();
```

---

### 7. Using deltaTime for Export Animations

**Problem:** Accumulates floating-point errors

**✅ SOLUTION: Use deterministic timing**
```javascript
for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps;  // Exact time
    effect.update(1/fps, time);  // deltaTime, elapsedTime
}
```

---

## GitHub Pages & Deployment Pitfalls

### 1. Testing Wrong Branch

**❌ PROBLEM:**
```bash
git checkout claude/my-feature-123
# ... make changes ...
git push origin claude/my-feature-123

# User tests at https://karstenhoffmann.github.io/floss/
# But GitHub Pages is STILL deploying from main branch!
# User sees OLD code and reports "it doesn't work"
```

**✅ SOLUTION: Update GitHub Pages settings first**
```
1. Push to branch: git push origin claude/my-feature-123
2. TELL USER: "Update GitHub Pages to branch: claude/my-feature-123"
3. User goes to: Settings → Pages → Branch: [select branch]
4. Wait 1-2 minutes for deployment
5. NOW test at https://karstenhoffmann.github.io/floss/
```

**Why it matters:** This is the #1 wasted-time issue. User tests old code, reports bugs that are already fixed.

---

### 2. Branch Name Missing Session ID

**❌ WRONG: Branch name without session ID**
```bash
git checkout -b claude/my-feature
```

**✅ CORRECT: Branch name WITH session ID**
```bash
git checkout -b claude/my-feature-0141Y9y9rYFGQNXKK1WTUB8H
```

**Why it matters:** GitHub push will fail with 403 error if branch doesn't end with matching session ID.

---

## Documentation Pitfalls

### 1. Adding Features Without Documenting Them

**❌ WRONG: Add new method, don't document**
```javascript
// effect-base.js
+ getVisualCenter() { return new THREE.Vector3(0, 0, 0); }

// No update to PLUGIN_SPEC.md!
```

**✅ CORRECT: Add method AND document**
```javascript
// effect-base.js
+ getVisualCenter() { return new THREE.Vector3(0, 0, 0); }

// PLUGIN_SPEC.md
+ ## getVisualCenter()
+ Returns the visual center point for camera pivot.
+ ...
```

**Why it matters:** Future Claude sessions won't know the method exists. Reinvent the wheel.

---

### 2. Contradictory Documentation

**❌ WRONG: CLAUDE.md says one thing, PLUGIN_SPEC.md says another**
```markdown
CLAUDE.md: "Effects must implement exportDefaults"
PLUGIN_SPEC.md: "exportDefaults is optional"
```

**✅ CORRECT: Keep docs in sync**
```markdown
CLAUDE.md: "Effects MUST implement exportDefaults (see PLUGIN_SPEC.md)"
PLUGIN_SPEC.md: "## Required Methods
- exportDefaults - REQUIRED for video export"
```

**Why it matters:** Claude gets confused, user gets frustrated, time is wasted resolving conflicts.

---

### 3. Forgetting to Update version.js Before Committing

**❌ WRONG: Commit without updating version**
```bash
# ... make code changes ...
git add .
git commit -m "feat: new feature"
# version.js still shows old version!
```

**✅ CORRECT: Always update version.js FIRST**
```bash
# 1. Make code changes
# 2. Update js/version.js:
export const VERSION = {
    number: '2.3.1',  // Incremented!
    commit: 'Add new feature',
    date: '2025-11-21',
    time: '15:45'
};
# 3. Then commit
git add .
git commit -m "feat: Add new feature

Version: 2.3.1"
```

**Why it matters:** User can't tell which version is deployed, debugging becomes impossible, cache issues are invisible.

---

## Self-Check Before Finishing Session

Before marking work complete, ask yourself:

**Code Quality:**
- [ ] Did I add export configuration to new effects?
- [ ] Did I use dynamic calculation, not static duration?
- [ ] Did I add `group` property to all settings?
- [ ] Did I dispose all Three.js resources?
- [ ] Did I use `this.settings.X` not hardcoded values?
- [ ] Did I use `elapsedTime` for position, `deltaTime` for velocity?
- [ ] Did I call `super.destroy()`?

**Documentation:**
- [ ] Did I update PLUGIN_SPEC.md if API changed?
- [ ] Did I update CLAUDE.md if architecture changed?
- [ ] Did I update examples if API changed?
- [ ] Are all docs consistent with each other?

**Version & Deployment:**
- [ ] Did I update `js/version.js` before committing?
- [ ] Did I increment version number correctly?
- [ ] Did I write brief commit message in version.js (max 47 chars)?
- [ ] Did I update date and time in version.js?
- [ ] Did I commit with clear message?
- [ ] Did I push to correct branch (with session ID)?
- [ ] Did I TELL USER to update GitHub Pages settings?
- [ ] Did I REMIND USER which URL to test?

**If ANY checkbox is unchecked → Fix before finishing!**
