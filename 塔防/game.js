(() => {
  /* ===== 配置 ===== */
  const TILE = 40;
  const MAP_COLS = 16;
  const MAP_ROWS = 10;

  // 地图: 0=空地可建, 1=路径, 2=不可建
  const MAP = [
    [2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,1,2,2,0,0,0,0,0,0,0,0,2,2,2],
    [2,2,1,2,2,0,2,2,2,2,2,2,0,2,2,2],
    [2,2,1,1,1,1,1,1,2,2,2,2,0,0,0,2],
    [2,2,0,0,0,0,0,1,2,2,2,2,2,2,0,2],
    [2,2,2,2,2,2,0,1,2,2,0,0,0,0,0,2],
    [2,0,0,0,0,0,0,1,1,1,1,1,2,2,2,2],
    [2,0,2,2,2,2,2,2,0,0,0,1,2,2,2,2],
    [2,0,0,0,0,0,0,0,0,2,2,1,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2],
  ];

  // 路径节点
  const PATH = [
    [0,2],[1,2],[2,2],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],
    [4,7],[5,7],[6,7],[6,8],[6,9],[6,10],[6,11],
    [7,11],[8,11],[9,11]
  ];

  const TOWERS = {
    arrow: { cost: 20, range: 3, damage: 8, rate: 30, color: '#5dade2', emoji: '🏹', name: '箭塔' },
    cannon: { cost: 40, range: 2.5, damage: 30, rate: 90, color: '#e67e22', emoji: '💣', name: '炮塔', splash: 1.2 }
  };

  const ENEMY_TYPES = [
    { name: '步兵', hp: 50, speed: 1.2, reward: 5, color: '#e74c3c', radius: 8 },
    { name: '骑兵', hp: 30, speed: 2.5, reward: 8, color: '#9b59b6', radius: 7 },
    { name: '铁甲', hp: 150, speed: 0.8, reward: 15, color: '#7f8c8d', radius: 10 }
  ];

  const TOTAL_WAVES = 10;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const goldEl = document.getElementById('gold');
  const livesEl = document.getElementById('lives');
  const waveEl = document.getElementById('wave');
  const totalWavesEl = document.getElementById('totalWaves');
  const statusEl = document.getElementById('statusText');
  const startWaveBtn = document.getElementById('startWaveBtn');
  const restartBtn = document.getElementById('restartBtn');
  const towerBtns = document.querySelectorAll('.tower-btn');

  let W, H, ratio;
  let gold, lives, waveNum, phase;
  let towers, enemies, bullets;
  let selectedTower = 'arrow';
  let spawnQueue, spawnTimer;
  let animId;

  function resize() {
    W = MAP_COLS * TILE;
    H = MAP_ROWS * TILE;
    ratio = window.devicePixelRatio || 1;
    canvas.width = W * ratio;
    canvas.height = H * ratio;
    canvas.style.width = Math.min(W, window.innerWidth * 0.94) + 'px';
    canvas.style.height = Math.min(H, window.innerWidth * 0.94 * (H / W)) + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function init() {
    resize();
    gold = 100;
    lives = 20;
    waveNum = 0;
    towers = [];
    enemies = [];
    bullets = [];
    spawnQueue = [];
    spawnTimer = 0;
    phase = 'build'; // build | wave | won | lost
    totalWavesEl.textContent = TOTAL_WAVES;
    updateHUD();
    statusEl.textContent = '放置防御塔后点击"开始波次"';
  }

  /* ===== 波次 ===== */
  function startWave() {
    if (phase !== 'build') return;
    waveNum++;
    if (waveNum > TOTAL_WAVES) {
      phase = 'won';
      statusEl.textContent = '🎉 胜利！全部波次已清除';
      updateHUD();
      return;
    }
    phase = 'wave';
    statusEl.textContent = '第 ' + waveNum + ' 波进攻中...';
    updateHUD();

    // 生成敌人队列
    spawnQueue = [];
    const count = 4 + waveNum * 2;
    for (let i = 0; i < count; i++) {
      const typeIdx = waveNum <= 3 ? 0 : (waveNum <= 6 ? (i % 2 === 0 ? 0 : 1) : i % 3);
      const base = { ...ENEMY_TYPES[typeIdx] };
      base.hp = Math.round(base.hp * (1 + (waveNum - 1) * 0.25));
      base.maxHp = base.hp;
      base.pathIdx = 0;
      base.x = PATH[0][1] * TILE + TILE / 2;
      base.y = PATH[0][0] * TILE + TILE / 2;
      base.alive = true;
      spawnQueue.push(base);
    }
    spawnTimer = 0;
  }

  /* ===== 更新 ===== */
  function update() {
    if (phase === 'won' || phase === 'lost') return;

    // 生成敌人
    if (phase === 'wave' && spawnQueue.length > 0) {
      spawnTimer++;
      if (spawnTimer >= 20) {
        enemies.push(spawnQueue.shift());
        spawnTimer = 0;
      }
    }

    // 移动敌人
    enemies.forEach(e => {
      if (!e.alive) return;
      if (e.pathIdx >= PATH.length - 1) {
        e.alive = false;
        lives--;
        if (lives <= 0) {
          phase = 'lost';
          statusEl.textContent = '游戏结束 — 生命耗尽';
        }
        return;
      }
      const target = PATH[e.pathIdx + 1];
      const tx = target[1] * TILE + TILE / 2;
      const ty = target[0] * TILE + TILE / 2;
      const dx = tx - e.x;
      const dy = ty - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist < e.speed * 2) {
        e.pathIdx++;
        e.x = tx;
        e.y = ty;
      } else {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }
    });

    // 塔攻击
    towers.forEach(t => {
      t.cooldown = Math.max(0, t.cooldown - 1);
      if (t.cooldown > 0) return;

      const rangePixels = t.range * TILE;
      let target = null;
      let bestProgress = -1;
      enemies.forEach(e => {
        if (!e.alive) return;
        const d = Math.hypot(e.x - t.x, e.y - t.y);
        if (d <= rangePixels && e.pathIdx > bestProgress) {
          bestProgress = e.pathIdx;
          target = e;
        }
      });

      if (target) {
        bullets.push({
          x: t.x, y: t.y,
          tx: target.x, ty: target.y,
          target,
          damage: t.damage,
          splash: t.splash || 0,
          color: t.color,
          speed: 6
        });
        t.cooldown = t.rate;
      }
    });

    // 子弹
    bullets.forEach(b => {
      const dx = b.tx - b.x;
      const dy = b.ty - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < b.speed * 2) {
        // 命中
        if (b.target.alive) {
          b.target.hp -= b.damage;
          if (b.target.hp <= 0) {
            b.target.alive = false;
            gold += b.target.reward;
          }
          // 溅射
          if (b.splash > 0) {
            enemies.forEach(e => {
              if (e === b.target || !e.alive) return;
              if (Math.hypot(e.x - b.tx, e.y - b.ty) <= b.splash * TILE) {
                e.hp -= Math.round(b.damage * 0.5);
                if (e.hp <= 0) { e.alive = false; gold += e.reward; }
              }
            });
          }
        }
        b.done = true;
      } else {
        b.x += (dx / dist) * b.speed;
        b.y += (dy / dist) * b.speed;
      }
    });

    bullets = bullets.filter(b => !b.done);
    enemies = enemies.filter(e => e.alive || e.pathIdx < PATH.length - 1);

    // 波次结束
    if (phase === 'wave' && spawnQueue.length === 0 && enemies.filter(e => e.alive).length === 0) {
      phase = 'build';
      gold += 20 + waveNum * 5;
      if (waveNum >= TOTAL_WAVES) {
        phase = 'won';
        statusEl.textContent = '🎉 胜利！全部波次已清除';
      } else {
        statusEl.textContent = '波次 ' + waveNum + ' 已清除，准备下一波';
      }
    }

    updateHUD();
  }

  /* ===== 渲染 ===== */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 地图
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const x = c * TILE;
        const y = r * TILE;
        switch (MAP[r][c]) {
          case 0: ctx.fillStyle = '#1e3a1e'; break;
          case 1: ctx.fillStyle = '#c4a35a'; break;
          case 2: ctx.fillStyle = '#162016'; break;
        }
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.strokeRect(x, y, TILE, TILE);
      }
    }

    // 路径箭头
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < PATH.length - 1; i++) {
      const [r, c] = PATH[i];
      const [nr, nc] = PATH[i + 1];
      const arrow = nr > r ? '↓' : nr < r ? '↑' : nc > c ? '→' : '←';
      ctx.fillText(arrow, c * TILE + TILE / 2, r * TILE + TILE / 2 + 5);
    }

    // 塔
    towers.forEach(t => {
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.emoji, t.x, t.y + 6);
    });

    // 敌人
    enemies.forEach(e => {
      if (!e.alive) return;
      // 血条
      const barW = 20;
      const hpRatio = e.hp / e.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 6, barW, 4);
      ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 6, barW * hpRatio, 4);

      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 子弹
    bullets.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 结束遮罩
    if (phase === 'lost') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('游戏结束', W / 2, H / 2);
    }
    if (phase === 'won') {
      ctx.fillStyle = 'rgba(0,50,0,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 胜利！', W / 2, H / 2);
    }
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function updateHUD() {
    goldEl.textContent = gold;
    livesEl.textContent = lives;
    waveEl.textContent = waveNum;
  }

  /* ===== 输入 ===== */
  function canvasToMap(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return { x, y, col: Math.floor(x / TILE), row: Math.floor(y / TILE) };
  }

  function placeTower(clientX, clientY) {
    const { x, y, col, row } = canvasToMap(clientX, clientY);
    if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return;
    if (MAP[row][col] !== 0) return; // 只能建在空地
    // 检查重复
    if (towers.some(t => t.row === row && t.col === col)) return;

    const def = TOWERS[selectedTower];
    if (gold < def.cost) {
      statusEl.textContent = '金币不足！';
      return;
    }

    gold -= def.cost;
    towers.push({
      row, col,
      x: col * TILE + TILE / 2,
      y: row * TILE + TILE / 2,
      ...def,
      cooldown: 0
    });
    updateHUD();
  }

  canvas.addEventListener('click', e => {
    if (phase === 'build' || phase === 'wave') placeTower(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    if (phase === 'build' || phase === 'wave') placeTower(t.clientX, t.clientY);
  }, { passive: false });

  towerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      towerBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTower = btn.dataset.tower;
    });
  });

  startWaveBtn.addEventListener('click', startWave);
  restartBtn.addEventListener('click', init);

  window.addEventListener('resize', () => {
    resize();
    draw();
  });

  /* ===== 启动 ===== */
  init();
  loop();
})();
