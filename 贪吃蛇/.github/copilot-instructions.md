# Copilot Instructions for this repository

## Project snapshot
- This is a single-page browser game (no build step, no framework): [index.html](index.html) + [styles.css](styles.css) + [game.js](game.js).
- All game logic is centralized in [game.js](game.js); UI is DOM-driven and stateful.
- The game is a 20x20 grid snake game with 5 stages, including a special infinite/random stage.

## Core architecture to preserve
- Stage behavior is data-driven via `STAGES` in [game.js](game.js): each stage defines `name`, `targetScore`, `speed`, `obstacles`, and `background`.
- Runtime state lives in mutable globals (`gameState`, `snake`, `food`, `direction`, `nextDirection`, `gameLoop`) in [game.js](game.js).
- Main loop uses `setInterval(update, gameState.speed)`; `update()` is the single tick entry point.
- Rendering is full-board repaint each tick (`renderBoard()` clears classes, then paints snake/food/obstacles).
- Grid mapping convention: `cellIndex = y * GRID_SIZE + x`; cell DOM ids are `cell-${index}`.

## Stage-specific rules you must not break
- Stage 5 (`currentStage === 5`) is infinite mode: `targetScore` is `null`, progress displays `∞`, and each food adds one adjacent obstacle.
- Stage 5 obstacles are regenerated on selection/reset (`createRandomStageFiveObstacles(8)`) and mutate in-place (`STAGES[5].obstacles.push(...)`).
- Start position must remain obstacle-safe via `getStageStartPosition()` (stage 4 prefers `{x:1,y:1}`, others center).

## Input/gameplay conventions
- Direction input is buffered (`nextDirection`) and applied once per tick to avoid multi-turn glitches.
- Reverse-direction prevention is axis-based in `handleKeyPress()`; preserve this when changing controls.
- Stage buttons are disabled during active play and re-enabled on end/reset; this lock prevents mid-run stage mutation.

## UI/styling conventions
- Stage theme is applied by setting `document.body.className` to `STAGES[stage].background`.
- Obstacles use mixed visual types by index parity (`obstacle-tree` / `obstacle-rock`) in `renderBoard()`.
- Cache-busting query params are hardcoded in [index.html](index.html) (`styles.css?v=...`, `game.js?v=...`); bump when needed for static hosting cache refresh.

## Developer workflow in this repo
- No test suite or bundler is configured; validate by running in a browser and manually exercising stage select, start/pause/reset, collisions, and stage transitions.
- Fast local run options are documented in [README.md](README.md): open [index.html](index.html) directly, use Live Server, or run a simple static HTTP server.

## When implementing changes
- Prefer extending `STAGES` and existing functions instead of introducing new architectural layers.
- Keep text/UI copy in Chinese to match existing UX content.
- If you change score/progression logic, update both `updateProgress()` and stage completion checks in `update()`/`completeStage()` to keep behavior consistent.
