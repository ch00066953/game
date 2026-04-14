(() => {
  /* ===== 配置 ===== */
  const BUBBLE_R = 18;
  const COLS = 10;
  const ROWS_INIT = 5;
  const COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#2ecc71'];
  const SHOOT_SPEED = 10;
  const MIN_MATCH = 3;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const levelEl = document.getElementById('level');
  const statusEl = document.getElementById('statusText');
  const restartBtn = document.getElementById('restartBtn');

  let W, H, ratio;
  let grid, shooter, currentBubble, nextColor, score, level, phase, aimAngle;
  let animId;

  /* ===== 尺寸 ===== */
  function resize() {
    const wrap = canvas.parentElement;
    W = Math.min(480, wrap.clientWidth - 8);
    H = W * 1.4;
    ratio = window.devicePixelRatio || 1;
    canvas.width = W * ratio;
    canvas.height = H * ratio;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  /* ===== 网格 ===== */
  // 泡泡使用六角网格：偶数行左对齐，奇数行偏移半个泡泡
  function gridX(r, c) {
    const d = BUBBLE_R * 2;
    const offset = (r % 2 === 1) ? BUBBLE_R : 0;
    return BUBBLE_R + c * d + offset;
  }

  function gridY(r) {
    return BUBBLE_R + r * (BUBBLE_R * 1.73);
  }

  function maxColsForRow(r) {
    return (r % 2 === 1) ? COLS - 1 : COLS;
  }

  function randomColor() {
    // 只从当前场上存在的颜色中挑选
    const existing = new Set();
    for (let r = 0; r < grid.length; r++)
      for (let c = 0; c < grid[r].length; c++)
        if (grid[r][c]) existing.add(grid[r][c]);
    if (existing.size === 0) return COLORS[Math.floor(Math.random() * COLORS.length)];
    const arr = [...existing];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function initGrid() {
    grid = [];
    for (let r = 0; r < ROWS_INIT + level - 1; r++) {
      const cols = maxColsForRow(r);
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(COLORS[Math.floor(Math.random() * Math.min(3 + level, COLORS.length))]);
      }
      grid.push(row);
    }
  }

  function init() {
    resize();
    score = 0;
    level = 1;
    aimAngle = -Math.PI / 2;
    initGrid();
    nextColor = randomColor();
    spawnShooter();
    phase = 'aim';
    updateHUD();
  }

  function spawnShooter() {
    currentBubble = {
      x: W / 2,
      y: H - BUBBLE_R - 20,
      color: nextColor,
      dx: 0,
      dy: 0,
      active: false
    };
    nextColor = randomColor();
  }

  /* ===== 发射 ===== */
  function shoot() {
    if (phase !== 'aim') return;
    currentBubble.dx = Math.cos(aimAngle) * SHOOT_SPEED;
    currentBubble.dy = Math.sin(aimAngle) * SHOOT_SPEED;
    currentBubble.active = true;
    phase = 'flying';
  }

  /* ===== 碰撞检测 ===== */
  function snapToGrid(bx, by) {
    let bestR = 0, bestC = 0, bestDist = Infinity;
    // 检查已有行+1
    const maxR = grid.length + 1;
    for (let r = 0; r < maxR; r++) {
      const cols = maxColsForRow(r);
      for (let c = 0; c < cols; c++) {
        const gx = gridX(r, c);
        const gy = gridY(r);
        const dist = Math.hypot(bx - gx, by - gy);
        if (dist < bestDist) {
          bestDist = dist;
          bestR = r;
          bestC = c;
        }
      }
    }
    return { r: bestR, c: bestC };
  }

  function hitsGrid(bx, by) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c]) continue;
        const gx = gridX(r, c);
        const gy = gridY(r);
        if (Math.hypot(bx - gx, by - gy) < BUBBLE_R * 1.8) return true;
      }
    }
    return by - BUBBLE_R <= gridY(0);
  }

  function getNeighbors(r, c) {
    const even = r % 2 === 0;
    const offsets = even
      ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
      : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    return offsets.map(([dr, dc]) => [r + dr, c + dc]);
  }

  function findConnected(r, c, color) {
    const visited = new Set();
    const stack = [[r, c]];
    const result = [];
    while (stack.length) {
      const [cr, cc] = stack.pop();
      const key = cr + ',' + cc;
      if (visited.has(key)) continue;
      visited.add(key);
      if (cr < 0 || cr >= grid.length) continue;
      if (cc < 0 || cc >= (grid[cr] ? grid[cr].length : 0)) continue;
      if (grid[cr][cc] !== color) continue;
      result.push([cr, cc]);
      getNeighbors(cr, cc).forEach(n => stack.push(n));
    }
    return result;
  }

  function findFloating() {
    // BFS from top row
    const attached = new Set();
    const queue = [];
    if (grid.length === 0) return [];
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[0][c]) {
        queue.push([0, c]);
        attached.add('0,' + c);
      }
    }
    while (queue.length) {
      const [cr, cc] = queue.shift();
      getNeighbors(cr, cc).forEach(([nr, nc]) => {
        const key = nr + ',' + nc;
        if (attached.has(key)) return;
        if (nr < 0 || nr >= grid.length) return;
        if (nc < 0 || nc >= (grid[nr] ? grid[nr].length : 0)) return;
        if (!grid[nr][nc]) return;
        attached.add(key);
        queue.push([nr, nc]);
      });
    }
    const floating = [];
    for (let r = 0; r < grid.length; r++)
      for (let c = 0; c < grid[r].length; c++)
        if (grid[r][c] && !attached.has(r + ',' + c))
          floating.push([r, c]);
    return floating;
  }

  function placeBubble() {
    const { r, c } = snapToGrid(currentBubble.x, currentBubble.y);
    // 扩展 grid 如有需要
    while (grid.length <= r) {
      const cols = maxColsForRow(grid.length);
      grid.push(Array(cols).fill(null));
    }
    if (c >= 0 && c < grid[r].length) {
      grid[r][c] = currentBubble.color;
    }

    // 消除
    const matches = findConnected(r, c, currentBubble.color);
    let removed = 0;
    if (matches.length >= MIN_MATCH) {
      matches.forEach(([mr, mc]) => { grid[mr][mc] = null; removed++; });
      // 移除浮空泡泡
      const floating = findFloating();
      floating.forEach(([fr, fc]) => { grid[fr][fc] = null; removed++; });
      score += removed * 10;
    }

    // 去掉底部空行
    while (grid.length > 0 && grid[grid.length - 1].every(v => !v)) grid.pop();

    // 检查胜利
    const allEmpty = grid.every(row => row.every(v => !v));
    if (allEmpty) {
      level++;
      initGrid();
      statusEl.textContent = '🎉 第 ' + (level - 1) + ' 关过关！';
    }

    // 检查失败：泡泡到达底部
    const maxGridY = grid.length > 0 ? gridY(grid.length - 1) : 0;
    if (maxGridY > H - 80) {
      phase = 'lost';
      statusEl.textContent = '游戏结束 — 点击重玩';
      updateHUD();
      return;
    }

    spawnShooter();
    phase = 'aim';
    updateHUD();
  }

  /* ===== 更新 ===== */
  function update() {
    if (phase === 'flying' && currentBubble.active) {
      currentBubble.x += currentBubble.dx;
      currentBubble.y += currentBubble.dy;

      // 墙壁反弹
      if (currentBubble.x - BUBBLE_R <= 0 || currentBubble.x + BUBBLE_R >= W) {
        currentBubble.dx = -currentBubble.dx;
        currentBubble.x = Math.max(BUBBLE_R, Math.min(W - BUBBLE_R, currentBubble.x));
      }

      // 顶部或碰撞
      if (hitsGrid(currentBubble.x, currentBubble.y)) {
        placeBubble();
      }
    }
  }

  /* ===== 渲染 ===== */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 背景网格线
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let y = 0; y < H; y += BUBBLE_R * 2) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // 泡泡网格
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c]) continue;
        const x = gridX(r, c);
        const y = gridY(r);
        drawBubble(x, y, grid[r][c]);
      }
    }

    // 瞄准线
    if (phase === 'aim') {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(currentBubble.x, currentBubble.y);
      ctx.lineTo(
        currentBubble.x + Math.cos(aimAngle) * 150,
        currentBubble.y + Math.sin(aimAngle) * 150
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 当前泡泡
    drawBubble(currentBubble.x, currentBubble.y, currentBubble.color);

    // 下一个颜色预览
    ctx.globalAlpha = 0.6;
    drawBubble(40, H - BUBBLE_R - 20, nextColor, BUBBLE_R * 0.6);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('下一个', 40, H - 2);

    // 失败遮罩
    if (phase === 'lost') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('游戏结束', W / 2, H / 2 - 10);
      ctx.font = '16px sans-serif';
      ctx.fillText('点击重玩', W / 2, H / 2 + 20);
    }
  }

  function drawBubble(x, y, color, r) {
    r = r || BUBBLE_R;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    // 高光
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function updateHUD() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
  }

  /* ===== 输入 ===== */
  function setAim(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const sx = (clientX - rect.left) * (W / rect.width);
    const sy = (clientY - rect.top) * (H / rect.height);
    const angle = Math.atan2(sy - currentBubble.y, sx - currentBubble.x);
    // 限制向上发射
    aimAngle = Math.max(-Math.PI + 0.15, Math.min(-0.15, angle));
  }

  canvas.addEventListener('mousemove', e => {
    if (phase === 'aim') setAim(e.clientX, e.clientY);
  });

  canvas.addEventListener('click', e => {
    if (phase === 'aim') {
      setAim(e.clientX, e.clientY);
      shoot();
    } else if (phase === 'lost') {
      init();
    }
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (phase === 'aim') setAim(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    if (phase === 'aim') shoot();
    else if (phase === 'lost') init();
  }, { passive: false });

  // 键盘
  document.addEventListener('keydown', e => {
    if (phase === 'aim') {
      if (e.code === 'ArrowLeft') aimAngle = Math.max(-Math.PI + 0.15, aimAngle - 0.05);
      if (e.code === 'ArrowRight') aimAngle = Math.min(-0.15, aimAngle + 0.05);
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); shoot(); }
    }
  });

  restartBtn.addEventListener('click', init);

  window.addEventListener('resize', () => {
    resize();
    draw();
  });

  /* ===== 启动 ===== */
  init();
  loop();
})();
