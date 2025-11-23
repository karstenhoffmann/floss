# Video Export System - Technical Specification

**Version:** 1.0.0
**Date:** 2025-11-21
**Status:** MVP Specification

---

## Overview

The Video Export System allows users to export WebGL animations as MP4 videos optimized for PowerPoint presentations.

**Key Features:**
- Safe Frame cropping (define export region)
- Smart duration calculation (perfect loop detection)
- Offline frame-by-frame rendering (smooth output)
- MP4/H.264 output via canvas-record
- LocalStorage persistence

---

## Architecture

### Module Structure

```
VideoExportManager (Core)
├─ Dependencies (injected)
│  ├─ app (callbacks)
│  ├─ sceneManager (rendering)
│  ├─ playbackController (animation control)
│  └─ effectManager (current effect)
│
├─ UI Components
│  ├─ SafeFrameComponent
│  ├─ ExportPanelComponent
│  └─ ProgressOverlay
│
├─ Recording
│  ├─ canvas-record (MP4 encoding)
│  └─ OfflineRenderer (frame-by-frame)
│
└─ State Management
   ├─ ExportPresetManager (LocalStorage)
   └─ ExportState (current session)
```

---

## VideoExportManager Class

### Constructor

```javascript
constructor({ app, sceneManager, playbackController, effectManager })
```

**Parameters:**
- `app` - App instance (for callbacks like `onExportModeExit`)
- `sceneManager` - SceneManager instance (rendering)
- `playbackController` - PlaybackController instance (animation control)
- `effectManager` - EffectManager instance (current effect access)

**Initialization:**
- Creates SafeFrameComponent
- Creates ExportPanelComponent
- Loads persisted settings from LocalStorage
- Registers event listeners

---

### Public Methods

#### `enter()`
Enter Export Mode.

**Returns:** `void`

**Actions:**
1. Pause current playback
2. Store current UI state
3. Animate UI exit (sidebars fade out)
4. Show Safe Frame (centered, auto-scaled if needed)
5. Show Export Panel (bottom)
6. Calculate smart duration suggestion from current effect
7. Restore last export settings from LocalStorage
8. Enter "setup" state

**State Change:** `null` → `setup`

---

#### `exit()`
Exit Export Mode and return to normal mode.

**Returns:** `void`

**Actions:**
1. Cleanup Safe Frame
2. Cleanup Export Panel
3. Animate UI entry (sidebars fade in)
4. Restore playback state
5. Persist current export settings to LocalStorage
6. Call `app.onExportModeExit()` callback

**State Change:** `setup|recording|complete` → `null`

---

#### `startExport(options)`
Start video recording.

**Parameters:**
```javascript
{
  duration: number,        // seconds
  durationMode: string,    // 'smart' | 'custom'
  format: string,          // 'mp4' | 'webm' | 'gif'
  width: number,           // pixels (Safe Frame width)
  height: number,          // pixels (Safe Frame height)
  fps: number,             // 30 | 60
  quality: string          // 'low' | 'medium' | 'high'
}
```

**Returns:** `Promise<void>`

**Actions:**
1. Validate viewport size (warn if too small)
2. Calculate crop region from Safe Frame position
3. Create offscreen canvas (target resolution)
4. Initialize canvas-record Recorder
5. Reset animation to t=0 (via effect.reset() if available)
6. Enter "recording" state
7. Start offline frame-by-frame rendering loop
8. Update progress UI
9. On complete: stop recorder, trigger download, enter "complete" state
10. After 3s: auto-exit to normal mode

**State Change:** `setup` → `recording` → `complete` → `null`

**Error Handling:**
- Viewport too small: Show warning, offer to scale down
- canvas-record not loaded: Show error, offer retry
- Browser tab inactive: Pause recording, show warning
- Out of memory: Stop recording, show error

---

#### `cancelExport()`
Cancel ongoing export.

**Returns:** `void`

**Actions:**
1. Stop recorder
2. Cleanup offscreen canvas
3. Return to "setup" state
4. Show cancellation notification

**State Change:** `recording` → `setup`

---

#### `updateSafeFrame(x, y, width, height)`
Update Safe Frame position and dimensions.

**Parameters:**
- `x` - X position in pixels (screen coordinates)
- `y` - Y position in pixels (screen coordinates)
- `width` - Frame width in pixels
- `height` - Frame height in pixels

**Returns:** `void`

**Actions:**
1. Validate dimensions (not larger than viewport)
2. Auto-scale if necessary
3. Update SafeFrameComponent
4. Persist to LocalStorage
5. Recalculate file size estimate

---

#### `centerSafeFrame()`
Center Safe Frame in viewport.

**Returns:** `void`

**Actions:**
1. Calculate center position
2. Call `updateSafeFrame()` with new position

---

#### `applyPreset(presetId)`
Apply export preset (e.g., 'powerpoint-fhd').

**Parameters:**
- `presetId` - Preset identifier string

**Returns:** `void`

**Actions:**
1. Load preset from ExportPresetManager
2. Update Safe Frame dimensions
3. Update export settings
4. Update UI

**Available Presets:**
- `powerpoint-fhd` - 1920×1080, 30fps, MP4
- `powerpoint-hd` - 1280×720, 30fps, MP4
- `powerpoint-4k` - 3840×2160, 30fps, MP4

---

### Internal Methods

#### `_calculateCropRegion()`
Calculate crop region in canvas pixel coordinates.

**Returns:**
```javascript
{
  x: number,        // Canvas pixels
  y: number,        // Canvas pixels
  width: number,    // Canvas pixels
  height: number    // Canvas pixels
}
```

**Logic:**
```javascript
// Safe Frame is in screen coordinates
// Canvas might have different pixel ratio
const canvasRect = sceneManager.renderer.domElement.getBoundingClientRect();
const frameRect = safeFrame.getBoundingClientRect();

// Convert to canvas pixels
const scaleX = canvas.width / canvasRect.width;
const scaleY = canvas.height / canvasRect.height;

return {
  x: (frameRect.left - canvasRect.left) * scaleX,
  y: (frameRect.top - canvasRect.top) * scaleY,
  width: frameRect.width * scaleX,
  height: frameRect.height * scaleY
};
```

---

#### `_renderFrameOffline(frameNumber, totalFrames)`
Render single frame for export (offline rendering).

**Parameters:**
- `frameNumber` - Current frame index (0-based)
- `totalFrames` - Total number of frames to render

**Returns:** `Promise<void>`

**Logic:**
```javascript
// Calculate time for this frame
const timePerFrame = duration / totalFrames;
const currentTime = frameNumber * timePerFrame;

// Update animation to this exact time
effect.update(timePerFrame, currentTime);

// Render scene to main canvas
sceneManager.render();

// Copy cropped region to export canvas
const crop = this._calculateCropRegion();
exportCanvas.getContext('2d').drawImage(
  mainCanvas,
  crop.x, crop.y, crop.width, crop.height,
  0, 0, exportCanvas.width, exportCanvas.height
);

// canvas-record captures the exportCanvas
// Wait for next frame
await new Promise(resolve => requestAnimationFrame(resolve));
```

---

#### `_validateViewport()`
Check if viewport is large enough for export.

**Returns:**
```javascript
{
  valid: boolean,
  reason: string,      // Error reason if not valid
  recommendation: string  // What user should do
}
```

**Validation Rules:**
1. Safe Frame must fit in viewport with 10% margin
2. Viewport should be at least 1280×720 for PowerPoint HD
3. Warn if aspect ratio doesn't match Safe Frame

---

#### `_getSmartDuration()`
Calculate smart duration from current effect.

**Returns:**
```javascript
{
  duration: number,        // seconds
  loopPoint: number,       // seconds (where perfect loop is)
  isSeamless: boolean,     // can loop without visible cut?
  confidence: string,      // 'low' | 'medium' | 'high'
  explanation: string      // Human-readable explanation
}
```

**Logic:**
```javascript
const effect = effectManager.currentEffect;

// Try to get intelligent suggestion from effect
if (typeof effect.calculateExportSuggestion === 'function') {
  return effect.calculateExportSuggestion();
}

// Fallback: use effect defaults
const defaults = effect.constructor.exportDefaults;
return {
  duration: defaults.recommendedDuration,
  loopPoint: null,
  isSeamless: defaults.seamlessLoop,
  confidence: 'low',
  explanation: `Default duration for ${effect.constructor.metadata.name}`
};
```

---

### State Machine

**States:**
- `null` - Not in export mode
- `setup` - Export mode, configuring settings
- `recording` - Currently recording
- `complete` - Recording finished, showing success

**Transitions:**

```
null
  ↓ enter()
setup
  ↓ startExport()
recording
  ↓ recording complete
complete
  ↓ auto (3s delay) or exit()
null

recording
  ↓ cancelExport()
setup
  ↓ exit()
null
```

**State Properties:**

```javascript
state = {
  current: 'setup',

  safeFrame: {
    x: number,
    y: number,
    width: number,
    height: number,
    preset: string
  },

  exportSettings: {
    duration: number,
    durationMode: 'smart' | 'custom',
    smartSuggestion: {...},  // from _getSmartDuration()
    format: string,
    width: number,
    height: number,
    fps: number,
    quality: string,
    bitrate: number
  },

  recording: {
    startTime: number,
    currentFrame: number,
    totalFrames: number,
    progress: number,  // 0-100
    estimatedRemaining: number  // seconds
  }
}
```

---

## SafeFrameComponent

### Responsibilities
- Render visual frame overlay
- Handle drag interactions (via handles)
- Auto-scale when viewport changes
- Show dimensions label

### Public Methods

#### `show(x, y, width, height)`
Display frame at position.

#### `hide()`
Hide frame.

#### `enableDragging()`
Enable drag handles.

#### `disableDragging()`
Disable drag handles.

#### `setPreset(presetId)`
Update frame dimensions from preset.

### DOM Structure

```html
<div class="export-safe-frame">
  <!-- Dimming overlay outside frame -->
  <div class="frame-dimming"></div>

  <!-- Frame border -->
  <div class="frame-border">
    <!-- Corner markers -->
    <div class="frame-corner frame-corner--tl"></div>
    <div class="frame-corner frame-corner--tr"></div>
    <div class="frame-corner frame-corner--bl"></div>
    <div class="frame-corner frame-corner--br"></div>

    <!-- Drag handles (8 total) -->
    <div class="frame-handle frame-handle--t"></div>
    <div class="frame-handle frame-handle--r"></div>
    <div class="frame-handle frame-handle--b"></div>
    <div class="frame-handle frame-handle--l"></div>
    <div class="frame-handle frame-handle--tl"></div>
    <div class="frame-handle frame-handle--tr"></div>
    <div class="frame-handle frame-handle--bl"></div>
    <div class="frame-handle frame-handle--br"></div>
  </div>

  <!-- Label -->
  <div class="frame-label">
    1920 × 1080 (16:9) - PowerPoint Full HD
  </div>
</div>
```

---

## ExportPanelComponent

### Responsibilities
- Display export settings UI
- Handle user input
- Fire events to VideoExportManager
- Show progress during recording

### Public Methods

#### `show()`
Display panel with slide-up animation.

#### `hide()`
Hide panel with slide-down animation.

#### `setStep(step)`
Switch between UI steps (not used in MVP).

#### `updateProgress(progress, frame, totalFrames)`
Update progress bar during recording.

#### `showComplete(fileSize, filename)`
Show completion state.

### Events Fired

```javascript
// User clicks Start Export
new CustomEvent('export:start', { detail: exportSettings })

// User clicks Cancel
new CustomEvent('export:cancel')

// User clicks Back to Edit
new CustomEvent('export:back-to-edit')

// User changes Safe Frame preset
new CustomEvent('export:preset-change', { detail: { presetId } })

// User changes duration
new CustomEvent('export:duration-change', { detail: { duration, mode } })
```

---

## ExportPresetManager

### Responsibilities
- Load/save export presets to LocalStorage
- Provide default presets
- Track "last used" settings per effect

### Public Methods

#### `getPresets()`
Get all available presets.

**Returns:** `Array<Preset>`

#### `getLastUsed(effectId)`
Get last used settings for specific effect.

**Returns:** `ExportSettings | null`

#### `saveLastUsed(effectId, settings)`
Save settings as "last used" for effect.

**Returns:** `void`

#### `getDefaults()`
Get default preset definitions.

**Returns:** `Array<Preset>`

**Default Presets:**
```javascript
[
  {
    id: 'powerpoint-fhd',
    name: 'PowerPoint Full HD',
    width: 1920,
    height: 1080,
    fps: 30,
    format: 'mp4',
    codec: 'h264',
    quality: 'high',
    bitrate: 8000000
  },
  {
    id: 'powerpoint-hd',
    name: 'PowerPoint HD',
    width: 1280,
    height: 720,
    fps: 30,
    format: 'mp4',
    codec: 'h264',
    quality: 'medium',
    bitrate: 5000000
  },
  {
    id: 'powerpoint-4k',
    name: 'PowerPoint 4K',
    width: 3840,
    height: 2160,
    fps: 30,
    format: 'mp4',
    codec: 'h264',
    quality: 'high',
    bitrate: 16000000
  }
]
```

---

## Integration with App

### app.js Changes

```javascript
class App {
  constructor() {
    // ... existing setup ...

    // NEW: Video Export Manager
    this.videoExportManager = new VideoExportManager({
      app: {
        onExportModeExit: () => this.handleExportModeExit()
      },
      sceneManager: this.sceneManager,
      playbackController: this.playbackController,
      effectManager: effectManager
    });

    // Setup export event listeners
    this.setupExportListeners();
  }

  setupExportListeners() {
    // Export button click
    document.getElementById('export-video-btn')
      .addEventListener('click', () => this.enterExportMode());

    // Export panel events
    document.addEventListener('export:start', (e) => {
      this.videoExportManager.startExport(e.detail);
    });

    document.addEventListener('export:cancel', () => {
      this.videoExportManager.cancelExport();
    });

    document.addEventListener('export:back-to-edit', () => {
      this.exitExportMode();
    });
  }

  enterExportMode() {
    this.videoExportManager.enter();
    this.exportModeActive = true;
  }

  exitExportMode() {
    this.videoExportManager.exit();
    this.exportModeActive = false;
  }

  handleExportModeExit() {
    // Called by VideoExportManager after cleanup
    this.exportModeActive = false;
    notification.info('Export mode exited');
  }

  // Keyboard shortcuts - context aware
  handleKeydown(e) {
    if (this.exportModeActive) {
      this.handleExportModeShortcuts(e);
    } else {
      this.handleNormalModeShortcuts(e);
    }
  }

  handleExportModeShortcuts(e) {
    switch(e.key) {
      case 'Escape':
        this.exitExportMode();
        break;
      case ' ':
        e.preventDefault();
        // Pan mode handled by CameraController
        break;
      // ... more shortcuts
    }
  }
}
```

---

## EffectBase Changes

### New Static Method: exportDefaults

```javascript
static get exportDefaults() {
  return {
    type: 'loop',              // 'loop' | 'oneshot' | 'manual'
    recommendedDuration: 5,    // seconds
    minDuration: 1,
    maxDuration: 30,
    seamlessLoop: false        // can loop without visible cut?
  };
}
```

### New Instance Method: calculateExportSuggestion()

```javascript
/**
 * Calculate intelligent export suggestion based on current settings.
 * Override in subclass for effect-specific logic.
 *
 * @returns {Object} Suggestion object
 */
calculateExportSuggestion() {
  const defaults = this.constructor.exportDefaults;
  return {
    duration: defaults.recommendedDuration,
    loopPoint: null,  // Where perfect loop occurs (seconds)
    isSeamless: defaults.seamlessLoop,
    confidence: 'low',  // 'low' | 'medium' | 'high'
    explanation: `Default duration for ${this.constructor.metadata.name}`
  };
}
```

### New Instance Method: reset() (Optional)

```javascript
/**
 * Reset effect to initial state (t=0).
 * Optional - implement if effect needs explicit reset for export.
 */
reset() {
  // Override in subclass if needed
}
```

---

## Effect Implementation Examples

### Endless Effect (Loop with Perfect Cycle Detection)

```javascript
static get exportDefaults() {
  return {
    type: 'loop',
    recommendedDuration: 4,
    minDuration: 2,
    maxDuration: 20,
    seamlessLoop: true
  };
}

calculateExportSuggestion() {
  // Calculate when rotation completes full cycle
  const rotSpeed = this.settings.rotationSpeed || 0.5;
  const rotSpeedY = this.settings.rotationSpeedY || 0.3;

  // One complete rotation in radians
  const periodX = (2 * Math.PI) / rotSpeed;
  const periodY = (2 * Math.PI) / rotSpeedY;

  // Use longer period for seamless loop
  const loopDuration = Math.max(periodX, periodY) / 1000;  // ms to seconds

  return {
    duration: loopDuration,
    loopPoint: loopDuration,
    isSeamless: true,
    confidence: 'high',
    explanation: `One complete rotation (${loopDuration.toFixed(1)}s)`
  };
}

reset() {
  // Store current rotation offset
  this.rotationOffset = {
    x: this.mesh.rotation.x,
    y: this.mesh.rotation.y
  };
}
```

### Particles Effect (Oneshot with Completion Detection)

```javascript
static get exportDefaults() {
  return {
    type: 'oneshot',
    recommendedDuration: 8,
    minDuration: 3,
    maxDuration: 15,
    seamlessLoop: false
  };
}

calculateExportSuggestion() {
  // Estimate based on particle lifetime
  const maxLifetime = this.settings.particleLifetime || 5000;
  const dissolveDuration = maxLifetime / 1000;

  return {
    duration: dissolveDuration,
    loopPoint: null,  // No loop for oneshot
    isSeamless: false,
    confidence: 'medium',
    explanation: `Particle dissolution completes in ${dissolveDuration.toFixed(1)}s`
  };
}

isComplete() {
  // Check if all particles have faded out
  return this.particles.every(p => p.opacity <= 0.01);
}

reset() {
  // Re-initialize all particles
  this.initParticles();
}
```

---

## Error Handling

### Viewport Too Small

```javascript
const validation = videoExportManager._validateViewport();
if (!validation.valid) {
  showModal({
    title: 'Viewport Too Small',
    message: validation.reason,
    actions: [
      {
        label: 'Scale Down to Fit',
        onClick: () => {
          videoExportManager.safeFrame.autoScale();
          videoExportManager.startExport(options);
        }
      },
      {
        label: 'Resize Browser Window',
        onClick: () => {
          // Show hint
          showNotification(validation.recommendation);
        }
      },
      {
        label: 'Cancel',
        onClick: () => {}
      }
    ]
  });
}
```

### canvas-record Not Loaded

```javascript
if (typeof Recorder === 'undefined') {
  showModal({
    title: 'Video Export Not Available',
    message: 'The video export library (canvas-record) failed to load.',
    actions: [
      {
        label: 'Retry',
        onClick: () => {
          // Reload library
          loadCanvasRecord().then(() => {
            videoExportManager.startExport(options);
          });
        }
      },
      {
        label: 'Export as PNG Sequence',
        onClick: () => {
          // Fallback export
        }
      }
    ]
  });
}
```

### Browser Tab Inactive During Recording

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden && videoExportManager.state.current === 'recording') {
    videoExportManager.pauseRecording();
    showNotification('Recording paused - tab is inactive', 0);
  } else if (!document.hidden && videoExportManager.state.recordingPaused) {
    showNotification('Tab active again - resume recording?', 0, {
      action: 'Resume',
      onClick: () => videoExportManager.resumeRecording()
    });
  }
});
```

---

## Performance Considerations

### Offline Rendering Strategy

**Why Offline:**
- Guarantees smooth output regardless of system performance
- Allows higher quality than realtime
- Predictable frame timing

**How:**
```javascript
async function renderOffline(duration, fps) {
  const totalFrames = Math.ceil(duration * fps);
  const timePerFrame = 1 / fps;

  // Pause realtime clock
  sceneManager.clock.stop();

  for (let frame = 0; frame < totalFrames; frame++) {
    const currentTime = frame * timePerFrame;

    // Update animation to exact time
    effect.update(timePerFrame, currentTime);

    // Render frame
    sceneManager.render();

    // Copy to export canvas (cropped)
    copyFrameToExport();

    // Update progress
    updateProgress(frame / totalFrames * 100);

    // Yield to browser (prevent blocking)
    await yieldToMain();
  }

  // Resume realtime clock
  sceneManager.clock.start();
}

function yieldToMain() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}
```

### Memory Management

```javascript
// Create offscreen canvas once
const exportCanvas = document.createElement('canvas');
exportCanvas.width = 1920;
exportCanvas.height = 1080;

// Reuse context
const ctx = exportCanvas.getContext('2d', {
  willReadFrequently: false,
  alpha: false
});

// Cleanup after export
function cleanup() {
  exportCanvas.width = 1;
  exportCanvas.height = 1;
  ctx = null;

  // Force GC hint
  if (window.gc) window.gc();
}
```

---

## LocalStorage Schema

### Keys

```javascript
'floss_export_presets'           // Array<Preset>
'floss_export_last_used_{effectId}'  // ExportSettings per effect
'floss_export_safe_frame'        // Safe Frame position/dimensions
```

### Data Structures

```javascript
// floss_export_safe_frame
{
  x: number,
  y: number,
  width: number,
  height: number,
  preset: string,
  lastUpdated: timestamp
}

// floss_export_last_used_endless
{
  duration: 4.2,
  durationMode: 'smart',
  format: 'mp4',
  width: 1920,
  height: 1080,
  fps: 30,
  quality: 'high',
  lastUsed: timestamp
}
```

---

## Testing Checklist

### Unit Tests
- [ ] ExportPresetManager CRUD operations
- [ ] Crop region calculation accuracy
- [ ] Smart duration calculation for each effect
- [ ] State machine transitions

### Integration Tests
- [ ] Enter/exit export mode
- [ ] Safe Frame positioning and dragging
- [ ] Settings persistence across sessions
- [ ] Viewport resize handling

### E2E Tests
- [ ] Complete export flow (setup → record → download)
- [ ] Cancel during recording
- [ ] Back to edit button
- [ ] Multiple exports in sequence

### Manual Tests
- [ ] Export on different viewport sizes
- [ ] Export with different effects
- [ ] Export with various durations
- [ ] Browser tab switch during recording
- [ ] Memory usage during long exports

---

## Future Enhancements (Post-MVP)

- [ ] Timeline scrubber for preview
- [ ] Multiple quality presets (Low/Medium/High)
- [ ] GIF export support
- [ ] PNG sequence export (fallback)
- [ ] Custom frame rate selection
- [ ] Batch export (multiple durations)
- [ ] Export history
- [ ] Cloud storage integration
- [ ] Social media presets (Instagram, TikTok)

---

## Dependencies

### External Libraries
- **canvas-record** (v5.5.0) - MP4 encoding via WebCodecs/MP4Wasm
  - CDN: `https://unpkg.com/canvas-record@5.5.0/dist/canvas-record.min.js`
  - Size: ~200KB (gzipped)
  - License: MIT

### Browser Requirements
- **Chrome 94+** (WebCodecs support) - Primary target
- Safari/Firefox - Fallback via MP4Wasm (slower, larger)

---

## References

- [canvas-record Documentation](https://github.com/dmnsgn/canvas-record)
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [PowerPoint Video Formats](https://support.microsoft.com/en-us/office/video-and-audio-file-formats-supported-in-powerpoint-d8b12450-26db-4c7b-a5c1-593d3418fb59)
- [H.264 Encoding Best Practices](https://trac.ffmpeg.org/wiki/Encode/H.264)

---

**End of Specification**
