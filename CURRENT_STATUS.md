# Current Status

**Current Version:** 5.9.6
**Last Major Milestone:** v5.9.6 - Repository Audit & Cleanup
**Status:** Phase 7.3 complete ✅ (Single Entry Point achieved)

*Note: This file describes the project state on the main branch, independent of temporary feature branches.*

---

## Last Merged Work (v5.9.6)

### Completed: Repository Audit & Cleanup

**What was done:**
1. Removed obsolete files:
   - `index-iife.html` (redundant after Single Entry Point)
   - `js/app-bundle-iife.js` (replaced by Rollup bundle)
   - `build-iife-bundle.sh` (obsolete shell script)
   - `lib/canvas-record/index.js` (empty file)

2. Updated CLAUDE.md with:
   - Single Entry Point Rule (Hard Invariant)
   - Hard Invariants (Audit-Derived Rules)
   - Updated App Shell status to "Implemented"

3. Synchronized service-worker.js:
   - CACHE_NAME updated to v5.9.6
   - Added missing assets to cache list

4. Updated all documentation:
   - PHASE_OVERVIEW.md
   - CURRENT_STATUS.md
   - CHANGELOG.md

---

## Architecture Summary

### Entry Point (Single Entry Policy)

| Entry Point | Status | Description |
|-------------|--------|-------------|
| `index.html` | ✅ **ONLY** | Single entry for file:// and https:// |

**Note:** No other HTML entry points exist. This is enforced by CLAUDE.md rules.

### Core/Shell Separation

| Component | Files | Responsibilities |
|-----------|-------|------------------|
| Core | `js/app.js`, `js/core/*`, `js/effects/*` | App logic, no globals, no startup |
| Shell | `index.html`, `js/floss-app.js` | Startup, environment, globals |
| IIFE Bundle | `js/floss-app.iife.js` | Bundled app for file:// mode |

### Protocol Handling

| Protocol | Loads | Features |
|----------|-------|----------|
| `file://` | IIFE bundle | Preloader, no password gate |
| `https://` | ES modules | Preloader + password gate |

---

## Key Version History

| Version | Phase | Description |
|---------|-------|-------------|
| 5.9.6 | 7.3+ | Repository Audit & Cleanup |
| 5.9.0 | 7.3 | Single HTML Entry (IIFE Bundle) |
| 5.8.0 | 7.2 | App Shell UI (Preloader + Password Gate) |
| 5.7.0 | 7.1 | FlossApp.start() API |
| 5.5.0 | - | MP4 Export Offline |

---

## Architecture Decisions

### Single Entry Point (v5.9.0)
- **Decision:** One HTML file only (`index.html`)
- **Why:** Eliminate code duplication, maintenance burden
- **Enforced by:** CLAUDE.md "Single Entry Point Rule (Hard Invariant)"

### Core/Shell Separation (v5.7.0)
- **Decision:** Strict separation between Core and Shell
- **Why:** Enables App Shell without touching core logic
- **Reference:** CLAUDE.md → "Architecture Integrity Rule"

### Rollup Hybrid Approach
- **Decision:** Bundle app modules, external globals for THREE.js
- **Impact:** Single IIFE bundle (704KB) for file:// mode

---

## Known Issues

### Coloris Color Picker UX

**Severity:** LOW (functional but has edge-case bugs)

**Symptoms:**
- Color picker sometimes closes immediately on first click
- Gradient selector occasionally non-responsive

**Workaround:** Multiple clicks usually work.

**Future Action:** Evaluate alternative color picker libraries.

---

## Potential Future Work

1. **Bundle gifenc** for offline GIF export
2. **Color picker replacement** (evaluate Pickr, vanilla-picker, iro.js)
3. **Additional effects** (more kinetic typography variations)
4. **Custom font upload** support

---

## Blockers

None
