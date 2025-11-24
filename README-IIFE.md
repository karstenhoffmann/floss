# Floss IIFE Version (file:// compatible)

## Overview

`index-iife.html` is a simplified version of Floss that works with the `file://` protocol, making it portable and usable without a web server.

## Features

✅ **file:// compatible** - Open directly in browser
✅ **No build step** - Pure HTML + inline JavaScript
✅ **Fully vendored** - Three.js, Open Props, Coloris, canvas-record included locally
✅ **Minimal IIFE bundle** - All code in self-executing function
✅ **Core functionality** - Text rendering, animation, camera controls
✅ **MP4 video export** - 1920×1080 @ 30/60fps, PowerPoint compatible
✅ **100% offline** - No internet required after download

## Usage

### Option 1: Direct file:// access

1. Open your file explorer
2. Navigate to the `floss` directory
3. Double-click `index-iife.html`
4. Browser opens with working app

### Option 2: HTTP server (for testing)

```bash
python3 -m http.server 8080
# Open http://localhost:8080/index-iife.html
```

## Included Features

- ✅ 3D text rendering (torus geometry)
- ✅ Real-time text input
- ✅ Rotation speed control
- ✅ Scale control
- ✅ Camera controls (OrbitControls)
- ✅ **MP4 video export** (1920×1080, 30/60fps)
- ✅ Responsive canvas

## Limitations (vs. full ES6 version)

- ❌ No preset management
- ❌ No multiple effects (only one built-in)
- ❌ No LocalStorage persistence
- ❌ No service worker / PWA features
- ❌ Simplified UI (no settings panel, inspector)
- ⚠️ Video export uses simplified UI (modal-based, not full export panel)

## Technical Details

### Dependencies (Vendored Locally)

- **Three.js r115** (646 KB) - WebGL rendering library (`/lib/three/`)
- **OrbitControls** - Camera interaction
- **Open Props** (3 KB) - CSS design tokens (`/lib/open-props/`)
- **Coloris** (22 KB) - Color picker library (`/lib/coloris/`)
- **canvas-record IIFE** (424 KB) - Video recording library (`/lib/canvas-record/`)
- **h264-mp4-encoder** (1.7 MB) - WASM MP4 encoder (`/lib/canvas-record/`)

**Total:** ~2.8 MB, 100% offline-capable (including video export)

### Code Structure

```
index-iife.html
├── HTML structure
├── Inline CSS
└── IIFE JavaScript
    ├── WebGL check
    ├── Scene setup
    ├── Text texture generator
    ├── Torus knot effect
    ├── Animation loop
    └── UI controls
```

### Why IIFE?

ES6 modules (`<script type="module">`) don't work with `file://` protocol due to CORS restrictions. IIFE (Immediately Invoked Function Expression) wraps all code in a single scope without module imports.

## Browser Compatibility

✅ **Chrome/Edge** - Full support
✅ **Firefox** - Full support
✅ **Safari** - Full support
⚠️ **Mobile** - Limited (desktop-focused)

## Troubleshooting

### "WebGL not supported"
- Update your browser to the latest version
- Check if hardware acceleration is enabled
- Try a different browser

### Libraries not loading
- All libraries are vendored locally in `/lib/` directory
- No internet connection required
- Check browser console for file path errors
- Ensure you downloaded the complete repository

### Black screen / no rendering
- Open browser console (F12)
- Check for JavaScript errors
- Verify WebGL is available

## Development

To modify the IIFE version:

1. Edit `index-iife.html` directly
2. Changes are inline - no build process
3. Refresh browser to test
4. All logic is in the `<script>` section

## Comparison: ES6 vs IIFE

| Feature | ES6 (index.html) | IIFE (index-iife.html) |
|---------|------------------|------------------------|
| Module system | ✅ ES6 imports | ❌ IIFE bundle |
| HTTP server | ✅ Required | ✅ Optional |
| file:// protocol | ❌ Not supported | ✅ Supported |
| Build process | ❌ None | ✅ Rollup (for canvas-record) |
| Full features | ✅ All effects | ❌ One effect |
| Video export | ✅ Yes (full UI) | ✅ Yes (simplified UI) |
| Presets | ✅ Yes | ❌ No |
| File size | 📦 3.5 MB (split) | 📄 2.8 MB (single page) |
| Maintainability | ✅ High | ⚠️ Medium |

## When to Use

**Use index-iife.html when:**
- Testing locally without HTTP server
- Sharing as a single HTML file
- Offline demonstration
- Quick prototyping

**Use index.html when:**
- Full feature set needed
- Video export required
- Preset management needed
- Production deployment

## Known Limitations & Future Improvements

### Current State (v5.4.8)

**Intentional Simplifications:**
- ✅ Uses simple **Torus geometry** (not TorusKnot) for better text UV mapping
- ✅ Basic **MeshBasicMaterial** (no lighting, no shaders)
- ✅ Text rendered as **canvas texture** (not shader-based)
- ✅ Single effect only (no effect switching)
- ✅ All dependencies vendored locally (Three.js, Open Props, Coloris)

**Why:** This is a **Proof of Concept** for file:// compatibility. Visual finesse comes after core architecture migration.

### Future Improvements (Post-Migration)

**After vendoring CDN dependencies and completing offline-first architecture:**

- [ ] **Replace Torus with TorusKnot** - More visually interesting (like original Codrops)
- [ ] **Shader-based text rendering** - Better quality, GPU-accelerated
- [ ] **Advanced materials** - Lighting, reflections, post-processing
- [ ] **Multiple effects** - Effect switcher UI
- [ ] **More parameters** - Color controls, animation presets
- [ ] **Better UV mapping** - Custom UV unwrapping for complex geometries

**Priority:** LOW - Focus on architecture first, visuals later

**See:** `CLAUDE.md` → "Future Enhancements" → "index-iife.html Visual Polish"

## Version

- **Version:** 5.6.0
- **Date:** 2025-11-24
- **Type:** Full-featured IIFE bundle with MP4 export
- **Status:** All dependencies vendored, 100% offline-capable (including video export)

## License

Same as main Floss project.
