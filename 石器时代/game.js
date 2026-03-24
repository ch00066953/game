// ==================== 石器时代 - 核心模块 ====================

// ===== 游戏状态 =====
let game = null;

function newGameState(name, cls, appearance) {
    const c = CLASS_DATA[cls];
    return {
        player: {
            name, class: cls, className: c.name, icon: c.icon,
            level: 1, exp: 0, maxExp: 100,
            hp: c.baseHp, maxHp: c.baseHp,
            mp: c.baseMp, maxMp: c.baseMp,
            atk: c.atk, def: c.def, spd: c.spd,
            gold: 100,
            skills: [...c.skills],
        },
        appearance: appearance || null,
        pets: [],
        bag: [
            { id: 'potion', name: '生命药水', icon: '🧪', desc: '恢复50HP', count: 3, effect: { type: 'heal', value: 50 } },
        ],
        currentArea: 0,
        playerPos: { x: 15, y: 18 },
        battleCount: 0,
    };
}

// ===== DOM引用 =====
const $ = id => document.getElementById(id);
const screens = { title: $('titleScreen'), create: $('charCreate'), main: $('gameMain'), battle: $('battleScreen') };
const modals = { pet: $('petModal'), bag: $('bagModal'), shop: $('shopModal'), map: $('mapModal'), result: $('resultModal'), levelUp: $('levelUpModal') };

// ===== 屏幕切换 =====
let mapActive = false;

function showScreen(id) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[id].classList.add('active');
    if (id === 'main') { mapActive = true; resizeCanvas(); } else { mapActive = false; }
}
function showModal(id) { modals[id].classList.add('active'); mapActive = false; }
function hideModal(id) {
    modals[id].classList.remove('active');
    if (screens.main.classList.contains('active')) mapActive = true;
}
function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// ===== 标题画面 =====
function initTitle() {
    if (localStorage.getItem('stoneage_save')) {
        $('btnContinue').style.display = 'block';
    }
    $('btnNewGame').onclick = () => showScreen('create');
    $('btnContinue').onclick = () => {
        try {
            game = JSON.parse(localStorage.getItem('stoneage_save'));
            if (!game.playerPos) game.playerPos = { ...AREA_MAPS[AREAS[game.currentArea].id].playerStart };
            showScreen('main');
            initMainUI();
        } catch { toast('存档损坏'); }
    };
}

// ===== 顶部状态栏 =====
function updateTopBar() {
    const p = game.player;
    $('pName').textContent = p.name;
    $('pLevel').textContent = p.level;
    $('pHp').textContent = p.hp; $('pMaxHp').textContent = p.maxHp;
    $('pMp').textContent = p.mp; $('pMaxMp').textContent = p.maxMp;
    $('pExp').textContent = p.exp; $('pMaxExp').textContent = p.maxExp;
    $('pGold').textContent = p.gold;
    $('pHpBar').style.width = (p.hp / p.maxHp * 100) + '%';
    $('pMpBar').style.width = (p.mp / p.maxMp * 100) + '%';
    $('pExpBar').style.width = (p.exp / p.maxExp * 100) + '%';
    $('areaName').textContent = AREAS[game.currentArea].name;
}

function bindMainButtons() {
    $('btnPets').onclick = () => { renderPetModal(); showModal('pet'); };
    $('btnBag').onclick = () => { renderBagModal(); showModal('bag'); };
    $('btnSave').onclick = saveGame;
    $('btnPetClose').onclick = () => hideModal('pet');
    $('btnBagClose').onclick = () => hideModal('bag');
    $('btnShopClose').onclick = () => hideModal('shop');
    $('btnMapClose').onclick = () => hideModal('map');
}

// ===== 保存/读取 =====
function saveGame() {
    localStorage.setItem('stoneage_save', JSON.stringify(game));
    toast('存档成功！');
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initTitle();
    initCharCreate();
});
