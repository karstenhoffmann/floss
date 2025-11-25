# Changelog

All notable changes to Floss will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.9.6] - 2025-11-25

### Repository Audit & Cleanup

#### Removed
- `index-iife.html` - Obsolete after Phase 7.3 Single Entry Point
- `js/app-bundle-iife.js` - Replaced by Rollup-generated `floss-app.iife.js`
- `build-iife-bundle.sh` - Obsolete shell script (Rollup now used)
- `lib/canvas-record/index.js` - Empty placeholder file

#### Changed
- CLAUDE.md: Added "Single Entry Point Rule (Hard Invariant)"
- CLAUDE.md: Added "Hard Invariants (Audit-Derived Rules)" section
- CLAUDE.md: Updated App Shell & Password Gate status to "Implemented"
- service-worker.js: Synchronized CACHE_NAME with version.js
- service-worker.js: Added missing assets to cache list

#### Documentation
- PHASE_OVERVIEW.md: Updated to reflect Phase 7.3 complete
- CURRENT_STATUS.md: Updated version to 5.9.6
- CHANGELOG.md: Restructured with Pre-7.x Historical Summary

---

## Pre-7.x Historical Summary

**Versions 2.0.0 - 5.9.5** (November 2025)

Major milestones in chronological order:

| Phase | Version | Highlights |
|-------|---------|------------|
| Phase 2 | 2.x | Effect plugin architecture, EffectBase class |
| Phase 3 | 3.x | Settings schema system, reactive controls |
| Phase 4 | 4.x | Preset management, LocalStorage persistence |
| Phase 5 | 5.0-5.3 | Video export (MP4), canvas-record integration |
| Phase 6 | 5.4-5.6 | Additional effects (Wave Plane, Sphere Text, Particles) |
| Phase 7.1 | 5.7 | Vendored dependencies, offline-first completion |
| Phase 7.2 | 5.8 | Password gate, App Shell architecture |
| Phase 7.3 | 5.9 | Single Entry Point (index.html only) |

**Key architectural decisions made during this period:**
- Core/Shell separation (js/app.js vs js/floss-app.js)
- Dual-mode loading (file:// IIFE, https:// ESM)
- Rollup bundling for IIFE generation
- All dependencies vendored in /lib/

---

## [1.0.0] - 2025-11-18

### Added - Complete Rive-Inspired Redesign

#### UI/UX
- Ultra-dark theme with glassmorphism effects
- Rive-inspired floating UI panels
- Open Props design system with OKLCH color space
- Keyboard shortcuts (Space, Esc, 1-4)
- Effect selector dropdown

#### Architecture
- **Offline-first PWA** with Service Worker
- Sequential script loading system
- LocalStorage state persistence
- Copy & paste deployment (no build step)

---

## [0.1.0] - 2020 (Original Codrops Demo)

### Initial Release
- Basic kinetic typography demo
- Webpack-based build system
- Four effect configurations
- MSDF font rendering

**Note:** Original demo preserved in `/reference` directory

---

## Links

- [Repository](https://github.com/karstenhoffmann/floss)
- [Live Demo](https://karstenhoffmann.github.io/floss/)
- [Original Codrops Article](https://tympanus.net/codrops/)
