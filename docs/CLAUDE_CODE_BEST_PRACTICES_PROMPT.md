# Claude Code Best Practices Setup Prompt

**Purpose:** This is a generic prompt you can use in ANY repository to ask Claude Code to implement comprehensive best practices for documentation, decision tracking, and workflow automation.

**How to use:**
1. Start a new Claude Code session in your repository
2. Copy the entire prompt below (between the `---` markers)
3. Paste it into Claude Code
4. Claude will implement all best practices automatically

---

## 🚀 THE PROMPT (Copy Everything Below)

```
I want you to implement comprehensive Claude Code session best practices in this repository. These practices will reduce mental load, prevent repetition, and ensure knowledge persists across sessions.

Please implement the following systematically:

## 1. Self-Maintaining Documentation System

Create or update `CLAUDE.md` in the repository root with:

### Required Sections:

**A. Critical Session Start Instructions**
- What to read first (order matters!)
- Environment-specific requirements (e.g., testing via GitHub Pages vs local)
- Common pitfalls to avoid BEFORE starting work
- Quick reference for repetitive tasks

**B. Documentation Maintenance Guidelines**
Include explicit rules for when and how to update documentation:

- **When to update docs:**
  - ✅ Adding new features
  - ✅ Changing APIs
  - ✅ Refactoring architecture
  - ✅ Finding better practices
  - ✅ Discovering inconsistencies

- **Documentation Hierarchy:** (where to document what)
  - CLAUDE.md: Session context, workflows, critical reminders
  - [PROJECT]_SPEC.md: API documentation, development guides
  - docs/*.md: Deep technical specifications
  - README.md: User-facing documentation

- **Self-Check Before Finishing Session:**
  Create a checklist Claude should run through before completing work:
  - [ ] Added features? → Are they documented?
  - [ ] Changed APIs? → Is spec updated?
  - [ ] Refactored? → Are docs updated?
  - [ ] Found inconsistencies? → Did I fix them?

- **Meta-Documentation Rule:**
  "If these guidelines are insufficient, UPDATE THIS SECTION with better guidelines"

**C. Common Pitfalls Section**
Document project-specific mistakes that waste time:

Categories to include:
- Development mistakes (forgetting required methods, wrong patterns)
- Testing/deployment mistakes (wrong branch, cache issues)
- Documentation mistakes (contradictions, missing updates)

Format each pitfall as:
```
**N. Pitfall Name**

❌ WRONG: [bad example code/workflow]

✅ CORRECT: [correct example code/workflow]

**Why it matters:** [consequence of doing it wrong]
```

**D. Workflow Checklists**
For repetitive tasks, create step-by-step checklists:
- Session start checklist
- After making changes checklist
- Before finishing session checklist

Include specific reminders for your environment (e.g., "TELL USER to update GitHub Pages settings")

## 2. Architecture Decision Records (ADR)

Create `docs/DECISIONS.md` with:

### ADR Template:
```markdown
## ADR-XXX: Decision Title

**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded | Deprecated

### Context
What problem we're solving, what constraints exist

### Decision
What we decided to do and how

### Consequences
**Positive:**
- ✅ Benefits

**Negative:**
- ❌ Trade-offs

**Neutral:**
- 🔄 Other considerations

### Alternatives Considered
1. **Alternative Name**
   - ❌ Why rejected
   - ✅ What it would have provided
```

### When to Add ADRs:
Document decisions about:
- ✅ Technology/library selection
- ✅ Architecture patterns
- ✅ Data structures for complex systems
- ✅ API design choices
- ✅ Scope decisions (what NOT to build)

NOT:
- ❌ Minor implementation details
- ❌ Obvious best practices
- ❌ Temporary workarounds

### Initial ADRs to Create:
Document the 2-3 most important architectural decisions already made in this project.

## 3. Slash Commands for Repetitive Tasks

Create `.claude/commands/` directory with command files for common tasks.

### Identify Top 3-5 Repetitive Tasks in this project:

For EACH task, create a `.md` file with:

```yaml
---
description: Brief description of what this command does
---

# Command Title

[Detailed instructions, checklists, code templates, common mistakes]
```

**Generic Slash Command Template:**

```markdown
---
description: [One-line description]
---

# [Task Name]

**CRITICAL: Read [relevant docs] first**

---

## Questions to Ask User

Before implementing, gather:
1. [Required information]
2. [Constraints/preferences]
3. [Expected behavior]

---

## Implementation Steps

### 1. [First Step]
[Code example or instructions]

### 2. [Second Step]
[Code example or instructions]

---

## Testing Checklist

After implementation:
- [ ] [Test 1]
- [ ] [Test 2]
- [ ] [Test 3]

---

## Common Mistakes to Avoid

❌ **Mistake 1** - [Why it's wrong]
✅ **Correct approach** - [How to do it right]

❌ **Mistake 2** - [Why it's wrong]
✅ **Correct approach** - [How to do it right]

---

## Example Prompts

**Good prompt:**
> "[Detailed, specific request with context]"

**Bad prompt:**
> "[Vague request without details]"
```

## 4. Documentation Quality Standards

Ensure all documentation follows these rules:

**MUST have:**
- ✅ Clear examples (every API has code example)
- ✅ Consistent formatting (follow existing style)
- ✅ No outdated info (delete/update obsolete sections)
- ✅ Cross-references (link related sections)
- ✅ Checklists (for multi-step processes)
- ✅ Rationale (explain WHY not just WHAT)

**Commit message format for docs:**
```bash
docs: Add <feature> documentation
docs: Update <section> for <reason>
docs: Fix inconsistency in <file>

Example:
"docs: Update API documentation for export configuration

- Add Export Configuration section to spec
- Update all examples
- Add to development checklist

Reason: Video export system requires this method"
```

## 5. Project-Specific Customizations

After implementing the above, analyze THIS repository and:

1. **Identify this project's unique challenges:**
   - What mistakes happen most often?
   - What questions get asked repeatedly?
   - What workflows are confusing?

2. **Create project-specific sections in CLAUDE.md:**
   - Technology-specific gotchas
   - Testing/deployment quirks
   - Domain-specific patterns

3. **Suggest 3-5 most useful slash commands for THIS project**

## Implementation Checklist

Please implement in this order:

- [ ] Create/Update CLAUDE.md with all required sections
- [ ] Create docs/DECISIONS.md with ADR template
- [ ] Document 2-3 most important existing architectural decisions
- [ ] Create .claude/commands/ directory
- [ ] Create 3-5 slash commands for most repetitive tasks
- [ ] Add Common Pitfalls section to CLAUDE.md
- [ ] Add Documentation Maintenance Guidelines to CLAUDE.md
- [ ] Add workflow checklists to CLAUDE.md
- [ ] Commit all changes with clear messages

## After Implementation

1. **Test the system:**
   - Try using a slash command
   - Verify CLAUDE.md has all critical info
   - Check ADRs document key decisions

2. **Self-improve:**
   - If you find these instructions unclear, update them
   - If you discover better practices, add them
   - This is LIVING documentation

## Success Criteria

After implementation, future Claude Code sessions should:
- ✅ Know exactly what to read first
- ✅ Never forget critical steps (checklists!)
- ✅ Not repeat architectural discussions (ADRs!)
- ✅ Use slash commands for common tasks
- ✅ Automatically update documentation when making changes
- ✅ Avoid common pitfalls (documented!)

---

**Start implementing now. Work systematically through the checklist above.**
```

---

## 📋 What This Prompt Does

When you give this prompt to Claude Code in a new repository, it will:

1. **Analyze your project** to understand its structure and needs
2. **Create CLAUDE.md** with comprehensive session context
3. **Create docs/DECISIONS.md** with Architecture Decision Records
4. **Create .claude/commands/** with project-specific slash commands
5. **Document common pitfalls** to avoid wasted time
6. **Set up self-maintaining documentation** that persists across sessions

## 🎯 Why This Works

**For Claude Code:**
- CLAUDE.md is read automatically at session start
- Slash commands provide task templates
- ADRs prevent redoing decisions
- Checklists prevent forgetting steps

**For You (The Developer):**
- Less mental load (checklists handle it)
- Less repetition (slash commands automate it)
- Better quality (pitfalls are documented)
- Knowledge persists (doesn't reset each session)

## 🔧 Customization Tips

**For different project types:**

### Web App Projects
Focus slash commands on:
- Creating new components
- Adding API endpoints
- Deploying/testing workflows
- Debugging common issues

### Library/SDK Projects
Focus slash commands on:
- Adding new API methods
- Writing tests
- Updating documentation
- Publishing new versions

### Data Science Projects
Focus slash commands on:
- Adding new models
- Running experiments
- Documenting results
- Preparing datasets

## 📝 Example Session After Setup

**Before best practices:**
```
You: "Add a new feature X"
Claude: *implements feature*
You: "Don't forget to update the docs!"
Claude: "Oh right, let me do that"
You: "And did you add tests?"
Claude: "Oops, let me add those"
You: "What about that design decision we made last time?"
Claude: "I don't have context from previous sessions..."
```

**After best practices:**
```
You: "Add a new feature X"
Claude:
- Reads CLAUDE.md automatically
- Checks ADRs for relevant decisions
- Uses /new-feature slash command
- Follows checklist:
  ✅ Implement feature
  ✅ Add tests
  ✅ Update docs
  ✅ Check pitfalls
  ✅ Commit with clear message
You: "Perfect, thanks!"
```

## 🚀 Start Using This Now

1. Copy the prompt between the markers above
2. Paste into a new Claude Code session in your repository
3. Let Claude implement everything systematically
4. Enjoy reduced mental load and better quality!

---

**This prompt template is itself self-modifying documentation. If you discover improvements while using it, update this file!**
