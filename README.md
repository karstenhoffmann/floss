# ⚡ Floss

**Professional Kinetic Typography Tool** for Motion Designers

Ultra-modern, Rive-inspired interface with offline-first PWA functionality.

> **⚠️ IMPORTANT:** The Floss application is located in the `/app/` directory!
>
> For detailed developer documentation, see [`CLAUDE.md`](./CLAUDE.md)

---

## ✨ Features

- 🌑 **Ultra-Dark UI**: Glassmorphism with violet/blue gradients
- 🎨 **Kinetic Effects**: Particles (Smoke Dissolve), Endless, Glitch
- ⚡ **Zero Build-Step**: Pure ES Modules, no compilation needed
- 📴 **Offline-First**: Service Worker with intelligent caching
- 🎯 **Canvas-First**: Full viewport WebGL rendering with THREE.js
- 💾 **State Persistence**: LocalStorage saves preferences
- 📱 **PWA-Ready**: Installable on desktop and mobile
- 🎭 **Professional Smoke Dissolve**: Progressive wave dissolve with swirl effects

---

## 🚀 Quick Start

### No build required! Just serve the files:

```bash
cd /path/to/floss

# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000/app/`

**Note:** The app entry point is `/app/index.html`

### Requirements
- Modern browser (Chrome 89+, Safari 16.4+, Firefox 108+)
- HTTP server (not `file://` protocol)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Play/Pause |
| **Esc** | Close Panels |
| **1-4** | Quick Effect Selection |

---

## 🎨 Technology

- **Three.js** (0.158.0) - WebGL rendering
- **GSAP** (3.12.4) - Smooth animations
- **Open Props** (1.7.3) - Design tokens
- **Native ESM** - Zero build-step architecture

---

## 📁 Project Structure

```
floss/
├── app/                      ← ⚠️ THE FLOSS APP IS HERE!
│   ├── index.html           # Main entry point
│   ├── manifest.json        # PWA manifest
│   ├── js/
│   │   ├── core/            # Core systems (renderer, camera, scene)
│   │   ├── effects/         # Effect implementations
│   │   ├── ui/              # UI components and state
│   │   └── utils/           # Utilities
│   ├── css/
│   │   ├── base.css         # Foundation styles
│   │   ├── components.css   # UI components (glassmorphism)
│   │   └── theme.css        # Design tokens
│   └── assets/              # Fonts, images
│
├── archive/                 # Old Codrops demo (for reference)
├── CLAUDE.md                # Developer documentation (READ THIS!)
├── README.md                # This file
└── sw.js                    # Service Worker (root level for GitHub Pages)
```

**Important:** Always work in the `/app/` directory!

---

## 🎯 For Developers

### Adding New Effects

Edit `js/options.js`:

```javascript
{
  word: 'YOUR_WORD',
  color: '#ffffff',
  fill: '#000000',
  geometry: new THREE.SphereGeometry(12, 64, 64),
  // ... configuration
}
```

### Customizing Colors

Edit `css/design-tokens.css`:

```css
--accent-violet: #8b5cf6;
--accent-blue: #3b82f6;
```

---

## 📄 License

Built with inspiration from [Codrops Kinetic Typography](https://github.com/marioecg/codrops-kinetic-typo) (see `/archive`)

---

## 🔮 Roadmap

- [ ] Screenshot/Video export
- [ ] Custom text input
- [ ] More effect presets
- [ ] Touch gesture controls
- [ ] Advanced camera controls

---

**Built for professional motion designers in 2025** ⚡

[View Live Demo](https://karstenhoffmann.github.io/floss/)
