/* ============================================================
   反恐精英 2D — 双人合作俯视角射击游戏
   纯 HTML Canvas + 原生 JS，无框架依赖
   ============================================================ */

// ===================== 配置 =====================
const CFG = {
  W: 960, H: 640,
  TILE: 32,
  COLS: 30, ROWS: 20,
  PLAYER_R: 10,
  PLAYER_SPEED: 160,
  RESPAWN_TIME: 3,
  LIVES: 5,
  MAX_HP: 100,
  PICKUP_RESPAWN: 20,
  WAVE_DELAY: 2.5,
  TOTAL_WAVES: 5,
};

// P1 键位
const P1_KEYS = {
  up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD',
  shoot: 'Space', reload: 'KeyR', switchWeapon: 'KeyE',
};
// P2 键位
const P2_KEYS = {
  up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
  shoot: 'Slash', reload: 'Period', switchWeapon: 'Comma',
};

// ===================== 武器定义 =====================
const WEAPONS = {
  pistol:  { name: '手枪',  damage: 25, fireRate: 0.35, magSize: 12, reloadTime: 1.2, totalAmmo: Infinity, bulletSpeed: 500, spread: 0.06, color: '#ffe066', bulletR: 3 },
  rifle:   { name: '步枪',  damage: 18, fireRate: 0.09, magSize: 30, reloadTime: 2.0, totalAmmo: 120,     bulletSpeed: 620, spread: 0.09, color: '#ff9f43', bulletR: 3 },
  shotgun: { name: '霰弹枪', damage: 14, fireRate: 0.65, magSize: 8,  reloadTime: 2.5, totalAmmo: 40,      bulletSpeed: 420, spread: 0.22, pellets: 5, color: '#ff6b6b', bulletR: 3 },
  sniper:  { name: '狙击枪', damage: 80, fireRate: 1.1,  magSize: 5,  reloadTime: 3.0, totalAmmo: 20,      bulletSpeed: 900, spread: 0.01, color: '#a29bfe', bulletR: 4 },
};

// ===================== 敌人类型 =====================
const ENEMY_TYPES = {
  regular: { name: '士兵',   hp: 60,  speed: 90,  weapon: 'pistol',  detectRange: 250, color: '#e74c3c', r: 10, score: 100 },
  heavy:   { name: '重装兵', hp: 160, speed: 60,  weapon: 'shotgun', detectRange: 180, color: '#e67e22', r: 13, score: 200 },
  sniper:  { name: '狙击手', hp: 45,  speed: 75,  weapon: 'sniper',  detectRange: 380, color: '#9b59b6', r: 9,  score: 250 },
};

// ===================== 地图 =====================
// W=墙  .=地板  C=箱子  d=暗地板
function parseMap(lines) {
  const tiles = [];
  for (const line of lines) {
    const row = [];
    for (const ch of line) {
      if (ch === 'W') row.push(1);
      else if (ch === 'C') row.push(2);
      else if (ch === 'd') row.push(3);
      else row.push(0);
    }
    tiles.push(row);
  }
  return tiles;
}

const MAPS = [
  {
    name: '仓库',
    tiles: parseMap([
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'W......W...........W........W',
      'W......W....CC.....W........W',
      'W......W...........W........W',
      'W...........W..W............W',
      'WWWW........W..W........WWWWW',
      'W...........W..W............W',
      'W...CC..........WW...CC.....W',
      'W...CC...........W...CC.....W',
      'W.............CC............W',
      'W.............CC............W',
      'W...CC...........W...CC.....W',
      'W...CC..........WW...CC.....W',
      'W...........W..W............W',
      'WWWW........W..W........WWWWW',
      'W...........W..W............W',
      'W......W...........W........W',
      'W......W....CC.....W........W',
      'W......W...........W........W',
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    ]),
    p1Spawn: { x: 2, y: 2 },
    p2Spawn: { x: 2, y: 17 },
    enemySpawns: [
      { x: 27, y: 2 }, { x: 27, y: 17 }, { x: 15, y: 1 }, { x: 15, y: 18 },
      { x: 27, y: 10 }, { x: 20, y: 5 }, { x: 20, y: 14 }, { x: 25, y: 9 },
    ],
    pickupSpots: [
      { x: 14, y: 9, type: 'health' }, { x: 14, y: 10, type: 'health' },
      { x: 7, y: 5, type: 'rifle' }, { x: 22, y: 14, type: 'shotgun' },
      { x: 7, y: 14, type: 'ammo' }, { x: 22, y: 5, type: 'ammo' },
    ],
  },
  {
    name: '巷战',
    tiles: parseMap([
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'W....W.....W........W.......W',
      'W....W.....W........W.......W',
      'W....W.....W...CC...W.......W',
      'W....W.............WW.......W',
      'W..........WWWW.............W',
      'WWWWWW.....W..W.....WWWWWWWW',
      'W..........W..W.........W..W',
      'W...CC.....W..W.....CC..W..W',
      'W..........W..W.............W',
      'W.............W..W..........W',
      'W..W..CC.....W..W.....CC...W',
      'W..W.........W..W..........W',
      'WWWWWWW.....W..W.....WWWWWWW',
      'W.............WWWW..........W',
      'W.......WW.............W....W',
      'W.......W...CC...W.....W....W',
      'W.......W........W.....W....W',
      'W.......W........W.....W....W',
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    ]),
    p1Spawn: { x: 1, y: 1 },
    p2Spawn: { x: 1, y: 18 },
    enemySpawns: [
      { x: 28, y: 1 }, { x: 28, y: 18 }, { x: 20, y: 9 }, { x: 15, y: 1 },
      { x: 15, y: 18 }, { x: 28, y: 9 }, { x: 25, y: 5 }, { x: 25, y: 14 },
    ],
    pickupSpots: [
      { x: 14, y: 9, type: 'health' }, { x: 14, y: 10, type: 'health' },
      { x: 5, y: 8, type: 'rifle' }, { x: 24, y: 11, type: 'shotgun' },
      { x: 10, y: 3, type: 'ammo' }, { x: 20, y: 16, type: 'ammo' },
    ],
  },
  {
    name: '广场',
    tiles: parseMap([
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      'W.....WW..............WW....W',
      'W.....WW..............WW....W',
      'W.......................CC...W',
      'WWW.........................W',
      'W.........CC....CC..........W',
      'W..........................WW',
      'W..CC.........WW........CC.W',
      'W.............WW...........W',
      'W......WW....WWWW....WW....W',
      'W......WW....WWWW....WW....W',
      'W.............WW...........W',
      'W..CC.........WW........CC.W',
      'WW..........................W',
      'W..........CC....CC.........W',
      'W.........................WWW',
      'W...CC.......................W',
      'W....WW..............WW.....W',
      'W....WW..............WW.....W',
      'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    ]),
    p1Spawn: { x: 2, y: 2 },
    p2Spawn: { x: 2, y: 17 },
    enemySpawns: [
      { x: 27, y: 2 }, { x: 27, y: 17 }, { x: 27, y: 9 }, { x: 14, y: 1 },
      { x: 14, y: 18 }, { x: 20, y: 4 }, { x: 20, y: 15 }, { x: 25, y: 9 },
    ],
    pickupSpots: [
      { x: 14, y: 7, type: 'health' }, { x: 14, y: 12, type: 'health' },
      { x: 4, y: 7, type: 'rifle' }, { x: 25, y: 12, type: 'shotgun' },
      { x: 4, y: 12, type: 'ammo' }, { x: 25, y: 7, type: 'ammo' },
    ],
  },
];

// ===================== 波次定义 =====================
function getWaveEnemies(wave) {
  const defs = [];
  const base = 3 + wave * 2;
  for (let i = 0; i < base; i++) {
    if (wave >= 4 && i < 2) defs.push('sniper');
    else if (wave >= 2 && i < Math.floor(base * 0.3)) defs.push('heavy');
    else defs.push('regular');
  }
  return defs;
}

// ===================== 工具函数 =====================
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rnd(lo, hi) { return lo + Math.random() * (hi - lo); }

function tileAt(tiles, px, py) {
  const tx = Math.floor(px / CFG.TILE);
  const ty = Math.floor(py / CFG.TILE);
  if (tx < 0 || tx >= CFG.COLS || ty < 0 || ty >= CFG.ROWS) return 1;
  return tiles[ty][tx];
}

function isSolid(tile) { return tile === 1 || tile === 2; }

function circleRectOverlap(cx, cy, r, rx, ry, rw, rh) {
  const nearX = clamp(cx, rx, rx + rw);
  const nearY = clamp(cy, ry, ry + rh);
  const dx = cx - nearX, dy = cy - nearY;
  return dx * dx + dy * dy < r * r;
}

function resolveWallCollision(tiles, x, y, r) {
  const minTX = Math.max(0, Math.floor((x - r) / CFG.TILE));
  const maxTX = Math.min(CFG.COLS - 1, Math.floor((x + r) / CFG.TILE));
  const minTY = Math.max(0, Math.floor((y - r) / CFG.TILE));
  const maxTY = Math.min(CFG.ROWS - 1, Math.floor((y + r) / CFG.TILE));
  let nx = x, ny = y;
  for (let ty = minTY; ty <= maxTY; ty++) {
    for (let tx = minTX; tx <= maxTX; tx++) {
      if (!isSolid(tiles[ty][tx])) continue;
      const rx = tx * CFG.TILE, ry2 = ty * CFG.TILE;
      const nearX = clamp(nx, rx, rx + CFG.TILE);
      const nearY = clamp(ny, ry2, ry2 + CFG.TILE);
      const dx = nx - nearX, dy = ny - nearY;
      const d2 = dx * dx + dy * dy;
      if (d2 < r * r && d2 > 0) {
        const d = Math.sqrt(d2);
        const push = r - d;
        nx += (dx / d) * push;
        ny += (dy / d) * push;
      }
    }
  }
  return { x: nx, y: ny };
}

function lineOfSight(tiles, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 1) return true;
  const step = CFG.TILE / 2;
  const steps = Math.ceil(len / step);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const px = ax + dx * t, py = ay + dy * t;
    if (isSolid(tileAt(tiles, px, py))) return false;
  }
  return true;
}

// ===================== 输入管理 =====================
class InputManager {
  constructor() {
    this.keys = {};
    this.justPressed = {};
    window.addEventListener('keydown', e => {
      if (!this.keys[e.code]) this.justPressed[e.code] = true;
      this.keys[e.code] = true;
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Slash','Period','Comma'].includes(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }
  isDown(code) { return !!this.keys[code]; }
  wasPressed(code) { return !!this.justPressed[code]; }
  clearFrame() { this.justPressed = {}; }
}

// ===================== 粒子 =====================
class Particle {
  constructor(x, y, dx, dy, life, color, size) {
    this.x = x; this.y = y; this.dx = dx; this.dy = dy;
    this.life = life; this.maxLife = life;
    this.color = color; this.size = size;
  }
  update(dt) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.life -= dt;
    this.dx *= 0.98;
    this.dy *= 0.98;
    return this.life > 0;
  }
  draw(ctx) {
    const a = clamp(this.life / this.maxLife, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

// ===================== 子弹 =====================
class Bullet {
  constructor(x, y, dx, dy, speed, damage, owner, color, r) {
    this.x = x; this.y = y;
    this.dx = dx; this.dy = dy;
    this.speed = speed; this.damage = damage;
    this.owner = owner; // 'p1','p2','enemy'
    this.color = color; this.r = r || 3;
    this.alive = true;
  }
  update(dt, tiles) {
    this.x += this.dx * this.speed * dt;
    this.y += this.dy * this.speed * dt;
    if (this.x < 0 || this.x > CFG.W || this.y < 0 || this.y > CFG.H) { this.alive = false; return; }
    if (isSolid(tileAt(tiles, this.x, this.y))) this.alive = false;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ===================== 拾取物 =====================
class Pickup {
  constructor(x, y, type) {
    this.x = (x + 0.5) * CFG.TILE;
    this.y = (y + 0.5) * CFG.TILE;
    this.type = type; // 'health','ammo','rifle','shotgun'
    this.active = true;
    this.respawnTimer = 0;
    this.bobPhase = Math.random() * Math.PI * 2;
  }
  update(dt) {
    this.bobPhase += dt * 3;
    if (!this.active) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) this.active = true;
    }
  }
  collect() {
    this.active = false;
    this.respawnTimer = CFG.PICKUP_RESPAWN;
  }
  draw(ctx) {
    if (!this.active) return;
    const bob = Math.sin(this.bobPhase) * 3;
    const y = this.y + bob;
    ctx.save();
    ctx.translate(this.x, y);
    const s = 10;
    if (this.type === 'health') {
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(-s, -s/3, s*2, s*0.66);
      ctx.fillRect(-s/3, -s, s*0.66, s*2);
    } else if (this.type === 'ammo') {
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(-s*0.7, -s*0.5, s*1.4, s);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(-s*0.5, -s*0.3, s, s*0.6);
    } else if (this.type === 'rifle') {
      ctx.fillStyle = '#e17055';
      ctx.fillRect(-s, -3, s*2, 6);
      ctx.fillRect(-s*0.3, -6, 4, 12);
    } else if (this.type === 'shotgun') {
      ctx.fillStyle = '#d63031';
      ctx.fillRect(-s, -4, s*2, 8);
      ctx.fillRect(-s, -2, s*2.2, 4);
    }
    ctx.restore();
  }
}

// ===================== 武器状态 =====================
class WeaponState {
  constructor(type) {
    const w = WEAPONS[type];
    this.type = type;
    this.mag = w.magSize;
    this.reserve = w.totalAmmo === Infinity ? Infinity : w.totalAmmo;
    this.fireTimer = 0;
    this.reloading = false;
    this.reloadTimer = 0;
  }
  canFire() {
    return !this.reloading && this.fireTimer <= 0 && this.mag > 0;
  }
  fire() {
    if (!this.canFire()) return false;
    this.mag--;
    this.fireTimer = WEAPONS[this.type].fireRate;
    return true;
  }
  startReload() {
    if (this.reloading) return;
    const w = WEAPONS[this.type];
    if (this.mag >= w.magSize) return;
    if (this.reserve <= 0 && this.reserve !== Infinity) return;
    this.reloading = true;
    this.reloadTimer = w.reloadTime;
  }
  update(dt) {
    if (this.fireTimer > 0) this.fireTimer -= dt;
    if (this.reloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.reloading = false;
        const w = WEAPONS[this.type];
        const need = w.magSize - this.mag;
        if (this.reserve === Infinity) {
          this.mag = w.magSize;
        } else {
          const add = Math.min(need, this.reserve);
          this.mag += add;
          this.reserve -= add;
        }
      }
    }
  }
}

// ===================== 玩家 =====================
class Player {
  constructor(spawnTX, spawnTY, id, keys) {
    this.id = id;
    this.keys = keys;
    this.spawnX = (spawnTX + 0.5) * CFG.TILE;
    this.spawnY = (spawnTY + 0.5) * CFG.TILE;
    this.r = CFG.PLAYER_R;
    this.color = id === 1 ? '#3498db' : '#2ecc71';
    this.outlineColor = id === 1 ? '#2980b9' : '#27ae60';
    this.reset();
  }
  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.dx = 0; this.dy = 1;
    this.hp = CFG.MAX_HP;
    this.lives = CFG.LIVES;
    this.dead = false;
    this.respawnTimer = 0;
    this.weapons = [new WeaponState('pistol')];
    this.weaponIndex = 0;
    this.invincible = 0;
    this.speed = CFG.PLAYER_SPEED;
    this.damageFlash = 0;
  }
  get weapon() { return this.weapons[this.weaponIndex]; }
  giveWeapon(type) {
    const exists = this.weapons.find(w => w.type === type);
    if (exists) {
      exists.reserve += WEAPONS[type].magSize * 2;
    } else {
      this.weapons.push(new WeaponState(type));
    }
  }
  update(dt, game) {
    if (this.dead) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0 && this.lives > 0) {
        this.dead = false;
        this.hp = CFG.MAX_HP;
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.invincible = 2;
      }
      return;
    }
    if (this.invincible > 0) this.invincible -= dt;
    if (this.damageFlash > 0) this.damageFlash -= dt;

    // 移动
    let mx = 0, my = 0;
    if (game.input.isDown(this.keys.up)) my = -1;
    if (game.input.isDown(this.keys.down)) my = 1;
    if (game.input.isDown(this.keys.left)) mx = -1;
    if (game.input.isDown(this.keys.right)) mx = 1;
    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      mx /= len; my /= len;
      this.dx = mx; this.dy = my;
      let nx = this.x + mx * this.speed * dt;
      let ny = this.y + my * this.speed * dt;
      const res = resolveWallCollision(game.tiles, nx, ny, this.r);
      this.x = res.x; this.y = res.y;
    }

    // 武器更新
    this.weapon.update(dt);

    // 射击
    if (game.input.isDown(this.keys.shoot)) {
      if (this.weapon.canFire() && this.weapon.fire()) {
        const w = WEAPONS[this.weapon.type];
        const pellets = w.pellets || 1;
        for (let i = 0; i < pellets; i++) {
          const angle = Math.atan2(this.dy, this.dx) + rnd(-w.spread, w.spread);
          const bdx = Math.cos(angle), bdy = Math.sin(angle);
          const bx = this.x + bdx * (this.r + 4);
          const by = this.y + bdy * (this.r + 4);
          game.bullets.push(new Bullet(bx, by, bdx, bdy, w.bulletSpeed, w.damage, 'p' + this.id, w.color, w.bulletR));
        }
        // 枪口火焰粒子
        for (let i = 0; i < 4; i++) {
          const angle = Math.atan2(this.dy, this.dx) + rnd(-0.4, 0.4);
          game.particles.push(new Particle(
            this.x + this.dx * (this.r + 6),
            this.y + this.dy * (this.r + 6),
            Math.cos(angle) * rnd(60, 120),
            Math.sin(angle) * rnd(60, 120),
            rnd(0.08, 0.18), '#ffe066', rnd(2, 5)
          ));
        }
      }
    }

    // 换弹
    if (game.input.wasPressed(this.keys.reload)) {
      this.weapon.startReload();
    }

    // 切换武器
    if (game.input.wasPressed(this.keys.switchWeapon)) {
      if (this.weapons.length > 1) {
        this.weaponIndex = (this.weaponIndex + 1) % this.weapons.length;
      }
    }
  }

  takeDamage(dmg) {
    if (this.dead || this.invincible > 0) return;
    this.hp -= dmg;
    this.damageFlash = 0.15;
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  die() {
    this.dead = true;
    this.lives--;
    this.respawnTimer = (this.lives > 0) ? CFG.RESPAWN_TIME : 999;
  }

  draw(ctx) {
    if (this.dead) return;
    ctx.save();
    // 闪烁（无敌时）
    if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    // 受伤闪红
    if (this.damageFlash > 0) {
      ctx.fillStyle = '#ff0000';
    } else {
      ctx.fillStyle = this.color;
    }
    // 身体
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    // 方向指示（枪口）
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + this.dx * this.r * 0.3, this.y + this.dy * this.r * 0.3);
    ctx.lineTo(this.x + this.dx * (this.r + 8), this.y + this.dy * (this.r + 8));
    ctx.stroke();
    // 玩家编号
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P' + this.id, this.x, this.y);
    ctx.restore();
    // 血条
    const barW = 24, barH = 3;
    const hpRatio = this.hp / CFG.MAX_HP;
    ctx.fillStyle = '#555';
    ctx.fillRect(this.x - barW / 2, this.y - this.r - 8, barW, barH);
    ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(this.x - barW / 2, this.y - this.r - 8, barW * hpRatio, barH);
  }
}

// ===================== 敌人 AI =====================
class Enemy {
  constructor(spawnTX, spawnTY, type) {
    const def = ENEMY_TYPES[type];
    this.type = type;
    this.x = (spawnTX + 0.5) * CFG.TILE;
    this.y = (spawnTY + 0.5) * CFG.TILE;
    this.r = def.r;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.speed = def.speed;
    this.color = def.color;
    this.score = def.score;
    this.dx = 0; this.dy = 1;
    this.weapon = new WeaponState(def.weapon);
    this.detectRange = def.detectRange;
    this.state = 'patrol'; // patrol, chase, attack, retreat
    this.target = null;
    this.patrolTarget = null;
    this.alertTimer = 0;
    this.thinkTimer = 0;
    this.alive = true;
    this.stuckTimer = 0;
    this.lastX = this.x;
    this.lastY = this.y;
  }

  pickPatrolTarget(tiles) {
    for (let tries = 0; tries < 20; tries++) {
      const tx = Math.floor(Math.random() * CFG.COLS);
      const ty = Math.floor(Math.random() * CFG.ROWS);
      if (!isSolid(tiles[ty][tx])) {
        this.patrolTarget = { x: (tx + 0.5) * CFG.TILE, y: (ty + 0.5) * CFG.TILE };
        return;
      }
    }
  }

  findTarget(players, tiles) {
    let closest = null, closestDist = Infinity;
    for (const p of players) {
      if (p.dead) continue;
      const d = dist(this, p);
      if (d < this.detectRange && d < closestDist) {
        if (lineOfSight(tiles, this.x, this.y, p.x, p.y)) {
          closest = p;
          closestDist = d;
        }
      }
    }
    return closest;
  }

  moveToward(tx, ty, dt, tiles) {
    const ddx = tx - this.x, ddy = ty - this.y;
    const len = Math.hypot(ddx, ddy);
    if (len < 4) return;
    const mx = ddx / len, my = ddy / len;
    this.dx = mx; this.dy = my;
    let nx = this.x + mx * this.speed * dt;
    let ny = this.y + my * this.speed * dt;
    const res = resolveWallCollision(tiles, nx, ny, this.r);
    this.x = res.x; this.y = res.y;
  }

  update(dt, game) {
    if (!this.alive) return;
    this.weapon.update(dt);
    this.thinkTimer -= dt;

    // 检测卡住
    if (Math.abs(this.x - this.lastX) < 0.1 && Math.abs(this.y - this.lastY) < 0.1) {
      this.stuckTimer += dt;
      if (this.stuckTimer > 1) {
        this.pickPatrolTarget(game.tiles);
        this.stuckTimer = 0;
      }
    } else {
      this.stuckTimer = 0;
    }
    this.lastX = this.x;
    this.lastY = this.y;

    if (this.thinkTimer <= 0) {
      this.thinkTimer = 0.3 + Math.random() * 0.2;
      const target = this.findTarget(game.players, game.tiles);
      if (target) {
        this.target = target;
        const d = dist(this, target);
        if (d < this.detectRange * 0.6) {
          this.state = 'attack';
        } else {
          this.state = 'chase';
        }
        this.alertTimer = 3;
      } else {
        this.alertTimer -= this.thinkTimer;
        if (this.alertTimer <= 0) {
          this.state = 'patrol';
          this.target = null;
        }
      }
    }

    switch (this.state) {
      case 'patrol':
        if (!this.patrolTarget || dist(this, this.patrolTarget) < 16) {
          this.pickPatrolTarget(game.tiles);
        }
        if (this.patrolTarget) this.moveToward(this.patrolTarget.x, this.patrolTarget.y, dt, game.tiles);
        break;
      case 'chase':
        if (this.target && !this.target.dead) {
          this.moveToward(this.target.x, this.target.y, dt, game.tiles);
        } else {
          this.state = 'patrol';
        }
        break;
      case 'attack':
        if (this.target && !this.target.dead) {
          const d = dist(this, this.target);
          // 面向目标
          const adx = this.target.x - this.x, ady = this.target.y - this.y;
          const alen = Math.hypot(adx, ady);
          if (alen > 0) { this.dx = adx / alen; this.dy = ady / alen; }
          // 保持一定距离
          if (d > this.detectRange * 0.7) {
            this.moveToward(this.target.x, this.target.y, dt, game.tiles);
          } else if (d < this.detectRange * 0.3) {
            // 后退
            this.moveToward(this.x - adx * 0.5, this.y - ady * 0.5, dt, game.tiles);
          }
          // 射击
          if (lineOfSight(game.tiles, this.x, this.y, this.target.x, this.target.y)) {
            if (this.weapon.canFire() && this.weapon.fire()) {
              const w = WEAPONS[this.weapon.type];
              const pellets = w.pellets || 1;
              for (let i = 0; i < pellets; i++) {
                const angle = Math.atan2(this.dy, this.dx) + rnd(-w.spread * 1.5, w.spread * 1.5);
                const bdx = Math.cos(angle), bdy = Math.sin(angle);
                game.bullets.push(new Bullet(
                  this.x + bdx * (this.r + 3), this.y + bdy * (this.r + 3),
                  bdx, bdy, w.bulletSpeed * 0.8, Math.floor(w.damage * 0.7), 'enemy', '#ff4757', w.bulletR
                ));
              }
            }
          }
          // 自动换弹
          if (this.weapon.mag <= 0) this.weapon.startReload();
        } else {
          this.state = 'patrol';
        }
        break;
    }
  }

  takeDamage(dmg, game) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.alive = false;
      game.score += this.score;
      // 死亡粒子
      for (let i = 0; i < 12; i++) {
        const a = rnd(0, Math.PI * 2);
        game.particles.push(new Particle(
          this.x, this.y,
          Math.cos(a) * rnd(40, 120), Math.sin(a) * rnd(40, 120),
          rnd(0.3, 0.7), this.color, rnd(3, 6)
        ));
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    // 身体
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 方向
    ctx.strokeStyle = '#dfe6e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + this.dx * this.r * 0.4, this.y + this.dy * this.r * 0.4);
    ctx.lineTo(this.x + this.dx * (this.r + 6), this.y + this.dy * (this.r + 6));
    ctx.stroke();
    // 血条
    if (this.hp < this.maxHp) {
      const barW = 20, barH = 3;
      const ratio = this.hp / this.maxHp;
      ctx.fillStyle = '#555';
      ctx.fillRect(this.x - barW / 2, this.y - this.r - 7, barW, barH);
      ctx.fillStyle = ratio > 0.5 ? '#e74c3c' : '#c0392b';
      ctx.fillRect(this.x - barW / 2, this.y - this.r - 7, barW * ratio, barH);
    }
    // 警觉标志
    if (this.state === 'chase' || this.state === 'attack') {
      ctx.fillStyle = '#f1c40f';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', this.x, this.y - this.r - 12);
    }
  }
}

// ===================== 主游戏类 =====================
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.input = new InputManager();
    this.state = 'menu'; // menu, mapSelect, waveIntro, playing, paused, gameover, victory
    this.mode = null;
    this.mapIndex = 0;
    this.tiles = null;
    this.players = [];
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.pickups = [];
    this.score = 0;
    this.wave = 0;
    this.waveTimer = 0;
    this.lastTime = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;

    this.setupUI();
    requestAnimationFrame(t => this.loop(t));
  }

  setupUI() {
    // 模式选择
    document.getElementById('btnSingle').addEventListener('click', () => {
      this.mode = 'single';
      this.showMapSelect();
    });
    document.getElementById('btnCoop').addEventListener('click', () => {
      this.mode = 'coop';
      this.showMapSelect();
    });

    // 地图选择
    document.querySelectorAll('.map-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.mapIndex = parseInt(btn.dataset.map);
        this.startGame();
      });
    });

    // 暂停/继续
    document.getElementById('resumeBtn').addEventListener('click', () => this.resume());
    document.getElementById('restartPauseBtn').addEventListener('click', () => {
      this.hideOverlay('pauseMenu');
      this.backToMenu();
    });

    // 结算
    document.getElementById('restartBtn').addEventListener('click', () => this.backToMenu());
  }

  showOverlay(id) { document.getElementById(id).classList.add('show'); }
  hideOverlay(id) { document.getElementById(id).classList.remove('show'); }

  showMapSelect() {
    this.hideOverlay('startMenu');
    // 更新地图按钮文字
    const mapBtns = document.querySelectorAll('.map-btn');
    MAPS.forEach((m, i) => { if (mapBtns[i]) mapBtns[i].textContent = m.name; });
    this.showOverlay('mapSelectMenu');
    this.state = 'mapSelect';
  }

  startGame() {
    this.hideOverlay('mapSelectMenu');
    const map = MAPS[this.mapIndex];
    this.tiles = map.tiles;
    this.wave = 0;
    this.score = 0;
    this.bullets = [];
    this.particles = [];
    this.enemies = [];

    // 创建玩家
    this.players = [];
    this.players.push(new Player(map.p1Spawn.x, map.p1Spawn.y, 1, P1_KEYS));
    if (this.mode === 'coop') {
      this.players.push(new Player(map.p2Spawn.x, map.p2Spawn.y, 2, P2_KEYS));
    }

    // 创建拾取物
    this.pickups = map.pickupSpots.map(s => new Pickup(s.x, s.y, s.type));

    // 更新 HUD
    this.updateHUDVisibility();
    this.nextWave();
  }

  updateHUDVisibility() {
    const p2hud = document.getElementById('p2Hud');
    if (p2hud) p2hud.style.display = this.mode === 'coop' ? '' : 'none';
  }

  nextWave() {
    this.wave++;
    if (this.wave > CFG.TOTAL_WAVES) {
      this.victory();
      return;
    }
    this.state = 'waveIntro';
    this.waveTimer = CFG.WAVE_DELAY;

    // 生成敌人
    const types = getWaveEnemies(this.wave);
    const map = MAPS[this.mapIndex];
    this.enemies = [];
    for (let i = 0; i < types.length; i++) {
      const spawn = map.enemySpawns[i % map.enemySpawns.length];
      // 加点随机偏移防止重叠
      const ox = (Math.floor(i / map.enemySpawns.length)) * 1.5;
      const spawnX = spawn.x + (ox % 3);
      const spawnY = spawn.y;
      this.enemies.push(new Enemy(spawnX, spawnY, types[i]));
    }
  }

  victory() {
    this.state = 'victory';
    document.getElementById('endTitle').textContent = '任务完成！';
    document.getElementById('endText').textContent = `总分: ${this.score} | 模式: ${this.mode === 'coop' ? '双人合作' : '单人'}`;
    this.showOverlay('gameOverMenu');
  }

  gameOver() {
    this.state = 'gameover';
    document.getElementById('endTitle').textContent = '任务失败';
    document.getElementById('endText').textContent = `第 ${this.wave} 波 | 总分: ${this.score}`;
    this.showOverlay('gameOverMenu');
  }

  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.showOverlay('pauseMenu');
    }
  }

  resume() {
    this.state = 'playing';
    this.hideOverlay('pauseMenu');
  }

  backToMenu() {
    this.hideOverlay('gameOverMenu');
    this.hideOverlay('pauseMenu');
    this.hideOverlay('mapSelectMenu');
    this.showOverlay('startMenu');
    this.state = 'menu';
  }

  // ---- 碰撞检测 ----
  checkCollisions() {
    // 子弹 vs 敌人（玩家子弹）
    for (const b of this.bullets) {
      if (!b.alive) continue;
      if (b.owner === 'enemy') {
        // 敌人子弹 vs 玩家
        for (const p of this.players) {
          if (p.dead) continue;
          if (dist(b, p) < p.r + b.r) {
            b.alive = false;
            p.takeDamage(b.damage);
            this.shakeTimer = 0.1;
            this.shakeIntensity = 3;
            // 受击粒子
            for (let i = 0; i < 5; i++) {
              const a = rnd(0, Math.PI * 2);
              this.particles.push(new Particle(b.x, b.y, Math.cos(a) * rnd(30, 80), Math.sin(a) * rnd(30, 80), rnd(0.1, 0.3), '#ff6b6b', rnd(2, 4)));
            }
          }
        }
      } else {
        // 玩家子弹 vs 敌人
        for (const e of this.enemies) {
          if (!e.alive) continue;
          if (dist(b, e) < e.r + b.r) {
            b.alive = false;
            e.takeDamage(b.damage, this);
            // 命中粒子
            for (let i = 0; i < 4; i++) {
              const a = rnd(0, Math.PI * 2);
              this.particles.push(new Particle(b.x, b.y, Math.cos(a) * rnd(30, 80), Math.sin(a) * rnd(30, 80), rnd(0.1, 0.3), e.color, rnd(2, 4)));
            }
            // 被攻击后锁定攻击者
            if (e.state === 'patrol') {
              e.target = this.players.find(p => !p.dead);
              e.state = 'chase';
              e.alertTimer = 5;
            }
          }
        }
      }
    }

    // 玩家拾取道具
    for (const p of this.players) {
      if (p.dead) continue;
      for (const pk of this.pickups) {
        if (!pk.active) continue;
        if (dist(p, pk) < p.r + 14) {
          if (pk.type === 'health') {
            if (p.hp < CFG.MAX_HP) {
              p.hp = Math.min(CFG.MAX_HP, p.hp + 50);
              pk.collect();
            }
          } else if (pk.type === 'ammo') {
            const w = p.weapon;
            if (w.reserve !== Infinity && w.reserve < WEAPONS[w.type].totalAmmo) {
              w.reserve += WEAPONS[w.type].magSize;
              pk.collect();
            }
          } else if (pk.type === 'rifle' || pk.type === 'shotgun') {
            p.giveWeapon(pk.type);
            pk.collect();
          }
        }
      }
    }

    // 清除死亡子弹和敌人
    this.bullets = this.bullets.filter(b => b.alive);
    this.enemies = this.enemies.filter(e => e.alive);
  }

  // ---- 更新 ----
  update(dt) {
    // ESC 暂停
    if (this.input.wasPressed('Escape')) {
      if (this.state === 'playing' || this.state === 'waveIntro') this.pause();
      else if (this.state === 'paused') this.resume();
    }

    if (this.state === 'waveIntro') {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) this.state = 'playing';
      // 还是要更新粒子
      this.particles = this.particles.filter(p => p.update(dt));
      return;
    }

    if (this.state !== 'playing') return;

    // 屏幕震动
    if (this.shakeTimer > 0) this.shakeTimer -= dt;

    // 更新玩家
    for (const p of this.players) p.update(dt, this);

    // 更新敌人
    for (const e of this.enemies) e.update(dt, this);

    // 更新子弹
    for (const b of this.bullets) b.update(dt, this.tiles);

    // 更新粒子
    this.particles = this.particles.filter(p => p.update(dt));

    // 更新拾取物
    for (const pk of this.pickups) pk.update(dt);

    // 碰撞
    this.checkCollisions();

    // 检查波次完成
    if (this.enemies.length === 0 && this.state === 'playing') {
      this.nextWave();
    }

    // 检查游戏结束
    if (this.players.every(p => p.lives <= 0 && p.dead)) {
      this.gameOver();
    }
  }

  // ---- 渲染 ----
  render() {
    const ctx = this.ctx;
    ctx.save();

    // 屏幕震动
    if (this.shakeTimer > 0) {
      const sx = rnd(-this.shakeIntensity, this.shakeIntensity);
      const sy = rnd(-this.shakeIntensity, this.shakeIntensity);
      ctx.translate(sx, sy);
    }

    ctx.clearRect(-10, -10, CFG.W + 20, CFG.H + 20);

    // 渲染地图
    this.renderMap(ctx);

    // 渲染拾取物
    for (const pk of this.pickups) pk.draw(ctx);

    // 渲染敌人
    for (const e of this.enemies) e.draw(ctx);

    // 渲染玩家
    for (const p of this.players) p.draw(ctx);

    // 渲染子弹
    for (const b of this.bullets) b.draw(ctx);

    // 渲染粒子
    for (const p of this.particles) p.draw(ctx);

    // 波次提示
    if (this.state === 'waveIntro') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CFG.W, CFG.H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`第 ${this.wave} 波`, CFG.W / 2, CFG.H / 2 - 20);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#dfe6e9';
      ctx.fillText(`敌人数量: ${this.enemies.length}`, CFG.W / 2, CFG.H / 2 + 25);
    }

    ctx.restore();

    // HUD（不受震动影响）
    this.renderHUD(ctx);
  }

  renderMap(ctx) {
    if (!this.tiles) return;
    for (let y = 0; y < CFG.ROWS; y++) {
      for (let x = 0; x < CFG.COLS; x++) {
        const t = this.tiles[y][x];
        const px = x * CFG.TILE, py = y * CFG.TILE;
        if (t === 1) {
          ctx.fillStyle = '#636e72';
          ctx.fillRect(px, py, CFG.TILE, CFG.TILE);
          ctx.strokeStyle = '#4a5459';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, CFG.TILE, CFG.TILE);
        } else if (t === 2) {
          ctx.fillStyle = '#b2825a';
          ctx.fillRect(px + 2, py + 2, CFG.TILE - 4, CFG.TILE - 4);
          ctx.strokeStyle = '#8b6542';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 2, py + 2, CFG.TILE - 4, CFG.TILE - 4);
          // 箱子交叉线
          ctx.beginPath();
          ctx.moveTo(px + 2, py + 2);
          ctx.lineTo(px + CFG.TILE - 2, py + CFG.TILE - 2);
          ctx.moveTo(px + CFG.TILE - 2, py + 2);
          ctx.lineTo(px + 2, py + CFG.TILE - 2);
          ctx.strokeStyle = '#9b7653';
          ctx.stroke();
        } else if (t === 3) {
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(px, py, CFG.TILE, CFG.TILE);
        } else {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#34495e' : '#2c3e50';
          ctx.fillRect(px, py, CFG.TILE, CFG.TILE);
        }
      }
    }
  }

  renderHUD(ctx) {
    if (this.state === 'menu' || this.state === 'mapSelect') return;

    const hudH = 0;
    const y = CFG.H - 44;

    // 半透明底条
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, y, CFG.W, 44);

    // P1 信息
    const p1 = this.players[0];
    if (p1) this.drawPlayerHUD(ctx, p1, 10, y + 6);

    // P2 信息
    if (this.mode === 'coop' && this.players[1]) {
      this.drawPlayerHUD(ctx, this.players[1], 340, y + 6);
    }

    // 波次、分数
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`第 ${this.wave}/${CFG.TOTAL_WAVES} 波`, CFG.W / 2, y + 16);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`分数: ${this.score}`, CFG.W / 2, y + 34);

    // 剩余敌人
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e74c3c';
    ctx.font = '13px sans-serif';
    ctx.fillText(`敌人: ${this.enemies.length}`, CFG.W - 15, y + 16);
    ctx.fillStyle = '#dfe6e9';
    ctx.fillText(`${MAPS[this.mapIndex].name}`, CFG.W - 15, y + 34);
  }

  drawPlayerHUD(ctx, p, x, y) {
    ctx.textAlign = 'left';
    // 名称
    ctx.fillStyle = p.color;
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`P${p.id}`, x, y + 10);

    if (p.dead && p.lives <= 0) {
      ctx.fillStyle = '#e74c3c';
      ctx.font = '12px sans-serif';
      ctx.fillText('已阵亡', x + 28, y + 10);
      return;
    }
    if (p.dead) {
      ctx.fillStyle = '#f39c12';
      ctx.font = '12px sans-serif';
      ctx.fillText(`复活中... ${Math.ceil(p.respawnTimer)}s`, x + 28, y + 10);
      return;
    }

    // 生命
    ctx.fillStyle = '#dfe6e9';
    ctx.font = '12px sans-serif';
    ctx.fillText(`♥${p.lives}`, x + 28, y + 10);

    // HP 条
    const barX = x + 60, barW = 60, barH = 8;
    const hpR = p.hp / CFG.MAX_HP;
    ctx.fillStyle = '#555';
    ctx.fillRect(barX, y + 2, barW, barH);
    ctx.fillStyle = hpR > 0.5 ? '#2ecc71' : hpR > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(barX, y + 2, barW * hpR, barH);

    // 武器
    const w = p.weapon;
    const wDef = WEAPONS[w.type];
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '11px sans-serif';
    ctx.fillText(wDef.name, x + 130, y + 10);

    // 弹药
    ctx.fillStyle = w.reloading ? '#f39c12' : '#ecf0f1';
    const ammoText = w.reloading ? '换弹中...' : `${w.mag}/${w.reserve === Infinity ? '∞' : w.reserve}`;
    ctx.fillText(ammoText, x + 180, y + 10);

    // 武器列表
    ctx.fillStyle = '#888';
    ctx.font = '10px sans-serif';
    const weaponList = p.weapons.map((ws, i) => (i === p.weaponIndex ? `[${WEAPONS[ws.type].name}]` : WEAPONS[ws.type].name)).join(' ');
    ctx.fillText(weaponList, x, y + 26);
  }

  // ---- 主循环 ----
  loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;

    this.update(dt);
    this.render();
    this.input.clearFrame();

    requestAnimationFrame(t => this.loop(t));
  }
}

// ===================== 初始化 =====================
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
