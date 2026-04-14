(() => {
  /* ===== 常量 ===== */
  const COLS = 10, ROWS = 8;
  const TILE = 48;
  const W = COLS * TILE, H = ROWS * TILE;

  /* 地形: 0=草地  1=山(不可通行)  2=森林(移动+1) */
  const TERRAIN = [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,2,0,0,0,0,2,0,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,2,0,0,0,0,0,0,2,0],
    [0,2,0,0,0,0,0,0,2,0],
    [0,0,0,1,0,0,1,0,0,0],
    [0,0,2,0,0,0,0,2,0,0],
    [0,0,0,0,0,0,0,0,0,0],
  ];

  /* 单位模板 */
  const UNIT_TEMPLATES = {
    warrior:  { name: '战士', emoji: '🗡️', hp: 20, atk: 6, def: 2, move: 3, range: 1 },
    archer:   { name: '弓手', emoji: '🏹', hp: 14, atk: 5, def: 1, move: 3, range: 3 },
    mage:     { name: '法师', emoji: '🔮', hp: 12, atk: 8, def: 0, move: 2, range: 2 },
    knight:   { name: '骑士', emoji: '🐴', hp: 18, atk: 7, def: 3, move: 4, range: 1 },
  };

  const INIT_PLAYER = [
    { type: 'warrior', r: 6, c: 0 },
    { type: 'archer',  r: 7, c: 1 },
    { type: 'mage',    r: 5, c: 0 },
    { type: 'knight',  r: 7, c: 0 },
  ];

  const INIT_ENEMY = [
    { type: 'warrior', r: 1, c: 9 },
    { type: 'archer',  r: 0, c: 8 },
    { type: 'mage',    r: 2, c: 9 },
    { type: 'knight',  r: 0, c: 9 },
  ];

  /* ===== DOM ===== */
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const turnNumEl = document.getElementById('turnNum');
  const curSideEl = document.getElementById('curSide');
  const statusMsg = document.getElementById('statusMsg');
  const unitInfoEl = document.getElementById('unitInfo');
  const endTurnBtn = document.getElementById('endTurnBtn');
  const restartBtn = document.getElementById('restartBtn');

  /* HiDPI */
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  /* ===== 状态 ===== */
  let state;

  function initGame() {
    state = {
      turn: 1,
      side: 'player', // player | enemy
      units: [],
      selected: null,
      moveTiles: [],
      attackTiles: [],
      phase: 'play', // play | gameover
    };

    // 创建单位
    INIT_PLAYER.forEach(u => {
      const t = UNIT_TEMPLATES[u.type];
      state.units.push({
        ...t, type: u.type,
        r: u.r, c: u.c,
        maxHp: t.hp, hp: t.hp,
        side: 'player',
        moved: false, attacked: false
      });
    });
    INIT_ENEMY.forEach(u => {
      const t = UNIT_TEMPLATES[u.type];
      state.units.push({
        ...t, type: u.type,
        r: u.r, c: u.c,
        maxHp: t.hp, hp: t.hp,
        side: 'enemy',
        moved: false, attacked: false
      });
    });

    statusMsg.textContent = '你的回合，选择一个单位';
    render();
  }

  /* ===== BFS 移动范围 ===== */
  function getMoveRange(unit) {
    const visited = new Map();
    const key = (r, c) => r + ',' + c;
    const q = [[unit.r, unit.c, unit.move]];
    visited.set(key(unit.r, unit.c), true);
    const result = [];

    while (q.length > 0) {
      const [r, c, rem] = q.shift();
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (TERRAIN[nr][nc] === 1) continue; // 山
        if (visited.has(key(nr, nc))) continue;
        if (unitAt(nr, nc)) continue; // 有单位占位

        const cost = TERRAIN[nr][nc] === 2 ? 2 : 1;
        const newRem = rem - cost;
        if (newRem < 0) continue;

        visited.set(key(nr, nc), true);
        result.push({ r: nr, c: nc });
        q.push([nr, nc, newRem]);
      }
    }
    return result;
  }

  /* 曼哈顿距离攻击范围 */
  function getAttackRange(unit) {
    const result = [];
    const range = unit.range;
    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        if (Math.abs(dr) + Math.abs(dc) > range || (dr === 0 && dc === 0)) continue;
        const nr = unit.r + dr, nc = unit.c + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        const target = unitAt(nr, nc);
        if (target && target.side !== unit.side) {
          result.push({ r: nr, c: nc });
        }
      }
    }
    return result;
  }

  function unitAt(r, c) {
    return state.units.find(u => u.hp > 0 && u.r === r && u.c === c);
  }

  /* ===== 选择/交互 ===== */
  function handleClick(r, c) {
    if (state.phase !== 'play') return;

    if (state.side === 'enemy') return;

    const clicked = unitAt(r, c);

    // 如果已选中且是移动区域
    if (state.selected !== null) {
      const sel = state.units[state.selected];

      // 移动到空格
      if (!sel.moved && state.moveTiles.some(t => t.r === r && t.c === c)) {
        sel.r = r; sel.c = c;
        sel.moved = true;
        // 更新攻击范围
        state.moveTiles = [];
        state.attackTiles = getAttackRange(sel);
        if (state.attackTiles.length === 0 || sel.attacked) {
          state.selected = null;
          state.attackTiles = [];
        }
        render();
        return;
      }

      // 攻击敌人
      if (!sel.attacked && state.attackTiles.some(t => t.r === r && t.c === c)) {
        const target = unitAt(r, c);
        if (target && target.side !== sel.side) {
          const dmg = Math.max(1, sel.atk - target.def);
          target.hp -= dmg;
          sel.attacked = true;
          sel.moved = true; // 攻击后不能再移动
          statusMsg.textContent = `${sel.name} 对 ${target.name} 造成 ${dmg} 伤害!`;

          if (target.hp <= 0) {
            statusMsg.textContent += ` ${target.name} 被击败!`;
          }

          state.selected = null;
          state.moveTiles = [];
          state.attackTiles = [];
          checkWin();
          render();
          return;
        }
      }

      // 取消选择
      state.selected = null;
      state.moveTiles = [];
      state.attackTiles = [];
    }

    // 选择己方单位
    if (clicked && clicked.side === state.side) {
      const idx = state.units.indexOf(clicked);
      if (clicked.moved && clicked.attacked) {
        statusMsg.textContent = `${clicked.name} 已行动完毕`;
        return;
      }
      state.selected = idx;
      state.moveTiles = clicked.moved ? [] : getMoveRange(clicked);
      state.attackTiles = clicked.attacked ? [] : getAttackRange(clicked);
      unitInfoEl.textContent = `${clicked.name} HP:${clicked.hp}/${clicked.maxHp} ATK:${clicked.atk} DEF:${clicked.def}`;
      render();
      return;
    }

    render();
  }

  /* ===== 敌人 AI ===== */
  function enemyTurn() {
    state.side = 'enemy';
    curSideEl.textContent = '敌方';
    statusMsg.textContent = '敌方行动中…';
    render();

    setTimeout(() => {
      const enemies = state.units.filter(u => u.hp > 0 && u.side === 'enemy');
      enemies.forEach(e => {
        if (e.hp <= 0) return;
        // 找最近的玩家单位
        const players = state.units.filter(u => u.hp > 0 && u.side === 'player');
        if (players.length === 0) return;

        let bestTarget = null, bestDist = Infinity;
        players.forEach(p => {
          const d = Math.abs(e.r - p.r) + Math.abs(e.c - p.c);
          if (d < bestDist) { bestDist = d; bestTarget = p; }
        });

        // 检查是否可以直接攻击
        const atkRange = getAttackRange(e);
        if (atkRange.length > 0 && bestTarget) {
          // 攻击最近的
          const target = unitAt(atkRange[0].r, atkRange[0].c);
          if (target) {
            const dmg = Math.max(1, e.atk - target.def);
            target.hp -= dmg;
            e.attacked = true;
          }
        }

        // 移动朝向目标
        if (!e.moved && bestTarget) {
          const moves = getMoveRange(e);
          if (moves.length > 0) {
            let bestMove = null, bd = Infinity;
            moves.forEach(m => {
              const d = Math.abs(m.r - bestTarget.r) + Math.abs(m.c - bestTarget.c);
              if (d < bd) { bd = d; bestMove = m; }
            });
            if (bestMove) {
              e.r = bestMove.r; e.c = bestMove.c;
              e.moved = true;

              // 移动后再试攻击
              if (!e.attacked) {
                const atkRange2 = getAttackRange(e);
                if (atkRange2.length > 0) {
                  const target = unitAt(atkRange2[0].r, atkRange2[0].c);
                  if (target) {
                    const dmg = Math.max(1, e.atk - target.def);
                    target.hp -= dmg;
                    e.attacked = true;
                  }
                }
              }
            }
          }
        }
      });

      checkWin();
      if (state.phase === 'play') {
        // 开始新的玩家回合
        state.turn++;
        state.side = 'player';
        state.units.forEach(u => { u.moved = false; u.attacked = false; });
        curSideEl.textContent = '我方';
        turnNumEl.textContent = state.turn;
        statusMsg.textContent = '你的回合，选择一个单位';
        state.selected = null;
        state.moveTiles = [];
        state.attackTiles = [];
      }
      render();
    }, 600);
  }

  function checkWin() {
    const pAlive = state.units.filter(u => u.hp > 0 && u.side === 'player').length;
    const eAlive = state.units.filter(u => u.hp > 0 && u.side === 'enemy').length;
    if (eAlive === 0) {
      state.phase = 'gameover';
      statusMsg.textContent = '🎉 胜利！所有敌人被消灭！';
    } else if (pAlive === 0) {
      state.phase = 'gameover';
      statusMsg.textContent = '💀 战败…点击重新开始';
    }
  }

  /* ===== 渲染 ===== */
  function render() {
    ctx.clearRect(0, 0, W, H);

    // 地形
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE, y = r * TILE;
        const t = TERRAIN[r][c];
        if (t === 0) ctx.fillStyle = '#2d5a1e';
        else if (t === 1) ctx.fillStyle = '#555';
        else ctx.fillStyle = '#1a4a1a';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeRect(x, y, TILE, TILE);

        if (t === 1) { ctx.font = '20px serif'; ctx.fillStyle = '#888'; ctx.fillText('⛰️', x + 12, y + 32); }
        if (t === 2) { ctx.font = '16px serif'; ctx.fillStyle = '#3a7a2a'; ctx.fillText('🌲', x + 14, y + 30); }
      }
    }

    // 移动高亮
    state.moveTiles.forEach(t => {
      ctx.fillStyle = 'rgba(59,130,246,0.35)';
      ctx.fillRect(t.c * TILE, t.r * TILE, TILE, TILE);
    });

    // 攻击高亮
    state.attackTiles.forEach(t => {
      ctx.fillStyle = 'rgba(239,68,68,0.35)';
      ctx.fillRect(t.c * TILE, t.r * TILE, TILE, TILE);
    });

    // 选中高亮
    if (state.selected !== null) {
      const sel = state.units[state.selected];
      if (sel.hp > 0) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(sel.c * TILE + 1, sel.r * TILE + 1, TILE - 2, TILE - 2);
        ctx.lineWidth = 1;
      }
    }

    // 单位
    state.units.forEach(u => {
      if (u.hp <= 0) return;
      const x = u.c * TILE, y = u.r * TILE;

      // 底色
      ctx.fillStyle = u.side === 'player' ? 'rgba(59,130,246,0.25)' : 'rgba(239,68,68,0.25)';
      ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);

      // Emoji
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText(u.emoji, x + TILE / 2, y + TILE / 2 + 4);

      // HP bar
      const barW = TILE - 8, barH = 4;
      const bx = x + 4, by = y + TILE - 8;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, barW, barH);
      const hpPct = Math.max(0, u.hp / u.maxHp);
      ctx.fillStyle = u.side === 'player' ? '#3b82f6' : '#ef4444';
      ctx.fillRect(bx, by, barW * hpPct, barH);

      // 已行动标记
      if (u.moved && u.attacked && u.side === state.side) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
      }
    });

    ctx.textAlign = 'start';
  }

  /* ===== 输入 ===== */
  function canvasToTile(px, py) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (px - rect.left) * scaleX;
    const y = (py - rect.top) * scaleY;
    return { r: Math.floor(y / TILE), c: Math.floor(x / TILE) };
  }

  canvas.addEventListener('click', e => {
    const { r, c } = canvasToTile(e.clientX, e.clientY);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) handleClick(r, c);
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    const { r, c } = canvasToTile(t.clientX, t.clientY);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) handleClick(r, c);
  }, { passive: false });

  endTurnBtn.addEventListener('click', () => {
    if (state.phase !== 'play' || state.side !== 'player') return;
    state.selected = null;
    state.moveTiles = [];
    state.attackTiles = [];
    enemyTurn();
  });

  restartBtn.addEventListener('click', initGame);

  /* ===== 启动 ===== */
  initGame();
})();
