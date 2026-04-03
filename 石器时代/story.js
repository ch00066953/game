// ==================== 石器时代 - 剧情演出引擎 ====================

let _storyActive = false;
let _storyResolve = null;
const _portraitCache = {};

// ===== 主 API =====

/**
 * 播放一段剧情
 * @param {string} storyId - STORY_DATA 中的剧情 ID
 * @returns {Promise<void>}
 */
function playStory(storyId) {
    const story = STORY_DATA[storyId];
    if (!story) { console.warn('Story not found:', storyId); return Promise.resolve(); }
    return _runNodes(story.nodes, 0);
}

async function _runNodes(nodes, startIdx) {
    _storyActive = true;
    mapActive = false;
    _showStoryOverlay();
    for (let i = startIdx; i < nodes.length; i++) {
        const node = nodes[i];
        switch (node.type) {
            case 'dialog':
                await _showDialog(node);
                break;
            case 'narration':
                await _showNarration(node.text);
                break;
            case 'choice':
                const chosen = await _showChoice(node.text, node.options);
                _hideStoryOverlay();
                if (chosen.next) {
                    await playStory(chosen.next);
                }
                return;
            case 'action':
                _executeAction(node.fn, node.args || []);
                break;
            case 'fade':
                await _fade(node.direction, node.duration || 500);
                break;
        }
    }
    _hideStoryOverlay();
    _storyActive = false;
    if (screens.main.classList.contains('active')) mapActive = true;
}

// ===== 对话框 =====

function _showDialog(node) {
    return new Promise(resolve => {
        const box = $('storyDialogBox');
        const nameEl = $('storyDialogName');
        const textEl = $('storyDialogText');
        const portraitEl = $('storyPortrait');
        const choiceArea = $('storyChoiceArea');

        choiceArea.innerHTML = '';
        choiceArea.style.display = 'none';
        box.style.display = 'flex';

        const speakerData = NPC_DATA[node.speaker];
        if (speakerData && speakerData.portrait) {
            _loadPortrait(speakerData.portrait).then(url => {
                portraitEl.style.backgroundImage = `url(${url})`;
                portraitEl.style.display = 'block';
            });
            nameEl.textContent = speakerData.name;
        } else if (node.speaker === 'player') {
            portraitEl.style.display = 'none';
            nameEl.textContent = game.player.name;
        } else {
            portraitEl.style.display = 'none';
            nameEl.textContent = node.speaker || '';
        }

        _typewriter(textEl, node.text, () => {
            _storyResolve = resolve;
        });
    });
}

function _showNarration(text) {
    return new Promise(resolve => {
        const box = $('storyDialogBox');
        const nameEl = $('storyDialogName');
        const textEl = $('storyDialogText');
        const portraitEl = $('storyPortrait');
        const choiceArea = $('storyChoiceArea');

        choiceArea.innerHTML = '';
        choiceArea.style.display = 'none';
        box.style.display = 'flex';
        portraitEl.style.display = 'none';
        nameEl.textContent = '';
        textEl.classList.add('narration');

        _typewriter(textEl, text, () => {
            _storyResolve = resolve;
        });
    });
}

function _showChoice(text, options) {
    return new Promise(resolve => {
        const box = $('storyDialogBox');
        const nameEl = $('storyDialogName');
        const textEl = $('storyDialogText');
        const portraitEl = $('storyPortrait');
        const choiceArea = $('storyChoiceArea');

        box.style.display = 'flex';
        portraitEl.style.display = 'none';
        nameEl.textContent = '';
        textEl.textContent = text || '';
        textEl.classList.remove('narration');

        choiceArea.innerHTML = '';
        choiceArea.style.display = 'flex';

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'story-choice-btn';
            btn.textContent = opt.label;
            btn.onclick = () => {
                choiceArea.style.display = 'none';
                resolve(opt);
            };
            choiceArea.appendChild(btn);
        });
    });
}

// ===== 打字机效果 =====

let _twTimer = null;

function _typewriter(el, text, onDone) {
    if (_twTimer) { clearInterval(_twTimer); _twTimer = null; }
    el.classList.remove('narration');
    el.textContent = '';
    let idx = 0;
    _twTimer = setInterval(() => {
        if (idx < text.length) {
            el.textContent += text[idx];
            idx++;
        } else {
            clearInterval(_twTimer);
            _twTimer = null;
            if (onDone) onDone();
        }
    }, 40);

    el._skipHandler = () => {
        if (_twTimer) {
            clearInterval(_twTimer);
            _twTimer = null;
            el.textContent = text;
            if (onDone) onDone();
        }
    };
}

// ===== action 节点执行 =====

const _storyActions = {
    acceptQuest: (questId) => acceptQuest(questId),
    completeQuest: (questId) => completeQuest(questId),
    giveJob: (jobId) => _applyJob(jobId),
    startQuest: (questId) => acceptQuest(questId),
};

function _executeAction(fn, args) {
    const action = _storyActions[fn];
    if (action) {
        action(...args);
    } else {
        console.warn('Unknown story action:', fn);
    }
}

function _applyJob(jobId) {
    const c = CLASS_DATA[jobId];
    if (!c) return;
    const p = game.player;
    p.class = jobId;
    p.className = c.name;
    p.icon = c.icon;
    p.maxHp = c.baseHp + (p.level - 1) * Math.floor(c.baseHp * 0.12);
    p.hp = p.maxHp;
    p.maxMp = c.baseMp + (p.level - 1) * Math.floor(c.baseMp * 0.1);
    p.mp = p.maxMp;
    p.atk = c.atk + (p.level - 1) * 2;
    p.def = c.def + (p.level - 1) * 1;
    p.spd = c.spd + (p.level - 1) * 1;
    p.skills = [...c.skills];
    updateTopBar();
    toast(`🎉 你成为了 ${c.name}！`);
}

// ===== 淡入淡出 =====

function _fade(direction, duration) {
    return new Promise(resolve => {
        const overlay = $('storyFadeOverlay');
        overlay.style.transition = `opacity ${duration}ms`;
        if (direction === 'out') {
            overlay.style.display = 'block';
            overlay.style.opacity = '0';
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                setTimeout(resolve, duration);
            });
        } else {
            overlay.style.opacity = '1';
            overlay.style.display = 'block';
            requestAnimationFrame(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    resolve();
                }, duration);
            });
        }
    });
}

// ===== UI 辅助 =====

function _showStoryOverlay() {
    $('storyOverlay').style.display = 'block';
}

function _hideStoryOverlay() {
    $('storyOverlay').style.display = 'none';
    $('storyDialogBox').style.display = 'none';
    $('storyChoiceArea').style.display = 'none';
    const textEl = $('storyDialogText');
    textEl.classList.remove('narration');
}

function _loadPortrait(path) {
    if (_portraitCache[path]) return Promise.resolve(_portraitCache[path]);
    return fetch(path).then(r => r.text()).then(svg => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        _portraitCache[path] = url;
        return url;
    });
}

// ===== 点击推进 =====

function _storyClick() {
    const textEl = $('storyDialogText');
    if (_twTimer) {
        if (textEl._skipHandler) textEl._skipHandler();
        return;
    }
    if (_storyResolve) {
        const r = _storyResolve;
        _storyResolve = null;
        r();
    }
}

function initStory() {
    const overlay = $('storyOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target.classList.contains('story-choice-btn')) return;
            _storyClick();
        });
    }
}
