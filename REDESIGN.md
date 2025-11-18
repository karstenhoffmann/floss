# TT K1n3t1c - Rive-Inspired Redesign

## 🎨 Overview

Complete redesign of the Kinetic Typography app with a **Rive-inspired** ultra-modern interface. Built for professional motion designers with focus on **offline-first** functionality and **zero build-step** deployment.

## ✨ Key Features

### 🌑 Ultra-Dark Modern UI
- **Glassmorphism**: Floating panels with backdrop blur
- **Gradient Accents**: Violet/Blue gradients inspired by Rive
- **Smooth Animations**: Spring-based micro-interactions
- **Auto-hide UI**: Maximizes canvas focus

### 🚀 Technical Architecture
- **No Build Step**: Pure ES Modules + Import Maps
- **Offline-First**: Service Worker with intelligent caching
- **CDN Dependencies**: Three.js, GSAP, Open Props
- **PWA-Ready**: Installable progressive web app

### 🎯 Canvas-First Layout
- Full-viewport WebGL canvas
- Floating toolbar (left)
- Minimal top bar
- Context-aware panels
- Bottom playback controls

## 🛠️ Technology Stack

### CSS Framework
- **Open Props** (1.7.3): Modern design tokens
- **Custom Tokens**: Rive-inspired color system
- **OKLCH Colors**: Future-proof color space

### JavaScript
- **Three.js** (0.158.0): WebGL rendering
- **GSAP** (3.12.4): Smooth animations
- **Native ESM**: ES Module imports
- **Import Maps**: Dependency management

### UI Components
- **Phosphor Icons**: Inline SVG sprites
- **Glassmorphism**: Backdrop-filter effects
- **Spring Animations**: Natural motion

## 📁 Project Structure

```
codrops-kinetic-typo/
├── index.html              # Main HTML with inline SVG sprites
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── design-tokens.css   # Rive-inspired design system
│   ├── base.css            # Foundation styles
│   ├── components.css      # UI components
│   └── animations.css      # Micro-interactions
├── js/
│   ├── index.js            # App entry point
│   ├── ui.js               # UI state management
│   ├── options.js          # Effect configurations
│   ├── fonts.js            # Font mappings
│   └── gl/
│       ├── index.js        # WebGL renderer
│       ├── Type.js         # Kinetic typography
│       └── shaders.js      # GLSL shaders
└── assets/                 # Fonts and textures
```

## 🎨 Design System

### Color Palette
- **Surface 1**: `#0a0a0a` (Canvas background)
- **Surface 2**: `#0d0d0d` (Panel backgrounds)
- **Surface 3**: `#121212` (Elevated elements)
- **Accent**: Violet `#8b5cf6` → Blue `#3b82f6`

### Typography
- **Font**: System sans-serif stack
- **Sizes**: Open Props scale (0.75rem - 1.25rem)
- **Weights**: 400, 500, 600, 700

### Spacing
- **Topbar**: 56px height
- **Toolbar**: 60px width
- **Playback**: 72px height
- **Gaps**: var(--size-2) to var(--size-5)

## ⌨️ Keyboard Shortcuts

- **Space**: Play/Pause
- **Esc**: Close panels
- **1-4**: Quick effect selection

## 🎯 UI State Management

### Persistent State (LocalStorage)
- Current effect selection
- Playback speed
- Auto-hide preference

### Runtime State
- Panel visibility
- Playing state
- Last interaction time

## 🔧 Running the App

### No Build Required!
Just open `index.html` in a modern browser:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000`

### Requirements
- **Modern Browser**: Chrome 89+, Safari 15+, Firefox 87+
- **ES Modules Support**: Import maps
- **Service Worker**: HTTPS or localhost

## 📱 PWA Installation

1. Visit the app in Chrome/Edge
2. Click install icon in address bar
3. App now works offline!

## 🎨 Customization

### Changing Colors
Edit `css/design-tokens.css`:

```css
--accent-violet: #8b5cf6;  /* Your color */
--accent-blue: #3b82f6;     /* Your color */
```

### Adding Effects
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

## 🚀 Performance

### Optimizations
- **GPU Acceleration**: transform3d on animated elements
- **Will-change**: Only during active animations
- **Asset Caching**: Service Worker
- **Lazy Loading**: UI loads after canvas
- **PixelRatio**: Capped at 1.5 for performance

### Target
- **60 FPS**: Canvas animations
- **Smooth UI**: Spring-based transitions
- **Fast Load**: < 2s on 3G

## ♿ Accessibility

- **Keyboard Navigation**: Full support
- **Focus Visible**: Clear focus states
- **ARIA Labels**: All icon buttons
- **Reduced Motion**: Respects prefers-reduced-motion
- **Color Contrast**: WCAG AA compliant

## 📝 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 89+     | ✅ Full  |
| Safari  | 15+     | ✅ Full  |
| Firefox | 87+     | ✅ Full  |
| Edge    | 89+     | ✅ Full  |

## 🔮 Future Enhancements

- [ ] Screenshot/Video export
- [ ] Custom text input
- [ ] More effect presets
- [ ] Touch gesture controls
- [ ] Gamepad support
- [ ] VR mode

## 📄 License

Same as original codrops-kinetic-typo project

---

**Built with ⚡ for professional motion designers in 2025**
