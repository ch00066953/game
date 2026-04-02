// ==================== 怪物猎人 - 动作狩猎游戏 ====================

// ===== 武器数据 =====
const WEAPON_DATA = {
    greatsword: { name: '大剑', icon: '⚔️', atk: 18, spd: 0.6, range: 55, stun: 0, desc: '蓄力重击', combo: [1.0, 1.3, 2.0] },
    dualblades: { name: '双刀', icon: '🗡️', atk: 8,  spd: 1.8, range: 35, stun: 0, desc: '疾风连击', combo: [0.6, 0.7, 0.8, 1.0, 1.2] },
    bow:        { name: '弓',   icon: '🏹', atk: 12, spd: 1.0, range: 180, stun: 0, desc: '远程精准', combo: [1.0, 1.2, 1.5] },
    hammer:     { name: '大锤', icon: '🔨', atk: 16, spd: 0.7, range: 50, stun: 30, desc: '重击眩晕', combo: [1.0, 1.2, 1.8] },
};

// ===== 怪物数据 =====
const MONSTER_DATA = {
    '大野猪': {
        icon: '🐗', hp: 500, atk: 12, def: 5, spd: 2.5, size: 40,
        color: '#8B4513', stars: 1, desc: '低级猎物，但冲撞力不容小觑',
        rewards: { zenny: 200, exp: 100, materials: [{ name: '野猪皮', icon: '🟫', rate: 80 }, { name: '野猪牙', icon: '🦷', rate: 40 }] },
        attacks: [
            { name: '冲撞', damage: 1.0, range: 60, speed: 4, telegraph: 800, pattern: 'charge' },
            { name: '顶角', damage: 0.8, range: 40, speed: 0, telegraph: 500, pattern: 'melee' },
        ],
    },
    '毒龙蜥': {
        icon: '🦎', hp: 800, atk: 18, def: 8, spd: 2.8, size: 50,
        color: '#228B22', stars: 2, desc: '喷射毒液的巨型蜥蜴',
        rewards: { zenny: 400, exp: 200, materials: [{ name: '龙蜥鳞', icon: '💚', rate: 70 }, { name: '毒腺', icon: '☠️', rate: 35 }, { name: '龙蜥爪', icon: '✋', rate: 50 }] },
        attacks: [
            { name: '毒液喷射', damage: 1.2, range: 120, speed: 3, telegraph: 1000, pattern: 'ranged' },
            { name: '尾击', damage: 1.0, range: 55, speed: 0, telegraph: 600, pattern: 'spin' },
            { name: '撕咬', damage: 0.9, range: 45, speed: 0, telegraph: 500, pattern: 'melee' },
        ],
    },
    '雷狼龙': {
        icon: '🐺', hp: 1500, atk: 25, def: 12, spd: 3.5, size: 55,
        color: '#4169E1', stars: 3, desc: '雷电缠身的凶猛龙兽',
        rewards: { zenny: 800, exp: 400, materials: [{ name: '雷狼龙甲壳', icon: '🔵', rate: 60 }, { name: '雷狼龙角', icon: '⚡', rate: 30 }, { name: '雷电袋', icon: '💎', rate: 20 }] },
        attacks: [
            { name: '雷击', damage: 1.5, range: 100, speed: 5, telegraph: 1200, pattern: 'ranged' },
            { name: '突进爪击', damage: 1.2, range: 50, speed: 5, telegraph: 700, pattern: 'charge' },
            { name: '雷光旋转', damage: 1.8, range: 80, speed: 0, telegraph: 1500, pattern: 'spin' },
        ],
    },
    '火龙': {
        icon: '🐉', hp: 2500, atk: 32, def: 15, spd: 3.0, size: 65,
        color: '#DC143C', stars: 4, desc: '天空之王，火焰的化身',
        rewards: { zenny: 1500, exp: 700, materials: [{ name: '火龙鳞', icon: '🔴', rate: 65 }, { name: '火龙翼膜', icon: '🦇', rate: 35 }, { name: '火龙红玉', icon: '❤️', rate: 10 }, { name: '火龙逆鳞', icon: '🏮', rate: 15 }] },
        attacks: [
            { name: '火球', damage: 1.5, range: 150, speed: 4, telegraph: 1000, pattern: 'ranged' },
            { name: '俯冲', damage: 2.0, range: 70, speed: 6, telegraph: 1500, pattern: 'charge' },
            { name: '火焰吐息', damage: 1.8, range: 120, speed: 0, telegraph: 2000, pattern: 'beam' },
            { name: '尾旋', damage: 1.3, range: 60, speed: 0, telegraph: 800, pattern: 'spin' },
        ],
    },
    '灭尽龙': {
        icon: '🐲', hp: 4000, atk: 40, def: 20, spd: 3.8, size: 70,
        color: '#1C1C1C', stars: 5, desc: '古龙之王，毁灭一切的存在',
        rewards: { zenny: 3000, exp: 1200, materials: [{ name: '灭尽龙壳', icon: '⬛', rate: 60 }, { name: '灭尽龙角', icon: '🖤', rate: 25 }, { name: '灭尽龙宝玉', icon: '💜', rate: 5 }, { name: '古龙之血', icon: '🩸', rate: 15 }] },
        attacks: [
            { name: '俯冲重击', damage: 2.5, range: 80, speed: 7, telegraph: 1500, pattern: 'charge' },
            { name: '棘刺散射', damage: 1.8, range: 130, speed: 4, telegraph: 1200, pattern: 'ranged' },
            { name: '灭绝之拳', damage: 3.0, range: 90, speed: 0, telegraph: 2500, pattern: 'slam' },
            { name: '连续爪击', damage: 1.2, range: 50, speed: 0, telegraph: 600, pattern: 'melee' },
            { name: '超新星', damage: 4.0, range: 160, speed: 0, telegraph: 3000, pattern: 'aoe' },
        ],
    },
};

// ===== 任务数据 =====
const QUESTS = [
    { id: 'q1', name: '新人试炼：狩猎大野猪', monster: '大野猪', stars: 1, hrReq: 1, timeLimit: 50, desc: '新猎人的第一场狩猎', reward: '200z + 素材' },
    { id: 'q2', name: '毒雾森林：讨伐毒龙蜥', monster: '毒龙蜥', stars: 2, hrReq: 2, timeLimit: 50, desc: '毒龙蜥在森林中作乱', reward: '400z + 素材' },
    { id: 'q3', name: '雷鸣之地：狩猎雷狼龙', monster: '雷狼龙', stars: 3, hrReq: 3, timeLimit: 50, desc: '雷狼龙出现在废弃古战场', reward: '800z + 素材' },
    { id: 'q4', name: '天空之王：挑战火龙', monster: '火龙', stars: 4, hrReq: 5, timeLimit: 50, desc: '红莲的火龙翱翔高空', reward: '1500z + 素材' },
    { id: 'q5', name: '灭绝之战：灭尽龙', monster: '灭尽龙', stars: 5, hrReq: 7, timeLimit: 50, desc: '最终试炼，灭尽龙降临', reward: '3000z + 素材' },
];

// ===== 装备锻造 =====
const EQUIPMENT = [
    { id: 'iron_sword', name: '铁制大剑', icon: '⚔️', type: 'weapon', weaponType: 'greatsword', atkBonus: 5, mats: [{ name: '野猪牙', count: 2 }, { name: '野猪皮', count: 3 }], cost: 200 },
    { id: 'venom_blade', name: '毒龙双刀', icon: '🗡️', type: 'weapon', weaponType: 'dualblades', atkBonus: 8, mats: [{ name: '龙蜥鳞', count: 3 }, { name: '毒腺', count: 2 }], cost: 500 },
    { id: 'thunder_bow', name: '雷光弓', icon: '🏹', type: 'weapon', weaponType: 'bow', atkBonus: 10, mats: [{ name: '雷狼龙甲壳', count: 2 }, { name: '雷电袋', count: 1 }], cost: 800 },
    { id: 'fire_hammer', name: '火龙大锤', icon: '🔨', type: 'weapon', weaponType: 'hammer', atkBonus: 14, mats: [{ name: '火龙鳞', count: 3 }, { name: '火龙翼膜', count: 2 }], cost: 1200 },
    { id: 'elder_blade', name: '灭龙之剑', icon: '🗡️', type: 'weapon', weaponType: 'greatsword', atkBonus: 20, mats: [{ name: '灭尽龙壳', count: 3 }, { name: '灭尽龙角', count: 1 }, { name: '古龙之血', count: 2 }], cost: 3000 },
    { id: 'leather_armor', name: '猎人铠甲', icon: '🛡️', type: 'armor', defBonus: 5, hpBonus: 50, mats: [{ name: '野猪皮', count: 5 }], cost: 300 },
    { id: 'scale_armor', name: '龙鳞铠甲', icon: '🛡️', type: 'armor', defBonus: 10, hpBonus: 80, mats: [{ name: '龙蜥鳞', count: 4 }, { name: '雷狼龙甲壳', count: 2 }], cost: 800 },
    { id: 'fire_armor', name: '火龙套装', icon: '🛡️', type: 'armor', defBonus: 15, hpBonus: 120, mats: [{ name: '火龙鳞', count: 4 }, { name: '火龙翼膜', count: 2 }, { name: '火龙红玉', count: 1 }], cost: 2000 },
    { id: 'elder_armor', name: '灭尽龙套装', icon: '🛡️', type: 'armor', defBonus: 25, hpBonus: 200, mats: [{ name: '灭尽龙壳', count: 4 }, { name: '灭尽龙宝玉', count: 1 }, { name: '古龙之血', count: 3 }], cost: 5000 },
];

// ===== 商店道具 =====
const SHOP_ITEMS = [
    { id: 'potion', name: '回复药', icon: '🧪', desc: '恢复50HP', price: 50, effect: { type: 'heal', value: 50 } },
    { id: 'megapotion', name: '秘药', icon: '💊', desc: '恢复150HP', price: 150, effect: { type: 'heal', value: 150 } },
    { id: 'trap', name: '落穴陷阱', icon: '🪤', desc: '使怪物陷入陷阱3秒', price: 200, effect: { type: 'trap', duration: 3000 } },
    { id: 'bomb', name: '大爆弹', icon: '💣', desc: '造成大量伤害', price: 300, effect: { type: 'bomb', damage: 200 } },
    { id: 'ration', name: '携带食粮', icon: '🍖', desc: '恢复50体力', price: 30, effect: { type: 'stamina', value: 50 } },
    { id: 'demondrug', name: '鬼人药', icon: '💪', desc: '本次战斗攻击+20%', price: 250, effect: { type: 'atkBuff', value: 0.2 } },
];

// ===== 游戏状态 =====
let game = null;

function newGameState(name, weapon) {
    const w = WEAPON_DATA[weapon];
    return {
        hunter: {
            name,
            weapon,
            weaponName: w.name,
            weaponIcon: w.icon,
            hr: 1,        // Hunter Rank
            exp: 0,
            maxExp: 200,
            maxHp: 150,
            maxStamina: 100,
            baseAtk: w.atk,
            baseDef: 5,
            atkBonus: 0,
            defBonus: 0,
            hpBonus: 0,
            zenny: 500,
            questsCompleted: 0,
        },
        equipment: {
            weapon: null,     // equipped weapon id
            armor: null,      // equipped armor id
        },
        materials: {},   // { name: count }
        bag: [           // consumable items: { id, name, icon, desc, count, effect }
            { id: 'potion', name: '回复药', icon: '🧪', desc: '恢复50HP', count: 5, effect: { type: 'heal', value: 50 } },
            { id: 'ration', name: '携带食粮', icon: '🍖', desc: '恢复50体力', count: 3, effect: { type: 'stamina', value: 50 } },
        ],
        crafted: [],  // list of crafted equipment ids
    };
}

// ===== DOM 引用 =====
const $ = id => document.getElementById(id);
const screens = {
    title: $('titleScreen'),
    create: $('charCreate'),
    main: $('gameMain'),
    quest: $('questScreen'),
    battle: $('battleScreen'),
};
const modals = {
    result: $('resultModal'),
    forge: $('forgeModal'),
    items: $('itemsModal'),
    shop: $('shopModal'),
    status: $('statusModal'),
};

// ===== 屏幕切换 =====
function showScreen(id) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[id].classList.add('active');
}
function showModal(id) { modals[id].classList.add('active'); }
function hideModal(id) { modals[id].classList.remove('active'); }
function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// ===== 标题画面 =====
function initTitle() {
    if (localStorage.getItem('monsterhunter_save')) {
        $('btnContinue').style.display = 'block';
    }
    $('btnNewGame').onclick = () => showScreen('create');
    $('btnContinue').onclick = () => {
        try {
            game = JSON.parse(localStorage.getItem('monsterhunter_save'));
            showScreen('main');
            refreshMainUI();
        } catch { toast('存档损坏'); }
    };
}

// ===== 角色创建 =====
function initCharCreate() {
    let selectedWeapon = 'greatsword';
    document.querySelectorAll('.weapon-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.weapon-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedWeapon = card.dataset.weapon;
        });
    });
    $('btnCreate').onclick = () => {
        const name = $('charName').value.trim() || '猎人';
        game = newGameState(name, selectedWeapon);
        showScreen('main');
        refreshMainUI();
        toast(`${name}，欢迎来到猎人集会所！`);
    };
}

// ===== 主界面 =====
function refreshMainUI() {
    const h = game.hunter;
    $('hunterIcon').textContent = h.weaponIcon;
    $('hunterName').textContent = h.name;
    $('hunterRank').textContent = h.hr;
    $('zenny').textContent = h.zenny;
    const matCount = Object.values(game.materials).reduce((a, b) => a + b, 0);
    $('matCount').textContent = matCount;
}

function bindMainButtons() {
    $('btnQuest').onclick = () => { renderQuestList(); showScreen('quest'); };
    $('btnForge').onclick = () => { renderForgeList(); showModal('forge'); };
    $('btnItems').onclick = () => { renderItemsList(); showModal('items'); };
    $('btnShop').onclick = () => { renderShopList(); showModal('shop'); };
    $('btnStatus').onclick = () => { renderStatus(); showModal('status'); };
    $('btnSave').onclick = () => {
        localStorage.setItem('monsterhunter_save', JSON.stringify(game));
        toast('游戏已保存！');
    };
    $('btnForgeClose').onclick = () => hideModal('forge');
    $('btnItemsClose').onclick = () => hideModal('items');
    $('btnShopClose').onclick = () => hideModal('shop');
    $('btnStatusClose').onclick = () => hideModal('status');
}

// ===== 任务列表 =====
function renderQuestList() {
    const list = $('questList');
    list.innerHTML = '';
    QUESTS.forEach(q => {
        const locked = game.hunter.hr < q.hrReq;
        const div = document.createElement('div');
        div.className = 'quest-card' + (locked ? ' locked' : '');
        div.innerHTML = `
            <div class="quest-icon">${MONSTER_DATA[q.monster].icon}</div>
            <div class="quest-info">
                <div class="quest-name">${q.name}</div>
                <div class="quest-desc">${q.desc}</div>
                <div class="quest-reward">报酬: ${q.reward}</div>
            </div>
            <div class="quest-stars">${'⭐'.repeat(q.stars)}</div>
        `;
        if (!locked) {
            div.onclick = () => startBattle(q);
        }
        list.appendChild(div);
    });
    $('btnQuestBack').onclick = () => showScreen('main');
}

// ===== 锻造 =====
function renderForgeList() {
    const list = $('forgeList');
    list.innerHTML = '';
    EQUIPMENT.forEach(eq => {
        const crafted = game.crafted.includes(eq.id);
        const canCraft = !crafted && hasMaterials(eq.mats) && game.hunter.zenny >= eq.cost;
        const div = document.createElement('div');
        div.className = 'forge-item';
        const matsStr = eq.mats.map(m => `${m.name}×${m.count}(${game.materials[m.name] || 0})`).join(', ');
        const statsStr = eq.type === 'weapon' ? `攻击+${eq.atkBonus}` : `防御+${eq.defBonus} HP+${eq.hpBonus}`;
        div.innerHTML = `
            <div class="forge-icon">${eq.icon}</div>
            <div class="forge-info">
                <div class="forge-name">${eq.name} ${crafted ? '✅' : ''}</div>
                <div class="forge-mats">需要: ${matsStr} | ${eq.cost}z</div>
                <div class="forge-mats">${statsStr}</div>
            </div>
            <button class="forge-btn" ${canCraft ? '' : 'disabled'}>${crafted ? '已锻造' : '锻造'}</button>
        `;
        if (canCraft) {
            div.querySelector('.forge-btn').onclick = () => craftEquipment(eq);
        }
        list.appendChild(div);
    });
}

function hasMaterials(mats) {
    return mats.every(m => (game.materials[m.name] || 0) >= m.count);
}

function craftEquipment(eq) {
    eq.mats.forEach(m => { game.materials[m.name] -= m.count; });
    game.hunter.zenny -= eq.cost;
    game.crafted.push(eq.id);

    // 自动装备
    if (eq.type === 'weapon') {
        // 卸下旧装备
        if (game.equipment.weapon) {
            const old = EQUIPMENT.find(e => e.id === game.equipment.weapon);
            if (old) game.hunter.atkBonus -= old.atkBonus;
        }
        game.equipment.weapon = eq.id;
        game.hunter.atkBonus += eq.atkBonus;
    } else {
        if (game.equipment.armor) {
            const old = EQUIPMENT.find(e => e.id === game.equipment.armor);
            if (old) { game.hunter.defBonus -= old.defBonus; game.hunter.hpBonus -= old.hpBonus; }
        }
        game.equipment.armor = eq.id;
        game.hunter.defBonus += eq.defBonus;
        game.hunter.hpBonus += eq.hpBonus;
    }

    refreshMainUI();
    renderForgeList();
    toast(`锻造了 ${eq.name}！已自动装备`);
}

// ===== 道具箱 =====
function renderItemsList() {
    const list = $('itemsList');
    list.innerHTML = '';

    // 消耗品
    if (game.bag.length > 0) {
        game.bag.forEach(item => {
            const div = document.createElement('div');
            div.className = 'bag-item';
            div.innerHTML = `
                <div class="bag-item-icon">${item.icon}</div>
                <div class="bag-item-info">
                    <div class="bag-item-name">${item.name}</div>
                    <div class="bag-item-desc">${item.desc}</div>
                </div>
                <div class="bag-item-count">×${item.count}</div>
            `;
            list.appendChild(div);
        });
    }

    // 素材
    const matEntries = Object.entries(game.materials).filter(([, v]) => v > 0);
    if (matEntries.length > 0) {
        const header = document.createElement('div');
        header.innerHTML = '<h3 style="padding:10px 0;color:#555;">── 素 材 ──</h3>';
        list.appendChild(header);
        matEntries.forEach(([name, count]) => {
            const div = document.createElement('div');
            div.className = 'bag-item';
            div.innerHTML = `
                <div class="bag-item-icon">📦</div>
                <div class="bag-item-info"><div class="bag-item-name">${name}</div></div>
                <div class="bag-item-count">×${count}</div>
            `;
            list.appendChild(div);
        });
    }

    if (game.bag.length === 0 && matEntries.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">空空如也</p>';
    }
}

// ===== 商店 =====
function renderShopList() {
    const list = $('shopList');
    list.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        const canBuy = game.hunter.zenny >= item.price;
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="shop-icon">${item.icon}</div>
            <div class="shop-info">
                <div class="shop-name">${item.name}</div>
                <div class="shop-price">${item.desc} | ${item.price}z</div>
            </div>
            <button class="shop-btn" ${canBuy ? '' : 'disabled'}>购买</button>
        `;
        if (canBuy) {
            div.querySelector('.shop-btn').onclick = () => buyItem(item);
        }
        list.appendChild(div);
    });
}

function buyItem(item) {
    game.hunter.zenny -= item.price;
    const existing = game.bag.find(b => b.id === item.id);
    if (existing) {
        existing.count++;
    } else {
        game.bag.push({ id: item.id, name: item.name, icon: item.icon, desc: item.desc, count: 1, effect: item.effect });
    }
    refreshMainUI();
    renderShopList();
    toast(`购买了 ${item.name}`);
}

// ===== 猎人状态 =====
function renderStatus() {
    const h = game.hunter;
    const totalAtk = h.baseAtk + h.atkBonus;
    const totalDef = h.baseDef + h.defBonus;
    const totalHp = h.maxHp + h.hpBonus;
    const weaponEq = game.equipment.weapon ? EQUIPMENT.find(e => e.id === game.equipment.weapon) : null;
    const armorEq = game.equipment.armor ? EQUIPMENT.find(e => e.id === game.equipment.armor) : null;

    $('statusBody').innerHTML = `
        <div class="stat-row"><span class="stat-label">猎人名</span><span class="stat-value">${h.name}</span></div>
        <div class="stat-row"><span class="stat-label">猎人等级(HR)</span><span class="stat-value">${h.hr}</span></div>
        <div class="stat-row"><span class="stat-label">经验值</span><span class="stat-value">${h.exp} / ${h.maxExp}</span></div>
        <div class="stat-row"><span class="stat-label">武器类型</span><span class="stat-value">${h.weaponIcon} ${h.weaponName}</span></div>
        <div class="stat-row"><span class="stat-label">攻击力</span><span class="stat-value">${totalAtk}</span></div>
        <div class="stat-row"><span class="stat-label">防御力</span><span class="stat-value">${totalDef}</span></div>
        <div class="stat-row"><span class="stat-label">最大HP</span><span class="stat-value">${totalHp}</span></div>
        <div class="stat-row"><span class="stat-label">金钱</span><span class="stat-value">${h.zenny}z</span></div>
        <div class="stat-row"><span class="stat-label">完成任务</span><span class="stat-value">${h.questsCompleted}</span></div>
        <div class="equip-section">
            <h3>🛡️ 装备</h3>
            <div class="stat-row"><span class="stat-label">武器</span><span class="stat-value">${weaponEq ? weaponEq.name : '无'}</span></div>
            <div class="stat-row"><span class="stat-label">防具</span><span class="stat-value">${armorEq ? armorEq.name : '无'}</span></div>
        </div>
    `;
}

// ===== 战斗系统 =====
let battle = null;
let battleAnimId = null;

function startBattle(quest) {
    const monsterData = MONSTER_DATA[quest.monster];
    const h = game.hunter;
    const totalHp = h.maxHp + h.hpBonus;
    const weapon = WEAPON_DATA[h.weapon];

    battle = {
        quest,
        canvas: $('battleCanvas'),
        ctx: null,
        width: 0,
        height: 0,

        // 猎人状态
        hunter: {
            x: 0, y: 0,
            vx: 0, vy: 0,
            hp: totalHp,
            maxHp: totalHp,
            stamina: h.maxStamina,
            maxStamina: h.maxStamina,
            atk: h.baseAtk + h.atkBonus,
            def: h.baseDef + h.defBonus,
            speed: 4,
            size: 18,
            facing: 1, // 1=right, -1=left
            state: 'idle', // idle, attack, roll, hit, useItem
            stateTimer: 0,
            comboIndex: 0,
            comboTimer: 0,
            attackCooldown: 0,
            rollCooldown: 0,
            invincible: 0,
            atkBuffTimer: 0,
            atkBuffValue: 0,
        },

        // 怪物状态
        monster: {
            name: quest.monster,
            x: 0, y: 0,
            vx: 0, vy: 0,
            hp: monsterData.hp,
            maxHp: monsterData.hp,
            atk: monsterData.atk,
            def: monsterData.def,
            speed: monsterData.spd,
            size: monsterData.size,
            color: monsterData.color,
            icon: monsterData.icon,
            state: 'idle', // idle, telegraph, attack, stunned, trapped, enraged
            stateTimer: 0,
            attackIndex: 0,
            currentAttack: null,
            stunTimer: 0,
            stunAccum: 0,   // 眩晕累积
            trapTimer: 0,
            enraged: false,
            enrageThreshold: monsterData.hp * 0.3,
            attacks: monsterData.attacks,
            aiTimer: 0,
            telegraphX: 0, telegraphY: 0,
        },

        // 战斗道具
        items: {
            potion: 0,
            megapotion: 0,
            trap: 0,
            bomb: 0,
        },

        // 投射物
        projectiles: [],
        // 特效
        effects: [],
        // 伤害数字
        dmgNumbers: [],

        // 计时
        timeLeft: quest.timeLimit * 60, // 秒
        elapsed: 0,
        lastTime: 0,

        // 输入
        keys: {},
        selectedItem: 0,

        // 状态
        finished: false,
        victory: false,

        weapon,
    };

    // 复制道具到战斗
    game.bag.forEach(item => {
        if (battle.items[item.id] !== undefined) {
            battle.items[item.id] = item.count;
        }
    });

    // 设置canvas
    const canvas = battle.canvas;
    battle.ctx = canvas.getContext('2d');
    resizeBattleCanvas();

    // 初始位置
    battle.hunter.x = battle.width * 0.3;
    battle.hunter.y = battle.height * 0.5;
    battle.monster.x = battle.width * 0.7;
    battle.monster.y = battle.height * 0.5;

    // HUD
    updateBattleHUD();

    // 输入绑定
    window.addEventListener('keydown', onBattleKeyDown);
    window.addEventListener('keyup', onBattleKeyUp);
    window.addEventListener('resize', resizeBattleCanvas);

    showScreen('battle');

    // 开始循环
    battle.lastTime = performance.now();
    battleLoop(performance.now());
}

function resizeBattleCanvas() {
    if (!battle) return;
    const canvas = battle.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    battle.width = canvas.width;
    battle.height = canvas.height;
}

function onBattleKeyDown(e) {
    if (!battle || battle.finished) return;
    battle.keys[e.key.toLowerCase()] = true;
    battle.keys[e.code] = true;

    // 攻击
    if (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'z') {
        hunterAttack();
    }
    // 翻滚
    if (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'x') {
        hunterRoll();
    }
    // 使用道具
    if (e.key.toLowerCase() === 'l' || e.key.toLowerCase() === 'c') {
        useSelectedItem();
    }
    // 切换道具 (1234 or QE)
    if (e.key >= '1' && e.key <= '4') {
        battle.selectedItem = parseInt(e.key) - 1;
        updateItemBar();
    }
    if (e.key.toLowerCase() === 'q') {
        battle.selectedItem = (battle.selectedItem - 1 + 4) % 4;
        updateItemBar();
    }
    if (e.key.toLowerCase() === 'e') {
        battle.selectedItem = (battle.selectedItem + 1) % 4;
        updateItemBar();
    }           
}

function onBattleKeyUp(e) {
    if (!battle) return;
    battle.keys[e.key.toLowerCase()] = false;
    battle.keys[e.code] = false;
}

// ===== 猎人动作 =====
function hunterAttack() {
    const h = battle.hunter;
    if (h.state !== 'idle' || h.attackCooldown > 0) return;
    if (h.stamina < 10) return;

    h.stamina -= 10;
    h.state = 'attack';

    const weapon = battle.weapon;
    const comboPower = weapon.combo[h.comboIndex] || 1.0;
    const dmg = Math.max(1, Math.floor((h.atk * (1 + h.atkBuffValue) * comboPower) - battle.monster.def * 0.5));

    // 判定命中
    const m = battle.monster;
    const dx = m.x - h.x;
    const dy = m.y - h.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (weapon === WEAPON_DATA.bow) {
        // 弓：发射箭矢
        const angle = Math.atan2(m.y - h.y, m.x - h.x);
        battle.projectiles.push({
            x: h.x, y: h.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            damage: dmg,
            owner: 'hunter',
            life: 60,
            size: 4,
        });
    } else {
        // 近战
        if (dist < weapon.range + m.size) {
            dealDamageToMonster(dmg);
            if (weapon.stun > 0) {
                m.stunAccum += weapon.stun * comboPower;
                if (m.stunAccum >= 100) {
                    m.stunAccum = 0;
                    m.state = 'stunned';
                    m.stateTimer = 0;
                    m.stunTimer = 3000;
                    addEffect(m.x, m.y, '💫', 1500);
                }
            }
        }
    }

    h.comboIndex = (h.comboIndex + 1) % weapon.combo.length;
    h.comboTimer = 1000;

    const attackDuration = Math.floor(300 / weapon.spd);
    h.stateTimer = attackDuration;
    h.attackCooldown = Math.floor(400 / weapon.spd);

    addEffect(h.x + h.facing * 30, h.y, '💥', 200);
}

function hunterRoll() {
    const h = battle.hunter;
    if (h.state !== 'idle' || h.rollCooldown > 0) return;
    if (h.stamina < 20) return;

    h.stamina -= 20;
    h.state = 'roll';
    h.stateTimer = 400;
    h.invincible = 500; // i-frames
    h.rollCooldown = 600;

    // 翻滚方向
    let rx = 0, ry = 0;
    const keys = battle.keys;
    if (keys['w'] || keys['arrowup']) ry = -1;
    if (keys['s'] || keys['arrowdown']) ry = 1;
    if (keys['a'] || keys['arrowleft']) rx = -1;
    if (keys['d'] || keys['arrowright']) rx = 1;
    if (rx === 0 && ry === 0) rx = h.facing;
    const len = Math.sqrt(rx * rx + ry * ry) || 1;
    h.vx = (rx / len) * 8;
    h.vy = (ry / len) * 8;
}

function useSelectedItem() {
    const itemKeys = ['potion', 'megapotion', 'trap', 'bomb'];
    const key = itemKeys[battle.selectedItem];
    if (!key || battle.items[key] <= 0) return;
    if (battle.hunter.state !== 'idle') return;

    battle.items[key]--;
    
    // 从背包扣除
    const bagItem = game.bag.find(b => b.id === key);
    if (bagItem) {
        bagItem.count--;
        if (bagItem.count <= 0) {
            game.bag = game.bag.filter(b => b.id !== key);
        }
    }

    const h = battle.hunter;
    const m = battle.monster;

    switch (key) {
        case 'potion':
            h.hp = Math.min(h.maxHp, h.hp + 50);
            addEffect(h.x, h.y - 20, '💚+50', 800);
            h.state = 'useItem';
            h.stateTimer = 500;
            break;
        case 'megapotion':
            h.hp = Math.min(h.maxHp, h.hp + 150);
            addEffect(h.x, h.y - 20, '💚+150', 800);
            h.state = 'useItem';
            h.stateTimer = 500;
            break;
        case 'trap':
            // 放置陷阱在猎人脚下
            addEffect(h.x, h.y, '🪤', 5000);
            battle.trapPos = { x: h.x, y: h.y, active: true, timer: 8000 };
            h.state = 'useItem';
            h.stateTimer = 600;
            break;
        case 'bomb':
            // 放置炸弹
            const bx = h.x + h.facing * 40;
            const by = h.y;
            setTimeout(() => {
                if (!battle || battle.finished) return;
                const dx = m.x - bx;
                const dy = m.y - by;
                if (Math.sqrt(dx * dx + dy * dy) < 80) {
                    dealDamageToMonster(200);
                }
                addEffect(bx, by, '💥', 500);
            }, 1500);
            addEffect(bx, by, '💣', 1500);
            h.state = 'useItem';
            h.stateTimer = 400;
            break;
    }

    updateBattleHUD();
}

function updateItemBar() {
    document.querySelectorAll('.item-slot').forEach((slot, i) => {
        slot.classList.toggle('active', i === battle.selectedItem);
    });
}

// ===== 伤害计算 =====
function dealDamageToMonster(dmg) {
    const m = battle.monster;
    const crit = Math.random() < 0.15;
    const finalDmg = crit ? Math.floor(dmg * 1.5) : dmg;
    m.hp = Math.max(0, m.hp - finalDmg);
    addDmgNumber(m.x, m.y - m.size, finalDmg, crit);
    if (m.hp <= 0) {
        endBattle(true);
    } else if (!m.enraged && m.hp <= m.enrageThreshold) {
        m.enraged = true;
        m.speed *= 1.3;
        m.atk = Math.floor(m.atk * 1.2);
        addEffect(m.x, m.y, '🔥愤怒！', 1500);
    }
}

function dealDamageToHunter(dmg) {
    const h = battle.hunter;
    if (h.invincible > 0) return;
    const reduced = Math.max(1, dmg - h.def * 0.3);
    h.hp = Math.max(0, h.hp - Math.floor(reduced));
    h.state = 'hit';
    h.stateTimer = 300;
    h.invincible = 500;
    addDmgNumber(h.x, h.y - h.size, Math.floor(reduced), false, true);
    if (h.hp <= 0) {
        endBattle(false);
    }
}

function addDmgNumber(x, y, value, crit, isHunter) {
    battle.dmgNumbers.push({
        x, y, value, crit, isHunter,
        life: 60,
        vy: -2,
    });
}

function addEffect(x, y, text, duration) {
    battle.effects.push({ x, y, text, life: duration, maxLife: duration });
}

// ===== 怪物AI =====
function updateMonsterAI(dt) {
    const m = battle.monster;
    const h = battle.hunter;

    // 陷阱检测
    if (battle.trapPos && battle.trapPos.active && m.state !== 'trapped') {
        const dx = m.x - battle.trapPos.x;
        const dy = m.y - battle.trapPos.y;
        if (Math.sqrt(dx * dx + dy * dy) < 40) {
            m.state = 'trapped';
            m.trapTimer = 3000;
            m.stateTimer = 0;
            m.vx = 0;
            m.vy = 0;
            battle.trapPos.active = false;
            addEffect(m.x, m.y, '🪤抓住了！', 2000);
            return;
        }
    }

    if (m.state === 'stunned') {
        m.stunTimer -= dt;
        if (m.stunTimer <= 0) {
            m.state = 'idle';
            m.stateTimer = 0;
        }
        return;
    }

    if (m.state === 'trapped') {
        m.trapTimer -= dt;
        if (m.trapTimer <= 0) {
            m.state = 'idle';
            m.stateTimer = 0;
        }
        return;
    }

    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (m.state === 'idle') {
        m.aiTimer -= dt;
        if (m.aiTimer <= 0) {
            // 选择攻击
            const atk = m.attacks[Math.floor(Math.random() * m.attacks.length)];
            m.currentAttack = atk;

            if (atk.pattern === 'charge' || atk.pattern === 'ranged' || atk.pattern === 'beam') {
                // 需要面向猎人
                m.state = 'telegraph';
                m.stateTimer = atk.telegraph * (m.enraged ? 0.7 : 1);
                m.telegraphX = h.x;
                m.telegraphY = h.y;
            } else {
                // 先靠近
                if (dist > atk.range + m.size) {
                    // 移动靠近
                    const len = Math.sqrt(dx * dx + dy * dy) || 1;
                    m.vx = (dx / len) * m.speed;
                    m.vy = (dy / len) * m.speed;
                    m.aiTimer = 500;
                } else {
                    m.state = 'telegraph';
                    m.stateTimer = atk.telegraph * (m.enraged ? 0.7 : 1);
                    m.telegraphX = h.x;
                    m.telegraphY = h.y;
                }
            }
        } else {
            // 缓慢追踪猎人
            if (dist > 100) {
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                m.vx = (dx / len) * m.speed * 0.5;
                m.vy = (dy / len) * m.speed * 0.5;
            } else {
                m.vx *= 0.9;
                m.vy *= 0.9;
            }
        }
    }

    if (m.state === 'telegraph') {
        m.stateTimer -= dt;
        m.vx = 0;
        m.vy = 0;
        if (m.stateTimer <= 0) {
            m.state = 'attack';
            m.stateTimer = 500;
            executeMonsterAttack(m, h);
        }
    }

    if (m.state === 'attack') {
        m.stateTimer -= dt;
        if (m.stateTimer <= 0) {
            m.state = 'idle';
            m.aiTimer = m.enraged ? 800 : 1500;
            m.vx = 0;
            m.vy = 0;
        }
    }
}

function executeMonsterAttack(m, h) {
    const atk = m.currentAttack;
    if (!atk) return;
    const mdmg = Math.floor(m.atk * atk.damage);

    switch (atk.pattern) {
        case 'melee': {
            const dx = h.x - m.x;
            const dy = h.y - m.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < atk.range + m.size + battle.hunter.size) {
                dealDamageToHunter(mdmg);
            }
            addEffect(m.x + (h.x > m.x ? 1 : -1) * 30, m.y, '💥', 300);
            break;
        }
        case 'charge': {
            const dx = m.telegraphX - m.x;
            const dy = m.telegraphY - m.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            m.vx = (dx / len) * (atk.speed || 5);
            m.vy = (dy / len) * (atk.speed || 5);
            m.stateTimer = 600;
            // 碰撞检测将在update中
            break;
        }
        case 'ranged': {
            const angle = Math.atan2(h.y - m.y, h.x - m.x);
            battle.projectiles.push({
                x: m.x, y: m.y,
                vx: Math.cos(angle) * (atk.speed || 4),
                vy: Math.sin(angle) * (atk.speed || 4),
                damage: mdmg,
                owner: 'monster',
                life: 90,
                size: 8,
            });
            break;
        }
        case 'spin': {
            // 范围攻击
            const dx = h.x - m.x;
            const dy = h.y - m.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < atk.range + m.size) {
                dealDamageToHunter(mdmg);
            }
            addEffect(m.x, m.y, '🌀', 500);
            break;
        }
        case 'slam': {
            // 跳砸
            m.stateTimer = 800;
            setTimeout(() => {
                if (!battle || battle.finished) return;
                const dx = h.x - m.x;
                const dy = h.y - m.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < atk.range + m.size) {
                    dealDamageToHunter(mdmg);
                }
                addEffect(m.x, m.y, '💥', 500);
                // 震波
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    battle.projectiles.push({
                        x: m.x, y: m.y,
                        vx: Math.cos(angle) * 3,
                        vy: Math.sin(angle) * 3,
                        damage: Math.floor(mdmg * 0.5),
                        owner: 'monster',
                        life: 40,
                        size: 6,
                    });
                }
            }, 500);
            break;
        }
        case 'beam': {
            // 光线攻击 - 创建多个投射物
            const angle = Math.atan2(m.telegraphY - m.y, m.telegraphX - m.x);
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (!battle || battle.finished) return;
                    const spread = (Math.random() - 0.5) * 0.3;
                    battle.projectiles.push({
                        x: m.x, y: m.y,
                        vx: Math.cos(angle + spread) * 5,
                        vy: Math.sin(angle + spread) * 5,
                        damage: Math.floor(mdmg * 0.4),
                        owner: 'monster',
                        life: 60,
                        size: 6,
                    });
                }, i * 100);
            }
            break;
        }
        case 'aoe': {
            // 全屏攻击(超新星)
            addEffect(m.x, m.y, '☀️', 2000);
            m.stateTimer = 2000;
            setTimeout(() => {
                if (!battle || battle.finished) return;
                const dx = h.x - m.x;
                const dy = h.y - m.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < atk.range) {
                    dealDamageToHunter(mdmg);
                }
                // 屏幕闪白
                battle.screenFlash = 300;
            }, 1500);
            break;
        }
    }
}

// ===== 战斗主循环 =====
function battleLoop(now) {
    if (!battle || battle.finished) return;

    const dt = now - battle.lastTime;
    battle.lastTime = now;
    battle.elapsed += dt;

    // 时间限制
    battle.timeLeft -= dt / 1000;
    if (battle.timeLeft <= 0) {
        endBattle(false);
        return;
    }

    updateHunter(dt);
    updateMonsterAI(dt);
    updateMonsterPosition(dt);
    updateProjectiles(dt);
    checkChargeCollision();
    updateTrap(dt);
    updateEffects(dt);
    updateDmgNumbers(dt);

    // 体力恢复
    const h = battle.hunter;
    if (h.state === 'idle') {
        h.stamina = Math.min(h.maxStamina, h.stamina + dt * 0.02);
    }

    // 冷却
    if (h.attackCooldown > 0) h.attackCooldown -= dt;
    if (h.rollCooldown > 0) h.rollCooldown -= dt;
    if (h.invincible > 0) h.invincible -= dt;
    if (h.comboTimer > 0) {
        h.comboTimer -= dt;
        if (h.comboTimer <= 0) h.comboIndex = 0;
    }
    if (h.atkBuffTimer > 0) {
        h.atkBuffTimer -= dt;
        if (h.atkBuffTimer <= 0) h.atkBuffValue = 0;
    }
    if (battle.screenFlash > 0) battle.screenFlash -= dt;

    // 状态恢复
    if (h.stateTimer > 0) {
        h.stateTimer -= dt;
        if (h.stateTimer <= 0 && h.state !== 'idle') {
            h.state = 'idle';
        }
    }

    renderBattle();
    updateBattleHUD();

    battleAnimId = requestAnimationFrame(battleLoop);
}

function updateHunter(dt) {
    const h = battle.hunter;
    const keys = battle.keys;

    if (h.state === 'idle') {
        let mx = 0, my = 0;
        if (keys['w'] || keys['arrowup']) my = -1;
        if (keys['s'] || keys['arrowdown']) my = 1;
        if (keys['a'] || keys['arrowleft']) mx = -1;
        if (keys['d'] || keys['arrowright']) mx = 1;
        if (mx !== 0 || my !== 0) {
            const len = Math.sqrt(mx * mx + my * my);
            h.vx = (mx / len) * h.speed;
            h.vy = (my / len) * h.speed;
            if (mx !== 0) h.facing = mx > 0 ? 1 : -1;
        } else {
            h.vx *= 0.8;
            h.vy *= 0.8;
        }
    } else if (h.state === 'roll') {
        // 翻滚中继续移动
    } else if (h.state === 'hit') {
        h.vx *= 0.9;
        h.vy *= 0.9;
    } else {
        h.vx *= 0.7;
        h.vy *= 0.7;
    }

    h.x += h.vx;
    h.y += h.vy;

    // 边界
    h.x = Math.max(h.size, Math.min(battle.width - h.size, h.x));
    h.y = Math.max(h.size + 60, Math.min(battle.height - h.size - 60, h.y));
}

function updateMonsterPosition(dt) {
    const m = battle.monster;
    m.x += m.vx;
    m.y += m.vy;
    m.x = Math.max(m.size, Math.min(battle.width - m.size, m.x));
    m.y = Math.max(m.size + 60, Math.min(battle.height - m.size - 60, m.y));
}

function checkChargeCollision() {
    const m = battle.monster;
    if (m.state !== 'attack' || !m.currentAttack || m.currentAttack.pattern !== 'charge') return;
    const h = battle.hunter;
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < m.size + h.size) {
        const dmg = Math.floor(m.atk * m.currentAttack.damage);
        dealDamageToHunter(dmg);
        m.vx = 0;
        m.vy = 0;
    }
}

function updateProjectiles(dt) {
    battle.projectiles = battle.projectiles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0) return false;
        if (p.x < 0 || p.x > battle.width || p.y < 0 || p.y > battle.height) return false;

        if (p.owner === 'hunter') {
            const m = battle.monster;
            const dx = m.x - p.x;
            const dy = m.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < m.size + p.size) {
                dealDamageToMonster(p.damage);
                return false;
            }
        } else {
            const h = battle.hunter;
            const dx = h.x - p.x;
            const dy = h.y - p.y;
            if (Math.sqrt(dx * dx + dy * dy) < h.size + p.size) {
                dealDamageToHunter(p.damage);
                return false;
            }
        }

        return true;
    });
}

function updateTrap(dt) {
    if (battle.trapPos && battle.trapPos.active) {
        battle.trapPos.timer -= dt;
        if (battle.trapPos.timer <= 0) {
            battle.trapPos.active = false;
        }
    }
}

function updateEffects(dt) {
    battle.effects = battle.effects.filter(e => {
        e.life -= dt;
        return e.life > 0;
    });
}

function updateDmgNumbers(dt) {
    battle.dmgNumbers = battle.dmgNumbers.filter(d => {
        d.y += d.vy;
        d.life--;
        return d.life > 0;
    });
}

// ===== 战斗渲染 =====
function renderBattle() {
    const ctx = battle.ctx;
    const w = battle.width;
    const h = battle.height;

    // 清屏 - 根据怪物选择背景
    const quest = battle.quest;
    const monster = battle.quest.monster;
    let bgGrad;
    if (monster === '大野猪') {
        bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#87CEEB');
        bgGrad.addColorStop(0.5, '#228B22');
        bgGrad.addColorStop(1, '#2d5a27');
    } else if (monster === '毒龙蜥') {
        bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#4a6741');
        bgGrad.addColorStop(0.5, '#2d5a27');
        bgGrad.addColorStop(1, '#1a3a15');
    } else if (monster === '雷狼龙') {
        bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#2C3E50');
        bgGrad.addColorStop(0.5, '#34495E');
        bgGrad.addColorStop(1, '#1a252f');
    } else if (monster === '火龙') {
        bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#8B0000');
        bgGrad.addColorStop(0.5, '#A0522D');
        bgGrad.addColorStop(1, '#654321');
    } else {
        bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#1a1a2e');
        bgGrad.addColorStop(0.5, '#16213e');
        bgGrad.addColorStop(1, '#0f3460');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 地面纹理
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 30; i++) {
        const gx = ((i * 137 + battle.elapsed * 0.01) % w);
        const gy = h * 0.4 + (i * 73 % (h * 0.5));
        ctx.beginPath();
        ctx.arc(gx, gy, 2 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
    }

    // 画陷阱
    if (battle.trapPos && battle.trapPos.active) {
        ctx.font = '30px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪤', battle.trapPos.x, battle.trapPos.y);
    }

    // 画怪物
    drawMonster(ctx);

    // 画猎人
    drawHunter(ctx);

    // 画投射物
    battle.projectiles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.owner === 'hunter' ? '#FFD700' : '#FF4444';
        ctx.fill();
        // 拖尾
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // 画特效
    battle.effects.forEach(e => {
        const alpha = Math.min(1, e.life / (e.maxLife * 0.3));
        ctx.globalAlpha = alpha;
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText(e.text, e.x, e.y - (e.maxLife - e.life) * 0.02);
        ctx.globalAlpha = 1;
    });

    // 画伤害数字
    battle.dmgNumbers.forEach(d => {
        const alpha = Math.min(1, d.life / 20);
        ctx.globalAlpha = alpha;
        ctx.font = d.crit ? 'bold 28px sans-serif' : 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = d.isHunter ? '#FF4444' : (d.crit ? '#FFD700' : '#FFFFFF');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(d.value, d.x, d.y);
        ctx.fillText(d.value, d.x, d.y);
        ctx.globalAlpha = 1;
    });

    // 屏幕闪白
    if (battle.screenFlash > 0) {
        ctx.globalAlpha = battle.screenFlash / 300 * 0.5;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
    }

    // 怪物预警线
    const m = battle.monster;
    if (m.state === 'telegraph') {
        ctx.strokeStyle = 'rgba(255,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.telegraphX, m.telegraphY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 闪烁提示
        if (Math.floor(battle.elapsed / 200) % 2 === 0) {
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#FF0000';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ ' + m.currentAttack.name, m.x, m.y - m.size - 20);
        }
    }
}

function drawHunter(ctx) {
    const h = battle.hunter;
    const flash = h.invincible > 0 && Math.floor(battle.elapsed / 80) % 2 === 0;
    if (flash) ctx.globalAlpha = 0.4;

    const f = h.facing; // 1=right, -1=left
    const s = h.size;   // ~18
    const cx = h.x, cy = h.y;
    const isRolling = h.state === 'roll';
    const isAttacking = h.state === 'attack';
    const walkCycle = Math.sin(battle.elapsed * 0.008) * 3;
    const isMoving = Math.abs(h.vx) > 0.5 || Math.abs(h.vy) > 0.5;

    ctx.save();
    ctx.translate(cx, cy);
    if (isRolling) {
        ctx.rotate((battle.elapsed * 0.015) * f);
    }

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(0, s + 4, s * 0.7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 腿 (两条)
    const legOffset = isMoving && !isRolling ? walkCycle : 0;
    ctx.fillStyle = '#5D4037';
    // 左腿
    ctx.fillRect(-6, s * 0.4 + legOffset, 5, s * 0.5);
    // 右腿
    ctx.fillRect(1, s * 0.4 - legOffset, 5, s * 0.5);
    // 靴子
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(-7, s * 0.85 + legOffset, 7, 4);
    ctx.fillRect(0, s * 0.85 - legOffset, 7, 4);

    // 身体 - 铠甲
    const armorColor = isRolling ? '#666' : '#8D6E63';
    ctx.fillStyle = armorColor;
    roundRect(ctx, -s * 0.5, -s * 0.3, s, s * 0.75, 4);
    ctx.fill();
    // 铠甲纹路
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-s * 0.1, -s * 0.2);
    ctx.lineTo(-s * 0.1, s * 0.35);
    ctx.moveTo(s * 0.1, -s * 0.2);
    ctx.lineTo(s * 0.1, s * 0.35);
    ctx.stroke();
    // 腰带
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(-s * 0.5, s * 0.25, s, 5);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-3, s * 0.25, 6, 5); // 腰扣

    // 头部
    ctx.fillStyle = '#FFCC80';
    roundRect(ctx, -s * 0.35, -s * 0.9, s * 0.7, s * 0.6, 5);
    ctx.fill();

    // 头盔
    ctx.fillStyle = '#607D8B';
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.5);
    ctx.lineTo(-s * 0.45, -s * 0.85);
    ctx.lineTo(0, -s * 1.1);
    ctx.lineTo(s * 0.45, -s * 0.85);
    ctx.lineTo(s * 0.4, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#455A64';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 头盔护面
    ctx.fillStyle = '#455A64';
    ctx.fillRect(-s * 0.35, -s * 0.55, s * 0.7, 5);

    // 眼睛
    ctx.fillStyle = '#fff';
    const eyeX = f * s * 0.1;
    ctx.fillRect(eyeX - 3, -s * 0.7, 6, 5);
    ctx.fillStyle = '#333';
    ctx.fillRect(eyeX - 1 + f * 2, -s * 0.69, 3, 4);

    // 手臂
    ctx.fillStyle = '#8D6E63';
    if (!isAttacking) {
        // 普通手臂
        ctx.fillRect(f * s * 0.5, -s * 0.15, f * s * 0.3, 6);
        ctx.fillRect(-f * s * 0.5 - (-f) * s * 0.3, -s * 0.1, (-f) * s * 0.3, 6);
    }

    // 武器绘制
    if (isAttacking) {
        const swingAngle = (h.stateTimer / 300) * Math.PI * 0.8 - 0.4;
        ctx.save();
        ctx.translate(f * s * 0.4, -s * 0.1);
        ctx.rotate(f * swingAngle);
        drawWeapon(ctx, f, s);
        ctx.restore();
        // 攻击手臂
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(f * s * 0.4, -s * 0.2, f * s * 0.35, 7);

        // 攻击弧
        ctx.fillStyle = 'rgba(255,200,0,0.25)';
        ctx.beginPath();
        const attackAngle = f === 1 ? 0 : Math.PI;
        ctx.arc(0, 0, battle.weapon.range * 0.8, attackAngle - 0.7, attackAngle + 0.7);
        ctx.lineTo(0, 0);
        ctx.fill();
    } else {
        // 持武器手
        ctx.save();
        ctx.translate(f * s * 0.65, -s * 0.15);
        ctx.rotate(f * 0.3);
        drawWeapon(ctx, f, s);
        ctx.restore();
    }

    ctx.restore();

    // 名字 (在restore之后画，不受旋转影响)
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.strokeText(game.hunter.name, cx, cy + s + 20);
    ctx.fillText(game.hunter.name, cx, cy + s + 20);

    ctx.globalAlpha = 1;
}

function drawWeapon(ctx, facing, s) {
    const weapon = game.hunter.weapon;
    ctx.save();
    switch (weapon) {
        case 'greatsword':
            // 大剑 - 长条剑身+剑柄
            ctx.fillStyle = '#B0BEC5';
            ctx.fillRect(-2, -s * 1.2, 6, s * 1.0);
            ctx.fillStyle = '#78909C';
            ctx.fillRect(-1, -s * 1.2, 4, s * 0.15); // 剑尖
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(-3, -s * 0.2, 8, 6); // 护手
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(0, -s * 0.15, 3, s * 0.2); // 剑柄
            break;
        case 'dualblades':
            // 双刀 - 两把短刀
            ctx.fillStyle = '#B0BEC5';
            ctx.fillRect(-5, -s * 0.6, 3, s * 0.5);
            ctx.fillRect(3, -s * 0.6, 3, s * 0.5);
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(-5, -s * 0.12, 3, 4);
            ctx.fillRect(3, -s * 0.12, 3, 4);
            break;
        case 'bow':
            // 弓 - 弧形弓身+弦
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.6, -Math.PI * 0.7, Math.PI * 0.7, false);
            ctx.stroke();
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(Math.cos(-Math.PI * 0.7) * s * 0.6, Math.sin(-Math.PI * 0.7) * s * 0.6);
            ctx.lineTo(Math.cos(Math.PI * 0.7) * s * 0.6, Math.sin(Math.PI * 0.7) * s * 0.6);
            ctx.stroke();
            break;
        case 'hammer':
            // 大锤 - 锤头+长柄
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(0, -s * 0.8, 4, s * 0.7); // 柄
            ctx.fillStyle = '#757575';
            ctx.fillRect(-6, -s * 1.0, 16, s * 0.25); // 锤头
            ctx.fillStyle = '#616161';
            ctx.fillRect(-5, -s * 0.98, 14, 3); // 锤面高光
            break;
    }
    ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawMonster(ctx) {
    const m = battle.monster;
    const s = m.size;
    const cx = m.x, cy = m.y;
    const eyeDir = battle.hunter.x > cx ? 1 : -1;
    const breathe = Math.sin(battle.elapsed * 0.003) * 2;
    let bodyColor = m.color;
    if (m.enraged && m.state === 'telegraph') bodyColor = '#FF0000';

    ctx.save();
    ctx.translate(cx, cy);

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, s + 8, s * 1.0, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 根据怪物类型选不同画法
    const name = m.name;

    if (name === '大野猪') {
        drawBoar(ctx, s, eyeDir, bodyColor, breathe, m);
    } else if (name === '毒龙蜥') {
        drawLizard(ctx, s, eyeDir, bodyColor, breathe, m);
    } else if (name === '雷狼龙') {
        drawThunderWolf(ctx, s, eyeDir, bodyColor, breathe, m);
    } else if (name === '火龙') {
        drawFireDragon(ctx, s, eyeDir, bodyColor, breathe, m);
    } else if (name === '灭尽龙') {
        drawElderDragon(ctx, s, eyeDir, bodyColor, breathe, m);
    }

    ctx.restore();

    // 怪物名 (restore之后)
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.strokeText(m.name, cx, cy - s - 15);
    ctx.fillText(m.name, cx, cy - s - 15);

    // 状态标记
    if (m.state === 'stunned') {
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('💫', cx, cy - s - 30);
    }
    if (m.state === 'trapped') {
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🪤', cx, cy + s + 22);
    }
    if (m.enraged) {
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', cx + s + 8, cy - s);
    }
}

// --- 大野猪: 矮胖身体 + 獠牙 + 短腿 ---
function drawBoar(ctx, s, dir, color, breathe, m) {
    // 四条短腿
    ctx.fillStyle = '#5D3A1A';
    ctx.fillRect(-s * 0.6, s * 0.3, 8, s * 0.45);
    ctx.fillRect(-s * 0.2, s * 0.35, 8, s * 0.4);
    ctx.fillRect(s * 0.15, s * 0.35, 8, s * 0.4);
    ctx.fillRect(s * 0.45, s * 0.3, 8, s * 0.45);
    // 蹄子
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(-s * 0.62, s * 0.7, 10, 5);
    ctx.fillRect(-s * 0.22, s * 0.7, 10, 5);
    ctx.fillRect(s * 0.13, s * 0.7, 10, 5);
    ctx.fillRect(s * 0.43, s * 0.7, 10, 5);

    // 身体 - 椭圆粗壮
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0 + breathe, s * 1.0, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6D4C2A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 鬃毛（背部）
    ctx.fillStyle = '#3E2723';
    for (let i = -3; i <= 3; i++) {
        ctx.fillRect(i * 7, -s * 0.55 + breathe, 4, -8 - Math.abs(i) * 2);
    }

    // 头部
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.75, -s * 0.15 + breathe, s * 0.4, s * 0.35, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6D4C2A';
    ctx.stroke();

    // 鼻子
    ctx.fillStyle = '#D4A376';
    ctx.beginPath();
    ctx.ellipse(dir * s * 1.05, -s * 0.05 + breathe, s * 0.18, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(dir * s * 1.0, -s * 0.08 + breathe, 3, 0, Math.PI * 2);
    ctx.arc(dir * s * 1.1, -s * 0.08 + breathe, 3, 0, Math.PI * 2);
    ctx.fill();

    // 獠牙
    ctx.fillStyle = '#FFFDE7';
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.85, s * 0.05 + breathe);
    ctx.lineTo(dir * s * 0.95, -s * 0.35 + breathe);
    ctx.lineTo(dir * s * 1.0, s * 0.05 + breathe);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = m.enraged ? '#FF0000' : '#333';
    ctx.beginPath();
    ctx.arc(dir * s * 0.55, -s * 0.25 + breathe, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(dir * s * 0.53, -s * 0.27 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();

    // 尾巴
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-dir * s * 0.9, -s * 0.1 + breathe);
    ctx.quadraticCurveTo(-dir * s * 1.2, -s * 0.4 + breathe, -dir * s * 1.1, -s * 0.6 + breathe);
    ctx.stroke();
}

// --- 毒龙蜥: 长身蜥蜴 + 毒液颜色 ---
function drawLizard(ctx, s, dir, color, breathe, m) {
    // 四条腿(外展)
    ctx.fillStyle = '#1B5E20';
    // 前腿
    ctx.save();
    ctx.translate(dir * s * 0.4, s * 0.15);
    ctx.rotate(dir * 0.6);
    ctx.fillRect(0, 0, 6, s * 0.5);
    ctx.restore();
    ctx.save();
    ctx.translate(-dir * s * 0.1, s * 0.2);
    ctx.rotate(-dir * 0.5);
    ctx.fillRect(0, 0, 6, s * 0.45);
    ctx.restore();
    // 后腿
    ctx.save();
    ctx.translate(dir * s * 0.5, s * 0.3);
    ctx.rotate(dir * 0.7);
    ctx.fillRect(0, 0, 5, s * 0.4);
    ctx.restore();
    ctx.save();
    ctx.translate(-dir * s * 0.3, s * 0.3);
    ctx.rotate(-dir * 0.6);
    ctx.fillRect(0, 0, 5, s * 0.4);
    ctx.restore();

    // 尾巴 - 长而弯曲
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dir * s * 0.6, 0 + breathe);
    ctx.quadraticCurveTo(-dir * s * 1.3, -s * 0.2 + breathe, -dir * s * 1.6, s * 0.2 + breathe + Math.sin(battle.elapsed * 0.005) * 8);
    ctx.stroke();

    // 身体 - 长椭圆
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0 + breathe, s * 0.85, s * 0.45, dir * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 背部花纹
    ctx.fillStyle = '#4CAF50';
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(i * s * 0.25, -s * 0.3 + breathe, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 头部 - 三角扁平
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.7, -s * 0.3 + breathe);
    ctx.lineTo(dir * s * 1.3, -s * 0.1 + breathe);
    ctx.lineTo(dir * s * 1.3, s * 0.15 + breathe);
    ctx.lineTo(dir * s * 0.7, s * 0.3 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 眼睛 - 竖瞳
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.9, -s * 0.15 + breathe, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.9, -s * 0.15 + breathe, 2, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 嘴 - 毒液滴
    if (m.state === 'telegraph' || m.state === 'attack') {
        ctx.fillStyle = '#76FF03';
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(dir * s * 1.35, s * 0.1 + breathe, 4, 0, Math.PI * 2);
        ctx.arc(dir * s * 1.3, s * 0.25 + breathe, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// --- 雷狼龙: 狼型 + 雷电特效 ---
function drawThunderWolf(ctx, s, dir, color, breathe, m) {
    // 四条腿
    ctx.fillStyle = '#283593';
    const legAnim = Math.sin(battle.elapsed * 0.006) * 4;
    ctx.fillRect(-s * 0.5, s * 0.2 + legAnim, 7, s * 0.55);
    ctx.fillRect(-s * 0.15, s * 0.25 - legAnim, 7, s * 0.5);
    ctx.fillRect(s * 0.15, s * 0.2 + legAnim, 7, s * 0.55);
    ctx.fillRect(s * 0.45, s * 0.25 - legAnim, 7, s * 0.5);
    // 爪子
    ctx.fillStyle = '#1A237E';
    [-s * 0.52, -s * 0.17, s * 0.13, s * 0.43].forEach((lx, i) => {
        const off = i % 2 === 0 ? legAnim : -legAnim;
        ctx.fillRect(lx - 1, s * 0.7 + off, 9, 5);
    });

    // 尾巴
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dir * s * 0.6, -s * 0.1 + breathe);
    ctx.quadraticCurveTo(-dir * s * 1.2, -s * 0.5 + breathe, -dir * s * 1.4, -s * 0.2 + breathe + Math.sin(battle.elapsed * 0.007) * 10);
    ctx.stroke();

    // 身体 - 流线型
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0 + breathe, s * 0.9, s * 0.5, dir * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 腹部浅色
    ctx.fillStyle = '#5C6BC0';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.15 + breathe, s * 0.6, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 头部 - 尖锐狼头
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.6, -s * 0.4 + breathe);
    ctx.lineTo(dir * s * 1.25, -s * 0.15 + breathe);
    ctx.lineTo(dir * s * 1.25, s * 0.15 + breathe);
    ctx.lineTo(dir * s * 0.6, s * 0.3 + breathe);
    ctx.closePath();
    ctx.fill();

    // 耳朵
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.55, -s * 0.4 + breathe);
    ctx.lineTo(dir * s * 0.45, -s * 0.85 + breathe);
    ctx.lineTo(dir * s * 0.75, -s * 0.5 + breathe);
    ctx.closePath();
    ctx.fill();

    // 角
    ctx.fillStyle = '#FFD54F';
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.7, -s * 0.5 + breathe);
    ctx.lineTo(dir * s * 0.6, -s * 1.0 + breathe);
    ctx.lineTo(dir * s * 0.85, -s * 0.55 + breathe);
    ctx.closePath();
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#FFEB3B';
    ctx.beginPath();
    ctx.arc(dir * s * 0.85, -s * 0.2 + breathe, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(dir * s * 0.87, -s * 0.2 + breathe, 3, 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴
    ctx.strokeStyle = '#1A237E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dir * s * 1.0, s * 0.0 + breathe);
    ctx.lineTo(dir * s * 1.3, s * 0.05 + breathe);
    ctx.stroke();
    // 牙齿
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(dir * s * 1.1, s * 0.0 + breathe);
    ctx.lineTo(dir * s * 1.15, s * 0.12 + breathe);
    ctx.lineTo(dir * s * 1.2, s * 0.0 + breathe);
    ctx.fill();

    // 雷电特效
    if (m.enraged || m.state === 'telegraph') {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 + Math.sin(battle.elapsed * 0.02) * 0.3;
        for (let i = 0; i < 4; i++) {
            const angle = (battle.elapsed * 0.01 + i * 1.5) % (Math.PI * 2);
            const r = s * 0.8;
            const bx = Math.cos(angle) * r;
            const by = Math.sin(angle) * r * 0.6;
            ctx.beginPath();
            ctx.moveTo(bx, by + breathe);
            ctx.lineTo(bx + 5, by - 10 + breathe);
            ctx.lineTo(bx - 3, by - 8 + breathe);
            ctx.lineTo(bx + 2, by - 18 + breathe);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

// --- 火龙: 翼龙型 + 翅膀 ---
function drawFireDragon(ctx, s, dir, color, breathe, m) {
    // 翅膀 (画在身体后面)
    const wingFlap = Math.sin(battle.elapsed * 0.005) * 15;
    ctx.fillStyle = '#B71C1C';
    ctx.globalAlpha = 0.8;
    // 左翼
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.2 + breathe);
    ctx.quadraticCurveTo(-s * 1.4, -s * 1.0 - wingFlap + breathe, -s * 1.6, -s * 0.3 + breathe);
    ctx.quadraticCurveTo(-s * 1.0, 0 + breathe, -s * 0.3, -s * 0.1 + breathe);
    ctx.fill();
    // 右翼
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.2 + breathe);
    ctx.quadraticCurveTo(s * 1.4, -s * 1.0 - wingFlap + breathe, s * 1.6, -s * 0.3 + breathe);
    ctx.quadraticCurveTo(s * 1.0, 0 + breathe, s * 0.3, -s * 0.1 + breathe);
    ctx.fill();
    // 翼膜纹路
    ctx.strokeStyle = '#880E0E';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.15 + breathe);
    ctx.lineTo(-s * 1.0, -s * 0.7 - wingFlap * 0.5 + breathe);
    ctx.moveTo(-s * 0.3, -s * 0.1 + breathe);
    ctx.lineTo(-s * 1.2, -s * 0.5 - wingFlap * 0.3 + breathe);
    ctx.moveTo(s * 0.3, -s * 0.15 + breathe);
    ctx.lineTo(s * 1.0, -s * 0.7 - wingFlap * 0.5 + breathe);
    ctx.moveTo(s * 0.3, -s * 0.1 + breathe);
    ctx.lineTo(s * 1.2, -s * 0.5 - wingFlap * 0.3 + breathe);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 腿
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(-s * 0.4, s * 0.25, 9, s * 0.5);
    ctx.fillRect(s * 0.25, s * 0.25, 9, s * 0.5);
    // 爪
    ctx.fillStyle = '#4A0000';
    ctx.fillRect(-s * 0.42, s * 0.7, 12, 6);
    ctx.fillRect(s * 0.23, s * 0.7, 12, 6);

    // 尾巴 - 粗且有尖刺
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dir * s * 0.5, s * 0.1 + breathe);
    ctx.quadraticCurveTo(-dir * s * 1.3, -s * 0.1 + breathe, -dir * s * 1.7, s * 0.3 + breathe + Math.sin(battle.elapsed * 0.004) * 8);
    ctx.stroke();
    // 尾刺
    ctx.fillStyle = '#4A0000';
    const tailEndX = -dir * s * 1.7;
    const tailEndY = s * 0.3 + breathe + Math.sin(battle.elapsed * 0.004) * 8;
    ctx.beginPath();
    ctx.moveTo(tailEndX, tailEndY - 8);
    ctx.lineTo(tailEndX - dir * 12, tailEndY);
    ctx.lineTo(tailEndX, tailEndY + 8);
    ctx.closePath();
    ctx.fill();

    // 身体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.05 + breathe, s * 0.75, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲纹路
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.1, s * 0.15 + breathe, s * 0.35, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 脖子
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.4, -s * 0.35 + breathe);
    ctx.lineTo(dir * s * 0.7, -s * 0.7 + breathe);
    ctx.lineTo(dir * s * 0.8, -s * 0.5 + breathe);
    ctx.lineTo(dir * s * 0.5, -s * 0.15 + breathe);
    ctx.closePath();
    ctx.fill();

    // 头部
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.85, -s * 0.75 + breathe, s * 0.35, s * 0.25, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 角
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.7, -s * 0.9 + breathe);
    ctx.lineTo(dir * s * 0.55, -s * 1.3 + breathe);
    ctx.lineTo(dir * s * 0.8, -s * 0.95 + breathe);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.9, -s * 0.95 + breathe);
    ctx.lineTo(dir * s * 0.85, -s * 1.25 + breathe);
    ctx.lineTo(dir * s * 1.0, -s * 0.95 + breathe);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = m.enraged ? '#FF0000' : '#FFA000';
    ctx.beginPath();
    ctx.arc(dir * s * 0.95, -s * 0.8 + breathe, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.97, -s * 0.8 + breathe, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 嘴
    ctx.fillStyle = '#4A0000';
    ctx.beginPath();
    ctx.moveTo(dir * s * 1.0, -s * 0.65 + breathe);
    ctx.lineTo(dir * s * 1.3, -s * 0.7 + breathe);
    ctx.lineTo(dir * s * 1.3, -s * 0.6 + breathe);
    ctx.lineTo(dir * s * 1.0, -s * 0.55 + breathe);
    ctx.closePath();
    ctx.fill();
    // 牙齿
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
        const tx = dir * (s * 1.05 + i * 8);
        ctx.beginPath();
        ctx.moveTo(tx, -s * 0.65 + breathe);
        ctx.lineTo(tx + dir * 3, -s * 0.55 + breathe);
        ctx.lineTo(tx + dir * 6, -s * 0.65 + breathe);
        ctx.fill();
    }

    // 火焰特效
    if (m.state === 'telegraph' || m.state === 'attack') {
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#FF6F00';
        const fx = dir * s * 1.35;
        const fy = -s * 0.65 + breathe;
        for (let i = 0; i < 5; i++) {
            const fr = 4 + Math.random() * 6;
            ctx.beginPath();
            ctx.arc(fx + dir * (i * 5 + Math.random() * 8), fy + (Math.random() - 0.5) * 12, fr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

// --- 灭尽龙: 巨大黑龙 + 棘刺 ---
function drawElderDragon(ctx, s, dir, color, breathe, m) {
    // 翅膀(残破)
    const wingFlap = Math.sin(battle.elapsed * 0.004) * 12;
    ctx.fillStyle = '#212121';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.1 + breathe);
    ctx.lineTo(-s * 1.5, -s * 0.8 - wingFlap + breathe);
    ctx.lineTo(-s * 1.2, -s * 0.2 + breathe);
    ctx.lineTo(-s * 1.4, -s * 0.6 - wingFlap * 0.5 + breathe);
    ctx.lineTo(-s * 0.8, 0 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.3, -s * 0.1 + breathe);
    ctx.lineTo(s * 1.5, -s * 0.8 - wingFlap + breathe);
    ctx.lineTo(s * 1.2, -s * 0.2 + breathe);
    ctx.lineTo(s * 1.4, -s * 0.6 - wingFlap * 0.5 + breathe);
    ctx.lineTo(s * 0.8, 0 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // 粗壮的腿
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-s * 0.5, s * 0.2, 12, s * 0.55);
    ctx.fillRect(s * 0.3, s * 0.2, 12, s * 0.55);
    // 爪
    ctx.fillStyle = '#9C27B0';
    ctx.fillRect(-s * 0.55, s * 0.7, 16, 7);
    ctx.fillRect(s * 0.25, s * 0.7, 16, 7);

    // 尾巴
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = s * 0.22;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-dir * s * 0.5, 0 + breathe);
    ctx.bezierCurveTo(-dir * s * 1.0, -s * 0.3 + breathe, -dir * s * 1.5, s * 0.2 + breathe, -dir * s * 1.8, -s * 0.1 + breathe);
    ctx.stroke();

    // 身体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0 + breathe, s * 0.85, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 棘刺(背部)
    ctx.fillStyle = m.enraged ? '#9C27B0' : '#424242';
    for (let i = -3; i <= 3; i++) {
        const spikeH = 12 + Math.abs(i) * 3 + (m.enraged ? 8 : 0);
        ctx.beginPath();
        ctx.moveTo(i * s * 0.2 - 4, -s * 0.5 + breathe);
        ctx.lineTo(i * s * 0.2, -s * 0.5 - spikeH + breathe);
        ctx.lineTo(i * s * 0.2 + 4, -s * 0.5 + breathe);
        ctx.fill();
    }

    // 脖子
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.4, -s * 0.4 + breathe);
    ctx.lineTo(dir * s * 0.7, -s * 0.85 + breathe);
    ctx.lineTo(dir * s * 0.9, -s * 0.6 + breathe);
    ctx.lineTo(dir * s * 0.6, -s * 0.2 + breathe);
    ctx.closePath();
    ctx.fill();

    // 头部
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.85, -s * 0.85 + breathe, s * 0.4, s * 0.28, dir * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 角(两对)
    ctx.fillStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.65, -s * 1.0 + breathe);
    ctx.lineTo(dir * s * 0.45, -s * 1.5 + breathe);
    ctx.lineTo(dir * s * 0.75, -s * 1.05 + breathe);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.9, -s * 1.05 + breathe);
    ctx.lineTo(dir * s * 0.8, -s * 1.4 + breathe);
    ctx.lineTo(dir * s * 1.0, -s * 1.05 + breathe);
    ctx.fill();

    // 眼睛 - 发光
    ctx.fillStyle = '#E040FB';
    ctx.shadowColor = '#E040FB';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(dir * s * 0.95, -s * 0.9 + breathe, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.97, -s * 0.9 + breathe, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 嘴 + 牙
    ctx.fillStyle = '#311B92';
    ctx.beginPath();
    ctx.moveTo(dir * s * 1.05, -s * 0.75 + breathe);
    ctx.lineTo(dir * s * 1.4, -s * 0.8 + breathe);
    ctx.lineTo(dir * s * 1.4, -s * 0.7 + breathe);
    ctx.lineTo(dir * s * 1.05, -s * 0.65 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 4; i++) {
        const tx = dir * (s * 1.1 + i * 7);
        ctx.beginPath();
        ctx.moveTo(tx, -s * 0.75 + breathe);
        ctx.lineTo(tx + dir * 2, -s * 0.63 + breathe);
        ctx.lineTo(tx + dir * 5, -s * 0.75 + breathe);
        ctx.fill();
    }

    // 愤怒特效 - 紫色粒子
    if (m.enraged) {
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 8; i++) {
            const angle = (battle.elapsed * 0.003 + i * 0.8) % (Math.PI * 2);
            const r = s * 1.0 + Math.sin(battle.elapsed * 0.01 + i) * 10;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r * 0.5 + breathe;
            ctx.fillStyle = i % 2 === 0 ? '#E040FB' : '#7C4DFF';
            ctx.beginPath();
            ctx.arc(px, py, 3 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

// ===== HUD 更新 =====
function updateBattleHUD() {
    if (!battle) return;
    const h = battle.hunter;
    const m = battle.monster;

    $('monsterName').textContent = `${m.icon} ${m.name} ${m.enraged ? '🔥' : ''}`;
    $('monsterHpFill').style.width = (m.hp / m.maxHp * 100) + '%';
    $('hunterHpFill').style.width = (h.hp / h.maxHp * 100) + '%';
    $('staminaFill').style.width = (h.stamina / h.maxStamina * 100) + '%';

    const mins = Math.floor(battle.timeLeft / 60);
    const secs = Math.floor(battle.timeLeft % 60);
    $('battleTimer').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    $('potionCount').textContent = battle.items.potion;
    $('megapotionCount').textContent = battle.items.megapotion;
    $('trapCount').textContent = battle.items.trap;
    $('bombCount').textContent = battle.items.bomb;
}

// ===== 战斗结束 =====
function endBattle(victory) {
    battle.finished = true;
    cancelAnimationFrame(battleAnimId);
    window.removeEventListener('keydown', onBattleKeyDown);
    window.removeEventListener('keyup', onBattleKeyUp);
    window.removeEventListener('resize', resizeBattleCanvas);

    const title = $('resultTitle');
    const body = $('resultBody');

    if (victory) {
        title.textContent = '🎉 狩猎完成！';
        title.className = 'victory';
        const monsterData = MONSTER_DATA[battle.quest.monster];
        const rewards = monsterData.rewards;

        // 给予奖励
        game.hunter.zenny += rewards.zenny;
        game.hunter.exp += rewards.exp;
        game.hunter.questsCompleted++;

        let rewardHTML = `<div class="reward-item">💰 获得 ${rewards.zenny}z</div>`;
        rewardHTML += `<div class="reward-item">⭐ 获得 ${rewards.exp} 经验</div>`;

        // 素材掉落
        rewards.materials.forEach(mat => {
            if (Math.random() * 100 < mat.rate) {
                game.materials[mat.name] = (game.materials[mat.name] || 0) + 1;
                rewardHTML += `<div class="reward-item material">${mat.icon} 获得 ${mat.name}</div>`;
            }
        });

        // 升级
        while (game.hunter.exp >= game.hunter.maxExp) {
            game.hunter.exp -= game.hunter.maxExp;
            game.hunter.hr++;
            game.hunter.maxExp = Math.floor(game.hunter.maxExp * 1.4);
            game.hunter.maxHp += 10;
            game.hunter.baseAtk += 2;
            game.hunter.baseDef += 1;
            rewardHTML += `<div class="reward-item" style="color:#FFD700;font-weight:bold;">🆙 猎人等级提升至 HR${game.hunter.hr}！</div>`;
        }

        body.innerHTML = rewardHTML;
    } else {
        title.textContent = '💀 狩猎失败...';
        title.className = 'defeat';
        body.innerHTML = '<div class="reward-item">任务失败，下次再来吧！</div>';
    }

    $('btnResultOk').onclick = () => {
        hideModal('result');
        showScreen('main');
        refreshMainUI();
    };

    showModal('result');
}

// ===== 初始化 =====
function init() {
    initTitle();
    initCharCreate();
    bindMainButtons();
}

window.addEventListener('DOMContentLoaded', init);

// 移动端虚拟控制器
(function initMobileControls() {
    // 方向键: battle.keys[key] = true/false
    document.querySelectorAll('.ctrl-btn[data-key]').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!battle || battle.finished) return;
            var k = btn.dataset.key;
            battle.keys[k] = true;
        }, { passive: false });
        btn.addEventListener('touchend', function(e) {
            e.preventDefault();
            if (!battle) return;
            battle.keys[btn.dataset.key] = false;
        }, { passive: false });
        btn.addEventListener('touchcancel', function(e) {
            e.preventDefault();
            if (!battle) return;
            battle.keys[btn.dataset.key] = false;
        }, { passive: false });
    });
    // 动作按钮
    document.querySelectorAll('.ctrl-btn[data-action]').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!battle || battle.finished) return;
            var a = btn.dataset.action;
            if (a === 'attack') hunterAttack();
            else if (a === 'roll') hunterRoll();
            else if (a === 'item') useSelectedItem();
        }, { passive: false });
    });
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
})();
