// ==================== 石器时代 - 任务系统 ====================

// ===== 接受任务 =====

function acceptQuest(questId) {
    const def = QUEST_DATA[questId];
    if (!def) { console.warn('Quest not found:', questId); return; }
    if (game.quests.completed.includes(questId)) return;
    if (game.quests.active.find(q => q.id === questId)) return;
    if (!canAcceptQuest(questId)) { toast('前置任务未完成'); return; }

    const runtime = {
        id: questId,
        objectives: def.objectives.map(obj => ({ ...obj, current: 0 })),
    };
    game.quests.active.push(runtime);
    toast(`📜 接受任务: ${def.name}`);
    updateQuestHUD();
}

// ===== 前置检查 =====

function canAcceptQuest(questId) {
    const def = QUEST_DATA[questId];
    if (!def) return false;
    return def.prerequisites.every(pre => game.quests.completed.includes(pre));
}

// ===== 更新任务进度 =====

function updateQuestProgress(type, target, count) {
    count = count || 1;
    let updated = false;
    game.quests.active.forEach(quest => {
        quest.objectives.forEach(obj => {
            if (obj.type === type && obj.target === target && obj.current < obj.count) {
                obj.current = Math.min(obj.current + count, obj.count);
                updated = true;
            }
        });
    });
    if (updated) updateQuestHUD();
}

// ===== 检查任务目标完成 =====

function isQuestObjectivesComplete(questId) {
    const quest = game.quests.active.find(q => q.id === questId);
    if (!quest) return false;
    return quest.objectives.every(obj => obj.current >= obj.count);
}

// ===== 完成任务 =====

async function completeQuest(questId) {
    const def = QUEST_DATA[questId];
    if (!def) return;

    // 发放奖励
    if (def.rewards.exp) game.player.exp += def.rewards.exp;
    if (def.rewards.gold) game.player.gold += def.rewards.gold;
    if (def.rewards.items) {
        def.rewards.items.forEach(item => {
            const existing = game.bag.find(b => b.id === item.id);
            if (existing) existing.count += item.count;
            else game.bag.push({ ...item });
        });
    }

    // 如果是就职任务，消耗收集类目标的材料
    const quest = game.quests.active.find(q => q.id === questId);
    if (quest) {
        quest.objectives.forEach(obj => {
            if (obj.type === 'collect') {
                const bagItem = game.bag.find(b => b.id === obj.target);
                if (bagItem) {
                    bagItem.count -= obj.count;
                    if (bagItem.count <= 0) {
                        game.bag.splice(game.bag.indexOf(bagItem), 1);
                    }
                }
            }
        });
    }

    // 从 active 移除，加入 completed
    game.quests.active = game.quests.active.filter(q => q.id !== questId);
    game.quests.completed.push(questId);

    updateTopBar();
    updateQuestHUD();
    toast(`✅ 任务完成: ${def.name}`);
}

// ===== NPC 任务交互逻辑 =====

async function handleQuestNpc(npcId) {
    // 1. 首次见族长 → 自动播放引导剧情
    if (npcId === 'elder' && !game.quests.completed.includes('elder_intro_done')) {
        game.quests.completed.push('elder_intro_done');
        await playStory('elder_intro');
        return;
    }

    // 2. 检查该 NPC 是否有可交任务（已完成目标的任务）
    for (const questId of Object.keys(QUEST_DATA)) {
        const def = QUEST_DATA[questId];
        if (def.turnInNpc === npcId && isQuestObjectivesComplete(questId)) {
            if (def.storyOnComplete) {
                await playStory(def.storyOnComplete);
            }
            await completeQuest(questId);
            return;
        }
    }

    // 3. 检查该 NPC 是否有可接受的任务
    for (const questId of Object.keys(QUEST_DATA)) {
        const def = QUEST_DATA[questId];
        if (def.turnInNpc === npcId
            && !game.quests.completed.includes(questId)
            && !game.quests.active.find(q => q.id === questId)
            && canAcceptQuest(questId)) {
            if (def.storyOnAccept) {
                await playStory(def.storyOnAccept);
            } else {
                acceptQuest(questId);
            }
            return;
        }
    }

    // 4. 有进行中的任务 → 提示进度
    for (const quest of game.quests.active) {
        const def = QUEST_DATA[quest.id];
        if (def && def.turnInNpc === npcId) {
            const progress = quest.objectives.map(o => `${_getObjectiveTargetName(o)} ${o.current}/${o.count}`).join('、');
            toast(`${NPC_DATA[npcId].name}: 还没完成呢！(${progress})`);
            return;
        }
    }

    // 5. 已就职后的族长
    if (npcId === 'elder') {
        if (game.player.class) {
            toast('族长: 你已经成长了很多，继续努力吧！');
        } else {
            toast('族长: 去找村里的导师们谈谈吧。');
        }
        return;
    }

    // 6. 已就职后的导师
    const npc = NPC_DATA[npcId];
    if (npc) {
        if (game.player.class) {
            toast(`${npc.name}: 好好修炼吧，年轻人！`);
        } else {
            toast(`${npc.name}: 你想学习我的技艺吗？`);
        }
    }
}

// ===== 任务 HUD =====

function updateQuestHUD() {
    const hud = $('questHUD');
    if (!hud) return;

    if (game.quests.active.length === 0) {
        hud.style.display = 'none';
        return;
    }

    hud.style.display = 'block';
    let html = '';
    game.quests.active.forEach(quest => {
        const def = QUEST_DATA[quest.id];
        if (!def) return;
        html += `<div class="quest-hud-item">`;
        html += `<div class="quest-hud-name">📜 ${def.name}</div>`;
        quest.objectives.forEach(obj => {
            const done = obj.current >= obj.count;
            const targetName = _getObjectiveTargetName(obj);
            html += `<div class="quest-hud-obj ${done ? 'done' : ''}">${targetName} ${obj.current}/${obj.count}</div>`;
        });
        html += `</div>`;
    });
    hud.innerHTML = html;
}

function _getObjectiveTargetName(obj) {
    if (obj.type === 'collect') {
        const mat = MATERIAL_INFO[obj.target];
        return mat ? mat.name : obj.target;
    }
    return obj.target;
}

// ===== 任务面板 =====

function renderQuestModal() {
    const content = $('questContent');
    if (!content) return;

    let html = '';

    // 活跃任务
    if (game.quests.active.length > 0) {
        html += '<h3>进行中</h3>';
        game.quests.active.forEach(quest => {
            const def = QUEST_DATA[quest.id];
            if (!def) return;
            html += `<div class="quest-item active">`;
            html += `<div class="quest-name">${def.name}</div>`;
            html += `<div class="quest-desc">${def.description}</div>`;
            html += `<div class="quest-objectives">`;
            quest.objectives.forEach(obj => {
                const done = obj.current >= obj.count;
                const targetName = _getObjectiveTargetName(obj);
                html += `<div class="quest-obj ${done ? 'done' : ''}">`;
                html += `${done ? '✅' : '⬜'} ${targetName} ${obj.current}/${obj.count}`;
                html += `</div>`;
            });
            html += `</div></div>`;
        });
    }

    // 已完成任务
    const completedQuests = game.quests.completed.filter(id => QUEST_DATA[id]);
    if (completedQuests.length > 0) {
        html += '<h3>已完成</h3>';
        completedQuests.forEach(questId => {
            const def = QUEST_DATA[questId];
            html += `<div class="quest-item completed">`;
            html += `<div class="quest-name">✅ ${def.name}</div>`;
            html += `</div>`;
        });
    }

    if (!html) html = '<p class="quest-empty">暂无任务</p>';
    content.innerHTML = html;
}
