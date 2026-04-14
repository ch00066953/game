(() => {
  /* ===== 卡牌定义 ===== */
  const CARD_DB = {
    strike:   { name: '打击', cost: 1, type: 'attack', damage: 6, desc: '造成 6 点伤害' },
    bash:     { name: '猛击', cost: 2, type: 'attack', damage: 12, desc: '造成 12 点伤害' },
    cleave:   { name: '横扫', cost: 1, type: 'attack', damage: 4, aoe: true, desc: '对所有敌人造成 4 点伤害' },
    defend:   { name: '防御', cost: 1, type: 'defend', block: 5, desc: '获得 5 点护盾' },
    iron_wall:{ name: '铁壁', cost: 2, type: 'defend', block: 12, desc: '获得 12 点护盾' },
    heal:     { name: '治疗', cost: 1, type: 'skill', heal: 6, desc: '恢复 6 点 HP' },
    poison:   { name: '淬毒', cost: 1, type: 'attack', damage: 3, poison: 3, desc: '造成 3 伤害，附加 3 层毒' },
    empower:  { name: '强化', cost: 0, type: 'skill', buff: 'strength', amount: 2, desc: '获得 2 点力量（本场战斗）' },
    dual:     { name: '二连击', cost: 1, type: 'attack', damage: 4, hits: 2, desc: '造成 4×2 点伤害' },
    shield_bash:{ name: '盾击', cost: 2, type: 'attack', damage: 0, blockDmg: true, desc: '造成等同护盾值的伤害' },
  };

  const STARTER_DECK = ['strike','strike','strike','strike','strike','defend','defend','defend','defend','bash'];

  /* ===== 敌人定义 ===== */
  const ENEMY_DB = [
    { name: '史莱姆', emoji: '🟢', hp: 12, actions: [{type:'attack',value:5},{type:'attack',value:6}] },
    { name: '骷髅', emoji: '💀', hp: 20, actions: [{type:'attack',value:8},{type:'defend',value:4},{type:'attack',value:6}] },
    { name: '蝙蝠', emoji: '🦇', hp: 15, actions: [{type:'attack',value:4},{type:'attack',value:4},{type:'attack',value:7}] },
    { name: '黑骑士', emoji: '⚔️', hp: 35, actions: [{type:'attack',value:10},{type:'defend',value:8},{type:'attack',value:14}] },
    { name: '巨龙', emoji: '🐉', hp: 55, actions: [{type:'attack',value:12},{type:'attack',value:18},{type:'defend',value:10}] },
  ];

  /* ===== DOM ===== */
  const floorEl = document.getElementById('floor');
  const hpEl = document.getElementById('hp');
  const maxHpEl = document.getElementById('maxHp');
  const energyEl = document.getElementById('energy');
  const blockEl = document.getElementById('block');
  const statusMsg = document.getElementById('statusMsg');
  const endTurnBtn = document.getElementById('endTurnBtn');
  const restartBtn = document.getElementById('restartBtn');
  const enemyZone = document.getElementById('enemyZone');
  const handArea = document.getElementById('handArea');
  const rewardArea = document.getElementById('rewardArea');
  const rewardChoices = document.getElementById('rewardChoices');

  /* ===== 状态 ===== */
  let state;

  function initGame() {
    state = {
      floor: 1,
      hp: 50, maxHp: 50,
      deck: [...STARTER_DECK],
      draw: [], discard: [], hand: [],
      energy: 0, maxEnergy: 3,
      block: 0,
      strength: 0,
      enemies: [],
      phase: 'battle', // battle | reward | gameover
      turn: 0,
      selectedCard: null
    };
    startBattle();
  }

  /* ===== 战斗 ===== */
  function startBattle() {
    state.draw = shuffle([...state.deck]);
    state.discard = [];
    state.hand = [];
    state.block = 0;
    state.strength = 0;
    state.turn = 0;

    // 根据层数生成敌人
    const floor = state.floor;
    state.enemies = [];
    if (floor <= 3) {
      const idx = Math.min(floor - 1, 2);
      state.enemies.push(makeEnemy(ENEMY_DB[idx], floor));
    } else if (floor <= 6) {
      state.enemies.push(makeEnemy(ENEMY_DB[Math.min(floor - 2, 3)], floor));
      state.enemies.push(makeEnemy(ENEMY_DB[0], floor));
    } else {
      state.enemies.push(makeEnemy(ENEMY_DB[4], floor)); // Boss
    }

    state.phase = 'battle';
    startPlayerTurn();
  }

  function makeEnemy(base, floor) {
    const hpMult = 1 + (floor - 1) * 0.2;
    return {
      name: base.name,
      emoji: base.emoji,
      hp: Math.round(base.hp * hpMult),
      maxHp: Math.round(base.hp * hpMult),
      block: 0,
      poison: 0,
      actions: base.actions,
      actionIdx: 0,
      intent: null
    };
  }

  function startPlayerTurn() {
    state.block = 0;
    state.energy = state.maxEnergy;
    state.selectedCard = null;

    // 毒伤
    state.enemies.forEach(e => {
      if (e.poison > 0 && e.hp > 0) {
        e.hp -= e.poison;
        e.poison--;
      }
    });
    state.enemies = state.enemies.filter(e => e.hp > 0);
    if (state.enemies.length === 0) { winBattle(); return; }

    // 设置敌人意图
    state.enemies.forEach(e => {
      e.intent = e.actions[e.actionIdx % e.actions.length];
    });

    drawCards(5);
    statusMsg.textContent = '你的回合 — 选择卡牌出战';
    render();
  }

  function drawCards(n) {
    for (let i = 0; i < n; i++) {
      if (state.draw.length === 0) {
        state.draw = shuffle(state.discard);
        state.discard = [];
      }
      if (state.draw.length > 0) {
        state.hand.push(state.draw.pop());
      }
    }
  }

  function playCard(cardIdx, targetIdx) {
    const cardId = state.hand[cardIdx];
    const card = CARD_DB[cardId];
    if (!card || state.energy < card.cost) return;

    state.energy -= card.cost;

    if (card.type === 'attack') {
      const baseDmg = (card.blockDmg ? state.block : card.damage) + state.strength;
      const hits = card.hits || 1;

      if (card.aoe) {
        state.enemies.forEach(e => {
          for (let h = 0; h < hits; h++) dealDamage(e, baseDmg);
          if (card.poison) e.poison = (e.poison || 0) + card.poison;
        });
      } else if (targetIdx >= 0 && targetIdx < state.enemies.length) {
        const e = state.enemies[targetIdx];
        for (let h = 0; h < hits; h++) dealDamage(e, baseDmg);
        if (card.poison) e.poison = (e.poison || 0) + card.poison;
      }
    } else if (card.type === 'defend') {
      state.block += card.block;
    } else if (card.type === 'skill') {
      if (card.heal) state.hp = Math.min(state.maxHp, state.hp + card.heal);
      if (card.buff === 'strength') state.strength += card.amount;
    }

    state.hand.splice(cardIdx, 1);
    state.discard.push(cardId);

    // 清除死亡敌人
    state.enemies = state.enemies.filter(e => e.hp > 0);
    if (state.enemies.length === 0) { winBattle(); return; }

    render();
  }

  function dealDamage(enemy, dmg) {
    let remaining = dmg;
    if (enemy.block > 0) {
      const absorbed = Math.min(enemy.block, remaining);
      enemy.block -= absorbed;
      remaining -= absorbed;
    }
    enemy.hp -= remaining;
  }

  function endTurn() {
    if (state.phase !== 'battle') return;
    // 弃手牌
    state.discard.push(...state.hand);
    state.hand = [];

    // 敌人行动
    state.enemies.forEach(e => {
      if (e.hp <= 0) return;
      const action = e.intent;
      if (action.type === 'attack') {
        let dmg = action.value;
        // 护盾吸收
        let rem = dmg;
        if (state.block > 0) {
          const abs = Math.min(state.block, rem);
          state.block -= abs;
          rem -= abs;
        }
        state.hp -= rem;
      } else if (action.type === 'defend') {
        e.block += action.value;
      }
      e.actionIdx++;
    });

    if (state.hp <= 0) {
      state.phase = 'gameover';
      statusMsg.textContent = '你已倒下… 点击重新开始';
      render();
      return;
    }

    state.turn++;
    startPlayerTurn();
  }

  function winBattle() {
    state.phase = 'reward';
    statusMsg.textContent = '胜利！选择一张奖励卡牌';
    showRewards();
    render();
  }

  /* ===== 奖励 ===== */
  function showRewards() {
    const pool = Object.keys(CARD_DB).filter(k => !STARTER_DECK.includes(k) || Math.random() < 0.3);
    const choices = shuffle(pool).slice(0, 3);
    if (choices.length === 0) choices.push('strike');

    rewardArea.classList.remove('hidden');
    rewardChoices.innerHTML = '';

    choices.forEach(cardId => {
      const card = CARD_DB[cardId];
      const el = document.createElement('div');
      el.className = 'card reward-card card-' + card.type;
      el.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-desc">${card.desc}</div>
      `;
      el.addEventListener('click', () => {
        state.deck.push(cardId);
        state.hp = Math.min(state.maxHp, state.hp + 5); // 战后回血
        rewardArea.classList.add('hidden');
        state.floor++;
        if (state.floor > 8) {
          state.phase = 'gameover';
          statusMsg.textContent = '🎉 通关！你征服了地牢！';
          render();
        } else {
          startBattle();
        }
      });
      rewardChoices.appendChild(el);
    });

    // Skip 选项
    const skip = document.createElement('button');
    skip.textContent = '跳过奖励';
    skip.style.marginTop = '10px';
    skip.addEventListener('click', () => {
      state.hp = Math.min(state.maxHp, state.hp + 5);
      rewardArea.classList.add('hidden');
      state.floor++;
      if (state.floor > 8) {
        state.phase = 'gameover';
        statusMsg.textContent = '🎉 通关！你征服了地牢！';
        render();
      } else {
        startBattle();
      }
    });
    rewardChoices.appendChild(skip);
  }

  /* ===== 渲染 ===== */
  function render() {
    floorEl.textContent = state.floor;
    hpEl.textContent = Math.max(0, state.hp);
    maxHpEl.textContent = state.maxHp;
    energyEl.textContent = state.energy;
    blockEl.textContent = state.block;

    // 敌人
    enemyZone.innerHTML = '';
    state.enemies.forEach((e, i) => {
      const div = document.createElement('div');
      div.className = 'enemy-card';
      const hpPct = Math.max(0, e.hp / e.maxHp * 100);
      let intentText = '';
      if (e.intent) {
        if (e.intent.type === 'attack') intentText = '意图: ⚔️ ' + e.intent.value;
        else if (e.intent.type === 'defend') intentText = '意图: 🛡️ ' + e.intent.value;
      }
      div.innerHTML = `
        <div class="enemy-name">${e.name}</div>
        <div class="enemy-emoji">${e.emoji}</div>
        <div class="hp-bar"><div class="hp-bar-fill" style="width:${hpPct}%"></div></div>
        <div class="enemy-hp">HP: ${Math.max(0, e.hp)} / ${e.maxHp}</div>
        ${e.block > 0 ? `<div class="enemy-block">🛡️ ${e.block}</div>` : ''}
        ${e.poison > 0 ? `<div style="color:#2ecc71;font-size:12px">🧪 毒 ${e.poison}</div>` : ''}
        <div class="enemy-intent">${intentText}</div>
      `;
      div.addEventListener('click', () => {
        if (state.selectedCard !== null) {
          playCard(state.selectedCard, i);
          state.selectedCard = null;
        }
      });
      enemyZone.appendChild(div);
    });

    // 手牌
    handArea.innerHTML = '';
    state.hand.forEach((cardId, idx) => {
      const card = CARD_DB[cardId];
      const div = document.createElement('div');
      div.className = 'card card-' + card.type;
      if (card.cost > state.energy) div.classList.add('disabled');
      div.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-desc">${card.desc}</div>
      `;
      div.addEventListener('click', () => {
        if (state.phase !== 'battle') return;
        if (card.cost > state.energy) return;

        if (card.type === 'attack' && !card.aoe) {
          // 需要选择目标
          if (state.enemies.length === 1) {
            playCard(idx, 0);
          } else {
            state.selectedCard = idx;
            statusMsg.textContent = '点击一个敌人作为目标';
            // 高亮卡牌
            handArea.querySelectorAll('.card').forEach(c => c.style.outline = '');
            div.style.outline = '2px solid #fff';
          }
        } else {
          // 防御/技能/AOE 直接使用
          playCard(idx, 0);
        }
      });
      handArea.appendChild(div);
    });
  }

  /* ===== 工具 ===== */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ===== 事件 ===== */
  endTurnBtn.addEventListener('click', endTurn);
  restartBtn.addEventListener('click', () => { rewardArea.classList.add('hidden'); initGame(); });

  /* ===== 启动 ===== */
  initGame();
})();
