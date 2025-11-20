# 🧩 Effect Plugin Specification

This document explains how to create custom effects for the Kinetic Typography app.

## Overview

Effects are ES6 classes that extend `EffectBase` and define:
1. **Metadata** - Name, icon, description
2. **Settings Schema** - Configurable parameters
3. **Three.js Scene** - Geometry, materials, shaders
4. **Animation Logic** - Update loop
5. **Lifecycle Methods** - Init, resize, destroy

## Quick Start: Your First Effect

Create a new file in `/js/effects/my-effect.js`:

```javascript
import EffectBase from './effect-base.js';
import { createTextTexture, updateTextTexture } from '../utils/text-texture.js';

export class MyEffect extends EffectBase {
    // 1. Define metadata
    static get metadata() {
        return {
            id: 'my-effect',           // Unique ID (kebab-case)
            name: 'My Effect',          // Display name
            icon: '🎨',                 // Emoji icon
            description: 'My custom kinetic typography effect'
        };
    }

    // 2. Define settings schema (optional, inherits defaults)
    getSettingsSchema() {
        return {
            ...super.getSettingsSchema(),  // Include base settings
            // Add custom settings here
            rotationSpeed: {
                type: 'number',
                default: 1.0,
                min: 0,
                max: 5,
                step: 0.1,
                label: 'Rotation Speed'
            }
        };
    }

    // 3. Initialize effect
    init(scene, camera, renderer) {
        super.init(scene, camera, renderer);

        // Create text texture
        this.textTextureData = createTextTexture({
            text: this.settings.text,
            fontSize: this.settings.fontSize,
            fontFamily: this.settings.fontFamily,
            textColor: this.settings.textColor,
            backgroundColor: this.settings.surfaceColor
        });

        // Create geometry
        this.geometry = new THREE.BoxGeometry(1, 1, 1);

        // Create material
        this.material = new THREE.MeshBasicMaterial({
            map: this.textTextureData.texture
        });

        // Create mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        // Set background
        this.scene.background = new THREE.Color(this.settings.backgroundColor);
    }

    // 4. Animation update
    update(deltaTime, elapsedTime) {
        if (!this.mesh) return;
        this.mesh.rotation.y += deltaTime * this.settings.rotationSpeed;
    }

    // 5. Handle setting changes (optional)
    onSettingChanged(key, value) {
        if (!this.initialized) return;

        switch (key) {
            case 'text':
            case 'textColor':
            case 'surfaceColor':
                updateTextTexture(this.textTextureData, {
                    text: this.settings.text,
                    textColor: this.settings.textColor,
                    backgroundColor: this.settings.surfaceColor
                });
                break;

            case 'backgroundColor':
                this.scene.background = new THREE.Color(value);
                break;

            case 'rotationSpeed':
                // No action needed, used in update()
                break;
        }
    }

    // 6. Handle resize (optional)
    resize(width, height) {
        // Handle window resize if needed
    }

    // 7. Cleanup (optional, but recommended)
    destroy() {
        if (this.textTextureData) {
            this.textTextureData.texture.dispose();
        }
        super.destroy();
    }
}

export default MyEffect;
```

## Register Your Effect

In `/js/app.js`, import and register:

```javascript
import MyEffect from './effects/my-effect.js';

// In registerEffects() method:
effectManager.register(MyEffect);
```

## Effect Lifecycle

### 1. Construction
```javascript
const effect = new MyEffect();  // Constructor called
```

### 2. Initialization
```javascript
effect.init(scene, camera, renderer);
// - Set up Three.js objects
// - Create geometry, materials, meshes
// - Add to scene
```

### 3. Animation Loop
```javascript
effect.update(deltaTime, elapsedTime);
// Called every frame (60+ times per second)
// - Animate objects
// - Update uniforms
// - deltaTime: time since last frame (seconds)
// - elapsedTime: total time since start (seconds)
```

### 4. Settings Changes
```javascript
effect.onSettingChanged(key, value);
// Called when user changes a setting
// - Update materials, textures, colors
// - Reactive updates
```

### 5. Resize
```javascript
effect.resize(width, height);
// Called when window resizes
// - Update render targets
// - Adjust camera/geometry if needed
```

### 6. Cleanup
```javascript
effect.destroy();
// - Dispose geometries, materials, textures
// - Remove from scene
// - Free memory
```

## Settings Schema

### Available Types

#### String
```javascript
text: {
    type: 'string',
    default: 'HELLO',
    label: 'Text',
    emoji: true  // Enable emoji support
}
```

#### Number
```javascript
fontSize: {
    type: 'number',
    default: 120,
    min: 20,
    max: 500,
    step: 1,
    label: 'Font Size'
}
```

#### Color
```javascript
textColor: {
    type: 'color',
    default: '#ffffff',
    label: 'Text Color'
}
```

#### Font
```javascript
fontFamily: {
    type: 'font',
    default: 'Arial Black',
    label: 'Font'
}
```

### Core Settings (Inherited from EffectBase)

Every effect automatically inherits:
- `text` - Text content (string)
- `fontSize` - Font size (number, 20-500)
- `fontFamily` - Font family (font)
- `letterSpacing` - Letter spacing (number, -50 to 200)
- `padding` - Padding (number, 0-100)
- `repeats` - Tile repeats (number, 1-20)
- `textColor` - Text color (color)
- `surfaceColor` - Surface/tile color (color)
- `backgroundColor` - Background color (color)
- `animationSpeed` - Animation speed (number, 0-5)

Override defaults in your `getSettingsSchema()`:

```javascript
getSettingsSchema() {
    return {
        ...super.getSettingsSchema(),
        text: {
            ...super.getSettingsSchema().text,
            default: 'MY TEXT'  // Override default
        }
    };
}
```

## Text Texture System

### Creating Text Textures

```javascript
import { createTextTexture } from '../utils/text-texture.js';

const textureData = createTextTexture({
    text: 'HELLO',
    fontSize: 120,
    fontFamily: 'Arial Black',
    letterSpacing: 10,
    padding: 20,
    textColor: '#ffffff',
    backgroundColor: '#000000',
    maxWidth: 2048  // Max canvas width
});

// Use texture in material
const material = new THREE.MeshBasicMaterial({
    map: textureData.texture
});
```

### Updating Text Textures

```javascript
import { updateTextTexture } from '../utils/text-texture.js';

// Update existing texture (more efficient than recreating)
updateTextTexture(this.textTextureData, {
    text: 'NEW TEXT',
    textColor: '#ff0000'
});
```

### Emoji Support

Text textures fully support emoji:

```javascript
createTextTexture({
    text: '🔥FIRE🔥',
    fontSize: 120,
    fontFamily: 'Arial'  // System font handles emoji
});
```

## Three.js Patterns

### Using Shaders

```javascript
this.material = new THREE.ShaderMaterial({
    vertexShader: this.getVertexShader(),
    fragmentShader: this.getFragmentShader(),
    uniforms: {
        uTime: { value: 0 },
        uTexture: { value: this.textTextureData.texture }
    },
    side: THREE.DoubleSide
});

// In update():
this.material.uniforms.uTime.value = elapsedTime;
```

### Shader Example

```javascript
getVertexShader() {
    return `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
}

getFragmentShader() {
    return `
        varying vec2 vUv;
        uniform float uTime;
        uniform sampler2D uTexture;

        void main() {
            vec2 uv = vUv;
            vec3 texture = texture2D(uTexture, uv).rgb;
            gl_FragColor = vec4(texture, 1.0);
        }
    `;
}
```

### Render Targets (Advanced)

For effects that render text to a texture first:

```javascript
// Create render target
this.renderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight
);

// Create scene for rendering text
this.textScene = new THREE.Scene();
this.textCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Add text mesh to text scene
const textMesh = new THREE.Mesh(textGeometry, textMaterial);
this.textScene.add(textMesh);

// In update(), before main render:
this.renderer.setRenderTarget(this.renderTarget);
this.renderer.render(this.textScene, this.textCamera);
this.renderer.setRenderTarget(null);

// Use render target texture in main material
this.material.uniforms.uTexture.value = this.renderTarget.texture;
```

## Performance Best Practices

### 1. Reuse Geometries

```javascript
// ❌ Bad - Creates new geometry every update
update() {
    this.geometry.dispose();
    this.geometry = new THREE.SphereGeometry(1, 32, 32);
}

// ✅ Good - Modify existing geometry
init() {
    this.geometry = new THREE.SphereGeometry(1, 32, 32);
}
update() {
    // Animate via transforms, not geometry recreation
    this.mesh.scale.x = 1 + Math.sin(elapsedTime) * 0.5;
}
```

### 2. Dispose Resources

```javascript
destroy() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) {
        if (this.material.map) this.material.map.dispose();
        this.material.dispose();
    }
    if (this.renderTarget) this.renderTarget.dispose();
    if (this.textTextureData) {
        this.textTextureData.texture.dispose();
    }
    super.destroy();
}
```

### 3. Optimize Shaders

```javascript
// ✅ Good - Calculate once in vertex shader
varying float vDistance;
void main() {
    vDistance = distance(position, vec3(0.0));
    // ...
}

// ❌ Bad - Calculate per fragment
void main() {
    float distance = distance(vPosition, vec3(0.0));  // Expensive!
    // ...
}
```

### 4. Limit Geometry Complexity

- Keep polygon count reasonable (< 100k triangles)
- Use lower subdivision for distant objects
- Consider instancing for repeated geometry

## Common Patterns

### Scrolling/Tiled Textures

```glsl
// Fragment shader
uniform vec2 uRepeats;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    vec2 uv = fract(vUv * uRepeats - vec2(uTime * 0.5, 0.0));
    vec3 color = texture2D(uTexture, uv).rgb;
    gl_FragColor = vec4(color, 1.0);
}
```

### Vertex Displacement

```glsl
// Vertex shader
uniform float uTime;

void main() {
    vec3 pos = position;
    pos.z += sin(pos.x * 2.0 + uTime) * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

### Fog/Depth Effects

```glsl
// Fragment shader
varying vec3 vPosition;

void main() {
    float fog = clamp(vPosition.z / 10.0, 0.0, 1.0);
    vec3 color = mix(vec3(0.0), textureColor, fog);
    gl_FragColor = vec4(color, 1.0);
}
```

## Testing Your Effect

### 1. Visual Test
- Load effect in app
- Verify appearance matches intent
- Test all settings changes

### 2. Performance Test
- Press **F** to show FPS counter
- Should maintain 60fps+ on target hardware
- If < 60fps, optimize geometry or shaders

### 3. Resize Test
- Resize browser window
- Verify no distortion or errors
- Check render targets update correctly

### 4. Settings Test
- Change every setting
- Verify reactive updates work
- Test edge cases (min/max values)

### 5. Lifecycle Test
- Switch between effects rapidly
- Check console for errors
- Monitor memory usage (DevTools → Memory)

## Debugging Tips

### Console Logging

```javascript
init() {
    console.log('Effect init:', this.constructor.metadata.name);
    console.log('Settings:', this.settings);
}

update() {
    // Avoid logging every frame! Use conditionally:
    if (Math.random() < 0.01) {  // Log ~1% of frames
        console.log('FPS:', this.fps);
    }
}
```

### Three.js Inspector

Install [Three.js Inspector](https://chrome.google.com/webstore/detail/threejs-inspector/dnhjfclbfhcbcdfpjaeacomhbdfjbebi) Chrome extension to inspect scene graph in real-time.

### Common Issues

**Issue**: Texture not showing
- Check `material.map` is set
- Verify `texture.needsUpdate = true`
- Ensure canvas has content (not blank)

**Issue**: Performance lag
- Check geometry complexity (triangles count)
- Optimize shaders (avoid expensive operations in fragment shader)
- Dispose old resources in `destroy()`

**Issue**: Settings not updating
- Implement `onSettingChanged()` callback
- Update uniforms, textures, or materials
- Call `this.material.needsUpdate = true` if needed

## Example: Complete Effect

See `/js/effects/endless.js` for a complete, production-ready example implementing:
- Text texture creation
- Shader-based material
- Animated tiled UV scrolling
- Depth fog effect
- Reactive setting updates
- Proper cleanup

## Publishing Your Effect

1. Create effect file in `/js/effects/`
2. Test thoroughly (see Testing section)
3. Register in `/js/app.js`
4. Add metadata to this document
5. Share JSON preset files for showcase

---

**Happy effect creating! 🎨**
