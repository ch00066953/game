(() => {
  /* ===== 数据定义 ===== */
  const AREAS = {
    village: {
      name: '新手村', desc: '宁静的村庄，周围是青翠的田野。',
      actions: [
        { label: '🗡️ 外出战斗', action: 'battle', enemies: ['slime', 'wolf'] },
        { label: '🏪 商店', action: 'shop' },
        { label: '➡️ 前往森林', action: 'travel', target: 'forest', reqLevel: 3 },
      ]
    },
    forest: {
      name: '黑暗森林', desc: '参天大树遮蔽了阳光，怪物出没。',
      actions: [
        { label: '🗡️ 深入探索', action: 'battle', enemies: ['goblin', 'bear', 'wolf'] },
        { label: '➡️ 前往山脉', action: 'travel', target: 'mountain', reqLevel: 6 },
        { label: '⬅️ 返回新手村', action: 'travel', target: 'village' },
      ]
    },
    mountain: {
      name: '龙脊山', desc: '险峻的山脉，传说有巨龙栖息。',
      actions: [
        { label: '🗡️ 挑战强敌', action: 'battle', enemies: ['golem', 'drake'] },
        { label: '🐉 挑战巨龙', action: 'battle', enemies: ['dragon'], reqLevel: 8 },
        { label: '⬅️ 返回森林', action: 'travel', target: 'forest' },
      ]
    },
  };

  const ENEMIES = {
    slime:  { name: '史莱姆', emoji: '🟢', hp: 10, atk: 3, def: 0, exp: 8, gold: 5 },
    wolf:   { name: '灰狼', emoji: '🐺', hp: 16, atk: 5, def: 1, exp: 12, gold: 8 },
    goblin: { name: '哥布林', emoji: '👺', hp: 22, atk: 7, def: 2, exp: 20, gold: 15 },
    bear:   { name: '巨熊', emoji: '🐻', hp: 35, atk: 9, def: 3, exp: 30, gold: 20 },
    golem:  { name: '石像', emoji: '🗿', hp: 50, atk: 11, def: 6, exp: 45, gold: 35 },
    drake:  { name: '飞龙', emoji: '🦎', hp: 55, atk: 14, def: 4, exp: 55, gold: 40 },
    dragon: { name: '古龙', emoji: '🐉', hp: 120, atk: 20, def: 8, exp: 200, gold: 150 },
  };

  const ITEMS = {
    potion:      { name: '生命药水', desc: '恢复 20 HP', type: 'consumable', heal: 20, price: 15 },
    bigPotion:   { name: '大生命药水', desc: '恢复 50 HP', type: 'consumable', heal: 50, price: 40 },
    sword1:      { name: '铁剑', desc: 'ATK +3', type: 'weapon', atk: 3, price: 50 },
    sword2:      { name: '精钢剑', desc: 'ATK +6', type: 'weapon', atk: 6, price: 120 },
    sword3:      { name: '烈焰剑', desc: 'ATK +10', type: 'weapon', atk: 10, price: 300 },
    armor1:      { name: '皮甲', desc: 'DEF +2', type: 'armor', def: 2, price: 40 },
    armor2:      { name: '铁甲', desc: 'DEF +5', type: 'armor', def: 5, price: 100 },
    armor3:      { name: '龙鳞甲', desc: 'DEF +9', type: 'armor', def: 9, price: 280 },
  };

  const QUESTS = [
    { id: 'q1', name: '消灭3只史莱姆', desc: '新手村的委托', target: 'slime', count: 3, rewardGold: 30, rewardExp: 20 },
    { id: 'q2', name: '猎杀5只灰狼', desc: '猎人协会的委托', target: 'wolf', count: 5, rewardGold: 50, rewardExp: 40 },
    { id: 'q3', name: '消灭3只哥布林', desc: '森林巡逻任务', target: 'goblin', count: 3, rewardGold: 60, rewardExp: 50 },
    { id: 'q4', name: '击败古龙', desc: '传说中的挑战', target: 'dragon', count: 1, rewardGold: 200, rewardExp: 300 },
  ];

  const LEVEL_EXP = [0, 20, 50, 100, 170, 260, 380, 530, 720, 950, 1250];

  /* ===== DOM ===== */
  const $ = id => document.getElementById(id);
  const levelEl = $('level'), hpEl = $('hp'), maxHpEl = $('maxHp');
  const atkEl = $('atk'), defEl = $('def');
  const expEl = $('exp'), expMaxEl = $('expMax'), goldEl = $('gold');
  const areaName = $('areaName'), areaDesc = $('areaDesc'), areaActions = $('areaActions');
  const battlePanel = $('battlePanel');
  const enemyEmoji = $('enemyEmoji'), enemyNameEl = $('enemyName'), enemyHpEl = $('enemyHp');
  const battleLog = $('battleLog');
  const shopPanel = $('shopPanel'), shopItems = $('shopItems');
  const inventoryModal = $('inventoryModal'), inventoryList = $('inventoryList');
  const questModal = $('questModal'), questList = $('questList');
  const statusMsg = $('statusMsg');

  /* ===== 状态 ===== */
  let state;

  function newState() {
    return {
      level: 1, hp: 50, maxHp: 50,
      baseAtk: 5, baseDef: 2,
      exp: 0, gold: 0,
      area: 'village',
      inventory: [{ id: 'potion', qty: 3 }],
      equipment: { weapon: null, armor: null },
      quests: [{ ...QUESTS[0], progress: 0, done: false }],
      kills: {},
      inBattle: false,
      enemy: null,
      defending: false,
    };
  }

  function getAtk() {
    let a = state.baseAtk;
    if (state.equipment.weapon) a += ITEMS[state.equipment.weapon].atk;
    return a;
  }
  function getDef() {
    let d = state.baseDef;
    if (state.equipment.armor) d += ITEMS[state.equipment.armor].def;
    return d;
  }

  /* ===== 初始化 ===== */
  function initGame() {
    state = newState();
    renderArea();
    renderHUD();
  }

  /* ===== 区域 ===== */
  function renderArea() {
    const area = AREAS[state.area];
    areaName.textContent = area.name;
    areaDesc.textContent = area.desc;
    areaActions.innerHTML = '';
    battlePanel.classList.add('hidden');
    shopPanel.classList.add('hidden');

    area.actions.forEach(a => {
      const btn = document.createElement('button');
      btn.textContent = a.label;
      if (a.reqLevel && state.level < a.reqLevel) {
        btn.disabled = true;
        btn.textContent += ` (需 Lv.${a.reqLevel})`;
      }
      btn.addEventListener('click', () => handleAction(a));
      areaActions.appendChild(btn);
    });
  }

  function handleAction(a) {
    if (a.action === 'travel') {
      if (a.reqLevel && state.level < a.reqLevel) return;
      state.area = a.target;
      statusMsg.textContent = `来到了 ${AREAS[a.target].name}`;
      renderArea();
    } else if (a.action === 'battle') {
      const eid = a.enemies[Math.floor(Math.random() * a.enemies.length)];
      startBattle(eid);
    } else if (a.action === 'shop') {
      openShop();
    }
  }

  /* ===== 战斗 ===== */
  function startBattle(eid) {
    const base = ENEMIES[eid];
    state.enemy = { id: eid, ...base, curHp: base.hp };
    state.inBattle = true;
    state.defending = false;
    battlePanel.classList.remove('hidden');
    battleLog.innerHTML = '';
    logBattle(`遭遇了 ${base.emoji} ${base.name}！`);
    renderEnemy();
    renderHUD();
  }

  function renderEnemy() {
    if (!state.enemy) return;
    enemyEmoji.textContent = state.enemy.emoji;
    enemyNameEl.textContent = ' ' + state.enemy.name;
    enemyHpEl.textContent = ` HP: ${Math.max(0, state.enemy.curHp)}/${state.enemy.hp}`;
  }

  function logBattle(msg) {
    const p = document.createElement('div');
    p.textContent = msg;
    battleLog.appendChild(p);
    battleLog.scrollTop = battleLog.scrollHeight;
  }

  function playerAttack() {
    if (!state.inBattle) return;
    state.defending = false;
    const dmg = Math.max(1, getAtk() - state.enemy.def + Math.floor(Math.random() * 3));
    state.enemy.curHp -= dmg;
    logBattle(`你造成了 ${dmg} 点伤害！`);

    if (state.enemy.curHp <= 0) {
      winBattle();
      return;
    }
    enemyAttack();
  }

  function playerDefend() {
    if (!state.inBattle) return;
    state.defending = true;
    logBattle('你举起盾牌防御！');
    enemyAttack();
  }

  function playerHeal() {
    if (!state.inBattle) return;
    const potionIdx = state.inventory.findIndex(i => i.id === 'potion' || i.id === 'bigPotion');
    if (potionIdx === -1) { logBattle('没有药水了！'); return; }
    const inv = state.inventory[potionIdx];
    const item = ITEMS[inv.id];
    state.hp = Math.min(state.maxHp, state.hp + item.heal);
    inv.qty--;
    if (inv.qty <= 0) state.inventory.splice(potionIdx, 1);
    logBattle(`使用 ${item.name}，恢复 ${item.heal} HP！`);
    state.defending = false;
    enemyAttack();
  }

  function playerFlee() {
    if (!state.inBattle) return;
    if (Math.random() < 0.5) {
      logBattle('逃跑成功！');
      endBattle();
    } else {
      logBattle('逃跑失败！');
      state.defending = false;
      enemyAttack();
    }
  }

  function enemyAttack() {
    const eDmg = Math.max(1, state.enemy.atk - getDef() * (state.defending ? 2 : 1) + Math.floor(Math.random() * 2));
    const actual = Math.max(0, eDmg);
    state.hp -= actual;
    logBattle(`${state.enemy.name} 造成了 ${actual} 点伤害！`);

    if (state.hp <= 0) {
      state.hp = 0;
      logBattle('你被击败了…');
      statusMsg.textContent = '你倒下了，恢复到村庄';
      state.inBattle = false;
      state.enemy = null;
      // 复活到村庄
      state.hp = Math.floor(state.maxHp / 2);
      state.area = 'village';
      setTimeout(() => { renderArea(); renderHUD(); }, 1000);
      return;
    }
    renderEnemy();
    renderHUD();
  }

  function winBattle() {
    const e = state.enemy;
    logBattle(`${e.emoji} ${e.name} 被击败！获得 ${e.exp} EXP, ${e.gold} 金币`);
    state.exp += e.exp;
    state.gold += e.gold;
    state.kills[e.id] = (state.kills[e.id] || 0) + 1;

    // 任务进度
    state.quests.forEach(q => {
      if (!q.done && q.target === e.id) {
        q.progress++;
        if (q.progress >= q.count) {
          q.done = true;
          state.gold += q.rewardGold;
          state.exp += q.rewardExp;
          logBattle(`✅ 完成任务: ${q.name}！获得 ${q.rewardGold} 金, ${q.rewardExp} EXP`);
          // 解锁下一个任务
          unlockNextQuest(q.id);
        }
      }
    });

    checkLevelUp();
    endBattle();
  }

  function unlockNextQuest(completedId) {
    const idx = QUESTS.findIndex(q => q.id === completedId);
    if (idx + 1 < QUESTS.length) {
      const next = QUESTS[idx + 1];
      if (!state.quests.find(q => q.id === next.id)) {
        state.quests.push({ ...next, progress: state.kills[next.target] || 0, done: false });
        if (state.quests[state.quests.length - 1].progress >= next.count) {
          state.quests[state.quests.length - 1].done = true;
          state.gold += next.rewardGold;
          state.exp += next.rewardExp;
        }
      }
    }
  }

  function checkLevelUp() {
    while (state.level < LEVEL_EXP.length - 1 && state.exp >= LEVEL_EXP[state.level]) {
      state.exp -= LEVEL_EXP[state.level];
      state.level++;
      state.maxHp += 8;
      state.hp = state.maxHp;
      state.baseAtk += 2;
      state.baseDef += 1;
      logBattle(`🎉 升级到 Lv.${state.level}！HP+8 ATK+2 DEF+1`);
      statusMsg.textContent = `升级到 Lv.${state.level}！`;
    }
  }

  function endBattle() {
    state.inBattle = false;
    state.enemy = null;
    setTimeout(() => {
      battlePanel.classList.add('hidden');
      renderArea();
      renderHUD();
    }, 800);
  }

  /* ===== 商店 ===== */
  function openShop() {
    shopPanel.classList.remove('hidden');
    shopItems.innerHTML = '';
    const sellable = ['potion', 'bigPotion', 'sword1', 'sword2', 'sword3', 'armor1', 'armor2', 'armor3'];
    sellable.forEach(id => {
      const item = ITEMS[id];
      const div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = `<span>${item.name} — ${item.desc} (${item.price}💰)</span>`;
      const btn = document.createElement('button');
      btn.textContent = '购买';
      if (state.gold < item.price) btn.disabled = true;
      btn.addEventListener('click', () => buyItem(id));
      div.appendChild(btn);
      shopItems.appendChild(div);
    });
  }

  function buyItem(id) {
    const item = ITEMS[id];
    if (state.gold < item.price) return;
    state.gold -= item.price;

    if (item.type === 'consumable') {
      const inv = state.inventory.find(i => i.id === id);
      if (inv) inv.qty++;
      else state.inventory.push({ id, qty: 1 });
    } else if (item.type === 'weapon') {
      state.equipment.weapon = id;
      statusMsg.textContent = `装备了 ${item.name}！`;
    } else if (item.type === 'armor') {
      state.equipment.armor = id;
      statusMsg.textContent = `装备了 ${item.name}！`;
    }

    renderHUD();
    openShop(); // 刷新
  }

  /* ===== 背包 ===== */
  function showInventory() {
    inventoryModal.classList.remove('hidden');
    inventoryList.innerHTML = '';

    // 装备
    if (state.equipment.weapon) {
      const w = ITEMS[state.equipment.weapon];
      const div = document.createElement('div');
      div.className = 'list-item';
      div.textContent = `⚔️ ${w.name} (已装备)`;
      inventoryList.appendChild(div);
    }
    if (state.equipment.armor) {
      const a = ITEMS[state.equipment.armor];
      const div = document.createElement('div');
      div.className = 'list-item';
      div.textContent = `🛡️ ${a.name} (已装备)`;
      inventoryList.appendChild(div);
    }

    // 消耗品
    state.inventory.forEach(inv => {
      const item = ITEMS[inv.id];
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `<span>${item.name} ×${inv.qty}</span>`;
      if (item.type === 'consumable' && !state.inBattle) {
        const btn = document.createElement('button');
        btn.textContent = '使用';
        btn.addEventListener('click', () => {
          state.hp = Math.min(state.maxHp, state.hp + item.heal);
          inv.qty--;
          if (inv.qty <= 0) state.inventory.splice(state.inventory.indexOf(inv), 1);
          renderHUD();
          showInventory();
        });
        div.appendChild(btn);
      }
      inventoryList.appendChild(div);
    });

    if (inventoryList.children.length === 0) {
      inventoryList.innerHTML = '<div class="list-item">背包空空如也</div>';
    }
  }

  /* ===== 任务 ===== */
  function showQuests() {
    questModal.classList.remove('hidden');
    questList.innerHTML = '';
    state.quests.forEach(q => {
      const div = document.createElement('div');
      div.className = 'list-item';
      const status = q.done ? '✅' : `(${q.progress}/${q.count})`;
      div.textContent = `${status} ${q.name} — ${q.desc}`;
      questList.appendChild(div);
    });
    if (state.quests.length === 0) {
      questList.innerHTML = '<div class="list-item">暂无任务</div>';
    }
  }

  /* ===== 存档 ===== */
  function saveGame() {
    try {
      localStorage.setItem('rpg_save', JSON.stringify(state));
      statusMsg.textContent = '存档成功！';
    } catch (e) {
      statusMsg.textContent = '存档失败';
    }
  }

  function loadGame() {
    try {
      const data = localStorage.getItem('rpg_save');
      if (!data) { statusMsg.textContent = '没有存档'; return; }
      state = JSON.parse(data);
      statusMsg.textContent = '读档成功！';
      state.inBattle = false;
      state.enemy = null;
      renderArea();
      renderHUD();
    } catch (e) {
      statusMsg.textContent = '读档失败';
    }
  }

  /* ===== HUD ===== */
  function renderHUD() {
    levelEl.textContent = state.level;
    hpEl.textContent = Math.max(0, state.hp);
    maxHpEl.textContent = state.maxHp;
    atkEl.textContent = getAtk();
    defEl.textContent = getDef();
    expEl.textContent = state.exp;
    expMaxEl.textContent = LEVEL_EXP[state.level] || '---';
    goldEl.textContent = state.gold;
  }

  /* ===== 事件绑定 ===== */
  $('btnAttack').addEventListener('click', playerAttack);
  $('btnDefend').addEventListener('click', playerDefend);
  $('btnHeal').addEventListener('click', playerHeal);
  $('btnFlee').addEventListener('click', playerFlee);
  $('btnLeaveShop').addEventListener('click', () => { shopPanel.classList.add('hidden'); });
  $('btnInventory').addEventListener('click', showInventory);
  $('btnCloseInv').addEventListener('click', () => inventoryModal.classList.add('hidden'));
  $('btnQuests').addEventListener('click', showQuests);
  $('btnCloseQuest').addEventListener('click', () => questModal.classList.add('hidden'));
  $('btnSave').addEventListener('click', saveGame);
  $('btnLoad').addEventListener('click', loadGame);

  /* ===== 启动 ===== */
  initGame();
})();
