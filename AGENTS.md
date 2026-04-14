# AGENTS Guide for git-game

This workspace contains multiple standalone browser games. Use this file as the default operating guide for AI coding agents.

## Scope and Priority

- Make changes inside one game folder at a time unless the task explicitly spans multiple games.
- Keep each game independently runnable from its own index.html.
- Preserve existing project language style: UI text is primarily Chinese.
- If a game already has local instructions, follow them first for that game.
  - Example: [贪吃蛇/.github/copilot-instructions.md](贪吃蛇/.github/copilot-instructions.md)

## Workspace Map

- Hub page: [index.html](index.html), [styles.css](styles.css), [script.js](script.js)
- Standalone game folders: [24点/](24点), [五位一体/](五位一体), [农户过河/](农户过河), [反恐精英2D/](反恐精英2D), [吃豆人/](吃豆人), [怪物猎人/](怪物猎人), [我的世界/](我的世界), [扫雷/](扫雷), [根本守不住/](根本守不住), [植物大战僵尸2/](植物大战僵尸2), [石器时代/](石器时代), [贪吃蛇/](贪吃蛇), [超级玛丽2/](超级玛丽2), [魂斗罗/](魂斗罗), [黄金矿工/](黄金矿工)
- Game list and planning doc: [docs/reference/classic-games-by-genre.md](docs/reference/classic-games-by-genre.md)

## Run and Validate

- Most projects: open each folder's index.html directly or use Live Server.
- For local static hosting from root: `npx http-server -c-1`
- For 五位一体:
  - install deps: `npm install` in [五位一体/package.json](五位一体/package.json)
  - run: `npm run dev` or `npm start`

No unified automated test suite is configured. Validate by manual gameplay checks.

## Mobile + PC Compatibility Requirements

For any gameplay or UI change, ensure all items below are satisfied:

1. Input parity: support keyboard and touch interactions where gameplay requires directional or action input.
2. Responsive layout: verify at desktop and mobile widths (recommended checks: 1280px, 768px, 390px).
3. Viewport safety: avoid overflow/cropping of canvas, HUD, dialogs, and control buttons.
4. Touch correctness: map touch coordinates using element bounding rect for canvas/grid interactions.
5. Interaction safety: prevent accidental page scrolling during active touch gameplay where appropriate.
6. Readability: use scalable sizes (for example clamp/min/max patterns) so HUD and buttons remain legible on small screens.

If a game is keyboard-centric on desktop, add or preserve on-screen controls for mobile when needed.

## Coding Conventions

- Prefer minimal, local changes over broad refactors.
- Keep existing architecture per game (single-file games stay simple; modular games keep module boundaries).
- Use clear state-driven updates: update state first, then render.
- Keep constants/config in dedicated objects when adding tunable gameplay values.
- Do not introduce frameworks/build systems unless explicitly requested.

## Documentation Workflow

Before implementing in a game folder:

1. Read that folder's README.md for controls and feature scope.
2. Reuse existing patterns from nearby similar games.
3. Link to existing docs instead of duplicating long explanations.

Useful references:

- [24点/README.md](24点/README.md)
- [五位一体/README.md](五位一体/README.md)
- [石器时代/README.md](石器时代/README.md)
- [黄金矿工/README.md](黄金矿工/README.md)
- [docs/reference/classic-games-by-genre.md](docs/reference/classic-games-by-genre.md)

## Change Checklist Before Completion

- Confirm the target game runs without console errors.
- Verify key gameplay loop still works (start, play, end/restart flow).
- Verify both desktop and mobile interaction paths for affected features.
- Update related README.md when controls or rules change.
