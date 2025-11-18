# Changelog

All notable changes to Floss will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Video/GIF export functionality
- Custom text input
- Timeline-based animation sequencing
- Touch gesture controls for mobile

---

## [1.0.0] - 2025-11-18

### Added - Complete Rive-Inspired Redesign

#### UI/UX
- Ultra-dark theme with glassmorphism effects
- Rive-inspired floating UI panels (topbar, toolbar, playback controls)
- Open Props design system with OKLCH color space
- Inline SVG sprite system with Phosphor Icons
- Auto-hide UI functionality
- Keyboard shortcuts (Space, Esc, 1-4)
- Effect selector dropdown with 4 kinetic effects
- Playback speed control slider
- Settings panel with quality/performance toggles

#### Architecture
- **Offline-first PWA** with Service Worker
- **Hybrid UMD+ESM architecture** for legacy libraries
- Sequential script loading system (fixes timing issues)
- Import Maps for clean module resolution
- LocalStorage state persistence
- Copy & paste deployment (no build step)

#### Technical Stack
- THREE.js 0.158.0 for WebGL rendering
- GSAP 3.12.4 for animations
- Open Props 1.7.3 for design tokens
- MSDF font rendering via three-bmfont-text
- Native ES Modules throughout

#### Developer Experience
- Comprehensive `CLAUDE.md` documentation
- `.clauderc` session configuration
- Updated `README.md` with new branding
- `CHANGELOG.md` for version tracking
- Clean separation of old demo (moved to `/archive`)

### Changed
- Project renamed from "TT K1n3t1c" to "Floss"
- Repository renamed from `codrops-kinetic-typo` to `floss`
- Complete file structure reorganization
- CSS split into modular files (tokens, base, components, animations)
- Vendor dependencies now use local ESM wrappers

### Fixed
- Script loading race condition (ESM before UMD globals)
- GitHub Pages deployment path issues
- Service Worker scope configuration
- Import Map compatibility with legacy libraries
- ORB (Cross-Origin Read Blocking) errors

### Removed
- Webpack build system (moved to `/archive`)
- npm dependencies (moved to `/archive`)
- Emoji icons (replaced with Phosphor Icons SVG)
- Build-step requirement

---

## [0.1.0] - 2020-XX-XX (Original Codrops Demo)

### Initial Release
- Basic kinetic typography demo
- Webpack-based build system
- Four effect configurations
- MSDF font rendering
- Original Codrops tutorial implementation

**Note:** Original demo preserved in `/archive` directory

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| **1.0.0** | 2025-11-18 | Complete Rive-inspired redesign, offline-first PWA |
| 0.1.0 | 2020 | Original Codrops tutorial demo |

---

## Migration Notes

### Upgrading from 0.1.0 to 1.0.0

**Breaking Changes:**
- No webpack - pure ES Modules now
- No npm install required
- Different file structure
- New UI system

**Migration Path:**
1. The old demo is preserved in `/archive` if you need it
2. New version is standalone - just serve the root directory
3. No build step required anymore

---

## Links

- [Repository](https://github.com/karstenhoffmann/floss)
- [Live Demo](https://karstenhoffmann.github.io/floss/)
- [Original Codrops Article](https://tympanus.net/codrops/)
