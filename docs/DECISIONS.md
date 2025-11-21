# Architecture Decision Records (ADR)

**Purpose:** Document all significant architectural and design decisions to prevent redoing the same analysis in future Claude Code sessions.

**Format:** Each ADR follows a simple structure:
- **ADR-XXX**: Title
- **Date**: When decided
- **Status**: Accepted | Superseded | Deprecated
- **Context**: What problem we're solving
- **Decision**: What we decided to do
- **Consequences**: Trade-offs and implications
- **Alternatives Considered**: What we didn't choose and why

---

## ADR-001: Hybrid Communication Pattern for Video Export System

**Date:** 2025-11-21
**Status:** Accepted

### Context

The video export system requires coordination between:
- Core systems (VideoExportManager, SceneManager, EffectManager)
- UI components (ExportPanel, SafeFrame, main UI)
- User interactions (button clicks, keyboard shortcuts)

We need to decide on a communication architecture that balances:
- Simplicity and maintainability
- Testability
- Performance
- Code clarity

### Decision

Use a **Hybrid Communication Pattern**:

1. **Core-to-Core Communication**: Direct method calls
   ```javascript
   // VideoExportManager → SceneManager
   this.sceneManager.setEffect(effect);
   this.sceneManager.render();
   ```

2. **UI-to-Core Communication**: Custom Events (one-way)
   ```javascript
   // ExportPanel → VideoExportManager
   document.dispatchEvent(new CustomEvent('export:start', { detail: options }));
   ```

3. **Core-to-UI Updates**: Callbacks/Events
   ```javascript
   // VideoExportManager → ExportPanel
   this.emit('progress', { frame: 45, total: 150 });
   ```

### Consequences

**Positive:**
- ✅ Core systems remain decoupled from UI implementation
- ✅ Direct calls between core systems are simple and efficient
- ✅ UI can be tested independently
- ✅ Events provide natural decoupling for UI interactions

**Negative:**
- ❌ Mixed patterns require clear documentation
- ❌ Event listeners need proper cleanup
- ❌ Some learning curve for contributors

**Neutral:**
- 🔄 More complex than pure event-driven, simpler than full pub/sub

### Alternatives Considered

1. **Pure Event-Driven (Full Pub/Sub)**
   - ❌ Rejected: Overkill for small codebase
   - ❌ Harder to debug (events everywhere)
   - ❌ Performance overhead for core systems

2. **Pure Direct Calls**
   - ❌ Rejected: Tight coupling between UI and core
   - ❌ Hard to test UI independently
   - ❌ Circular dependencies risk

3. **Flux/Redux Pattern**
   - ❌ Rejected: Too heavyweight for this project
   - ❌ Requires state management library
   - ❌ Overkill without complex state mutations

---

## ADR-002: No Timeline/Keyframes in Video Export MVP

**Date:** 2025-11-21
**Status:** Accepted

### Context

User requested video export functionality. Two possible approaches:

1. **With Timeline/Keyframes**: Full animation control
   - User can define start/end of animation
   - Keyframe-based parameter changes
   - Scrubbing timeline
   - Complex UI (timeline editor, keyframe markers)

2. **Without Timeline/Keyframes**: Simpler recording
   - Effects animate themselves
   - User sets parameters once
   - Recording captures continuous playback
   - Minimal UI (duration input, record button)

Estimated effort:
- With timeline: ~3 weeks development
- Without timeline: ~2 days development

### Decision

**Implement MVP WITHOUT timeline/keyframes** for the following reasons:

1. **Scope Management**
   - MVP can be delivered in 2 days vs 3 weeks
   - User can test PowerPoint integration immediately
   - Reduces risk of scope creep

2. **Current Architecture**
   - Effects already have self-contained animation logic
   - Perfect loop calculation already exists per-effect
   - No existing timeline infrastructure to build on

3. **Use Case Alignment**
   - Primary use case: Looping backgrounds for PowerPoint
   - Effects are designed to loop seamlessly
   - Most effects don't need complex timeline control

4. **Incremental Approach**
   - Timeline can be added later if needed
   - MVP validates PowerPoint workflow first
   - User feedback will guide timeline necessity

User explicitly agreed: *"Ok, ich stimme zu - wir sollten Deinen Vorschlag ohne Timeline/Keyframes umsetzen."*

### Consequences

**Positive:**
- ✅ Fast delivery (2 days vs 3 weeks)
- ✅ Simpler codebase and maintenance
- ✅ Leverages existing effect animation logic
- ✅ Validates PowerPoint use case quickly
- ✅ Can add timeline later if needed

**Negative:**
- ❌ No parameter animation over time
- ❌ Can't define custom start/end points (effects control this)
- ❌ Can't scrub through animation
- ❌ Limited to effect's built-in animation

**Workarounds:**
- Effects define their own perfect loop points via `calculateExportSuggestion()`
- User can adjust effect settings before recording
- Multiple exports with different settings if variation needed

### Alternatives Considered

1. **Full Timeline/Keyframes System**
   - ❌ Rejected: 3 weeks effort, high complexity
   - ❌ Not validated by user need yet
   - 🔄 Could revisit after MVP success

2. **Simple Timeline (No Keyframes)**
   - ❌ Rejected: Still requires timeline UI
   - ❌ Doesn't solve parameter animation need
   - ❌ Adds complexity without full benefit

---

## ADR-003: Use canvas-record Library for MP4 Export

**Date:** 2025-11-21
**Status:** Accepted

### Context

Video export requires encoding canvas frames to MP4/H.264 format for PowerPoint compatibility.

PowerPoint requirements:
- Container: MP4
- Codec: H.264
- Resolution: 1920×1080 (16:9)
- Frame rate: 30fps
- Must work in PowerPoint 2019+

Browser export options:
1. MediaRecorder API (WebM only, not MP4)
2. Canvas streams with external encoder
3. Third-party encoding libraries
4. Server-side encoding

### Decision

Use **canvas-record** library (https://github.com/dmnsgn/canvas-record) for client-side MP4 encoding.

Key features:
- ✅ WebCodecs API for native H.264 encoding (Chrome/Edge)
- ✅ MP4Wasm fallback for Firefox/Safari
- ✅ Outputs true MP4 files (not WebM)
- ✅ Client-side (no server required)
- ✅ ~200KB minified (acceptable overhead)
- ✅ Active maintenance (last update 2024)
- ✅ MIT License (permissive)

Integration approach:
```javascript
import { Recorder } from 'canvas-record';

const recorder = Recorder(canvas, {
    encoder: 'h264-mp4',      // Force MP4 output
    resolution: 1920,          // 1080p
    frameRate: 30,
    bitrate: 8_000_000        // 8 Mbps
});

await recorder.start();
// Render frames...
await recorder.stop();       // Downloads MP4
```

### Consequences

**Positive:**
- ✅ PowerPoint compatibility guaranteed (H.264/MP4)
- ✅ No server infrastructure needed
- ✅ Works offline (PWA compatible)
- ✅ Modern browsers supported (WebCodecs)
- ✅ Fallback for older browsers (MP4Wasm)
- ✅ Acceptable bundle size (~200KB)

**Negative:**
- ❌ Adds external dependency
- ❌ WebCodecs not supported in Safari (uses fallback)
- ❌ Encoding performance varies by browser
- ❌ Limited control over encoder settings

**Neutral:**
- 🔄 Dependency on third-party library (but well-maintained)
- 🔄 200KB overhead (acceptable for desktop app)

### Alternatives Considered

1. **MediaRecorder API (WebM)**
   - ❌ Rejected: PowerPoint doesn't support WebM
   - ❌ Would require server-side transcoding
   - ✅ Native browser API (no dependency)

2. **FFmpeg.wasm (Client-side)**
   - ❌ Rejected: ~30MB bundle size (way too large)
   - ❌ Memory intensive (crashes on mobile)
   - ✅ Full FFmpeg feature set

3. **Server-Side Encoding**
   - ❌ Rejected: Breaks offline-first architecture
   - ❌ Requires backend infrastructure
   - ❌ Privacy concerns (uploading user content)
   - ✅ Best encoding quality

4. **Raw Frames + Manual MP4 Muxing**
   - ❌ Rejected: Complex implementation
   - ❌ Would need to write MP4 muxer
   - ❌ Browser compatibility issues
   - ❌ High development effort

---

## How to Add New ADRs

When making significant architectural decisions:

1. **Discuss options** with clear trade-offs
2. **Document decision** using ADR template above
3. **Add to this file** with sequential ADR number
4. **Reference in code** if relevant:
   ```javascript
   // ADR-003: Using canvas-record for MP4 export
   import { Recorder } from 'canvas-record';
   ```

**What qualifies as an ADR-worthy decision?**
- ✅ Technology/library selection
- ✅ Architecture patterns
- ✅ Data structures for complex systems
- ✅ API design choices
- ✅ Performance vs complexity trade-offs
- ✅ Scope decisions (what NOT to build)
- ❌ Minor implementation details
- ❌ Obvious best practices
- ❌ Temporary workarounds

---

## Superseded/Deprecated ADRs

*None yet. When an ADR is superseded, move it here and link to the new ADR that replaces it.*

---

**Last Updated:** 2025-11-21
