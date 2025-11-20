# Reference - Original Codrops Tutorial

This directory contains the **original Codrops kinetic typography tutorial** files that served as the foundation for the Floss application.

## ⚠️ DO NOT MODIFY

These files are preserved for **reference and learning purposes only**. They represent the original tutorial implementation before Floss was developed with its modern plugin architecture.

## What's Here

### Original Tutorial Structure
- `index.html` - Original tutorial entry point
- `js/` - Tutorial JavaScript implementation
  - `gl/Type.js` - MSDF text rendering system
  - `gl/shaders.js` - Original effect shaders
  - `options.js` - Effect configuration patterns
  - `ui.js` - Simple UI controls
- `css/` - Tutorial styling (glassmorphism design)
- `assets/` - MSDF font files
- `archive/` - Original Codrops webpack demo

### Key Differences from Current Floss

| Aspect | Tutorial (Reference) | Floss (Current) |
|--------|---------------------|-----------------|
| Architecture | Options-based | Plugin-based (EffectBase) |
| Text Rendering | MSDF fonts | Canvas 2D → Texture |
| UI | Simple controls | Full settings panel + presets |
| Effects | 4 hardcoded | Extensible plugin system |
| State | Minimal | LocalStorage + presets |
| Deployment | Webpack build | No build (ES6 modules) |

## How to Use This Reference

### When Working on Floss

**Good uses:**
- Study shader techniques in `js/gl/shaders.js`
- Learn effect patterns from `js/options.js`
- Understand MSDF rendering in `js/gl/Type.js`
- Reference original visual design in `css/`

**DON'T:**
- Copy/paste code directly into Floss
- Modify these files
- Use as basis for new features
- Run this version (use Floss instead)

### Understanding Effect Techniques

The reference shaders show excellent techniques for:
1. **Torus Knot Effect** (`js/gl/shaders.js:1-37`)
   - Fog-based depth fading
   - UV scrolling for infinite animation
   - Texture repeat patterns

2. **Sphere Effect** (`js/gl/shaders.js:39-76`)
   - Swirl motion with sine waves
   - Depth-based color mixing
   - Dynamic UV manipulation

3. **Box Effect** (`js/gl/shaders.js:78-135`)
   - Twist deformation
   - Rotation matrices
   - Axis-based transformations

4. **Plane Effect** (`js/gl/shaders.js:137-186`)
   - Wave motion
   - Shadow/lighting simulation
   - Value mapping utilities

### Porting Tutorial Effects to Floss

To adapt a reference effect to Floss:

1. **Don't copy the old code** - it uses a different architecture
2. **Study the technique** - understand what the shader does visually
3. **Create new effect** - extend `EffectBase` in `js/effects/`
4. **Reimplement** - use Floss's text-texture system
5. **Add settings** - define schema for user controls

Example: Porting the Torus Knot effect
```javascript
// DON'T: Copy reference/js/options.js directly
// DO: Create js/effects/torus-knot.js extending EffectBase
import EffectBase from './effect-base.js';

export class TorusKnotEffect extends EffectBase {
    // Study reference/js/gl/shaders.js for shader technique
    // Reimplement using Canvas text texture
    // Add settings schema for fog, speed, etc.
}
```

## Historical Context

### Original Tutorial
- **Source:** [Codrops](https://tympanus.net/codrops/)
- **Topic:** Kinetic Typography with THREE.js
- **Technique:** MSDF font rendering
- **Build:** Webpack-based

### Evolution to Floss
1. **Phase 1:** Tutorial code copied to `/archive/`
2. **Phase 2:** Simplified version built in root (this reference)
3. **Phase 3:** Moved to `/app/` with plugin system
4. **Phase 4 (Nov 2024):** Restructure - app to root, tutorial to `/reference/`

## License

Original tutorial code from Codrops - see their license.
Floss adaptations and modifications are covered by the repository LICENSE file.

---

**For Floss development:** See root `/CLAUDE.md`, `/README.md`, and `/PLUGIN_SPEC.md`
