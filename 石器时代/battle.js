// ==================== 石器时代 - 战斗系统模块 ====================

let battle = null;

function startBattle(enemy) {
    const area = AREAS[game.currentArea];
    battle = {
        enemy,
        turn: 0,
        playerBuffs: { atk: 0, catchBonus: 0 },
        finished: false,
        usePet: false,
    };

    showScreen('battle');
    $('battleBg').className = 'battle-bg ' + area.bgClass;
    renderBattleGround(area.bgClass);
    $('eName').textContent = enemy.name;
    $('eLevel').textContent = enemy.level;
    updateBattleUI();

    $('enemySprite').className = 'enemy-sprite';
    startBattleEnemyAnim();
    startBattleAllyAnim();

    const activePet = game.pets.find(p => p.active && p.hp > 0);
    if (activePet) {
        $('petSprite').style.display = '';
        drawPetSprite(activePet.name);
    } else {
        $('petSprite').style.display = 'none';
    }

    $('battleLog').innerHTML = `<p class="log-info">野生 ${enemy.name} (Lv.${enemy.level}) 出现了！</p>`;
    showBattleCommands();
    bindBattleCommands();
}

function updateBattleUI() {
    const e = battle.enemy;
    $('eHp').textContent = Math.max(0, e.hp);
    $('eMaxHp').textContent = e.maxHp;
    const eHpPct = Math.max(0, e.hp / e.maxHp * 100);
    $('eHpBar').style.width = eHpPct + '%';
    $('eHpBar').style.background = eHpPct < 25 ? 'linear-gradient(90deg,#ff0000,#ff4444)' : eHpPct < 50 ? 'linear-gradient(90deg,#ff8800,#ffaa44)' : '';
    const p = game.player;
    $('bpName').textContent = p.name;
    $('bpLevel').textContent = p.level;
    const pHpPct = Math.max(0, p.hp / p.maxHp * 100);
    $('bpHpText').textContent = `${Math.max(0, p.hp)}/${p.maxHp}`;
    $('bpMpText').textContent = `${Math.max(0, p.mp)}/${p.maxMp}`;
    $('bpHpBar').style.width = pHpPct + '%';
    $('bpMpBar').style.width = Math.max(0, p.mp / p.maxMp * 100) + '%';
    if (pHpPct < 25) {
        $('bpHpBar').style.background = 'linear-gradient(90deg,#ff0000,#ff4444)';
        $('bpHpBar').classList.add('bar-critical');
    } else {
        $('bpHpBar').style.background = '';
        $('bpHpBar').classList.remove('bar-critical');
    }
}

function addLog(msg, cls = '') {
    const log = $('battleLog');
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = msg;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function showBattleCommands() {
    $('battleCommands').style.display = 'flex';
    $('skillPanel').style.display = 'none';
    $('itemPanel').style.display = 'none';
    $('petSwitchPanel').style.display = 'none';
}

function showDmgText(text, x, y, cls = '') {
    const el = document.createElement('div');
    el.className = 'dmg-text ' + cls;
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    $('battleEffects').appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function bindBattleCommands() {
    document.querySelector('[data-cmd="attack"]').onclick = () => {
        if (battle.finished) return;
        playerAttack();
    };
    document.querySelector('[data-cmd="skill"]').onclick = () => {
        if (battle.finished) return;
        showSkillPanel();
    };
    document.querySelector('[data-cmd="catch"]').onclick = () => {
        if (battle.finished) return;
        playerCatch();
    };
    document.querySelector('[data-cmd="item"]').onclick = () => {
        if (battle.finished) return;
        showBattleItemPanel();
    };
    document.querySelector('[data-cmd="pet"]').onclick = () => {
        if (battle.finished) return;
        showPetSwitchPanel();
    };
    document.querySelector('[data-cmd="flee"]').onclick = () => {
        if (battle.finished) return;
        playerFlee();
    };
    $('btnSkillBack').onclick = showBattleCommands;
    $('btnItemBack').onclick = showBattleCommands;
    $('btnPetSwitchBack').onclick = showBattleCommands;
}

// -- 普通攻击
function playerAttack() {
    const p = game.player;
    const e = battle.enemy;
    const totalAtk = p.atk + battle.playerBuffs.atk;
    let dmg = Math.max(1, totalAtk * 2 - e.def + Math.floor(Math.random() * 6) - 3);
    let crit = false;
    if (Math.random() * 100 < 12 + p.spd) {
        dmg = Math.floor(dmg * 1.5);
        crit = true;
    }
    e.hp -= dmg;
    addLog(`${p.name} 攻击了 ${e.name}，造成 ${dmg} 点伤害${crit ? '（暴击！）' : ''}`, 'log-dmg');
    animateAttack(crit);
    showDmgText(crit ? `💥${dmg}` : `-${dmg}`, 300 + Math.random() * 100, 100 + Math.random() * 40, crit ? 'crit' : '');
    petAutoAttack();
    updateBattleUI();
    checkBattleEnd() || setTimeout(enemyTurn, 800);
}

function petAutoAttack() {
    const activePet = game.pets.find(pp => pp.active && pp.hp > 0);
    if (!activePet) return;
    const e = battle.enemy;
    let dmg = Math.max(1, activePet.atk * 2 - e.def + Math.floor(Math.random() * 4) - 2);
    if (Math.random() < 0.15) dmg = Math.floor(dmg * 1.5);
    e.hp -= dmg;
    addLog(`${activePet.name} 攻击了 ${e.name}，造成 ${dmg} 点伤害`, 'log-dmg');
    showDmgText(`-${dmg}`, 350 + Math.random() * 80, 130 + Math.random() * 30, '');
}

function animateAttack(crit) {
    const ally = $('allySprite');
    const enemy = $('enemySprite');
    ally.classList.add('anim-attack');
    setTimeout(() => {
        ally.classList.remove('anim-attack');
        enemy.classList.add('anim-shake');
        showHitFlash(crit);
        setTimeout(() => enemy.classList.remove('anim-shake'), 300);
    }, 300);
}

function showHitFlash(crit) {
    const effects = $('battleEffects');
    const flash = document.createElement('div');
    flash.className = 'hit-flash' + (crit ? ' hit-crit' : '');
    effects.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
}

function renderBattleGround(bgClass) {
    let existing = document.querySelector('.battle-ground');
    if (existing) existing.remove();
    const ground = document.createElement('div');
    ground.className = 'battle-ground';
    if (bgClass.includes('desert')) {
        ground.innerHTML = '<div class="ground-line desert-ground"></div><div class="ground-detail">🌵 &nbsp; 🏜️ &nbsp; 🦴</div>';
    } else if (bgClass.includes('volcano')) {
        ground.innerHTML = '<div class="ground-line volcano-ground"></div><div class="ground-detail">🔥 &nbsp; 🪨 &nbsp; 🔥</div>';
    } else if (bgClass.includes('ice')) {
        ground.innerHTML = '<div class="ground-line ice-ground"></div><div class="ground-detail">❄️ &nbsp; 🧊 &nbsp; ❄️</div>';
    } else {
        ground.innerHTML = '<div class="ground-line forest-ground"></div><div class="ground-detail">🌿 &nbsp; 🍃 &nbsp; 🌱 &nbsp; 🌿</div>';
    }
    $('battleBg').appendChild(ground);
}

// -- 技能
function showSkillPanel() {
    $('battleCommands').style.display = 'none';
    $('skillPanel').style.display = '';
    const list = $('skillList');
    list.innerHTML = '';
    game.player.skills.forEach(sk => {
        const data = SKILL_DATA[sk];
        if (!data) return;
        const btn = document.createElement('button');
        btn.className = 'skill-btn';
        const canUse = game.player.mp >= data.cost;
        const typeIcon = data.type === 'attack' || data.type === 'aoe' ? '⚔️' : data.type === 'heal' ? '💚' : '🔮';
        btn.innerHTML = `<span class="skill-name">${typeIcon} ${sk}</span><span class="skill-cost ${canUse ? '' : 'cost-lack'}">${data.cost}MP</span><span class="skill-desc">${data.desc}</span>`;
        btn.disabled = !canUse;
        btn.onclick = () => useSkill(sk);
        list.appendChild(btn);
    });
}

function useSkill(skillName) {
    const p = game.player;
    const e = battle.enemy;
    const sk = SKILL_DATA[skillName];
    if (p.mp < sk.cost) { toast('MP不足！'); return; }
    p.mp -= sk.cost;

    if (sk.type === 'attack' || sk.type === 'aoe') {
        const totalAtk = p.atk + battle.playerBuffs.atk;
        let dmg = Math.max(1, Math.floor(totalAtk * sk.power * 2 - e.def + Math.random() * 8));
        let crit = false;
        const critChance = 12 + p.spd + (sk.critBonus || 0);
        if (Math.random() * 100 < critChance) {
            dmg = Math.floor(dmg * 1.5);
            crit = true;
        }
        e.hp -= dmg;
        addLog(`${p.name} 使用「${skillName}」，造成 ${dmg} 点伤害${crit ? '（暴击！）' : ''}`, 'log-dmg');
        animateAttack(crit);
        showDmgText(crit ? `💥${dmg}` : `-${dmg}`, 300 + Math.random() * 100, 100, crit ? 'crit' : '');
    } else if (sk.type === 'heal') {
        const heal = Math.floor(p.maxHp * sk.healPercent);
        p.hp = Math.min(p.maxHp, p.hp + heal);
        addLog(`${p.name} 使用「${skillName}」，恢复了 ${heal} HP`, 'log-heal');
        showDmgText(`+${heal}`, 100, 250, 'heal');
    } else if (sk.type === 'catch') {
        battle.playerBuffs.catchBonus += sk.catchBonus || 0;
        addLog(`${p.name} 使用「${skillName}」，捕获率提升！`, 'log-catch');
    }

    petAutoAttack();
    updateBattleUI();
    updateTopBar();
    showBattleCommands();
    checkBattleEnd() || setTimeout(enemyTurn, 800);
}

// -- 捕获
function playerCatch() {
    const e = battle.enemy;
    const hpPercent = e.hp / e.maxHp;
    let rate = e.catchRate + battle.playerBuffs.catchBonus;
    rate += Math.floor((1 - hpPercent) * 40);
    if (game.player.class === 'hunter') rate += 10;

    const catchStoneIdx = game.bag.findIndex(it => it.id === 'catchStone' && it.count > 0);
    if (catchStoneIdx >= 0) {
        rate += game.bag[catchStoneIdx].effect.value;
        game.bag[catchStoneIdx].count--;
        if (game.bag[catchStoneIdx].count <= 0) game.bag.splice(catchStoneIdx, 1);
        addLog('消耗了一个捕兽石！', 'log-info');
    }

    rate = Math.min(95, Math.max(5, rate));
    addLog(`尝试捕获 ${e.name}... (成功率: ${rate}%)`, 'log-catch');

    if (Math.random() * 100 < rate) {
        const pet = {
            name: e.name,
            icon: e.icon,
            level: e.level,
            exp: 0, maxExp: 50 + e.level * 30,
            hp: Math.floor(e.maxHp * 0.5),
            maxHp: e.maxHp,
            mp: 20, maxMp: 20 + e.level * 5,
            atk: e.atk, def: e.def, spd: e.spd,
            skills: [...e.skills],
            active: game.pets.length === 0,
        };
        if (game.pets.length >= 6) {
            addLog('队伍已满(最多6只)，捕获失败！', 'log-info');
            setTimeout(enemyTurn, 800);
            return;
        }
        game.pets.push(pet);
        addLog(`🎉 成功捕获了 ${e.name}！`, 'log-catch');
        $('enemySprite').classList.add('anim-catch');
        battle.finished = true;
        setTimeout(() => finishBattle(true, true), 1200);
    } else {
        addLog(`捕获失败！${e.name} 挣脱了！`, 'log-info');
        setTimeout(enemyTurn, 800);
    }
}

// -- 道具
function showBattleItemPanel() {
    $('battleCommands').style.display = 'none';
    $('itemPanel').style.display = '';
    const list = $('battleItemList');
    list.innerHTML = '';
    const usable = game.bag.filter(it => it.count > 0 && (!it.effect || it.effect.type !== 'material'));
    if (usable.length === 0) {
        list.innerHTML = '<p style="color:#aaa;text-align:center">背包空空如也</p>';
        return;
    }
    usable.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'use-item-btn';
        btn.textContent = `${item.icon} ${item.name} x${item.count}`;
        btn.onclick = () => useBattleItem(item);
        list.appendChild(btn);
    });
}

function useBattleItem(item) {
    const eff = item.effect;
    if (eff.type === 'heal') {
        game.player.hp = Math.min(game.player.maxHp, game.player.hp + eff.value);
        addLog(`使用 ${item.name}，恢复了 ${eff.value} HP`, 'log-heal');
    } else if (eff.type === 'healMp') {
        game.player.mp = Math.min(game.player.maxMp, game.player.mp + eff.value);
        addLog(`使用 ${item.name}，恢复了 ${eff.value} MP`, 'log-heal');
    } else if (eff.type === 'atkBuff') {
        battle.playerBuffs.atk += eff.value;
        addLog(`使用 ${item.name}，攻击力+${eff.value}！`, 'log-info');
    } else if (eff.type === 'catchBonus') {
        battle.playerBuffs.catchBonus += eff.value;
        addLog(`使用 ${item.name}，捕获率提升！`, 'log-catch');
    } else if (eff.type === 'petHeal') {
        const ap = game.pets.find(pp => pp.active);
        if (ap) {
            ap.hp = Math.min(ap.maxHp, ap.hp + eff.value);
            addLog(`使用 ${item.name}，${ap.name} 恢复了 ${eff.value} HP`, 'log-heal');
        } else {
            addLog('没有出战宠物！', 'log-info');
            return;
        }
    } else if (eff.type === 'fullHeal') {
        game.player.hp = game.player.maxHp;
        game.player.mp = game.player.maxMp;
        addLog(`使用 ${item.name}，完全恢复了HP与MP！`, 'log-heal');
        showDmgText(`+FULL`, 100, 250, 'heal');
    } else if (eff.type === 'equipAtk') {
        game.player.atk += eff.value;
        addLog(`装备 ${item.name}，攻击力永久+${eff.value}！`, 'log-info');
    } else if (eff.type === 'equipDef') {
        game.player.def += eff.value;
        addLog(`装备 ${item.name}，防御力永久+${eff.value}！`, 'log-info');
    } else if (eff.type === 'equipHp') {
        game.player.maxHp += eff.value;
        game.player.hp += eff.value;
        addLog(`装备 ${item.name}，最大HP永久+${eff.value}！`, 'log-info');
    }
    item.count--;
    if (item.count <= 0) {
        const idx = game.bag.indexOf(item);
        if (idx >= 0) game.bag.splice(idx, 1);
    }
    updateTopBar();
    showBattleCommands();
    setTimeout(enemyTurn, 800);
}

// -- 换宠
function showPetSwitchPanel() {
    $('battleCommands').style.display = 'none';
    $('petSwitchPanel').style.display = '';
    const list = $('petSwitchList');
    list.innerHTML = '';
    if (game.pets.length === 0) {
        list.innerHTML = '<p style="color:#aaa;text-align:center">还没有宠物</p>';
        return;
    }
    game.pets.forEach((pet, i) => {
        const btn = document.createElement('button');
        btn.className = 'switch-pet-btn';
        btn.textContent = `${pet.name} Lv.${pet.level} HP:${pet.hp}/${pet.maxHp}${pet.active ? ' [出战中]' : ''}`;
        btn.disabled = pet.active || pet.hp <= 0;
        btn.onclick = () => {
            game.pets.forEach(pp => pp.active = false);
            pet.active = true;
            $('petSprite').style.display = '';
            drawPetSprite(pet.name);
            addLog(`${pet.name} 出战！`, 'log-info');
            showBattleCommands();
            setTimeout(enemyTurn, 800);
        };
        list.appendChild(btn);
    });
}

// -- 逃跑
function playerFlee() {
    const fleeChance = 40 + game.player.spd * 2;
    if (Math.random() * 100 < fleeChance) {
        addLog('成功逃跑了！', 'log-info');
        battle.finished = true;
        setTimeout(() => {
            showScreen('main');
            updateTopBar();
        }, 600);
    } else {
        addLog('逃跑失败！', 'log-info');
        setTimeout(enemyTurn, 600);
    }
}

// -- 敌方回合
function enemyTurn() {
    if (battle.finished) return;
    const e = battle.enemy;
    const p = game.player;

    let useSkillFlag = false;
    let skillToUse = null;
    if (e.skills.length > 0 && Math.random() < 0.35) {
        skillToUse = e.skills[Math.floor(Math.random() * e.skills.length)];
        useSkillFlag = true;
    }

    if (useSkillFlag && skillToUse) {
        const sk = SKILL_DATA[skillToUse];
        if (sk && sk.type === 'heal') {
            const heal = Math.floor(e.maxHp * (sk.healPercent || 0.2));
            e.hp = Math.min(e.maxHp, e.hp + heal);
            addLog(`${e.name} 使用「${skillToUse}」，恢复了 ${heal} HP`, 'log-heal');
        } else if (sk) {
            let dmg = Math.max(1, Math.floor(e.atk * (sk.power || 1.5) * 2 - p.def + Math.random() * 6));
            const activePet = game.pets.find(pp => pp.active && pp.hp > 0);
            let targetPlayer = true;
            if (activePet && Math.random() < 0.4) {
                targetPlayer = false;
                dmg = Math.max(1, Math.floor(dmg - activePet.def * 0.5));
                activePet.hp -= dmg;
                addLog(`${e.name} 使用「${skillToUse}」攻击了 ${activePet.name}，造成 ${dmg} 点伤害`, 'log-dmg');
                if (activePet.hp <= 0) {
                    activePet.hp = 0;
                    addLog(`${activePet.name} 倒下了！`, 'log-dmg');
                    $('petSprite').style.display = 'none';
                }
            }
            if (targetPlayer) {
                p.hp -= dmg;
                addLog(`${e.name} 使用「${skillToUse}」，对 ${p.name} 造成 ${dmg} 点伤害`, 'log-dmg');
                showDmgText(`-${dmg}`, 80 + Math.random() * 60, 240, '');
            }
        }
    } else {
        let dmg = Math.max(1, e.atk * 2 - p.def + Math.floor(Math.random() * 6) - 3);
        const activePet = game.pets.find(pp => pp.active && pp.hp > 0);
        if (activePet && Math.random() < 0.35) {
            dmg = Math.max(1, Math.floor(dmg - activePet.def * 0.5));
            activePet.hp -= dmg;
            addLog(`${e.name} 攻击了 ${activePet.name}，造成 ${dmg} 点伤害`, 'log-dmg');
            if (activePet.hp <= 0) {
                activePet.hp = 0;
                addLog(`${activePet.name} 倒下了！`, 'log-dmg');
                $('petSprite').style.display = 'none';
            }
        } else {
            p.hp -= dmg;
            addLog(`${e.name} 攻击了 ${p.name}，造成 ${dmg} 点伤害`, 'log-dmg');
            showDmgText(`-${dmg}`, 80 + Math.random() * 60, 240, '');
        }
    }

    updateBattleUI();
    updateTopBar();
    checkBattleEnd();
}

// -- 战斗结束检测
function checkBattleEnd() {
    if (battle.finished) return true;
    const e = battle.enemy;
    const p = game.player;
    if (e.hp <= 0) {
        battle.finished = true;
        addLog(`${e.name} 被击败了！`, 'log-info');
        setTimeout(() => finishBattle(true, false), 800);
        return true;
    }
    if (p.hp <= 0) {
        p.hp = 0;
        battle.finished = true;
        addLog(`${p.name} 倒下了...`, 'log-dmg');
        setTimeout(() => finishBattle(false, false), 800);
        return true;
    }
    return false;
}

function finishBattle(won, caught) {
    stopBattleAllyAnim();
    stopBattleEnemyAnim();
    const e = battle.enemy;
    const p = game.player;

    if (won) {
        let expGain = caught ? Math.floor(e.exp * 0.5) : e.exp;
        let goldGain = caught ? Math.floor(e.gold * 0.3) : e.gold;
        p.exp += expGain;
        p.gold += goldGain;
        const activePet = game.pets.find(pp => pp.active);
        if (activePet) {
            activePet.exp += Math.floor(expGain * 0.6);
            checkPetLevelUp(activePet);
        }
        game.battleCount++;

        // Material drops
        const drops = ENEMY_DROPS[e.name] || [];
        const droppedMats = [];
        drops.forEach(drop => {
            if (Math.random() < drop.chance) {
                const info = MATERIAL_INFO[drop.id];
                if (info) {
                    const existing = game.bag.find(b => b.id === drop.id);
                    if (existing) {
                        existing.count++;
                    } else {
                        game.bag.push({ id: drop.id, name: info.name, icon: info.icon, desc: '合成材料', count: 1, effect: { type: 'material' } });
                    }
                    droppedMats.push(info.icon + info.name);
                }
            }
        });

        $('resultTitle').textContent = caught ? '🎊 捕获成功！' : '🏆 战斗胜利！';
        $('resultContent').innerHTML = `
            <div class="result-rewards">
                <p>⭐ 经验值 +${expGain}</p>
                <p>💰 金币 +${goldGain}</p>
                ${caught ? `<p>🦕 获得宠物: ${e.name}</p>` : ''}
                ${droppedMats.length > 0 ? `<p>📦 获得材料: ${droppedMats.join(' ')}</p>` : ''}
            </div>`;
        showModal('result');
        $('btnResultOk').onclick = () => {
            hideModal('result');
            checkLevelUp(() => {
                showScreen('main');
                updateTopBar();
            });
        };
    } else {
        const fine = Math.floor(p.gold * 0.1);
        p.gold = Math.max(0, p.gold - fine);
        p.hp = Math.floor(p.maxHp * 0.3);
        p.mp = Math.floor(p.maxMp * 0.3);
        game.pets.forEach(pp => { if (pp.hp <= 0) pp.hp = 1; });

        $('resultTitle').textContent = '💀 战斗失败';
        $('resultContent').innerHTML = `
            <div class="result-rewards">
                <p>在部落休息后恢复了意识...</p>
                <p>💰 治疗费: -${fine} 金币</p>
            </div>`;
        showModal('result');
        $('btnResultOk').onclick = () => {
            hideModal('result');
            showScreen('main');
            updateTopBar();
        };
    }
}

// ===== 升级系统 =====
function checkLevelUp(callback) {
    const p = game.player;
    if (p.exp >= p.maxExp) {
        p.exp -= p.maxExp;
        p.level++;
        p.maxExp = Math.floor(100 * Math.pow(1.25, p.level - 1));

        const c = CLASS_DATA[p.class];
        const hpGrow = Math.floor(c.baseHp * 0.12 + Math.random() * 5);
        const mpGrow = Math.floor(c.baseMp * 0.1 + Math.random() * 3);
        const atkGrow = Math.floor(1 + Math.random() * 2 + (p.class === 'warrior' ? 1 : 0));
        const defGrow = Math.floor(1 + Math.random() * 2);
        const spdGrow = Math.floor(Math.random() * 2 + (p.class === 'hunter' ? 1 : 0));

        p.maxHp += hpGrow; p.hp = p.maxHp;
        p.maxMp += mpGrow; p.mp = p.maxMp;
        p.atk += atkGrow;
        p.def += defGrow;
        p.spd += spdGrow;

        let newSkill = null;
        if (p.level === 5 && p.class === 'warrior') newSkill = '冲撞';
        if (p.level === 5 && p.class === 'hunter') newSkill = '撕咬';
        if (p.level === 5 && p.class === 'shaman') newSkill = '冰冻吐息';
        if (p.level === 10 && p.class === 'warrior') newSkill = '火焰吐息';
        if (p.level === 10 && p.class === 'hunter') newSkill = '雷击';
        if (p.level === 10 && p.class === 'shaman') newSkill = '雷击';
        if (newSkill && !p.skills.includes(newSkill)) {
            p.skills.push(newSkill);
        }

        $('levelUpContent').innerHTML = `
            <p>等级: ${p.level - 1} → <strong>${p.level}</strong></p>
            <p>HP +${hpGrow}  |  MP +${mpGrow}</p>
            <p>攻击 +${atkGrow}  |  防御 +${defGrow}  |  速度 +${spdGrow}</p>
            ${newSkill ? `<p style="color:#FF6B35;font-weight:bold">习得新技能: 「${newSkill}」！</p>` : ''}
        `;
        showModal('levelUp');
        $('btnLevelUpOk').onclick = () => {
            hideModal('levelUp');
            updateTopBar();
            checkLevelUp(callback);
        };
    } else {
        callback();
    }
}

function checkPetLevelUp(pet) {
    while (pet.exp >= pet.maxExp) {
        pet.exp -= pet.maxExp;
        pet.level++;
        pet.maxExp = Math.floor(50 + pet.level * 30);
        pet.maxHp += Math.floor(10 + Math.random() * 8);
        pet.atk += Math.floor(1 + Math.random() * 2);
        pet.def += Math.floor(1 + Math.random() * 2);
        pet.spd += Math.floor(Math.random() * 2);
        pet.hp = pet.maxHp;
        pet.maxMp += Math.floor(2 + Math.random() * 3);
        pet.mp = pet.maxMp;
        toast(`${pet.name} 升级到 Lv.${pet.level}！`);
    }
}

// ===== 宠物面板 =====
function renderPetModal() {
    const list = $('petList');
    if (game.pets.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;padding:20px">还没有捕获到宠物，去探索吧！</p>';
        return;
    }
    list.innerHTML = '';
    game.pets.forEach((pet, i) => {
        const card = document.createElement('div');
        card.className = 'pet-card' + (pet.active ? ' active-pet' : '');
        card.innerHTML = `
            <canvas class="pet-emoji-canvas" width="50" height="50"></canvas>
            <div class="pet-details">
                <div class="pet-name-lv">${pet.name} Lv.${pet.level} ${pet.active ? '⭐出战中' : ''}</div>
                <div class="pet-stats">攻:${pet.atk} 防:${pet.def} 速:${pet.spd} | 技能: ${pet.skills.join(', ')}</div>
                <div class="pet-hp-bar"><div class="pet-hp-fill" style="width:${pet.hp/pet.maxHp*100}%"></div></div>
                <div class="pet-stats">HP: ${pet.hp}/${pet.maxHp}</div>
                <div class="pet-exp-bar"><div class="pet-exp-fill" style="width:${pet.exp/pet.maxExp*100}%"></div></div>
                <div class="pet-stats">EXP: ${pet.exp}/${pet.maxExp}</div>
            </div>
            <div class="pet-actions">
                ${!pet.active ? '<button class="pet-action-btn" data-action="set-active">出战</button>' : ''}
                ${game.pets.length > 1 ? '<button class="pet-action-btn" data-action="release">放生</button>' : ''}
            </div>`;
        card.querySelector('[data-action="set-active"]')?.addEventListener('click', () => {
            game.pets.forEach(pp => pp.active = false);
            pet.active = true;
            renderPetModal();
            toast(`${pet.name} 设为出战宠物！`);
        });
        card.querySelector('[data-action="release"]')?.addEventListener('click', () => {
            if (confirm(`确定要放生 ${pet.name} 吗？`)) {
                game.pets.splice(i, 1);
                if (game.pets.length > 0 && !game.pets.some(pp => pp.active)) {
                    game.pets[0].active = true;
                }
                renderPetModal();
                toast(`${pet.name} 回归了大自然`);
            }
        });
        list.appendChild(card);
        const petCanvas = card.querySelector('.pet-emoji-canvas');
        if (petCanvas) drawPixelEnemy(petCanvas.getContext('2d'), pet.name, 50, 0);
    });
}

// ===== 背包面板 =====
function renderBagModal() {
    const list = $('bagList');
    const items = game.bag.filter(it => it.count > 0);
    if (items.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;padding:20px">背包空空如也</p>';
        return;
    }
    list.innerHTML = '';
    const categories = [
        { label: '⚔️ 武器装备', types: ['equipAtk', 'equipDef', 'equipHp'] },
        { label: '🧪 消耗道具', types: ['heal', 'fullHeal', 'healMp', 'petHeal', 'atkBuff', 'catchBonus'] },
        { label: '📦 合成材料', types: ['material'] },
    ];
    const battlOnlyTypes = ['catchBonus', 'atkBuff'];
    let hasAny = false;
    categories.forEach(cat => {
        const catItems = items.filter(it => it.effect && cat.types.includes(it.effect.type));
        if (catItems.length === 0) return;
        hasAny = true;
        const hdr = document.createElement('div');
        hdr.className = 'bag-cat-header';
        hdr.textContent = cat.label;
        list.appendChild(hdr);
        catItems.forEach(item => {
            const canUse = item.effect && !battlOnlyTypes.includes(item.effect.type) && item.effect.type !== 'material';
            const div = document.createElement('div');
            div.className = 'bag-item';
            div.innerHTML = `
                <div class="bag-item-icon">${item.icon}</div>
                <div class="bag-item-info">
                    <div class="bag-item-name">${item.name}</div>
                    <div class="bag-item-desc">${item.desc}</div>
                </div>
                <div class="bag-item-right">
                    <span class="bag-item-count">×${item.count}</span>
                    ${canUse ? '<button class="bag-use-btn">使用</button>' : ''}
                </div>`;
            if (canUse) div.querySelector('.bag-use-btn').addEventListener('click', () => useItemFromBag(item));
            list.appendChild(div);
        });
    });
    // Any items not in categories
    const otherItems = items.filter(it => !it.effect || !['equipAtk','equipDef','equipHp','heal','fullHeal','healMp','petHeal','atkBuff','catchBonus','material'].includes(it.effect.type));
    if (otherItems.length > 0) {
        const hdr = document.createElement('div');
        hdr.className = 'bag-cat-header';
        hdr.textContent = '❓ 其他';
        list.appendChild(hdr);
        otherItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'bag-item';
            div.innerHTML = `
                <div class="bag-item-icon">${item.icon}</div>
                <div class="bag-item-info"><div class="bag-item-name">${item.name}</div><div class="bag-item-desc">${item.desc}</div></div>
                <span class="bag-item-count">×${item.count}</span>`;
            list.appendChild(div);
        });
    }
    if (!hasAny && otherItems.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;padding:20px">背包空空如也</p>';
    }
}

function renderShopModal(areaId) {
    const id = areaId || AREAS[game.currentArea].id;
    const titleEl = document.querySelector('#shopModal h2');
    if (titleEl) titleEl.textContent = SHOP_NAMES[id] || '🏪 部落商店';
    $('shopGold').textContent = game.player.gold;
    const list = $('shopList');
    list.innerHTML = '';
    const items = VILLAGE_SHOPS[id] || SHOP_ITEMS;
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        const canBuy = game.player.gold >= item.price;
        const owned = game.bag.find(b => b.id === item.id);
        const ownedCount = owned ? owned.count : 0;
        div.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name} ${ownedCount > 0 ? `<span class="shop-owned">已有:${ownedCount}</span>` : ''}</div>
                <div class="shop-item-desc">${item.desc}</div>
            </div>
            <button class="shop-buy-btn" ${canBuy ? '' : 'disabled'}>💰${item.price}</button>`;
        div.querySelector('.shop-buy-btn').onclick = () => {
            if (game.player.gold < item.price) return;
            game.player.gold -= item.price;
            const existing = game.bag.find(b => b.id === item.id);
            if (existing) {
                existing.count++;
            } else {
                game.bag.push({ ...item, count: 1 });
            }
            updateTopBar();
            renderShopModal(id);
            toast(`购买了 ${item.name}！`);
        };
        list.appendChild(div);
    });
}

// ===== 地图面板 =====
function renderMapModal() {
    const container = $('worldMap');
    container.innerHTML = '';

    // === Canvas visual world map ===
    const canvas = document.createElement('canvas');
    const CW = 560, CH = 240;
    canvas.width = CW; canvas.height = CH;
    canvas.style.cssText = 'max-width:100%;display:block;margin:0 auto 12px;border-radius:10px;cursor:pointer;border:2px solid rgba(255,215,0,0.3);';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // Area node positions (zigzag layout)
    const nodePos = [
        { x: 60,  y: 140 },  // 加加村
        { x: 168, y: 80  },  // 密林
        { x: 280, y: 140 },  // 荒漠
        { x: 392, y: 80  },  // 火山
        { x: 500, y: 140 },  // 冰原
    ];

    // Terrain background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, CW, 0);
    bgGrad.addColorStop(0,   '#3a6e3a');
    bgGrad.addColorStop(0.22,'#2a5a20');
    bgGrad.addColorStop(0.44,'#c4924b');
    bgGrad.addColorStop(0.66,'#6b1a00');
    bgGrad.addColorStop(1.0, '#8bafc0');
    ctx.fillStyle = bgGrad;
    ctx.beginPath(); ctx.roundRect(0, 0, CW, CH, 10); ctx.fill();

    // Terrain deco
    const deco = [
        { x: 20, y: 160, t: '🌳' }, { x: 36, y: 145, t: '🌲' }, { x: 10, y: 100, t: '🌿' },
        { x: 110, y: 55,  t: '🌲' }, { x: 140, y: 170, t: '🌳' },
        { x: 240, y: 165, t: '🪨' }, { x: 260, y: 185, t: '🌵' }, { x: 310, y: 175, t: '🪨' },
        { x: 350, y: 55,  t: '🔥' }, { x: 430, y: 165, t: '🌋' }, { x: 370, y: 170, t: '🔥' },
        { x: 450, y: 55,  t: '❄️' }, { x: 520, y: 85,  t: '🏔️' }, { x: 540, y: 165, t: '❄️' },
    ];
    ctx.font = '16px serif';
    deco.forEach(d => ctx.fillText(d.t, d.x, d.y));

    // Connecting path
    ctx.beginPath();
    ctx.moveTo(nodePos[0].x, nodePos[0].y);
    nodePos.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = 'rgba(255,215,0,0.65)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw nodes
    const R = 26;
    nodePos.forEach((pos, i) => {
        const area = AREAS[i];
        const locked = game.player.level < area.levelReq;
        const isCurrent = game.currentArea === i;

        // Shadow
        ctx.beginPath(); ctx.arc(pos.x + 2, pos.y + 2, R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();

        // Circle
        ctx.beginPath(); ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
        ctx.fillStyle = locked ? 'rgba(40,40,40,0.75)' : isCurrent ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.88)';
        ctx.fill();
        ctx.strokeStyle = isCurrent ? '#FF6B35' : locked ? '#555' : '#bbb';
        ctx.lineWidth = isCurrent ? 3 : 2; ctx.stroke();

        // Icon
        ctx.font = '20px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.globalAlpha = locked ? 0.35 : 1;
        ctx.fillText(area.icon, pos.x, pos.y);
        ctx.globalAlpha = 1;
        if (locked) { ctx.font = '12px serif'; ctx.fillText('🔒', pos.x + 14, pos.y - 14); }

        // Current indicator arrow
        if (isCurrent) {
            ctx.font = '14px serif';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText('▼', pos.x, pos.y - R - 4);
        }

        // Name
        ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = locked ? 'rgba(180,180,180,0.7)' : '#fff';
        ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
        ctx.fillText(area.name, pos.x, pos.y + R + 16);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = locked ? 'rgba(140,140,140,0.7)' : '#FFD700';
        ctx.fillText('Lv.' + area.levelReq + '+', pos.x, pos.y + R + 28);
        ctx.shadowBlur = 0;
    });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

    // Canvas click handler
    canvas.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CW / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleX;
        nodePos.forEach((pos, i) => {
            if ((mx - pos.x) ** 2 + (my - pos.y) ** 2 <= R * R) {
                const locked = game.player.level < AREAS[i].levelReq;
                if (locked) { toast(`需要 Lv.${AREAS[i].levelReq} 才能前往 ${AREAS[i].name}！`); return; }
                if (i === game.currentArea) { toast(`你已在 ${AREAS[i].name}`); return; }
                hideModal('map');
                loadAreaMap(i);
            }
        });
    });

    // === Area list below canvas ===
    const areaList = document.createElement('div');
    areaList.className = 'map-area-list';
    AREAS.forEach((area, i) => {
        const locked = game.player.level < area.levelReq;
        const isCurrent = game.currentArea === i;
        const row = document.createElement('div');
        row.className = 'map-row' + (locked ? ' map-row-locked' : '') + (isCurrent ? ' map-row-current' : '');
        row.innerHTML = `
            <span class="map-row-icon">${area.icon}</span>
            <span class="map-row-name">${area.name}${isCurrent ? ' ◀ 当前' : ''}</span>
            <span class="map-row-lv">Lv.${area.levelReq}+</span>
            <span class="map-row-desc">${area.desc}</span>
            ${locked ? '<span class="map-row-lock">🔒</span>' : (!isCurrent ? '<button class="map-goto-btn">前往</button>' : '')}`;
        if (!locked && !isCurrent) row.querySelector('.map-goto-btn').onclick = () => { hideModal('map'); loadAreaMap(i); };
        areaList.appendChild(row);
    });
    container.appendChild(areaList);
}
