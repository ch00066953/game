# Docs Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize planning documents into typed folders, add a docs index, and provide reusable planning templates without breaking existing links.

**Architecture:** Keep the docs system lightweight by grouping files into planning, reference, standards, and templates. Migrate the four existing docs into those folders, then update all relative links and prompt references to the new paths.

**Tech Stack:** Markdown files, repository documentation structure

---

### Task 1: Create target directories and docs entrypoint

**Files:**
- Create: `docs/README.md`
- Create: `docs/templates/game-project-brief-template.md`
- Create: `docs/templates/implementation-plan-template.md`

- [ ] Create the docs index page with links to planning, reference, standards, templates, and superpowers specs/plans.
- [ ] Add a single-game planning template with sections for goal, core loop, MVP scope, risks, dual-platform input, milestones, and acceptance.
- [ ] Add an implementation plan template with sections for scope, file changes, task breakdown, risks, verification, and doc sync.

### Task 2: Migrate existing docs into typed folders

**Files:**
- Create: `docs/reference/classic-games-by-genre.md`
- Create: `docs/planning/game-roadmap-2026.md`
- Create: `docs/planning/game-task-backlog.md`
- Create: `docs/standards/mobile-pc-acceptance-checklist.md`
- Delete: `docs/classic-games-by-genre.md`
- Delete: `docs/game-roadmap-2026.md`
- Delete: `docs/game-task-backlog.md`
- Delete: `docs/mobile-pc-acceptance-checklist.md`

- [ ] Copy each existing document into its new typed folder.
- [ ] Update internal relative links inside the migrated docs to point to the new locations.
- [ ] Remove the old top-level copies after the migrated files are in place.

### Task 3: Update repository references to new doc paths

**Files:**
- Modify: `AGENTS.md`
- Modify: `.github/prompts/完善游戏规划.prompt.md`
- Modify: `.github/prompts/单游戏立项.prompt.md`

- [ ] Update AGENTS references from top-level docs paths to the new planning/reference/standards paths.
- [ ] Update prompt context links so planning prompts read the reorganized docs correctly.

### Task 4: Verify doc discoverability

**Files:**
- Modify: `docs/superpowers/specs/2026-04-14-docs-structure-design.md` (only if needed for consistency)

- [ ] Verify every moved doc still has working relative links.
- [ ] Verify the docs index gives a clear entry path for future planning work.
- [ ] Keep the spec unchanged unless a path inconsistency needs correction.