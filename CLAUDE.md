# Claude Code Session Context

**Last Updated:** 2025-11-18
**Project:** Floss - Professional Kinetic Typography Tool
**Repository:** https://github.com/karstenhoffmann/floss

---

## ⚠️ Development Environment

**IMPORTANT:** This project uses **Claude Code Web** (not CLI version).

### Key Implications:
- ✅ Claude has full git/terminal access via Bash tool
- ❌ User has NO direct file access (files must be shared/explained)
- ❌ User has NO CLI access (all commands run by Claude)
- 🔄 All git operations (merge, push, branch) must be done by Claude
- 📱 Testing happens via GitHub Pages (live deployment)

### Testing Workflow (Branch-Based Development):

**Important:** Claude Code Web can only push to `claude/*` branches, NOT to `master` (HTTP 403).

**Development & Testing Flow:**
1. **Develop** on current `claude/*` branch (e.g., `claude/feature-xyz`)
2. **Claude commits + pushes** changes to that branch
3. **GitHub Pages Preview:** User configures GitHub Pages to deploy from branch
   - Settings → Pages → Source: Deploy from a branch
   - Select: `claude/feature-xyz` (or current branch)
   - Wait ~1-2 min for deployment
4. **User tests** preview at: `https://karstenhoffmann.github.io/floss/`
5. **Iterate** until feature works perfectly
6. **User creates PR** on GitHub: `claude/feature-xyz` → `master`
7. **User merges PR** → Production deployment to same URL

**Golden Rule:** Always explain what files changed and what the user should expect to see when testing!

**Pro Tip:** Keep GitHub Pages pointed at your active development branch during a session. Only switch back to `master` when ready for production.

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
**Note:** With Claude Code Web, user can't run local servers. Use GitHub Pages for testing.

```bash
# (For reference - Claude can't use this in Web mode)
python3 -m http.server 8080
# → http://localhost:8080
```

### Deploying to GitHub Pages

**During Development (Branch Testing):**
1. Claude pushes to `claude/feature-xyz` branch
2. User configures GitHub Pages to deploy from that branch:
   - Repo → Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: Select `claude/feature-xyz` + `/ (root)`
   - Save
3. Wait ~1-2 min for deployment
4. Test at: https://karstenhoffmann.github.io/floss/
5. Clear browser cache if needed (Service Worker!)

**Production Deployment:**
1. User creates PR: `claude/feature-xyz` → `master`
2. User reviews + merges PR on GitHub
3. User switches GitHub Pages back to `master` branch
4. Wait ~1 min for production deployment
5. Same URL, now serving from `master`

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
**Branch:** Can deploy from any branch via Settings → Pages
**Path:** Root directory only (no `/dist` or `/build`)
**Cache:** GitHub Pages CDN caches aggressively - wait ~1 min or hard refresh
**Testing:** Point Pages to `claude/*` branch during development, switch to `master` for production

---

## Development Workflow

### Git Branch Strategy (Claude Code Web)

**Branches:**
- `master` - Production (stable, user-tested)
- `claude/*` - Feature branches for Claude Code sessions (e.g., `claude/feature-xyz`)

**Workflow:**
1. **Develop** on `claude/*` branch
2. **Claude pushes** to that branch (only `claude/*` allowed, NOT `master`)
3. **User configures GitHub Pages** to deploy from `claude/*` branch
4. **User tests** preview at https://karstenhoffmann.github.io/floss/
5. **Iterate** until ready
6. **User creates + merges PR** on GitHub: `claude/*` → `master`
7. **User switches GitHub Pages** back to `master` for production

**Key Point:** Claude Code Web cannot push to `master` (HTTP 403). All development happens on `claude/*` branches.

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

## Contact & Contribution

**Owner:** Karsten Hoffmann
**Original Demo:** [Codrops Kinetic Typography](https://tympanus.net/codrops/)
**License:** See LICENSE file

For Claude Code sessions: Read this file first to understand project context.
