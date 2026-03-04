const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hpEl = document.getElementById("hp");
const scoreEl = document.getElementById("score");
const enemyLeftEl = document.getElementById("enemyLeft");
const bossHpEl = document.getElementById("bossHp");
const pauseBtn = document.getElementById("pauseBtn");

const startMenu = document.getElementById("startMenu");
const pauseMenu = document.getElementById("pauseMenu");
const gameOverMenu = document.getElementById("gameOverMenu");
const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");
const settlementWrap = document.getElementById("settlementWrap");
const settlementImage = document.getElementById("settlementImage");

const SETTLEMENT_IMAGE_PATH = "assets/settlement-victory.png";

const startBtn = document.getElementById("startBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

const WORLD_WIDTH = 4200;
const WORLD_HEIGHT = 540;
const GRAVITY = 0.85;
const GROUND_Y = 472;

const keys = {};
let running = false;
let paused = false;
let gameEnded = false;
let cameraX = 0;
let frameCount = 0;
let bossIntroTimer = 0;
let victoryTimer = 0;

const state = {
    score: 0,
    screenShake: 0
};

const player = {
    x: 90,
    y: 380,
    w: 38,
    h: 58,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpForce: -15,
    onGround: false,
    facing: 1,
    hp: 6,
    fireCooldown: 0,
    invincible: 0,
    weapon: 0,
    weaponTimer: 0
};

const platforms = [
    { x: 0, y: GROUND_Y, w: WORLD_WIDTH, h: 80 },
    { x: 340, y: 398, w: 220, h: 20 },
    { x: 760, y: 340, w: 250, h: 20 },
    { x: 1190, y: 390, w: 240, h: 20 },
    { x: 1620, y: 325, w: 235, h: 20 },
    { x: 2055, y: 372, w: 265, h: 20 },
    { x: 2500, y: 305, w: 240, h: 20 },
    { x: 2960, y: 347, w: 255, h: 20 },
    { x: 3415, y: 285, w: 470, h: 20 }
];

const enemySeeds = [
    [500, 352, 430, 740],
    [910, 292, 790, 1020],
    [1340, 340, 1210, 1450],
    [1710, 275, 1640, 1870],
    [2145, 322, 2060, 2320],
    [2588, 255, 2520, 2750],
    [3090, 297, 2990, 3240]
];

const enemies = enemySeeds.map((seed) => createEnemy(...seed));
const boss = createBoss();
const bullets = [];
const enemyBullets = [];
const particles = [];
const powerups = [];

const goal = { x: WORLD_WIDTH - 120, y: 356, w: 42, h: 116 };

function createEnemy(x, y, left, right) {
    return {
        x, y,
        w: 36, h: 54,
        vx: 1.6,
        hp: 4,
        alive: true,
        patrolLeft: left,
        patrolRight: right,
        fireCd: randomRange(55, 120)
    };
}

function createBoss() {
    return {
        x: 3650, y: 180,
        w: 120, h: 190,
        vx: 0, vy: 0,
        hp: 80,
        maxHp: 80,
        alive: true,
        active: false,
        invincible: 0,
        attackCd: 130,
        slamCd: 320,
        rage: false
    };
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resetGame() {
    state.score = 0;
    state.screenShake = 0;
    cameraX = 0;
    frameCount = 0;
    gameEnded = false;
    paused = false;
    bossIntroTimer = 0;
    victoryTimer = 0;

    player.x = 90;
    player.y = 380;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.facing = 1;
    player.hp = 6;
    player.fireCooldown = 0;
    player.invincible = 0;
    player.weapon = 0;
    player.weaponTimer = 0;

    bullets.length = 0;
    enemyBullets.length = 0;
    particles.length = 0;
    powerups.length = 0;

    enemies.forEach((e, i) => {
        const seed = enemySeeds[i];
        e.x = seed[0];
        e.y = seed[1];
        e.patrolLeft = seed[2];
        e.patrolRight = seed[3];
        e.vx = 1.6;
        e.hp = 4;
        e.alive = true;
        e.fireCd = randomRange(55, 120);
    });

    boss.x = 3650;
    boss.y = 180;
    boss.vx = 0;
    boss.vy = 0;
    boss.hp = boss.maxHp;
    boss.alive = true;
    boss.active = false;
    boss.invincible = 0;
    boss.attackCd = 130;
    boss.slamCd = 320;
    boss.rage = false;

    syncHud();
    showSettlementImage(false);
    hideAllOverlays();
    startMenu.classList.add("show");
    pauseBtn.disabled = true;
}

function showSettlementImage(show) {
    if (!settlementWrap || !settlementImage) return;

    settlementWrap.classList.toggle("show", show);
    settlementWrap.classList.remove("error");

    if (!show) {
        settlementImage.removeAttribute("src");
        return;
    }

    settlementImage.src = SETTLEMENT_IMAGE_PATH;
}

function syncHud() {
    hpEl.textContent = String(player.hp);
    scoreEl.textContent = String(state.score);
    const aliveCount = enemies.filter((e) => e.alive).length;
    enemyLeftEl.textContent = String(aliveCount + (boss.alive ? 1 : 0));

    if (boss.active && boss.alive) {
        bossHpEl.textContent = `${boss.hp}/${boss.maxHp}`;
    } else if (!boss.alive) {
        bossHpEl.textContent = "0";
    } else {
        bossHpEl.textContent = "--";
    }
}

function hideAllOverlays() {
    startMenu.classList.remove("show");
    pauseMenu.classList.remove("show");
    gameOverMenu.classList.remove("show");
}

function startGame() {
    running = true;
    paused = false;
    hideAllOverlays();
    pauseBtn.disabled = false;
}

function togglePause() {
    if (!running || gameEnded) return;
    paused = !paused;
    pauseMenu.classList.toggle("show", paused);
}

function endGame(win) {
    if (win) {
        victoryTimer = 300;
        return;
    }
    
    running = false;
    paused = false;
    gameEnded = true;
    pauseBtn.disabled = true;
    endTitle.textContent = "任务失败";
    endText.textContent = "生命耗尽，战斗失败。";
    showSettlementImage(false);
    gameOverMenu.classList.add("show");
}

function spawnHitParticles(x, y, color, count, spread) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * spread,
            vy: (Math.random() - 0.5) * spread - 0.5,
            life: randomRange(20, 34),
            maxLife: 34,
            color,
            size: Math.random() * 4 + 2
        });
    }
}

function spawnPowerup(x, y) {
    const type = randomRange(0, 3);
    powerups.push({
        x, y: y - 10,
        w: 24, h: 24,
        vy: -3,
        life: 360,
        type
    });
}

function shoot() {
    if (player.fireCooldown > 0 || !running || paused || gameEnded || bossIntroTimer > 0 || victoryTimer > 0) return;
    
    const muzzleX = player.x + (player.facing === 1 ? player.w + 1 : -13);
    const muzzleY = player.y + 25;

    if (player.weapon === 0) {
        player.fireCooldown = 10;
        bullets.push({
            x: muzzleX, y: muzzleY,
            w: 13, h: 4,
            vx: 11 * player.facing,
            damage: 1,
            type: 'normal'
        });
        spawnHitParticles(muzzleX, muzzleY, "#ffe066", 6, 2.4);
    } else if (player.weapon === 1) {
        player.fireCooldown = 16;
        for (let i = -1; i <= 1; i++) {
            bullets.push({
                x: muzzleX, y: muzzleY + i * 6,
                w: 10, h: 3,
                vx: 10 * player.facing,
                vy: i * 2,
                damage: 1,
                type: 'shotgun'
            });
        }
        spawnHitParticles(muzzleX, muzzleY, "#ff6b35", 12, 4);
    } else if (player.weapon === 2) {
        player.fireCooldown = 5;
        bullets.push({
            x: muzzleX, y: muzzleY,
            w: 28, h: 3,
            vx: 18 * player.facing,
            damage: 2,
            type: 'laser'
        });
        spawnHitParticles(muzzleX, muzzleY, "#00f5ff", 8, 2);
    } else if (player.weapon === 3) {
        player.fireCooldown = 14;
        bullets.push({
            x: muzzleX, y: muzzleY,
            w: 11, h: 5,
            vx: 8 * player.facing,
            vy: 0,
            damage: 3,
            type: 'homing',
            target: null
        });
        spawnHitParticles(muzzleX, muzzleY, "#b84dff", 10, 3);
    }
}

function updatePlayer() {
    const left = keys["KeyA"] || keys["ArrowLeft"];
    const right = keys["KeyD"] || keys["ArrowRight"];
    const jump = keys["KeyW"] || keys["ArrowUp"] || keys["Space"];

    player.vx = 0;
    if (left) {
        player.vx = -player.speed;
        player.facing = -1;
    }
    if (right) {
        player.vx = player.speed;
        player.facing = 1;
    }

    if (jump && player.onGround) {
        player.vy = player.jumpForce;
        player.onGround = false;
    }

    player.x += player.vx;
    player.x = Math.max(0, Math.min(WORLD_WIDTH - player.w, player.x));

    player.vy += GRAVITY;
    const prevY = player.y;
    player.y += player.vy;
    player.onGround = false;

    for (const p of platforms) {
        if (player.x + player.w > p.x && player.x < p.x + p.w) {
            const wasAbove = prevY + player.h <= p.y;
            const nowInside = player.y + player.h >= p.y && player.y + player.h <= p.y + p.h + 16;
            if (wasAbove && nowInside && player.vy >= 0) {
                player.y = p.y - player.h;
                player.vy = 0;
                player.onGround = true;
            }
        }
    }

    if (player.y > WORLD_HEIGHT + 120) {
        damagePlayer(1);
        player.x = Math.max(120, player.x - 180);
        player.y = 260;
        player.vx = 0;
        player.vy = 0;
    }

    if (player.fireCooldown > 0) player.fireCooldown--;
    if (player.invincible > 0) player.invincible--;
    if (player.weaponTimer > 0) {
        player.weaponTimer--;
        if (player.weaponTimer === 0) player.weapon = 0;
    }

    cameraX = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, player.x - canvas.width * 0.33));
}

function damagePlayer(amount) {
    if (player.invincible > 0 || gameEnded) return;
    player.hp -= amount;
    player.invincible = 72;
    state.screenShake = Math.max(state.screenShake, 8);
    spawnHitParticles(player.x + player.w * 0.5, player.y + player.h * 0.35, "#ff7b7b", 18, 5);
    syncHud();
    if (player.hp <= 0) endGame(false);
}

function updateEnemies() {
    enemies.forEach((e) => {
        if (!e.alive) return;

        e.x += e.vx;
        if (e.x < e.patrolLeft || e.x + e.w > e.patrolRight) {
            e.vx *= -1;
        }

        e.fireCd--;
        const dx = player.x - e.x;
        const closeEnough = Math.abs(dx) < 460 && Math.abs(player.y - e.y) < 125;

        if (e.fireCd <= 0 && closeEnough && bossIntroTimer === 0) {
            const dir = dx >= 0 ? 1 : -1;
            enemyBullets.push({
                x: e.x + (dir > 0 ? e.w : -10),
                y: e.y + 22,
                w: 10, h: 4,
                vx: 6.8 * dir,
                type: "rifle"
            });
            e.fireCd = randomRange(55, 120);
            spawnHitParticles(e.x + e.w * 0.5, e.y + 22, "#b8f2e6", 6, 2.2);
        }

        if (rectHit(player, e)) damagePlayer(1);
    });
}

function updateBoss() {
    if (!boss.alive) return;

    if (!boss.active && player.x > 3320) {
        boss.active = true;
        bossIntroTimer = 140;
        state.screenShake = 16;
    }

    if (!boss.active || bossIntroTimer > 0) return;

    const arenaLeft = 3360;
    const arenaRight = 3945;
    const targetX = player.x + (player.x < boss.x ? 85 : -95);

    const speed = boss.rage ? 2.7 : 2.15;
    if (Math.abs(targetX - boss.x) > 22) {
        boss.vx = Math.sign(targetX - boss.x) * speed;
    } else {
        boss.vx = 0;
    }

    boss.x += boss.vx;
    boss.x = Math.max(arenaLeft, Math.min(arenaRight - boss.w, boss.x));

    if (boss.y + boss.h < GROUND_Y) {
        boss.vy += GRAVITY * 0.85;
        boss.y += boss.vy;
    } else {
        if (boss.vy > 8) {
            state.screenShake = Math.max(state.screenShake, 12);
            spawnHitParticles(boss.x + boss.w * 0.5, GROUND_Y - 4, "#ffcf56", 28, 7);
            spawnShockwave();
        }
        boss.vy = 0;
        boss.y = GROUND_Y - boss.h;
    }

    if (boss.invincible > 0) boss.invincible--;
    boss.attackCd--;
    boss.slamCd--;

    if (boss.attackCd <= 0) {
        const dir = player.x > boss.x ? 1 : -1;
        const burst = boss.rage ? 3 : 2;
        for (let i = 0; i < burst; i++) {
            enemyBullets.push({
                x: boss.x + (dir > 0 ? boss.w : -16),
                y: boss.y + 56 + i * 18,
                w: 16, h: 6,
                vx: (boss.rage ? 8.8 : 7.3) * dir,
                type: "boss"
            });
        }
        spawnHitParticles(boss.x + boss.w * 0.5, boss.y + 62, "#ffb703", 16, 3.5);
        boss.attackCd = boss.rage ? randomRange(45, 70) : randomRange(70, 100);
    }

    if (boss.slamCd <= 0 && boss.y + boss.h >= GROUND_Y) {
        boss.vy = boss.rage ? -14 : -11.8;
        boss.slamCd = boss.rage ? randomRange(170, 220) : randomRange(230, 290);
    }

    if (boss.hp <= boss.maxHp * 0.5) {
        boss.rage = true;
    }

    if (rectHit(player, boss)) {
        damagePlayer(1);
    }
}

function spawnShockwave() {
    enemyBullets.push({
        x: boss.x - 12,
        y: GROUND_Y - 10,
        w: 26, h: 10,
        vx: -7.4,
        type: "shock"
    });
    enemyBullets.push({
        x: boss.x + boss.w - 14,
        y: GROUND_Y - 10,
        w: 26, h: 10,
        vx: 7.4,
        type: "shock"
    });
}

function bossTakeDamage(amount) {
    if (!boss.alive || !boss.active || boss.invincible > 0) return;
    boss.hp -= amount;
    boss.invincible = 4;
    state.score += 20;
    spawnHitParticles(boss.x + boss.w * 0.5, boss.y + 70, "#ff6b6b", 12, 4.2);
    syncHud();

    if (boss.hp <= 0) {
        boss.alive = false;
        boss.hp = 0;
        state.score += 1200;
        state.screenShake = 16;
        spawnHitParticles(boss.x + boss.w * 0.5, boss.y + boss.h * 0.5, "#ffd166", 68, 9);
    }
}

function updatePowerups() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        p.vy += 0.15;
        p.y += p.vy;
        p.life--;

        if (p.y > GROUND_Y || p.life <= 0) {
            powerups.splice(i, 1);
            continue;
        }

        if (rectHit(player, p)) {
            powerups.splice(i, 1);
            if (p.type === 0) {
                player.hp = Math.min(player.hp + 2, 10);
            } else {
                player.weapon = p.type;
                player.weaponTimer = 600;
            }
            spawnHitParticles(p.x + 12, p.y + 12, "#4dff88", 16, 5);
            state.score += 50;
            syncHud();
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        
        if (b.type === 'homing') {
            if (!b.target || !b.target.alive) {
                let nearest = null;
                let minDist = 999999;
                for (const e of enemies) {
                    if (!e.alive) continue;
                    const dist = Math.hypot(e.x - b.x, e.y - b.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = e;
                    }
                }
                if (!nearest && boss.alive && boss.active) {
                    nearest = boss;
                }
                b.target = nearest;
            }
            
            if (b.target && b.target.alive) {
                const dx = b.target.x + b.target.w * 0.5 - b.x;
                const dy = b.target.y + b.target.h * 0.5 - b.y;
                const angle = Math.atan2(dy, dx);
                b.vx = Math.cos(angle) * 9;
                b.vy = Math.sin(angle) * 9;
            }
        }
        
        b.x += b.vx;
        if (b.vy !== undefined) b.y += b.vy;

        if (b.x < -50 || b.x > WORLD_WIDTH + 50 || b.y < -50 || b.y > WORLD_HEIGHT + 50) {
            bullets.splice(i, 1);
            continue;
        }

        let removed = false;
        for (const e of enemies) {
            if (!e.alive) continue;
            if (rectHit(b, e)) {
                e.hp -= b.damage;
                bullets.splice(i, 1);
                removed = true;
                spawnHitParticles(b.x, b.y, "#ff8fab", 7, 3.2);
                if (e.hp <= 0) {
                    e.alive = false;
                    state.score += 130;
                    spawnHitParticles(e.x + e.w * 0.5, e.y + 18, "#ffd166", 20, 5);
                    if (Math.random() < 0.35) spawnPowerup(e.x + e.w * 0.5, e.y);
                    syncHud();
                }
                break;
            }
        }

        if (removed) continue;

        if (boss.alive && boss.active && rectHit(b, boss)) {
            bullets.splice(i, 1);
            bossTakeDamage(b.damage);
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx;

        if (b.type === "shock") {
            b.w = Math.min(42, b.w + 0.6);
            b.h = Math.min(13, b.h + 0.08);
        }

        if (b.x < -50 || b.x > WORLD_WIDTH + 50) {
            enemyBullets.splice(i, 1);
            continue;
        }

        if (rectHit(b, player)) {
            enemyBullets.splice(i, 1);
            damagePlayer(b.type === "boss" ? 2 : 1);
        }
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life -= 1;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function checkWinCondition() {
    const allSmallEnemiesDead = enemies.every((e) => !e.alive);
    const reachedGoal = player.x + player.w > goal.x;
    const bossDefeated = !boss.alive;

    if (allSmallEnemiesDead && bossDefeated && reachedGoal && !gameEnded) {
        endGame(true);
    }
}

function rectHit(a, b) {
    return a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;
}

function update() {
    if (!running || paused || gameEnded) return;

    frameCount += 1;

    if (victoryTimer > 0) {
        victoryTimer--;
        if (victoryTimer === 0) {
            running = false;
            gameEnded = true;
            pauseBtn.disabled = true;
            endTitle.textContent = "任务完成";
            endText.textContent = "你击败了肌肉男 Boss 并成功冲线！";
            showSettlementImage(true);
            gameOverMenu.classList.add("show");
        }
        return;
    }

    if (bossIntroTimer > 0) {
        bossIntroTimer--;
        if (bossIntroTimer % 10 === 0) {
            state.screenShake = Math.max(state.screenShake, 6);
        }
    }

    updatePlayer();
    updateEnemies();
    updateBoss();
    updateBullets();
    updatePowerups();
    updateParticles();
    checkWinCondition();

    if (state.screenShake > 0) state.screenShake -= 0.7;

    syncHud();
}

function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#0c1733");
    sky.addColorStop(0.52, "#15284f");
    sky.addColorStop(1, "#3a1f23");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const moonX = 720 - (cameraX * 0.09) % 900;
    const moonY = 90;
    const moonGrad = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 72);
    moonGrad.addColorStop(0, "rgba(255, 250, 216, 0.95)");
    moonGrad.addColorStop(1, "rgba(255, 250, 216, 0)");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(20, 34, 68, 0.8)";
    for (let i = 0; i < 7; i++) {
        const baseX = i * 300 - (cameraX * 0.16) % 300 - 110;
        ctx.beginPath();
        ctx.moveTo(baseX, 390);
        ctx.lineTo(baseX + 120, 210 + (i % 2) * 30);
        ctx.lineTo(baseX + 255, 390);
        ctx.closePath();
        ctx.fill();
    }

    ctx.fillStyle = "rgba(13, 22, 46, 0.92)";
    for (let i = 0; i < 18; i++) {
        const w = 80 + (i % 5) * 16;
        const h = 140 + (i % 4) * 38;
        const x = i * 130 - (cameraX * 0.38) % 130;
        ctx.fillRect(x, 395 - h, w, h);

        ctx.fillStyle = "rgba(255, 208, 125, 0.24)";
        for (let row = 0; row < 6; row++) {
            const wy = 405 - h + row * 20;
            ctx.fillRect(x + 9, wy, 8, 8);
            ctx.fillRect(x + 28, wy, 8, 8);
            if (w > 94) ctx.fillRect(x + 48, wy, 8, 8);
        }
        ctx.fillStyle = "rgba(13, 22, 46, 0.92)";
    }
}

function drawPlayer() {
    const blink = player.invincible > 0 && Math.floor(player.invincible / 5) % 2 === 0;
    if (blink) return;

    const x = player.x;
    const y = player.y;
    const dir = player.facing;
    const runSwing = Math.sin(frameCount * 0.3) * 4 * Math.abs(player.vx) / player.speed;

    const bodyGrad = ctx.createLinearGradient(x, y, x, y + player.h);
    bodyGrad.addColorStop(0, "#74d4ff");
    bodyGrad.addColorStop(1, "#1a6ca8");
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, x + 8, y + 14, 22, 34, 6);

    ctx.fillStyle = "#d7f3ff";
    roundRect(ctx, x + 5, y + 16, 7, 9, 2);
    roundRect(ctx, x + 27, y + 16, 7, 9, 2);

    ctx.fillStyle = "#f0c49a";
    ctx.beginPath();
    ctx.arc(x + 19, y + 10, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff4d6d";
    roundRect(ctx, x + 10, y + 4, 18, 5, 2);
    ctx.fillRect(x + (dir > 0 ? 27 : 6), y + 6, 8, 2);

    ctx.fillStyle = "#1a263f";
    roundRect(ctx, x + 9, y + 46, 8, 13 + runSwing, 2);
    roundRect(ctx, x + 22, y + 46, 8, 13 - runSwing, 2);

    ctx.fillStyle = "#f1f5f9";
    const gunX = dir > 0 ? x + 29 : x - 11;
    roundRect(ctx, gunX, y + 24, 12, 5, 1);
    ctx.fillStyle = "#fb8500";
    ctx.fillRect(gunX + (dir > 0 ? 11 : -2), y + 25, 2, 3);
}

function drawEnemy(e) {
    const pulse = Math.sin((frameCount + e.x) * 0.12) * 0.4;
    const x = e.x;
    const y = e.y;

    const helmet = ctx.createLinearGradient(x, y, x, y + 54);
    helmet.addColorStop(0, "#ffd3d3");
    helmet.addColorStop(1, "#c44536");
    ctx.fillStyle = helmet;
    roundRect(ctx, x + 5, y + 4, 26, 24, 6);

    ctx.fillStyle = "#2f3542";
    roundRect(ctx, x + 9, y + 11, 18, 10, 3);
    ctx.fillStyle = "#ffca3a";
    ctx.fillRect(x + 11, y + 14, 5, 3);
    ctx.fillRect(x + 20, y + 14, 5, 3);

    const armor = ctx.createLinearGradient(x, y + 20, x, y + 52);
    armor.addColorStop(0, "#ff6b6b");
    armor.addColorStop(1, "#b22222");
    ctx.fillStyle = armor;
    roundRect(ctx, x + 6, y + 24, 24, 22 + pulse, 5);

    ctx.fillStyle = "#2f3e5b";
    roundRect(ctx, x + 8, y + 44, 8, 10, 2);
    roundRect(ctx, x + 20, y + 44, 8, 10, 2);
}

function drawBoss() {
    if (!boss.alive) return;

    const x = boss.x;
    const y = boss.y;
    const dir = player.x >= boss.x ? 1 : -1;
    const breathe = Math.sin(frameCount * 0.1) * 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(x + boss.w * 0.5, GROUND_Y + 3, 68, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    const torso = ctx.createLinearGradient(x, y, x, y + boss.h);
    torso.addColorStop(0, "#ffd6a5");
    torso.addColorStop(1, "#d08b5b");
    ctx.fillStyle = torso;
    roundRect(ctx, x + 24, y + 46 + breathe, 72, 78, 14);

    ctx.fillStyle = "rgba(255, 240, 220, 0.6)";
    roundRect(ctx, x + 31, y + 58 + breathe, 26, 18, 8);
    roundRect(ctx, x + 63, y + 58 + breathe, 26, 18, 8);

    ctx.fillStyle = "#d08456";
    roundRect(ctx, x + 2, y + 60, 30, 80, 14);
    roundRect(ctx, x + 88, y + 60, 30, 80, 14);

    ctx.fillStyle = "#3f4c73";
    roundRect(ctx, x + 3, y + 108, 28, 16, 4);
    roundRect(ctx, x + 89, y + 108, 28, 16, 4);

    ctx.fillStyle = "#384b79";
    roundRect(ctx, x + 30, y + 122, 24, 58, 8);
    roundRect(ctx, x + 66, y + 122, 24, 58, 8);

    ctx.fillStyle = "#f2bf96";
    ctx.beginPath();
    ctx.arc(x + 60, y + 34, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#1f2432";
    ctx.beginPath();
    ctx.arc(x + 60, y + 25, 18, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111";
    const eyeShift = dir > 0 ? 2 : -2;
    ctx.fillRect(x + 50 + eyeShift, y + 31, 5, 4);
    ctx.fillRect(x + 65 + eyeShift, y + 31, 5, 4);

    if (boss.rage) {
        const ring = ctx.createRadialGradient(x + 60, y + 84, 18, x + 60, y + 84, 85);
        ring.addColorStop(0, "rgba(255, 80, 60, 0.0)");
        ring.addColorStop(1, "rgba(255, 80, 60, 0.3)");
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(x + 60, y + 84, 85, 0, Math.PI * 2);
        ctx.fill();
    }

    const hpBarW = 140;
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    roundRect(ctx, x - 10, y - 20, hpBarW + 20, 12, 4);
    ctx.fillStyle = "#3b425a";
    roundRect(ctx, x, y - 18, hpBarW, 8, 3);

    const hpGrad = ctx.createLinearGradient(x, y, x + hpBarW, y);
    hpGrad.addColorStop(0, "#ff8a80");
    hpGrad.addColorStop(1, "#ff1744");
    ctx.fillStyle = hpGrad;
    roundRect(ctx, x, y - 18, hpBarW * hpRatio, 8, 3);
}

function drawWorld() {
    const shakeX = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;
    const shakeY = state.screenShake > 0 ? (Math.random() - 0.5) * state.screenShake : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    drawBackground();

    ctx.save();
    ctx.translate(-cameraX, 0);

    platforms.forEach((p) => {
        if (p.y === GROUND_Y) {
            const groundGrad = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
            groundGrad.addColorStop(0, "#3f6d2e");
            groundGrad.addColorStop(1, "#2f4628");
            ctx.fillStyle = groundGrad;
            ctx.fillRect(p.x, p.y, p.w, p.h);

            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            for (let i = 0; i < p.w; i += 38) {
                ctx.fillRect(p.x + i, p.y + 12 + (i % 3), 20, 2);
            }
        } else {
            const platGrad = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
            platGrad.addColorStop(0, "#7c95b7");
            platGrad.addColorStop(1, "#445570");
            ctx.fillStyle = platGrad;
            roundRect(ctx, p.x, p.y, p.w, p.h, 5);
            ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            ctx.fillRect(p.x + 10, p.y + 4, Math.max(40, p.w - 20), 2);
        }
    });

    ctx.fillStyle = "#ffd166";
    roundRect(ctx, goal.x, goal.y, goal.w, goal.h, 8);
    ctx.fillStyle = "#3a405a";
    roundRect(ctx, goal.x + 8, goal.y + 14, 26, 20, 4);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(goal.x + 10, goal.y + 18, 8, 2);

    enemies.forEach((e) => {
        if (e.alive) drawEnemy(e);
    });

    if (boss.active || !boss.alive) {
        drawBoss();
    }

    bullets.forEach((b) => {
        if (b.type === 'shotgun') {
            ctx.fillStyle = "#ff6b35";
            roundRect(ctx, b.x, b.y, b.w, b.h, 1);
        } else if (b.type === 'laser') {
            const laser = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y);
            laser.addColorStop(0, "#00f5ff");
            laser.addColorStop(1, "#0096ff");
            ctx.fillStyle = laser;
            roundRect(ctx, b.x, b.y, b.w, b.h, 1);
            ctx.globalAlpha = 0.3;
            roundRect(ctx, b.x - 4, b.y - 1, b.w + 8, b.h + 2, 2);
            ctx.globalAlpha = 1;
        } else if (b.type === 'homing') {
            const homing = ctx.createRadialGradient(b.x + b.w * 0.5, b.y + b.h * 0.5, 2, b.x + b.w * 0.5, b.y + b.h * 0.5, 8);
            homing.addColorStop(0, "#b84dff");
            homing.addColorStop(1, "#7209b7");
            ctx.fillStyle = homing;
            roundRect(ctx, b.x, b.y, b.w, b.h, 2);
        } else {
            const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y);
            g.addColorStop(0, "#ffe066");
            g.addColorStop(1, "#fb8500");
            ctx.fillStyle = g;
            roundRect(ctx, b.x, b.y, b.w, b.h, 2);
        }
    });

    enemyBullets.forEach((b) => {
        if (b.type === "shock") {
            const shock = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y);
            shock.addColorStop(0, "#f94144");
            shock.addColorStop(1, "#f9c74f");
            ctx.fillStyle = shock;
        } else if (b.type === "boss") {
            ctx.fillStyle = "#ff9f1c";
        } else {
            ctx.fillStyle = "#9ef0e5";
        }
        roundRect(ctx, b.x, b.y, b.w, b.h, 2);
    });

    drawPlayer();

    powerups.forEach((p) => {
        const bounce = Math.sin(frameCount * 0.15) * 3;
        const colors = ['#4dff88', '#ff6b35', '#00f5ff', '#b84dff'];
        const icons = ['❤️', 'S', 'L', 'H'];
        
        ctx.fillStyle = colors[p.type];
        roundRect(ctx, p.x, p.y + bounce, p.w, p.h, 6);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(icons[p.type], p.x + p.w * 0.5, p.y + bounce + 16);
    });

    particles.forEach((p) => {
        const alpha = Math.max(0, p.life / p.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    ctx.restore();
    ctx.restore();

    if (boss.active && boss.alive && bossIntroTimer === 0) {
        drawBossBanner();
    }
    
    if (bossIntroTimer > 0) {
        drawBossIntro();
    }

    if (victoryTimer > 0) {
        drawVictoryScene();
    }
}

function drawBossIntro() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const flash = Math.sin(bossIntroTimer * 0.2) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 30, 30, ${flash})`;
    ctx.font = "bold 48px 'Impact', 'Arial Black'";
    ctx.textAlign = "center";
    ctx.fillText("WARNING", canvas.width * 0.5, canvas.height * 0.35);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px 'Segoe UI'";
    ctx.fillText("肌肉男 BOSS 出现！", canvas.width * 0.5, canvas.height * 0.5);

    ctx.font = "20px 'Segoe UI'";
    ctx.fillStyle = "#ffdd00";
    ctx.fillText(`Ready... ${Math.ceil(bossIntroTimer / 60)}`, canvas.width * 0.5, canvas.height * 0.65);
}

function drawBossBanner() {
    const pulse = 0.65 + Math.sin(frameCount * 0.09) * 0.15;
    ctx.fillStyle = `rgba(255, 54, 54, ${pulse})`;
    roundRect(ctx, canvas.width * 0.5 - 180, 18, 360, 34, 10);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText("WARNING  肌肉男BOSS 来袭", canvas.width * 0.5, 41);
}

function drawVictoryScene() {
    const alpha = Math.min(1, (300 - victoryTimer) / 60);
    ctx.fillStyle = `rgba(10, 5, 20, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (victoryTimer > 240) return;

    const t = 240 - victoryTimer;
    
    const glow = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.4, 50, canvas.width * 0.5, canvas.height * 0.4, 280);
    glow.addColorStop(0, "rgba(255, 215, 0, 0.15)");
    glow.addColorStop(1, "rgba(255, 215, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const heroX = canvas.width * 0.35;
    const heroY = canvas.height * 0.55;
    drawVictoryHero(heroX, heroY);

    const girlX = canvas.width * 0.52;
    const girlY = canvas.height * 0.54;
    drawBlondeGirl(girlX, girlY, t);

    if (t > 30) {
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 42px 'Impact'";
        ctx.textAlign = "center";
        ctx.fillText("MISSION COMPLETE!", canvas.width * 0.5, 80);

        ctx.fillStyle = "#fff";
        ctx.font = "24px 'Segoe UI'";
        ctx.fillText("英雄归来", canvas.width * 0.5, 120);
    }

    if (t > 60) {
        for (let i = 0; i < 5; i++) {
            const hx = canvas.width * 0.5 + Math.sin((t + i * 30) * 0.05) * 80;
            const hy = canvas.height * 0.3 - (t - 60 + i * 10) * 0.8;
            if (hy > 50) {
                ctx.fillStyle = `rgba(255, 105, 180, ${0.6 - (t - 60) / 200})`;
                ctx.font = `${20 + i * 2}px Arial`;
                ctx.fillText("💖", hx, hy);
            }
        }
    }
}

function drawVictoryHero(x, y) {
    const bodyGrad = ctx.createLinearGradient(x, y - 25, x, y + 35);
    bodyGrad.addColorStop(0, "#74d4ff");
    bodyGrad.addColorStop(1, "#1a6ca8");
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, x - 10, y - 10, 20, 32, 5);

    ctx.fillStyle = "#d7f3ff";
    roundRect(ctx, x - 13, y - 8, 6, 8, 2);
    roundRect(ctx, x + 7, y - 8, 6, 8, 2);

    ctx.fillStyle = "#f0c49a";
    ctx.beginPath();
    ctx.arc(x, y - 20, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff4d6d";
    roundRect(ctx, x - 7, y - 25, 14, 4, 2);

    ctx.fillStyle = "#1a263f";
    roundRect(ctx, x - 7, y + 20, 6, 12, 2);
    roundRect(ctx, x + 1, y + 20, 6, 12, 2);

    ctx.fillStyle = "#f0c49a";
    roundRect(ctx, x + 8, y + 2, 18, 5, 2);
}

function drawBlondeGirl(x, y, t) {
    const lean = Math.min(12, t * 0.3);

    const dressGrad = ctx.createLinearGradient(x, y - 15, x, y + 40);
    dressGrad.addColorStop(0, "#ff1493");
    dressGrad.addColorStop(1, "#ff69b4");
    ctx.fillStyle = dressGrad;
    ctx.beginPath();
    ctx.moveTo(x - lean, y);
    ctx.lineTo(x - 12 - lean, y + 35);
    ctx.lineTo(x + 12 - lean, y + 35);
    ctx.lineTo(x - lean, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffb6c1";
    roundRect(ctx, x - 9 - lean, y - 10, 18, 18, 4);

    ctx.fillStyle = "#ffd1a9";
    ctx.beginPath();
    ctx.arc(x - lean, y - 22, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(x - lean - 4, y - 26, 7, 0, Math.PI);
    ctx.arc(x - lean + 4, y - 26, 7, 0, Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x - 10 - lean, y - 22);
    ctx.lineTo(x - 14 - lean, y + 8);
    ctx.lineTo(x - 8 - lean, y + 8);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(x + 10 - lean, y - 22);
    ctx.lineTo(x + 14 - lean, y + 8);
    ctx.lineTo(x + 8 - lean, y + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.fillRect(x - 5 - lean, y - 23, 2, 2);
    ctx.fillRect(x + 3 - lean, y - 23, 2, 2);

    if (t > 80) {
        ctx.fillStyle = "#ff1493";
        ctx.font = "20px Arial";
        ctx.fillText("💋", x - 15 - lean, y - 15);
    }

    ctx.fillStyle = "#ffd1a9";
    roundRect(ctx, x - 18 - lean, y - 2, 15, 4, 2);
}

function drawWeaponIndicator() {
    if (player.weapon === 0 || player.weaponTimer <= 0) return;

    const names = ['', 'SHOTGUN', 'LASER', 'HOMING'];
    const colors = ['', '#ff6b35', '#00f5ff', '#b84dff'];
    
    ctx.fillStyle = colors[player.weapon];
    roundRect(ctx, 20, canvas.height - 50, 120, 30, 8);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(names[player.weapon], 30, canvas.height - 30);

    ctx.font = '12px Arial';
    ctx.fillText(`${Math.ceil(player.weaponTimer / 60)}s`, 30, canvas.height - 14);
}

function roundRect(context, x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    context.beginPath();
    context.moveTo(x + rr, y);
    context.arcTo(x + w, y, x + w, y + h, rr);
    context.arcTo(x + w, y + h, x, y + h, rr);
    context.arcTo(x, y + h, x, y, rr);
    context.arcTo(x, y, x + w, y, rr);
    context.closePath();
    context.fill();
}

function draw() {
    drawWorld();
    drawWeaponIndicator();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (e.code === "KeyJ") shoot();
    if (e.code === "KeyP") togglePause();
});

document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

startBtn.addEventListener("click", startGame);
resumeBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", () => {
    resetGame();
    startGame();
});
pauseBtn.addEventListener("click", togglePause);

if (settlementImage && settlementWrap) {
    settlementImage.addEventListener("error", () => {
        settlementWrap.classList.add("error");
    });

    settlementImage.addEventListener("load", () => {
        settlementWrap.classList.remove("error");
    });
}

resetGame();
gameLoop();
