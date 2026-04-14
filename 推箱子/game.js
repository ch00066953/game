(() => {
  /* ===== 关卡数据 =====
   * #=墙  .=目标  @=玩家  +=玩家在目标上
   * $=箱子  *=箱子在目标上   (空格)=地面
   * 关卡来自经典 Sokoban 关卡集（Microban 系列简化版）
   */
  const LEVELS = [
    // Level 1 - 简单入门
    [
      '  ###  ',
      '  #.#  ',
      '  # ###',
      '###$ $.#',
      '#. $@###',
      '####   ',
    ],
    // Level 2
    [
      '####  ',
      '#  ###',
      '# $  #',
      '## $.#',
      ' #@. #',
      ' #####',
    ],
    // Level 3
    [
      '  ####',
      '###  #',
      '#@$. #',
      '# $. #',
      '#  ###',
      '####  ',
    ],
    // Level 4
    [
      '#####',
      '#   #',
      '#.$.#',
      '# $@#',
      '#. $#',
      '#####',
    ],
    // Level 5
    [
      '  ####  ',
      '### @###',
      '#  $$  #',
      '# .  . #',
      '#  ##  #',
      '########',
    ],
    // Level 6
    [
      '######',
      '#    #',
      '# ## #',
      '# $. #',
      '#@$. #',
      '######',
    ],
    // Level 7
    [
      ' ##### ',
      '##   ##',
      '#  $  #',
      '# .#. #',
      '#  $  #',
      '## @ ##',
      ' ##### ',
    ],
    // Level 8
    [
      '  #####',
      '###   #',
      '# $ # #',
      '#  .$.#',
      '#  .# #',
      '##@ ###',
      ' ####  ',
    ],
    // Level 9
    [
      '########',
      '#  #   #',
      '# $$   #',
      '#  # ..#',
      '# @#   #',
      '########',
    ],
    // Level 10
    [
      ' ###### ',
      '## @  ##',
      '#  $$$ #',
      '# .#.  #',
      '#  ... #',
      '#  #$  #',
      '########',
    ]
  ];

  const TILES = { EMPTY: 0, WALL: 1, FLOOR: 2, TARGET: 3, BOX: 4, BOX_DONE: 5, PLAYER: 6 };
  const EMOJIS = { [TILES.EMPTY]: '', [TILES.WALL]: '', [TILES.FLOOR]: '', [TILES.TARGET]: '◇', [TILES.BOX]: '📦', [TILES.BOX_DONE]: '✅', [TILES.PLAYER]: '🧑' };
  const CLASSES = { [TILES.EMPTY]: 'cell-empty', [TILES.WALL]: 'cell-wall', [TILES.FLOOR]: 'cell-floor', [TILES.TARGET]: 'cell-target', [TILES.BOX]: 'cell-box', [TILES.BOX_DONE]: 'cell-box-done', [TILES.PLAYER]: 'cell-player' };

  const DIR = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

  const boardEl = document.getElementById('board');
  const levelNumEl = document.getElementById('levelNum');
  const totalLevelsEl = document.getElementById('totalLevels');
  const stepsEl = document.getElementById('steps');
  const statusEl = document.getElementById('statusText');
  const undoBtn = document.getElementById('undoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  let currentLevel = Number(localStorage.getItem('sokoban_level') || 0);
  let grid, targets, playerR, playerC, steps, history;

  totalLevelsEl.textContent = LEVELS.length;

  function parseLevel(lvl) {
    const rows = LEVELS[lvl];
    const maxCols = Math.max(...rows.map(r => r.length));
    const g = [];
    const t = [];
    let pr = 0, pc = 0;

    for (let r = 0; r < rows.length; r++) {
      const row = [];
      for (let c = 0; c < maxCols; c++) {
        const ch = (rows[r] || '')[c] || ' ';
        switch (ch) {
          case '#': row.push(TILES.WALL); break;
          case '.': row.push(TILES.FLOOR); t.push([r, c]); break;
          case '@': row.push(TILES.FLOOR); pr = r; pc = c; break;
          case '+': row.push(TILES.FLOOR); t.push([r, c]); pr = r; pc = c; break;
          case '$': row.push(TILES.FLOOR); break;
          case '*': row.push(TILES.FLOOR); t.push([r, c]); break;
          case ' ': row.push(TILES.EMPTY); break;
          default: row.push(TILES.EMPTY);
        }
      }
      g.push(row);
    }

    // 确定箱子和玩家位置
    const boxes = [];
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < maxCols; c++) {
        const ch = (rows[r] || '')[c] || ' ';
        if (ch === '$' || ch === '*') boxes.push([r, c]);
      }
    }

    return { grid: g, targets: t, playerR: pr, playerC: pc, boxes };
  }

  function loadLevel(lvl) {
    if (lvl < 0 || lvl >= LEVELS.length) return;
    currentLevel = lvl;
    localStorage.setItem('sokoban_level', lvl);

    const parsed = parseLevel(lvl);
    grid = parsed.grid;
    targets = parsed.targets;
    playerR = parsed.playerR;
    playerC = parsed.playerC;
    steps = 0;
    history = [];

    // 放置箱子
    parsed.boxes.forEach(([r, c]) => {
      grid[r][c] = TILES.FLOOR; // 先清为地板
    });
    // 箱子标记到单独数组管理，存 grid 里
    parsed.boxes.forEach(([r, c]) => {
      // 不改 grid，用 render 叠加
    });

    // 用独立存储
    state = {
      boxes: parsed.boxes.map(([r, c]) => [r, c]),
      pr: parsed.playerR,
      pc: parsed.playerC
    };

    updateHUD();
    render();
    statusEl.textContent = '方向键移动';
  }

  let state;

  function isTarget(r, c) {
    return targets.some(([tr, tc]) => tr === r && tc === c);
  }

  function hasBox(r, c) {
    return state.boxes.some(([br, bc]) => br === r && bc === c);
  }

  function movePlayer(dir) {
    const [dr, dc] = DIR[dir];
    const nr = state.pr + dr;
    const nc = state.pc + dc;

    // 边界和墙
    if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) return false;
    if (grid[nr][nc] === TILES.WALL || grid[nr][nc] === TILES.EMPTY) return false;

    // 检查目标位置是否有箱子
    const boxIdx = state.boxes.findIndex(([br, bc]) => br === nr && bc === nc);
    if (boxIdx >= 0) {
      // 尝试推箱子
      const bnr = nr + dr;
      const bnc = nc + dc;
      if (bnr < 0 || bnr >= grid.length || bnc < 0 || bnc >= grid[0].length) return false;
      if (grid[bnr][bnc] === TILES.WALL || grid[bnr][bnc] === TILES.EMPTY) return false;
      if (hasBox(bnr, bnc)) return false;

      // 保存历史
      history.push({
        pr: state.pr, pc: state.pc,
        boxes: state.boxes.map(([r, c]) => [r, c]),
        boxIdx, bfr: nr, bfc: nc, btr: bnr, btc: bnc
      });

      state.boxes[boxIdx] = [bnr, bnc];
    } else {
      history.push({
        pr: state.pr, pc: state.pc,
        boxes: state.boxes.map(([r, c]) => [r, c]),
        boxIdx: -1
      });
    }

    state.pr = nr;
    state.pc = nc;
    steps++;
    updateHUD();
    render();
    checkWin();
    return true;
  }

  function undo() {
    if (!history.length) return;
    const h = history.pop();
    state.pr = h.pr;
    state.pc = h.pc;
    state.boxes = h.boxes;
    steps = Math.max(0, steps - 1);
    updateHUD();
    render();
  }

  function checkWin() {
    const allDone = targets.every(([tr, tc]) => hasBox(tr, tc));
    if (allDone) {
      statusEl.textContent = '🎉 过关！' + (currentLevel < LEVELS.length - 1 ? ' 点击"下一关"继续' : ' 全部通关！');
    }
  }

  /* ===== 渲染 ===== */
  function render() {
    const rows = grid.length;
    const cols = grid[0].length;
    boardEl.style.gridTemplateColumns = `repeat(${cols}, clamp(28px, 7vw, 48px))`;
    boardEl.innerHTML = '';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell ';

        // 基础地形
        const tile = grid[r][c];
        const onTarget = isTarget(r, c);
        const boxHere = hasBox(r, c);
        const playerHere = (r === state.pr && c === state.pc);

        if (tile === TILES.WALL) {
          cellEl.classList.add('cell-wall');
        } else if (tile === TILES.EMPTY) {
          cellEl.classList.add('cell-empty');
        } else if (playerHere) {
          cellEl.classList.add(onTarget ? 'cell-player' : 'cell-player');
          cellEl.textContent = '🧑';
        } else if (boxHere) {
          cellEl.classList.add(onTarget ? 'cell-box-done' : 'cell-box');
          cellEl.textContent = onTarget ? '✅' : '📦';
        } else if (onTarget) {
          cellEl.classList.add('cell-target');
          cellEl.textContent = '◇';
        } else {
          cellEl.classList.add('cell-floor');
        }

        boardEl.appendChild(cellEl);
      }
    }
  }

  function updateHUD() {
    levelNumEl.textContent = currentLevel + 1;
    stepsEl.textContent = steps;
  }

  /* ===== 输入 ===== */
  const KEY_DIR = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right'
  };

  document.addEventListener('keydown', e => {
    const dir = KEY_DIR[e.code];
    if (dir) {
      e.preventDefault();
      movePlayer(dir);
      return;
    }
    if (e.code === 'KeyZ' || (e.ctrlKey && e.code === 'KeyZ')) {
      e.preventDefault();
      undo();
      return;
    }
    if (e.code === 'KeyR') {
      e.preventDefault();
      loadLevel(currentLevel);
    }
  });

  // 虚拟方向键
  document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => movePlayer(btn.dataset.dir));
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      movePlayer(btn.dataset.dir);
    }, { passive: false });
  });

  // 触摸滑动
  let touchSX, touchSY;
  boardEl.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touchSX = t.clientX;
    touchSY = t.clientY;
  }, { passive: true });

  boardEl.addEventListener('touchend', e => {
    if (touchSX == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchSX;
    const dy = t.clientY - touchSY;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < 20) return;
    if (ax > ay) {
      movePlayer(dx > 0 ? 'right' : 'left');
    } else {
      movePlayer(dy > 0 ? 'down' : 'up');
    }
    touchSX = null;
  }, { passive: true });

  // 按钮
  undoBtn.addEventListener('click', undo);
  resetBtn.addEventListener('click', () => loadLevel(currentLevel));
  prevBtn.addEventListener('click', () => { if (currentLevel > 0) loadLevel(currentLevel - 1); });
  nextBtn.addEventListener('click', () => { if (currentLevel < LEVELS.length - 1) loadLevel(currentLevel + 1); });

  /* ===== 启动 ===== */
  loadLevel(currentLevel);
})();
