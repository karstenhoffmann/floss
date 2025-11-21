# floss

A professional, browser-based kinetic typography motion design tool for creating stunning text animations in real-time. No build step required – just open and create!

## 🌟 Features

- **Real-time Effects**: Beautiful 3D kinetic typography effects powered by Three.js
- **Live Parameter Controls**: Adjust text, colors, animation speed, and more in real-time
- **Preset Management**: Save, load, export, and import your favorite designs
- **Offline Support**: Works completely offline after first load (via Service Worker)
- **No Build Step**: Pure ES6 modules – runs directly in the browser
- **60fps+ Performance**: Buttery smooth animations on modern hardware
- **Dark Professional UI**: Minimal, After Effects-inspired interface
- **Keyboard Shortcuts**: Fast workflow with comprehensive shortcuts
- **Export/Import**: Save settings as JSON files for sharing and backup

## 📦 Quick Start

### ⚠️ IMPORTANT: Local Server Required

This app **requires a local web server** to run (due to ES6 modules and Service Worker). **Do NOT open `index.html` directly by double-clicking!**

Choose one of the methods below:

### Option A: VS Code Live Server (⭐ Recommended)

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Open the `/app` folder in VS Code
3. Right-click on `index.html` → **"Open with Live Server"**
4. The app opens at `http://localhost:5500` with auto-reload on save

### Option B: Python SimpleHTTPServer (No installation on macOS/Linux)

```bash
cd app
python3 -m http.server 8000
```

Then open in your browser: **http://localhost:8000**

### Option C: Node.js (if installed)

```bash
cd app
npx serve
```

The app will open automatically in your browser.

### Option D: PHP Built-in Server (if PHP installed)

```bash
cd app
php -S localhost:8000
```

Then open: **http://localhost:8000**

## 🚀 First Load

On the first load:
- The app will download Three.js from CDN
- Service Worker will cache all assets for offline use
- After the first load, the app works **100% offline**

You should see:
- ✓ Three.js scene initialized
- ✓ Effect registered: Endless
- ✓ ServiceWorker registered
- ✓ Render loop started
- ✓ App initialized

## 📱 Testing on Mobile (iPhone/iPad)

### Option 1: GitHub Pages (Easiest)

1. Push this repo to GitHub
2. Go to **Settings** → **Pages**
3. Deploy from `main` branch, `/app` folder
4. Access via: `https://yourusername.github.io/repo-name/`
5. On iPhone: Tap **Share** → **Add to Home Screen** for full-screen experience

### Option 2: Local Network

1. Start local server (see above)
2. Find your computer's local IP:
   - **macOS**: System Settings → Network
   - **Windows**: `ipconfig` in Command Prompt
   - **Linux**: `ip addr` or `ifconfig`
3. On iPhone, open Safari: `http://YOUR-LOCAL-IP:8000`
4. Both devices must be on the same WiFi network

## ⌨️ Keyboard Shortcuts

### Navigation
- **Space** - Toggle UI visibility (show/hide all panels)
- **H** - Show/hide help overlay
- **F** - Toggle FPS counter
- **Esc** - Close modals/overlays

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

## 📁 Project Structure

```
/app/
├── index.html              # Entry point
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline support
├── README.md               # This file
├── styles/                 # All CSS files
├── js/
│   ├── app.js              # Main application
│   ├── core/               # Core systems (state, scene, renderer, managers)
│   ├── effects/            # Effect plugins
│   ├── ui/                 # UI components
│   └── utils/              # Utilities
└── fonts/                  # (Future: bundled fonts)
```

## 🔮 Coming Soon

- [ ] Additional effects (Swirl, Twisted, Relax, Liquid Morph)
- [ ] Google Fonts integration
- [ ] Custom font upload (WOFF2, TTF, OTF)
- [ ] Emoji picker for text input
- [ ] Preset sharing via URL
- [ ] Video/GIF export
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
