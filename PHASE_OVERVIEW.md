# Floss - Phase Overview

**Project:** Offline MP4 Export Migration
**Current Version:** 5.5.0
**Status:** All phases complete (last major update: v5.5.0)

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

**Status:** Future work - not yet implemented (planned post-v5.5.0)

### Vision: Unified App with Dual-Mode Operation

**Goal:** One single app/bundle that works both offline (file://) and online (GitHub Pages) without code duplication.

### App Shell Concept

**Preloader / Loading Screen:**
- Brief Floss logo animation on app startup
- Same animation plays in both modes

**file:// Mode:**
- Preloader only (no password gate)
- App starts immediately after animation

**https:// Mode (GitHub Pages):**
- Preloader + Password Gate
- App starts only after successful password entry

### Technical Approach

**Central Entry Point:**
- Expose unified API: `window.FlossApp.start({ mode: 'offline' | 'online' })`
- App does NOT auto-initialize when bundle loads
- Requires explicit start() call from App Shell

**Shell Responsibilities:**
- Detect environment (file:// vs https://)
- Show preloader animation
- (Online only) Show password gate, validate input
- Call `FlossApp.start()` with appropriate mode

**Floss App Responsibilities:**
- Remain mode-agnostic
- No built-in auth/password logic
- Start only when explicitly invoked

### Security Considerations

**IMPORTANT: Password Gate is NOT a security measure**

- ⚠️ This is a **UX/Access Gate**, not authentication
- ⚠️ Client-side password check can be bypassed by technical users
- ⚠️ No server/backend = no real security
- ✅ Acceptable for: Deterring casual users, "private demo" scenarios
- ❌ NOT acceptable for: Protecting confidential data, security-critical access

**Design Principle:**
- Password gate is a convenience feature, not a security boundary
- Users must understand this limitation

### Implementation Status

- ❌ **Not yet implemented**
- 📋 **Planned as:** Phase 7 (tentative)
- 🔗 **References:** CURRENT_STATUS.md → "Potential Future Work" → "App Shell & Password Gate"
- 🔗 **Development Rules:** CLAUDE.md → "App Shell & Auth Gate - Rules"

### Dependencies

- Requires: v5.5.0+ (offline MP4 export complete)
- Blockers: None (can start anytime)
- Estimated Effort: 2-3 sessions
