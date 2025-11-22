# Video Export Implementation TODO

## Current Status (v4.0.0 - BROKEN)

**Problem:** canvas-record import from esm.sh fails with GIFEncoder dependency error

```
GIFEncoder.js:1 Uncaught SyntaxError: The requested module '/gifenc@^1.0.3?target=es2022'
does not provide an export named 'GIFEncoder'
```

**Root Cause:**
- v4.0.0 tried to import canvas-record from CDN (esm.sh)
- Complex library with many dependencies (GIF, WebM, MP4 encoders)
- CDN can't resolve all dependencies correctly

## Deployment Philosophy (from CLAUDE.md)

**CRITICAL:** ALL dependencies MUST be vendored in `/lib/` directory!
- ✅ App must work via copy & paste deployment
- ✅ No build process, no npm install
- ✅ Open index.html → works immediately
- ❌ NO CDN imports for critical features

See CLAUDE.md section: "Deployment Philosophy - Copy & Paste Portability"

## Solution Options for Next Session

### Option A: Vendor canvas-record (RECOMMENDED)
**What:** Download canvas-record + dependencies to `/lib/canvas-record/`

**How:**
1. User manually downloads canvas-record package
2. Extract to `/lib/canvas-record/`
3. Update import: `from './lib/canvas-record/index.js'`
4. Works perfectly, battle-tested library

**Pros:**
- ✅ Proven, tested library
- ✅ WebCodecs H.264 when available, MediaRecorder fallback
- ✅ Frame-perfect with .step() API
- ✅ ~200KB (acceptable)

**Cons:**
- ⚠️ Requires manual download/extract

---

### Option B: MediaRecorder (Realtime Capture)
**What:** Use native MediaRecorder API with proper realtime rendering

**How:**
```javascript
recorder.start();

function animate() {
    effect.update(dt, elapsedTime);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();

// After duration
recorder.stop();
```

**Pros:**
- ✅ Zero dependencies
- ✅ Works everywhere
- ✅ Simple implementation

**Cons:**
- ⚠️ Only 1× realtime (slow for long videos)
- ⚠️ Frame-perfection depends on browser load

---

### Option C: WebCodecs + Simple Muxer
**What:** Use WebCodecs API directly, vendor small muxer library

**How:**
1. Vendor `mp4-muxer` (~40KB) to `/lib/mp4-muxer.js`
2. Implement WebCodecs encoder (~100 lines)
3. Use muxer to create MP4

**Pros:**
- ✅ Frame-perfect
- ✅ Fast (can render faster than realtime)
- ✅ Small dependency

**Cons:**
- ⚠️ Firefox doesn't have WebCodecs (needs fallback)
- ⚠️ More complex than Option A

---

## Recommendation

**Start with Option A (canvas-record vendored)**
- Most reliable
- User expectation: frame-perfect export
- If vendoring is too complex, fall back to Option B

## Files to Check

- `js/core/video-export.js` - Currently imports from esm.sh (BROKEN)
- `service-worker.js` - Has esm.sh URLs in cache (remove when fixed)
- `CLAUDE.md` - Deployment philosophy documented ✓
- `js/version.js` - Currently 4.0.0 (broken version)

## Next Steps

1. Choose option (A, B, or C)
2. Implement chosen solution
3. Update version to 4.0.1 or 4.1.0
4. Test frame-by-frame playback
5. Delete this TODO file when complete
