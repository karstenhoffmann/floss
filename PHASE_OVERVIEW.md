# Floss - Phase Overview

**Project:** Floss App Shell & Unification
**Current Version:** 5.8.0
**Status:** Phase 7.2 complete, Phase 7.3 ready to start

*Note: This file describes the project state on the main branch, independent of temporary feature branches.*

## Phases

### ✅ Phase 1: Setup (Complete)
- npm package management initialized
- Rollup + plugins installed
- 5 target packages installed

### ✅ Phase 2: Bundling (Complete)
- 4 modules bundled with Rollup
- h264-mp4-encoder UMD bundle + ES6 wrapper
- Total: 2.8 MB in /lib/esm/bundles/

### ✅ Phase 3: Import Map Update (Complete)
- index.html points to local bundles
- gifenc, @ffmpeg remain on CDN (optional)

### ✅ Phase 4: Service Worker Update (Complete)
- Cache version v5.5.0
- All 5 bundles cached

### ✅ Phase 5: Testing (Complete)
- GitHub Pages: v5.5.0, no errors
- file://: v5.4.8, no errors

### ✅ Phase 6: Documentation (Complete)
- CLAUDE.md: Vendoring status updated
- README.md: Build instructions added

## Overall Status
✅ All phases complete! MP4 export is 100% offline-capable.
✅ Merged to main in v5.5.0

## Potential Future Work
These are optional enhancements, not required for core functionality:
- Add video export to index-iife.html (requires IIFE build)
- Optional: Bundle gifenc for offline GIF export

---

## 🎨 UX & Visual Polish – Current Known Issues

### Coloris Color Picker UX Problems (Priority: LOW)

**Status:** Functional but has edge-case UX bugs

**Known Issues:**
- Picker sometimes disappears immediately on first mousedown
- Gradient selector occasionally non-responsive
- Hue/alpha sliders sometimes don't register clicks
- Inconsistent behavior across different sessions

**Attempted Fixes (v5.4.0-v5.4.6):**
- Custom event handlers
- stopPropagation strategies
- Event delegation
- Timing fixes

**Result:** Functional but still buggy - documented for future sessions

**Decision:** Don't spend more debugging time now. Evaluate alternatives in future UX polish phase.

---

### index-iife.html Visual Limitations (Priority: LOW)

**Status:** Intentional simplifications for PoC - visual finesse comes later

**Current Intentional Simplifications:**
- Uses simple **Torus geometry** (not TorusKnot) for better text UV mapping
- Basic **MeshBasicMaterial** (no lighting, no shaders)
- Text rendered as **canvas texture** (not shader-based)
- Single effect only (no effect switching)

**Why:** Proof of Concept for file:// compatibility. Core architecture first, visuals later.

---

## 🎨 UX Polish – Future Planned Tasks

### Phase: UX Polish (Future - After Phase 6 Complete)

**Coloris Color Picker Replacement:**
- [ ] Evaluate alternative libraries:
  - Pickr (https://github.com/Simonwep/pickr) - Modern, well-maintained
  - vanilla-picker (https://github.com/Sphinxxxx/vanilla-picker) - Lightweight
  - iro.js (https://iro.js.org/) - HSV color picker with great UX
  - Custom implementation using native `<input type="color">` + enhancement layer
- [ ] Test alternatives for stability and UX
- [ ] Replace Coloris if better option found
- [ ] Ensure vendoring + offline-first compatibility
- [ ] Update all color input components consistently

**index-iife.html Visual Polish:**
- [ ] Replace Torus with TorusKnot geometry (like original Codrops)
- [ ] Shader-based text rendering (better quality, GPU-accelerated)
- [ ] Advanced materials (lighting, reflections, post-processing)
- [ ] Multiple effects (effect switcher UI)
- [ ] More parameters (color controls, animation presets)
- [ ] Better UV mapping (custom UV unwrapping for complex geometries)

**UI/UX Improvements (General):**
- [ ] Review slider controls for consistency
- [ ] Improve text input responsiveness
- [ ] Better keyboard shortcut visibility
- [ ] Tooltip system for settings
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

**Priority:** All items LOW - Only after core architecture (Phases 1-6) is complete and tested

**References:**
- CLAUDE.md → "Future Enhancements" → "index-iife.html Visual Polish"
- CLAUDE.md → "Future Enhancements" → "Coloris Color Picker UX Issues"
- README-IIFE.md → "Known Limitations & Future Improvements"

---

## 🔐 App Shell & Auth Gate (Planned Architecture)

**Status:** Phase 7.1 Complete ✅ | Phase 7.2+ Planned

### Phase 7.1: FlossApp Start API (Complete ✅)

**Implemented in:** v5.7.0
**Goal:** Minimal-invasive API extraction - unified start API without behavior changes

**What was implemented:**
- ✅ `window.FlossApp.start({ mode: 'online' | 'offline' })` API
- ✅ Core/Shell separation enforced:
  - Core (js/app.js): No window globals, no startup decisions, clean export
  - Shell (js/floss-app.js, index-iife.html): Startup, environment, globals
- ✅ js/app.js: Auto-init removed, exports App class
- ✅ js/floss-app.js: NEW shell entry point for ES modules
- ✅ index.html: Loads js/floss-app.js, calls `FlossApp.start({ mode: 'online' })`
- ✅ index-iife.html: Wraps code in initializeApp(), calls `FlossApp.start({ mode: 'offline' })`
- ✅ Behavior unchanged: Both variants auto-start as before

**Files Changed:**
- js/app.js (modified)
- js/floss-app.js (NEW)
- index.html (modified)
- index-iife.html (modified)

**Architecture Invariant Enforced:**
- Core files never define globals, never attach to window, never make startup decisions
- Shell files are the only place where environment handling, startup wiring, globals may live

---

### ✅ Phase 7.2: App Shell UI & Password Gate (Complete)

**Status:** Complete ✅
**Version:** v5.8.0
**Depends on:** Phase 7.1 (Complete ✅)

### What Was Implemented

**Preloader / Loading Screen:**
- Brief Floss logo animation on app startup (1.5s)
- Same animation plays in both modes
- CSS spinner animation

**file:// Mode:**
- Preloader only (no password gate)
- App starts immediately after animation

**https:// Mode (GitHub Pages):**
- Preloader + Password Gate
- App starts only after successful password entry

**Password Gate Features:**
- SHA-256 password hashing (client-side)
- Session tokens (5-minute timeout)
- Valid session skips password gate
- Error handling with visual feedback

### Security Considerations

**IMPORTANT: Password Gate is NOT a security measure**

- ⚠️ This is a **UX/Access Gate**, not authentication
- ⚠️ Client-side password check can be bypassed by technical users
- ⚠️ No server/backend = no real security
- ✅ Acceptable for: Deterring casual users, "private demo" scenarios
- ❌ NOT acceptable for: Protecting confidential data, security-critical access

### Files Created/Modified

- index.html (preloader + password gate)
- index-iife.html (preloader + password gate inline)
- styles/preloader.css (NEW)
- styles/password-gate.css (NEW)
- js/utils/password-gate.js (NEW)

---

### ✅ Phase 7.3: Full Unification – One HTML Entry (Complete)

**Status:** Complete ✅
**Version:** v5.9.0
**Depends on:** Phase 7.2 (Complete ✅)

### Architecture Goal: Single Entry Policy

**CRITICAL DECISION:** The project maintains exactly ONE long-term HTML entry point: `index.html`

```
┌─────────────────────────────────────────────────────────────────┐
│                      index.html (Single Entry)                   │
├─────────────────────────────────────────────────────────────────┤
│  Shell detects protocol:                                        │
│  • file:// → Load floss-app.iife.js (IIFE bundle)              │
│  • https:// → Load floss-app.js (ES modules)                   │
├─────────────────────────────────────────────────────────────────┤
│  Same features in both modes:                                   │
│  • Full app (5 effects, presets, export)                       │
│  • Preloader animation                                         │
│  • Password gate (https:// only)                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               index-iife.html (DEPRECATED)                       │
├─────────────────────────────────────────────────────────────────┤
│  Minimal stub with redirect to index.html                       │
│  Will be removed in future phase                                │
└─────────────────────────────────────────────────────────────────┘
```

### Why Single Entry?

| Problem with Multiple Entries | Solution |
|------------------------------|----------|
| Code duplication | One codebase, one bundle |
| Features drift between versions | Same app everywhere |
| Bug fixes in multiple places | Fix once, works everywhere |
| Confusing for developers | Clear entry point |

### Technical Implementation

**1. Rollup IIFE Bundle:**
- Input: `js/floss-app.js` (shell entry)
- Output: `js/floss-app.iife.js` (~200KB)
- External: THREE.js, Coloris (loaded as globals)
- Bundles: All core, effects, ui, utils modules

**2. index.html Dual-Mode Loading:**
```javascript
// Shell detects environment
if (location.protocol === 'file:') {
    // Load IIFE bundle for file:// compatibility
    loadScript('js/floss-app.iife.js');
} else {
    // Use ES modules for https://
    import('./js/floss-app.js');
}
```

**3. index-iife.html Deprecation:**
- Reduced to minimal redirect stub
- Auto-redirects to index.html after 3 seconds
- Contains deprecation notice

### Deliverables

| File | Action | Description |
|------|--------|-------------|
| `rollup.config.app.js` | NEW | Rollup config for app bundle |
| `js/floss-app.iife.js` | NEW | Generated IIFE bundle |
| `index.html` | MODIFY | Add dual-mode loading |
| `index-iife.html` | REPLACE | Deprecated redirect stub |
| `package.json` | MODIFY | Add `bundle:app` script |
| Documentation | UPDATE | All status files |

### Decommission Plan for index-iife.html

**Phase 7.3 (Current):** Convert to redirect stub
**Phase 7.4+ (Future):** Remove file entirely, update all references

### Dependencies

- Requires: v5.8.0+ (Phase 7.2 complete)
- Blockers: None
- Estimated Effort: 1 session

### References

- CLAUDE.md → "Single Entry Policy (Phase 7.3+)"
- CLAUDE.md → "Architecture Integrity Rule"
