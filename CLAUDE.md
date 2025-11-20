# Claude Code Session Context

**Last Updated:** 2025-11-20
**Project:** Floss - Professional Kinetic Typography Tool
**Repository:** https://github.com/karstenhoffmann/floss
**Working Directory:** `/app/` (⚠️ IMPORTANT: The actual app is in the `app/` subdirectory!)
**Current Branch:** `claude/kinetic-typography-analysis-01Hpzj9zDGZXR4Dpt1GwKCYq`
**Last Working Commit:** `20c13a7` (Smoke dissolve effect fully functional)

---

## 🚨 CRITICAL INFO FOR NEW SESSIONS

### Repository Structure
```
/home/user/floss/
├── app/                    ← ⚠️ THE ACTUAL FLOSS APP IS HERE!
│   ├── index.html         ← Main entry point
│   ├── js/                ← All JavaScript
│   ├── css/               ← Styles
│   └── assets/            ← Fonts, images
│
├── archive/               ← Old Codrops tutorial (ignore)
├── CLAUDE.md             ← This file
└── sw.js                 ← Service Worker (in root for GitHub Pages)
```

**⚠️ Always work in `/home/user/floss/app/` directory!**

### Current Status (2025-11-20)

**✅ What Works:**
- ✓ Smoke Dissolve Particle Effect (fully functional!)
- ✓ Progressive wave dissolve (left→right, right→left, center→out)
- ✓ Particles rise as smoke with swirl/vortex
- ✓ Glitter sparkles on solid particles
- ✓ Camera controls (pan, rotate, zoom) working correctly
- ✓ Settings panel with all dissolve parameters

**🔧 What Was Just Fixed:**
- Animation timing bug (was 1000x too slow)
- Camera vertical pan (screenSpacePanning enabled)
- Service Worker caching (v9-timing-fix-final)

**📝 Known Issues:**
- None currently! Effect is working as designed.

**🎯 Next Steps / TODO:**
1. Clean up debug console.log statements
2. Consider adding "Typography Roller" effect (mentioned by user)
3. Repository cleanup (see "Repository Cleanup Plan" below)

---

## Quick Start for New Sessions

### Project Purpose
Floss is a professional kinetic typography tool for motion designers, featuring:
- Rive-inspired ultra-modern UI with glassmorphism
- WebGL-based kinetic text effects (THREE.js)
- Offline-first PWA architecture
- No build step required (copy & paste deployment)

### Key Design Decisions

**Target Users:** Professional motion designers
**Primary Platform:** Desktop Chrome (optimized for desktop workflow)
**Deployment:** GitHub Pages at https://karstenhoffmann.github.io/floss/
**Philosophy:** Offline-first, no build tools, pure copy & paste deployment

---

## Architecture Overview

### Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| UI Framework | Vanilla JS + Open Props | No build step, standards-based |
| 3D Engine | THREE.js (r158) | Industry standard WebGL |
| Font Rendering | MSDF fonts via three-bmfont-text | High-quality text rendering |
| Animation | GSAP 3.12 | Professional animation timeline |
| Design System | Open Props | CSS design tokens |
| Icons | Phosphor Icons (inline SVG sprite) | Offline-first, no external deps |
| Offline | Service Worker (v3-offline-first) | True offline capability |

### Hybrid UMD+ESM Architecture

**Problem:** `load-bmfont` and `three-bmfont-text` have no native ESM builds.

**Solution:** 3-layer architecture
1. Load UMD scripts globally via `<script>` tags
2. Local ESM wrappers in `/js/vendor/` export `window` globals
3. Import Map points to local wrappers
4. Service Worker caches everything

**Critical:** Scripts must load sequentially! See `index.html:232-275` for dynamic loader.

---

## File Structure

```
/
├── index.html              # Main app entry point
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline-first)
│
├── css/
│   ├── design-tokens.css   # Open Props customization
│   ├── base.css            # Global styles, typography
│   ├── components.css      # UI components (glassmorphism)
│   └── animations.css      # Spring-based micro-interactions
│
├── js/
│   ├── index.js            # App initialization
│   ├── ui.js               # UI state management, events
│   ├── options.js          # Effect configurations
│   ├── fonts.js            # Font loading utilities
│   │
│   ├── gl/
│   │   ├── index.js        # WebGL scene setup
│   │   ├── Type.js         # Typography mesh (MSDF rendering)
│   │   └── shaders.js      # Vertex/fragment shaders
│   │
│   └── vendor/
│       ├── load-bmfont.js       # ESM wrapper → window.loadBMFont
│       ├── three-bmfont-text.js # ESM wrapper → window.createGeometry
│       └── three.js             # (currently unused, THREE loaded via CDN)
│
├── assets/
│   └── fonts/              # MSDF font files (.fnt, .png)
│
└── archive/                # Old Codrops webpack demo
```

---

## Common Tasks

### Running Locally
```bash
# Simple HTTP server (root directory)
python3 -m http.server 8080
# → http://localhost:8080
```

### Deploying to GitHub Pages
1. Ensure changes are on `master` branch
2. GitHub Pages auto-deploys from `master` root
3. Wait ~1 minute for deployment
4. Clear browser cache if needed (Service Worker!)

### Testing Offline Functionality
1. Load app once (caches resources)
2. Dev Tools → Application → Service Workers → "Offline"
3. Refresh → App should still work

### Adding New Effect
1. Add shader configuration to `js/options.js`
2. Implement vertex/fragment shaders in `js/gl/shaders.js`
3. Add effect option to dropdown in `index.html`
4. Update effect selector in `js/ui.js`

---

## Known Issues & Gotchas

### 1. Script Loading Order is Critical
**Problem:** ESM modules start before UMD globals are ready
**Solution:** Use dynamic sequential loader in `index.html:232-275`
**Never:** Add `<script type="module" src="...">` directly in HTML for main scripts

### 2. Service Worker Caching
**Problem:** Changes not visible after deployment
**Solution:** Bump `CACHE_VERSION` in `sw.js` (e.g., `v3-offline-first` → `v4-...`)
**Debug:** Dev Tools → Application → Clear Storage

### 3. Import Map Limitations
**Problem:** Import Maps must be defined before any `<script type="module">`
**Solution:** Import Map is at `index.html:219-229`, before dynamic script loader

### 4. GitHub Pages Deployment
**Branch:** Must deploy from `master` (or configure Settings → Pages)
**Path:** Root directory only (no `/dist` or `/build`)
**Cache:** GitHub Pages CDN caches aggressively - wait ~1 min or hard refresh

---

## Development Workflow

### Git Branch Strategy
- `master` - Production (GitHub Pages deploys from here)
- `claude/*` - Feature branches for Claude Code sessions
- Merge to master via PR when ready

### Commit Message Format
```
<type>: <short description>

<optional detailed explanation>

Files changed:
- file1.js - what changed
- file2.css - what changed
```

Types: `feat`, `fix`, `refactor`, `docs`, `style`, `perf`

---

## Design System

### Color Palette (OKLCH)
```css
--floss-bg: oklch(10% 0.01 270);           /* Ultra-dark bg */
--floss-surface: oklch(14% 0.02 270);      /* Floating panels */
--floss-accent: oklch(60% 0.25 270);       /* Violet primary */
--floss-accent-blue: oklch(60% 0.2 240);   /* Blue secondary */
```

### Spacing Scale (Open Props)
Uses `var(--size-1)` through `var(--size-15)` from Open Props

### Typography
- **UI:** System font stack (`-apple-system, BlinkMacSystemFont, ...`)
- **Canvas:** Custom MSDF fonts (high-quality WebGL rendering)

---

## External Dependencies

### CDN Resources
```
GSAP: https://unpkg.com/gsap@3.12.4/dist/gsap.min.js
THREE.js: https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js
load-bmfont: https://cdn.jsdelivr.net/npm/load-bmfont@2.3.4/browser.js
three-bmfont-text: https://cdn.jsdelivr.net/npm/three-bmfont-text@3.0.1/dist/three-bmfont-text.js
Open Props: https://unpkg.com/open-props@1.7.3/
```

All cached by Service Worker for offline use.

---

## Troubleshooting

### App stuck on "Loading kinetic magic..."
1. Check Network tab for 404s or failed CDN requests
2. Check Console for `loadFont is not a function` errors
3. Verify all UMD scripts loaded before ESM modules
4. Check Import Map syntax (must be valid JSON)

### WebGL not rendering
1. Check `js/gl/Type.js` - font loading callback
2. Verify MSDF font files in `/assets/fonts/`
3. Check THREE.js version compatibility
4. Test in Chrome DevTools → Console for WebGL errors

### UI not responding
1. Check `js/ui.js` - event listeners attached?
2. Verify localStorage not full (quota exceeded)
3. Check browser console for JS errors

---

## Future Enhancements (Roadmap)

- [ ] Export video/GIF functionality
- [ ] Custom font upload
- [ ] Timeline-based animation sequencing
- [ ] Preset library with import/export
- [ ] Responsive mobile layout
- [ ] Keyboard shortcut customization
- [ ] Multi-text layer support

---

## 🔄 Session Continuity Workflow

### For Claude Code for Web Sessions

**What Claude Reads Automatically:**
1. ✓ `CLAUDE.md` (this file) - Read first!
2. ✓ `README.md` - Project overview
3. ✓ `.claude/` directory - Hooks and custom commands (if exists)
4. ✓ Git status - Current branch, recent commits

**Before Ending a Session:**
1. ✅ Update `CLAUDE.md` with:
   - Current date
   - Last working commit hash
   - What was completed
   - Known issues
   - Next steps
2. ✅ Commit all changes with descriptive messages
3. ✅ Push to current branch
4. ⚠️ If work is stable: Merge to `main` (see below)

**Starting a New Session:**
1. Claude automatically reads `CLAUDE.md`
2. Claude sees: Current branch, working directory, last commit
3. Continue work seamlessly!

**📌 Branch Strategy:**
- `claude/*` branches are **temporary** (session-specific)
- Merge to `main` when feature is complete and working
- Delete `claude/*` branch after merge

---

## 🧹 Repository Cleanup Plan

### Current Problem
- ❌ App is in `app/` subdirectory (confusing)
- ❌ Old tutorial files in root (from Codrops demo)
- ❌ Changes are on temporary `claude/*` branch

### Cleanup Steps (Priority Order)

**Phase 1: Merge Current Work (DO THIS SOON!)**
```bash
# 1. Ensure current branch is working
cd /home/user/floss
git checkout claude/kinetic-typography-analysis-01Hpzj9zDGZXR4Dpt1GwKCYq

# 2. Remove debug logs (clean code)
# Edit app/js/effects/particles.js - remove console.log('>>> update()...')

# 3. Commit cleanup
git add -A
git commit -m "chore: Remove debug console logs"
git push

# 4. Merge to main
git checkout main
git pull origin main
git merge claude/kinetic-typography-analysis-01Hpzj9zDGZXR4Dpt1GwKCYq
git push origin main

# 5. Delete temporary branch (optional)
git branch -d claude/kinetic-typography-analysis-01Hpzj9zDGZXR4Dpt1GwKCYq
git push origin --delete claude/kinetic-typography-analysis-01Hpzj9zDGZXR4Dpt1GwKCYq
```

**Phase 2: Restructure Repository (Future)**
```bash
# Option A: Keep app/ structure (document it clearly)
# - Update CLAUDE.md with clear "Working Directory: app/" note ✓ DONE
# - Add README.md in root pointing to app/
# - Keep old files in archive/

# Option B: Move app to root (cleaner but more work)
# - Move all files from app/ to root
# - Update all paths in index.html, sw.js, etc.
# - Delete old tutorial files
# - Update GitHub Pages deployment
```

**Recommendation:** Stick with **Option A** for now (app/ subdirectory is documented).

**Phase 3: Documentation (Ongoing)**
- [ ] Add README.md in root: "See app/ for Floss app"
- [ ] Update CLAUDE.md before each session end
- [ ] Keep commit messages clear and descriptive

---

## 📝 Template: End-of-Session Update

```markdown
**Last Updated:** YYYY-MM-DD
**Current Branch:** branch-name
**Last Working Commit:** commit-hash (description)

**✅ Completed This Session:**
- Item 1
- Item 2

**🐛 Known Issues:**
- Issue 1
- Issue 2

**🎯 Next Steps:**
1. Next task
2. Next task
```

---

## Contact & Contribution

**Owner:** Karsten Hoffmann
**Original Demo:** [Codrops Kinetic Typography](https://tympanus.net/codrops/)
**License:** See LICENSE file

For Claude Code sessions: Read this file first to understand project context.
