# Current Status

**Current Version:** 5.5.0
**Last Major Milestone:** v5.5.0 - Offline MP4 Export Complete
**Status:** All 6 phases complete, merged to main

*Note: This file describes the project state on the main branch, independent of temporary feature branches.*

---

## Last Merged Work (v5.5.0)

### Completed: Phases 1-6 - MP4 Export Offline Implementation

**What was done:**
1. npm setup + Rollup configuration for bundling
2. Bundled 5 ES modules (2.8 MB total) into /lib/esm/bundles/
3. Updated Import Map to local bundles
4. Service Worker v5.5.0 caching
5. Fixed h264-mp4-encoder ES6 export issue
6. Documentation updates
7. Session Bootstrapping Policy added to CLAUDE.md

**Testing Results:**
- ✅ GitHub Pages (index.html): v5.5.0, no errors
- ✅ file:// (index-iife.html): v5.4.8, no errors

## Recent Main Branch Commits (v5.5.0 Milestone)

1. `c68e352` - feat: Bundle MP4 export dependencies with Rollup
2. `42743d3` - fix: Add ES6 default export to h264-mp4-encoder
3. `88b2a8b` - docs: Update documentation for v5.5.0
4. `ca7a360` - docs: Add Session Bootstrapping & File-Awareness Policy

## Architecture Decisions

### Rollup Hybrid Approach (Approved)
- **Decision:** Bundle 4 small modules, copy h264-mp4-encoder UMD
- **Why:** h264-mp4-encoder already has pre-built bundle with WASM
- **Impact:** 2.8 MB total, 100% offline MP4 export

### Skip FFmpeg (Documented)
- **Decision:** Don't bundle @ffmpeg/ffmpeg, @ffmpeg/util
- **Why:** Requires SharedArrayBuffer (HTTPS only, not file://)
- **Impact:** h264-mp4-encoder sufficient for MP4 export

## Known Issues
None

---

## 🎨 UX & Visual Polish – Current Known Issues

### 1. Coloris Color Picker UX Problems

**Severity:** LOW (functional but has edge-case bugs)
**Status:** Documented for future UX polish phase

**Symptoms:**
- Color picker sometimes closes immediately on first click
- Gradient selector occasionally non-responsive
- Hue/alpha sliders don't always register clicks
- Inconsistent behavior across sessions

**History:**
- v5.4.0-v5.4.6: Multiple fix attempts (event handlers, timing, delegation)
- Result: Improved but still has edge-case issues
- Decision: Move on for now, evaluate alternatives in future UX polish phase

**Workaround:** Multiple clicks usually work. Refresh page if picker becomes unresponsive.

**Future Action:** Evaluate alternative color picker libraries (see "UX Polish – Future Planned Tasks" below)

---

### 2. index-iife.html Visual Simplifications

**Severity:** N/A (intentional simplifications for PoC)
**Status:** Documented for future visual polish phase

**Current State:**
- Torus geometry (not TorusKnot) - simpler UV mapping
- MeshBasicMaterial (not MeshStandardMaterial) - no lighting
- Canvas texture text (not shader-based) - lower quality
- Single effect only

**Rationale:**
- index-iife.html is a Proof of Concept for file:// compatibility
- Core architecture takes priority over visual finesse
- Full visual effects are in index.html (ES6 modules version)

**Future Action:** See "UX Polish – Future Planned Tasks" below

---

## 🎨 UX Polish – Future Planned Tasks

**Phase: UX Polish (LOW PRIORITY)**

### Task Group 1: Color Picker Replacement

- [ ] Evaluate 3-4 alternative color picker libraries
  - Pickr, vanilla-picker, iro.js, native `<input type="color">`
- [ ] Create comparison table (size, features, UX, offline-compatibility)
- [ ] Test top 2 candidates in development branch
- [ ] Replace Coloris if better option found
- [ ] Vendor new library locally (maintain offline-first principle)
- [ ] Update all color input components across codebase

**Estimated Effort:** 2-3 sessions
**Blockers:** None (can start anytime after Phase 6)

---

### Task Group 2: index-iife.html Visual Polish

- [ ] Replace Torus with TorusKnot geometry
  - Match original Codrops demo visual quality
  - Improve UV mapping for complex geometry
- [ ] Implement shader-based text rendering
  - GPU-accelerated, higher quality
  - Better performance for large text
- [ ] Upgrade to advanced materials
  - MeshStandardMaterial with lighting
  - Reflections, post-processing effects
- [ ] Add multiple effects
  - Effect switcher UI component
  - 2-3 effect presets (Torus, TorusKnot, Sphere)
- [ ] Expand parameter controls
  - Color controls (background, text, fog)
  - Animation presets
  - More geometry parameters

**Estimated Effort:** 3-4 sessions
**Blockers:** None (can start anytime after Phase 6)

---

### Task Group 3: General UI/UX Improvements

- [ ] Slider controls audit
  - Consistent styling across all sliders
  - Touch-friendly hit targets
  - Value display improvements
- [ ] Text input enhancements
  - Better responsiveness
  - Character counter
  - Undo/redo support
- [ ] Keyboard shortcuts
  - Visibility (help overlay)
  - Customization support
- [ ] Tooltip system
  - Context-sensitive help for all settings
  - Keyboard shortcut hints
- [ ] Accessibility improvements
  - ARIA labels for screen readers
  - Keyboard navigation (tab order)
  - High contrast mode support

**Estimated Effort:** 2-3 sessions
**Blockers:** None (can start anytime after Phase 6)

---

**UX Polish Total Estimated Effort:** 7-10 sessions
**When to Start:** Optional future work - core functionality is complete

**References:**
- CLAUDE.md (lines 1727-1774) - "Future Enhancements" sections
- README-IIFE.md (lines 142-169) - "Known Limitations & Future Improvements"
- PLUGIN_SPEC.md - Effect development API (for visual polish implementation)

---

## Blockers
None

## Potential Future Work

These are optional enhancements, not required for core functionality:

1. **Add video export to index-iife.html** (requires IIFE build)
2. **Bundle gifenc** for offline GIF export (currently uses CDN)
3. **UX Polish** (see above) - color picker replacement, visual improvements
4. **App Shell & Password Gate** - Unified loading screen with optional password protection

---

### 4. App Shell & Password Gate (Future Enhancement)

**Goal:** Create a unified loading experience with optional password gate for online deployment.

**Requirements:**
- ✅ **One unified app** - Works in both file:// and https:// modes without code duplication
- ✅ **file:// mode:** Preloader animation only, no password
- ✅ **https:// mode:** Preloader + password gate, app starts after successful entry

**Architecture:**
- App Shell handles:
  - Environment detection (file:// vs https://)
  - Preloader animation (Floss logo)
  - Password gate UI (online only)
  - Explicit call to `FlossApp.start({ mode })`
- Floss App:
  - No built-in auth logic
  - Starts only when shell invokes start()
  - Mode-agnostic implementation

**Security Clarification:**
- ⚠️ Password gate is a **UX/access gate**, NOT a security measure
- No server/backend = no real authentication
- Client-side password can be bypassed by technical users
- Acceptable for: Private demos, deterring casual users
- NOT for: Protecting confidential data, security-critical access

**Planned Scope:**
- Define **Phase 7: App Shell & Loading/Password Screen** (placeholder)
- Implement preloader animation
- Implement password gate UI (online mode)
- Refactor app initialization to use explicit start() API
- Test both modes (file:// and https://)

**Estimated Effort:** 2-3 sessions
**Blockers:** None (can start after v5.5.0)
**Priority:** LOW (optional enhancement)

**References:**
- PHASE_OVERVIEW.md → "App Shell & Auth Gate (Planned Architecture)"
- CLAUDE.md → "App Shell & Auth Gate - Rules"
