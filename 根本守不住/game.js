// ============ Canvas 战场渲染引擎（V0.4）============
// ============ 关卡配置 ============
const LEVELS = {
    'practice': {
        name: '对抗',
        mode: 'skirmish',
        enemyStrategy: 'balanced',
        baseHp: 2200,
        waves: null
    },
    'campaign-1-1': {
        name: '新手营地',
        mode: 'campaign',
        difficulty: 1,
        enemyStrategy: 'weak',
        baseHp: 1800,
        target: '先摧毁敌方，熟悉游戏',
        waves: [
            { time: 5, count: 2, units: ['swordsman', 'archer'] },
            { time: 12, count: 2, units: ['swordsman'] },
            { time: 18, count: 3, units: ['archer', 'swordsman'] }
        ]
    },
    'campaign-1-2': {
        name: '森林小路',
        mode: 'campaign',
        difficulty: 2,
        enemyStrategy: 'balanced',
        baseHp: 1900,
        target: '敌方开始出现盾兵',
        waves: [
            { time: 6, count: 2, units: ['swordsman'] },
            { time: 14, count: 2, units: ['shield', 'archer'] },
            { time: 22, count: 3, units: ['swordsman', 'archer'] },
            { time: 30, count: 2, units: ['shield'] }
        ]
    },
    'campaign-1-3': {
        name: '沼泽前线',
        mode: 'campaign',
        difficulty: 3,
        enemyStrategy: 'mixed',
        baseHp: 2000,
        target: '出现法师单位',
        waves: [
            { time: 5, count: 2, units: ['archer'] },
            { time: 13, count: 2, units: ['mage', 'swordsman'] },
            { time: 21, count: 3, units: ['shield', 'archer'] },
            { time: 29, count: 2, units: ['mage'] },
            { time: 37, count: 3, units: ['swordsman', 'shield', 'archer'] }
        ]
    }
};

const UNIT_DEFS = [
    { key: 'swordsman', name: '剑士', cost: 3, hp: 420, atk: 68, speed: 56, range: 24, atkCd: 1.0, trait: 'combo' },
    { key: 'archer', name: '弓箭手', cost: 3, hp: 260, atk: 92, speed: 44, range: 132, atkCd: 1.2, trait: 'none' },
    { key: 'shield', name: '盾兵', cost: 4, hp: 760, atk: 42, speed: 34, range: 24, atkCd: 1.1, trait: 'fortify' },
    { key: 'mage', name: '法师', cost: 4, hp: 300, atk: 118, speed: 38, range: 122, atkCd: 1.4, trait: 'splash' },
    { key: 'lancer', name: '枪骑士', cost: 5, hp: 500, atk: 112, speed: 70, range: 26, atkCd: 1.05, trait: 'charge' },
    { key: 'bomber', name: '投弹工', cost: 4, hp: 250, atk: 150, speed: 43, range: 114, atkCd: 1.6, trait: 'siege' },
    { key: 'healer', name: '治疗修女', cost: 4, hp: 320, atk: 28, speed: 38, range: 94, atkCd: 1.0, trait: 'heal' },
    { key: 'assassin', name: '刺客', cost: 3, hp: 240, atk: 138, speed: 78, range: 24, atkCd: 0.9, trait: 'dash' },
    { key: 'catapult', name: '投石车', cost: 5, hp: 420, atk: 180, speed: 28, range: 170, atkCd: 2.0, trait: 'slow' },
    { key: 'berserker', name: '狂战士', cost: 4, hp: 480, atk: 88, speed: 52, range: 24, atkCd: 1.0, trait: 'rage' }
];

const HERO_SKILLS = [
    {
        key: 'paladin',
        name: '圣骑士壁垒',
        icon: '🛡️',
        cost: 4,
        cd: 18,
        desc: '全体友军 8 秒减伤 35%',
        cast: () => {
            state.buffs.playerFortify = 8;
            pushHint('圣骑士展开壁垒，前排更能扛。');
        }
    },
    {
        key: 'ranger',
        name: '精灵箭雨',
        icon: '🏹',
        cost: 4,
        cd: 14,
        desc: '随机两路对敌军造成范围伤害',
        cast: () => {
            const lanes = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, 2);
            let hits = 0;
            for (const unit of state.units) {
                if (unit.side === 'enemy' && lanes.includes(unit.lane)) {
                    unit.hp -= 130;
                    hits += 1;
                }
            }
            if (hits > 0) {
                state.progress = clamp(state.progress + Math.min(10, hits), -100, 100);
            }
            pushHint('箭雨落下，敌方后排遭到压制。');
        }
    },
    {
        key: 'warlock',
        name: '巫妖邪能',
        icon: '🔥',
        cost: 5,
        cd: 20,
        desc: '对敌军造成 180 伤害+减速',
        cast: () => {
            let hits = 0;
            for (const unit of state.units) {
                if (unit.side === 'enemy') {
                    unit.hp -= 165;
                    hits += 1;
                }
            }
            if (hits > 0) {
                state.progress = clamp(state.progress + Math.min(12, Math.floor(hits * 0.8)), -100, 100);
            }
            pushHint('火焰术士引爆战场，敌群被点燃。');
        }
    }
];

const LANE_Y = [132, 200, 268];
const LEFT_EDGE = 40;
const RIGHT_EDGE = 960;

const state = {
    gameMode: 'practice',
    currentLevel: 'practice',
    levelInfo: null,
    waveIndex: 0,
    running: false,
    paused: false,
    time: 0,
    energy: 4,
    maxEnergy: 10,
    enemyEnergy: 4,
    progress: 0,
    playerBaseHp: 2200,
    enemyBaseHp: 2200,
    units: [],
    nextId: 1,
    enemyThink: 0,
    tickTimer: null,
    lastTs: 0,
    heroCd: {},
    buffs: {
        playerFortify: 0
    }
};

const el = {
    app: document.getElementById('app'),
    topbar: document.querySelector('.topbar'),
    battlefield: document.getElementById('battlefield'),
    canvas: null,
    ctx: null,
    cardRow: document.querySelector('.card-row'),
    heroRow: document.querySelector('.hero-row'),
    hud: document.querySelector('.hud'),
    hintText: document.querySelector('.hint'),
    startBtn: document.querySelector('.btn-primary'),
    pauseBtn: document.querySelector('.btn-secondary'),
    resetBtn: document.querySelectorAll('.btn')[2],
    gameTime: document.getElementById('gameTime'),
    playerBaseHp: document.getElementById('playerBaseHp'),
    enemyBaseHp: document.getElementById('enemyBaseHp'),
    energyText: document.querySelector('.energy-text'),
    energyFill: document.querySelector('.energy-fill'),
    progressBlue: document.querySelector('.progress-blue'),
    progressRed: document.querySelector('.progress-red'),
    modeSelector: document.getElementById('modeSelector')
};

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function byKey(key) {
    return UNIT_DEFS.find((u) => u.key === key);
}

// ============ Canvas 初始化 ============
function initCanvas() {
    el.canvas = document.getElementById('battlefieldCanvas');
    if (!el.canvas) {
        const canvas = document.createElement('canvas');
        canvas.id = 'battlefieldCanvas';
        el.battlefield.appendChild(canvas);
        el.canvas = canvas;
    }
    el.ctx = el.canvas.getContext('2d');
    el.canvas.width = el.battlefield.offsetWidth;
    el.canvas.height = el.battlefield.offsetHeight;
}

// ============ Canvas 绘制函数 ============
function drawBattlefield() {
    const ctx = el.ctx;
    const w = el.canvas.width;
    const h = el.canvas.height;
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, w, h);
    drawBackground(ctx, w, h);
    drawLanes(ctx, w, h);
    drawBases(ctx, w, h);
    drawUnits(ctx, w, h);
    drawUnitHealthBars(ctx, w, h);
}

function drawBackground(ctx, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.3);
    skyGrad.addColorStop(0, '#87ceeb');
    skyGrad.addColorStop(1, '#b0e0e6');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.3);
    const groundGrad = ctx.createLinearGradient(0, h * 0.3, 0, h);
    groundGrad.addColorStop(0, '#6bb843');
    groundGrad.addColorStop(1, '#558a2a');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.3, w, h * 0.7);
}

function drawLanes(ctx, w, h) {
    const laneW = w - 160;
    const laneStartX = 80;
    for (let i = 0; i < 3; i++) {
        const y = LANE_Y[i];
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(laneStartX, y - 8, laneW, 16);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(laneStartX, y);
        ctx.lineTo(laneStartX + laneW, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(laneStartX, y - 10, laneW, 2);
        ctx.fillRect(laneStartX, y + 8, laneW, 2);
    }
}

function drawBases(ctx, w, h) {
    drawPlayerBase(ctx, 20, h / 2 - 40);
    drawEnemyBase(ctx, w - 100, h / 2 - 40);
}

function drawPlayerBase(ctx, x, y) {
    const baseW = 60, baseH = 80;
    const baseGrad = ctx.createLinearGradient(x, y, x, y + baseH);
    baseGrad.addColorStop(0, '#5eb3ff');
    baseGrad.addColorStop(1, '#2a7fd9');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(x, y, baseW, baseH);
    ctx.fillStyle = '#4a9fff';
    ctx.fillRect(x + 5, y - 20, 15, 50);
    ctx.fillStyle = '#4a9fff';
    ctx.fillRect(x + 40, y - 15, 15, 45);
    ctx.fillStyle = '#00aa00';
    ctx.fillRect(x + baseW / 2 - 2, y - 30, 4, 30);
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.moveTo(x + baseW / 2 + 2, y - 30);
    ctx.lineTo(x + baseW / 2 + 2, y - 20);
    ctx.lineTo(x + baseW / 2 + 15, y - 25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(state.playerBaseHp), x + baseW / 2, y + baseH + 15);
}

function drawEnemyBase(ctx, x, y) {
    const baseW = 60, baseH = 80;
    const baseGrad = ctx.createLinearGradient(x, y, x, y + baseH);
    baseGrad.addColorStop(0, '#ff6f5a');
    baseGrad.addColorStop(1, '#cc1a1a');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(x, y, baseW, baseH);
    ctx.fillStyle = '#ff8575';
    ctx.fillRect(x + 5, y - 20, 15, 50);
    ctx.fillRect(x + 40, y - 15, 15, 45);
    ctx.fillStyle = '#ff4400';
    ctx.fillRect(x + baseW / 2 - 2, y - 30, 4, 30);
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(x + baseW / 2 + 2, y - 30);
    ctx.lineTo(x + baseW / 2 + 2, y - 20);
    ctx.lineTo(x + baseW / 2 + 15, y - 25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(state.enemyBaseHp), x + baseW / 2, y + baseH + 15);
}

function drawUnits(ctx, w, h) {
    for (const unit of state.units) {
        if (unit.hp <= 0) continue;
        drawUnit(ctx, unit);
    }
}

function drawUnit(ctx, unit) {
    const x = unit.x, y = unit.y;
    const isPlayer = unit.side === 'player';
    const baseColor = isPlayer ? '#4a9fff' : '#ff6f5a';
    const accentColor = isPlayer ? '#2a7fd9' : '#ff3a2a';
    drawUnitShape(ctx, x, y, 16, unit, baseColor, accentColor);
    if (unit.slowTimer > 0) {
        ctx.strokeStyle = 'rgba(0,150,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawUnitShape(ctx, x, y, size, unit, baseColor, accentColor) {
    switch (unit.key) {
        case 'swordsman': drawSwordsman(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'archer': drawArcher(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'shield': drawShield(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'mage': drawMage(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'lancer': drawLancer(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'bomber': drawBomber(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'healer': drawHealer(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'assassin': drawAssassin(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'catapult': drawCatapult(ctx, x, y, size, baseColor, accentColor, unit); break;
        case 'berserker': drawBerserker(ctx, x, y, size, baseColor, accentColor, unit); break;
        default: ctx.fillStyle = baseColor; ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
}

function drawSwordsman(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = '#fff0d9'; ctx.fillRect(x - 6, y - 12, 12, 10);
    ctx.fillStyle = baseColor; ctx.fillRect(x - 7, y - 2, 14, 12);
    ctx.fillStyle = '#333'; ctx.fillRect(x - 4, y + 10, 3, 6); ctx.fillRect(x + 1, y + 10, 3, 6);
    ctx.strokeStyle = accentColor; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 10, y - 8); ctx.lineTo(x + 18, y - 15); ctx.stroke();
}
function drawArcher(ctx, x, y, size, baseColor, accentColor, unit) {
    const isPlayer = unit && unit.side === 'player';
    const bob = unit ? Math.sin(unit.age * 6.5) * 0.8 : 0;
    const yy = y + bob;
    const skin = '#ffe8cc';
    const hair = isPlayer ? '#f3cf5a' : '#a57d63';
    const hood = isPlayer ? '#84e59d' : '#7f8f98';
    const cape = isPlayer ? '#c8f0ff' : '#d6b8b2';
    const bow = isPlayer ? '#7a4d2a' : '#6d4a3f';

    // Big head and tiny body for cute readability on small screens.
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(x, yy - 11, 6, 0, Math.PI * 2);
    ctx.fill();

    // Elf ears
    ctx.beginPath();
    ctx.moveTo(x - 7, yy - 12);
    ctx.lineTo(x - 12, yy - 10);
    ctx.lineTo(x - 7, yy - 8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 7, yy - 12);
    ctx.lineTo(x + 12, yy - 10);
    ctx.lineTo(x + 7, yy - 8);
    ctx.closePath();
    ctx.fill();

    // Hood
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.3;
    ctx.fillStyle = hood;
    ctx.beginPath();
    ctx.arc(x, yy - 12, 7.5, Math.PI * 0.1, Math.PI * 0.9, true);
    ctx.fill();
    ctx.stroke();

    // Blonde hair for player archer (small side bangs)
    ctx.fillStyle = hair;
    ctx.fillRect(x - 5.5, yy - 9.2, 11, 2.3);
    if (isPlayer) {
        ctx.beginPath();
        ctx.moveTo(x - 5.5, yy - 8);
        ctx.lineTo(x - 7.5, yy - 4.5);
        ctx.lineTo(x - 3.8, yy - 5);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + 5.5, yy - 8);
        ctx.lineTo(x + 7.5, yy - 4.5);
        ctx.lineTo(x + 3.8, yy - 5);
        ctx.closePath();
        ctx.fill();
    }

    // Face
    ctx.fillStyle = '#1f2a3a';
    ctx.beginPath();
    ctx.arc(x - 2.1, yy - 11.3, 0.85, 0, Math.PI * 2);
    ctx.arc(x + 2.1, yy - 11.3, 0.85, 0, Math.PI * 2);
    ctx.fill();
    if (isPlayer) {
        ctx.fillStyle = '#f5b0b5';
        ctx.beginPath();
        ctx.arc(x - 3.6, yy - 9.7, 0.8, 0, Math.PI * 2);
        ctx.arc(x + 3.6, yy - 9.7, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = '#c9867c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, yy - 9.2, 1.5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Body + cape
    ctx.fillStyle = baseColor;
    ctx.fillRect(x - 5, yy - 3, 10, 11);
    ctx.fillStyle = 'rgba(255,255,255,0.34)';
    ctx.fillRect(x - 4, yy - 2, 2, 9);
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(x - 5, yy - 2);
    ctx.lineTo(x - 10, yy + 5);
    ctx.lineTo(x - 5, yy + 8);
    ctx.closePath();
    ctx.fill();

    // Feet
    ctx.fillStyle = '#2e3440';
    ctx.fillRect(x - 3, yy + 8, 2, 5);
    ctx.fillRect(x + 1, yy + 8, 2, 5);

    // Cute bow + bowstring
    ctx.strokeStyle = bow;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 8, yy - 2, 4.6, Math.PI * 0.7, Math.PI * 1.7);
    ctx.arc(x + 8, yy + 4, 4.6, Math.PI * 0.3, Math.PI * 1.3);
    ctx.stroke();
    ctx.strokeStyle = '#f3f8ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, yy - 7.5);
    ctx.lineTo(x + 8, yy + 9.5);
    ctx.stroke();

    if (isPlayer) {
        // Tiny sparkle for hero-like charm on the player archer.
        const t = unit ? Math.sin(unit.age * 8) : 0;
        ctx.fillStyle = t > 0 ? '#fff7d6' : '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 3.8, yy - 16.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }
}
function drawShield(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = '#fff0d9'; ctx.fillRect(x - 6, y - 12, 12, 10);
    ctx.fillStyle = baseColor; ctx.fillRect(x - 7, y - 2, 14, 12);
    ctx.fillStyle = accentColor;
    ctx.beginPath(); ctx.moveTo(x - 10, y - 5); ctx.lineTo(x - 10, y + 10);
    ctx.quadraticCurveTo(x - 5, y + 15, x, y + 15);
    ctx.quadraticCurveTo(x + 5, y + 15, x + 10, y + 10);
    ctx.lineTo(x + 10, y - 5); ctx.closePath(); ctx.fill();
}
function drawMage(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = accentColor;
    ctx.beginPath(); ctx.moveTo(x - 6, y - 12); ctx.lineTo(x - 4, y - 18); ctx.lineTo(x + 4, y - 18); ctx.lineTo(x + 6, y - 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff0d9'; ctx.fillRect(x - 6, y - 10, 12, 8);
    ctx.fillStyle = baseColor; ctx.fillRect(x - 7, y - 2, 14, 12);
    ctx.strokeStyle = accentColor; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x + 8, y - 3, 6, 0, Math.PI * 2); ctx.stroke();
}
function drawLancer(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = '#fff0d9'; ctx.beginPath(); ctx.arc(x, y - 12, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = baseColor; ctx.fillRect(x - 8, y - 4, 16, 12);
    ctx.strokeStyle = accentColor; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x + 12, y - 12); ctx.lineTo(x + 12, y + 10); ctx.stroke();
}
function drawBomber(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = '#fff0d9'; ctx.fillRect(x - 5, y - 11, 10, 8);
    ctx.fillStyle = baseColor; ctx.fillRect(x - 8, y - 3, 16, 12);
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x - 8, y + 8, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = accentColor; ctx.fillRect(x - 8, y + 2, 2, 7);
}
function drawHealer(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = '#fff0d9'; ctx.beginPath(); ctx.arc(x, y - 10, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = baseColor; ctx.fillRect(x - 6, y - 2, 12, 12);
    ctx.strokeStyle = accentColor; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 8, y - 2); ctx.lineTo(x + 8, y + 6); ctx.moveTo(x + 5, y + 2); ctx.lineTo(x + 11, y + 2); ctx.stroke();
}
function drawAssassin(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = '#fff0d9'; ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x - 5, y - 8); ctx.lineTo(x + 5, y - 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = baseColor; ctx.fillRect(x - 5, y - 4, 10, 14);
    ctx.strokeStyle = accentColor; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 7, y - 6); ctx.lineTo(x + 14, y - 12); ctx.stroke();
}
function drawCatapult(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = baseColor; ctx.fillRect(x - 10, y + 6, 20, 6);
    ctx.strokeStyle = accentColor; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 6, y + 6); ctx.lineTo(x - 8, y - 8); ctx.stroke();
    ctx.fillStyle = '#666'; ctx.beginPath(); ctx.arc(x - 8, y - 10, 4, 0, Math.PI * 2); ctx.fill();
}
function drawBerserker(ctx, x, y, size, baseColor, accentColor) {
    ctx.fillStyle = '#fff0d9'; ctx.fillRect(x - 7, y - 13, 14, 10);
    ctx.fillStyle = baseColor; ctx.fillRect(x - 9, y - 2, 18, 14);
    ctx.fillStyle = accentColor; ctx.fillRect(x + 12, y - 14, 4, 22); ctx.fillRect(x + 10, y - 16, 8, 3);
}

function drawUnitHealthBars(ctx, w, h) {
    for (const unit of state.units) {
        if (unit.hp <= 0) continue;
        const x = unit.x, y = unit.y - 22;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - 16, y, 32, 4);
        const hpPercent = unit.hp / unit.maxHp;
        const barColor = hpPercent > 0.5 ? '#4ee096' : hpPercent > 0.2 ? '#ffd700' : '#ff6d6d';
        ctx.fillStyle = barColor; ctx.fillRect(x - 16, y, Math.max(0, 32 * hpPercent), 4);
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(x - 16, y, 32, 4);
    }
}

function setupCards() {
    el.cardRow.innerHTML = '';
    UNIT_DEFS.forEach((def) => {
        const btn = document.createElement('button');
        btn.className = 'card';
        btn.dataset.key = def.key;
        btn.innerHTML = `<div class="card-icon">⚡</div><div class="card-name">${def.name}</div><div class="card-cost">${def.cost}⚡</div>`;
        btn.addEventListener('click', () => summonPlayer(def.key));
        el.cardRow.appendChild(btn);
    });
}

function setupHeroes() {
    el.heroRow.innerHTML = '';
    HERO_SKILLS.forEach((skill) => {
        const btn = document.createElement('button');
        btn.className = 'hero-btn';
        btn.dataset.type = 'hero';
        btn.dataset.key = skill.key;
        btn.innerHTML = `<div class="hero-icon">*</div><div class="hero-name">${skill.name}</div><div class="hero-meta">${skill.cost}⚡</div>`;
        btn.addEventListener('click', () => castHeroSkill(skill.key));
        el.heroRow.appendChild(btn);
    });
}

function setupModes() {
    const modeSelector = document.getElementById('modeSelector');
    if (!modeSelector) return;
    const btns = modeSelector.querySelectorAll('.mode-btn');
    btns.forEach((btn) => {
        btn.addEventListener('click', () => selectMode(btn.dataset.mode));
    });
}

function selectMode(mode) {
    state.gameMode = mode;
    const levelInfo = LEVELS[mode];
    if (!levelInfo) {
        pushHint(`未知模式 ${mode}`);
        return;
    }
    state.currentLevel = mode;
    state.levelInfo = levelInfo;
    state.playerBaseHp = levelInfo.baseHp;
    state.enemyBaseHp = levelInfo.baseHp;
    state.waveIndex = 0;
    const modeSelector = document.getElementById('modeSelector');
    if (modeSelector) {
        modeSelector.querySelectorAll('.mode-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }
    pushHint(`已选择：${levelInfo.name}。点击"开始对战"开始。`);
}

function pushHint(text) {
    el.hintText.textContent = text;
}

function resetGame() {
    state.running = false;
    state.paused = false;
    state.time = 0;
    state.energy = 4;
    state.enemyEnergy = 4;
    state.progress = 0;
    state.playerBaseHp = state.levelInfo ? state.levelInfo.baseHp : 2200;
    state.enemyBaseHp = state.levelInfo ? state.levelInfo.baseHp : 2200;
    state.units = [];
    state.nextId = 1;
    state.enemyThink = 1.6;
    state.waveTimer = 0;
    state.waveIndex = 0;
    state.lastTs = 0;
    state.buffs.playerFortify = 0;
    state.heroCd = {};
    HERO_SKILLS.forEach((skill) => {
        state.heroCd[skill.key] = 0;
    });
    if (state.tickTimer) {
        cancelAnimationFrame(state.tickTimer);
        state.tickTimer = null;
    }
    el.pauseBtn.disabled = true;
    el.pauseBtn.textContent = '暂停';
    render();
    pushHint('已重开。选择模式后点击"开始对战"。');
}

function startGame() {
    if (state.running) {
        return;
    }
    state.running = true;
    state.paused = false;
    el.pauseBtn.disabled = false;
    pushHint('对局进行中：注意蓝红进度条拉扯。');
    state.lastTs = performance.now();
    state.tickTimer = requestAnimationFrame(loop);
}

function togglePause() {
    if (!state.running) {
        return;
    }
    state.paused = !state.paused;
    el.pauseBtn.textContent = state.paused ? '继续' : '暂停';
    if (!state.paused) {
        state.lastTs = performance.now();
        state.tickTimer = requestAnimationFrame(loop);
    }
}

function loop(ts) {
    if (!state.running || state.paused) {
        return;
    }
    const dt = Math.min((ts - state.lastTs) / 1000, 0.05);
    state.lastTs = ts;

    updateTime(dt);
    regenEnergy(dt);
    updateCooldowns(dt);
    runEnemyAI(dt);
    updateUnits(dt);
    state.units = state.units.filter((u) => u.hp > 0);
    checkVictory();
    render();

    if (state.running && !state.paused) {
        state.tickTimer = requestAnimationFrame(loop);
    }
}

function updateTime(dt) {
    state.time += dt;
}

function regenEnergy(dt) {
    const energyRate = state.time >= 90 ? 1.5 : 1.0;
    state.energy = Math.min(state.maxEnergy, state.energy + dt * energyRate);
    state.enemyEnergy = Math.min(state.maxEnergy, state.enemyEnergy + dt * energyRate * 1.03);
}

function updateCooldowns(dt) {
    for (const key of Object.keys(state.heroCd)) {
        state.heroCd[key] = Math.max(0, state.heroCd[key] - dt);
    }
    state.buffs.playerFortify = Math.max(0, state.buffs.playerFortify - dt);
}

function summonPlayer(unitKey) {
    if (!state.running || state.paused) {
        return;
    }
    const def = byKey(unitKey);
    if (!def || state.energy < def.cost) {
        pushHint('能量不足，先控住节奏。');
        return;
    }
    state.energy -= def.cost;
    spawnUnit(def, 'player', Math.floor(Math.random() * LANE_Y.length));
}

function castHeroSkill(key) {
    if (!state.running || state.paused) {
        return;
    }
    const skill = HERO_SKILLS.find((s) => s.key === key);
    if (!skill) {
        return;
    }
    if (state.heroCd[key] > 0) {
        pushHint(`${skill.name} 冷却中 ${state.heroCd[key].toFixed(1)}s`);
        return;
    }
    if (state.energy < skill.cost) {
        pushHint(`${skill.name} 能量不足`);
        return;
    }

    state.energy -= skill.cost;
    state.heroCd[key] = skill.cd;
    skill.cast();
}

function spawnUnit(def, side, lane) {
    const unit = {
        id: state.nextId++,
        key: def.key,
        icon: def.icon,
        side,
        lane,
        x: side === 'player' ? LEFT_EDGE : RIGHT_EDGE,
        y: LANE_Y[lane],
        hp: def.hp,
        maxHp: def.hp,
        atk: def.atk,
        speed: def.speed,
        range: def.range,
        atkCd: def.atkCd,
        atkTimer: 0,
        age: 0,
        hitCount: 0,
        hasCharged: false,
        dashed: false,
        trait: def.trait,
        slowTimer: 0
    };
    state.units.push(unit);
}

function runEnemyAI(dt) {
    const levelInfo = state.levelInfo;
    if (levelInfo && levelInfo.waves) {
        runWaveScript(dt, levelInfo.waves);
        return;
    }

    state.enemyThink -= dt;
    if (state.enemyThink > 0) {
        return;
    }

    const fastStage = state.time > 70 ? 0.9 : 1.3;
    state.enemyThink = fastStage + Math.random() * 0.9;

    let options = UNIT_DEFS.filter((def) => def.cost <= state.enemyEnergy);
    if (options.length === 0) {
        return;
    }

    if (state.time > 80) {
        options = options.filter((u) => u.cost >= 4);
        if (options.length === 0) {
            options = UNIT_DEFS.filter((def) => def.cost <= state.enemyEnergy);
        }
    }

    const pick = options[Math.floor(Math.random() * options.length)];
    state.enemyEnergy -= pick.cost;
    const lane = Math.floor(Math.random() * LANE_Y.length);
    spawnUnit(pick, 'enemy', lane);
}

function runWaveScript(dt, waves) {
    if (!state.waveTimer) {
        state.waveTimer = 0;
    }
    state.waveTimer += dt;

    for (let i = state.waveIndex; i < waves.length; i++) {
        const wave = waves[i];
        if (state.waveTimer >= wave.time) {
            for (let j = 0; j < wave.count; j++) {
                const unitKey = wave.units[j % wave.units.length];
                const def = byKey(unitKey);
                const lane = Math.floor(Math.random() * LANE_Y.length);
                spawnUnit(def, 'enemy', lane);
            }
            state.waveIndex = i + 1;
        }
    }
}

function updateUnits(dt) {
    for (const unit of state.units) {
        if (unit.hp <= 0) {
            continue;
        }

        unit.age += dt;
        unit.atkTimer = Math.max(0, unit.atkTimer - dt);
        unit.slowTimer = Math.max(0, unit.slowTimer - dt);

        if (unit.trait === 'heal') {
            runHealer(unit, dt);
        }

        const target = findTarget(unit);
        if (target) {
            if (unit.atkTimer <= 0 && unit.trait !== 'heal') {
                applyAttack(unit, target);
                unit.atkTimer = unit.atkCd;
            }
            continue;
        }

        let moveSpeed = unit.speed;
        if (unit.slowTimer > 0) {
            moveSpeed *= 0.75;
        }
        const dir = unit.side === 'player' ? 1 : -1;
        unit.x += dir * moveSpeed * dt;

        if (unit.side === 'player' && unit.x >= RIGHT_EDGE - 8) {
            let baseDamage = unit.atk;
            if (unit.trait === 'siege') {
                baseDamage = Math.round(baseDamage * 1.5);
            }
            damageBase('enemy', baseDamage);
            unit.hp = 0;
        } else if (unit.side === 'enemy' && unit.x <= LEFT_EDGE + 8) {
            damageBase('player', unit.atk);
            unit.hp = 0;
        }
    }
}

function runHealer(unit, dt) {
    if (!unit.healTimer) {
        unit.healTimer = 0;
    }
    unit.healTimer -= dt;
    if (unit.healTimer > 0) {
        return;
    }
    unit.healTimer = 1.0;

    const allies = state.units.filter((u) => u.side === unit.side && u.lane === unit.lane && u.id !== unit.id && u.hp > 0);
    if (allies.length === 0) {
        return;
    }
    allies.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
    const target = allies[0];
    target.hp = Math.min(target.maxHp, target.hp + 35);
}

function findTarget(unit) {
    let nearest = null;
    let nearestDis = Number.MAX_SAFE_INTEGER;
    for (const other of state.units) {
        if (other.side === unit.side || other.lane !== unit.lane || other.hp <= 0) {
            continue;
        }
        const dis = Math.abs(other.x - unit.x);
        if (dis <= unit.range && dis < nearestDis) {
            nearest = other;
            nearestDis = dis;
        }
    }
    return nearest;
}

function applyAttack(attacker, target) {
    let damage = attacker.atk;

    if (attacker.trait === 'combo') {
        attacker.hitCount += 1;
        if (attacker.hitCount % 3 === 0) {
            damage = Math.round(damage * 1.4);
        }
    }

    if (attacker.trait === 'charge' && !attacker.hasCharged) {
        damage = Math.round(damage * 2);
        attacker.hasCharged = true;
    }

    if (attacker.trait === 'dash' && !attacker.dashed) {
        damage = Math.round(damage * 1.6);
        attacker.dashed = true;
    }

    if (attacker.trait === 'rage' && attacker.hp / attacker.maxHp < 0.4) {
        damage = Math.round(damage * 1.35);
    }

    if (target.trait === 'fortify' && target.age < 5) {
        damage = Math.round(damage * 0.7);
    }
    if (target.side === 'player' && state.buffs.playerFortify > 0) {
        damage = Math.round(damage * 0.65);
    }

    target.hp -= damage;

    if (attacker.trait === 'splash') {
        splashDamage(attacker, target, Math.round(damage * 0.6));
    }

    if (attacker.trait === 'slow') {
        target.slowTimer = Math.max(target.slowTimer, 2.2);
    }

    if (target.hp <= 0) {
        onUnitKilled(target, attacker.side);
    }
}

function splashDamage(attacker, mainTarget, value) {
    for (const unit of state.units) {
        if (unit.id === mainTarget.id || unit.side === attacker.side || unit.lane !== attacker.lane || unit.hp <= 0) {
            continue;
        }
        if (Math.abs(unit.x - mainTarget.x) <= 65) {
            unit.hp -= value;
            if (unit.hp <= 0) {
                onUnitKilled(unit, attacker.side);
            }
        }
    }
}

function onUnitKilled(deadUnit, killerSide) {
    if (deadUnit.hp <= 0) {
        deadUnit.hp = 0;
    }
    const delta = 2;
    if (killerSide === 'player') {
        state.progress = clamp(state.progress + delta, -100, 100);
    } else {
        state.progress = clamp(state.progress - delta, -100, 100);
    }
}

function damageBase(baseSide, damage) {
    const shift = Math.max(1, Math.round(damage / 35));
    if (baseSide === 'enemy') {
        state.enemyBaseHp = Math.max(0, state.enemyBaseHp - damage);
        state.progress = clamp(state.progress + shift, -100, 100);
    } else {
        state.playerBaseHp = Math.max(0, state.playerBaseHp - damage);
        state.progress = clamp(state.progress - shift, -100, 100);
    }
}

function checkVictory() {
    if (state.enemyBaseHp <= 0 || state.progress >= 100) {
        stopGame('胜利！战线彻底压向敌方。');
    } else if (state.playerBaseHp <= 0 || state.progress <= -100) {
        stopGame('失败！这波根本守不住。');
    }
}

function stopGame(message) {
    state.running = false;
    state.paused = false;
    if (state.tickTimer) {
        cancelAnimationFrame(state.tickTimer);
        state.tickTimer = null;
    }
    el.pauseBtn.disabled = true;
    pushHint(`${message} 点击重开再来一局。`);
}

function render() {
    el.playerBaseHp.textContent = Math.round(state.playerBaseHp);
    el.enemyBaseHp.textContent = Math.round(state.enemyBaseHp);
    el.gameTime.textContent = Math.floor(state.time);
    el.energyText.textContent = state.energy.toFixed(1);
    el.energyFill.style.width = `${(state.energy / state.maxEnergy) * 100}%`;

    const absProgress = Math.abs(state.progress);
    const blueWidth = state.progress > 0 ? Math.min(50, state.progress / 2) : 0;
    const redWidth = state.progress < 0 ? Math.min(50, absProgress / 2) : 0;
    el.progressBlue.style.width = `${blueWidth}%`;
    el.progressRed.style.width = `${redWidth}%`;

    const unitBtns = el.cardRow.querySelectorAll('button');
    UNIT_DEFS.forEach((def, idx) => {
        const btn = unitBtns[idx];
        if (!btn) {
            return;
        }
        btn.disabled = !state.running || state.paused || state.energy < def.cost;
    });

    const heroBtns = el.heroRow.querySelectorAll('button');
    HERO_SKILLS.forEach((skill, idx) => {
        const btn = heroBtns[idx];
        if (!btn) {
            return;
        }
        const cd = state.heroCd[skill.key] || 0;
        const canCast = state.running && !state.paused && state.energy >= skill.cost && cd <= 0;
        btn.disabled = !canCast;
        const cdText = cd > 0 ? `CD ${cd.toFixed(1)}s` : '✓';
        btn.title = `${skill.desc}（需要 ${skill.cost} 点能量）`;
        btn.innerHTML = `<div class="hero-icon">${skill.icon}</div><div class="hero-name">${skill.name}</div><div class="hero-meta">${skill.cost}⚡ ${cdText}</div>`;
    });

    drawBattlefield();
}

// renderUnits no longer needed - Canvas handles all rendering
// Old DOM-based rendering replaced with drawBattlefield() in render()

el.startBtn.addEventListener('click', startGame);
el.pauseBtn.addEventListener('click', togglePause);
el.resetBtn.addEventListener('click', resetGame);

initCanvas();
setupCards();
setupHeroes();
setupModes();
resetGame();
selectMode('practice');
