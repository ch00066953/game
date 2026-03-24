const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const livesEl = document.getElementById('lives');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

const keys = new Set();
const gravity = 0.62;
const worldWidth = 3200;
const groundHeight = 88;
const finishFlag = { x: 3010, y: 140, width: 18, height: 260 };

let cameraX = 0;
let animationFrameId = 0;
let totalCoins = 0;

const state = {
    score: 0,
    collectedCoins: 0,
    lives: 3,
    phase: 'playing',
    message: '准备出发',
    flashTimer: 0
};

const player = {
    x: 80,
    y: 0,
    width: 40,
    height: 54,
    velocityX: 0,
    velocityY: 0,
    speed: 4.8,
    jumpPower: 13.6,
    onGround: false,
    facing: 1,
    spawnX: 80,
    spawnY: 0,
    invulnerableUntil: 0
};

const level = createLevel();
totalCoins = level.coins.length;
resetPlayerPosition();
updateHud();

document.addEventListener('keydown', (event) => {
    const key = normalizeKey(event.key);
    if (key) {
        keys.add(key);
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(key)) {
            event.preventDefault();
        }
    }
});

document.addEventListener('keyup', (event) => {
    const key = normalizeKey(event.key);
    if (key) {
        keys.delete(key);
    }
});

restartBtn.addEventListener('click', restartGame);

function normalizeKey(key) {
    const keyMap = {
        a: 'ArrowLeft',
        A: 'ArrowLeft',
        d: 'ArrowRight',
        D: 'ArrowRight',
        w: 'ArrowUp',
        W: 'ArrowUp',
        ' ': 'Space'
    };

    return keyMap[key] || key;
}

function createLevel() {
    const platforms = [
        { x: 0, y: 452, width: 430, height: groundHeight, type: 'ground' },
        { x: 520, y: 452, width: 480, height: groundHeight, type: 'ground' },
        { x: 1070, y: 452, width: 560, height: groundHeight, type: 'ground' },
        { x: 1710, y: 452, width: 360, height: groundHeight, type: 'ground' },
        { x: 2140, y: 452, width: 420, height: groundHeight, type: 'ground' },
        { x: 2640, y: 452, width: 520, height: groundHeight, type: 'ground' },
        { x: 240, y: 360, width: 130, height: 18, type: 'brick' },
        { x: 470, y: 320, width: 110, height: 18, type: 'brick' },
        { x: 660, y: 270, width: 120, height: 18, type: 'brick' },
        { x: 900, y: 332, width: 120, height: 18, type: 'brick' },
        { x: 1180, y: 300, width: 160, height: 18, type: 'brick' },
        { x: 1460, y: 246, width: 120, height: 18, type: 'brick' },
        { x: 1770, y: 300, width: 130, height: 18, type: 'brick' },
        { x: 1990, y: 238, width: 120, height: 18, type: 'brick' },
        { x: 2280, y: 308, width: 120, height: 18, type: 'brick' },
        { x: 2450, y: 250, width: 120, height: 18, type: 'brick' },
        { x: 2800, y: 206, width: 110, height: 18, type: 'brick' }
    ];

    const coins = [
        { x: 270, y: 324, radius: 10, collected: false },
        { x: 320, y: 324, radius: 10, collected: false },
        { x: 505, y: 284, radius: 10, collected: false },
        { x: 695, y: 234, radius: 10, collected: false },
        { x: 935, y: 296, radius: 10, collected: false },
        { x: 1215, y: 264, radius: 10, collected: false },
        { x: 1290, y: 264, radius: 10, collected: false },
        { x: 1495, y: 210, radius: 10, collected: false },
        { x: 1805, y: 264, radius: 10, collected: false },
        { x: 2030, y: 202, radius: 10, collected: false },
        { x: 2315, y: 272, radius: 10, collected: false },
        { x: 2485, y: 214, radius: 10, collected: false },
        { x: 2840, y: 170, radius: 10, collected: false }
    ];

    const enemies = [
        createEnemy(610, 418, 560, 940, 1.3),
        createEnemy(1240, 418, 1120, 1570, 1.5),
        createEnemy(1830, 418, 1740, 2030, 1.2),
        createEnemy(2310, 418, 2190, 2520, 1.45),
        createEnemy(2835, 172, 2800, 2885, 1.05)
    ];

    const clouds = [
        { x: 120, y: 80, size: 46 },
        { x: 530, y: 116, size: 34 },
        { x: 1010, y: 90, size: 40 },
        { x: 1560, y: 100, size: 48 },
        { x: 2120, y: 76, size: 38 },
        { x: 2580, y: 112, size: 44 }
    ];

    const hills = [
        { x: 120, width: 220, height: 120 },
        { x: 780, width: 260, height: 150 },
        { x: 1440, width: 240, height: 132 },
        { x: 2200, width: 300, height: 170 },
        { x: 2860, width: 220, height: 120 }
    ];

    return { platforms, coins, enemies, clouds, hills };
}

function createEnemy(x, y, minX, maxX, speed) {
    return {
        startX: x,
        x,
        y,
        width: 36,
        height: 34,
        minX,
        maxX,
        speed,
        direction: 1,
        alive: true
    };
}

function resetPlayerPosition() {
    player.x = player.spawnX;
    player.y = 388;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;
    cameraX = 0;
    state.message = '准备出发';
}

function restartGame() {
    state.score = 0;
    state.collectedCoins = 0;
    state.lives = 3;
    state.phase = 'playing';
    state.flashTimer = 0;
    state.message = '重新开始';

    for (const coin of level.coins) {
        coin.collected = false;
    }

    for (const enemy of level.enemies) {
        enemy.alive = true;
        enemy.x = enemy.startX;
        enemy.direction = 1;
    }

    resetPlayerPosition();
    updateHud();
}

function updateHud() {
    scoreEl.textContent = String(state.score);
    coinsEl.textContent = `${state.collectedCoins} / ${totalCoins}`;
    livesEl.textContent = String(state.lives);
    statusEl.textContent = state.message;
}

function update() {
    if (state.phase !== 'playing') {
        return;
    }

    state.flashTimer += 1;
    handleInput();
    applyPhysics();
    updateEnemies();
    collectCoins();
    handleEnemyCollisions();
    checkHazards();
    checkFinish();
    updateCamera();
}

function handleInput() {
    const movingLeft = keys.has('ArrowLeft');
    const movingRight = keys.has('ArrowRight');
    const wantsJump = keys.has('ArrowUp') || keys.has('Space');

    if (movingLeft && !movingRight) {
        player.velocityX = -player.speed;
        player.facing = -1;
    } else if (movingRight && !movingLeft) {
        player.velocityX = player.speed;
        player.facing = 1;
    } else {
        player.velocityX *= 0.72;
        if (Math.abs(player.velocityX) < 0.2) {
            player.velocityX = 0;
        }
    }

    if (wantsJump && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
    }
}

function applyPhysics() {
    player.velocityY += gravity;
    player.velocityY = Math.min(player.velocityY, 15);

    player.x += player.velocityX;
    resolveHorizontalCollisions();

    player.y += player.velocityY;
    player.onGround = false;
    resolveVerticalCollisions();

    player.x = clamp(player.x, 0, worldWidth - player.width);
}

function resolveHorizontalCollisions() {
    for (const platform of level.platforms) {
        if (!intersects(player, platform)) {
            continue;
        }

        if (player.velocityX > 0) {
            player.x = platform.x - player.width;
        } else if (player.velocityX < 0) {
            player.x = platform.x + platform.width;
        }
        player.velocityX = 0;
    }
}

function resolveVerticalCollisions() {
    for (const platform of level.platforms) {
        if (!intersects(player, platform)) {
            continue;
        }

        if (player.velocityY > 0) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.onGround = true;
        } else if (player.velocityY < 0) {
            player.y = platform.y + platform.height;
            player.velocityY = 0;
        }
    }
}

function updateEnemies() {
    for (const enemy of level.enemies) {
        if (!enemy.alive) {
            continue;
        }

        enemy.x += enemy.speed * enemy.direction;
        if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
            enemy.direction *= -1;
        }
    }
}

function collectCoins() {
    for (const coin of level.coins) {
        if (coin.collected) {
            continue;
        }

        const dx = player.x + player.width / 2 - coin.x;
        const dy = player.y + player.height / 2 - coin.y;
        const distance = Math.hypot(dx, dy);
        if (distance < coin.radius + 20) {
            coin.collected = true;
            state.collectedCoins += 1;
            state.score += 100;
            state.message = '金币到手';
            updateHud();
        }
    }
}

function handleEnemyCollisions() {
    const now = performance.now();

    for (const enemy of level.enemies) {
        if (!enemy.alive || !intersects(player, enemy)) {
            continue;
        }

        const stomped = player.velocityY > 1 && player.y + player.height - enemy.y < 18;
        if (stomped) {
            enemy.alive = false;
            player.velocityY = -player.jumpPower * 0.55;
            state.score += 250;
            state.message = '踩掉一个敌人';
            updateHud();
            continue;
        }

        if (now >= player.invulnerableUntil) {
            loseLife('被敌人碰到了');
            player.invulnerableUntil = now + 1500;
        }
    }
}

function checkHazards() {
    if (player.y > canvas.height + 120) {
        loseLife('掉进深坑');
    }
}

function checkFinish() {
    if (player.x + player.width >= finishFlag.x && player.y + player.height >= finishFlag.y) {
        state.phase = 'won';
        state.score += 1000 + state.collectedCoins * 50;
        state.message = '顺利通关';
        updateHud();
    }
}

function loseLife(reason) {
    if (state.phase !== 'playing') {
        return;
    }

    state.lives -= 1;
    if (state.lives <= 0) {
        state.phase = 'lost';
        state.message = '游戏结束';
        updateHud();
        return;
    }

    resetPlayerPosition();
    state.message = `${reason}，重新出发`;
    updateHud();
}

function updateCamera() {
    const target = player.x - canvas.width * 0.35;
    cameraX = clamp(target, 0, worldWidth - canvas.width);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky();
    drawBackground();
    drawPlatforms();
    drawCoins();
    drawFlag();
    drawEnemies();
    drawPlayer();
    drawOverlay();
}

function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#85d2ff');
    gradient.addColorStop(0.65, '#d9f5ff');
    gradient.addColorStop(0.65, '#86d05e');
    gradient.addColorStop(1, '#5faa39');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBackground() {
    for (const cloud of level.clouds) {
        const cloudX = cloud.x - cameraX * 0.35;
        drawCloud(cloudX, cloud.y, cloud.size);
    }

    for (const hill of level.hills) {
        const hillX = hill.x - cameraX * 0.55;
        ctx.fillStyle = '#6fbb49';
        ctx.beginPath();
        ctx.moveTo(hillX, 452);
        ctx.quadraticCurveTo(hillX + hill.width / 2, 452 - hill.height, hillX + hill.width, 452);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#4b9d32';
        ctx.beginPath();
        ctx.arc(hillX + hill.width * 0.55, 452 - hill.height * 0.38, 18, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawCloud(x, y, size) {
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.36, 0, Math.PI * 2);
    ctx.arc(x + size * 0.34, y - 8, size * 0.28, 0, Math.PI * 2);
    ctx.arc(x + size * 0.64, y, size * 0.34, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatforms() {
    for (const platform of level.platforms) {
        const x = platform.x - cameraX;
        ctx.fillStyle = platform.type === 'ground' ? '#8b5426' : '#b56b35';
        ctx.fillRect(x, platform.y, platform.width, platform.height);
        ctx.fillStyle = '#68b947';
        ctx.fillRect(x, platform.y, platform.width, 8);

        if (platform.type === 'brick') {
            ctx.strokeStyle = 'rgba(77, 34, 7, 0.35)';
            ctx.lineWidth = 2;
            for (let offset = 20; offset < platform.width; offset += 24) {
                ctx.beginPath();
                ctx.moveTo(x + offset, platform.y);
                ctx.lineTo(x + offset, platform.y + platform.height);
                ctx.stroke();
            }
        }
    }
}

function drawCoins() {
    for (const coin of level.coins) {
        if (coin.collected) {
            continue;
        }

        const x = coin.x - cameraX;
        const pulse = Math.sin(state.flashTimer / 12) * 2;
        ctx.fillStyle = '#ffd54a';
        ctx.beginPath();
        ctx.ellipse(x, coin.y, coin.radius - 1, coin.radius + pulse, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff4a6';
        ctx.beginPath();
        ctx.ellipse(x - 2, coin.y - 3, 2.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawFlag() {
    const x = finishFlag.x - cameraX;
    ctx.fillStyle = '#d9f2ff';
    ctx.fillRect(x, finishFlag.y, finishFlag.width, finishFlag.height);

    ctx.fillStyle = '#ff4c42';
    ctx.beginPath();
    ctx.moveTo(x + finishFlag.width, finishFlag.y + 24);
    ctx.lineTo(x + finishFlag.width + 64, finishFlag.y + 48);
    ctx.lineTo(x + finishFlag.width, finishFlag.y + 74);
    ctx.closePath();
    ctx.fill();
}

function drawEnemies() {
    for (const enemy of level.enemies) {
        if (!enemy.alive) {
            continue;
        }

        const x = enemy.x - cameraX;
        ctx.fillStyle = '#7a3b13';
        ctx.fillRect(x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = '#b76526';
        ctx.fillRect(x + 4, enemy.y + 6, enemy.width - 8, enemy.height - 8);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 7, enemy.y + 8, 7, 7);
        ctx.fillRect(x + 22, enemy.y + 8, 7, 7);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 9, enemy.y + 10, 3, 3);
        ctx.fillRect(x + 24, enemy.y + 10, 3, 3);
        ctx.fillStyle = '#4f2409';
        ctx.fillRect(x + 6, enemy.y + 28, 8, 4);
        ctx.fillRect(x + 22, enemy.y + 28, 8, 4);
    }
}

function drawPlayer() {
    const x = player.x - cameraX;
    const blinking = performance.now() < player.invulnerableUntil && state.flashTimer % 10 < 5;
    if (blinking) {
        return;
    }

    ctx.fillStyle = '#e53935';
    ctx.fillRect(x + 6, player.y, 28, 12);
    ctx.fillRect(x + 4, player.y + 12, 32, 18);
    ctx.fillStyle = '#f5d2b2';
    ctx.fillRect(x + 10, player.y + 12, 20, 16);
    ctx.fillStyle = '#2452d1';
    ctx.fillRect(x + 7, player.y + 30, 26, 18);
    ctx.fillStyle = '#51311f';
    ctx.fillRect(x + 8, player.y + 48, 10, 6);
    ctx.fillRect(x + 22, player.y + 48, 10, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + (player.facing > 0 ? 23 : 15), player.y + 16, 3, 3);
    ctx.fillRect(x + (player.facing > 0 ? 24 : 10), player.y + 24, 10, 3);
}

function drawOverlay() {
    if (state.phase === 'playing') {
        return;
    }

    ctx.fillStyle = 'rgba(8, 21, 33, 0.46)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Trebuchet MS';
    ctx.fillText(state.phase === 'won' ? '通关成功' : '游戏结束', canvas.width / 2, canvas.height / 2 - 18);

    ctx.font = '24px Trebuchet MS';
    const tip = state.phase === 'won'
        ? `最终得分 ${state.score}，金币 ${state.collectedCoins}/${totalCoins}`
        : '点击右上角“重新开始”继续挑战';
    ctx.fillText(tip, canvas.width / 2, canvas.height / 2 + 28);
    ctx.textAlign = 'start';
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function intersects(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function loop() {
    update();
    draw();
    animationFrameId = requestAnimationFrame(loop);
}

loop();

window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
});