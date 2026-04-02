const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const miniMap = document.getElementById('miniMap');
const miniCtx = miniMap.getContext('2d');

const hud = {
    day: document.getElementById('dayValue'),
    time: document.getElementById('timeValue'),
    biome: document.getElementById('biomeValue'),
    mined: document.getElementById('minedValue'),
    placed: document.getElementById('placedValue'),
    selected: document.getElementById('selectedLabel'),
    message: document.getElementById('messageBox'),
    hotbar: document.getElementById('hotbar'),
    inventory: document.getElementById('inventoryGrid')
};

const controls = {
    newWorldBtn: document.getElementById('newWorldBtn'),
    saveBtn: document.getElementById('saveBtn'),
    clearSaveBtn: document.getElementById('clearSaveBtn')
};

const WORLD_SIZE = 26;
const SEA_LEVEL = 2;
const MAX_STACK = 9;
const TILE_W = 44;
const TILE_H = 22;
const BLOCK_H = 18;
const STORAGE_KEY = 'sandbox-minecraft-save-v1';

const BLOCKS = {
    grass: { name: '草方块', top: '#79c95c', left: '#4e8c3e', right: '#62ac4b', placeable: true, solid: true },
    dirt: { name: '泥土', top: '#8f643c', left: '#68462a', right: '#785232', placeable: true, solid: true },
    stone: { name: '石头', top: '#a8adb5', left: '#777e88', right: '#8a9099', placeable: true, solid: true },
    sand: { name: '沙子', top: '#e5d38a', left: '#b89d58', right: '#cfb469', placeable: true, solid: true },
    wood: { name: '木头', top: '#b68853', left: '#7f5b33', right: '#94693c', placeable: true, solid: true },
    leaf: { name: '树叶', top: '#4fba5e', left: '#388646', right: '#43a151', placeable: true, solid: true, alpha: 0.96 },
    water: { name: '水', top: '#57b9f3', left: '#2e78c0', right: '#3b90d8', placeable: false, solid: false, alpha: 0.86 },
    bedrock: { name: '基岩', top: '#31353c', left: '#1b1d21', right: '#25282d', placeable: false, solid: true }
};

const HOTBAR_KEYS = ['grass', 'dirt', 'stone', 'wood', 'leaf', 'sand'];

const state = {
    seed: 0,
    world: [],
    hoverTile: null,
    selectedIndex: 1,
    inventory: { grass: 8, dirt: 14, stone: 10, wood: 6, leaf: 4, sand: 8 },
    player: { x: 13, y: 13, bob: 0 },
    stats: { mined: 0, placed: 0 },
    dayTick: 0,
    message: '世界已生成，使用 WASD 移动。',
    messageTimer: 0,
    keys: new Set(),
    moveDelay: 0,
    lastFrame: 0,
    miniPulse: 0,
    autoSaveTimer: 0
};

function mulberry32(seed) {
    return function random() {
        let value = seed += 0x6d2b79f5;
        value = Math.imul(value ^ value >>> 15, value | 1);
        value ^= value + Math.imul(value ^ value >>> 7, value | 61);
        return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
}

function noise2d(x, y, seed) {
    const value = Math.sin((x + seed * 0.013) * 0.61) + Math.cos((y - seed * 0.017) * 0.47) + Math.sin((x + y + seed * 0.009) * 0.31) * 0.8 + Math.cos((x * 1.7 - y + seed * 0.02) * 0.18) * 1.4;
    return value / 4;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getTile(x, y) {
    if (x < 0 || y < 0 || x >= WORLD_SIZE || y >= WORLD_SIZE) {
        return null;
    }
    return state.world[y][x];
}

function topBlock(tile) {
    return tile.stack[tile.stack.length - 1];
}

function getSurfaceHeight(tile) {
    for (let index = tile.stack.length - 1; index >= 0; index -= 1) {
        if (BLOCKS[tile.stack[index]].solid) {
            return index;
        }
    }
    return 0;
}

function getBiomeName(tile) {
    if (!tile) {
        return '未知';
    }
    const biomeMap = {
        water: '水域',
        shore: '沙岸',
        forest: '森林',
        hill: '高地',
        plains: '平原'
    };
    return biomeMap[tile.biome] || '平原';
}

function createBaseStack(height, biome) {
    const stack = ['bedrock'];
    const stoneLayers = Math.max(0, height - 2);

    for (let index = 0; index < stoneLayers; index += 1) {
        stack.push('stone');
    }

    if (height >= 2) {
        stack.push(biome === 'shore' ? 'sand' : 'dirt');
    }

    stack.push(biome === 'shore' ? 'sand' : 'grass');
    return stack;
}

function addWater(stack, height) {
    while (height < SEA_LEVEL) {
        stack.push('water');
        height += 1;
    }
}

function tryPlaceTree(x, y, random) {
    const tile = getTile(x, y);
    if (!tile || tile.biome !== 'forest' || topBlock(tile) !== 'grass' || tile.stack.length > 6) {
        return;
    }

    const trunkHeight = 2 + Math.floor(random() * 2);
    for (let count = 0; count < trunkHeight; count += 1) {
        tile.stack.push('wood');
    }
    tile.stack.push('leaf');

    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
            if (offsetX === 0 && offsetY === 0) {
                continue;
            }
            const neighbor = getTile(x + offsetX, y + offsetY);
            if (!neighbor || topBlock(neighbor) === 'water' || neighbor.stack.length >= MAX_STACK - 1) {
                continue;
            }
            const distance = Math.abs(offsetX) + Math.abs(offsetY);
            if (distance <= 2 && random() > 0.18) {
                neighbor.stack.push('leaf');
            }
        }
    }
}

function ensureSpawnIsClear() {
    const spawn = getTile(state.player.x, state.player.y);
    if (!spawn) {
        return;
    }

    while (topBlock(spawn) === 'water' || topBlock(spawn) === 'leaf') {
        spawn.stack.pop();
    }
}

function generateWorld(seed) {
    state.seed = seed;
    state.world = [];
    state.player.x = Math.floor(WORLD_SIZE / 2);
    state.player.y = Math.floor(WORLD_SIZE / 2);
    const random = mulberry32(seed);

    for (let y = 0; y < WORLD_SIZE; y += 1) {
        const row = [];
        for (let x = 0; x < WORLD_SIZE; x += 1) {
            const heightNoise = noise2d(x, y, seed);
            const moistureNoise = noise2d(x + 17, y - 11, seed * 3);
            const ridgeNoise = noise2d(x - 8, y + 13, seed * 5);
            let height = Math.round(3 + heightNoise * 1.9 + ridgeNoise * 1.25);
            height = clamp(height, 1, 6);

            let biome = 'plains';
            if (height <= SEA_LEVEL - 1) {
                biome = 'water';
            } else if (height <= SEA_LEVEL && moistureNoise < -0.12) {
                biome = 'shore';
            } else if (height >= 5) {
                biome = 'hill';
            } else if (moistureNoise > 0.22) {
                biome = 'forest';
            }

            const baseStack = createBaseStack(height, biome);
            if (biome === 'water') {
                baseStack[baseStack.length - 1] = 'sand';
                addWater(baseStack, height);
            }

            row.push({ stack: baseStack, biome });
        }
        state.world.push(row);
    }

    for (let y = 2; y < WORLD_SIZE - 2; y += 1) {
        for (let x = 2; x < WORLD_SIZE - 2; x += 1) {
            if (random() > 0.91) {
                tryPlaceTree(x, y, random);
            }
        }
    }

    ensureSpawnIsClear();
    state.hoverTile = null;
    state.stats = { mined: 0, placed: 0 };
    state.dayTick = 0;
    state.autoSaveTimer = 0;
    pushMessage('新的像素世界已生成。');
    renderPanels();
}

function serializeState() {
    return {
        seed: state.seed,
        world: state.world,
        inventory: state.inventory,
        player: state.player,
        stats: state.stats,
        dayTick: state.dayTick,
        selectedIndex: state.selectedIndex
    };
}

function loadSavedState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return false;
    }

    try {
        const saved = JSON.parse(raw);
        if (!saved.world || !Array.isArray(saved.world) || saved.world.length !== WORLD_SIZE) {
            return false;
        }
        state.seed = saved.seed;
        state.world = saved.world;
        state.inventory = { ...state.inventory, ...saved.inventory };
        state.player = { ...state.player, ...saved.player };
        state.stats = { ...state.stats, ...saved.stats };
        state.dayTick = saved.dayTick || 0;
        state.selectedIndex = clamp(saved.selectedIndex || 0, 0, HOTBAR_KEYS.length - 1);
        ensureSpawnIsClear();
        pushMessage('已加载本地存档。');
        renderPanels();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

function saveState(manual = false) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
    if (manual) {
        pushMessage('进度已保存到本地。');
    }
}

function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
    pushMessage('本地存档已清空。');
}

function currentBlockKey() {
    return HOTBAR_KEYS[state.selectedIndex];
}

function currentTile() {
    return getTile(state.player.x, state.player.y);
}

function playerSurfaceHeight() {
    return getSurfaceHeight(currentTile());
}

function pushMessage(text) {
    state.message = text;
    state.messageTimer = 3.6;
    hud.message.textContent = text;
}

function canMoveTo(x, y) {
    const tile = getTile(x, y);
    const origin = currentTile();
    if (!tile || topBlock(tile) === 'water') {
        return false;
    }
    const diff = Math.abs(getSurfaceHeight(tile) - getSurfaceHeight(origin));
    return diff <= 2;
}

function attemptMove(dx, dy) {
    if (!dx && !dy) {
        return;
    }

    const targetX = state.player.x + dx;
    const targetY = state.player.y + dy;
    if (canMoveTo(targetX, targetY)) {
        state.player.x = targetX;
        state.player.y = targetY;
        state.player.bob += 0.6;
    }
}

function handleMovement(delta) {
    state.moveDelay -= delta;
    const left = state.keys.has('arrowleft') || state.keys.has('a');
    const right = state.keys.has('arrowright') || state.keys.has('d');
    const up = state.keys.has('arrowup') || state.keys.has('w');
    const down = state.keys.has('arrowdown') || state.keys.has('s');

    let dx = 0;
    let dy = 0;
    if (left) dx -= 1;
    if (right) dx += 1;
    if (up) dy -= 1;
    if (down) dy += 1;

    if (!dx && !dy) {
        return;
    }

    if (state.moveDelay <= 0) {
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
            attemptMove(Math.sign(dx), 0);
        } else if (dy !== 0) {
            attemptMove(0, Math.sign(dy));
        }
        state.moveDelay = 7.5;
    }
}

function isReachable(x, y) {
    const distance = Math.abs(x - state.player.x) + Math.abs(y - state.player.y);
    return distance > 0 && distance <= 2;
}

function mineTile(x, y) {
    const tile = getTile(x, y);
    if (!tile) {
        return;
    }
    if (!isReachable(x, y)) {
        pushMessage('超出可挖掘范围。');
        return;
    }
    const block = topBlock(tile);
    if (block === 'bedrock' || block === 'water') {
        pushMessage('这个方块无法挖掘。');
        return;
    }
    if (tile.stack.length <= 1) {
        return;
    }

    tile.stack.pop();
    state.inventory[block] = (state.inventory[block] || 0) + 1;
    state.stats.mined += 1;
    pushMessage(`获得 ${BLOCKS[block].name}。`);
    renderPanels();
}

function placeTile(x, y) {
    const tile = getTile(x, y);
    if (!tile) {
        return;
    }
    if (!isReachable(x, y)) {
        pushMessage('目标太远，无法放置。');
        return;
    }
    if (x === state.player.x && y === state.player.y) {
        pushMessage('不能把自己埋进去。');
        return;
    }
    if (topBlock(tile) === 'water') {
        pushMessage('水面上暂时不能放置。');
        return;
    }
    if (tile.stack.length >= MAX_STACK) {
        pushMessage('这里已经堆得太高了。');
        return;
    }

    const block = currentBlockKey();
    if ((state.inventory[block] || 0) <= 0) {
        pushMessage(`${BLOCKS[block].name} 数量不足。`);
        return;
    }

    tile.stack.push(block);
    state.inventory[block] -= 1;
    state.stats.placed += 1;
    pushMessage(`放置 ${BLOCKS[block].name}。`);
    renderPanels();
}

function getCamera() {
    const surface = playerSurfaceHeight();
    return {
        x: canvas.width / 2 - (state.player.x - state.player.y) * TILE_W / 2,
        y: canvas.height * 0.24 - (state.player.x + state.player.y) * TILE_H / 2 + surface * BLOCK_H
    };
}

function tileToScreen(x, y, z, camera) {
    return {
        x: camera.x + (x - y) * TILE_W / 2,
        y: camera.y + (x + y) * TILE_H / 2 - z * BLOCK_H
    };
}

function shade(hex, factor) {
    const value = hex.replace('#', '');
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    const mix = (channel) => clamp(Math.round(channel * factor), 0, 255).toString(16).padStart(2, '0');
    return `#${mix(red)}${mix(green)}${mix(blue)}`;
}

function drawDiamondFace(centerX, topY, fillStyle, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX + TILE_W / 2, topY + TILE_H / 2);
    ctx.lineTo(centerX, topY + TILE_H);
    ctx.lineTo(centerX - TILE_W / 2, topY + TILE_H / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawBlock(x, y, z, blockKey, camera) {
    const block = BLOCKS[blockKey];
    const { x: centerX, y: topY } = tileToScreen(x, y, z, camera);
    const alpha = block.alpha || 1;

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = block.left;
    ctx.beginPath();
    ctx.moveTo(centerX - TILE_W / 2, topY + TILE_H / 2);
    ctx.lineTo(centerX, topY + TILE_H);
    ctx.lineTo(centerX, topY + TILE_H + BLOCK_H);
    ctx.lineTo(centerX - TILE_W / 2, topY + TILE_H / 2 + BLOCK_H);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = block.right;
    ctx.beginPath();
    ctx.moveTo(centerX + TILE_W / 2, topY + TILE_H / 2);
    ctx.lineTo(centerX, topY + TILE_H);
    ctx.lineTo(centerX, topY + TILE_H + BLOCK_H);
    ctx.lineTo(centerX + TILE_W / 2, topY + TILE_H / 2 + BLOCK_H);
    ctx.closePath();
    ctx.fill();

    drawDiamondFace(centerX, topY, block.top, alpha);

    ctx.strokeStyle = shade(block.top, 0.75);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX, topY);
    ctx.lineTo(centerX + TILE_W / 2, topY + TILE_H / 2);
    ctx.lineTo(centerX, topY + TILE_H);
    ctx.lineTo(centerX - TILE_W / 2, topY + TILE_H / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}

function drawSky() {
    const cycle = (Math.sin(state.dayTick) + 1) / 2;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, cycle > 0.5 ? '#8fd9ff' : '#16253a');
    gradient.addColorStop(0.55, cycle > 0.5 ? '#d6f0ff' : '#314762');
    gradient.addColorStop(1, cycle > 0.5 ? '#d1b77a' : '#51606f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const celestialX = canvas.width * (0.15 + cycle * 0.7);
    const celestialY = canvas.height * (0.18 + (1 - cycle) * 0.1);
    ctx.fillStyle = cycle > 0.45 ? 'rgba(255, 245, 190, 0.95)' : 'rgba(230, 240, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(celestialX, celestialY, 24, 0, Math.PI * 2);
    ctx.fill();
}

function renderWorld() {
    const camera = getCamera();
    const renderList = [];

    for (let y = 0; y < WORLD_SIZE; y += 1) {
        for (let x = 0; x < WORLD_SIZE; x += 1) {
            renderList.push({ x, y, depth: x + y });
        }
    }

    renderList.sort((a, b) => a.depth - b.depth || a.x - b.x);

    for (const item of renderList) {
        const tile = getTile(item.x, item.y);
        for (let z = 0; z < tile.stack.length; z += 1) {
            drawBlock(item.x, item.y, z, tile.stack[z], camera);
        }
    }

    if (state.hoverTile) {
        const hover = getTile(state.hoverTile.x, state.hoverTile.y);
        const hoverZ = hover.stack.length - 1;
        const { x, y } = tileToScreen(state.hoverTile.x, state.hoverTile.y, hoverZ, camera);
        drawDiamondFace(x, y - 2, isReachable(state.hoverTile.x, state.hoverTile.y) ? 'rgba(125, 211, 92, 0.35)' : 'rgba(231, 88, 73, 0.35)');
    }

    drawPlayer(camera);
}

function drawPlayer(camera) {
    const z = playerSurfaceHeight() + 1;
    const { x: centerX, y: topY } = tileToScreen(state.player.x, state.player.y, z, camera);
    const bob = Math.sin(state.player.bob) * 3;

    ctx.fillStyle = '#36281e';
    ctx.fillRect(centerX - 5, topY + TILE_H / 2 - 12 + bob, 10, 16);
    ctx.fillStyle = '#5f9df5';
    ctx.fillRect(centerX - 9, topY + TILE_H / 2 - 6 + bob, 18, 16);
    ctx.fillStyle = '#f6c89e';
    ctx.fillRect(centerX - 7, topY + TILE_H / 2 - 22 + bob, 14, 14);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(centerX, topY + TILE_H + 8, 12, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
}

function getTimeLabel() {
    const cycle = (state.dayTick % (Math.PI * 2)) / (Math.PI * 2);
    if (cycle < 0.18) return '清晨';
    if (cycle < 0.42) return '白天';
    if (cycle < 0.62) return '黄昏';
    if (cycle < 0.84) return '夜晚';
    return '黎明';
}

function getDayNumber() {
    return Math.floor(state.dayTick / (Math.PI * 2)) + 1;
}

function pointInDiamond(mouseX, mouseY, centerX, topY) {
    const normalizedX = Math.abs(mouseX - centerX) / (TILE_W / 2);
    const normalizedY = Math.abs(mouseY - (topY + TILE_H / 2)) / (TILE_H / 2);
    return normalizedX + normalizedY <= 1;
}

function pickTile(mouseX, mouseY) {
    const camera = getCamera();
    const list = [];

    for (let y = 0; y < WORLD_SIZE; y += 1) {
        for (let x = 0; x < WORLD_SIZE; x += 1) {
            const tile = getTile(x, y);
            list.push({ x, y, depth: x + y, z: tile.stack.length - 1 });
        }
    }

    list.sort((a, b) => b.depth - a.depth || b.z - a.z);

    for (const item of list) {
        const { x, y } = tileToScreen(item.x, item.y, item.z, camera);
        if (pointInDiamond(mouseX, mouseY, x, y)) {
            return { x: item.x, y: item.y };
        }
    }
    return null;
}

function drawMiniMap() {
    const cellSize = miniMap.width / WORLD_SIZE;
    miniCtx.clearRect(0, 0, miniMap.width, miniMap.height);

    for (let y = 0; y < WORLD_SIZE; y += 1) {
        for (let x = 0; x < WORLD_SIZE; x += 1) {
            const tile = getTile(x, y);
            const block = BLOCKS[topBlock(tile)];
            miniCtx.fillStyle = block.top;
            miniCtx.fillRect(x * cellSize, y * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
        }
    }

    state.miniPulse += 0.08;
    miniCtx.fillStyle = Math.sin(state.miniPulse) > 0 ? '#ffffff' : '#ff7857';
    miniCtx.fillRect(state.player.x * cellSize, state.player.y * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
}

function renderPanels() {
    hud.day.textContent = String(getDayNumber());
    hud.time.textContent = getTimeLabel();
    hud.biome.textContent = getBiomeName(currentTile());
    hud.mined.textContent = String(state.stats.mined);
    hud.placed.textContent = String(state.stats.placed);
    hud.selected.textContent = `当前：${BLOCKS[currentBlockKey()].name}`;

    hud.hotbar.innerHTML = HOTBAR_KEYS.map((key, index) => {
        const activeClass = index === state.selectedIndex ? 'slot active' : 'slot';
        return `
            <button class="${activeClass}" data-index="${index}" type="button">
                <div class="slot-top">
                    <span class="swatch" style="background:${BLOCKS[key].top}"></span>
                    <span class="slot-key">${index + 1}</span>
                </div>
                <span class="slot-name">${BLOCKS[key].name}</span>
                <span class="slot-count">数量 ${state.inventory[key] || 0}</span>
            </button>
        `;
    }).join('');

    hud.inventory.innerHTML = Object.entries(state.inventory).map(([key, count]) => `
        <div class="slot" role="listitem">
            <div class="slot-top">
                <span class="swatch" style="background:${BLOCKS[key].top}"></span>
                <span class="slot-key">库存</span>
            </div>
            <span class="slot-name">${BLOCKS[key].name}</span>
            <span class="slot-count">${count}</span>
        </div>
    `).join('');

    hud.hotbar.querySelectorAll('[data-index]').forEach((button) => {
        button.addEventListener('click', () => {
            state.selectedIndex = Number(button.dataset.index);
            renderPanels();
        });
    });
}

function update(delta) {
    state.dayTick += delta * 0.018;
    state.autoSaveTimer += delta;
    if (state.autoSaveTimer >= 600) {
        saveState();
        state.autoSaveTimer = 0;
    }

    handleMovement(delta);
    if (state.messageTimer > 0) {
        state.messageTimer -= delta / 60;
        if (state.messageTimer <= 0) {
            hud.message.textContent = '左键挖掘，右键放置，F 保存。';
        }
    }

    renderPanels();
    drawMiniMap();
}

function render() {
    drawSky();
    renderWorld();
}

function frame(timestamp) {
    if (!state.lastFrame) {
        state.lastFrame = timestamp;
    }
    const delta = (timestamp - state.lastFrame) / (1000 / 60);
    state.lastFrame = timestamp;
    update(delta);
    render();
    requestAnimationFrame(frame);
}

function seedFromTime() {
    return Math.floor(Date.now() % 10000000);
}

function handlePointer(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    state.hoverTile = pickTile(mouseX, mouseY);
}

function bindEvents() {
    window.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
            state.keys.add(key);
            event.preventDefault();
        }

        if (/^[1-6]$/.test(key)) {
            state.selectedIndex = Number(key) - 1;
            renderPanels();
        }

        if (key === 'r') {
            generateWorld(seedFromTime());
        }

        if (key === 'f') {
            saveState(true);
        }
    });

    window.addEventListener('keyup', (event) => {
        state.keys.delete(event.key.toLowerCase());
    });

    canvas.addEventListener('mousemove', handlePointer);
    canvas.addEventListener('mouseleave', () => {
        state.hoverTile = null;
    });
    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
    canvas.addEventListener('mousedown', (event) => {
        handlePointer(event);
        if (!state.hoverTile) {
            return;
        }
        if (event.button === 0) {
            mineTile(state.hoverTile.x, state.hoverTile.y);
        } else if (event.button === 2) {
            placeTile(state.hoverTile.x, state.hoverTile.y);
        }
    });

    controls.newWorldBtn.addEventListener('click', () => {
        generateWorld(seedFromTime());
    });
    controls.saveBtn.addEventListener('click', () => {
        saveState(true);
    });
    controls.clearSaveBtn.addEventListener('click', () => {
        clearSave();
    });
    window.addEventListener('beforeunload', () => {
        saveState();
    });
}

function init() {
    bindEvents();
    if (!loadSavedState()) {
        generateWorld(seedFromTime());
    }
    renderPanels();
    drawMiniMap();
    requestAnimationFrame(frame);
}

init();

// 移动端虚拟控制器
(function initMobileControls() {
    // 方向键
    document.querySelectorAll('.ctrl-btn[data-key]').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            state.keys.add(btn.dataset.key);
        }, { passive: false });
        btn.addEventListener('touchend', function(e) {
            e.preventDefault();
            state.keys.delete(btn.dataset.key);
        }, { passive: false });
        btn.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            state.keys.delete(btn.dataset.key);
        }, { passive: false });
    });

    // 挖掘/放置按钮 - 对当前面朝方向的相邻方块操作
    document.querySelectorAll('.ctrl-btn[data-action]').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!state.hoverTile) {
                // 没有 hover tile（移动端无鼠标）则对角色前方方块操作
                var px = Math.round(state.player.x);
                var py = Math.round(state.player.y);
                // 默认操作角色脚下或前方
                var targets = [[px,py-1],[px+1,py],[px-1,py],[px,py+1],[px,py]];
                for (var i = 0; i < targets.length; i++) {
                    var tx = targets[i][0], ty = targets[i][1];
                    var tile = getTile(tx, ty);
                    if (!tile) continue;
                    if (btn.dataset.action === 'mine' && tile.stack.length > 1 && topBlock(tile) !== 'bedrock' && topBlock(tile) !== 'water') {
                        mineTile(tx, ty);
                        break;
                    }
                    if (btn.dataset.action === 'place' && tile.stack.length < MAX_STACK && topBlock(tile) !== 'water') {
                        placeTile(tx, ty);
                        break;
                    }
                }
            } else {
                if (btn.dataset.action === 'mine') mineTile(state.hoverTile.x, state.hoverTile.y);
                else placeTile(state.hoverTile.x, state.hoverTile.y);
            }
        }, { passive: false });
    });

    // 触摸画布设置 hoverTile
    var canvasEl = document.getElementById('gameCanvas');
    canvasEl.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var t = e.touches[0];
        var rect = canvasEl.getBoundingClientRect();
        var fakeEvent = { clientX: t.clientX, clientY: t.clientY, offsetX: t.clientX - rect.left, offsetY: t.clientY - rect.top };
        handlePointer(fakeEvent);
    }, { passive: false });

    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
})();