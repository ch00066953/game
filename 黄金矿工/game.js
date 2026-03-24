// =============== 黄金矿工 ===============
;(function () {
  'use strict';

  // ---- DOM ----
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayContent = document.getElementById('overlayContent');
  const btnStart = document.getElementById('btnStart');
  const elLevel = document.getElementById('level');
  const elTarget = document.getElementById('target');
  const elMoney = document.getElementById('money');
  const elTimer = document.getElementById('timer');

  // ---- 常量 ----
  const W = canvas.width;   // 800
  const H = canvas.height;  // 550
  const GROUND_Y = 80;
  const HOOK_ORIGIN = { x: W / 2, y: GROUND_Y + 10 };
  const ROPE_MAX_LEN = 500;
  const SWING_SPEED = 0.02;
  const SWING_RANGE = Math.PI * 0.45;
  const EXTEND_SPEED = 4;
  const BASE_RETRACT_SPEED = 4;

  // 矿物类型
  const MINERAL_TYPES = {
    smallGold:  { name: '小金块', color: '#ffd700', value: 50,  weight: 1,   radius: 12, emoji: '' },
    mediumGold: { name: '中金块', color: '#ffaa00', value: 100, weight: 2,   radius: 20, emoji: '' },
    bigGold:    { name: '大金块', color: '#ff8c00', value: 250, weight: 4,   radius: 30, emoji: '' },
    diamond:    { name: '钻石',   color: '#00ffff', value: 600, weight: 0.5, radius: 14, emoji: '💎' },
    ruby:       { name: '红宝石', color: '#ff1744', value: 400, weight: 0.8, radius: 13, emoji: '❤️' },
    stone:      { name: '石头',   color: '#888888', value: 10,  weight: 5,   radius: 24, emoji: '' },
    bigStone:   { name: '大石头', color: '#666666', value: 20,  weight: 8,   radius: 36, emoji: '' },
    bag:        { name: '神秘袋', color: '#8b4513', value: 0,   weight: 1,   radius: 16, emoji: '👜' },
    bone:       { name: '化石',   color: '#f5f5dc', value: 80,  weight: 1.5, radius: 15, emoji: '🦴' },
    skull:      { name: '骷髅头', color: '#ffffcc', value: 150, weight: 2,   radius: 17, emoji: '💀' },
  };

  // 道具定义
  const SHOP_ITEMS = {
    strength:   { name: '力量药水', icon: '💪', price: 30,  desc: '下次回收速度+80%' },
    dynamite:   { name: '炸药',     icon: '🧨', price: 20,  desc: '回收石头时按↑炸掉' },
    lucky:      { name: '幸运星',   icon: '⭐', price: 40,  desc: '下关金块价值+50%' },
    magnet:     { name: '磁铁',     icon: '🧲', price: 50,  desc: '钩子吸附范围翻倍' },
    clock:      { name: '时钟',     icon: '⏰', price: 35,  desc: '下关额外+15秒' },
  };

  // ---- 游戏状态 ----
  let state = 'menu';
  let level = 1;
  let money = 0;
  let levelTarget = 200;
  let timer = 60;
  let timerInterval = null;

  let hookAngle = 0;
  let hookDir = 1;
  let ropeLen = 30;
  let hookState = 'swinging';
  let caughtMineral = null;

  // 道具
  let hasStrength = false;
  let hasDynamite = false;
  let dynamiteCount = 0;
  let hasLucky = false;
  let hasMagnet = false;
  let hasClock = false;

  let minerals = [];
  let particles = [];
  let floatingTexts = [];

  // 操作提示
  let actionHint = '';
  let actionHintTimer = 0;
  let actionHintColor = '#ffd700';

  // ---- 防重叠矿物生成 ----
  function generateMinerals(lvl) {
    const list = [];
    const count = 8 + lvl * 2;
    const minY = GROUND_Y + 60;
    const maxY = H - 40;
    const margin = 50;
    const maxAttempts = 80;

    for (let i = 0; i < count; i++) {
      const rand = Math.random();
      let type;
      if (rand < 0.22) type = 'smallGold';
      else if (rand < 0.38) type = 'mediumGold';
      else if (rand < 0.47) type = 'bigGold';
      else if (rand < 0.53) type = 'diamond';
      else if (rand < 0.57) type = 'ruby';
      else if (rand < 0.62) type = 'bone';
      else if (rand < 0.66) type = 'skull';
      else if (rand < 0.78) type = 'stone';
      else if (rand < 0.88) type = 'bigStone';
      else type = 'bag';

      const info = MINERAL_TYPES[type];
      const r = info.radius;
      let placed = false;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = margin + r + Math.random() * (W - 2 * margin - 2 * r);
        const y = minY + Math.random() * (maxY - minY - r);

        let overlapping = false;
        for (const existing of list) {
          const dx = x - existing.x;
          const dy = y - existing.y;
          const minDist = r + existing.radius + 8;
          if (dx * dx + dy * dy < minDist * minDist) {
            overlapping = true;
            break;
          }
        }

        if (!overlapping) {
          let value = info.value;
          if (hasLucky && (type.includes('Gold') || type === 'diamond' || type === 'ruby')) {
            value = Math.round(value * 1.5);
          }
          list.push({
            type, x, y, radius: r, value,
            weight: info.weight, color: info.color,
            name: info.name, emoji: info.emoji, alive: true,
          });
          placed = true;
          break;
        }
      }
    }
    return list;
  }

  // ---- 初始化关卡 ----
  function initLevel() {
    hookState = 'swinging';
    hookAngle = 0;
    hookDir = 1;
    ropeLen = 30;
    caughtMineral = null;
    minerals = generateMinerals(level);
    levelTarget = 150 + level * 100;
    timer = Math.max(30, 65 - level * 3);
    if (hasClock) { timer += 15; hasClock = false; }
    particles = [];
    floatingTexts = [];
    actionHint = '';
    actionHintTimer = 0;

    elLevel.textContent = level;
    elTarget.textContent = '$' + levelTarget;
    elMoney.textContent = '$' + money;
    elTimer.textContent = timer;

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (state !== 'playing' && state !== 'retracting') return;
      timer--;
      elTimer.textContent = timer;
      if (timer <= 0) { clearInterval(timerInterval); endLevel(); }
    }, 1000);

    hasLucky = false;
    state = 'playing';
    overlay.classList.add('hidden');
    showActionHint('🎯 按 ↓/空格/点击 释放钩子', '#51cf66', 180);
  }

  // ---- 操作提示 ----
  function showActionHint(text, color, duration) {
    actionHint = text;
    actionHintColor = color || '#ffd700';
    actionHintTimer = duration || 120;
  }

  function drawActionHint() {
    if (actionHintTimer <= 0 || !actionHint) return;
    const alpha = Math.min(1, actionHintTimer / 30);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px "Microsoft YaHei", sans-serif';
    const textW = ctx.measureText(actionHint).width;
    const barW = Math.max(textW + 40, 280);
    const barH = 32;
    const bx = (W - barW) / 2;
    const by = H - 50;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 8);
    ctx.fill();
    ctx.fillStyle = actionHintColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(actionHint, W / 2, by + barH / 2);
    ctx.restore();
  }

  // ---- 关卡结束 ----
  function endLevel() {
    state = 'levelEnd';
    if (timerInterval) clearInterval(timerInterval);
    const passed = money >= levelTarget;

    function buildShopHTML() {
      let items = '';
      for (const [key, info] of Object.entries(SHOP_ITEMS)) {
        items += '<div class="shop-item" data-item="' + key + '" title="' + info.desc + '">'
          + '<span class="item-icon">' + info.icon + '</span>'
          + '<span class="item-name">' + info.name + '</span>'
          + '<span class="item-desc">' + info.desc + '</span>'
          + '<span class="item-price">$' + info.price + '</span>'
          + '</div>';
      }
      return items;
    }

    let html = '';
    if (passed) {
      html = '<h2>🎉 关卡 ' + level + ' 通过！</h2>'
        + '<p class="result-money result-success">获得金钱: $' + money + '</p>'
        + '<p>目标: $' + levelTarget + '</p>'
        + '<p style="color:#cca300;font-size:0.85rem;margin-bottom:6px">👇 点击道具购买（炸药可叠加）</p>'
        + '<div class="shop-items" id="shopItems">' + buildShopHTML() + '</div>'
        + '<button class="btn-start" id="btnNext">下一关 →</button>';
    } else {
      html = '<h2>💀 时间到！</h2>'
        + '<p class="result-money result-fail">获得金钱: $' + money + '</p>'
        + '<p>目标: $' + levelTarget + '（未达成）</p>'
        + '<button class="btn-start" id="btnRetry">重新开始</button>';
    }

    overlayContent.innerHTML = html;
    overlay.classList.remove('hidden');

    var btnNext = document.getElementById('btnNext');
    var btnRetry = document.getElementById('btnRetry');
    if (btnNext) btnNext.addEventListener('click', function () { level++; initLevel(); });
    if (btnRetry) btnRetry.addEventListener('click', function () { level = 1; money = 0; resetItems(); initLevel(); });

    document.querySelectorAll('.shop-item').forEach(function (el) {
      el.addEventListener('click', function () {
        var key = el.dataset.item;
        var info = SHOP_ITEMS[key];
        if (!info || money < info.price) return;
        if (el.classList.contains('disabled')) return;
        money -= info.price;
        elMoney.textContent = '$' + money;
        if (key === 'strength') { hasStrength = true; el.classList.add('disabled'); }
        else if (key === 'dynamite') { dynamiteCount++; hasDynamite = true; }
        else if (key === 'lucky') { hasLucky = true; el.classList.add('disabled'); }
        else if (key === 'magnet') { hasMagnet = true; el.classList.add('disabled'); }
        else if (key === 'clock') { hasClock = true; el.classList.add('disabled'); }
        updateShopStates();
      });
    });
    updateShopStates();
  }

  function updateShopStates() {
    document.querySelectorAll('.shop-item').forEach(function (el) {
      var key = el.dataset.item;
      var info = SHOP_ITEMS[key];
      if (!info) return;
      if (key === 'strength' && hasStrength) { el.classList.add('disabled'); return; }
      if (key === 'lucky' && hasLucky) { el.classList.add('disabled'); return; }
      if (key === 'magnet' && hasMagnet) { el.classList.add('disabled'); return; }
      if (key === 'clock' && hasClock) { el.classList.add('disabled'); return; }
      if (money < info.price) el.classList.add('disabled');
      else el.classList.remove('disabled');
    });
  }

  function resetItems() {
    hasStrength = false; hasDynamite = false; dynamiteCount = 0;
    hasLucky = false; hasMagnet = false; hasClock = false;
  }

  // ---- 碰撞检测 ----
  function checkHookCollision(hx, hy) {
    var extraRange = hasMagnet ? 16 : 0;
    for (var i = 0; i < minerals.length; i++) {
      var m = minerals[i];
      if (!m.alive) continue;
      var dx = hx - m.x;
      var dy = hy - m.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < m.radius + 6 + extraRange) return m;
    }
    return null;
  }

  // ---- 粒子 ----
  function spawnParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
      particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6 - 2, life: 30 + Math.random() * 20, color: color, radius: 2 + Math.random() * 3 });
    }
  }

  function showFloatingText(text, color) {
    floatingTexts.push({ text: text, color: color, x: HOOK_ORIGIN.x, y: HOOK_ORIGIN.y - 10, life: 60, vy: -1.5 });
  }

  function updateFloatingTexts() {
    for (var i = floatingTexts.length - 1; i >= 0; i--) {
      floatingTexts[i].y += floatingTexts[i].vy;
      floatingTexts[i].life--;
      if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function drawFloatingTexts() {
    for (var i = 0; i < floatingTexts.length; i++) {
      var ft = floatingTexts[i];
      ctx.globalAlpha = Math.min(1, ft.life / 20);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
  }

  // ---- 绘制 ----
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // 天空
    var skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, GROUND_Y);

    // 地面
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, GROUND_Y, W, 8);

    // 地下
    var groundGrad = ctx.createLinearGradient(0, GROUND_Y + 8, 0, H);
    groundGrad.addColorStop(0, '#6B4226');
    groundGrad.addColorStop(0.5, '#4A2F1A');
    groundGrad.addColorStop(1, '#2E1A0E');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y + 8, W, H - GROUND_Y - 8);

    // 纹理
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (var i = 0; i < 40; i++) {
      var tx = (i * 137 + 23) % W;
      var ty = GROUND_Y + 20 + (i * 89 + 41) % (H - GROUND_Y - 40);
      ctx.beginPath(); ctx.arc(tx, ty, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    // 矿物
    for (var i = 0; i < minerals.length; i++) {
      if (minerals[i].alive) drawMineral(minerals[i]);
    }

    drawMiner();
    drawRopeAndHook();
    drawParticles();
    drawBuffBar();
    drawActionHint();
    drawFloatingTexts();
  }

  function drawMineral(m) {
    ctx.save();
    ctx.translate(m.x, m.y);

    if (m.emoji) {
      ctx.font = (m.radius * 1.5) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.emoji, 0, 0);
    } else if (m.type.indexOf('Gold') >= 0) {
      drawGoldNugget(0, 0, m.radius, m.color);
    } else if (m.type.indexOf('stone') >= 0 || m.type.indexOf('Stone') >= 0) {
      drawStone(0, 0, m.radius, m.color);
    } else {
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.arc(0, 0, m.radius, 0, Math.PI * 2); ctx.fill();
    }

    // 价值标注
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(m.type === 'bag' ? '?' : '$' + m.value, 0, m.radius + 2);

    ctx.restore();
  }

  function drawGoldNugget(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
      var rr = r * (0.85 + 0.15 * Math.sin(i * 2.5));
      var px = x + Math.cos(angle) * rr;
      var py = y + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2); ctx.fill();
  }

  function drawStone(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < 7; i++) {
      var angle = (Math.PI * 2 / 7) * i;
      var rr = r * (0.8 + 0.2 * Math.cos(i * 3.1));
      var px = x + Math.cos(angle) * rr;
      var py = y + Math.sin(angle) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }

  function drawMiner() {
    var mx = HOOK_ORIGIN.x, my = HOOK_ORIGIN.y;
    ctx.fillStyle = '#d2691e'; ctx.fillRect(mx - 15, my - 40, 30, 30);
    ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(mx, my - 50, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8b4513'; ctx.fillRect(mx - 16, my - 65, 32, 8); ctx.fillRect(mx - 10, my - 72, 20, 10);
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(mx - 4, my - 52, 2, 0, Math.PI * 2); ctx.arc(mx + 4, my - 52, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d2691e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(mx - 12, my - 30); ctx.lineTo(mx - 5, my - 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx + 12, my - 30); ctx.lineTo(mx + 5, my - 8); ctx.stroke();
  }

  function drawRopeAndHook() {
    var hx = HOOK_ORIGIN.x + Math.sin(hookAngle) * ropeLen;
    var hy = HOOK_ORIGIN.y + Math.cos(hookAngle) * ropeLen;

    ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(HOOK_ORIGIN.x, HOOK_ORIGIN.y); ctx.lineTo(hx, hy); ctx.stroke();

    // 磁铁光圈
    if (hasMagnet && hookState === 'extending') {
      ctx.save();
      ctx.strokeStyle = 'rgba(0,200,255,0.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hx, hy, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-hookAngle);
    ctx.strokeStyle = '#666'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(0, 8); ctx.lineTo(8, -2); ctx.stroke();
    ctx.restore();

    if (caughtMineral && hookState === 'retracting') {
      caughtMineral.x = hx;
      caughtMineral.y = hy + caughtMineral.radius;
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life / 50;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 道具栏
  function drawBuffBar() {
    var items = [];
    if (hasStrength) items.push({ icon: '💪', label: '力量(自动生效)' });
    if (hasDynamite && dynamiteCount > 0) items.push({ icon: '🧨', label: '炸药×' + dynamiteCount + '(按↑使用)' });
    if (hasLucky)  items.push({ icon: '⭐', label: '幸运(下关生效)' });
    if (hasMagnet) items.push({ icon: '🧲', label: '磁铁(自动生效)' });
    if (hasClock)  items.push({ icon: '⏰', label: '时钟(下关生效)' });
    if (items.length === 0) return;

    ctx.save();
    var sx = 8, sy = 6, ih = 22;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.roundRect(sx - 4, sy - 2, 160, items.length * ih + 6, 6); ctx.fill();
    ctx.font = '13px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (var i = 0; i < items.length; i++) {
      ctx.fillStyle = '#ffd700';
      ctx.fillText(items[i].icon + ' ' + items[i].label, sx + 2, sy + i * ih + ih / 2);
    }
    ctx.restore();
  }

  // ---- 更新 ----
  function update() {
    var hookEndX = HOOK_ORIGIN.x + Math.sin(hookAngle) * ropeLen;
    var hookEndY = HOOK_ORIGIN.y + Math.cos(hookAngle) * ropeLen;

    if (actionHintTimer > 0) actionHintTimer--;

    if (hookState === 'swinging') {
      hookAngle += SWING_SPEED * hookDir;
      if (hookAngle > SWING_RANGE) hookDir = -1;
      if (hookAngle < -SWING_RANGE) hookDir = 1;
    } else if (hookState === 'extending') {
      ropeLen += EXTEND_SPEED;
      var hit = checkHookCollision(hookEndX, hookEndY);
      if (hit) {
        caughtMineral = hit;
        hookState = 'retracting';
        state = 'retracting';
        if ((hit.type === 'stone' || hit.type === 'bigStone') && hasDynamite && dynamiteCount > 0) {
          showActionHint('💡 按 ↑ 或再次点击 使用炸药炸掉石头！', '#ff6b6b', 150);
        } else if (hit.type === 'stone' || hit.type === 'bigStone') {
          showActionHint('😰 抓到石头了…回收会很慢', '#ff6b6b', 90);
        } else {
          var vLabel = hit.type === 'bag' ? '??' : '$' + hit.value;
          showActionHint('✨ 抓到 ' + hit.name + '！价值 ' + vLabel, '#51cf66', 90);
        }
      }
      if (ropeLen >= ROPE_MAX_LEN || hookEndX < 5 || hookEndX > W - 5 || hookEndY > H - 5) {
        hookState = 'retracting'; state = 'retracting';
        showActionHint('🪝 钩子到达边界，正在回收…', '#cca300', 60);
      }
    } else if (hookState === 'retracting') {
      var retractSpeed = BASE_RETRACT_SPEED;
      if (caughtMineral) {
        retractSpeed = BASE_RETRACT_SPEED / (caughtMineral.weight * 0.5 + 0.5);
        if (hasStrength) retractSpeed *= 1.8;
      }
      ropeLen -= retractSpeed;
      if (ropeLen <= 30) {
        ropeLen = 30; hookState = 'swinging'; state = 'playing';
        if (caughtMineral) {
          var val = caughtMineral.value;
          if (caughtMineral.type === 'bag') val = [50, 100, 150, 200, 300][Math.floor(Math.random() * 5)];
          money += val;
          elMoney.textContent = '$' + money;
          spawnParticles(HOOK_ORIGIN.x, HOOK_ORIGIN.y + 20, caughtMineral.color, 12);
          showFloatingText('+$' + val, caughtMineral.color);
          caughtMineral.alive = false;
          caughtMineral = null;
          hasStrength = false;
          hasMagnet = false;
          showActionHint('🎯 按 ↓/空格/点击 释放钩子', '#51cf66', 120);
        }
      }
    }

    for (var i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].vx;
      particles[i].y += particles[i].vy;
      particles[i].vy += 0.15;
      particles[i].life--;
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
    updateFloatingTexts();
  }

  // ---- 输入 ----
  function releaseHook() {
    if (state !== 'playing' || hookState !== 'swinging') return;
    hookState = 'extending';
    showActionHint('🪝 钩子伸出中…', '#cca300', 60);
  }

  function useDynamite() {
    if (hookState === 'retracting' && caughtMineral
        && (caughtMineral.type === 'stone' || caughtMineral.type === 'bigStone')
        && hasDynamite && dynamiteCount > 0) {
      dynamiteCount--;
      if (dynamiteCount <= 0) hasDynamite = false;
      spawnParticles(caughtMineral.x, caughtMineral.y, '#ff4444', 20);
      showFloatingText('💥 炸掉了！', '#ff4444');
      caughtMineral.alive = false;
      caughtMineral = null;
      showActionHint('🧨 成功炸掉石头！钩子正在回收', '#ff9900', 90);
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); releaseHook(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); useDynamite(); }
  });

  canvas.addEventListener('click', function () {
    if (state === 'playing') releaseHook();
    else if (state === 'retracting') useDynamite();
  });

  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (state === 'playing') releaseHook();
    else if (state === 'retracting') useDynamite();
  });

  btnStart.addEventListener('click', function () {
    level = 1; money = 0; resetItems(); initLevel();
  });

  // ---- 主循环 ----
  function gameLoop() {
    if (state === 'playing' || state === 'retracting') update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
})();
