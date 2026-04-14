(() => {
  /* ===== 配置 ===== */
  const T = 32; // tile size
  const GRAVITY = 0.55;
  const JUMP_FORCE = -10;
  const MOVE_SPEED = 4;
  const PLAYER_W = 24;
  const PLAYER_H = 28;

  /* ===== 关卡数据 =====
   * 0=空 1=地面 2=尖刺 3=金币 4=终点旗 5=移动平台 6=弹簧
   */
  const LEVELS = [
    // Level 1 - 入门
    { spawn: [2, 8], map: [
      '0000000000000000000000000',
      '0000000000000000000000000',
      '0000000000000000000000000',
      '0000000000000000000000000',
      '0000000000000000000000000',
      '0000000000000000000000040',
      '0000003000000300001111111',
      '0000111100011100000000000',
      '0P00000000000003000000000',
      '1111112211000011111111111',
    ]},
    // Level 2 - 跳跃挑战
    { spawn: [2, 7], map: [
      '0000000000000000000000000',
      '0000000000000000000000000',
      '0000000000000000000000000',
      '0000000000000000000000040',
      '0000000000030000000011111',
      '0000000001110000000000000',
      '0000300000000003000000000',
      '0P11100000000111000000000',
      '1100002200000000001100000',
      '1111111111000000001111111',
    ]},
    // Level 3 - 尖刺跑酷
    { spawn: [2, 7], map: [
      '0000000000000000000000000000',
      '0000000000000000000000000000',
      '0000000000000000000000000000',
      '0000000000000000000000000040',
      '0000000000000300000000011111',
      '000000000001110000001100000',
      '000030000000000030000000000',
      '0P1110000000001110000000000',
      '1100002211000000022111000000',
      '1111111111100000001111111111',
    ]}
  ];

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const levelEl = document.getElementById('level');
  const coinsEl = document.getElementById('coins');
  const livesEl = document.getElementById('lives');
  const statusEl = document.getElementById('statusText');
  const restartBtn = document.getElementById('restartBtn');
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnJump = document.getElementById('btnJump');

  let W, H, ratio;
  let map, mapRows, mapCols;
  let player, camera, coins, totalCoins, lives, currentLevel, phase;
  let keys = {};
  let touchDir = 0, touchJump = false;
  let animId;

  function resize() {
    const wrap = canvas.parentElement;
    const maxW = Math.min(760, wrap.clientWidth - 8);
    W = maxW;
    H = maxW * 0.45;
    ratio = window.devicePixelRatio || 1;
    canvas.width = W * ratio;
    canvas.height = H * ratio;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function loadLevel(lvl) {
    if (lvl >= LEVELS.length) {
      phase = 'won';
      statusEl.textContent = '🎉 全部通关！恭喜完成所有关卡';
      return;
    }
    currentLevel = lvl;
    const data = LEVELS[lvl];
    mapRows = data.map.length;
    mapCols = Math.max(...data.map.map(r => r.length));
    map = data.map.map(row => row.split('').map(Number));

    // 找玩家起点
    let sx = data.spawn[0] * T, sy = data.spawn[1] * T;
    for (let r = 0; r < mapRows; r++) {
      for (let c = 0; c < mapCols; c++) {
        if ((data.map[r] || '')[c] === 'P') {
          sx = c * T;
          sy = r * T;
          map[r][c] = 0;
        }
      }
    }

    player = { x: sx, y: sy, vx: 0, vy: 0, onGround: false, w: PLAYER_W, h: PLAYER_H };
    camera = { x: 0 };
    totalCoins = 0;
    coins = 0;

    // 数金币
    for (let r = 0; r < mapRows; r++)
      for (let c = 0; c < mapCols; c++)
        if (map[r][c] === 3) totalCoins++;

    phase = 'playing';
    updateHUD();
  }

  function init() {
    resize();
    lives = 3;
    coins = 0;
    loadLevel(0);
  }

  /* ===== 碰撞 ===== */
  function getTile(r, c) {
    if (r < 0 || r >= mapRows || c < 0 || c >= mapCols) return 0;
    return map[r][c];
  }

  function isSolid(tile) { return tile === 1; }

  function collideX() {
    const top = Math.floor(player.y / T);
    const bot = Math.floor((player.y + player.h - 1) / T);
    if (player.vx > 0) {
      const col = Math.floor((player.x + player.w) / T);
      for (let r = top; r <= bot; r++) {
        if (isSolid(getTile(r, col))) {
          player.x = col * T - player.w;
          player.vx = 0;
          return;
        }
      }
    } else if (player.vx < 0) {
      const col = Math.floor(player.x / T);
      for (let r = top; r <= bot; r++) {
        if (isSolid(getTile(r, col))) {
          player.x = (col + 1) * T;
          player.vx = 0;
          return;
        }
      }
    }
  }

  function collideY() {
    player.onGround = false;
    const left = Math.floor(player.x / T);
    const right = Math.floor((player.x + player.w - 1) / T);
    if (player.vy > 0) {
      const row = Math.floor((player.y + player.h) / T);
      for (let c = left; c <= right; c++) {
        if (isSolid(getTile(row, c))) {
          player.y = row * T - player.h;
          player.vy = 0;
          player.onGround = true;
          return;
        }
      }
    } else if (player.vy < 0) {
      const row = Math.floor(player.y / T);
      for (let c = left; c <= right; c++) {
        if (isSolid(getTile(row, c))) {
          player.y = (row + 1) * T;
          player.vy = 0;
          return;
        }
      }
    }
  }

  function checkSpecialTiles() {
    // 检查玩家4个角覆盖的格子
    const tiles = new Set();
    const corners = [
      [player.x + 4, player.y + 4],
      [player.x + player.w - 4, player.y + 4],
      [player.x + 4, player.y + player.h - 4],
      [player.x + player.w - 4, player.y + player.h - 4]
    ];
    corners.forEach(([px, py]) => {
      const r = Math.floor(py / T);
      const c = Math.floor(px / T);
      tiles.add(r + ',' + c);
    });

    tiles.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const tile = getTile(r, c);
      if (tile === 2) die(); // 尖刺
      if (tile === 3) { map[r][c] = 0; coins++; } // 金币
      if (tile === 4) { // 终点
        currentLevel++;
        if (currentLevel >= LEVELS.length) {
          phase = 'won';
          statusEl.textContent = '🎉 全部通关！';
        } else {
          loadLevel(currentLevel);
          statusEl.textContent = '进入第 ' + (currentLevel + 1) + ' 关';
        }
      }
    });
  }

  function die() {
    lives--;
    if (lives <= 0) {
      phase = 'lost';
      statusEl.textContent = '游戏结束';
    } else {
      loadLevel(currentLevel);
      statusEl.textContent = '剩余 ' + lives + ' 条命';
    }
    updateHUD();
  }

  /* ===== 更新 ===== */
  function update() {
    if (phase !== 'playing') return;

    // 输入
    let moveDir = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) moveDir = -1;
    if (keys['ArrowRight'] || keys['KeyD']) moveDir = 1;
    if (touchDir) moveDir = touchDir;

    player.vx = moveDir * MOVE_SPEED;

    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || touchJump) && player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
    }

    // 物理
    player.vy += GRAVITY;
    player.x += player.vx;
    collideX();
    player.y += player.vy;
    collideY();

    // 掉落死亡
    if (player.y > mapRows * T + 100) die();

    // 特殊格子
    checkSpecialTiles();

    // 镜头
    camera.x = player.x - W / 3;
    camera.x = Math.max(0, Math.min(mapCols * T - W, camera.x));

    updateHUD();
  }

  /* ===== 渲染 ===== */
  const TILE_COLORS = {
    0: null,
    1: '#6b4226',
    2: '#e74c3c',
    3: '#f1c40f',
    4: '#2ecc71'
  };

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 背景
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, '#87ceeb');
    skyGrad.addColorStop(1, '#e0f0ff');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-camera.x, 0);

    // 地图
    const startCol = Math.floor(camera.x / T);
    const endCol = Math.ceil((camera.x + W) / T);
    for (let r = 0; r < mapRows; r++) {
      for (let c = startCol; c <= endCol && c < mapCols; c++) {
        const tile = getTile(r, c);
        if (tile === 0) continue;
        const x = c * T;
        const y = r * T;

        if (tile === 1) {
          // 地面砖块
          ctx.fillStyle = '#6b4226';
          ctx.fillRect(x, y, T, T);
          ctx.fillStyle = '#8b5e3c';
          ctx.fillRect(x + 2, y + 2, T - 4, T / 2 - 2);
          ctx.strokeStyle = '#4a2a10';
          ctx.strokeRect(x, y, T, T);
        } else if (tile === 2) {
          // 尖刺
          ctx.fillStyle = '#c0392b';
          ctx.beginPath();
          ctx.moveTo(x, y + T);
          ctx.lineTo(x + T / 2, y + 4);
          ctx.lineTo(x + T, y + T);
          ctx.fill();
        } else if (tile === 3) {
          // 金币
          ctx.fillStyle = '#f1c40f';
          ctx.beginPath();
          ctx.arc(x + T / 2, y + T / 2, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d4ac0d';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.lineWidth = 1;
        } else if (tile === 4) {
          // 终点旗
          ctx.fillStyle = '#795548';
          ctx.fillRect(x + T / 2 - 2, y, 4, T);
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(x + T / 2 + 2, y + 2, 14, 10);
        }
      }
    }

    // 玩家
    if (phase === 'playing') {
      // 身体
      ctx.fillStyle = '#3498db';
      ctx.fillRect(player.x, player.y, player.w, player.h);
      // 眼睛
      ctx.fillStyle = '#fff';
      const faceDir = player.vx >= 0 ? 1 : -1;
      const eyeX = player.x + player.w / 2 + faceDir * 4;
      ctx.fillRect(eyeX - 3, player.y + 6, 6, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(eyeX - 1 + faceDir, player.y + 8, 3, 3);
    }

    ctx.restore();

    // 结束遮罩
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
    if (phase === 'won') {
      ctx.fillStyle = 'rgba(0,80,0,0.4)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 全部通关！', W / 2, H / 2);
    }
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function updateHUD() {
    levelEl.textContent = currentLevel + 1;
    coinsEl.textContent = coins;
    livesEl.textContent = lives;
  }

  /* ===== 输入 ===== */
  document.addEventListener('keydown', e => { keys[e.code] = true; });
  document.addEventListener('keyup', e => { keys[e.code] = false; });

  canvas.addEventListener('click', () => {
    if (phase === 'lost') init();
  });

  // 触控按钮
  function bindTouch(btn, onDown, onUp) {
    btn.addEventListener('touchstart', e => { e.preventDefault(); onDown(); }, { passive: false });
    btn.addEventListener('touchend', e => { e.preventDefault(); onUp(); }, { passive: false });
    btn.addEventListener('mousedown', onDown);
    btn.addEventListener('mouseup', onUp);
    btn.addEventListener('mouseleave', onUp);
  }

  bindTouch(btnLeft, () => { touchDir = -1; }, () => { if (touchDir === -1) touchDir = 0; });
  bindTouch(btnRight, () => { touchDir = 1; }, () => { if (touchDir === 1) touchDir = 0; });
  bindTouch(btnJump, () => { touchJump = true; }, () => { touchJump = false; });

  restartBtn.addEventListener('click', init);

  window.addEventListener('resize', () => { resize(); draw(); });

  /* ===== 启动 ===== */
  init();
  loop();
})();
