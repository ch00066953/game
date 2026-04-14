// 关卡配置
const STAGES = {
    1: {
        name: '新手村',
        icon: '🌟',
        description: '没有障碍物，请熟悉游戏操作',
        targetScore: 10,
        speed: 120,
        obstacles: [],
        background: 'stage-1'
    },
    2: {
        name: '森林冒险',
        icon: '🔥',
        description: '出现了一些障碍物，要小心不要撞到',
        targetScore: 15,
        speed: 115,
        obstacles: [
            { x: 5, y: 5 }, { x: 14, y: 5 },
            { x: 5, y: 14 }, { x: 14, y: 14 }
        ],
        background: 'stage-2'
    },
    3: {
        name: '危险之地',
        icon: '⚡',
        description: '更多的障碍物和更快的速度',
        targetScore: 20,
        speed: 105,
        obstacles: [
            { x: 4, y: 3 }, { x: 15, y: 3 },
            { x: 4, y: 7 }, { x: 15, y: 7 },
            { x: 4, y: 12 }, { x: 15, y: 12 },
            { x: 10, y: 10 }, { x: 10, y: 9 }
        ],
        background: 'stage-3'
    },
    4: {
        name: '末日之城',
        icon: '💀',
        description: '极限挑战！四面楚歌，你能通关吗？',
        targetScore: 25,
        speed: 95,
        obstacles: [
            // 上障碍带
            { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
            { x: 13, y: 2 }, { x: 14, y: 2 }, { x: 15, y: 2 }, { x: 16, y: 2 }, { x: 17, y: 2 },
            // 下障碍带
            { x: 2, y: 17 }, { x: 3, y: 17 }, { x: 4, y: 17 }, { x: 5, y: 17 }, { x: 6, y: 17 },
            { x: 13, y: 17 }, { x: 14, y: 17 }, { x: 15, y: 17 }, { x: 16, y: 17 }, { x: 17, y: 17 },
            // 左右障碍
            { x: 2, y: 9 }, { x: 2, y: 10 }, { x: 2, y: 11 },
            { x: 17, y: 9 }, { x: 17, y: 10 }, { x: 17, y: 11 },
            // 中间环形障碍（避开中心10,10）
            { x: 7, y: 8 }, { x: 8, y: 8 }, { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 },
            { x: 7, y: 12 }, { x: 8, y: 12 }, { x: 9, y: 12 }, { x: 10, y: 12 }, { x: 11, y: 12 }, { x: 12, y: 12 },
            { x: 7, y: 10 }, { x: 12, y: 10 }
        ],
        background: 'stage-4'
    },
    5: {
        name: '随机禁地',
        icon: '🎲',
        description: '无限模式：无通关分数限制，每吃一个食物，障碍会在已有障碍旁扩张',
        targetScore: null,
        speed: 100,
        obstacles: [],
        background: 'stage-5'
    }
};

const GRID_SIZE = 20;

// 音效和音乐管理
class SoundManager {
    constructor() {
        this.enabled = true;
        this.masterVolume = 0.3;
        this.bgmEnabled = true;
        this.bgmVolume = 0.2;
    }

    playSound(type) {
        if (!this.enabled) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        const volume = this.masterVolume;
        const gainNode = audioContext.createGain();
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(volume, now);

        const osc = audioContext.createOscillator();
        osc.connect(gainNode);

        switch (type) {
            case 'eat':
                // 吃食物音效 - 两个上升的音调
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);

                const osc2 = audioContext.createOscillator();
                osc2.connect(gainNode);
                osc2.frequency.setValueAtTime(600, now + 0.05);
                osc2.frequency.linearRampToValueAtTime(800, now + 0.15);
                osc2.start(now + 0.05);
                osc2.stop(now + 0.15);
                break;

            case 'collision':
                // 碰撞音效 - 低音下降
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
                break;

            case 'levelup':
                // 升级音效 - 上升的音调
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(700, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'win':
                // 通关音效 - 胜利的音调
                osc.frequency.setValueAtTime(523, now); // C5
                osc.start(now);
                osc.stop(now + 0.2);

                const osc3 = audioContext.createOscillator();
                osc3.connect(gainNode);
                osc3.frequency.setValueAtTime(659, now + 0.2); // E5
                osc3.start(now + 0.2);
                osc3.stop(now + 0.4);

                const osc4 = audioContext.createOscillator();
                osc4.connect(gainNode);
                osc4.frequency.setValueAtTime(784, now + 0.4); // G5
                osc4.start(now + 0.4);
                osc4.stop(now + 0.6);
                break;

            case 'allwin':
                // 全部通关音效
                for (let i = 0; i < 3; i++) {
                    const oscTemp = audioContext.createOscillator();
                    oscTemp.connect(gainNode);
                    oscTemp.frequency.setValueAtTime(800 + i * 200, now + i * 0.2);
                    oscTemp.start(now + i * 0.2);
                    oscTemp.stop(now + i * 0.2 + 0.3);
                }
                break;
        }
    }

    playBackgroundMusic() {
        if (!this.bgmEnabled) return;
        // 背景音乐的播放逻辑可以集成真实音频文件
        // 这里使用Web Audio API生成简单的背景音
    }

    toggleSounds(enabled) {
        this.enabled = enabled;
    }

    toggleBGM(enabled) {
        this.bgmEnabled = enabled;
    }
}

const soundManager = new SoundManager();

// 游戏状态
let gameState = {
    isRunning: false,
    isPaused: false,
    currentStage: 1,
    stageScore: 0,
    totalScore: 0,
    speed: STAGES[1].speed
};

// 蛇和食物坐标
    let snake = [{ x: 10, y: 10 }];
let food = null;
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

// DOM 元素
const gameBoard = document.getElementById('gameBoard');
const stageInfo = document.getElementById('stageInfo');
const scoreDisplay = document.getElementById('score');
const targetDisplay = document.getElementById('target');
const progressDisplay = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const soundBtn = document.getElementById('soundBtn');
const messageDisplay = document.getElementById('message');
const stageButtons = document.querySelectorAll('.stage-btn');
let hasStageSelected = false;

// 游戏循环
let gameLoop = null;

// 初始化
window.addEventListener('load', () => {
    food = generateFood();
    initializeBoard();
    updateStageInfo();
    renderBoard();
    setupStageButtons();
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    showMessage('请先选择关卡，再点击“开始游戏”', 'pause');
});

// 关卡按钮
function setupStageButtons() {
    stageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!gameState.isRunning) {
                hasStageSelected = true;
                selectStage(parseInt(btn.dataset.stage), false);
            }
        });
    });
}

function getStageStartPosition(stage) {
    const preferredPosition = stage === 4 ? { x: 1, y: 1 } : { x: 10, y: 10 };
    const stageObstacles = STAGES[stage].obstacles;
    const blocked = stageObstacles.some(obstacle => obstacle.x === preferredPosition.x && obstacle.y === preferredPosition.y);

    if (!blocked) {
        return preferredPosition;
    }

    for (let y = 1; y < GRID_SIZE - 1; y++) {
        for (let x = 1; x < GRID_SIZE - 1; x++) {
            const isBlocked = stageObstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
            if (!isBlocked) {
                return { x, y };
            }
        }
    }

    return { x: 0, y: 0 };
}

function createRandomStageFiveObstacles(initialCount = 8) {
    const obstacles = [];
    const obstacleSet = new Set();
    const safeZoneRadius = 2;
    const center = { x: 10, y: 10 };

    const isInSafeZone = (x, y) => Math.abs(x - center.x) <= safeZoneRadius && Math.abs(y - center.y) <= safeZoneRadius;
    const isValidCell = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
    const isFarEnough = (x, y, minDistance) => {
        return obstacles.every(obstacle => Math.abs(obstacle.x - x) + Math.abs(obstacle.y - y) >= minDistance);
    };

    const addObstacle = (x, y, minDistance = 4) => {
        const key = `${x},${y}`;
        if (obstacleSet.has(key) || isInSafeZone(x, y) || !isValidCell(x, y) || !isFarEnough(x, y, minDistance)) {
            return false;
        }
        obstacleSet.add(key);
        obstacles.push({ x, y });
        return true;
    };

    let attempts = 0;
    while (obstacles.length < initialCount && attempts < 5000) {
        attempts += 1;
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        addObstacle(x, y, 4);
    }

    if (obstacles.length < initialCount) {
        let relaxAttempts = 0;
        while (obstacles.length < initialCount && relaxAttempts < 5000) {
            relaxAttempts += 1;
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            addObstacle(x, y, 2);
        }
    }

    return obstacles;
}

function addAdjacentObstacleForStageFive() {
    const stage = STAGES[5];
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    const obstacleSet = new Set(stage.obstacles.map(obstacle => `${obstacle.x},${obstacle.y}`));
    const candidateSet = new Set();
    const candidates = [];

    stage.obstacles.forEach(obstacle => {
        directions.forEach(dir => {
            const x = obstacle.x + dir.x;
            const y = obstacle.y + dir.y;
            const key = `${x},${y}`;

            if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
            if (obstacleSet.has(key) || candidateSet.has(key)) return;
            if (snake.some(segment => segment.x === x && segment.y === y)) return;
            if (food && food.x === x && food.y === y) return;

            candidateSet.add(key);
            candidates.push({ x, y });
        });
    });

    if (candidates.length === 0) {
        return false;
    }

    const nextObstacle = candidates[Math.floor(Math.random() * candidates.length)];
    stage.obstacles.push(nextObstacle);
    return true;
}

function selectStage(stage, autoStart = false) {
    hasStageSelected = true;
    gameState.currentStage = stage;
    gameState.stageScore = 0;

    if (stage === 5) {
        STAGES[5].obstacles = createRandomStageFiveObstacles(8);
    }

    const startPosition = getStageStartPosition(stage);
    snake = [{ x: startPosition.x, y: startPosition.y }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    food = generateFood();
    gameState.speed = STAGES[stage].speed;
    
    // 更新UI
    stageButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-stage="${stage}"]`).classList.add('active');
    
    // 更新背景
    document.body.className = '';
    document.body.classList.add(STAGES[stage].background);
    
    updateStageInfo();
    updateProgress();
    renderBoard();
    startBtn.disabled = false;

    if (autoStart) {
        startGame();
    } else {
        showMessage(`已选择：${STAGES[stage].name}，点击“开始游戏”开始挑战`, 'pause');
    }
}

function updateStageInfo() {
    const stage = STAGES[gameState.currentStage];
    stageInfo.innerHTML = `
        <strong>${stage.icon} ${stage.name}</strong> - ${stage.description}
    `;
    targetDisplay.textContent = stage.targetScore === null ? '∞' : stage.targetScore;
}

function updateProgress() {
    const stage = STAGES[gameState.currentStage];
    const target = stage.targetScore;

    if (target === null) {
        progressDisplay.textContent = `${gameState.stageScore}/∞`;
        progressBar.style.width = '100%';
    } else {
        const percentage = (gameState.stageScore / target) * 100;
        progressDisplay.textContent = `${gameState.stageScore}/${target}`;
        progressBar.style.width = percentage + '%';
    }

    scoreDisplay.textContent = gameState.stageScore;
}

// 按钮事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
soundBtn.addEventListener('click', toggleSounds);

// 键盘控制
document.addEventListener('keydown', handleKeyPress);

// 生成食物（避免障碍物和蛇）
function generateFood() {
    let newFood;
    let validPosition = false;
    const stage = STAGES[gameState.currentStage];

    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };

        // 检查是否与蛇重叠
        validPosition = !snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );

        // 检查是否与障碍物重叠
        if (validPosition) {
            validPosition = !stage.obstacles.some(obstacle =>
                obstacle.x === newFood.x && obstacle.y === newFood.y
            );
        }
    }

    return newFood;
}

// 初始化游戏板
function initializeBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${i}`;
        gameBoard.appendChild(cell);
    }
}

// 渲染游戏板
function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('snake', 'snake-head', 'food', 'obstacle', 'obstacle-tree', 'obstacle-rock');
        cell.removeAttribute('data-obstacle');
    });

    // 绘制蛇
    snake.forEach((segment, index) => {
        const cellIndex = segment.y * GRID_SIZE + segment.x;
        const cell = document.getElementById(`cell-${cellIndex}`);
        if (cell) {
            if (index === 0) {
                cell.classList.add('snake-head');
            } else {
                cell.classList.add('snake');
            }
        }
    });

    // 绘制食物
    if (food) {
        const foodCellIndex = food.y * GRID_SIZE + food.x;
        const foodCell = document.getElementById(`cell-${foodCellIndex}`);
        if (foodCell) {
            foodCell.classList.add('food');
        }
    }

    // 绘制障碍物
    const stage = STAGES[gameState.currentStage];
    stage.obstacles.forEach((obstacle, index) => {
        const cellIndex = obstacle.y * GRID_SIZE + obstacle.x;
        const cell = document.getElementById(`cell-${cellIndex}`);
        if (cell) {
            cell.classList.add('obstacle');
            if (index % 3 !== 2) {
                cell.classList.add('obstacle-tree');
                cell.setAttribute('data-obstacle', '♣');
            } else {
                cell.classList.add('obstacle-rock');
                cell.setAttribute('data-obstacle', '◆');
            }
        }
    });
}

// 开始游戏
function startGame() {
    if (gameState.isRunning) return;

    if (!hasStageSelected) {
        showMessage('请先选择关卡', 'pause');
        return;
    }

    gameState.isRunning = true;
    gameState.isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    stageButtons.forEach(btn => btn.disabled = true);
    messageDisplay.textContent = '';
    messageDisplay.className = '';

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameState.speed);
}

// 暂停/继续游戏
function togglePause() {
    if (!gameState.isRunning) return;

    gameState.isPaused = !gameState.isPaused;

    if (gameState.isPaused) {
        clearInterval(gameLoop);
        pauseBtn.textContent = '继续';
        showMessage('游戏已暂停', 'pause');
    } else {
        pauseBtn.textContent = '暂停';
        gameLoop = setInterval(update, gameState.speed);
        messageDisplay.className = '';
    }
}

// 切换音效
function toggleSounds() {
    soundManager.enabled = !soundManager.enabled;
    if (soundManager.enabled) {
        soundBtn.textContent = '🔊 音效';
        soundBtn.classList.remove('disabled');
        // 播放启用音效的提示音
        soundManager.playSound('levelup');
    } else {
        soundBtn.textContent = '🔇 静音';
        soundBtn.classList.add('disabled');
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameLoop);
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.stageScore = 0;

    if (gameState.currentStage === 5) {
        STAGES[5].obstacles = createRandomStageFiveObstacles(8);
    }

    const startPosition = getStageStartPosition(gameState.currentStage);
    snake = [{ x: startPosition.x, y: startPosition.y }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    food = generateFood();

    pauseBtn.textContent = '暂停';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stageButtons.forEach(btn => btn.disabled = false);
    messageDisplay.className = '';
    messageDisplay.textContent = '';

    updateProgress();
    renderBoard();
}

// 游戏更新
function update() {
    if (gameState.isPaused) return;

    // 更新方向
    if (nextDirection.x !== 0 || nextDirection.y !== 0) {
        direction = nextDirection;
        nextDirection = { x: 0, y: 0 };
    }

    if (direction.x === 0 && direction.y === 0) return;

    // 计算新的头部位置
    const head = snake[0];
    const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };

    // 检查碰撞
    if (checkCollision(newHead)) {
        soundManager.playSound('collision');
        endGame();
        return;
    }

    // 添加新头部
    snake.unshift(newHead);

    // 检查是否吃到食物
    if (newHead.x === food.x && newHead.y === food.y) {
        gameState.stageScore += 10;
        soundManager.playSound('eat');

        if (gameState.currentStage === 5) {
            addAdjacentObstacleForStageFive();
        }

        updateProgress();

        // 检查是否通关
        const stage = STAGES[gameState.currentStage];
        if (stage.targetScore !== null && gameState.stageScore >= stage.targetScore) {
            completeStage();
            return;
        }

        food = generateFood();
    } else {
        // 移除尾部（蛇没有增长）
        snake.pop();
    }

    renderBoard();
}

// 碰撞检测
function checkCollision(head) {
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    // 检查自身碰撞
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return true;
    }

    // 检查障碍物碰撞
    const stage = STAGES[gameState.currentStage];
    if (stage.obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        return true;
    }

    return false;
}

// 游戏结束
function endGame() {
    clearInterval(gameLoop);
    gameState.isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stageButtons.forEach(btn => btn.disabled = false);
    pauseBtn.textContent = '暂停';

    const stage = STAGES[gameState.currentStage];
    const scoreText = stage.targetScore === null
        ? `${gameState.stageScore}/∞`
        : `${gameState.stageScore}/${stage.targetScore}`;
    showMessage(`☠️ 游戏结束！得分：${scoreText}`, 'game-over');
}

// 关卡完成
function completeStage() {
    clearInterval(gameLoop);
    gameState.isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stageButtons.forEach(btn => btn.disabled = false);
    pauseBtn.textContent = '暂停';

    gameState.totalScore += gameState.stageScore;

    const stage = STAGES[gameState.currentStage];
    const nextStage = gameState.currentStage + 1;

    if (nextStage <= 5) {
        soundManager.playSound('win');
        showMessage(`🎉 通关了！${stage.name} 完成！<br>3秒后自动进入下一关...`, 'game-won');
        // 3秒后自动进入下一个关卡
        setTimeout(() => {
            selectStage(nextStage, true);
        }, 3000);
    } else {
        soundManager.playSound('allwin');
        showMessage(`🏆 恭喜！你已通关所有关卡！<br>总分：${gameState.totalScore}`, 'game-won');
    }
}

// 显示消息
function showMessage(text, className) {
    messageDisplay.innerHTML = text.replace(/\n/g, '<br>');
    messageDisplay.className = `message ${className}`;
}

// 键盘控制处理
function handleKeyPress(e) {
    if (!gameState.isRunning && !gameState.isPaused) return;

    const key = e.key.toLowerCase();

    // 防止默认行为
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
    }

    // 方向键或 WASD 控制
    switch (key) {
        case 'arrowup':
        case 'w':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'arrowdown':
        case 's':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'arrowleft':
        case 'a':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'arrowright':
        case 'd':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
        case ' ':
            e.preventDefault();
            if (gameState.isRunning) togglePause();
            break;
    }
}

// 移动端虚拟控制器
(function initMobileControls() {
    var DIR_MAP = { up: {x:0,y:-1}, down: {x:0,y:1}, left: {x:-1,y:0}, right: {x:1,y:0} };
    var ANTI = { up: 'y', down: 'y', left: 'x', right: 'x' };
    document.querySelectorAll('.ctrl-btn[data-dir]').forEach(function(btn) {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!gameState.isRunning && !gameState.isPaused) return;
            var d = btn.dataset.dir;
            var nd = DIR_MAP[d];
            if (ANTI[d] === 'y' && direction.y === 0) nextDirection = nd;
            if (ANTI[d] === 'x' && direction.x === 0) nextDirection = nd;
        }, { passive: false });
    });
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
})();
