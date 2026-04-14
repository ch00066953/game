(() => {
  const SIZE = 4;
  const boardEl = document.getElementById('board');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const statusEl = document.getElementById('statusText');
  const restartBtn = document.getElementById('restartBtn');

  let grid, score, best, won, over;

  function init() {
    grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    score = 0;
    won = false;
    over = false;
    best = Number(localStorage.getItem('2048_best') || 0);
    addRandom();
    addRandom();
    render();
    statusEl.textContent = '';
  }

  function addRandom() {
    const empty = [];
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++)
        if (grid[r][c] === 0) empty.push([r, c]);
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return [r, c];
  }

  /* ===== 核心逻辑 ===== */
  function slide(row) {
    let arr = row.filter(v => v !== 0);
    const merged = [];
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        merged.push(i);
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(v => v !== 0);
    while (arr.length < SIZE) arr.push(0);
    return { result: arr, merged };
  }

  function move(dir) {
    if (over) return false;
    let moved = false;
    const newGrid = grid.map(r => [...r]);

    if (dir === 'left' || dir === 'right') {
      for (let r = 0; r < SIZE; r++) {
        let row = [...grid[r]];
        if (dir === 'right') row.reverse();
        const { result } = slide(row);
        if (dir === 'right') result.reverse();
        for (let c = 0; c < SIZE; c++) {
          if (newGrid[r][c] !== result[c]) moved = true;
          newGrid[r][c] = result[c];
        }
      }
    } else {
      for (let c = 0; c < SIZE; c++) {
        let col = [];
        for (let r = 0; r < SIZE; r++) col.push(grid[r][c]);
        if (dir === 'down') col.reverse();
        const { result } = slide(col);
        if (dir === 'down') result.reverse();
        for (let r = 0; r < SIZE; r++) {
          if (newGrid[r][c] !== result[r]) moved = true;
          newGrid[r][c] = result[r];
        }
      }
    }

    if (moved) {
      grid = newGrid;
      addRandom();
      if (score > best) {
        best = score;
        localStorage.setItem('2048_best', best);
      }
      render();

      // 检查胜利
      if (!won) {
        for (let r = 0; r < SIZE; r++)
          for (let c = 0; c < SIZE; c++)
            if (grid[r][c] === 2048) {
              won = true;
              statusEl.textContent = '🎉 达成 2048！可以继续挑战';
            }
      }

      // 检查游戏结束
      if (!canMove()) {
        over = true;
        statusEl.textContent = '游戏结束 — 无可用移动';
      }
    }
    return moved;
  }

  function canMove() {
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return true;
        if (c < SIZE - 1 && grid[r][c] === grid[r][c + 1]) return true;
        if (r < SIZE - 1 && grid[r][c] === grid[r + 1][c]) return true;
      }
    return false;
  }

  /* ===== 渲染 ===== */
  function render() {
    scoreEl.textContent = score;
    bestEl.textContent = best;
    boardEl.innerHTML = '';

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = grid[r][c];
        const cell = document.createElement('div');
        if (val === 0) {
          cell.className = 'cell';
        } else {
          cell.className = 'tile';
          if (val > 2048) cell.classList.add('tile-super');
          cell.dataset.value = val;
          cell.textContent = val;
        }
        boardEl.appendChild(cell);
      }
    }
  }

  /* ===== 输入 ===== */
  const KEY_MAP = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    KeyA: 'left', KeyD: 'right', KeyW: 'up', KeyS: 'down'
  };

  document.addEventListener('keydown', e => {
    const dir = KEY_MAP[e.code];
    if (dir) {
      e.preventDefault();
      move(dir);
    }
  });

  // 触摸滑动
  let touchStartX, touchStartY;

  document.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    if (touchStartX == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 30) return; // 太短不算

    let dir;
    if (absDx > absDy) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    move(dir);
    touchStartX = null;
    touchStartY = null;
  }, { passive: true });

  restartBtn.addEventListener('click', init);

  /* ===== 启动 ===== */
  init();
})();
