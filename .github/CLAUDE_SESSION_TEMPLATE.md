# Claude Code Session Template

Use this template to start new Claude Code sessions with full project context.

---

## Session Initialization Prompt

```
I'm working on **Floss**, a professional kinetic typography tool.

**Quick Context:**
- Project: Offline-first WebGL kinetic typography app
- Tech: THREE.js, GSAP, Native ESM (no build step)
- Deployment: GitHub Pages (master branch)
- Architecture: Hybrid UMD+ESM with sequential loading

**Read these files for full context:**
1. `CLAUDE.md` - Complete technical documentation
2. `README.md` - User-facing overview
3. `CHANGELOG.md` - Recent changes

**Current focus:** [DESCRIBE YOUR TASK HERE]

Please read CLAUDE.md first, then let me know you're ready to continue.
```

---

## Common Session Types

### 1. Bug Fix Session
```
Bug: [DESCRIPTION]
Error: [CONSOLE OUTPUT OR NETWORK TAB]
Context: [WHEN IT HAPPENS]

Files likely involved:
- [file1.js]
- [file2.css]

Please read CLAUDE.md first, then help me debug this.
```

### 2. New Feature Session
```
Feature Request: [DESCRIPTION]

Relevant sections in CLAUDE.md:
- [Section name]

Design considerations:
- Keep offline-first architecture
- No build step
- Match Rive-inspired UI style

Please read CLAUDE.md, then let's plan the implementation.
```

### 3. Refactoring Session
```
Refactoring Goal: [WHAT TO IMPROVE]

Current state: [FILE/SECTION]
Desired state: [GOAL]

Constraints:
- Maintain offline-first
- Keep sequential script loading
- Don't break Service Worker cache

Please read CLAUDE.md for architecture context.
```

### 4. Documentation Update Session
```
Documentation Task: [WHAT TO UPDATE]

Reason: [WHY IT NEEDS UPDATING]

Files to update:
- [ ] CLAUDE.md
- [ ] README.md
- [ ] CHANGELOG.md
- [ ] Code comments

Please read current docs first, then help me update them.
```

---

## Session Checklist

Before starting work, Claude should:
- [ ] Read `CLAUDE.md` for full project context
- [ ] Understand the hybrid UMD+ESM architecture
- [ ] Know that script loading order is critical
- [ ] Understand Service Worker cache versioning
- [ ] Know the deployment process (master → GitHub Pages)

---

## Common Gotchas (Remind Claude!)

### Critical Architecture Points
1. **Script Loading:** ESM modules MUST load after UMD globals (index.html:232-275)
2. **Service Worker:** Bump `CACHE_VERSION` in sw.js when updating cached files
3. **Import Maps:** Must be defined before any `<script type="module">`
4. **GitHub Pages:** Deploys from master root, takes ~1 minute, caches aggressively

### Development Workflow
1. Test locally with `python3 -m http.server 8080`
2. Test offline: DevTools → Application → Service Workers → Offline
3. Clear cache when testing SW changes
4. Commit to feature branch (`claude/*`)
5. PR to master when ready
6. Wait ~1 min for GitHub Pages deployment

---

## File Priority Reading Order

For new sessions, Claude should read in this order:

1. **CLAUDE.md** (5 min) - Full technical context
2. **index.html** (2 min) - Script loading architecture
3. **js/index.js** (2 min) - App initialization
4. **Task-specific files** - Based on the session goal

---

## Documentation Update Protocol

When Claude makes significant changes:

### During Development
- Update code comments inline
- Note breaking changes
- Document new patterns

### Before Committing
- [ ] Update `CLAUDE.md` if architecture changed
- [ ] Update `README.md` if user-facing features changed
- [ ] Add entry to `CHANGELOG.md` under `[Unreleased]`
- [ ] Update this template if workflow changed

### Commit Message Format
```
<type>: <short description>

<detailed explanation if needed>

Files changed:
- file1.js - what changed and why
- file2.css - what changed and why

Documentation updated:
- [ ] CLAUDE.md
- [ ] README.md
- [ ] CHANGELOG.md
```

---

## Testing Checklist

Before marking task complete:

### Functionality
- [ ] App loads without console errors
- [ ] WebGL canvas renders correctly
- [ ] UI controls respond as expected
- [ ] Effects switch correctly
- [ ] Keyboard shortcuts work

### Offline-First
- [ ] Service Worker registers successfully
- [ ] All resources cached on first load
- [ ] App works offline (DevTools offline mode)
- [ ] Cache version bumped if needed

### Cross-Browser (if UI/CSS changes)
- [ ] Chrome (primary target)
- [ ] Safari (if time permits)
- [ ] Firefox (if time permits)

### Deployment
- [ ] Changes committed with clear message
- [ ] Pushed to appropriate branch
- [ ] PR created if ready for master
- [ ] Tested on GitHub Pages after deployment

---

## Emergency Recovery

### If something breaks in production:

1. **Quick Fix:** Point GitHub Pages to last known good branch
   - Settings → Pages → Change branch

2. **Revert:** Create revert PR
   ```bash
   git revert <bad-commit>
   git push origin master
   ```

3. **Investigate:** Start new Claude session with:
   ```
   Production is broken. Issue: [DESCRIPTION]

   Last known good commit: [SHA]
   Breaking commit: [SHA]

   Please read CLAUDE.md, then help me:
   1. Identify root cause
   2. Create fix
   3. Test thoroughly
   4. Deploy safely
   ```

---

## Session End Checklist

Before ending the Claude Code session:

- [ ] All changes committed
- [ ] Documentation updated
- [ ] CHANGELOG.md entry added
- [ ] Changes pushed to remote
- [ ] PR created if appropriate
- [ ] No uncommitted work left
- [ ] Session notes added to this template if new patterns emerged

---

**Last Updated:** 2025-11-18
**Template Version:** 1.0.0
