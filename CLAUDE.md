# Claude Code Session Context

**Last Updated:** 2025-11-23
**Project:** Floss - Professional Kinetic Typography Motion Design Tool
**Repository:** https://github.com/karstenhoffmann/floss
**Deployment:** https://karstenhoffmann.github.io/floss/

---

## ⚠️ CRITICAL: Always Read This First

### 🌐 Claude Code for Web - Testing Requirements

**THIS PROJECT USES CLAUDE CODE FOR WEB (not CLI)**

This means:
- ✅ User has NO local file access - only browser and GitHub
- ✅ User can ONLY test via GitHub Pages deployment
- ✅ **Claude MUST tell user to update GitHub Pages settings when switching branches**
- ✅ **Testing requires GitHub Pages to be configured for the current working branch**

**MANDATORY WORKFLOW:**

1. **When starting work on a branch:**
   ```
   🚨 TELL USER: "Please update GitHub Pages settings to deploy from branch: [branch-name]"
   ```

2. **After pushing commits:**
   ```
   🚨 REMIND USER: "Test at https://karstenhoffmann.github.io/floss/ (wait 1-2 min for deployment)"
   ```

3. **When creating a new branch:**
   ```
   🚨 TELL USER: "Update GitHub Pages: Settings → Pages → Branch: [new-branch-name] → Save"
   ```

**Why this matters:**
- User cannot run `python3 -m http.server` locally
- User cannot access files directly
- GitHub Pages is the ONLY way to test changes
- Wrong branch = user tests old code = wasted time

**GitHub Pages Configuration:**
- Location: Repo Settings → Pages
- Source: Deploy from branch
- Branch: **[current working branch]** ← CRITICAL TO UPDATE
- Folder: **`/ (root)`** after restructure

---

## 🔢 CRITICAL: Version Management & Console Logging

**MANDATORY: Update version WITH EVERY COMMIT!**

### Version File Location

**File:** `js/version.js`

```javascript
export const VERSION = {
    number: '2.3.0',           // Semantic version (major.minor.patch)
    commit: 'Brief commit message here',
    date: '2025-11-21',        // YYYY-MM-DD
    time: '14:30'              // HH:MM (24-hour format)
};
```

### When to Update Version

**ALWAYS update `js/version.js` BEFORE committing:**

1. **Before EVERY commit:**
   - Update `VERSION.number` (increment appropriately)
   - Update `VERSION.commit` (brief description, max 47 chars)
   - Update `VERSION.date` (today's date)
   - Update `VERSION.time` (current time when committing)

2. **Version Number Rules (Semantic Versioning):**
   - **Major (X.0.0):** Breaking changes, architecture refactor
   - **Minor (2.X.0):** New features, new effects, significant additions
   - **Patch (2.3.X):** Bug fixes, minor improvements, documentation

### Version Update Workflow

**Step-by-step process:**

```bash
# 1. Make your code changes
# ... edit files ...

# 2. Update version.js
# Edit js/version.js:
#   - Increment version.number
#   - Update commit message
#   - Update date and time

# 3. Commit with version in message
git add .
git commit -m "feat: [Your changes]

Version: 2.3.1
"

# 4. Push
git push -u origin [branch-name]
```

### Why This Matters

**Benefits of version tracking:**
- ✅ **Debug across sessions:** User can tell you "I'm seeing version 2.3.0, but documentation says 2.3.5"
- ✅ **Session continuity:** Claude can immediately see what was changed last
- ✅ **Cache debugging:** User can verify correct version loaded (not cached old code)
- ✅ **Time tracking:** Know when changes were deployed
- ✅ **Console visibility:** Version banner appears on every app start

### Console Output

When user loads the app, they see:

```
╔════════════════════════════════════════════════════════════════╗
║   🎨 Floss - Motion Design                                     ║
║   Version: 2.3.0       Date: 2025-11-21 14:30                 ║
║   Last Commit: Context-aware keyboard shortcuts               ║
╚════════════════════════════════════════════════════════════════╝
```

This makes it immediately clear:
- What version is running
- When it was built
- What was changed last

### Self-Check Before Committing

Before `git commit`, ask yourself:

- [ ] Did I update `js/version.js`?
- [ ] Did I increment version number correctly?
- [ ] Did I write a brief commit message (max 47 chars)?
- [ ] Did I update date and time?

**If ANY checkbox is unchecked → Update version.js before committing!**

### Example Version Updates

```javascript
// Bug fix (patch)
2.3.0 → 2.3.1
commit: 'Fix particle reset on export'

// New feature (minor)
2.3.1 → 2.4.0
commit: 'Add VideoExportManager core implementation'

// Breaking change (major)
2.4.0 → 3.0.0
commit: 'Refactor effect system architecture'
```

---

## 📝 CRITICAL: Documentation Maintenance Guidelines

**IMPORTANT:** This documentation is LIVING - not static! Claude Code sessions MUST maintain and update documentation as the project evolves.

### When to Update Documentation

**ALWAYS update docs when:**
- ✅ Adding new features (add to relevant sections)
- ✅ Changing APIs (update PLUGIN_SPEC.md)
- ✅ Refactoring architecture (update CLAUDE.md)
- ✅ Finding better practices (update examples)
- ✅ Discovering inconsistencies (fix immediately)
- ✅ Adding new effects (update reference list)
- ✅ Changing workflows (update instructions)

**Examples:**
```
Scenario: "Add new Effect method getVisualCenter()"
→ Update PLUGIN_SPEC.md with method documentation
→ Update example effects
→ Update checklist if it's now required

Scenario: "Refactor State Management"
→ Update CLAUDE.md architecture section
→ Update VIDEO_EXPORT_SPEC.md integration points
→ Update code examples

Scenario: "Find bug in export duration calculation"
→ Fix code
→ Update PLUGIN_SPEC.md with corrected example
→ Add note about common mistake
```

### Documentation Hierarchy (Where to Document What)

```
1. CLAUDE.md (This File)
   ├─ Purpose: Session Context & Project Overview
   ├─ Update when: Architecture changes, new workflows, new major features
   ├─ Audience: Claude Code sessions (automatic reading)
   └─ Keep: High-level, links to other docs, critical workflows

2. PLUGIN_SPEC.md
   ├─ Purpose: Effect Development API Documentation
   ├─ Update when: EffectBase API changes, new effect patterns, export config changes
   ├─ Audience: Claude developing new effects (referenced from CLAUDE.md)
   └─ Keep: Complete API, examples, checklists, best practices

3. docs/*.md
   ├─ Purpose: Deep Technical Specifications
   ├─ Update when: Implementation details change, architecture decisions made
   ├─ Audience: Deep dives, complex implementation details
   └─ Keep: State machines, integration points, error handling, performance

4. README.md
   ├─ Purpose: User-facing GitHub landing page
   ├─ Update when: Public-facing features change, project description changes
   ├─ Audience: GitHub visitors, potential users
   └─ Keep: What the app does, how to use it, screenshots
```

### How to Update Documentation

**1. Identify what changed:**
```javascript
// Code change:
+ static get exportDefaults() { ... }

// Documentation impact:
→ PLUGIN_SPEC.md: Add method to API section
→ PLUGIN_SPEC.md: Update examples
→ CLAUDE.md: Update checklist (if breaking)
```

**2. Update all affected docs:**
- Don't just update one file - follow the hierarchy
- Check if examples need updating
- Verify links still work
- Update "Last Updated" dates

**3. Commit with clear message:**
```bash
git commit -m "docs: Update effect API documentation for exportDefaults

- Add exportDefaults to PLUGIN_SPEC.md API section
- Update all effect examples
- Add to development checklist in CLAUDE.md

Reason: New export configuration system requires this method"
```

### Documentation Quality Standards

**MUST follow:**
- ✅ **Clear examples** - Every API has code example
- ✅ **Consistent formatting** - Follow existing style
- ✅ **No outdated info** - Delete/update obsolete sections
- ✅ **Cross-references** - Link related sections
- ✅ **Checklists** - For multi-step processes
- ✅ **Rationale** - Explain WHY not just WHAT

**Common mistakes to avoid:**
- ❌ Adding features without documenting them
- ❌ Updating code but not examples
- ❌ Leaving contradictory information in different files
- ❌ Making docs too verbose (use hierarchy!)
- ❌ Forgetting to update checklists

### Self-Check Before Finishing Session

Before user ends session, Claude should ask itself:

**Did I...**
- [ ] Add new features? → Are they documented?
- [ ] Change APIs? → Is PLUGIN_SPEC.md updated?
- [ ] Refactor architecture? → Is CLAUDE.md updated?
- [ ] Find inconsistencies? → Did I fix them in docs?
- [ ] Add examples? → Are they in the right place?
- [ ] Update dependencies? → Is it noted in docs?

**If ANY checkbox is unchecked → Update docs before committing code!**

### Documentation Commit Messages

Use these prefixes:

```bash
docs: Add <feature> documentation
docs: Update <section> for <reason>
docs: Fix inconsistency in <file>
docs: Remove outdated <section>
docs: Clarify <concept> with examples

Example:
"docs: Update PLUGIN_SPEC.md for export configuration

- Add Export Configuration section
- Update effect development checklist
- Add loop vs oneshot examples
- Link to VIDEO_EXPORT_SPEC.md

Reason: Video export system requires effects to define export behavior"
```

### Meta-Documentation Rule

**IMPORTANT:** If you find that these documentation guidelines are insufficient or unclear:
1. **Update this section** with better guidelines
2. **Explain why** in commit message
3. This is self-modifying documentation!

**Example:**
```
User: "Claude, you forgot to document the new feature!"
Claude: "You're right! Let me:
  1. Document the feature
  2. Update this Documentation Guidelines section
     to remind future sessions to check for this"
```

---

### Repository Structure (Updated Nov 2024)

```
/
├── index.html              # Main app entry point (Floss app)
├── js/                     # Application JavaScript
│   ├── app.js             # Main application controller
│   ├── core/              # Core systems
│   │   ├── effect-manager.js   # Effect loading & switching
│   │   ├── preset-manager.js   # Preset save/load
│   │   ├── renderer.js         # Three.js renderer setup
│   │   ├── scene.js            # Scene management
│   │   └── state.js            # Application state
│   ├── effects/           # Effect implementations
│   │   ├── effect-base.js      # Base class for all effects
│   │   └── endless.js          # Endless effect (torus knot)
│   ├── ui/                # UI components
│   │   ├── icons.js            # SVG icon definitions
│   │   └── notification.js     # Toast notifications
│   └── utils/             # Utility functions
│       ├── storage.js          # LocalStorage wrapper
│       ├── text-texture.js     # Canvas text rendering
│       └── webgl-check.js      # WebGL capability check
├── styles/                # CSS stylesheets
├── lib/                   # Third-party libraries
├── manifest.json          # PWA manifest
├── service-worker.js      # PWA service worker
├── reference/             # Original Codrops tutorial files (DO NOT MODIFY)
│   ├── index.html         # Old tutorial entry point
│   ├── js/                # Old tutorial code
│   ├── css/               # Old tutorial styles
│   └── assets/            # Old tutorial assets
├── .clauderc              # Claude Code configuration
├── CLAUDE.md              # This file - project context
├── README.md              # Project overview (app-specific)
├── PLUGIN_SPEC.md         # Effect plugin specification
└── CHANGELOG.md           # Version history
```

### 🚨 Before Starting Any Task

1. **Verify current branch:**
   ```bash
   git branch --show-current
   ```
   - Should be `main` or branched from `main`
   - Branch name should start with `claude/`

2. **Confirm correct structure:**
   ```bash
   ls -la
   ```
   - You should see `index.html`, `js/`, `styles/`, `lib/` in root
   - You should see `reference/` containing old tutorial files
   - **DO NOT** see `app/` directory (that was the old structure)

3. **Check deployment URL:**
   - Production: https://karstenhoffmann.github.io/floss/
   - ~~Old URL: https://karstenhoffmann.github.io/floss/app/~~ (deprecated)

---

## Quick Start for New Sessions

### Project Purpose
Floss is a professional kinetic typography motion design tool for motion designers, featuring:
- Modern effect system with plugin architecture
- Real-time parameter controls with presets
- WebGL-based kinetic text effects (THREE.js)
- Offline-first PWA architecture
- No build step required (pure ES6 modules)

### Target Users
Professional motion designers creating kinetic typography animations for:
- Music videos
- Title sequences
- Social media content
- Brand identity animations

### Design Philosophy
- **Desktop-first**: Optimized for desktop Chrome workflow
- **Offline-capable**: Full functionality without network
- **No build tools**: Direct ES6 modules, no webpack/bundlers
- **Professional UX**: Inspired by After Effects and Rive

###⚠️ **CRITICAL: Deployment Philosophy - Copy & Paste Portability**

**Core Requirement:** The app MUST be deployable by simply copying the entire directory to any location and opening `index.html` in a browser.

**Rules:**
1. **ALL dependencies MUST be in the repository**
   - ✅ Vendor third-party libraries in `/lib/` directory
   - ✅ Include ALL files needed to run offline
   - ❌ NO reliance on CDN for critical functionality
   - ❌ NO build process required

2. **Local-first, CDN optional**
   - Libraries SHOULD be in `/lib/` (vendored)
   - CDN imports only acceptable if:
     - Service Worker caches them for offline use
     - App still works if CDN is down (fallback)
   - Prefer: `import from './lib/library.js'`
   - Avoid: `import from 'https://cdn.../library.js'`

3. **Why this matters:**
   - User can zip the repo and send it to someone
   - Works on air-gapped machines (no internet)
   - No npm install, no build, no server setup
   - Open `index.html` → works immediately
   - GitHub Pages deployment is automatic (just push)

4. **Current vendored libraries:**
   - `/lib/` - Third-party libraries (vendored)
   - Three.js, OrbitControls - **TODO: Should be vendored!**
   - Open Props, Coloris - **TODO: Should be vendored!**
   - canvas-record - **TODO: Must be vendored!**

5. **When adding new dependencies:**
   - [ ] Download library files to `/lib/`
   - [ ] Update imports to use local path
   - [ ] Test that app works offline (DevTools → Offline mode)
   - [ ] Document in this file what was added and why
   - [ ] Commit library files to repo

**Example:**
```javascript
// ❌ WRONG - CDN dependency
import { Recorder } from 'https://esm.sh/canvas-record@5.0.0';

// ✅ CORRECT - Vendored in repo
import { Recorder } from './lib/canvas-record/index.js';
```

**For new Claude sessions:** If user says "add library X", your FIRST step is to vendor it in `/lib/`, NOT import from CDN!

---

## Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| UI Framework | Vanilla JS ES6 Modules | No build step, standards-based |
| 3D Engine | THREE.js (r115) | Industry standard WebGL |
| Text Rendering | Canvas 2D → WebGL Texture | High-quality, flexible rendering |
| Design System | Open Props | CSS design tokens |
| Color Picker | Coloris | Modern, eyedropper support |
| Icons | Inline SVG | Offline-first, no external deps |
| Offline | Service Worker | True offline capability |
| State | LocalStorage | Persistent settings & presets |

---

## Architecture Overview

### Effect System

Floss uses a **plugin-based effect architecture**:

1. **EffectBase** (`js/effects/effect-base.js`): Base class all effects extend
2. **Effect Implementations** (`js/effects/*.js`): Individual effect classes
3. **EffectManager** (`js/core/effect-manager.js`): Loads and switches effects
4. **Settings Schema**: Each effect defines its own settings

**Creating a New Effect:**
```javascript
import EffectBase from './effect-base.js';

export class MyEffect extends EffectBase {
    static get metadata() {
        return {
            id: 'my-effect',
            name: 'My Effect',
            icon: '✨',
            description: 'Description here'
        };
    }

    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),
            myParam: {
                type: 'number',
                label: 'My Parameter',
                default: 1.0,
                min: 0,
                max: 2,
                step: 0.1
            }
        };
    }

    init(scene, camera, renderer) {
        super.init(scene, camera, renderer);
        // Create geometry, material, mesh
        // Add to scene
    }

    update(deltaTime) {
        // Update animation
    }

    updateSettings(settings) {
        super.updateSettings(settings);
        // React to settings changes
    }

    dispose() {
        // Clean up resources
    }
}
```

See `PLUGIN_SPEC.md` for complete documentation.

### State Management

- **AppSettings** (`js/core/app-settings.js`): Global app settings
- **Effect State**: Each effect manages its own settings
- **PresetManager** (`js/core/preset-manager.js`): Save/load presets
- **Storage** (`js/utils/storage.js`): LocalStorage abstraction

### Rendering Pipeline

1. **Scene Setup** (`js/core/scene.js`): Initialize THREE.js scene
2. **Renderer** (`js/core/renderer.js`): WebGL renderer with animation loop
3. **Text Texture** (`js/utils/text-texture.js`): Generate text on canvas
4. **Effect Shader**: Map texture to 3D geometry with custom shaders
5. **Camera Controls**: OrbitControls for interaction

---

## 🎨 Developing New Effects

**CRITICAL:** When developing a new effect, read these documents in order:

### Required Reading

1. **`PLUGIN_SPEC.md`** ⭐ - **READ THIS FIRST**
   - Complete effect development guide
   - Effect API (EffectBase methods & properties)
   - Settings schema system
   - **Export configuration** (REQUIRED for video export)
   - Complete examples (loop vs oneshot effects)
   - Testing checklist

2. **`js/effects/endless.js`** - Reference implementation
   - Production-ready example
   - Perfect loop calculation
   - Export configuration in action

3. **`docs/VIDEO_EXPORT_SPEC.md`** - Export system deep-dive (optional)
   - Technical architecture details

### Effect Development Checklist

When Claude creates a new effect, MUST implement:

**Required (Basic Effect):**
- ✅ `static get metadata()` - ID, name, icon, description
- ✅ `getSettingsSchema()` - Define parameters (inherits from EffectBase)
- ✅ `init(scene, camera, renderer)` - Create Three.js scene
- ✅ `update(deltaTime, elapsedTime)` - Animation loop
- ✅ `onSettingChanged(key, value)` - Reactive updates
- ✅ `destroy()` - Cleanup resources

**Required (Video Export Support):**
- ✅ `static get exportDefaults()` - Export behavior (type: 'loop'|'oneshot', duration)
- ✅ `calculateExportSuggestion()` - Smart duration based on CURRENT settings
- ⚠️ `reset()` - Optional, reset to t=0 for export (if effect needs it)

**Optional (Advanced):**
- `resize(width, height)` - Handle window resize
- `isComplete()` - For oneshot effects, detect when done
- `getVisualCenter()` - Custom camera pivot point

### Example Prompt for New Effect

When user says: "Create a new wave effect"

Claude should:
1. Read PLUGIN_SPEC.md (especially Export Configuration section)
2. Analyze if effect is 'loop' or 'oneshot'
3. Implement `calculateExportSuggestion()` to calculate perfect loop point
4. Follow the checklist above
5. Test with Export Mode

**Good Prompt:**
> "Create a new effect called 'wave' that animates text with a sine wave displacement. It should loop seamlessly. Calculate the perfect loop duration based on wave frequency. See PLUGIN_SPEC.md for the complete API, especially the Export Configuration section."

---

## ⚠️ Common Pitfalls (Avoid These Mistakes!)

This section documents common mistakes that waste time. Read this BEFORE starting development.

### Effect Development Pitfalls

**1. Forgetting Export Configuration**
```javascript
// ❌ WRONG: No export configuration
export class MyEffect extends EffectBase {
    static get metadata() { ... }
    getSettingsSchema() { ... }
    // Missing exportDefaults and calculateExportSuggestion!
}

// ✅ CORRECT: Always include export configuration
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

**2. Static Export Duration Instead of Dynamic Calculation**
```javascript
// ❌ WRONG: Hardcoded duration
calculateExportSuggestion() {
    return {
        duration: 5,  // Always 5 seconds, regardless of settings
        loopPoint: 5,
        isSeamless: true
    };
}

// ✅ CORRECT: Calculate based on CURRENT settings
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

**3. Settings Without Group Property**
```javascript
// ❌ WRONG: No group property
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

// ✅ CORRECT: Always specify group
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

**4. Not Disposing Three.js Resources**
```javascript
// ❌ WRONG: Memory leak
destroy() {
    this.scene.remove(this.mesh);
    // Forgot to dispose geometry, material, textures!
}

// ✅ CORRECT: Always dispose
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

**5. Hardcoded Values Instead of Settings**
```javascript
// ❌ WRONG: Hardcoded values
update(deltaTime) {
    this.mesh.rotation.y += deltaTime * 0.5;  // Magic number!
}

// ✅ CORRECT: Use settings
update(deltaTime) {
    const speed = this.settings.rotationSpeed || 1.0;
    this.mesh.rotation.y += deltaTime * speed;
}
```

**Why it matters:** User can't control the animation. Defeats the purpose of having settings.

---

**6. Using deltaTime for Position (Animation Drift)**
```javascript
// ❌ WRONG: Using deltaTime for position (accumulates error)
update(deltaTime) {
    this.rotation += deltaTime * this.settings.rotationSpeed;
    this.mesh.rotation.y = this.rotation;
}

// ✅ CORRECT: Use elapsedTime for deterministic position
update(deltaTime, elapsedTime) {
    const speed = this.settings.rotationSpeed || 1.0;
    this.mesh.rotation.y = elapsedTime * speed;  // Always exact
}
```

**Why it matters:** Export relies on exact frame timing. deltaTime causes drift, breaking perfect loops.

---

**7. Circular Import Dependencies**
```javascript
// ❌ WRONG: Circular imports
// app.js
import { MyEffect } from './effects/my-effect.js';

// my-effect.js
import { App } from './core/app.js';  // Circular!

// ✅ CORRECT: Use dependency injection
// app.js
import { MyEffect } from './effects/my-effect.js';
const effect = new MyEffect();
effect.init(scene, camera, renderer);  // Pass dependencies

// my-effect.js
// No import of App needed - receives dependencies via init()
```

**Why it matters:** Module loading fails with cryptic errors. Very hard to debug.

---

**8. Forgetting to Call super.destroy()**
```javascript
// ❌ WRONG: Doesn't call parent cleanup
destroy() {
    this.geometry.dispose();
    this.material.dispose();
    // Forgot super.destroy()!
}

// ✅ CORRECT: Always call super
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

### GitHub Pages Deployment Pitfalls

**9. Testing Wrong Branch**
```bash
# ❌ WRONG: Push to branch but GitHub Pages deploys from main
git checkout claude/my-feature-123
# ... make changes ...
git push origin claude/my-feature-123

# User tests at https://karstenhoffmann.github.io/floss/
# But GitHub Pages is STILL deploying from main branch!
# User sees OLD code and reports "it doesn't work"
```

**✅ CORRECT: Update GitHub Pages settings first**
```
1. Push to branch: git push origin claude/my-feature-123
2. TELL USER: "Update GitHub Pages to branch: claude/my-feature-123"
3. User goes to: Settings → Pages → Branch: [select branch]
4. Wait 1-2 minutes for deployment
5. NOW test at https://karstenhoffmann.github.io/floss/
```

**Why it matters:** This is the #1 wasted-time issue. User tests old code, reports bugs that are already fixed.

---

**10. Branch Name Missing Session ID**
```bash
# ❌ WRONG: Branch name without session ID
git checkout -b claude/my-feature

# ✅ CORRECT: Branch name WITH session ID
git checkout -b claude/my-feature-0141Y9y9rYFGQNXKK1WTUB8H
```

**Why it matters:** GitHub push will fail with 403 error if branch doesn't end with matching session ID.

---

### Documentation Pitfalls

**11. Adding Features Without Documenting Them**
```javascript
// ❌ WRONG: Add new method, don't document
// effect-base.js
+ getVisualCenter() { return new THREE.Vector3(0, 0, 0); }

// No update to PLUGIN_SPEC.md!

// ✅ CORRECT: Add method AND document
// effect-base.js
+ getVisualCenter() { return new THREE.Vector3(0, 0, 0); }

// PLUGIN_SPEC.md
+ ## getVisualCenter()
+ Returns the visual center point for camera pivot.
+ ...
```

**Why it matters:** Future Claude sessions won't know the method exists. Reinvent the wheel.

---

**12. Contradictory Documentation**
```markdown
<!-- ❌ WRONG: CLAUDE.md says one thing -->
CLAUDE.md: "Effects must implement exportDefaults"

<!-- PLUGIN_SPEC.md says another -->
PLUGIN_SPEC.md: "exportDefaults is optional"

<!-- ✅ CORRECT: Keep docs in sync -->
CLAUDE.md: "Effects MUST implement exportDefaults (see PLUGIN_SPEC.md)"
PLUGIN_SPEC.md: "## Required Methods
- exportDefaults - REQUIRED for video export"
```

**Why it matters:** Claude gets confused, user gets frustrated, time is wasted resolving conflicts.

---

**13. Forgetting to Update version.js Before Committing**
```bash
# ❌ WRONG: Commit without updating version
# ... make code changes ...
git add .
git commit -m "feat: new feature"
# version.js still shows old version!

# ✅ CORRECT: Always update version.js FIRST
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

### Self-Check Before Finishing Session

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

---

## Common Tasks

### Running Locally

```bash
# Simple HTTP server (from repository root)
python3 -m http.server 8080
# → http://localhost:8080
```

**Important:** The user tests via GitHub Pages, not locally. Always push changes to test.

### Deploying to GitHub Pages

**⚠️ CRITICAL FOR CLAUDE CODE WEB:**

User can ONLY test via GitHub Pages. **Always remind them to update settings!**

**Step-by-step deployment:**

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push -u origin claude/your-branch-name-[session-id]
   ```

2. **🚨 TELL USER to update GitHub Pages settings:**
   ```
   Go to: https://github.com/karstenhoffmann/floss/settings/pages

   Settings to verify/update:
   - Source: "Deploy from a branch"
   - Branch: [your current working branch] ← SELECT CORRECT BRANCH!
   - Folder: "/ (root)"
   - Click "Save"
   ```

3. **Wait for deployment:**
   - GitHub Actions will deploy automatically
   - Wait ~1-2 minutes
   - Check deployment status: https://github.com/karstenhoffmann/floss/actions

4. **🚨 REMIND USER to test:**
   ```
   Test at: https://karstenhoffmann.github.io/floss/

   Verify you're testing the CORRECT branch:
   - Check GitHub Pages settings shows your branch
   - Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
   - Check DevTools → Network to see fresh requests
   ```

5. **Clear cache if needed:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
   - Or: DevTools → Application → Clear Storage

**Service Worker Cache:**
- Bump `CACHE_VERSION` in `service-worker.js` when making breaking changes
- Example: `v1.0.0` → `v1.0.1`
- Forces clients to re-download assets

**Common Issues:**
- ❌ Testing wrong branch: Check GitHub Pages settings
- ❌ Seeing old code: Wait longer or hard refresh
- ❌ 404 errors: Verify folder is set to `/ (root)` not `/app`

### Adding a New Effect

1. Create `js/effects/my-effect.js` extending `EffectBase`
2. Implement required methods (see PLUGIN_SPEC.md)
3. Import in `js/core/effect-manager.js`
4. Add to effect registry
5. Test locally, then push

### Modifying UI

- **Styles**: Edit `styles/*.css` files
- **Icons**: Add to `js/ui/icons.js` SVG sprite
- **Notifications**: Use `showNotification()` from `js/ui/notification.js`
- **Controls**: Auto-generated from effect settings schema

---

## 🎬 Video Export System

**Status:** ✅ Fully implemented (v5.1.1+)
**Format:** MP4 (H.264), PowerPoint compatible
**Resolution:** 1920×1080
**Frame Rates:** 30fps, 60fps
**Export Type:** Frame-perfect offline rendering

### Overview

The video export system uses **canvas-record** library with **MP4WasmEncoder** for frame-perfect, offline video rendering. This means:
- ✅ Faster than realtime (30-40× speed)
- ✅ Perfect loops (calculated from effect settings)
- ✅ No frame drops or timing issues
- ✅ Deterministic animation (same input = same output)
- ✅ No external dependencies (WASM embedded)

### Implementation Architecture

**File:** `js/core/video-export.js`

```
User clicks Export
  ↓
VideoExportManager.enterExportMode()
  ↓
SafeFrame component shows 1920×1080 region
  ↓
User clicks "Start Export"
  ↓
VideoExportManager.startExport()
  ├─ Create offscreen renderer (1920×1080)
  ├─ Clone effect to offscreen scene
  ├─ Reset effect to t=0
  ├─ Initialize canvas-record Recorder
  │   ├─ Create MP4WasmEncoder explicitly
  │   ├─ Calculate bitrate manually
  │   └─ Start with { initOnly: true }
  ↓
renderFrameByFrame()
  ├─ Loop: for frame 0 to 149 (150 frames)
  │   ├─ Calculate time = frame / fps
  │   ├─ effect.update(deltaTime, time)
  │   ├─ offscreenRenderer.render(scene, camera)
  │   └─ recorder.step()
  ↓
recorder.stop() → Returns Uint8Array buffer
  ↓
Convert to Blob → Download MP4
```

### Critical Learnings (MUST READ)

**🚨 IMPORTANT:** These are hard-learned lessons from v4.0.0-v5.1.1 development. Follow these exactly to avoid wasting time.

#### 1. **Use MP4WasmEncoder, NOT WebCodecsEncoder**

**Problem:**
- canvas-record auto-selects WebCodecsEncoder if browser supports WebCodecs API
- WebCodecsEncoder has inconsistent browser support and configuration issues
- Codec compatibility varies across devices (avc1.420034 vs avc1.4d0034)

**Solution:**
```javascript
import { Recorder, Encoders } from '../../lib/canvas-record/package/index.js';

// ✅ CORRECT: Explicitly create MP4WasmEncoder
const encoder = new Encoders.MP4WasmEncoder({
    extension: 'mp4'
});

this.recorder = new Recorder(gl, {
    encoder: encoder,  // Force MP4WasmEncoder
    // ...
});
```

**Why:** MP4WasmEncoder uses embedded WASM binary, no browser API dependencies, works everywhere.

---

#### 2. **Pass WebGL Context, NOT Canvas Element**

**Problem:**
- Recorder expects a RenderingContext (WebGLRenderingContext), not HTMLCanvasElement
- Error: "Cannot read properties of undefined (reading 'width')"

**Solution:**
```javascript
// ❌ WRONG:
this.recorder = new Recorder(this.offscreenCanvas, {...});

// ✅ CORRECT:
const gl = this.offscreenRenderer.context;  // Property, not method!
this.recorder = new Recorder(gl, {...});
```

**Why:** Recorder.js accesses `this.context.canvas.width` - needs context, not canvas.

---

#### 3. **Use Three.js `.context` Property (r115)**

**Problem:**
- Three.js r115 has `.context` property, not `.getContext()` method
- Calling `.getContext()` throws deprecation warning or fails

**Solution:**
```javascript
// ❌ WRONG:
const gl = this.offscreenRenderer.getContext();  // Not a method!

// ✅ CORRECT:
const gl = this.offscreenRenderer.context;  // Property in r115
```

**Why:** Three.js API changed - use property access for renderer context.

---

#### 4. **Provide encoderOptions.bitrateMode**

**Problem:**
- MP4WasmEncoder.init() accesses `this.encoderOptions.bitrateMode`
- Error: "Cannot read properties of undefined (reading 'bitrateMode')"

**Solution:**
```javascript
this.recorder = new Recorder(gl, {
    encoder: encoder,
    encoderOptions: {
        bitrateMode: 'variable',  // Required!
        bitrate: bitrate  // Explicit value
    }
});
```

**Why:** Encoder needs bitrateMode to calculate bitrate via estimateBitRate().

---

#### 5. **Calculate Bitrate Manually**

**Problem:**
- `estimateBitRate(width, height, frameRate, motionRank, bitrateMode)`
- MP4WasmEncoder calls it with wrong parameter order → NaN bitrate
- Error: "Failed to read the 'bitrate' property from 'VideoEncoderConfig'"

**Solution:**
```javascript
// Calculate bitrate manually
const width = 1920;
const height = 1080;
const fps = 60;
const motionRank = 4;  // 1=low, 2=medium, 4=high motion
const bitrateMode = 'variable';

const bitrate = Math.round(
    width * height * fps * motionRank * 0.07 * (bitrateMode === 'variable' ? 0.75 : 1)
);
// For 1920×1080@60fps: ~26 Mbps

this.recorder = new Recorder(gl, {
    encoderOptions: {
        bitrateMode: bitrateMode,
        bitrate: bitrate  // Explicit value
    }
});
```

**Why:** Avoid relying on estimateBitRate() parameter order bugs.

---

#### 6. **Use start({ initOnly: true }) + Final stop()**

**Problem:**
- `start()` calls first `step()` automatically → encodes frame 0
- Loop encodes frames 0-149 → total 151 frames (off by one!)
- `step()` doesn't return buffer, only calls `stop()` internally

**Solution:**
```javascript
// Start without first step
await this.recorder.start({ initOnly: true });

// Render all frames
for (let frameNumber = 0; frameNumber < totalFrames; frameNumber++) {
    effect.update(deltaTime, time);
    this.offscreenRenderer.render(scene, camera);
    await this.recorder.step();  // Doesn't return anything!
}

// Call stop() directly to get buffer
const buffer = await this.recorder.stop();  // Returns Uint8Array
const blob = new Blob([buffer], { type: 'video/mp4' });
```

**Why:**
- `initOnly: true` prevents double-encoding first frame
- `step()` has no return statement in else branch
- `stop()` returns the buffer properly

---

#### 7. **Use Deterministic Timing (elapsedTime, not deltaTime)**

**Problem:**
- Using deltaTime for position accumulates floating-point errors
- Breaks perfect loops and frame-perfect rendering

**Solution:**
```javascript
// ❌ WRONG: Accumulates error
this.rotation += deltaTime * speed;

// ✅ CORRECT: Deterministic
for (let frame = 0; frame < totalFrames; frame++) {
    const time = frame / fps;  // Exact time
    effect.update(1/fps, time);  // deltaTime, elapsedTime
}
```

**Why:** Export relies on exact frame timing for perfect loops.

---

### Complete Working Example

```javascript
// js/core/video-export.js
import { Recorder, Encoders } from '../../lib/canvas-record/package/index.js';

async startExport() {
    // 1. Setup
    const width = 1920;
    const height = 1080;
    const fps = 60;
    const duration = 2.5;  // seconds
    const totalFrames = duration * fps;  // 150 frames

    // 2. Create offscreen renderer
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const offscreenRenderer = new THREE.WebGLRenderer({
        canvas: offscreenCanvas,
        alpha: true,
        antialias: true
    });

    // 3. Get WebGL context (property, not method!)
    const gl = offscreenRenderer.context;

    // 4. Calculate bitrate manually
    const motionRank = 4;
    const bitrateMode = 'variable';
    const bitrate = Math.round(
        width * height * fps * motionRank * 0.07 * (bitrateMode === 'variable' ? 0.75 : 1)
    );

    // 5. Create MP4WasmEncoder explicitly
    const encoder = new Encoders.MP4WasmEncoder({
        extension: 'mp4'
    });

    // 6. Create Recorder
    this.recorder = new Recorder(gl, {
        name: `floss-export-${Date.now()}.mp4`,
        duration: duration,
        frameRate: fps,
        download: false,
        extension: 'mp4',
        encoder: encoder,
        encoderOptions: {
            bitrateMode: bitrateMode,
            bitrate: bitrate
        }
    });

    // 7. Start recording (initOnly - skip first step)
    await this.recorder.start({ initOnly: true });

    // 8. Render frames
    for (let frame = 0; frame < totalFrames; frame++) {
        const time = frame / fps;
        effect.update(1/fps, time);
        offscreenRenderer.render(scene, camera);
        await this.recorder.step();
    }

    // 9. Stop and get buffer
    const buffer = await this.recorder.stop();
    const blob = new Blob([buffer], { type: 'video/mp4' });

    // 10. Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `floss-export-${Date.now()}.mp4`;
    a.click();
    URL.revokeObjectURL(url);
}
```

---

### Debugging Video Export

**If export fails, check these in order:**

1. **Console logging:**
   ```
   ✓ Using encoder: MP4WasmEncoder  ← Must be MP4WasmEncoder
   ✓ Bitrate: 26.1 Mbps (variable)  ← Valid number
   ✓ All frames rendered in X.XXs   ← Should complete
   → Stopping recording...
     Current frame count: 150 / 150  ← Should match
   ✓ Recording stopped, buffer type: Uint8Array  ← Not undefined!
     Buffer size: XXXXXX bytes  ← Not 0!
   ✓ Recording stopped, blob size: X.XX MB  ← Valid size
   ```

2. **Common errors:**
   - "Cannot read properties of undefined (reading 'width')" → Pass context, not canvas
   - "Cannot read properties of undefined (reading 'bitrateMode')" → Add encoderOptions
   - "Failed to read 'bitrate' property" → Calculate bitrate manually
   - Blob size 0.00 MB → Buffer is undefined, check stop() call
   - File contains "undefined" → new Blob([undefined], ...) - buffer is undefined

3. **Verify MP4 file:**
   - Size should be 2-10 MB (depending on duration/fps)
   - Should open in QuickTime/VLC
   - Should play in PowerPoint
   - Should loop perfectly (if effect implements calculateExportSuggestion)

---

### Dependencies

**Library:** canvas-record v5.5.0 (vendored in `/lib/canvas-record/`)

**Import Map:** (in `index.html`)
```html
<script type="importmap">
{
  "imports": {
    "canvas-context": "https://esm.sh/canvas-context@3.3.1",
    "canvas-screenshot": "https://esm.sh/canvas-screenshot@4.2.2",
    "mediabunny": "https://esm.sh/mediabunny@1.24.2",
    "media-codecs": "https://esm.sh/media-codecs@2.0.2",
    "gifenc": "https://esm.sh/gifenc@1.0.3",
    "h264-mp4-encoder": "https://esm.sh/h264-mp4-encoder@1.0.12",
    "@ffmpeg/ffmpeg": "https://esm.sh/@ffmpeg/ffmpeg@0.12.7",
    "@ffmpeg/util": "https://esm.sh/@ffmpeg/util@0.12.1"
  }
}
</script>
```

**Why Import Maps:** canvas-record uses bare module specifiers that need resolution.

---

### Future Improvements

- [ ] Custom bitrate control (UI slider)
- [ ] Multiple format support (WebM, GIF)
- [ ] Resolution presets (4K, 1080p, 720p)
- [ ] Background export (Web Worker)
- [ ] Progress bar with time estimates
- [ ] Cancel export functionality
- [ ] Export queue (multiple exports)

---

## Reference Directory (DO NOT MODIFY)

The `/reference/` directory contains the **original Codrops kinetic typography tutorial** that Floss was based on. These files are:

- **Read-only**: Keep for reference, do NOT modify
- **Old architecture**: Uses different structure (Type.js, options.js)
- **Learning resource**: Good examples of effect techniques
- **Historical**: Shows evolution of the project

**If you need to reference the original tutorial:**
- Look in `/reference/index.html`
- Check `/reference/js/gl/shaders.js` for shader examples
- Review `/reference/js/options.js` for effect configurations

---

## Known Issues & Gotchas

### 1. Service Worker Caching
**Problem:** Changes not visible after deployment
**Solution:** Bump `CACHE_VERSION` in `service-worker.js`
**Debug:** Dev Tools → Application → Clear Storage

### 2. LocalStorage Quota
**Problem:** Presets fail to save
**Solution:** Limit preset count or compress data
**Debug:** Check Console for QuotaExceededError

### 3. THREE.js Version
**Problem:** Compatibility with r115
**Solution:** Use THREE.js r115 syntax, check docs at three.js.org
**Note:** OrbitControls is from r115 examples

### 4. GitHub Pages Deployment
**Branch:** Deploys from `main` branch root directory
**Cache:** GitHub Pages CDN caches aggressively - wait ~1 min
**Path:** No `/app/` subdirectory anymore (old structure)

### 5. Cross-Origin Issues
**Problem:** Canvas tainted by cross-origin images
**Solution:** Use data URLs or same-origin images
**Note:** Affects text texture export

---

## Development Workflow

### Git Branch Strategy

- `main` - Production branch (GitHub Pages deploys from here)
- `claude/*` - Feature branches for Claude Code sessions
- Merge to `main` via commit when feature is complete and tested

### Commit Message Format

```
<type>: <short description>

<optional detailed explanation>

Changes:
- file1.js - what changed
- file2.css - what changed
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `style`, `perf`, `chore`

### Session Start Checklist

Before starting work:
- [ ] Read this CLAUDE.md file completely
- [ ] Check current branch (`git branch --show-current`)
- [ ] 🚨 **TELL USER to update GitHub Pages settings to current branch**
- [ ] Verify repository structure (no `/app/` directory)
- [ ] Understand the effect system architecture
- [ ] Review any open issues or TODOs

### After Making Changes Checklist

Before user can test:
- [ ] Commit changes with clear message
- [ ] Push to branch with correct session ID
- [ ] 🚨 **REMIND USER: "Update GitHub Pages to branch [branch-name] if not already done"**
- [ ] 🚨 **REMIND USER: "Wait 1-2 minutes, then test at https://karstenhoffmann.github.io/floss/"**
- [ ] 🚨 **REMIND USER: "Verify you're testing the correct branch"**

---

## Effect Development Guidelines

### Performance

- Target 60 FPS on modern desktop hardware
- Use BufferGeometry (not legacy Geometry)
- Minimize uniform updates in shaders
- Dispose resources properly on effect switch

### Visual Quality

- Use OKLCH color space for better perceptual uniformity
- Implement smooth transitions between parameter changes
- Consider fog/depth for 3D effects
- Add subtle animation to static parameters

### User Experience

- Settings should have immediate visual feedback
- Use sensible defaults
- Provide helpful parameter labels
- Consider preset-friendliness of settings

### Code Style

- Use ES6 modules
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public methods
- Keep methods under 50 lines

---

## Testing

### Manual Testing Checklist

- [ ] Effect loads without errors
- [ ] Settings panel populates correctly
- [ ] All settings controls work
- [ ] Presets save and load
- [ ] Effect switches cleanly (no memory leaks)
- [ ] Performance is acceptable (check FPS)
- [ ] Works offline (Service Worker)
- [ ] Mobile responsive (if applicable)

### Browser Compatibility

**Primary Target:** Desktop Chrome (latest)
**Secondary:** Desktop Firefox, Safari
**Mobile:** Not optimized (desktop workflow)

---

## Debugging

### Common Console Messages

```javascript
// Good
"Effect loaded: my-effect"
"Settings initialized"
"Preset saved: My Preset"

// Warnings
"WebGL not available - falling back"
"LocalStorage quota exceeded"

// Errors
"Failed to load effect: ..."
"THREE.js error: ..."
```

### Debug Tools

- Chrome DevTools → Application → Service Workers
- Chrome DevTools → Application → Local Storage
- THREE.js Inspector extension
- Stats.js for FPS monitoring (add to renderer.js)

---

## Future Enhancements

See `CHANGELOG.md` and GitHub Issues for roadmap.

Priority features:
- [ ] Export video/GIF functionality
- [ ] More effect implementations (smoke, particles, etc.)
- [ ] Timeline-based animation sequencing
- [ ] Custom font upload
- [ ] Collaborative presets (cloud sync)
- [ ] Effect parameters randomization
- [ ] Keyboard shortcuts customization

---

## External Dependencies

### CDN Resources

All loaded from CDN, cached by Service Worker:

```html
<!-- Open Props -->
<link rel="stylesheet" href="https://unpkg.com/open-props" />

<!-- THREE.js r115 -->
<script src="https://unpkg.com/three@0.115.0/build/three.min.js"></script>
<script src="https://unpkg.com/three@0.115.0/examples/js/controls/OrbitControls.js"></script>

<!-- Coloris -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.css"/>
<script src="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.js"></script>
```

**Fallback Strategy:** Service Worker caches for offline use. No runtime fallbacks currently.

---

## Troubleshooting

### App Not Loading

1. Check Console for JavaScript errors
2. Verify Network tab for 404s or failed CDN requests
3. Check Service Worker registration
4. Clear browser cache and Service Worker cache
5. Verify correct URL (not `/app/` subdirectory)

### Effect Not Rendering

1. Check WebGL availability (Console error?)
2. Verify THREE.js version compatibility
3. Check effect shader syntax (GLSL errors)
4. Verify geometry/material/mesh creation
5. Check scene.add() was called
6. Verify camera position and field of view

### Settings Not Saving

1. Check LocalStorage quota
2. Verify JSON serialization works
3. Check for Console errors
4. Try clearing LocalStorage and retrying

### GitHub Pages Not Updating

1. Verify pushed to correct branch (`main`)
2. Wait 1-2 minutes for deployment
3. Hard refresh browser (Ctrl+Shift+R)
4. Bump Service Worker cache version
5. Check GitHub Actions for deployment status

---

## Contact & Contribution

**Owner:** Karsten Hoffmann
**Original Demo:** [Codrops Kinetic Typography](https://tympanus.net/codrops/)
**License:** See LICENSE file

**For Claude Code Sessions:**
1. Always read this CLAUDE.md first
2. Check repository structure is correct
3. Follow the effect plugin architecture
4. Test via GitHub Pages before finalizing
5. Update documentation when adding features

---

## Version History

See `CHANGELOG.md` for detailed version history.

**Current Version:** 2.2.0
**Architecture:** Post-restructure (app in root, reference isolated)
**Last Major Change:** Repository restructure (Nov 2024)

---

## 🚀 QUICK REFERENCE FOR CLAUDE

### Critical Reminders (Execute Every Session)

**1. At Session Start:**
```
🚨 Current branch: [check with git branch --show-current]
🚨 TELL USER: "Please update GitHub Pages to branch: [branch-name]"
🚨 URL: https://github.com/karstenhoffmann/floss/settings/pages
```

**2. After Every Push:**
```
🚨 REMIND USER: "I've pushed to [branch-name]"
🚨 REMIND USER: "Update GitHub Pages settings if you haven't already"
🚨 REMIND USER: "Wait 1-2 min, then test at https://karstenhoffmann.github.io/floss/"
🚨 REMIND USER: "Verify you're testing the correct branch"
```

**3. When Creating New Branch:**
```
🚨 Branch must end with session ID: claude/feature-name-[SESSION_ID]
🚨 TELL USER: "Update GitHub Pages: Settings → Pages → Branch: [new-branch]"
```

**4. Before User Tests:**
```
Checklist:
✅ Changes committed
✅ Changes pushed to correct branch (with session ID)
✅ User reminded to update GitHub Pages
✅ User reminded to wait 1-2 minutes
✅ User reminded which URL to test
```

### Why This Matters

- User has **NO local file access** (Claude Code for Web)
- User can **ONLY test via GitHub Pages**
- Wrong branch in GitHub Pages = user tests **old code**
- Wasted time if user isn't reminded to update settings

### Common Mistakes to Avoid

❌ Don't assume user can test locally
❌ Don't forget to remind about GitHub Pages settings
❌ Don't push without telling user which branch
❌ Don't forget the session ID in branch name
