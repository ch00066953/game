const TILE = 26;
const MAX_LEVEL = 8;
const MAP = [
    '#####################',
    '#o........#........o#',
    '#.###.#.#.#.#.#.###.#',
    '#...#...#...#...#...#',
    '#.###.#.#####.#.###.#',
    '#...................#',
    '#.###.#.#######.#.###',
    '#.....#....#....#...#',
    '#.###.#### # ####.###',
    '#...#.#  GGG  #.#...#',
    '###.#.# ##### #.###.#',
    '#........ P ........#',
    '#.###.###.###.###.###',
    '#o..#...........#..o#',
    '###.#.#.#######.#.###',
    '#.....#....#....#...#',
    '#.########.#.########',
    '#...................#',
    '#.###.###.#.###.###.#',
    '#o........#........o#',
    '#####################'
];
const MAP_ROWS = MAP.length;
const MAP_COLS = MAP[0].length;
const BASE_MAP = MAP.map(row => row.split(''));

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const floatLayer = document.getElementById('floatLayer');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');
const pauseBtn = document.getElementById('pauseBtn');
const muteBtn = document.getElementById('muteBtn');

const startMenu = document.getElementById('startMenu');
const pauseMenu = document.getElementById('pauseMenu');
const gameOverMenu = document.getElementById('gameOverMenu');
const endTitle = document.getElementById('endTitle');
const endText = document.getElementById('endText');

const COLORS = {
    wall: '#1f4eff',
    pellet: '#ffe6a7',
    power: '#fff',
    pacman: '#ffeb3b',
    frightened: '#3f51b5',
    frightenedFlash: '#e3f2fd'
};

const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

const MODE = {
    CHASE: 'chase',
    SCATTER: 'scatter',
    FRIGHTENED: 'frightened'
};

const audio = {
    enabled: true,
    context: null,
    bgmTimer: null
};

const state = {
    map: [],
    pelletsLeft: 0,
    pelletsEaten: 0,
    level: 1,
    score: 0,
    lives: 3,
    running: false,
    paused: false,
    gameOver: false,
    levelWon: false,
    pacman: null,
    pacmanSpawn: null,
    ghosts: [],
    ghostSpawns: [],
    fruit: null,
    mode: MODE.SCATTER,
    modeSchedule: [],
    modeTimer: 0,
    frightenedTimer: 0,
    frightenedDuration: 8,
    levelTransitionTimer: 0,
    pendingNextLevel: false,
    portals: [],
    randomItem: null,
    randomItemTimer: 0,
    effectGhostSlowTimer: 0,
    effectDoubleScoreTimer: 0,
    effectFogTimer: 0,
    bombs: [],
    bombTimer: 0,
    portalChangeTimer: 0,
    deathTimer: 0,
    loopId: null,
    lastTs: 0
};

const modeSchedule = [
    { mode: MODE.SCATTER, time: 7 },
    { mode: MODE.CHASE, time: 20 },
    { mode: MODE.SCATTER, time: 7 },
    { mode: MODE.CHASE, time: 999 }
];

function getLevelTuning(level) {
    const safeLevel = Math.max(1, Math.min(level, MAX_LEVEL));
    return {
        pacmanSpeed: Math.min(6.2 + safeLevel * 0.08, 7.0),
        ghostSpeed: Math.min(4.6 + safeLevel * 0.18, 6.3),
        frightenedDuration: Math.max(3.5, 8 - (safeLevel - 1) * 0.55),
        schedule: [
            { mode: MODE.SCATTER, time: Math.max(4, 7 - (safeLevel - 1) * 0.35) },
            { mode: MODE.CHASE, time: Math.min(26, 20 + (safeLevel - 1) * 1.2) },
            { mode: MODE.SCATTER, time: Math.max(3, 6 - (safeLevel - 1) * 0.25) },
            { mode: MODE.CHASE, time: 999 }
        ]
    };
}

const ghostDefs = [
    { name: 'Blinky', color: '#ff1744', scatter: { x: 19, y: 1 } },
    { name: 'Pinky', color: '#ff80ab', scatter: { x: 1, y: 1 } },
    { name: 'Inky', color: '#18ffff', scatter: { x: 19, y: 19 } },
    { name: 'Clyde', color: '#ffab40', scatter: { x: 1, y: 19 } }
];

const safeGhostSpawnTiles = [
    { x: 1, y: 1 },
    { x: 19, y: 1 },
    { x: 1, y: 19 },
    { x: 19, y: 19 }
];

function init() {
    canvas.width = MAP_COLS * TILE;
    canvas.height = MAP_ROWS * TILE;
    const gameWrap = document.querySelector('.game-wrap');
    if (gameWrap) {
        gameWrap.style.width = `${canvas.width}px`;
        gameWrap.style.height = `${canvas.height}px`;
    }
    normalizeBaseMap();
    buildLevel();
    bindEvents();
    render();
}

function buildLevel() {
    const tuning = getLevelTuning(state.level);
    state.map = BASE_MAP.map(row => row.slice());
    state.pelletsLeft = 0;
    state.pelletsEaten = 0;
    state.mode = MODE.SCATTER;
    state.modeSchedule = tuning.schedule;
    state.modeTimer = 0;
    state.frightenedTimer = 0;
    state.frightenedDuration = tuning.frightenedDuration;
    state.levelTransitionTimer = 0;
    state.pendingNextLevel = false;
    state.portals = [];
    state.randomItem = null;
    state.randomItemTimer = 6 + Math.random() * 4;
    state.effectGhostSlowTimer = 0;
    state.effectDoubleScoreTimer = 0;
    state.effectFogTimer = 0;
    state.bombs = [];
    state.bombTimer = 5 + Math.random() * 5;
    state.portalChangeTimer = 8 + Math.random() * 4;
    state.deathTimer = 0;
    state.fruit = null;
    state.levelWon = false;

    let pacStart = { x: 10, y: 11 };
    const ghostSpawns = [];

    for (let y = 0; y < state.map.length; y++) {
        for (let x = 0; x < state.map[y].length; x++) {
            const cell = state.map[y][x];
            const baseCell = BASE_MAP[y][x];
            if (cell === '.' || cell === 'o') {
                // 检查豆是否在假墙('-')上，如果在则删除
                if (baseCell === '-') {
                    state.map[y][x] = ' ';
                } else {
                    state.pelletsLeft += 1;
                }
            } else if (cell === 'P') {
                pacStart = { x, y };
                state.map[y][x] = ' ';
            } else if (cell === 'G') {
                ghostSpawns.push({ x, y });
                state.map[y][x] = ' ';
            }
        }
    }

    applyLevelVariation();

    state.pacmanSpawn = { x: pacStart.x + 0.5, y: pacStart.y + 0.5 };
    state.pacman = {
        x: pacStart.x + 0.5,
        y: pacStart.y + 0.5,
        dir: DIRS.left,
        nextDir: null,
        speed: tuning.pacmanSpeed,
        mouth: 0,
        mouthDir: 1,
        portalCooldown: 0,
        dead: false
    };

    state.ghostSpawns = [];
    state.ghosts = ghostDefs.map((def, i) => {
        const sp = ghostSpawns[i] || { x: 10 + (i % 2), y: 9 + Math.floor(i / 2) };
        const safeSpawn = getValidGhostSpawn(i, sp);
        const home = { x: sp.x + 0.5, y: sp.y + 0.5 };
        state.ghostSpawns.push(home);
        return {
            ...def,
            x: safeSpawn.x,
            y: safeSpawn.y,
            home,
            spawn: safeSpawn,
            dir: DIRS.left,
            speed: tuning.ghostSpeed,
            eaten: false
        };
    });

    spawnPortals();
    showCenterTip(`第 ${state.level} 关`, 1200);

    updateHud();
}

function bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => {
        hideAllMenus();
        startGame();
    });

    document.getElementById('howBtn').addEventListener('click', () => {
        alert('方向键控制移动；空格暂停。\n支持预输入：提前按下方向会在下一个可转向路口生效。\n吃掉能量豆后幽灵进入 frightened 模式，可反吃幽灵。');
    });

    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('restartBtn').addEventListener('click', restartAll);

    pauseBtn.addEventListener('click', togglePause);
    muteBtn.addEventListener('click', toggleMute);

    document.addEventListener('keydown', e => {
        const key = e.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) {
            e.preventDefault();
        }

        if (key === ' ') {
            if (state.running && !state.gameOver) togglePause();
            return;
        }

        if (!state.running || state.gameOver) return;

        if (key === 'ArrowUp') state.pacman.nextDir = DIRS.up;
        else if (key === 'ArrowDown') state.pacman.nextDir = DIRS.down;
        else if (key === 'ArrowLeft') state.pacman.nextDir = DIRS.left;
        else if (key === 'ArrowRight') state.pacman.nextDir = DIRS.right;
    });
}

function startGame() {
    if (state.running) return;
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    state.levelWon = false;
    pauseBtn.disabled = false;
    startBgm();
    state.lastTs = performance.now();
    state.loopId = requestAnimationFrame(loop);
}

function restartAll() {
    state.level = 1;
    state.score = 0;
    state.lives = 3;
    buildLevel();
    hideAllMenus();
    state.running = false;
    startGame();
}

function loop(ts) {
    if (!state.running) return;

    const dt = Math.min((ts - state.lastTs) / 1000, 0.05);
    state.lastTs = ts;

    if (!state.paused) {
        update(dt);
    }

    render();
    state.loopId = requestAnimationFrame(loop);
}

function update(dt) {
    if (state.levelTransitionTimer > 0) {
        state.levelTransitionTimer -= dt;
        if (state.levelTransitionTimer <= 0 && state.pendingNextLevel) {
            state.pendingNextLevel = false;
            buildLevel();
        }
        return;
    }

    if (state.deathTimer > 0) {
        state.deathTimer -= dt;
        if (state.deathTimer <= 0) {
            onDeathAnimationEnd();
        }
        return;
    }

    updateRandomSystems(dt);
    updateBombs(dt);
    updatePortals(dt);
    updateMode(dt);
    updatePacman(dt);
    updateGhosts(dt);
    checkCollisions();
}

function updateMode(dt) {
    if (state.frightenedTimer > 0) {
        state.frightenedTimer -= dt;
        state.mode = MODE.FRIGHTENED;
        return;
    }

    state.modeTimer += dt;
    let acc = 0;
    for (const s of state.modeSchedule) {
        acc += s.time;
        if (state.modeTimer < acc) {
            state.mode = s.mode;
            return;
        }
    }
    state.mode = MODE.CHASE;
}

function updatePacman(dt) {
    const p = state.pacman;
    if (p.portalCooldown > 0) p.portalCooldown -= dt;
    p.mouth += p.mouthDir * dt * 9;
    if (p.mouth > 1) {
        p.mouth = 1;
        p.mouthDir = -1;
    }
    if (p.mouth < 0.1) {
        p.mouth = 0.1;
        p.mouthDir = 1;
    }

    // 如果有预输入方向，尝试转向
    if (p.nextDir) {
        // 反向立即生效
        if (p.nextDir.x === -p.dir.x && p.nextDir.y === -p.dir.y) {
            p.dir = p.nextDir;
            p.nextDir = null;
        }
        // 在路口检查能否转向
        else if (canTurn(p, p.nextDir)) {
            p.dir = p.nextDir;
            p.nextDir = null;
        }
    }
    
    // 持续按当前方向移动
    moveEntity(p, p.dir, p.speed * dt);
    handleTunnelWrap(p);

    const tx = Math.floor(p.x);
    const ty = Math.floor(p.y);
    const tile = getTile(tx, ty);

    if (tile === '.' || tile === 'o') {
        eatPellet(tx, ty, tile === 'o');
    }

    if (state.fruit && tx === state.fruit.x && ty === state.fruit.y) {
        state.score += state.fruit.score;
        popScore(tx, ty, `+${state.fruit.score}`);
        playSound('fruit');
        state.fruit = null;
        updateHud();
    }

    handlePortalForPacman();
    collectRandomItem(tx, ty);
}

function updateGhosts(dt) {
    for (const ghost of state.ghosts) {
        const mode = state.mode;
        const speedFactor = mode === MODE.FRIGHTENED ? 0.6 : 1;
        const debuff = state.effectGhostSlowTimer > 0 ? 0.78 : 1;
        const ghostSpeed = ghost.speed * speedFactor * debuff;

        if (isNearCenter(ghost, 0.35)) {
            const target = getGhostTarget(ghost, mode);
            ghost.dir = chooseGhostDirection(ghost, target, mode);
        }

        moveEntity(ghost, ghost.dir, ghostSpeed * dt);
        handleTunnelWrap(ghost);

        if (ghost.eaten && distance(ghost, ghost.home) < 0.4) {
            ghost.eaten = false;
        }
    }
}

function getGhostTarget(ghost, mode) {
    if (mode === MODE.FRIGHTENED && !ghost.eaten) {
        return { x: Math.random() * 20, y: Math.random() * 20 };
    }

    if (ghost.eaten) return ghost.home;
    if (mode === MODE.SCATTER) return ghost.scatter;

    const p = state.pacman;
    const pdir = p.dir || DIRS.left;
    const d = distance(ghost, p);

    if (d < 3 && ghost.name !== 'Clyde') {
        return ghost.scatter;
    }

    if (ghost.name === 'Blinky') {
        return { x: Math.floor(p.x), y: Math.floor(p.y) };
    }

    if (ghost.name === 'Pinky') {
        return {
            x: Math.floor(p.x + pdir.x * 3),
            y: Math.floor(p.y + pdir.y * 3)
        };
    }

    if (ghost.name === 'Inky') {
        const blinky = state.ghosts[0];
        const ahead = {
            x: Math.floor(p.x + pdir.x),
            y: Math.floor(p.y + pdir.y)
        };
        return {
            x: ahead.x * 2 - Math.floor(blinky.x),
            y: ahead.y * 2 - Math.floor(blinky.y)
        };
    }

    if (d > 8) {
        return { x: Math.floor(p.x), y: Math.floor(p.y) };
    }
    return ghost.scatter;
}

function chooseGhostDirection(ghost, target, mode) {
    const options = [];
    for (const dir of Object.values(DIRS)) {
        if (dir.x === -ghost.dir.x && dir.y === -ghost.dir.y) continue;
        const nx = Math.floor(ghost.x + dir.x * 0.6);
        const ny = Math.floor(ghost.y + dir.y * 0.6);
        if (!isWall(nx, ny) && getTile(nx, ny) !== '-') {
            options.push(dir);
        }
    }

    if (options.length === 0) {
        return { x: -ghost.dir.x, y: -ghost.dir.y };
    }

    if (mode === MODE.FRIGHTENED && !ghost.eaten) {
        return options[Math.floor(Math.random() * options.length)];
    }

    options.sort((a, b) => {
        const da = sqr(Math.floor(ghost.x + a.x) - target.x) + sqr(Math.floor(ghost.y + a.y) - target.y);
        const db = sqr(Math.floor(ghost.x + b.x) - target.x) + sqr(Math.floor(ghost.y + b.y) - target.y);
        return da - db;
    });

    return options[0];
}

function moveEntity(entity, dir, dist) {
    if (!dir) return false;

    const movingHorizontal = dir.x !== 0;
    const movingVertical = dir.y !== 0;

    if (movingHorizontal) {
        entity.y = Math.round(entity.y - 0.5) + 0.5;
    } else if (movingVertical) {
        entity.x = Math.round(entity.x - 0.5) + 0.5;
    }

    const nx = entity.x + dir.x * dist;
    const ny = entity.y + dir.y * dist;

    const probeOffset = 0.34;
    const eps = 1e-6;
    const probeX = Math.floor(nx + dir.x * probeOffset + eps);
    const probeY = Math.floor(ny + dir.y * probeOffset + eps);

    if (!isWall(probeX, probeY) && getTile(probeX, probeY) !== '-') {
        entity.x = nx;
        entity.y = ny;
        return true;
    } else {
        if (movingHorizontal) {
            entity.x = Math.round(entity.x - 0.5) + 0.5;
        } else if (movingVertical) {
            entity.y = Math.round(entity.y - 0.5) + 0.5;
        } else {
            entity.x = Math.round(entity.x - 0.5) + 0.5;
            entity.y = Math.round(entity.y - 0.5) + 0.5;
        }
        return false;
    }
}

function checkCollisions() {
    const p = state.pacman;

    for (const ghost of state.ghosts) {
        if (distance(p, ghost) < 0.38) {
            if (state.mode === MODE.FRIGHTENED && !ghost.eaten) {
                ghost.eaten = true;
                ghost.x = ghost.home.x;
                ghost.y = ghost.home.y;
                state.score += 200;
                popScore(Math.floor(p.x), Math.floor(p.y), '+200');
                playSound('ghost');
                updateHud();
            } else if (!ghost.eaten) {
                loseLife();
                break;
            }
        }
    }
}

function eatPellet(x, y, power) {
    state.map[y][x] = ' ';
    state.pelletsLeft -= 1;
    state.pelletsEaten += 1;

    const scoreMul = state.effectDoubleScoreTimer > 0 ? 2 : 1;
    const add = (power ? 50 : 10) * scoreMul;
    state.score += add;
    popScore(x, y, `+${add}`);
    playSound(power ? 'power' : 'pellet');

    if (power) {
        state.frightenedTimer = state.frightenedDuration;
        for (const g of state.ghosts) g.eaten = false;
    }

    maybeSpawnFruit();
    updateHud();

    if (state.pelletsLeft <= 0) {
        nextLevel();
    }
}

function maybeSpawnFruit() {
    if (state.fruit) return;
    if (state.pelletsEaten === 30 || state.pelletsEaten === 90) {
        state.fruit = {
            x: 10,
            y: 11,
            score: 300 + state.level * 20
        };
    }
}

function loseLife() {
    state.lives -= 1;
    updateHud();
    state.deathTimer = 1.2;
    state.pacman.dead = true;
    playSound('dead');
}

function onDeathAnimationEnd() {
    if (state.lives <= 0) {
        endGame(false);
        return;
    }

    const p = state.pacman;
    p.x = state.pacmanSpawn.x;
    p.y = state.pacmanSpawn.y;
    p.dir = DIRS.left;
    p.nextDir = null;
    p.portalCooldown = 0;
    p.dead = false;

    state.ghosts.forEach((g, i) => {
        g.x = g.spawn.x;
        g.y = g.spawn.y;
        g.dir = i % 2 ? DIRS.right : DIRS.left;
        g.eaten = false;
    });
}

function nextLevel() {
    if (state.level >= MAX_LEVEL) {
        state.score += 1000;
        playSound('win');
        endGame(true);
        return;
    }

    state.level += 1;
    state.score += 500;
    playSound('win');
    updateHud();
    state.pendingNextLevel = true;
    state.levelTransitionTimer = 2.2;
    showCenterTip(`过关！第 ${state.level} 关即将开始`, 2000);
}

function endGame(isWin) {
    state.running = false;
    cancelAnimationFrame(state.loopId);
    pauseBtn.disabled = true;
    stopBgm();

    endTitle.textContent = isWin ? '你赢了！' : '游戏结束';
    endText.textContent = isWin
        ? `恭喜通关！最终得分：${state.score}（共 ${MAX_LEVEL} 关）`
        : `最终得分：${state.score}，到达第 ${state.level} 关`;
    gameOverMenu.classList.add('show');
    state.gameOver = true;
}

function togglePause() {
    if (!state.running) return;
    state.paused = !state.paused;
    pauseMenu.classList.toggle('show', state.paused);
    pauseBtn.textContent = state.paused ? '继续' : '暂停';
}

function toggleMute() {
    audio.enabled = !audio.enabled;
    muteBtn.textContent = audio.enabled ? '🔊 音效' : '🔇 静音';
    if (!audio.enabled) {
        stopBgm();
    } else if (state.running && !state.paused) {
        startBgm();
    }
}

function updateHud() {
    scoreEl.textContent = state.score;
    levelEl.textContent = state.level;
    livesEl.textContent = state.lives;
}

function hideAllMenus() {
    [startMenu, pauseMenu, gameOverMenu].forEach(m => m.classList.remove('show'));
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawBombs();
    drawPortals();
    drawRandomItem();
    drawFruit();
    drawPacman();
    drawGhosts();
    drawScenarioOverlay();
}

function drawMap() {
    for (let y = 0; y < state.map.length; y++) {
        for (let x = 0; x < state.map[y].length; x++) {
            const baseCell = BASE_MAP[y][x];
            const cell = state.map[y][x];
            const px = x * TILE;
            const py = y * TILE;

            if (baseCell === '#' || baseCell === '-') {
                ctx.fillStyle = COLORS.wall;
                ctx.fillRect(px, py, TILE, TILE);
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
            } else {
                ctx.fillStyle = '#000';
                ctx.fillRect(px, py, TILE, TILE);
            }

            if (cell === '.') {
                ctx.fillStyle = COLORS.pellet;
                circle(px + TILE / 2, py + TILE / 2, 3);
            } else if (cell === 'o') {
                const pulse = 5 + Math.sin(performance.now() / 140) * 1.5;
                ctx.fillStyle = COLORS.power;
                circle(px + TILE / 2, py + TILE / 2, pulse);
            }
        }
    }
}

function drawFruit() {
    if (!state.fruit) return;
    const x = state.fruit.x * TILE + TILE / 2;
    const y = state.fruit.y * TILE + TILE / 2;
    ctx.fillStyle = '#ff5252';
    circle(x, y, 9);
    ctx.fillStyle = '#7cb342';
    ctx.fillRect(x - 1.5, y - 13, 3, 6);
}

function drawPortals() {
    if (!state.portals || state.portals.length !== 2) return;
    const pulse = 8 + Math.sin(performance.now() / 120) * 2;
    for (let i = 0; i < state.portals.length; i++) {
        const p = state.portals[i];
        const cx = (p.x + 0.5) * TILE;
        const cy = (p.y + 0.5) * TILE;
        ctx.strokeStyle = i === 0 ? '#ab47bc' : '#26c6da';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawBombs() {
    for (const bomb of state.bombs) {
        const cx = (bomb.x + 0.5) * TILE;
        const cy = (bomb.y + 0.5) * TILE;
        const progress = 1 - (bomb.ttl / 5);  // 0到1
        
        // 爆炸前闪烁效果
        const flashing = bomb.ttl < 1.5;
        if (flashing && Math.floor(performance.now() / 150) % 2 === 0) {
            ctx.fillStyle = '#ff4444';
        } else {
            ctx.fillStyle = '#2c2c2c';
        }
        
        // 绘制炸弹主体
        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制信管
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 7);
        ctx.quadraticCurveTo(cx + 2, cy - 12 - progress * 3, cx - 1, cy - 15 - progress * 2);
        ctx.stroke();
        
        // 绘制火焰（即将爆炸时）
        if (bomb.ttl < 1) {
            ctx.fillStyle = 'rgba(255, 100, 0, 0.7)';
            ctx.beginPath();
            ctx.arc(cx, cy - 8, 4 + Math.sin(performance.now() / 50) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawRandomItem() {
    if (!state.randomItem) return;
    const { x, y, type } = state.randomItem;
    const cx = (x + 0.5) * TILE;
    const cy = (y + 0.5) * TILE;

    let color = '#ffd54f';
    if (type === 'slow') color = '#80deea';
    if (type === 'double') color = '#ff8a65';
    if (type === 'fog') color = '#b39ddb';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy + 8);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();
}

function drawScenarioOverlay() {
    if (state.effectFogTimer <= 0) return;
    const alpha = 0.18 + Math.sin(performance.now() / 300) * 0.04;
    ctx.fillStyle = `rgba(20, 20, 40, ${alpha.toFixed(3)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPacman() {
    const p = state.pacman;
    const cx = p.x * TILE;
    const cy = p.y * TILE;

    let angleBase = 0;
    if (p.dir === DIRS.right) angleBase = 0;
    if (p.dir === DIRS.down) angleBase = Math.PI / 2;
    if (p.dir === DIRS.left) angleBase = Math.PI;
    if (p.dir === DIRS.up) angleBase = Math.PI * 1.5;

    const deathProgress = state.deathTimer > 0 ? 1 - state.deathTimer / 1.2 : 0;
    const mouth = p.dead ? deathProgress * Math.PI : p.mouth * 0.45;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = COLORS.pacman;
    ctx.arc(cx, cy, TILE * 0.42, angleBase + mouth, angleBase + Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fill();
}

function drawGhosts() {
    for (const g of state.ghosts) {
        const x = g.x * TILE;
        const y = g.y * TILE;
        const frightened = state.mode === MODE.FRIGHTENED && !g.eaten;
        const flashing = frightened && state.frightenedTimer < 2 && Math.floor(performance.now() / 150) % 2 === 0;

        ctx.fillStyle = frightened ? (flashing ? COLORS.frightenedFlash : COLORS.frightened) : g.color;

        ctx.beginPath();
        ctx.arc(x, y - 2, TILE * 0.38, Math.PI, 0);
        ctx.rect(x - TILE * 0.38, y - 2, TILE * 0.76, TILE * 0.5);
        ctx.fill();

        ctx.fillStyle = '#fff';
        circle(x - 6, y - 2, 4);
        circle(x + 6, y - 2, 4);
        ctx.fillStyle = '#111';
        circle(x - 6 + g.dir.x * 1.3, y - 2 + g.dir.y * 1.3, 2);
        circle(x + 6 + g.dir.x * 1.3, y - 2 + g.dir.y * 1.3, 2);
    }
}

function popScore(tileX, tileY, text) {
    const el = document.createElement('span');
    el.className = 'float-score';
    el.textContent = text;
    el.style.left = `${((tileX + 0.5) / MAP_COLS) * 100}%`;
    el.style.top = `${((tileY + 0.5) / MAP_ROWS) * 100}%`;
    floatLayer.appendChild(el);
    setTimeout(() => el.remove(), 900);
}

function getTile(x, y) {
    if (y < 0 || y >= state.map.length || x < 0 || x >= state.map[0].length) return '#';
    return state.map[y][x];
}

function isWall(x, y) {
    return getTile(x, y) === '#';
}

function isNearCenter(entity, threshold = 0.4) {
    const centerX = Math.round(entity.x - 0.5) + 0.5;
    const centerY = Math.round(entity.y - 0.5) + 0.5;
    const cx = Math.abs(entity.x - centerX);
    const cy = Math.abs(entity.y - centerY);
    return cx <= threshold && cy <= threshold;
}

function isPacWalkableChar(ch) {
    return ch !== '#' && ch !== '-' && ch !== 'G';
}

function inBounds(x, y) {
    return y >= 0 && y < MAP_ROWS && x >= 0 && x < MAP_COLS;
}

function idxFromXY(x, y) {
    return y * MAP_COLS + x;
}

function xyFromIdx(idx) {
    return { x: idx % MAP_COLS, y: Math.floor(idx / MAP_COLS) };
}

function findPacStartInBaseMap() {
    for (let y = 0; y < MAP_ROWS; y++) {
        for (let x = 0; x < MAP_COLS; x++) {
            if (BASE_MAP[y][x] === 'P') {
                return { x, y };
            }
        }
    }
    return { x: 10, y: 11 };
}

function getReachableSet(start, blockedIdx = -1) {
    const queue = [idxFromXY(start.x, start.y)];
    const visited = new Set();
    const dirs = Object.values(DIRS);

    while (queue.length) {
        const cur = queue.shift();
        if (cur === blockedIdx || visited.has(cur)) continue;
        const { x, y } = xyFromIdx(cur);
        if (!inBounds(x, y) || !isPacWalkableChar(BASE_MAP[y][x])) continue;
        visited.add(cur);

        for (const d of dirs) {
            const nx = x + d.x;
            const ny = y + d.y;
            if (!inBounds(nx, ny)) continue;
            const ni = idxFromXY(nx, ny);
            if (ni !== blockedIdx && !visited.has(ni) && isPacWalkableChar(BASE_MAP[ny][nx])) {
                queue.push(ni);
            }
        }
    }
    return visited;
}

function getComponentsExcluding(blockedIdx, universeSet) {
    const comps = [];
    const seen = new Set();
    const dirs = Object.values(DIRS);

    for (const node of universeSet) {
        if (node === blockedIdx || seen.has(node)) continue;
        const stack = [node];
        const comp = [];
        seen.add(node);

        while (stack.length) {
            const cur = stack.pop();
            comp.push(cur);
            const { x, y } = xyFromIdx(cur);

            for (const d of dirs) {
                const nx = x + d.x;
                const ny = y + d.y;
                if (!inBounds(nx, ny)) continue;
                const ni = idxFromXY(nx, ny);
                if (ni === blockedIdx || seen.has(ni) || !universeSet.has(ni)) continue;
                seen.add(ni);
                stack.push(ni);
            }
        }
        comps.push(comp);
    }
    return comps;
}

function componentHasPellet(comp) {
    for (const node of comp) {
        const { x, y } = xyFromIdx(node);
        const ch = BASE_MAP[y][x];
        if (ch === '.' || ch === 'o') return true;
    }
    return false;
}

function carveSecondEntrance(comp, articulationIdx, reachableSet) {
    const compSet = new Set(comp);
    const dirs = Object.values(DIRS);

    for (const node of comp) {
        const { x, y } = xyFromIdx(node);
        for (const d of dirs) {
            const wx = x + d.x;
            const wy = y + d.y;
            const ox = wx + d.x;
            const oy = wy + d.y;
            if (!inBounds(wx, wy) || !inBounds(ox, oy)) continue;
            if (BASE_MAP[wy][wx] !== '#') continue;

            const outsideIdx = idxFromXY(ox, oy);
            if (outsideIdx === articulationIdx || compSet.has(outsideIdx)) continue;
            if (!reachableSet.has(outsideIdx)) continue;
            if (!isPacWalkableChar(BASE_MAP[oy][ox])) continue;

            BASE_MAP[wy][wx] = '.';
            return true;
        }
    }
    return false;
}

function normalizeBaseMap() {
    const start = findPacStartInBaseMap();

    for (let pass = 0; pass < 6; pass++) {
        let changed = false;
        const reachable = getReachableSet(start);

        for (let y = 0; y < MAP_ROWS; y++) {
            for (let x = 0; x < MAP_COLS; x++) {
                const ch = BASE_MAP[y][x];
                if (!isPacWalkableChar(ch) || ch === 'P') continue;
                const idx = idxFromXY(x, y);
                if (!reachable.has(idx)) {
                    BASE_MAP[y][x] = '#';
                    changed = true;
                }
            }
        }

        const reachableNow = getReachableSet(start);
        const startIdx = idxFromXY(start.x, start.y);
        const nodes = Array.from(reachableNow);
        let carved = false;

        for (const candidate of nodes) {
            if (candidate === startIdx) continue;

            const afterRemove = getReachableSet(start, candidate);
            if (afterRemove.size === reachableNow.size - 1) continue;

            const comps = getComponentsExcluding(candidate, reachableNow);
            if (comps.length <= 1) continue;

            for (const comp of comps) {
                if (comp.includes(startIdx)) continue;
                if (!componentHasPellet(comp)) continue;
                if (carveSecondEntrance(comp, candidate, reachableNow)) {
                    carved = true;
                    changed = true;
                    break;
                }
            }
            if (carved) break;
        }

        if (!changed) break;
    }
}

function showCenterTip(text, ms = 1200) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.left = '50%';
    el.style.top = '45%';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.padding = '8px 14px';
    el.style.borderRadius = '10px';
    el.style.fontWeight = '700';
    el.style.color = '#fff';
    el.style.background = 'rgba(0,0,0,0.65)';
    el.style.border = '1px solid rgba(255,255,255,0.35)';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '5';
    floatLayer.appendChild(el);
    setTimeout(() => el.remove(), ms);
}

function getWalkableTiles() {
    const tiles = [];
    for (let y = 1; y < MAP_ROWS - 1; y++) {
        for (let x = 1; x < MAP_COLS - 1; x++) {
            const cell = state.map[y][x];
            if (cell !== '#' && cell !== '-' && cell !== 'G') {
                tiles.push({ x, y });
            }
        }
    }
    return tiles;
}

function applyLevelVariation() {
    const candidates = [
        { x: 10, y: 8 }, { x: 10, y: 12 }, { x: 6, y: 10 }, { x: 14, y: 10 },
        { x: 4, y: 6 }, { x: 16, y: 6 }, { x: 4, y: 14 }, { x: 16, y: 14 }
    ];
    const count = 1 + (state.level % 2);
    const shuffled = candidates.sort(() => Math.random() - 0.5);

    let opened = 0;
    for (const c of shuffled) {
        if (opened >= count) break;
        if (state.map[c.y][c.x] === '#') {
            state.map[c.y][c.x] = '.';
            state.pelletsLeft += 1;
            opened += 1;
        }
    }
}

function spawnPortals() {
    const tiles = getWalkableTiles();
    if (tiles.length < 2) return;

    const first = tiles[Math.floor(Math.random() * tiles.length)];
    let second = first;
    for (let i = 0; i < 40; i++) {
        const t = tiles[Math.floor(Math.random() * tiles.length)];
        if (Math.hypot(t.x - first.x, t.y - first.y) >= 8) {
            second = t;
            break;
        }
    }
    state.portals = [first, second];
}

function handlePortalForPacman() {
    if (!state.portals || state.portals.length !== 2) return;
    const p = state.pacman;
    if (p.portalCooldown > 0) return;

    const tx = Math.floor(p.x);
    const ty = Math.floor(p.y);
    const a = state.portals[0];
    const b = state.portals[1];

    if (tx === a.x && ty === a.y) {
        p.x = b.x + 0.5;
        p.y = b.y + 0.5;
        p.portalCooldown = 0.7;
        popScore(b.x, b.y, '传送');
    } else if (tx === b.x && ty === b.y) {
        p.x = a.x + 0.5;
        p.y = a.y + 0.5;
        p.portalCooldown = 0.7;
        popScore(a.x, a.y, '传送');
    }
}

function spawnRandomItem() {
    const tiles = getWalkableTiles();
    if (!tiles.length) return;
    const t = tiles[Math.floor(Math.random() * tiles.length)];
    const types = ['bonus', 'slow', 'double', 'fog'];
    const type = types[Math.floor(Math.random() * types.length)];
    state.randomItem = {
        x: t.x,
        y: t.y,
        type,
        ttl: 10
    };
}

function updateRandomSystems(dt) {
    if (state.effectGhostSlowTimer > 0) state.effectGhostSlowTimer -= dt;
    if (state.effectDoubleScoreTimer > 0) state.effectDoubleScoreTimer -= dt;
    if (state.effectFogTimer > 0) state.effectFogTimer -= dt;

    if (state.randomItem) {
        state.randomItem.ttl -= dt;
        if (state.randomItem.ttl <= 0) {
            state.randomItem = null;
            state.randomItemTimer = 7 + Math.random() * 6;
        }
        return;
    }

    state.randomItemTimer -= dt;
    if (state.randomItemTimer <= 0) {
        spawnRandomItem();
        state.randomItemTimer = 12 + Math.random() * 8;
    }
}

function collectRandomItem(tx, ty) {
    if (!state.randomItem) return;
    if (tx !== state.randomItem.x || ty !== state.randomItem.y) return;

    const item = state.randomItem;
    state.randomItem = null;

    if (item.type === 'bonus') {
        state.score += 180;
        popScore(tx, ty, '+180');
        showCenterTip('幸运奖励 +180', 900);
    } else if (item.type === 'slow') {
        state.effectGhostSlowTimer = 6;
        showCenterTip('幽灵减速 6s', 1000);
    } else if (item.type === 'double') {
        state.effectDoubleScoreTimer = 8;
        showCenterTip('双倍得分 8s', 1000);
    } else if (item.type === 'fog') {
        state.effectFogTimer = 6;
        showCenterTip('迷雾来袭 6s', 1000);
    }

    playSound('fruit');
    updateHud();
}

function spawnBomb() {
    const tiles = getWalkableTiles();
    if (!tiles.length) return;
    const t = tiles[Math.floor(Math.random() * tiles.length)];
    state.bombs.push({
        x: t.x,
        y: t.y,
        ttl: 5  // 5秒后爆炸
    });
}

function updateBombs(dt) {
    state.bombTimer -= dt;
    if (state.bombTimer <= 0) {
        spawnBomb();
        state.bombTimer = 8 + Math.random() * 5;  // 8-13秒后下一个炸弹
    }

    for (let i = state.bombs.length - 1; i >= 0; i--) {
        const bomb = state.bombs[i];
        bomb.ttl -= dt;
        if (bomb.ttl <= 0) {
            explodeBomb(bomb);
            state.bombs.splice(i, 1);
        }
    }
}

function explodeBomb(bomb) {
    const blastRadius = 1.5;  // 3x3范围（中心±1.5）
    const tx = bomb.x;
    const ty = bomb.y;

    playSound('bomb');

    // 检查Pac-Man是否在爆炸范围内
    const p = state.pacman;
    const dx = Math.abs(p.x - (tx + 0.5));
    const dy = Math.abs(p.y - (ty + 0.5));
    if (dx <= blastRadius && dy <= blastRadius && !p.dead) {
        loseLife();
    }

    // 检查鬼是否在爆炸范围内
    for (const ghost of state.ghosts) {
        const gx = Math.abs(ghost.x - (tx + 0.5));
        const gy = Math.abs(ghost.y - (ty + 0.5));
        if (gx <= blastRadius && gy <= blastRadius) {
            if (state.mode === MODE.FRIGHTENED && !ghost.eaten) {
                // 被吃掉
                ghost.eaten = true;
                state.score += 200;
                popScore(tx, ty, '+200');
            } else if (!ghost.eaten) {
                // 被击飞回家
                ghost.x = ghost.home.x;
                ghost.y = ghost.home.y;
                popScore(tx, ty, '鬼被击飞');
            }
        }
    }
}

function updatePortals(dt) {
    if (!state.portals || state.portals.length !== 2) return;
    
    state.portalChangeTimer -= dt;
    if (state.portalChangeTimer <= 0) {
        // 随机选择一个传送门改变位置
        const tiles = getWalkableTiles();
        if (tiles.length) {
            const whichPortal = Math.random() < 0.5 ? 0 : 1;
            const newTile = tiles[Math.floor(Math.random() * tiles.length)];
            state.portals[whichPortal] = newTile;
            showCenterTip(`传送门 ${whichPortal === 0 ? '紫' : '青'} 移动了`, 800);
        }
        state.portalChangeTimer = 8 + Math.random() * 4;
    }
}

function canTurn(entity, desiredDir) {
    if (!desiredDir) return false;
    
    // 必须接近格子中心才能转向
    if (!isNearCenter(entity, 0.5)) return false;
    
    const centerX = Math.round(entity.x - 0.5) + 0.5;
    const centerY = Math.round(entity.y - 0.5) + 0.5;
    const cx = Math.floor(centerX);
    const cy = Math.floor(centerY);
    const nx = cx + desiredDir.x;
    const ny = cy + desiredDir.y;
    
    // 检查目标方向是否可行
    if (isWall(nx, ny) || getTile(nx, ny) === '-') {
        return false;
    }
    
    // 转向成功时对齐到中心，避免切角
    const maxSnap = 0.35;
    entity.x += Math.max(-maxSnap, Math.min(maxSnap, centerX - entity.x));
    entity.y += Math.max(-maxSnap, Math.min(maxSnap, centerY - entity.y));
    
    return true;
}

function getValidGhostSpawn(index, fallbackTile) {
    const tile = safeGhostSpawnTiles[index] || fallbackTile;
    if (!isWall(tile.x, tile.y) && getTile(tile.x, tile.y) !== '-') {
        return { x: tile.x + 0.5, y: tile.y + 0.5 };
    }
    // fallback也要验证，不能直接返回
    if (!isWall(fallbackTile.x, fallbackTile.y) && getTile(fallbackTile.x, fallbackTile.y) !== '-') {
        return { x: fallbackTile.x + 0.5, y: fallbackTile.y + 0.5 };
    }
    // 如果都不行，返回Pac-Man的出生点（绝对安全）
    return { x: 10.5, y: 11.5 };
}

function handleTunnelWrap(entity) {
    if (entity.x < 0) entity.x = MAP_COLS - 0.01;
    if (entity.x > MAP_COLS) entity.x = 0.01;
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function sqr(n) {
    return n * n;
}

function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}

function ensureAudioContext() {
    if (!audio.enabled) return null;
    if (!audio.context) {
        audio.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audio.context;
}

function playSound(type) {
    const ac = ensureAudioContext();
    if (!ac) return;

    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    let f1 = 440;
    let f2 = 440;
    let dur = 0.08;

    if (type === 'pellet') {
        f1 = 620; f2 = 700; dur = 0.05;
    } else if (type === 'power') {
        f1 = 250; f2 = 520; dur = 0.22;
    } else if (type === 'ghost') {
        f1 = 900; f2 = 1200; dur = 0.15;
    } else if (type === 'dead') {
        f1 = 380; f2 = 120; dur = 0.45;
    } else if (type === 'win') {
        f1 = 520; f2 = 1040; dur = 0.35;
    } else if (type === 'fruit') {
        f1 = 760; f2 = 900; dur = 0.1;
    } else if (type === 'bomb') {
        f1 = 150; f2 = 80; dur = 0.3;
    }

    osc.frequency.setValueAtTime(f1, now);
    osc.frequency.linearRampToValueAtTime(f2, now + dur);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.start(now);
    osc.stop(now + dur);
}

function startBgm() {
    if (!audio.enabled || audio.bgmTimer) return;
    const pattern = [220, 247, 262, 294, 262, 247];
    let i = 0;
    audio.bgmTimer = setInterval(() => {
        const ac = ensureAudioContext();
        if (!ac) return;

        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(pattern[i % pattern.length], now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.02, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        i += 1;
    }, 240);
}

function stopBgm() {
    if (audio.bgmTimer) {
        clearInterval(audio.bgmTimer);
        audio.bgmTimer = null;
    }
}

init();
