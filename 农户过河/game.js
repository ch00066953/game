const LEFT = "L";
const RIGHT = "R";

const ENTITIES = {
    F: { name: "农夫", icon: "👨‍🌾" },
    W: { name: "狼", icon: "🐺" },
    G: { name: "羊", icon: "🐑" },
    C: { name: "白菜", icon: "🥬" }
};

const COMMAND_ALIASES = new Map([
    ["/river", "start"],
    ["开始过河谜题", "start"],
    ["开始", "start"],
    ["再来一局", "reset"],
    ["重置", "reset"],
    ["状态", "status"],
    ["提示", "hint"],
    ["解法", "solve"],
    ["独自", "move-none"],
    ["不带", "move-none"],
    ["带狼", "move-wolf"],
    ["狼", "move-wolf"],
    ["带羊", "move-goat"],
    ["羊", "move-goat"],
    ["带菜", "move-cabbage"],
    ["带白菜", "move-cabbage"],
    ["菜", "move-cabbage"],
    ["白菜", "move-cabbage"]
]);

const INITIAL_STATE = {
    positions: { F: LEFT, W: LEFT, G: LEFT, C: LEFT },
    stepCount: 0,
    status: "playing"
};

const MESSAGE_LIMIT = 120;

let state = deepClone(INITIAL_STATE);
let logs = [];

const riverView = document.getElementById("riverView");
const messageLog = document.getElementById("messageLog");
const commandInput = document.getElementById("commandInput");
const sendBtn = document.getElementById("sendBtn");
const gameStateText = document.getElementById("gameStateText");
const stepCountEl = document.getElementById("stepCount");
const quickButtons = Array.from(document.querySelectorAll("[data-command]"));

initialize();

function initialize() {
    bindEvents();
    startGame();
}

function bindEvents() {
    sendBtn.addEventListener("click", () => {
        processCommand(commandInput.value);
    });

    commandInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            processCommand(commandInput.value);
        }
    });

    quickButtons.forEach((button) => {
        button.addEventListener("click", () => {
            processCommand(button.dataset.command || "");
        });
    });
}

function processCommand(rawInput) {
    const input = normalizeCommand(rawInput);
    if (!input) {
        return;
    }

    appendLog(`> ${rawInput.trim() || input}`);
    commandInput.value = "";

    const cmd = COMMAND_ALIASES.get(input);
    if (!cmd) {
        appendLog("无法识别该命令。可输入：带狼/带羊/带菜/独自/状态/提示/解法/重置");
        render();
        return;
    }

    if (cmd === "start") {
        startGame();
        return;
    }

    if (cmd === "reset") {
        resetGame();
        return;
    }

    if (cmd === "status") {
        appendLog(renderStateText(state.positions));
        render();
        return;
    }

    if (cmd === "hint") {
        handleHint();
        render();
        return;
    }

    if (cmd === "solve") {
        handleSolution();
        render();
        return;
    }

    if (state.status !== "playing") {
        appendLog("当前对局已结束，请输入“重置”或“再来一局”开始新游戏。");
        render();
        return;
    }

    if (cmd === "move-none") {
        handleMove(null);
    } else if (cmd === "move-wolf") {
        handleMove("W");
    } else if (cmd === "move-goat") {
        handleMove("G");
    } else if (cmd === "move-cabbage") {
        handleMove("C");
    }

    render();
}

function startGame() {
    state = deepClone(INITIAL_STATE);
    logs = [];
    appendLog("【狼、羊、菜过河谜题】");
    appendLog(renderStateText(state.positions));
    appendLog("请选择你要带过河的东西（输入：带狼/带羊/带菜/独自），或输入“状态”查看当前情况。");
    render();
}

function resetGame() {
    state = deepClone(INITIAL_STATE);
    appendLog("游戏已重置。回到初始状态。", true);
    appendLog(renderStateText(state.positions));
    render();
}

function handleMove(itemKey) {
    const from = state.positions.F;
    const to = oppositeSide(from);

    if (itemKey && state.positions[itemKey] !== from) {
        appendLog(`❌ 无效操作：${ENTITIES[itemKey].name}不在农夫同一岸。`);
        return;
    }

    state.positions.F = to;
    if (itemKey) {
        state.positions[itemKey] = to;
    }
    state.stepCount += 1;

    appendLog(describeMove(itemKey, to));
    appendLog(renderStateText(state.positions));

    const conflict = detectConflict(state.positions);
    if (conflict) {
        state.status = "failed";
        appendLog(`💀 糟糕！${conflict}！游戏结束。输入“重置”重新开始。`);
        return;
    }

    if (isWin(state.positions)) {
        state.status = "won";
        appendLog(`🎉 恭喜！所有角色安全过河！你赢了！总步数：${state.stepCount}步`);
        if (state.stepCount === 7) {
            appendLog("🏅 完美通关：你达到了最优步数 7 步。", true);
        }
        return;
    }

    appendLog("安全！请继续下一步。");
}

function handleHint() {
    if (state.status !== "playing") {
        appendLog("当前对局已结束。请先“重置”后再查看提示。", true);
        return;
    }

    const path = findShortestPath(state.positions);
    if (!path || path.length < 2) {
        appendLog("当前状态暂无可行后续方案，请重置后重试。", true);
        return;
    }

    const nextMove = deriveMove(path[0], path[1]);
    appendLog(`💡 提示：下一步建议 ${nextMove.label}。`);
}

function handleSolution() {
    const fromCurrent = state.status === "playing" ? findShortestPath(state.positions) : null;
    if (fromCurrent && fromCurrent.length > 1) {
        const lines = formatSolution(fromCurrent);
        appendLog("📘 从当前状态到终点的最优解：");
        lines.forEach((line, idx) => appendLog(`${idx + 1}. ${line}`));
        return;
    }

    const fromInitial = findShortestPath(INITIAL_STATE.positions);
    if (!fromInitial) {
        appendLog("未找到解法（理论上不应发生）。");
        return;
    }

    appendLog("📘 标准最优解（7步）：");
    formatSolution(fromInitial).forEach((line, idx) => appendLog(`${idx + 1}. ${line}`));
}

function detectConflict(positions) {
    const bankWithoutFarmer = oppositeSide(positions.F);
    const wolf = positions.W === bankWithoutFarmer;
    const goat = positions.G === bankWithoutFarmer;
    const cabbage = positions.C === bankWithoutFarmer;

    if (wolf && goat) {
        return "狼吃掉了羊";
    }

    if (goat && cabbage) {
        return "羊吃掉了白菜";
    }

    return null;
}

function isWin(positions) {
    return positions.F === RIGHT && positions.W === RIGHT && positions.G === RIGHT && positions.C === RIGHT;
}

function render() {
    riverView.textContent = renderStateText(state.positions);
    messageLog.textContent = logs.join("\n\n");
    messageLog.scrollTop = messageLog.scrollHeight;

    stepCountEl.textContent = String(state.stepCount);
    gameStateText.textContent = state.status === "playing" ? "进行中" : state.status === "won" ? "胜利" : "失败";
}

function renderStateText(positions) {
    const left = ["F", "W", "G", "C"].filter((key) => positions[key] === LEFT).map((key) => ENTITIES[key].icon);
    const right = ["F", "W", "G", "C"].filter((key) => positions[key] === RIGHT).map((key) => ENTITIES[key].icon);

    const leftText = left.length ? left.join(" ") : "（空）";
    const rightText = right.length ? right.join(" ") : "（空）";
    return `左岸：${leftText}  | 🌊 |  右岸：${rightText}`;
}

function describeMove(itemKey, toSide) {
    const toLabel = toSide === LEFT ? "左岸" : "右岸";
    if (!itemKey) {
        return `👨‍🌾 独自划向${toLabel}...`;
    }

    return `👨‍🌾 带着 ${ENTITIES[itemKey].icon} 划向${toLabel}...`;
}

function findShortestPath(startPositions) {
    const start = encodeState(startPositions);
    const queue = [start];
    const parent = new Map([[start, null]]);

    while (queue.length > 0) {
        const current = queue.shift();
        const currentPos = decodeState(current);

        if (isWin(currentPos)) {
            return reconstructPath(current, parent);
        }

        for (const next of expandStates(currentPos)) {
            const key = encodeState(next);
            if (!parent.has(key)) {
                parent.set(key, current);
                queue.push(key);
            }
        }
    }

    return null;
}

function expandStates(positions) {
    const options = [null, "W", "G", "C"];
    const result = [];

    for (const itemKey of options) {
        const next = deepClone({ positions }).positions;
        const from = next.F;

        if (itemKey && next[itemKey] !== from) {
            continue;
        }

        const to = oppositeSide(from);
        next.F = to;
        if (itemKey) {
            next[itemKey] = to;
        }

        if (!detectConflict(next)) {
            result.push(next);
        }
    }

    return result;
}

function reconstructPath(endEncoded, parent) {
    const path = [];
    let current = endEncoded;

    while (current) {
        path.push(decodeState(current));
        current = parent.get(current);
    }

    return path.reverse();
}

function deriveMove(prev, next) {
    const movedItem = ["W", "G", "C"].find((key) => prev[key] !== next[key]) || null;
    if (!movedItem) {
        return { key: null, label: "独自" };
    }

    const map = { W: "带狼", G: "带羊", C: "带菜" };
    return { key: movedItem, label: map[movedItem] };
}

function formatSolution(path) {
    const lines = [];
    for (let i = 1; i < path.length; i += 1) {
        const move = deriveMove(path[i - 1], path[i]);
        const to = path[i].F === RIGHT ? "右岸" : "左岸";
        lines.push(`${move.label}到${to}`);
    }
    return lines;
}

function encodeState(positions) {
    return `${positions.F}${positions.W}${positions.G}${positions.C}`;
}

function decodeState(encoded) {
    return {
        F: encoded[0],
        W: encoded[1],
        G: encoded[2],
        C: encoded[3]
    };
}

function oppositeSide(side) {
    return side === LEFT ? RIGHT : LEFT;
}

function normalizeCommand(input) {
    return String(input || "").trim().replace(/\s+/g, "");
}

function appendLog(text, divider = false) {
    if (divider && logs.length) {
        logs.push("----------------------------------------");
    }

    logs.push(text);
    if (logs.length > MESSAGE_LIMIT) {
        logs = logs.slice(logs.length - MESSAGE_LIMIT);
    }
}

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
