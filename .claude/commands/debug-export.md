---
description: Debug video export issues with systematic troubleshooting steps
---

# Debug Video Export Issues

You are troubleshooting video export functionality.

**CRITICAL: Read docs/VIDEO_EXPORT_SPEC.md first** - Complete technical reference for the export system.

---

## Quick Diagnostic Checklist

Run through this checklist systematically:

### 1. Effect Export Configuration
- [ ] Effect has `static get exportDefaults()` method
- [ ] Effect has `calculateExportSuggestion()` method
- [ ] `exportDefaults.type` is either 'loop' or 'oneshot'
- [ ] `calculateExportSuggestion()` returns all required fields

**Check:**
```javascript
// In browser console:
const effect = window.app.sceneManager.activeEffect;
console.log('Export Defaults:', effect.constructor.exportDefaults);
console.log('Export Suggestion:', effect.calculateExportSuggestion());
```

### 2. Export Mode State
- [ ] Export mode is entered successfully
- [ ] UI updates to Export Mode layout
- [ ] Safe Frame is visible
- [ ] Export Panel appears

**Check:**
```javascript
// In browser console:
console.log('Export Mode:', window.app.state.exportMode);
// Should be 'setup', 'recording', or 'complete'
```

### 3. Safe Frame Rendering
- [ ] Safe Frame overlay is visible
- [ ] Frame is 1920×1080 (16:9)
- [ ] Frame is centered in viewport
- [ ] Resize handles are visible

**Check:**
```javascript
// In browser console:
const safeFrame = window.app.videoExportManager.safeFrame;
console.log('Safe Frame:', safeFrame.getFrameRect());
// Should return { x, y, width: 1920, height: 1080 }
```

### 4. Recording Process
- [ ] canvas-record library is loaded
- [ ] Recorder initializes without errors
- [ ] Frames are rendered at correct rate
- [ ] Progress updates correctly

**Check:**
```javascript
// In browser console (during recording):
const recorder = window.app.videoExportManager.recorder;
console.log('Recorder:', recorder);
console.log('Frame count:', window.app.videoExportManager.currentFrame);
```

### 5. Video Output
- [ ] MP4 file downloads automatically
- [ ] Video is 1920×1080 resolution
- [ ] Video loops seamlessly (for loop effects)
- [ ] Video plays in PowerPoint

---

## Common Issues and Solutions

### Issue: Export button doesn't appear

**Symptoms:**
- Export UI controls are missing
- Export mode can't be entered

**Possible causes:**
1. Effect missing export configuration
2. VideoExportManager not initialized
3. UI component not registered

**Debug steps:**
```javascript
// 1. Check effect export config
const effect = window.app.sceneManager.activeEffect;
console.log('Has exportDefaults?', !!effect.constructor.exportDefaults);
console.log('Has calculateExportSuggestion?', !!effect.calculateExportSuggestion);

// 2. Check VideoExportManager
console.log('VideoExportManager:', window.app.videoExportManager);

// 3. Check UI state
console.log('Export Mode:', window.app.state.exportMode);
```

**Solutions:**
- Add `exportDefaults` and `calculateExportSuggestion()` to effect
- Verify VideoExportManager is created in app.js
- Check console for initialization errors

---

### Issue: Safe Frame is not visible

**Symptoms:**
- Export mode entered but no frame overlay
- Can't see what will be exported

**Possible causes:**
1. SafeFrameComponent not initialized
2. Canvas z-index issues
3. Frame outside viewport

**Debug steps:**
```javascript
// 1. Check SafeFrame instance
const safeFrame = window.app.videoExportManager.safeFrame;
console.log('SafeFrame:', safeFrame);
console.log('Is visible?', safeFrame.isVisible);

// 2. Check frame position
const rect = safeFrame.getFrameRect();
console.log('Frame rect:', rect);
console.log('Window size:', window.innerWidth, window.innerHeight);

// 3. Check DOM element
const frameElement = document.querySelector('.safe-frame-overlay');
console.log('Frame element:', frameElement);
console.log('Computed style:', window.getComputedStyle(frameElement));
```

**Solutions:**
- Verify SafeFrameComponent is created and attached to DOM
- Check CSS z-index (should be above canvas, below controls)
- Ensure frame is scaled to fit viewport if larger

---

### Issue: Recording fails to start

**Symptoms:**
- Click "Start Recording" but nothing happens
- Error in console about Recorder

**Possible causes:**
1. canvas-record library not loaded
2. Browser doesn't support WebCodecs
3. Invalid export configuration

**Debug steps:**
```javascript
// 1. Check library
console.log('canvas-record available?', typeof Recorder !== 'undefined');

// 2. Check browser support
console.log('WebCodecs?', 'VideoEncoder' in window);

// 3. Check export options
const options = window.app.videoExportManager.getExportOptions();
console.log('Export options:', options);
```

**Solutions:**
- Verify canvas-record script tag in index.html
- Use MP4Wasm fallback for Safari/Firefox
- Check export duration is valid (> 0, < maxDuration)

---

### Issue: Video doesn't loop seamlessly

**Symptoms:**
- Video has a visible jump when looping
- Animation doesn't complete full cycle

**Possible causes:**
1. Wrong export duration calculated
2. Effect not reset to t=0 before recording
3. Animation speed inconsistent

**Debug steps:**
```javascript
// 1. Check calculated duration
const effect = window.app.sceneManager.activeEffect;
const suggestion = effect.calculateExportSuggestion();
console.log('Export suggestion:', suggestion);
console.log('Duration:', suggestion.duration);
console.log('Loop point:', suggestion.loopPoint);

// 2. Check if effect has reset()
console.log('Has reset()?', typeof effect.reset === 'function');

// 3. Test loop calculation manually
const rotSpeed = effect.settings.rotationSpeed;
const period = (2 * Math.PI) / rotSpeed;
console.log('Expected period:', period);
console.log('Actual duration:', suggestion.duration);
```

**Solutions:**
- Fix `calculateExportSuggestion()` formula
- Implement `reset()` method in effect
- Ensure animation uses `elapsedTime` not `deltaTime` for position

---

### Issue: Video is wrong resolution

**Symptoms:**
- Video is not 1920×1080
- Video is blurry or pixelated
- Aspect ratio is wrong

**Possible causes:**
1. Offscreen canvas wrong size
2. Renderer pixel ratio incorrect
3. Safe Frame not respecting 16:9

**Debug steps:**
```javascript
// 1. Check offscreen canvas
const manager = window.app.videoExportManager;
console.log('Offscreen canvas:', manager.offscreenCanvas);
console.log('Canvas size:', manager.offscreenCanvas.width, manager.offscreenCanvas.height);

// 2. Check renderer
console.log('Renderer size:', manager.offscreenRenderer.getSize(new THREE.Vector2()));
console.log('Pixel ratio:', manager.offscreenRenderer.getPixelRatio());

// 3. Check safe frame
const rect = manager.safeFrame.getFrameRect();
console.log('Safe Frame:', rect.width, rect.height, rect.width / rect.height);
```

**Solutions:**
- Set offscreen canvas to exactly 1920×1080
- Set pixel ratio to 1 (not window.devicePixelRatio)
- Verify Safe Frame aspect ratio is 16:9

---

### Issue: Export is slow or choppy

**Symptoms:**
- Recording takes very long
- Exported video has dropped frames
- Browser freezes during export

**Possible causes:**
1. Frame rate too high
2. Complex effect (too many vertices/shaders)
3. Not using offline rendering

**Debug steps:**
```javascript
// 1. Check frame rate
const options = window.app.videoExportManager.getExportOptions();
console.log('Frame rate:', options.fps);

// 2. Check effect complexity
const effect = window.app.sceneManager.activeEffect;
console.log('Mesh:', effect.mesh);
console.log('Vertices:', effect.geometry?.attributes.position.count);

// 3. Monitor performance
const startTime = Date.now();
// ... after export completes
const duration = (Date.now() - startTime) / 1000;
const expectedFrames = options.duration * options.fps;
console.log('Frames per second:', expectedFrames / duration);
```

**Solutions:**
- Use 30fps (not 60fps) for export
- Simplify effect geometry during export
- Ensure rendering is frame-by-frame (not realtime)
- Add progress UI to show it's working

---

### Issue: PowerPoint won't accept video

**Symptoms:**
- MP4 file won't import to PowerPoint
- Video plays in browser but not PowerPoint
- PowerPoint shows codec error

**Possible causes:**
1. Wrong codec (not H.264)
2. Wrong container (not MP4)
3. Unsupported profile/level

**Debug steps:**
```bash
# Use ffprobe to check video format (if available)
ffprobe exported-video.mp4

# Or check in browser DevTools Network tab
# Look at Content-Type header
```

```javascript
// Check recorder configuration
const recorderOptions = {
    encoder: 'h264-mp4',  // Must be exactly this
    resolution: 1920,
    frameRate: 30,
    bitrate: 8_000_000
};
console.log('Recorder options:', recorderOptions);
```

**Solutions:**
- Verify canvas-record encoder is 'h264-mp4' (not 'webm' or 'gif')
- Check PowerPoint version (2019+ required for some codecs)
- Try reducing bitrate if file is corrupt
- Ensure resolution is exactly 1920×1080

---

## Debugging Workflow

**Step-by-step systematic debugging:**

1. **Isolate the problem:**
   - Does it happen with all effects or just one?
   - Does it happen on first export or after multiple exports?
   - Does it happen in all browsers or just one?

2. **Check the console:**
   - Open DevTools → Console
   - Look for red errors
   - Look for yellow warnings
   - Check Network tab for failed requests

3. **Verify effect configuration:**
   ```javascript
   const effect = window.app.sceneManager.activeEffect;
   console.log('Effect:', effect.constructor.metadata.name);
   console.log('Export defaults:', effect.constructor.exportDefaults);
   console.log('Export suggestion:', effect.calculateExportSuggestion());
   console.log('Has reset?', typeof effect.reset === 'function');
   ```

4. **Check export state:**
   ```javascript
   const manager = window.app.videoExportManager;
   console.log('Export mode:', window.app.state.exportMode);
   console.log('Current frame:', manager.currentFrame);
   console.log('Total frames:', manager.totalFrames);
   console.log('Safe Frame rect:', manager.safeFrame.getFrameRect());
   ```

5. **Test with minimal effect:**
   - Create simple effect (single rotating cube)
   - Test export with that
   - If works, issue is in complex effect
   - If fails, issue is in export system

6. **Check docs:**
   - Read VIDEO_EXPORT_SPEC.md for technical details
   - Read PLUGIN_SPEC.md for effect requirements
   - Check DECISIONS.md for architectural choices

---

## Console Debugging Helpers

**Add these to browser console for quick debugging:**

```javascript
// Quick export status
function exportStatus() {
    const app = window.app;
    const effect = app.sceneManager.activeEffect;
    const manager = app.videoExportManager;

    return {
        effect: effect?.constructor.metadata.name,
        exportMode: app.state.exportMode,
        hasExportDefaults: !!effect?.constructor.exportDefaults,
        hasCalculateSuggestion: !!effect?.calculateExportSuggestion,
        suggestion: effect?.calculateExportSuggestion(),
        safeFrame: manager?.safeFrame?.getFrameRect(),
        recording: {
            currentFrame: manager?.currentFrame,
            totalFrames: manager?.totalFrames,
            progress: manager?.currentFrame / manager?.totalFrames * 100 + '%'
        }
    };
}

// Run: exportStatus()
```

```javascript
// Force export mode (for testing UI)
function enterExportMode() {
    window.app.videoExportManager.enter();
}

function exitExportMode() {
    window.app.videoExportManager.exit();
}
```

```javascript
// Test export calculation
function testExportCalc() {
    const effect = window.app.sceneManager.activeEffect;
    const settings = effect.settings;

    console.log('Current settings:', settings);
    console.log('Export defaults:', effect.constructor.exportDefaults);
    console.log('Calculated suggestion:', effect.calculateExportSuggestion());

    // Test with different rotation speeds
    const originalSpeed = settings.rotationSpeed;
    for (let speed = 0.1; speed <= 2.0; speed += 0.3) {
        effect.settings.rotationSpeed = speed;
        const suggestion = effect.calculateExportSuggestion();
        console.log(`Speed ${speed.toFixed(1)}: duration ${suggestion.duration.toFixed(2)}s`);
    }
    effect.settings.rotationSpeed = originalSpeed;
}
```

---

## When to Check docs/VIDEO_EXPORT_SPEC.md

Read the full spec when:
- ✅ Implementing new export features
- ✅ Debugging state machine transitions
- ✅ Understanding integration points
- ✅ Checking error handling requirements
- ✅ Implementing new effect export behavior

**Key sections:**
- VideoExportManager API (line ~50)
- State Machine (line ~200)
- Integration Points (line ~400)
- Error Handling (line ~600)

---

**Systematically work through the checklists above, and report any errors found in the console.**
