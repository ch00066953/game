// ==================== 石器时代 - 合成系统 ====================

var _craftFilter = 'all';

function renderCraftModal() {
    const tabs = $('craftTabs');
    const list = $('craftList');
    const matSummary = $('craftMatSummary');

    // Material summary at top
    const matIds = ['bone', 'leather', 'hard_stone', 'fire_stone', 'ice_crystal', 'poison_gland'];
    matSummary.innerHTML = matIds.map(id => {
        const info = MATERIAL_INFO[id];
        const owned = game.bag.find(b => b.id === id);
        const count = owned ? owned.count : 0;
        return `<span class="mat-summary-item ${count > 0 ? 'mat-have' : 'mat-none'}">${info.icon}<span class="mat-sum-count">×${count}</span></span>`;
    }).join('');

    // Category tabs
    tabs.innerHTML = '';
    const categories = ['全部', '武器', '防具', '饰品', '道具'];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        const isActive = (_craftFilter === 'all' ? '全部' : _craftFilter) === cat;
        btn.className = 'craft-tab-btn' + (isActive ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = () => { _craftFilter = cat === '全部' ? 'all' : cat; renderCraftModal(); };
        tabs.appendChild(btn);
    });

    // Recipe list
    list.innerHTML = '';
    const recipes = CRAFT_RECIPES.filter(r => _craftFilter === 'all' || r.category === _craftFilter);
    if (recipes.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;padding:20px">暂无配方</p>';
        return;
    }

    recipes.forEach(recipe => {
        const canCraft = recipe.materials.every(m => {
            const owned = game.bag.find(b => b.id === m.id);
            return owned && owned.count >= m.count;
        });

        const matHtml = recipe.materials.map(m => {
            const info = MATERIAL_INFO[m.id] || { icon: '📦', name: m.id };
            const owned = game.bag.find(b => b.id === m.id);
            const have = owned ? owned.count : 0;
            const enough = have >= m.count;
            return `<span class="craft-mat ${enough ? 'mat-ok' : 'mat-lack'}">${info.icon} ${info.name} <span class="mat-count">${have}/${m.count}</span></span>`;
        }).join('');

        const div = document.createElement('div');
        div.className = 'craft-item' + (canCraft ? ' craftable' : '');
        div.innerHTML = `
            <div class="craft-item-icon">${recipe.icon}</div>
            <div class="craft-item-info">
                <div class="craft-item-header">
                    <span class="craft-item-name">${recipe.name}</span>
                    <span class="craft-item-cat cat-${recipe.category}">${recipe.category}</span>
                </div>
                <div class="craft-item-desc">${recipe.desc}</div>
                <div class="craft-mats">${matHtml}</div>
            </div>
            <button class="craft-btn" ${canCraft ? '' : 'disabled'}>⚒️ 合成</button>`;
        div.querySelector('.craft-btn').onclick = () => doCraft(recipe);
        list.appendChild(div);
    });
}

function doCraft(recipe) {
    const canCraft = recipe.materials.every(m => {
        const owned = game.bag.find(b => b.id === m.id);
        return owned && owned.count >= m.count;
    });
    if (!canCraft) { toast('材料不足！'); return; }

    recipe.materials.forEach(m => {
        const item = game.bag.find(b => b.id === m.id);
        item.count -= m.count;
        if (item.count <= 0) game.bag.splice(game.bag.indexOf(item), 1);
    });

    const res = recipe.result;
    const existing = game.bag.find(b => b.id === res.id);
    if (existing) {
        existing.count++;
    } else {
        game.bag.push({ ...res });
    }

    toast(`✨ 合成成功！获得 ${res.icon} ${res.name}`);
    renderCraftModal();
}

function useItemFromBag(item) {
    const eff = item.effect;
    if (!eff || eff.type === 'material') {
        toast(`${item.icon} 这是合成材料，前往合成工坊使用`);
        return;
    }
    if (eff.type === 'catchBonus') { toast('捕兽石只能在战斗中使用！'); return; }
    if (eff.type === 'atkBuff') { toast('力量护符只能在战斗中使用！'); return; }

    let msg = '';
    const p = game.player;
    if (eff.type === 'heal') {
        const healed = Math.min(p.maxHp - p.hp, eff.value);
        if (healed === 0) { toast('HP已满！'); return; }
        p.hp = Math.min(p.maxHp, p.hp + eff.value);
        msg = `恢复了 ${healed} HP`;
    } else if (eff.type === 'fullHeal') {
        p.hp = p.maxHp; p.mp = p.maxMp;
        msg = '完全恢复了HP与MP';
    } else if (eff.type === 'healMp') {
        const healed = Math.min(p.maxMp - p.mp, eff.value);
        if (healed === 0) { toast('MP已满！'); return; }
        p.mp = Math.min(p.maxMp, p.mp + eff.value);
        msg = `恢复了 ${healed} MP`;
    } else if (eff.type === 'petHeal') {
        const ap = game.pets.find(pp => pp.active);
        if (!ap) { toast('没有出战宠物！'); return; }
        ap.hp = Math.min(ap.maxHp, ap.hp + eff.value);
        msg = `${ap.name} 恢复了 ${eff.value} HP`;
    } else if (eff.type === 'equipAtk') {
        p.atk += eff.value;
        msg = `攻击力永久 +${eff.value}（当前: ${p.atk}）`;
    } else if (eff.type === 'equipDef') {
        p.def += eff.value;
        msg = `防御力永久 +${eff.value}（当前: ${p.def}）`;
    } else if (eff.type === 'equipHp') {
        p.maxHp += eff.value;
        p.hp += eff.value;
        msg = `最大HP永久 +${eff.value}（当前: ${p.maxHp}）`;
    } else {
        toast('此物品不能在背包中使用');
        return;
    }

    item.count--;
    if (item.count <= 0) game.bag.splice(game.bag.indexOf(item), 1);
    updateTopBar();
    toast(`${item.icon} ${item.name}：${msg}`);
    renderBagModal();
}
