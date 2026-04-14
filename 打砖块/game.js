(() => {
  /* ===== 配置 ===== */
  const CONFIG = {
    paddleWidth: 100,
    paddleHeight: 14,
    paddleSpeed: 8,
    ballRadius: 7,
    ballSpeed: 5,
    brickRows: 5,
    brickCols: 8,
    brickPad: 6,
    brickHeight: 22,
    brickTopOffset: 50,
    lives: 3,
    colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0']
  };

  /* ===== DOM ===== */
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const levelEl = document.getElementById('level');
  const statusEl = document.getElementById('statusText');
  const restartBtn = document.getElementById('restartBtn');
  const btnLeft = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  const btnLaunch = document.getElementById('btnLaunch');

  /* ===== 状态 ===== */
  let state, animId;

  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const w = Math.min(720, wrap.clientWidth - 16);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = w * ratio;
    canvas.height = (w * 0.7) * ratio;
    canvas.style.width = w + 'px';
    canvas.style.height = (w * 0.7) + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { w, h: w * 0.7 };
  }

  function initState() {
    const { w, h } = resizeCanvas();
    const brickWidth = (w - CONFIG.brickPad * (CONFIG.brickCols + 1)) / CONFIG.brickCols;
    const bricks = [];
    for (let r = 0; r < CONFIG.brickRows; r++) {
      for (let c = 0; c < CONFIG.brickCols; c++) {
        bricks.push({
          x: CONFIG.brickPad + c * (brickWidth + CONFIG.brickPad),
          y: CONFIG.brickTopOffset + r * (CONFIG.brickHeight + CONFIG.brickPad),
          w: brickWidth,
          h: CONFIG.brickHeight,
          alive: true,
          hp: state ? Math.min(1 + Math.floor(state.level / 2), 3) : 1,
          color: CONFIG.colors[r % CONFIG.colors.length]
        });
      }
    }

    const paddleW = CONFIG.paddleWidth;
    const paddleY = h - 30;

    state = {
      w, h,
      paddle: { x: (w - paddleW) / 2, y: paddleY, w: paddleW, h: CONFIG.paddleHeight },
      ball: { x: w / 2, y: paddleY - CONFIG.ballRadius - 1, r: CONFIG.ballRadius, dx: 0, dy: 0 },
      bricks,
      score: state ? state.score : 0,
      lives: state ? state.lives : CONFIG.lives,
      level: state ? state.level : 1,
      phase: 'ready', // ready | playing | paused | won | lost
      keys: {},
      touchDir: 0
    };
    updateHUD();
  }

  function fullReset() {
    cancelAnimationFrame(animId);
    state = null;
    initState();
    state.score = 0;
    state.lives = CONFIG.lives;
    state.level = 1;
    initState(); // rebuild bricks for level 1
    setStatus('点击开始');
    draw();
  }

  function nextLevel() {
    state.level++;
    initState();
    setStatus('第 ' + state.level + ' 关 — 点击发射');
    draw();
  }

  /* ===== 渲染 ===== */
  function draw() {
    const { w, h } = state;
    ctx.clearRect(0, 0, w, h);

    // 砖块
    state.bricks.forEach(b => {
      if (!b.alive) return;
      const alpha = 0.4 + 0.6 * (b.hp / 3);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      roundRect(ctx, b.x, b.y, b.w, b.h, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (b.hp > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.hp, b.x + b.w / 2, b.y + b.h / 2 + 4);
      }
    });

    // 挡板
    const p = state.paddle;
    const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y);
    grad.addColorStop(0, '#00d4ff');
    grad.addColorStop(1, '#a855f7');
    ctx.fillStyle = grad;
    ctx.beginPath();
    roundRect(ctx, p.x, p.y, p.w, p.h, 6);
    ctx.fill();

    // 球
    const b = state.ball;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ===== 更新 ===== */
  function update() {
    if (state.phase !== 'playing') return;

    // 挡板移动
    let dir = 0;
    if (state.keys['ArrowLeft'] || state.keys['KeyA']) dir = -1;
    if (state.keys['ArrowRight'] || state.keys['KeyD']) dir = 1;
    if (state.touchDir) dir = state.touchDir;

    const p = state.paddle;
    p.x += dir * CONFIG.paddleSpeed;
    p.x = Math.max(0, Math.min(state.w - p.w, p.x));

    // 球
    const b = state.ball;
    b.x += b.dx;
    b.y += b.dy;

    // 墙壁反弹
    if (b.x - b.r <= 0 || b.x + b.r >= state.w) {
      b.dx = -b.dx;
      b.x = Math.max(b.r, Math.min(state.w - b.r, b.x));
    }
    if (b.y - b.r <= 0) {
      b.dy = -b.dy;
      b.y = b.r;
    }

    // 挡板碰撞
    if (b.dy > 0 && b.y + b.r >= p.y && b.y + b.r <= p.y + p.h + 4 &&
        b.x >= p.x && b.x <= p.x + p.w) {
      b.dy = -Math.abs(b.dy);
      // 偏移角度
      const hit = (b.x - (p.x + p.w / 2)) / (p.w / 2);
      b.dx = hit * CONFIG.ballSpeed;
      const speed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
      const targetSpeed = CONFIG.ballSpeed + (state.level - 1) * 0.5;
      b.dx = (b.dx / speed) * targetSpeed;
      b.dy = (b.dy / speed) * targetSpeed;
    }

    // 掉落
    if (b.y - b.r > state.h) {
      state.lives--;
      if (state.lives <= 0) {
        state.phase = 'lost';
        setStatus('游戏结束 — 点击重玩');
      } else {
        state.phase = 'ready';
        b.x = p.x + p.w / 2;
        b.y = p.y - b.r - 1;
        b.dx = 0;
        b.dy = 0;
        setStatus('剩余 ' + state.lives + ' 条命 — 点击发射');
      }
      updateHUD();
      return;
    }

    // 砖块碰撞
    state.bricks.forEach(brick => {
      if (!brick.alive) return;
      if (b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w &&
          b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {
        brick.hp--;
        if (brick.hp <= 0) {
          brick.alive = false;
          state.score += 10 * state.level;
        } else {
          state.score += 2;
        }
        // 简单反弹：反转y方向
        b.dy = -b.dy;
        updateHUD();
      }
    });

    // 检查通关
    if (state.bricks.every(b => !b.alive)) {
      state.phase = 'won';
      setStatus('🎉 第 ' + state.level + ' 关通关！点击继续');
    }
  }

  function launchBall() {
    if (state.phase === 'ready') {
      const speed = CONFIG.ballSpeed + (state.level - 1) * 0.5;
      state.ball.dx = (Math.random() - 0.5) * speed * 0.6;
      state.ball.dy = -speed;
      state.phase = 'playing';
      setStatus('游戏中');
    }
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  /* ===== HUD ===== */
  function updateHUD() {
    scoreEl.textContent = state.score;
    livesEl.textContent = state.lives;
    levelEl.textContent = state.level;
  }

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  /* ===== 输入 ===== */
  document.addEventListener('keydown', e => {
    state.keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      if (state.phase === 'ready') {
        launchBall();
      } else if (state.phase === 'playing') {
        state.phase = 'paused';
        setStatus('已暂停 — 按空格继续');
      } else if (state.phase === 'paused') {
        state.phase = 'playing';
        setStatus('游戏中');
      }
    }
  });

  document.addEventListener('keyup', e => {
    state.keys[e.code] = false;
  });

  // 点击 canvas 开始/继续
  canvas.addEventListener('click', () => {
    if (state.phase === 'ready') {
      launchBall();
    } else if (state.phase === 'won') {
      nextLevel();
    } else if (state.phase === 'lost') {
      fullReset();
    }
  });

  // 触控：直接跟随手指在 canvas 上的位置
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = state.w / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;
    state.paddle.x = Math.max(0, Math.min(state.w - state.paddle.w, touchX - state.paddle.w / 2));
  }, { passive: false });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (state.phase === 'ready') launchBall();
    else if (state.phase === 'won') nextLevel();
    else if (state.phase === 'lost') fullReset();
  }, { passive: false });

  // 按钮控制
  let touchInterval;
  function startTouch(dir) {
    state.touchDir = dir;
    clearInterval(touchInterval);
  }
  function stopTouch() {
    state.touchDir = 0;
    clearInterval(touchInterval);
  }

  btnLeft.addEventListener('touchstart', e => { e.preventDefault(); startTouch(-1); });
  btnLeft.addEventListener('touchend', e => { e.preventDefault(); stopTouch(); });
  btnLeft.addEventListener('mousedown', () => startTouch(-1));
  btnLeft.addEventListener('mouseup', stopTouch);

  btnRight.addEventListener('touchstart', e => { e.preventDefault(); startTouch(1); });
  btnRight.addEventListener('touchend', e => { e.preventDefault(); stopTouch(); });
  btnRight.addEventListener('mousedown', () => startTouch(1));
  btnRight.addEventListener('mouseup', stopTouch);

  btnLaunch.addEventListener('click', () => {
    if (state.phase === 'ready') launchBall();
    else if (state.phase === 'won') nextLevel();
    else if (state.phase === 'lost') fullReset();
  });

  restartBtn.addEventListener('click', fullReset);

  // 窗口大小变化
  window.addEventListener('resize', () => {
    const { w, h } = resizeCanvas();
    // 比例缩放挡板和球的位置
    const rx = w / state.w;
    const ry = h / state.h;
    state.w = w;
    state.h = h;
    state.paddle.x *= rx;
    state.paddle.y = h - 30;
    state.ball.x *= rx;
    state.ball.y *= ry;
    state.bricks.forEach(b => {
      b.x *= rx;
      b.y *= ry;
      b.w *= rx;
    });
    draw();
  });

  /* ===== 启动 ===== */
  initState();
  draw();
  loop();
})();
