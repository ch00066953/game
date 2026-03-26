// ==================== 石器时代 - 地图行走模块 ====================

let mapCtx, mapCanvas;
let mapAnimId;
let currentTiles = null;
let currentMapDef = null;
let keysDown = {};
let moveCD = 0;
let playerFacing = 'down';
let nearPoi = null;
const TILE_SIZE = 32;

function initMainUI() {
    mapCanvas = $('mapCanvas');
    mapCtx = mapCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    loadAreaMap(game.currentArea);
    updateTopBar();
    bindMainButtons();
    startMapLoop();
}

function resizeCanvas() {
    const area = $('mapArea');
    if (!area || !mapCanvas) return;
    mapCanvas.width = area.clientWidth;
    mapCanvas.height = area.clientHeight;
}

function loadAreaMap(areaIdx, fromExit) {
    game.currentArea = areaIdx;
    const area = AREAS[areaIdx];
    currentMapDef = AREA_MAPS[area.id];
    currentTiles = generateAreaTiles(area.id);

    if (fromExit !== undefined) {
        const entryPoi = currentMapDef.pois.find(p => p.type === 'exit' && p.target === fromExit);
        if (entryPoi) {
            let placed = false;
            for (const [dy, dx] of [[0,1],[0,-1],[1,0],[-1,0]]) {
                const ny = entryPoi.y + dy, nx = entryPoi.x + dx;
                if (ny >= 0 && ny < currentMapDef.height && nx >= 0 && nx < currentMapDef.width && TILE_WALKABLE[currentTiles[ny][nx]]) {
                    game.playerPos = { x: nx, y: ny }; placed = true; break;
                }
            }
            if (!placed) game.playerPos = { ...currentMapDef.playerStart };
        } else {
            game.playerPos = { ...currentMapDef.playerStart };
        }
    } else if (!fromExit && fromExit !== 0) {
        game.playerPos = { ...currentMapDef.playerStart };
    }

    $('areaName').textContent = area.name;
    updateTopBar();
    toast(`来到了 ${area.name}`);
}

function startMapLoop() {
    cancelAnimationFrame(mapAnimId);
    let tick = 0;
    function loop() {
        if (mapActive) { handleMovement(); detectNearPoi(); }
        renderMap(tick);
        tick++;
        mapAnimId = requestAnimationFrame(loop);
    }
    loop();
}

// ===== 键盘 =====
document.addEventListener('keydown', e => {
    keysDown[e.key] = true;
    if ((e.key === ' ' || e.key === 'Enter') && mapActive && nearPoi) {
        e.preventDefault();
        interactWithPoi(nearPoi);
    }
});
document.addEventListener('keyup', e => { keysDown[e.key] = false; });

function handleMovement() {
    if (moveCD > 0) { moveCD--; return; }
    let dx = 0, dy = 0;
    if (keysDown['ArrowUp'] || keysDown['w'] || keysDown['W']) { dy = -1; playerFacing = 'up'; }
    else if (keysDown['ArrowDown'] || keysDown['s'] || keysDown['S']) { dy = 1; playerFacing = 'down'; }
    else if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A']) { dx = -1; playerFacing = 'left'; }
    else if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D']) { dx = 1; playerFacing = 'right'; }
    if (dx === 0 && dy === 0) return;

    const nx = game.playerPos.x + dx, ny = game.playerPos.y + dy;
    if (nx < 0 || ny < 0 || nx >= currentMapDef.width || ny >= currentMapDef.height) return;
    if (!TILE_WALKABLE[currentTiles[ny][nx]]) return;

    game.playerPos.x = nx;
    game.playerPos.y = ny;
    moveCD = 5;

    const rate = TILE_ENCOUNTER_RATE[currentTiles[ny][nx]] || 0;
    if (rate > 0 && Math.random() < rate) triggerRandomBattle();
}

function triggerRandomBattle() {
    mapActive = false;
    const area = AREAS[game.currentArea];
    const eName = area.enemies[Math.floor(Math.random() * area.enemies.length)];
    const t = ENEMY_DATA[eName];
    const lv = Math.max(1, t.level + Math.floor(Math.random() * 3) - 1);
    const sc = 1 + (lv - t.level) * 0.08;
    const enemy = {
        name: eName, icon: t.icon, level: lv,
        hp: Math.floor(t.hp * sc), maxHp: Math.floor(t.hp * sc),
        atk: Math.floor(t.atk * sc), def: Math.floor(t.def * sc), spd: Math.floor(t.spd * sc),
        exp: Math.floor(t.exp * sc), gold: Math.floor(t.gold * sc),
        catchRate: t.catchRate, skills: [...t.skills],
    };
    showBattleTransition(() => startBattle(enemy));
}

function showBattleTransition(callback) {
    const overlay = document.createElement('div');
    overlay.className = 'battle-transition';
    document.body.appendChild(overlay);
    let flashes = 0;
    const interval = setInterval(() => {
        overlay.style.opacity = flashes % 2 === 0 ? '1' : '0';
        flashes++;
        if (flashes >= 6) {
            clearInterval(interval);
            overlay.style.opacity = '1';
            setTimeout(() => {
                callback();
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }, 150);
        }
    }, 80);
}

function detectNearPoi() {
    const px = game.playerPos.x, py = game.playerPos.y;
    nearPoi = null;
    for (const poi of currentMapDef.pois) {
        if (Math.abs(poi.x - px) + Math.abs(poi.y - py) <= 1) { nearPoi = poi; break; }
    }
    const prompt = $('interactPrompt');
    if (nearPoi) { prompt.textContent = `按 空格 → ${nearPoi.name}`; prompt.style.display = ''; }
    else { prompt.style.display = 'none'; }
}

function interactWithPoi(poi) {
    switch (poi.type) {
        case 'shop': renderShopModal(AREAS[game.currentArea].id); showModal('shop'); break;
        case 'heal':
            game.player.hp = game.player.maxHp; game.player.mp = game.player.maxMp;
            game.pets.forEach(p => { p.hp = p.maxHp; p.mp = p.maxMp; });
            updateTopBar(); toast(poi.msg || '已完全恢复！'); break;
        case 'save': saveGame(); break;
        case 'exit': {
            const tgt = AREAS[poi.target];
            if (game.player.level < tgt.levelReq) { toast(`需要 Lv.${tgt.levelReq} 才能前往 ${tgt.name}！`); }
            else { loadAreaMap(poi.target, game.currentArea); }
            break;
        }
        case 'npc': toast(poi.msg || '……'); break;
    }
}

// ===== 地图渲染 =====
function renderMap(tick) {
    const ctx = mapCtx;
    const cw = mapCanvas.width, ch = mapCanvas.height;
    if (cw === 0 || ch === 0) return;
    ctx.clearRect(0, 0, cw, ch);
    if (!currentTiles || !currentMapDef) return;

    const px = game.playerPos.x, py = game.playerPos.y;
    const camX = px * TILE_SIZE + TILE_SIZE / 2 - cw / 2;
    const camY = py * TILE_SIZE + TILE_SIZE / 2 - ch / 2;
    const stX = Math.max(0, Math.floor(camX / TILE_SIZE));
    const stY = Math.max(0, Math.floor(camY / TILE_SIZE));
    const edX = Math.min(currentMapDef.width - 1, Math.ceil((camX + cw) / TILE_SIZE));
    const edY = Math.min(currentMapDef.height - 1, Math.ceil((camY + ch) / TILE_SIZE));

    const aId = AREAS[game.currentArea].id;
    ctx.fillStyle = aId === 'desert' ? '#B8963A' : aId === 'volcano' ? '#3D1A00' : aId === 'ice' ? '#8BAFC0' : '#1A3A00';
    ctx.fillRect(0, 0, cw, ch);

    for (let ty = stY; ty <= edY; ty++) {
        for (let tx = stX; tx <= edX; tx++) {
            const tile = currentTiles[ty][tx];
            const sx = tx * TILE_SIZE - camX, sy = ty * TILE_SIZE - camY;
            ctx.fillStyle = TILE_COLORS[tile] || '#666';
            ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(0,0,0,0.06)';
            ctx.strokeRect(sx, sy, TILE_SIZE, TILE_SIZE);

            if (tile === TILE.WATER) {
                ctx.font = '20px serif';
                ctx.globalAlpha = 0.5 + Math.sin(tick * 0.05 + tx + ty) * 0.2;
                ctx.fillText('〰️', sx + 4, sy + 22);
                ctx.globalAlpha = 1;
            } else if (tile === TILE.TREE) {
                ctx.font = '22px serif'; ctx.fillText('🌳', sx + 4, sy + 24);
            } else if (tile === TILE.WALL) {
                ctx.font = '20px serif'; ctx.fillText('🪨', sx + 4, sy + 22);
            } else if (tile === TILE.LAVA) {
                ctx.font = '20px serif';
                ctx.globalAlpha = 0.7 + Math.sin(tick * 0.08 + tx * 3) * 0.3;
                ctx.fillText('🔥', sx + 4, sy + 22);
                ctx.globalAlpha = 1;
            } else if (tile === TILE.TALLGRASS) {
                ctx.font = '14px serif'; ctx.globalAlpha = 0.6;
                const sway = Math.sin(tick * 0.04 + tx * 2 + ty) * 2;
                ctx.fillText('🌿', sx + 2 + sway, sy + 16);
                ctx.fillText('🌿', sx + 14 + sway, sy + 28);
                ctx.globalAlpha = 1;
            } else if (tile === TILE.SNOW && (tx + ty) % 5 === 0) {
                ctx.font = '12px serif'; ctx.globalAlpha = 0.4;
                ctx.fillText('❄️', sx + 8, sy + 20);
                ctx.globalAlpha = 1;
            }
        }
    }

    // POI
    for (const poi of currentMapDef.pois) {
        const sx = poi.x * TILE_SIZE - camX, sy = poi.y * TILE_SIZE - camY;
        if (sx < -TILE_SIZE || sy < -TILE_SIZE || sx > cw + TILE_SIZE || sy > ch + TILE_SIZE) continue;
        ctx.fillStyle = 'rgba(255,215,0,0.25)';
        ctx.beginPath();
        ctx.arc(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2, TILE_SIZE / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '24px serif'; ctx.fillText(poi.icon, sx + 3, sy + 26);
        const dist = Math.abs(poi.x - px) + Math.abs(poi.y - py);
        if (dist <= 3) {
            ctx.font = '11px "Microsoft YaHei", sans-serif';
            ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
            ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
            ctx.fillText(poi.name, sx + TILE_SIZE / 2, sy - 4);
            ctx.shadowBlur = 0; ctx.textAlign = 'left'; ctx.fillStyle = '#000';
        }
    }

    // 角色
    const psx = px * TILE_SIZE - camX, psy = py * TILE_SIZE - camY;
    const bobY = Math.sin(tick * 0.1) * 2;
    drawPixelChar(ctx, psx, psy - 4 + bobY, TILE_SIZE, game.player.class, playerFacing, keysDown['ArrowUp'] || keysDown['ArrowDown'] || keysDown['ArrowLeft'] || keysDown['ArrowRight'] || keysDown['w'] || keysDown['s'] || keysDown['a'] || keysDown['d'] ? tick : 0);

    // 方向指示
    ctx.fillStyle = 'rgba(255,255,0,0.6)';
    const cx = psx + TILE_SIZE / 2, cy = psy + TILE_SIZE / 2 + bobY;
    ctx.beginPath();
    if (playerFacing === 'up') { ctx.moveTo(cx, cy - 16); ctx.lineTo(cx - 4, cy - 12); ctx.lineTo(cx + 4, cy - 12); }
    else if (playerFacing === 'down') { ctx.moveTo(cx, cy + 16); ctx.lineTo(cx - 4, cy + 12); ctx.lineTo(cx + 4, cy + 12); }
    else if (playerFacing === 'left') { ctx.moveTo(cx - 16, cy); ctx.lineTo(cx - 12, cy - 4); ctx.lineTo(cx - 12, cy + 4); }
    else { ctx.moveTo(cx + 16, cy); ctx.lineTo(cx + 12, cy - 4); ctx.lineTo(cx + 12, cy + 4); }
    ctx.fill();

    // 宠物跟随
    const activePet = game.pets.find(p => p.active);
    if (activePet) {
        let pdx = 0, pdy = 0;
        if (playerFacing === 'up') pdy = 1; else if (playerFacing === 'down') pdy = -1;
        else if (playerFacing === 'left') pdx = 1; else pdx = -1;
        const petX = psx + pdx * TILE_SIZE * 0.6;
        const petY = psy + pdy * TILE_SIZE * 0.6 + bobY;
        ctx.save();
        ctx.translate(petX, petY);
        drawPixelEnemy(ctx, activePet.name, TILE_SIZE * 0.8, tick);
        ctx.restore();
    }

    // 导航箭头
    const exitPoi = currentMapDef.pois.filter(p => p.type === 'exit');
    if (exitPoi.length > 0) {
        let nearest = exitPoi[0], minDist = Infinity;
        exitPoi.forEach(ep => {
            const d = Math.abs(ep.x - px) + Math.abs(ep.y - py);
            if (d < minDist) { minDist = d; nearest = ep; }
        });
        if (minDist > 5) {
            const angle = Math.atan2(nearest.y - py, nearest.x - px);
            const arrowDist = 60;
            const ax = cw / 2 + Math.cos(angle) * arrowDist;
            const ay = ch / 2 + Math.sin(angle) * arrowDist;
            ctx.save();
            ctx.globalAlpha = 0.4 + Math.sin(tick * 0.08) * 0.2;
            ctx.translate(ax, ay);
            ctx.rotate(angle);
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(12, 0);
            ctx.lineTo(-4, -6);
            ctx.lineTo(-4, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    renderMinimap(ctx, cw, ch, tick, px, py);
}

function renderMinimap(ctx, cw, ch, tick, px, py) {
    const sc = 3;
    const mmW = currentMapDef.width * sc, mmH = currentMapDef.height * sc;
    const mmX = cw - mmW - 8, mmY = 8;
    const areaLabel = AREAS[game.currentArea].name;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const labelW = ctx.measureText(areaLabel).width + 8;
    ctx.fillRect(mmX + mmW + 2 - labelW - 2, mmY - 14, labelW + 4, 13);
    ctx.fillStyle = '#FFD700';
    ctx.fillText(areaLabel, mmX + mmW + 2, mmY - 4);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
    for (let ty = 0; ty < currentMapDef.height; ty++)
        for (let tx = 0; tx < currentMapDef.width; tx++) {
            ctx.fillStyle = TILE_COLORS[currentTiles[ty][tx]] || '#666';
            ctx.fillRect(mmX + tx * sc, mmY + ty * sc, sc, sc);
        }
    ctx.fillStyle = '#FFD700';
    for (const poi of currentMapDef.pois)
        ctx.fillRect(mmX + poi.x * sc - 1, mmY + poi.y * sc - 1, sc + 1, sc + 1);
    const blink = Math.floor(tick / 10) % 3;
    ctx.fillStyle = blink === 0 ? '#FF0000' : blink === 1 ? '#FFFFFF' : '#FF6666';
    ctx.fillRect(mmX + px * sc - 1, mmY + py * sc - 1, sc + 2, sc + 2);
}
