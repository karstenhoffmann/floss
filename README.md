# Floss - Professional Kinetic Typography Motion Design

A professional, browser-based kinetic typography motion design tool for creating stunning text animations in real-time. Built with Three.js, designed for motion designers.

**🌐 Live Demo:** https://karstenhoffmann.github.io/floss/

## 🌟 Features

- **Real-time 3D Effects**: Beautiful kinetic typography powered by Three.js r115
- **Live Parameter Controls**: Adjust text, colors, animation speed in real-time
- **Preset Management**: Save, load, export, and import your designs
- **Video Export**: Export MP4 videos (1920×1080, 30/60fps) - PowerPoint compatible
- **Offline-First**: Works completely offline after first load (Service Worker)
- **No Build Step**: Pure ES6 modules - runs directly in browser
- **60fps+ Performance**: Smooth animations on modern desktop hardware
- **Professional UI**: Dark, minimal, After Effects-inspired interface
- **Keyboard Shortcuts**: Fast workflow with comprehensive shortcuts

## 📦 Two Usage Modes

### Mode 1: Online (GitHub Pages) ⭐ Recommended

**Best for:** Regular use, development, testing

```
URL: https://karstenhoffmann.github.io/floss/
File: index.html
Tech: ES6 Modules + CDN dependencies
```

**Requirements:**
- Modern browser (Chrome, Firefox, Safari)
- Internet connection on first load (CDN downloads)
- Offline capable after first load (Service Worker caches everything)

**To deploy your own:**
1. Fork this repository
2. Go to **Settings** → **Pages**
3. Deploy from branch, **`/ (root)`** folder
4. Access at: `https://yourusername.github.io/floss/`

### Mode 2: Offline (file:// protocol)

**Best for:** Air-gapped machines, complete offline use, copy-paste portability

```
File: index-iife.html
Tech: IIFE bundle, all dependencies vendored locally
```

**Usage:**
1. Download/clone this repository
2. Double-click `index-iife.html`
3. Works immediately - no server, no internet required

**Features:**
- ✅ Simplified effect (Torus geometry)
- ✅ All libraries vendored (Three.js, Open Props, Coloris)
- ✅ No CDN dependencies
- ✅ Works on air-gapped machines

## 🚀 Local Development

### Option A: Python SimpleHTTPServer (macOS/Linux)

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

### Option B: VS Code Live Server

1. Install [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → **"Open with Live Server"**

### Option C: Node.js

```bash
npx serve
# Opens automatically in browser
```

## 📂 Repository Structure

```
/
├── index.html              # Main app (ES6 modules, CDN dependencies)
├── index-iife.html         # Offline version (IIFE, vendored deps)
├── js/                     # Application code (ES6 modules)
│   ├── app.js             # Main controller
│   ├── core/              # Core systems
│   ├── effects/           # Effect implementations
│   ├── ui/                # UI components
│   └── utils/             # Utilities
├── styles/                # CSS stylesheets
├── lib/                   # Vendored dependencies
│   ├── three/             # Three.js r115 (646 KB)
│   ├── open-props/        # CSS design tokens (3 KB)
│   ├── coloris/           # Color picker (22 KB)
│   └── canvas-record/     # Video export library
├── manifest.json          # PWA manifest
├── service-worker.js      # Offline support
└── reference/             # Original Codrops tutorial (read-only)
```

### Effects
- **1-9** - Quick-switch between effects

### Settings
- **R** - Reset current settings to defaults
- **Cmd/Ctrl + S** - Save as new preset
- **Cmd/Ctrl + E** - Export settings as JSON file
- **Cmd/Ctrl + I** - Import settings from JSON file

## 🎮 Using the App

### 1. Choose an Effect

Use the dropdown in the toolbar to select an effect:
- 🌀 **Endless** - Infinite scrolling text on torus knot (currently available)
- More effects coming soon!

### 2. Adjust Settings

The settings panel at the bottom has organized controls:

**Typography**
- Text content (supports emoji! Try: 🔥FIRE🔥)
- Font size, font family, letter spacing
- Padding and tile repeats

**Colors**
- Text color
- Surface/tile color
- Background color

**Animation**
- Animation speed (0 = paused, 5 = very fast)

### 3. Save as Preset

1. Adjust settings to your liking
2. Click **💾 Save Current** in the preset panel
3. Enter a name for your preset
4. Your preset is saved to LocalStorage

### 4. Export/Import

**Export Settings:**
- Click **📤 Export** or press **Cmd/Ctrl + E**
- Downloads a JSON file with current settings
- Share with others or use as backup

**Import Settings:**
- Click **📥 Import** or press **Cmd/Ctrl + I**
- Select a JSON file
- Settings are applied immediately

### 5. Export Videos

**⚠️ Available in v5.1.0+**

Export your animations as high-quality MP4 videos for PowerPoint presentations, social media, or video editing:

1. Click **🎬 Export** button in toolbar
2. Review the **Safe Frame** (1920×1080 export region)
3. Choose settings:
   - **Duration**: Auto-calculated for perfect loops (or custom)
   - **Frame Rate**: 30fps (standard) or 60fps (smooth)
4. Click **Start Export**
5. Wait for rendering (30-40× realtime speed!)
6. MP4 file downloads automatically

**Export Features:**
- ✅ **Frame-perfect rendering** - No dropped frames, perfect timing
- ✅ **Perfect loops** - Duration calculated from effect parameters
- ✅ **PowerPoint compatible** - H.264 codec, tested in Keynote/PowerPoint
- ✅ **Faster than realtime** - 2.5s video renders in ~4 seconds
- ✅ **Offline rendering** - No network required

**Example:**
- Effect: Endless with rotation speed 1.0
- Duration: ~6.28s (one complete rotation)
- Frame Rate: 60fps
- Output: ~5MB MP4 file, loops perfectly

**Tip:** Use the suggested duration for seamless loops!

## 🔌 Offline Mode

After the first load, the app works completely offline:

1. Open DevTools (F12) → **Application** tab
2. Click **Service Workers** in sidebar
3. Check ✅ **"Offline"** checkbox
4. Reload page - app works perfectly!

The offline indicator (📡 Offline Mode) appears automatically when you lose connection.

## 🎨 Current Effects

### 🌀 Endless (Wave Tiles)

Infinite scrolling text mapped onto a torus knot geometry with depth fog. Inspired by the original Codrops demo.

**Best Settings:**
- Text: Short words (3-8 letters)
- Tile Repeats: 8-15 for smooth scroll
- Animation Speed: 0.3-0.6 for hypnotic effect

## 🧩 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Recommended, best performance |
| Safari (macOS) | ✅ Full | Great performance |
| Safari (iOS) | ✅ Full | Works perfectly, add to home screen |
| Firefox | ⚠️ Not tested | Should work (WebGL + ES6 modules) |

## 📊 Performance

- **Target**: 60fps+ on MacBook Air M1 or equivalent
- **FPS Counter**: Press **F** to toggle
  - 🔴 Red: < 60fps (performance issues)
  - 🟡 Yellow: 60-119fps (good)
  - 🟢 Green: ≥ 120fps (excellent)

## 🐛 Troubleshooting

### Service Worker not registering

**Solution**: Make sure you're running on a local server (http://localhost), not `file://`

### Fonts not loading

**Solution**: Check browser console for errors. Ensure internet connection on first load.

### LocalStorage full

**Symptoms**: "Storage full" notification appears

**Solution**:
1. Export all presets (📤 Export button)
2. Delete old/unused presets
3. Import presets later when needed

### Performance issues (< 60fps)

**Solutions**:
- Lower tile repeats (reduces geometry complexity)
- Use shorter text
- Close other browser tabs
- Update graphics drivers

### App doesn't load

**Checklist**:
1. ✅ Running on local server? (not `file://`)
2. ✅ Console shows any errors? (F12)
3. ✅ Three.js loaded? (check Network tab)
4. ✅ WebGL supported? (visit https://get.webgl.org)

## 🔨 Building from Source

If you need to rebuild the bundled dependencies (e.g., after updating versions):

```bash
# 1. Install dependencies
npm install

# 2. Bundle ES modules with Rollup
npm run bundle:all

# 3. Bundles are created in lib/esm/bundles/
# - canvas-context.js (2.1 KB)
# - canvas-screenshot.js (3.0 KB)
# - media-codecs.js (15 KB)
# - mediabunny.js (1.1 MB)
# - h264-mp4-encoder.js (1.7 MB)
```

**Note:** The bundled files are already committed to the repository, so building is only needed if you modify dependencies.

## 💾 Dependencies

**Fully Vendored (Offline-Ready):**
- **Three.js r115** (646 KB) - 3D WebGL library
- **Open Props** (3 KB) - CSS design tokens
- **Coloris** (22 KB) - Modern color picker
- **canvas-record** (137 KB) - Video export library
- **MP4 Export Dependencies** (2.8 MB, Rollup-bundled):
  - canvas-context (2.1 KB)
  - canvas-screenshot (3.0 KB)
  - media-codecs (15 KB)
  - mediabunny (1.1 MB - with Node.js polyfills)
  - h264-mp4-encoder (1.7 MB - UMD + WASM)

**CDN (Optional Features, Cached by Service Worker):**
- gifenc (GIF export - rarely used)
- @ffmpeg/ffmpeg (Advanced formats - HTTPS only)
- Fonts (Google Fonts CDN)

**Total Vendored:** ~3.5 MB (100% offline MP4 export support)

## 🔮 Coming Soon

- [ ] Additional effects (Swirl, Twisted, Relax, Liquid Morph)
- [ ] Google Fonts integration
- [ ] Custom font upload (WOFF2, TTF, OTF)
- [ ] Emoji picker for text input
- [ ] Preset sharing via URL
- [x] **Video/MP4 export** ✅ (v5.1.0+)
- [ ] GIF export
- [ ] Mobile responsive preset panel

## 💡 Tips & Tricks

1. **Emoji Support**: Try typing emoji directly in the text field! Examples:
   - 🔥FIRE🔥
   - ✨SPARKLE✨
   - 🌊WAVE🌊

2. **Hide UI for Screenshots**: Press **Space** to hide all UI and capture clean shots

3. **Quick Effect Switching**: Use number keys 1-9 to jump between effects instantly

4. **Preset Workflow**:
   - Create variations of an effect
   - Save each as a preset with descriptive names
   - Use presets as starting points for new designs

5. **Performance Optimization**:
   - For smooth 60fps, keep tile repeats ≤ 15
   - Use animation speed 0.3-1.5 for balanced visuals

## 📜 License

Based on the original [Codrops Kinetic Typography](https://github.com/marioecg/codrops-kinetic-typo) demo.

## 🙏 Credits

- Original demo by [Mario Ecg](https://github.com/marioecg)
- Three.js library
- Codrops for inspiration

## 📧 Feedback

Found a bug or have a feature request? Let me know!

---

**Enjoy creating beautiful kinetic typography! ✨**
