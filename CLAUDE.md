# Claude Code Session Context

**Last Updated:** 2025-11-21
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
