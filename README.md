# ⚡ Floss

**Professional Kinetic Typography Tool** for Motion Designers

Ultra-modern, Rive-inspired interface with offline-first PWA functionality.

---

## ✨ Features

- 🌑 **Ultra-Dark UI**: Glassmorphism with violet/blue gradients
- 🎨 **4 Kinetic Effects**: Endless, Swirl, Twisted, Relax
- ⚡ **Zero Build-Step**: Pure ES Modules, no compilation needed
- 📴 **Offline-First**: Service Worker with intelligent caching
- 🎯 **Canvas-First**: Full viewport WebGL rendering
- ⌨️ **Keyboard Shortcuts**: Space, Esc, 1-4
- 💾 **State Persistence**: LocalStorage saves preferences
- 📱 **PWA-Ready**: Installable on desktop and mobile

---

## 🚀 Quick Start

### No build required! Just serve the files:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

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
├── assets/           # Font files (BMFONT MSDF)
├── css/
│   ├── design-tokens.css  # Rive-inspired design system
│   ├── base.css           # Foundation styles
│   ├── components.css     # UI components
│   └── animations.css     # Micro-interactions
├── js/
│   ├── index.js      # App entry point
│   ├── ui.js         # UI state management
│   ├── options.js    # Effect configurations
│   └── gl/           # WebGL renderer
├── index.html        # Main app
├── manifest.json     # PWA manifest
└── sw.js             # Service worker
```

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
