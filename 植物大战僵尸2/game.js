const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const levelValueEl = document.getElementById("levelValue");
const sunValueEl = document.getElementById("sunValue");
const waveValueEl = document.getElementById("waveValue");
const killValueEl = document.getElementById("killValue");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");
const shovelBtn = document.getElementById("shovelBtn");
const soundBtn = document.getElementById("soundBtn");
const cardPeaBtn = document.getElementById("cardPea");
const cardSunflowerBtn = document.getElementById("cardSunflower");
const cardWallnutBtn = document.getElementById("cardWallnut");
const cardRepeaterBtn = document.getElementById("cardRepeater");
const cardIcepeaBtn = document.getElementById("cardIcepea");
const cardLilyBtn = document.getElementById("cardLily");
const overlay = document.getElementById("overlay");
const boardWrap = canvas.parentElement;
const cardPickerEl = document.getElementById("cardPicker");
const pickerHintEl = document.getElementById("pickerHint");
const pickerListEl = document.getElementById("pickerList");
const startLevelBtn = document.getElementById("startLevelBtn");

const rows = 5;
const cols = 9;
const cellW = canvas.width / cols;
const cellH = canvas.height / rows;

const PLANT_CONFIG = {
  pea: { cost: 100, hp: 100, shootGap: 950, shotCount: 1, dmg: 34, minLevel: 1 },
  sunflower: { cost: 50, hp: 90, shootGap: 0, shotCount: 0, dmg: 0, sunGap: 7600, minLevel: 1 },
  wallnut: { cost: 75, hp: 520, shootGap: 0, shotCount: 0, dmg: 0, minLevel: 1 },
  repeater: { cost: 175, hp: 120, shootGap: 900, shotCount: 2, dmg: 30, minLevel: 2 },
  icepea: { cost: 125, hp: 100, shootGap: 980, shotCount: 1, dmg: 24, slowMs: 1700, minLevel: 3 },
  lily: { cost: 25, hp: 140, shootGap: 0, shotCount: 0, dmg: 0, minLevel: 3 },
};

const ADVANCED_ZOMBIE_HP_BOOST = {
  cone: 18,
  bucket: 30,
  runner: 14,
  armor: 42,
};

const ZOMBIE_TYPES = [
  { kind: "normal", hp: 130, speed: 0.56, color: "#7d887b", minLevel: 1 },
  { kind: "cone", hp: 200, speed: 0.48, color: "#737f72", minLevel: 2 },
  { kind: "bucket", hp: 320, speed: 0.4, color: "#687568", minLevel: 3 },
  { kind: "runner", hp: 96, speed: 0.92, color: "#60706a", minLevel: 4 },
  { kind: "armor", hp: 460, speed: 0.34, color: "#576157", minLevel: 5 },
];

const LEVELS = [
  { zombiesToWin: 9, spawnGapBase: 2850, spawnGapFloor: 1700, waveKills: 6, ambientSunGap: 3900, waterRows: [], terrain: "lawn" },
  { zombiesToWin: 12, spawnGapBase: 2750, spawnGapFloor: 1550, waveKills: 6, ambientSunGap: 4000, waterRows: [], terrain: "lawn" },
  { zombiesToWin: 14, spawnGapBase: 2650, spawnGapFloor: 1450, waveKills: 7, ambientSunGap: 4100, waterRows: [1, 2], terrain: "pool" },
  { zombiesToWin: 16, spawnGapBase: 2550, spawnGapFloor: 1380, waveKills: 8, ambientSunGap: 4200, waterRows: [1, 2], terrain: "pool" },
  { zombiesToWin: 18, spawnGapBase: 2450, spawnGapFloor: 1300, waveKills: 9, ambientSunGap: 4300, waterRows: [1, 2], terrain: "pool" },
  { zombiesToWin: 20, spawnGapBase: 2380, spawnGapFloor: 1220, waveKills: 9, ambientSunGap: 4400, waterRows: [], terrain: "roof" },
];

const CARD_META = {
  pea: { label: "豌豆射手", cost: 100 },
  sunflower: { label: "向日葵", cost: 50 },
  wallnut: { label: "坚果墙", cost: 75 },
  repeater: { label: "双发射手", cost: 175 },
  icepea: { label: "寒冰射手", cost: 125 },
  lily: { label: "睡莲", cost: 25 },
};

const state = {
  sun: 150,
  kills: 0,
  level: 1,
  wave: 1,
  running: true,
  paused: false,
  inCardPick: false,
  losing: false,
  gameEnded: false,
  endText: "",
  selectedPlant: "pea",
  draggingPlant: "",
  shovelMode: false,
  loseTimer: 0,
  soundOn: true,
  plants: [],
  lilyPads: [],
  peas: [],
  suns: [],
  zombies: [],
  spawnTimer: 0,
  sunTimer: 0,
  zombiesSpawned: 0,
  zombiesToWin: 24,
};

const cardMap = {
  pea: cardPeaBtn,
  sunflower: cardSunflowerBtn,
  wallnut: cardWallnutBtn,
  repeater: cardRepeaterBtn,
  icepea: cardIcepeaBtn,
  lily: cardLilyBtn,
};

const unlockedCardsByLevel = {
  pea: 1,
  sunflower: 1,
  wallnut: 1,
  repeater: 2,
  icepea: 3,
  lily: 3,
};

const defaultDeckByLevel = {
  1: ["pea", "sunflower", "wallnut"],
  2: ["pea", "sunflower", "wallnut", "repeater"],
  3: ["pea", "sunflower", "wallnut", "repeater", "icepea", "lily"],
  4: ["pea", "sunflower", "wallnut", "repeater", "icepea", "lily"],
  5: ["pea", "sunflower", "wallnut", "repeater", "icepea", "lily"],
  6: ["pea", "sunflower", "wallnut", "repeater", "icepea"],
};

let activeDeck = ["pea", "sunflower", "wallnut"];

let audioCtx = null;

function beep(freq, duration, volume) {
  if (!state.soundOn) {
    return;
  }
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function makePlant(row, col, type) {
  const cfg = PLANT_CONFIG[type];
  return {
    row,
    col,
    type,
    hp: cfg.hp,
    hpMax: cfg.hp,
    shootTimer: 0,
    sunTimer: 0,
  };
}

function getLevelConfig() {
  return LEVELS[Math.min(state.level - 1, LEVELS.length - 1)];
}

function isWaterRow(row) {
  return getLevelConfig().waterRows.includes(row);
}

function pickZombieType() {
  const available = ZOMBIE_TYPES.filter((z) => z.minLevel <= state.level);
  const roll = Math.random();
  if (available.length === 1) {
    return available[0];
  }
  if (state.level <= 2) {
    return roll < 0.75 ? available[0] : available[1];
  }
  if (state.level === 3) {
    if (roll < 0.58) {
      return available[0];
    }
    if (roll < 0.86) {
      return available[1];
    }
    return available[2];
  }
  if (state.level === 4) {
    if (roll < 0.42) {
      return available[0];
    }
    if (roll < 0.68) {
      return available[1];
    }
    if (roll < 0.9) {
      return available[2];
    }
    return available[3];
  }

  if (roll < 0.33) {
    return available[0];
  }
  if (roll < 0.54) {
    return available[1];
  }
  if (roll < 0.75) {
    return available[2];
  }
  if (roll < 0.89) {
    return available[3];
  }
  return available[4];
}

function makeZombie(row) {
  const t = pickZombieType();
  const extraLevel = Math.max(0, state.level - t.minLevel);
  const extraHp = (ADVANCED_ZOMBIE_HP_BOOST[t.kind] || 0) * extraLevel;
  const hp = t.hp + state.wave * 12 + extraHp;
  return {
    kind: t.kind,
    row,
    x: canvas.width + 20,
    y: row * cellH + 10,
    w: cellW * 0.72,
    h: cellH - 20,
    speed: t.speed + Math.random() * 0.12 + state.wave * 0.02,
    color: t.color,
    hp,
    hpMax: hp,
    baseSpeed: t.speed,
    speedFactor: 1,
    slowTimer: 0,
    attackTimer: 0,
    isAttacking: false,
  };
}

function makePea(x, y, row) {
  return { x, y, row, r: 6, speed: 4.6, dmg: 34, isIce: false };
}

function makeSun() {
  return {
    x: 50 + Math.random() * (canvas.width - 100),
    y: -28,
    r: 24,
    drift: (Math.random() - 0.5) * 0.4,
    vy: 0.45 + Math.random() * 0.2,
    life: 9000,
    value: 25,
  };
}

function makeSunFromSunflower(plant) {
  return {
    x: plant.col * cellW + cellW * 0.52,
    y: plant.row * cellH + cellH * 0.42,
    r: 24,
    drift: (Math.random() - 0.5) * 0.2,
    vy: 0.18,
    life: 10000,
    value: 25,
  };
}

function resetGame() {
  state.sun = 150;
  state.kills = 0;
  state.level = 1;
  state.wave = 1;
  state.running = true;
  state.paused = false;
  state.inCardPick = false;
  state.losing = false;
  state.gameEnded = false;
  state.endText = "";
  state.selectedPlant = "pea";
  state.draggingPlant = "";
  state.shovelMode = false;
  state.loseTimer = 0;
  state.plants = [];
  state.lilyPads = [];
  state.peas = [];
  state.suns = [];
  state.zombies = [];
  state.spawnTimer = 0;
  state.sunTimer = 0;
  state.zombiesSpawned = 0;
  state.zombiesToWin = LEVELS[0].zombiesToWin;
  overlay.classList.add("hidden");
  pauseBtn.classList.remove("active");
  pauseBtn.textContent = "暂停: 关";
  shovelBtn.classList.remove("active");
  shovelBtn.textContent = "铲子: 关";
  syncUi();
  openCardPicker();
}

function syncUi() {
  levelValueEl.textContent = String(state.level);
  sunValueEl.textContent = String(state.sun);
  waveValueEl.textContent = String(state.wave);
  killValueEl.textContent = String(state.kills);
}

function getCellByPoint(px, py) {
  const col = Math.floor(px / cellW);
  const row = Math.floor(py / cellH);

  if (row < 0 || row >= rows || col < 0 || col >= cols) {
    return null;
  }

  return { row, col };
}

function hasPlant(row, col) {
  return state.plants.some((p) => p.row === row && p.col === col);
}

function getPlant(row, col) {
  return state.plants.find((p) => p.row === row && p.col === col);
}

function hasLilyPad(row, col) {
  return state.lilyPads.some((p) => p.row === row && p.col === col);
}

function getLilyPad(row, col) {
  return state.lilyPads.find((p) => p.row === row && p.col === col);
}

function setCardUi() {
  for (const [type, btn] of Object.entries(cardMap)) {
    const unlocked = state.level >= (unlockedCardsByLevel[type] || 99);
    const inDeck = activeDeck.includes(type);
    const enabled = unlocked && inDeck && !state.inCardPick;
    btn.disabled = !enabled;
    btn.classList.toggle("active", enabled && state.selectedPlant === type);
  }

  if (!activeDeck.includes(state.selectedPlant)) {
    state.selectedPlant = activeDeck[0] || "pea";
  }
}

function openCardPicker() {
  state.inCardPick = true;
  state.paused = false;
  pauseBtn.classList.remove("active");
  pauseBtn.textContent = "暂停: 关";

  const levelDefault = defaultDeckByLevel[state.level] || defaultDeckByLevel[6];
  const unlocked = Object.keys(cardMap).filter((k) => state.level >= (unlockedCardsByLevel[k] || 99));
  activeDeck = levelDefault.filter((k) => unlocked.includes(k));

  pickerHintEl.textContent = `第 ${state.level} 关选卡：至少选择3张。`;
  pickerListEl.innerHTML = "";
  for (const type of unlocked) {
    const item = document.createElement("label");
    item.className = "pick-item";

    const ck = document.createElement("input");
    ck.type = "checkbox";
    ck.value = type;
    ck.checked = activeDeck.includes(type);

    const text = document.createElement("span");
    const meta = CARD_META[type];
    text.textContent = `${meta.label} (${meta.cost})`;

    item.appendChild(ck);
    item.appendChild(text);
    pickerListEl.appendChild(item);
  }

  cardPickerEl.classList.remove("hidden");
  setCardUi();
}

function closeCardPicker() {
  state.inCardPick = false;
  cardPickerEl.classList.add("hidden");
  if (!activeDeck.includes(state.selectedPlant)) {
    state.selectedPlant = activeDeck[0] || "pea";
  }
  setCardUi();
}

startLevelBtn.addEventListener("click", () => {
  const checks = [...pickerListEl.querySelectorAll("input[type='checkbox']")];
  const picked = checks.filter((c) => c.checked).map((c) => c.value);
  if (picked.length < 3) {
    pickerHintEl.textContent = "至少选择3张植物卡再开始。";
    return;
  }

  activeDeck = picked;
  closeCardPicker();
});

function pointInSun(x, y, sun) {
  const dx = x - sun.x;
  const dy = y - sun.y;
  return dx * dx + dy * dy <= sun.r * sun.r;
}

function placePlant(cell, plantType) {
  const cfg = PLANT_CONFIG[plantType];
  if (!cfg || state.level < (cfg.minLevel || 1) || state.sun < cfg.cost || hasPlant(cell.row, cell.col)) {
    return;
  }

  const waterCell = isWaterRow(cell.row);
  if (plantType === "lily") {
    if (!waterCell || hasLilyPad(cell.row, cell.col)) {
      return;
    }
    state.lilyPads.push(makePlant(cell.row, cell.col, "lily"));
  } else {
    if (waterCell && !hasLilyPad(cell.row, cell.col)) {
      return;
    }
    state.plants.push(makePlant(cell.row, cell.col, plantType));
  }

  state.sun -= cfg.cost;
  beep(320, 0.06, 0.06);
  syncUi();
}

function bindCardDrag(button, type) {
  button.addEventListener("click", () => {
    state.selectedPlant = type;
    setCardUi();
  });

  button.addEventListener("dragstart", (event) => {
    if (button.disabled) {
      event.preventDefault();
      return;
    }
    state.selectedPlant = type;
    state.draggingPlant = type;
    setCardUi();
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", type);
      event.dataTransfer.effectAllowed = "copy";
    }
  });

  button.addEventListener("dragend", () => {
    state.draggingPlant = "";
    boardWrap.classList.remove("drag-over");
  });
}

bindCardDrag(cardPeaBtn, "pea");
bindCardDrag(cardSunflowerBtn, "sunflower");
bindCardDrag(cardWallnutBtn, "wallnut");
bindCardDrag(cardRepeaterBtn, "repeater");
bindCardDrag(cardIcepeaBtn, "icepea");
bindCardDrag(cardLilyBtn, "lily");

pauseBtn.addEventListener("click", () => {
  if (state.gameEnded || state.losing || state.inCardPick) {
    return;
  }
  state.paused = !state.paused;
  pauseBtn.classList.toggle("active", state.paused);
  pauseBtn.textContent = state.paused ? "暂停: 开" : "暂停: 关";
  if (state.paused) {
    overlay.textContent = "游戏暂停";
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
});

soundBtn.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  soundBtn.textContent = state.soundOn ? "音效: 开" : "音效: 关";
});

shovelBtn.addEventListener("click", () => {
  state.shovelMode = !state.shovelMode;
  shovelBtn.classList.toggle("active", state.shovelMode);
  shovelBtn.textContent = state.shovelMode ? "铲子: 开" : "铲子: 关";
});

canvas.addEventListener("click", (event) => {
  if (!state.running || state.paused || state.inCardPick || state.losing || state.gameEnded) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const cell = getCellByPoint(x, y);

  if (state.shovelMode && cell) {
    const target = getPlant(cell.row, cell.col);
    if (target) {
      state.plants = state.plants.filter((p) => p !== target);
      beep(180, 0.05, 0.06);
      return;
    }

    const lily = getLilyPad(cell.row, cell.col);
    if (lily) {
      state.lilyPads = state.lilyPads.filter((p) => p !== lily);
      beep(170, 0.05, 0.05);
    }
    return;
  }

  const sunHit = state.suns.find((s) => pointInSun(x, y, s));
  if (sunHit) {
    state.sun += sunHit.value;
    state.suns = state.suns.filter((s) => s !== sunHit);
    beep(620, 0.08, 0.05);
    syncUi();
    return;
  }

  if (!cell) {
    return;
  }

  // 移动端：点击卡牌选中后，点击格子直接种植
  if (state.selectedPlant && PLANT_CONFIG[state.selectedPlant]) {
    placePlant(cell, state.selectedPlant);
    return;
  }
});

canvas.addEventListener("dragover", (event) => {
  if (!state.running || state.paused || state.inCardPick || state.losing || state.gameEnded) {
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
  boardWrap.classList.add("drag-over");
});

canvas.addEventListener("dragleave", () => {
  boardWrap.classList.remove("drag-over");
});

canvas.addEventListener("drop", (event) => {
  if (!state.running || state.paused || state.inCardPick || state.losing || state.gameEnded) {
    return;
  }
  event.preventDefault();
  boardWrap.classList.remove("drag-over");

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const cell = getCellByPoint(x, y);
  if (!cell) {
    return;
  }

  const draggedType = event.dataTransfer?.getData("text/plain") || state.draggingPlant;
  if (!PLANT_CONFIG[draggedType]) {
    return;
  }

  state.selectedPlant = draggedType;
  setCardUi();
  placePlant(cell, draggedType);
});

function startLoseSequence() {
  if (state.losing || state.gameEnded) {
    return;
  }
  state.running = false;
  state.paused = false;
  state.inCardPick = false;
  state.losing = true;
  state.loseTimer = 0;
  cardPickerEl.classList.add("hidden");
  pauseBtn.classList.remove("active");
  pauseBtn.textContent = "暂停: 关";
}

function finalizeLose() {
  state.losing = false;
  state.gameEnded = true;
  state.endText = "僵尸吃掉了你的脑子";
  overlay.textContent = `${state.endText}，点击“重新开始”再来一局。`;
  overlay.classList.remove("hidden");
  beep(120, 0.2, 0.08);
}

function updateLosingPhase(dt) {
  state.loseTimer += dt;
  for (const zombie of state.zombies) {
    zombie.isAttacking = false;
    zombie.x -= zombie.speed * 1.35;
  }

  const enteredHouse = state.zombies.some((z) => z.x + z.w < 12);
  if (enteredHouse || state.loseTimer > 2600) {
    finalizeLose();
  }
}

restartBtn.addEventListener("click", resetGame);

function update(dt) {
  if (state.paused || state.inCardPick) {
    return;
  }

  if (state.losing) {
    updateLosingPhase(dt);
    return;
  }

  if (!state.running || state.gameEnded) {
    return;
  }

  const levelCfg = getLevelConfig();
  state.zombiesToWin = levelCfg.zombiesToWin;

  state.sunTimer += dt;
  if (state.sunTimer > levelCfg.ambientSunGap) {
    state.sunTimer = 0;
    state.suns.push(makeSun());
  }

  for (const sun of state.suns) {
    sun.y += sun.vy;
    sun.x += sun.drift;
    sun.life -= dt;
  }
  state.suns = state.suns.filter((s) => s.life > 0 && s.y < canvas.height + 30);

  state.spawnTimer += dt;
  const spawnGap = Math.max(levelCfg.spawnGapFloor, levelCfg.spawnGapBase - state.wave * 110);
  if (state.spawnTimer > spawnGap && state.zombiesSpawned < state.zombiesToWin) {
    state.spawnTimer = 0;
    state.zombiesSpawned += 1;
    const row = Math.floor(Math.random() * rows);
    state.zombies.push(makeZombie(row));
  }

  for (const plant of state.plants) {
    const cfg = PLANT_CONFIG[plant.type];
    if (plant.type === "sunflower") {
      plant.sunTimer += dt;
      if (plant.sunTimer >= cfg.sunGap) {
        plant.sunTimer = 0;
        state.suns.push(makeSunFromSunflower(plant));
      }
    }

    if (cfg.shotCount === 0) {
      continue;
    }

    plant.shootTimer += dt;
    const zombieAhead = state.zombies.some(
      (z) => z.row === plant.row && z.x > plant.col * cellW
    );

    if (zombieAhead && plant.shootTimer > cfg.shootGap) {
      plant.shootTimer = 0;
      const baseX = plant.col * cellW + cellW * 0.72;
      const baseY = plant.row * cellH + cellH / 2;
      if (cfg.shotCount === 1) {
        const shot = makePea(baseX, baseY, plant.row);
        shot.dmg = cfg.dmg;
        shot.isIce = plant.type === "icepea";
        state.peas.push(shot);
      } else {
        const shotA = makePea(baseX, baseY - 7, plant.row);
        const shotB = makePea(baseX, baseY + 7, plant.row);
        shotA.dmg = cfg.dmg;
        shotB.dmg = cfg.dmg;
        state.peas.push(shotA, shotB);
      }
      beep(480, 0.04, 0.03);
    }
  }

  for (const pea of state.peas) {
    pea.x += pea.speed;
  }
  state.peas = state.peas.filter((p) => p.x < canvas.width + 20);

  for (const zombie of state.zombies) {
    zombie.slowTimer = Math.max(0, zombie.slowTimer - dt);
    zombie.speedFactor = zombie.slowTimer > 0 ? 0.58 : 1;

    const gridCol = Math.floor(zombie.x / cellW);
    const plant = getPlant(zombie.row, gridCol);
    const lily = getLilyPad(zombie.row, gridCol);
    const target = plant || lily;

    if (target) {
      zombie.isAttacking = true;
      zombie.attackTimer += dt;
      if (zombie.attackTimer > 650) {
        zombie.attackTimer = 0;
        target.hp -= 20;
        beep(120, 0.05, 0.03);
      }
    } else {
      zombie.isAttacking = false;
      zombie.x -= zombie.speed * zombie.speedFactor;
    }

    if (zombie.x < 4) {
      startLoseSequence();
      return;
    }
  }

  for (const pea of state.peas) {
    const hit = state.zombies.find(
      (z) => z.row === pea.row && pea.x > z.x && pea.x < z.x + z.w
    );

    if (hit) {
      hit.hp -= pea.dmg;
      if (pea.isIce) {
        hit.slowTimer = Math.max(hit.slowTimer, 1700);
      }
      pea.x = canvas.width + 100;
      beep(240, 0.03, 0.02);
    }
  }

  state.plants = state.plants.filter((p) => p.hp > 0);
  state.lilyPads = state.lilyPads.filter((p) => p.hp > 0);

  const before = state.zombies.length;
  state.zombies = state.zombies.filter((z) => z.hp > 0);
  const defeated = before - state.zombies.length;

  if (defeated > 0) {
    state.kills += defeated;
    state.sun += defeated * 20;
    beep(800, 0.05, 0.05);

    if (state.kills % levelCfg.waveKills === 0) {
      state.wave += 1;
    }

    syncUi();
  }

  if (
    state.kills >= state.zombiesToWin &&
    state.zombiesSpawned >= state.zombiesToWin &&
    state.zombies.length === 0
  ) {
    if (state.level < LEVELS.length) {
      state.level += 1;
      state.wave = 1;
      state.kills = 0;
      state.zombiesSpawned = 0;
      state.spawnTimer = 0;
      state.paused = false;
      pauseBtn.classList.remove("active");
      pauseBtn.textContent = "暂停: 关";
      state.sun += 100;
      syncUi();
      openCardPicker();
    } else {
      gameOver(true);
    }
  }
}

function gameOver(win) {
  state.running = false;
  state.gameEnded = true;
  state.endText = win ? "全部通关" : "游戏结束";
  overlay.textContent = `${state.endText}，点击“重新开始”再来一局。`;
  overlay.classList.remove("hidden");
  beep(win ? 900 : 140, 0.18, 0.06);
}

function drawGrid() {
  const levelCfg = getLevelConfig();
  const waterRows = levelCfg.waterRows;
  const isRoof = levelCfg.terrain === "roof";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellW;
      const y = r * cellH;
      const isWater = waterRows.includes(r);

      let shade = "#bfe28a";
      let stroke = "#88b255";

      if (isRoof) {
        shade = (r + c) % 2 === 0 ? "#d06e3e" : "#c65f35";
        stroke = "#9f4425";
      } else if (isWater) {
        shade = (r + c) % 2 === 0 ? "#4fb4ff" : "#3ea4f0";
        stroke = "#2d86cd";
      } else {
        shade = (r + c) % 2 === 0 ? "#bfe28a" : "#addc75";
        stroke = "#88b255";
      }

      ctx.fillStyle = shade;
      ctx.fillRect(x, y, cellW, cellH);
      ctx.strokeStyle = stroke;
      ctx.strokeRect(x, y, cellW, cellH);

      if (isRoof) {
        ctx.strokeStyle = "#f4b08255";
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 6);
        ctx.lineTo(x + cellW - 5, y + cellH - 6);
        ctx.stroke();
      }

      if (isWater) {
        ctx.strokeStyle = "#c8f4ff88";
        ctx.beginPath();
        ctx.moveTo(x + 8, y + cellH * 0.3);
        ctx.quadraticCurveTo(x + cellW * 0.45, y + cellH * 0.18, x + cellW - 8, y + cellH * 0.3);
        ctx.stroke();

        if (!hasLilyPad(r, c)) {
          ctx.fillStyle = "#e6f7ffbb";
          ctx.font = "bold 12px Trebuchet MS";
          ctx.textAlign = "center";
          ctx.fillText("睡莲位", x + cellW * 0.5, y + cellH * 0.6);
        }
      }
    }
  }

  ctx.textAlign = "left";

  ctx.fillStyle = "#d4c0a3";
  ctx.fillRect(0, 0, 26, canvas.height);
  ctx.fillStyle = "#6e4931";
  ctx.fillRect(5, canvas.height * 0.32, 17, canvas.height * 0.36);
  ctx.fillStyle = "#c18d5a";
  ctx.beginPath();
  ctx.arc(18, canvas.height * 0.5, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawLilyPads() {
  for (const p of state.lilyPads) {
    const x = p.col * cellW;
    const y = p.row * cellH;
    const cx = x + cellW * 0.5;
    const cy = y + cellH * 0.62;

    ctx.fillStyle = "#2f9b54";
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#37b360";
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 1);
    ctx.lineTo(cx + 22, cy - 6);
    ctx.lineTo(cx + 5, cy + 3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#303030";
    ctx.fillRect(x + 20, y + 10, 46, 6);
    ctx.fillStyle = "#57d466";
    ctx.fillRect(x + 20, y + 10, Math.max(0, (p.hp / p.hpMax) * 46), 6);
  }
}

function drawPlants() {
  for (const p of state.plants) {
    const x = p.col * cellW;
    const y = p.row * cellH;

    if (p.type === "sunflower") {
      ctx.fillStyle = "#2f8c3f";
      ctx.fillRect(x + cellW * 0.45, y + cellH * 0.46, 8, 38);
      ctx.fillStyle = "#2a9b45";
      ctx.beginPath();
      ctx.ellipse(x + cellW * 0.41, y + cellH * 0.72, 12, 6, -0.5, 0, Math.PI * 2);
      ctx.ellipse(x + cellW * 0.58, y + cellH * 0.66, 12, 6, 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffcc33";
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10;
        const px = x + cellW * 0.5 + Math.cos(a) * 20;
        const py = y + cellH * 0.35 + Math.sin(a) * 20;
        ctx.beginPath();
        ctx.ellipse(px, py, 7, 4, a, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#7d4f1f";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.5, y + cellH * 0.35, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2b1b0f";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.46, y + cellH * 0.33, 2.5, 0, Math.PI * 2);
      ctx.arc(x + cellW * 0.54, y + cellH * 0.33, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2b1b0f";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.5, y + cellH * 0.39, 6, 0.2, 2.9);
      ctx.stroke();
    } else if (p.type === "wallnut") {
      ctx.fillStyle = "#9b6b2e";
      ctx.beginPath();
      ctx.ellipse(x + cellW * 0.5, y + cellH * 0.56, 27, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#40240f";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.44, y + cellH * 0.53, 3.2, 0, Math.PI * 2);
      ctx.arc(x + cellW * 0.56, y + cellH * 0.53, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#40240f";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.5, y + cellH * 0.66, 7, 0.2, 2.9);
      ctx.stroke();
    } else {
      const isIcepea = p.type === "icepea";
      ctx.fillStyle = p.type === "repeater" ? "#236d2f" : isIcepea ? "#2e7ea5" : "#1e7f2b";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.38, y + cellH * 0.58, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isIcepea ? "#61b7de" : "#2fa84a";
      ctx.beginPath();
      ctx.ellipse(x + cellW * 0.3, y + cellH * 0.7, 13, 6, -0.55, 0, Math.PI * 2);
      ctx.ellipse(x + cellW * 0.49, y + cellH * 0.74, 13, 6, 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = p.type === "repeater" ? "#2ba14a" : isIcepea ? "#6ec6f0" : "#2ca63a";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.56, y + cellH * 0.48, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#152b11";
      ctx.beginPath();
      ctx.arc(x + cellW * 0.61, y + cellH * 0.48, 5, 0, Math.PI * 2);
      ctx.fill();

      if (p.type === "repeater") {
        ctx.fillStyle = "#35af4e";
        ctx.beginPath();
        ctx.ellipse(x + cellW * 0.71, y + cellH * 0.64, 14, 7, -0.3, 0, Math.PI * 2);
        ctx.ellipse(x + cellW * 0.62, y + cellH * 0.72, 12, 6, 0.3, 0, Math.PI * 2);
        ctx.ellipse(x + cellW * 0.78, y + cellH * 0.54, 11, 5, -0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "#303030";
    ctx.fillRect(x + 20, y + 10, 46, 6);
    ctx.fillStyle = "#57d466";
    ctx.fillRect(x + 20, y + 10, Math.max(0, (p.hp / p.hpMax) * 46), 6);
  }
}

function drawSuns() {
  for (const sun of state.suns) {
    ctx.fillStyle = "#ffd45c";
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffb300";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.r - 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#b06f00";
    ctx.font = "bold 22px Trebuchet MS";
    ctx.textAlign = "center";
    ctx.fillText("+", sun.x, sun.y + 8);
  }
  ctx.textAlign = "left";
}

function drawPeas() {
  for (const pea of state.peas) {
    ctx.fillStyle = pea.isIce ? "#6ec9ff" : "#2ee85d";
    ctx.beginPath();
    ctx.arc(pea.x, pea.y, pea.r, 0, Math.PI * 2);
    ctx.fill();

    if (pea.isIce) {
      ctx.strokeStyle = "#c8f0ff";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pea.x, pea.y, pea.r - 1, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawZombieAdornment(z) {
  const headX = z.x + z.w * 0.48;
  const headY = z.y + z.h * 0.22;

  if (z.kind === "cone") {
    ctx.fillStyle = "#d98032";
    ctx.beginPath();
    ctx.moveTo(headX, headY - 28);
    ctx.lineTo(headX - 15, headY - 2);
    ctx.lineTo(headX + 15, headY - 2);
    ctx.closePath();
    ctx.fill();
  }

  if (z.kind === "bucket") {
    ctx.fillStyle = "#a0a4a8";
    ctx.fillRect(headX - 16, headY - 30, 32, 22);
    ctx.strokeStyle = "#6e747a";
    ctx.strokeRect(headX - 16, headY - 30, 32, 22);
  }

  if (z.kind === "runner") {
    ctx.fillStyle = "#e6d55b";
    ctx.fillRect(headX - 14, headY - 17, 28, 5);
  }

  if (z.kind === "armor") {
    ctx.fillStyle = "#889197";
    ctx.fillRect(headX - 18, headY + 12, 36, 6);
    ctx.strokeStyle = "#5e676e";
    ctx.strokeRect(headX - 18, headY + 12, 36, 6);
  }
}

function drawZombies() {
  for (const z of state.zombies) {
    const hipY = z.y + z.h * 0.66;
    const shoulderY = z.y + z.h * 0.43;
    const headX = z.x + z.w * 0.46;
    const time = performance.now();
    const bob = Math.sin((time + z.x * 3.5) * 0.012) * 2.6;
    const headY = z.y + z.h * 0.22 + bob;
    const walkAmp = z.kind === "runner" ? 11 : 7;
    const walk = Math.sin((z.x + time * 0.11) * 0.1) * walkAmp;
    const atkPose = z.isAttacking ? 7 : 0;
    const jaw = z.isAttacking ? 2.5 + Math.sin(time * 0.08) * 2 : 0.4;
    const faceTurn = -4 + Math.sin((time + z.x) * 0.01) * 1.4;

    ctx.lineWidth = 2;

    ctx.strokeStyle = "#3d4a39";
    ctx.beginPath();
    ctx.moveTo(headX, shoulderY);
    ctx.lineTo(headX, hipY);
    ctx.stroke();

    ctx.strokeStyle = "#4a5846";
    ctx.beginPath();
    ctx.moveTo(headX, shoulderY + 3 + bob * 0.6);
    ctx.lineTo(headX - 30 - atkPose, shoulderY + 11 + walk * 0.2);
    ctx.moveTo(headX, shoulderY + 3 + bob * 0.6);
    ctx.lineTo(headX + 24 - atkPose, shoulderY + 12 - walk * 0.18);
    ctx.stroke();

    ctx.strokeStyle = "#364533";
    ctx.beginPath();
    ctx.moveTo(headX - atkPose * 0.4, hipY);
    ctx.lineTo(headX - 10 - walk * 0.16, z.y + z.h - 4);
    ctx.moveTo(headX - atkPose * 0.4, hipY);
    ctx.lineTo(headX + 10 + walk * 0.12, z.y + z.h - 4 + walk * 0.25);
    ctx.stroke();

    ctx.fillStyle = z.color;
    ctx.fillRect(headX - 13 - atkPose * 0.2, shoulderY - 4 + bob * 0.3, 26, 34);

    ctx.fillStyle = "#b9d2a0";
    ctx.beginPath();
    ctx.arc(headX, headY, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8fac84";
    ctx.beginPath();
    ctx.ellipse(headX - 7 + faceTurn * 0.4, headY + 1, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#253220";
    ctx.beginPath();
    ctx.arc(headX - 6 + faceTurn, headY - 2, 2.4, 0, Math.PI * 2);
    ctx.arc(headX + 1 + faceTurn * 0.8, headY - 1, 1.9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3f5039";
    ctx.beginPath();
    ctx.moveTo(headX - 11 + faceTurn, headY - 7);
    ctx.lineTo(headX - 4 + faceTurn, headY - 6);
    ctx.stroke();

    ctx.fillStyle = "#7f9a78";
    ctx.beginPath();
    ctx.ellipse(headX - 12 + faceTurn * 1.1, headY + 2, 2.8, 5.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#53634d";
    ctx.beginPath();
    ctx.arc(headX - 2 + faceTurn * 0.8, headY + 5 + jaw * 0.4, 6, 0.2, 2.9);
    ctx.stroke();

    drawZombieAdornment(z);

    ctx.fillStyle = "#1f1f1f";
    ctx.fillRect(headX - 14, z.y + z.h - 4, 12, 4);
    ctx.fillRect(headX + 2, z.y + z.h - 4, 12, 4);

    ctx.fillStyle = "#2f2f2f";
    ctx.fillRect(z.x + 12, z.y - 9, 46, 6);
    ctx.fillStyle = "#f25f5c";
    const hpRate = Math.max(0, z.hp / z.hpMax);
    ctx.fillRect(z.x + 12, z.y - 9, 46 * hpRate, 6);
  }
}

let last = performance.now();
function gameLoop(now) {
  const dt = now - last;
  last = now;

  update(dt);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawSuns();
  drawLilyPads();
  drawPlants();
  drawPeas();
  drawZombies();

  requestAnimationFrame(gameLoop);
}

resetGame();
requestAnimationFrame(gameLoop);
