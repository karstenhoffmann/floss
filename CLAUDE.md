# Claude Code Session Context

**Last Updated:** 2025-11-24
**Project:** Floss - Professional Kinetic Typography Motion Design Tool
**Repository:** https://github.com/karstenhoffmann/floss
**Deployment:** https://karstenhoffmann.github.io/floss/

---

# SECTION 1: CORE (Required Reading for Every Session)

## 🚀 Session Start Protocol

**MANDATORY FOR EVERY NEW SESSION:**

### Step 1: Load Status Files
```
Read PHASE_OVERVIEW.md and CURRENT_STATUS.md (if they exist)
```

### Step 2: Summarize Context
```
✅ Status files loaded:
  - PHASE_OVERVIEW.md: [phase info]
  - CURRENT_STATUS.md: [version, recent work]
  - Current git branch: [branch name]

Ready to continue. What would you like to work on?
```

### Step 3: Verify Understanding
- [ ] Status files describe **main branch state** (not feature branch)
- [ ] If on feature branch, status files show main state (this is normal)
- [ ] Never rely on chat history, always trust the files

---

## 📂 Status File Rules

**CRITICAL: Status files are branch-neutral and describe the main branch state**

### What Status Files Contain:
- ✅ Project state on **main branch**
- ✅ Stable facts (version, phase progress, architecture decisions)
- ❌ NEVER feature branch names or branch-specific context
- ❌ NEVER session-specific details

### File Modification Policy:

**Before modifying ANY status file:**
1. Show proposed changes to user
2. Wait for explicit approval ("yes" / "no" / "later")
3. Never guess or assume

**When to propose updates:**
- Phase completed
- Architecture decision made
- Major milestone reached
- After merge to main (with user approval)

**NEVER update automatically!**

---

## 🌐 Claude Code for Web - Deployment Context

**THIS PROJECT USES CLAUDE CODE FOR WEB (not CLI)**

### Critical Constraints:
- User has NO local file access
- User can ONLY test via GitHub Pages
- Wrong branch in GitHub Pages = user tests old code

### Mandatory Workflow:

**1. At Session Start:**
```
🚨 TELL USER: "Please update GitHub Pages settings to deploy from branch: [branch-name]"
```

**2. After Pushing Commits:**
```
🚨 REMIND USER: "Test at https://karstenhoffmann.github.io/floss/ (wait 1-2 min for deployment)"
```

**3. Branch Name Requirements:**
- Must start with `claude/`
- Must end with session ID: `claude/feature-name-[SESSION_ID]`
- Push will fail with 403 if session ID is missing

**GitHub Pages Configuration:**
- Location: Repo Settings → Pages
- Source: Deploy from branch
- Branch: **[current working branch]** ← CRITICAL TO UPDATE
- Folder: **`/ (root)`**

---

## 🔢 Version Management

**MANDATORY: Update version WITH EVERY COMMIT!**

### Version File: `js/version.js`

```javascript
export const VERSION = {
    number: '2.3.0',           // Semantic version (major.minor.patch)
    commit: 'Brief commit message here',  // Max 47 chars
    date: '2025-11-21',        // YYYY-MM-DD
    time: '14:30'              // HH:MM (24-hour format)
};
```

### Version Number Rules (Semantic Versioning):
- **Major (X.0.0):** Breaking changes, architecture refactor
- **Minor (2.X.0):** New features, new effects, significant additions
- **Patch (2.3.X):** Bug fixes, minor improvements, documentation

### Self-Check Before Committing:
- [ ] Did I update `js/version.js`?
- [ ] Did I increment version number correctly?
- [ ] Did I write a brief commit message (max 47 chars)?
- [ ] Did I update date and time?

**If ANY checkbox is unchecked → Update version.js before committing!**

---

## 📝 Documentation Maintenance

**IMPORTANT:** Documentation is LIVING - not static! Claude must maintain docs as the project evolves.

### When to Update Documentation:
- ✅ Adding new features → update relevant sections
- ✅ Changing APIs → update PLUGIN_SPEC.md
- ✅ Refactoring architecture → update CLAUDE.md
- ✅ Modifying entry points or initialization → update architecture docs
- ✅ Discovering inconsistencies → fix immediately

### Architecture & Entry-Point Changes Rule:

**Whenever modifying or reorganizing:**
- Application entry points (index.html, app.js)
- Initialization flows or startup logic
- App shell or loading sequences
- High-level architecture patterns

**Claude MUST:**
1. Update CLAUDE.md to reflect the new architecture
2. Update PHASE_OVERVIEW.md and/or CURRENT_STATUS.md if this is a major milestone
3. Document any new public APIs or integration patterns
4. Ensure documentation remains branch-neutral (describes main state)
5. Link to detailed specs rather than duplicating everything

**Why:** Session continuity depends on accurate architecture documentation. Future Claude sessions need to understand how the app starts and how components integrate.

### Documentation Hierarchy:

1. **CLAUDE.md** - Session context, high-level architecture, critical workflows
2. **PLUGIN_SPEC.md** - Effect development API documentation
3. **docs/*.md** - Deep technical specifications
4. **README.md** - User-facing GitHub landing page
5. **DETAILED_PITFALLS.md** - Comprehensive common mistakes reference

### Self-Check Before Finishing Session:
- [ ] New features documented?
- [ ] APIs updated in PLUGIN_SPEC.md?
- [ ] Architecture changes reflected in CLAUDE.md?
- [ ] Docs consistent with each other?
- [ ] Examples updated?

---

## ✅ Session Start Checklist

**Before starting work:**
1. Read PHASE_OVERVIEW.md and CURRENT_STATUS.md
2. Check current branch: `git branch --show-current`
3. 🚨 Tell user to update GitHub Pages settings to current branch
4. Verify repository structure (no `/app/` directory - old structure)
5. Check for current version: See CURRENT_STATUS.md and js/version.js

**After making changes:**
1. Update `js/version.js` before committing
2. Commit with clear message
3. Push to branch with correct session ID
4. 🚨 Remind user: "Update GitHub Pages to branch [branch-name] if not already done"
5. 🚨 Remind user: "Wait 1-2 minutes, then test at https://karstenhoffmann.github.io/floss/"

---

# SECTION 2: PROJECT CONTEXT & ARCHITECTURE

## Quick Start for New Sessions

### Project Purpose
Floss is a professional kinetic typography motion design tool featuring:
- Modern effect system with plugin architecture
- Real-time parameter controls with presets
- WebGL-based kinetic text effects (THREE.js)
- Offline-first PWA architecture
- No build step required (pure ES6 modules)

### Target Users
Professional motion designers creating kinetic typography for:
- Music videos
- Title sequences
- Social media content
- Brand identity animations

### Design Philosophy
- **Desktop-first**: Optimized for desktop Chrome workflow
- **Offline-capable**: Full functionality without network
- **No build tools**: Direct ES6 modules (note: Rollup for vendoring bundles)
- **Professional UX**: Inspired by After Effects and Rive

---

## ⚠️ Copy & Paste Portability Philosophy

**Core Requirement:** The app MUST be deployable by copying the directory and opening `index.html`.

**Rules:**
1. ALL dependencies in repository (vendored in `/lib/`)
2. No CDN reliance for critical functionality
3. Works offline on air-gapped machines
4. No npm install, no build, no server setup required
5. GitHub Pages deployment is automatic (just push)

**When adding dependencies:**
- [ ] Download library files to `/lib/`
- [ ] Update imports to use local path
- [ ] Test offline (DevTools → Offline mode)
- [ ] Document what was added and why
- [ ] Commit library files to repo

---

## Repository Structure

```
/
├── index.html              # Main app entry point
├── js/                     # Application JavaScript
│   ├── app.js             # Main application controller
│   ├── core/              # Core systems (effect-manager, renderer, scene, state)
│   ├── effects/           # Effect implementations
│   ├── ui/                # UI components
│   └── utils/             # Utility functions
├── styles/                # CSS stylesheets
├── lib/                   # Third-party libraries (vendored)
├── reference/             # Original Codrops tutorial (DO NOT MODIFY)
├── CLAUDE.md              # This file - project context
├── PLUGIN_SPEC.md         # Effect plugin specification
├── DETAILED_PITFALLS.md   # Comprehensive pitfalls reference
└── CHANGELOG.md           # Version history
```

---

## Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| UI Framework | Vanilla JS ES6 Modules | No build step, standards-based |
| 3D Engine | THREE.js (r115) | Industry standard WebGL |
| Text Rendering | Canvas 2D → WebGL Texture | High-quality, flexible |
| Design System | Open Props | CSS design tokens |
| Color Picker | Coloris | Modern, eyedropper support |
| Offline | Service Worker | True offline capability |
| State | LocalStorage | Persistent settings & presets |

---

## Architecture Overview

### Effect System

**Plugin-based architecture:**

1. **EffectBase** (`js/effects/effect-base.js`) - Base class
2. **Effect Implementations** (`js/effects/*.js`) - Individual effects
3. **EffectManager** (`js/core/effect-manager.js`) - Loads and switches effects
4. **Settings Schema** - Each effect defines its own settings

**See PLUGIN_SPEC.md for complete effect development documentation.**

### State Management

- **AppSettings** - Global app settings
- **Effect State** - Each effect manages its own settings
- **PresetManager** - Save/load presets
- **Storage** - LocalStorage abstraction

### Rendering Pipeline

1. **Scene Setup** - Initialize THREE.js scene
2. **Renderer** - WebGL renderer with animation loop
3. **Text Texture** - Generate text on canvas
4. **Effect Shader** - Map texture to 3D geometry
5. **Camera Controls** - OrbitControls for interaction

---

# SECTION 3: DEVELOPMENT WORKFLOWS

## 🎨 Effect Development

### Required Reading (in order):

1. **PLUGIN_SPEC.md** ⭐ - READ THIS FIRST
   - Complete effect development guide
   - Effect API (EffectBase methods & properties)
   - Settings schema system
   - Export configuration (REQUIRED for video export)
   - Complete examples

2. **js/effects/endless.js** - Reference implementation
   - Production-ready example
   - Perfect loop calculation

3. **docs/VIDEO_EXPORT_SPEC.md** - Export system deep-dive (optional)

### Effect Development Checklist

**Required (Basic Effect):**
- ✅ `static get metadata()` - ID, name, icon, description
- ✅ `getSettingsSchema()` - Define parameters
- ✅ `init(scene, camera, renderer)` - Create Three.js scene
- ✅ `update(deltaTime, elapsedTime)` - Animation loop
- ✅ `onSettingChanged(key, value)` - Reactive updates
- ✅ `destroy()` - Cleanup resources

**Required (Video Export Support):**
- ✅ `static get exportDefaults()` - Export behavior (type: 'loop'|'oneshot')
- ✅ `calculateExportSuggestion()` - Smart duration based on CURRENT settings
- ⚠️ `reset()` - Optional, reset to t=0 for export

**Optional (Advanced):**
- `resize(width, height)` - Handle window resize
- `isComplete()` - For oneshot effects
- `getVisualCenter()` - Custom camera pivot

---

## 🎬 Video Export System

**Status:** ✅ Fully implemented
**Format:** MP4 (H.264), PowerPoint compatible
**Resolution:** 1920×1080
**Frame Rates:** 30fps, 60fps
**Export Type:** Frame-perfect offline rendering

### Overview

Uses **canvas-record** library with **MP4WasmEncoder**:
- ✅ Faster than realtime (30-40× speed)
- ✅ Perfect loops (calculated from effect settings)
- ✅ Deterministic animation
- ✅ No external dependencies (WASM embedded)

**See docs/VIDEO_EXPORT_SPEC.md for complete technical details.**

### Critical Learnings (Top 7)

1. **Use MP4WasmEncoder, NOT WebCodecsEncoder**
   - Explicitly create `Encoders.MP4WasmEncoder({ extension: 'mp4' })`

2. **Pass WebGL Context, NOT Canvas**
   - `const gl = renderer.context;` (property, not method)
   - `new Recorder(gl, {...})` not `new Recorder(canvas, {...})`

3. **Use Three.js `.context` Property**
   - Three.js r115 has `.context` property, not `.getContext()` method

4. **Provide encoderOptions.bitrateMode**
   - Required: `bitrateMode: 'variable'` in encoderOptions

5. **Calculate Bitrate Manually**
   - Don't rely on estimateBitRate() - calculate explicitly

6. **Use start({ initOnly: true })**
   - Prevents double-encoding first frame

7. **Use Deterministic Timing**
   - `const time = frame / fps;` - exact time
   - Use `elapsedTime` for position, not accumulated `deltaTime`

---

## 🔄 Git & Deployment Workflow

### Git Branch Strategy

- `main` - Production branch (GitHub Pages deploys from here)
- `claude/*` - Feature branches (must end with session ID)
- Merge to `main` when feature complete and tested

### Commit Message Format

```
<type>: <short description>

<optional detailed explanation>

Changes:
- file1.js - what changed
```

**Types:** `feat`, `fix`, `refactor`, `docs`, `style`, `perf`, `chore`

### Deploying to GitHub Pages

**Step-by-step:**

1. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push -u origin claude/your-branch-name-[session-id]
   ```

2. **🚨 TELL USER to update GitHub Pages:**
   ```
   Go to: https://github.com/karstenhoffmann/floss/settings/pages

   Settings:
   - Source: "Deploy from a branch"
   - Branch: [your current working branch] ← SELECT CORRECT BRANCH!
   - Folder: "/ (root)"
   - Click "Save"
   ```

3. **Wait for deployment:**
   - GitHub Actions deploys automatically
   - Wait ~1-2 minutes
   - Check: https://github.com/karstenhoffmann/floss/actions

4. **🚨 REMIND USER to test:**
   ```
   Test at: https://karstenhoffmann.github.io/floss/

   Verify correct branch:
   - Check GitHub Pages settings
   - Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   ```

5. **Service Worker Cache:**
   - Bump `CACHE_VERSION` in `service-worker.js` for breaking changes
   - Forces clients to re-download assets

**Common Issues:**
- ❌ Testing wrong branch → Check GitHub Pages settings
- ❌ Seeing old code → Wait longer or hard refresh
- ❌ 404 errors → Verify folder is `/ (root)` not `/app`

---

## 🛠️ Common Tasks

### Adding a New Effect

1. Create `js/effects/my-effect.js` extending `EffectBase`
2. Implement required methods (see PLUGIN_SPEC.md)
3. Import in `js/core/effect-manager.js`
4. Add to effect registry
5. Test, then push

### Modifying UI

- **Styles**: Edit `styles/*.css`
- **Icons**: Add to `js/ui/icons.js`
- **Notifications**: Use `showNotification()`
- **Controls**: Auto-generated from settings schema

---

# SECTION 4: KNOWN ISSUES & TROUBLESHOOTING

## ⚠️ Common Pitfalls (Critical Only)

**This section contains only the top critical pitfalls. For comprehensive details, see DETAILED_PITFALLS.md**

### Effect Development (Top 5)

1. **Forgetting Export Configuration**
   - Always implement `exportDefaults()` and `calculateExportSuggestion()`
   - Video export won't work without these

2. **Static Export Duration**
   - Calculate duration dynamically based on CURRENT settings
   - Don't hardcode duration values

3. **Not Disposing Three.js Resources**
   - Always dispose geometry, material, textures in `destroy()`
   - Memory leak after 10+ effect switches

4. **Using deltaTime for Position**
   - Use `elapsedTime` for deterministic position
   - Using deltaTime accumulates errors, breaks perfect loops

5. **Settings Without Group Property**
   - Always specify `group: 'effect'` in settings schema
   - UI can't organize settings without it

### Deployment (Top 2)

6. **Testing Wrong Branch**
   - User tests old code if GitHub Pages deploys from wrong branch
   - #1 wasted-time issue - always remind user to update settings

7. **Branch Name Missing Session ID**
   - Push fails with 403 if branch doesn't end with session ID
   - Format: `claude/feature-name-[SESSION_ID]`

**For detailed examples and more pitfalls, see DETAILED_PITFALLS.md**

---

## 🐛 Known Issues

### 1. Service Worker Caching
**Problem:** Changes not visible after deployment
**Solution:** Bump `CACHE_VERSION` in `service-worker.js`

### 2. LocalStorage Quota
**Problem:** Presets fail to save
**Solution:** Limit preset count or compress data

### 3. THREE.js Version
**Problem:** Compatibility issues
**Solution:** Use THREE.js r115 syntax
**Note:** OrbitControls is from r115 examples

### 4. Cross-Origin Issues
**Problem:** Canvas tainted by cross-origin images
**Solution:** Use data URLs or same-origin images

---

## 🔍 Troubleshooting

### App Not Loading
1. Check Console for JavaScript errors
2. Verify Network tab for 404s or failed CDN requests
3. Check Service Worker registration
4. Clear browser cache
5. Verify correct URL (not `/app/` subdirectory)

### Effect Not Rendering
1. Check WebGL availability
2. Verify THREE.js version compatibility
3. Check shader syntax (GLSL errors)
4. Verify geometry/material/mesh creation
5. Check scene.add() was called

### Settings Not Saving
1. Check LocalStorage quota
2. Verify JSON serialization works
3. Check Console errors
4. Try clearing LocalStorage

### GitHub Pages Not Updating
1. Verify pushed to correct branch
2. Wait 1-2 minutes for deployment
3. Hard refresh browser
4. Bump Service Worker cache version
5. Check GitHub Actions status

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Effect loads without errors
- [ ] Settings panel populates correctly
- [ ] All settings controls work
- [ ] Presets save and load
- [ ] Effect switches cleanly (no memory leaks)
- [ ] Performance acceptable (check FPS)
- [ ] Works offline (Service Worker)

### Browser Compatibility

**Primary Target:** Desktop Chrome (latest)
**Secondary:** Desktop Firefox, Safari
**Mobile:** Not optimized (desktop workflow)

---

# SECTION 5: FUTURE WORK & PLANNED FEATURES

## Roadmap

See CHANGELOG.md and GitHub Issues for detailed roadmap.

**Priority features:**
- [ ] More effect implementations (smoke, particles, etc.)
- [ ] Timeline-based animation sequencing
- [ ] Custom font upload
- [ ] Collaborative presets (cloud sync)
- [ ] Keyboard shortcuts customization

**Low priority (UX polish):**
- [ ] index-iife.html visual polish (TorusKnot geometry, shader-based text)
- [ ] Coloris color picker replacement (evaluate Pickr, vanilla-picker, iro.js)

---

## 🔐 App Shell & Auth Gate (Planned)

**Status:** Planned architecture for future implementation (current version see CURRENT_STATUS.md)

**Context:** Floss will eventually have a unified loading screen with optional password gate for online deployment.

### Responsibilities

**App Shell is responsible for:**
- Preloader animation
- Environment detection (file:// vs https://)
- Password gate UI (online mode only)
- Explicit call to `FlossApp.start({ mode: 'offline' | 'online' })`

**Floss App is responsible for:**
- Main application logic (effects, export, UI)
- Remaining mode-agnostic (no auth logic)
- Starting ONLY when shell calls start()

### Critical Rules for Claude

**When implementing App Shell / Password Gate:**

1. **No False Security Claims**
   - ❌ NEVER claim password gate provides "secure authentication"
   - ✅ ALWAYS clarify: "UX/access gate for casual users only"
   - ✅ ALWAYS mention: "Client-side, can be bypassed by technical users"

2. **Separation of Concerns**
   - Keep all password/gate logic in App Shell
   - Use clean API: `FlossApp.start(config)`
   - App works identically regardless of how it was started

3. **Documentation Requirements**
   - Document limitations in user-facing docs
   - Explain when password gate is appropriate (demos, portfolios)
   - Explain when NOT appropriate (confidential projects)

4. **Forbidden Assumptions**
   - ❌ Don't claim password gate provides "security"
   - ❌ Don't suggest storing sensitive data behind gate
   - ❌ Don't add server-side components (defeats offline-first)
   - ❌ Don't make password gate mandatory for file:// mode

**Implementation Timeline:**
- Current Status: Not implemented
- When: After current phases complete, when user requests it
- Dependencies: Current stable version (see CURRENT_STATUS.md)

---

# SECTION 6: REFERENCE

## External Dependencies

### Vendoring Status

**Philosophy:** All dependencies vendored locally for offline-first portability. Complex ES modules bundled using Rollup.

**✅ Fully Vendored (Offline-Ready):**
- **Three.js r115** (646 KB) - `/lib/three/`
- **Open Props** (3 KB) - `/lib/open-props/`
- **Coloris** (22 KB) - `/lib/coloris/`
- **MP4 Export Dependencies** (2.8 MB) - `/lib/esm/bundles/`
  - canvas-context, canvas-screenshot, media-codecs, mediabunny, h264-mp4-encoder

**⏳ Still on CDN (Optional Features):**
- gifenc (GIF export - optional)
- @ffmpeg/ffmpeg (requires HTTPS, not available file://)

**Bundling Process:**
1. `npm install`
2. `npm run bundle:all`
3. Rollup creates single-file ES6 bundles

**Impact:**
- ✅ Basic app: **100% offline**
- ✅ MP4 export: **100% offline**
- ⏳ GIF export: Requires CDN first load, then cached

---

## Reference Directory (DO NOT MODIFY)

The `/reference/` directory contains the **original Codrops kinetic typography tutorial** that Floss was based on.

- **Read-only**: Keep for reference, do NOT modify
- **Old architecture**: Different structure (Type.js, options.js)
- **Learning resource**: Good examples of effect techniques

---

## Effect Development Guidelines

### Performance
- Target 60 FPS on modern desktop hardware
- Use BufferGeometry (not legacy Geometry)
- Minimize uniform updates in shaders
- Dispose resources properly

### Visual Quality
- Use OKLCH color space for better perceptual uniformity
- Implement smooth transitions
- Consider fog/depth for 3D effects

### Code Style
- Use ES6 modules
- Prefer `const` over `let`
- Descriptive variable names
- JSDoc comments for public methods
- Keep methods under 50 lines

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

**See CHANGELOG.md for detailed version history.**

**Current version:** See CURRENT_STATUS.md and js/version.js
**Architecture:** Post-restructure (app in root, reference isolated)
**Last Major Change:** Repository restructure (Nov 2024)

---

# QUICK REFERENCE

## Critical Reminders (Execute Every Session)

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
```

**3. Before User Tests:**
```
Checklist:
✅ Changes committed
✅ Changes pushed to correct branch (with session ID)
✅ User reminded to update GitHub Pages
✅ User reminded which URL to test
```

### Why This Matters

- User has **NO local file access** (Claude Code for Web)
- User can **ONLY test via GitHub Pages**
- Wrong branch = user tests **old code**
- #1 wasted-time issue if not handled properly
